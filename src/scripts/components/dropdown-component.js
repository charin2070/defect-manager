class DropdownComponent {
    constructor(options = {}) {
        this.id = options.id || this.generateId('dropdown');
        this.items = options.items || [];
        this.defaultItem = options.defaultItem || 0;
        this.parent = options.parent;
        this.container = null;
        this.button = null;
        this.itemsContainer = null;
        this.isOpen = false;
        
        this.render();
    }

    generateId(prefix) {
        return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
    }

    render() {
        this.createDropdown();
        this.setupEventListeners();
    }

    addItem(item) {
        if (item.text === '---')
            item.type = 'separator';

        this.items.push(item);
        this.renderItems();
    }

    clearItems() {
        this.items = [];
    }

    setTitle(title) {
        if (this.button) {
            this.button.innerHTML = `
                <span>${title}</span>
                <svg class="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            `;
        }
    }

    setHeight(height) {
        if (this.container) {
            this.container.style.height = height;
        }
    }

    createDropdown() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'dropdown relative inline-block text-left';
        this.container.id = this.id;

        // Create button
        this.button = document.createElement('button');
        this.button.className = 'inline-flex items-center h-full p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
        this.button.id = this.generateId('dropdown-button');
        
        // Set initial button content
        if (this.items.length > 0) {
            const defaultItem = this.items[this.defaultItem];
            this.button.innerHTML = `
                ${defaultItem.icon ? `<img src="${defaultItem.icon}" class="w-4 h-4 mr-2" alt="">` : ''}
                <span>${defaultItem.text || 'Select'}</span>
                <svg class="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            `;
        } else {
            this.button.innerHTML = `
                <span>Select</span>
                <svg class="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            `;
        }

        // Create items container
        this.itemsContainer = document.createElement('div');
        this.itemsContainer.className = 'dropdown-menu hidden absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50';
        this.itemsContainer.setAttribute('role', 'menu');
        this.itemsContainer.setAttribute('aria-orientation', 'vertical');
        this.itemsContainer.setAttribute('aria-labelledby', this.button.id);

        // Append elements
        this.container.appendChild(this.button);
        this.container.appendChild(this.itemsContainer);

        // Render items if any
        if (this.items.length > 0) {
            this.renderItems();
        }

        // Append to parent if provided
        if (this.parent) {
            this.parent.appendChild(this.container);
        }
    }

    renderItems() {
        if (!this.items || this.items.length === 0) return;

        this.itemsContainer.innerHTML = this.items.map(group => `
            <div class="py-1" role="menu">
                ${Array.isArray(group) ? 
                    group.map(item => this.renderItem(item)).join('') : 
                    this.renderItem(group)}
            </div>
        `).join('');

        // Add click handlers
        this.itemsContainer.querySelectorAll('a').forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleItemClick(this.items[index]);
            });
        });
    }

    renderItem(item) {
        if (item.type === 'separator') {
            return '<hr class="dropdown-component-separator" />';
        }

        return `
            <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 dropdown-item" role="menuitem">
                ${item.icon ? `<img src="${item.icon}" class="w-4 h-4 mr-2 inline-block" alt="">` : ''}
                ${item.text}
            </a>
        `;
    }

    handleItemClick(item) {
        if (item.onClick) {
            item.onClick();
        }
        this.toggle();
        this.setActiveItem(item);
    }

    setActiveItem(item) {
        this.button.innerHTML = `
            ${item.icon ? `<img src="${item.icon}" class="w-4 h-4 mr-2" alt="">` : ''}
            <span>${item.text}</span>
            <svg class="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        `;
    }

    setupEventListeners() {
        // Toggle dropdown on button click
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
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
        this.isOpen = false;
    }

    getContainer() {
        return this.container;
    }

    getDropdownElement() {
        return this.container;
    }
}