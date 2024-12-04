// Refactor ConsoleToast class into smaller components
class ConsoleToast {
    constructor() {
        this.setupContainer();
        this.errorToast = new ErrorToast(this);
        this.logToast = new LogToast(this);
        this.toastContainer.append(this.errorToast.element, this.logToast.element);
        this.overrideConsoleMethods();
    }

    setupContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.classList.add('toast-container');
        document.body.appendChild(this.toastContainer);
    }

    overrideConsoleMethods() {
        const originalMethods = { error: console.error, log: console.log, warn: console.warn, info: console.info };
        console.error = (...args) => {
            args.forEach(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    this.errorToast.addErrorMessage(arg);
                } else {
                    this.errorToast.addErrorMessage({ message: arg.toString() });
                }
            });
            originalMethods.error.apply(console, args);
        };
        console.log = (...args) => {
            args.forEach(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    this.logToast.addLogMessage(arg);
                }
            });
            originalMethods.log.apply(console, args);
        };
        console.warn = (...args) => {
            args.forEach(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    this.logToast.addLogMessage(arg);
                }
            });
            originalMethods.warn.apply(console, args);
        };
        console.info = (...args) => {
            args.forEach(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    this.logToast.addLogMessage(arg);
                }
            });
            originalMethods.info.apply(console, args);
        };
    }
}

class ErrorToast {
    constructor(consoleToast) {
        this.consoleToast = consoleToast;
        this.element = document.createElement('div');
        this.element.classList.add('console-toast');
        const content = document.createElement('div');
        content.classList.add('toast-content');
        this.element.appendChild(content);
    }

    addErrorMessage(message) {
        const content = this.element.querySelector('.toast-content');
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-element');
        errorElement.textContent = message.message || JSON.stringify(message, null, 2);
        content.appendChild(errorElement);
        this.element.style.display = content.children.length > 0 ? 'block' : 'none';
    }
}

class LogToast {
    constructor(consoleToast) {
        this.consoleToast = consoleToast;
        this.element = document.createElement('div');
        this.element.classList.add('console-toast');
        const content = document.createElement('div');
        content.classList.add('toast-content');
        this.element.appendChild(content);
    }

    addLogMessage(message) {
        const content = this.element.querySelector('.toast-content');
        const logElement = document.createElement('div');
        logElement.classList.add('log-element', 'formatted-log');
        logElement.appendChild(this.createTreeView(message));
        content.appendChild(logElement);
        this.element.style.display = content.children.length > 0 ? 'block' : 'none';
    }

    createTreeView(obj) {
        const ul = document.createElement('ul');
        ul.classList.add('tree-view');
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const li = document.createElement('li');
                li.classList.add('tree-view-item', 'collapsed');
                const preview = typeof obj[key] === 'object' ? '...' : obj[key];
                li.innerHTML = `${key}: <span class='preview'>${preview}</span>`;
                if (typeof obj[key] === 'object') {
                    li.appendChild(this.createTreeView(obj[key]));
                    li.addEventListener('click', (e) => {
                        e.stopPropagation();
                        li.classList.toggle('expanded');
                        li.classList.toggle('collapsed');
                    });
                }
                ul.appendChild(li);
            }
        }
        return ul;
    }
}

// Initialize ConsoleToast
const consoleToast = new ConsoleToast();
