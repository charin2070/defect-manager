class BacklogChart extends BaseChart {

  constructor(issues, canvasId, labelsData) {
    super(issues, canvasId);
    this.createBacklogChart(issues, canvasId, labelsData);
  }

  createBacklogChart(tasks, canvasId, labelsData) {
    if(this.chart) {
      this.chart.destroy();
    }
    
    const createdCounts = {};
    const resolvedCounts = {};
    const backlogCounts = {};
    const labels = new Set();

    // Сначала собираем все даты
    tasks.forEach(task => {
      const createdDate = new Date(task.created);
      const monthYearCreated = `${createdDate.getFullYear()}-${(createdDate.getMonth() + 1).toString().padStart(2, '0')}`;
      labels.add(monthYearCreated);
    });

    // Сортируем даты
    const sortedLabels = Array.from(labels).sort();

    // Для каждой даты считаем метрики
    sortedLabels.forEach(currentDate => {
      const [currentYear, currentMonth] = currentDate.split('-').map(Number);
      const currentDateTime = new Date(currentYear, currentMonth - 1).getTime();

      // Считаем созданные задачи до этой даты
      createdCounts[currentDate] = tasks.filter(task => {
        const taskDate = new Date(task.created);
        const monthYear = `${taskDate.getFullYear()}-${(taskDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return monthYear === currentDate;
      }).length;

      // Считаем решенные задачи до этой даты
      resolvedCounts[currentDate] = tasks.filter(task => {
        if (!task.resolved) return false;
        const resolvedDate = new Date(task.resolved);
        const resolvedDateTime = resolvedDate.getTime();
        return resolvedDateTime <= new Date(currentYear, currentMonth).getTime();
      }).length;

      // Считаем текущий бэклог на эту дату (созданные минус решенные)
      const totalCreated = tasks.filter(task => {
        const createdDate = new Date(task.created);
        return createdDate.getTime() <= new Date(currentYear, currentMonth).getTime();
      }).length;

      const totalResolved = tasks.filter(task => {
        if (!task.resolved) return false;
        const resolvedDate = new Date(task.resolved);
        return resolvedDate.getTime() <= new Date(currentYear, currentMonth).getTime();
      }).length;

      backlogCounts[currentDate] = totalCreated - totalResolved;
    });

    const createdData = sortedLabels.map(label => createdCounts[label] || 0);
    const resolvedData = sortedLabels.map(label => resolvedCounts[label] || 0);
    const backlogData = sortedLabels.map(label => backlogCounts[label] || 0);

    // Создаем график
    this.chart = new Chart(canvasId, {
      type: 'line',
      data: {
        labels: sortedLabels,
        datasets: [
          {
            label: labelsData? `Открыто (${labelsData.unresolved})`: `Открыто`,
            data: createdData,
            tension: 0.3,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true
          },
          {
            label: `Закрыто (${resolvedData.reduce((a, b) => a + b, 0)})`,
            data: resolvedData,
            tension: 0.3,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true
          },
          {
            label: 'Бэклог',
            data: backlogData,
            tension: 0.3,
            borderColor: '#FE981C',
            backgroundColor: '#fe981c3b',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        animations: {
          tension: {
            duration: 3000,
            easing: 'linear',
            from: 0,
            to: 0.5,
            loop: false,
          },
        },
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Дата'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Количество дефектов'
            }
          }
        }
      }
    });
    this.chart.update();
  }
}
