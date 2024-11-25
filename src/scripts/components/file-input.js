class FileInputComponent extends EventEmitter {
    constructor(elementId, onFileSelected, selectExtension = '*.*', ) {
        super();
        console.log('FileInput: constructor called for', elementId);
        
        this.selectExtension = selectExtension;
        this.file = null;
        this.onFileSelected = onFileSelected;

        // Find existing element or create new one
        this.container = document.getElementById(elementId);
        if (!this.container) {
            console.error('FileInput: Container element not found:', elementId);
            return;
        }
        console.log('FileInput: container found', this.container);

        // Create file input element
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'file';
        this.inputElement.id = elementId + '-input';
        this.inputElement.accept = '.csv';
        this.inputElement.style.display = 'none';
        document.body.appendChild(this.inputElement);
        console.log('FileInput: input element created', this.inputElement);

        // Add click handler to container
        const handleClick = (e) => {
            console.log('FileInput: clicked on', e.target.tagName, e.currentTarget.id);
            if (e.target === this.inputElement) {
                console.log('FileInput: input element clicked directly');
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            this.click();
        };

        // Добавляем обработчик на контейнер
        this.container.addEventListener('click', handleClick);
        
        // Add change handler to input
        this.inputElement.addEventListener('change', (event) => {
            console.log('FileInput: change event triggered');
            const file = event.target.files[0];
            if (file) {
                console.log('FileInput: file selected', file.name);
                if (typeof this.onFileSelected === 'function') {
                    this.onFileSelected(file);
                } else {
                    console.error('FileInput: onFileSelected is not a function', typeof this.onFileSelected);
                }
            }
        });

        // Add drag and drop handlers
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
            
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.csv')) {
                console.log('FileInput: file dropped', file.name);
                if (typeof this.onFileSelected === 'function') {
                    this.onFileSelected(file);
                } else {
                    console.error('FileInput: onFileSelected is not a function', typeof this.onFileSelected);
                }
            }
        });

        console.log('FileInput: initialization complete');
    }

    click() {
        console.log('FileInput: click() called');
        if (this.inputElement) {
            console.log('FileInput: triggering input click');
            this.inputElement.click();
        } else {
            console.error('FileInput: input element not found');
        }
    }

    openFileDialog() {
        this.click();
    }
}
