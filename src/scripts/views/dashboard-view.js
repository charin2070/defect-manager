class DashboardView extends ViewComponent {
    constructor() {
        super();
        this.state = Refact.getInstance();
        this.setupSubscriptions();
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
        this.table.updateItems([
            {
                task: 'Task 1',
                description: 'Description 1',
                status: 'Status 1',
                priority: 'Priority 1',
                assignee: 'Assignee 1',
                created: 'Created 1',
            },
            {
                task: 'Task 2',
                description: 'Description 2',
                status: 'Status 2',
                priority: 'Priority 2',
                assignee: 'Assignee 2',
                created: 'Created 2',
            },
            {
                task: 'Task 3',
                description: 'Description 3',
                status: 'Status 3',
                priority: 'Priority 3',
                assignee: 'Assignee 3',
                created: 'Created 3',
            },
            {
                task: 'Task 4',
                description: 'Description 4',
                status: 'Status 4',
                priority: 'Priority 4',
                assignee: 'Assignee 4',
                created: 'Created 4',
            }
        ]);

        this.issueTableRow.appendChild(this.table.getContainer());

        return this.container;
    }

    update(data) {
        console.log('[DashboardView] Updating with data:', data);
        
        // Handle both grouped index and direct issues array
        let issues = Array.isArray(data) ? data : (data?.defect || []);
        
        if (!Array.isArray(issues)) {
            console.warn('[DashboardView] No valid data to update with');
            return;
        }

        // Update defects card
        this.defectsCard.setValue(issues.length);
        
        // Update table with actual data
        const tableData = issues.map(issue => ({
            task: issue.taskId,
            description: issue.description || issue.summary,
            status: issue.status,
            priority: issue.priority,
            assignee: issue.assignee,
            created: new Date(issue.created).toLocaleDateString()
        }));
        
        this.table.updateItems(tableData);
    }

    setupSubscriptions() {
        // Listen for direct issues updates
        this.state.subscribe('issues', (issues) => {
            if (!issues) return;
            this.update(issues);
        });

        // Listen for grouped index updates
        this.state.subscribe('index', (index) => {
            if (!index) return;
            this.update(index);
        });
    }
}