    class ViewController extends View {
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
        this.uploadView = new UploadView(this.container);
        this.dashboardView = new DashboardView(this.container);
        this.dashboardView.getContainer().id = 'dashboard-view-container';
        this.reportsView = new ReportsView(this.container);
        this.reportsView.getContainer().id = 'reports-view-container';
        this.settingsView = new SettingsView(this.container);
        this.settingsView.getContainer().id = 'settings-view-container';
        this.toast = new ToastComponent(this.container);

        this.registerView('upload', this.uploadView);
        this.registerView('dashboard', this.dashboardView);
        this.registerView('reports', this.reportsView);
        this.registerView('settings', this.settingsView);

        this.setupSubscriptions();
    }

    setupSubscriptions(){
        // Data Status
        this.subscribe('dataStatus', (dataStatus) => {
            switch (dataStatus) {
                case 'loaded':
                    this.showView('dashboard');
                    break;
                case 'empty':
                    this.showView('upload');
                    break;
            }
        });
        
        // View
        this.subscribe('view', (viewName) => this.showView(viewName));
        // Toast
        this.subscribe('toast', (toast) => {
            console.log('ViewController: Showing toast', toast);
            if (toast && toast.message) {
                this.toast.show(toast.message, toast.type || 'info', toast.duration || 3000);
            }
        });
    }

    handleAppStatus(appStatus) {
        switch (appStatus) {
            case('loading'):
            case('initializing'):
                this.showLoader()
                break;
            case('loaded'):
            case('initialized'):
                this.hideLoader();
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
        // Skip if no name provided
        if (!name) {
            log(name, 'No view name provided to showView');
            return;
        }
        
        log(`📺 Showing view: ${name}`);
        const targetView = this.views[name];
        
        // If view not found, default to upload view
 

        const targetContainer = targetView.getContainer();
        
        // Hide all views except target and current
        Object.values(this.views).forEach(view => {
            if (view !== targetView && view !== this.currentView) {
                const container = view.getContainer();
                container.style.display = 'none';
                container.classList.remove('view-exit', 'view-enter');
            }
        });
        if (name === 'dashboard') {
            log('[ViewController.showView] Rendering backlog chart...');    
            this.dashboardView.createBacklogChart();
            this.dashboardView.backlogData = this.state.chartManager.prepareChartData(this.state.issues);

        }
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
        this.setState({ currentView: name }, 'ViewController.showView');
    }

    updateView() {
        switch (this.state.dataStatus) {
            case 'loaded':
                this.showView('dashboard');
                this.hideLoader();
                break;
            case 'empty':
                this.showView('upload');
                break;
        }

        if (!this.state.statistics || !this.state.statistics.length <= 0) {
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
