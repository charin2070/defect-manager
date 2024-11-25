// Read and parse data to Jira issue-objects
class DataManager extends EventEmitter {
  constructor(dataPrefix) {
    super();

    this.issues = [];
    this.dataPrefix = dataPrefix;
  }

  // Filds for string to Date conversion
  datesFields = [
    "created",
    "resolved",
    "slaDate"
];

  // Rename Jira fields to object properties
  propsMap = {
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
    "Issue tyepe": "type"
  };

  statusMap = {
    "NEW": "new",
    "Отклонен": "rejected",
    "На исправление": "to_be_closed",
    "В работе": "in_progress",
    "Отложен": "delayed",
    "Закрыт": "resolved",
    "Отклонен командой": "rejected_by_team",
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

  getIssues(){
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
          this.emit("onIssuesLoaded", {'issues': this.issues, 'source': 'file'});
          resolve({'issues': this.issues, 'source': 'file'});
        }).catch(error => {
          console.error("❌ [DataManager.loadFromFile] Error:", error);
          reject(error);
        });
      } else {
        const error = new Error(`Unsupported file format: ${file.name}`);
        console.error("❌ [DataManager.loadFromFile]", error);
        this.emit("unsupportedFormat", file.extension);
        reject(error);
      }
    });
  }

  loadFromCsvFile(file) {
    return new Promise((resolve, reject) => {
      this.readFile(file).then(csvData => {
          let csvLines = this.cleanupCsvData(csvData);
          let csvObjects = [];
          // Get headers
          let headers = csvLines[0].split(",");
          csvLines.forEach((line, index) => {
            if (index > 0) {
              csvObjects.push(this.csvLineToObject(line, headers, this.propsMap));
            }
          });
        
          resolve(csvObjects);
        }).catch(error => {
          reject(error);
        });
    });
  }

// // Product directions
// const productStructure = {
//   "Лучшая мобильная платформа": {
//       owner: "Добкин А.",
//       teams: ["Эльбрус", "Этна 1", "БлэкРок"],
//       products: ["Топ-1 Markswebb", "BAU"],
//   },
//   "Рост транзакционной активности и цифровые продажи": {
//       owner: "Добкин А.",
//       teams: ["Этна 1", "БлэкРок", "Миллениум"],
//       products: ["CRM", "Engagement", "endToEnd", "Команда от Лояльности", "Инвест. копилка"]
//   },
//   "Развитие Pro-решений": {
//       owner: "Чаркин А.",
//       teams: ["НТФ", "ПРО-терминалы", "WEB-терминалы", "Сайт ГИ"],
//       products: ["Аналитика", "Статистика", "Сайт", "Бизнес-план", "Инвестиции", "Бизнес-логика", "Продукты", "Инфраструктура", "Блокчейн", "Сервисы", "Обучение", "Контент"]
//   },
//   "Digital-контент платформа": {
//       owner: "Шишов Д.",
//       teams: ["НТФ", "НТФ(ЛК)", "ПРО", "WEB", "Core"],
//       products: ["Комьюнити-менеджер", "Команда аналитики", "Команда контента", "Олимпус", "Сатурн 2", "Сайт"]
//   },
//   "Красные команды": {
//     owner: "Дрынкин В.",
//     teams: ["core МП", "Веста", "Core", "АПИ", "Риски", "Плутон", "Плутон 1", "QA-десант"],
//     products: ["Красные команды"]
//   },
//   "Привлечение и первичная активация": {
//     owner: "Прилепская А.",
//     teams: ["К2"],
//     products: ["Онлайн продажи", "CRM", "Контент-менеджеры сайта", "WallStreetBet"]
//   },
//   "Digital-контент платформа": {
//     owner: "Прилепская А.",
//     teams: ["Олимпус", "Сатурн 2", "Сайт"],
//     products: ["Соц. сеть", "Фабрика контента", "Цифр. продукт", "Медиапортал"],
//   },
//   "Персонализация клиентского опыта": {
//     owner: "Прилепская А.",
//     teams: ["Game 2", "ТвинТри", "Альфа-центавра"],
//     products: ["Геймтрек"]
//   },
// };

//   analyzeStatistics(issues) {
//     // Функция для проверки, находится ли дата в нужном диапазоне
//     function isDateInRange(startDate, endDate, dateString) {
//       // const date = new Date(dateStr.split(' ')[0].split('.').reverse().join('-'));
//       if (typeof dateString === 'string')
//         dateString = stringToDate(dateString);
//       if (typeof startDate === 'string')
//         startDate = stringToDate(startDate);
//       if (typeof endDate === 'string')
//         endDate = stringToDate(endDate);
      
//       return dateString >= startDate && dateString <= endDate;
//     }

//     // Создаем объект для хранения статистики
//     const statistics = {};

//     // Инициализируем статистику для каждого направления
//     for (const direction in productStructure) {
//       statistics[direction] = {
//           totalOpened: 0,
//           totalResolved: 0,
//           teamStats: {} // Статистика по командам
//       };

//       // Инициализируем статистику для каждой команды в направлении
//       productStructure[direction].teams.forEach(team => {
//         statistics[direction].teamStats[team] = {
//             opened: 0,
//             resolved: 0
//         };
//       });
//     }

//     // Анализируем каждую задачу
//     issues.forEach(issue => {
//       // Находим направление по команде
//       let foundDirection = null;
//       for (const direction in productStructure) {
//         if (productStructure[direction].teams.includes(issue.team)) {
//           foundDirection = direction;
//           break;
//         }
//       }

//       if (foundDirection) {
//         // Проверяем, была ли задача создана в указанный период
//         if (isDateInRange('2024-07-01', '2024-09-30', issue.created)) {
//           statistics[foundDirection].totalOpened++;
//           if (issue.team) {
//             statistics[foundDirection].teamStats[issue.team].opened++;
//           }
//         }

//         // Проверяем, была ли задача закрыта
//         if (issue.status === "resolved") {
//           statistics[foundDirection].totalResolved++;
//           if (issue.team) {
//             statistics[foundDirection].teamStats[issue.team].resolved++;
//           }
//         }
//       }
//     });

//     return statistics;
//   }

  /* Returns object from CSV line
  csvLine - CSV-string,
  headers - array of CSV-headers,
  propsMap - map of target properties names of object 
  sample of csvLine: "ADIRINC-1765,5305088,АИ. МТ. Вкладка Дивиденды. Некорректный % доходности,0,Дефект_АИ,Дивиденды,Отображение,U_M1FE1,На исправление,20.08.2024 13:24,Рынок - Другое (4) - low,,,"
  */
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
      if (this.datesFields.includes(fieldName)){
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
    log(localStorage, `🗃️ Loading ${dataPrefix || this.dataPrefix} from local storage...`);
    const storedIssues = localStorage.getItem(dataPrefix || this.dataPrefix);
    if (storedIssues && !storedIssues != typeof 'undefined') {
      this.issues = JSON.parse(storedIssues);
    }
    this.emit("onIssuesLoaded", {'issues': this.issues, 'source': 'local-storage'});
  }

  clearLocalStorage() {
    console.log("[Data Manager] Local storage cleared");

    localStorage.clear();
    this.issues = [];
  }

  // Load from local storage
  loadData(dataPrefix) {
    const prefix = dataPrefix || this.dataPrefix;
    if (localStorage.getItem(prefix)) {
      return new Promise((resolve, reject) => {
        try {
          this.loadFromLocalStorage(prefix);
          resolve(this.issues);
        } catch (error) {
          reject(error);
        }
      });
    }
    log("🆓 Local storage is empty.");
    return Promise.resolve(null);
  }

}
