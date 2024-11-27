class App extends EventEmitter {
  constructor() {
    super();
    
    this.mode;
    this.theme = 'light';
    this.dataPrefix;

    this.defaultConfig = { mode: "prod", theme: "light", dataPrefix: "defect-manager" };
    this.loadConfig(); // Загружаем конфигурацию перед созданием UIManager

    if (this.mode === "dev") {
      this.consolePanel = new ConsolePanel();
    }

    this.dataManager = new DataManager(this.getDataPrefix());
    this.uiManager = new UIManager("app", this.theme);
    this.chartManager = new ChartManager();
    this.themeManager = new ThemeManager();
    this.analyticManager = null;
    this.statisticManager = null;

    console.log('App: binding event handlers');
    // Event handlers are now bound in setupListeners()
    this.initialize();
    console.log('App: constructor end');
  }

  // Сохраняем конфигурацию в localStorage
  saveConfig() {
    localStorage.setItem("config", JSON.stringify({
      mode: this.mode,
      theme: this.theme,
      dataPrefix: this.dataPrefix
    }));
  }

  // Загружаем конфигурацию из localStorage
  loadConfig() {
    log(localStorage, "🗃️ Loading config from local storage...");

    let config = JSON.parse(localStorage.getItem("config"));
    if (!config) {
      log("🆓 No config in Local storage. Loading default.");

      config = this.defaultConfig;
    }

    this.mode = config.mode;
    this.theme = config.theme;
    this.dataPrefix = config.dataPrefix;

    if (config.theme !== this.theme) {
      this.theme = config.theme;
    }

    this.saveConfig();
  }

  // Инициализация приложения
  initialize() {
    this.setupListeners();
    this.loadData();
  }

  // Настраиваем слушатели событий
  setupListeners() {
    this.uiManager.on("onFileSelected", this.onFileSelected.bind(this));
    this.uiManager.on("onClearLocalStorageClick", this.onClearLocalStorage.bind(this));
    this.uiManager.on("onThemeSwitch", this.onThemeSwitch.bind(this));
    this.uiManager.on("onFilterChange", this.onFilterChange.bind(this));
    this.dataManager.on("onIssuesLoaded", this.onIssuesLoaded.bind(this));
  }

  // Получаем префикс данных
  getDataPrefix() {
    return this.dataPrefix;
  }

  // Обработка события очистки localStorage
  onClearLocalStorage() {
    console.log("📥 onClearLocalStorageClick");
    this.dataManager.clearLocalStorage();
    this.uiManager.showUploadDataView();
  }

  // Обработка события выбора файла
  onFileSelected(file) {
    console.log("⚡[App.onFileSelected] Starting file processing");
    console.log("⚡[App.onFileSelected] file:", file);
    
    if (file) {
      console.log("⚡[App.onFileSelected] Loading file:", file.name);
      this.dataManager.loadFromFile(file);
    } else {
      console.error("⚡[App.onFileSelected] No file provided");
    }
  }

  // Обработка события переключения темы
  onThemeSwitch() {
    this.theme = this.uiManager.theme;
    this.saveConfig();
  }

  // Обработка изменения фильтров (команда или даты)
  onFilterChange(filters) {
    const issues = this.dataManager.getIssues();
    // if (!issues || !this.analyticManager) return;

    filters = filters.detail;
    const statistics = this.analyticManager.getStatistics(
      issues,
      filters.dateStart,
      filters.dateEnd,
      filters.team
    );
    
    this.uiManager.showBacklogView(statistics);
  }

  // Обработка события загрузки данных
  onIssuesLoaded(event) {
    
    const issues = event.issues;
    if (event.source === 'file') {
      this.dataManager.saveToLocalStorage(this.getDataPrefix(), issues);
    }
    
    try {
      this.statisticManager = new StatisticManager(issues);
      const result = this.statisticManager.getStatisticsAndPredictionsNew();
      console.log('Statistics:', result);
    } catch (error) {
      console.error('Error in statistics processing:', error);
    }

    this.analyticManager = new AnalyticManager(issues);
    const statistics = this.analyticManager.getStatistics(issues, null, null, 'all');
    
    // Показываем backlog view с обновленной статистикой
    this.uiManager.showBacklogView(statistics);
  }

  // Загружаем данные из localStorage или показываем вид загрузки файла
  async loadData() {
    const data = await this.dataManager.loadData();
    if (!data) {
      this.uiManager.showUploadDataView();
    }
  }
}

// Точка входа
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.initialize();
});
