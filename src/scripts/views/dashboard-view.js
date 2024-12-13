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
            className: 'w-full max-w-7xl mx-auto no-cursor-select'
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

        log(this.state, '[DashboardView] CARD');
        // Initialize DataCards
        this.defectsCard = new DataCard(
            this.topCardsRow,
            {
                id: 'defects-card',
                valueSource: 'statistics.defects.total.unresolved',
                title: 'Дефекты',
                icon: 'src/image/electrical-sensor.svg',
                value: 0,  
                description: '0 в этом месяце',
                theme: 'light',
                attributes: {
                    'data-card-type': 'defect'
                },
                onStatClick: (statId) => this.handleStatClick(statId)
            }
        );
        // this.defectsCard.subscribeValue('statistics.defects.total.unresolved');

        this.requestsCard = new DataCard(
            this.topCardsRow,    
            {
                title: 'Доработки',
                icon: 'src/image/data-configuration.svg',
                value: '0',
                description: '0 в этом месяце',
                theme: 'light',
                attributes: {
                    'data-card-type': 'request'
                },
                onStatClick: (statId) => this.handleStatClick(statId)
            }
        );
        this.requestsCard.subscribeValue(this.refact, 'statistics.requests.total.unresolved');
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
        this.topCardsRow.style.display = 'flex';
    }

    setupSubscriptions() {
        this.refact.subscribe('statistics', (statistics) => {
            if (!statistics) return;

        });
    }
}