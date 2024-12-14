class App extends Reactive {
    constructor(container) {
        super(container);
        
        this.setState({ appStatus: 'loading' }, 'App.init');
        this.init()
            .then(() => this.setState({ appStatus: 'initialized' }, 'App.init'))
            .catch(error => log(error, '[App] Error during init'));
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
                case 'cleanup_local_storage_data':
                    this.managers.dataManager.cleanupLocalStorageData();
                    break;
                case 'cleanup_local_storage':
                    this.managers.dataManager.cleanupLocalStorage(true);
                    break;
            }
        });

        this.subscribe('dataStatus', (dataStatus) => {
            switch (dataStatus) {
                case 'loading': 
                    break;
                case 'empty': 
                    this.managers.viewController.showView('upload');
                    break;
                case 'loaded': 
                    this.managers.viewController.showView('dashboard');
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
                this.managers.dataManager.loadFromLocalStorage(['index', 'issues'])
                    .then(data => {
                        if (!data || Object.keys(data).length === 0) {
                            log('Данные не найдены в локальном хранилище', '[App]');
                            resolve(null);
                            return;
                        }
                        
                        this.setState({ data }, 'App.loadData');
                        log(data, '[App] Loaded data from LocalStorage');
                        resolve(data);
                    })
                    .catch(error => {
                        log('Ошибка при загрузке данных:', error);
                        resolve(null);
                    });
            } catch (error) {
                console.error('Ошибка в loadData:', error);
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
        const consoleMethods = ['error', 'warn'];
        consoleMethods.forEach(method => {
            const original = console[method];
            console[method] = (...args) => {
                original.apply(console, args);
                const message = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' ');
                
                if (message.includes('Данные не найдены') || message.includes('No data found')) {
                    return;
                }
                
                const type = method === 'error' ? 'error' : 'warning';
                this.setState({ toast: { message, type, duration: 5000 } }, `App.subscribeForConsole:${method}`);
            };
        });
    
        window.addEventListener('error', event => {
            const message = `Ошибка: ${event.message}`;
            this.setState({ toast: { message, type: 'error', duration: 5000 } }, 'App.subscribeForConsole');
        });
    
        window.addEventListener('unhandledrejection', event => {
            const message = `Необработанная ошибка: ${event.reason}`;
            this.setState({ toast: { message, type: 'error', duration: 5000 } }, 'App.subscribeForConsole');
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
