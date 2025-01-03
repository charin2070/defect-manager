class DashboardView extends HtmlComponent {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.setupSubscriptions();
    }

    getContainer() {
        if (!this.container) {
            this.container = this.createView();
        }
        return this.container;
    }

    createView() {
        // Main container
        const container = this.createElement('div', {
            id: 'dashboard-view',
            className: 'container-fluid p-0'
        });

        // Title row
        const titleRow = this.createElement('div', {
            className: 'row mb-4'
        });
        container.appendChild(titleRow);

        const titleCol = this.createElement('div', {
            className: 'col-12'
        });
        titleRow.appendChild(titleCol);

        const title = this.createElement('h1', {
            className: 'h3 mb-3',
            innerHTML: '<strong>Defect Manager</strong> Dashboard'
        });
        titleCol.appendChild(title);

        // Charts row
        const chartsRow = this.createElement('div', {
            className: 'row'
        });
        container.appendChild(chartsRow);

        // Chart column
        const chartCol = this.createElement('div', {
            className: 'col-12 col-xl-6'
        });
        chartsRow.appendChild(chartCol);

        // Create chart card
        const chartCard = this.createElement('div', {
            className: 'card flex-fill w-100'
        });
        chartCol.appendChild(chartCard);

        // Chart header
        const chartHeader = this.createElement('div', {
            className: 'card-header'
        });
        chartCard.appendChild(chartHeader);

        const chartTitle = this.createElement('h5', {
            className: 'card-title mb-0',
            textContent: 'Defect Statistics'
        });
        chartHeader.appendChild(chartTitle);

        // Chart body
        const chartBody = this.createElement('div', {
            className: 'card-body'
        });
        chartCard.appendChild(chartBody);

        const chartCanvas = this.createElement('canvas', {
            style: { height: '300px' }
        });
        chartBody.appendChild(chartCanvas);

        // Initialize chart
        this.chart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: ['Total', 'Unresolved', 'Top Issues'],
                datasets: [{
                    label: 'Defects',
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(255, 159, 64, 0.5)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            maxTicksLimit: 10,
                            callback: function(value) {
                                return Math.floor(value);
                            }
                        },
                        max: function(context) {
                            const values = context.chart.data.datasets[0].data;
                            const maxValue = Math.max(...values, 1);
                            return Math.ceil(maxValue * 1.1);
                        }
                    }
                }
            }
        });

        // Cards row
        const cardsRow = this.createElement('div', {
            className: 'row'
        });
        container.appendChild(cardsRow);

        // Card column
        const cardCol = this.createElement('div', {
            className: 'col-12 col-md-6 col-xl-3'
        });
        cardsRow.appendChild(cardCol);

        // Initialize DataCard
        this.defectsCard = new DataCard(
            cardCol,
            {
                id: 'defects-card',
                valueSource: 'statistics.defects.total.unresolved',
                title: 'Defects',
                icon: 'src/image/jira-defect.svg',
                value: 0,
                description: '0 unresolved',
                theme: 'light',
                attributes: {
                    'data-card-type': 'defect'
                },
                onClick: () => this.handleCardClick('defects-card')
            }
        );

        return container;
    }

    updateDashboard(issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn('No valid issues data:', issues);
            return;
        }

        console.log('Updating dashboard with issues:', issues);

        const defects = issues.filter(issue => issue.type === 'defect');
        const openDefects = defects.filter(d => d.status === 'unresolved');
        
        // Get top reported defects
        const topReportedDefects = defects
            .filter(d => d.status === 'unresolved')
            .sort((a, b) => (b.reports?.length || 0) - (a.reports?.length || 0))
            .slice(0, 5);
        
        // Update defects card
        if (this.defectsCard) {
            this.defectsCard.setValue(defects.length);
            this.defectsCard.setDescription(`${openDefects.length} unresolved`);
        }

        // Update chart
        if (this.chart) {
            const data = [
                defects.length,
                openDefects.length,
                topReportedDefects.length
            ];
            
            const maxValue = Math.max(...data, 1);
            this.chart.options.scales.y.ticks.stepSize = Math.max(1, Math.ceil(maxValue / 10));
            
            this.chart.data.datasets[0].data = data;
            this.chart.update('none'); // Use 'none' mode for better performance
        }
    }

    handleCardClick(cardId) {
        const slidePanel = SlidePanel.getInstance();
        const issues = this.refact.state.issues;
        
        if (!issues || !Array.isArray(issues)) {
            console.warn('No valid issues data for card click');
            return;
        }

        const defects = issues
            .filter(issue => issue.type === 'defect' && issue.status === 'unresolved')
            .sort((a, b) => (b.reports?.length || 0) - (a.reports?.length || 0));

        if (defects.length > 0) {
            // Create container for chart and table
            const container = this.createElement('div', {
                className: 'slide-panel-content'
            });

            // Create and setup chart card
            const chartCard = this.createElement('div', {
                className: 'card flex-fill w-100 mb-4'
            });
            container.appendChild(chartCard);

            const chartHeader = this.createElement('div', {
                className: 'card-header'
            });
            chartCard.appendChild(chartHeader);

            const chartTitle = this.createElement('h5', {
                className: 'card-title mb-0',
                textContent: 'Defect Statistics'
            });
            chartHeader.appendChild(chartTitle);

            const chartBody = this.createElement('div', {
                className: 'card-body'
            });
            chartCard.appendChild(chartBody);

            const chartCanvas = this.createElement('canvas', {
                style: { height: '300px' }
            });
            chartBody.appendChild(chartCanvas);

            // Initialize chart
            const chart = new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Total', 'Unresolved', 'Top Issues'],
                    datasets: [{
                        label: 'Defects',
                        data: [
                            defects.length,
                            defects.filter(d => d.status === 'unresolved').length,
                            defects.filter(d => d.reports && d.reports.length > 0).length
                        ],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(255, 159, 64, 0.5)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });

            // Create and setup issue table
            const issueTable = new IssueTable(['taskId', 'status', 'description', 'created', 'reports']);
            issueTable.render(defects);
            container.appendChild(issueTable.container);

            // Open slide panel
            slidePanel.setLogo('src/image/jira-defect.svg');
            slidePanel.setTitle('Defects');
            slidePanel.open(container, 'Unresolved Defects');
        }
    }

    setupSubscriptions() {
        this.refact.subscribe('issues', (issues) => {
            console.log('Issues state changed:', issues);
            if (!issues) return;
            this.updateDashboard(issues);
        });
    }
}