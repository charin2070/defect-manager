class FileInputContainer extends ViewComponent {
    static options = {
        type: 'default',
        accept: '*',
        multiple: false,
        containerId: 'file-input-container',
        helperText: 'Supported formats: Excel and CSV',
    };

    constructor(container, options = {}) {
        super();
        this.refact = Refact.getInstance();
        this.options = { ...FileInputContainer.options, ...options };
        this.parentContainer = container;
        this.state = {
            isDragging: false,
            uploadedFile: null
        };
        
        // Create main container
        this.container = this.createElement('div');
        
        // Set container ID from options
        if (this.options.containerId) {
            this.container.id = this.options.containerId;
        }
        
        // Add base classes
        this.container.className = 'w-full h-64 relative';
        
        // Create and append input
        this.inputElement = this.createHiddenInput();
        this.container.appendChild(this.inputElement);
        
        // Initialize the rest of the UI
        this.initializeUI();
    }

    initializeUI() {
        // Create dropzone
        this.dropzone = this.createElement('div', {
            className: 'absolute inset-0 flex flex-col items-center justify-center p-5 text-center transition-colors duration-200 ease-in-out border-2 border-dashed border-gray-400 rounded-lg hover:border-gray-500'
        });

        // Add event listeners for drag and drop
        this.setupDragAndDrop();
        
        // Create icon
        const icon = this.createElement('div', {
            className: 'mb-4'
        });
        icon.innerHTML = `<svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>`;
        this.dropzone.appendChild(icon);

        // Create text
        const text = this.createElement('p', {
            className: 'mb-2 text-sm text-gray-600'
        });
        text.innerHTML = '<span class="font-semibold">Click to upload</span> or drag and drop';
        this.dropzone.appendChild(text);

        // Create helper text
        const helperText = this.createElement('p', {
            className: 'text-xs text-gray-500'
        });
        helperText.textContent = this.options.helperText;
        this.dropzone.appendChild(helperText);

        this.container.appendChild(this.dropzone);
        
        if (this.parentContainer) {
            this.parentContainer.appendChild(this.container);
        }
    }

    getClassNames() {
        const baseClasses = 'w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 transition-colors duration-200 ease-in-out';
        if (this.state.isDragging) {
            return `${baseClasses} border-blue-500 bg-blue-50`;
        } else {
            return `${baseClasses} border-gray-300 hover:border-gray-400`;
        }
    }

    createHiddenInput() {
        const input = this.createElement('input', {
            type: 'file',
            className: 'hidden',
            accept: this.options.accept,
            multiple: this.options.multiple
        });

        input.addEventListener('change', (e) => this.handleFileSelect(e));
        return input;
    }

    setupDragAndDrop() {
        const preventDefault = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        this.dropzone.addEventListener('dragenter', (e) => {
            preventDefault(e);
            this.state.isDragging = true;
            this.render();
        });

        this.dropzone.addEventListener('dragover', preventDefault);

        this.dropzone.addEventListener('dragleave', (e) => {
            preventDefault(e);
            this.state.isDragging = false;
            this.render();
        });

        this.dropzone.addEventListener('drop', (e) => {
            preventDefault(e);
            this.state.isDragging = false;
            this.handleFileSelect(e);
        });
    }

    handleFileSelect(e) {
        const files = e.dataTransfer?.files || e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        this.state.uploadedFile = file;
        this.refact.setState({ 
            uploadedFile: file,
            dataSource: 'file'
        }, 'FileInputContainer.handleFileSelect');
    }

    getContainer() {
        return this.container;
    }
}
