class LoaderView extends ViewComponent {
    static instance = null;
    #initialized = false;

    constructor() {
        if (LoaderView.instance) {
            return LoaderView.instance;
        }
        
        super();
        this.container = this.createElement('div');
        this.container.className = 'fixed inset-0 z-50 hidden opacity-0 transition-opacity duration-300';
        this.container.innerHTML = this.render();
        
        LoaderView.instance = this;
        this.#initialized = true;

        document.body.appendChild(this.container);
    }

    static getInstance() {
        if (!LoaderViewInstance.instance) {
            LoaderViewInstance.instance = new LoaderView();
        }
        return LoaderViewInstance.instance;
    }

    show() {
        if (!this.#initialized) return;
        
        this.container.classList.remove('hidden');
        // Trigger reflow to ensure transition works
        this.container.offsetHeight;
        this.container.classList.add('opacity-100');
    }

    hide() {
        if (!this.#initialized) return;
        
        this.container.classList.remove('opacity-100');
        this.container.style.display = 'none';
        this.container.addEventListener('transitionend', () => {
            this.container.classList.add('hidden');
        }, { once: true });
    }

    render() {
        return `
            <div class="absolute inset-0 bg-black/30 backdrop-blur-sm">
                <div class="flex h-full w-full items-center justify-center">
                    <div class="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            </div>
        `;
    }
}