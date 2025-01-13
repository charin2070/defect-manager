class DashboardView extends ViewComponent {
    constructor() {
        super();
        this.state = Refact.getInstance();
        
        // Create main container
        this.container = this.createElement('div', { className: 'dashboard' });
        
        // Create rows for different sections
        this.chartsRow = this.createElement('div', { className: 'row charts-row' });
        this.backlogRow = this.createElement('div', { className: 'row backlog-row' });
        this.issueTableRow = this.createElement('div', { 
            className: 'cards-row issue-table-row',
            id: 'issue-table-row'
        });
        
        // Append rows to container
        this.container.appendChild(this.chartsRow);
        this.container.appendChild(this.backlogRow);
        this.container.appendChild(this.issueTableRow);
        
        this.render();
    }

    render() {
        // Initialize defects card
        if (!this.defectsCard) {
            this.defectsCard = new ChartCard();
            this.defectsCard.setTitle('Дефекты');
            this.defectsCard.bind(this.state);
            
            // Add wrapper for proper sizing
            const cardWrapper = this.createElement('div', { 
                className: 'chart-card-wrapper',
                style: 'flex: 1; min-width: 400px;'
            });
            cardWrapper.appendChild(this.defectsCard.getContainer());
            this.chartsRow.appendChild(cardWrapper);
        }

         // Initialize request card
         if (!this.requestCard) {
            this.requestCard = new ChartCard();
            this.requestCard.setTitle('Доработки');
            this.requestCard.bind(this.state);
            
            // Add wrapper for proper sizing
            const cardWrapper = this.createElement('div', { 
                className: 'chart-card-wrapper',
                style: 'flex: 1; min-width: 400px;'
            });
            cardWrapper.appendChild(this.requestCard.getContainer());
            this.chartsRow.appendChild(cardWrapper);
        }

        // Initialize backlog card
        if (!this.teamsBacklogCard) {
            this.teamsBacklogCard = new ChartCard();
            this.teamsBacklogCard.setTitle('Бэклог команд');
            this.teamsBacklogCard.bind(this.state);
            
            // Add wrapper for proper sizing
            const cardWrapper = this.createElement('div', { 
                className: 'chart-card-wrapper',
                style: 'flex: 1; min-width: 400px;'
            });
            cardWrapper.appendChild(this.teamsBacklogCard.getContainer());
            this.chartsRow.appendChild(cardWrapper);
        }

        // Initialize issues table
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
        let index = this.state.index;
        console.log(this.state.index);
        // let unresolvedDefects = StatisticManager.getUnresolvedDefects();
        if (index) {
            // Update defects card
            if (this.defectsCard) {
                this.defectsCard.setValue(index.defect.state.unresolved.count || 0);
            }

            if (this.requestCard) {
                this.requestCard.setValue(index.request.length || 0);
                this.requestCard.update();
            }

            // Update backlog card
            if (this.backlogCard) {
                this.backlogCard.update();
            }

            // Update table if needed
            if (this.table) {
                this.table.updateItems(unresolvedDefects.issues);
            }
        }
    }
}
