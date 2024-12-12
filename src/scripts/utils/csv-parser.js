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
    const formattedLines = [];
    let currentLine = "";

    csvLines.forEach((line, index) => {
      if (index === 0) {
        formattedLines.push(line.trim());
      } else if (line.trim().startsWith("ADIRINC-")) {
        if (currentLine) {
          formattedLines.push(currentLine.trim());
        }
        currentLine = line;
      } else {
        currentLine += " " + line.trim();
      }
    });

    // Add the last line if it exists
    if (currentLine) {
      formattedLines.push(currentLine.trim());
    }

    return formattedLines;
  }

  static csvLinesToObjects(csvLines) {
    console.log("🏃‍♂️‍➡️ [CsvParser.csvLinesToObjects] Processing CSV lines:", csvLines.length);
    
    return new Promise((resolve, reject) => {
      try {
        const csvObjects = [];
        const cleanLines = CsvParser.cleanupCsvLines(csvLines);
        const headers = CsvParser.getCsvLineValues(cleanLines[0]);

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
          }
        }

        console.log(`✅ [CsvParser.csvLinesToObjects] Parsed ${csvObjects.length} objects`);
        resolve(csvObjects);
      } catch (error) {
        console.error("⛔ [CsvParser.csvLinesToObjects] Error parsing CSV", error);
        reject(error);
      }
    });
  }

  csvToObjects(csvData) {
    const csvLines = this.cleanupCsvData(csvData);
    const csvObjects = [];

    const headers = csvLines[0].split(",");

    // CSV line to object
    csvLines.forEach((line, index) => {
      if (index > 0) {
        csvObjects.push(this.csvLineToObject(line, headers, this.propsMap));
      }
    });

    log(`✅ [CsvParser.parseCsvData] Parsed ${csvObjects.length} objects from CSV`);
    return csvObjects;
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