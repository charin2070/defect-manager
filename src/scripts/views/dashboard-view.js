class DashboardView extends ViewComponent {
    constructor() {
        super();
        this.state = Refact.getInstance();
    }

    render() {
        // Charts row
        this.chartsRow = this.createElement('div', {
            className: 'cards-row',
            id: 'cards-row'
        });
        this.getContainer().appendChild(this.chartsRow);

        this.defectsCard = new ChartCard();
        this.defectsCard.setTitle('Дефекты');
        this.defectsCard.setValue(0);
        this.defectsCard.setTrend(0);
        this.defectsCard.drawDateLine([3, 9, 6, 12, 15, 18, 21, 24, 27, 30, 33, 36]);
        
        this.chartsRow.appendChild(this.defectsCard.getContainer());

        this.issueTableRow = this.createElement('div', {
            className: 'cards-row',
            id: 'issue-table-row'
        });
        this.getContainer().appendChild(this.issueTableRow);
       
        this.issuesComponent = new IssuesComponent();
        this.table = new TableComponent();
        this.table.createTable({
            headers: ['Task', 'Description', 'Status', 'Priority', 'Assignee', 'Created']
        });
        
        this.issueTableRow.appendChild(this.table.getContainer());

        return this.container;
    }


    update(indexedIssues) {
        log(StatisticManager.getUnresolvedDefects(indexedIssues), 'StatisticManager.getUnresolvedDefects');

        const backlog = StatisticManager.getBacklog(indexedIssues);
        console.warn('backlog', backlog);

        this.defectsCard.setValue(StatisticManager.getUnresolvedDefects(indexedIssues)['count']);
        // this.defectsCard.setTrend(0); // Можно добавить логику расчета тренда
        this.table.updateItems(StatisticManager.getUnresolvedDefects(indexedIssues)['issues']);
    }
}