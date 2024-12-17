class DataCore extends Reactive {
  constructor(options = {}) {
      super(document.getElementById('app'));
      this.dataKeys = ['issues', 'index', 'statistics', 'dataUpdated'];
      this.setupSubscriptions();
  }

  setupSubscriptions() {
    // Cleanup
      this.subscribe('process', (value) => {
          switch (value) {
              case 'cleanup_local_storage':
                  this.cleanupLocalStorage(true);
                  break;
              case 'cleanup_local_storage_data_keys':
                  this.cleanupLocalStorage(false, this.dataKeys);
                  break;
            }
        });
        this.subscribe('issuesFile', (file) => this.loadIssuesFromFile(file));
    }

    loadIssuesFromFile(file) {
        return new Promise((resolve, reject) => {
            if (file && file.name.endsWith('.csv'))
                this.parseFile(file, CsvParser).then((issues) =>
                resolve(issues));

            if (!file)
                reject('null_file');
            
            if (!file.name.endsWith('.csv'))
                reject('invalid_file');
            if (file.size > 1000000)
                reject('file_too_big');
        }).then(() => {
            log('🚀 [DataManager] File not found');
            return;
      }
      log(file, '🚀 [DataManager] Loading from file');
      this.loadFromFile(file).then((issues) => {
          log(issues, '[DataManager] Issues loaded from file');
          const index = IndexManager.getStructuredIndex(issues);
          this.setState({
              issues: issues,
              index: index,
              dataSource: 'file',
              dataUpdated: new Date(file.lastModified).toLocaleDateString('en-GB')
          }, '[DataManager] onFileUpload');
          log('[DataManager] State updated after file upload');
      });
  }

  setEmptyState() {
      this.setState({
          issues: [],
          index: {},
          statistics: {},
          view: 'upload',
          dataStatus: 'empty',
          dataSource: 'local_storage',
          dataUpdated: new Date().toLocaleDateString('en-GB')
      }, '[DataManager] setEmptyState');
  }

  loadData() {
      log('[DataManager] Loading data from LocalStorage');
      this.loadFromLocalStorage().then((data) => {
          if (!data) {
              log('🚀 [DataManager] No data found in LocalStorage');
              this.setEmptyState();
              return;
          }

          const { issues, index, statistics } = data;

          if (issues) {
              this.setState({
                  issues: issues,
                  dataStatus: 'loaded',
                  index: index,
                  statistics: statistics,
                  dataSource: 'local_storage',
                  dataUpdated: new Date().toLocaleDateString('en-GB')
              }, '[DataManager] loadData');
              log('[DataManager] State updated with data from LocalStorage');
          } else {
              const data = this.managers.dataManager.getFromLocalStorage(); 
              this.setState({
                  issues: data.issues,
                  index: data.index,
                  statistics: data.statistics,
                  dataSource: 'local_storage',
                  dataUpdated: new Date().toLocaleDateString('en-GB')
              }, '[DataManager] loadData');
              log('[DataManager] State updated with fallback data from LocalStorage');
          }
      });
  }

  loadFromLocalStorage(dataKeys = this.dataKeys) {
    log('🔃 [DataManager] Loading data from Local Storage...');
    return new Promise((resolve, reject) => {
        try {
            const issues = JSON.parse(localStorage.getItem('issues'));
            log(issues, '[DataManager] Issues retrieved from Local Storage');
            if (issues) {
                const index = JSON.parse(localStorage.getItem('index'));
                log(index, '[DataManager] Index retrieved from Local Storage');
                if (!index) {
                    log('[DataManager] Index not found, generating new index');
                    const index = IndexManager.getStructuredIndex(issues);
                }

                const statistics = JSON.parse(localStorage.getItem('statistics'));
                log(statistics, '[DataManager] Statistics retrieved from Local Storage');
                if (!statistics) {
                    log('[DataManager] Statistics not found, updating statistics');
                    StatisticManager.updateStatistics(index).then(statistics => {
                        this.saveToLocalStorage({ issues: issues, statistics: statistics })
                        this.setState({
                            index: index,
                            statistics: statistics,
                            issues: issues,
                            dataStatus: 'loaded',
                            dataSource: 'local_storage',
                        }, '[DataManager] loadFromLocalStorage');
                        log(issues, `✅ [DataManager] ${issues.length} tasks loaded from LocalStorage`);
                        this.setState({ view: 'dashboard' });
                        resolve({ issues: issues, source: 'local_storage' });
                    }).catch(error => {
                        log(error, '[DataManager] Error updating statistics');
                        reject(error);
                    });
                } else {
                    this.setState({
                      issues: issues,
                      index: index,
                      statistics: statistics,
                      dataSource: 'local_storage',
                      view: 'dashboard'
                    }, '[DataManager] loadFromLocalStorage');
                    log(issues, `✅ [DataManager] ${issues.length} tasks loaded from LocalStorage`);
                    resolve({ issues: issues, index: index, statistics: statistics, dataStatus: 'loaded', datasource: 'local_storage' });
                }
            } else {
                log('[DataManager] No issues found in Local Storage');
                this.setEmptyState();
                resolve(null);
            }
        } catch (error) {
            log(error, '[DataManager] Error loading from Local Storage');
            this.setEmptyState();
            reject(error);
        }
    });
}
}