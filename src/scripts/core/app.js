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
        this.state = new Refact(appContainer).bind(this);
        this.managersInitialized = false;
        this.initialize();
    }


    test() {
        log('[App] Test');
        this.state.setState({ toast: { message: 'Toast is HERE', type: 'info', duration: 3000 } }, 'App.test');
    }


    async initialize() {
        log('[App] Initializing...');

        const startTime = performance.now();
        this.state.setState({ appStatus: 'initializing' }, 'App. initialize');

        try {
            this.setupKeyBindings();
            this.setupManagers();
      

            // Data loading
            await this.managers.dataManager.loadFromLocalStorage();

        } finally {
            this.setupSubscriptions();
            this.state.setState({ appStatus: 'initializied' }, 'App.initialize');
            const endTime = performance.now();
            const loadingTime = (endTime - startTime).toFixed(2);
            
            log(`[App] Loading in: ${loadingTime} ms`);
        }
    }


     setupManagers() {
        if (this.managersInitialized) return;

        log('[App.setupManagers] Setting up managers...');
        
        this.managers = {
            configManager: new ConfigManager(this.appContainer),
            dataManager: new DataManager(this.appContainer),
            uiManager: new UiManager(this.appContainer),
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

        this.state.subscribe('issues', (issues) => {
            log(this.state, '🔥🔥🔥APP');
            log('✅ Issues state changed:', issues);
            
            if (!issues || !Array.isArray(issues) || issues.length === 0) {
            this.state.setState( { view: 'upload-container' }, 'App.setupSubscriptions');
            log('Not issues found, showing upload container', 'App.setupSubscriptions');
            this.managers.uiManager.showView('upload-container', 'App');    
            return;
            }

            this.state.setState({ view: 'dashboard-container' }, 'App' ) , 'App.setupSubscriptions';
            log('Issues found, showing dashboard container', 'App.setupSubscriptions');
            this.managers.uiManager.showView('dashboard-container', 'App');
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
