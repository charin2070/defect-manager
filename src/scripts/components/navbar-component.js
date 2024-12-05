class NavbarComponent {
    static #instance = null;
    #element = null;
    #theme = 'light';
    #mode = 'normal';

    constructor(config = {}) {
        if (NavbarComponent.#instance) return NavbarComponent.#instance;
        NavbarComponent.#instance = this;

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
        this.#element = document.createElement('nav');
        this.#element.className = 'navbar';
        this.#updateClasses();

        const brand = document.createElement('div');
        brand.className = 'navbar-brand';
        brand.textContent = this.config.title;

        const leftMenu = document.createElement('div');
        leftMenu.className = 'navbar-left';
        leftMenu.appendChild(brand);

        const menu = document.createElement('div');
        menu.className = 'navbar-menu';

        this.#element.appendChild(leftMenu);
        this.#element.appendChild(menu);

        // Добавляем стили для фиксированной позиции
        this.#element.style.position = 'fixed';
        this.#element.style.top = '0';
        this.#element.style.left = '0';
        this.#element.style.right = '0';
        this.#element.style.zIndex = '1000';
        this.#element.style.backgroundColor = 'var(--background-color, white)';
        this.#element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        this.#element.style.transition = 'transform 0.3s ease';
    }

    #setupEventListeners() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            this.setTheme(e.matches ? 'dark' : 'light');
        });
    }

    #updateClasses() {
        this.#element.className = 'navbar';
        this.#element.classList.add(this.#theme);
        this.#element.classList.add(this.#mode);
        if (this.config.animate) this.#element.classList.add('animate');
    }

    // Public API
    getElement() {
        return this.#element;
    }

    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') return;
        this.#theme = theme;
        this.#updateClasses();
    }

    setMode(mode) {
        if (mode !== 'normal' && mode !== 'compact') return;
        this.#mode = mode;
        this.#updateClasses();
    }

    addItem(itemElement) {
        const menu = this.#element.querySelector('.navbar-menu');
        if (menu && itemElement instanceof Element) {
            itemElement.style.opacity = '0';
            itemElement.style.transform = 'translateX(20px)';
            this.#element.appendChild(itemElement);
            
            // Анимация появления
            requestAnimationFrame(() => {
                itemElement.style.transition = 'all 0.3s ease';
                itemElement.style.opacity = '1';
                itemElement.style.transform = 'translateX(0)';
            });
        }
    }

    addButton(text, image, onclick) {
        const button = document.createElement('button');
        button.className = 'navbar-button';

        if (image) {
            const img = document.createElement('img');
            img.className = 'navbar-icon-button';
            img.src = image;
            img.alt = text;
            button.appendChild(img);
        }

        if (text) {
            const span = document.createElement('span');
            span.textContent = text;
            button.appendChild(span);
        }

        if (typeof onclick === 'function') {
            button.addEventListener('click', onclick);
        }

        this.addItem(button);
    }

    addGroup(side, elements = []) {
        const group = document.createElement('div');
        group.className = 'navbar-group';

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
                    target = document.createElement('div');
                    target.className = 'navbar-center';
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

    static create(config) {
        return new NavbarComponent(config);
    }
}
