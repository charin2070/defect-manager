class App {

    static config = {
        mode: "dev",
    };

    constructor(appContainer) {
        this.refact = new Refact(appContainer);
        this.appContainer = appContainer;
        this.refact.setState({ appStatus: 'loading' }, 'App');
        
        // Managers
        this.initializeManagers();
    }

    initializeManagers() {
        // Managers
        this.uiManager = new UiManager(this.appContainer);
        this.dataManager = new DataManager();
        this.indexManager = new IndexManager();
        this.statisticManager = new StatisticManager();
        
        this.uiManager.bind(this.refact);
        this.dataManager.bind(this.refact);
        this.indexManager.bind(this.refact);
        this.statisticManager.bind(this.refact);

        // Kavkaz data flow manager
        this.flowManager = new FlowManager({
            dataManager: this.dataManager,
            indexManager: this.indexManager,
            uiManager: this.uiManager,
            statisticManager: this.statisticManager
        }, console);
        this.flowManager.bind(this.refact);
        this.flowManager.run();
    }
}