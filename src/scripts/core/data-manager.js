// Load/store raw
class DataManager extends Refact {
    static ProcessCommands = {
        CLEANUP_STORAGE: 'cleanup_local_storage'
    };
  
    constructor() {
        super();
        
        if (!this.constructor.instances?.[this.constructor.name]) {
            this.processHandlers = {
                [DataManager.ProcessCommands.CLEANUP_STORAGE]: () => this.cleanupLocalStorage(true)
            };

            this.subscribe('process', (command) => {
                const handler = this.processHandlers[command];
                if (handler) {
                    handler();
                }
            });

            this.subscribe('issueFile', (file) => {
                if (file) {
                    this.loadIssuesFromFile(file);
                }
            });
        }
    }

    static getInstance() {
        return super.getInstance();
    }

    // Load issues from file
    async loadIssuesFromFile(file) {
        log(file.name, 'Loading issues from file // DataManager');

        // .csv
        if (file.name.endsWith('.csv')) {
            const csvFileData = await this.readFile(file);
            const fileObjects = await this.csvParser.csvToObjects(csvFileData);
            
            // Objects to issues
            const issues = fileObjects.map(fileObject => new Issue(fileObject));
            this.setState({ issues: issues, dataSource: 'file' }, 'DataManager.loadFromFile');
            this.saveToLocalStorage(issues);

            // Set to state
            return { issues: issues, source: 'file' };
        }
    }

    // Load issues from local storage
    async loadFromLocalStorage(dataKeys = this.dataKeys) {
        log('🏃‍➡️ [DataManager] Loading data from Local Storage...');

        try {
            const storedData = localStorage.getItem('issues');
            if (!storedData) {
                log('[DataManager] No data in localStorage');
                this.setState({ issues: [] }, 'DataManager.loadFromLocalStorage');
                return;
            }

            const issues = JSON.parse(storedData);
            if (!Array.isArray(issues)) {
                throw new Error('Invalid data format');
            }

            // Convert raw data to Issue instances
            const issueInstances = issues.map(issueData => {
                // Extract only the data properties we need
                const {
                    taskId, type, state, status, priority,
                    team, assignee, created, resolved, description,
                    project
                } = issueData;

                // Create a clean object with only the data we need
                return {
                    taskId, type, state, status, priority,
                    team, assignee, created, resolved, description,
                    project
                };
            });

            this.setState({ issues: issueInstances }, 'DataManager.loadFromLocalStorage');
        } catch (error) {
            log(`[DataManager] Error loading from localStorage: ${error.message}`);
            this.setState({ issues: [] }, 'DataManager.loadFromLocalStorage');
        }
    }

    saveToLocalStorage(dataObject) {
        log('🚀 [DataManager] Saving to LocalStorage');

        return new Promise((resolve, reject) => {
            try {
                if (!dataObject || typeof dataObject !== 'object') {
                    throw new Error('Invalid data object');
                }

                // Convert Issue instances to plain objects
                const sanitizedData = Array.isArray(dataObject) ? 
                    dataObject.map(issue => ({
                        taskId: issue.taskId,
                        type: issue.type,
                        state: issue.state,
                        status: issue.status,
                        priority: issue.priority,
                        team: issue.team,
                        assignee: issue.assignee,
                        created: issue.created,
                        resolved: issue.resolved,
                        description: issue.description,
                        project: issue.project
                    })) : dataObject;

                localStorage.setItem('issues', JSON.stringify(sanitizedData));
                resolve(true);
            } catch (error) {
                log(`[DataManager] Error saving to localStorage: ${error.message}`);
                reject(error);
            }
        });
    }

    setEmptyState() {
        this.setState({
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
            let existingIssue = this.state.issues.find(issue => issue.id === taskId);
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
                    this.setState({ issues: this.state.issues }, 'DataManager.loadFromFile.updateSLA');
                    this.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
                    this.saveToLocalStorage({ index: this.state.index, issues: this.state.issues }).then(() => {
                        resolve({ issues: this.state.issues, source: 'file' });
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
        this.setState({ issues: this.state.issues }, 'DataManager.loadFromFile.updateSLA');
        this.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
        this.saveToLocalStorage({ index: this.state.index, issues: this.state.issues }).then(() => {
            resolve({ issues: this.state.issues, source: 'file' });
        });
        return { issues: this.state.issues, source: 'file' };
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