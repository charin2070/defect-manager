class DropdownComponent {
    constructor({ id, items = [], defaultItem = 0, parent, title = '' } = {}) {
        this.id = id || DropdownComponent.generateId('dropdown');
        this.items = items;
        this.defaultItem = defaultItem;
        this.parent = parent;
        this.title = title;   
        this.isOpen = false;
        this.iconHeight = '1em';
        this.iconWidth = '1em';


        this.filteredItems = [...items];
        this.selectedItems = new Set();
        
        this.render();
    }

    static generateId(prefix) {
        return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
    }

    render() {
        this.createDropdown();
        this.setupEventListeners();
        this.renderItems();
    }

    addItem(item) {
        if (item.text === '---') item.type = 'separator';
        this.items.push(item);
        this.filteredItems = [...this.items];
        this.renderItems();
    }

    clearItems() {
        this.items = [];
        this.filteredItems = [];
        this.renderItems();
    }

    setHeight(height) {
        if (this.container) {
            this.container.style.height = height;
        }
    }

    createDropdown() {
        this.container = document.createElement('div');
        this.container.className = 'dropdown relative inline-block text-left';
        this.container.id = this.id;

        this.button = document.createElement('button');
        this.button.className = 'inline-flex items-center h-full p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100';
        this.button.id = DropdownComponent.generateId('dropdown-button');
        this.updateButtonContent();

        this.filterInput = document.createElement('input');
        this.filterInput.type = 'text';
        this.filterInput.placeholder = 'Search...';
        this.filterInput.className = 'dropdown-filter p-2 w-full border border-gray-300 rounded-md mb-2';
        
        this.itemsContainer = document.createElement('div');
        this.itemsContainer.className = 'dropdown-menu hidden absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white z-50';
        this.itemsContainer.setAttribute('role', 'menu');
        this.itemsContainer.setAttribute('aria-orientation', 'vertical');
        this.itemsContainer.setAttribute('aria-labelledby', this.button.id);

        this.itemsContainer.appendChild(this.filterInput);
        this.container.appendChild(this.button);
        this.container.appendChild(this.itemsContainer);

        if (this.parent) {
            this.parent.appendChild(this.container);
        }
    }

    updateButtonContent() {
        const defaultItem = this.items[this.defaultItem] || { text: 'Select' };
        this.button.innerHTML = `
            ${defaultItem.icon ? `<img src="${defaultItem.icon}" class="w-${this.iconWidth} h-${this.iconHeight} mr-2" alt="">` : ''}
            <span>${defaultItem.text}</span>
            <svg class="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        `;
    }

    renderItems() {
        this.itemsContainer.innerHTML = this.filteredItems.map(item => this.renderItem(item)).join('');
        this.itemsContainer.querySelectorAll('a').forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleItemClick(this.filteredItems[index]);
            });
        });
    }

    setIconSize(width, height) {
        this.iconWidth = width;
        this.iconHeight = height;
    }

    renderItem(item) {
        if (item.type === 'separator') {
            return '<hr class="dropdown-component-separator" />';
        }

        const isSelected = this.selectedItems.has(item);
        return `
            <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 dropdown-item ${isSelected ? 'bg-gray-200' : ''}" role="menuitem">
                ${item.icon ? 
                    `<img src="${item.icon}" class="w-${this.iconWidth} h-${this.iconHeight} mr-2 inline-block" alt="">` : ''}
                ${item.text}
            </a>
        `;
    }

    setActiveItemIndex(index) {
        this.setActiveItem(this.filteredItems[index]);
    }

    handleItemClick(item) {
        if (item.onClick) item.onClick();
        this.toggleItemSelection(item);
        this.setActiveItem(item);
    }

    setActiveItem(item) {
        this.updateButtonContent(item);
    }

    toggleItemSelection(item) {
        if (this.selectedItems.has(item)) {
            this.selectedItems.delete(item);
        } else {
            this.selectedItems.add(item);
        }
        this.renderItems();
    }

    setItems(items) {
        this.clearItems();
        items.forEach(item => this.addItem(item));
    }

    setupEventListeners() {
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        this.filterInput.addEventListener('input', () => {
            this.filteredItems = this.items.filter(item => item.text.toLowerCase().includes(this.filterInput.value.toLowerCase()));
            this.renderItems();
        });

        document.addEventListener('keydown', (e) => {
            if (this.isOpen) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateItems(1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateItems(-1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleItemClick(this.filteredItems[this.activeItemIndex]);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.close();
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });
    }

    navigateItems(direction) {
        const maxIndex = this.filteredItems.length - 1;
        this.activeItemIndex = (this.activeItemIndex + direction) % (maxIndex + 1);
        if (this.activeItemIndex < 0) this.activeItemIndex = maxIndex;
        this.highlightActiveItem();
    }

    highlightActiveItem() {
        const items = this.itemsContainer.querySelectorAll('a');
        items.forEach(item => item.classList.remove('bg-gray-100'));
        if (items[this.activeItemIndex]) {
            items[this.activeItemIndex].classList.add('bg-gray-100');
        }
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.itemsContainer.classList.remove('hidden');
        this.filterInput.focus();
        this.isOpen = true;
    }

    close() {
        this.itemsContainer.classList.add('hidden');
        this.isOpen = false;
    }

    getContainer() {
        return this.container;
    }

    getDropdownElement() {
        return this.container;
    }
}
