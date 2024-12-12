class App extends Reactive {
    constructor(container) {
        super(container);
        
        this.setState({ appStatus: 'loading' }, 'App.init');
        this.init()
            .then(() => {
                return this.loadData();
            })
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    // Convert taskId object to a flat array of issues
                    const issues = Object.values(data.taskId).flat();
                    this.managers.statisticManager.updateStatistics(issues);
                    
                    this.setState({
                        index: data,
                        issues: issues,
                        appStatus: 'loaded'
                    }, 'App.init');
                    this.managers.viewController.showView('dashboard');
                } else {
                    this.setState({ 
                        index: null,
                        appStatus: 'loaded' 
                    }, 'App.init');
                    this.managers.viewController.showView('upload');
                }
            })
            .catch(error => {
                console.error('[App] Error during initialization:', error);
                this.setState({ 
                    index: null,
                    appStatus: 'loaded',
                    appError: error 
                }, 'App.init');
                this.managers.viewController.showView('upload');
            });
    }

    setupSubscriptions() {
        // Console
        this.subscribeForConsole();

        // Debug
        this.subscribe('process', (value) => {
            switch (value) {
                case 'logState':
                    log(this.managers, 'Managers');
                    log(this.refact, 'Refact');
                    log(this.refact.state, 'State');
                    break;
                case 'test_function':
                    this.test();
                    break;
            }
        });

        // Index
        this.subscribe('index', (index) => {
            log(this.state,'[App] State');
            
            // Only show dashboard if we have valid data
            if (index && Object.keys(index).length > 0) {
                this.managers.viewController.showView('dashboard');
            }
        });

        this.subscribe('statistics', (statistics) => {
            log(statistics, '[App] Statistics');
            
            if (this.state.statistics && typeof this.state.statistics !== undefined){
            this.managers.viewController.showView('dashboard');
            }
        }
        );
        
    }

    loadData() {
        return new Promise((resolve, reject) => {
            try {
                this.managers.dataManager.loadFromLocalStorage(['index'])
                    .then(data => {
                        if (!data || Object.keys(data).length === 0) {
                            console.warn('[App] No data found in LocalStorage');
                            resolve(null);
                            return;
                        }
                        
                        this.setState({ data }, 'App.loadData');
                        log(data, '[App] Loaded data from LocalStorage');
                        resolve(data);
                    })
                    .catch(error => {
                        console.warn('[App] Error loading from LocalStorage:', error);
                        resolve(null);
                    });
            } catch (error) {
                console.error('[App] Error in loadData:', error);
                reject(error);
            }
        });
    }
    
    // Default config
    defaultConfig = {
        mode: "prod",
        dataKey: "defect-manager",
        theme: "light",
        filters : {
            dateStart: new Date('2021-01-01').toISOString(),
            dateEnd: new Date().toISOString(),
            team: 'all'
        }
    };

    test() {
        log('[App] Test');
        this.setState({ toast: { message: 'Toast is HERE', type: 'info', duration: 3000 } }, 'App.test');
    }

    init() {
        this.setState({ appStatus: 'loading' }, 'App.init');
        return new Promise((resolve, reject) => {
        try {    
            this.setupDefaults();
            this.setupManagers();
            this.setupSubscriptions();
            this.subscribeForConsole();

            resolve(true);
        } catch (error) {
            reject(error);
        }
    })
    }

    subscribeForConsole() {
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;

        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            const errorMessage = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : arg
            ).join(' ');
            this.setState({ toast: { message: errorMessage, type: 'error', duration: 5000 } }, 'App.subscribeForConsole');
        };

        console.warn = (...args) => {
            originalConsoleWarn.apply(console, args);
            const warnMessage = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : arg
            ).join(' ');
            this.setState({ toast: { message: warnMessage, type: 'warning', duration: 4000 } }, 'App.subscribeForConsole');
        };

        window.addEventListener('error', (event) => {
            const errorMessage = `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
            this.setState({ toast: { message: errorMessage, type: 'error', duration: 5000 } }, 'App.subscribeForConsole');
        });

        window.addEventListener('unhandledrejection', (event) => {
            const errorMessage = `Unhandled Promise Rejection: ${event.reason}`;
            this.setState({ toast: { message: errorMessage, type: 'error', duration: 5000 } }, 'App.subscribeForConsole');
        });
    }

    setupDefaults() {
        this.dataKey = 'defect-manager';
        this.managers = {};
        this.refact.setState({
            config: this.defaultConfig,
            defects: {},
            requests: {},
            tasks: {},
            toast: null,
            dataKey: 'defect-manager',
            filters: null,
            dataSource: 'storage',
            currentView: null,
            dataStatus: 'empty',
            statistics: null,
            appStatus: 'setupManagers',
            issues: null,
            reportType: null,
            uploadedFile: null  // Add this to prevent unknown source later
        }, 'App.setDefaultStates');
    }

    setupManagers() {
        this.managers = {
            config: new ConfigManager(this.defaultConfig),
            dataManager: new DataManager(this.dataKey),
            viewController: new ViewController(this.getContainer()),
            statisticManager: new StatisticManager(),
            reportManager: new ReportManager(),
            dataTransformer: new DataTransformer()
        };
    }

    logStates(){
        log(this.refact, '[App] Refact');
    }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const app = new App(document.getElementById('app'));
});
