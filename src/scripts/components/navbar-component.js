class NavbarComponent extends HtmlComponent {
    #element = null;
    #theme = 'light';
    #mode = 'normal';
    container = null;

    constructor(config = {}) {
        super();

        const defaultConfig = {
            theme: 'light',
            mode: 'normal',
            title: '',
            animate: true
        };

        this.config = { ...defaultConfig, ...config };
        this.#createNavbar();
        this.#setupEventListeners();
    }

    #createNavbar() {
        this.#element = this.createElement('nav', { className: 'navbar fluent-design' });
        this.container = this.#element;
        this.#updateClasses();

        const brand = this.createElement('div', { className: 'navbar-brand fluent-acrylic' });
        brand.textContent = this.config.title;

        this.leftMenu = this.createElement('div', { className: 'navbar-left' });
        this.leftMenu.appendChild(brand);

        this.rightMenu = this.createElement('div', { className: 'navbar-right' });

        this.#element.appendChild(this.leftMenu);
        this.#element.appendChild(this.rightMenu);

        // Adding styles for fixed position and Fluent Design effects
        this.#element.style.position = 'fixed';
        this.#element.style.top = '0';
        this.#element.style.left = '0';
        this.#element.style.right = '0';
        this.#element.style.zIndex = '1000';
        this.#element.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        this.#element.style.backdropFilter = 'blur(10px)';
        this.#element.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
    }

    #setupEventListeners() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            this.setTheme(e.matches ? 'dark' : 'light');
        });
    }

    #updateClasses() {
        this.#element.className = 'navbar fluent-design';
        this.#element.classList.add(this.#theme);
        this.#element.classList.add(this.#mode);
        if (this.config.animate) this.#element.classList.add('animate');
    }

    addMenuItem({ side, icon, title, size, callback }) {
        const itemElement = this.createElement('div', { className: 'navbar-item' });
        
        if (icon) {
            const iconElement = this.createElement('img', { src: icon, alt: title, className: 'navbar-icon' });
            itemElement.appendChild(iconElement);

            
        if (size) {
            iconElement.style.fontSize = size;
            iconElement.style.width = size;
            iconElement.style.height = size;
        }
        const titleElement = this.createElement('span', { className: 'navbar-title' });
        titleElement.textContent = title;
        itemElement.appendChild(titleElement);

        
        if (size) {
            titleElement.style.fontSize = size;
        }

    
    
        if (typeof callback === 'function') {
            itemElement.addEventListener('click', callback);
        }
    
        // Add the item to the specified side
        if (side === 'left') {
            this.leftMenu.appendChild(itemElement);
        } else if (side === 'right') {
            this.rightMenu.appendChild(itemElement);
        }
    }
    }

    // Public API
    getElement() {
        return this.#element;
    }

    getContainer() {
        return this.container;  
    }


    addItem(itemElement) {
        const menu = this.#element.querySelector('.navbar-menu');
        if (menu && itemElement instanceof Element) {
            itemElement.style.opacity = '0';
            itemElement.style.transform = 'translateX(20px)';
            menu.appendChild(itemElement);

            // Animation for appearance
            requestAnimationFrame(() => {
                itemElement.style.transition = 'all 0.3s ease';
                itemElement.style.opacity = '1';
                itemElement.style.transform = 'translateX(0)';
            });
        }
    }

    appendComponent(component, side) {
        let container;
        if (!component.getContainer)
            container = component.getContainer()
        else
        container = component.getContainer();
  

        if (side === 'left') {
            this.leftMenu.appendChild(container);
            return;
        }

        if (side === 'right') {
            this.rightMenu.appendChild(container);
            return;
        }

        this.container.appendChild(container);
    }

    addButton(text, image, onclick) {
        const button = this.createElement('button', { className: 'navbar-button fluent-button' });

        if (image) {
            const img = this.createElement('img', { className: 'navbar-icon-button', src: image, alt: text });
            button.appendChild(img);
        }

        if (text) {
            const span = this.createElement('span');
            span.textContent = text;
            button.appendChild(span);
        }

        if (typeof onclick === 'function') {
            button.addEventListener('click', () => {
                console.log(`Button clicked: ${text}`); 
                console.log('Button click event triggered'); // Added logging
                onclick();
            });
        }

        this.addItem(button);
    }

    addGroup(side, elements = []) {
        const group = this.createElement('div', { className: 'navbar-group' });

        elements.forEach(element => {
            if (element instanceof HTMLElement) {
                group.appendChild(element);
            }
        });

        let target;
        switch (side) {
            case 'left':
                target = this.#element.querySelector('.navbar-left');
                break;
            case 'right':
                target = this.#element.querySelector('.navbar-menu');
                break;
            case 'center':
                target = this.#element.querySelector('.navbar-center');
                if (!target) {
                    target = this.createElement('div', { className: 'navbar-center' });
                    this.#element.insertBefore(target, this.#element.querySelector('.navbar-menu'));
                }
                break;
            default:
                console.error('Invalid side specified for addGroup');
                return;
        }

        if (target) {
            target.appendChild(group);
        }

        return group;
    }

    addSearchBox() {
        const searchBox = this.createElement('input', { type: 'text', placeholder: 'Поиск', className: 'navbar-search' });
        this.addItem(searchBox);
        // Add icon for search
     

        searchBox.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click event from bubbling up
            this.openSlidePanel(); // Open the slide panel on click
        });
        this.addItem(searchBox);

        // Add icon for search
        const searchIcon = this.createElement('img', { src: 'src/image/search.svg', alt: 'Поиск', className: 'navbar-icon' });
        this.addItem(searchIcon);


        searchIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click event from bubbling up
            this.openSlidePanel(); // Open the slide panel on click
        });
    }

    openSlidePanel() {
        const slidePanel = new SlidePanel(); // Create an instance of SlidePanel
        const issueTable = new IssueTable(['Задача', 'Обращений']); // Create an instance of IssueTable with headers
        const issues = Refact.getInstance().state.issues;
    
        log(issues, 'Issues'); // Log issues to check if they are being retrieved
        issueTable.showIssues(issues, ['Задача', 'Обращений']); // Populate the issue table
        log(issueTable.getContainer(), 'Issue Table Container'); // Log the container to check if it is populated
    
        slidePanel.setContent(issueTable.getContainer()); // Set the content of the slide panel to the issue table
        slidePanel.open(); // Open the slide panel
    }

    
    

    static create(config) {
        return new NavbarComponent(config);
    }
}
