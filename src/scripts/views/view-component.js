class View extends Reactive {
    static #idCounter = 0;
    #element = null;
    
    constructor() {
        super();
    }

    /**
     * Generates a unique element ID based on the component name and a counter
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} Unique ID
     */
    generateId(prefix = '') {
        const componentName = this.constructor.name.toLowerCase();
        const uniqueId = `${componentName}-${prefix ? prefix + '-' : ''}${++View.#idCounter}`;
        return uniqueId;
    }

    createContainer(options = {}) {
        const container = this.createElement('div', options);
        for (const [key, value] of Object.entries(options)) {
            container.setAttribute(key, value);
        }
        this.setContainer(container);
        return container;
    }

    /**
     * Creates an HTML element with a unique ID
     * @param {string} tagName - HTML tag name
     * @param {Object} options - Element options (className, id prefix, etc.)
     * @returns {HTMLElement} Created element with unique ID
     */
    createElement(tagName, options = {}) {
        const element = document.createElement(tagName);
        
        if (options.className) {
            element.className = options.className;
        }

        const idPrefix = options.idPrefix || '';
        element.id = this.generateId(idPrefix);

        return element;
    }

    /**
     * Gets the main element of the component
     * @returns {HTMLElement}
     */
    getElement() {
        return this.#element;
    }

    getContainer() {
        return this.#element;
    }

    setContainer(container) {
        this.#element = container;
    }

    /**
     * Sets the main element of the component
     * @param {HTMLElement} element 
     */
    setElement(element) {
        if (!(element instanceof HTMLElement)) {
            throw new Error('Element must be an instance of HTMLElement');
        }
        this.#element = element;
    }

    /**
     * Renders the component
     * Must be implemented by child classes
     */
    render() {
        throw new Error('render() method must be implemented by child class');
    }
}