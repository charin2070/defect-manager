class DropdownComponent extends HtmlElement {
    constructor(container, options = {}) {
        super(container);
        
        this.options = {
            id: options.id || 'dropdown',
            buttonContent: options.buttonContent || '',
            items: options.items || [],
            onItemClick: options.onItemClick || (() => {}),
            className: options.className || ''
        };

        this.isOpen = false;
        this.activeSubmenu = null;
        this.init();
    }

    init() {
        this.createDropdown();
        this.setupEventListeners();
    }

    createDropdown() {
        // Create main container
        this.dropdown = this.createElement('div', {
            className: 'relative inline-block text-left' + (this.options.className ? ` ${this.options.className}` : ''),
            id: this.options.id
        });

        // Create toggle button
        this.button = this.createElement('button', {
            className: 'inline-flex items-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            id: `${this.options.id}-button`
        });
        if (this.options.buttonContent) {
            this.button.innerHTML = this.options.buttonContent;
        }

        // Create dropdown content
        this.content = this.createElement('div', {
            className: 'hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none',
            id: `${this.options.id}-content`
        });

        this.renderItems();

        // Append elements
        this.dropdown.appendChild(this.button);
        this.dropdown.appendChild(this.content);
        this.container.appendChild(this.dropdown);
    }

    renderItems() {
        this.content.innerHTML = this.options.items.map(group => `
            <div class="py-1" role="menu">
                ${group.map(item => this.renderMenuItem(item)).join('')}
            </div>
        `).join('');
    }

    renderMenuItem(item) {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const submenuId = hasSubmenu ? `${this.options.id}-submenu-${item.action}` : '';
        const actions = Array.isArray(item.action) ? JSON.stringify(item.action) : item.action;
        
        // Handle icon - create image element if it's a file path
        let iconHtml = '';
        if (item.icon) {
            // Check if icon is a file path (either starts with "/" or contains file extension)
            if (item.icon.match(/^\/|\.(?:jpg|jpeg|png|gif|svg|webp)$/i)) {
                iconHtml = `<img src="${item.icon}" class="w-4 h-4 mr-2" alt="">`;
            } else if (item.icon.startsWith('<svg') || item.icon.startsWith('<img')) {
                // If it's already an HTML/SVG element, use it as is
                iconHtml = item.icon;
            } else {
                // If it's a file path without leading slash, add one
                iconHtml = `<img src="/${item.icon}" class="w-4 h-4 mr-2" alt="">`;
            }
        }
        
        return `
            <div class="relative group">
                <a href="#" 
                   class="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100 justify-between" 
                   role="menuitem" 
                   data-action='${actions}'
                   ${hasSubmenu ? `data-submenu="${submenuId}"` : ''}>
                    <div class="flex items-center">
                        ${iconHtml}
                        ${item.label}
                    </div>
                    ${hasSubmenu ? `
                        <svg class="ml-2 h-5 w-5 submenu-arrow transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                    ` : ''}
                </a>
                ${hasSubmenu ? `
                    <div class="submenu-wrapper">
                        <div id="${submenuId}" 
                             class="hidden submenu absolute top-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none"
                             role="menu">
                            <div class="py-1">
                                ${item.submenu.map(subItem => `
                                    <a href="#" 
                                       class="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100" 
                                       role="menuitem"
                                       data-action="${subItem.action}">
                                        ${subItem.icon || ''}
                                        ${subItem.label}
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    setupEventListeners() {
        // Toggle dropdown
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });

        // Handle item clicks and submenu hovers
        this.content.addEventListener('click', (e) => {
            const menuItem = e.target.closest('[data-action]');
            if (!menuItem) return;

            e.preventDefault();
            e.stopPropagation();

            const actionData = menuItem.dataset.action;
            if (!menuItem.hasAttribute('data-submenu')) {
                try {
                    const actions = JSON.parse(actionData);
                    if (Array.isArray(actions)) {
                        actions.forEach(action => this.options.onItemClick(action));
                    } else {
                        this.options.onItemClick(actionData);
                    }
                } catch {
                    this.options.onItemClick(actionData);
                }
                this.close();
            }
        });

        // Handle submenu hover
        this.content.addEventListener('mouseover', (e) => {
            const menuItem = e.target.closest('[data-submenu]');
            if (!menuItem) return;

            const submenuId = menuItem.dataset.submenu;
            const submenu = document.getElementById(submenuId);
            
            if (submenu) {
                // Close any other open submenus
                if (this.activeSubmenu && this.activeSubmenu !== submenu) {
                    this.activeSubmenu.classList.add('hidden');
                    // Reset arrow rotation for previously active submenu
                    const prevArrow = this.activeSubmenu.parentElement.querySelector('.submenu-arrow');
                    if (prevArrow) prevArrow.style.transform = '';
                }

                // Calculate position
                const rect = menuItem.getBoundingClientRect();
                const spaceOnRight = window.innerWidth - rect.right;
                const submenuWidth = 192; // w-48 = 12rem = 192px

                const openOnRight = spaceOnRight >= submenuWidth;
                const wrapper = submenu.parentElement;
                
                // Position the wrapper and submenu
                wrapper.style.position = 'absolute';
                wrapper.style.top = '0';
                wrapper.style.bottom = '0';
                wrapper.style.width = submenuWidth + 16 + 'px'; // width + gap
                
                if (openOnRight) {
                    wrapper.style.left = '100%';
                    wrapper.style.right = 'auto';
                    submenu.style.left = '0.25rem';
                    submenu.style.right = 'auto';
                } else {
                    wrapper.style.left = 'auto';
                    wrapper.style.right = '100%';
                    submenu.style.left = 'auto';
                    submenu.style.right = '0.25rem';
                }

                // Rotate the arrow based on direction
                const arrow = menuItem.querySelector('.submenu-arrow');
                if (arrow) {
                    arrow.style.transform = openOnRight ? '' : 'rotate(180deg)';
                }

                submenu.classList.remove('hidden');
                this.activeSubmenu = submenu;
            }
        });

        // Handle mouseout from submenu
        this.content.addEventListener('mouseout', (e) => {
            const submenu = e.target.closest('.relative');
            if (!submenu) return;

            const relatedTarget = e.relatedTarget;
            if (!submenu.contains(relatedTarget)) {
                const submenuContent = submenu.querySelector('[id^="' + this.options.id + '-submenu-"]');
                if (submenuContent) {
                    submenuContent.classList.add('hidden');
                    // Reset arrow rotation
                    const arrow = submenu.querySelector('.submenu-arrow');
                    if (arrow) arrow.style.transform = '';
                    this.activeSubmenu = null;
                }
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (event) => {
            if (!this.dropdown.contains(event.target)) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.content.classList.remove('hidden');
        this.isOpen = true;
    }

    close() {
        this.content.classList.add('hidden');
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
        return this.dropdown;
    }
}

// Initialize all dropdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        new DropdownComponent(dropdown);
    });
});
