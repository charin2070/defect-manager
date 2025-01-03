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
        this.managersInitialized = false;
        this.initialize();
    }


    test() {
        log('[App] Test');
        this.refact.setState({ toast: { message: 'Toast is HERE', type: 'info', duration: 3000 } }, 'App.test');
    }


    async initialize() {
        log('[App] Initializing...');

        const startTime = performance.now();
        this.refact.setState({ appStatus: 'initializing' }, 'App. initialize');

        try {
            this.setupKeyBindings();
            this.setupManagers();

            // Data loading
            const issues = await this.managers.dataManager.loadFromLocalStorage();
            this.setupSubscriptions();
        } finally {

            this.refact.setState({ appStatus: 'initializied' }, 'App.initialize');
            const endTime = performance.now();
            const loadingTime = (endTime - startTime).toFixed(2);
            
            log(`[App] Loading in: ${loadingTime} ms`);
        }
    }


     setupManagers() {
        if (this.managersInitialized) return;

        log('[App.setupManagers] Setting up managers...');

        // Create managers in dependency order
        this.managers = {
            configManager: new ConfigManager(this.appContainer),
            dataManager: new DataManager(this.appContainer),
            uiManager: new UiManager(this.appContainer),
            statisticManager: new StatisticManager(this.appContainer),
            reportManager: new ReportManager(this.appContainer)
        };

        this.managersInitialized = true;
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

        this.refact.subscribe('issues', (issues) => {
            log('✅ Issues state changed:', issues);
            if (!issues || !Array.isArray(issues) || issues.length === 0) {
            this.managers.uiManager.showView('upload');
                return;
            }

            let issueIndex = IndexManager.getStructuredIndex(issues);
            log(issueIndex, '✅ [App] issueIndex');
            this.managers.statisticManager.updateStatistics({ index: this.managers.dataManager.getIndex(), issues });
            this.managers.uiManager.showView('dashboard');
        });

    }


    setupDefaults() {

        // const defaultState = {
        //     ...App.defaultConfig,
        //     currentView: null,
        //     issues: null,
        //     dataStatus: null
        // };
        // this.refact.setState(defaultState, 'App.setupDefaults');
    }

    getContainer() {
        return this.appContainer;
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
