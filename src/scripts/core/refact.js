class Refact {
    static instance;

    constructor() {
        if (Refact.instance) {
            return Refact.instance;
        }

        this.rootElement = document.getElementById('app');
        this.state = {};
        this.subscribers = new Map();
        this.updateQueue = [];
        this.isProcessing = false;
        
        Refact.instance = this;
    }

    static getInstance(rootElement) {
        if (!Refact.instance) {
            Refact.instance = new Refact(rootElement);
        }
        return Refact.instance;
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
            return JSON.stringify(value).substring(0, 50) + '...';
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
                console.log(`Notifying subscribers for key: ${key}`);
                callbacks.forEach(callback => {
                    try {
                        callback(this.state[key], context);
                    } catch (error) {
                        console.error(`Error in subscriber for ${key}:`, error);
                    }
                });
            }
        });
    }

    bind(selector, key) {
        const element = this.rootElement.querySelector(selector);
        if (!element) {
            console.warn(`Element not found for selector: ${selector}`);
            return;
        }
        this.subscribe(key, value => {
            if (element.textContent !== value) {
                element.textContent = value;
            }
        });

        if (key in this.state) {
            element.textContent = this.state[key];
        } else {
            console.warn(`State key not found: ${key}`);
        }
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
