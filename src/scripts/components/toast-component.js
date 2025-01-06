class ToastComponent extends HtmlComponent {
    constructor() {
        super();
        this.container = this.createContainer();
        document.body.appendChild(this.container);
        this.addGlobalStyles();
    }

    addGlobalStyles() {
        const style = document.createElement('style');
        document.head.appendChild(style);
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toast-container';
        return container;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-enter';
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            min-width: 320px;
            max-width: 480px;
            pointer-events: auto;
            ${this.getTypeStyles(type)}
        `;

        const icon = document.createElement('div');
        icon.className = 'toast-icon';
        icon.style.animation = 'iconBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both';
        icon.innerHTML = this.getIcon(type);
        toast.appendChild(icon);

        const messageEl = document.createElement('p');
        messageEl.style.cssText = `
            font-size: 14px;
            line-height: 1.5;
            font-weight: 500;
            color: white;
            margin: 0;
            flex-grow: 1;
            animation: messageSlide 0.3s ease-out 0.2s forwards;
        `;
        messageEl.textContent = message;
        toast.appendChild(messageEl);

        const closeButton = document.createElement('button');
        closeButton.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.2s ease;
            color: white;
            opacity: 0.8;
        `;
        closeButton.innerHTML = `
            <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        closeButton.onmouseover = () => {
            closeButton.style.transform = 'scale(1.1)';
            closeButton.style.opacity = '1';
            closeButton.style.background = 'rgba(255, 255, 255, 0.3)';
        };
        closeButton.onmouseout = () => {
            closeButton.style.transform = 'scale(1)';
            closeButton.style.opacity = '0.8';
            closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        };
        // closeButton.onclick = () => this.removeToast(toast);
        // toast.appendChild(closeButton);


        toast.onclick = () => {
            // Copy toast messages to clipboard
            navigator.clipboard.writeText(message);
            
            // Set clicked toast message to "Скопировано"
            if (toast.parentElement === this.container) {
                toast.querySelector('p').textContent = 'Скопировано';
                this.removeToast(toast);
            }
        };

        return toast;
    }

    setMessage(message) {
        this.container.appendChild(this.createToast(message));
    }

    getTypeStyles(type) {
        const styles = {
            success: `
                background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
                box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
            `,
            error: `
                background: linear-gradient(135deg, #F87171 0%, #EF4444 100%);
                box-shadow: 0 8px 24px rgba(239, 68, 68, 0.25);
            `,
            warning: `
                background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
                box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
            `,
            info: `
                background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
                box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
            `
        };
        return styles[type] || styles.info;
    }

    getIcon(type) {
        const icons = {
            success: `
                <svg style="width: 16px; height: 16px;" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
            `,
            error: `
                <svg style="width: 16px; height: 16px;" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            `,
            warning: `
                <svg style="width: 16px; height: 16px;" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            `,
            info: `
                <svg style="width: 16px; height: 16px;" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            `
        };
        return icons[type] || icons.info;
    }

    show(message, type = 'info', duration = 5000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        
        // Store the timeout ID on the toast element
        toast.timeoutId = setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

        /**
         * Removes a toast element from the container with an exit animation.
         * Clears any associated timeout to prevent automatic removal.
         * Ensures the toast is still present in the container before removing.
         * 
         * @param {HTMLElement} toast - The toast element to be removed.
         */
    removeToast(toast) {
        // Clear any existing timeout
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
            toast.timeoutId = null;
        }

        // Only proceed if toast is still in container
        if (toast.parentElement === this.container) {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-exit');
            setTimeout(() => {
                if (this.container && toast.parentElement === this.container) {
                    this.container.removeChild(toast);
                }
            }, 500);
        }
    }
}