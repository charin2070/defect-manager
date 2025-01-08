window.HtmlComponent = class HtmlComponent {
    constructor() {
        this.state = Refact.getInstance();
    }

    generateId() {
        return `stat#${Math.random().toString(36).substring(2, 9)}`;
    }

    appendChild(htmlElement) {
        if (htmlElement) {
            if (typeof htmlElement === 'string') {
                htmlElement = this.htmlToComponent(htmlElement);
                return;
            }

            if (htmlElement instanceof Node) {
                this.container.appendChild(htmlElement);
                return;
            }

            if (htmlElement instanceof HtmlElement) {
                this.container.appendChild(htmlElement.getContainer());
                return;
            }
        }
       

            console.error('Invalid element passed to appendChild:', htmlElement);
            return; // Exit if the element is not a valid DOM node
        }

    htmlToComponent(htmlTemplate) {
        const template = document.createElement('template');
        template.innerHTML = htmlTemplate.trim();
        return template.content.firstChild;
    }

    setWidth(width) {
        if (this.container) {
            this.container.style.width = width;
        }
    }

    createContainer(className) {
        const container = this.createElement('div', {
            id: this.generateId('container-element')
        });
        if (className) {
            this.addClass(className);
        }
        this.setContainer(container);
    }

    addClass(className) {
        if (this.element && className) {
            const classes = className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                this.element.classList.add(...classes);
            }
        }
    }

    setContainer(container) {
        this.container = container;
        this.element = this.container;
    }

    createElement(tagName, options = {}) {
        const element = document.createElement(tagName);

        if (options.className) {
            const classes = options.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                element.classList.add(...classes);
            }
        }

        Object.entries(options).forEach(([key, value]) => {
            if (key !== 'className' && value !== undefined) {
                if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else {
                    element.setAttribute(key, value);
                }
            }
        });

        return element;
    }

    getContainer() {
        return this.container;
    }
}
