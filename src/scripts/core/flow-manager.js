class FlowManager {
    constructor({ dataManager, indexManager, uiManager, statisticManager } = {}, logger = console) {
        this.logger = logger;
        this.dataManager = dataManager;
        this.indexManager = indexManager;
        this.uiManager = uiManager;
        this.statisticManager = statisticManager;
        this.refact = null;

        this.teamAnalytics = null;
    }

    bind(refact) {
        this.refact = refact;
        this.listen();
        return this;
    }

    run() {
        this.logger.log('[Flow] Запуск потоков данных. (run)');
        // this.uiManager.showLoader('', 3, {spinnerColor: '#DB3434FF', backgroundColor: 'rgba(255, 255, 255, 0.9)', textColor: '#333'});    

        if (!this.isDataExists()) {
            this.logger.log('[Flow] Данные отсутствуют. Загрузка из LocalStorage... (run)');
            this.dataManager.loadIssuesFromLocalStorage();
        }
    }

    listen() {
        this.refact.subscribe('issues', (issues) => {
            if (!issues || issues.length === 0) {
                this.logger.log(`👆 [Flow] Состояние 'issues' обновлено. Данные отсутствуют. Отображение экрана выбора файла.`);
                this.uiManager.showUpload();
                return;
            }

            this.logger.log(`👆 [Flow] Состояние 'Issues' обновлено. Загружено ${issues.length} задач. Построение индекса...`);
            let index = IndexManager.getIndex(issues);
            this.refact.setState({ index: index });
            this.teamAnalytics = new TeamAnalytics(index);


            console.log('Index updated:', index);
            const teamSubItems  = [];
            
            index.teams.forEach((team) => {
                teamSubItems.push({
                    text: team,
                    onClick: () => {
                        console.log('Team selected:', team);
                        let teamAnalytics = this.teamAnalytics.getTeamAnalytics(team);
             
                        console.log('Team analytics updated:', teamAnalytics);
                    }
                })
            });
            this.uiManager.sideMenu.addSubItems('teams', teamSubItems);

            this.statisticManager.getStatistics(this.refact.state.issues, this.refact.state.index);
            console.log(`👆 [Flow] Индекс построен. State:`, this.refact.state);
            this.uiManager.showDashboard();
        }); 

        this.refact.subscribe('dataFilter', ({ issues, filters }) => {
            if (filters) {
                this.logger.log('[Flow] Обновление фильтров');
                this.statisticManager.filterIssues(filters);
            }
        });
    }

    isDataExists() {
        // this.dataManager.cleanupLocalStorage();
        return this.refact.state.issues ? true : (this.refact.state.index && Object.keys(this.refact.state.index).length > 0);
    }
}