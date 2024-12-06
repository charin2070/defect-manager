class FileInputContainer {
    constructor(container) {
        this.parentContainer = container;
        this.refact = Refact.getInstance(container);
        this.state = {
            uploadedFile: null,
            supportedFormats: ['CSV']
        };
        this.refact.setState(this.state);

        this.createView();
        this.setupReactivity();
        this.setupFileInput();
        
        this.parentContainer.appendChild(this.container);
    }

    createView() {
        this.container = document.createElement('div');
        this.container.className = 'file-input-container';

        this.title = document.createElement('h2');
        this.title.className = 'file-input-title';
        this.title.textContent = 'Загрузите данные из Jira';

        this.dragDropText = document.createElement('p');
         this.dragDropText.className = 'file-input-drag-text';
        this.dragDropText.textContent = 'Перетащите файл или нажмите';

        this.uploadButton = document.createElement('button');
        this.uploadButton.className = 'file-input-upload-button';
        this.uploadButton.textContent = 'Выбрать файл';
        this.uploadButton.type = 'button';

        this.hint = document.createElement('p');
        this.hint.className = 'file-input-hint';
        this.hint.textContent = 'Excel или CSV';

        this.inputElement = document.createElement('input');
        this.inputElement.type = 'file';
        this.inputElement.accept = '.csv';
        this.inputElement.style.display = 'none';

        this.container.appendChild(this.title);
        this.container.appendChild(this.dragDropText);
        this.container.appendChild(this.uploadButton);
        this.container.appendChild(this.hint);
        this.container.appendChild(this.inputElement);
    }

    setupFileInput() {
        this.uploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Reset input value before opening file dialog
            this.inputElement.value = '';
            this.inputElement.click();
        });

        this.inputElement.addEventListener('change', (event) => {
            if (event.target.files && event.target.files.length > 0) {
                const file = event.target.files[0];
                console.log('File selected:', file.name); 
                this.refact.setState({ uploadedFile: file });
            }
        });

        // Handle drag and drop
        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.add('dragover');
        });

        this.container.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.remove('dragover');
        });

        this.container.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.remove('dragover');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                console.log('File dropped:', file.name);
                this.refact.setState({ uploadedFile: file });
            }
        });
    }

    setupReactivity() {
        this.refact.subscribe('uploadedFile', (file) => {
            console.log('File updated:', file);
        });
    }

    getContainer() {
        return this.container;
    }
}
