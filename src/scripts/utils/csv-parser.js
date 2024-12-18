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
      "Issue Type": "type",
      "Custom field (Команда устраняющая проблему)": "team",
      "Assignee": "assignee",
      "Reporter": "reporter",
      "Status": "status",
      "Priority": "priority",
      "Summary": "summary",
      "Description": "description",
      "Created": "created",
      "Resolved": "resolved"  ,
      "Custom field (SLA дата наступления просрочки)": "slaDate",
      "Custom field (Количество обращений)": "reports",
      "Дата наступления SLA": "slaDate"
    };

    // PowerBI specific headers
    this.powerBiHeaders = [
      "Номер драфта",
      "дата открытия",
      "дата закрытия"
    ];

    this.typeMap = {
      "Дефект промсреды": "defect",
      "Request (FR)": "request",
    }

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

  static getCsvLineValues(line) {
    return line.split(/,(?=(?:[^"]|"[^"]*")*$)/);
  }

  static cleanupCsvLines(csvLines) {
    console.log("🏃‍♂️‍➡️ [CsvParser.cleanupCsvLines] Processing lines:", csvLines.length);
    
    const formattedLines = [];
    let currentLine = "";
    let skippedLines = 0;
    let mergedLines = 0;

    csvLines.forEach((line, index) => {
      // Always keep the header line
      if (index === 0) {
        formattedLines.push(line.trim());
        console.log("📋 [CsvParser.cleanupCsvLines] Headers:", line.trim());
        return;
      }

      // Skip empty lines
      if (!line.trim()) {
        skippedLines++;
        return;
      }

      const isNewIssue = line.match(/^[A-Z]+-\d+,/); // Matches JIRA-123, at start of line
      
      if (isNewIssue) {
        if (currentLine) {
          formattedLines.push(currentLine.trim());
          mergedLines++;
        }
        currentLine = line;
      } else {
        currentLine += " " + line.trim();
        mergedLines++;
      }
    });

    // Add the last line if it exists
    if (currentLine) {
      formattedLines.push(currentLine.trim());
      mergedLines++;
    }

    console.log(`✅ [CsvParser.cleanupCsvLines] Results:
      - Input lines: ${csvLines.length}
      - Output lines: ${formattedLines.length}
      - Skipped empty lines: ${skippedLines}
      - Merged multiline entries: ${mergedLines}
    `);

    return formattedLines;
  }

  static async csvLinesToObjects(csvLines, indexField) {
    console.log("🏃‍♂️‍➡️ [CsvParser.csvLinesToObjects] Processing CSV lines:", csvLines.length);
    
    try {
      const csvObjects = [];
      const cleanLines = CsvParser.cleanupCsvLines(csvLines);
      const headers = CsvParser.getCsvLineValues(cleanLines[0]);
      console.log("📋 [CsvParser.csvLinesToObjects] Headers:", headers);

      let validLines = 0;
      let invalidLines = 0;
      let startTime = performance.now();

      for (let i = 1; i < cleanLines.length; i++) {
        const values = CsvParser.getCsvLineValues(cleanLines[i]);
        
        if (values.length === headers.length) {
          const csvObject = {};
          headers.forEach((header, index) => {
            csvObject[header] = values[index].trim();
            if (values[index].startsWith('"') && values[index].endsWith('"')) {
              csvObject[header] = values[index].slice(1, -1).replace(/\\n/g, "\n");
            }
          });
          csvObject.source = cleanLines[i];
          csvObjects.push(csvObject);
          validLines++;
        } else {
          console.warn(`⚠️ [CsvParser.csvLinesToObjects] Line ${i} has ${values.length} values, expected ${headers.length}`);
          invalidLines++;
        }

        // Log progress every 1000 lines
        if (i % 1000 === 0) {
          const progress = ((i / cleanLines.length) * 100).toFixed(1);
          const timeElapsed = performance.now() - startTime;
          const linesPerSecond = (i / (timeElapsed / 1000)).toFixed(1);
          console.log(`⏳ [CsvParser.csvLinesToObjects] Progress: ${progress}% (${linesPerSecond} lines/sec)`);
        }
      }

      const totalTime = performance.now() - startTime;
      console.log(`✅ [CsvParser.csvLinesToObjects] Parsing completed:
        - Total time: ${totalTime.toFixed(2)}ms
        - Valid lines: ${validLines}
        - Invalid lines: ${invalidLines}
        - Objects created: ${csvObjects.length}
        - Lines per second: ${(cleanLines.length / (totalTime / 1000)).toFixed(1)}
      `);

      return csvObjects;
    } catch (error) {
      console.error("⛔ [CsvParser.csvLinesToObjects] Error parsing CSV", error);
      throw error;
    }
  }

  async csvToObjects(csvData) {
    try {
      const lines = csvData.split(/\r\n|\n/);
      return await CsvParser.csvLinesToObjects(lines);
    } catch (error) {
      console.error("[CsvParser.csvToObjects] Error:", error);
      throw error;
    }
  }

  static async readFile(file) {
    console.log("🏃‍♂️‍➡️ [CsvParser.readFile] Reading file:", file.name);
    const startTime = performance.now();
    
    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });

      const lines = text.split(/\r\n|\n/);
      const timeElapsed = performance.now() - startTime;
      console.log(`✅ [CsvParser.readFile] File read completed:
        - Lines: ${lines.length}
        - Time: ${timeElapsed.toFixed(2)}ms
        - Lines per second: ${(lines.length / (timeElapsed / 1000)).toFixed(1)}
      `);
      return lines;
    } catch (error) {
      console.error("⛔ [CsvParser.readFile] Error reading file:", error);
      throw error;
    }
  }

  // Load issues from CSV file
  static async loadIssuesFromCsvFile(csvFile) {
    try {
      const csvLines = await CsvParser.readFile(csvFile);
      const csvObjects = await CsvParser.csvLinesToObjects(csvLines);
      const issues = csvObjects.map(csvObject => new Issue(csvObject));
      return issues;
    } catch (error) {
      console.error("[CsvParser.loadIssuesFromCsvFile] Error:", error);
      throw error;
    }
  }

  // Returns an object from a CSV line
  csvLineToObject(csvLine, headers, propsMap = {}) {
    const fields = csvLine.split(/,(?=(?:[^"]|"[^"]*")*$)/);
    const csvObject = {};

    headers.forEach((header, index) => {
      const fieldName = propsMap[header] || header;
      const fieldValue = fields[index].trim();

      // Handle quoted values and line breaks
      if (fieldValue.startsWith('"') && fieldValue.endsWith('"')) {
        csvObject[fieldName] = fieldValue.slice(1, -1).replace(/\\n/g, "\n");
      } else {
        csvObject[fieldName] = fieldValue;
      }

      csvObject["source"] = csvLine;
    });

    return csvObject;
  }
}