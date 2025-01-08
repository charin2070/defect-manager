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
        this.updateQueue.push({ updates, context });

        if (!this.isProcessing) {
            this.processUpdateQueue();
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
        if (currentValue === newValue) return false;
        if (!currentValue || !newValue) return true;
        if (typeof currentValue === 'object' && typeof newValue === 'object') {
            return !this.shallowEqual(currentValue, newValue);
        }
        return true;
    }

    shallowEqual(obj1, obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (const key of keys1) {
            if (obj1[key] !== obj2[key]) return false;
        }
        return true;
    }

    getLogValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, (key, val) => {
                    if (val !== null && typeof val === 'object') {
                        return;
                    }
                    return val;
                }).substring(0, 50) + '...';
            } catch (error) {
                return 'Circular structure detected';
            }
        }
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
