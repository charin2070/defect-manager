class Reactive {
    /**
     * Reactivity class is responsible for managing the reactive state
     * of the application within a specified container. It utilizes 
     * the Refact framework to synchronize the UI with state changes.
     *
     * @param {HTMLElement} container - The DOM element that serves as 
     *                                   the root for the reactive components.
     */
    constructor(options = {}) {
        this.container = document.getElementById('app');
        this.refact = Refact.getInstance(this.container);
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
        if (!key)
            return this.state;
        return this.state[key];
    }
    
}