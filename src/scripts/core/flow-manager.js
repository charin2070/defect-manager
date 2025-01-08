class FlowManager extends Refact {
    constructor({ dataManager, indexManager, uiManager }) {
        super();
        this.dataManager = dataManager;
        this.indexManager = indexManager;
        this.uiManager = uiManager;

        this.listen();
        this.checkUpdates();
    }

    listen() {
        this.subscribe('issues', (issues) => {
            if (issues) {
                this.indexManager.updateIndex(issues);
            }
        });

        this.subscribe('index', (index) => {
            if (index) {
                this.updateConsumers();
            }
        });

        this.subscribe('dataFilter', ({ issues, filters }) => {
            if (filters) {
                this.statisticManager.filterIssues(filters);
            }
        });
    }

    checkUpdates() {
        const messages = this.state.messages || [];
    }

}