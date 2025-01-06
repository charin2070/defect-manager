class ViewComponent extends HtmlComponent {
    static idCounter = 0;

    constructor() {
        super();
        this.state = Refact.getInstance();
        this.componentName = this.constructor.name;
        
        // Create container first
        this.container = this.createElement('div', {
            className: 'view-container',
            id: this.generateId('container')
        });
        
        // Then call render if it exists
        if (typeof this.render === 'function') {
            this.render();
        }
    }

    generateId(prefix = '') {
        const componentName = this.constructor.name.toLowerCase();
        return `${componentName}-${prefix}${this.constructor.idCounter++}`;
    }

    render(options = {}) {
        this.container = this.createElement('div', {
            className: 'view-container',
            id: options.id || this.generateId('container')
        });
        return this.container;
        
    }

    getContainer() {
        return this.container;
    }

    setContainer(container) {
        this.container = container;
    }


    mount(targetElement) {
        if (targetElement && this.getElement()) {
            targetElement.appendChild(this.getElement());
        }
    }

    unmount() {
        const element = this.getElement();
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    hideAnimation() {
        const container = this.getContainer();
        if (container) {
            container.classList.add('zoom-out');
            container.addEventListener('transitionend', () => {
                container.classList.remove('zoom-out');
                container.style.display = 'none';
            }, { once: true });
        }
    }


setContainerId(id) {
    this.container.id = id;
}
    
    showAnimation() {
        const container = this.getContainer();
        if (container) {
            container.style.display = 'flex';
            container.classList.add('zoom-in');
            container.addEventListener('transitionend', () => {
                container.classList.remove('zoom-in');
            }, { once: true });
        }
    }

    show() {
        log (this, 'SHOW VIEW');

        this.container.style.display = 'flex';
    }

    hide() {
        log (this, 'HIDE VIEW');
        this.container.style.display = 'none';
    }

    toggleVisibility() {
        const container = this.container; 
        if (container) {
            if (container.style.display === 'none') {
                this.show();
            } else {
                this.hide();
            }
        }
    }
}