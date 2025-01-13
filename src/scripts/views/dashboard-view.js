// Chart.js is loaded via script tag in index.html
class DashboardView extends ViewComponent {
    constructor() {
        super();
        this.state = Refact.getInstance();
        
        // Create main container
        this.container = this.createElement('div', { className: 'dashboard' });
        
        // Create rows for different sections
        this.chartsRow = this.createElement('div', { className: 'row charts-row' });
        this.backlogRow = this.createElement('div', { className: 'row backlog-row' });
        this.issueTableRow = this.createElement('div', { 
            className: 'cards-row issue-table-row',
            id: 'issue-table-row'
        });
        
        // Append rows to container
        this.container.appendChild(this.chartsRow);
        this.container.appendChild(this.backlogRow);
        this.container.appendChild(this.issueTableRow);
        
        this.render();
        this.listen();
    }

    listen() {
        this.state.subscribe('index', (index) => {
            if (index) {
                this.update(index);
            }
        });
    }
    
    render() {
        // Initialize defects card
        if (!this.defectsCard) {
            this.defectsCard = new ChartCard();
            this.defectsCard.setTitle('Дефекты');
            this.defectsCard.bind(this.state);
            
            // Add wrapper for proper sizing
            const cardWrapper = this.createElement('div', { 
                className: 'chart-card-wrapper',
                style: 'flex: 1; min-width: 400px;'
            });
            cardWrapper.appendChild(this.defectsCard.getContainer());
            this.chartsRow.appendChild(cardWrapper);
        }

         // Initialize request card
         if (!this.requestCard) {
            this.requestCard = new ChartCard();
            this.requestCard.setTitle('Доработки');
            this.requestCard.bind(this.state);
            
            // Add wrapper for proper sizing
            const cardWrapper = this.createElement('div', { 
                className: 'chart-card-wrapper',
                style: 'flex: 1; min-width: 400px;'
            });
            cardWrapper.appendChild(this.requestCard.getContainer());
            this.chartsRow.appendChild(cardWrapper);
        }

        // Initialize backlog card
        if (!this.teamsBacklogCard) {
            this.teamsBacklogCard = new ChartCard();
            this.teamsBacklogCard.setTitle('Бэклог команд');
            this.teamsBacklogCard.bind(this.state);
            this.teamsBacklogCard.chartOptions = {
                index: this.state.index
            };
            
            // Add wrapper for proper sizing
            const cardWrapper = this.createElement('div', { 
                className: 'chart-card-wrapper',
                style: 'flex: 1; min-width: 400px;'
            });
            cardWrapper.appendChild(this.teamsBacklogCard.getContainer());
            this.chartsRow.appendChild(cardWrapper);
        }


        // if (!this.table) {
        //     this.table = new TableComponent();
        //     this.table.createTable({
        //         headers: ['Task', 'Description', 'Status', 'Priority', 'Assignee', 'Created']
        //     });
        //     this.issueTableRow.appendChild(this.table.getContainer());
        // }

        return this.container;
    }

    showTeamsBacklogBars(index, dashboardView) {
        const teamNames = index.teams;

        // Create canvas for teams backlog chart
        const canvas = this.createElement('canvas', {
            className: 'teams-backlog-chart',
            id: 'teams-backlog-chart'
        });

        // Create container for the chart
        let teamBacklogChartContainer = this.createElement('div', {
            className: 'card-container',
            id: 'team-backlog-chart-container'
        });
        teamBacklogChartContainer.appendChild(canvas);
        this.backlogRow.appendChild(teamBacklogChartContainer);

        // Style the container
        teamBacklogChartContainer.style.display = 'flex';
        teamBacklogChartContainer.style.height = '400px';
        teamBacklogChartContainer.style.width = '100%';
        teamBacklogChartContainer.style.flexDirection = 'column';
        canvas.style.padding = '1.5em';

        // Prepare data for the chart
        const unresolvedCounts = index.defect.state.unresolved.reduce((acc, issue) => {
            const teamName = issue.team || 'Не назначена';
            acc[teamName] = acc[teamName] || { count: 0, reports: 0 };
            acc[teamName].count += 1;
            if (issue.reports && parseInt(issue.reports) > 0) {
                acc[teamName].reports += parseInt(issue.reports);
            }
            return acc;
        }, {});

        // Exclude 'Unassigned' team
        console.log('🔥', unresolvedCounts);
        delete unresolvedCounts['Не назначена'];
        // Sort the data
        const sortedTeams = Object.keys(unresolvedCounts).sort((a, b) => unresolvedCounts[b].count - unresolvedCounts[a].count);
        const sortedCounts = sortedTeams.map(team => unresolvedCounts[team].count).reverse();
        const sortedReports = sortedTeams.map(team => unresolvedCounts[team].reports).reverse();

        // Create the chart
        let teamBacklogChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: sortedTeams.reverse(),
                datasets: [{
                    label: 'Открытые дефекты',
                    data: sortedCounts,
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Обращения по дефектам',
                    data: sortedReports,
                    backgroundColor: 'rgba(255, 159, 64, 0.8)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Количество'
                        },
                        stacked: true
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Команды'
                        },
                        stacked: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            },
            plugins: [{
                id: 'customDataLabels',
                afterDatasetsDraw(chart, args, options) {
                    const { ctx, data, scales: { x, y } } = chart;
                    
                    data.datasets[0].data.forEach((value, index) => {
                        const xPos = x.getPixelForValue(index);
                        const yPos = y.getPixelForValue(value);
                        
                        // Draw background pill
                        ctx.save();
                        const text = value.toString();
                        ctx.font = '600 13px Inter, system-ui, -apple-system, sans-serif';
                        const textWidth = ctx.measureText(text).width;
                        const padding = 10;
                        const height = 24;
                        
                        // Draw shadow
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
                        ctx.shadowBlur = 8;
                        ctx.shadowOffsetY = 3;
                        
                        // Gradient background
                        const gradient = ctx.createLinearGradient(
                            xPos - (textWidth/2 + padding),
                            yPos - height - 5,
                            xPos - (textWidth/2 + padding),
                            yPos - 5
                        );
                        gradient.addColorStop(0, '#ffffff');
                        gradient.addColorStop(1, '#f5f5f5');
                        ctx.fillStyle = gradient;
                        
                        // Draw border
                        ctx.beginPath();
                        ctx.roundRect(xPos - (textWidth/2 + padding), yPos - height - 5, 
                                    textWidth + padding * 2, height, 12);
                        ctx.fill();
                        
                        // Add subtle border
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.restore();
                        
                        // Draw text
                        ctx.save();
                        ctx.fillStyle = '#000000';
                        ctx.font = '600 13px Inter, system-ui, -apple-system, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(text, xPos, yPos - height/2 - 5);
                        ctx.restore();
                    });
                }
            }]
        });
    }
    update(index) {
        console.log(`Updating dashboard view with index:`, index);
        // let unresolvedDefects = StatisticManager.getUnresolvedDefects();
        if (index) {
            // Update defects card
            if (this.defectsCard) {
                this.defectsCard.setValue(index.defect.state.unresolved.count || 0);
            }

            if (this.requestCard) {
                if (index.request) {
                    this.requestCard.setValue(index.request.count || 0);
                    this.requestCard.update();
                }
            }

            if (this.teamsBacklogCard) {
                this.teamsBacklogCard.update();
            }

            // Update table if needed
            if (this.table) {
                this.table.updateItems(index.defect.state.unresolved);
            }

            this.showTeamsBacklogBars(index, document.getElementById('issue-table-row'));
        }
    }
}
