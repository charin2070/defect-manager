class UploadView extends View {
    constructor(container) {
        super(container);
        this.createView();
    }

    createView() {
        this.uploadContainer = this.createElement('div');
        this.uploadContainer.className = 'flex h-full w-full items-center justify-center';
        this.uploadContainer.id = 'upload-view';

        const IssueFileInput = new FileInputContainer(this.uploadContainer, {
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
