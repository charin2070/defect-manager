class ViewComponent extends HtmlComponent {
    constructor(container) {
        super(container);
        this.container = this.createContainer('view-container').parentContainer = container; 
    }

    /**
     * Generates a unique element ID based on the component name and a counter
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} Unique ID
     */
    generateId(prefix = '') {
        const componentName = this.constructor.name.toLowerCase();
        return `${componentName}-${prefix}${this.idCounter++}`;
    }

    mount(parentContainer) {
        parentContainer.appendChild(this.container);
    }

    createContainer(options = {}) {
        const container = this.createElement('div', {
            className: options.className,
            id: options.id || this.generateId('container')
        });
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                container.setAttribute(key, value);
            });
        }
        
        this.container = container;
        return container;
    }

    /**
     * Gets the container element of the component
     * @returns {HTMLElement}
     */
    getContainer() {
        return this.container;
    }

    /**
     * Gets the main element of the component
     * @returns {HTMLElement}
     */
    getElement() {
        return this.element;
    }

    /**
     * Sets the main element of the component
     * @param {HTMLElement} element - Element to set
     */
    setElement(element) {
        this.element = element;
    }

    /**
     * Sets the container element
     * @param {HTMLElement} container - Container element to set
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * Mounts the component to a target element
     * @param {HTMLElement} targetElement - Element to mount the component to
     */
    mount(targetElement) {
        if (targetElement && this.getElement()) {
            targetElement.appendChild(this.getElement());
        }
    }

    /**
     * Unmounts the component from its parent
     */
    unmount() {
        const element = this.getElement();
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
}