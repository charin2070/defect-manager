class App {
    static defaultConfig = {
        mode: "dev",
        dataKey: "defect-manager",
        theme: "light",
        dataKeys: ["issues", "index", "statistics", "dataUpdated"],
        dataStatus: 'empty',
        uploadedFile: null,
        dataSource: null,
        appStatus: 'initializing',
        error: null,
        process: null,
        filters: {
            dateStart: new Date('2021-01-01'),
            dateEnd: new Date(),
            team: 'all',
        },
        view: 'dashboard'
    };

    constructor(appContainer) {
        if (!appContainer) {
            throw new Error('App container is required');
        }
        this.appContainer = appContainer;
        this.refact = new Refact(appContainer);
        this.initialize();
    }

    async initialize() {
        const startTime = performance.now(); // Start timing
        log('[App] Initializing...');
        this.refact.setState({ appStatus: 'initializing' }, 'App.initialize');
    
        try {
            // Setup core functionality first
            this.setupKeyBindings();
            await this.setupManagers();
            subscribeForConsole(this.refact);
    
            // Wait for config to load first
            await this.managers.configManager.loadFromLocalStorage();
    
            // Then load data
            const { issues } = await this.managers.dataManager.loadFromLocalStorage();
            log(`[App] Loaded ${issues?.length || 0} issues from localStorage`);
    
            // Setup subscriptions after all data is loaded
            this.setupSubscriptions();
            log('[App] Initialization complete');
        } catch (error) {
            console.error('[App] Error during initialization:', error);
            // Ensure we're in a clean state
            this.managers.dataManager.setEmptyState();
        } finally {
            const endTime = performance.now(); // End timing
            const loadingTime = endTime - startTime;
            log(`[App] Loading time: ${loadingTime.toFixed(2)} milliseconds`); // Log loading time
        }
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

    setupManagers() {
        log('[App.setupManagers] Setting up managers...');
        
        // Create managers in dependency order
        this.managers = {
            configManager: new ConfigManager(this.appContainer),
            dataManager: new DataManager(this.appContainer),
            uiManager: new UiManager(this.appContainer),
            statisticManager: new StatisticManager(this.appContainer),
            reportManager: new ReportManager(this.appContainer)
        };

        return Promise.resolve();
    }

    setupSubscriptions() {
        subscribeForConsole();

        this.refact.subscribe('process', (value) => {
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
    }

    test() {
        log('[App] Test');
        this.refact.setState({ toast: { message: 'Toast is HERE', type: 'info', duration: 3000 } }, 'App.test');
    }

    setupDefaults() {
        log('[App] Setting up defaults...');
        const defaultState = {
            ...App.defaultConfig,
            currentView: 'upload', 
            issues: null,  
            dataStatus: 'empty',
            appStatus: 'ready'
        };
        this.refact.setState(defaultState, 'App.setupDefaults');
    }

    getContainer() {
        return this.appContainer;
    }

    logStates() {
        log(this, '[App] App');
        log(this.state, '[App] App State');
        log(localStorage, '[App] LocalStorage');

    }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const appContainer = document.getElementById('app');
    const app = new App(appContainer);
});
