class App extends Reactive {
    constructor(container) {
        super(container);
        this.initialize();
    }

    // Default config
    defaultConfig = {
        mode: "prod",
        dataKey: "defect-manager",
        theme: "light",
        dataKeys: ["issues", "index", "statistics", "dataUpdated"],
        dataStatus: 'empty',
        filters : {
            dateStart: new Date('2021-01-01').toISOString(),
            dateEnd: new Date().toISOString(),
            team: 'all',
        },
        view: 'dashboard'
    };

    async initialize() {
        log('[App.initialize] Start App...');
        this.setState({ appStatus: 'initializing' }, 'App.initialize');

        try {
            this.setupDefaults();
            this.setupManagers();
            this.setupSubscriptions();
            this.setupKeyBindings();

            // Loading from Local Storage
            const data = await this.managers.dataManager.loadFromLocalStorage(['issues', 'index', 'statistics', 'dataUpdated']);
            this.setState({ dataSource: 'local_storage' });
            // No data
            if (!data.issues) {
                this.setState({ dataStatus: 'empty', dataSource: 'local_storage', appStatus: 'initialized' }, 'App.initialize');
                return;
            }

            if (!this.state?.data?.index){
                // Set this.state.data.index
                const index = await IndexManager.getStructuredIndex(data.issues);
                const statistics = await StatisticManager.updateStatistics(index);

                this.setState({ ...data, 'index': index, 'statistics': statistics }, 'App.initialize');
                this.managers.dataManager.saveToLocalStorage({ index: index, statistics: statistics });
            }

            this.setState({ appStatus: 'initialized' }, 'App.initialize');
            return true;
        } catch (error) {
            log(error, '[App.initialize] Initialization failed');
            throw error;
        }
    }


    setupKeyBindings() {
        document.addEventListener('keydown', (event) => {
            if (event.shiftKey && ['D', 'd', 'В', 'в'].includes(event.key)) {
                this.logDevInfo();
                return;
            }
        });
    }

    logDevInfo() {
        log(this.refact, '[App] Refact');
        log(this.refact.state, '[App] Refact State');
    }

    setupSubscriptions() {
        // Console
        this.subscribeForConsole();

        // Debug
        this.subscribe('process', (value) => {
            switch (value) {
                case 'logState':
                    log(this.refact, 'Refact');
                    log(this.refact.state, 'Refact State');
                    break;

                case 'test_function':
                    this.test();
                    break;

                case 'cleanup_local_storage_data':
                    this.managers.dataManager.cleanupLocalStorage(false, this.state.dataKeys);
                    break;
                default:
                    log(`[App] Unknown process: ${value}`);
                    break;
            }
        });

        // Handle file uploads and data processing in a single subscription
        this.subscribe('uploadedFile', async (file) => {
            if (!file) return;
            
            try {
                const issues = await this.managers.dataManager.loadFromFile(file);
                const index = await IndexManager.getStructuredIndex(issues);
                const statistics = await StatisticManager.updateStatistics(index);
                
                // Update all related state in a single setState call
                this.setState({
                    issues,
                    index,
                    statistics,
                    dataSource: 'file',
                    dataUpdated: file.lastModified,
                    dataStatus: 'loaded'
                }, 'App.handleFileUpload');

                // Save to localStorage after state update
                this.managers.dataManager.saveToLocalStorage({ 
                    issues,
                    index,
                    statistics
                });
            } catch (error) {
                log(error, '[App] Error processing uploaded file');
                this.setState({ 
                    dataStatus: 'error',
                    error: error.message
                }, 'App.handleFileUpload');
            }
        });

    }

    // Called by state.process.test_function change
    test() {
        log('[App] Test');
        this.setState({ toast: { message: 'Toast is HERE', type: 'info', duration: 3000 } }, 'App.test');
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
            appStatus: null,
            dataStatus: null,
            config: null,
            issues: null,
            index: null,
            statistics: null,
            toast: null,
            filters: null,
            view: null,
            uploadedFile: null,
            reportType: null
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

        this.setState({
            config: this.managers.config
        }, 'App.setupManagers');
    }

    logStates(){
        log(this.refact, '[App] Refact');
    }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const app = new App(document.getElementById('app'));
});
