class ConsoleToast {
    constructor() {
        this.themes = this.initializeThemes();
        this.currentTheme = this.loadThemeFromLocalStorage();
        this.setupContainer();
        this.errorToast = this.createToast('error');
        this.logToast = this.createToast('log');
        this.toastContainer.append(this.errorToast, this.logToast);
        this.overrideConsoleMethods();
        this.setupGlobalErrorHandlers();
    }

    initializeThemes() {
        return {
            dracula: { background: '#282a36', text: '#f8f8f2', key: '#bd93f9', string: '#f1fa8c', number: '#bd93f9', error: '#ff5555', accent: '#ff79c6', toggle: '#50fa7b', toggleActive: '#8be9fd', border: '#44475a' },
            github: { background: '#0d1117', text: '#c9d1d9', key: '#58a6ff', string: '#a5d6ff', number: '#79c0ff', error: '#f85149', accent: '#bc8cff', toggle: '#7ee787', toggleActive: '#58a6ff', border: '#30363d' },
            monokai: { background: '#272822', text: '#f8f8f2', key: '#66d9ef', string: '#e6db74', number: '#ae81ff', error: '#f92672', accent: '#a6e22e', toggle: '#a6e22e', toggleActive: '#66d9ef', border: '#49483e' }
        };
    }

    loadThemeFromLocalStorage() {
        const savedSettings = JSON.parse(localStorage.getItem('consoleToast') || '{}');
        return this.themes[savedSettings.theme] || this.themes.dracula;
    }

    createToast(type) {
        const toast = document.createElement('div');
        toast.classList.add('console-toast');
        Object.assign(toast.style, {
            padding: '15px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', fontFamily: 'Roboto, sans-serif', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', maxWidth: '600px', maxHeight: '400px', wordBreak: 'break-word', overflow: 'auto', marginBottom: '10px'
        });
        const content = document.createElement('div');
        content.classList.add('toast-content');
        toast.appendChild(content);
        this.applyTheme(toast);
        return toast;
    }

    overrideConsoleMethods() {
        const originalMethods = { error: console.error, log: console.log, info: console.info };
        console.error = (...args) => {
            this.addErrorMessage({ message: args.join(' '), file: '', line: '' });
            originalMethods.error.apply(console, args);
        };
        console.log = (...args) => {
            const message = args.length === 1 && typeof args[0] === 'object' ? args[0] : args.join(' ');
            this.addLogMessage(message);
            originalMethods.log.apply(console, args);
        };
        console.info = (...args) => {
            this.addLogMessage(args.join(' '));
            originalMethods.info.apply(console, args);
        };
    }

    setupGlobalErrorHandlers() {
        window.addEventListener('error', async (event) => {
            const errorDetails = await this.formatError(event.message, event.error?.stack);
            this.addErrorMessage(errorDetails);
        });
        window.addEventListener('unhandledrejection', async (event) => {
            const errorDetails = await this.formatError(event.reason, event.reason?.stack);
            this.addErrorMessage(errorDetails);
        });
    }

    async formatError(error, stack) {
        const solutions = this.getPossibleSolutions(error);
        const { file, line } = stack ? this.extractFileAndLine(stack) : { file: 'Unknown', line: 'Unknown' };
        const codeSnippet = stack ? await this.getCodeSnippetFromStack(stack) : null;
        return { message: error, file, line, codeSnippet, solutions };
    }

    extractFileAndLine(stack) {
        if (!stack) return { file: 'Unknown', line: 'Unknown' };
        const match = stack.match(/\((.*):(\d+):(\d+)\)/) || stack.match(/at (.*):(\d+):(\d+)/);
        if (!match) return { file: 'Unknown', line: 'Unknown' };
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
        if (error.includes('undefined')) solutions.push('Ensure the variable is defined.');
        if (error.includes('TypeError')) solutions.push('Check the type of the object or method.');
        return solutions;
    }

