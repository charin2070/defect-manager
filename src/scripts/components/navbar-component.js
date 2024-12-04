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
            title: 'Defect Manager',
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

        const menu = document.createElement('div');
        menu.className = 'navbar-menu';

        this.#element.appendChild(brand);
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

    addItem(element) {
        const menu = this.#element.querySelector('.navbar-menu');
        if (menu && element instanceof Element) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(20px)';
            menu.appendChild(element);
            
            // Анимация появления
            requestAnimationFrame(() => {
                element.style.transition = 'all 0.3s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            });
        }
    }

    static create(config) {
        return new NavbarComponent(config);
    }
}
