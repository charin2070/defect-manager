// Define base dropdown class
class CustomDropdown {
    constructor(containerId, buttonText = '') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`CustomDropdown: Container #${containerId} not found`);
            return;
        }
        
        this.initialize(buttonText);
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
        if (!this.button || !this.dropdownMenu) return;

        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });

        this.dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (!this.dropdownMenu) return;
        
        this.isOpen = true;
        this.dropdownMenu.classList.add('show');
        this.button?.setAttribute('aria-expanded', 'true');
    }

    close() {
        if (!this.dropdownMenu) return;
        
        this.isOpen = false;
        this.dropdownMenu.classList.remove('show');
        this.button?.setAttribute('aria-expanded', 'false');
    }

    addItem(text, value = null, onClick = null) {
        if (!this.dropdownMenu) return;

        const item = document.createElement('a');
        item.className = 'dropdown-item';
        item.href = '#';
        item.textContent = text;
        
        if (value) {
            item.dataset.value = value;
        }

        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (onClick) {
                onClick(value || text);
            }
            this.close();
        });

        this.dropdownMenu.appendChild(item);
    }

    clearItems() {
        if (this.dropdownMenu) {
            this.dropdownMenu.innerHTML = '';
        }
    }

    disable() {
        if (this.button) {
            this.button.disabled = true;
        }
    }

    enable() {
        if (this.button) {
            this.button.disabled = false;
        }
    }
}

window.CustomDropdown = CustomDropdown;
