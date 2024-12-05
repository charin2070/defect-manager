class MessageView extends ViewComponent {
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
        
        // Create title
        const titleElement = document.createElement('h2');
        titleElement.className = 'message-title';
        titleElement.textContent = title;
        
        // Create message
        const messageElement = document.createElement('p');
        messageElement.className = 'message-text';
        messageElement.textContent = message;
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'message-buttons';
        
        // Create action button
        const actionButton = document.createElement('button');
        actionButton.className = 'btn btn-primary';
        actionButton.textContent = callbackText;
        actionButton.onclick = () => {
            callbackAction();
            this.hideMessage();
        };
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary';
        closeButton.textContent = 'Закрыть';
        closeButton.onclick = () => this.hideMessage();
        
        // Assemble the modal
        buttonsContainer.appendChild(actionButton);
        buttonsContainer.appendChild(closeButton);
        
        this.modalContent.appendChild(titleElement);
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
