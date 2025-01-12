// Raw data processing
class DataManager {
    static ProcessCommands = {
        CLEANUP_STORAGE: 'cleanup_local_storage'
    };

    constructor() {
        this.refact = null;
        this.csvParser = new CsvParser();
        this.processHandlers = {
            [DataManager.ProcessCommands.CLEANUP_STORAGE]: () => {
                this.cleanupLocalStorage(true);
            }
        };
    }

    bind(context) {
        this.refact = context;
        this.listen();
        return this;
    }

    listen() {
        if (!this.refact) return;

        this.refact.subscribe('process', (command) => {
            const handler = this.processHandlers[command];
            if (handler) {
                handler();
            }
        });

        this.refact.subscribe('uploadedFile', (file) => {
            if (file) {
                this.loadIssuesFromFile(file);
            }
        });
    }

    // Load issues from file
    async loadIssuesFromFile(file) {
        console.log('Loading issues from file:', file);
        if (!file) {
            console.error('File is undefined');
            return;
        }
        console.log(`File name: ${file.name}, type: ${file.type}`);

        // .csv
        if (file.name.endsWith('.csv')) {
            const csvFileData = await this.readFile(file);
            const fileObjects = await this.csvParser.csvToObjects(csvFileData);
            
            // Objects to issues
            const issues = fileObjects.map(fileObject => new Issue(fileObject));
            this.refact.setState({ issues: issues, dataSource: 'file', dateStatus: 'loaded', dateUpdated: file.lastModified });

            // Set to state
            this.saveToLocalStorage({ issues: issues, index: this.refact.state.index });
            return { issues: issues, source: 'file' };
        }
    }

    // Load issues from local storage
    loadIssuesFromLocalStorage() {
        console.log('Loading issues from LocalStorage // DataManager');

        try {
            const storedData = localStorage.getItem('issues');
            if (!storedData) {
                console.log('No data in LocalStorage');
                this.refact.setState({ issues: [] });
                return;
            }

            const parsedData = JSON.parse(storedData);
            if (!Array.isArray(parsedData) || parsedData.length === 0) {
                console.log('No valid issues in LocalStorage');
                this.refact.setState({ issues: [] });
                return;
            }

            const issues = parsedData.map(parsedObject => new Issue(parsedObject));
            this.refact.setState({ issues });

        } catch (error) {
            console.error('Error loading from LocalStorage:', error);
            this.refact.setState({ issues: [] });
        }
    }

    saveToLocalStorage(data) {
        try {
            if (!data) return;

            // Save issues
            if (data.issues) {
                localStorage.setItem('issues', JSON.stringify(data.issues));
            }

            // Save index
            if (data.index) {
                localStorage.setItem('index', JSON.stringify(data.index));
            }

            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }


    async updateSlaDates(loadedData) {
        if (!loadedData?.length) {
            console.warn('[DataManager] No issues to update SLA');
            return;
        }

        let updatedCount = 0;
        loadedData.forEach(loadedIssue => {
            let taskId = loadedIssue.id;
            let existingIssue = this.refact.state.issues.find(issue => issue.id === taskId);
            if (existingIssue) {
                updatedCount++;
                existingIssue.slaDate = loadedIssue.slaDate;
            }
        });

        // Update state with modified issues
        this.refact.setState({ issues: this.refact.state.issues }, 'DataManager.loadFromFile.updateSLA');
        this.refact.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
        await this.saveToLocalStorage({ index: this.refact.state.index, issues: this.refact.state.issues });
        return { issues: this.refact.state.issues, source: 'file' };
    }

    cleanupLocalStorage(isAll = false) {
        if (isAll) {
            localStorage.clear();
            console.log('🗑️ [Data Manager] All data removed from LocalStorage');
            this.refact.setState({ dataStatus: 'empty' }, 'DataManager.removeFromLocalStorage');
            return;
        }
        
        localStorage.removeItem('issues');
        localStorage.removeItem('index');
        this.refact.setState({ issues: null, index: null }, 'DataManager.removeFromLocalStorage');
        console.log('🗑️ [Data Manager] Data removed from LocalStorage');
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

}