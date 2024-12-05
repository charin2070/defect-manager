// Read and parse data to Jira issue-objects
class DataManager {
  constructor(dataPrefix) {
    this.issues = [];
    this.lastError = null;
    this.dataPrefix = dataPrefix;
    this.refact = Refact.getInstance(document.body);
    this.refact.setState({ clearLocalStorageData: false }, 'DataManager.constructor');

    // Fields for string to Date conversion
    this.datesFields = [
      "created",
      "resolved",
      "slaDate"
    ];

    // Rename Jira fields to object properties
    this.propsMap = {
      "Issue key": "id",
      "Custom field (Команда устраняющая проблему)": "team",
      "Assignee": "assignee",
      "Reporter": "reporter",
      "Status": "status",
      "Priority": "priority",
      "Summary": "summary",
      "Description": "description",
      "Created": "created",
      "Resolved": "resolved",
      "Custom field (SLA дата наступления просрочки)": "slaDate",
      "Custom field (Количество обращений)": "reports",
      "Issue tyepe": "type",
      "Дата наступления SLA": "slaDate"
    };

    // PowerBI specific headers that indicate the data source
    this.powerBiHeaders = [
      "Номер драфта",
      "дата открытия",
      "дата закрытия"
    ];

    this.statusMap = {
      "NEW": "new",
      "Отклонен": "rejected",
      "На исправление": "to_be_closed",
      "В работе": "in_progress",
      "Отложен": "delayed",
      "Закрыт": "resolved",
      "Отклонен командой": "rejected_by_team",
    }

    // Try to load data from Local Storage on initialization
    this.loadFromLocalStorage();
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    this.refact.subscribe('clerLocalStorageData', () => this.clearLocalStorage());
    this.refact.subscribe('uploadedFile', (file) => {
      if (file) {
        this.loadFromFile(file);
        this.refact.setState({ dataStatus: 'loading' }, 'DataManager.loadFromFile');
      }
    });
  }

  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem(this.dataPrefix);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData)) {
          this.issues = parsedData;
          this.refact.setState({ issues: this.issues }, 'DataManager.loadFromLocalStorage');
          this.refact.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromLocalStorage');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[DataManager] Error loading from Local Storage:', error);
      this.refact.setState({ dataStatus: 'error' }, '[DataManager] loadFromLocalStorage');
      return false;
    }
  }

  saveToLocalStorage() {
    try {
      const jsonData = JSON.stringify(this.issues);
      const dataSize = (jsonData.length / 1024).toFixed(2);
      console.log(`✅[DataManager] Saving to Local Storage (size: ${dataSize} KB) ...`);
      localStorage.setItem(this.dataPrefix, jsonData);
    } catch (error) {
      console.error(`[DataManager] Error saving to local storage:`, error);
    }
  }

  clearLocalStorage() {
    try {
      localStorage.removeItem(this.dataPrefix);
      this.issues = [];
      this.refact.setState({ issues: null }, 'DataManager.clearLocalStorage');
      console.log('🗑️ Local Storage cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing Local Storage:', error);
      return false;
    }
  }

  // Returns file lines
  readFile(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  getIssues() {
    return this.issues;
  }

  // Returns array of objects from CSV file
  loadFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith(".csv")) {
        const error = new Error(`Unsupported file format: ${file.name}`);
        this.refact.setState({ dataStatus: 'error' }, 'DataManager.loadFromFile');
        reject(error);
        return;
      }

      // First read the first line to check for special headers
      const reader = new FileReader();
      reader.onload = (e) => {
        const firstLine = e.target.result.split('\n')[0];
        const isSlaUpdate = firstLine.includes('Номер дефекта') || firstLine.includes('Дата наступления SLA');

        const csvParser = new CsvParser();
        csvParser.loadFromCsvFile(file).then(loadedData => {
          if (isSlaUpdate && this.refact.state.issues) {
            // Update SLA dates in existing issues
            const updatedCount = 0;
            loadedData.forEach(loadedItem => {
              const existingIssue = this.refact.state.issues.find(issue => issue.taskId === loadedItem['Номер драфта']);
              if (existingIssue) {
                updatedCount++;
                existingIssue.slaDate = loadedItem.slaDate;
              }
            });

            MessageView.showMessage('Внимание!', `Обновлено ${updatedCount} дат SLA`, 'Обновить', () => {
              this.refact.setState({ issues: this.refact.state.issues }, 'DataManager.loadFromFile.updateSLA');
              this.refact.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
              this.saveToLocalStorage();
              resolve({ issues: this.refact.state.issues, source: 'file' });
            });
            
            // Update state with modified issues
            this.refact.setState({ issues: this.refact.state.issues }, 'DataManager.loadFromFile.updateSLA');
            this.refact.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
            this.saveToLocalStorage();
            resolve({ issues: this.refact.state.issues, source: 'file' });
          } else {
            // Normal CSV load
            this.issues = loadedData;
            this.refact.setState({ issues: this.issues }, 'DataManager.loadFromFile');
            this.refact.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
            this.saveToLocalStorage();
            resolve({ issues: this.issues, source: 'file' });
          }
        }).catch(error => {
          this.refact.setState({ dataStatus: 'error' }, 'DataManager.loadFromFile');
          console.error("[DataManager.loadFromFile] Error:", error);
          reject(error);
        });
      };
      reader.onerror = (error) => {
        this.refact.setState({ dataStatus: 'error' }, 'DataManager.loadFromFile');
        reject(error);
      };
      reader.readAsText(file);
    });
  }

  
  subscribeToIssues(callback) {
    this.refact.subscribe('issues', callback);
  }
}