// Reads, parse and store data
class DataManager{
  constructor(container) {
    this.refact = Refact.getInstance(container);
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
      this.onFileUpload(file);
    });

  }

  onFileUpload(file) {
    if (!file) {
      return;
    }
    this.loadFromFile(file).then((issues) => {
      const index = IndexManager.getStructuredIndex(issues);
      this.refact.setState({
        issues: issues,
        index: index,
        dataSource: 'file',
        // dateUpdated as date in format 'dd-mm-yyyy'
        dataUpdated: new Date(file.lastModified).toLocaleDateString('en-GB')
      }, '[DataManager] onFileUpload');
    });
  }
  
  // Load issues from file
  loadFromFile(file) {
    log(file, '🚀 [DataManager] Loading from file');
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Файл недоступен'));
        return;
      }

      if (file.name.endsWith('.csv')) {
        this.loadFromCsvFile(file).then((issues) => {
          this.refact.setState({
            issues: issues,
            dataSource: 'file',
            // dateUpdated as date in format 'dd-mm-yyyy'
            dataUpdated: new Date().toLocaleDateString('en-GB'),
          }, '[DataManager] loadFromFile');

          log(issues, `✅ [DataManager] ${issues.length} задач загруженно из CSV-файла`);
          resolve(issues);
        });
      } else {
        reject(new Error('[Data Manager] Неподдерживаемый формат файла'));
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

  loadFromLocalStorage(dataKeys = this.dataKeys) {
    log('🔃 [DataManager] Loading data from Local Storage...');
    return new Promise((resolve, reject) => {
      try {
        const issues = JSON.parse(localStorage.getItem('issues'));
        if (issues) {
          const index = JSON.parse(localStorage.getItem('index'));
          if (!index) {
            const index = IndexManager.getStructuredIndex(issues);
        } 

        const statistics = JSON.parse(localStorage.getItem('statistics'));
        if (!statistics) {
            statistics = StatisticManager.updateStatistics(index);
        };

        this.saveToLocalStorage({ issues: issues, statistics: statistics })
        this.refact.setState({
          index: index,
          statistics:statistics,
          dataSource: 'local_storage',
        }, '[DataManager] loadFromLocalStorage');
        log(issues, `✅ [DataManager] ${issues.length} задач загруженно из LocalStorage`);
        resolve({ issues: issues, source: 'local_storage' });
        } else {
          this.setEmptyState();
          resolve(null);
        }
  }
  catch (error) {   
          this.setEmptyState();
          reject(error);
          console.error('[DataManager.loadFromLocalStorage] Error:', error);
        }
      });
    }
      

         setEmptyState() {
          this.refact.setState({ issues: null, dataStatus: 'empty', index: null, statistics: null, dataSource: null, appStatus: 'initializing', error: null, toast: null, uploadedFile: null, })
        }   

        
  // Import SLA dates from Power BI issues
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
          this.saveToLocalStorage({ index: index, issues: index.taskId }).then(() => {
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
    this.saveToLocalStorage({ index: index, issues: index.taskId }).then(() => {
      resolve({ issues: this.refact.state.issues, source: 'file' });
    });
    return { issues: this.refact.state.issues, source: 'file' };
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

        // Ensure we're not saving undefined or null values
        Object.entries(dataObject).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            try {
              localStorage.setItem(key, JSON.stringify(value));
              log(`Saved ${key} to localStorage`, '✅ [DataManager]');
            } catch (error) {
              console.error(`[DataManager] Error saving ${key} to localStorage:`, error);
            }
          }
        });

        resolve(true);
      } catch (error) {
        console.error('[DataManager] saveToLocalStorage error:', error);
        reject(error);
      }
    });
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