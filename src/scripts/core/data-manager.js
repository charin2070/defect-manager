// Read and parse data to Jira issue-objects
class DataManager {
  constructor(dataPrefix) {
    this.issues = [];
    this.dataPrefix = dataPrefix || 'defect-manager';
    this.refact = Refact.getInstance(document.body);
    this.refact.setState({ clearLocalStorageData: false }, 'DataManager.constructor');
    this.refact.setState({ issues: null }, 'DataManager.constructor');

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
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData)) {
          this.issues = parsedData;
          this.refact.setState({ issues: this.issues }, 'DataManager.loadFromLocalStorage');
          console.log('📥 Loaded data from Local Storage:', { count: this.issues.length });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error loading from Local Storage:', error);
      return false;
    }
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
    return new Promise((resolve, reject) => {
      if (file.name.endsWith(".csv")) {
        this.loadFromCsvFile(file).then(issues => {
          this.issues = issues;
          this.refact.setState({ issues: this.issues }, 'DataManager.loadFromFile');
          this.saveToLocalStorage();
          console.log("📥 Loaded and saved issues from file:", { count: issues.length });
          resolve({ issues: this.issues, source: 'file' });
        }).catch(error => {
          console.error("❌ [DataManager.loadFromFile] Error:", error);
          reject(error);
        });
      } else {
        const error = new Error(`Unsupported file format: ${file.name}`);
        console.error("❌ [DataManager.loadFromFile]", error);
        reject(error);
      }
    });
  }

  loadFromCsvFile(file) {
    console.log("📥 [DataManager.loadFromCsvFile] Loading CSV file:", file.name);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvData = event.target.result;
          const issues = this.parseCsvData(csvData);
          
          if (!issues || issues.length === 0) {
            this.refact.setState({ dataStatus: 'empty' }, 'DataManager.loadFromCsvFile');
            reject(new Error('No valid data found in CSV file'));
            return;
          }

          issues.forEach(issue => {
            switch (issue.status) {
              case 'Закрыт':
                issue['state'] = 'resolved';
                break;
              case 'Отклонен':
                issue['state'] = 'rejected';
                break;
              default:
                issue['state'] = 'unresolved';
            }

            // Convert reports to number
            if (issue.reports) {
              issue.reports = Number(issue.reports);  
            }
          });

          this.refact.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromCsvFile');
          resolve(issues);
        } catch (error) {
          console.error("❌ [DataManager.loadFromCsvFile] Error parsing CSV:", error);
          this.refact.setState({ dataStatus: 'error' }, 'DataManager.loadFromCsvFile');
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error("❌ [DataManager.loadFromCsvFile] Error reading file:", error);
        this.refact.setState({ dataStatus: 'error' }, 'DataManager.loadFromCsvFile');
        reject(error);
      };

      reader.readAsText(file);
    });
  }

  cleanupCsvData(csvData) {
    const lines = csvData.split("\n");
    const formattedLines = [];
    let currentLine = "";

    lines.forEach((line, index) => {
      if (index === 0) {
        // Add header row
        formattedLines.push(line.trim());
      } else if (line.startsWith("ADIRINC-")) {
        // If we have a previous line, add it to formattedLines
        if (currentLine) {
          // Add the previous line
          formattedLines.push(currentLine.trim());
        }
        // Start a new line
        currentLine = line;
      } else {
        // Append to the current line, replacing newline with space
        currentLine += " " + line.trim();
      }
    });

    // Add the last line if it exists
    if (currentLine) {
      formattedLines.push(currentLine.trim());
    }

    return formattedLines;
  }

  parseCsvData(csvData) {
    try {
      const lines = this.cleanupCsvData(csvData);
      if (!lines || lines.length < 2) {
        throw new Error('Invalid CSV data: file is empty or has no data rows');
      }

      const headers = this.parseCSVLine(lines[0]);
      const issues = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const issue = {};
          headers.forEach((header, index) => {
            const prop = this.propsMap[header] || header.toLowerCase();
            issue[prop] = values[index];
          });

          // Check and parse date fields
          this.datesFields.forEach(field => {
            if (issue[field]) {
              const date = new Date(issue[field]);
              if (isNaN(date.getTime())) {
                console.warn(`⚠️ Invalid date found: ${issue[field]} for issue: ${issue.id}`);
                issue[field] = null; // Set to null or handle as needed
              } else {
                issue[field] = date.toISOString();
              }
            }
          });

          issues.push(issue);
        }
      }

      return issues;
    } catch (error) {
      console.error('❌ Error parsing CSV data:', error);
      return [];
    }
  }

  parseCSVLine(line) {
    return line.split(/,(?=(?:[^"]|"[^"]*")*$)/);
  }

  subscribeToIssues(callback) {
    this.refact.subscribe('issues', callback);
  }
}

window.DataManager = DataManager;
