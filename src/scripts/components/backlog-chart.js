class BacklogChart extends BaseChart {
  constructor(index, container) {
    super(container);
    this.createBacklogChart(index);
  }

  createBacklogChart(index) {
    if (!index || !index.defects) return;

    const monthlyData = {};
    const allDates = new Set();

    // Initialize data structure for each month
    const initMonthData = () => ({ unresolved: 0, resolved: 0, backlog: 0 });

    // Process unresolved defects
    if (index.defects.unresolved?.creationDates) {
      Object.entries(index.defects.unresolved.creationDates).forEach(([date, issues]) => {
        const month = new Date(date).toLocaleString('default', { year: 'numeric', month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = initMonthData();
        monthlyData[month].unresolved += issues.length;
        allDates.add(month);
      });
    }

    // Process resolved defects
    if (index.defects.resolved?.resolutionDates) {
      Object.entries(index.defects.resolved.resolutionDates).forEach(([date, issues]) => {
        const month = new Date(date).toLocaleString('default', { year: 'numeric', month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = initMonthData();
        monthlyData[month].resolved += issues.length;
        allDates.add(month);
      });
    }

    // Sort months chronologically from oldest to newest
    const sortedMonths = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

    // Calculate backlog for each month
    let previousBacklog = 0;
    sortedMonths.forEach(month => {
      const monthData = monthlyData[month];
      // For each month, we add new unresolved and subtract newly resolved
      const monthlyChange = monthData.unresolved - monthData.resolved;
      monthData.backlog = previousBacklog + monthlyChange;
      previousBacklog = monthData.backlog;
    });

    // Find minimum backlog value
    const minBacklog = Math.min(...sortedMonths.map(month => monthlyData[month].backlog));
    
    // If minimum is negative, shift all values up
    if (minBacklog < 0) {
      const shift = Math.abs(minBacklog);
      sortedMonths.forEach(month => {
        monthlyData[month].backlog += shift;
      });
    }

    // Reverse months for display (newest to oldest)
    const displayMonths = [...sortedMonths].reverse();

    const chartData = {
      labels: displayMonths,
      datasets: [
        {
          label: 'Бэклог',
          data: displayMonths.map(month => monthlyData[month].backlog),
          borderColor: 'rgb(128, 128, 128)',
          backgroundColor: 'rgba(128, 128, 128, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4
        }
      ]
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Тренд бэклога',
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
          type: 'category',
          title: {
            display: true,
            text: 'Дата'
          },
          grid: {
            display: true,
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true
          }
        },
        y: {
          title: {
            display: true,
            text: 'Количество дефектов'
          },
          beginAtZero: true,
          suggestedMin: 0,
          suggestedMax: 50,
          ticks: {
            stepSize: 10
          },
          grid: {
            display: true,
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    this.createChart('line', chartData, null, options);
  }

  update(index) {
    this.createBacklogChart(index);
  }
}