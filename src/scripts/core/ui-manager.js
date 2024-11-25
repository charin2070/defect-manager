class UIManager extends EventEmitter {
  constructor(containerId = "app", theme = "light") {
    super();
    console.log('UIManager: constructor start');
    
    this.container = document.getElementById(containerId);
    this.theme = theme;
    this.applyTheme(this.theme);
    const componentsConfig = {
      "views-dropdown": { listeners: {} },
      "date-range-dropdown": { listeners: { click: this.switchTheme.bind(this) } },
      "teams-dropdown": { listeners: {} },
      "select-file-button": { listeners: {} },
      "upload-file-button": { listeners: { click: this.onUploadFileClick.bind(this) } },
      "menu-dropdown": { listeners: {} },
      "custom-file-input": { listeners: {} },
      "clear-storage": { listeners: { click: this.clearStorage.bind(this) } },
      "theme-toggle": { listeners: { click: this.switchTheme.bind(this) } },
      "chart-container": { listeners: {} },
      "teams-dropdown": { listeners: { change: this.handleTeamSelection.bind(this) } },
      "toggleChartView": { listeners: { click: this.toggleChartView.bind(this) } }
    };
    this.componentManager = new ComponentManager(componentsConfig);
    this.chartManager = new ChartManager();
    this.analyticManager = new AnalyticManager();
    this.widgetsRow = new WidgetsRow('widgets-row-container');
    
    console.log('UIManager: creating FileInputComponent');
    // Создаем FileInputComponent и передаем обработчик с привязанным контекстом
    const handleFileSelected = (file) => {
      console.log('UIManager: handleFileSelected called with file', file?.name);
      if (file) {
        this.emit("onFileSelected", file);
      } else {
        console.error('UIManager: handleFileSelected called without file');
      }
    };
    this.fileInput = new FileInputComponent('custom-file-input', handleFileSelected);
    
    // Инициализируем дропдауны
    this.teamsDropdown = new TeamsDropdownComponent('teams-dropdown', 'Все команды');
    this.dateRangeDropdown = new DateRangeDropdown('date-range-dropdown', 'За всё время', null, null, this.onDateRangeChange.bind(this));
    
    this.initializeEventListeners();
    this.render();
    console.log('UIManager: constructor end');
  }

  applyTheme(theme) {
    document.body.classList.toggle("dark-theme", theme === "dark");
    document.body.classList.toggle("light-theme", theme === "light");
    this.theme = theme;
  }

  switchTheme = () => {
    const newTheme = this.theme === "dark" ? "light" : "dark";
    this.applyTheme(newTheme);
    this.emit("onThemeSwitch");
  };

  onDateRangeChange(startDate, endDate) {
    console.log('UIManager.onDateRangeChange input:', {
      startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
      endDate: endDate instanceof Date ? endDate.toISOString() : endDate
    });

    // Store dates as is - don't modify them
    this.currentDateStart = startDate;
    this.currentDateEnd = endDate;
    
    // Emit filter change event with current team and date range
    const selectedTeam = this.teamsDropdown.getSelectedTeam();
    
    const filters = {
      team: selectedTeam || 'all',
      dateStart: startDate,
      dateEnd: endDate
    };

    console.log('UIManager.onDateRangeChange emitting:', {
      team: filters.team,
      dateStart: filters.dateStart instanceof Date ? filters.dateStart.toISOString() : filters.dateStart,
      dateEnd: filters.dateEnd instanceof Date ? filters.dateEnd.toISOString() : filters.dateEnd
    });

    this.emit("onFilterChange", filters);
    
    // Перезапускаем обработку текущей выбранной команды с новым периодом
    if (selectedTeam) {
      this.handleTeamSelection(selectedTeam);
    } else {
      // Если команда не выбрана, просто обновляем графики с новым периодом
      let filteredIssues = this.issues;
      if (startDate && endDate) {
        filteredIssues = this.analyticManager.filterIssuesByDate(startDate, endDate, this.issues);
      }
      this.chartManager.updateCharts(filteredIssues);
    }
  }

  onUploadFileClick() {
    console.log('UIManager: onUploadFileClick called');
    this.showView('upload-data-view');
  }

  showUploadDataView() {
    console.log('UIManager: showUploadDataView called');
    this.showView('upload-data-view');
  }

  showView(viewId) {
    console.log('UIManager: showView called with', viewId);
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
      view.style.display = 'none';
    });

    // Show requested view
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = '';
      console.log('UIManager: view shown', viewId);
    } else {
      console.error('UIManager: view not found', viewId);
    }
  }

  clearStorage = () => this.emit("onClearLocalStorageClick");

  renderClass(className) {
    document.querySelectorAll(`.${className}`).forEach((element) => {
      switch (className) {
        case "app-dropdown":
          this.componentManager.addComponent(
            className,
            new DropdownComponent(
              element,
              ["Бэклог", "Обращения", "Календарь"],
              element.title
            )
          );
          break;
        case "app-dates-dropdown":
          this.componentManager.addComponent(
            className,
            new DatesDropdownComponent(
              element,
              new Date("2015-01-01"),
              new Date("2024-09-01")
            )
          );
          break;
        case "teams-dropdown":
          this.componentManager.addComponent(
            className,
            new TeamsDropdownComponent(element)
          );
          break;
      }
    });
  }

  applyTheme() {
    if (this.theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }

  render() {
    this.renderClass("app-dropdown");
    this.renderClass("app-dates-dropdown");
  }

  hideUploadDataView() {
    const uploadView = document.getElementById('upload-view');
    if (uploadView) {
      uploadView.style.display = 'none';
    }
  }

  showBacklogView(statistics) {
    console.log('UIManager: showBacklogView called with statistics:', statistics);
    
    if (!statistics) {
      console.error('UIManager: showBacklogView called without statistics');
      return;
    }

    // Update widgets with statistics
    this.updateWidgets(statistics);

    try {
      // Create backlog line chart
      if (statistics.statusByMonth) {
        console.log('UIManager: creating backlog line chart with data:', statistics.statusByMonth);
        this.chartManager.createBacklogLineChart('backlog-chart-canvas', statistics.statusByMonth);
        this.chartManager.createTeamsBacklogChart('teams-backlog-chart-canvas', statistics.statusByMonth);
      } else {
        console.error('UIManager: statistics.statusByMonth is missing');
      }

      // Show container view
      this.showView('backlog-line-view');

      // Set visibility for charts
      const backlogChart = document.getElementById('backlog-chart-canvas');
      const teamsBacklogChart = document.getElementById('teams-backlog-chart-canvas');

      if (backlogChart) backlogChart.style.visibility = 'visible';
      if (teamsBacklogChart) teamsBacklogChart.style.visibility = 'visible';
    } catch (error) {
      console.error('UIManager: Error in showBacklogView:', error);
    }
  }

  updateWidgets(statistics) {
    if (!this.widgetsRow) return;

    // Считаем задачи, созданные в текущем месяце
    const startMonth = new Date(statistics.dateStart);
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);
    const endMonth = new Date(startMonth);
    endMonth.setMonth(endMonth.getMonth() + 1);
    endMonth.setDate(0);
    endMonth.setHours(23, 59, 59, 999);

    const createdInMonth = statistics.opened.filter(issue => {
      const created = new Date(issue.created);
      return created >= startMonth && created <= endMonth;
    }).length;

    // Создаем конфигурацию виджетов
    const widgets = [
      {
        value: statistics.opened.length,
        label: 'Открытых дефектов',
        icon: 'src/img/jira-defect.svg',
        trend: {
          direction: createdInMonth > 0 ? 'up' : 'down',
          text: `${createdInMonth} за месяц`
        }
      },
      {
        value: statistics.allTimeAverageResolution || 0,
        type: 'time',
        label: 'Среднее время исправления',
        icon: 'src/img/layers-0.svg',
        trend: {
          direction: 'neutral',
          text: 'В днях'
        }
      },
      {
        value: statistics.resolved.length,
        label: 'Закрытых дефектов',
        icon: 'src/img/jira-defect.svg',
        trend: {
          direction: statistics.resolved.length > 0 ? 'up' : 'down',
          text: `${Math.abs(statistics.resolved.length)} всего`
        }
      }
    ];

    // Обновляем виджеты
    this.widgetsRow.updateWidgets(widgets);
  }

  updateTitle(newTitle) {
    document.title = newTitle;
  }

  populateDateDropdown(data) {
    const uniqueDates = new Set();
    data.forEach(({ dateField: dateString }) => {
      if (dateString) {
        const date = new Date(dateString);
        if (!isNaN(date)) {
          uniqueDates.add(date.toISOString().split("T")[0]);
        } else {
          console.warn(`Invalid date: ${dateString}`);
        }
      }
    });

    const dateDropdown = this.componentManager.getElement(
      "date-range-dropdown"
    );
    dateDropdown.innerHTML = "";
    uniqueDates.forEach((date) => {
      const option = document.createElement("option");
      option.value = date;
      option.textContent = date;
      dateDropdown.appendChild(option);
    });
  }

  initializeEventListeners() {
    document.addEventListener('teamSelected', (event) => {
      const selectedTeam = event.detail.team;
      this.handleTeamSelection(selectedTeam);
    });
  }

  handleTeamSelection(team) {
    // Get all teams for dropdown
    const teams = this.analyticManager.getUniqueTeams();
    this.teamsDropdown.updateTeams(teams);
    
    // Select the current team
    this.teamsDropdown.selectTeam(team);
    
    // Emit filter change event with selected team and current date range
    this.emit("onFilterChange", {
      team: team,
      dateStart: this.currentDateStart,
      dateEnd: this.currentDateEnd
    });
  }

  updateChartsForTeam(team) {
    const teamData = this.analyticManager.getTeamData(team);
    const allIssues = this.analyticManager.getAllIssues();
    
    // Update backlog chart with team data
    this.chartManager.updateBacklogChart(teamData, {
      'unresolved': teamData.filter(issue => !this.analyticManager.isResolved(issue.status)).length
    });
    
    // Update teams chart with ALL issues
    this.chartManager.updateTeamsChart(allIssues, {
      'unresolved': allIssues.filter(issue => !this.analyticManager.isResolved(issue.status)).length
    });
    
    // Обновляем dropdown
    this.teamsDropdown.selectTeam(team);
  }

  updateChartsForAllTeams() {
    const allIssues = this.analyticManager.getAllIssues();
    this.chartManager.updateCharts(allIssues, {
      'unresolved': allIssues.filter(issue => !this.analyticManager.isResolved(issue.status)).length
    });
  }

  toggleChartView() {
    const teamsChartCanvas = document.getElementById('teams-backlog-chart-canvas');
    const backlogChartCanvas = document.getElementById('backlog-chart-canvas');
    
    if (teamsChartCanvas && backlogChartCanvas) {
      if (teamsChartCanvas.style.display === 'none') {
        teamsChartCanvas.style.display = 'block';
        backlogChartCanvas.style.display = 'none';
      } else {
        teamsChartCanvas.style.display = 'none';
        backlogChartCanvas.style.display = 'block';
      }
    }
  }

  updateStatistics() {
    const stats = this.analyticManager.getStatistics();
    console.log('Statistics:', stats);
  }

  onDateRangeChange(startDate, endDate) {
    // Обновляем статистику с новыми датами
    const statistics = this.analyticManager.getStatistics();
    this.showBacklogView(statistics);
  }
}
