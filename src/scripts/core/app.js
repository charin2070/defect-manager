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

            this.setupStates();
            this.setupManagers();
            this.setupEventListeners();

            this.dataManager.loadFromLocalStorage(this.config.config.dataPrefix);

            this.refact.setState({ appStatus: 'initialized' });
            console.log('[App] Initialized');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    setupStates() {            
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
        this.dataTransformer = new DataTransformer();
    }

    setupEventListeners() {
        // Issues
        this.refact.subscribe('dataStatus', (status) => {
            if (status === 'error') {
                MessageView.showMessage('Ошибка', this.dataManager.lastError || 'Произошла ошибка при загрузке данных', 'OK', () => {
                    this.viewController.showView('dashboard');
                });
                return;
            }

            if (status === 'empty') {
                this.viewController.showView('empty');
                return;
            }

            if (status === 'loaded') {
                this.viewController.showView('dashboard');
                // Get issues from data manager
            const issues = this.dataManager.getIssues();
            if (!issues || !issues.length) return;

            // Transform and update state
            const transformedIssues = issues.map(issue => this.dataTransformer.objectToIssue(issue));
            this.refact.setState({ issues: transformedIssues }, 'App - issues');
            
            // Calculate and update statistics
            const statistics = StatisticManager.getFullStatistics(transformedIssues);
            console.log('📦 Statistics:', statistics);
            this.refact.setState({ statistics }, 'App - statistics');

            // Show dashboard
            this.viewController.showView('dashboard');     

                return;
            }
        });

        // Filters
        this.refact.subscribe('filters', (filters) => {
            this.config.config.filters = filters;
            this.config.saveConfigToLocalStorage();
            this.dataManager.loadFromLocalStorage(this.config.config.dataPrefix);
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
