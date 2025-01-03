// Ensure FileInputContainer is included in the HTML or globally available
class UploadView extends ViewComponent {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.createView();
    }

    createView() {
        this.container = this.createElement('div', {
            className: 'flex h-full w-full items-center justify-center p-8',
            id: 'upload-view'
        });

        // Create upload card
        const card = this.createElement('div', {
            className: 'w-full max-w-2xl bg-white rounded-lg shadow-lg p-8'
        });

        // Create title
        const title = this.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900 mb-6 text-center'
        });
        title.textContent = 'Upload Data File';
        card.appendChild(title);

        // Create file input container
        this.fileInput = new FileInputContainer(card, {
            type: 'dropzone',
            accept: '.csv,.xlsx',
            multiple: false,
            helperText: 'Supported formats: Excel and CSV',
            containerId: 'file-input'
        });

        this.container.appendChild(card);
    }

    getContainer() {
        return this.container;
    }
}
