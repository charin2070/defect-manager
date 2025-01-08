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
        this.initialize(appContainer);
    }

    initialize(appContainer) {
        if (appContainer) {
            this.rootElement = appContainer;
        }
        // Инициализируем базовое состояние
        const initialState = {
            appStatus: 'init',
            config: App.defaultConfig,
            appContainer
        };

        // Создаем менеджеры
        this.managers = {
            uiManager: UiManager.getInstance(),
            dataManager: DataManager.getInstance(),
            indexManager: IndexManager.getInstance(),
            reportManager: ReportManager.getInstance()
        };

        // Создаем менеджер потоков
        this.managers.flowManager = new FlowManager({
            dataManager: this.managers.dataManager,
            indexManager: this.managers.indexManager,
            uiManager: this.managers.uiManager
        }, console);

        // Устанавливаем состояние одним вызовом
        this.setState(initialState, 'App.initialize');
        
        // Переводим в состояние загрузки
        this.setState({ appStatus: 'loading' }, 'App.initialize');

        return this;
    }

    static getInstance(appContainer) {
        return super.getInstance(appContainer);
    }
}

// // Entry
// document.addEventListener("DOMContentLoaded", () => {
//     const appContainer = document.getElementById('app');
//     const refact = new Refact(appContainer);
//     const app = App.getInstance(appContainer);
//     // Сохраняем только необходимые данные, а не весь класс
//     Refact.setGlobal('app', {
//         container: appContainer,
//         status: app.state.appStatus,
//         config: app.state.config
//     });
// }); 