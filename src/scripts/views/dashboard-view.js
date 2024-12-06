class DashboardView extends View {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.createView();
        this.setupReactivity();
        this.slidePanel = new SlidePanel();
    }

    createView() {
        // Container
        const container = this.createContainer({
            id: 'dashboard-view',
            className: 'dashboard-container'
        });

        // Cards row
        this.topCardsRow = this.createElement('div', { className: 'cards-row' });
        container.appendChild(this.topCardsRow);

        // Chart container
        this.chartContainer = this.createElement('div', { id: 'defects-chart-container' });
        container.appendChild(this.chartContainer);

        this.createCards();
    }

    addDefectCard(card) {
        this.topCardsRow.appendChild(card);
    }

    clearCards() {
        while (this.topCardsRow.firstChild) {
            this.topCardsRow.removeChild(this.topCardsRow.firstChild);
        }
    }

    showLoader() {
        this.topCardsRow.innerHTML = `
            <div class="loader"></div>
        `;
    }

    createCards() {
            // Defects
            this.defectsCard = new ValueCard(this.topCardsRow, {
                title: 'Дефекты',
                content: 'Загрузка...',
                iconSvg: 'src/img/jira-defect.svg',
                footer: 'Загрузка...'
            });
            this.defectsCard.element.addEventListener('click', () => {
                this.slidePanel.setTitle('Unresolved Tasks');
                const unresolvedIssues = this.refact.state.statistics.total.unresolvedIssues;
                const issueTable = new IssueTable(
                    ['taskId', 'reports', 'status', 'description', 'created'],
                    { isUpperCase: false }
                );
                issueTable.render(unresolvedIssues);
                this.slidePanel.updateContent(issueTable.container);
                this.slidePanel.open();
            });
            this.refact.subscribe('statistics', (statistics) => {
                if (!statistics) return;
                this.defectsCard.updateContent(statistics.total.unresolved, `${statistics.currentMonth.created} в этом месяце`);
            });
    
            // Reports
            this.unresolvedReportsCard = new ValueCard(this.topCardsRow, {
                title: 'Оборащения',
                content: 'Загрузка...',
                iconSvg: 'src/img/trigger.svg',
                footer: ''
            });
            this.unresolvedReportsCard.element.addEventListener('click', () => {
                this.slidePanel.setTitle('Unresolved Reports');
                const unresolvedReports = this.refact.state.statistics.total.unresolvedReports;
                const issueTable = new IssueTable(
                    ['taskId', 'reports', 'status', 'description', 'created'],
                    { isUpperCase: false }
                );
                
                // Sort unresolvedReports by reports count in descending order
                const sortedReports = [...unresolvedReports].sort((a, b) => (b.reports || 0) - (a.reports || 0));
                
                issueTable.render(sortedReports);
                this.slidePanel.updateContent(issueTable.container);
                this.slidePanel.open();
                
                // Trigger sort on the reports column to show sort indicator
                const reportsColumn = issueTable.availableColumns.reports;
                reportsColumn.sortDirection = 'desc';
                issueTable.sortByColumn(reportsColumn);
            });
            this.refact.subscribe('statistics', (statistics) => {
                if (!statistics) return;
                this.unresolvedReportsCard.updateContent(statistics.total.reportsCount, 'на открытых дефектах');
            });
  
    }

    setupReactivity() {
        this.refact.subscribe('defects', (defects) => {
            if (!defects) return;

            const { unresolved, reports } = statistics;
    });
    }

}
