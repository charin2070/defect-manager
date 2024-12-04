class App {
    constructor(container) {
        this.container = container;
        this.refact = new Refact(container);
        this.init();
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

    init() {
        try {
            if (!this.container)
                throw new Error(`App: Parent container not found.`);

            this.config = new ConfigManager(this.defaultConfig);
            this.config.loadConfigFromLocalStorage();

            this.setupState();
            this.setupManagers();
            this.setupEventListeners();


            this.dataManager.loadFromLocalStorage(this.config.config.dataPrefix);

            this.refact.setState({ appStatus: 'initialized' });
            console.log('[App] Initialized');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    setupState() {            
        this.refact.setState({
            config: this.config.config,
            filters: this.config.config.filters,
            view: null,
            statistics: null,
            appStatus: 'initializing',
        });
    }


    setupManagers() {
        this.viewController = new ViewController(this.container);
        this.dataManager = new DataManager(this.config.config.dataPrefix);
        this.statisticManager = new StatisticManager();
        this.reportsManager = new ReportManager();
    }

    setupEventListeners() {
        // Issues
        this.refact.subscribe('issues', (issues) => {
            if (!issues && issues == 'undefined') return;

            this.refact.issues = issues;

            const statistics = StatisticManager.getFullStatistics(issues);
            log(statistics, '📦 Statistics');
            this.refact.setState({
                statistics: statistics
            }, 'App - issues');
            this.showDashboard();
        });
    }

    showDashboard() {
        if (!this.dashboardView) {
            this.dashboardView = new DashboardView();
        }
        this.refact.setState({ currentView: 'dashboard' });
        this.layoutView.setContent(this.dashboardView.getContainer());
    }

    showUploadView() {
        if (!this.uploadView) {
            this.uploadView = new UploadView();
        }
        this.refact.setState({ currentView: 'upload' });
        this.layoutView.setContent(this.uploadView.getContainer());
    }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const app = new App(document.getElementById('app'));
});
