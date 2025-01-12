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
            this.defectsCard.setValue(0);
            this.defectsCard.setTrend(0);
            this.defectsCard.drawDateLine([3, 9, 6, 12, 15, 18, 21, 24, 27, 30, 33, 36]);
            this.chartsRow.appendChild(this.defectsCard.getContainer());
        }

        if (!this.sideMenuContainer) {
            // Создаем side-menu как обычный div-контейнер
            this.sideMenuContainer = this.createElement('div', {
                className: 'side-menu-container',
                id: 'side-menu-container'
            });
            
            // Создаем компонент меню
            this.sideMenu = new SideMenuComponent();
            this.sideMenuContainer.appendChild(this.sideMenu.getContainer());
            
            this.getContainer().appendChild(this.sideMenuContainer);
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