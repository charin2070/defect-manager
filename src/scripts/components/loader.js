class Loader {
    constructor() {
        this._isVisible = false;
        this.overlay = null;
        this.init();
    }

    init() {
        // Создаем оверлей с лоадером
        this.overlay = document.createElement('div');
        this.overlay.className = 'loader-overlay hidden';
        
        const loader = document.createElement('div');
        loader.className = 'loader';
        
        this.overlay.appendChild(loader);
        document.body.appendChild(this.overlay);
    }

    show() {
        if (this._isVisible) return;
        this._isVisible = true;
        this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hide() {
        if (!this._isVisible) return;
        this._isVisible = false;
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Создаем глобальный экземпляр лоадера
window.appLoader = new Loader();
 