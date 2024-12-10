// Read and parse data to Jira issue-objects

class DataManager extends Reactive {
  constructor(dataPrefix = 'defect-manager') {
    super(document.body);

    this.issues = [];
    this.lastError = null;
    this.dataPrefix = dataPrefix;
    this.setState({ clearLocalStorageData: false }, 'DataManager.constructor');

    // Register MessageView component
    if (window.Refact && window.MessageView) {
      const refact = Refact.getInstance();
      refact.addComponent('messageView', MessageView);
    }

    // Fields for string to Date conversion
    this.datesFields = [
      "created",
      "resolved",
      "slaDate"
    ];

    // Rename Jira fields to object properties
    this.propsMap = {
      "Issue key": "id",
      "Custom field (Команда устраняющая проблему)": "team",
      "Assignee": "assignee",
      "Reporter": "reporter",
      "Status": "status",
      "Priority": "priority",
      "Summary": "summary",
      "Description": "description",
      "Created": "created",
      "Resolved": "resolved",
      "Custom field (SLA дата наступления просрочки)": "slaDate",
      "Custom field (Количество обращений)": "reports",
      "Issue tyepe": "type",
      "Дата наступления SLA": "slaDate"
    };

    // PowerBI specific headers that indicate the data source
    this.powerBiHeaders = [
      "Номер драфта",
      "дата открытия",
      "дата закрытия"
    ];

    this.statusMap = {
      "NEW": "new",
      "Отклонен": "rejected",
      "На исправление": "to_be_closed",
      "В работе": "in_progress",
      "Отложен": "delayed",
      "Закрыт": "resolved",
      "Отклонен командой": "rejected_by_team",
    }

    this.setupSubscriptions();
    // Try to load data from Local Storage on initialization
  }

  setupSubscriptions() {
    // Clear Entire Local Storage
    this.subscribe('dataStatus', (value) => {
      switch (value) {
        case 'cleanupEntireLocalStorage':
          localStorage.clear();
          log(localStorage, '🗑️ [DataManager] Entire Local Storage cleared');
          break;
      }
    });

    this.refact.subscribe('clearLocalStorage', (value) => {
      switch (value) {
        case true:
          localStorage.removeItem(this.dataPrefix);
          this.refact.setState({ dataStatus: 'empty' }, 'DataManager.clearLocalStorage');
          this.refact.setState({ issues: null }, 'DataManager.clearLocalStorage');
          break;
      }
    });

    // Clear Local Storage by key
    this.refact.subscribe('clearLocalStorageData', (value) => {
      if (value === true) {
        this.clearLocalStorage();
        this.refact.setState({ dataStatus: 'empty' }, 'DataManager.clearLocalStorageData');
        this.refact.setState({ issues: null }, 'DataManager.clearLocalStorageData');
        this.refact.setState({ clearLocalStorageData: false }, 'DataManager.clearLocalStorageData');
        window.location.reload();
      }
    });

    this.refact.subscribe('uploadedFile', (file) => {
      if (file) {
        this.loadFromFile(file);
        this.setState({ dataStatus: 'loading' }, 'DataManager.loadFromFile');
      }
    });

    this.subscribe('appStatus', (value) => {
      if (value === 'initialized') {
        this.loadFromLocalStorage(this.dataPrefix);
      }
    });
  }

  loadFromLocalStorage(dataPrefix) {
    log(`🚀 [DataManager] Loading "${dataPrefix}" from Local Storage`);

    const savedData = localStorage.getItem(dataPrefix);
    const dateModified = localStorage.getItem(`${dataPrefix}_modified`);
    console.log('[DataManager] Found data:', Boolean(savedData), typeof savedData);

    if (!savedData) {
      log(`[DataManager] Local Storage is empty for prefix "${dataPrefix}"`);
      this.refact.setState({ dataStatus: 'empty' }, 'DataManager.loadFromLocalStorage');
      return false;
    }

    try {
      const parsedData = JSON.parse(savedData);
      if (Array.isArray(parsedData)) {
        this.issues = parsedData.map(issueData => new Issue(issueData));
        this.refact.setState({
          issues: this.issues,
          dataStatus: 'loaded',
          dataModified: dateModified || null
        }, 'DataManager.loadFromLocalStorage');
        return true;
      }
    } catch (error) {
      console.error('[DataManager] Error parsing data from Local Storage:', error);
      this.refact.setState({ dataStatus: 'error' }, 'DataManager.loadFromLocalStorage');
      return false;
    }

    return false;
  }

