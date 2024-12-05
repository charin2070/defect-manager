class HtmlElement {
    constructor(element) {
        this.element = element;
    }

    addClass(className) {
        this.element.classList.add(className);
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'container';
    }
    
    createElement(tagName, options = {}) {
    const element = document.createElement(tagName);

    const operations = {
        applyClasses: (classes) => {
            if (classes) {
                element.classList.add(...classes.split(' '));
            }
        },
        setAttributes: (attributes) => {
            if (attributes) {
                Object.keys(attributes).forEach(attr => {
                    element.setAttribute(attr, attributes[attr]);
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

    Object.keys(operations).forEach(op => operations[op](options[op === 'applyClasses' ? 'className' : op]));

    return element;
}
}