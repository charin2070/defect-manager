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
        this.createCards(container);

        // Chart container
        this.chartContainer = this.createElement('div', { 
            id: 'defects-chart-container',
            className: 'mb-8 p-6 rounded-lg w-full bg-white shadow-sm no-cursor-select'
        });
        container.appendChild(this.chartContainer);

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

    setupSubscriptions() {
        // Subscribe to issues changes
        this.refact.subscribe('issues', (issues) => {
            if (!issues) return;
            
            const defects = issues.filter(issue => issue.type === 'defect');
            const openDefects = defects.filter(d => d.status === 'unresolved');
            const criticalDefects = defects.filter(d => d.priority === 'critical');
            
            // Update defects card
            if (this.defectsCard) {
                this.defectsCard.setValue(defects.length);
                this.defectsCard.setDescription(`${openDefects.length} открытых`);
            }
            
            // Update chart if exists
            if (this.chartContainer) {
                // Remove old chart if exists
                while (this.chartContainer.firstChild) {
                    this.chartContainer.firstChild.remove();
                }
                
                // Create new chart
                const canvas = document.createElement('canvas');
                this.chartContainer.appendChild(canvas);
                
                const chart = new Chart(canvas, {
                    type: 'bar',
                    data: {
                        labels: ['Всего', 'Открытые', 'Критичные'],
                        datasets: [{
                            label: 'Дефекты',
                            data: [defects.length, openDefects.length, criticalDefects.length],
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(255, 206, 86, 0.5)'
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(255, 206, 86, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Статистика дефектов',
                                font: {
                                    size: 16
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }
        });
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