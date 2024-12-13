class ToastComponent {
    constructor() {
        this.container = this.createContainer();
        document.body.appendChild(this.container);
        this.addGlobalStyles();
    }

    addGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastSlideIn {
                0% { transform: translateY(150%) scale(0.7); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes toastSlideOut {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(150%) scale(0.7); opacity: 0; }
            }
            @keyframes iconBounce {
                0% { transform: scale(0); }
                70% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            @keyframes messageSlide {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .toast-enter {
                animation: toastSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
            }
            .toast-exit {
                animation: toastSlideOut 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
            }
            .toast {
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .toast-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
    }

    createContainer() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
            max-width: 90vw;
            width: max-content;
        `;
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
        closeButton.onclick = () => this.removeToast(toast);
        toast.appendChild(closeButton);

        return toast;
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

    show(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-exit');
            setTimeout(() => {
                this.container.removeChild(toast);
            }, 500);
        }, duration);
    }

    removeToast(toast) {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => {
            if (toast.parentElement === this.container) {
                this.container.removeChild(toast);
            }
        }, 500);
    }
}