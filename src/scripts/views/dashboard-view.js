class DashboardView extends ViewComponent {
    constructor() {
        super();
        this.state = Refact.getInstance();
    }

    render() {
        console.log('DashboardView.render');

        if (!this.chartsRow) {
            // Charts row
            this.chartsRow = this.createElement('div', {
                className: 'cards-row',
                id: 'cards-row'
            });
            this.getContainer().appendChild(this.chartsRow);
        }

        if (!this.defectsCard) {
            this.defectsCard = new ChartCard();
            this.defectsCard.setTitle('Дефекты');
            // this.defectsCard.drawDateLine([3, 9, 6, 12, 15, 18, 21, 24, 27, 30, 33, 36]);
            this.defectsCard.bind(this.state);
            this.chartsRow.appendChild(this.defectsCard.getContainer());
        }

        if (!this.issueTableRow) {
            this.issueTableRow = this.createElement('div', {
                className: 'cards-row',
                id: 'issue-table-row'
            });
            this.getContainer().appendChild(this.issueTableRow);
        }
       
        if (!this.issuesComponent) {
            this.issuesComponent = new IssuesComponent();
        }

        if (!this.table) {
            this.table = new TableComponent();
            this.table.createTable({
                headers: ['Task', 'Description', 'Status', 'Priority', 'Assignee', 'Created']
            });
            this.issueTableRow.appendChild(this.table.getContainer());
        }

        return this.container;
    }

    update() {
        const unresolvedDefects = StatisticManager.getUnresolvedDefects();
        const backlog = StatisticManager.getBacklog();
        
        console.log('unresolvedDefects', unresolvedDefects);
        console.log('backlog', backlog);

        if (this.defectsCard) {
            this.defectsCard.setValue(unresolvedDefects.count);
            // this.defectsCard.setTrend(0); // Можно добавить логику расчета тренда
        }

        if (this.table) {
            this.table.updateItems(unresolvedDefects.issues);
        }
    }
}