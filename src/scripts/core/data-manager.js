class DataManager extends Reactive {
    constructor(container) {
        super(container);
        log('[DataManager] Initialized');
        this.dataKeys = ['issues', 'index', 'statistics', 'dataUpdated'];
        this.setupSubscriptions();
    }

    setupSubscriptions() {
        this.subscribe('process', (value) => {
            log(`[DataManager] Process event received: ${value}`);
            switch (value) {
                case 'cleanup_local_storage':
                    this.cleanupLocalStorage(true);
                    break;
                case 'cleanup_local_storage_data':
                    this.cleanupLocalStorage(false, this.dataKeys);
                    break;
            }
        });

        this.subscribe('issuesFile', (file) => {
            this.loadIssuesFromFile(file);
        });
    }

    async loadIssuesFromFile(file) {
        try {
            return await new Promise((resolve, reject) => {
                if (file) {
                    if (!file.name.endsWith('.csv'))
                        DataManager.loadIssuesFromCsvFile(file);
                }
                else return ('null_file');
            });
        } catch (error) {
            return (error);
        }
    }

    static async loadIssuesFromCsvFile(file) {
        return new Promise((resolve, reject) => {
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