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
        
        this.issueTableRow.appendChild(this.table.getContainer());

        return this.container;
    }


    update(indexedIssues) {
        if (!indexedIssues['defect']) {
            log(indexedIssues, 'Indexed defects not ready');
            return;
        }

        // Get unresolved defects from the state index
        const unresolvedDefects = indexedIssues['defect']['state']?.unresolved || [];
        
        // Update defects card
        this.defectsCard.setValue(unresolvedDefects.length);
        
        // Update table
        const tableData = unresolvedDefects.map(issue => ({
            task: issue.taskId,
            description: issue.description || issue.summary,
            status: issue.status,
            priority: issue.priority,
            assignee: issue.assignee,
            created: new Date(issue.created).toLocaleDateString()
        }));
        
        this.table.updateItems(tableData);
        
        // Sort by date for the timeline
        this.unresolvedByDate = unresolvedDefects.sort((a, b) => new Date(a.created) - new Date(b.created));
        this.unresolvedByMonth = IndexManager.groupByMonth(this.unresolvedByDate);
        this.defectsCard.drawMonthLine(
            this.unresolvedByMonth
        );
        // Get all issues for the current month
      
    }
    //     this.defectsCard.drawDateLine(
    //         this.unresolvedByMonth.map(
    //             month => this.unresolvedByMonth[month].length
    //         )
    //     );
    //     log(this.unresolvedByMonth, 'unresolvedByMonth');
    // }

    setupSubscriptions() {
        // // Listen for direct issues updates
        // this.state.subscribe('issues', (issues) => {
        //     if (!issues) return;
        //     this.update(issues);
        // });

        // // Listen for grouped index updates
        // this.state.subscribe('index', (index) => {
        //     if (!index) return;
        //     this.update(index);
        // });
    }
}