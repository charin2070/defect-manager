import IssueTable from './IssueTable.js';
import View from './View.js';
import Refact from './Refact.js';

class ReportsView extends View {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.createView();
        this.setupReactivity();
    }

    createView() {
        this.container = document.createElement('div');
        this.container.className = 'report-container';
        
        // Create sections
        this.statisticsSection = document.createElement('div');
        this.statisticsSection.className = 'report-section statistics';
        this.statisticsSection.innerHTML = `
            <h3>Общая статистика</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <span class="stat-label">Всего задач:</span>
                    <span class="stat-value" id="total-issues">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Открытых задач:</span>
                    <span class="stat-value" id="open-issues">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Процент решенных:</span>
                    <span class="stat-value" id="resolved-percentage">0%</span>
                </div>
            </div>
        `;
        
        this.distributionSection = document.createElement('div');
        this.distributionSection.className = 'report-section distribution';
        this.distributionSection.innerHTML = `
            <h3>Распределение проблематики</h3>
            <div class="distribution-chart"></div>
            <div class="distribution-list"></div>
        `;
        
        this.criticalSection = document.createElement('div');
        this.criticalSection.className = 'report-section critical-issues';
        this.criticalSection.innerHTML = `
            <h3>Дефекты с критическим влиянием</h3>
            <div class="critical-issues-list"></div>
        `;
        
        // Append sections
        this.container.appendChild(this.statisticsSection);
        this.container.appendChild(this.distributionSection);
        this.container.appendChild(this.criticalSection);
        
        // Create table for critical issues
        this.criticalIssuesTable = new IssueTable(['taskId', 'description', 'status', 'priority']);
        this.criticalIssuesTable.container.style.width = '100%';
        this.criticalSection.querySelector('.critical-issues-list').appendChild(this.criticalIssuesTable.container);
        
        this.addStyles();
    }

    setupReactivity() {
        this.refact.subscribe('reports', (reportData) => {
            if (!reportData) return;
            
            // Update statistics
            const totalIssues = this.container.querySelector('#total-issues');
            const openIssues = this.container.querySelector('#open-issues');
            const resolvedPercentage = this.container.querySelector('#resolved-percentage');
            
            totalIssues.textContent = reportData.totalIssues || 0;
            openIssues.textContent = reportData.openIssues || 0;
            resolvedPercentage.textContent = `${reportData.resolvedPercentage || 0}%`;
            
            // Update distribution chart
            if (reportData.distribution) {
                const chartHtml = this.renderDistributionChart(reportData.distribution);
                this.distributionSection.querySelector('.distribution-chart').innerHTML = chartHtml;
                
                const listHtml = reportData.distribution.map(group => `
                    <div class="distribution-item">
                        <span class="area-name">${group.area}:</span>
                        <span class="area-count">${group.count}</span>
                    </div>
                `).join('');
                this.distributionSection.querySelector('.distribution-list').innerHTML = listHtml;
            }
            
            // Update critical issues
            const criticalIssues = reportData.criticalIssues || [];
            this.criticalSection.style.display = criticalIssues.length > 0 ? 'block' : 'none';
            if (criticalIssues.length > 0) {
                this.criticalIssuesTable.showIssues(criticalIssues.map(issue => ({
                    taskId: issue.taskId,
                    description: issue.description,
                    status: issue.status,
                    priority: issue.priority
                })));
            }
        });
    }

    renderDistributionChart(distribution) {
        const maxCount = Math.max(...distribution.map(d => d.count));
        return distribution.map(group => {
            const percentage = (group.count / maxCount) * 100;
            return `
                <div class="chart-bar">
                    <div class="bar-label">${group.area}</div>
                    <div class="bar-container">
                        <div class="bar" style="width: ${percentage}%">
                            <span class="bar-value">${group.count}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    addStyles() {
        const styleId = 'reports-view-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            .report-container {
                padding: 20px;
                font-family: Arial, sans-serif;
            }

            .report-section {
                margin-bottom: 30px;
                background: #fff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .report-section h3 {
                margin-top: 0;
                color: #333;
                font-size: 1.2em;
                margin-bottom: 15px;
            }

            .stat-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 4px;
            }

            .stat-label {
                color: #666;
            }

            .stat-value {
                font-weight: bold;
                color: #333;
            }

            .distribution-chart {
                margin-bottom: 20px;
            }

            .chart-bar {
                margin-bottom: 10px;
            }

            .bar-label {
                margin-bottom: 5px;
                color: #666;
            }

            .bar-container {
                background: #f5f5f5;
                border-radius: 4px;
                height: 24px;
                overflow: hidden;
            }

            .bar {
                height: 100%;
                background: #4CAF50;
                transition: width 0.3s ease;
                display: flex;
                align-items: center;
                padding: 0 10px;
            }

            .bar-value {
                color: white;
                font-size: 0.9em;
            }

            .distribution-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
            }

            .distribution-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                background: #f5f5f5;
                border-radius: 4px;
            }

            .area-name {
                color: #666;
            }

            .area-count {
                font-weight: bold;
                color: #333;
            }

            .critical-issues {
                display: none;
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
}
