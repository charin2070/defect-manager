class App extends Reactive {
    constructor(container) {
        super(container);
        this.init().then(() => {
            this.setState({ appStatus: 'ready' }, 'App.init');
            this.loadData();
    });
    }

    loadData(){
        this.setState({ dataStatus: 'loading' }, 'App.loadData');
        return new Promise((resolve, reject) => {
            try {
                const issues = this.managers.dataManager.loadFromLocalStorage(['defect', 'request', 'Task']);
                this.setState({ data: {defects: issues.defect, requests: issues.request, tasks: issues.Task}}, 'App.loadData');
                if (issues.length > 0) {
                    this.managers.viewController.showView('dashboard');
                } else {
                    this.managers.viewController.showView('upload');
                }
                resolve(issues);
            } catch (error) {
                this.setState({ appStatus: 'ready' }, 'App.loadData');
                this.setState({ appError: error }, 'App.loadData');
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
        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            const errorMessage = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : arg
            ).join(' ');
            this.setState({ toast: { message: errorMessage, type: 'error', duration: 5000 } }, 'App.subscribeForConsole');
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
            if (this.state.dataSource != 'storage'){
                this.managers.dataManager.saveToLocalStorage(index.byType);
            }
            this.managers.viewController.showView('dashboard');
        });
        
    }

    logStates(){
        log(this.refact, '[App] Refact');
    }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const app = new App(document.getElementById('app'));
});
