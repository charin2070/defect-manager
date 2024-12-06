class MessageView extends View{
    static instance = null;
    static wrapper = null;
    static modalContent = null;

    static initialize() {
        if (!this.wrapper) {
            this.wrapper = document.createElement('div');
            this.wrapper.className = 'message-view';
            this.wrapper.style.display = 'none';
            document.body.appendChild(this.wrapper);
        }
    }

    static showMessage(title, message, callbackText, callbackAction) {
        this.initialize();

        // Create modal content
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'message-modal view-enter';
        
        // Create title container with close button
        const titleContainer = document.createElement('div');
        titleContainer.className = 'message-title-container';
        
        // Create title
        const titleElement = document.createElement('h2');
        titleElement.className = 'message-title';
        titleElement.textContent = title;
        
        // Create close icon button
        const closeIcon = document.createElement('button');
        closeIcon.className = 'message-close-icon';
        closeIcon.innerHTML = '&times;';
        closeIcon.onclick = (e) => {
            e.stopPropagation();
            this.hideMessage();
        };
        
        titleContainer.appendChild(titleElement);
        titleContainer.appendChild(closeIcon);
        
        // Create message
        const messageElement = document.createElement('p');
        messageElement.className = 'message-text';
        messageElement.textContent = message;
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'message-buttons';
        
        // Create close button first
        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary';
        closeButton.textContent = 'Закрыть';
        closeButton.onclick = (e) => {
            e.stopPropagation();
            this.hideMessage();
        };
        buttonsContainer.appendChild(closeButton);

        // Create action button if callback provided
        if (callbackText && callbackAction) {
            const actionButton = document.createElement('button');
            actionButton.className = 'btn btn-primary';
            actionButton.textContent = callbackText;
            actionButton.onclick = (e) => {
                e.stopPropagation();
                callbackAction();
                this.hideMessage();
            };
            // Insert action button before close button
            buttonsContainer.insertBefore(actionButton, closeButton);
        }
        
        // Assemble the modal
        this.modalContent.appendChild(titleContainer);
        this.modalContent.appendChild(messageElement);
        this.modalContent.appendChild(buttonsContainer);
        
        // Show the modal
        this.wrapper.innerHTML = '';
        this.wrapper.appendChild(this.modalContent);
        this.wrapper.style.display = 'flex';
        
        // Add click outside to close
        this.wrapper.onclick = (e) => {
            if (e.target === this.wrapper) {
                this.hideMessage();
            }
        };

        // Add escape key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideMessage();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    static async hideMessage() {
        if (this.modalContent) {
            this.modalContent.classList.remove('view-enter');
            this.modalContent.classList.add('view-exit');
            
            await new Promise(resolve => {
                this.modalContent.addEventListener('animationend', () => {
                    this.wrapper.style.display = 'none';
                    this.modalContent = null;
                    resolve();
                }, { once: true });
            });
        }
    }
}
