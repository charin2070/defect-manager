/** Refact:
 * 
 * This class is a minimalistic Refact framework designed to manage application state and synchronize UI with state changes.
 * Key Responsibilities:
 * 1. **State Management:** Maintains a central `state` object that holds application data.
 * 2. **Reactivity:** Tracks changes to specific state keys and notifies subscribers (callbacks) whenever a key is updated.
 * 3. **UI Binding:** Dynamically binds HTML elements to state properties, ensuring the UI updates automatically when the state changes.
 * 4. **Rendering:** Supports rendering HTML templates into a root element for a seamless state-to-UI connection.
 * 
 * How it works:
 * - Use `setState` to update the application state, triggering notifications to all subscribed callbacks.
 * - Subscribe to specific state keys using `subscribe`, enabling modules or components to react to changes.
 * - Use `bind` to link DOM elements to state keys, making your UI Refact and declarative.
 * - Render HTML templates via `render` to set up the initial UI structure.
 * 
 * Refact is a foundation for building lightweight, Refact JavaScript applications without relying on external frameworks.
я */
class Refact {
    static instance;

    constructor(rootElement) {
        if (Refact.instance) {
            return Refact.instance;
        }

        this.rootElement = rootElement;
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
        // Queue the update
        this.updateQueue.push({ updates, context });
        
        // Process queue if not already processing
        if (!this.isProcessing) {
            this.processUpdateQueue();
        }
    }

    processUpdateQueue() {
        if (this.isProcessing || this.updateQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const { updates, context } = this.updateQueue.shift();

        try {
            // Check if anything actually changed
            let hasChanges = false;
            const changedKeys = new Set();
            
            for (const key in updates) {
                const currentValue = this.state[key];
                const newValue = updates[key];
                
                if (this.hasValueChanged(currentValue, newValue)) {
                    hasChanges = true;
                    changedKeys.add(key);
                    
                    const logValue = this.getLogValue(newValue);
                    console.log(`⚡State "${key}" => ${logValue} (by: ${context})`);
                }
            }

            if (hasChanges) {
                // Update state
                this.state = { ...this.state, ...updates };
                
                // Notify subscribers for changed keys only
                changedKeys.forEach(key => {
                    const callbacks = this.subscribers.get(key);
                    if (callbacks) {
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
        } catch (error) {
            console.error('Error processing state update:', error);
        } finally {
            this.isProcessing = false;
            
            // Process next update if any
            if (this.updateQueue.length > 0) {
                setTimeout(() => this.processUpdateQueue(), 0);
            }
        }
    }

    hasValueChanged(currentValue, newValue) {
        if (currentValue === newValue) return false;
        
        // Handle null/undefined
        if (!currentValue && !newValue) return false;
        if (!currentValue || !newValue) return true;
        
        // Deep compare objects
        if (typeof currentValue === 'object' && typeof newValue === 'object') {
            return JSON.stringify(currentValue) !== JSON.stringify(newValue);
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
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    notifySubscribers(updates, context) {
        for (const [key, callbacks] of this.subscribers.entries()) {
            if (key in updates) {
                for (const callback of callbacks) {
                    try {
                        callback(this.state[key], context);
                    } catch (error) {
                        console.error(`Error in subscriber for ${key}:`, error);
                    }
                }
            }
        }
    }

    // Bind element to state
    bind(selector, key) {
        const element = this.rootElement.querySelector(selector);
        if (!element) {
            console.warn(`Element not found for selector: ${selector}`);
            return;
        }
        this.subscribe(key, value => {
            element.textContent = value;
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

    /**
     * Adds a component reference to the state.components
     * @param {string} componentName - The name to register the component under
     * @param {object} componentReference - Reference to the component instance or class
     */
    addComponent(componentName, componentReference) {
        if (!componentName || typeof componentName !== 'string') {
            console.error('Component name must be a non-empty string');
            return;
        }
        
        if (!componentReference) {
            console.error('Component reference cannot be null or undefined');
            return;
        }

        // Update components in state
        const updatedComponents = {
            ...this.state.components,
            [componentName]: componentReference
        };

        // Use setState to ensure proper state updates and notifications
        this.setState({ components: updatedComponents }, 'addComponent');
        
        console.log(`Component "${componentName}" registered successfully`);
    }

    handleIssuesStateChange(issues) {
        const defects = issues.filter(issue => issue.type === 'defect');
        if (defects.length > 0) {
            // Create dashboard container if not exists
            let dashboardContainer = document.querySelector('.dashboard-container');
            if (!dashboardContainer) {
                dashboardContainer = document.createElement('div');
                dashboardContainer.className = 'dashboard-container';
                this.rootElement.appendChild(dashboardContainer);
            }

            // Create and render chart card
            const chartCard = new ChartCard(dashboardContainer);
            chartCard.setTitle('Defects Overview');
            
            // Calculate statistics
            const totalDefects = defects.length;
            const openDefects = defects.filter(d => d.status === 'open').length;
            const criticalDefects = defects.filter(d => d.priority === 'critical').length;
            
            // Update chart data
            const chartData = {
                labels: ['Total', 'Open', 'Critical'],
                data: [totalDefects, openDefects, criticalDefects]
            };
            chartCard.updateChartData(chartData);
        }
    }
}
