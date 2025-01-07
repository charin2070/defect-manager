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
            dataRange: {dateStart: new Date('2021-01-01'), dateEnd: new Date()},
            team: '*',
            project: 'AI',
        },
        view: 'none'
    };

    constructor(appContainer) {
        if (!appContainer) {
            throw new Error('App container is required');
        }

        this.appContainer = appContainer;
        this.refact = new Refact(appContainer);
        this.refact.setState({app: this}, 'App.constructor');
        this.managersInitialized = false;
        this.initialize();
    }


    test() {
        log('[App] Test');
        this.refact.setState({ toast: { message: 'Toast is HERE', type: 'info', duration: 3000 } }, 'App.test');
    }

    filterIssues = async (filters, callback) => {
        const filteredIssues = await IndexManager.filterIssues(filters, this.refact.state.issues);
        callback(filteredIssues);

        log(filteredIssues, 'APP FILTERED');
    }


    async initialize() {
        const startTime = performance.now();
        log('[App] Initializing...', 'App.initialize');
        
        try {
            // Initialize state with default values
            this.refact.setState({
                issues: [],
                filters: null,
                view: 'none',
                index: {},
                statistics: {},
                groupedIssues: {},
                appStatus: 'initializing'
            }, 'App.initialize', true); // Added batch update flag

            // Setup core functionality in parallel
            await Promise.all([
                this.setupManagers(),
                this.setupSubscriptions(),
                this.setupKeyBindings(),
                this.managers?.dataManager?.loadFromLocalStorage()
            ].filter(Boolean));
            
            // Set app as initialized
            this.refact.setState({ appStatus: 'initialized' }, 'App.initialize');
            
            const endTime = performance.now();
            const loadingTime = (endTime - startTime).toFixed(2);
            log(`[App] Loading in: ${loadingTime} ms`);
        } catch (error) {
            console.error('[App] Error during initialization:', error);
            this.refact.setState({ error: error.message, appStatus: 'error' }, 'App.initialize');
        }
    }

    setupManagers() {
        if (this.managersInitialized) return;

        log('[App.setupManagers] Setting up managers...');
        
        // Create managers in parallel
        const managerPromises = {
            configManager: new ConfigManager(this.appContainer),
            uiManager:  new UiManager(this.appContainer),
            dataManager: new DataManager(this.appContainer),
            indexManager: new IndexManager(),
            statisticManager: new StatisticManager(this.appContainer),
            reportManager: new ReportManager(this.appContainer)
        };

        this.managers = {};
        
        // Initialize managers in parallel
        return Promise.all(Object.entries(managerPromises).map(async ([name, manager]) => {
            this.managers[name] = manager;
            if (manager.initialize) {
                await manager.initialize();
            }
            log(`${name} initialized:`, manager);
        })).then(() => {
            log('All managers initialized:', this.managers);
            this.managers.configManager.setConfig(App.defaultConfig);
            this.managersInitialized = true;
        });
    }

    setupSubscriptions() {
        this.refact.subscribe('process', (value) => {
            switch (value) {
                case 'logState':
                    log(this, 'App');
                    log(this.refact, 'App State');
                    break;

                case 'test_function':
                    this.test();
                    break;

                case 'cleanup_local_storage_data':
                    if (this.refact?.config?.dataKeys) {
                        this.managers.dataManager.cleanupLocalStorage(false, this.refact.config.dataKeys);
                    } else {
                        log('Error: config.dataKeys is not defined', '[App] cleanup_local_storage_data');
                    }
                    break;

                case 'cleanup_local_storage':
                    this.managers.dataManager.cleanupLocalStorage(true);
                    // Reset state after cleanup
                    this.refact.setState({
                        issues: [],
                        index: {},
                        statistics: {},
                        groupedIssues: {},
                        dataSource: null,
                        process: null
                    }, 'App.cleanupLocalStorage');
                    // Show upload view
                    this.managers.uiManager.showUploadView();
                    break;

                case 'remove_from_local_storage':
                    this.managers.dataManager.cleanupLocalStorage(false);
                    break;

                case 'open_data_file_dialog':
                    this.managers.uiManager.showOpenFileDialog();
                    break;
            }
        });

        // Issues
        this.refact.subscribe('issues', issues => {
            // No issues
            if (!issues || !Array.isArray(issues) || issues.length === 0) {
                this.managers.uiManager.showUploadView();
                return;
            }

            // Build index but don't switch view - let the index subscription handle that
            this.managers.indexManager.buildIndex(issues);
        });

        // Grouped issues
        this.refact.subscribe('index', groupedIndex => {
            console.log('[App] Index state changed:', groupedIndex);
            
            // No issues
            if (!groupedIndex || !groupedIndex.defect || groupedIndex.defect.length === 0) {
                console.log('[App] No valid index data, showing upload view');
                this.managers.uiManager.showUploadView();
                return;
            }

            console.log('[App] Valid index data found, showing dashboard');
            this.managers.uiManager.showDashboard(groupedIndex);
        });

        // Filters
        this.refact.subscribe('filters', async filters => {
            log('FILTERS CHANGED');
            const filteredIssues = IndexManager.filterIssues(filters, this.refact.state.issues);
            this.refact.setState({filteredIssues: filteredIssues}, 'App.setupSubscriptions');
            this.managers.uiManager.updateDashboard(filteredIssues);
            log(filteredIssues, 'Filtered issues');
        });

        // App status
        this.refact.subscribe('appStatus', appStatus => {
            if (appStatus === 'initialized') {
                this.managers.dataManager.loadFromLocalStorage();
            }
            log(`App Status changed to: ${appStatus}`, 'App.setupSubscriptions');
        });

        this.refact.subscribe('filteredIssues', filteredIssues => {
            const indexedIssues = IndexManager.indexIssues(filteredIssues);
            this.managers.uiManager.updateDashboard (indexedIssues);
        });

    }


    logStates() {
        log(this, ' [App] STATES ');
        log(localStorage, 'LOCAL STORAGE');
        log(this.refact.issues, 'ISSUES');
        log(this.refact.index, 'INDEX');
        console.log(this.refact.groupedIssues, 'GROUPED ISSUES');
        console.log(this.refact.statistics, 'STATISTICS');
        // log(this.refact.config, 'CONFIG');
        log(this.refact.state, 'STATE');
    }


    setupKeyBindings() {
        document.addEventListener('keydown', (event) => {
            if (event.shiftKey && ['D', 'd', 'В', 'в'].includes(event.key)) {
                this.logStates();
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