    addErrorMessage(errorDetails) {
        const content = this.errorToast.querySelector('.toast-content');
        const errorElement = this.createErrorElement(errorDetails);
        content.appendChild(errorElement);
        this.errorToast.style.display = content.children.length > 0 ? 'block' : 'none';
    }

    createErrorElement(errorDetails) {
        const errorElement = document.createElement('div');
        errorElement.style.marginBottom = '15px';
        errorElement.style.borderBottom = `1px solid ${this.currentTheme.border}`;
        errorElement.style.paddingBottom = '15px';
        const [prefix, ...rest] = errorDetails.message.split(':');
        const errorMessage = rest.join(':').trim();
        errorElement.innerHTML = `
            <div style="font-weight: bold; color: ${this.currentTheme.error}; display: flex; align-items: center; gap: 8px; cursor: pointer;" onclick="navigator.clipboard.writeText(this.parentElement.getAttribute('data-error-info'))">
                <img src="src/img/danger-square.svg" style="width: 20px; height: 20px;">
                ${rest.length ? errorMessage : errorDetails.message}
            </div>
            ${rest.length ? `<div style="font-size: 0.8em; color: ${this.currentTheme.text}; margin-bottom: 8px">${prefix}</div>` : ''}
            <div style="font-size: 0.9em; color: ${this.currentTheme.text}">
                <div><span style="color: ${this.currentTheme.key}">File:</span> ${errorDetails.file}</div>
                <div><span style="color: ${this.currentTheme.key}">Line:</span> ${errorDetails.line}</div>
            </div>
        `;
        const fullErrorInfo = `Error: ${errorDetails.message}\nFile: ${errorDetails.file}\nLine: ${errorDetails.line}${errorDetails.codeSnippet ? '\nCode:\n' + errorDetails.codeSnippet : ''}`;
        errorElement.setAttribute('data-error-info', fullErrorInfo);
        if (errorDetails.codeSnippet) {
            const codeContainer = this.createCodeSnippetElement(errorDetails.codeSnippet);
            errorElement.appendChild(codeContainer);
        }
        return errorElement;
    }

    createCodeSnippetElement(codeSnippet) {
        const codeContainer = document.createElement('div');
        codeContainer.style.marginTop = '10px';
        const codeHeader = document.createElement('div');
        codeHeader.style.color = this.currentTheme.key;
        codeHeader.style.marginBottom = '5px';
        codeHeader.textContent = 'Code: ';
        const codeContent = document.createElement('pre');
        Object.assign(codeContent.style, {
            margin: '0', padding: '10px', background: this.currentTheme.background + '80', border: `1px solid ${this.currentTheme.border}`, borderRadius: '5px', fontSize: '0.9em', overflow: 'auto', maxHeight: '200px', whiteSpace: 'pre-wrap'
        });
        const codeElement = document.createElement('code');
        codeElement.className = 'language-javascript';
        codeElement.textContent = codeSnippet;
        codeContent.appendChild(codeElement);
        Prism.highlightElement(codeElement);
        codeContainer.appendChild(codeHeader);
        codeContainer.appendChild(codeContent);
        return codeContainer;
    }

    addLogMessage(message) {
        const content = this.logToast.querySelector('.toast-content');
        const logElement = document.createElement('div');
        logElement.style.marginBottom = '10px';
        logElement.style.borderBottom = `1px solid ${this.currentTheme.border}`;
        logElement.style.paddingBottom = '10px';
        logElement.textContent = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
        content.appendChild(logElement);
        this.logToast.style.display = content.children.length > 0 ? 'block' : 'none';
    }

    applyTheme(element) {
        Object.assign(element.style, {
            backgroundColor: this.currentTheme.background,
            color: this.currentTheme.text
        });
    }

    setupContainer() {
        this.toastContainer = document.createElement('div');
        Object.assign(this.toastContainer.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        });
        document.body.appendChild(this.toastContainer);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes toast-slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeInSlideUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOutSlideDown {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(20px); }
}`;
document.head.appendChild(style);

// Initialize ConsoleToast
const consoleToast = new ConsoleToast();
