class CsvParser {
    constructor() {
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
            "Дата наступления SLA": "slaDate"  // PowerBI mapping
        };

        // PowerBI specific headers
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

    parseCsvData(csvData) {
        try {
          const lines = csvData.split('\n');
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
    
              // Date conversion
              this.datesFields.forEach(field => {
                if (issue[field]) {
                  issue[field] = stringToDate(issue[field]);
                
                   if (isNaN(issue[field].getTime())) {
                    console.warn(`⚠️ Invalid date found: ${issue[field]} for issue: ${issue.id}`);
                    issue[field] = null;    
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

    loadFromCsvFile(file) {
        console.log("📥 [CsvParser.loadFromCsvFile] Loading CSV file:", file.name);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const csvData = event.target.result;
                    const issues = this.parseCsvData(csvData);

                    if (!issues || issues.length === 0) {
                        console.warn('No valid data found in CSV file');
                        reject(new Error('No valid data found in CSV file'));
                        return;
                    }

                    resolve(issues);
                } catch (error) {
                    console.error("❌ [CsvParser.loadFromCsvFile] Error parsing CSV:", error);
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                console.error("❌ [CsvParser.loadFromCsvFile] Error reading file:", error);
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

        console.log("📥 [CsvParser.parseCsvData] Parsed CSV data:", { count: csvObjects.length });
        return csvObjects;
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

 
}