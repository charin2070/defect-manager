class UploadView extends View {
    constructor() {
        super();
        this.createView();
    }

    createView() {
        this.uploadContainer = document.createElement('div');
        this.uploadContainer.className = 'upload-container';
        this.uploadContainer.id = 'upload-data-view';
        
        // Создаем FileInput
        this.fileInput = new FileInputContainer(this.uploadContainer);
    }

    getContainer() {
        return this.uploadContainer;
    }
}
