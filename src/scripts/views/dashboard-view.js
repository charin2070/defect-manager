class DashboardView extends ViewComponent {
    constructor() {
        super();
        this.state = Refact.getInstance();
        this.setupSubscriptions();
        this.render();
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

        return this.container;
    }

    

    updateDashboard(issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn('No valid issues data:', issues);
            return;
        }

        console.log('Updating dashboard with issues:', issues);

        const defects = issues.filter(issue => issue.type === 'defect');
        const unresolvedDefects = defects.filter(d => d.status === 'unresolved');
        // Top reported defects
        const topReportedDefects = unresolvedDefects
            .sort((a, b) => (b.reports?.length || 0) - (a.reports?.length || 0))
            .slice(0, 5);
        
        // Update defects card
        if (this.defectsCard) {
            this.defectsCard.setValue(defects.length);
            this.defectsCard.setTitle(`${unresolvedDefects.length} открытых дефектов`);
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

            // Create and setup chart card
            const chartCard = this.createElement('div', {
                className: 'card flex-fill w-100 mb-4'
            });
            this.container.appendChild(chartCard);

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
        this.state.subscribe('issues', (issues) => {
            if (!issues) return;
            this.updateDashboard(issues);
        });
    }
}