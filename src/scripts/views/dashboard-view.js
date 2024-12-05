class DashboardView extends View {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.createView();
        this.setupReactivity();
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
            this.defectsCard = new InfoCard(this.topCardsRow, {
                title: 'Отркрытых дефектов',
                content: 'Загрузка...',
                iconSvg: 'src/img/jira-defect.svg',
                footer: 'Загрузка...'
            });
            this.defectsCard.element.addEventListener('click', () => {
                const slidePanel = SlidePanel.getInstance();
                slidePanel.setTitle('Unresolved Tasks');
                const unresolvedIssues = this.refact.state.statistics.total.unresolvedIssues;
                const issueTable = new IssueTable(
                    ['taskId', 'reports', 'status', 'description', 'created'],
                    { isUpperCase: false }
                );
                issueTable.render(unresolvedIssues);
                slidePanel.updateContent(issueTable.container);
                slidePanel.open();
            });
            this.refact.subscribe('statistics', (statistics) => {
                if (!statistics) return;
                this.defectsCard.updateContent(statistics.total.unresolved, `${statistics.currentMonth.created} в этом месяце`);
            });
    
            // Reports
            this.unresolvedReportsCard = new InfoCard(this.topCardsRow, {
                title: 'Непрочитанных обращений',
                content: 'Загрузка...',
                iconSvg: 'src/img/jira-report.svg',
                footer: 'Общее количество обращений'
            });
  
    }

    setupReactivity() {
        this.refact.subscribe('defects', (defects) => {
            if (!defects) return;

            const { unresolved, reports } = statistics;
    });
    }

}
