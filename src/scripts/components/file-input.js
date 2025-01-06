class FileInputContainer extends ViewComponent {
    constructor(container, options = {}) {
        super();
        this.refact = Refact.getInstance();
        this.options = { ...FileInputContainer.options, ...options };
        this.parentContainer = container;
        this.state = {
            isDragging: false,
            uploadedFile: null
        };
        this.render();
    }

    static options = {
        type: 'default',
        accept: '*',
        multiple: false,
        containerId: 'file-input-container',
        helperText: 'Supported formats: Excel and CSV',
    };

    render() {
        // Create main container
        this.container = this.createElement('div', {
            className: 'w-full h-64 relative',
            id: this.options.containerId
        });

        // Create hidden input
        this.inputElement = this.createHiddenInput();
        this.container.appendChild(this.inputElement);

        // Create dropzone
        const dropzone = this.createElement('div', {
            className: this.getClassNames()
        });

        // Create upload icon
        const icon = this.createElement('div', {
            className: 'text-4xl mb-4 text-gray-400'
        });
        icon.innerHTML = '📁';
        dropzone.appendChild(icon);

        // Create text content
        const textContent = this.createElement('div', {
            className: 'text-center'
        });
        
        const title = this.createElement('p', {
            className: 'text-lg font-medium text-gray-900 mb-1'
        });
        title.innerHTML = 'Drop your file here or <span class="text-blue-500 hover:text-blue-600 cursor-pointer">browse</span>';
        
        const helperText = this.createElement('p', {
            className: 'text-sm text-gray-500'
        });
        helperText.textContent = this.options.helperText;

        textContent.appendChild(title);
        textContent.appendChild(helperText);
        dropzone.appendChild(textContent);

        // Add click handler to browse text
        const browseText = title.querySelector('span');
        browseText.addEventListener('click', () => this.inputElement.click());

        this.container.appendChild(dropzone);

        // Setup drag and drop events
        this.setupDragAndDrop(dropzone);

        // Append to parent container
        this.parentContainer.appendChild(this.container);

        this.state = Refact.getInstance();
        this.state.subscribe('process', (value) => {
            if (value === 'show_open_data_file_dialog') {
                this.inputElement.click();
            }
        });

        return this.container;
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

    setupDragAndDrop(dropzone) {
        const preventDefault = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        dropzone.addEventListener('dragenter', (e) => {
            preventDefault(e);
            this.state.isDragging = true;
            this.render();
        });

        dropzone.addEventListener('dragover', preventDefault);

        dropzone.addEventListener('dragleave', (e) => {
            preventDefault(e);
            this.state.isDragging = false;
            this.render();
        });

        dropzone.addEventListener('drop', (e) => {
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
