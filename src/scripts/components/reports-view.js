import IssueTable from './IssueTable.js';

class ReportsView {
  constructor(container) {
    this.container = container;
  }

  /**
   * Renders report data in the container
   * @param {Object} data - Object containing reportData
   */
  render(data) {
    console.log('ReportsView.render - Received data:', data);

    if (!data || !data.reportData) {
      console.warn('ReportsView.render - No reportData available');
      this.container.innerHTML = '<p class="error">Нет данных для отображения</p>';
      return;
    }

    const { reportData } = data;
    const criticalIssues = reportData.criticalIssues || [];
    console.log('ReportsView.render - Critical issues:', criticalIssues);

    let html = `
      <div class="report-container">
        <div class="report-section statistics">
          <h3>Общая статистика</h3>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-label">Всего задач:</span>
              <span class="stat-value">${reportData.totalIssues}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Открытых задач:</span>
              <span class="stat-value">${reportData.openIssues}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Процент решенных:</span>
              <span class="stat-value">${reportData.resolvedPercentage}%</span>
            </div>
          </div>
        </div>

        <div class="report-section distribution">
          <h3>Распределение проблематики</h3>
          <div class="distribution-chart">
            ${this.renderDistributionChart(reportData.distribution)}
          </div>
          <div class="distribution-list">
            ${reportData.distribution.map(group => `
              <div class="distribution-item">
                <span class="area-name">${group.area}:</span>
                <span class="area-count">${group.count}</span>
              </div>
            `).join('')}
          </div>
        </div>

        ${criticalIssues.length > 0 ? `
          <div class="report-section critical-issues">
            <h3>Дефекты с критическим влиянием</h3>
            <div class="critical-issues-list"></div>
          </div>
        ` : ''}
      </div>
    `;

    this.container.innerHTML = html;

    // If there are critical issues, render them in a table
    if (criticalIssues.length > 0) {
      console.log('ReportsView.render - Creating table for critical issues');
      const criticalIssuesContainer = this.container.querySelector('.critical-issues-list');
      const criticalIssuesTable = new IssueTable(['taskId', 'description', 'status', 'priority']);
      criticalIssuesTable.container.style.width = '100%';
      criticalIssuesTable.showIssues(criticalIssues.map(issue => ({ 
        taskId: issue.taskId, 
        description: issue.description, 
        status: issue.status, 
        priority: issue.priority 
      })));
      criticalIssuesContainer.appendChild(criticalIssuesTable.container);
    }

    this.addStyles();
  }

  /**
   * Renders a simple bar chart for distribution data
   * @param {Array} distribution - Array of area distribution data
   * @returns {string} HTML string for the chart
   */
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

  /**
   * Adds required styles to the document
   */
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

      .error {
        color: #f44336;
        text-align: center;
        padding: 20px;
      }

      .critical-issues-list {
        margin-top: 15px;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;   document.head.appendChild(styleElement);
  }
}
