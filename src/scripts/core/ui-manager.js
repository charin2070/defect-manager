class UIManager extends EventEmitter {
  constructor(containerId = "app", theme = "light") {
    super();
    
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

    this.issueTable = new IssueTable('issue-table-container');
    this.slidePanel = new SlidePanel('slide-panel');
    this.widgetsRow = new WidgetsRow('widgets-row-container');
    
    // File input component
    const onFileSelected = (file) => {
      if (file) {
        this.emit("onFileSelected", file);
      }
    };
    
    this.fileInput = new FileInputComponent('custom-file-input', onFileSelected);
    
    // Инициализируем дропдауны
    this.teamsDropdown = new TeamsDropdownComponent('teams-dropdown', 'Все команды');
    this.dateRangeDropdown = new DateRangeDropdown('date-range-dropdown', 'За всё время', null, null, this.onDateRangeChange.bind(this));
    
    this.initializeEventListeners();
    this.render();
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
    this.showView('upload-data-view');
  }

  showUploadDataView() {
    this.showView('upload-data-view');
  }

  showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
      view.style.display = 'none';
    });

    // Show requested view
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = '';
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
    console.log(statistics, '[UIManager] Statistics');
    
    if (!statistics) {
      log('🔴 [UI Manager] Statistics are undefined');
      return;
    }

    this.statistics = statistics;

    this.updateWidgets(statistics);

    try {
      // Create backlog line chart
      if (statistics.statusByMonth) {
        this.chartManager.createBacklogLineChart('backlog-chart-canvas', statistics.statusByMonth);
        this.chartManager.createTeamsBacklogChart('teams-backlog-chart-canvas', statistics.statusByMonth);
      }

      this.updateTeamsDropdown(statistics.teams);

      // Show container view
      this.showView('backlog-line-view');

      // Set visibility for charts
      const backlogChart = document.getElementById('backlog-chart-canvas');
      const teamsBacklogChart = document.getElementById('teams-backlog-chart-canvas');

      if (backlogChart) backlogChart.style.visibility = 'visible';
      if (teamsBacklogChart) teamsBacklogChart.style.visibility = 'visible';
    } catch (error) {
              log(error, 'Error on reandering view');
    }
  }

  updateTeamsDropdown(teams) {
    this.teamsDropdown.updateTeams(teams);
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
        // Backlog
        value: statistics.opened.length,
        label: 'Открытых дефектов',
        icon: 'src/img/layers-0.svg',
        trend: {
          direction: createdInMonth > 0 ? 'up' : 'down',
          text: `${createdInMonth} за месяц`
        },
        onClick: this.onBacklogClick,
      },
      {
        // Resolution time
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
        // Reports
        value: statistics.unresolvedReports || 0,
        label: 'обращений',
        icon: 'src/img/user-speak.svg',
        trend: {
          direction: 'neutral',
          text: '<a href="#" class="widget-link">За текущий месяц</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" class="widget-link">За всё время</a>'
        },
        onClick: this.onReportsClick.bind(this)
      }
    ];
    
    // Обновляем Widgets
    this.widgetsRow.updateWidgets(widgets);
  }

  onReportsClick() {
    const statistics = this.statistics;
    
    // Create view
    if (!this.reportsView) {
      this.reportsView = new ReportsView();
    }
    
    const view = this.reportsView.render(
      statistics.topReportedCurrentMonth,
      statistics.topReported
    );
    
    this.slidePanel.setLogo('src/img/user-speak.svg');
    this.slidePanel.setTitle('Обращения');
    this.slidePanel.updateContent(view);
    this.slidePanel.open();
  }

  updateTitle(newTitle) {
    document.title = newTitle;
  }

  initializeEventListeners() {
    document.addEventListener('teamSelected', (event) => {
      const selectedTeam = event.detail.team;
      this.handleTeamSelection(selectedTeam);
    });
  }

  handleTeamSelection(team) {
    const newLocal = this;
    // Select the current team
    newLocal.teamsDropdown.selectTeam(team);
    
    // Emit filters
    this.emit("onFilterChange", {
      team: team,
      dateStart: this.dateRangeDropdown.getDateRange().startDate,
      dateEnd: this.dateRangeDropdown.getDateRange().endDate
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

  onDateRangeChange(startDate, endDate) {
    this.emit("onFilterChange", {
      team: this.teamsDropdown.getSelectedTeam(),
      dateStart: startDate,
      dateEnd: endDate
    });
  }

}
