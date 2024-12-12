class ToastComponent {
    constructor() {
        this.container = this.createContainer();
        document.body.appendChild(this.container);
    }

    createContainer() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            pointer-events: none;
        `;
        container.id = 'toast-container';
        return container;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            transform: translateY(150%) scale(0.7);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            border-radius: 1rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 300px;
            pointer-events: auto;
            ${this.getTypeStyles(type)}
        `;

        // Icon with bounce animation
        const icon = document.createElement('div');
        icon.style.cssText = `
            flex-shrink: 0;
            animation: iconBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both;
        `;
        const style = document.createElement('style');
        style.textContent = `
            @keyframes iconBounce {
                0% { transform: scale(0); }
                70% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        icon.innerHTML = this.getIcon(type);
        toast.appendChild(icon);

        // Message with fade animation
        const messageEl = document.createElement('p');
        messageEl.style.cssText = `
            font-size: 0.975rem;
            font-weight: 500;
            color: white;
            margin: 0;
            opacity: 0;
            transform: translateY(10px);
            animation: messageSlide 0.3s ease-out 0.2s forwards;
        `;
        const messageStyle = document.createElement('style');
        messageStyle.textContent = `
            @keyframes messageSlide {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(messageStyle);
        messageEl.textContent = message;
        toast.appendChild(messageEl);

        // Close button with hover effect
        const closeButton = document.createElement('button');
        closeButton.style.cssText = `
            margin-left: auto;
            flex-shrink: 0;
            color: white;
            transition: all 0.2s;
            opacity: 0.8;
            transform: scale(1);
            background: none;
            border: none;
            padding: 0.25rem;
            cursor: pointer;
            pointer-events: auto;
        `;
        closeButton.innerHTML = `
            <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        closeButton.onmouseover = () => {
            closeButton.style.transform = 'scale(1.2) rotate(90deg)';
            closeButton.style.opacity = '1';
        };
        closeButton.onmouseout = () => {
            closeButton.style.transform = 'scale(1) rotate(0deg)';
            closeButton.style.opacity = '0.8';
        };
        closeButton.onclick = () => this.removeToast(toast);
        toast.appendChild(closeButton);

        return toast;
    }

    getTypeStyles(type) {
        const styles = {
            success: `
                background-color: #10B981;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            `,
            error: `
                background-color: #EF4444;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
            `,
            warning: `
                background-color: #F59E0B;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
            `,
            info: `
                background-color: #3B82F6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            `
        };
        return styles[type] || styles.info;
    }

    getIcon(type) {
        const icons = {
            success: `
                <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            `,
            error: `
                <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            `,
            warning: `
                <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            `,
            info: `
                <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            `
        };
        return icons[type] || icons.info;
    }

    show(message, type = 'info', duration = 3000) {
        console.log('ToastComponent.show:', { message, type, duration });
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);

        // Force reflow to ensure animation works
        toast.offsetHeight;

        // Pop up animation
        toast.style.transform = 'translateY(0) scale(1)';
        toast.style.opacity = '1';

        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        toast.style.transform = 'translateY(150%) scale(0.7)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (this.container.contains(toast)) {
                this.container.removeChild(toast);
            }
        }, 500);
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}