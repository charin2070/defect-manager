class Refact {
    static instances = {};

    constructor() {
        // Если уже есть инстанс этого конкретного класса, возвращаем его
        const instanceKey = this.constructor.name;
        if (this.constructor.instances && this.constructor.instances[instanceKey]) {
            return this.constructor.instances[instanceKey];
        }

        // Сохраняем инстанс текущего класса
        this.constructor.instances[instanceKey] = this;

        // Инициализируем базовые свойства только для нового инстанса
        this.rootElement = document.getElementById('app');
        this.state = {};
        this.subscribers = new Map();
        this.updateQueue = [];
        this.isProcessing = false;
    }

    static update(stateUpdate, context = 'unknown') {
        const instanceKey = this.name;
        if (this.instances && this.instances[instanceKey]) {
            this.instances[instanceKey].setState({ [stateUpdate.stateName]: stateUpdate.stateValue }, context);
        }
    }

    static setGlobal(stateName, stateValue) {
        const instanceKey = this.name;
        if (this.instances && this.instances[instanceKey]) {
            this.instances[instanceKey].setState({ [stateName]: stateValue }, 'setGlobal');
        }
    }

    static getInstance(rootElement) {
        const instanceKey = this.name;
        if (!this.instances[instanceKey]) {
            this.instances[instanceKey] = new this(rootElement);
        }
        return this.instances[instanceKey];
    }

    setState(updates, context = 'unknown') {
        if (!updates || typeof updates !== 'object') {
            console.warn('[Refact.setState] Invalid updates:', updates);
            return;
        }

        const changedKeys = [];
        for (const [key, newValue] of Object.entries(updates)) {
            const currentValue = this.state[key];
            
            // Skip if value hasn't changed
            if (currentValue === newValue) continue;

            try {
                // For arrays and objects, create a clean copy
                if (Array.isArray(newValue)) {
                    this.state[key] = [...newValue];
                } else if (newValue && typeof newValue === 'object') {
                    this.state[key] = {...newValue};
                } else {
                    this.state[key] = newValue;
                }
                changedKeys.push(key);

                // Log state change
                const logValue = Array.isArray(newValue) ? `Array(${newValue.length})` : 
                    (newValue && typeof newValue === 'object' ? 'Object' : String(newValue));
                console.log(`⚡State "${key}" => ${logValue} (by: ${context})`);
            } catch (error) {
                console.warn(`[Refact.setState] Error setting state for key "${key}":`, error);
            }
        }

        if (changedKeys.length > 0) {
            this.notifySubscribers(changedKeys, context);
        }
    }

    async processUpdateQueue() {
        if (this.isProcessing || this.updateQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const { updates, context } = this.updateQueue.shift();

        try {
            let hasChanges = false;
            const changedKeys = new Set();

            for (const [key, newValue] of Object.entries(updates)) {
                const currentValue = this.state[key];
                if (this.hasValueChanged(currentValue, newValue)) {
                    hasChanges = true;
                    changedKeys.add(key);
                    console.log(`⚡State "${key}" => ${this.getLogValue(newValue)} (by: ${context})`);
                }
            }

            if (hasChanges) {
                Object.assign(this.state, updates);
                this.notifySubscribers(changedKeys, context);
            }
        } catch (error) {
            console.error('Error processing state update:', error);
        } finally {
            this.isProcessing = false;
            if (this.updateQueue.length > 0) {
                requestAnimationFrame(() => this.processUpdateQueue());
            }
        }
    }

    hasValueChanged(currentValue, newValue) {
        // Simple equality check for primitives
        if (currentValue === newValue) return false;
        
        // If either value is null/undefined, they're different
        if (!currentValue || !newValue) return true;
        
        // For arrays, compare length and elements
        if (Array.isArray(currentValue) && Array.isArray(newValue)) {
            if (currentValue.length !== newValue.length) return true;
            return currentValue.some((val, idx) => val !== newValue[idx]);
        }
        
        // For objects, do a shallow comparison of properties
        if (typeof currentValue === 'object' && typeof newValue === 'object') {
            const currentKeys = Object.keys(currentValue);
            const newKeys = Object.keys(newValue);
            if (currentKeys.length !== newKeys.length) return true;
            return currentKeys.some(key => currentValue[key] !== newValue[key]);
        }
        
        return true;
    }

    getLogValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return `Array(${value.length})`;
        if (typeof value === 'object') return 'Object';
        return String(value);
    }

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);

        return () => {
            const callbacks = this.subscribers.get(key);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    notifySubscribers(changedKeys, context) {
        changedKeys.forEach(key => {
            const callbacks = this.subscribers.get(key);
            if (callbacks) {
                callbacks.forEach(callback => {
                    try {
                        let callbackContext = context;
                        if (typeof callback === 'function') {
                            callbackContext = callbackContext || 'unknown';
                            callback = callback.bind(this);
                        }
                        console.log(`⚡Notifying ${callbackContext} for key: ${key}`);
                        callback(this.state[key], callbackContext);
                    } catch (error) {
                        log(this.state, 'REFACT'); 
                        console.error(`Error in subscriber for ${key}:`, this.state, error);
                    }
                });
            }
        });
    }

    bind(target) {
        if (typeof target === 'object') {
            // If target is an object, bind all its properties to state
            Object.keys(target).forEach(key => {
                this.subscribe(key, value => {
                    if (target[key] !== value) {
                        target[key] = value;
                    }
                });
            });
            return this;
        }
        
        // Original selector-based binding
        const element = this.rootElement.querySelector(target);
        if (!element) {
            console.warn(`Element not found for selector: ${target}`);
            return;
        }
        this.subscribe(key, value => {
            if (element.textContent !== value) {
                element.textContent = value;
            }
        });
        return this;
    }

    render(template) {
        this.rootElement.innerHTML = template;
    }

    addComponent(componentName, componentReference) {
        if (!componentName || typeof componentName !== 'string') {
            console.error('Component name must be a non-empty string');
            return;
        }
        if (!componentReference) {
            console.error('Component reference cannot be null or undefined');
            return;
        }

        const updatedComponents = { ...this.state.components, [componentName]: componentReference };
        this.setState({ components: updatedComponents }, 'addComponent');

        console.log(`Component "${componentName}" registered successfully`);
    }

    handleIssuesStateChange(issues) {
        const defects = issues.filter(issue => issue.type === 'defect');
        if (defects.length > 0) {
            let dashboardContainer = document.querySelector('.dashboard-container');
            if (!dashboardContainer) {
                dashboardContainer = document.createElement('div');
                dashboardContainer.className = 'dashboard-container';
                this.rootElement.appendChild(dashboardContainer);
            }

            const chartCard = new ChartCard(dashboardContainer);
            chartCard.setTitle('Defects Overview');
            
            const totalDefects = defects.length;
            const openDefects = defects.filter(d => d.status === 'open').length;
            const criticalDefects = defects.filter(d => d.priority === 'critical').length;
            
            const chartData = {
                labels: ['Total', 'Open', 'Critical'],
                data: [totalDefects, openDefects, criticalDefects]
            };
            chartCard.updateChartData(chartData);
        }
    }
}
