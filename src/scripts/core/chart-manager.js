class ChartManager {
  constructor() {
      this.chartContainer = document.getElementById('chart-container');
      this.charts = new Map(); // Хранилище для графиков
      this.currentTheme = localStorage.getItem('theme') || 'light';
      
      // Listen for theme changes
      window.addEventListener('themeChanged', (e) => {
          this.currentTheme = e.detail.theme;
          this.updateChartsTheme();
      });
  }

  createChart(container, data, type) {
      const canvas = document.getElementById(container);
      if (!canvas) {
          return;
      }

      // Уничтожаем существующий график, если он есть
      if (this.charts.get(container)) {
          this.charts.get(container).destroy();
          this.charts.delete(container);
      }

      const chartData = this.prepareChartData(data);

      this.charts.set(container, new Chart(canvas, {
          type: 'line',
          data: chartData,
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  y: {
                      beginAtZero: true,
                      title: {
                          display: true,
                          text: 'Количество задач',
                          font: {
                              size: 14,
                              family: 'Roboto, sans-serif',
                              weight: '500'
                          },
                          color: '#666'
                      },
                      grid: {
                          display: false
                      },
                      ticks: {
                          color: '#666',
                          font: {
                              size: 12,
                              family: 'Roboto, sans-serif'
                          }
                      }
                  },
                  x: {
                      title: {
                          display: true,
                          text: 'Месяц',
                          font: {
                              size: 14,
                              family: 'Roboto, sans-serif',
                              weight: '500'
                          },
                          color: '#666'
                      },
                      grid: {
                          display: false
                      },
                      ticks: {
                          color: '#666',
                          font: {
                              size: 12,
                              family: 'Roboto, sans-serif'
                          }
                      }
                  }
              },
              plugins: {
                  title: {
                      display: true,
                      text: 'Статистика задач по месяцам',
                      font: {
                          size: 16,
                          family: 'Roboto, sans-serif',
                          weight: '700'
                      },
                      color: '#333'
                  },
                  tooltip: {
                      mode: 'index',
                      intersect: false,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      titleFont: {
                          size: 14,
                          family: 'Roboto, sans-serif',
                          weight: '500'
                      },
                      bodyFont: {
                          size: 12,
                          family: 'Roboto, sans-serif'
                      },
                      footerFont: {
                          size: 10,
                          family: 'Roboto, sans-serif'
                      }
                  },
                  legend: {
                      display: true,
                      labels: {
                          color: '#333',
                          font: {
                              size: 12,
                              family: 'Roboto, sans-serif'
                          }
                      }
                  }
              },
              elements: {
                  line: {
                      tension: 0.4,
                      borderWidth: 2
                  },
                  point: {
                      radius: 0,
                      borderWidth: 2,
                      backgroundColor: '#fff',
                      hoverRadius: 6,
                      hoverBorderWidth: 2
                  }
              }
          }
      }));
  }

  createTeamsBacklogChart(container, statusByMonth) {
      if (!statusByMonth) {
          return;
      }
      this.createChart(container, statusByMonth, 'type');
  }

  createBacklogLineChart(container, data) {
      if (!data) {
          return;
      }
      this.createChart(container, data, 'line');
  }

  clearCharts() {
    // Уничтожаем все графики перед очисткой
    this.charts.forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
    this.charts.clear(); // Очищаем сохраненные графики
    if (this.chartContainer) {
        this.chartContainer.innerHTML = ''; // Очищаем контейнер с графиками
    }
  }

  prepareChartData(data) {
    if (!data || typeof data !== 'object') {
      return {
        labels: [],
        datasets: []
      };
    }

    try {
      const months = Object.keys(data)
        .sort((a, b) => {
          const [yearA, monthA] = a.split('-').map(Number);
          const [yearB, monthB] = b.split('-').map(Number);
          return yearA !== yearB ? yearA - yearB : monthA - monthB;
        });
      const statuses = [ 'unresolved', 'resolved', 'rejected', 'to_be_closed','created'];
      const statusColors = {
        'resolved': 'rgba(75, 192, 192, 0.7)',
        'created': 'rgb(255, 99, 132)',
        'unresolved': 'rgb(255, 159, 64)',
        'delayed': 'rgb(153, 102, 255)',
        'rejected': '#4f4f4fbd',
      };

      const datasets = statuses.map(status => ({
        label: status === 'unresolved' ? 'бэклог' : status,
        label: status === ' resolved' ? 'исправлены' : status === 'unresolved' ? 'бэклог' : status === 'rejected' ? 'отклонены' : status === 'to_be_closed' ? 'к закрытию' : status === 'created' ? 'созданы' : status,

        data: months.map(month => data[month][status] || 0),
        borderColor: statusColors[status],
        backgroundColor: status === 'resolved' ? 'rgba(75, 192, 192, 1)' : 
        status === 'бэклог' ? '#7070702F' :
                       status === 'created' ? 'rgb(255, 99, 132)' :
                       statusColors[status],
        fill: status === 'resolved' || status === 'created' ,
        borderWidth: 2,
        tension: 0.4
      }));

      return {
        labels: months,
        datasets: datasets
      };
    } catch (error) {
      return {
        labels: [],
        datasets: []
      };
    }
  }

  updateChartsTheme() {
    this.charts.forEach(chart => {
        if (chart && chart.options) {
            chart.options.scales.x.grid.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--chart-grid-color');
            chart.options.scales.y.grid.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--chart-grid-color');
            chart.update();
        }
    });
  }
}
