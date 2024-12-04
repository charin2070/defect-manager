class Layout {
    static instance = null;

    static getInstance() {
        if (!Layout.instance) {
            Layout.instance = new Layout();
        }
        return Layout.instance;
    }

    constructor() {
        if (Layout.instance) {
            return Layout.instance;
        }

        // Wait for DOM content to be loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeLayout();
        });
    }

    initializeLayout() {
        this.container = document.querySelector('.layout');
        if (!this.container) {
            console.error('Layout container not found');
            return;
        }

        this.sidebar = this.container.querySelector('.layout-sidebar');
        this.content = this.container.querySelector('.layout-content');
        this.main = this.container.querySelector('.layout-main');
        
        Layout.instance = this;
        this.init();
    }

    init() {
        this.setupResizeHandlers();
        this.adjustLayout();
        console.log('Layout initialized with:', {
            container: this.container,
            sidebar: this.sidebar,
            content: this.content,
            main: this.main
        });
    }

    setupResizeHandlers() {
        window.addEventListener('resize', () => {
            this.adjustLayout();
        });
    }

    adjustLayout() {
        if (!this.container || !this.sidebar) return;

        if (window.innerWidth < 768) {
            this.sidebar.classList.add('collapsed');
            this.container.classList.add('mobile');
        } else {
            this.sidebar.classList.remove('collapsed');
            this.container.classList.remove('mobile');
        }
    }
}

// Initialize layout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.layoutInstance = Layout.getInstance();
});
