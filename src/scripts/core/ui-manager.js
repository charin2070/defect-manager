class UiManager extends ViewComponent {
    constructor(appContainer) {
        super(appContainer);
        this.refact = Refact.getInstance(appContainer);
        this.appContainer = appContainer;
        this.init();
    }
    
    init() {
        this.views = {};
        
        this.layoutComponent = new LayoutComponent(this.appContainer);
        this.navbarComponent = this.createNavbar(this.navbarConfig);
        this.layoutComponent.appendChild(this.navbarComponent.getContainer());

        // Create views
        this.initializeViews();
        
        // Setup event listeners
        this.setupEventListeners();
        this.setupSubscriptions();
    }

    createNavbar(navbarConfig) {
        const navbar = NavbarComponent.create(navbarConfig);
        navbar.addButton('Обновить из файла', null, () => alert('About clicked'));
        navbar.addButton('Настройки', null, () => alert('Home clicked'));

        return navbar;
    }

    navbarConfig = {
        theme: 'light',
        mode: 'normal',
        title: 'Refact',
        animate: true
    };

    initializeViews() {
        // Create views
        this.uploadView = new UploadView();
        this.dashboardView = new DashboardView();
        this.reportsView = new ReportsView();
        this.settingsView = new SettingsView();
        this.toast = new ToastComponent();

        // Set view IDs
        this.dashboardView.getContainer().id = 'dashboard-view';
        this.uploadView.getContainer().id = 'upload-view';
        this.reportsView.getContainer().id = 'reports-view';
        this.settingsView.getContainer().id = 'settings-view';

        // Register views
        this.registerView('dashboard', this.dashboardView);
        this.registerView('upload', this.uploadView);
        this.registerView('reports', this.reportsView);
        this.registerView('settings', this.settingsView);
    }

    setupEventListeners() {
        // Handle navigation clicks
        const navLinks = this.layoutComponent.getContainer().querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = e.target.dataset.route;
                if (route) {
                    this.showView(route, 'navigation');
                }
            });
        });
    }

    setupSubscriptions(){
        // Listen for data status changes
        this.refact.subscribe('dataStatus', (status) => {
            if (status === 'empty') {
                this.showView('upload', 'dataStatus');
            } else if (status === 'loaded') {
                this.showView('dashboard', 'dataStatus');
            }
        });

        // Listen for view changes from navigation
        this.refact.subscribe('view', (viewName) => {
            if (viewName && viewName !== this.currentViewName) {
                this.showView(viewName, 'navigation');
            }
        });

        // Listen for toast messages
        this.refact.subscribe('toast', (toast) => {
            console.log('ViewController: Showing toast', toast);
            if (toast && toast.message) {
                this.toast.show(toast.message, toast.type || 'info', toast.duration || 3000);
            }
        });
    }

    registerView(name, viewComponent) {
        this.views[name] = viewComponent;
        const container = viewComponent.getContainer();
        if (container && !container.parentElement) {
            const viewContainer = this.layoutComponent.getViewContainer();
            if (viewContainer) {
                viewContainer.appendChild(container);
                container.style.display = 'none';
            }
        }
    }

    showView(viewName, context = 'unknown') {
        log(`${viewName}:`, 'UiManager.showView');
        log('📺 Showing view:');

        if (!this.views[viewName]) {
            console.error(`View ${viewName} not found`);
            return;
        }

        // Don't switch to the same view
        if (this.currentViewName === viewName) {
            return;
        }

        // Hide current view if exists
        if (this.currentView) {
            this.currentView.getContainer().style.display = 'none';
        }

        // Show new view
        this.currentView = this.views[viewName];
        this.currentViewName = viewName;
        this.currentView.getContainer().style.display = 'block';

        // Update state
        this.refact.setState({ view: viewName }, `ViewController.showView(${context})`);
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

    showLoader() {
        log('Showing loader');
        this.loaderView.show();
    }

    hideLoader() {
        log('Hiding loader');
        this.loaderView.hide();
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
