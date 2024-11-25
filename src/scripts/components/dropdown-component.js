class DropdownComponent {
    constructor(containerId, buttonText = '') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            return;
        }
        
        this.dropdownMenu = null;
        this.button = this.container.querySelector('button');
        this.isOpen = false;
        this.initialize(buttonText);
    }

    initialize(buttonText) {
        // Если кнопка уже существует, просто обновляем её текст
        if (!this.button) {
            // Создаем кнопку дропдауна
            this.button = document.createElement('button');
            this.button.className = 'btn btn-secondary dropdown-toggle';
            this.button.textContent = buttonText;
            this.container.appendChild(this.button);
        } else if (buttonText) {
            this.button.textContent = buttonText;
        }
        
        // Создаем меню дропдауна, если его ещё нет
        this.dropdownMenu = this.container.querySelector('.dropdown-menu');
        if (!this.dropdownMenu) {
            this.dropdownMenu = document.createElement('div');
            this.dropdownMenu.className = 'dropdown-menu';
            this.container.appendChild(this.dropdownMenu);
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработка наведения мыши
        this.container.addEventListener('mouseenter', () => this.open());
        this.container.addEventListener('mouseleave', () => this.close());
    }

    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.dropdownMenu.classList.add('show');
            this.onOpen();
        }
    }

    close() {
        if (this.isOpen) {
            this.isOpen = false;
            this.dropdownMenu.classList.remove('show');
            this.onClose();
        }
    }

    // Методы для переопределения в наследниках
    onOpen() {}
    onClose() {}

    setButtonText(text) {
        if (this.button) {
            this.button.textContent = text;
        }
    }

    clearMenu() {
        if (this.dropdownMenu) {
            this.dropdownMenu.innerHTML = '';
        }
    }

    createMenuItem(text, onClick) {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = text;
        if (onClick) {
            item.addEventListener('click', onClick);
        }
        return item;
    }

    createSubmenu() {
        const submenu = document.createElement('div');
        submenu.className = 'dropdown-submenu';
        return submenu;
    }

    addDivider() {
        const divider = document.createElement('div');
        divider.className = 'dropdown-divider';
        this.dropdownMenu.appendChild(divider);
    }
}
