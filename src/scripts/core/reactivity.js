class Reactive {
    /**
     * Reactivity class is responsible for managing the reactive state
     * of the application within a specified container. It utilizes 
     * the Refact framework to synchronize the UI with state changes.
     *
     * @param {HTMLElement} container - The DOM element that serves as 
     *                                   the root for the reactive components.
     */
    constructor(container) {
        this.container = container;
        this.refact = Refact.getInstance(container);
        this.state = this.refact.state;
    }
    
    getContainer() {
        return this.container;
    }

    setState(newState) {
        const instanceName = this.constructor.name;
        this.refact.setState(newState, instanceName);
    }

    subscribe(key, callback) {
        this.refact.subscribe(key, callback);
    }

    getState(key) {
        if (!this.state[key] || this.state[key] === undefined) {
            console.warn(`State key not found: ${key}`);
            return 'Загрузка...';
        }
        return this.state[key];
    }
    
}