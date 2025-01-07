class UiManager {
    constructor(appContainer) {
        this.refact = Refact.getInstance();
        this.appContainer = appContainer;
        
        // Create content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'content-container';
        this.contentContainer.id = 'content-container';
        this.appContainer.appendChild(this.contentContainer);
        
        this.views = {};
        this.currentView = null;
        this.initializeComponents();
    }

    initializeComponents() {
        this.initializeNavbar();
        this.initializeViews();
        
        // Mount main views to content container
        this.contentContainer.appendChild(this.views['dashboard'].getContainer());
        this.contentContainer.appendChild(this.views['upload'].getContainer());
        this.contentContainer.appendChild(this.views['reports'].getContainer());
        
        // Initialize slide panels after views are mounted
        this.initializeSlidePanels();
        
        this.setupSubscriptions();
    }

    initializeSlidePanels(){
        // Initialize slide panels
        this.settingsSlidePanel = new SlidePanel({ isSingle: true });
        this.settingsView = new SettingsView();
        this.settingsSlidePanel.setWidth(30);
        this.settingsSlidePanel.setContent(this.settingsView.getContainer());
        document.body.appendChild(this.settingsSlidePanel.panel);
        this.settingsView.show();
        
        // Add panels to DOM
        this.issuesSlidePanel = new SlidePanel({ isSingle: true });
        document.body.appendChild(this.issuesSlidePanel.panel);
    }

    initializeNavbar() {
        const navbar = new NavbarComponent();
        
        // Initialize dropdown with proper options
        this.issueTypeDropdown = new DropdownComponent({
            id: 'issue-type-dropdown',
            defaultItem: 0,
            className: 'navbar-dropdown',
            height: '100%',
            fontSize: '1.4em',
            items: [
                {
                    text: 'Дефекты', 
                    callback: () => this.refact.setState({ filter: {type: 'defects'}}, 'UiManager'),  
                    value: 'defects',
                    icon: 'src/image/jira-defect.svg'
                },
                {
                    text: 'Доработки', 
                    callback: () => this.refact.setState({ filters: {type: 'requests'}}, 'UiManager'), 
                    value: 'requests',
                    icon: 'src/image/jira-defect.svg'
                },
                // Separator
                {
                    type: 'separator',
                    text: '---'
                },
                {
                    text: 'Отчёты', 
                    callback: () => this.showReports(), 
                    value: 'reports',
                    icon: 'src/image/translation.svg'
                }
            ]
        });

        this.dataRangeDropdown = new DateRangeDropdown();
        navbar.appendComponent(this.issueTypeDropdown);
        navbar.appendComponent(this.dataRangeDropdown);
        
        navbar.addSearchBox();
        // Upload data file
        navbar.addMenuItem({ side: 'right', icon: 'src/image/upload-svgrepo-com.svg', callback: () => { this.views['upload'].showDataFilePicker() } });
        // Settings
        navbar.addMenuItem({ side: 'right', icon: 'src/image/grid-svgrepo-com.svg', callback: () => this.showSettings() });

        this.appContainer.appendChild(navbar.getContainer());
    }

    showSettings() {
        if (!this.settingsSlidePanel.isOpen) {
            this.settingsSlidePanel.open(this.settingsView.getContainer(), 'Настройки'); // Open SlidePanel with SettingsView
        } else {
            this.settingsSlidePanel.close();
        }
    }

    showUploadView() {
        this.hideAllViews();
        this.views['upload'].show();
    }

    showReports() {
        this.hideAllViews();
        this.views['reports'].show();
    }

    hideSettings() {
        this.settingsSlidePanel.close();
    }

    showView(viewName) {
        if (!this.views[viewName]) {
            console.error(`View "${viewName}" not found`);
            return;
        }

        // Don't rehide/reshow if it's already the current view
        if (this.currentView === viewName) {
            return;
        }

        this.hideAllViews();
        this.views[viewName].show();
        this.currentView = viewName;
    }

    hideAllViews() {
        Object.values(this.views).forEach(view => {
            if (view && typeof view.hide === 'function') {
                view.hide();
            }
        });
    }

    setTitle(title) {
        document.title = title;
    }

    showDashboard(indexedIssues) {
        console.log('[UIManager] Showing dashboard with data:', indexedIssues);
        
        this.hideAllViews();
        this.views['dashboard'].show();
        if (indexedIssues) {
            this.views['dashboard'].update(indexedIssues);
        }
        this.setTitle('Дэшборд');
        this.currentView = 'dashboard';
    }

    initializeViews() {
        const dashboard = new DashboardView();
        const upload = new UploadView();
        const reports = new ReportsView();

        this.views = {
            'dashboard': dashboard,
            'upload': upload,
            'reports': reports,
        };
    };
    
    renderViews() {
        this.hideAllViews();
        this.contentContainer.innerHTML = '';   
        this.contentContainer.appendChild(this.views['dashboard'].getContainer());
        this.contentContainer.appendChild(this.views['upload'].getContainer());
        this.contentContainer.appendChild(this.views['reports'].getContainer());
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
        switch (appStatus) {
            case 'initializing':
                this.showView('upload');
                break;
            case 'initialized':
            case 'ready':
                // Check if there are any issues before showing dashboard
                const issues = this.refact.issues;
                if (!issues || !Array.isArray(issues) || issues.length === 0) {
                    this.showView('upload');
                } else {
                    this.showView('dashboard');
                }
                break;
            default:
                console.log(`Unhandled app status: ${appStatus}`);
        }
    }

    registerView(name, view) {
        this.views[name] = view;
    }

}
