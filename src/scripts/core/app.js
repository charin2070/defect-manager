class App extends Reactive {
    constructor(container) {
        try {
            super(container);
            this.refact = new Refact(container);
            const defaultConfig = {
                mode: "prod",
                dataPrefix: "defect-manager",
                theme: "light",
                filters: {}
            };
            this.config = new ConfigManager(defaultConfig);
            this.managers = {};
            this.init();
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    init() {
        this.setDefaultStates();
        this.setupManagers();
    }

    // Default config
    defaultConfig = {
        mode: "prod",
        dataPrefix: "defect-manager",
        theme: "light",
        filters : {
            dateStart: new Date('2021-01-01').toISOString(),
            dateEnd: new Date().toISOString(),
            team: 'all'
        }
    };

    setDefaultStates() {
        // Set all initial states in one batch
        this.refact.setState({
            config: this.config.config,  // Use already loaded config instead of triggering a new load
            filters: this.config.config.filters,
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
            dataManager: new DataManager(this.config.config.dataPrefix),
            viewController: new ViewController(this.getContainer()),
            statisticManager: new StatisticManager(),
            reportManager: new ReportManager(),
            dataTransformer: new DataTransformer()
        };

        this.setupSubscriptions();
        this.refact.setState({ appStatus: 'initialized' }, 'App.setupManagers');
        console.log('[App] Initialized');
    }

    setupSubscriptions() {
        // Config
        this.subscribe('config', (config) => {
            this.config.config = config;
        });

        // Debug
        this.subscribe('debug', (value) => {
            switch (value) {
                case 'logState':
                    log(this.managers, 'Managers');
                    log(this.refact, 'Refact');
                    log(this.refact.state, 'State');
                    break;
            }
        });

        // Data status
        this.subscribe('dataStatus', (dataStatus) => {
            if (dataStatus === 'loaded') {        
                this.loadData();
            } else if (dataStatus === 'empty') {
                console.log('[App] No data loaded, showing upload view');
                this.showUploadView();
            }
        });

        // Check initial data status after setup
        setTimeout(() => {
            const issues = this.managers.dataManager.getIssues();
            if (!issues || issues.length === 0) {
                this.setState({ dataStatus: 'empty' }, 'App.checkInitialData');
            }
        }, 0);
    }

    loadData(){
        const issues = this.managers.dataManager.getIssues();
        if (!issues || issues.length === 0) {
            console.log('[App] No data available, showing upload view');
            this.setState({ dataStatus: 'empty' }, 'App.loadData');
            return;
        }

        const statistics = StatisticManager.getFullStatistics(issues);
        this.setState({ statistics: statistics }, 'App.loadData');
        this.setState({ view: 'dashboard' }, 'App.loadData');
    }

    showUploadView() {
        this.managers.viewController.showView('upload');
        this.setState({ currentView: 'upload' }, 'App.showUploadView');
    }

    logStates(){
        log(this.refact, 'React');
    }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const app = new App(document.getElementById('app'));
});
