class UiManager extends Refact {
    static instance;

    constructor() {
        super();
        if (!UiManager.instance) {
            UiManager.instance = this;
            this.views = {};
            this.currentView = null;
            this.initialized = false;
            this.#setupSubscriptions();
        }
        return UiManager.instance;
    }

    #setupSubscriptions() {
        // Подписываемся на изменения состояния
        this.subscribe('appContainer', (container) => {
            if (container && !this.contentContainer) {
                this.contentContainer = document.createElement('div');
                this.contentContainer.className = 'content-container';
                this.contentContainer.id = 'content-container';
                container.appendChild(this.contentContainer);
                
                if (!this.initialized) {
                    this.#initializeComponents();
                    this.initialized = true;
                }
            }
        });

        // Подписываемся на изменение статуса
        this.subscribe('appStatus', (status) => {
            if (status === 'loading' && !this.initialized && this.contentContainer) {
                this.#initializeComponents();
                this.initialized = true;
            }
        });
    }

    #initializeComponents() {
        this.initializeNavbar();
        this.initializeViews();
        
        this.contentContainer.appendChild(this.views['dashboard'].getContainer());
        this.contentContainer.appendChild(this.views['upload'].getContainer());
        this.contentContainer.appendChild(this.views['reports'].getContainer());
        
        this.initSlidePanels();
    }

    updateFilter(filter) {
        if (!this.refact || !this.refact.state.filterIssues) {
            console.error('Refact or FilterIssues is not initialized');
            return;
        }

        const currentFilters = this.refact.state.filters || {};
        
        // Обновляем фильтры
        const updatedFilters = { ...currentFilters, ...filter };

        // Применяем фильтры через IndexManager
        const filteredIndex = this.refact.state.filterIssues(updatedFilters, this.refact.state.issues);

        // Обновляем состояние
        this.refact.setState({ 
            filters: updatedFilters,
            filteredIssues: filteredIndex.issues 
        }, 'UiManager');

        // Обновляем dashboard с отфильтрованными данными
        this.updateDashboard(filteredIndex.issues);
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
                    onClick: () => this.updateFilter({type: 'defect'}, 'UiManager'),  
                    value: 'defects',
                    icon: 'src/image/jira-defect.svg'
                },
                {
                    text: 'Доработки', 
                    onClick: () => 
                        {
                            console.log('requests selected');
                            this.updateFilter({type: 'request'}, 'UiManager');  
                        },
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
                    onClick: () => this.showReports(), 
                    value: 'reports',
                    icon: 'src/image/translation.svg'
                }
            ]
        });

        const projectDropdown = new DropdownComponent({ 
            activeItem: 1,
            itemSize: '250px',
         });
         
        const projectItems = [
            {icon: 'src/image/alfa_logo.png', size: '250px', text: ''},
            {icon: 'src/image/go-logo.png', size: '250px', text: ''},
        ];
        projectDropdown.setItems(projectItems);
        projectDropdown.setActiveItem(1);

        this.dataRangeDropdown = new DateRangeDropdown(
            (dateRange) => this.updateFilter({ dateRange: dateRange }, 'UiManager'), 'UiManager');
            
        navbar.appendComponent(projectDropdown);
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

    update(indexedIssues) {
        this.views['dashboard'].update(indexedIssues);
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

    componentWillUnmount() {
        this.subscriptions.unsubscribe();
    }

    initSlidePanels(){
        this.settingsSlidePanel = new SlidePanel({ isSingle: true });
        this.settingsView = new SettingsView();
        this.settingsSlidePanel.setWidth(30);
        this.settingsSlidePanel.setContent(this.settingsView.getContainer());
        document.body.appendChild(this.settingsSlidePanel.panel);
        this.settingsView.show();
        
        this.issuesSlidePanel = new SlidePanel({ isSingle: true });
        document.body.appendChild(this.issuesSlidePanel.panel);
    }
}
