class NavbarComponent extends HtmlComponent {
    static #instance = null;
    #element = null;
    #theme = 'light';
    #mode = 'normal';

    constructor(config = {}) {
        super();
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
        this.#element = this.createElement('nav', { className: 'navbar fluent-design' });
        this.#updateClasses();

        const brand = this.createElement('div', { className: 'navbar-brand fluent-acrylic' });
        brand.textContent = this.config.title;

        const leftMenu = this.createElement('div', { className: 'navbar-left' });
        leftMenu.appendChild(brand);

        const menu = this.createElement('div', { className: 'navbar-menu' });

        this.#element.appendChild(leftMenu);
        this.#element.appendChild(menu);

        // Adding styles for fixed position and Fluent Design effects
        this.#element.style.position = 'fixed';
        this.#element.style.top = '0';
        this.#element.style.left = '0';
        this.#element.style.right = '0';
        this.#element.style.zIndex = '1000';
        this.#element.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Acrylic effect
        this.#element.style.backdropFilter = 'blur(10px)'; // Acrylic effect
        this.#element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Depth effect
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

    // Public API
    getElement() {
        return this.#element;
    }

    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') return;
        this.#theme = theme;
        this.#updateClasses();
        this.#element.style.backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
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
            menu.appendChild(itemElement);

            // Animation for appearance
            requestAnimationFrame(() => {
                itemElement.style.transition = 'all 0.3s ease';
                itemElement.style.opacity = '1';
                itemElement.style.transform = 'translateX(0)';
            });
        }
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
            button.addEventListener('click', onclick);
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

    static create(config) {
        return new NavbarComponent(config);
    }
}
