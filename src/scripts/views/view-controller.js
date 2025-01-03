class ViewController extends ViewComponent {
    constructor(container) {
        super(container);
        this.views = new Map();
        this.currentView = null;
        this.setupSubscriptions();
    }

    registerView(name, view) {
        if (!(view instanceof ViewComponent)) {
            throw new Error(`View ${name} must be an instance of ViewComponent`);
        }
        this.views.set(name, view);
    }

    showView(name, context = 'unknown') {
        log(`${name}:`, 'ViewController.showView');
        log('📺 Showing view:');

        const view = this.views.get(name);
        if (!view) {
            console.error(`View ${name} not found`);
            return;
        }

        // Don't switch to the same view
        if (this.currentView === view) {
            return;
        }

        // Hide current view if exists
        if (this.currentView) {
            this.currentView.getContainer().style.display = 'none';
        }

        // Show new view
        view.getContainer().style.display = 'block';
        this.currentView = view;

        // Update state
        this.refact.setState({ view: name }, `ViewController.showView(${context})`);
    }

    setupSubscriptions() {
        // Listen for data status changes
        this.refact.subscribe('dataStatus', (status) => {
            if (status === 'empty') {
                this.showView('upload', 'dataStatus');
            } else if (status === 'loaded') {
                this.showView('dashboard', 'dataStatus');
            }
        });

        // Listen for navigation changes
        this.refact.subscribe('view', (viewName) => {
            if (viewName && this.views.has(viewName)) {
                this.showView(viewName, 'navigation');
            }
        });
    }
}
