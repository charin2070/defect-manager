class UiManager {
    constructor(appContainer) {
        this.refact = Refact.getInstance(appContainer).bind(this);
        this.appContainer = appContainer;
        this.contentContainer = new HtmlComponent().createElement('div', { className: 'content-container' });
        this.appContainer.appendChild(this.contentContainer); // Append to appContainer

        this.views = {};
        this.refact.setState({ view: 'none' }, 'UiManager');
        this.currentViewName = 'none';
        this.slidePanel = new SlidePanel(); // Create an instance of SlidePanel

        this.initializeNavbar();
        this.initializeViews();
        this.setupSubscriptions();

        log({ views: this.views, view: 'none' }, 'Views');
    }

    initializeNavbar() {
        const navbar = new NavbarComponent();
        navbar.addMenuItem({ side: 'left', icon: 'src/image/jira-defect.svg', size: '1.2em', title: 'Дефекты', callback: () => this.refact.setState({ view: 'dashboard-container' }, 'UiManager') });
        navbar.addMenuItem({ side: 'left', size: '1.2em', title: 'Все команды', callback: () => this.refact.setState({ view: 'dashboard-container' }, 'UiManager') });
        navbar.addSearchBox(); // Add search box
        navbar.addMenuItem({ side: 'right', icon: 'src/image/upload-svgrepo-com.svg', callback: () => this.refact.setState({ view: 'upload-container' }, 'UiManager') }, 'upload'); 
        navbar.addMenuItem({ side: 'right', icon: 'src/image/grid-svgrepo-com.svg', callback: () => this.showSettings() });

        this.appContainer.appendChild(navbar.getContainer());
    }

    showSettings() {
        this.showView('settings-container', 'UiManager');
        this.slidePanel.open(this.views['settings-container'].getContainer(), 'Настройки'); // Open SlidePanel with SettingsView
    }

    showView(viewId) {
        const viewContainers = document.getElementsByClassName('view-container');
        for (let i = 0; i < viewContainers.length; i++) {
            viewContainers[i].style.display = 'none';
            if (viewContainers[i].id == viewId) {
                viewContainers[i].style.display = 'flex'; 
            }
        }
    }


    showDashboard() {
        this.refact.state.views.forEach((view) => {
            view.show();
        });
        this.showView('dashboard-container', 'UiManager');
    }

    showUpload() {
        this.showView('upload-container', 'UiManager');
    }

    initializeViews() {
        this.views = {
            'dashboard-container': new DashboardView(),
            'upload-container': new UploadView(),
            'reports-container': new ReportsView(),
            'settings-container': new SettingsView()
        };
    };
    
    
    renderViews() {
        this.hideAllViews();
        this.contentContainer.innerHTML = '';   
        this.contentContainer.appendChild(this.views['dashboard-container'].getContainer());
        this.contentContainer.appendChild(this.views['upload-container'].getContainer());
        this.contentContainer.appendChild(this.views['reports-container'].getContainer());
        this.contentContainer.appendChild(this.views['settings-container'].getContainer());
        
    }

    hideAllViews() {
        // Hide all views
        Object.values(this.views).forEach((view) => view.hide());
    }

    setupSubscriptions() {
        this.refact.subscribe('view', (viewId) => {
            if (viewId && viewId !== this.refact.state.viewId) {
                this.showView(viewId, 'UiManager');
                this.refact.setState({ view: viewId }, 'UiManager');
            }
        });

        this.refact.subscribe('appStatus', (appStatus) => {
            this.handleAppStatus(appStatus);
        });
    }

    handleAppStatus(appStatus) {
        if (appStatus === 'initializing')
            this.showView('upload-container', 'UiManager');

        if (appStatus === 'ready' || appStatus === 'initialized')
            this.showView('dashboard-container', 'UiManager');
    }

    registerView(name, view) {
        this.views[name] = view;
    }

    initializeViews() {
        this.views = {
            'dashboard-container': new DashboardView(),
            'upload-container': new UploadView(),
            'reports-container': new ReportsView(),
            'settings-container': new SettingsView()
        };
    
        Object.entries(this.views).forEach(([name, view]) => {
            this.registerView(name, view);
            this.contentContainer.appendChild(view.getContainer());
            console.log(`Registered and appended view: ${name}`);
        });

        log(this.views, 'Views');
    
        // Start by showing the dashboard view
        this.showView('dashboard-container', 'UiManager');
    }
}
