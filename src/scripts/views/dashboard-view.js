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
        
        if (statId === 'defects') {
            slidePanel.setTitle('Нерешенные дефекты');
            slidePanel.setLogo('src/image/bug-0.svg');

            // Get unresolved defects
            const unresolvedDefects = this.refact.state?.statistics?.defects?.unresolved || [];
            
            // Create and configure issue table
            const issueTable = new IssueTable(['taskId', 'status', 'description', 'reports', 'created']);
            issueTable.showIssues(unresolvedDefects);
            
            // Show panel with issue table
            slidePanel.setContent(issueTable.container);
            slidePanel.show();
        } else if (statId.includes('defects')) {
            const statistics = this.refact.state.statistics;
            if (!statistics || !statistics.defects || !statistics.requests) {
                console.warn('[DashboardView] Statistics object is incomplete', statistics);
                return;
            }

            const { defects, requests } = statistics;

            const unresolvedIssues = defects?.total?.unresolved || [];
            
            if (unresolvedIssues.length > 0) {
                const issueTable = new IssueTable(
                    ['taskId', 'reports', 'status', 'description', 'created'],
                    { isUpperCase: false }
                );
                issueTable.render(unresolvedIssues);
                this.slidePanel.open(issueTable.container, 'Открытые дефекты');
            }
        } else if (statId.includes('reports')) {
            const statistics = this.refact.state.statistics;
            if (!statistics || !statistics.defects || !statistics.requests) {
                console.warn('[DashboardView] Statistics object is incomplete', statistics);
                return;
            }

            const { defects, requests } = statistics;

            const unresolvedIssues = defects?.total?.unresolved || [];
            const issuesWithReports = unresolvedIssues.filter(issue => issue.reports > 0);
            
            if (issuesWithReports.length > 0) {
                const issueTable = new IssueTable(
                    ['taskId', 'reports', 'status', 'description', 'created'],
                    { isUpperCase: false }
                );
                const sortedReports = [...issuesWithReports].sort((a, b) => (b.reports || 0) - (a.reports || 0));
                issueTable.render(sortedReports);
                this.slidePanel.open(issueTable.container, 'Обращения на открытых дефектах');
            }
        } else if (statId.includes('requests')) {
            const statistics = this.refact.state.statistics;
            if (!statistics || !statistics.defects || !statistics.requests) {
                console.warn('[DashboardView] Statistics object is incomplete', statistics);
                return;
            }

            const { defects, requests } = statistics;

            const unresolvedIssues = requests?.total?.unresolved || [];
            
            if (unresolvedIssues.length > 0) {
                const issueTable = new IssueTable(
                    ['taskId', 'status', 'description', 'created'],
                    { isUpperCase: false }
                );
                issueTable.render(unresolvedIssues);
                this.slidePanel.open(issueTable.container, 'Открытые доработки');
            }
        }
    }

    showCards() {
        // Get count of object entries
        const statistics = this.refact.state.statistics;

        this.dataStats.update([
            {
                id: 'defects',
                label: 'Дефекты',
                icon: 'src/image/bug-0.svg',
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
            if (!statistics || !statistics.defects || !statistics.requests) {
                console.warn('[DashboardView] Statistics object is incomplete', statistics);
                return;
            }

            const { defects, requests } = statistics;

            // Безопасное получение значений с дефолтами
            const getArrayLength = (stat, period, field, defaultValue = 0) => {
                return stat?.[period]?.[field]?.length ?? defaultValue;
            };

            const getReportsCount = (stat, period) => {
                return stat?.[period]?.reportsCount ?? 0;
            };

            this.dataStats.update([
                {
                    id: 'defects_stats',
                    label: 'Дефекты',
                    value: "HERE",
                    previousValue: getArrayLength(defects, 'lastMonth', 'unresolved'),
                    icon: 'src/image/layers-0.svg',
                    footer: `${getArrayLength(defects, 'currentMonth', 'all')} в этом месяце`
                },
                {
                    id: 'reports_stats',
                    label: 'Обращения',
                    value: getReportsCount(defects, 'total'),
                    previousValue: getReportsCount(defects, 'lastMonth'),
                    icon: 'src/image/translation.svg',
                    footer: 'на открытых дефектах'
                },
                {
                    id: 'requests_stats',
                    label: 'Доработки',
                    value: getArrayLength(requests, 'total', 'unresolved'),
                    previousValue: getArrayLength(requests, 'lastMonth', 'unresolved'),
                    icon: 'src/image/code.svg',
                    footer: `${getArrayLength(requests, 'currentMonth', 'all')} в этом месяце`
                }
            ]);
        });
    }
}