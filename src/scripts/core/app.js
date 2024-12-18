class App extends Reactive {
    constructor(container) {
        super(container);
        this.container = container;
        this.initialize();
    }

    defaultConfig = {
        mode: "dev",
        dataKey: "defect-manager",
        theme: "light",
        dataKeys: ["issues", "index", "statistics", "dataUpdated"],
        dataStatus: 'empty',
        dataSource: null,
        error: null,
        view: 'upload',
        process: null,
        filters : {
            dateStart: new Date('2021-01-01').toISOString(),
            dateEnd: new Date().toISOString(),
            team: 'all',
        },
    };

    initialize() {
        log('[App.initialize] Start App...');
        this.setState({ appStatus: 'initializing' }, 'App.initialize');

        try {
            this.setupDefaults();
            this.setupSubscriptions();
            this.setupManagers();
            this.setupKeyBindings();

            // Loading data from Local Storage
            this.managers.dataManager.loadFromLocalStorage(['issues', 'index', 'statistics', 'dateUpdated']);
            
        } catch (error) {
            console.error('[App.initialize] Error initializing App:', error);
            this.setState({ error: error }, 'App.initialize');
        }
    }

    // Called by state.process.test_function change
    test() {
        log('[App] Test');
        // this.setState({ index: this.state.index }, 'App.test');
        const statistics = StatisticManager.getStatisticsFromIndex(this.state.index, { dateRange: IndexManager.getDateFilter("all_time") });
        log(statistics, '[App] Statistics');
        // this.setState({ statistics: statistics }, 'App.test');

    }


    setupKeyBindings() {
        document.addEventListener('keydown', (event) => {
            if (event.shiftKey && ['D', 'd', 'В', 'в'].includes(event.key)) {
                this.logDevInfo();
                return;
            }

            if (event.shiftKey && ['C', 'c', 'C', 'c'].includes(event.key)) {
                this.setState({ process: 'cleanup_local_storage' }, 'App.setupKeyBindings');
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
            }
        });

        this.subscribe('uploadedFile', (file) => {
        });
    }

    setupDefaults() {
        log('[App] Setting up defaults...');
        this.setState({
            issues: null,
            index: null,
            statistics: null,
            dataSource: null,
            uploadedFile: null,
        }, 'App.setDefaultStates');
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
            log('Stting up ConfigManager...');
            this.managers.config = new ConfigManager(this.defaultConfig, container);
             this.setState({ config: this.managers.config }, 'App.setupManagers');
            this.managers.chartManager = new ChartManager(container);
            this.setState({ chartManager: this.managers.chartManager }, 'App.setupManagers');
            this.managers.dataManager = new DataManager(container);
            this.managers.viewController = new ViewController(container);
            this.managers.statisticManager = new StatisticManager(container)
            this.managers.reportManager = new ReportManager(container);
            
            this.setState({ managers: this.managers }, 'App.setupManagers');
            log('Managers setup complete');
        } catch (error) {
            console.error('[App.setupManagers] Error:', error);
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
