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
        
        // Инициализируем состояние до создания менеджеров
        this.setState({ 
            appStatus: 'init',
            appContainer,
            config: App.defaultConfig
        }, 'App.constructor');

        // Создаем менеджеры после инициализации состояния
        this.managers = {
            testManager: new TestManager(),
            uiManager: new UiManager(),
            dataManager: new DataManager(),
            indexManager: new IndexManager(),
            reportManager: new ReportManager()
        };

        this.setState({ appStatus: 'loading' }, 'App.constructor');
    }
}

// Entry
document.addEventListener("DOMContentLoaded", () => {
    const appContainer = document.getElementById('app');
    const refact = new Refact(appContainer);
    const app = new App(appContainer, refact);
    Refact.setGlobal(App, app);
});