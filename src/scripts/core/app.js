class App {
    static defaultConfig = {
        mode: "dev",
        dataKey: "defect-manager",
        theme: "light",
        dataKeys: ["issues", "index", "statistics", "dataUpdated"],
        dataStatus: 'empty',
        uploadedFile: null,
        dataSource: null,
        appStatus: null,
        error: null,
        process: null,
        filters: {
            dateStart: new Date('2021-01-01'),
            dateEnd: new Date(),
            team: 'all',
        },
        view: 'none'
    };

    constructor(appContainer) {
        if (!appContainer) {
            throw new Error('App container is required');
        }

        this.appContainer = appContainer;
        this.state = new Refact(appContainer);
        this.managersInitialized = false;
        this.initialize();
    }


    test() {
        log('[App] Test');
        this.state.setState({ toast: { message: 'Toast is HERE', type: 'info', duration: 3000 } }, 'App.test');
    }


    async initialize() {
        const startTime = performance.now();
        log('[App] Initializing...', 'App.initialize');
        
        try {
            // Setup core components
            this.setupManagers();
            this.setupSubscriptions();
            this.setupKeyBindings();
            
            // Load data from localStorage
            await this.managers.dataManager.loadFromLocalStorage();
            
            // Set app as initialized after data is loaded
            this.state.setState({ appStatus: 'initialized' }, 'App.initialize');
            
            const endTime = performance.now();
            const loadingTime = (endTime - startTime).toFixed(2);
            log(`[App] Loading in: ${loadingTime} ms`);
        } catch (error) {
            console.error('[App] Error during initialization:', error);
            this.state.setState({ error: error.message, appStatus: 'error' }, 'App.initialize');
        }
    }


     setupManagers() {
        if (this.managersInitialized) return;

        log('[App.setupManagers] Setting up managers...');
        
        this.managers = {
            configManager: new ConfigManager(this.appContainer),
            uiManager: new UiManager(this.appContainer),
            dataManager: new DataManager(this.appContainer),
            statisticManager: new StatisticManager(this.appContainer),
            reportManager: new ReportManager(this.appContainer)
        };

        Object.keys(this.managers).forEach(managerName => {
            console.log(`${managerName} initialized:`, this.managers[managerName]);
            log(`${managerName} initialized:`, this.managers[managerName]);
        });

        log('All managers initialized:', this.managers);
        this.setupSubscriptions();

        this.managersInitialized = true;
    }

    setupSubscriptions() {
        this.state.subscribe('process', (value) => {
            switch (value) {
                case 'logState':
                    log(this, 'App');
                    log(this.state, 'App State');
                    break;

                case 'test_function':
                    this.test();
                    break;

                case 'cleanup_local_storage_data':
                    if (this.state?.config?.dataKeys) {
                        this.managers.dataManager.cleanupLocalStorage(false, this.state.config.dataKeys);
                    } else {
                        log('Error: config.dataKeys is not defined', '[App] cleanup_local_storage_data');
                    }
                    break;
                case 'cleanup_local_storage':
                    this.managers.dataManager.cleanupLocalStorage(true);
                    break;
            }
        });

        // AppStatus
        this.state.subscribe('appStatus', (appStatus) => {
            log(`App Status changed to: ${appStatus}`, 'App.setupSubscriptions');
        });

        // Issues
        this.state.subscribe('issues', (issues) => {
            if (!issues || !Array.isArray(issues) || issues.length === 0) {
                this.managers.uiManager.showUploadView();
                return;
            }

            this.managers.uiManager.showDashboard();
            if (this.state.dataSource === 'file') {
                this.managers.dataManager.saveToLocalStorage();
            }
        });
    }


    logStates() {
        log(this, '[App] App');
        log(this.state, '[App] App State');
        log(localStorage, '[App] LocalStorage');

    }


    setupKeyBindings() {
        document.addEventListener('keydown', (event) => {
            if (event.shiftKey && ['D', 'd', 'В', 'в'].includes(event.key)) {
                this.logDevInfo();
                return;
            }

            if (event.shiftKey && ['C', 'c', 'C', 'c'].includes(event.key)) {
                this.refact.setState({ process: 'cleanup_local_storage' }, 'App.setupKeyBindings');
                return;
            }
        });

    }

}


// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const appContainer = document.getElementById('app');
    const app = new App(appContainer);
});
