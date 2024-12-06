class DropdownComponent {
    constructor(element) {
        if (element){
            this.element = element;
            this.button = element.querySelector('.dropdown-toggle');
            this.menu = element.querySelector('.dropdown-menu');
            this.items = element.querySelectorAll('.dropdown-item');
            this.isOpen = false;
            this.init();
        }

    }

    init() {
        this.button?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });
    }

    getContainer() {
        return this.element;
    }

    clearItems() {
        if (this.menu) {
            this.menu.innerHTML = '';
        }
    }

    addItem(text, value, onClick, imageUrl = null, stateUpdate = null) {
        if (!this.menu) return;

        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = text;
        item.dataset.value = value;
        
        if (imageUrl) {
            const icon = document.createElement('img');
            icon.src = imageUrl;
            icon.className = 'dropdown-icon';
            item.prepend(icon);
        }

        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (onClick) onClick(value);
            if (stateUpdate) {
                const [stateName, stateValue] = Object.entries(stateUpdate)[0];
                this.refact.setState(stateName, stateValue);
            }
            this.handleItemClick(e);
        });
        
        this.menu.appendChild(item);
    }

    toggle() {
        if (this.element.classList.contains('show')) {
            this.close();
        } else {
            this.show();
        }
    }

    show() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.element.classList.add('show');
        this.adjustMenuPosition();
        document.addEventListener('click', this.handleOutsideClick);
    }

    adjustMenuPosition() {
        const menu = this.element.querySelector('.dropdown-menu');
        const rect = menu.getBoundingClientRect();
        const parentRect = this.element.getBoundingClientRect();
        
        // Проверяем выход за правый край экрана
        if (rect.right > window.innerWidth) {
            const overflow = rect.right - window.innerWidth;
            menu.style.left = `${-overflow - 10}px`; // 10px отступ от края
        }
        
        // Проверяем выход за левый край
        if (rect.left < 0) {
            menu.style.left = '0px';
        }
    }

    open() {
        this.element.classList.add('show');
        this.button?.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.element.classList.remove('show');
        this.button?.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
        document.removeEventListener('click', this.handleOutsideClick);
    }

    handleItemClick(event) {
        const value = event.target.dataset.value;
        const text = event.target.textContent;
        
        if (this.button) {
            this.button.textContent = text;
        }
        
        this.element.dispatchEvent(new CustomEvent('change', {
            detail: { value, text }
        }));
        
        this.close();
    }

    handleOutsideClick = (e) => {
        if (!this.element.contains(e.target)) {
            this.close();
        }
    }

    setToggleIcon(imageUrl) {
        if (!this.button) return;

        // Find existing icon or create a new one
        let icon = this.button.querySelector('.dropdown-icon');
        if (!icon) {
            icon = document.createElement('img');
            icon.className = 'dropdown-icon';
            this.button.appendChild(icon);
        }

        // Set the new image URL
        icon.src = imageUrl;
    }
}

// Initialize all dropdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        new DropdownComponent(dropdown);
    });
});
