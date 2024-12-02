class UploadView {
    constructor(container) {
        this.container = container;
        this.view = null;
        this.refact = new Refact(container);
        this.refact.setState({
            selectedFile: null,
            uploadStatus: '',
            isUploading: false,
            uploadedFile: null
        });

        
        this.init();
    }

    init() {
        // Create upload container
        const uploadContainer = document.createElement('div');
        uploadContainer.className = 'upload-container';
        uploadContainer.id = 'uploadContainer';
        uploadContainer.style.display = 'none';
        this.view = uploadContainer;

        const card = document.createElement('div');
        card.className = 'card';
        uploadContainer.appendChild(card);

        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        card.appendChild(cardHeader);

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title mb-0';
        cardTitle.textContent = 'Upload File';
        cardHeader.appendChild(cardTitle);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        card.appendChild(cardBody);

        const uploadArea = document.createElement('div');
        uploadArea.className = 'upload-area';
        uploadArea.id = 'uploadArea';
        cardBody.appendChild(uploadArea);

        const uploadContent = document.createElement('div');
        uploadContent.className = 'upload-content';
        uploadArea.appendChild(uploadContent);

        const uploadIcon = document.createElement('img');
        uploadIcon.src = 'src/img/img/icons/bootstrap-icons/icons/cloud-upload.svg';
        uploadIcon.style.width = '48px';
        uploadIcon.style.height = '48px';
        uploadIcon.style.marginBottom = '15px';
        uploadContent.appendChild(uploadIcon);

        const uploadText = document.createElement('h4');
        uploadText.textContent = 'Drag and drop your file here';
        uploadContent.appendChild(uploadText);

        const uploadOrText = document.createElement('p');
        uploadOrText.textContent = 'or';
        uploadContent.appendChild(uploadOrText);

        const selectFileBtn = document.createElement('button');
        selectFileBtn.className = 'btn btn-primary';
        selectFileBtn.id = 'selectFileBtn';
        selectFileBtn.textContent = 'Select File';
        uploadContent.appendChild(selectFileBtn);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'fileInput';
        fileInput.style.display = 'none';
        uploadContent.appendChild(fileInput);

        const uploadStatus = document.createElement('div');
        uploadStatus.className = 'upload-status';
        uploadStatus.id = 'uploadStatus';
        uploadArea.appendChild(uploadStatus);

        this.container.appendChild(uploadContainer);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .upload-container {
                padding: 20px;
            }
            .upload-area {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 40px;
                text-align: center;
                background: #f8f9fa;
                transition: all 0.3s ease;
            }
            .upload-area.drag-over {
                background: #e9ecef;
                border-color: #6c757d;
            }
            .upload-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            .upload-status {
                margin-top: 20px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);

        // Bind status to state
        this.refact.subscribe('uploadStatus', (status) => {
            uploadStatus.textContent = status;
        });

        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelected(file);
            }
        });

        // Handle button click
        selectFileBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // Handle drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleFileSelected(file);
            }
        });
    }

    getContainer(){
        return this.container;
    }

    getView(){
        return this.view;
    }

    handleFileSelected(file) {
        this.refact.setState({ 
            selectedFile: file,
            uploadStatus: `Selected file: ${file.name}`
        });

        // Here you can implement the actual file upload logic
        // For example:
        this.uploadFile();
    }

    async uploadFile() {
        const file = this.refact.state.selectedFile;
        if (!file) {
            this.refact.setState({ 
                uploadStatus: 'Please select a file first.',
                isUploading: false
            });
            return;
        }

        this.refact.setState({ 
            isUploading: true,
            uploadStatus: 'Uploading file...'
        });

        try {
            this.refact.setState({ 
                isUploading: false,
                uploadStatus: 'File uploaded successfully!',
                uploadedFile: file
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            this.refact.setState({ 
                isUploading: false,
                uploadStatus: 'Error uploading file.'
            });
        }
    }
}
