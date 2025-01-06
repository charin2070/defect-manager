// Reads, parse and store data
class DataManager {
  constructor() {
    this.refact = Refact.getInstance();
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    // Process
    this.refact.subscribe('process', (value) => {
      switch (value) {
        // Cleanup entire Local Storage
        case 'cleanup_local_storage':
          this.cleanupLocalStorage(true);
          break;
      }
    });

    this.refact.subscribe('uploadedFile', (file) => {
      this.loadFromFile(file);
    });

  }

  onFileUpload(file) {

    this.loadFromFile(file).then(({ issues }) => {
      const index = IndexManager.getStructuredIndex(issues);
      const statistics = StatisticManager.updateStatistics({ index, issues });

      // Save to localStorage first
      this.saveToLocalStorage({ issues, index, statistics })
        .then(() => {
          // Then update state
          this.refact.setState({
            issues,
            index,
            statistics,
            dataSource: 'file',
            dataStatus: 'loaded',
            appStatus: 'ready',
            currentView: 'dashboard',
            dataUpdated: new Date(file.lastModified).toLocaleDateString('en-GB')
          }, '[DataManager] onFileUpload');

          log(`✅ [DataManager] ${issues.length} issues loaded and saved to localStorage`);
        })
        .catch(error => {
          console.error('[DataManager] Error saving to localStorage:', error);
        });
    });
  }

  // Load issues from file
  loadFromFile(file) {
    log('🚀 [DataManager] Loading from file:', file.name);
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('File not available'));
        return;
      }

      if (file.name.endsWith('.csv')) {
        this.loadFromCsvFile(file).then((issues) => {
          log(`✅ [DataManager] ${issues.length} issues loaded from CSV file`);
          resolve({ issues, source: 'file' });
        }).catch(reject);
      } else {
        reject(new Error('[DataManager] Unsupported file format'));
      }
    });
  }


  // Load issues from CSV file
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

  async loadFromLocalStorage(dataKeys = this.dataKeys) {
    log('🏃‍➡️ [DataManager] Loading data from Local Storage...');

    let issues = JSON.parse(localStorage.getItem('issues'));
    this.refact.setState({ issues: issues }, 'DataManager.loadFromLocalStorage');

    return {
      issues: issues,
      source: 'local_storage',
      dataStatus: 'loaded'
    };
  }

  saveToLocalStorage(dataObject) {
    log('🚀 [DataManager] Saving to LocalStorage');

    return new Promise((resolve, reject) => {
      try {
        if (!dataObject || typeof dataObject !== 'object') {
          throw new Error('Invalid data object');
        }

        // Save each data type separately
        if (dataObject.issues) {
          localStorage.setItem('issues', JSON.stringify(dataObject.issues));
        }

        log('✅ [DataManager] Data saved to Local Storage');
        resolve(true);
      } catch (error) {
        console.error('[DataManager.saveToLocalStorage] Error:', error);
        reject(error);
      }
    });
  }

  setEmptyState() {
    this.refact.setState({
      issues: [],
      dataStatus: 'empty',
      dataSource: null,
      appStatus: 'ready',
      currentView: 'upload',
      error: null,
      toast: null,
      uploadedFile: null
    }, '[DataManager] setEmptyState');
  }


  // Import SLA dates from Power BI issues
  updateSlaDates(loadedData) {
    // Convert loaded data to Issue objects if they aren't already
    let loadedIssues = loadedData.map(data => data instanceof Issue ? data : new Issue(data));

    // Update SLA dates in existing issues
    let updatedCount = 0;
    loadedIssues.forEach(loadedIssue => {
      let taskId = loadedIssue.id;
      let existingIssue = this.refact.state.issues.find(issue => issue.id === taskId);
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
          this.saveToLocalStorage({ index: this.refact.state.index, issues: this.refact.state.issues }).then(() => {
            resolve({ issues: this.refact.state.issues, source: 'file' });
          });
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
    this.refact.setState({ issues: this.refact.state.issues }, 'DataManager.loadFromFile.updateSLA');
    this.refact.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
    this.saveToLocalStorage({ index: this.refact.state.index, issues: this.refact.state.issues }).then(() => {
      resolve({ issues: this.refact.state.issues, source: 'file' });
    });
    return { issues: this.refact.state.issues, source: 'file' };
  }

  cleanupLocalStorage(isAll = false, dataKeys = this.dataKeys) {
    if (isAll) {
      localStorage.clear();
      log(localStorage, '🗑️ [Data Manager] All data removed from LocalStorage');
      this.refact.setState({ dataStatus: 'empty' }, 'DataManager.removeFromLocalStorage');
      return;
    } else {
      dataKeys.forEach(key => {
        localStorage.removeItem(key);
        this.refact.setState({ [key]: null }, 'DataManager.removeFromLocalStorage');
        log(localStorage, `🗑️ [Data Manager] Removed ${key} from LocalStorage`);
      });
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
    return this.refact.state.issues;
  }

  getIndex() {
    return this.refact.state.index;
  }

}