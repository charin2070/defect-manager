class App extends Refact {
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
            dataRange: { dateStart: new Date('2021-01-01'), dateEnd: new Date() },
            team: '*',
            project: 'AI',
        },
        view: 'none'
    };

    constructor(appContainer) {
        super();
        this.setState({ appStatus: 'loading...' }, 'App');
        this.initialize(appContainer);
    }

    initialize(appContainer) {
        if (appContainer) {
            this.rootElement = appContainer;
        }
        this.managers = {
            uiManager: UiManager.getInstance(),
            dataManager: DataManager.getInstance(),
            indexManager: IndexManager.getInstance(),
        };

        // Создаем менеджер потоков
        this.managers.flowManager = new FlowManager({
            dataManager: this.managers.dataManager,
            indexManager: this.managers.indexManager,
            uiManager: this.managers.uiManager
        }, console);
    }

    static getInstance(appContainer) {
        return super.getInstance(appContainer);
    }
}