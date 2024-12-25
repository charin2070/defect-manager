class App {
    constructor(container) {
        this.state = Refact.getInstance(container).state;
        this.refact = Refact.getInstance(container);
        this.container = container;

        this.initialize();
    }

    defaultConfig = {
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
        filters : {
            dateStart: new Date('2021-01-01').toISOString(),
            dateEnd: new Date().toISOString(),
            team: 'all',
        },
        view: 'dashboard'
    };

    initialize() {
        log('[App.initialize] Start App...');
        this.refact.setState({ appStatus: 'loading' }, 'App.initialize');

        try {
            this.setupKeyBindings();
            this.setupManagers();
            this.setupSubscriptions();
            this.setupDefaults();

            // Loading data from Local Storage
            this.managers.dataManager.loadFromLocalStorage(['issues', 'index', 'statistics', 'dateUpdated']);
            
        } catch (error) {
            console.error('[App.initialize] Error initializing App:', error);
            this.refact.setState({ error: error }, 'App.initialize');
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

    logDevInfo() {
        log(this, '[App] App');
        log(this.state, '[App] App State');
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
                this.refact.setState({ toast: { message, type, duration: 5000 } }, `App.subscribeForConsole:${method}`);
            };
        });
    
        window.addEventListener('error', event => {
            const message = `Ошибка: ${event.message}`;
            this.refact.setState({ toast: { message, type: 'error', duration: 5000 } }, 'App.subscribeForConsole');
        });
    
        window.addEventListener('unhandledrejection', event => {
            const message = `Необработанная ошибка: ${event.reason}`;
            this.refact.setState({ toast: { message, type: 'error', duration: 5000 } }, 'App.subscribeForConsole');
        });
    }

    setupSubscriptions() {
        // Console
        this.subscribeForConsole();

        // Debug
        this.subscribe('process', (value) => {
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

    
    // Called by state.process.test_function change
    test() {
        log('[App] Test');
        this.refact.setState({ toast: { message: 'Toast is HERE', type: 'info', duration: 3000 } }, 'App.test');
    }
    

    setupDefaults() {
        log('[App] Setting up defaults...');
        this.refact.setState({
            ...this.defaultConfig,
            currentView: 'dashboard',
            issues: [],  // Initialize empty issues array
            dataStatus: 'empty'
        }, 'App.setupDefaults');
        
        // Initialize view controller
        this.viewController = new ViewController(this.container);
    }

    getContainer() {
        return this.container;
    }

    setupManagers() {
        log('Setting up managers...');
        try {
            const container = this.getContainer();
            this.managers = {};  // Initialize empty object first
            
            // Initialize managers one by one
            log('Setting up ConfigManager...');
            this.managers.config = new ConfigManager(this.defaultConfig, container);
            log('Setting up DataManager...');
            this.managers.dataManager = new DataManager(container);
            log('Setting up ViewController...');
            this.managers.viewController = new ViewController(container);
            log('Setting up StatisticManager...');
            this.managers.statisticManager = new StatisticManager(container);
            log('Setting up ReportManager...');
            this.managers.reportManager = new ReportManager(container);
                
            log('Managers setup complete');
        } catch (error) {
            console.error('[App.setupManagers] Error:', error);
            this.refact.setState({ 
                dataStatus: 'error',
                appStatus: 'error',
                error: error.message
            }, 'App.setupManagers');
            throw error;  // Re-throw to prevent continuation
        }
    }

    logStates(){
        log(this, '[App] App');
        log(this.state, '[App] App State');
        log(localStorage, '[App] LocalStorage');
        
    }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const app = new App(document.getElementById('app'));
});
