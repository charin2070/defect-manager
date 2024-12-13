class HtmlComponent extends Reactive {
    constructor(container) {
        super(container);
    }

    generateId() {
        return `stat#${Math.random().toString(36).substr(2, 9)}`;
    }

    addClass(className) {
        if (this.element && className) {
            this.element.classList.add(className);
        }
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