  isLocalStorageEmpty(dataPrefix) {
    try {
      return !localStorage.getItem(String(dataPrefix));
    } catch (error) {
      console.error('[DataManager] Error checking Local Storage:', error);
      return true;
    }
  }

  saveToLocalStorage(dataPrefix) {
    try {
      const data = {
        issues: this.issues,
        dataModified: this.refact.state.dataModified     
      };
      localStorage.setItem(dataPrefix, JSON.stringify(data));
    } catch (error) {
      if (error.name === 'QuotaExceededError' || 
          error.code === 22 || // Chrome quota exceeded
          error.code === 1014) { // Firefox quota exceeded
        console.error('[DataManager.saveToLocalStorage] Local storage quota exceeded:', error);
        console.log('Attempting to show message via MessageView...');
        MessageView.showMessage(
          'Предупреждение',
          'Не удалось сохранить данные в локальное хранилище из-за нехватки места. Попробуйте очистить хранилище или уменьшить объем данных.'
        );
      } else {
        console.error('[DataManager.saveToLocalStorage] Error saving to local storage:', error);
      }
    }
  }

  clearLocalStorage(dataPrefix) {
    try {
      localStorage.removeItem(this.dataPrefix);
      this.issues = [];
      this.refact.setState({ issues: null }, 'DataManager.clearLocalStorage');
      console.log('🗑️ Local Storage cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing Local Storage:', error);
      return false;
    }
  }

  // Returns file lines
  readFile(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result.split('\n'));
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  getIssues() {
    return this.issues;
  }

  // File to Issues
  loadFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith(".csv")) {
        this.setState({ dataStatus: 'error' }, 'DataManager.loadFromFile');
        reject(new Error(`Unsupported file format: ${file.name}`));
        return;
      }

      this.loadFromCsvFile(file)
        .then(loadedIssues => {
          this.updateIssues(loadedIssues, file);
          resolve({ issues: this.issues, source: 'file' });
        })
        .catch(error => {
          console.error("[DataManager.loadFromFile] Error:", error);
          this.setState({ dataStatus: 'error' }, 'DataManager.loadFromFile');
          reject(error);
        });
    });
  }

  // CSV to Issues
  loadFromCsvFile(csvFile) {
    return new Promise((resolve, reject) => {
      this.readFile(csvFile)
        .then(csvLines => {
          CsvParser.csvLinesToObjects(csvLines)
            .then(csvObjects => {
              const issues = csvObjects.map(obj => new Issue(obj));
              resolve(issues);
            })
            .catch(error => {
              console.error("[DataManager.loadFromCsvFile] Error:", error);
              reject(error);
            });
        })
        .catch(error => {
          console.error("[DataManager.loadFromCsvFile] Error reading file:", error);
          reject(error);
        });
    });
  }

  updateIssues(issues, file) {
    this.issues = issues;
    this.setState({ issues: issues }, 'DataManager.loadFromCsvFile');
    this.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromCsvFile');
    this.setState({ dataModified: file.lastModifiedDate }, 'DataManager.loadFromCsvFile');
    this.saveToLocalStorage(this.dataPrefix || 'defect-manager');
  }

  updateSlaDates(loadedData) {
    // Convert loaded data to Issue objects if they aren't already
    const loadedIssues = loadedData.map(data => data instanceof Issue ? data : new Issue(data));

    // Update SLA dates in existing issues
    let updatedCount = 0;
    loadedIssues.forEach(loadedIssue => {
      const taskId = loadedIssue.id;
      const existingIssue = this.refact.state.issues.find(issue => issue.id === taskId);
      if (existingIssue) {
        updatedCount++;
        existingIssue.slaDate = loadedIssue.slaDate;
      }
    });

    if (updatedCount > 0) {
      console.log('Attempting to show message via MessageView...');
      MessageView.showMessage(
        'Обновление SLA',
        `Обновлено ${updatedCount} дат SLA`,
        'Обновить',
        () => {
          this.refact.setState({ issues: this.refact.state.issues }, 'DataManager.loadFromFile.updateSLA');
          this.refact.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
          this.saveToLocalStorage();
        }
      );
    } else {
      console.log('Attempting to show message via MessageView...');
      MessageView.showMessage(
        'Обновление SLA',
        'Не найдено задач для обновления SLA',
        'Закрыть'
      );
    }

    // Update state with modified issues
    this.setState({ issues: this.refact.state.issues }, 'DataManager.loadFromFile.updateSLA');
    this.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
    this.saveToLocalStorage(this.dataPrefix || 'defect-manager');
    return { issues: this.refact.state.issues, source: 'file' };
  }

  subscribeToIssues(callback) {
    this.refact.subscribe('issues', callback);
  }
}