class FileInputContainer {
    constructor(container, options = {}) {
        this.container = container;
        container.classList.add('flex', 'items-center', 'justify-center', 'w-full', 'h-full');
        this.options = {
            type: options.type || 'default',
            accept: options.accept || '*',
            multiple: options.multiple || false,
            containerId: options.containerId || 'file-input-container',
            helperText: options.helperText || 'Поддерживаются форматы Excel и CSV'
        };
        
        this.refact = new Refact();
        this.refact.setState({ uploadedFile: null });
        
        this.createFileInput();
        this.setupReactivity();
    }

    createFileInput() {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative flex items-center justify-center';
        wrapper.id = this.options.containerId;
        
        // Hidden file input
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'file';
        this.inputElement.accept = this.options.accept;
        this.inputElement.multiple = this.options.multiple;
        this.inputElement.className = 'sr-only';
        this.inputElement.id = `${this.options.containerId}-input`;
        
        if (this.options.type === 'dropzone') {
            const dropZone = this.createDropZone();
            wrapper.appendChild(dropZone);
        } else {
            const defaultInput = this.createDefaultInput();
            wrapper.appendChild(defaultInput);
        }
        
        wrapper.appendChild(this.inputElement);
        this.container.appendChild(wrapper);
        
        this.setupFileInput();
    }
    
    createDropZone() {
        const dropZone = document.createElement('label');
        dropZone.htmlFor = this.inputElement.id;
        dropZone.className = 'relative flex flex-col items-center justify-center w-[600px] h-[300px] transition-all duration-300 ease-in-out border border-gray-200 rounded-2xl cursor-pointer bg-white hover:bg-gray-50 hover:border-blue-400 group';
        dropZone.id = `${this.options.containerId}-dropzone`;

        const iconContainer = document.createElement('div');
        iconContainer.className = 'flex flex-col items-center justify-center p-6';
        iconContainer.id = `${this.options.containerId}-icon-container`;

        // Main icon container
        const mainIconWrapper = document.createElement('div');
        mainIconWrapper.className = 'relative mb-6';
        mainIconWrapper.id = `${this.options.containerId}-main-icon-wrapper`;

        // Main upload icon
        const uploadIcon = document.createElement('svg');
        uploadIcon.className = 'w-16 h-16 text-gray-300 transition-colors duration-300 group-hover:text-blue-500';
        uploadIcon.id = `${this.options.containerId}-icon`;
        uploadIcon.setAttribute('viewBox', '0 0 24 24');
        uploadIcon.setAttribute('fill', 'none');
        uploadIcon.innerHTML = `
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
            <path d="M17 13H13V17C13 17.55 12.55 18 12 18C11.45 18 11 17.55 11 17V13H7C6.45 13 6 12.55 6 12C6 11.45 6.45 11 7 11H11V7C11 6.45 11.45 6 12 6C12.55 6 13 6.45 13 7V11H17C17.55 11 18 11.45 18 12C18 12.55 17.55 13 17 13Z" fill="currentColor"/>
        `;

        // Additional file icons for decoration
        const fileIcon1 = document.createElement('div');
        fileIcon1.className = 'absolute -top-4 -right-4 transform rotate-12';
        fileIcon1.innerHTML = `
            <svg class="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor" fill-opacity="0.2"/>
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        `;

        const fileIcon2 = document.createElement('div');
        fileIcon2.className = 'absolute -bottom-3 -left-4 transform -rotate-12';
        fileIcon2.innerHTML = `
            <svg class="w-6 h-6 text-blue-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor" fill-opacity="0.2"/>
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        `;

        // Text elements
        const mainText = document.createElement('p');
        mainText.className = 'mb-2 text-lg text-gray-700 font-medium';
        mainText.innerHTML = '<span class="text-blue-500">Перетащите файлы сюда</span>';

        const subText = document.createElement('p');
        subText.className = 'mb-4 text-sm text-gray-500';
        subText.textContent = 'или нажмите для выбора';

        const helperText = document.createElement('p');
        helperText.className = 'text-xs text-gray-400';
        helperText.textContent = this.options.helperText;

        // Drag overlay with animation
        this.dragOverlay = document.createElement('div');
        this.dragOverlay.className = 'absolute inset-0 flex items-center justify-center bg-blue-50 rounded-2xl opacity-0 transition-opacity duration-300 hidden';
        this.dragOverlay.id = `${this.options.containerId}-drag-overlay`;

        const overlayContent = document.createElement('div');
        overlayContent.className = 'transform scale-95 group-hover:scale-100 transition-transform duration-300';
        
        const overlayIconContainer = document.createElement('div');
        overlayIconContainer.className = 'flex flex-col items-center';
        
        const overlayIcon = document.createElement('svg');
        overlayIcon.className = 'w-12 h-12 mb-3 text-blue-500 animate-bounce';
        overlayIcon.setAttribute('viewBox', '0 0 24 24');
        overlayIcon.setAttribute('fill', 'none');
        overlayIcon.innerHTML = `
            <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="currentColor"/>
            <path d="M4 20V18H20V20H4Z" fill="currentColor"/>
        `;

        const overlayText = document.createElement('p');
        overlayText.className = 'text-lg text-blue-500 text-center font-medium';
        overlayText.textContent = 'Отпустите файлы для загрузки';

        // Assemble all elements
        mainIconWrapper.appendChild(uploadIcon);
        mainIconWrapper.appendChild(fileIcon1);
        mainIconWrapper.appendChild(fileIcon2);

        overlayIconContainer.appendChild(overlayIcon);
        overlayIconContainer.appendChild(overlayText);
        overlayContent.appendChild(overlayIconContainer);
        this.dragOverlay.appendChild(overlayContent);

        iconContainer.appendChild(mainIconWrapper);
        iconContainer.appendChild(mainText);
        iconContainer.appendChild(subText);
        iconContainer.appendChild(helperText);

        dropZone.appendChild(iconContainer);
        dropZone.appendChild(this.dragOverlay);

        return dropZone;
    }
    
    createDefaultInput() {
        const defaultInput = document.createElement('label');
        defaultInput.htmlFor = this.inputElement.id;
        defaultInput.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
        defaultInput.id = `${this.options.containerId}-default`;
        defaultInput.textContent = 'Выберите файл';
        return defaultInput;
    }
    
    setupFileInput() {
        // File selection handler
        this.inputElement.addEventListener('change', (event) => {
            if (event.target.files && event.target.files.length > 0) {
                const file = event.target.files[0];
                this.handleFile(file);
            }
        });

        if (this.options.type === 'dropzone') {
            const dropZone = this.container.querySelector(`#${this.options.containerId}-dropzone`);
            
            // Drag and drop handlers
            dropZone.addEventListener('dragenter', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dragOverlay.classList.remove('hidden');
                this.dragOverlay.classList.add('opacity-100');
                dropZone.classList.add('border-blue-500');
            });
            
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dragOverlay.classList.add('hidden');
                this.dragOverlay.classList.remove('opacity-100');
                dropZone.classList.remove('border-blue-500');
            });
            
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dragOverlay.classList.add('hidden');
                this.dragOverlay.classList.remove('opacity-100');
                dropZone.classList.remove('border-blue-500');
                
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    this.handleFile(file);
                }
            });
        }
    }
    
    handleFile(file) {
        console.log('File selected:', file.name);
        this.refact.setState({ uploadedFile: file });
    }

    setupReactivity() {
        this.refact.subscribe('uploadedFile', (newValue) => {
            console.log('File state updated:', newValue);
        });
    }
}
