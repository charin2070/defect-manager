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
        
        // Проверяем, что это новый инстанс
        if (!this.constructor.instances?.[this.constructor.name]) {
            // Инициализируем состояние до создания менеджеров
            this.setState({ 
                appStatus: 'init',
                config: App.defaultConfig
            }, 'App.constructor');

            // Создаем менеджеры
            this.managers = {
                testManager: TestManager.getInstance(),
                uiManager: UiManager.getInstance(),
                dataManager: DataManager.getInstance(),
                indexManager: IndexManager.getInstance(),
                reportManager: ReportManager.getInstance()
            };

            // Устанавливаем контейнер после создания менеджеров
            this.setState({ appContainer }, 'App.constructor');
            this.setState({ appStatus: 'loading' }, 'App.constructor');
        }
    }

    static getInstance(appContainer) {
        return super.getInstance(appContainer);
    }
}

// Entry
document.addEventListener("DOMContentLoaded", () => {
    const appContainer = document.getElementById('app');
    const refact = new Refact(appContainer);
    const app = App.getInstance(appContainer);
    Refact.setGlobal(App, app);
});