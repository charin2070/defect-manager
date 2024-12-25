// Ensure FileInputContainer is included in the HTML or globally available
class UploadView extends View {
    constructor() {
        super();
        this.createView();
    }

    createView() {
        this.uploadContainer = document.createElement('div');
        this.uploadContainer.className = 'flex h-full w-full items-center justify-center';
        this.uploadContainer.id = 'upload-view';

        new FileInputContainer(this.uploadContainer, {
            type: 'dropzone',
            accept: '.csv,.xlsx',
            multiple: false,
            helperText: 'Поддерживаются форматы Excel и CSV',
            containerId: 'file-input'
        });

    }

    getContainer() {
        return this.uploadContainer;
    }
}
