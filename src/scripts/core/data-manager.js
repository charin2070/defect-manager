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

  loadFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        console.error('[DataManager] No file provided');
        reject(new Error('No file provided'));
        return;
      }

      try {
        this.setState({ dataStatus: 'loading' }, 'DataManager.loadFromFile');
        // CSV-file
        if (file.name.endsWith('.csv')) {
          this.loadFromCsvFile(file).then((issues) => {
            IndexManager.indexIssues(issues).then((index) => {
              this.setState({ 
                index: index,
                issues: index.taskId,
                dataSource: 'file',
                dateUpdated: file.lastModified,
                dataStatus: 'loaded'
              }, '[DataManager] loadFromFile');

              this.saveToLocalStorage('index', index).then(() => {
                resolve(index);
              });
            });
          });
        }
      } catch (error) {
        console.error('[DataManager] Error loading file:', error);
        reject(error);
      }
    });
  }

  loadFromCsvFile(csvFile) {
    return new Promise((resolve, reject) => {
      // Get lines
      this.readFile(csvFile)
        .then(csvLines => {
          // Parse lines
          CsvParser.csvLinesToObjects(csvLines)
            .then(csvObjects => {
              const issues = csvObjects.map(csvObject => new Issue(csvObject));
              resolve(issues);
            })
            .catch(error => {
              console.error("[DataManager.loadFromCsvFile] Error:", error);
              reject(error);
            });
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

  // Returns values from Local Storage by keys
  loadFromLocalStorage(dataKey) {
    return new Promise((resolve, reject) => {
      log(localStorage, '🚀 [DataManager] Loading from Local Storage...');

      try {
        const storageData = localStorage.getItem(dataKey);
        if (!storageData) {
          log(localStorage, 'No data found in localStorage', '[DataManager]');
          resolve(null);
          return;
        }

        const data = JSON.parse(storageData);
        this.setState({ 
          dataSource: 'storage',
          dataStatus: 'loaded'
        }, 'DataManager.loadFromLocalStorage');

        resolve(data);
      } catch (error) {
        console.error('[DataManager] Error loading from localStorage:', error);
        reject(error);
      }
    });
  }

  saveToLocalStorage(dataKey,data) {
    log(data, '🚀 [DataManager] Saving to LocalStorage');

    return new Promise((resolve, reject) => {
      try {
        if (!data || typeof data !== 'object') {
          console.error('[DataManager] saveToLocalStorage: Invalid data object provided');
          reject(new Error('Invalid data object'));
          return;
        }

        const serializedData = JSON.stringify(data);
        localStorage.setItem(dataKey, serializedData);
        
        this.setState({
          index: data,
          issues: data.taskId,
          dataStatus: 'loaded'
        }, '[DataManager] saveToLocalStorage');

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

}