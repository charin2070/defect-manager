class ViewController {
    constructor(parentContainer) {
        this.parentContainer = parentContainer || document.getElementById('app');
        if (!this.parentContainer) {
            console.error('[ViewController] Parent container not found. Creating one.');
            this.parentContainer = document.createElement('div');
            this.parentContainer.id = 'app';
            document.body.appendChild(this.parentContainer);
        }

        this.refact = new Refact(this.parentContainer);
        this.container = null;
        this.layout = null;
        this.views = {};
        
        this.initComponents();
    }

    initComponents() {
        // Create layout first
        this.layout = new Layout(this.parentContainer);
        this.container = this.layout.getContentContainer();
        
        // Initialize views
        this.uploadView = new UploadView(this.container);
        this.dashboardView = new DashboardView(this.container);
        
        // Register views
        this.registerView('upload', this.uploadView);
        this.registerView('dashboard', this.dashboardView);
        
        // Hide all views initially
        Object.values(this.views).forEach(view => {
            if (view && view.getView()) {
                view.getView().style.display = 'none';
            }
        });

        // Subscribe to view changes
        this.refact.subscribe('currentView', (viewName) => {
            console.log(`[ViewController] Current view changed to: ${viewName}`);
            this.showView(viewName);
        });
    }

    getContainer() {
        return this.container;
    }

    registerView(name, view) {
        if (!view) {
            console.error(`[ViewController] Cannot register null view for ${name}`);
            return;
        }
        this.views[name] = view;
        if (view.getView()) {
            this.container.appendChild(view.getView());
        }
    }

    showView(name) {
        console.log(`[ViewController] Showing view: ${name}`);
        
        // Hide all views first
        Object.entries(this.views).forEach(([viewName, view]) => {
            if (view && view.getView()) {
                view.getView().style.display = viewName === name ? 'block' : 'none';
            }
        });
    }

    updateView(name, content) {
        const view = this.views[name];
        if (view) {
            view.update(content);
        }
    }
}