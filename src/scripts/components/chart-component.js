class ChartComponent {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.chart = null;
    }

    renderBacklogCurve(backlogCurveData, canvasId) {
        log(backlogCurveData, 'BacklogCurveData')
        // Настройка графика (например, с использованием Chart.js)
        const ctx = document.getElementById(canvasId);
    if (this.chart) {
        this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
        type: 'line',
        data: backlogCurveData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Тренд бэклога по командам',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'yyyy-MM-dd'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Дата'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Активные задачи'
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}
  
    // Метод для отображения бэклога команд на временной шкале
    renderTeamBacklogTimeline(issues) {
        const formattedIssues = issues.map(issue => ({
            ...issue,
            created: issue.created instanceof Date ? issue.created : new Date(issue.created)
          }));

          const teamBacklogData = this.processBacklogData(formattedIssues);

        // const teamBacklogData = this.processBacklogData(issues);
  
      const ctx = this.container.getContext('2d');
      if (this.chart) this.chart.destroy(); // Удаляем предыдущий график, если он существует
  
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: teamBacklogData.labels,
          datasets: teamBacklogData.datasets
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month'
              },
              title: {
                display: true,
                text: 'Дата создания задачи'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Количество задач'
              }
            }
          }
        }
      });

    }
  

    processBacklogData(issues) {
        const teamData = {};
        const labels = new Set();
      
        issues.forEach(issue => {
          const team = issue.team;
          log(typeof new Date(issue.created), "Created");
          const createdDate = new Date(issue.created);
          const month = createdDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' }); // Используем локализованный формат даты
          labels.add(month);
          teamData[team] = teamData[team] || {};
          teamData[team][month] = (teamData[team][month] || 0) + 1;
        });
      
        const datasets = [];
        for (const team of Object.keys(teamData)) {
          const data = [...labels].sort().map(label => teamData[team][label] || 0);
          datasets.push({
            label: team,
            data,
            borderColor: this.getRandomColor(),
            backgroundColor: this.getRandomColor(0.5)
          });
        }
      
        return { labels: [...labels].sort(), datasets };
      }
      
    // // Метод обработки данных для бэклога
    // processBacklogData(issues) {
    //   const teamData = {};
    //   issues.forEach(issue => {
    //     const team = issue.team;
    //     const createdDate = new Date(issue.created);
    //     if (!teamData[team]) teamData[team] = {};
  
    //     const month = createdDate.toISOString().slice(0, 7); // Форматируем дату в YYYY-MM
    //     if (!teamData[team][month]) teamData[team][month] = 0;
    //     teamData[team][month]++;
    //   });
  
    //   const labels = Array.from(
    //     new Set(issues.map(issue => issue.created.toISOString().slice(0, 7)))
    //   ).sort();
  
    //   const datasets = Object.keys(teamData).map(team => ({
    //     label: team,
    //     data: labels.map(label => teamData[team][label] || 0),
    //     borderColor: this.getRandomColor(),
    //     backgroundColor: this.getRandomColor(0.5)
    //   }));
  
    //   return { labels, datasets };
    // }
  
    // Генератор случайных цветов для графика
    getRandomColor(opacity = 1) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

}
