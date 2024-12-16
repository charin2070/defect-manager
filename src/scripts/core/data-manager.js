// Reads, parse and store data
class DataManager extends Reactive {
  constructor() {
    super(document.body);

    this.dataKeys = ['issues', 'index', 'statistics', 'dataUpdated'];
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    // Process
    this.subscribe('process', (value) => {
      switch (value) {
        // Cleanup entire Local Storage
        case 'cleanup_local_storage':
          this.cleanupLocalStorage(true);
          break;
      }
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
          this.setState({
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
        const result = {};
        dataKeys.forEach(dataKey => {
          try {
            result[dataKey] = JSON.parse(localStorage.getItem(dataKey));
          } catch (error) {
            log(error, `[DataManager.loadFromLocalStorage] При разборе данных из LocalStorage произошла ошибка (ключ: ${dataKey})`);
            result[dataKey] = null;
          }
        });

        log(result, '✅ [DataManager.loadFromLocalStorage] Данные загружены из LocalStorage');
        resolve(result);

      } catch (error) {
        console.error('[DataManager.loadFromLocalStorage] При разборе данных из LocalStorage произошла неизвестная ошибка', error);
        reject(error);
      }
    });
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
    this.setState({ issues: this.refact.state.issues }, 'DataManager.loadFromFile.updateSLA');
    this.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
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

        Object.entries(dataObject).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
          log(`Saved ${key} to localStorage`, '✅ [DataManager]');
        });

        this.setState({
          ...dataObject,
          dataStatus: 'loaded'
        }, '[DataManager] saveToLocalStorage');

        log(localStorage, '✅ [DataManager] All data successfully saved to LocalStorage');
        resolve(true);
      } catch (error) {
        console.error('[DataManager] Error saving to localStorage:', error);
        reject(error);
      }
    });
  }

  cleanupLocalStorage(isAll = false, dataKeys = this.dataKeys) {
    if (isAll) {
      localStorage.clear();
      log(localStorage, '🗑️ [Data Manager] All data removed from LocalStorage');
      this.setState({ dataStatus: 'empty' }, 'DataManager.removeFromLocalStorage');
      return;
    } else {
      dataKeys.forEach(key => {
        localStorage.removeItem(key);
        this.setState({ [key]: null }, 'DataManager.removeFromLocalStorage');
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
    return this.state.issues;
  }

  getIndex() {
    return this.state.index;
  }

}