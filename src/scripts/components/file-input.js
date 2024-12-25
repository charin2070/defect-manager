// Ensure View is included in the HTML or globally available

class FileInputContainer extends View {
    constructor(container, options = {}) {
        super(container);
        this.refact = Refact.getInstance(container);
        this.options = options || FileInputContainer.options;

        this.initialize();
    }

    static options = {
            type: 'default',
            accept: '*',
            multiple: false,
            containerId: 'file-input-container',
            helperText: 'Поддерживаются форматы Excel и CSV',
    };

    initialize() {
        this.state = {
            isDragging: false,
            uploadedFile: null
        };

        this.container = this.createContainer({
            className: 'file-input-container',
            id: this.options.containerId
        });
        
        this.container.appendChild(this.createUploadIcon());
        this.container.appendChild(this.createTextContent());
        this.container.appendChild(this.createDragOverlay());
        this.container.appendChild(this.createDropZone());
        this.container.appendChild(this.createHiddenInput());

        document.body.appendChild(this.container);
        this.createWrapper();
        this.createHiddenInput();
        this.createVisualComponent();
        this.setupEventListeners();

        this.wrapper = this.createElement('div', {
            className: 'w-full h-full p-4',
            id: this.options.containerId
        });
        this.container.appendChild(this.wrapper);
    }   

     
    static createHiddenInput() {
        const inputElement = this.createElement('input', {
            type: 'file',
            accept: this.options.accept,
            multiple: this.options.multiple,
            className: 'hidden',
            id: `${this.options.containerId}-input`
        });
        this.wrapper.appendChild(inputElement);

        return inputElement;
    }

    createVisualComponent() {
        const component = this.options.type === 'dropzone' 
            ? this.createDropZone() 
            : this.createDefaultInput();
        this.wrapper.appendChild(component);

        return component;
    }

    static createElement(tag, attributes = {}) {
            const element = document.createElement(tag);
            Object.entries(attributes).forEach(([key, value]) => {
                element[key] = value;
            });
            
            return element;
        }


    static createUploadIcon() {
        const icon = this.createElement('div', {
            className: 'text-blue-500 group-hover:text-blue-600 transition-colors duration-300'
        });
        
        icon.innerHTML = `
            <svg class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path class="stroke-current" d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 16.2091 19.2091 18 17 18H7C4.79086 18 3 16.2091 3 14C3 11.7909 4.79086 10 7 10Z" stroke-linecap="round"/>
                <path class="stroke-current" d="M12 12L12 15M12 15L14 13M12 15L10 13" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        return icon;
    }

    createTextContent() {
        const container = this.createElement('div', {
            className: 'text-center space-y-2'
        });

        const title = this.createElement('p', {
            className: 'text-lg font-medium text-gray-700 group-hover:text-gray-900',
            textContent: 'Перетащите файлы сюда'
        });

        const subtitle = this.createElement('p', {
            className: 'text-sm text-gray-500 group-hover:text-gray-600',
            textContent: 'или нажмите для выбора'
        });

        const helper = this.createElement('p', {
            className: 'text-xs text-gray-400 group-hover:text-gray-500',
            textContent: this.options.helperText
        });

        container.append(title, subtitle, helper);
        return container;
    }

    createDropZone() {
        const dropZone = this.createElement('fileInputContainer', {
            htmlFor: this.inputElement.id,
            class: 'bg-white border-dashed border-2 border-sky-500 flex flex-col items-center justify-center w-full h-full p-8 rounded-lg cursor-pointer',
            id: `${this.options.containerId}-dropzone`
        });
        
        // Применяем стили напрямую
        dropZone.style.cssText = `
                display: flex;
                align-items: center;
                width: 100%;
                min-height: 300px;
                position: relative;
                border: 2px dashed #d1d5db;
                border-radius: 0.5rem;
                background-color: #f9fafb;
                cursor: pointer;
                transition: all 0.3s ease;
        `;

        // Добавляем hover эффект
        dropZone.addEventListener('mouseenter', () => {
            dropZone.style.borderColor = '#9ca3af';
        });
        
        dropZone.addEventListener('mouseleave', () => {
            dropZone.style.borderColor = '#d1d5db';
        });

        dropZone.addEventListener('click', () => {
            this.inputElement.click();
        });

        const content = this.createDropZoneContent();
        this.dragOverlay = this.createDragOverlay();

        dropZone.append(content, this.dragOverlay);
        dropZone.class = 'bg-white border-dashed border-2 border-sky-500 flex flex-col items-center justify-center w-full h-full p-8 rounded-lg cursor-pointer';
        return dropZone;
    }

    createDropZoneContent() {
        const container = this.createElement('div', {
            className: 'flex flex-col items-center justify-center w-full h-full p-8'
        });

        const icon = this.createUploadIcon();
        const textContent = this.createTextContent();
        
        container.append(icon, textContent);
        return container;
    }

    createDragOverlay() {
        const overlay = this.createElement('div', {
            className: 'absolute inset-0 bg-blue-50 bg-opacity-90 rounded-lg flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none',
            id: `${this.options.containerId}-drag-overlay`
        });

        const content = this.createElement('div', {
            className: 'text-center transform scale-95 transition-transform duration-300'
        });

        const icon = this.createElement('div', {
            className: 'text-blue-500 animate-bounce mb-4'
        });
        
        icon.innerHTML = `
            <svg class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 4v16m0-16l-4 4m4-4l4 4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        const text = this.createElement('p', {
            className: 'text-lg font-medium text-blue-700',
            textContent: 'Отпустите файлы для загрузки'
        });

        content.append(icon, text);
        overlay.appendChild(content);

        return overlay;
    }

    setupEventListeners() {
        this.setupFileInputListener();
        if (this.options.type === 'dropzone') {
            this.setupDropZoneListeners();
        }

        this.refact.subscribe('process', (value) => {
            switch (value) {
                case 'file_upload':
                    this.inputElement.click();
                    break;
            }

        });
    }

    setupFileInputListener() {
        this.inputElement.addEventListener('change', this.handleFileSelection.bind(this));
    }

    setupDropZoneListeners() {
        const dropZone = this.wrapper.querySelector(`#${this.options.containerId}-dropzone`);
        const events = {
            dragenter: this.handleDragEnter.bind(this),
            dragleave: this.handleDragLeave.bind(this),
            dragover: this.handleDragOver.bind(this),
            drop: this.handleDrop.bind(this)
        };

        Object.entries(events).forEach(([event, handler]) => {
            dropZone.addEventListener(event, handler);
        });
    }

    handleFileSelection(event) {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!this.state.isDragging) {
            this.state.isDragging = true;
            this.showDragOverlay();
        }
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const isLeaving = 
            e.clientY <= rect.top ||
            e.clientY >= rect.bottom ||
            e.clientX <= rect.left ||
            e.clientX >= rect.right;

        if (isLeaving) {
            this.state.isDragging = false;
            this.hideDragOverlay();
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.state.isDragging = false;
        this.hideDragOverlay();
        
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    showDragOverlay() {
        if (this.dragOverlay) {
            this.dragOverlay.classList.remove('opacity-0', 'pointer-events-none');
            this.dragOverlay.classList.add('opacity-100');
        }
    }

    hideDragOverlay() {
        if (this.dragOverlay) {
            this.dragOverlay.classList.remove('opacity-100');
            this.dragOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
    }

    handleFile(file) {
        if (file.size > this.options.maxSize) {
            console.error('File size exceeds limit');
            return;
        }

        this.state.uploadedFile = file;
        this.refact.setState({ uploadedFile: file });
    }
}
