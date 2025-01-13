class UiManager extends HtmlComponent {
    constructor(appContainer) {
        super();
        this.appContainer = appContainer;
        this.refact = null;
        this.views = {};
        this.currentView = null;
        this.initialized = false;
        this.contentContainer = null;
        this.loaderElement = null;
        this.loaderTimeout = null;
        this.navbar = null;
    }

    bind(refact) {
        this.refact = refact;
        this.listen();
        this.initializeComponents();
        this.initializeViews();
        this.initSlidePanels();

        return this;
    }


    listen() {
        this.refact.subscribe('index', (index) => {
            if (index) {
               
            }
        });
    }

    initializeComponents() {
        if (!this.appContainer) {
            console.error(`[UiManager] App container not found. Skipping initialization.`);
            return;
        }

        this.navbar = new NavbarComponent();
        const navbarElement = this.navbar.getContainer();
        if (navbarElement) {
            this.navbar.addMenuItem({side: 'right',icon: 'src/image/menu.svg',title: '',callback: () => {this.settingsSlidePanel?.open();}});
        }
        if (navbarElement) {
            this.appContainer.appendChild(navbarElement);
        }

        this.createSideMenu();

        this.projectDropdown = new DropdownComponent();
        const projectDropdownElement = this.projectDropdown.getContainer();
        const projectItems = [
            { text: 'Альфа Инвестиции', icon: 'src/image/alfa_logo.png', iconSize: '2em', callback: () => {console.log('Project 1 selected');}},
            { text: 'Go Invest', icon: 'src/image/go.png', iconSize: '2em', callback: () => {console.log('Project 2 selected');}},
        ];
        this.projectDropdown.setItems(projectItems);
        this.projectDropdown.hiddenTitle = true;
        this.projectDropdown.setActiveItemIndex(0);
        if (projectDropdownElement) {
            this.navbar.appendComponent(this.projectDropdown, 'left');
        }

        this.contentContainer = new HtmlComponent();
        const contentElement = this.contentContainer.createElement('div', {
            className: 'content-container',
            id: 'content-container',
        });
        this.contentContainer.setContainer(contentElement);
        if (contentElement) {
            this.appContainer.appendChild(contentElement);
        }

    }

    createSideMenu() {
        if (!this.sideMenuContainer) {
            this.sideMenuContainer = this.createElement('div', {
                className: 'side-menu-container',
                id: 'side-menu-container'
            });
            this.sideMenu = new SideMenuComponent();
            const sideMenuElement = this.sideMenu.getContainer();

            this.sideMenuItems = [
                {
                    icon: 'src/image/backlog-0.svg',
                    text: 'Бэклог',   
                },
                {
                    icon: 'src/image/team-5.svg',
                    text: 'Команды',
                    id: 'teams'
                },
                {
                    icon: 'src/image/sla-1.svg',
                    text: 'SLA',
                    subItems: [
                        {
                            // icon: 'src/image/chart.svg',
                            text: 'За месяц'
                        },
                        {
                            // icon: 'src/image/chart.svg',
                            text: 'За всё время'
                        }
                    ]
                },
                {
                    icon: 'src/image/user-tag.svg',
                    text: 'Обращения',
                },
                { 
                    icon: 'src/image/settings-0.svg',
                    text: 'Настройки',
                    subItems: [
                        {
                            icon: 'src/image/upload-0.svg',
                            text: 'Загрузить файл',
                            onClick: () => {
                                this.views.upload.fileInput && this.views.upload.fileInput.showFilePicker();
                            }
                        },
                        {
                            icon: 'src/image/trash-bin-0.svg',
                            text: 'Очистить данные',
                            onClick: () => {
                                setSvgFillColor('src/image/trash-bin-0.svg', 'red'); // Set icon
                            }
                        }
                    ]
                }
            ];
        
            this.sideMenu.setItems(this.sideMenuItems);


            // Слушаем событие сворачивания меню
            sideMenuElement.addEventListener('collapseChange', (e) => {
                if (e.detail.collapsed) {
                    this.sideMenuContainer.style.width = 'var(--menu-collapsed-width, 56px)';
                } else {
                    this.sideMenuContainer.style.width = 'var(--menu-width, 240px)';
                }
            });
            
            this.sideMenuContainer.appendChild(sideMenuElement);
            this.appContainer.appendChild(this.sideMenuContainer);
        }
    }

    initializeViews() {
        this.views = {
            'dashboard': new DashboardView(),
            'upload': new UploadView(),
        };

       this.renderViews(); 
    }

    renderViews() {
        this.hideAllViews();
        const container = this.contentContainer.getElement();
        if (!container) return;

        if (this.views.dashboard) {
            this.views.dashboard.render();
            const dashboardElement = this.views.dashboard.getContainer();
            if (dashboardElement) {
                container.appendChild(dashboardElement);
            }
        }
    }

    update() {
        const index = this.refact.state.index;
        if (this.views.dashboard && index) {
            this.views.dashboard.update(index);
        }
    }
    
    showUpload() {
        this.showView('upload');
    }

    showDashboard() {
        this.showView('dashboard');
    }

    showView(viewName) {
        log(`Showing view: ${viewName}`);
        
        if (!this.views[viewName]) {
            console.warn(`View ${viewName} not found`);
            return;
        }

        // Скрываем текущий view
        this.hideAllViews();

        // Получаем контейнер для views
        const container = this.contentContainer.getContainer();
        if (!container) return;

        // Очищаем контейнер
        // container.innerHTML = '';

        // Показываем новый view
        const view = this.views[viewName];
        this.contentContainer.appendChild(view.getContainer());
        view.show();
        this.currentView = viewName;
    }

    hideAllViews() {
        Object.values(this.views).forEach(view => {
            if (view && typeof view.hide === 'function') {
                view.hide();
            }
        });
    }

    initSlidePanels() {
        this.settingsSlidePanel = new SlidePanel({ isSingle: true });
        this.settingsSlidePanel.name = 'settings-slide-panel';
      
        this.settingsView = new SettingsView();
        this.settingsSlidePanel.setWidth(30);
        this.settingsSlidePanel.setContent(this.settingsView.getContainer());

        document.body.appendChild(this.settingsSlidePanel.panel);
    }

    showLoader(text = '', duration = 2, options = {}) {
        const defaultOptions = {
            spinnerColor: '#3498db',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            textColor: '#333'
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        // Clear any existing loader
        if (this.loaderTimeout) {
            clearTimeout(this.loaderTimeout);
            this.loaderTimeout = null;
        }
        
        // Create loader if it doesn't exist
        if (!this.loaderElement) {
            this.loaderElement = document.createElement('div');
            this.loaderElement.className = 'global-loader';
            
            const spinner = document.createElement('div');
            spinner.className = 'loader-spinner';
            this.loaderElement.appendChild(spinner);
            
            const textElement = document.createElement('div');
            textElement.className = 'loader-text';
            this.loaderElement.appendChild(textElement);
            
            document.body.appendChild(this.loaderElement);
        }
        
        // Update loader text and colors
        const textElement = this.loaderElement.querySelector('.loader-text');
        const spinner = this.loaderElement.querySelector('.loader-spinner');
        
        textElement.textContent = text;
        textElement.style.color = finalOptions.textColor;
        
        this.loaderElement.style.background = finalOptions.backgroundColor;
        spinner.style.borderColor = finalOptions.spinnerColor + '40'; // 40 = 25% opacity
        spinner.style.borderTopColor = finalOptions.spinnerColor;
        
        // Show loader with animation
        this.loaderElement.style.display = 'flex';
        // Trigger reflow to ensure the transition works
        this.loaderElement.offsetHeight;
        this.loaderElement.classList.add('visible');
        
        // Hide loader after duration if specified
        if (duration > 0) {
            this.loaderTimeout = setTimeout(() => {
                this.hideLoader();
            }, duration * 1000);
        }
    }
    
    hideLoader() {
        if (this.loaderElement) {
            this.loaderElement.classList.remove('visible');
            // Wait for the transition to complete before hiding
            setTimeout(() => {
                this.loaderElement.style.display = 'none';
            }, 300); // Match the transition duration from CSS
        }
        if (this.loaderTimeout) {
            clearTimeout(this.loaderTimeout);
            this.loaderTimeout = null;
        }
    }
}
