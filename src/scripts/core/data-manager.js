class DataManager extends Reactive {

    constructor(container) {
        super(container);
        log('[DataManager] Initialized');
        this.dataKeys = ['issues', 'index', 'statistics', 'dataUpdated'];
        this.setupSubscriptions();
    }

    setupSubscriptions() {
        this.subscribe('process', (value) => {
            switch (value) {
                case 'cleanup_local_storage':
                    this.cleanupLocalStorage(true);
                    break;
                case 'cleanup_local_storage_data':
                    this.cleanupLocalStorage(false, this.dataKeys);
                    break;
            }
        });

        // Add subscription for issuesFile changes
        this.subscribe('issuesFile', (file) => {
            if (file) {
                log(`[DataManager] New file received: ${file.name}`);
                this.loadIssuesFromFile(file);
            }
        });
    }

    async loadIssuesFromFile(file) {
        try {
            log('[DataManager] Loading issues from file...');
            this.state.managers.viewController.showLoader('reading');
            
            const startRead = performance.now();
            const issues = await CsvParser.loadIssuesFromCsvFile(file);
            const readTime = performance.now() - startRead;
            log(`[DataManager] File reading completed in ${readTime.toFixed(2)}ms`);

            this.state.managers.viewController.showLoader('indexing');
            const startIndex = performance.now();
            const index = await IndexManager.getStructuredIndex(issues);
            const indexTime = performance.now() - startIndex;
            log(`[DataManager] Index building completed in ${indexTime.toFixed(2)}ms`);
            
            this.state.managers.viewController.showLoader('statistics');
            const startStats = performance.now();
            const statistics = await StatisticManager.getIssueStatistics({ issues, dateRange: IndexManager.getDateFilter("-30d")});
            const statsTime = performance.now() - startStats;
            log(`[DataManager] Statistics calculation completed in ${statsTime.toFixed(2)}ms`);
            
            this.setState({
                issues: issues,
                index: index,
                statistics: statistics,
                dataStatus: 'loaded',
                dataSource: 'file',
                dataUpdated: new Date().toLocaleDateString('en-GB'),
                view: 'dashboard'
            });

            this.state.managers.viewController.showLoader('saving');
            const startSave = performance.now();
            await this.saveToLocalStorage();
            const saveTime = performance.now() - startSave;
            log(`[DataManager] Data saved to localStorage in ${saveTime.toFixed(2)}ms`);
            
            const totalTime = readTime + indexTime + statsTime + saveTime;
            log(`[DataManager] Total processing time: ${totalTime.toFixed(2)}ms`);
            log(`[DataManager] Performance breakdown:
                - Reading: ${(readTime / totalTime * 100).toFixed(1)}%
                - Indexing: ${(indexTime / totalTime * 100).toFixed(1)}%
                - Statistics: ${(statsTime / totalTime * 100).toFixed(1)}%
                - Saving: ${(saveTime / totalTime * 100).toFixed(1)}%`);
            
            this.state.managers.viewController.hideLoader();
            return true;
        } catch (error) {
            console.error('[DataManager] Error loading issues from file:', error);
            this.state.managers.viewController.hideLoader();
            throw error;
        }
    }

    // async loadIssuesFromCsvFile(file) {
    //     try {
    //         const lines = await this.readFile(file);
    //         // Process CSV lines into issues array
    //         // Skip header row
    //         const issues = lines.slice(1)
    //             .filter(line => line.trim())
    //             .map(line => {
    //                 const [taskId, status, description, created] = line.split(',');
    //                 return {
    //                     taskId: taskId?.trim(),
    //                     status: status?.trim(),
    //                     description: description?.trim(),
    //                     created: created?.trim()
    //                 };
    //             });
    //         return issues;
    //     } catch (error) {
    //         log(`❌ [DataManager] Error parsing CSV file: ${error.message}`);
    //         throw error;
    //     }
    // }

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

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
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

    async loadFromLocalStorage(dataKeys = this.dataKeys) {
        try {
            log('[DataManager] Loading data from Local Storage...');
            
            // Get index from localStorage
            const storedIndex = localStorage.getItem('index');
            let index;
            
            if (storedIndex) {
                index = JSON.parse(storedIndex);
                log(index, '[DataManager] Index retrieved from Local Storage');
                
                // Extract issues from index
                const issues = Object.values(index.id);
                log(issues, '[DataManager] Issues extracted from index');

                // Calculate fresh statistics from index
                log('[DataManager] Calculating fresh statistics from index');
                const statistics = await StatisticManager.updateStatistics(index);

                // Update state with loaded data
                this.setState({
                    issues,
                    index,
                    statistics,
                    dataStatus: 'loaded',
                    dataSource: 'local_storage',
                    dataUpdated: new Date().toLocaleDateString('en-GB')
                }, '[DataManager] loadFromLocalStorage');

                log(issues, `✅ [DataManager] ${issues.length} tasks loaded from index`);
                return { issues, index, statistics };
            } else {
                log('[DataManager] No index found in Local Storage');
                this.setEmptyState();
                return null;
            }
        } catch (error) {
            log(error, '[DataManager] Error loading from Local Storage');
            this.setEmptyState();
            throw error;
        }
    }

    async loadData() {
        try {
            log('[DataManager] Loading data from localStorage...');
            this.state.managers.viewController.showLoader('reading');
            
            const startRead = performance.now();
            const storedIssues = localStorage.getItem('issues');
            const storedIndex = localStorage.getItem('index');
            const readTime = performance.now() - startRead;
            log(`[DataManager] LocalStorage reading completed in ${readTime.toFixed(2)}ms`);
            
            if (storedIssues && storedIndex) {
                const startParse = performance.now();
                let issues = JSON.parse(storedIssues);
                const parseTime = performance.now() - startParse;
                log(`[DataManager] JSON parsing completed in ${parseTime.toFixed(2)}ms`);

                // Check if we have compressed issues
                if (!issues[0]?.description) {
                    log('[DataManager] Found compressed issues, expanding...');
                    issues = issues.map(issue => ({
                        ...issue,
                        description: '',
                        summary: '',
                        reporter: '',
                        priority: '',
                        labels: [],
                        components: []
                    }));
                }

                this.state.managers.viewController.showLoader('indexing');
                const startIndex = performance.now();
                let index = JSON.parse(storedIndex);
                
                // Check if we have compressed index
                if (Object.values(index)[0]?.s) {
                    log('[DataManager] Found compressed index, expanding...');
                    const expandedIndex = {
                        id: {},
                        defects: {
                            resolved: { count: 0, resolutions: {} },
                            unresolved: { count: 0, statuses: {} }
                        },
                        requests: {
                            resolved: { count: 0, resolutions: {} },
                            unresolved: { count: 0, statuses: {} }
                        }
                    };

                    Object.entries(index).forEach(([id, data]) => {
                        // Expand basic issue data
                        expandedIndex.id[id] = {
                            id: id,
                            status: data.s,
                            type: data.t,
                            created: data.d,
                            team: data.m || '',
                            resolved: data.r || null
                        };

                        // Update statistics
                        const isDefect = data.t === 'defect';
                        const isResolved = data.s === 'resolved';
                        const category = isDefect ? 'defects' : 'requests';
                        const state = isResolved ? 'resolved' : 'unresolved';

                        expandedIndex[category][state].count++;
                        if (isResolved) {
                            expandedIndex[category].resolved.resolutions[data.s] = 
                                (expandedIndex[category].resolved.resolutions[data.s] || 0) + 1;
                        } else {
                            expandedIndex[category].unresolved.statuses[data.s] = 
                                (expandedIndex[category].unresolved.statuses[data.s] || 0) + 1;
                        }
                    });

                    index = expandedIndex;
                }

                const indexTime = performance.now() - startIndex;
                log(`[DataManager] Index parsing completed in ${indexTime.toFixed(2)}ms`);
                
                this.state.managers.viewController.showLoader('statistics');
                const startStats = performance.now();
                const statistics = await StatisticManager.getIssueStatistics({ issues, index });
                const statsTime = performance.now() - startStats;
                log(`[DataManager] Statistics calculation completed in ${statsTime.toFixed(2)}ms`);
                
                this.setState({
                    issues,
                    index,
                    statistics,
                    dataStatus: 'loaded',
                    dataSource: 'localStorage',
                    dataUpdated: new Date().toLocaleDateString('en-GB'),
                    view: 'dashboard'
                });
                
                const totalTime = readTime + parseTime + indexTime + statsTime;
                log(`[DataManager] Total loading time: ${totalTime.toFixed(2)}ms`);
                log(`[DataManager] Performance breakdown:
                    - Reading: ${(readTime / totalTime * 100).toFixed(1)}%
                    - Parsing: ${(parseTime / totalTime * 100).toFixed(1)}%
                    - Indexing: ${(indexTime / totalTime * 100).toFixed(1)}%
                    - Statistics: ${(statsTime / totalTime * 100).toFixed(1)}%`);
                
                log('[DataManager] Successfully loaded data from localStorage');
                this.state.managers.viewController.hideLoader();
                return true;
            }
            
            log('[DataManager] No data found in localStorage');
            this.state.managers.viewController.hideLoader();
            return false;
        } catch (error) {
            console.error('[DataManager] Error loading data:', error);
            this.state.managers.viewController.hideLoader();
            this.setEmptyState();
            throw error;
        }
    }

    async saveToLocalStorage() {
        try {
            const { index } = this.state;
            
            if (!index) {
                log('[DataManager] No index to save');
                return;
            }

            // Save only index to localStorage
            localStorage.setItem('index', JSON.stringify(index));
            log('[DataManager] Index saved to Local Storage');
            return true;
        } catch (error) {
            log(error, '[DataManager] Error saving to Local Storage');
            throw error;
        }
    }
}