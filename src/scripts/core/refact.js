/** Refact:
 * 
 * This class is a minimalistic reactive framework designed to manage application state and synchronize UI with state changes.
 * Key Responsibilities:
 * 1. **State Management:** Maintains a central `state` object that holds application data.
 * 2. **Reactivity:** Tracks changes to specific state keys and notifies subscribers (callbacks) whenever a key is updated.
 * 3. **UI Binding:** Dynamically binds HTML elements to state properties, ensuring the UI updates automatically when the state changes.
 * 4. **Rendering:** Supports rendering HTML templates into a root element for a seamless state-to-UI connection.
 * 
 * How it works:
 * - Use `setState` to update the application state, triggering notifications to all subscribed callbacks.
 * - Subscribe to specific state keys using `subscribe`, enabling modules or components to react to changes.
 * - Use `bind` to link DOM elements to state keys, making your UI reactive and declarative.
 * - Render HTML templates via `render` to set up the initial UI structure.
 * 
<<<<<<< HEAD
 * Refact is a foundation for building lightweight, reactive JavaScript applications without relying on external frameworks.
я */

class Refact {
    constructor(rootElement) {
        this.rootElement = rootElement;
        this.state = {};
        this.subscribers = new Map();
    }

    static #instance = null;
    static getInstance(rootElement) {
        if (!Refact.#instance) {
            Refact.#instance = new Refact(rootElement);
        }
        return Refact.#instance;
=======
 * RefAct is a foundation for building lightweight, reactive JavaScript applications without relying on external frameworks.
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
>>>>>>> 413ea59d99e7f4b83c6ec8cbf77e1de2e15d057b
    }

    // Default state
    setState(newState, changedBy = 'unknown') {
        for (let key in newState) {
            this.state[key] = newState[key];
            this.notify(key);
<<<<<<< HEAD
            
            // Улучшенное логирование
            const value = this.state[key];
            let logValue;
            
            if (value === null) {
                logValue = 'null';
            } else if (Array.isArray(value)) {
                logValue = `Array(${value.length})`;
            } else if (typeof value === 'object') {
                logValue = JSON.stringify(value, null, 2);
            } else {
                logValue = value;
            }
            
            console.log(`⚡State changed: ${key} = ${logValue} (by: ${changedBy})`);
=======
            console.log(`⚡State changed: ${key} = ${this.state[key]} (by: ${changedBy})`);
>>>>>>> 413ea59d99e7f4b83c6ec8cbf77e1de2e15d057b
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

    // Bind element to state
    bind(selector, key) {
        const element = this.rootElement.querySelector(selector);
        this.subscribe(key, value => {
            element.textContent = value;
        });
        element.textContent = this.state[key] || '';
    }

    render(template) {
        this.rootElement.innerHTML = template;
    }
}
