class App {
  constructor(container) {
    this.dataPrefix = "defect-manager";
    this.refact = new Refact(container);
    this.defaultConfig = {
      mode: "prod",
      dataPrefix: "defect-manager",
      theme: "light"
    };
    this.config = ConfigManager.getInstance(this.defaultConfig);
    this.init();
  }

  init() {
    // Variables
    const initialFilters = {
      dateStart: new Date('2021-01-01').toISOString(),
      dateEnd: new Date().toISOString(),
      team: 'all'
    };
    this.refact.setState({ filters: initialFilters }, 'App.constructor');

    // Managers
    this.dataManager = new DataManager(this.getDataPrefix());
    this.viewController = new ViewController(this.container);
    this.statisticManager = new StatisticManager();
    this.reportManager = new ReportManager();
    this.setupSubscriptions();
    this.dataManager.loadData(this.getDataPrefix());
  }

  // Настраиваем подписки на изменения состояния
  setupSubscriptions() {
    // Подписываемся на изменения фильтров
    this.refact.subscribe('filters', (filters) => {
      this.handleFilterChange(filters);
    });

    this.refact.subscribe('dataStatus', (status) => {
      if (status === 'empty') {
        this.viewController.showView('upload');
      }
    });

    // Subscribe to issues changes
    this.refact.subscribe('issues', (issues) => {
      if (!issues || (Array.isArray(issues) && issues.length === 0)) {
        console.log("📊 No issues found, showing upload view");
        this.viewController.showView('upload');
      } else {
        console.log(`📊 Found ${issues.length} issues, showing dashboard`);
        this.handleIssuesLoaded({ data: issues, source: 'state' });
        this.viewController.showView('dashboard');
      }
    });

    // Подписываемся на изменение темы
    this.refact.subscribe('theme', (theme) => {
      this.themeManager.switchTheme(theme);
    });
  }

  getDataPrefix() {
    return this.dataPrefix;
  }


  // Обработка изменения фильтров
  handleFilterChange(filters) {
    const issues = this.dataManager.getIssues();
    if (!issues || !this.analyticManager) return;

    const statistics = this.analyticManager.getStatistics(
      issues,
      filters.dateStart,
      filters.dateEnd,
      filters.team
    );
    console.log('Statistics:', statistics);
    this.refact.setState({ statistics }, 'App.handleFilterChange');
  }

  // Обработка загруженных данных
  handleIssuesLoaded(issues) {
    console.log('Issues loaded:', issues);
    if (issues.source === 'file') {
      this.dataManager.saveToLocalStorage(this.getDataPrefix(), issues.data);
    }

    this.statisticManager = new StatisticManager(issues.data);
    const statistics = this.statisticManager.getStatistics();

    this.refact.setState({
      currentView: 'backlog',
      statistics
    }, 'App.handleIssuesLoaded');
  }

}

// Точка входа
document.addEventListener("DOMContentLoaded", () => {
  const app = new App(document.getElementById('app'))
});