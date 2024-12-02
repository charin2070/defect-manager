class FileInputComponent extends EventEmitter {
    constructor(elementId, onFileSelected, selectExtension = '*.*', ) {
        super();
        
        this.selectExtension = selectExtension;
        this.file = null;
        this.onFileSelected = onFileSelected;

        // Find existing element or create new one
        this.container = document.getElementById(elementId);
        if (!this.container) {
            return;
        }

        // Create file input element
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'file';
        this.inputElement.id = elementId + '-input';
        this.inputElement.accept = '.csv';
        this.inputElement.style.display = 'none';
        document.body.appendChild(this.inputElement);

        // Add click handler to container
        const handleClick = (e) => {
            if (e.target === this.inputElement) {
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
            const file = event.target.files[0];
            if (file) {
                if (typeof this.onFileSelected === 'function') {
                    this.onFileSelected(file);
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
                if (typeof this.onFileSelected === 'function') {
                    this.onFileSelected(file);
                }
            }
        });
    }

    click() {
        if (this.inputElement) {
            this.inputElement.click();
        }
    }

    openFileDialog() {
        this.click();
    }
}
