class DashboardView extends View {
    constructor() {
        super();
        this.create();
        this.setupSubscriptions();
    }

    create() {
        const container = this.createElement('div', {
            id: 'dashboard-view',
            className: 'w-full max-w-7xl mx-auto no-cursor-select'
        });

        this.setContainer(container);
        this.createCards(container);
        this.createCharts(container);
        this.slidePanel = SlidePanel.getInstance();
    }

    createCharts(container) {
        this.backlogChartContainer = this.createElement('div', {
            id: 'backlog-chart-container',
            className: 'app-cart',
            style: {
                width: '100%',
                background: 'var(--surface-color)',
                padding: '1.5rem',
                display: 'none',
                flexDirection: 'column',
                marginBottom: '1.5rem'
                }
            });
        container.appendChild(this.backlogChartContainer);
        this.backlogChart = new BacklogChart(this.refact.state.index, this.backlogChartContainer);
    }

    createCards(container) {
        // Cards row
        this.topCardsRow = this.createElement('div', {
            id : 'top-cards-row',
            className: 'flex flex-row flex-wrap justify-start gap-8 my-8 p-4 w-full no-cursor-select'
        });
        container.appendChild(this.topCardsRow);

        // Cards
        this.defectsCard = new DataCard(
            this.topCardsRow,
            {
                id: 'defects-card',
                valueSource: 'index.defects.unresolved.count',
                title: 'Дефекты',
                icon: 'src/image/jira-defect.svg',
                value: 0,  
                description: '0 в этом месяце',
                theme: 'light',
                attributes: {
                    'data-card-type': 'defect'
                },
                onClick: () => this.handleCardClick('defects-card')
            }
        );

        this.requestsCard = new DataCard(
            this.topCardsRow,    
            {
                id: 'requests-card',
                title: 'Доработки',
                icon: 'src/image/jira-request.svg',
                value: '0',
                description: '0 в этом месяце',
                theme: 'light',
                attributes: {
                    'data-card-type': 'request'
                },
                onClick: () => this.handleCardClick('requests-card'),
            }
        );
    }

    handleCardClick(cardId) {
        const slidePanel = SlidePanel.getInstance();
        const index = this.state.index;

        if (!index || !index.defects || !index.requests) {
            console.warn('[DashboardView] Index object is incomplete', index);
            return;
        }

        let issues = [];
        switch (cardId) {
            case 'defects-card':
                this.slidePanel.setLogo('src/image/jira-defect.svg');
                this.slidePanel.setTitle('Дефекты');
                issues = index.defects.total.unresolved;
                if (issues.length > 0) {
                    const issueTable = new IssueTable(['taskId', 'status', 'description', 'created']);
                    issueTable.render(issues);
                    slidePanel.open(issueTable.container, 'Открытые дефекты');
                }
                break;
            case 'requests-card':
                this.slidePanel.setLogo('src/image/jira-request.svg');
                this.slidePanel.setTitle('Доработки');
                issues = IndexManager.getIssues({ state: 'unresolved' }, index.requests);
                if (issues.length > 0) {
                    const issueTable = new IssueTable(['taskId', 'status', 'description', 'created']);
                    issueTable.render(issues);
                    slidePanel.open(issueTable.container, 'Открытые доработки');
                }
                break;
            default:
                console.warn('[DashboardView] Unknown cardId', cardId);
                return;
        }
    }

    showCards() {
        this.topCardsRow.style.display = 'flex';
    }


    setupSubscriptions() {
        this.refact.subscribe('index', (index) => {
            if (index) {
                this.backlogChart.update(index);
            }
        });
    }

    update(statistics) {
        if (!statistics || !statistics.total) return;
        
        const { defects, requests } = statistics.total;
        if (!defects || !requests) return;

        const unresolvedDefects = defects.unresolved ? defects.unresolved.length : 0;
        const unresolvedRequests = requests.unresolved ? requests.unresolved.length : 0;

        this.requestsCard.setValue(unresolvedRequests);
        this.requestsCard.setDescription(`${unresolvedRequests} всего задач`);
        
        this.defectsCard.setValue(unresolvedDefects);
        this.defectsCard.setDescription(`${unresolvedDefects} всего задач`);
    }
}