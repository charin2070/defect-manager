class DashboardView extends View {
    constructor(container) {
        super(container);
        this.container = container;
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
        this.createCards(container);

        this.backlogData = null;
        log(this.state, '[DashboardView] State received');
        this.state.chartManager.createBacklogLineChart(this.backlogCanvas, this.backlogData);

        // Chart container
        this.chartContainer = this.createElement('div', { 
            id: 'chart-container',
            className: 'mb-8 p-6 rounded-lg w-full bg-white shadow-sm no-cursor-select'
        });
        container.appendChild(this.chartContainer);


        this.createBacklogChart();

    }


    createCards(container) {
        // Cards row
        this.topCardsRow = this.createElement('div', {
            id : 'top-cards-row',
            className: 'flex flex-row flex-wrap justify-start gap-8 my-8 p-4 w-full no-cursor-select'
        });
        container.appendChild(this.topCardsRow);

        // Initialize DataCards
        this.defectsCard = new DataCard(
            this.topCardsRow,
            {
                id: 'defects-card',
                valueSource: 'statistics.defects.total.unresolved',
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
        const statistics = this.refact.state.statistics;

        if (!statistics || !statistics.defects || !statistics.requests) {
            console.warn('[DashboardView] Statistics object is incomplete', statistics);
            return;
        }

        let issues = [];
        switch (cardId) {
            case 'defects-card':
                this.slidePanel.setLogo('src/image/jira-defect.svg');
                this.slidePanel.setTitle('Дефекты');
                issues = statistics.defects.total.unresolved;
                if (issues.length > 0) {
                    const issueTable = new IssueTable(['taskId', 'status', 'description', 'created']);
                    issueTable.render(issues);
                    slidePanel.open(issueTable.container, 'Открытые дефекты');
                }
                break;
            case 'requests-card':
                this.slidePanel.setLogo('src/image/jira-request.svg');
                this.slidePanel.setTitle('Доработки');
                issues = statistics.requests.total.unresolved;
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
    createBacklogChart() {
        if (!this.state.issues || this.state.issues.length === 0) {
            log('[DashboardView] No issues for Backlog Chart');
            return;
        }
        const canvasId = 'backlog-chart-canvas';
        if (!this.backlogCanvas) {
            this.backlogCanvas = document.createElement('canvas');
            this.backlogCanvas.id = canvasId;
            this.chartContainer.appendChild(this.backlogCanvas); // Append to the appropriate parent
        }
    
    }

    renderBacklogChart( ){
        this.backlogData = this.state.chartManager.prepareChartData(this.state.issues);
        this.state.chartManager.createBacklogLineChart(this.backlogCanvas, this.backlogData);
        this.showBacklogChart();
    }

    showBacklogChart() {
        this.chartContainer.style.display = 'block';
    }

    hideBacklogChart() {
        this.chartContainer.style.display = 'none';
    }

    setupSubscriptions() {
    }

    update(statistics) {
        console.log(statistics, '[DashboardView.update] Updating statistics...');
        const { defects, requests } = statistics.total;
        
        // Подсчет нерешенных дефектов
        const unresolvedDefects = (defects.unresolved.count);
        
        this.defectsCard.setValue(unresolvedDefects);
        this.defectsCard.setDescription(`${unresolvedDefects} всего задач`);
    }
}