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
        
        Refact.instance = this;
    }

    static getInstance(rootElement) {
        if (!Refact.instance) {
            Refact.instance = new Refact(rootElement);
        }
        return Refact.instance;
    }

    // Safe stringify for logging
    safeStringify(obj, maxLength = 50) {
        if (!obj || typeof obj !== 'object') {
            return String(obj);
        }

        const seen = new WeakSet();
        
        const stringify = (value) => {
            if (!value || typeof value !== 'object') {
                return String(value);
            }

            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);

            // Для объектов-классов возвращаем только имя конструктора
            if (value.constructor && value.constructor.name !== 'Object' && value.constructor.name !== 'Array') {
                return `[${value.constructor.name}]`;
            }

            if (Array.isArray(value)) {
                const items = value.slice(0, 3).map(item => stringify(item));
                return `[${items.join(', ')}${value.length > 3 ? '...' : ''}]`;
            }

            const pairs = Object.entries(value).slice(0, 3).map(([key, val]) => 
                `${key}: ${stringify(val)}`
            );
            return `{${pairs.join(', ')}${Object.keys(value).length > 3 ? '...' : ''}}`;
        };

        const result = stringify(obj);
        return result.length > maxLength ? result.substring(0, maxLength) + '...' : result;
    }

    // Default state
    setState(newState, changedBy = 'unknown') {
        try {
            // Update state in one go to avoid multiple re-renders
            Object.assign(this.state, newState);
            
            // Once per key
            for (const key in newState) {
                const value = newState[key];
                const callbacks = this.subscribers.get(key) || [];
                callbacks.forEach(callback => {
                    if (typeof callback === 'function') {
                        callback(value, changedBy);
                    }
                });
                
                // Log
                const logValue = value === null ? 'null' : 
                               value === undefined ? 'undefined' :
                               typeof value === 'object' ? this.safeStringify(value) :
                               String(value);
                               
                console.log(`⚡State "${key}" => ${logValue} (by: ${changedBy})`);
            }
        } catch (error) {
            console.error('[Refact.setState] Error setting state:', error);
        }
    }
    
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
    }

    notify(key) {
        const callbacks = this.subscribers.get(key) || [];
        callbacks.forEach(callback => callback(this.state[key]));
    }

    notifySubscribers(context) {
        this.subscribers.forEach((callbacks, key) => {
            callbacks.forEach(callback => {
                if (typeof callback === 'function') {
                    callback(this.state[key], context);
                }
            });
        });
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
}
