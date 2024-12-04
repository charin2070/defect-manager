class App {
<<<<<<< HEAD
    static #instance = null;

    constructor(container) {
        this.container = container;
        if (App.#instance)
            return App.#instance;

        this.refact = new Refact(container);
        App.#instance = this;
        
        // Default config
        this.defaultConfig = {
            mode: "prod",
            dataPrefix: "defect-manager",
            theme: "light"
        };

        this.init();
    }

    init() {
        try {
            if (!this.container) {
                console.error(`App: Parent container not found. Parent container: ${this.parentContainer}`);
                return;
            }

            // Очищаем контейнер перед инициализацией
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }

            this.config = new ConfigManager(this.defaultConfig);
            this.config.loadFromLocalStorage();

            this.statisticManager = new StatisticManager();
            
            // Initialize state
            const initialFilters = {
                dateStart: new Date('2021-01-01').toISOString(),
                dateEnd: new Date().toISOString(),
                team: 'all'
            };

            this.refact.setState({
                filters: initialFilters,
                config: this.getConfig(),
                currentView: null,
                statistics: {
                    byCreation: {},
                    overview: {}
                }
            });

            // Создаем layout
            this.layoutView = new LayoutView();
            this.container.appendChild(this.layoutView.getWrapper());
            
            // Настраиваем обработчики событий
            this.setupEventListeners();

            // Подписываемся на изменения issues до их загрузки
            this.refact.subscribe('issues', (issues) => {
                if (!issues) return;
                
                // Обновляем statisticManager
                this.statisticManager.issues = issues;
                
                // Получаем задачи, сгруппированные по дате создания
                const byCreation = this.statisticManager.groupIssuesByDate();
                
                // Получаем общую статистику
                const overview = this.statisticManager.getStatistics();
                
                // Обновляем статистику в state
                this.refact.setState({
                    statistics: {
                        byCreation,
                        overview
                    }
                }, 'statisticManager');

                // Выводим статистику в консоль
                console.group('📊 Статистика по задачам:');
                console.log('Всего задач:', overview.total);
                console.log('Открытых:', overview.open);
                console.log('Закрытых:', overview.closed);
                console.log('Просроченных:', overview.overdue);
                console.log('Среднее время закрытия:', Math.round(overview.avgClosingTime), 'дней');
                
                console.group('По приоритетам:');
                Object.entries(overview.byPriority).forEach(([priority, count]) => {
                    console.log(`${priority}: ${count}`);
                });
                console.groupEnd();
                
                console.group('По статусам:');
                Object.entries(overview.byStatus).forEach(([status, count]) => {
                    console.log(`${status}: ${count}`);
                });
                console.groupEnd();
                
                console.group('Тренды:');
                console.log('За 30 дней:', Object.keys(overview.trends.last30Days).length, 'дней с активностью');
                console.log('За 90 дней:', Object.keys(overview.trends.last90Days).length, 'дней с активностью');
                console.groupEnd();
                
                console.groupEnd();
            });

            // Создаем DataManager и загружаем данные после подписки
            this.dataManager = new DataManager(this.config.getValue('dataPrefix'));
            this.dataManager.loadFromLocalStorage(this.config.getValue('dataPrefix'));
            const issues = this.dataManager.getIssues();
            if (issues && issues.length > 0) {
                this.showDashboard();
            } else {
                this.showUploadView();
            }

            // Устанавливаем статус инициализации
            this.refact.setState({ appStatus: 'initialized' });

            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }
    

    static getInstance(parentContainer) {
        if (!App.#instance) {
            App.#instance = new App(parentContainer);
        }
        return App.#instance;
    }

    getParentContainer() {
        return this.parentContainer;
    }

    setupEventListeners() {
        // Подписываемся на изменение маршрута
        this.refact.subscribe('route', (route) => {
            if (route === 'dashboard') {
                this.showDashboard();
            } else if (route === 'upload') {
                this.showUploadView();
            } else {
                // Если маршрут не указан, проверяем наличие данных
                const issues = this.dataManager.getIssues();
                if (issues && issues.length > 0) {
                    this.showDashboard();
                } else {
                    this.showUploadView();
                }
            }
        });

        // Подписываемся на загрузку новых данных
        this.refact.subscribe('issues', (issues) => {
            if (issues && issues.length > 0) {
                // Если появились данные, показываем дашборд
                this.showDashboard();
            }
        });
    }

    getConfig() {
        return this.config ? this.config.getConfig() : this.defaultConfig;
    }

    setTheme(theme) {
        if (this.config) {
            this.config.setValue('theme', theme);
            document.body.classList.toggle('dark-theme', theme === 'dark');
        }
    }

    showDashboard() {
        // Очищаем контейнер для контента
        const contentContainer = this.layoutView.contentContainer;
        while (contentContainer.firstChild) {
            contentContainer.removeChild(contentContainer.firstChild);
        }
        
        // Создаем и показываем dashboard
        this.currentView = new DashboardView();
        contentContainer.appendChild(this.currentView.getContainer());
        this.refact.setState({ currentView: 'dashboard' });
    }

    showUploadView() {
        // Очищаем контейнер для контента
        const contentContainer = this.layoutView.contentContainer;
        while (contentContainer.firstChild) {
            contentContainer.removeChild(contentContainer.firstChild);
        }
        
        // Создаем и показываем upload view
        this.currentView = new UploadView();
        contentContainer.appendChild(this.currentView.getContainer());
        this.refact.setState({ currentView: 'upload' });
    }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const app = App.getInstance(document.getElementById('app'));
=======
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
>>>>>>> 413ea59d99e7f4b83c6ec8cbf77e1de2e15d057b
});