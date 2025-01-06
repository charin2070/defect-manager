// Ensure FileInputContainer is included in the HTML or globally available
class UploadView extends ViewComponent {
    constructor() {
        super();
        this.render();
    }

    render() {
    
        this.card = this.createElement('div', {
            className: 'w-full max-w-2xl bg-white rounded-lg shadow-lg p-8'
        });

        this.container.appendChild(this.card);
        this.setContainerId('upload-container');

        // Create title
        this.title = this.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900 mb-6 text-center'
        });
        this.title.textContent = 'Загрузите данные из Jira';
        this.card.appendChild(this.title);

        // Create file input container
        this.fileInput = new FileInputContainer(this.card, {
            type: 'dropzone',
            accept: '.csv,.xlsx',
            multiple: false,
            helperText: 'Supported formats: Excel and CSV',
            containerId: 'file-input'
        });

        this.card.appendChild(this.fileInput.getContainer());
        this.container.appendChild(this.card);
    }

    getContainer() {
        return this.container;
    }
}
