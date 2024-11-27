class DropdownComponent {
    constructor(containerId, buttonText = '') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            return;
        }
        
        this.initialize(buttonText);
        this.closeTimeout = null; // Для хранения id таймера
    }

    initialize(buttonText) {
        this.button = this.createButton(buttonText);
        this.dropdownMenu = this.createDropdownMenu();
        this.isOpen = false;
        this.setupEventListeners();
    }

    createButton(buttonText) {
        let button = this.container.querySelector('button');
        if (!button) {
            button = document.createElement('button');
            button.className = 'btn btn-secondary dropdown-toggle';
            this.container.appendChild(button);
        }
        button.textContent = buttonText;
        return button;
    }

    createDropdownMenu() {
        let dropdownMenu = this.container.querySelector('.dropdown-menu');
        if (!dropdownMenu) {
            dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'dropdown-menu';
            this.container.appendChild(dropdownMenu);
        }
        return dropdownMenu;
    }

    setupEventListeners() {
        this.container.addEventListener('mouseenter', () => this.open());
        this.container.addEventListener('mouseleave', () => this.scheduleClose());
        this.dropdownMenu.addEventListener('mouseenter', () => this.cancelClose());
        this.dropdownMenu.addEventListener('mouseleave', () => this.scheduleClose());
        this.button.addEventListener('click', () => this.toggle());
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
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

    // Запланировать закрытие
    scheduleClose() {
        this.closeTimeout = setTimeout(() => this.close(), 200); // Задержка 200 мс
    }

    // Отменить запланированное закрытие
    cancelClose() {
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }
    }

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
