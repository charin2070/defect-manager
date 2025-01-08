class FlowManager extends Refact {
    constructor({ dataManager, indexManager, uiManager, statisticManager }, logger = console) {
        super();
        
        this.logger = logger;
        this.logger.log('[Flow] Запуск менеджера потоков данных');

        this.dataManager = dataManager;
        this.indexManager = indexManager;
        this.uiManager = uiManager;

        this.listen();
        this.checkupData();
    }

    listen() {
        this.subscribe('index', (index) => {
            if (index) {
                this.logger.log('[Flow] Обновление индекса');
                this.updateConsumers();
            }
        });

        this.subscribe('dataFilter', ({ issues, filters }) => {
            if (filters) {
                this.logger.log('[Flow] Обновление фильтров');
                this.statisticManager.filterIssues(filters);
            }
        });
    }

    checkupData() {
        if (this.state.issues) return;
        if (this.state.index && Object.keys(this.state.index).length === 0) return;
        this.logger.log('[Flow] Загрузка данных');
        this.dataManager.loadFromLocalStorage();
    }

}