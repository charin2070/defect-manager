class MessageView extends View{
    static instance = null;
    static wrapper = null;
    static modalContent = null;

    static initialize() {
        console.log('[MessageView.initialize] Starting initialization...');
        if (!this.wrapper) {
            console.log('[MessageView.initialize] Creating wrapper element...');
            this.wrapper = document.createElement('div');
            this.wrapper.id = 'messageViewWrapper';
            this.wrapper.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-[9999]';
            this.wrapper.style.display = 'none';
            
            // Get the app container from Refact
            const refact = window.refact || Refact.getInstance();
            if (!refact || !refact.rootElement) {
                console.error('[MessageView.initialize] Could not find Refact instance or root element');
                document.body.appendChild(this.wrapper);
                return;
            }
            
            document.body.appendChild(this.wrapper); // Append to body to be above everything
            console.log('[MessageView.initialize] Wrapper created and added to document body');
        }
    }

    static showMessage(title, message, callbackText, callbackAction) {
        console.log('[MessageView.showMessage] Showing message:', { title, message });
        
        // Hide dashboard view
        const dashboardView = document.getElementById('dashboard-view');
        if (dashboardView) {
            dashboardView.style.visibility = 'hidden';
        }
        
        this.initialize();

        // Create modal content
        this.modalContent = document.createElement('div');
        this.modalContent.id = 'messageModalContent';
        this.modalContent.className = 'bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all translate-y-4 opacity-0';
        
        // Create title container with close button
        const titleContainer = document.createElement('div');
        titleContainer.id = 'messageTitleContainer';
        titleContainer.className = 'flex items-center justify-between px-6 py-4 border-b border-gray-200';
        
        // Create title
        const titleElement = document.createElement('h2');
        titleElement.id = 'messageTitle';
        titleElement.className = 'text-lg font-semibold text-gray-900';
        titleElement.textContent = title;
        
        // Create close icon button
        const closeIcon = document.createElement('button');
        closeIcon.id = 'messageCloseIcon';
        closeIcon.className = 'text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors';
        closeIcon.innerHTML = '&times;';
        closeIcon.onclick = (e) => {
            e.stopPropagation();
            this.hideMessage();
        };
        
        titleContainer.appendChild(titleElement);
        titleContainer.appendChild(closeIcon);
        
        // Create message
        const messageElement = document.createElement('p');
        messageElement.id = 'messageText';
        messageElement.className = 'px-6 py-4 text-sm text-gray-600';
        messageElement.textContent = message;
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-end space-x-3';
        
        // Create close button first
        const closeButton = document.createElement('button');
        closeButton.className = 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors';
        closeButton.textContent = 'Закрыть';
        closeButton.onclick = (e) => {
            e.stopPropagation();
            this.hideMessage();
        };
        
        // Create action button if callback provided
        if (callbackText && callbackAction) {
            const actionButton = document.createElement('button');
            actionButton.className = 'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors';
            actionButton.textContent = callbackText;
            actionButton.onclick = (e) => {
                e.stopPropagation();
                callbackAction();
                this.hideMessage();
            };
            buttonsContainer.appendChild(actionButton);
        }
        
        buttonsContainer.appendChild(closeButton);
        
        // Assemble the modal
        this.modalContent.appendChild(titleContainer);
        this.modalContent.appendChild(messageElement);
        this.modalContent.appendChild(buttonsContainer);
        
        // Show the modal with animation
        this.wrapper.innerHTML = '';
        this.wrapper.appendChild(this.modalContent);
        this.wrapper.style.display = 'flex';
        
        // Add animation classes
        setTimeout(() => {
            this.modalContent.classList.add('translate-y-0', 'opacity-100');
        }, 0);
        
        // Prevent clicks outside from closing
        this.wrapper.onclick = (e) => {
            if (e.target === this.wrapper) {
                e.stopPropagation();
            }
        };

        // Add escape key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                this.hideMessage();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    static hideMessage() {
        if (this.modalContent) {
            this.wrapper.style.display = 'none';
            this.modalContent = null;
            
            // Show dashboard view
            const dashboardView = document.getElementById('dashboard-view');
            if (dashboardView) {
                dashboardView.style.visibility = 'visible';
            }
        }
    }
}
