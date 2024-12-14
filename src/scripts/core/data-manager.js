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

    this.refact.subscribe('uploadedFile', (file) => {
      if (file) {
        this.loadFromFile(file);
        this.setState({ dataStatus: 'loading' }, 'DataManager.loadFromFile');
      }
    });

    this.subscribe('appStatus', (value) => {
      if (value === 'initialized') {
        this.loadFromLocalStorage(['index', 'issues']).then((data) => {
          if (data && Object.keys(data).length > 0) {
            // Convert taskId object to a flat array of issues
            const flatIssues = Object.values(data.issues || {}).flat();
            const statistics = StatisticManager.getStructuredStatistics(flatIssues);
            this.setState({ issues: data.index.taskId, index: data.index, statistics: statistics, dataStatus: 'loaded' }, 'DataManager.loadFromFile');
          }
        });
      }
    });

    ;
  }

  loadFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) { 
        reject(new Error('Файл не предоставлен'));
        return;
      }

      log(file, '🚀 [DataManager] Loading from file');

      if (file.name.endsWith('.csv')) {
        this.loadFromCsvFile(file).then((issues) => {
          IndexManager.indexIssues(issues).then((index) => {
            // Сохраняем taskId в issues и удаляем его из index
            const issuesData = index.taskId;
            delete index.taskId;

            this.setState({
              index: index,
              issues: issuesData,
              dataSource: 'file',
              dateUpdated: file.lastModified,
              dataStatus: 'loaded'
            }, '[DataManager] loadFromFile');

            // Сохраняем в localStorage с разделением на index и issues
            this.saveToLocalStorage({
              index: index,
              issues: issuesData,
              issuesUpdated:  file.lastModified,
              slaUpdated: false,
            }).then(() => {
              resolve({ issues: issuesData, source: 'file' });
            });
          });
        });
      } else {
        reject(new Error('Неподдерживаемый формат файла'));
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

  // Returns values from Local Storage by keys
  loadFromLocalStorage(dataKeys = ['index', 'issues']) {
    return new Promise((resolve, reject) => {
      try {
        log('🚀 [DataManager] Loading from LocalStorage');
        
        const result = {};
        let hasData = false;

        // Загружаем данные для каждого ключа
        dataKeys.forEach(dataKey => {
          const data = localStorage.getItem(dataKey);
          
          if (data) {
            result[dataKey] = JSON.parse(data);
            hasData = true;
            log(`✅ [DataManager] Загружено ${dataKey} из LocalStorage`);
          } else {
            log(`⚠️ [DataManager] Данные не найдены для ${dataKey} в LocalStorage`);
          }
        });

        if (!hasData) {
          reject(new Error('Данные не найдены в локальном хранилище'));
          return;
        }

        // Обновляем состояние только если есть все необходимые данные
        if (result.index || result.issues) {
          this.setState({
            ...result,
            dataSource: 'localStorage',
            dataStatus: 'loaded'
          }, '[DataManager] loadFromLocalStorage');
        }

        log(result, '✅ [DataManager] Data loaded from LocalStorage');
        resolve(result);
      } catch (error) {
        console.error('Ошибка при загрузке данных из локального хранилища:', error);
        reject(error);
      }
    });
  }

  saveToLocalStorage(data) {
    log(data, '🚀 [DataManager] Saving to LocalStorage');

    return new Promise((resolve, reject) => {
      try {
        if (!data || typeof data !== 'object') {
          console.error('[DataManager] saveToLocalStorage: Invalid data object provided');
          reject(new Error('Invalid data object'));
          return;
        }

        // Сохраняем каждый объект под своим ключом
        Object.entries(data).forEach(([dataKey, value]) => {
          const serializedData = JSON.stringify(value);
          localStorage.setItem(dataKey, serializedData);
          log(`Saved ${dataKey} to localStorage`, '✅ [DataManager]');
        });
        
        this.setState({
          ...data,
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

  cleanupLocalStorage(isAll = false, dataKeys = []) {
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

  cleanupLocalStorageData() {
    this.cleanupLocalStorage(false, ['index', 'issues']);
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