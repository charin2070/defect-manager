class ViewController extends Reactive {
    constructor(container) {
        super(container);
        this.init();
    }
    
    init() {
        this.views = {};
        this.loaderView = new LoaderView();
        
        // Layout
        this.layoutView = new LayoutView();
        this.layoutView.getWrapper().id = 'layout-view-container';
        this.container.appendChild(this.layoutView.getWrapper());
        
        // Create and register views
        this.uploadView = new UploadView();
        this.dashboardView = new DashboardView();
        this.dashboardView.getContainer().id = 'dashboard-view-container';
        this.reportsView = new ReportsView();
        this.reportsView.getContainer().id = 'reports-view-container';

        this.registerView('upload', this.uploadView);
        this.registerView('dashboard', this.dashboardView);
        this.registerView('reports', this.reportsView);
        
        // Set up subscriptions after views are registered
        this.setupSubscriptions();
    }

    setupSubscriptions(){
        this.subscribe('appStatus', (appStatus) => this.handleAppStatus(appStatus));
        this.subscribe('view', (viewName) => this.showView(viewName));
        // this.subscribe('statistics', () => this.showView('dashboard'));
        // this.subscribe('reports', this.showReport.bind(this));
    }

    handleAppStatus(appStatus) {
        switch (appStatus) {
            case('initialization'):
            this.showView('loader');
            break;
            case('error'):
            this.showView('error');
            break;
        }
    }

    registerView(name, viewContainer) {
        this.views[name] = viewContainer;
        const container = viewContainer.getContainer();
        if (container && !container.parentElement) {
            this.layoutView.getContainer().appendChild(container);
        }
        container.style.display = 'none'; // Initially hide all views
    }

    showLoader() {
        log('Showing loader');
        this.loaderView.show();
    }

    hideLoader() {
        log('Hiding loader');
        this.loaderView.hide();
    }

    async showView(name) {
        log(`📺 Showing view: ${name}`);
        const targetView = this.views[name];
        if (!targetView) throw new Error(`View "${name}" not found`);

        const targetContainer = targetView.getContainer();
        
        // Hide all views except target and current
        Object.values(this.views).forEach(view => {
            if (view !== targetView && view !== this.currentView) {
                const container = view.getContainer();
                container.style.display = 'none';
                container.classList.remove('view-exit', 'view-enter');
            }
        });

        // If there's a current view, animate it out
        if (this.currentView && this.currentView !== targetView) {
            const currentContainer = this.currentView.getContainer();
            currentContainer.classList.add('view-exit');
            
            await new Promise(resolve => {
                currentContainer.addEventListener('animationend', () => {
                    currentContainer.style.display = 'none';
                    currentContainer.classList.remove('view-exit');
                    resolve();
                }, { once: true });
            });
        }

        // Animate new view in
        targetContainer.style.display = 'block';
        targetContainer.classList.add('view-enter');
        
        await new Promise(resolve => {
            targetContainer.addEventListener('animationend', () => {
                targetContainer.classList.remove('view-enter');
                resolve();
            }, { once: true });
        });

        this.currentView = targetView;
        this.refact.setState({ currentView: name }, 'ViewController.showView');
    }

    updateView() {
        const issues = this.refact.issues;
        if (!issues || !issues.length) {
            this.showView('upload');
        } else {
            this.showView('dashboard');
        }
    }

    showReport(report) {
        if (!report) return;

        const reportsView = this.views['reports'];
        const view = reportsView.render(report);

        this.showView('reports');
    }

    bindEvent(name, event, handler) {
        if (this.views[name]) {
            this.views[name].addEventListener(event, handler);
        }
    }
}
