// Read and parse data to Jira issue-objects
class DataManager {
  constructor(dataPrefix) {
    this.issues = [];
    this.dataPrefix = dataPrefix || 'defect-manager';
    this.refact = Refact.getInstance(document.body);
    this.refact.setState({ clearLocalStorageData: false }, 'DataManager.constructor');
    this.refact.setState({ issues: null }, 'DataManager.constructor');

    // Попробуем загрузить данные из Local Storage при инициализации
    this.loadFromLocalStorage();
    this.setupSubscriptions();

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
  }

  setupSubscriptions(){
    this.refact.subscribe('clearLocalStorageData', () => this.clearLocalStorage());
    this.refact.subscribe('uploadedFile', (file) => {
      if (file) {
        console.log('📥 Processing uploaded file:', file.name);
        this.loadFromFile(file)
          .then(result => {
            if (result && result.issues) {
              this.issues = result.issues;
              this.saveToLocalStorage();
              this.refact.setState({ issues: this.issues }, 'DataManager.loadFromFile');
              console.log('💾 Data saved to Local Storage');
            }
          })
          .catch(error => {
            console.error('❌ Error loading file:', error);
          });
      }
    });
  }

  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem(this.dataPrefix);
      if (savedData) {
        this.issues = JSON.parse(savedData);
        this.refact.setState({ issues: this.issues }, 'DataManager.loadFromLocalStorage');
        console.log('📂 Loaded', this.issues.length, 'issues from Local Storage');
        return true;
      }
    } catch (error) {
      console.error('❌ Error loading from Local Storage:', error);
    }
    return false;
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem(this.dataPrefix, JSON.stringify(this.issues));
      return true;
    } catch (error) {
      console.error('❌ Error saving to Local Storage:', error);
      return false;
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
    console.log("📥 [DataManager.loadFromFile] Loading file:", file.name);
    this.refact.setState({ dataStatus: 'loading' }, 'DataManager.loadFromFile');

    return new Promise((resolve, reject) => {
      if (file.name.endsWith(".csv")) {
        const csvParser = new CsvParser();
        csvParser.loadFromCsvFile(file)
          .then(issues => {
            this.refact.setState({ dataStatus: 'ready' }, 'DataManager.loadFromFile');
            resolve({ issues });
          })
          .catch(error => {
            this.refact.setState({ dataStatus: 'error' }, 'DataManager.loadFromFile');
            reject(error);
          });
      } else {
        reject(new Error('Unsupported file format'));
      }
    });
  }

  parseCSVLine(line) {
    return line.split(/,(?=(?:[^"]|"[^"]*")*$)/);
  }

  subscribeToIssues(callback) {
    this.refact.subscribe('issues', callback);
  }

  loadData(dataPrefix) {
    log(`[DataManager] Loading ${dataPrefix}...`);
    const prefix = dataPrefix;
    
    if (localStorage.getItem(prefix)) {
      log("📥 Local storage data exists. Loading...");
      return new Promise((resolve, reject) => {
        try {
          this.loadFromLocalStorage(prefix);
          resolve(this.issues);
        } catch (error) {
          console.error("❌ [DataManager.loadData] Error:", error);
          this.refact.setState({ dataStatus: 'empty' }, 'DataManager.loadData');
          reject(error);
        }
      });
    } else {
      log("🗑️ [DataManager] No data in Local Storage");
      this.refact.setState({ dataStatus: 'empty' }, 'DataManager.loadData');
      this.refact.setState({ issues: [] }, 'DataManager.loadData');
      return Promise.resolve(null);
    }
  }
}
