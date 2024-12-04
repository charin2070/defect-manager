class ConsoleToast {
    constructor() {
        this.themes = {
            dracula: {
                background: '#282a36',
                text: '#f8f8f2',
                key: '#bd93f9',
                string: '#f1fa8c',
                number: '#bd93f9',
                error: '#ff5555',
                accent: '#ff79c6',
                toggle: '#50fa7b',
                toggleActive: '#8be9fd',
                border: '#44475a'
            },
            github: {
                background: '#0d1117',
                text: '#c9d1d9',
                key: '#58a6ff',
                string: '#a5d6ff',
                number: '#79c0ff',
                error: '#f85149',
                accent: '#bc8cff',
                toggle: '#7ee787',
                toggleActive: '#58a6ff',
                border: '#30363d'
            },
            monokai: {
                background: '#272822',
                text: '#f8f8f2',
                key: '#66d9ef',
                string: '#e6db74',
                number: '#ae81ff',
                error: '#f92672',
                accent: '#a6e22e',
                toggle: '#a6e22e',
                toggleActive: '#66d9ef',
                border: '#49483e'
            }
        };
        // Load theme from localStorage or use default
        const savedSettings = JSON.parse(localStorage.getItem('consoleToast') || '{}');
        this.currentTheme = this.themes[savedSettings.theme] || this.themes.dracula;
        this.setupContainer();

        // Store original console methods
        const originalError = console.error;
        const originalLog = console.log;
        const originalInfo = console.info;

        // Override console methods
        console.error = (...args) => {
            const message = args.join(' ');
            this.showToast({ message, file: '', line: '' });
            originalError.apply(console, args);
        };

        console.log = (...args) => {
            if (args.length === 1 && typeof args[0] === 'object') {
                this.showInfoToast(args[0]);
            } else {
                const message = args.join(' ');
                this.showInfoToast(message);
            }
            originalLog.apply(console, args);
        };

        console.info = (...args) => {
            const message = args.join(' ');
            this.showInfoToast(message);
            originalInfo.apply(console, args);
        };

        window.addEventListener('error', async (event) => {
            const errorDetails = await this.formatError(event.message, event.error?.stack);
            this.showToast(errorDetails);
        });

        window.addEventListener('unhandledrejection', async (event) => {
            const errorDetails = await this.formatError(event.reason, event.reason?.stack);
            this.showToast(errorDetails);
        });
    }

    setupContainer() {
        this.toastContainer = document.createElement('div');
        Object.assign(this.toastContainer.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '15px',
            maxHeight: '80vh',
            overflowY: 'auto',
            overflow: 'hidden'
        });
        document.body.appendChild(this.toastContainer);

        // Theme switcher dropdown
        const themeSwitcher = document.createElement('div');
        Object.assign(themeSwitcher.style, {
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: '10000'
        });

        const select = document.createElement('select');
        Object.assign(select.style, {
            padding: '5px 10px',
            borderRadius: '5px',
            background: this.currentTheme.background,
            color: this.currentTheme.text,
            border: `1px solid ${this.currentTheme.border}`,
            cursor: 'pointer'
        });

        Object.keys(this.themes).forEach(themeName => {
            const option = document.createElement('option');
            option.value = themeName;
            option.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
            if (this.currentTheme === this.themes[themeName]) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.onchange = (e) => {
            const themeName = e.target.value;
            this.currentTheme = this.themes[themeName];
            this.updateAllToasts();
            select.style.background = this.currentTheme.background;
            select.style.color = this.currentTheme.text;
            select.style.border = `1px solid ${this.currentTheme.border}`;
            localStorage.setItem('consoleToast', JSON.stringify({ theme: themeName }));
        };

        themeSwitcher.appendChild(select);
        document.body.appendChild(themeSwitcher);
    }

    updateAllToasts() {
        const toasts = this.toastContainer.querySelectorAll('.console-toast');
        toasts.forEach(toast => {
            this.applyTheme(toast);
        });
    }

    applyTheme(element) {
        if (element.classList.contains('console-toast')) {
            element.style.background = this.currentTheme.background;
            element.style.color = this.currentTheme.text;
        }
        // Recursively apply theme to children
        element.querySelectorAll('[data-theme-role]').forEach(el => {
            const role = el.dataset.themeRole;
            if (this.currentTheme[role]) {
                el.style.color = this.currentTheme[role];
            }
        });
    }

    async formatError(message, stack) {
        const stackLines = stack?.split('\n') || [];
        let method = 'Unknown Method';
        let line = '';
        let file = '';

        if (stackLines.length > 1) {
            const match = stackLines[1].match(/at\s+(\w+)?\s*\(?(.*):(\d+):(\d+)\)?/);
            if (match) {
                method = match[1] || 'Anonymous';
                file = match[2];
                line = match[3];
            }
        }

        return {
            message,
            method,
            file,
            line,
            stack
        };
    }

    showToast(errorDetails) {
        const toast = document.createElement('div');
        toast.classList.add('console-toast');
        Object.assign(toast.style, {
            padding: '15px',
            paddingRight: '35px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            animation: 'fadeInSlideUp 0.6s ease-out',
            fontFamily: '"Roboto", sans-serif',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            position: 'relative',
            maxWidth: '400px',
            maxHeight: '400px',
            wordBreak: 'break-word',
            overflow: 'auto'
        });

        const header = document.createElement('div');
        header.style.cursor = 'pointer';
        header.innerHTML = `
            <div style="font-weight: bold; color: ${this.currentTheme.error}">
                ${errorDetails.message}
            </div>
            <div style="font-size: 0.9em; color: ${this.currentTheme.text}">
                <div><span style="color: ${this.currentTheme.key}">Файл:</span> ${errorDetails.file}</div>
                <div><span style="color: ${this.currentTheme.key}">Строка:</span> ${errorDetails.line}</div>
                <div><span style="color: ${this.currentTheme.key}">Метод:</span> ${errorDetails.method}</div>
            </div>
        `;

        // Copy functionality
        header.onclick = () => {
            const fullError = `Error: ${errorDetails.message}\nFile: ${errorDetails.file}\nLine: ${errorDetails.line}\nMethod: ${errorDetails.method}\nStack:\n${errorDetails.stack}`;
            navigator.clipboard.writeText(fullError);
            this.showCopyNotification();
        };

        toast.appendChild(header);

        // Add stack trace if available
        if (errorDetails.stack) {
            const stackContainer = document.createElement('div');
            stackContainer.style.marginTop = '10px';
            
            const stackHeader = document.createElement('div');
            stackHeader.style.color = this.currentTheme.key;
            stackHeader.style.marginBottom = '5px';
            stackHeader.textContent = 'Stack Trace:';
            
            const stackContent = document.createElement('pre');
            Object.assign(stackContent.style, {
                margin: '0',
                padding: '10px',
                background: this.currentTheme.background + '80',
                border: `1px solid ${this.currentTheme.border}`,
                borderRadius: '5px',
                fontSize: '0.9em',
                overflow: 'auto',
                maxHeight: '200px',
                color: this.currentTheme.text,
                whiteSpace: 'pre-wrap'
            });
            stackContent.textContent = errorDetails.stack;
            
            stackContainer.appendChild(stackHeader);
            stackContainer.appendChild(stackContent);
            toast.appendChild(stackContainer);
        }

        const closeButton = this.createCloseButton();
        toast.appendChild(closeButton);
        
        this.applyTheme(toast);
        this.toastContainer.appendChild(toast);
    }

    showInfoToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('console-toast');
        Object.assign(toast.style, {
            padding: '15px',
            paddingRight: '35px', 
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            animation: 'fadeInSlideUp 0.6s ease-out',
            fontFamily: '"Roboto", sans-serif',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            position: 'relative',
            maxWidth: '400px',
            maxHeight: '400px',
            wordBreak: 'break-word',
        });

        // Add search functionality
        const searchContainer = document.createElement('div');
        searchContainer.style.paddingRight = '15px'; 
        const searchInput = document.createElement('input');
        Object.assign(searchInput.style, {
            width: '100%',
            padding: '5px',
            marginBottom: '10px',
            background: this.currentTheme.background,
            color: this.currentTheme.text,
            border: `1px solid ${this.currentTheme.border}`,
            borderRadius: '5px'
        });
        searchInput.placeholder = 'Search in object...';
        searchContainer.appendChild(searchInput);

        const content = document.createElement('div');
        content.style.overflow = 'auto';
        
        if (typeof message === 'object') {
            const treeView = this.createTreeView(message);
            content.appendChild(treeView);

            // Implement search functionality
            searchInput.oninput = () => {
                const searchTerm = searchInput.value.toLowerCase();
                this.highlightSearchResults(treeView, searchTerm);
            };
        } else {
            content.textContent = message;
        }

        toast.appendChild(searchContainer);
        toast.appendChild(content);

        const closeButton = this.createCloseButton();
        toast.appendChild(closeButton);

        this.applyTheme(toast);
        this.toastContainer.appendChild(toast);
    }

    highlightSearchResults(element, searchTerm) {
        const items = element.querySelectorAll('[data-theme-role]');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (searchTerm && text.includes(searchTerm)) {
                const originalText = item.textContent;
                const regex = new RegExp(searchTerm, 'gi');
                item.innerHTML = originalText.replace(regex, match => 
                    `<span style="color: #ff8c00; font-weight: bold">${match}</span>`
                );
            } else {
                // Restore original styling
                item.innerHTML = item.textContent;
                if (item.dataset.themeRole && this.currentTheme[item.dataset.themeRole]) {
                    item.style.color = this.currentTheme[item.dataset.themeRole];
                }
            }
        });
    }

    createCloseButton() {
        const closeButton = document.createElement('button');
        Object.assign(closeButton.style, {
            position: 'absolute',
            top: '12px', 
            right: '12px', 
            background: 'transparent',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '5px',
            lineHeight: '1',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1' 
        });
        closeButton.textContent = '✖';
        closeButton.dataset.themeRole = 'accent';
        closeButton.addEventListener('click', e => e.target.closest('.console-toast').remove());
        return closeButton;
    }

    showCopyNotification() {
        const notification = document.createElement('div');
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: this.currentTheme.background,
            color: this.currentTheme.text,
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: '10000'
        });
        notification.textContent = 'Copied to clipboard!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    createTreeView(obj, level = 0, seen = new WeakSet()) {
        const MAX_DEPTH = 3;
        const container = document.createElement('div');
        container.style.marginLeft = `${level * 20}px`;
        container.style.borderLeft = level > 0 ? `1px solid ${this.currentTheme.border}` : 'none';
        container.style.paddingLeft = '10px';

        if (level > MAX_DEPTH) {
            const maxDepthText = document.createElement('span');
            maxDepthText.textContent = '[Max Depth Reached]';
            maxDepthText.dataset.themeRole = 'error';
            container.appendChild(maxDepthText);
            return container;
        }

        for (const key in obj) {
            const item = document.createElement('div');
            item.style.padding = '2px 0';
            const value = obj[key];

            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    const circularRef = document.createElement('div');
                    
                    const keySpan = document.createElement('span');
                    keySpan.textContent = `${key}: `;
                    keySpan.dataset.themeRole = 'key';
                    keySpan.style.fontWeight = 'bold';
                    
                    const valueSpan = document.createElement('span');
                    valueSpan.textContent = '[Circular]';
                    valueSpan.dataset.themeRole = 'error';
                    
                    circularRef.appendChild(keySpan);
                    circularRef.appendChild(valueSpan);
                    item.appendChild(circularRef);
                } else {
                    seen.add(value);
                    const toggle = document.createElement('span');
                    toggle.textContent = '▶';
                    toggle.dataset.themeRole = 'toggle';
                    Object.assign(toggle.style, {
                        cursor: 'pointer',
                        marginRight: '5px',
                        display: 'inline-block',
                        width: '15px',
                    });

                    const keyElement = document.createElement('span');
                    keyElement.textContent = key;
                    keyElement.dataset.themeRole = 'key';
                    keyElement.style.fontWeight = 'bold';

                    const childContainer = this.createTreeView(value, level + 1, seen);
                    childContainer.style.display = 'none';

                    toggle.addEventListener('click', () => {
                        const isCollapsed = childContainer.style.display === 'none';
                        childContainer.style.display = isCollapsed ? 'block' : 'none';
                        toggle.textContent = isCollapsed ? '▼' : '▶';
                        toggle.dataset.themeRole = isCollapsed ? 'toggleActive' : 'toggle';
                    });

                    item.appendChild(toggle);
                    item.appendChild(keyElement);
                    item.appendChild(childContainer);
                }
            } else {
                const keySpan = document.createElement('span');
                keySpan.textContent = `${key}: `;
                keySpan.dataset.themeRole = 'key';
                keySpan.style.fontWeight = 'bold';
                
                const valueSpan = document.createElement('span');
                valueSpan.textContent = value;
                valueSpan.dataset.themeRole = typeof value === 'string' ? 'string' : 'number';
                
                item.appendChild(keySpan);
                item.appendChild(valueSpan);
            }

            container.appendChild(item);
        }

        return container;
    }

    getStackTrace() {
        try {
            throw new Error();
        } catch (e) {
            return e.stack || 'No stack trace available';
        }
    }

    async formatError(error, stack) {
        const solutions = this.getPossibleSolutions(error);

        const { file, line } = this.extractFileAndLine(stack);
        let codeSnippet = null;

        if (stack) {
            codeSnippet = await this.getCodeSnippetFromStack(stack);
        }

        return {
            message: error,
            file,
            line,
            codeSnippet,
            solutions
        };
    }

    extractFileAndLine(stack) {
        const match = stack.match(/\((.*):(\d+):(\d+)\)/) || stack.match(/at (.*):(\d+):(\d+)/);
        if (!match) return { file: 'Неизвестно', line: 'Неизвестно' };

        const [, file, line] = match;
        return { file, line };
    }

    async getCodeSnippetFromStack(stack) {
        const match = stack.match(/\((.*):(\d+):(\d+)\)/) || stack.match(/at (.*):(\d+):(\d+)/);
        if (!match) return null;

        const [_, scriptUrl, lineNumber] = match;

        try {
            const response = await fetch(scriptUrl);
            if (!response.ok) return null;

            const code = await response.text();
            const lines = code.split('\n');
            const lineIndex = parseInt(lineNumber, 10) - 1;

            return lines.slice(Math.max(0, lineIndex - 1), lineIndex + 2).join('\n');
        } catch (e) {
            return 'Unable to fetch code snippet.';
        }
    }

    getPossibleSolutions(error) {
        if (!error) return ['Check the error logs for more details.'];
        const solutions = [];
        if (error.includes('undefined')) {
            solutions.push('Ensure the variable is defined.');
        } else if (error.includes('TypeError')) {
            solutions.push('Check the type of the object or method.');
        }
        return solutions;
    }
}

// Добавляем анимацию через CSS
const style = document.createElement('style');
style.textContent = `
@keyframes toast-slide-in {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;
document.head.appendChild(style);

// Добавляем fade-in и slide-up анимацию
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes fadeInSlideUp {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
    @keyframes fadeOutSlideDown {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(20px);
        }
    }
`, styleSheet.cssRules.length);

// Инициализация
const consoleToast = new ConsoleToast();
console.log({object: window});