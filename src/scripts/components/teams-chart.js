class TeamsChart extends BaseChart {
  constructor(issues, canvasId) {
    super(issues, canvasId);
    this.createTeamsBacklogChart(canvasId);
  }

  getStatusesCount() {
    const teamOpenCounts = {};
    const teamClosedCounts = {};
    const teamReports = [];

    this.data.forEach((issue) => {
      if (issue.team) {
        if (!this.isResolved(issue.status)) {
          teamOpenCounts[issue.team] = (teamOpenCounts[issue.team] || 0) + 1;
          if (issue.reports && parseInt(issue.reports) > 0) {
            teamReports[issue.team] = (teamReports[issue.team] || 0) + 1;
          }
        } else if (issue.status === "Закрыт") {
          teamClosedCounts[issue.team] = (teamClosedCounts[issue.team] || 0) + 1;
        }
      }
    });

    return { teamOpenCounts, teamClosedCounts, teamReports };
  }

  createTeamsBacklogChart(canvasId) {
    if (this.chart) {
      this.chart.destroy();
    }

    const { teamOpenCounts, teamClosedCounts, teamReports } = this.getStatusesCount();
    const teams = this.getUniqueTeams();

    // Подготовка данных для графика
    const sortedTeams = teams.sort((a, b) => (teamOpenCounts[b] || 0) - (teamOpenCounts[a] || 0));
    const openData = sortedTeams.map((team) => teamOpenCounts[team] || 0);
    const reportsData = sortedTeams.map((team) => teamReports[team] || 0);
    const closedData = sortedTeams.map((team) => teamClosedCounts[team] || 0);

    this.chart = new Chart(canvasId, {
      type: "bar",
      data: {
        labels: sortedTeams,
        datasets: [
          {
            label: "Открыто",
            data: openData,
            backgroundColor: "rgba(255, 99, 132, 0.8)"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Команды",
            font: {
              size: 16,
              weight: "bold"
            }
          },
          tooltip: {
            mode: "index",
            intersect: false
          },
          legend: {
            display: true,
            position: "bottom"
          }
        },
        indexAxis: "x",
        scales: {
          y: {
            title: {
              display: true,
              text: "Количество задач"
            },
            stacked: true
          },
          x: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: ""
            }
          }
        }
      }
    });

    // Добавляем обработчик клика отдельно
    this.chart.canvas.onclick = (e) => {
      const points = this.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
      
      if (points.length === 0) return;
      
      try {
        const firstPoint = points[0];
        const index = firstPoint.index;
        const team = sortedTeams[index];
        
        if (!team) return;
        
        // Dispatch team selection event
        const event = new CustomEvent('teamSelected', {
          detail: { team: team }
        });

        document.dispatchEvent(event);
    
        // Переключаем на backlog график
        const teamsChartCanvas = document.getElementById('teams-backlog-chart-canvas');
        const backlogChartCanvas = document.getElementById('backlog-chart-canvas');
        
        if (teamsChartCanvas && backlogChartCanvas) {
          teamsChartCanvas.style.display = 'none';
          backlogChartCanvas.style.display = 'block';
        }
      } catch (error) {
        console.error('Error handling chart click:', error);
      }
    };
  }
}
