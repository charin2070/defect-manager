class DashboardView extends View {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.createView();
        this.setupSubscriptions();
        this.slidePanel = SlidePanel.getInstance();
    }

    createView() {
        // Container
        const container = this.createElement('div', {
            id: 'dashboard-view',
            className: 'p-8 w-full max-w-7xl mx-auto no-cursor-select'
        });
        this.setContainer(container);

        // Cards row
        this.topCardsRow = this.createElement('div', {
            id : 'top-cards-row',
            className: 'flex flex-row flex-wrap justify-start gap-8 my-8 p-4 w-full no-cursor-select'
        });
        container.appendChild(this.topCardsRow);

        // Chart container
        this.chartContainer = this.createElement('div', { 
            id: 'defects-chart-container',
            className: 'mb-8 p-6 rounded-lg w-full bg-white shadow-sm no-cursor-select'
        });
        container.appendChild(this.chartContainer);

        // Initialize DataStats
        this.dataStats = new DataStats(this.topCardsRow, {
            theme: 'light',
            layout: 'detailed',
            columns: 3,
            showChange: true,
            onStatClick: (statId) => this.handleStatClick(statId)
        });

        // Initial render with loading state
        this.showCards();
    }

    handleStatClick(statId) {
        const slidePanel = SlidePanel.getInstance();
        const statistics = this.refact.state.statistics;

        if (!statistics || !statistics.defects || !statistics.requests) {
            console.warn('[DashboardView] Statistics object is incomplete', statistics);
            return;
        }

        const isDefects = statId.includes('defects');
        const { defects, requests } = statistics;

        const unresolvedIssues = isDefects ? defects?.total?.unresolved || [] : requests?.total?.unresolved || [];

        if (unresolvedIssues.length > 0) {
            const issueTable = new IssueTable(
                ['taskId', 'status', 'description', 'created'],
                { isUpperCase: false }
            );
            issueTable.render(unresolvedIssues);
            const title = isDefects ? 'Открытые дефекты' : 'Открытые доработки';
            slidePanel.open(issueTable.container, title);
        }
    }

    showCards() {
        // Get count of object entries
        const statistics = this.refact.state.statistics;

        this.dataStats.update([
            {
                id: 'defects',
                label: 'Дефекты',
                icon: 'src/image/jira-defect.svg',
                value: 0,
                change: 0,
                loading: !statistics,
                attributes: {
                    'data-card-type': 'defect'
                }
            },
            {
                id: 'requests',
                label: 'Запросы',
                icon: 'src/image/trigger.svg',
                value: 0,
                change: 0,
                loading: !statistics
            }
        ]);
    }

    setupSubscriptions() {
        this.refact.subscribe('statistics', (statistics) => {
            if (!statistics) return;

            const stats = [
                {
                    id: 'defects_stats',
                    label: 'Дефекты',
                    value: statistics.defects?.total?.unresolved?.length || 0,
                    previousValue: statistics.defects?.lastMonth?.unresolved?.length || 0,
                    icon: 'src/image/jira-defect.svg',
                    footer: `${statistics.defects?.currentMonth?.unresolved?.length || 0} в этом месяце`
                },
                {
                    id: 'requests_stats',
                    label: 'Доработки',
                    value: statistics.requests?.total?.unresolved?.length || 0,
                    previousValue: statistics.requests?.lastMonth?.unresolved?.length || 0,
                    icon: 'src/image/jira-task.svg',
                    footer: `${statistics.requests?.currentMonth?.unresolved?.length || 0} в этом месяце`
                },
                {
                    id: 'reports_stats',
                    label: 'Обращения',
                    value: statistics.defects?.total?.reports || 0,
                    previousValue: statistics.defects?.lastMonth?.reports || 0,
                    icon: 'src/image/jira-report.svg',
                    footer: `${statistics.defects?.currentMonth?.reports || 0} в этом месяце`
                }
            ];

            this.dataStats.update(stats);
        });
    }
}