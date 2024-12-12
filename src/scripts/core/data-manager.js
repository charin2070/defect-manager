// Reads, parse and store data
class DataManager extends Reactive {
  constructor(dataKey = 'defect-manager') {
    super(document.body);

    this.issues = [];
    this.defects = [];
    this.requests = [];
    this.otherIssues = [];
    this.lastError = null;
    this.dataKey = dataKey;
    this.setupSubscriptions();
    // Try to load data from Local Storage on initialization
  }

  setupSubscriptions() {
    // Clear Entire Local Storage
    this.subscribe('process', (value) => {
      switch (value) {
        case 'cleanup_local_storage':
          localStorage.clear();
          this.setState({ issues: null }, 'DataManager');
          this.setState({ process: null }, 'DataManager');
          // window.location.reload();
          break;
      }
    });

    // Clear Local Storage by key
    this.subscribe('clearLocalStorageData', (value) => {
      if (value === true) {
        this.clearLocalStorage();
        this.setState({ dataStatus: 'empty' }, 'DataManager.clearLocalStorageData');
        this.setState({ issues: null }, 'DataManager.clearLocalStorageData');
        this.setState({ clearLocalStorageData: false }, 'DataManager.clearLocalStorageData');
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
        this.loadFromLocalStorage(this.dataKey);
      }
    });
  }

  // Returns values from Local Storage by keys
  loadFromLocalStorage(dataKeys = []) {
    log(localStorage, '🚀 DataManager. Loading from Local Storage...');

    this.setState({ dataSource: 'storage' }, 'DataManager.loadFromLocalStorage');
    if (!Array.isArray(dataKeys)) {
      dataKeys = [dataKeys];
    }

    const result = {};
    for (const key of dataKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsedValue = JSON.parse(value);
          // Check if the parsed value is an array of entries (was a Map)
          result[key] = Array.isArray(parsedValue) && parsedValue.every(item => Array.isArray(item) && item.length === 2)
            ? new Map(parsedValue)
            : parsedValue;
        } catch (error) {
          console.warn(`Failed to parse value for key "${key}":`, error);
          result[key] = value;
        }
      } else {
        result[key] = null;
      }
    }

    log(result, '🚀 DataManager. Loaded from Local Storage');
    return result;
  }

  saveToLocalStorage(dataObject) {
    log(dataObject, '🚀 [DataManager] Saving to LocalStorage');

    return new Promise((resolve, reject) => {
      try {
        if (!dataObject || typeof dataObject !== 'object') {
          console.error('[DataManager] saveToLocalStorage: Invalid data object provided');
          reject(new Error('Invalid data object'));
          return;
        }

        Object.entries(dataObject).forEach(([key, value]) => {
          try {
            // Convert Map to array of entries before serializing
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
          } catch (error) {
            console.warn(`⛔ [DataManager] Failed to save key "${key}":`, error);
          }
        });

        log(localStorage, '✅ [DataManager] Data successfully saved to LocalStorage');
        resolve(true);
      } catch (error) {
        console.error('⛔ [DataManager] Error saving to LocalStorage:', error);
        reject(error);
      }
    });
  }

  removeFromLocalStorage(isAll = false, dataKeys = []) {
    if (isAll) {
      localStorage.clear();
      console.log('🗑️ [Data Manager] All data removed from LocalStorage');
    } else {
      dataKeys.forEach(key => {
        localStorage.removeItem(key);
        this.setState({ [key]: null }, 'DataManager.removeFromLocalStorage');
        console.log(`🗑️ [Data Manager] Removed ${key} from LocalStorage`);
      });
    }

    this.setState({ dataStatus: 'empty' }, 'DataManager.removeFromLocalStorage');
  }

  updateIssues(issues) {
    this.issues = issues;
    this.setState({issues: this.issues}, 'DataManager.updateIssues');
  }

  loadFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        console.error('[DataManager] No file provided');
        reject(new Error('No file provided'));
        return;
      }
    try {
      this.setState({ dataStatus: 'loading' }, 'DataManager.loadFromFile');
      this.issues = [];
      // Check if the file is CSV
      if (file.name.endsWith('.csv')) {
        this.loadFromCsvFile(file).then((issues) => {
          this.setState({issues: issues}, '[DataManager] loadFromFile');
          IndexManager.indexIssues(issues).then((index) => {
            this.index = index;
            this.setState({ index: this.index }, 'DataManager.loadFromFile()');
            resolve({ issues: this.issues, dataSource: 'file' }, 'DataManager.loadFromFile()');
          });
          this.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
        });
      }

    } catch (error) {
      console.error('[DataManager] Error loading file:', error);
      return null;
    }
    });

  }

  isLocalStorageEmpty(dataKey) {
    try {
      return !localStorage.getItem(String(dataKey));
    } catch (error) {
      console.error('[DataManager] Error checking Local Storage:', error);
      return true;
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

  getIndex() {
    return this.index;
  }

  // File to Issues
  loadFromCsvFile(csvFile) {
    return new Promise((resolve, reject) => {
      this.readFile(csvFile)
        .then(csvLines => {
          CsvParser.csvLinesToObjects(csvLines)
            .then(csvObjects => {
              const issues = csvObjects.map(csvObject => new Issue(csvObject));
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

  // Import SLA dates from Power BI
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
    this.saveToLocalStorage(this.dataKey || 'defect-manager');
    return { issues: this.refact.state.issues, source: 'file' };
  }

}