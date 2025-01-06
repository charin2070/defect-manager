class DropdownComponent extends HtmlComponent {
    constructor(options) {
        super();
        
        this.options = options;
        this.id = 'dropdown';
        this.className = '';
        this.toggle =  'src/image/menu.svg';
        this.defaultItem = 0;
        this.items = [];
        this.onItemClick = this.onItemClick;
        this.parent = null;
        this.isOpen = false;
        this.activeSubmenu = null;
        this.height = '100%';
        this.cursor = 'pointer';
        this.fontSize = '1em';

        if (options) {
            Object.keys(options).forEach(key => {
                this[key] = options[key];
            });
        }
        this.render();
    }

    render() {
        this.createDropdown();
        this.setupEventListeners();
    }

    setHeight(height) {
        this.container.style.height = height;
    }

    setFontSize(size) {
        this.container.style.fontSize = size;
    }

    setCursor(cursor) {
        this.container.style.cursor = cursor;
    }

    createDropdown() {
        this.container = this.createElement('div', {
            className: `relative inline-block text-left ${this.className || ''}`,
            id: this.generateId('dropdown'),
            style: this.height ? `height: ${this.height};` : ''
        });

        // Button
        this.button = this.createElement('div', {
            className: 'inline-flex items-center h-full p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            id: this.generateId('dropdown-button'),
        });

        // Set initial button content
        if (this.items.length > 0 && this.items[0].length > this.defaultItem) {
            const defaultItem = this.items[0][this.defaultItem];
            this.button.innerHTML = `
                ${defaultItem.icon ? `<img src="${defaultItem.icon}" class="w-4 h-4 mr-2" alt="">` : ''}
                <span>${defaultItem.text}</span>
            `;
        } else {
            this.button.innerHTML = "No items";
        }

        // Items container
        this.itemsContainer = this.createElement('div', {
            className: 'hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none',
        });

        this.setHeight(this.height);
        this.setFontSize(this.fontSize);
        this.setCursor(this.cursor);

        this.renderItems(); 

        // Append elements
        this.container.appendChild(this.button);
        this.container.appendChild(this.itemsContainer);
        if (this.parent)
            this.parent.appendChild(this.container);
    }

    renderItems() {
        this.itemsContainer.innerHTML = this.items.map(group => `
            <div class="py-1" role="menu">
                ${group.map(item => this.renderMenuItem(item)).join('')}
            </div>
        `).join('');
    }

    renderMenuItem(item) {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const submenuId = hasSubmenu ? `${this.id}-submenu-${item.value}` : '';
        
        // Handle icon
        let iconHtml = '';
        if (item.icon) {
            iconHtml = `<img src="${item.icon}" class="w-4 h-4 mr-2" alt="">`;
        }
        
        return `
            <div class="relative group">
                <div class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center cursor-pointer"
                    role="menuitem"
                    data-action="${item.value}"
                    data-callback="${!!item.callback}"
                    ${hasSubmenu ? `data-submenu="${submenuId}"` : ''}>
                    <div class="flex items-center">
                        ${iconHtml}
                        <span>${item.text}</span>    
                    </div>
                    ${hasSubmenu ? `
                        <svg class="ml-2 h-5 w-5 submenu-arrow transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                    ` : ''}
                </div>
                ${hasSubmenu ? `
                    <div id="${submenuId}" class="hidden absolute left-full top-0 mt-0 ml-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        ${item.submenu.map(subitem => this.renderMenuItem(subitem)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getContainer() {
        return this.container;
    }

    setupEventListeners() {
        // Toggle dropdown
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isOpen ? this.close() : this.open();
        });

        // Handle item clicks
        this.itemsContainer.addEventListener('click', (e) => {
            const menuItem = e.target.closest('[data-action]');
            if (!menuItem) return;

            const actionData = menuItem.dataset.action;
            const hasCallback = menuItem.dataset.callback === 'true';

            if (hasCallback) {
                const itemIndex = this.items[0].findIndex(item => item.value === actionData);
                if (itemIndex !== -1) {
                    const item = this.items[0][itemIndex];
                    if (item.callback) {
                        item.callback();
                    }
                }
            }
            this.close();
        });

        // Close when clicking outside
        document.addEventListener('click', (event) => {
            if (!this.container.contains(event.target)) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.itemsContainer.classList.remove('hidden');
        this.isOpen = true;
    }

    close() {
        this.itemsContainer.classList.add('hidden');
        if (this.activeSubmenu) {
            this.activeSubmenu.classList.add('hidden');
            // Reset arrow rotation when closing
            const arrow = this.activeSubmenu.parentElement.querySelector('.submenu-arrow');
            if (arrow) arrow.style.transform = '';
            this.activeSubmenu = null;
        }
        this.isOpen = false;
    }

    getDropdownElement() {
        return this.container;
    }
}

// Initialize all dropdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        new DropdownComponent(dropdown);
    });
});
