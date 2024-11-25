class ChartManager {
  constructor() {
      this.chartContainer = document.getElementById('chart-container');
      this.charts = {}; // Хранилище для графиков
  }

  createChart(container, data, type) {
      console.log(`📊 [ChartManager.createChart] Creating chart in ${container}`);
      const canvas = document.getElementById(container);
      if (!canvas) {
          console.error(`❌ [ChartManager.createChart] Canvas element with id ${container} not found`);
          return;
      }

      // Уничтожаем существующий график, если он есть
      if (this.charts[container]) {
          console.log(`🗑️ [ChartManager.createChart] Destroying existing chart in ${container}`);
          this.charts[container].destroy();
          delete this.charts[container];
      }

      const chartData = this.prepareChartData(data);
      console.log(`📊 [ChartManager.createChart] Chart data prepared:`, chartData);

      this.charts[container] = new Chart(canvas, {
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
                      radius: 4,
                      borderWidth: 2,
                      backgroundColor: '#fff',
                      hoverRadius: 6,
                      hoverBorderWidth: 2
                  }
              }
          }
      });
      console.log(`✅ [ChartManager.createChart] Chart created in ${container}`);
  }

  createTeamsBacklogChart(container, statusByMonth) {
      console.log('📊 [ChartManager.createTeamsBacklogChart] Starting with data:', statusByMonth);
      if (!statusByMonth) {
          console.error('❌ [ChartManager.createTeamsBacklogChart] No statusByMonth data');
          return;
      }
      this.createChart(container, statusByMonth, 'type');
  }

  createBacklogLineChart(container, data) {
      console.log('📊 [ChartManager.createBacklogLineChart] Starting with data:', data);
      if (!data) {
          console.error('❌ [ChartManager.createBacklogLineChart] No data provided');
          return;
      }
      this.createChart(container, data, 'line');
  }

  clearCharts() {
      console.log('🗑️ [ChartManager.clearCharts] Clearing all charts');
      // Уничтожаем все графики перед очисткой
      Object.keys(this.charts).forEach(containerId => {
          if (this.charts[containerId]) {
              console.log(`🗑️ [ChartManager.clearCharts] Destroying chart in ${containerId}`);
              this.charts[containerId].destroy();
          }
      });
      this.charts = {}; // Очищаем сохраненные графики
      if (this.chartContainer) {
          this.chartContainer.innerHTML = ''; // Очищаем контейнер с графиками
      }
  }

  prepareChartData(data) {
      console.log("📊 [ChartManager.prepareChartData] input:", data);
      if (!data || typeof data !== 'object') {
        console.error("❌ [ChartManager.prepareChartData] Invalid data:", data);
        return {
          labels: [],
          datasets: []
        };
      }

      try {
        const months = Object.keys(data);
        const statuses = ['created', 'unresolved', 'resolved', 'rejected', 'to_be_closed'];
        const statusColors = {
          'unresolved': 'rgb(54, 162, 235)',
          'resolved': 'rgb(75, 192, 192)',
          'created': 'rgb(255, 99, 132)',
          'delayed': 'rgb(153, 102, 255)',
          'rejected': 'rgb(255, 159, 64)'
        };

        const datasets = statuses.map(status => ({
          label: status,
          data: months.map(month => data[month][status] || 0),
          borderColor: statusColors[status],
          backgroundColor: statusColors[status],
          fill: false
        }));

        return {
          labels: months,
          datasets: datasets
        };
      } catch (error) {
        console.error("❌ [ChartManager.prepareChartData] Error processing data:", error);
        return {
          labels: [],
          datasets: []
        };
      }
  }
}
