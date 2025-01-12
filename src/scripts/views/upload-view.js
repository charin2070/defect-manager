// Ensure FileInputContainer is included in the HTML or globally available
class UploadView extends ViewComponent {
    constructor() {
        super();
        this.container = this.createElement('div');
        this.container.id = 'upload-view-container';
        this.container.className = 'view-container';
        this.render();
    }

    render() {
        // Clear any existing content
        this.container.innerHTML = '';
        
        this.card = this.createElement('div', {
            className: 'w-full max-w-2xl bg-white rounded-lg shadow-lg p-8'
        });

        // Create file input container
        this.fileInput = new FileInputComponent(this.card);

        // Add card to container
        this.container.appendChild(this.card);
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }

    showDataFilePicker() {
        this.fileInput.showFilePicker();
    }

    getContainer() {
        return this.container;
    }
}
