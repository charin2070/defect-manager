class ConsoleDisplay {
    constructor(options) {
        this.options = options || { level: 'prod' };
        this.init();
    }

    init() {
        this.createDisplay();
        this.overrideConsoleMethods();
        this.setupResizing();
    }

    createDisplay() {
        this.container = document.createElement('div');

        if (this.options.level === 'debug') {
            this.container.style.position = 'fixed';
            this.container.style.bottom = '0';
            this.container.style.left = '0';
            this.container.style.width = '100%';
            this.container.style.height = '25%';
            this.container.style.minHeight = '100px';
            this.container.style.maxHeight = '80%';
            this.container.style.overflowY = 'auto';
            this.container.style.backgroundColor = '#000';
            this.container.style.color = '#fff';
            this.container.style.fontFamily = 'monospace';
            this.container.style.padding = '10px';
            this.container.style.zIndex = '1000';
            
            // Add resize handle
            this.resizeHandle = document.createElement('div');
            this.resizeHandle.style.position = 'absolute';
            this.resizeHandle.style.top = '0';
            this.resizeHandle.style.left = '0';
            this.resizeHandle.style.right = '0';
            this.resizeHandle.style.height = '4px';
            this.resizeHandle.style.backgroundColor = '#333';
            this.resizeHandle.style.cursor = 'ns-resize';
            this.container.appendChild(this.resizeHandle);
            
            // Add padding to top to account for resize handle
            this.container.style.paddingTop = '14px';
        } else if (this.options.level === 'prod') {
            this.container.style.display = 'none';
            this.container.style.position = 'fixed';
            this.container.style.bottom = '0';
            this.container.style.left = '0';
            this.container.style.width = '100%';
            this.container.style.height = 'auto';
            this.container.style.backgroundColor = '#000';
            this.container.style.color = '#fff';
            this.container.style.fontFamily = 'monospace';
            this.container.style.padding = '10px';
            this.container.style.zIndex = '1000';
        }
    }

    setupResizing() {
        if (!this.resizeHandle) return;

        let startY;
        let startHeight;
        let containerHeight;

        const onMouseDown = (e) => {
            startY = e.clientY;
            containerHeight = this.container.offsetHeight;
            startHeight = containerHeight;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            
            // Prevent text selection while resizing
            document.body.style.userSelect = 'none';
        };

        const onMouseMove = (e) => {
            const delta = startY - e.clientY;
            const newHeight = startHeight + delta;
            
            // Constrain height between minHeight and maxHeight
            const minHeight = parseInt(this.container.style.minHeight) || 100;
            const maxHeight = window.innerHeight * 0.8; // 80% of window height
            
            this.container.style.height = Math.min(Math.max(newHeight, minHeight), maxHeight) + 'px';
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.userSelect = '';
        };

        this.resizeHandle.addEventListener('mousedown', onMouseDown);
    }

    overrideConsoleMethods() {
        const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug
        };

        const logMessage = (type, args) => {
            const messageElement = document.createElement('div');
            let color = '#fff';
            
            switch(type) {
                case 'LOG':
                    color = '#fff'; // White for logs
                    break;
                case 'INFO':
                    color = '#3498db'; // Blue for info
                    break;
                case 'WARN':
                    color = '#f39c12'; // Orange for warnings
                    break;
                case 'ERROR':
                    color = '#ff69b4'; // Pink for errors
                    break;
                case 'DEBUG':
                    color = '#2ecc71'; // Green for debug
                    break;
            }
            
            messageElement.style.color = color;
            messageElement.innerHTML = `<strong>${type}:</strong> ${this.formatArgs(args)}`;
            this.container.appendChild(messageElement);
            if (this.options.level === 'prod' && type === 'ERROR') {
                this.container.style.display = 'block';
            }
        };

        console.log = (...args) => {
            originalConsole.log.apply(console, args);
            logMessage('LOG', args);
        };

        console.info = (...args) => {
            originalConsole.info.apply(console, args);
            logMessage('INFO', args);
        };

        console.warn = (...args) => {
            originalConsole.warn.apply(console, args);
            logMessage('WARN', args);
        };

        console.error = (...args) => {
            originalConsole.error.apply(console, args);
            logMessage('ERROR', args);
        };

        console.debug = (...args) => {
            originalConsole.debug.apply(console, args);
            logMessage('DEBUG', args);
        };
    }

    formatArgs(args) {
        return args.map(arg => {
            if (typeof arg === 'object') {
                return `<pre>${this.syntaxHighlight(arg)}</pre>`;
            }
            return arg;
        }).join(' ');
    }

    syntaxHighlight(json) {
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b(\d+(\.\d*)?([eE][+-]?\d+)?)\b)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return `<span class="${cls}">${match}</span>`;
        });
    }
}

// Initialize ConsoleDisplay immediately
const consoleOptions = (typeof window.options === 'object') ? window.options : { level: 'debug' };
const consoleDisplay = new ConsoleDisplay(consoleOptions);

// Set up error handlers immediately
window.onerror = function(msg, url, lineNo, columnNo, error) {
    const errorDetails = error && error.stack ? error.stack : `${msg}\nAt: ${url}:${lineNo}:${columnNo}`;
    consoleDisplay.container.style.display = 'block'; // Force display for errors
    console.error('Uncaught Error:', errorDetails);
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    consoleDisplay.container.style.display = 'block'; // Force display for errors
    console.error('Unhandled Promise Rejection:', event.reason);
});

// Additional initialization after DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    // Ensure container is in the DOM
    if (!document.body.contains(consoleDisplay.container)) {
        document.body.appendChild(consoleDisplay.container);
    }
});
