// Read and parse data to Jira issue-objects
class DataManager {
  constructor(dataPrefix) {
    this.issues = [];
    this.dataPrefix = dataPrefix;
    this.refact = new Refact(document.body);
    this.refact.setState({ clearLocalStorageData: false }, 'DataManager.constructor');
    this.refact.setState({ issues: null }, 'DataManager.constructor');

    this.setupSubscriptions();

    // Filds for string to Date conversion
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
      "Дата наступления SLA": "slaDate"  // Добавляем маппинг для PowerBI
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
        this.loadFromFile(file)
          .then(result => {
            if (result && result.issues) {
              this.issues = result.issues;
              this.refact.setState({ issues: this.issues }, 'DataManager.loadFromFile');
              this.saveToLocalStorage(this.dataPrefix, this.issues);
            }
          })
          .catch(error => {
            console.error('Error loading file:', error);
          });
      }
    });
  }

  // Returns file lines
  readFile(file) {
    return new Promise(function (resolve, reject) {
      let reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target.result);
      };
      reader.onerror = function (e) {
        reject(e);
      };
      reader.readAsText(file);
    });
  }

  getIssues() {
    return this.issues;
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

  // Returns array of objects from CSV file
  loadFromFile(file) {
    console.log("📥 [DataManager.loadFromFile] Loading file:", file.name);
    return new Promise((resolve, reject) => {
      // If CSV file
      if (file.name.endsWith(".csv")) {
        this.loadFromCsvFile(file).then(issues => {
          this.issues = issues;
          this.refact.setState({ issues: this.issues }, 'DataManager.loadFromFile');
          this.saveToLocalStorage(this.dataPrefix, this.issues);
          log("📥 Loaded and saved issues from file:", { count: issues.length });
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

  parseCsvData(csvData) {
    const csvLines = this.cleanupCsvData(csvData);
    const csvObjects = [];
    
    // Get headers from first line
    const headers = csvLines[0].split(",");
    
    // Parse each line into an object
    csvLines.forEach((line, index) => {
      if (index > 0) {
        csvObjects.push(this.csvLineToObject(line, headers, this.propsMap));
      }
    });

    log("📥 [DataManager.parseCsvData] Parsed CSV data:", { count: csvObjects.length });
    return csvObjects;
  }

  // Updates issues and maintains history from CSV file
  async updateFromCsv(file) {
    console.log("📤 [DataManager.updateFromCsv] Updating from file:", file.name);
    
    try {
      const csvContent = await this.readFile(file);
      const lines = this.cleanupCsvData(csvContent);
      const headers = lines[0].split(",").map(h => h.trim());
      
      // Check if data is from PowerBI
      const isFromPowerBi = this.powerBiHeaders.some(header => headers.includes(header));
      
      // Get existing history or initialize new one
      let issueHistory = JSON.parse(localStorage.getItem(this.dataPrefix + "-issueHistory")) || {};
      
      // Process each line except headers
      const updatedIssues = [...this.issues]; // Create a copy of current issues
      
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;
        
        const issueData = {};
        headers.forEach((header, index) => {
          const propName = this.propsMap[header];
          if (propName) {
            let value = values[index].trim();
            
            // If data is from PowerBI, only take slaDate
            if (isFromPowerBi && propName !== 'slaDate') {
              return;
            }
            
            // Convert date strings to Date objects
            if (this.datesFields.includes(propName)) {
              value = new Date(value);
            }
            
            issueData[propName] = value;
          }
        });
        
        // Find existing issue
        const existingIssueIndex = updatedIssues.findIndex(issue => issue.id === issueData.id);
        
        if (existingIssueIndex !== -1) {
          const existingIssue = updatedIssues[existingIssueIndex];
          
          // Compare and record changes
          const changes = {};
          let hasChanges = false;
          
          Object.keys(issueData).forEach(key => {
            if (issueData[key] && existingIssue[key] !== issueData[key]) {
              changes[key] = {
                from: existingIssue[key],
                to: issueData[key]
              };
              hasChanges = true;
　
              // Update the existing issue
              existingIssue[key] = issueData[key];
            }
          });
　
          // If there are changes, add to history
          if (hasChanges) {
            if (!issueHistory[issueData.id]) {
              issueHistory[issueData.id] = [];
            }
　
            issueHistory[issueData.id].push({
              timestamp: new Date(),
              changes: changes
            });
          }
        }
      }
      
      this.issues = updatedIssues;
      this.refact.setState({ issues: this.issues }, 'DataManager.updateFromCsv');
      return {
        updatedIssues,
        updatedHistory: issueHistory
      };
      
    } catch (error) {
      console.error("Error updating from CSV:", error);
      throw error;
    }
  }

  csvLineToObject(csvLine, headers, propsMap = {}) {
    const fields = csvLine.split(/,(?=(?:[^"]|"[^"]*")*$)/); // Разделяем строку на части по запятой, учитывая кавычки
    const csvObject = {};

    // Iterate over the fields and create the object
    headers.forEach((header, index) => {
      const fieldName = propsMap[header] || header;
      const fieldValue = fields[index].trim();

      // Handle quoted values and line breaks
      if (fieldValue.startsWith('"') && fieldValue.endsWith('"')) {
        csvObject[fieldName] = fieldValue.slice(1, -1).replace(/\\n/g, "\n");
      } else {
        csvObject[fieldName] = fieldValue;
      }

      // Handle date fields
      if (this.datesFields.includes(fieldName)) {
        if (fieldValue && fieldValue.length > 0) {
          csvObject[fieldName] = stringToDate(fieldValue);
        } else {
          csvObject[fieldName] = null;
        }
      }

      // Handle custom field (Команда устраняющая проблему)
      if (fieldName === "Custom field (Команда устраняющая проблему)") {
        csvObject[fieldName] = fieldValue === "Ядро" ? "Core" : fieldValue;
        // If fieldValue is empty, undefined or null set "Не назначена"
        if (!fieldValue || fieldValue.trim() === "") {
          csvObject['team'] = "Не назначена";
        }
      }

      if (fieldName === "team") {
        csvObject[fieldName] = fieldValue === "Ядро" ? "Core" : fieldValue;
        // If fieldValue is empty, undefined or null set "Не назначена"
        if (!fieldValue || fieldValue.trim() === "") {
          csvObject[fieldName] = "Не назначена";
        }
      }

      // Handle custom field (Количество обращений)
      if (fieldName === "Custom field (Количество обращений)") {
        csvObject[fieldName] = parseInt(fieldValue, 10);
      }

      // Handle custom field (Количество обращений)
      if (fieldName === "reports") {
        csvObject[fieldName] = parseInt(fieldValue, 10);
      }

      csvObject["source"] = csvLine;
    });

    return csvObject;
  }

  saveToLocalStorage(dataPrefix, data) {
    log(data, "🗃️ Saving data to local storage...");

    // Get data-object size
    const dataSize = (JSON.stringify(data).length / 1024).toFixed(2);
    console.log(`💾 [Data Manager] Saving to Local Storage (size: ${dataSize} KB) ...`);

    localStorage.setItem(dataPrefix, JSON.stringify(data));
    if (localStorage.getItem(dataPrefix)) {
      console.log(`💾 [Data Manager] Saved to local storage as ${dataPrefix}`);
    } else {
      console.log(`⛔ [Data Manager] Failed to save to local storage as ${dataPrefix}`);
    }
  }

  loadFromLocalStorage(dataPrefix) {
    console.log(localStorage, `Loading ${dataPrefix || this.dataPrefix} from local storage...`);
    const storedIssues = localStorage.getItem(dataPrefix || this.dataPrefix);
    if (storedIssues && storedIssues !== 'undefined') {
      this.issues = JSON.parse(storedIssues);
      this.refact.setState({ issues: this.issues }, 'DataManager.loadFromLocalStorage');
    } else {
      console.log("No issues found in local storage");
      this.issues = [];
      this.refact.setState({ issues: this.issues }, 'DataManager.loadFromLocalStorage');
    }
  }

  clearLocalStorage(dataPrefix) { 
    console.log("[Data Manager] Local storage cleared");

    // Clear only data-related items
    localStorage.removeItem(dataPrefix);
    this.issues = [];
    this.refact.setState({ issues: this.issues }, 'DataManager.clearLocalStorage');
  }

  // Load from local storage
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

  parseCSVLine(line) {
    return line.split(/,(?=(?:[^"]|"[^"]*")*$)/);
  }

  subscribeToIssues(callback) {
    this.refact.subscribe('issues', callback);
  }
}
