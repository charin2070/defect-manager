class HtmlComponent {
    constructor(container) {
        this.state = Refact.getInstance(container).state;
        this.container = container;       
    }

    generateId() {
        return `stat#${Math.random().toString(36).substring(2, 9)}`;
    }

    mount(parentContainer) {
        parentContainer.appendChild(this.container);
    }

    htmlToComponent(htmlTemplate) {
        const template = document.createElement('template');
        template.innerHTML = htmlTemplate;
        return template.content.firstChild;
    }

    createContainer(className) {
        const container = this.createElement('div',
            {
                id: this.generateId('container-element')
            }
        )

        this.setContainer(container);;
    }

    addClass(className) {
        if (this.element && className) {
            this.element.classList.add(className);
        }
    }

    setContainer(container) {
        this.container = container;
        this.element = this.container;
    }

    createElement(tagName, options = {}) {
        const element = document.createElement(tagName);

        const operations = {
            applyClasses: (classes) => {
                if (classes) {
                    element.classList.add(...classes.split(' ').filter(Boolean));
                }
            },
            setAttributes: (attributes) => {
                if (attributes) {
                    Object.keys(attributes).forEach(attr => {
                        if (attr !== 'className') {
                            element.setAttribute(attr, attributes[attr]);
                        }
                    });
                }
            },
            setInnerHTML: (html) => {
                if (html) {
                    element.innerHTML = html;
                }
            },
            setStyles: (styles) => {
                if (styles) {
                    Object.assign(element.style, styles);
                }
            }
        };

        // Apply className first if exists
        if (options.className) {
            operations.applyClasses(options.className);
        }

        // Apply other attributes
        operations.setAttributes(options);

        return element;
    }
}