class ViewComponent extends HtmlComponent {
    static idCounter = 0;

    constructor() {
        super();
        this.state = Refact.getInstance();
        this.componentName = this.constructor.name;
        this.container = this.createContainer();
        this.container.style.display = 'none';
        this.container.style.backgroundColor = 'transparent';
    }

    generateId(prefix = '') {
        const componentName = this.componentName.toLowerCase();
        return `${componentName}-${prefix}${this.constructor.idCounter++}`;
    }

    createContainer(options = {}) {
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

    hide() {
        log(this.container, 
            'CONTAINER',
        )
        this.container.style.display = 'none';
    }

    show() {
        const container = this.getContainer();
        if (container) {
            
            container.style.display = 'flex';
            container.className = 'view-container visible'
            log(container, 
                'CONTAINER',
            )
        }
    }
}