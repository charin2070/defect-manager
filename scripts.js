/** Refact:
 * 
 * This class is a minimalistic reactive framework designed to manage application state and synchronize UI with state changes.
 * Key Responsibilities:
 * 1. **State Management:** Maintains a central `state` object that holds application data.
 * 2. **Reactivity:** Tracks changes to specific state keys and notifies subscribers (callbacks) whenever a key is updated.
 * 3. **UI Binding:** Dynamically binds HTML elements to state properties, ensuring the UI updates automatically when the state changes.
 * 4. **Rendering:** Supports rendering HTML templates into a root element for a seamless state-to-UI connection.
 * 
 * How it works:
 * - Use `setState` to update the application state, triggering notifications to all subscribed callbacks.
 * - Subscribe to specific state keys using `subscribe`, enabling modules or components to react to changes.
 * - Use `bind` to link DOM elements to state keys, making your UI reactive and declarative.
 * - Render HTML templates via `render` to set up the initial UI structure.
 * 
 * Refact is a foundation for building lightweight, reactive JavaScript applications without relying on external frameworks.
я */
class Refact {
    static instance;

    constructor(rootElement) {
        if (Refact.instance) {
            return Refact.instance;
        }
        this.rootElement = rootElement;
        this.state = {
            statistics: {
                total: {
                    unresolved: 0
                }
            }
        };
        this.subscribers = new Map();
        Refact.instance = this;
    }

    static getInstance(rootElement) {
        if (!Refact.instance) {
            Refact.instance = new Refact(rootElement);
        }
        return Refact.instance;

    }

    // Default state
    setState(newState, changedBy = 'unknown') {
        for (let key in newState) {
            this.state[key] = newState[key];
            this.notify(key);
            
            // Улучшенное логирование
            const value = this.state[key];
            let logValue;
            
            if (value === null) {
                logValue = 'null';
            } else if (Array.isArray(value)) {
                logValue = `Array(${value.length})`;
            } else if (typeof value === 'object') {
                logValue = JSON.stringify(value, null, 2);
            } else {
                logValue = value;
            }
            
            console.log(`⚡State changed: ${key} = ${logValue} (by: ${changedBy})`);
        }
    }
    
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
    }

    notify(key) {
        const callbacks = this.subscribers.get(key) || [];
        callbacks.forEach(callback => callback(this.state[key]));
    }

    // Bind element to state
    bind(selector, key) {
        const element = this.rootElement.querySelector(selector);
        if (!element) {
            console.warn(`Element not found for selector: ${selector}`);
            return;
        }
        this.subscribe(key, value => {
            element.textContent = value;
        });
        if (key in this.state) {
            element.textContent = this.state[key];
        } else {
            console.warn(`State key not found: ${key}`);
        }
    }

    render(template) {
        this.rootElement.innerHTML = template;
    }
}

function logStyled(data, style) {
  console.log(`%c${data}`, style);
}

// Логирование с описанием и вызовом из конкретной функции
function log(data, description) {
  const dataType = typeof data;
  const functionName = getCallingFunction();

  // Логирование метаданных
  logStyled(`${functionName} (...) | type: ${dataType}`, 'color: silver');

  // Логирование описания
  if (description) {
    logStyled(`${description}:`, 'font-weight: bold; font-size: 1em; color: lightgreen');
  }

  // Логирование данных
  if (dataType === "string") {
    logStyled(data, 'color: orange; font-weight: 800; font-size: 1em');
  } else {
    console.log(data);
  }

  // Получение имени вызывающей функции
  function getCallingFunction() {
    let error = new Error();
    let stack = error.stack.split("\n");
    return stack[3]?.split("at ")[1]?.split(" ")[0] || "Unknown";
  }
}

// Перенаправление лога в HTML-элемент
function outputConsoleToDiv(cardId) {
  const debugOutput = document.getElementById(cardId);
  const originalConsoleLog = console.log;

  let inCustomLog = false;

  console.log = function (...args) {
    if (inCustomLog) {
      originalConsoleLog.apply(console, args);
      return;
    }

    inCustomLog = true;

    args.forEach((arg, index) => {
      if (typeof arg === 'string' && arg.includes('%c')) {
        const parts = arg.split('%c');
        parts.forEach((part, i) => {
          if (i % 2 === 0) {
            const textSpan = document.createElement('span');
            textSpan.textContent = part;
            textSpan.style = args[index + i + 1] || '';
            debugOutput.appendChild(textSpan);
          }
        });
      } else {
        const logDiv = document.createElement('div');
        logDiv.textContent = typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2);
        debugOutput.appendChild(logDiv);
      }
    });

    debugOutput.scrollTop = debugOutput.scrollHeight;
    originalConsoleLog.apply(console, args);
    inCustomLog = false;
  };
}

// Refactor ConsoleToast class into smaller components
class ConsoleToast {
    constructor() {
        this.setupContainer();
        this.errorToast = new ErrorToast(this);
        this.logToast = new LogToast(this);
        this.toastContainer.append(this.errorToast.element, this.logToast.element);
        this.overrideConsoleMethods();
    }

    setupContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.classList.add('toast-container');
        document.body.appendChild(this.toastContainer);
    }

    overrideConsoleMethods() {
        const originalMethods = { error: console.error, log: console.log, warn: console.warn, info: console.info };
        console.error = (...args) => {
            args.forEach(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    this.errorToast.addErrorMessage(arg);
                } else {
                    this.errorToast.addErrorMessage({ message: arg.toString() });
                }
            });
            originalMethods.error.apply(console, args);
        };
        console.log = (...args) => {
            args.forEach(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    this.logToast.addLogMessage(arg);
                }
            });
            originalMethods.log.apply(console, args);
        };
        console.warn = (...args) => {
            args.forEach(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    this.logToast.addLogMessage(arg);
                }
            });
            originalMethods.warn.apply(console, args);
        };
        console.info = (...args) => {
            args.forEach(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    this.logToast.addLogMessage(arg);
                }
            });
            originalMethods.info.apply(console, args);
        };
    }
}

class ErrorToast {
    constructor(consoleToast) {
        this.consoleToast = consoleToast;
        this.element = document.createElement('div');
        this.element.classList.add('console-toast');
        const content = document.createElement('div');
        content.classList.add('toast-content');
        this.element.appendChild(content);
    }

    addErrorMessage(message) {
        const content = this.element.querySelector('.toast-content');
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-element');
        errorElement.textContent = message.message || JSON.stringify(message, null, 2);
        content.appendChild(errorElement);
        this.element.style.display = content.children.length > 0 ? 'block' : 'none';
    }
}

class LogToast {
    constructor(consoleToast) {
        this.consoleToast = consoleToast;
        this.element = document.createElement('div');
        this.element.classList.add('console-toast');
        const content = document.createElement('div');
        content.classList.add('toast-content');
        this.element.appendChild(content);
    }

    addLogMessage(message) {
        const content = this.element.querySelector('.toast-content');
        const logElement = document.createElement('div');
        logElement.classList.add('log-element', 'formatted-log');
        logElement.appendChild(this.createTreeView(message));
        content.appendChild(logElement);
        this.element.style.display = content.children.length > 0 ? 'block' : 'none';
    }

    createTreeView(obj) {
        const ul = document.createElement('ul');
        ul.classList.add('tree-view');
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const li = document.createElement('li');
                li.classList.add('tree-view-item', 'collapsed');
                const preview = typeof obj[key] === 'object' ? '...' : obj[key];
                li.innerHTML = `${key}: <span class='preview'>${preview}</span>`;
                if (typeof obj[key] === 'object') {
                    li.appendChild(this.createTreeView(obj[key]));
                    li.addEventListener('click', (e) => {
                        e.stopPropagation();
                        li.classList.toggle('expanded');
                        li.classList.toggle('collapsed');
                    });
                }
                ul.appendChild(li);
            }
        }
        return ul;
    }
}

// Initialize ConsoleToast
const consoleToast = new ConsoleToast();

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
/* PrismJS 1.29.0
https://prismjs.com/download.html#themes=prism&languages=markup+css+clike+javascript */
var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(e){var n=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,t=0,r={},a={manual:e.Prism&&e.Prism.manual,disableWorkerMessageHandler:e.Prism&&e.Prism.disableWorkerMessageHandler,util:{encode:function e(n){return n instanceof i?new i(n.type,e(n.content),n.alias):Array.isArray(n)?n.map(e):n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).slice(8,-1)},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++t}),e.__id},clone:function e(n,t){var r,i;switch(t=t||{},a.util.type(n)){case"Object":if(i=a.util.objId(n),t[i])return t[i];for(var l in r={},t[i]=r,n)n.hasOwnProperty(l)&&(r[l]=e(n[l],t));return r;case"Array":return i=a.util.objId(n),t[i]?t[i]:(r=[],t[i]=r,n.forEach((function(n,a){r[a]=e(n,t)})),r);default:return n}},getLanguage:function(e){for(;e;){var t=n.exec(e.className);if(t)return t[1].toLowerCase();e=e.parentElement}return"none"},setLanguage:function(e,t){e.className=e.className.replace(RegExp(n,"gi"),""),e.classList.add("language-"+t)},currentScript:function(){if("undefined"==typeof document)return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(r){var e=(/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(r.stack)||[])[1];if(e){var n=document.getElementsByTagName("script");for(var t in n)if(n[t].src==e)return n[t]}return null}},isActive:function(e,n,t){for(var r="no-"+n;e;){var a=e.classList;if(a.contains(n))return!0;if(a.contains(r))return!1;e=e.parentElement}return!!t}},languages:{plain:r,plaintext:r,text:r,txt:r,extend:function(e,n){var t=a.util.clone(a.languages[e]);for(var r in n)t[r]=n[r];return t},insertBefore:function(e,n,t,r){var i=(r=r||a.languages)[e],l={};for(var o in i)if(i.hasOwnProperty(o)){if(o==n)for(var s in t)t.hasOwnProperty(s)&&(l[s]=t[s]);t.hasOwnProperty(o)||(l[o]=i[o])}var u=r[e];return r[e]=l,a.languages.DFS(a.languages,(function(n,t){t===u&&n!=e&&(this[n]=l)})),l},DFS:function e(n,t,r,i){i=i||{};var l=a.util.objId;for(var o in n)if(n.hasOwnProperty(o)){t.call(n,o,n[o],r||o);var s=n[o],u=a.util.type(s);"Object"!==u||i[l(s)]?"Array"!==u||i[l(s)]||(i[l(s)]=!0,e(s,t,o,i)):(i[l(s)]=!0,e(s,t,null,i))}}},plugins:{},highlightAll:function(e,n){a.highlightAllUnder(document,e,n)},highlightAllUnder:function(e,n,t){var r={callback:t,container:e,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};a.hooks.run("before-highlightall",r),r.elements=Array.prototype.slice.apply(r.container.querySelectorAll(r.selector)),a.hooks.run("before-all-elements-highlight",r);for(var i,l=0;i=r.elements[l++];)a.highlightElement(i,!0===n,r.callback)},highlightElement:function(n,t,r){var i=a.util.getLanguage(n),l=a.languages[i];a.util.setLanguage(n,i);var o=n.parentElement;o&&"pre"===o.nodeName.toLowerCase()&&a.util.setLanguage(o,i);var s={element:n,language:i,grammar:l,code:n.textContent};function u(e){s.highlightedCode=e,a.hooks.run("before-insert",s),s.element.innerHTML=s.highlightedCode,a.hooks.run("after-highlight",s),a.hooks.run("complete",s),r&&r.call(s.element)}if(a.hooks.run("before-sanity-check",s),(o=s.element.parentElement)&&"pre"===o.nodeName.toLowerCase()&&!o.hasAttribute("tabindex")&&o.setAttribute("tabindex","0"),!s.code)return a.hooks.run("complete",s),void(r&&r.call(s.element));if(a.hooks.run("before-highlight",s),s.grammar)if(t&&e.Worker){var c=new Worker(a.filename);c.onmessage=function(e){u(e.data)},c.postMessage(JSON.stringify({language:s.language,code:s.code,immediateClose:!0}))}else u(a.highlight(s.code,s.grammar,s.language));else u(a.util.encode(s.code))},highlight:function(e,n,t){var r={code:e,grammar:n,language:t};if(a.hooks.run("before-tokenize",r),!r.grammar)throw new Error('The language "'+r.language+'" has no grammar.');return r.tokens=a.tokenize(r.code,r.grammar),a.hooks.run("after-tokenize",r),i.stringify(a.util.encode(r.tokens),r.language)},tokenize:function(e,n){var t=n.rest;if(t){for(var r in t)n[r]=t[r];delete n.rest}var a=new s;return u(a,a.head,e),o(e,a,n,a.head,0),function(e){for(var n=[],t=e.head.next;t!==e.tail;)n.push(t.value),t=t.next;return n}(a)},hooks:{all:{},add:function(e,n){var t=a.hooks.all;t[e]=t[e]||[],t[e].push(n)},run:function(e,n){var t=a.hooks.all[e];if(t&&t.length)for(var r,i=0;r=t[i++];)r(n)}},Token:i};function i(e,n,t,r){this.type=e,this.content=n,this.alias=t,this.length=0|(r||"").length}function l(e,n,t,r){e.lastIndex=n;var a=e.exec(t);if(a&&r&&a[1]){var i=a[1].length;a.index+=i,a[0]=a[0].slice(i)}return a}function o(e,n,t,r,s,g){for(var f in t)if(t.hasOwnProperty(f)&&t[f]){var h=t[f];h=Array.isArray(h)?h:[h];for(var d=0;d<h.length;++d){if(g&&g.cause==f+","+d)return;var v=h[d],p=v.inside,m=!!v.lookbehind,y=!!v.greedy,k=v.alias;if(y&&!v.pattern.global){var x=v.pattern.toString().match(/[imsuy]*$/)[0];v.pattern=RegExp(v.pattern.source,x+"g")}for(var b=v.pattern||v,w=r.next,A=s;w!==n.tail&&!(g&&A>=g.reach);A+=w.value.length,w=w.next){var E=w.value;if(n.length>e.length)return;if(!(E instanceof i)){var P,L=1;if(y){if(!(P=l(b,A,e,m))||P.index>=e.length)break;var S=P.index,O=P.index+P[0].length,j=A;for(j+=w.value.length;S>=j;)j+=(w=w.next).value.length;if(A=j-=w.value.length,w.value instanceof i)continue;for(var C=w;C!==n.tail&&(j<O||"string"==typeof C.value);C=C.next)L++,j+=C.value.length;L--,E=e.slice(A,j),P.index-=A}else if(!(P=l(b,0,E,m)))continue;S=P.index;var N=P[0],_=E.slice(0,S),M=E.slice(S+N.length),W=A+E.length;g&&W>g.reach&&(g.reach=W);var z=w.prev;if(_&&(z=u(n,z,_),A+=_.length),c(n,z,L),w=u(n,z,new i(f,p?a.tokenize(N,p):N,k,N)),M&&u(n,w,M),L>1){var I={cause:f+","+d,reach:W};o(e,n,t,w.prev,A,I),g&&I.reach>g.reach&&(g.reach=I.reach)}}}}}}function s(){var e={value:null,prev:null,next:null},n={value:null,prev:e,next:null};e.next=n,this.head=e,this.tail=n,this.length=0}function u(e,n,t){var r=n.next,a={value:t,prev:n,next:r};return n.next=a,r.prev=a,e.length++,a}function c(e,n,t){for(var r=n.next,a=0;a<t&&r!==e.tail;a++)r=r.next;n.next=r,r.prev=n,e.length-=a}if(e.Prism=a,i.stringify=function e(n,t){if("string"==typeof n)return n;if(Array.isArray(n)){var r="";return n.forEach((function(n){r+=e(n,t)})),r}var i={type:n.type,content:e(n.content,t),tag:"span",classes:["token",n.type],attributes:{},language:t},l=n.alias;l&&(Array.isArray(l)?Array.prototype.push.apply(i.classes,l):i.classes.push(l)),a.hooks.run("wrap",i);var o="";for(var s in i.attributes)o+=" "+s+'="'+(i.attributes[s]||"").replace(/"/g,"&quot;")+'"';return"<"+i.tag+' class="'+i.classes.join(" ")+'"'+o+">"+i.content+"</"+i.tag+">"},!e.document)return e.addEventListener?(a.disableWorkerMessageHandler||e.addEventListener("message",(function(n){var t=JSON.parse(n.data),r=t.language,i=t.code,l=t.immediateClose;e.postMessage(a.highlight(i,a.languages[r],r)),l&&e.close()}),!1),a):a;var g=a.util.currentScript();function f(){a.manual||a.highlightAll()}if(g&&(a.filename=g.src,g.hasAttribute("data-manual")&&(a.manual=!0)),!a.manual){var h=document.readyState;"loading"===h||"interactive"===h&&g&&g.defer?document.addEventListener("DOMContentLoaded",f):window.requestAnimationFrame?window.requestAnimationFrame(f):window.setTimeout(f,16)}return a}(_self);"undefined"!=typeof module&&module.exports&&(module.exports=Prism),"undefined"!=typeof global&&(global.Prism=Prism);
Prism.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},Prism.languages.markup.tag.inside["attr-value"].inside.entity=Prism.languages.markup.entity,Prism.languages.markup.doctype.inside["internal-subset"].inside=Prism.languages.markup,Prism.hooks.add("wrap",(function(a){"entity"===a.type&&(a.attributes.title=a.content.replace(/&amp;/,"&"))})),Object.defineProperty(Prism.languages.markup.tag,"addInlined",{value:function(a,e){var s={};s["language-"+e]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:Prism.languages[e]},s.cdata=/^<!\[CDATA\[|\]\]>$/i;var t={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:s}};t["language-"+e]={pattern:/[\s\S]+/,inside:Prism.languages[e]};var n={};n[a]={pattern:RegExp("(<__[^>]*>)(?:<!\\[CDATA\\[(?:[^\\]]|\\](?!\\]>))*\\]\\]>|(?!<!\\[CDATA\\[)[^])*?(?=</__>)".replace(/__/g,(function(){return a})),"i"),lookbehind:!0,greedy:!0,inside:t},Prism.languages.insertBefore("markup","cdata",n)}}),Object.defineProperty(Prism.languages.markup.tag,"addAttribute",{value:function(a,e){Prism.languages.markup.tag.inside["special-attr"].push({pattern:RegExp("(^|[\"'\\s])(?:"+a+")\\s*=\\s*(?:\"[^\"]*\"|'[^']*'|[^\\s'\">=]+(?=[\\s>]))","i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[e,"language-"+e],inside:Prism.languages[e]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),Prism.languages.html=Prism.languages.markup,Prism.languages.mathml=Prism.languages.markup,Prism.languages.svg=Prism.languages.markup,Prism.languages.xml=Prism.languages.extend("markup",{}),Prism.languages.ssml=Prism.languages.xml,Prism.languages.atom=Prism.languages.xml,Prism.languages.rss=Prism.languages.xml;
!function(s){var e=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;s.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:[^;{\\s\"']|\\s+(?!\\s)|"+e.source+")*?(?:;|(?=\\s*\\{))"),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+e.source+"|(?:[^\\\\\r\n()\"']|\\\\[^])*)\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+e.source+"$"),alias:"url"}}},selector:{pattern:RegExp("(^|[{}\\s])[^{}\\s](?:[^{};\"'\\s]|\\s+(?![\\s{])|"+e.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:e,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},s.languages.css.atrule.inside.rest=s.languages.css;var t=s.languages.markup;t&&(t.tag.addInlined("style","css"),t.tag.addAttribute("style","css"))}(Prism);
Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/};
Prism.languages.javascript=Prism.languages.extend("clike",{"class-name":[Prism.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp("(^|[^\\w$])(?:NaN|Infinity|0[bB][01]+(?:_[01]+)*n?|0[oO][0-7]+(?:_[0-7]+)*n?|0[xX][\\dA-Fa-f]+(?:_[\\dA-Fa-f]+)*n?|\\d+(?:_\\d+)*n|(?:\\d+(?:_\\d+)*(?:\\.(?:\\d+(?:_\\d+)*)?)?|\\.\\d+(?:_\\d+)*)(?:[Ee][+-]?\\d+(?:_\\d+)*)?)(?![\\w$])"),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),Prism.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp("((?:^|[^$\\w\\xA0-\\uFFFF.\"'\\])\\s]|\\b(?:return|yield))\\s*)/(?:(?:\\[(?:[^\\]\\\\\r\n]|\\\\.)*\\]|\\\\.|[^/\\\\\\[\r\n])+/[dgimyus]{0,7}|(?:\\[(?:[^[\\]\\\\\r\n]|\\\\.|\\[(?:[^[\\]\\\\\r\n]|\\\\.|\\[(?:[^[\\]\\\\\r\n]|\\\\.)*\\])*\\])*\\]|\\\\.|[^/\\\\\\[\r\n])+/[dgimyus]{0,7}v[dgimyus]{0,7})(?=(?:\\s|/\\*(?:[^*]|\\*(?!/))*\\*/)*(?:$|[\r\n,.;:})\\]]|//))"),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:Prism.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:Prism.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),Prism.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),Prism.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),Prism.languages.markup&&(Prism.languages.markup.tag.addInlined("script","javascript"),Prism.languages.markup.tag.addAttribute("on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)","javascript")),Prism.languages.js=Prism.languages.javascript;

/**
 * Генерирует гармоничные цвета по аналогичной схеме.
 * @param {string} baseColor - Базовый цвет в формате hex.
 * @param {number} count - Количество цветов в палитре.
 * @returns {string[]} Массив гармоничных цветов.
 */
function generateHarmoniousColors(baseColor, count = 5) {
    // Функция для преобразования hex в RGB
    const hexToRgb = hex => {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };

    // Функция для преобразования RGB в hex
    const rgbToHex = (r, g, b) => 
        `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

    // Создаем базовый цвет
    const [r, g, b] = hexToRgb(baseColor);
    const colors = [baseColor];

    // Генерируем дополнительные цвета, изменяя оттенок
    for (let i = 1; i < count; i++) {
        const hueShift = 30 * i; // Смещение оттенка для гармонии
        const newR = Math.round((r + hueShift) % 255);
        const newG = Math.round((g + hueShift / 2) % 255);
        const newB = Math.round((b + hueShift / 3) % 255);

        colors.push(rgbToHex(newR, newG, newB));
    }

    return colors;
}

function getRandomColorFromPalette() {
    const paletteColors = [
      "#66bb6a",
      "#ffccbc",
      "#ff9800",
      "#ffcc80",
      "#3f51b5",
      "#9e9e9e",
      "#212121",
      "#455a64",
      "#c5cae9"
    ];
    return paletteColors[Math.floor(Math.random() * paletteColors.length)];
  }

function generateTealAndOrangePalette(){
    const baseColor = "#0097a7"; // Базовый цвет teal
    const count = 5; // Количество цветов в палитре
    const colors = generateHarmoniousColors(baseColor, count);
    return colors;
}
// Date utils for Date objects

// Returns a Date object from '20024-11-08', '2024.11.08 17:14' etc. formats
function stringToDate(dateString) {
  if (!dateString || typeof dateString !== "string") return null;

  // Если дата содержит формат ISO или похожий, используем Date.parse
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateString) || /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      let parsedDate = new Date(dateString);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  // Если дата в формате dd.MM.yyyy HH:mm
  let dateParts = dateString.split(/[-. :]+/);
  if (dateParts.length >= 3) {
      let day = parseInt(dateParts[0], 10);
      let month = parseInt(dateParts[1], 10) - 1; // месяц 0-based
      let year = parseInt(dateParts[2], 10);
      let hours = dateParts[3] ? parseInt(dateParts[3], 10) : 0;
      let minutes = dateParts[4] ? parseInt(dateParts[4], 10) : 0;
      let seconds = dateParts[5] ? parseInt(dateParts[5], 10) : 0;

      let date = new Date(year, month, day, hours, minutes, seconds);
      return isNaN(date.getTime()) ? null : date;
  }

  return null; // Если дата не соответствует ожидаемым форматам
}



class ConsolePanel {
    constructor() {
        this.panel = document.createElement('div');
        // Add class
        this.panel.className = 'console-panel';
        this.panel.style.position = 'fixed';
        this.panel.style.bottom = '0';
        this.panel.style.left = '0';
        this.panel.style.width = '100%';
        this.panel.style.backgroundColor = 'rgba(51, 51, 51, 0.2)'; // Прозрачный фон
        this.panel.style.color = '#fff';
        this.panel.style.zIndex = '10000';
        this.panel.style.borderTop = '2px solid rgba(51, 51, 51, 0.2)';
        this.panel.style.padding = '10px';
        this.panel.style.boxSizing = 'border-box';
        this.panel.style.maxHeight = '40vh';
        this.panel.style.overflowY = 'auto';
        this.panel.style.backdropFilter = 'blur(10px)'; // Размытие задника

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '5px';

        const minimizeButton = document.createElement('button');
        minimizeButton.textContent = 'Свернуть';
        minimizeButton.style.marginRight = '5px';
        minimizeButton.onclick = () => this.toggleMinimize();

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Закрыть';
        closeButton.onclick = () => this.closePanel();

        header.appendChild(minimizeButton);
        header.appendChild(closeButton);
        this.panel.appendChild(header);

        this.contentContainer = document.createElement('div');
        this.panel.appendChild(this.contentContainer);

        document.body.appendChild(this.panel);

        this.hookConsoleMethods();
        this.hookWindowErrors();
    }

    hookConsoleMethods() {
        const consoleMethods = ['log', 'warn', 'error', 'info'];
        consoleMethods.forEach(method => {
            const originalMethod = console[method];
            console[method] = (...args) => {
                this.consoleMethod = method;
                this.consoleArgs = args;

                this.displayLog(method, args);
                originalMethod.apply(console, args);
            };
        });
    }

    hookWindowErrors() {
        window.addEventListener('error', (event) => {
            const stackTrace = event.error ? event.error.stack : 'No stack trace available';
            // this.consoleError = "No error";

            this.displayLog('error', [`${event.message}\n${stackTrace}`]);
            this.displaySuggestion(event.message, event);
        });

        window.addEventListener('unhandledrejection', (event) => {
            const stackTrace = event.reason && event.reason.stack ? event.reason.stack : 'No stack trace available';
            this.displayLog('error', [`Unhandled Promise Rejection: ${event.reason}\n${stackTrace}`]);
            this.displaySuggestion(event.reason.toString(), event);
        });
    }

    showFunctionCode(functionName) {
        const code = document.createElement('pre');
        code.style.whiteSpace = 'pre-wrap';
        code.textContent = functionName;
        this.contentContainer.appendChild(code);
    }

    displayLog(type, args) {
      const logItem = document.createElement('div');
      logItem.classList.add('log-item');
      logItem.style.marginBottom = '5px';
      logItem.style.backdropFilter = 'blur(10px)';
      logItem.style.backgroundColor = 'rgba(51, 51, 51, 0.2)';
      logItem.style.padding = '5px';
      logItem.style.borderRadius = '3px';
      logItem.style.position = 'relative';
      logItem.style.borderRadius = '10px';

      switch (type) {
          case 'log':
              logItem.style.backgroundColor = 'rgba(73, 73, 73, 0.2)';
              break;
          case 'warn':
              logItem.style.backgroundColor = '#d79e00b2';
              break;
          case 'error':
              logItem.style.backgroundColor = '#a1121256';
              logItem.classList.add('log', 'error-log');
              break;
          case 'info':
              logItem.style.backgroundColor = '#5bc0de';
              break;
      }

      const excludeList = [
          '[Five Server] connecting...',
          '[Five Server] connected.',
      ];

      args.forEach((arg) => {
          if (arg === undefined || arg === null) return;
          if (excludeList.some((item) => arg.toString().includes(item))) {
              return;
          }

          const pre = document.createElement('pre');
          pre.style.whiteSpace = 'pre-wrap';
          pre.style.margin = '0';

          if (typeof arg === 'string') {
              pre.innerHTML = arg.includes('%c') ? `<span style="${args[1]}">${arg.replace('%c', '')}</span>` : arg;
          } else if (typeof arg === 'function') {
              this.showFunctionCode(arg.toString());
              return;
          } else if (typeof arg === 'object') {
              // Красиво отформатировать объект
              pre.innerHTML = this.formatObject(arg);
          } else {
              pre.innerHTML = JSON.stringify(arg, null, 2);
          }

          logItem.appendChild(pre);
      });

      const copyButton = document.createElement('button');
      copyButton.textContent = ' ';
      copyButton.style.position = 'absolute';
      copyButton.style.top = '5px';
      copyButton.style.right = '5px';
      copyButton.style.backgroundColor = 'transparent';
      copyButton.style.border = 'none';
      copyButton.style.cursor = 'pointer';
      copyButton.style.color = '#fff';
      copyButton.onclick = () => this.copyToClipboard(logItem.textContent);

      logItem.appendChild(copyButton);
      this.contentContainer.appendChild(logItem);
      this.panel.scrollTop = this.panel.scrollHeight;
  }

  formatObject(obj) {
      let formattedHtml = '';
      if (Array.isArray(obj)) {
          formattedHtml += '<span style="color: #d79e00;">[</span>';
          obj.forEach((item, index) => {
              formattedHtml += `<div style="margin-left: 10px;">${index}: ${this.formatValue(item)}</div>`;
          });
          formattedHtml += '<span style="color: #d79e00;">]</span>';
      } else if (obj !== null && typeof obj === 'object') {
          formattedHtml += '<span style="color: #00aaff;">{</span>';
          for (let key in obj) {
              if (obj.hasOwnProperty(key)) {
                  formattedHtml += `<div style="margin-left: 10px;"><span style="color: #e74c3c;">${key}</span>: ${this.formatValue(obj[key])}</div>`;
              }
          }
          formattedHtml += '<span style="color: #00aaff;">}</span>';
      } else {
          formattedHtml = this.formatValue(obj);
      }

      return formattedHtml;
  }

  formatValue(value) {
      if (typeof value === 'string') {
          return `<span style="color: #ecf0f1;">"${value}"</span>`;
      } else if (typeof value === 'number') {
          return `<span style="color: #f39c12;">${value}</span>`;
      } else if (typeof value === 'boolean') {
          return `<span style="color: #2ecc71;">${value}</span>`;
      } else if (value === null) {
          return '<span style="color: #7f8c8d;">null</span>';
      } else if (Array.isArray(value)) {
          return '[Array]';
      } else if (typeof value === 'object') {
          return '[Object]';
      } else {
          return value;
      }
  }


    displaySuggestion(message, event) {
        const suggestionItem = document.createElement('div');
        suggestionItem.style.marginTop = '10px';
        suggestionItem.style.padding = '5px';
        // suggestionItem.style.backgroundColor = '#222';
        suggestionItem.style.backgroundColor = 'rgba(182, 182, 182, 0.26)';
        suggestionItem.style.borderRadius = '10px';
        suggestionItem.style.borderLeft = '4px solid #5bc0de';

        let suggestionText = '💡';

        // Type error
        if (message.includes('TypeError')) {
            const functionName = this.extractFunctionName(message);
            const propertyName = this.extractPropertyName(message);
            suggestionText += `<strong>${functionName}</strong> обращается к несуществующему '${propertyName}'.<br>`;
            suggestionText += '💡Проверьте, существует ли объект перед обращением к его свойствам.';
          } else if (message.includes('Cannot read properties of undefined')) {
            const functionName = this.extractFunctionName(message);
            const propertyName = this.extractPropertyName(message);
            suggestionText += `<strong>${functionName}</strong> пытается считать свойство '${propertyName}' с undefined.<br>`;
            suggestionText += 'Возможные варианты исправления: проверьте, что объект не равен undefined перед обращением к его свойствам.';
          } else if (message.includes('Cannot read property')) {
            const functionName = this.extractFunctionName(message);
            const propertyName = this.extractPropertyName(message);
            suggestionText += `<strong>${functionName}</strong> пытается считать свойство '${propertyName}' с null или undefined.<br>`;
            suggestionText += 'Возможные варианты исправления: проверьте, что объект не равен null или undefined перед обращением к его свойствам.';
          } else if (message.includes('ReferenceError')) {
            suggestionText += 'Убедитесь, что все переменные объявлены перед использованием.';
        } else if (message.includes('SyntaxError')) {
          suggestionText += 'Проверьте правильность синтаксиса, включая закрывающие скобки, кавычки и запятые.';
        } else if (message.includes('RangeError')) {
          suggestionText += 'Убедитесь, что значение не выходит за допустимые границы (например, при работе с массивами или рекурсией).';
        } else if (message.includes('Uncaught Error')) {
          suggestionText += 'Проверьте, правильно ли обрабатываются исключения и используются ли блоки try-catch.';
          suggestionText += 'Проверьте, что объект, к которому идет обращение, не равен null или undefined.';
        } else if (message.includes('Unexpected token')) {
          suggestionText += 'Проверьте правильность использования операторов и выражений в коде.';
        } else if (message.includes('is not a function')) {
          suggestionText += 'Убедитесь, что вызываемая переменная действительно является функцией.';
        } else if (message.includes('out of memory')) {
          suggestionText += 'Проверьте наличие бесконечных циклов или слишком больших объемов данных.';
        } else if (message.includes('stack overflow')) {
          suggestionText += 'Проверьте, нет ли в коде слишком глубокой рекурсии.';
        } else if (message.includes('failed to fetch')) {
          suggestionText += 'Убедитесь, что URL запроса корректен и сервер доступен.';
        } else if (message.includes('NetworkError')) {
          suggestionText += 'Проверьте подключение к интернету и доступность сервера.';
        } else if (message.includes('Access-Control-Allow-Origin')) {
          suggestionText += 'Проверьте, поддерживает ли сервер CORS и правильно ли настроены заголовки.';
        } else if (message.includes('Invalid or unexpected token')) {
          suggestionText += 'Проверьте корректность синтаксиса и кодировку файлов.';
        } else if (message.includes('Invalid JSON')) {
          suggestionText += 'Проверьте формат данных JSON и правильность его структуры.';
        } else if (message.includes('permission denied')) {
          suggestionText += 'Проверьте, имеются ли у приложения достаточные права доступа.';
        } else if (message.includes('Failed to execute')) {
          suggestionText += 'Убедитесь, что передаваемые параметры корректны.';
        } else if (message.includes('Cannot set property')) {
          suggestionText += 'Проверьте, что объект не равен null перед установкой его свойства.';
        } else if (message.includes('XHR failed')) {
          suggestionText += 'Убедитесь в корректности URL и настройках CORS.';
        } else if (message.includes('DOMException')) {
          suggestionText += 'Проверьте, не нарушаются ли ограничения безопасности DOM (например, доступ к кросс-доменному контенту).';
        } else if (message.includes('QuotaExceededError')) {
          suggestionText += 'Проверьте, не превышает ли приложение лимит хранения в Local Storage.';
        } else if (message.includes('TimeoutError')) {
          suggestionText += 'Увеличьте время ожидания или оптимизируйте выполняемую операцию.';
        } else if (message.includes('Unexpected end of input')) {
          suggestionText += 'Проверьте, не завершился ли внезапно парсинг данных (например, JSON).';
        } else if (message.includes('Element is not clickable')) {
          suggestionText += 'Убедитесь, что элемент доступен для клика (например, не перекрыт другими элементами).';
        } else if (message.includes('AbortError')) {
          suggestionText += 'Проверьте, не был ли прерван запрос пользователем или системой.';
        } else if (message.includes('SyntaxError: Unexpected end of JSON input')) {
          suggestionText += 'Проверьте целостность JSON и корректность его формата.';
        } else if (message.includes('Event listener failed')) {
          suggestionText += 'Убедитесь, что обработчик событий настроен корректно.';
        } else if (message.includes('UnhandledPromiseRejectionWarning')) {
          suggestionText += 'Используйте .catch() для обработки ошибок в промисах.';
        } else if (message.includes('Failed to load resource')) {
          suggestionText += 'Проверьте, доступен ли ресурс по указанному пути.';
        } else if (message.includes('Unexpected reserved word')) {
          suggestionText += 'Проверьте, не используете ли зарезервированные слова в качестве переменных.';
        } else if (message.includes('Not allowed to load local resource')) {
          suggestionText += 'Для загрузки локальных файлов проверьте настройки безопасности браузера.';
        } else if (message.includes('TypeError: Assignment to constant variable')) {
          suggestionText += 'Проверьте, не пытаетесь ли изменить значение переменной, объявленной через const.';
          suggestionText += 'Проверьте наличие и инициализацию объекта перед обращением к его свойствам.';
        } else if (message.includes('Invalid Date')) {
          suggestionText += 'Проверьте корректность формата даты и передаваемого значения.';
        } else if (message.includes('Cannot redefine property')) {
          suggestionText += 'Проверьте, не переопределяете ли свойства объекта несколько раз.';
        } else if (message.includes('Invalid regular expression')) {
          suggestionText += 'Проверьте правильность синтаксиса регулярного выражения.';
        } else if (message.includes('Script error.')) {
          suggestionText += 'Проверьте, нет ли ограничений на выполнение скриптов из других источников.';
        } else if (message.includes('ReferenceError: navigator is not defined')) {
          suggestionText += 'Проверьте, используете ли объект navigator в окружении браузера.';
        } else if (message.includes('TypeError: Reduce of empty array with no initial value')) {
          suggestionText += 'Передайте начальное значение для метода .reduce() или проверьте массив на пустоту.';
        } else if (message.includes('FetchError')) {
          suggestionText += 'Проверьте правильность URL и работоспособность сервера.';
        } else if (message.includes('SyntaxError: Unexpected string')) {
          suggestionText += 'Проверьте правильность использования строковых значений и кавычек.';
        } else if (message.includes('WebSocket is already in CLOSING or CLOSED state')) {
          suggestionText += 'Проверьте состояние WebSocket перед отправкой данных.';
        } else if (message.includes('Failed to execute \'appendChild\'')) {
          suggestionText += 'Проверьте, существует ли элемент, в который вы пытаетесь вставить дочерний элемент.';
        } else {
          suggestionText += 'Проверьте общий синтаксис и логическую структуру кода.';
        }

        suggestionItem.innerHTML = suggestionText;
        this.contentContainer.appendChild(suggestionItem);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // console.log('Скопировано в буфер обмена!');
        }, (err) => {
            console.error('Ошибка при копировании: ', err);
        });
    }

    toggleMinimize() {
        this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
    }

    closePanel() {
        this.panel.remove();
    }

    extractFunctionName(message) {
        // Get current error
        // const error = this.consoleError;
        // log(thiserror);

        // const match = (new Error()).stack.match(/at (.*?)\(/);
        return this.consoleMethod ? this.consoleMethod : this.consoleMethod;
    }

    // Возвращает код функции с именем functionName
    getFunctionCode(functionName) {
        const code = document.createElement('pre');
        code.style.whiteSpace = 'pre-wrap';
        code.textContent = functionName;
        this.contentContainer.appendChild(code);
        return code.textContent;
        // code.remove(); // Удаляем код после использования
   
    }

   renderObject(obj) {
      // Создаем элемент, который будет содержать структуру объекта
      const container = document.createElement('div');
      container.style.paddingLeft = '10px';
      
      if (obj && typeof obj === 'object') {
        // Создаем элементы для каждого свойства объекта
        for (const [key, value] of Object.entries(obj)) {
          const item = document.createElement('div');
          item.style.marginBottom = '5px';
          item.style.fontFamily = 'Arial, sans-serif';
          
          // Если значение свойства - это объект, рекурсивно вызываем renderObject
          if (value && typeof value === 'object') {
            item.innerHTML = `<strong>${key}:</strong> {`;
            const nestedContainer = renderObject(value); // Рекурсивный вызов
            nestedContainer.style.marginLeft = '15px'; // Отступ для вложенных объектов
            item.appendChild(nestedContainer);
            item.innerHTML += '}';
          } else {
            item.innerHTML = `<strong>${key}:</strong> ${JSON.stringify(value)}`;
          }
          
          container.appendChild(item);
        }
      } else {
        container.innerHTML = '<strong>Empty or invalid object</strong>';
      }
    
      return container;
   }
  

    extractPropertyName(message) {
        const match = message.match(/reading '([^']+)'/);
        return match ? match[1] : 'неизвестное свойство';
    }
}

class EventEmitter {
  constructor(parent, config = {}) {
    this.setParent(parent);
    this.config = config;
    this.events = {}; // Object for storing events and their listeners
  }

  setParent(parent) {
    this.parent = parent;
  }

  // Get application name
  getAppName() {
    return this.appName;
  }

  // Subscribe to an event
  on(eventName, eventHandler) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(eventHandler);
  }

  // Generate (trigger) an event
  emit(eventName, eventData = {}) {
    console.log(`⚡ ${eventName}: ${eventData} from ${this.parent}`); 
      this.events[eventName].forEach(handler => {
        try {
          handler(eventData);
        } catch (error) {
          // Handle error silently
        }
      });
    }
  }

class HtmlElement {
    constructor(element) {
        this.element = element;
    }

    addClass(className) {
        this.element.classList.add(className);
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'container';
    }
    
    createElement(tagName, options = {}) {
    const element = document.createElement(tagName);

    const operations = {
        applyClasses: (classes) => {
            if (classes) {
                element.classList.add(...classes.split(' '));
            }
        },
        setAttributes: (attributes) => {
            if (attributes) {
                Object.keys(attributes).forEach(attr => {
                    element.setAttribute(attr, attributes[attr]);
                });
            }
        },
        setInnerHTML: (html) => {
            if (html) {
                element.innerHTML = html;
            }
        },
        setStyles: (styles) => {
            if (styles) {
                Object.assign(element.style, styles);
            }
        }
    };

    Object.keys(operations).forEach(op => operations[op](options[op === 'applyClasses' ? 'className' : op]));

    return element;
}
}
class WideCard extends HtmlElement {
    constructor(container, options = {}) {
        super(container);
        this.container = container;
        this.options = options;
        this.refact = Refact.getInstance(this.container);
        this.card = this.createCard(this.options);
        this.setupReactivity();
        this.container.appendChild(this.card);
    }

    createCard(options) {
        const card = document.createElement('div');
        card.className = 'p-6 bg-white shadow rounded-2xl dark:bg-gray-900';
        card.innerHTML = `
            <dl class="space-y-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">${options.title || 'Title'}</dt>
                <dd class="text-5xl font-light md:text-6xl dark:text-white">${options.content || 'Content'}</dd>
                <dd class="flex items-center space-x-1 text-sm font-medium text-green-500 dark:text-green-400">
                    <span>${options.subContent || 'Sub Content'}</span>
                    <svg class="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M17.25 15.25V6.75H8.75"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M17 7L6.75 17.25"></path>
                    </svg>
                </dd>
            </dl>
        `;
        this.addHoverEffect(card);
        this.addClickHandler(card);
        return card;
    }

    addHoverEffect(card) {
        card.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        card.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    }

    onMouseEnter(event) {
        event.currentTarget.style.transform = 'scale(1.05)';
        event.currentTarget.style.transition = 'transform 0.3s ease-in-out';
    }

    onMouseLeave(event) {
        event.currentTarget.style.transform = 'scale(1)';
        event.currentTarget.style.transition = 'transform 0.3s ease-in-out';
    }

    addClickHandler(card) {
        card.addEventListener('click', this.options.onClick || this.defaultClickHandler.bind(this));
    }

    defaultClickHandler() {
        console.log('WideCard clicked!');
    }

    setupReactivity() {
        this.refact.subscribe(this.options.stateKey, (value) => {
            this.updateContent(value);
        });
    }

    updateContent(value) {
        this.card.querySelector('dd').textContent = value;
    }
}
class DropdownComponent {
    constructor(element) {
        if (element){
            this.element = element;
            this.button = element.querySelector('.dropdown-toggle');
            this.menu = element.querySelector('.dropdown-menu');
            this.items = element.querySelectorAll('.dropdown-item');
            this.isOpen = false;
            this.init();
        }

    }

    init() {
        this.button?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });
    }

    getContainer() {
        return this.element;
    }

    clearItems() {
        if (this.menu) {
            this.menu.innerHTML = '';
        }
    }

    addItem(text, value, onClick, imageUrl = null, stateUpdate = null) {
        if (!this.menu) return;

        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = text;
        item.dataset.value = value;
        
        if (imageUrl) {
            const icon = document.createElement('img');
            icon.src = imageUrl;
            icon.className = 'dropdown-icon';
            item.prepend(icon);
        }

        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (onClick) onClick(value);
            if (stateUpdate) {
                const [stateName, stateValue] = Object.entries(stateUpdate)[0];
                this.refact.setState(stateName, stateValue);
            }
            this.handleItemClick(e);
        });
        
        this.menu.appendChild(item);
    }

    toggle() {
        if (this.element.classList.contains('show')) {
            this.close();
        } else {
            this.show();
        }
    }

    show() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.element.classList.add('show');
        this.adjustMenuPosition();
        document.addEventListener('click', this.handleOutsideClick);
    }

    adjustMenuPosition() {
        const menu = this.element.querySelector('.dropdown-menu');
        const rect = menu.getBoundingClientRect();
        const parentRect = this.element.getBoundingClientRect();
        
        // Проверяем выход за правый край экрана
        if (rect.right > window.innerWidth) {
            const overflow = rect.right - window.innerWidth;
            menu.style.left = `${-overflow - 10}px`; // 10px отступ от края
        }
        
        // Проверяем выход за левый край
        if (rect.left < 0) {
            menu.style.left = '0px';
        }
    }

    open() {
        this.element.classList.add('show');
        this.button?.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.element.classList.remove('show');
        this.button?.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
        document.removeEventListener('click', this.handleOutsideClick);
    }

    handleItemClick(event) {
        const value = event.target.dataset.value;
        const text = event.target.textContent;
        
        if (this.button) {
            this.button.textContent = text;
        }
        
        this.element.dispatchEvent(new CustomEvent('change', {
            detail: { value, text }
        }));
        
        this.close();
    }

    handleOutsideClick = (e) => {
        if (!this.element.contains(e.target)) {
            this.close();
        }
    }

    setToggleIcon(imageUrl) {
        if (!this.button) return;

        // Find existing icon or create a new one
        let icon = this.button.querySelector('.dropdown-icon');
        if (!icon) {
            icon = document.createElement('img');
            icon.className = 'dropdown-icon';
            this.button.appendChild(icon);
        }

        // Set the new image URL
        icon.src = imageUrl;
    }
}

// Initialize all dropdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        new DropdownComponent(dropdown);
    });
});

class NavbarComponent {
    static #instance = null;
    #element = null;
    #theme = 'light';
    #mode = 'normal';

    constructor(config = {}) {
        if (NavbarComponent.#instance) return NavbarComponent.#instance;
        NavbarComponent.#instance = this;

        const defaultConfig = {
            theme: 'light',
            mode: 'normal',
            title: '',
            animate: true
        };

        this.config = { ...defaultConfig, ...config };
        this.#createNavbar();
        this.#setupEventListeners();
    }

    #createNavbar() {
        this.#element = document.createElement('nav');
        this.#element.className = 'navbar';
        this.#updateClasses();

        const brand = document.createElement('div');
        brand.className = 'navbar-brand';
        brand.textContent = this.config.title;

        const leftMenu = document.createElement('div');
        leftMenu.className = 'navbar-left';
        leftMenu.appendChild(brand);

        const menu = document.createElement('div');
        menu.className = 'navbar-menu';

        this.#element.appendChild(leftMenu);
        this.#element.appendChild(menu);

        // Добавляем стили для фиксированной позиции
        this.#element.style.position = 'fixed';
        this.#element.style.top = '0';
        this.#element.style.left = '0';
        this.#element.style.right = '0';
        this.#element.style.zIndex = '1000';
        this.#element.style.backgroundColor = 'var(--background-color, white)';
        this.#element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        this.#element.style.transition = 'transform 0.3s ease';
    }

    #setupEventListeners() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            this.setTheme(e.matches ? 'dark' : 'light');
        });
    }

    #updateClasses() {
        this.#element.className = 'navbar';
        this.#element.classList.add(this.#theme);
        this.#element.classList.add(this.#mode);
        if (this.config.animate) this.#element.classList.add('animate');
    }

    // Public API
    getElement() {
        return this.#element;
    }

    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') return;
        this.#theme = theme;
        this.#updateClasses();
    }

    setMode(mode) {
        if (mode !== 'normal' && mode !== 'compact') return;
        this.#mode = mode;
        this.#updateClasses();
    }

    addItem(itemElement) {
        const menu = this.#element.querySelector('.navbar-menu');
        if (menu && itemElement instanceof Element) {
            itemElement.style.opacity = '0';
            itemElement.style.transform = 'translateX(20px)';
            this.#element.appendChild(itemElement);
            
            // Анимация появления
            requestAnimationFrame(() => {
                itemElement.style.transition = 'all 0.3s ease';
                itemElement.style.opacity = '1';
                itemElement.style.transform = 'translateX(0)';
            });
        }
    }

    addButton(text, image, onclick) {
        const button = document.createElement('button');
        button.className = 'navbar-button';

        if (image) {
            const img = document.createElement('img');
            img.className = 'navbar-icon-button';
            img.src = image;
            img.alt = text;
            button.appendChild(img);
        }

        if (text) {
            const span = document.createElement('span');
            span.textContent = text;
            button.appendChild(span);
        }

        if (typeof onclick === 'function') {
            button.addEventListener('click', onclick);
        }

        this.addItem(button);
    }

    addGroup(side, elements = []) {
        const group = document.createElement('div');
        group.className = 'navbar-group';

        elements.forEach(element => {
            if (element instanceof HTMLElement) {
                group.appendChild(element);
            }
        });

        let target;
        switch (side) {
            case 'left':
                target = this.#element.querySelector('.navbar-left');
                break;
            case 'right':
                target = this.#element.querySelector('.navbar-menu');
                break;
            case 'center':
                target = this.#element.querySelector('.navbar-center');
                if (!target) {
                    target = document.createElement('div');
                    target.className = 'navbar-center';
                    this.#element.insertBefore(target, this.#element.querySelector('.navbar-menu'));
                }
                break;
            default:
                console.error('Invalid side specified for addGroup');
                return;
        }

        if (target) {
            target.appendChild(group);
        }

        return group;
    }

    static create(config) {
        return new NavbarComponent(config);
    }
}

class ValueCard extends HtmlElement {
    constructor(container, options = {}) {
        super(container);
        this.container = container;
        this.options = options;
        this.refact = Refact.getInstance(this.container);
        this.card = this.createCard();
        this.setupReactivity();
        this.container.appendChild(this.card);
    }

    createCard() {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.style.borderRadius = '12px';
        card.style.overflow = 'hidden';
        card.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="info-card-header">
                <img src="src/img/jira-defect.svg" alt="Icon" style="width: 24px; height: 24px; margin-right: 8px;">
                ${this.options.title || 'Title'}
            </div>
            <div class="info-card-body">${this.options.content || 'Content'}</div>
            <div class="info-card-footer">${this.options.footer || 'Footer'}</div>
        `;
        this.addEventListeners(card);
        return card;
    }

    addEventListeners(card) {
        card.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        card.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        card.addEventListener('click', this.options.onClick || this.defaultClickHandler.bind(this));
    }

    onMouseEnter(event) {
        event.currentTarget.style.transform = 'scale(1.1)';
        event.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
        const icon = event.currentTarget.querySelector('img');
        icon.style.transition = 'transform 0.6s ease-in-out, filter 0.6s ease-in-out';
        icon.style.filter = 'brightness(1.5)';
        icon.style.transform = 'scale(1.2)';
    }

    onMouseLeave(event) {
        event.currentTarget.style.transform = 'scale(1)';
        event.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        const icon = event.currentTarget.querySelector('img');
        icon.style.filter = 'brightness(1)';
        icon.style.transform = 'scale(1)';
    }

    defaultClickHandler(event) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        this.card.appendChild(ripple);

        const rect = this.card.getBoundingClientRect();
        ripple.style.left = `${event.clientX - rect.left - ripple.offsetWidth / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - ripple.offsetHeight / 2}px`;

        ripple.style.animation = 'ripple-effect 5s ease-in-out forwards';

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });

        // Card press and bounce effect
        this.card.style.transition = 'transform 0.2s cubic-bezier(0.3, 0.07, 0.4, 1.5)';
        this.card.style.transform = 'scale(0.95)';

        setTimeout(() => {
            this.card.style.transform = 'scale(1)';
        }, 200);

        console.log('ValueCard clicked!');
    }

    setupReactivity() {
        this.refact.subscribe(this.options.stateKey, (value) => {
            this.updateContent(value);
        });
    }

    updateContent(value, description) {
        this.card.querySelector('.info-card-body').textContent = value;
        this.card.querySelector('.info-card-footer').textContent = description;
    }
}

class DateRangeDropdown extends DropdownComponent {
    constructor(parentElement, dateStart, dateEnd) {
        super(parentElement);
        // Create dropdown structure
        this.container = document.createElement('div');
        this.container.className = 'dropdown date-range-dropdown';
        this.container.id = 'dateRangeContainer';
        
        const button = document.createElement('button');
        button.className = 'dropdown-toggle';
        button.textContent = 'За всё время';
        
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        
        this.container.appendChild(button);
        this.container.appendChild(menu);
        if (parentElement) parentElement.appendChild(this.container);

        // Set initial dates
        this.dateStart = dateStart ? new Date(dateStart) : null;
        this.dateEnd = dateEnd ? new Date(dateEnd) : null;
        
        this.setupDateMenu();
    }

    getContainer() {
        return this.container
    }

    setupDateMenu() {
        this.clearItems();
        
        // Add "All Time" option
        this.addItem('За всё время', null, () => {
            this.setDateRange(null, null);
            if (window.app && window.app.refact) {
                window.app.refact.setState({ dateStart: null, dateEnd: null });
            }
        });

        // Add year options
        const currentYear = new Date().getFullYear();
        const startYear = 2020; // Or any other starting year

        for (let year = currentYear; year >= startYear; year--) {
            this.addItem(`${year}`, year, () => {
                const start = new Date(year, 0, 1);
                const end = new Date(year, 11, 31);
                this.setDateRange(start, end);
                if (window.app && window.app.refact) {
                    window.app.refact.setState({ dateStart: start, dateEnd: end });
                }
            });
        }

        // Add custom range option
        this.addItem('Выбрать период...', 'custom', () => {
            // Here you could open a date range picker
            console.log('Custom date range not implemented');
        });
    }

    setDateRange(start, end) {
        this.dateStart = start ? new Date(start) : null;
        this.dateEnd = end ? new Date(end) : null;
        
        if (start && end) {
            const startYear = start.getFullYear();
            const endYear = end.getFullYear();
            if (startYear === endYear) {
                this.button.textContent = `${startYear}`;
            } else {
                this.button.textContent = `${startYear} - ${endYear}`;
            }
        } else {
            this.button.textContent = 'За всё время';
        }
    }
}

class IssueTable {
    constructor(headers, config = {}) {
        this.isUpperCase = config.isUpperCase ?? true;
        this.container = document.createElement('div');
        this.container.className = 'issue-table-container';
        this.slidePanel = new SlidePanel();
        
        // Define available columns with their configurations
        this.availableColumns = {
            taskId: { 
                header: 'Задача',
                formatter: (issue) => `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="src/img/jira-defect.svg" alt="Defect" style="width: 16px; height: 16px;">
                        <a href="https://jira.moscow.alfaintra.net/browse/${issue.id}" 
                           target="_blank" 
                           class="jira-link"
                           title="Открыть в Jira">${issue.id}</a>
                    </div>`,
                className: '',
                sortable: true,
                sortFn: (a, b) => a.id.localeCompare(b.id)
            },
            reports: { 
                header: 'Обращений',
                formatter: (issue) => issue.reports || 0,
                className: 'text-center',
                sortable: true,
                sortFn: (a, b) => (a.reports || 0) - (b.reports || 0)
            },
            status: { 
                header: 'Статус',
                formatter: (issue) => {
                    const status = (issue.status || 'Новый').toLowerCase();
                    return `<span class="status-badge status-${status}">${issue.status || 'Новый'}</span>`;
                },
                className: '',
                sortable: true,
                sortFn: (a, b) => (a.status || '').localeCompare(b.status || '')
            },
            description: { 
                header: 'Описание',
                formatter: (issue) => issue.description || '',
                className: 'description-cell',
                sortable: true,
                sortFn: (a, b) => (a.description || '').localeCompare(b.description || '')
            },
            created: { 
                header: 'Создан',
                formatter: (issue) => new Date(issue.created).toLocaleDateString('ru-RU'),
                className: '',
                sortable: true,
                sortFn: (a, b) => new Date(a.created) - new Date(b.created)
            }
        };

        // Initialize columns based on headers
        this.initializeColumns(headers);
    }

    initializeColumns(headers) {
        if (Array.isArray(headers)) {
            // Store just the column keys that we want to display
            this.activeColumns = headers;
        } else if (typeof headers === 'object') {
            // If headers is an object with custom configurations
            this.activeColumns = Object.keys(headers);
            // Merge custom configs with defaults
            Object.entries(headers).forEach(([key, customConfig]) => {
                if (this.availableColumns[key]) {
                    this.availableColumns[key] = {
                        ...this.availableColumns[key],
                        ...customConfig
                    };
                }
            });
        }
    }

    createTableHeader() {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        
        Object.entries(this.availableColumns)
            .filter(([key]) => this.activeColumns.includes(key))
            .forEach(([key, column]) => {
                const th = document.createElement('th');
                th.textContent = column.header;
                if (this.isUpperCase) {
                    th.textContent = th.textContent.toUpperCase();
                }
                if (column.sortable) {
                    th.classList.add('sortable');
                    th.addEventListener('click', () => this.sortByColumn(column));
                }
                tr.appendChild(th);
            });
        
        thead.appendChild(tr);
        return thead;
    }

    createTableRow(issue) {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', issue.id);
        tr.style.cursor = 'pointer';
        
        // Add click handler to show issue details
        tr.addEventListener('click', () => {
            const issueCard = new IssueCard({
                title: issue.id,
                timeAgo: new Date(issue.created).toLocaleDateString('ru-RU'),
                description: issue.description || 'Нет описания',
                footer: `Статус: ${issue.status || 'Новый'}`
            });
            
            this.slidePanel.setTitle(`Задача ${issue.id}`);
            this.slidePanel.clear();
            this.slidePanel.updateContent(issueCard.createCard());
            this.slidePanel.open();
        });
        
        Object.entries(this.availableColumns)
            .filter(([key]) => this.activeColumns.includes(key))
            .forEach(([key, column]) => {
                const td = document.createElement('td');
                if (column.className) {
                    td.className = column.className;
                }
                td.innerHTML = column.formatter(issue);
                tr.appendChild(td);
            });
        
        return tr;
    }

    render(issues) {
        this.container.innerHTML = '';
        
        const table = document.createElement('table');
        table.className = 'issue-table';
        
        // Add header
        table.appendChild(this.createTableHeader());
        
        // Add body
        const tbody = document.createElement('tbody');
        issues.forEach(issue => {
            tbody.appendChild(this.createTableRow(issue));
        });
        
        table.appendChild(tbody);
        this.container.appendChild(table);
        return this.container;
    }

    showIssues(issues, headers) {
        if (headers) {
            this.initializeColumns(headers);
        }
        return this.render(issues);
    }

    sortByColumn(column) {
        if (!this.currentData || !column.sortable) return;
        
        const table = this.container.querySelector('table');
        const headers = table.querySelectorAll('th');
        
        // Toggle sort direction
        column.sortDirection = column.sortDirection === 'asc' ? 'desc' : 'asc';
        
        // Update header classes
        headers.forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
        const headerIndex = this.activeColumns.indexOf(column);
        headers[headerIndex].classList.add(`sort-${column.sortDirection}`);
        
        // Sort data
        this.currentData.sort((a, b) => {
            const result = column.sortFn(a, b);
            return column.sortDirection === 'asc' ? result : -result;
        });
        
        // Re-render table body
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        this.currentData.forEach(issue => {
            tbody.appendChild(this.createTableRow(issue));
        });
    }

    updateRow(issueId, updatedData) {
        const row = this.container.querySelector(`tr[data-id="${issueId}"]`);
        if (row) {
            const newRow = this.createTableRow({ ...updatedData, id: issueId });
            row.replaceWith(newRow);
            
            // Update data in currentData array
            const index = this.currentData.findIndex(issue => issue.id === issueId);
            if (index !== -1) {
                this.currentData[index] = { ...updatedData, id: issueId };
            }
        }
    }

    removeRow(issueId) {
        const row = this.container.querySelector(`tr[data-id="${issueId}"]`);
        if (row) {
            row.remove();
            // Update currentData array
            this.currentData = this.currentData.filter(issue => issue.id !== issueId);
        }
    }
}
class SlidePanel {
    static instance = null;

    static getInstance() {
        if (!SlidePanel.instance) {
            SlidePanel.instance = new SlidePanel();
        }
        return SlidePanel.instance;
    }

    constructor() {
        // Prevent multiple instances
        if (SlidePanel.instance) {
            return SlidePanel.instance;
        }
        SlidePanel.instance = this;

        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'slide-panel-backdrop';
        document.body.appendChild(this.backdrop);

        // Create panel
        this.panel = document.createElement('div');
        this.panel.className = 'slide-panel slide-panel-right';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'slide-panel-header';
        
        // Create and store logo element
        this.logo = document.createElement('img');
        this.logo.className = 'slide-panel-logo';
        this.logo.style.display = 'flex';
        this.logo.src = 'src/img/translation.svg';
        this.logo.alt = 'Logo';   

        header.appendChild(this.logo);
        
        // Create and store title element
        this.title = document.createElement('span');
        this.title.className = 'title-text';
        this.title.textContent = 'Загрузка заголовка...';
        header.appendChild(this.title);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'slide-panel-close';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => this.close();
        header.appendChild(closeButton);
        
        // Create content container
        this.content = document.createElement('div');
        this.content.className = 'slide-panel-content issue-content';
        
        // Assemble panel
        this.panel.appendChild(header);
        this.panel.appendChild(this.content);
        document.body.appendChild(this.panel);
        
        // Add event listeners for panel closing
        this.backdrop.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });

        return this;
    }

    clear() {
        this.content.innerHTML = '';
    }

    open() {
        this.panel.style.display = 'block';
        this.backdrop.style.display = 'block';
        this.panel.classList.add('open');
        this.backdrop.classList.add('visible');
    }
    
    close() {
        this.panel.classList.remove('open');
        this.backdrop.classList.remove('visible');
        
        const onTransitionEnd = () => {
            this.panel.style.display = 'none';
            this.backdrop.style.display = 'none';
            this.panel.removeEventListener('transitionend', onTransitionEnd);
        };
        
        this.panel.addEventListener('transitionend', onTransitionEnd);
    }

    setLogo(imageUrl) {
        this.logo.src = imageUrl;
        this.logo.className = 'slide-panel-logo';
        this.logo.style.display = 'flex';
    }

    setTitle(title) {
        this.title.textContent = title;
    }

    updateContent(content) {
        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof Element) {
            this.content.innerHTML = '';
            this.content.appendChild(content);
        }
    }
}
class IssueCard {
  constructor({ title, timeAgo, description, footer }) {
    this.title = title;
    this.timeAgo = timeAgo;
    this.description = description;
    this.footer = footer;
  }

  // Метод для создания HTML карточки
  createCard() {
    const card = document.createElement('a');
    card.classList.add('list-group-item', 'list-group-item-action');
    
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('d-flex', 'w-100', 'justify-content-between');

    const heading = document.createElement('h5');
    heading.classList.add('mb-1');
    heading.textContent = this.title;

    const time = document.createElement('small');
    time.classList.add('text-body-secondary');
    time.textContent = this.timeAgo;

    cardHeader.appendChild(heading);
    cardHeader.appendChild(time);

    const descriptionPara = document.createElement('p');
    descriptionPara.classList.add('mb-1');
    descriptionPara.textContent = this.description;

    const footerText = document.createElement('small');
    footerText.classList.add('text-body-secondary');
    footerText.textContent = this.footer;

    card.appendChild(cardHeader);
    card.appendChild(descriptionPara);
    card.appendChild(footerText);

    return card;
  }

  // Метод для добавления карточки в родительский элемент
  appendTo(parentElement) {
    const card = this.createCard();
    parentElement.appendChild(card);
  }
}

class DashboardNavbar {
    constructor(rootElement) {
        this.refact = new Refact(rootElement);
        this.refact.setState({ visible: true, items: [] });
    }

    // Show the navbar
    show() {
        this.refact.setState({ visible: true }, 'DashboardNavbar.show');
        this.rootElement.style.display = 'flex';
    }

    // Hide the navbar
    hide() {
        this.refact.setState({ visible: false }, 'DashboardNavbar.hide');
        this.rootElement.style.display = 'none';
    }

    // Toggle the visibility of the navbar
    toggle() {
        const currentState = this.refact.state.visible;
        this.refact.setState({ visible: !currentState }, 'DashboardNavbar.toggle');
        this.rootElement.style.display = currentState ? 'none' : 'flex';
    }

    // Add a new item to the navbar
    addItem(item) {
        const items = this.refact.state.items;
        items.push(item);
        this.refact.setState({ items }, 'DashboardNavbar.addItem');
        this.renderItems();
    }

    // Render items in the navbar
    renderItems() {
        const itemsContainer = this.rootElement.querySelector('.navbar-items-container');
        itemsContainer.innerHTML = ''; // Clear existing items
        this.refact.state.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'navbar-item';
            itemElement.textContent = item;
            itemsContainer.appendChild(itemElement);
        });
    }
}
// We don't use ES6 modules
// Requires: report-manager.js to be loaded before this file
class ReportDropdown extends DropdownComponent {
    constructor(parentElement) {
        // Create dropdown structure
        const container = document.createElement('div');
        container.className = 'dropdown report-dropdown';
        container.id = 'reportDropdownContainer';
        
        const button = document.createElement('button');
        button.className = 'dropdown-toggle';
        button.textContent = 'Отчёт';
        
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        
        container.appendChild(button);
        container.appendChild(menu);
        parentElement.appendChild(container);
        
        // Initialize dropdown
        super(container);
        
        this.refact = Refact.getInstance();
        this.setupItems();
    }

    setupItems() {
        this.clearItems();
        
        // Add report types
        this.addItem('Еженедельный отчёт по обращениям', 'weekly', () => {
            this.setReportType('weekly');
            this.button.textContent = 'Еженедельный отчёт по обращениям';
        });

        this.addItem('MVP отчёта по дефектам и доработкам', 'mvp', () => {
            this.setReportType('mvp');
            this.button.textContent = 'MVP отчёта по дефектам и доработкам';
        });
    }

    setReportType(type) {
        if (this.refact) {
            this.refact.setState({ reportType: type }, 'ReportDropdown');
        }
    }
}

class TeamsDropdownComponent extends DropdownComponent {
    constructor(containerId, text = 'Все команды') {
        super(containerId, text);
        this.container.classList.add('dropdown'); // Добавляем класс dropdown для правильного отображения
    }

    updateTeams(teams) {
        this.clearMenu();
        
        // Добавляем опцию "Все команды"
        const allTeamsItem = this.createMenuItem('Все команды', () => {
            this.setButtonText('Все команды');
            document.dispatchEvent(new CustomEvent('teamSelected', {
                detail: { team: 'all' }
            }));
        });
        this.dropdownMenu.appendChild(allTeamsItem);

        if (teams && teams.length > 0) {
            this.addDivider();

            // Добавляем команды
            teams.forEach(team => {
                if (team) {  // Проверяем, что team не пустой
                    const teamItem = this.createMenuItem(team, () => {
                        this.setButtonText(team);
                        document.dispatchEvent(new CustomEvent('teamSelected', {
                            detail: { team: team }
                        }));
                    });
                    this.dropdownMenu.appendChild(teamItem);
                }
            });
        }
    }

    selectTeam(team) {
        if (team) {
            const teamText = team === 'all' ? 'Все команды' : team;
            this.setButtonText(teamText);
        }
    }

    getSelectedTeam() {
        return this.button.textContent === 'Все команды' ? 'all' : this.button.textContent;
    }
}

class WidgetsRow {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.issueTable = new IssueTable();
        if (!this.container) {
            throw new Error(`Container with id ${containerId} not found`);
        }
    }

    formatTimeValue(days) {
        const DAYS_IN_MONTH = 30.44; // среднее количество дней в месяце
        const DAYS_IN_YEAR = 365.25; // среднее количество дней в году

        if (days >= DAYS_IN_YEAR) {
            const years = Math.floor(days / DAYS_IN_YEAR);
            const months = Math.floor((days % DAYS_IN_YEAR) / DAYS_IN_MONTH);
            return `${years} г ${months} мес`;
        } else if (days >= DAYS_IN_MONTH) {
            const months = Math.floor(days / DAYS_IN_MONTH);
            const remainingDays = Math.floor(days % DAYS_IN_MONTH);
            return `${months} мес ${remainingDays} дн`;
        } else {
            return `${Math.floor(days)} дн`;
        }
    }

    createWidget(config = { type: 'time', value: 0, label: '', trend: null, icon: null }, onClick = null) {
        this.onClick = config.onClick;

        const widget = document.createElement('div');
        widget.className = 'app-widget-container app-widget-loading';

        // Create top section
        const topSection = document.createElement('div');
        topSection.className = 'app-widget-top';

        // Create text wrapper
        const textWrapper = document.createElement('div');
        textWrapper.className = 'app-widget-top-text-wrapper';

        // Add value with time formatting if needed
        const valueText = document.createElement('span');
        valueText.className = 'app-widget-value-text';
        valueText.textContent = config.type === 'time' ? '00' : '0';

        // Имитация загрузки
        setTimeout(() => {
            widget.classList.remove('app-widget-loading');
            if (config.type === 'time') {
                valueText.textContent = this.formatTimeValue(config.value);
            } else {
                valueText.textContent = config.value;
            }
        }, 1000);

        textWrapper.appendChild(valueText);

        // Add label
        const labelText = document.createElement('span');
        labelText.className = 'app-widget-label-text';
        labelText.textContent = config.label;
        textWrapper.appendChild(labelText);

        // Add icon if provided
        if (config.icon) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'app-widget-icon';
            const icon = document.createElement('img');
            icon.className = 'app-widget-icon-img';
            icon.src = config.icon;
            icon.alt = 'Icon';
            iconWrapper.appendChild(icon);
            topSection.appendChild(iconWrapper);
        }

        topSection.appendChild(textWrapper);
        widget.appendChild(topSection);

        // Create bottom section if trend is provided
        if (config.trend) {
            const bottomSection = document.createElement('div');
            bottomSection.className = 'app-widget-bottom';

            // Add trend text
            const trendText = document.createElement('div');
            trendText.innerHTML = config.trend.text;
            trendText.className = 'app-widget-bottom-text';
            bottomSection.appendChild(trendText);

            widget.appendChild(bottomSection);
        }

        // Добавляем обработчик клика
        widget.addEventListener('click', this.onClick);

        return widget;
    }

    addWidget(config) {
        const widget = this.createWidget(config);
        this.container.appendChild(widget);

        // Add divider if it's not the last widget
        if (!config.isLast) {
            const divider = document.createElement('div');
            divider.className = 'app-widgets-row-divider';
            this.container.appendChild(divider);
        }
    }

    clearWidgets() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }

    updateWidgets(widgetsConfig) {
        this.clearWidgets();
        widgetsConfig.forEach((config, index) => {
            this.addWidget({
                ...config,
                isLast: index === widgetsConfig.length - 1
            });
        });
    }

}
class ComponentManager {
  constructor(componentsConfig) {
    this.components = this.initComponents(componentsConfig);
  }

  initComponents(componentsConfig) {
    const components = {};
    Object.keys(componentsConfig).forEach((id) => {
      const component = componentsConfig[id];
      component.element = document.getElementById(id);
      if (component.element) {
        Object.keys(component.listeners).forEach((event) => {
          component.element.addEventListener(event, component.listeners[event]);
        });
      } else {
        // console.warn(`Element ${id} not found`);
      }
      components[id] = component;
    });
    return components;
  }

  getElement(elementId) {
    const element = this.components[elementId]?.element;
    if (!element) throw new Error(`Element ${elementId} not found`);
    return element;
  }

  addComponent(id, component) {
    this.components[id] = component;
  }
}

class FileInputContainer {
    constructor(container) {
        this.parentContainer = container;
        this.refact = Refact.getInstance(container);
        this.state = {
            uploadedFile: null,
            supportedFormats: ['CSV']
        };
        this.refact.setState(this.state);

        this.createView();
        this.setupReactivity();
        this.setupFileInput();
        
        this.parentContainer.appendChild(this.container);
    }

    createView() {
        this.container = document.createElement('div');
        this.container.className = 'file-input-container';

        this.title = document.createElement('h2');
        this.title.className = 'file-input-title';
        this.title.textContent = 'Загрузите данные из Jira';

        this.dragDropText = document.createElement('p');
         this.dragDropText.className = 'file-input-drag-text';
        this.dragDropText.textContent = 'Перетащите файл или нажмите';

        this.uploadButton = document.createElement('button');
        this.uploadButton.className = 'file-input-upload-button';
        this.uploadButton.textContent = 'Выбрать файл';
        this.uploadButton.type = 'button';

        this.hint = document.createElement('p');
        this.hint.className = 'file-input-hint';
        this.hint.textContent = 'Excel или CSV';

        this.inputElement = document.createElement('input');
        this.inputElement.type = 'file';
        this.inputElement.accept = '.csv';
        this.inputElement.style.display = 'none';

        this.container.appendChild(this.title);
        this.container.appendChild(this.dragDropText);
        this.container.appendChild(this.uploadButton);
        this.container.appendChild(this.hint);
        this.container.appendChild(this.inputElement);
    }

    setupFileInput() {
        this.uploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Reset input value before opening file dialog
            this.inputElement.value = '';
            this.inputElement.click();
        });

        this.inputElement.addEventListener('change', (event) => {
            if (event.target.files && event.target.files.length > 0) {
                const file = event.target.files[0];
                console.log('File selected:', file.name); 
                this.refact.setState({ uploadedFile: file });
            }
        });

        // Handle drag and drop
        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.add('dragover');
        });

        this.container.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.remove('dragover');
        });

        this.container.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.remove('dragover');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                console.log('File dropped:', file.name);
                this.refact.setState({ uploadedFile: file });
            }
        });
    }

    setupReactivity() {
        this.refact.subscribe('uploadedFile', (file) => {
            console.log('File updated:', file);
        });
    }

    getContainer() {
        return this.container;
    }
}

class BaseChart {
  constructor(data, canvasId) {
    this.data = data; // Issues array
    this.canvasId = canvasId;
  }

  // Метод для получения всех уникальных команд
  getUniqueTeams() {
    const teams = new Set();
    this.data.forEach(issue => {
      if (issue.team) {
        teams.add(issue.team);
      }
    });
    return Array.from(teams);
  }

  // Метод для проверки, завершена ли задача
  isResolved(taskStatus) {
    return taskStatus === "Закрыт" || taskStatus === "Отклонен";
  }
}

class BacklogChart extends BaseChart {

  constructor(issues, canvasId, labelsData) {
    super(issues, canvasId);
    this.createBacklogChart(issues, canvasId, labelsData);
  }

  createBacklogChart(tasks, canvasId, labelsData) {
    if(this.chart) {
      this.chart.destroy();
    }
    
    const createdCounts = {};
    const resolvedCounts = {};
    const backlogCounts = {};
    const labels = new Set();

    // Сначала собираем все даты
    tasks.forEach(task => {
      const createdDate = new Date(task.created);
      const monthYearCreated = `${createdDate.getFullYear()}-${(createdDate.getMonth() + 1).toString().padStart(2, '0')}`;
      labels.add(monthYearCreated);
    });

    // Сортируем даты
    const sortedLabels = Array.from(labels).sort();

    // Для каждой даты считаем метрики
    sortedLabels.forEach(currentDate => {
      const [currentYear, currentMonth] = currentDate.split('-').map(Number);
      const currentDateTime = new Date(currentYear, currentMonth - 1).getTime();

      // Считаем созданные задачи до этой даты
      createdCounts[currentDate] = tasks.filter(task => {
        const taskDate = new Date(task.created);
        const monthYear = `${taskDate.getFullYear()}-${(taskDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return monthYear === currentDate;
      }).length;

      // Считаем решенные задачи до этой даты
      resolvedCounts[currentDate] = tasks.filter(task => {
        if (!task.resolved) return false;
        const resolvedDate = new Date(task.resolved);
        const resolvedDateTime = resolvedDate.getTime();
        return resolvedDateTime <= new Date(currentYear, currentMonth).getTime();
      }).length;

      // Считаем текущий бэклог на эту дату (созданные минус решенные)
      const totalCreated = tasks.filter(task => {
        const createdDate = new Date(task.created);
        return createdDate.getTime() <= new Date(currentYear, currentMonth).getTime();
      }).length;

      const totalResolved = tasks.filter(task => {
        if (!task.resolved) return false;
        const resolvedDate = new Date(task.resolved);
        return resolvedDate.getTime() <= new Date(currentYear, currentMonth).getTime();
      }).length;

      backlogCounts[currentDate] = totalCreated - totalResolved;
    });

    const createdData = sortedLabels.map(label => createdCounts[label] || 0);
    const resolvedData = sortedLabels.map(label => resolvedCounts[label] || 0);
    const backlogData = sortedLabels.map(label => backlogCounts[label] || 0);

    // Создаем график
    this.chart = new Chart(canvasId, {
      type: 'line',
      data: {
        labels: sortedLabels,
        datasets: [
          {
            label: labelsData? `Открыто (${labelsData.unresolved})`: `Открыто`,
            data: createdData,
            tension: 0.3,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true
          },
          {
            label: `Закрыто (${resolvedData.reduce((a, b) => a + b, 0)})`,
            data: resolvedData,
            tension: 0.3,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true
          },
          {
            label: 'Бэклог',
            data: backlogData,
            tension: 0.3,
            borderColor: '#FE981C',
            backgroundColor: '#fe981c3b',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        animations: {
          tension: {
            duration: 3000,
            easing: 'linear',
            from: 0,
            to: 0.5,
            loop: false,
          },
        },
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Дата'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Количество дефектов'
            }
          }
        }
      }
    });
    this.chart.update();
  }
}

class TeamsChart extends BaseChart {
  constructor(issues, canvasId) {
    super(issues, canvasId);
    this.createTeamsBacklogChart(canvasId);
  }

  getStatusesCount() {
    const teamOpenCounts = {};
    const teamClosedCounts = {};
    const teamReports = [];

    this.data.forEach((issue) => {
      if (issue.team) {
        if (!this.isResolved(issue.status)) {
          teamOpenCounts[issue.team] = (teamOpenCounts[issue.team] || 0) + 1;
          if (issue.reports && parseInt(issue.reports) > 0) {
            teamReports[issue.team] = (teamReports[issue.team] || 0) + 1;
          }
        } else if (issue.status === "Закрыт") {
          teamClosedCounts[issue.team] = (teamClosedCounts[issue.team] || 0) + 1;
        }
      }
    });

    return { teamOpenCounts, teamClosedCounts, teamReports };
  }

  createTeamsBacklogChart(canvasId) {
    if (this.chart) {
      this.chart.destroy();
    }

    const { teamOpenCounts, teamClosedCounts, teamReports } = this.getStatusesCount();
    const teams = this.getUniqueTeams();

    // Подготовка данных для графика
    const sortedTeams = teams.sort((a, b) => (teamOpenCounts[b] || 0) - (teamOpenCounts[a] || 0));
    const openData = sortedTeams.map((team) => teamOpenCounts[team] || 0);
    const reportsData = sortedTeams.map((team) => teamReports[team] || 0);
    const closedData = sortedTeams.map((team) => teamClosedCounts[team] || 0);

    this.chart = new Chart(canvasId, {
      type: "bar",
      data: {
        labels: sortedTeams,
        datasets: [
          {
            label: "Открыто",
            data: openData,
            backgroundColor: "rgba(255, 99, 132, 0.8)"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Команды",
            font: {
              size: 16,
              weight: "bold"
            }
          },
          tooltip: {
            mode: "index",
            intersect: false
          },
          legend: {
            display: true,
            position: "bottom"
          }
        },
        indexAxis: "x",
        scales: {
          y: {
            title: {
              display: true,
              text: "Количество задач"
            },
            stacked: true
          },
          x: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: ""
            }
          }
        }
      }
    });

    // Добавляем обработчик клика отдельно
    this.chart.canvas.onclick = (e) => {
      const points = this.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
      
      if (points.length === 0) return;
      
      try {
        const firstPoint = points[0];
        const index = firstPoint.index;
        const team = sortedTeams[index];
        
        if (!team) return;
        
        // Dispatch team selection event
        const event = new CustomEvent('teamSelected', {
          detail: { team: team }
        });

        document.dispatchEvent(event);
    
        // Переключаем на backlog график
        const teamsChartCanvas = document.getElementById('teams-backlog-chart-canvas');
        const backlogChartCanvas = document.getElementById('backlog-chart-canvas');
        
        if (teamsChartCanvas && backlogChartCanvas) {
          teamsChartCanvas.style.display = 'none';
          backlogChartCanvas.style.display = 'block';
        }
      } catch (error) {
        console.error('Error handling chart click:', error);
      }
    };
  }
}

/**
 * Skipped minification because the original files appears to be already minified.
 * Original file: /npm/chart.js@4.4.6/dist/chart.umd.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/*!
 * Chart.js v4.4.6
 * https://www.chartjs.org
 * (c) 2024 Chart.js Contributors
 * Released under the MIT License
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Chart=e()}(this,(function(){"use strict";var t=Object.freeze({__proto__:null,get Colors(){return Go},get Decimation(){return Qo},get Filler(){return ma},get Legend(){return ya},get SubTitle(){return ka},get Title(){return Ma},get Tooltip(){return Ba}});function e(){}const i=(()=>{let t=0;return()=>t++})();function s(t){return null==t}function n(t){if(Array.isArray&&Array.isArray(t))return!0;const e=Object.prototype.toString.call(t);return"[object"===e.slice(0,7)&&"Array]"===e.slice(-6)}function o(t){return null!==t&&"[object Object]"===Object.prototype.toString.call(t)}function a(t){return("number"==typeof t||t instanceof Number)&&isFinite(+t)}function r(t,e){return a(t)?t:e}function l(t,e){return void 0===t?e:t}const h=(t,e)=>"string"==typeof t&&t.endsWith("%")?parseFloat(t)/100:+t/e,c=(t,e)=>"string"==typeof t&&t.endsWith("%")?parseFloat(t)/100*e:+t;function d(t,e,i){if(t&&"function"==typeof t.call)return t.apply(i,e)}function u(t,e,i,s){let a,r,l;if(n(t))if(r=t.length,s)for(a=r-1;a>=0;a--)e.call(i,t[a],a);else for(a=0;a<r;a++)e.call(i,t[a],a);else if(o(t))for(l=Object.keys(t),r=l.length,a=0;a<r;a++)e.call(i,t[l[a]],l[a])}function f(t,e){let i,s,n,o;if(!t||!e||t.length!==e.length)return!1;for(i=0,s=t.length;i<s;++i)if(n=t[i],o=e[i],n.datasetIndex!==o.datasetIndex||n.index!==o.index)return!1;return!0}function g(t){if(n(t))return t.map(g);if(o(t)){const e=Object.create(null),i=Object.keys(t),s=i.length;let n=0;for(;n<s;++n)e[i[n]]=g(t[i[n]]);return e}return t}function p(t){return-1===["__proto__","prototype","constructor"].indexOf(t)}function m(t,e,i,s){if(!p(t))return;const n=e[t],a=i[t];o(n)&&o(a)?b(n,a,s):e[t]=g(a)}function b(t,e,i){const s=n(e)?e:[e],a=s.length;if(!o(t))return t;const r=(i=i||{}).merger||m;let l;for(let e=0;e<a;++e){if(l=s[e],!o(l))continue;const n=Object.keys(l);for(let e=0,s=n.length;e<s;++e)r(n[e],t,l,i)}return t}function x(t,e){return b(t,e,{merger:_})}function _(t,e,i){if(!p(t))return;const s=e[t],n=i[t];o(s)&&o(n)?x(s,n):Object.prototype.hasOwnProperty.call(e,t)||(e[t]=g(n))}const y={"":t=>t,x:t=>t.x,y:t=>t.y};function v(t){const e=t.split("."),i=[];let s="";for(const t of e)s+=t,s.endsWith("\\")?s=s.slice(0,-1)+".":(i.push(s),s="");return i}function M(t,e){const i=y[e]||(y[e]=function(t){const e=v(t);return t=>{for(const i of e){if(""===i)break;t=t&&t[i]}return t}}(e));return i(t)}function w(t){return t.charAt(0).toUpperCase()+t.slice(1)}const k=t=>void 0!==t,S=t=>"function"==typeof t,P=(t,e)=>{if(t.size!==e.size)return!1;for(const i of t)if(!e.has(i))return!1;return!0};function D(t){return"mouseup"===t.type||"click"===t.type||"contextmenu"===t.type}const C=Math.PI,O=2*C,A=O+C,T=Number.POSITIVE_INFINITY,L=C/180,E=C/2,R=C/4,I=2*C/3,z=Math.log10,F=Math.sign;function V(t,e,i){return Math.abs(t-e)<i}function B(t){const e=Math.round(t);t=V(t,e,t/1e3)?e:t;const i=Math.pow(10,Math.floor(z(t))),s=t/i;return(s<=1?1:s<=2?2:s<=5?5:10)*i}function W(t){const e=[],i=Math.sqrt(t);let s;for(s=1;s<i;s++)t%s==0&&(e.push(s),e.push(t/s));return i===(0|i)&&e.push(i),e.sort(((t,e)=>t-e)).pop(),e}function N(t){return!isNaN(parseFloat(t))&&isFinite(t)}function H(t,e){const i=Math.round(t);return i-e<=t&&i+e>=t}function j(t,e,i){let s,n,o;for(s=0,n=t.length;s<n;s++)o=t[s][i],isNaN(o)||(e.min=Math.min(e.min,o),e.max=Math.max(e.max,o))}function $(t){return t*(C/180)}function Y(t){return t*(180/C)}function U(t){if(!a(t))return;let e=1,i=0;for(;Math.round(t*e)/e!==t;)e*=10,i++;return i}function X(t,e){const i=e.x-t.x,s=e.y-t.y,n=Math.sqrt(i*i+s*s);let o=Math.atan2(s,i);return o<-.5*C&&(o+=O),{angle:o,distance:n}}function q(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function K(t,e){return(t-e+A)%O-C}function G(t){return(t%O+O)%O}function Z(t,e,i,s){const n=G(t),o=G(e),a=G(i),r=G(o-n),l=G(a-n),h=G(n-o),c=G(n-a);return n===o||n===a||s&&o===a||r>l&&h<c}function J(t,e,i){return Math.max(e,Math.min(i,t))}function Q(t){return J(t,-32768,32767)}function tt(t,e,i,s=1e-6){return t>=Math.min(e,i)-s&&t<=Math.max(e,i)+s}function et(t,e,i){i=i||(i=>t[i]<e);let s,n=t.length-1,o=0;for(;n-o>1;)s=o+n>>1,i(s)?o=s:n=s;return{lo:o,hi:n}}const it=(t,e,i,s)=>et(t,i,s?s=>{const n=t[s][e];return n<i||n===i&&t[s+1][e]===i}:s=>t[s][e]<i),st=(t,e,i)=>et(t,i,(s=>t[s][e]>=i));function nt(t,e,i){let s=0,n=t.length;for(;s<n&&t[s]<e;)s++;for(;n>s&&t[n-1]>i;)n--;return s>0||n<t.length?t.slice(s,n):t}const ot=["push","pop","shift","splice","unshift"];function at(t,e){t._chartjs?t._chartjs.listeners.push(e):(Object.defineProperty(t,"_chartjs",{configurable:!0,enumerable:!1,value:{listeners:[e]}}),ot.forEach((e=>{const i="_onData"+w(e),s=t[e];Object.defineProperty(t,e,{configurable:!0,enumerable:!1,value(...e){const n=s.apply(this,e);return t._chartjs.listeners.forEach((t=>{"function"==typeof t[i]&&t[i](...e)})),n}})})))}function rt(t,e){const i=t._chartjs;if(!i)return;const s=i.listeners,n=s.indexOf(e);-1!==n&&s.splice(n,1),s.length>0||(ot.forEach((e=>{delete t[e]})),delete t._chartjs)}function lt(t){const e=new Set(t);return e.size===t.length?t:Array.from(e)}const ht="undefined"==typeof window?function(t){return t()}:window.requestAnimationFrame;function ct(t,e){let i=[],s=!1;return function(...n){i=n,s||(s=!0,ht.call(window,(()=>{s=!1,t.apply(e,i)})))}}function dt(t,e){let i;return function(...s){return e?(clearTimeout(i),i=setTimeout(t,e,s)):t.apply(this,s),e}}const ut=t=>"start"===t?"left":"end"===t?"right":"center",ft=(t,e,i)=>"start"===t?e:"end"===t?i:(e+i)/2,gt=(t,e,i,s)=>t===(s?"left":"right")?i:"center"===t?(e+i)/2:e;function pt(t,e,i){const s=e.length;let n=0,o=s;if(t._sorted){const{iScale:a,_parsed:r}=t,l=a.axis,{min:h,max:c,minDefined:d,maxDefined:u}=a.getUserBounds();d&&(n=J(Math.min(it(r,l,h).lo,i?s:it(e,l,a.getPixelForValue(h)).lo),0,s-1)),o=u?J(Math.max(it(r,a.axis,c,!0).hi+1,i?0:it(e,l,a.getPixelForValue(c),!0).hi+1),n,s)-n:s-n}return{start:n,count:o}}function mt(t){const{xScale:e,yScale:i,_scaleRanges:s}=t,n={xmin:e.min,xmax:e.max,ymin:i.min,ymax:i.max};if(!s)return t._scaleRanges=n,!0;const o=s.xmin!==e.min||s.xmax!==e.max||s.ymin!==i.min||s.ymax!==i.max;return Object.assign(s,n),o}class bt{constructor(){this._request=null,this._charts=new Map,this._running=!1,this._lastDate=void 0}_notify(t,e,i,s){const n=e.listeners[s],o=e.duration;n.forEach((s=>s({chart:t,initial:e.initial,numSteps:o,currentStep:Math.min(i-e.start,o)})))}_refresh(){this._request||(this._running=!0,this._request=ht.call(window,(()=>{this._update(),this._request=null,this._running&&this._refresh()})))}_update(t=Date.now()){let e=0;this._charts.forEach(((i,s)=>{if(!i.running||!i.items.length)return;const n=i.items;let o,a=n.length-1,r=!1;for(;a>=0;--a)o=n[a],o._active?(o._total>i.duration&&(i.duration=o._total),o.tick(t),r=!0):(n[a]=n[n.length-1],n.pop());r&&(s.draw(),this._notify(s,i,t,"progress")),n.length||(i.running=!1,this._notify(s,i,t,"complete"),i.initial=!1),e+=n.length})),this._lastDate=t,0===e&&(this._running=!1)}_getAnims(t){const e=this._charts;let i=e.get(t);return i||(i={running:!1,initial:!0,items:[],listeners:{complete:[],progress:[]}},e.set(t,i)),i}listen(t,e,i){this._getAnims(t).listeners[e].push(i)}add(t,e){e&&e.length&&this._getAnims(t).items.push(...e)}has(t){return this._getAnims(t).items.length>0}start(t){const e=this._charts.get(t);e&&(e.running=!0,e.start=Date.now(),e.duration=e.items.reduce(((t,e)=>Math.max(t,e._duration)),0),this._refresh())}running(t){if(!this._running)return!1;const e=this._charts.get(t);return!!(e&&e.running&&e.items.length)}stop(t){const e=this._charts.get(t);if(!e||!e.items.length)return;const i=e.items;let s=i.length-1;for(;s>=0;--s)i[s].cancel();e.items=[],this._notify(t,e,Date.now(),"complete")}remove(t){return this._charts.delete(t)}}var xt=new bt;
/*!
 * @kurkle/color v0.3.2
 * https://github.com/kurkle/color#readme
 * (c) 2023 Jukka Kurkela
 * Released under the MIT License
 */function _t(t){return t+.5|0}const yt=(t,e,i)=>Math.max(Math.min(t,i),e);function vt(t){return yt(_t(2.55*t),0,255)}function Mt(t){return yt(_t(255*t),0,255)}function wt(t){return yt(_t(t/2.55)/100,0,1)}function kt(t){return yt(_t(100*t),0,100)}const St={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,A:10,B:11,C:12,D:13,E:14,F:15,a:10,b:11,c:12,d:13,e:14,f:15},Pt=[..."0123456789ABCDEF"],Dt=t=>Pt[15&t],Ct=t=>Pt[(240&t)>>4]+Pt[15&t],Ot=t=>(240&t)>>4==(15&t);function At(t){var e=(t=>Ot(t.r)&&Ot(t.g)&&Ot(t.b)&&Ot(t.a))(t)?Dt:Ct;return t?"#"+e(t.r)+e(t.g)+e(t.b)+((t,e)=>t<255?e(t):"")(t.a,e):void 0}const Tt=/^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;function Lt(t,e,i){const s=e*Math.min(i,1-i),n=(e,n=(e+t/30)%12)=>i-s*Math.max(Math.min(n-3,9-n,1),-1);return[n(0),n(8),n(4)]}function Et(t,e,i){const s=(s,n=(s+t/60)%6)=>i-i*e*Math.max(Math.min(n,4-n,1),0);return[s(5),s(3),s(1)]}function Rt(t,e,i){const s=Lt(t,1,.5);let n;for(e+i>1&&(n=1/(e+i),e*=n,i*=n),n=0;n<3;n++)s[n]*=1-e-i,s[n]+=e;return s}function It(t){const e=t.r/255,i=t.g/255,s=t.b/255,n=Math.max(e,i,s),o=Math.min(e,i,s),a=(n+o)/2;let r,l,h;return n!==o&&(h=n-o,l=a>.5?h/(2-n-o):h/(n+o),r=function(t,e,i,s,n){return t===n?(e-i)/s+(e<i?6:0):e===n?(i-t)/s+2:(t-e)/s+4}(e,i,s,h,n),r=60*r+.5),[0|r,l||0,a]}function zt(t,e,i,s){return(Array.isArray(e)?t(e[0],e[1],e[2]):t(e,i,s)).map(Mt)}function Ft(t,e,i){return zt(Lt,t,e,i)}function Vt(t){return(t%360+360)%360}function Bt(t){const e=Tt.exec(t);let i,s=255;if(!e)return;e[5]!==i&&(s=e[6]?vt(+e[5]):Mt(+e[5]));const n=Vt(+e[2]),o=+e[3]/100,a=+e[4]/100;return i="hwb"===e[1]?function(t,e,i){return zt(Rt,t,e,i)}(n,o,a):"hsv"===e[1]?function(t,e,i){return zt(Et,t,e,i)}(n,o,a):Ft(n,o,a),{r:i[0],g:i[1],b:i[2],a:s}}const Wt={x:"dark",Z:"light",Y:"re",X:"blu",W:"gr",V:"medium",U:"slate",A:"ee",T:"ol",S:"or",B:"ra",C:"lateg",D:"ights",R:"in",Q:"turquois",E:"hi",P:"ro",O:"al",N:"le",M:"de",L:"yello",F:"en",K:"ch",G:"arks",H:"ea",I:"ightg",J:"wh"},Nt={OiceXe:"f0f8ff",antiquewEte:"faebd7",aqua:"ffff",aquamarRe:"7fffd4",azuY:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"0",blanKedOmond:"ffebcd",Xe:"ff",XeviTet:"8a2be2",bPwn:"a52a2a",burlywood:"deb887",caMtXe:"5f9ea0",KartYuse:"7fff00",KocTate:"d2691e",cSO:"ff7f50",cSnflowerXe:"6495ed",cSnsilk:"fff8dc",crimson:"dc143c",cyan:"ffff",xXe:"8b",xcyan:"8b8b",xgTMnPd:"b8860b",xWay:"a9a9a9",xgYF:"6400",xgYy:"a9a9a9",xkhaki:"bdb76b",xmagFta:"8b008b",xTivegYF:"556b2f",xSange:"ff8c00",xScEd:"9932cc",xYd:"8b0000",xsOmon:"e9967a",xsHgYF:"8fbc8f",xUXe:"483d8b",xUWay:"2f4f4f",xUgYy:"2f4f4f",xQe:"ced1",xviTet:"9400d3",dAppRk:"ff1493",dApskyXe:"bfff",dimWay:"696969",dimgYy:"696969",dodgerXe:"1e90ff",fiYbrick:"b22222",flSOwEte:"fffaf0",foYstWAn:"228b22",fuKsia:"ff00ff",gaRsbSo:"dcdcdc",ghostwEte:"f8f8ff",gTd:"ffd700",gTMnPd:"daa520",Way:"808080",gYF:"8000",gYFLw:"adff2f",gYy:"808080",honeyMw:"f0fff0",hotpRk:"ff69b4",RdianYd:"cd5c5c",Rdigo:"4b0082",ivSy:"fffff0",khaki:"f0e68c",lavFMr:"e6e6fa",lavFMrXsh:"fff0f5",lawngYF:"7cfc00",NmoncEffon:"fffacd",ZXe:"add8e6",ZcSO:"f08080",Zcyan:"e0ffff",ZgTMnPdLw:"fafad2",ZWay:"d3d3d3",ZgYF:"90ee90",ZgYy:"d3d3d3",ZpRk:"ffb6c1",ZsOmon:"ffa07a",ZsHgYF:"20b2aa",ZskyXe:"87cefa",ZUWay:"778899",ZUgYy:"778899",ZstAlXe:"b0c4de",ZLw:"ffffe0",lime:"ff00",limegYF:"32cd32",lRF:"faf0e6",magFta:"ff00ff",maPon:"800000",VaquamarRe:"66cdaa",VXe:"cd",VScEd:"ba55d3",VpurpN:"9370db",VsHgYF:"3cb371",VUXe:"7b68ee",VsprRggYF:"fa9a",VQe:"48d1cc",VviTetYd:"c71585",midnightXe:"191970",mRtcYam:"f5fffa",mistyPse:"ffe4e1",moccasR:"ffe4b5",navajowEte:"ffdead",navy:"80",Tdlace:"fdf5e6",Tive:"808000",TivedBb:"6b8e23",Sange:"ffa500",SangeYd:"ff4500",ScEd:"da70d6",pOegTMnPd:"eee8aa",pOegYF:"98fb98",pOeQe:"afeeee",pOeviTetYd:"db7093",papayawEp:"ffefd5",pHKpuff:"ffdab9",peru:"cd853f",pRk:"ffc0cb",plum:"dda0dd",powMrXe:"b0e0e6",purpN:"800080",YbeccapurpN:"663399",Yd:"ff0000",Psybrown:"bc8f8f",PyOXe:"4169e1",saddNbPwn:"8b4513",sOmon:"fa8072",sandybPwn:"f4a460",sHgYF:"2e8b57",sHshell:"fff5ee",siFna:"a0522d",silver:"c0c0c0",skyXe:"87ceeb",UXe:"6a5acd",UWay:"708090",UgYy:"708090",snow:"fffafa",sprRggYF:"ff7f",stAlXe:"4682b4",tan:"d2b48c",teO:"8080",tEstN:"d8bfd8",tomato:"ff6347",Qe:"40e0d0",viTet:"ee82ee",JHt:"f5deb3",wEte:"ffffff",wEtesmoke:"f5f5f5",Lw:"ffff00",LwgYF:"9acd32"};let Ht;function jt(t){Ht||(Ht=function(){const t={},e=Object.keys(Nt),i=Object.keys(Wt);let s,n,o,a,r;for(s=0;s<e.length;s++){for(a=r=e[s],n=0;n<i.length;n++)o=i[n],r=r.replace(o,Wt[o]);o=parseInt(Nt[a],16),t[r]=[o>>16&255,o>>8&255,255&o]}return t}(),Ht.transparent=[0,0,0,0]);const e=Ht[t.toLowerCase()];return e&&{r:e[0],g:e[1],b:e[2],a:4===e.length?e[3]:255}}const $t=/^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;const Yt=t=>t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055,Ut=t=>t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4);function Xt(t,e,i){if(t){let s=It(t);s[e]=Math.max(0,Math.min(s[e]+s[e]*i,0===e?360:1)),s=Ft(s),t.r=s[0],t.g=s[1],t.b=s[2]}}function qt(t,e){return t?Object.assign(e||{},t):t}function Kt(t){var e={r:0,g:0,b:0,a:255};return Array.isArray(t)?t.length>=3&&(e={r:t[0],g:t[1],b:t[2],a:255},t.length>3&&(e.a=Mt(t[3]))):(e=qt(t,{r:0,g:0,b:0,a:1})).a=Mt(e.a),e}function Gt(t){return"r"===t.charAt(0)?function(t){const e=$t.exec(t);let i,s,n,o=255;if(e){if(e[7]!==i){const t=+e[7];o=e[8]?vt(t):yt(255*t,0,255)}return i=+e[1],s=+e[3],n=+e[5],i=255&(e[2]?vt(i):yt(i,0,255)),s=255&(e[4]?vt(s):yt(s,0,255)),n=255&(e[6]?vt(n):yt(n,0,255)),{r:i,g:s,b:n,a:o}}}(t):Bt(t)}class Zt{constructor(t){if(t instanceof Zt)return t;const e=typeof t;let i;var s,n,o;"object"===e?i=Kt(t):"string"===e&&(o=(s=t).length,"#"===s[0]&&(4===o||5===o?n={r:255&17*St[s[1]],g:255&17*St[s[2]],b:255&17*St[s[3]],a:5===o?17*St[s[4]]:255}:7!==o&&9!==o||(n={r:St[s[1]]<<4|St[s[2]],g:St[s[3]]<<4|St[s[4]],b:St[s[5]]<<4|St[s[6]],a:9===o?St[s[7]]<<4|St[s[8]]:255})),i=n||jt(t)||Gt(t)),this._rgb=i,this._valid=!!i}get valid(){return this._valid}get rgb(){var t=qt(this._rgb);return t&&(t.a=wt(t.a)),t}set rgb(t){this._rgb=Kt(t)}rgbString(){return this._valid?(t=this._rgb)&&(t.a<255?`rgba(${t.r}, ${t.g}, ${t.b}, ${wt(t.a)})`:`rgb(${t.r}, ${t.g}, ${t.b})`):void 0;var t}hexString(){return this._valid?At(this._rgb):void 0}hslString(){return this._valid?function(t){if(!t)return;const e=It(t),i=e[0],s=kt(e[1]),n=kt(e[2]);return t.a<255?`hsla(${i}, ${s}%, ${n}%, ${wt(t.a)})`:`hsl(${i}, ${s}%, ${n}%)`}(this._rgb):void 0}mix(t,e){if(t){const i=this.rgb,s=t.rgb;let n;const o=e===n?.5:e,a=2*o-1,r=i.a-s.a,l=((a*r==-1?a:(a+r)/(1+a*r))+1)/2;n=1-l,i.r=255&l*i.r+n*s.r+.5,i.g=255&l*i.g+n*s.g+.5,i.b=255&l*i.b+n*s.b+.5,i.a=o*i.a+(1-o)*s.a,this.rgb=i}return this}interpolate(t,e){return t&&(this._rgb=function(t,e,i){const s=Ut(wt(t.r)),n=Ut(wt(t.g)),o=Ut(wt(t.b));return{r:Mt(Yt(s+i*(Ut(wt(e.r))-s))),g:Mt(Yt(n+i*(Ut(wt(e.g))-n))),b:Mt(Yt(o+i*(Ut(wt(e.b))-o))),a:t.a+i*(e.a-t.a)}}(this._rgb,t._rgb,e)),this}clone(){return new Zt(this.rgb)}alpha(t){return this._rgb.a=Mt(t),this}clearer(t){return this._rgb.a*=1-t,this}greyscale(){const t=this._rgb,e=_t(.3*t.r+.59*t.g+.11*t.b);return t.r=t.g=t.b=e,this}opaquer(t){return this._rgb.a*=1+t,this}negate(){const t=this._rgb;return t.r=255-t.r,t.g=255-t.g,t.b=255-t.b,this}lighten(t){return Xt(this._rgb,2,t),this}darken(t){return Xt(this._rgb,2,-t),this}saturate(t){return Xt(this._rgb,1,t),this}desaturate(t){return Xt(this._rgb,1,-t),this}rotate(t){return function(t,e){var i=It(t);i[0]=Vt(i[0]+e),i=Ft(i),t.r=i[0],t.g=i[1],t.b=i[2]}(this._rgb,t),this}}function Jt(t){if(t&&"object"==typeof t){const e=t.toString();return"[object CanvasPattern]"===e||"[object CanvasGradient]"===e}return!1}function Qt(t){return Jt(t)?t:new Zt(t)}function te(t){return Jt(t)?t:new Zt(t).saturate(.5).darken(.1).hexString()}const ee=["x","y","borderWidth","radius","tension"],ie=["color","borderColor","backgroundColor"];const se=new Map;function ne(t,e,i){return function(t,e){e=e||{};const i=t+JSON.stringify(e);let s=se.get(i);return s||(s=new Intl.NumberFormat(t,e),se.set(i,s)),s}(e,i).format(t)}const oe={values:t=>n(t)?t:""+t,numeric(t,e,i){if(0===t)return"0";const s=this.chart.options.locale;let n,o=t;if(i.length>1){const e=Math.max(Math.abs(i[0].value),Math.abs(i[i.length-1].value));(e<1e-4||e>1e15)&&(n="scientific"),o=function(t,e){let i=e.length>3?e[2].value-e[1].value:e[1].value-e[0].value;Math.abs(i)>=1&&t!==Math.floor(t)&&(i=t-Math.floor(t));return i}(t,i)}const a=z(Math.abs(o)),r=isNaN(a)?1:Math.max(Math.min(-1*Math.floor(a),20),0),l={notation:n,minimumFractionDigits:r,maximumFractionDigits:r};return Object.assign(l,this.options.ticks.format),ne(t,s,l)},logarithmic(t,e,i){if(0===t)return"0";const s=i[e].significand||t/Math.pow(10,Math.floor(z(t)));return[1,2,3,5,10,15].includes(s)||e>.8*i.length?oe.numeric.call(this,t,e,i):""}};var ae={formatters:oe};const re=Object.create(null),le=Object.create(null);function he(t,e){if(!e)return t;const i=e.split(".");for(let e=0,s=i.length;e<s;++e){const s=i[e];t=t[s]||(t[s]=Object.create(null))}return t}function ce(t,e,i){return"string"==typeof e?b(he(t,e),i):b(he(t,""),e)}class de{constructor(t,e){this.animation=void 0,this.backgroundColor="rgba(0,0,0,0.1)",this.borderColor="rgba(0,0,0,0.1)",this.color="#666",this.datasets={},this.devicePixelRatio=t=>t.chart.platform.getDevicePixelRatio(),this.elements={},this.events=["mousemove","mouseout","click","touchstart","touchmove"],this.font={family:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",size:12,style:"normal",lineHeight:1.2,weight:null},this.hover={},this.hoverBackgroundColor=(t,e)=>te(e.backgroundColor),this.hoverBorderColor=(t,e)=>te(e.borderColor),this.hoverColor=(t,e)=>te(e.color),this.indexAxis="x",this.interaction={mode:"nearest",intersect:!0,includeInvisible:!1},this.maintainAspectRatio=!0,this.onHover=null,this.onClick=null,this.parsing=!0,this.plugins={},this.responsive=!0,this.scale=void 0,this.scales={},this.showLine=!0,this.drawActiveElementsOnTop=!0,this.describe(t),this.apply(e)}set(t,e){return ce(this,t,e)}get(t){return he(this,t)}describe(t,e){return ce(le,t,e)}override(t,e){return ce(re,t,e)}route(t,e,i,s){const n=he(this,t),a=he(this,i),r="_"+e;Object.defineProperties(n,{[r]:{value:n[e],writable:!0},[e]:{enumerable:!0,get(){const t=this[r],e=a[s];return o(t)?Object.assign({},e,t):l(t,e)},set(t){this[r]=t}}})}apply(t){t.forEach((t=>t(this)))}}var ue=new de({_scriptable:t=>!t.startsWith("on"),_indexable:t=>"events"!==t,hover:{_fallback:"interaction"},interaction:{_scriptable:!1,_indexable:!1}},[function(t){t.set("animation",{delay:void 0,duration:1e3,easing:"easeOutQuart",fn:void 0,from:void 0,loop:void 0,to:void 0,type:void 0}),t.describe("animation",{_fallback:!1,_indexable:!1,_scriptable:t=>"onProgress"!==t&&"onComplete"!==t&&"fn"!==t}),t.set("animations",{colors:{type:"color",properties:ie},numbers:{type:"number",properties:ee}}),t.describe("animations",{_fallback:"animation"}),t.set("transitions",{active:{animation:{duration:400}},resize:{animation:{duration:0}},show:{animations:{colors:{from:"transparent"},visible:{type:"boolean",duration:0}}},hide:{animations:{colors:{to:"transparent"},visible:{type:"boolean",easing:"linear",fn:t=>0|t}}}})},function(t){t.set("layout",{autoPadding:!0,padding:{top:0,right:0,bottom:0,left:0}})},function(t){t.set("scale",{display:!0,offset:!1,reverse:!1,beginAtZero:!1,bounds:"ticks",clip:!0,grace:0,grid:{display:!0,lineWidth:1,drawOnChartArea:!0,drawTicks:!0,tickLength:8,tickWidth:(t,e)=>e.lineWidth,tickColor:(t,e)=>e.color,offset:!1},border:{display:!0,dash:[],dashOffset:0,width:1},title:{display:!1,text:"",padding:{top:4,bottom:4}},ticks:{minRotation:0,maxRotation:50,mirror:!1,textStrokeWidth:0,textStrokeColor:"",padding:3,display:!0,autoSkip:!0,autoSkipPadding:3,labelOffset:0,callback:ae.formatters.values,minor:{},major:{},align:"center",crossAlign:"near",showLabelBackdrop:!1,backdropColor:"rgba(255, 255, 255, 0.75)",backdropPadding:2}}),t.route("scale.ticks","color","","color"),t.route("scale.grid","color","","borderColor"),t.route("scale.border","color","","borderColor"),t.route("scale.title","color","","color"),t.describe("scale",{_fallback:!1,_scriptable:t=>!t.startsWith("before")&&!t.startsWith("after")&&"callback"!==t&&"parser"!==t,_indexable:t=>"borderDash"!==t&&"tickBorderDash"!==t&&"dash"!==t}),t.describe("scales",{_fallback:"scale"}),t.describe("scale.ticks",{_scriptable:t=>"backdropPadding"!==t&&"callback"!==t,_indexable:t=>"backdropPadding"!==t})}]);function fe(){return"undefined"!=typeof window&&"undefined"!=typeof document}function ge(t){let e=t.parentNode;return e&&"[object ShadowRoot]"===e.toString()&&(e=e.host),e}function pe(t,e,i){let s;return"string"==typeof t?(s=parseInt(t,10),-1!==t.indexOf("%")&&(s=s/100*e.parentNode[i])):s=t,s}const me=t=>t.ownerDocument.defaultView.getComputedStyle(t,null);function be(t,e){return me(t).getPropertyValue(e)}const xe=["top","right","bottom","left"];function _e(t,e,i){const s={};i=i?"-"+i:"";for(let n=0;n<4;n++){const o=xe[n];s[o]=parseFloat(t[e+"-"+o+i])||0}return s.width=s.left+s.right,s.height=s.top+s.bottom,s}const ye=(t,e,i)=>(t>0||e>0)&&(!i||!i.shadowRoot);function ve(t,e){if("native"in t)return t;const{canvas:i,currentDevicePixelRatio:s}=e,n=me(i),o="border-box"===n.boxSizing,a=_e(n,"padding"),r=_e(n,"border","width"),{x:l,y:h,box:c}=function(t,e){const i=t.touches,s=i&&i.length?i[0]:t,{offsetX:n,offsetY:o}=s;let a,r,l=!1;if(ye(n,o,t.target))a=n,r=o;else{const t=e.getBoundingClientRect();a=s.clientX-t.left,r=s.clientY-t.top,l=!0}return{x:a,y:r,box:l}}(t,i),d=a.left+(c&&r.left),u=a.top+(c&&r.top);let{width:f,height:g}=e;return o&&(f-=a.width+r.width,g-=a.height+r.height),{x:Math.round((l-d)/f*i.width/s),y:Math.round((h-u)/g*i.height/s)}}const Me=t=>Math.round(10*t)/10;function we(t,e,i,s){const n=me(t),o=_e(n,"margin"),a=pe(n.maxWidth,t,"clientWidth")||T,r=pe(n.maxHeight,t,"clientHeight")||T,l=function(t,e,i){let s,n;if(void 0===e||void 0===i){const o=t&&ge(t);if(o){const t=o.getBoundingClientRect(),a=me(o),r=_e(a,"border","width"),l=_e(a,"padding");e=t.width-l.width-r.width,i=t.height-l.height-r.height,s=pe(a.maxWidth,o,"clientWidth"),n=pe(a.maxHeight,o,"clientHeight")}else e=t.clientWidth,i=t.clientHeight}return{width:e,height:i,maxWidth:s||T,maxHeight:n||T}}(t,e,i);let{width:h,height:c}=l;if("content-box"===n.boxSizing){const t=_e(n,"border","width"),e=_e(n,"padding");h-=e.width+t.width,c-=e.height+t.height}h=Math.max(0,h-o.width),c=Math.max(0,s?h/s:c-o.height),h=Me(Math.min(h,a,l.maxWidth)),c=Me(Math.min(c,r,l.maxHeight)),h&&!c&&(c=Me(h/2));return(void 0!==e||void 0!==i)&&s&&l.height&&c>l.height&&(c=l.height,h=Me(Math.floor(c*s))),{width:h,height:c}}function ke(t,e,i){const s=e||1,n=Math.floor(t.height*s),o=Math.floor(t.width*s);t.height=Math.floor(t.height),t.width=Math.floor(t.width);const a=t.canvas;return a.style&&(i||!a.style.height&&!a.style.width)&&(a.style.height=`${t.height}px`,a.style.width=`${t.width}px`),(t.currentDevicePixelRatio!==s||a.height!==n||a.width!==o)&&(t.currentDevicePixelRatio=s,a.height=n,a.width=o,t.ctx.setTransform(s,0,0,s,0,0),!0)}const Se=function(){let t=!1;try{const e={get passive(){return t=!0,!1}};fe()&&(window.addEventListener("test",null,e),window.removeEventListener("test",null,e))}catch(t){}return t}();function Pe(t,e){const i=be(t,e),s=i&&i.match(/^(\d+)(\.\d+)?px$/);return s?+s[1]:void 0}function De(t){return!t||s(t.size)||s(t.family)?null:(t.style?t.style+" ":"")+(t.weight?t.weight+" ":"")+t.size+"px "+t.family}function Ce(t,e,i,s,n){let o=e[n];return o||(o=e[n]=t.measureText(n).width,i.push(n)),o>s&&(s=o),s}function Oe(t,e,i,s){let o=(s=s||{}).data=s.data||{},a=s.garbageCollect=s.garbageCollect||[];s.font!==e&&(o=s.data={},a=s.garbageCollect=[],s.font=e),t.save(),t.font=e;let r=0;const l=i.length;let h,c,d,u,f;for(h=0;h<l;h++)if(u=i[h],null==u||n(u)){if(n(u))for(c=0,d=u.length;c<d;c++)f=u[c],null==f||n(f)||(r=Ce(t,o,a,r,f))}else r=Ce(t,o,a,r,u);t.restore();const g=a.length/2;if(g>i.length){for(h=0;h<g;h++)delete o[a[h]];a.splice(0,g)}return r}function Ae(t,e,i){const s=t.currentDevicePixelRatio,n=0!==i?Math.max(i/2,.5):0;return Math.round((e-n)*s)/s+n}function Te(t,e){(e||t)&&((e=e||t.getContext("2d")).save(),e.resetTransform(),e.clearRect(0,0,t.width,t.height),e.restore())}function Le(t,e,i,s){Ee(t,e,i,s,null)}function Ee(t,e,i,s,n){let o,a,r,l,h,c,d,u;const f=e.pointStyle,g=e.rotation,p=e.radius;let m=(g||0)*L;if(f&&"object"==typeof f&&(o=f.toString(),"[object HTMLImageElement]"===o||"[object HTMLCanvasElement]"===o))return t.save(),t.translate(i,s),t.rotate(m),t.drawImage(f,-f.width/2,-f.height/2,f.width,f.height),void t.restore();if(!(isNaN(p)||p<=0)){switch(t.beginPath(),f){default:n?t.ellipse(i,s,n/2,p,0,0,O):t.arc(i,s,p,0,O),t.closePath();break;case"triangle":c=n?n/2:p,t.moveTo(i+Math.sin(m)*c,s-Math.cos(m)*p),m+=I,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*p),m+=I,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*p),t.closePath();break;case"rectRounded":h=.516*p,l=p-h,a=Math.cos(m+R)*l,d=Math.cos(m+R)*(n?n/2-h:l),r=Math.sin(m+R)*l,u=Math.sin(m+R)*(n?n/2-h:l),t.arc(i-d,s-r,h,m-C,m-E),t.arc(i+u,s-a,h,m-E,m),t.arc(i+d,s+r,h,m,m+E),t.arc(i-u,s+a,h,m+E,m+C),t.closePath();break;case"rect":if(!g){l=Math.SQRT1_2*p,c=n?n/2:l,t.rect(i-c,s-l,2*c,2*l);break}m+=R;case"rectRot":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+u,s-a),t.lineTo(i+d,s+r),t.lineTo(i-u,s+a),t.closePath();break;case"crossRot":m+=R;case"cross":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case"star":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a),m+=R,d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case"line":a=n?n/2:Math.cos(m)*p,r=Math.sin(m)*p,t.moveTo(i-a,s-r),t.lineTo(i+a,s+r);break;case"dash":t.moveTo(i,s),t.lineTo(i+Math.cos(m)*(n?n/2:p),s+Math.sin(m)*p);break;case!1:t.closePath()}t.fill(),e.borderWidth>0&&t.stroke()}}function Re(t,e,i){return i=i||.5,!e||t&&t.x>e.left-i&&t.x<e.right+i&&t.y>e.top-i&&t.y<e.bottom+i}function Ie(t,e){t.save(),t.beginPath(),t.rect(e.left,e.top,e.right-e.left,e.bottom-e.top),t.clip()}function ze(t){t.restore()}function Fe(t,e,i,s,n){if(!e)return t.lineTo(i.x,i.y);if("middle"===n){const s=(e.x+i.x)/2;t.lineTo(s,e.y),t.lineTo(s,i.y)}else"after"===n!=!!s?t.lineTo(e.x,i.y):t.lineTo(i.x,e.y);t.lineTo(i.x,i.y)}function Ve(t,e,i,s){if(!e)return t.lineTo(i.x,i.y);t.bezierCurveTo(s?e.cp1x:e.cp2x,s?e.cp1y:e.cp2y,s?i.cp2x:i.cp1x,s?i.cp2y:i.cp1y,i.x,i.y)}function Be(t,e,i,s,n){if(n.strikethrough||n.underline){const o=t.measureText(s),a=e-o.actualBoundingBoxLeft,r=e+o.actualBoundingBoxRight,l=i-o.actualBoundingBoxAscent,h=i+o.actualBoundingBoxDescent,c=n.strikethrough?(l+h)/2:h;t.strokeStyle=t.fillStyle,t.beginPath(),t.lineWidth=n.decorationWidth||2,t.moveTo(a,c),t.lineTo(r,c),t.stroke()}}function We(t,e){const i=t.fillStyle;t.fillStyle=e.color,t.fillRect(e.left,e.top,e.width,e.height),t.fillStyle=i}function Ne(t,e,i,o,a,r={}){const l=n(e)?e:[e],h=r.strokeWidth>0&&""!==r.strokeColor;let c,d;for(t.save(),t.font=a.string,function(t,e){e.translation&&t.translate(e.translation[0],e.translation[1]),s(e.rotation)||t.rotate(e.rotation),e.color&&(t.fillStyle=e.color),e.textAlign&&(t.textAlign=e.textAlign),e.textBaseline&&(t.textBaseline=e.textBaseline)}(t,r),c=0;c<l.length;++c)d=l[c],r.backdrop&&We(t,r.backdrop),h&&(r.strokeColor&&(t.strokeStyle=r.strokeColor),s(r.strokeWidth)||(t.lineWidth=r.strokeWidth),t.strokeText(d,i,o,r.maxWidth)),t.fillText(d,i,o,r.maxWidth),Be(t,i,o,d,r),o+=Number(a.lineHeight);t.restore()}function He(t,e){const{x:i,y:s,w:n,h:o,radius:a}=e;t.arc(i+a.topLeft,s+a.topLeft,a.topLeft,1.5*C,C,!0),t.lineTo(i,s+o-a.bottomLeft),t.arc(i+a.bottomLeft,s+o-a.bottomLeft,a.bottomLeft,C,E,!0),t.lineTo(i+n-a.bottomRight,s+o),t.arc(i+n-a.bottomRight,s+o-a.bottomRight,a.bottomRight,E,0,!0),t.lineTo(i+n,s+a.topRight),t.arc(i+n-a.topRight,s+a.topRight,a.topRight,0,-E,!0),t.lineTo(i+a.topLeft,s)}function je(t,e=[""],i,s,n=(()=>t[0])){const o=i||t;void 0===s&&(s=ti("_fallback",t));const a={[Symbol.toStringTag]:"Object",_cacheable:!0,_scopes:t,_rootScopes:o,_fallback:s,_getTarget:n,override:i=>je([i,...t],e,o,s)};return new Proxy(a,{deleteProperty:(e,i)=>(delete e[i],delete e._keys,delete t[0][i],!0),get:(i,s)=>qe(i,s,(()=>function(t,e,i,s){let n;for(const o of e)if(n=ti(Ue(o,t),i),void 0!==n)return Xe(t,n)?Je(i,s,t,n):n}(s,e,t,i))),getOwnPropertyDescriptor:(t,e)=>Reflect.getOwnPropertyDescriptor(t._scopes[0],e),getPrototypeOf:()=>Reflect.getPrototypeOf(t[0]),has:(t,e)=>ei(t).includes(e),ownKeys:t=>ei(t),set(t,e,i){const s=t._storage||(t._storage=n());return t[e]=s[e]=i,delete t._keys,!0}})}function $e(t,e,i,s){const a={_cacheable:!1,_proxy:t,_context:e,_subProxy:i,_stack:new Set,_descriptors:Ye(t,s),setContext:e=>$e(t,e,i,s),override:n=>$e(t.override(n),e,i,s)};return new Proxy(a,{deleteProperty:(e,i)=>(delete e[i],delete t[i],!0),get:(t,e,i)=>qe(t,e,(()=>function(t,e,i){const{_proxy:s,_context:a,_subProxy:r,_descriptors:l}=t;let h=s[e];S(h)&&l.isScriptable(e)&&(h=function(t,e,i,s){const{_proxy:n,_context:o,_subProxy:a,_stack:r}=i;if(r.has(t))throw new Error("Recursion detected: "+Array.from(r).join("->")+"->"+t);r.add(t);let l=e(o,a||s);r.delete(t),Xe(t,l)&&(l=Je(n._scopes,n,t,l));return l}(e,h,t,i));n(h)&&h.length&&(h=function(t,e,i,s){const{_proxy:n,_context:a,_subProxy:r,_descriptors:l}=i;if(void 0!==a.index&&s(t))return e[a.index%e.length];if(o(e[0])){const i=e,s=n._scopes.filter((t=>t!==i));e=[];for(const o of i){const i=Je(s,n,t,o);e.push($e(i,a,r&&r[t],l))}}return e}(e,h,t,l.isIndexable));Xe(e,h)&&(h=$e(h,a,r&&r[e],l));return h}(t,e,i))),getOwnPropertyDescriptor:(e,i)=>e._descriptors.allKeys?Reflect.has(t,i)?{enumerable:!0,configurable:!0}:void 0:Reflect.getOwnPropertyDescriptor(t,i),getPrototypeOf:()=>Reflect.getPrototypeOf(t),has:(e,i)=>Reflect.has(t,i),ownKeys:()=>Reflect.ownKeys(t),set:(e,i,s)=>(t[i]=s,delete e[i],!0)})}function Ye(t,e={scriptable:!0,indexable:!0}){const{_scriptable:i=e.scriptable,_indexable:s=e.indexable,_allKeys:n=e.allKeys}=t;return{allKeys:n,scriptable:i,indexable:s,isScriptable:S(i)?i:()=>i,isIndexable:S(s)?s:()=>s}}const Ue=(t,e)=>t?t+w(e):e,Xe=(t,e)=>o(e)&&"adapters"!==t&&(null===Object.getPrototypeOf(e)||e.constructor===Object);function qe(t,e,i){if(Object.prototype.hasOwnProperty.call(t,e)||"constructor"===e)return t[e];const s=i();return t[e]=s,s}function Ke(t,e,i){return S(t)?t(e,i):t}const Ge=(t,e)=>!0===t?e:"string"==typeof t?M(e,t):void 0;function Ze(t,e,i,s,n){for(const o of e){const e=Ge(i,o);if(e){t.add(e);const o=Ke(e._fallback,i,n);if(void 0!==o&&o!==i&&o!==s)return o}else if(!1===e&&void 0!==s&&i!==s)return null}return!1}function Je(t,e,i,s){const a=e._rootScopes,r=Ke(e._fallback,i,s),l=[...t,...a],h=new Set;h.add(s);let c=Qe(h,l,i,r||i,s);return null!==c&&((void 0===r||r===i||(c=Qe(h,l,r,c,s),null!==c))&&je(Array.from(h),[""],a,r,(()=>function(t,e,i){const s=t._getTarget();e in s||(s[e]={});const a=s[e];if(n(a)&&o(i))return i;return a||{}}(e,i,s))))}function Qe(t,e,i,s,n){for(;i;)i=Ze(t,e,i,s,n);return i}function ti(t,e){for(const i of e){if(!i)continue;const e=i[t];if(void 0!==e)return e}}function ei(t){let e=t._keys;return e||(e=t._keys=function(t){const e=new Set;for(const i of t)for(const t of Object.keys(i).filter((t=>!t.startsWith("_"))))e.add(t);return Array.from(e)}(t._scopes)),e}function ii(t,e,i,s){const{iScale:n}=t,{key:o="r"}=this._parsing,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={r:n.parse(M(c,o),h)};return a}const si=Number.EPSILON||1e-14,ni=(t,e)=>e<t.length&&!t[e].skip&&t[e],oi=t=>"x"===t?"y":"x";function ai(t,e,i,s){const n=t.skip?e:t,o=e,a=i.skip?e:i,r=q(o,n),l=q(a,o);let h=r/(r+l),c=l/(r+l);h=isNaN(h)?0:h,c=isNaN(c)?0:c;const d=s*h,u=s*c;return{previous:{x:o.x-d*(a.x-n.x),y:o.y-d*(a.y-n.y)},next:{x:o.x+u*(a.x-n.x),y:o.y+u*(a.y-n.y)}}}function ri(t,e="x"){const i=oi(e),s=t.length,n=Array(s).fill(0),o=Array(s);let a,r,l,h=ni(t,0);for(a=0;a<s;++a)if(r=l,l=h,h=ni(t,a+1),l){if(h){const t=h[e]-l[e];n[a]=0!==t?(h[i]-l[i])/t:0}o[a]=r?h?F(n[a-1])!==F(n[a])?0:(n[a-1]+n[a])/2:n[a-1]:n[a]}!function(t,e,i){const s=t.length;let n,o,a,r,l,h=ni(t,0);for(let c=0;c<s-1;++c)l=h,h=ni(t,c+1),l&&h&&(V(e[c],0,si)?i[c]=i[c+1]=0:(n=i[c]/e[c],o=i[c+1]/e[c],r=Math.pow(n,2)+Math.pow(o,2),r<=9||(a=3/Math.sqrt(r),i[c]=n*a*e[c],i[c+1]=o*a*e[c])))}(t,n,o),function(t,e,i="x"){const s=oi(i),n=t.length;let o,a,r,l=ni(t,0);for(let h=0;h<n;++h){if(a=r,r=l,l=ni(t,h+1),!r)continue;const n=r[i],c=r[s];a&&(o=(n-a[i])/3,r[`cp1${i}`]=n-o,r[`cp1${s}`]=c-o*e[h]),l&&(o=(l[i]-n)/3,r[`cp2${i}`]=n+o,r[`cp2${s}`]=c+o*e[h])}}(t,o,e)}function li(t,e,i){return Math.max(Math.min(t,i),e)}function hi(t,e,i,s,n){let o,a,r,l;if(e.spanGaps&&(t=t.filter((t=>!t.skip))),"monotone"===e.cubicInterpolationMode)ri(t,n);else{let i=s?t[t.length-1]:t[0];for(o=0,a=t.length;o<a;++o)r=t[o],l=ai(i,r,t[Math.min(o+1,a-(s?0:1))%a],e.tension),r.cp1x=l.previous.x,r.cp1y=l.previous.y,r.cp2x=l.next.x,r.cp2y=l.next.y,i=r}e.capBezierPoints&&function(t,e){let i,s,n,o,a,r=Re(t[0],e);for(i=0,s=t.length;i<s;++i)a=o,o=r,r=i<s-1&&Re(t[i+1],e),o&&(n=t[i],a&&(n.cp1x=li(n.cp1x,e.left,e.right),n.cp1y=li(n.cp1y,e.top,e.bottom)),r&&(n.cp2x=li(n.cp2x,e.left,e.right),n.cp2y=li(n.cp2y,e.top,e.bottom)))}(t,i)}const ci=t=>0===t||1===t,di=(t,e,i)=>-Math.pow(2,10*(t-=1))*Math.sin((t-e)*O/i),ui=(t,e,i)=>Math.pow(2,-10*t)*Math.sin((t-e)*O/i)+1,fi={linear:t=>t,easeInQuad:t=>t*t,easeOutQuad:t=>-t*(t-2),easeInOutQuad:t=>(t/=.5)<1?.5*t*t:-.5*(--t*(t-2)-1),easeInCubic:t=>t*t*t,easeOutCubic:t=>(t-=1)*t*t+1,easeInOutCubic:t=>(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2),easeInQuart:t=>t*t*t*t,easeOutQuart:t=>-((t-=1)*t*t*t-1),easeInOutQuart:t=>(t/=.5)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2),easeInQuint:t=>t*t*t*t*t,easeOutQuint:t=>(t-=1)*t*t*t*t+1,easeInOutQuint:t=>(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2),easeInSine:t=>1-Math.cos(t*E),easeOutSine:t=>Math.sin(t*E),easeInOutSine:t=>-.5*(Math.cos(C*t)-1),easeInExpo:t=>0===t?0:Math.pow(2,10*(t-1)),easeOutExpo:t=>1===t?1:1-Math.pow(2,-10*t),easeInOutExpo:t=>ci(t)?t:t<.5?.5*Math.pow(2,10*(2*t-1)):.5*(2-Math.pow(2,-10*(2*t-1))),easeInCirc:t=>t>=1?t:-(Math.sqrt(1-t*t)-1),easeOutCirc:t=>Math.sqrt(1-(t-=1)*t),easeInOutCirc:t=>(t/=.5)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1),easeInElastic:t=>ci(t)?t:di(t,.075,.3),easeOutElastic:t=>ci(t)?t:ui(t,.075,.3),easeInOutElastic(t){const e=.1125;return ci(t)?t:t<.5?.5*di(2*t,e,.45):.5+.5*ui(2*t-1,e,.45)},easeInBack(t){const e=1.70158;return t*t*((e+1)*t-e)},easeOutBack(t){const e=1.70158;return(t-=1)*t*((e+1)*t+e)+1},easeInOutBack(t){let e=1.70158;return(t/=.5)<1?t*t*((1+(e*=1.525))*t-e)*.5:.5*((t-=2)*t*((1+(e*=1.525))*t+e)+2)},easeInBounce:t=>1-fi.easeOutBounce(1-t),easeOutBounce(t){const e=7.5625,i=2.75;return t<1/i?e*t*t:t<2/i?e*(t-=1.5/i)*t+.75:t<2.5/i?e*(t-=2.25/i)*t+.9375:e*(t-=2.625/i)*t+.984375},easeInOutBounce:t=>t<.5?.5*fi.easeInBounce(2*t):.5*fi.easeOutBounce(2*t-1)+.5};function gi(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:t.y+i*(e.y-t.y)}}function pi(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:"middle"===s?i<.5?t.y:e.y:"after"===s?i<1?t.y:e.y:i>0?e.y:t.y}}function mi(t,e,i,s){const n={x:t.cp2x,y:t.cp2y},o={x:e.cp1x,y:e.cp1y},a=gi(t,n,i),r=gi(n,o,i),l=gi(o,e,i),h=gi(a,r,i),c=gi(r,l,i);return gi(h,c,i)}const bi=/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/,xi=/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;function _i(t,e){const i=(""+t).match(bi);if(!i||"normal"===i[1])return 1.2*e;switch(t=+i[2],i[3]){case"px":return t;case"%":t/=100}return e*t}const yi=t=>+t||0;function vi(t,e){const i={},s=o(e),n=s?Object.keys(e):e,a=o(t)?s?i=>l(t[i],t[e[i]]):e=>t[e]:()=>t;for(const t of n)i[t]=yi(a(t));return i}function Mi(t){return vi(t,{top:"y",right:"x",bottom:"y",left:"x"})}function wi(t){return vi(t,["topLeft","topRight","bottomLeft","bottomRight"])}function ki(t){const e=Mi(t);return e.width=e.left+e.right,e.height=e.top+e.bottom,e}function Si(t,e){t=t||{},e=e||ue.font;let i=l(t.size,e.size);"string"==typeof i&&(i=parseInt(i,10));let s=l(t.style,e.style);s&&!(""+s).match(xi)&&(console.warn('Invalid font style specified: "'+s+'"'),s=void 0);const n={family:l(t.family,e.family),lineHeight:_i(l(t.lineHeight,e.lineHeight),i),size:i,style:s,weight:l(t.weight,e.weight),string:""};return n.string=De(n),n}function Pi(t,e,i,s){let o,a,r,l=!0;for(o=0,a=t.length;o<a;++o)if(r=t[o],void 0!==r&&(void 0!==e&&"function"==typeof r&&(r=r(e),l=!1),void 0!==i&&n(r)&&(r=r[i%r.length],l=!1),void 0!==r))return s&&!l&&(s.cacheable=!1),r}function Di(t,e,i){const{min:s,max:n}=t,o=c(e,(n-s)/2),a=(t,e)=>i&&0===t?0:t+e;return{min:a(s,-Math.abs(o)),max:a(n,o)}}function Ci(t,e){return Object.assign(Object.create(t),e)}function Oi(t,e,i){return t?function(t,e){return{x:i=>t+t+e-i,setWidth(t){e=t},textAlign:t=>"center"===t?t:"right"===t?"left":"right",xPlus:(t,e)=>t-e,leftForLtr:(t,e)=>t-e}}(e,i):{x:t=>t,setWidth(t){},textAlign:t=>t,xPlus:(t,e)=>t+e,leftForLtr:(t,e)=>t}}function Ai(t,e){let i,s;"ltr"!==e&&"rtl"!==e||(i=t.canvas.style,s=[i.getPropertyValue("direction"),i.getPropertyPriority("direction")],i.setProperty("direction",e,"important"),t.prevTextDirection=s)}function Ti(t,e){void 0!==e&&(delete t.prevTextDirection,t.canvas.style.setProperty("direction",e[0],e[1]))}function Li(t){return"angle"===t?{between:Z,compare:K,normalize:G}:{between:tt,compare:(t,e)=>t-e,normalize:t=>t}}function Ei({start:t,end:e,count:i,loop:s,style:n}){return{start:t%i,end:e%i,loop:s&&(e-t+1)%i==0,style:n}}function Ri(t,e,i){if(!i)return[t];const{property:s,start:n,end:o}=i,a=e.length,{compare:r,between:l,normalize:h}=Li(s),{start:c,end:d,loop:u,style:f}=function(t,e,i){const{property:s,start:n,end:o}=i,{between:a,normalize:r}=Li(s),l=e.length;let h,c,{start:d,end:u,loop:f}=t;if(f){for(d+=l,u+=l,h=0,c=l;h<c&&a(r(e[d%l][s]),n,o);++h)d--,u--;d%=l,u%=l}return u<d&&(u+=l),{start:d,end:u,loop:f,style:t.style}}(t,e,i),g=[];let p,m,b,x=!1,_=null;const y=()=>x||l(n,b,p)&&0!==r(n,b),v=()=>!x||0===r(o,p)||l(o,b,p);for(let t=c,i=c;t<=d;++t)m=e[t%a],m.skip||(p=h(m[s]),p!==b&&(x=l(p,n,o),null===_&&y()&&(_=0===r(p,n)?t:i),null!==_&&v()&&(g.push(Ei({start:_,end:t,loop:u,count:a,style:f})),_=null),i=t,b=p));return null!==_&&g.push(Ei({start:_,end:d,loop:u,count:a,style:f})),g}function Ii(t,e){const i=[],s=t.segments;for(let n=0;n<s.length;n++){const o=Ri(s[n],t.points,e);o.length&&i.push(...o)}return i}function zi(t,e){const i=t.points,s=t.options.spanGaps,n=i.length;if(!n)return[];const o=!!t._loop,{start:a,end:r}=function(t,e,i,s){let n=0,o=e-1;if(i&&!s)for(;n<e&&!t[n].skip;)n++;for(;n<e&&t[n].skip;)n++;for(n%=e,i&&(o+=n);o>n&&t[o%e].skip;)o--;return o%=e,{start:n,end:o}}(i,n,o,s);if(!0===s)return Fi(t,[{start:a,end:r,loop:o}],i,e);return Fi(t,function(t,e,i,s){const n=t.length,o=[];let a,r=e,l=t[e];for(a=e+1;a<=i;++a){const i=t[a%n];i.skip||i.stop?l.skip||(s=!1,o.push({start:e%n,end:(a-1)%n,loop:s}),e=r=i.stop?a:null):(r=a,l.skip&&(e=a)),l=i}return null!==r&&o.push({start:e%n,end:r%n,loop:s}),o}(i,a,r<a?r+n:r,!!t._fullLoop&&0===a&&r===n-1),i,e)}function Fi(t,e,i,s){return s&&s.setContext&&i?function(t,e,i,s){const n=t._chart.getContext(),o=Vi(t.options),{_datasetIndex:a,options:{spanGaps:r}}=t,l=i.length,h=[];let c=o,d=e[0].start,u=d;function f(t,e,s,n){const o=r?-1:1;if(t!==e){for(t+=l;i[t%l].skip;)t-=o;for(;i[e%l].skip;)e+=o;t%l!=e%l&&(h.push({start:t%l,end:e%l,loop:s,style:n}),c=n,d=e%l)}}for(const t of e){d=r?d:t.start;let e,o=i[d%l];for(u=d+1;u<=t.end;u++){const r=i[u%l];e=Vi(s.setContext(Ci(n,{type:"segment",p0:o,p1:r,p0DataIndex:(u-1)%l,p1DataIndex:u%l,datasetIndex:a}))),Bi(e,c)&&f(d,u-1,t.loop,c),o=r,c=e}d<u-1&&f(d,u-1,t.loop,c)}return h}(t,e,i,s):e}function Vi(t){return{backgroundColor:t.backgroundColor,borderCapStyle:t.borderCapStyle,borderDash:t.borderDash,borderDashOffset:t.borderDashOffset,borderJoinStyle:t.borderJoinStyle,borderWidth:t.borderWidth,borderColor:t.borderColor}}function Bi(t,e){if(!e)return!1;const i=[],s=function(t,e){return Jt(e)?(i.includes(e)||i.push(e),i.indexOf(e)):e};return JSON.stringify(t,s)!==JSON.stringify(e,s)}var Wi=Object.freeze({__proto__:null,HALF_PI:E,INFINITY:T,PI:C,PITAU:A,QUARTER_PI:R,RAD_PER_DEG:L,TAU:O,TWO_THIRDS_PI:I,_addGrace:Di,_alignPixel:Ae,_alignStartEnd:ft,_angleBetween:Z,_angleDiff:K,_arrayUnique:lt,_attachContext:$e,_bezierCurveTo:Ve,_bezierInterpolation:mi,_boundSegment:Ri,_boundSegments:Ii,_capitalize:w,_computeSegments:zi,_createResolver:je,_decimalPlaces:U,_deprecated:function(t,e,i,s){void 0!==e&&console.warn(t+': "'+i+'" is deprecated. Please use "'+s+'" instead')},_descriptors:Ye,_elementsEqual:f,_factorize:W,_filterBetween:nt,_getParentNode:ge,_getStartAndCountOfVisiblePoints:pt,_int16Range:Q,_isBetween:tt,_isClickEvent:D,_isDomSupported:fe,_isPointInArea:Re,_limitValue:J,_longestText:Oe,_lookup:et,_lookupByKey:it,_measureText:Ce,_merger:m,_mergerIf:_,_normalizeAngle:G,_parseObjectDataRadialScale:ii,_pointInLine:gi,_readValueToProps:vi,_rlookupByKey:st,_scaleRangesChanged:mt,_setMinAndMaxByKey:j,_splitKey:v,_steppedInterpolation:pi,_steppedLineTo:Fe,_textX:gt,_toLeftRightCenter:ut,_updateBezierControlPoints:hi,addRoundedRectPath:He,almostEquals:V,almostWhole:H,callback:d,clearCanvas:Te,clipArea:Ie,clone:g,color:Qt,createContext:Ci,debounce:dt,defined:k,distanceBetweenPoints:q,drawPoint:Le,drawPointLegend:Ee,each:u,easingEffects:fi,finiteOrDefault:r,fontString:function(t,e,i){return e+" "+t+"px "+i},formatNumber:ne,getAngleFromPoint:X,getHoverColor:te,getMaximumSize:we,getRelativePosition:ve,getRtlAdapter:Oi,getStyle:be,isArray:n,isFinite:a,isFunction:S,isNullOrUndef:s,isNumber:N,isObject:o,isPatternOrGradient:Jt,listenArrayEvents:at,log10:z,merge:b,mergeIf:x,niceNum:B,noop:e,overrideTextDirection:Ai,readUsedSize:Pe,renderText:Ne,requestAnimFrame:ht,resolve:Pi,resolveObjectKey:M,restoreTextDirection:Ti,retinaScale:ke,setsEqual:P,sign:F,splineCurve:ai,splineCurveMonotone:ri,supportsEventListenerOptions:Se,throttled:ct,toDegrees:Y,toDimension:c,toFont:Si,toFontString:De,toLineHeight:_i,toPadding:ki,toPercentage:h,toRadians:$,toTRBL:Mi,toTRBLCorners:wi,uid:i,unclipArea:ze,unlistenArrayEvents:rt,valueOrDefault:l});function Ni(t,e,i,s){const{controller:n,data:o,_sorted:a}=t,r=n._cachedMeta.iScale;if(r&&e===r.axis&&"r"!==e&&a&&o.length){const t=r._reversePixels?st:it;if(!s)return t(o,e,i);if(n._sharedOptions){const s=o[0],n="function"==typeof s.getRange&&s.getRange(e);if(n){const s=t(o,e,i-n),a=t(o,e,i+n);return{lo:s.lo,hi:a.hi}}}}return{lo:0,hi:o.length-1}}function Hi(t,e,i,s,n){const o=t.getSortedVisibleDatasetMetas(),a=i[e];for(let t=0,i=o.length;t<i;++t){const{index:i,data:r}=o[t],{lo:l,hi:h}=Ni(o[t],e,a,n);for(let t=l;t<=h;++t){const e=r[t];e.skip||s(e,i,t)}}}function ji(t,e,i,s,n){const o=[];if(!n&&!t.isPointInArea(e))return o;return Hi(t,i,e,(function(i,a,r){(n||Re(i,t.chartArea,0))&&i.inRange(e.x,e.y,s)&&o.push({element:i,datasetIndex:a,index:r})}),!0),o}function $i(t,e,i,s,n,o){let a=[];const r=function(t){const e=-1!==t.indexOf("x"),i=-1!==t.indexOf("y");return function(t,s){const n=e?Math.abs(t.x-s.x):0,o=i?Math.abs(t.y-s.y):0;return Math.sqrt(Math.pow(n,2)+Math.pow(o,2))}}(i);let l=Number.POSITIVE_INFINITY;return Hi(t,i,e,(function(i,h,c){const d=i.inRange(e.x,e.y,n);if(s&&!d)return;const u=i.getCenterPoint(n);if(!(!!o||t.isPointInArea(u))&&!d)return;const f=r(e,u);f<l?(a=[{element:i,datasetIndex:h,index:c}],l=f):f===l&&a.push({element:i,datasetIndex:h,index:c})})),a}function Yi(t,e,i,s,n,o){return o||t.isPointInArea(e)?"r"!==i||s?$i(t,e,i,s,n,o):function(t,e,i,s){let n=[];return Hi(t,i,e,(function(t,i,o){const{startAngle:a,endAngle:r}=t.getProps(["startAngle","endAngle"],s),{angle:l}=X(t,{x:e.x,y:e.y});Z(l,a,r)&&n.push({element:t,datasetIndex:i,index:o})})),n}(t,e,i,n):[]}function Ui(t,e,i,s,n){const o=[],a="x"===i?"inXRange":"inYRange";let r=!1;return Hi(t,i,e,((t,s,l)=>{t[a]&&t[a](e[i],n)&&(o.push({element:t,datasetIndex:s,index:l}),r=r||t.inRange(e.x,e.y,n))})),s&&!r?[]:o}var Xi={evaluateInteractionItems:Hi,modes:{index(t,e,i,s){const n=ve(e,t),o=i.axis||"x",a=i.includeInvisible||!1,r=i.intersect?ji(t,n,o,s,a):Yi(t,n,o,!1,s,a),l=[];return r.length?(t.getSortedVisibleDatasetMetas().forEach((t=>{const e=r[0].index,i=t.data[e];i&&!i.skip&&l.push({element:i,datasetIndex:t.index,index:e})})),l):[]},dataset(t,e,i,s){const n=ve(e,t),o=i.axis||"xy",a=i.includeInvisible||!1;let r=i.intersect?ji(t,n,o,s,a):Yi(t,n,o,!1,s,a);if(r.length>0){const e=r[0].datasetIndex,i=t.getDatasetMeta(e).data;r=[];for(let t=0;t<i.length;++t)r.push({element:i[t],datasetIndex:e,index:t})}return r},point:(t,e,i,s)=>ji(t,ve(e,t),i.axis||"xy",s,i.includeInvisible||!1),nearest(t,e,i,s){const n=ve(e,t),o=i.axis||"xy",a=i.includeInvisible||!1;return Yi(t,n,o,i.intersect,s,a)},x:(t,e,i,s)=>Ui(t,ve(e,t),"x",i.intersect,s),y:(t,e,i,s)=>Ui(t,ve(e,t),"y",i.intersect,s)}};const qi=["left","top","right","bottom"];function Ki(t,e){return t.filter((t=>t.pos===e))}function Gi(t,e){return t.filter((t=>-1===qi.indexOf(t.pos)&&t.box.axis===e))}function Zi(t,e){return t.sort(((t,i)=>{const s=e?i:t,n=e?t:i;return s.weight===n.weight?s.index-n.index:s.weight-n.weight}))}function Ji(t,e){const i=function(t){const e={};for(const i of t){const{stack:t,pos:s,stackWeight:n}=i;if(!t||!qi.includes(s))continue;const o=e[t]||(e[t]={count:0,placed:0,weight:0,size:0});o.count++,o.weight+=n}return e}(t),{vBoxMaxWidth:s,hBoxMaxHeight:n}=e;let o,a,r;for(o=0,a=t.length;o<a;++o){r=t[o];const{fullSize:a}=r.box,l=i[r.stack],h=l&&r.stackWeight/l.weight;r.horizontal?(r.width=h?h*s:a&&e.availableWidth,r.height=n):(r.width=s,r.height=h?h*n:a&&e.availableHeight)}return i}function Qi(t,e,i,s){return Math.max(t[i],e[i])+Math.max(t[s],e[s])}function ts(t,e){t.top=Math.max(t.top,e.top),t.left=Math.max(t.left,e.left),t.bottom=Math.max(t.bottom,e.bottom),t.right=Math.max(t.right,e.right)}function es(t,e,i,s){const{pos:n,box:a}=i,r=t.maxPadding;if(!o(n)){i.size&&(t[n]-=i.size);const e=s[i.stack]||{size:0,count:1};e.size=Math.max(e.size,i.horizontal?a.height:a.width),i.size=e.size/e.count,t[n]+=i.size}a.getPadding&&ts(r,a.getPadding());const l=Math.max(0,e.outerWidth-Qi(r,t,"left","right")),h=Math.max(0,e.outerHeight-Qi(r,t,"top","bottom")),c=l!==t.w,d=h!==t.h;return t.w=l,t.h=h,i.horizontal?{same:c,other:d}:{same:d,other:c}}function is(t,e){const i=e.maxPadding;function s(t){const s={left:0,top:0,right:0,bottom:0};return t.forEach((t=>{s[t]=Math.max(e[t],i[t])})),s}return s(t?["left","right"]:["top","bottom"])}function ss(t,e,i,s){const n=[];let o,a,r,l,h,c;for(o=0,a=t.length,h=0;o<a;++o){r=t[o],l=r.box,l.update(r.width||e.w,r.height||e.h,is(r.horizontal,e));const{same:a,other:d}=es(e,i,r,s);h|=a&&n.length,c=c||d,l.fullSize||n.push(r)}return h&&ss(n,e,i,s)||c}function ns(t,e,i,s,n){t.top=i,t.left=e,t.right=e+s,t.bottom=i+n,t.width=s,t.height=n}function os(t,e,i,s){const n=i.padding;let{x:o,y:a}=e;for(const r of t){const t=r.box,l=s[r.stack]||{count:1,placed:0,weight:1},h=r.stackWeight/l.weight||1;if(r.horizontal){const s=e.w*h,o=l.size||t.height;k(l.start)&&(a=l.start),t.fullSize?ns(t,n.left,a,i.outerWidth-n.right-n.left,o):ns(t,e.left+l.placed,a,s,o),l.start=a,l.placed+=s,a=t.bottom}else{const s=e.h*h,a=l.size||t.width;k(l.start)&&(o=l.start),t.fullSize?ns(t,o,n.top,a,i.outerHeight-n.bottom-n.top):ns(t,o,e.top+l.placed,a,s),l.start=o,l.placed+=s,o=t.right}}e.x=o,e.y=a}var as={addBox(t,e){t.boxes||(t.boxes=[]),e.fullSize=e.fullSize||!1,e.position=e.position||"top",e.weight=e.weight||0,e._layers=e._layers||function(){return[{z:0,draw(t){e.draw(t)}}]},t.boxes.push(e)},removeBox(t,e){const i=t.boxes?t.boxes.indexOf(e):-1;-1!==i&&t.boxes.splice(i,1)},configure(t,e,i){e.fullSize=i.fullSize,e.position=i.position,e.weight=i.weight},update(t,e,i,s){if(!t)return;const n=ki(t.options.layout.padding),o=Math.max(e-n.width,0),a=Math.max(i-n.height,0),r=function(t){const e=function(t){const e=[];let i,s,n,o,a,r;for(i=0,s=(t||[]).length;i<s;++i)n=t[i],({position:o,options:{stack:a,stackWeight:r=1}}=n),e.push({index:i,box:n,pos:o,horizontal:n.isHorizontal(),weight:n.weight,stack:a&&o+a,stackWeight:r});return e}(t),i=Zi(e.filter((t=>t.box.fullSize)),!0),s=Zi(Ki(e,"left"),!0),n=Zi(Ki(e,"right")),o=Zi(Ki(e,"top"),!0),a=Zi(Ki(e,"bottom")),r=Gi(e,"x"),l=Gi(e,"y");return{fullSize:i,leftAndTop:s.concat(o),rightAndBottom:n.concat(l).concat(a).concat(r),chartArea:Ki(e,"chartArea"),vertical:s.concat(n).concat(l),horizontal:o.concat(a).concat(r)}}(t.boxes),l=r.vertical,h=r.horizontal;u(t.boxes,(t=>{"function"==typeof t.beforeLayout&&t.beforeLayout()}));const c=l.reduce(((t,e)=>e.box.options&&!1===e.box.options.display?t:t+1),0)||1,d=Object.freeze({outerWidth:e,outerHeight:i,padding:n,availableWidth:o,availableHeight:a,vBoxMaxWidth:o/2/c,hBoxMaxHeight:a/2}),f=Object.assign({},n);ts(f,ki(s));const g=Object.assign({maxPadding:f,w:o,h:a,x:n.left,y:n.top},n),p=Ji(l.concat(h),d);ss(r.fullSize,g,d,p),ss(l,g,d,p),ss(h,g,d,p)&&ss(l,g,d,p),function(t){const e=t.maxPadding;function i(i){const s=Math.max(e[i]-t[i],0);return t[i]+=s,s}t.y+=i("top"),t.x+=i("left"),i("right"),i("bottom")}(g),os(r.leftAndTop,g,d,p),g.x+=g.w,g.y+=g.h,os(r.rightAndBottom,g,d,p),t.chartArea={left:g.left,top:g.top,right:g.left+g.w,bottom:g.top+g.h,height:g.h,width:g.w},u(r.chartArea,(e=>{const i=e.box;Object.assign(i,t.chartArea),i.update(g.w,g.h,{left:0,top:0,right:0,bottom:0})}))}};class rs{acquireContext(t,e){}releaseContext(t){return!1}addEventListener(t,e,i){}removeEventListener(t,e,i){}getDevicePixelRatio(){return 1}getMaximumSize(t,e,i,s){return e=Math.max(0,e||t.width),i=i||t.height,{width:e,height:Math.max(0,s?Math.floor(e/s):i)}}isAttached(t){return!0}updateConfig(t){}}class ls extends rs{acquireContext(t){return t&&t.getContext&&t.getContext("2d")||null}updateConfig(t){t.options.animation=!1}}const hs="$chartjs",cs={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup",pointerenter:"mouseenter",pointerdown:"mousedown",pointermove:"mousemove",pointerup:"mouseup",pointerleave:"mouseout",pointerout:"mouseout"},ds=t=>null===t||""===t;const us=!!Se&&{passive:!0};function fs(t,e,i){t&&t.canvas&&t.canvas.removeEventListener(e,i,us)}function gs(t,e){for(const i of t)if(i===e||i.contains(e))return!0}function ps(t,e,i){const s=t.canvas,n=new MutationObserver((t=>{let e=!1;for(const i of t)e=e||gs(i.addedNodes,s),e=e&&!gs(i.removedNodes,s);e&&i()}));return n.observe(document,{childList:!0,subtree:!0}),n}function ms(t,e,i){const s=t.canvas,n=new MutationObserver((t=>{let e=!1;for(const i of t)e=e||gs(i.removedNodes,s),e=e&&!gs(i.addedNodes,s);e&&i()}));return n.observe(document,{childList:!0,subtree:!0}),n}const bs=new Map;let xs=0;function _s(){const t=window.devicePixelRatio;t!==xs&&(xs=t,bs.forEach(((e,i)=>{i.currentDevicePixelRatio!==t&&e()})))}function ys(t,e,i){const s=t.canvas,n=s&&ge(s);if(!n)return;const o=ct(((t,e)=>{const s=n.clientWidth;i(t,e),s<n.clientWidth&&i()}),window),a=new ResizeObserver((t=>{const e=t[0],i=e.contentRect.width,s=e.contentRect.height;0===i&&0===s||o(i,s)}));return a.observe(n),function(t,e){bs.size||window.addEventListener("resize",_s),bs.set(t,e)}(t,o),a}function vs(t,e,i){i&&i.disconnect(),"resize"===e&&function(t){bs.delete(t),bs.size||window.removeEventListener("resize",_s)}(t)}function Ms(t,e,i){const s=t.canvas,n=ct((e=>{null!==t.ctx&&i(function(t,e){const i=cs[t.type]||t.type,{x:s,y:n}=ve(t,e);return{type:i,chart:e,native:t,x:void 0!==s?s:null,y:void 0!==n?n:null}}(e,t))}),t);return function(t,e,i){t&&t.addEventListener(e,i,us)}(s,e,n),n}class ws extends rs{acquireContext(t,e){const i=t&&t.getContext&&t.getContext("2d");return i&&i.canvas===t?(function(t,e){const i=t.style,s=t.getAttribute("height"),n=t.getAttribute("width");if(t[hs]={initial:{height:s,width:n,style:{display:i.display,height:i.height,width:i.width}}},i.display=i.display||"block",i.boxSizing=i.boxSizing||"border-box",ds(n)){const e=Pe(t,"width");void 0!==e&&(t.width=e)}if(ds(s))if(""===t.style.height)t.height=t.width/(e||2);else{const e=Pe(t,"height");void 0!==e&&(t.height=e)}}(t,e),i):null}releaseContext(t){const e=t.canvas;if(!e[hs])return!1;const i=e[hs].initial;["height","width"].forEach((t=>{const n=i[t];s(n)?e.removeAttribute(t):e.setAttribute(t,n)}));const n=i.style||{};return Object.keys(n).forEach((t=>{e.style[t]=n[t]})),e.width=e.width,delete e[hs],!0}addEventListener(t,e,i){this.removeEventListener(t,e);const s=t.$proxies||(t.$proxies={}),n={attach:ps,detach:ms,resize:ys}[e]||Ms;s[e]=n(t,e,i)}removeEventListener(t,e){const i=t.$proxies||(t.$proxies={}),s=i[e];if(!s)return;({attach:vs,detach:vs,resize:vs}[e]||fs)(t,e,s),i[e]=void 0}getDevicePixelRatio(){return window.devicePixelRatio}getMaximumSize(t,e,i,s){return we(t,e,i,s)}isAttached(t){const e=t&&ge(t);return!(!e||!e.isConnected)}}function ks(t){return!fe()||"undefined"!=typeof OffscreenCanvas&&t instanceof OffscreenCanvas?ls:ws}var Ss=Object.freeze({__proto__:null,BasePlatform:rs,BasicPlatform:ls,DomPlatform:ws,_detectPlatform:ks});const Ps="transparent",Ds={boolean:(t,e,i)=>i>.5?e:t,color(t,e,i){const s=Qt(t||Ps),n=s.valid&&Qt(e||Ps);return n&&n.valid?n.mix(s,i).hexString():e},number:(t,e,i)=>t+(e-t)*i};class Cs{constructor(t,e,i,s){const n=e[i];s=Pi([t.to,s,n,t.from]);const o=Pi([t.from,n,s]);this._active=!0,this._fn=t.fn||Ds[t.type||typeof o],this._easing=fi[t.easing]||fi.linear,this._start=Math.floor(Date.now()+(t.delay||0)),this._duration=this._total=Math.floor(t.duration),this._loop=!!t.loop,this._target=e,this._prop=i,this._from=o,this._to=s,this._promises=void 0}active(){return this._active}update(t,e,i){if(this._active){this._notify(!1);const s=this._target[this._prop],n=i-this._start,o=this._duration-n;this._start=i,this._duration=Math.floor(Math.max(o,t.duration)),this._total+=n,this._loop=!!t.loop,this._to=Pi([t.to,e,s,t.from]),this._from=Pi([t.from,s,e])}}cancel(){this._active&&(this.tick(Date.now()),this._active=!1,this._notify(!1))}tick(t){const e=t-this._start,i=this._duration,s=this._prop,n=this._from,o=this._loop,a=this._to;let r;if(this._active=n!==a&&(o||e<i),!this._active)return this._target[s]=a,void this._notify(!0);e<0?this._target[s]=n:(r=e/i%2,r=o&&r>1?2-r:r,r=this._easing(Math.min(1,Math.max(0,r))),this._target[s]=this._fn(n,a,r))}wait(){const t=this._promises||(this._promises=[]);return new Promise(((e,i)=>{t.push({res:e,rej:i})}))}_notify(t){const e=t?"res":"rej",i=this._promises||[];for(let t=0;t<i.length;t++)i[t][e]()}}class Os{constructor(t,e){this._chart=t,this._properties=new Map,this.configure(e)}configure(t){if(!o(t))return;const e=Object.keys(ue.animation),i=this._properties;Object.getOwnPropertyNames(t).forEach((s=>{const a=t[s];if(!o(a))return;const r={};for(const t of e)r[t]=a[t];(n(a.properties)&&a.properties||[s]).forEach((t=>{t!==s&&i.has(t)||i.set(t,r)}))}))}_animateOptions(t,e){const i=e.options,s=function(t,e){if(!e)return;let i=t.options;if(!i)return void(t.options=e);i.$shared&&(t.options=i=Object.assign({},i,{$shared:!1,$animations:{}}));return i}(t,i);if(!s)return[];const n=this._createAnimations(s,i);return i.$shared&&function(t,e){const i=[],s=Object.keys(e);for(let e=0;e<s.length;e++){const n=t[s[e]];n&&n.active()&&i.push(n.wait())}return Promise.all(i)}(t.options.$animations,i).then((()=>{t.options=i}),(()=>{})),n}_createAnimations(t,e){const i=this._properties,s=[],n=t.$animations||(t.$animations={}),o=Object.keys(e),a=Date.now();let r;for(r=o.length-1;r>=0;--r){const l=o[r];if("$"===l.charAt(0))continue;if("options"===l){s.push(...this._animateOptions(t,e));continue}const h=e[l];let c=n[l];const d=i.get(l);if(c){if(d&&c.active()){c.update(d,h,a);continue}c.cancel()}d&&d.duration?(n[l]=c=new Cs(d,t,l,h),s.push(c)):t[l]=h}return s}update(t,e){if(0===this._properties.size)return void Object.assign(t,e);const i=this._createAnimations(t,e);return i.length?(xt.add(this._chart,i),!0):void 0}}function As(t,e){const i=t&&t.options||{},s=i.reverse,n=void 0===i.min?e:0,o=void 0===i.max?e:0;return{start:s?o:n,end:s?n:o}}function Ts(t,e){const i=[],s=t._getSortedDatasetMetas(e);let n,o;for(n=0,o=s.length;n<o;++n)i.push(s[n].index);return i}function Ls(t,e,i,s={}){const n=t.keys,o="single"===s.mode;let r,l,h,c;if(null===e)return;let d=!1;for(r=0,l=n.length;r<l;++r){if(h=+n[r],h===i){if(d=!0,s.all)continue;break}c=t.values[h],a(c)&&(o||0===e||F(e)===F(c))&&(e+=c)}return d||s.all?e:0}function Es(t,e){const i=t&&t.options.stacked;return i||void 0===i&&void 0!==e.stack}function Rs(t,e,i){const s=t[e]||(t[e]={});return s[i]||(s[i]={})}function Is(t,e,i,s){for(const n of e.getMatchingVisibleMetas(s).reverse()){const e=t[n.index];if(i&&e>0||!i&&e<0)return n.index}return null}function zs(t,e){const{chart:i,_cachedMeta:s}=t,n=i._stacks||(i._stacks={}),{iScale:o,vScale:a,index:r}=s,l=o.axis,h=a.axis,c=function(t,e,i){return`${t.id}.${e.id}.${i.stack||i.type}`}(o,a,s),d=e.length;let u;for(let t=0;t<d;++t){const i=e[t],{[l]:o,[h]:d}=i;u=(i._stacks||(i._stacks={}))[h]=Rs(n,c,o),u[r]=d,u._top=Is(u,a,!0,s.type),u._bottom=Is(u,a,!1,s.type);(u._visualValues||(u._visualValues={}))[r]=d}}function Fs(t,e){const i=t.scales;return Object.keys(i).filter((t=>i[t].axis===e)).shift()}function Vs(t,e){const i=t.controller.index,s=t.vScale&&t.vScale.axis;if(s){e=e||t._parsed;for(const t of e){const e=t._stacks;if(!e||void 0===e[s]||void 0===e[s][i])return;delete e[s][i],void 0!==e[s]._visualValues&&void 0!==e[s]._visualValues[i]&&delete e[s]._visualValues[i]}}}const Bs=t=>"reset"===t||"none"===t,Ws=(t,e)=>e?t:Object.assign({},t);class Ns{static defaults={};static datasetElementType=null;static dataElementType=null;constructor(t,e){this.chart=t,this._ctx=t.ctx,this.index=e,this._cachedDataOpts={},this._cachedMeta=this.getMeta(),this._type=this._cachedMeta.type,this.options=void 0,this._parsing=!1,this._data=void 0,this._objectData=void 0,this._sharedOptions=void 0,this._drawStart=void 0,this._drawCount=void 0,this.enableOptionSharing=!1,this.supportsDecimation=!1,this.$context=void 0,this._syncList=[],this.datasetElementType=new.target.datasetElementType,this.dataElementType=new.target.dataElementType,this.initialize()}initialize(){const t=this._cachedMeta;this.configure(),this.linkScales(),t._stacked=Es(t.vScale,t),this.addElements(),this.options.fill&&!this.chart.isPluginEnabled("filler")&&console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options")}updateIndex(t){this.index!==t&&Vs(this._cachedMeta),this.index=t}linkScales(){const t=this.chart,e=this._cachedMeta,i=this.getDataset(),s=(t,e,i,s)=>"x"===t?e:"r"===t?s:i,n=e.xAxisID=l(i.xAxisID,Fs(t,"x")),o=e.yAxisID=l(i.yAxisID,Fs(t,"y")),a=e.rAxisID=l(i.rAxisID,Fs(t,"r")),r=e.indexAxis,h=e.iAxisID=s(r,n,o,a),c=e.vAxisID=s(r,o,n,a);e.xScale=this.getScaleForId(n),e.yScale=this.getScaleForId(o),e.rScale=this.getScaleForId(a),e.iScale=this.getScaleForId(h),e.vScale=this.getScaleForId(c)}getDataset(){return this.chart.data.datasets[this.index]}getMeta(){return this.chart.getDatasetMeta(this.index)}getScaleForId(t){return this.chart.scales[t]}_getOtherScale(t){const e=this._cachedMeta;return t===e.iScale?e.vScale:e.iScale}reset(){this._update("reset")}_destroy(){const t=this._cachedMeta;this._data&&rt(this._data,this),t._stacked&&Vs(t)}_dataCheck(){const t=this.getDataset(),e=t.data||(t.data=[]),i=this._data;if(o(e)){const t=this._cachedMeta;this._data=function(t,e){const{iScale:i,vScale:s}=e,n="x"===i.axis?"x":"y",o="x"===s.axis?"x":"y",a=Object.keys(t),r=new Array(a.length);let l,h,c;for(l=0,h=a.length;l<h;++l)c=a[l],r[l]={[n]:c,[o]:t[c]};return r}(e,t)}else if(i!==e){if(i){rt(i,this);const t=this._cachedMeta;Vs(t),t._parsed=[]}e&&Object.isExtensible(e)&&at(e,this),this._syncList=[],this._data=e}}addElements(){const t=this._cachedMeta;this._dataCheck(),this.datasetElementType&&(t.dataset=new this.datasetElementType)}buildOrUpdateElements(t){const e=this._cachedMeta,i=this.getDataset();let s=!1;this._dataCheck();const n=e._stacked;e._stacked=Es(e.vScale,e),e.stack!==i.stack&&(s=!0,Vs(e),e.stack=i.stack),this._resyncElements(t),(s||n!==e._stacked)&&(zs(this,e._parsed),e._stacked=Es(e.vScale,e))}configure(){const t=this.chart.config,e=t.datasetScopeKeys(this._type),i=t.getOptionScopes(this.getDataset(),e,!0);this.options=t.createResolver(i,this.getContext()),this._parsing=this.options.parsing,this._cachedDataOpts={}}parse(t,e){const{_cachedMeta:i,_data:s}=this,{iScale:a,_stacked:r}=i,l=a.axis;let h,c,d,u=0===t&&e===s.length||i._sorted,f=t>0&&i._parsed[t-1];if(!1===this._parsing)i._parsed=s,i._sorted=!0,d=s;else{d=n(s[t])?this.parseArrayData(i,s,t,e):o(s[t])?this.parseObjectData(i,s,t,e):this.parsePrimitiveData(i,s,t,e);const a=()=>null===c[l]||f&&c[l]<f[l];for(h=0;h<e;++h)i._parsed[h+t]=c=d[h],u&&(a()&&(u=!1),f=c);i._sorted=u}r&&zs(this,d)}parsePrimitiveData(t,e,i,s){const{iScale:n,vScale:o}=t,a=n.axis,r=o.axis,l=n.getLabels(),h=n===o,c=new Array(s);let d,u,f;for(d=0,u=s;d<u;++d)f=d+i,c[d]={[a]:h||n.parse(l[f],f),[r]:o.parse(e[f],f)};return c}parseArrayData(t,e,i,s){const{xScale:n,yScale:o}=t,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={x:n.parse(c[0],h),y:o.parse(c[1],h)};return a}parseObjectData(t,e,i,s){const{xScale:n,yScale:o}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l=new Array(s);let h,c,d,u;for(h=0,c=s;h<c;++h)d=h+i,u=e[d],l[h]={x:n.parse(M(u,a),d),y:o.parse(M(u,r),d)};return l}getParsed(t){return this._cachedMeta._parsed[t]}getDataElement(t){return this._cachedMeta.data[t]}applyStack(t,e,i){const s=this.chart,n=this._cachedMeta,o=e[t.axis];return Ls({keys:Ts(s,!0),values:e._stacks[t.axis]._visualValues},o,n.index,{mode:i})}updateRangeFromParsed(t,e,i,s){const n=i[e.axis];let o=null===n?NaN:n;const a=s&&i._stacks[e.axis];s&&a&&(s.values=a,o=Ls(s,n,this._cachedMeta.index)),t.min=Math.min(t.min,o),t.max=Math.max(t.max,o)}getMinMax(t,e){const i=this._cachedMeta,s=i._parsed,n=i._sorted&&t===i.iScale,o=s.length,r=this._getOtherScale(t),l=((t,e,i)=>t&&!e.hidden&&e._stacked&&{keys:Ts(i,!0),values:null})(e,i,this.chart),h={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY},{min:c,max:d}=function(t){const{min:e,max:i,minDefined:s,maxDefined:n}=t.getUserBounds();return{min:s?e:Number.NEGATIVE_INFINITY,max:n?i:Number.POSITIVE_INFINITY}}(r);let u,f;function g(){f=s[u];const e=f[r.axis];return!a(f[t.axis])||c>e||d<e}for(u=0;u<o&&(g()||(this.updateRangeFromParsed(h,t,f,l),!n));++u);if(n)for(u=o-1;u>=0;--u)if(!g()){this.updateRangeFromParsed(h,t,f,l);break}return h}getAllParsedValues(t){const e=this._cachedMeta._parsed,i=[];let s,n,o;for(s=0,n=e.length;s<n;++s)o=e[s][t.axis],a(o)&&i.push(o);return i}getMaxOverflow(){return!1}getLabelAndValue(t){const e=this._cachedMeta,i=e.iScale,s=e.vScale,n=this.getParsed(t);return{label:i?""+i.getLabelForValue(n[i.axis]):"",value:s?""+s.getLabelForValue(n[s.axis]):""}}_update(t){const e=this._cachedMeta;this.update(t||"default"),e._clip=function(t){let e,i,s,n;return o(t)?(e=t.top,i=t.right,s=t.bottom,n=t.left):e=i=s=n=t,{top:e,right:i,bottom:s,left:n,disabled:!1===t}}(l(this.options.clip,function(t,e,i){if(!1===i)return!1;const s=As(t,i),n=As(e,i);return{top:n.end,right:s.end,bottom:n.start,left:s.start}}(e.xScale,e.yScale,this.getMaxOverflow())))}update(t){}draw(){const t=this._ctx,e=this.chart,i=this._cachedMeta,s=i.data||[],n=e.chartArea,o=[],a=this._drawStart||0,r=this._drawCount||s.length-a,l=this.options.drawActiveElementsOnTop;let h;for(i.dataset&&i.dataset.draw(t,n,a,r),h=a;h<a+r;++h){const e=s[h];e.hidden||(e.active&&l?o.push(e):e.draw(t,n))}for(h=0;h<o.length;++h)o[h].draw(t,n)}getStyle(t,e){const i=e?"active":"default";return void 0===t&&this._cachedMeta.dataset?this.resolveDatasetElementOptions(i):this.resolveDataElementOptions(t||0,i)}getContext(t,e,i){const s=this.getDataset();let n;if(t>=0&&t<this._cachedMeta.data.length){const e=this._cachedMeta.data[t];n=e.$context||(e.$context=function(t,e,i){return Ci(t,{active:!1,dataIndex:e,parsed:void 0,raw:void 0,element:i,index:e,mode:"default",type:"data"})}(this.getContext(),t,e)),n.parsed=this.getParsed(t),n.raw=s.data[t],n.index=n.dataIndex=t}else n=this.$context||(this.$context=function(t,e){return Ci(t,{active:!1,dataset:void 0,datasetIndex:e,index:e,mode:"default",type:"dataset"})}(this.chart.getContext(),this.index)),n.dataset=s,n.index=n.datasetIndex=this.index;return n.active=!!e,n.mode=i,n}resolveDatasetElementOptions(t){return this._resolveElementOptions(this.datasetElementType.id,t)}resolveDataElementOptions(t,e){return this._resolveElementOptions(this.dataElementType.id,e,t)}_resolveElementOptions(t,e="default",i){const s="active"===e,n=this._cachedDataOpts,o=t+"-"+e,a=n[o],r=this.enableOptionSharing&&k(i);if(a)return Ws(a,r);const l=this.chart.config,h=l.datasetElementScopeKeys(this._type,t),c=s?[`${t}Hover`,"hover",t,""]:[t,""],d=l.getOptionScopes(this.getDataset(),h),u=Object.keys(ue.elements[t]),f=l.resolveNamedOptions(d,u,(()=>this.getContext(i,s,e)),c);return f.$shared&&(f.$shared=r,n[o]=Object.freeze(Ws(f,r))),f}_resolveAnimations(t,e,i){const s=this.chart,n=this._cachedDataOpts,o=`animation-${e}`,a=n[o];if(a)return a;let r;if(!1!==s.options.animation){const s=this.chart.config,n=s.datasetAnimationScopeKeys(this._type,e),o=s.getOptionScopes(this.getDataset(),n);r=s.createResolver(o,this.getContext(t,i,e))}const l=new Os(s,r&&r.animations);return r&&r._cacheable&&(n[o]=Object.freeze(l)),l}getSharedOptions(t){if(t.$shared)return this._sharedOptions||(this._sharedOptions=Object.assign({},t))}includeOptions(t,e){return!e||Bs(t)||this.chart._animationsDisabled}_getSharedOptions(t,e){const i=this.resolveDataElementOptions(t,e),s=this._sharedOptions,n=this.getSharedOptions(i),o=this.includeOptions(e,n)||n!==s;return this.updateSharedOptions(n,e,i),{sharedOptions:n,includeOptions:o}}updateElement(t,e,i,s){Bs(s)?Object.assign(t,i):this._resolveAnimations(e,s).update(t,i)}updateSharedOptions(t,e,i){t&&!Bs(e)&&this._resolveAnimations(void 0,e).update(t,i)}_setStyle(t,e,i,s){t.active=s;const n=this.getStyle(e,s);this._resolveAnimations(e,i,s).update(t,{options:!s&&this.getSharedOptions(n)||n})}removeHoverStyle(t,e,i){this._setStyle(t,i,"active",!1)}setHoverStyle(t,e,i){this._setStyle(t,i,"active",!0)}_removeDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!1)}_setDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!0)}_resyncElements(t){const e=this._data,i=this._cachedMeta.data;for(const[t,e,i]of this._syncList)this[t](e,i);this._syncList=[];const s=i.length,n=e.length,o=Math.min(n,s);o&&this.parse(0,o),n>s?this._insertElements(s,n-s,t):n<s&&this._removeElements(n,s-n)}_insertElements(t,e,i=!0){const s=this._cachedMeta,n=s.data,o=t+e;let a;const r=t=>{for(t.length+=e,a=t.length-1;a>=o;a--)t[a]=t[a-e]};for(r(n),a=t;a<o;++a)n[a]=new this.dataElementType;this._parsing&&r(s._parsed),this.parse(t,e),i&&this.updateElements(n,t,e,"reset")}updateElements(t,e,i,s){}_removeElements(t,e){const i=this._cachedMeta;if(this._parsing){const s=i._parsed.splice(t,e);i._stacked&&Vs(i,s)}i.data.splice(t,e)}_sync(t){if(this._parsing)this._syncList.push(t);else{const[e,i,s]=t;this[e](i,s)}this.chart._dataChanges.push([this.index,...t])}_onDataPush(){const t=arguments.length;this._sync(["_insertElements",this.getDataset().data.length-t,t])}_onDataPop(){this._sync(["_removeElements",this._cachedMeta.data.length-1,1])}_onDataShift(){this._sync(["_removeElements",0,1])}_onDataSplice(t,e){e&&this._sync(["_removeElements",t,e]);const i=arguments.length-2;i&&this._sync(["_insertElements",t,i])}_onDataUnshift(){this._sync(["_insertElements",0,arguments.length])}}class Hs{static defaults={};static defaultRoutes=void 0;x;y;active=!1;options;$animations;tooltipPosition(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}hasValue(){return N(this.x)&&N(this.y)}getProps(t,e){const i=this.$animations;if(!e||!i)return this;const s={};return t.forEach((t=>{s[t]=i[t]&&i[t].active()?i[t]._to:this[t]})),s}}function js(t,e){const i=t.options.ticks,n=function(t){const e=t.options.offset,i=t._tickSize(),s=t._length/i+(e?0:1),n=t._maxLength/i;return Math.floor(Math.min(s,n))}(t),o=Math.min(i.maxTicksLimit||n,n),a=i.major.enabled?function(t){const e=[];let i,s;for(i=0,s=t.length;i<s;i++)t[i].major&&e.push(i);return e}(e):[],r=a.length,l=a[0],h=a[r-1],c=[];if(r>o)return function(t,e,i,s){let n,o=0,a=i[0];for(s=Math.ceil(s),n=0;n<t.length;n++)n===a&&(e.push(t[n]),o++,a=i[o*s])}(e,c,a,r/o),c;const d=function(t,e,i){const s=function(t){const e=t.length;let i,s;if(e<2)return!1;for(s=t[0],i=1;i<e;++i)if(t[i]-t[i-1]!==s)return!1;return s}(t),n=e.length/i;if(!s)return Math.max(n,1);const o=W(s);for(let t=0,e=o.length-1;t<e;t++){const e=o[t];if(e>n)return e}return Math.max(n,1)}(a,e,o);if(r>0){let t,i;const n=r>1?Math.round((h-l)/(r-1)):null;for($s(e,c,d,s(n)?0:l-n,l),t=0,i=r-1;t<i;t++)$s(e,c,d,a[t],a[t+1]);return $s(e,c,d,h,s(n)?e.length:h+n),c}return $s(e,c,d),c}function $s(t,e,i,s,n){const o=l(s,0),a=Math.min(l(n,t.length),t.length);let r,h,c,d=0;for(i=Math.ceil(i),n&&(r=n-s,i=r/Math.floor(r/i)),c=o;c<0;)d++,c=Math.round(o+d*i);for(h=Math.max(o,0);h<a;h++)h===c&&(e.push(t[h]),d++,c=Math.round(o+d*i))}const Ys=(t,e,i)=>"top"===e||"left"===e?t[e]+i:t[e]-i,Us=(t,e)=>Math.min(e||t,t);function Xs(t,e){const i=[],s=t.length/e,n=t.length;let o=0;for(;o<n;o+=s)i.push(t[Math.floor(o)]);return i}function qs(t,e,i){const s=t.ticks.length,n=Math.min(e,s-1),o=t._startPixel,a=t._endPixel,r=1e-6;let l,h=t.getPixelForTick(n);if(!(i&&(l=1===s?Math.max(h-o,a-h):0===e?(t.getPixelForTick(1)-h)/2:(h-t.getPixelForTick(n-1))/2,h+=n<e?l:-l,h<o-r||h>a+r)))return h}function Ks(t){return t.drawTicks?t.tickLength:0}function Gs(t,e){if(!t.display)return 0;const i=Si(t.font,e),s=ki(t.padding);return(n(t.text)?t.text.length:1)*i.lineHeight+s.height}function Zs(t,e,i){let s=ut(t);return(i&&"right"!==e||!i&&"right"===e)&&(s=(t=>"left"===t?"right":"right"===t?"left":t)(s)),s}class Js extends Hs{constructor(t){super(),this.id=t.id,this.type=t.type,this.options=void 0,this.ctx=t.ctx,this.chart=t.chart,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this._margins={left:0,right:0,top:0,bottom:0},this.maxWidth=void 0,this.maxHeight=void 0,this.paddingTop=void 0,this.paddingBottom=void 0,this.paddingLeft=void 0,this.paddingRight=void 0,this.axis=void 0,this.labelRotation=void 0,this.min=void 0,this.max=void 0,this._range=void 0,this.ticks=[],this._gridLineItems=null,this._labelItems=null,this._labelSizes=null,this._length=0,this._maxLength=0,this._longestTextCache={},this._startPixel=void 0,this._endPixel=void 0,this._reversePixels=!1,this._userMax=void 0,this._userMin=void 0,this._suggestedMax=void 0,this._suggestedMin=void 0,this._ticksLength=0,this._borderValue=0,this._cache={},this._dataLimitsCached=!1,this.$context=void 0}init(t){this.options=t.setContext(this.getContext()),this.axis=t.axis,this._userMin=this.parse(t.min),this._userMax=this.parse(t.max),this._suggestedMin=this.parse(t.suggestedMin),this._suggestedMax=this.parse(t.suggestedMax)}parse(t,e){return t}getUserBounds(){let{_userMin:t,_userMax:e,_suggestedMin:i,_suggestedMax:s}=this;return t=r(t,Number.POSITIVE_INFINITY),e=r(e,Number.NEGATIVE_INFINITY),i=r(i,Number.POSITIVE_INFINITY),s=r(s,Number.NEGATIVE_INFINITY),{min:r(t,i),max:r(e,s),minDefined:a(t),maxDefined:a(e)}}getMinMax(t){let e,{min:i,max:s,minDefined:n,maxDefined:o}=this.getUserBounds();if(n&&o)return{min:i,max:s};const a=this.getMatchingVisibleMetas();for(let r=0,l=a.length;r<l;++r)e=a[r].controller.getMinMax(this,t),n||(i=Math.min(i,e.min)),o||(s=Math.max(s,e.max));return i=o&&i>s?s:i,s=n&&i>s?i:s,{min:r(i,r(s,i)),max:r(s,r(i,s))}}getPadding(){return{left:this.paddingLeft||0,top:this.paddingTop||0,right:this.paddingRight||0,bottom:this.paddingBottom||0}}getTicks(){return this.ticks}getLabels(){const t=this.chart.data;return this.options.labels||(this.isHorizontal()?t.xLabels:t.yLabels)||t.labels||[]}getLabelItems(t=this.chart.chartArea){return this._labelItems||(this._labelItems=this._computeLabelItems(t))}beforeLayout(){this._cache={},this._dataLimitsCached=!1}beforeUpdate(){d(this.options.beforeUpdate,[this])}update(t,e,i){const{beginAtZero:s,grace:n,ticks:o}=this.options,a=o.sampleSize;this.beforeUpdate(),this.maxWidth=t,this.maxHeight=e,this._margins=i=Object.assign({left:0,right:0,top:0,bottom:0},i),this.ticks=null,this._labelSizes=null,this._gridLineItems=null,this._labelItems=null,this.beforeSetDimensions(),this.setDimensions(),this.afterSetDimensions(),this._maxLength=this.isHorizontal()?this.width+i.left+i.right:this.height+i.top+i.bottom,this._dataLimitsCached||(this.beforeDataLimits(),this.determineDataLimits(),this.afterDataLimits(),this._range=Di(this,n,s),this._dataLimitsCached=!0),this.beforeBuildTicks(),this.ticks=this.buildTicks()||[],this.afterBuildTicks();const r=a<this.ticks.length;this._convertTicksToLabels(r?Xs(this.ticks,a):this.ticks),this.configure(),this.beforeCalculateLabelRotation(),this.calculateLabelRotation(),this.afterCalculateLabelRotation(),o.display&&(o.autoSkip||"auto"===o.source)&&(this.ticks=js(this,this.ticks),this._labelSizes=null,this.afterAutoSkip()),r&&this._convertTicksToLabels(this.ticks),this.beforeFit(),this.fit(),this.afterFit(),this.afterUpdate()}configure(){let t,e,i=this.options.reverse;this.isHorizontal()?(t=this.left,e=this.right):(t=this.top,e=this.bottom,i=!i),this._startPixel=t,this._endPixel=e,this._reversePixels=i,this._length=e-t,this._alignToPixels=this.options.alignToPixels}afterUpdate(){d(this.options.afterUpdate,[this])}beforeSetDimensions(){d(this.options.beforeSetDimensions,[this])}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=0,this.right=this.width):(this.height=this.maxHeight,this.top=0,this.bottom=this.height),this.paddingLeft=0,this.paddingTop=0,this.paddingRight=0,this.paddingBottom=0}afterSetDimensions(){d(this.options.afterSetDimensions,[this])}_callHooks(t){this.chart.notifyPlugins(t,this.getContext()),d(this.options[t],[this])}beforeDataLimits(){this._callHooks("beforeDataLimits")}determineDataLimits(){}afterDataLimits(){this._callHooks("afterDataLimits")}beforeBuildTicks(){this._callHooks("beforeBuildTicks")}buildTicks(){return[]}afterBuildTicks(){this._callHooks("afterBuildTicks")}beforeTickToLabelConversion(){d(this.options.beforeTickToLabelConversion,[this])}generateTickLabels(t){const e=this.options.ticks;let i,s,n;for(i=0,s=t.length;i<s;i++)n=t[i],n.label=d(e.callback,[n.value,i,t],this)}afterTickToLabelConversion(){d(this.options.afterTickToLabelConversion,[this])}beforeCalculateLabelRotation(){d(this.options.beforeCalculateLabelRotation,[this])}calculateLabelRotation(){const t=this.options,e=t.ticks,i=Us(this.ticks.length,t.ticks.maxTicksLimit),s=e.minRotation||0,n=e.maxRotation;let o,a,r,l=s;if(!this._isVisible()||!e.display||s>=n||i<=1||!this.isHorizontal())return void(this.labelRotation=s);const h=this._getLabelSizes(),c=h.widest.width,d=h.highest.height,u=J(this.chart.width-c,0,this.maxWidth);o=t.offset?this.maxWidth/i:u/(i-1),c+6>o&&(o=u/(i-(t.offset?.5:1)),a=this.maxHeight-Ks(t.grid)-e.padding-Gs(t.title,this.chart.options.font),r=Math.sqrt(c*c+d*d),l=Y(Math.min(Math.asin(J((h.highest.height+6)/o,-1,1)),Math.asin(J(a/r,-1,1))-Math.asin(J(d/r,-1,1)))),l=Math.max(s,Math.min(n,l))),this.labelRotation=l}afterCalculateLabelRotation(){d(this.options.afterCalculateLabelRotation,[this])}afterAutoSkip(){}beforeFit(){d(this.options.beforeFit,[this])}fit(){const t={width:0,height:0},{chart:e,options:{ticks:i,title:s,grid:n}}=this,o=this._isVisible(),a=this.isHorizontal();if(o){const o=Gs(s,e.options.font);if(a?(t.width=this.maxWidth,t.height=Ks(n)+o):(t.height=this.maxHeight,t.width=Ks(n)+o),i.display&&this.ticks.length){const{first:e,last:s,widest:n,highest:o}=this._getLabelSizes(),r=2*i.padding,l=$(this.labelRotation),h=Math.cos(l),c=Math.sin(l);if(a){const e=i.mirror?0:c*n.width+h*o.height;t.height=Math.min(this.maxHeight,t.height+e+r)}else{const e=i.mirror?0:h*n.width+c*o.height;t.width=Math.min(this.maxWidth,t.width+e+r)}this._calculatePadding(e,s,c,h)}}this._handleMargins(),a?(this.width=this._length=e.width-this._margins.left-this._margins.right,this.height=t.height):(this.width=t.width,this.height=this._length=e.height-this._margins.top-this._margins.bottom)}_calculatePadding(t,e,i,s){const{ticks:{align:n,padding:o},position:a}=this.options,r=0!==this.labelRotation,l="top"!==a&&"x"===this.axis;if(this.isHorizontal()){const a=this.getPixelForTick(0)-this.left,h=this.right-this.getPixelForTick(this.ticks.length-1);let c=0,d=0;r?l?(c=s*t.width,d=i*e.height):(c=i*t.height,d=s*e.width):"start"===n?d=e.width:"end"===n?c=t.width:"inner"!==n&&(c=t.width/2,d=e.width/2),this.paddingLeft=Math.max((c-a+o)*this.width/(this.width-a),0),this.paddingRight=Math.max((d-h+o)*this.width/(this.width-h),0)}else{let i=e.height/2,s=t.height/2;"start"===n?(i=0,s=t.height):"end"===n&&(i=e.height,s=0),this.paddingTop=i+o,this.paddingBottom=s+o}}_handleMargins(){this._margins&&(this._margins.left=Math.max(this.paddingLeft,this._margins.left),this._margins.top=Math.max(this.paddingTop,this._margins.top),this._margins.right=Math.max(this.paddingRight,this._margins.right),this._margins.bottom=Math.max(this.paddingBottom,this._margins.bottom))}afterFit(){d(this.options.afterFit,[this])}isHorizontal(){const{axis:t,position:e}=this.options;return"top"===e||"bottom"===e||"x"===t}isFullSize(){return this.options.fullSize}_convertTicksToLabels(t){let e,i;for(this.beforeTickToLabelConversion(),this.generateTickLabels(t),e=0,i=t.length;e<i;e++)s(t[e].label)&&(t.splice(e,1),i--,e--);this.afterTickToLabelConversion()}_getLabelSizes(){let t=this._labelSizes;if(!t){const e=this.options.ticks.sampleSize;let i=this.ticks;e<i.length&&(i=Xs(i,e)),this._labelSizes=t=this._computeLabelSizes(i,i.length,this.options.ticks.maxTicksLimit)}return t}_computeLabelSizes(t,e,i){const{ctx:o,_longestTextCache:a}=this,r=[],l=[],h=Math.floor(e/Us(e,i));let c,d,f,g,p,m,b,x,_,y,v,M=0,w=0;for(c=0;c<e;c+=h){if(g=t[c].label,p=this._resolveTickFontOptions(c),o.font=m=p.string,b=a[m]=a[m]||{data:{},gc:[]},x=p.lineHeight,_=y=0,s(g)||n(g)){if(n(g))for(d=0,f=g.length;d<f;++d)v=g[d],s(v)||n(v)||(_=Ce(o,b.data,b.gc,_,v),y+=x)}else _=Ce(o,b.data,b.gc,_,g),y=x;r.push(_),l.push(y),M=Math.max(_,M),w=Math.max(y,w)}!function(t,e){u(t,(t=>{const i=t.gc,s=i.length/2;let n;if(s>e){for(n=0;n<s;++n)delete t.data[i[n]];i.splice(0,s)}}))}(a,e);const k=r.indexOf(M),S=l.indexOf(w),P=t=>({width:r[t]||0,height:l[t]||0});return{first:P(0),last:P(e-1),widest:P(k),highest:P(S),widths:r,heights:l}}getLabelForValue(t){return t}getPixelForValue(t,e){return NaN}getValueForPixel(t){}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getPixelForDecimal(t){this._reversePixels&&(t=1-t);const e=this._startPixel+t*this._length;return Q(this._alignToPixels?Ae(this.chart,e,0):e)}getDecimalForPixel(t){const e=(t-this._startPixel)/this._length;return this._reversePixels?1-e:e}getBasePixel(){return this.getPixelForValue(this.getBaseValue())}getBaseValue(){const{min:t,max:e}=this;return t<0&&e<0?e:t>0&&e>0?t:0}getContext(t){const e=this.ticks||[];if(t>=0&&t<e.length){const i=e[t];return i.$context||(i.$context=function(t,e,i){return Ci(t,{tick:i,index:e,type:"tick"})}(this.getContext(),t,i))}return this.$context||(this.$context=Ci(this.chart.getContext(),{scale:this,type:"scale"}))}_tickSize(){const t=this.options.ticks,e=$(this.labelRotation),i=Math.abs(Math.cos(e)),s=Math.abs(Math.sin(e)),n=this._getLabelSizes(),o=t.autoSkipPadding||0,a=n?n.widest.width+o:0,r=n?n.highest.height+o:0;return this.isHorizontal()?r*i>a*s?a/i:r/s:r*s<a*i?r/i:a/s}_isVisible(){const t=this.options.display;return"auto"!==t?!!t:this.getMatchingVisibleMetas().length>0}_computeGridLineItems(t){const e=this.axis,i=this.chart,s=this.options,{grid:n,position:a,border:r}=s,h=n.offset,c=this.isHorizontal(),d=this.ticks.length+(h?1:0),u=Ks(n),f=[],g=r.setContext(this.getContext()),p=g.display?g.width:0,m=p/2,b=function(t){return Ae(i,t,p)};let x,_,y,v,M,w,k,S,P,D,C,O;if("top"===a)x=b(this.bottom),w=this.bottom-u,S=x-m,D=b(t.top)+m,O=t.bottom;else if("bottom"===a)x=b(this.top),D=t.top,O=b(t.bottom)-m,w=x+m,S=this.top+u;else if("left"===a)x=b(this.right),M=this.right-u,k=x-m,P=b(t.left)+m,C=t.right;else if("right"===a)x=b(this.left),P=t.left,C=b(t.right)-m,M=x+m,k=this.left+u;else if("x"===e){if("center"===a)x=b((t.top+t.bottom)/2+.5);else if(o(a)){const t=Object.keys(a)[0],e=a[t];x=b(this.chart.scales[t].getPixelForValue(e))}D=t.top,O=t.bottom,w=x+m,S=w+u}else if("y"===e){if("center"===a)x=b((t.left+t.right)/2);else if(o(a)){const t=Object.keys(a)[0],e=a[t];x=b(this.chart.scales[t].getPixelForValue(e))}M=x-m,k=M-u,P=t.left,C=t.right}const A=l(s.ticks.maxTicksLimit,d),T=Math.max(1,Math.ceil(d/A));for(_=0;_<d;_+=T){const t=this.getContext(_),e=n.setContext(t),s=r.setContext(t),o=e.lineWidth,a=e.color,l=s.dash||[],d=s.dashOffset,u=e.tickWidth,g=e.tickColor,p=e.tickBorderDash||[],m=e.tickBorderDashOffset;y=qs(this,_,h),void 0!==y&&(v=Ae(i,y,o),c?M=k=P=C=v:w=S=D=O=v,f.push({tx1:M,ty1:w,tx2:k,ty2:S,x1:P,y1:D,x2:C,y2:O,width:o,color:a,borderDash:l,borderDashOffset:d,tickWidth:u,tickColor:g,tickBorderDash:p,tickBorderDashOffset:m}))}return this._ticksLength=d,this._borderValue=x,f}_computeLabelItems(t){const e=this.axis,i=this.options,{position:s,ticks:a}=i,r=this.isHorizontal(),l=this.ticks,{align:h,crossAlign:c,padding:d,mirror:u}=a,f=Ks(i.grid),g=f+d,p=u?-d:g,m=-$(this.labelRotation),b=[];let x,_,y,v,M,w,k,S,P,D,C,O,A="middle";if("top"===s)w=this.bottom-p,k=this._getXAxisLabelAlignment();else if("bottom"===s)w=this.top+p,k=this._getXAxisLabelAlignment();else if("left"===s){const t=this._getYAxisLabelAlignment(f);k=t.textAlign,M=t.x}else if("right"===s){const t=this._getYAxisLabelAlignment(f);k=t.textAlign,M=t.x}else if("x"===e){if("center"===s)w=(t.top+t.bottom)/2+g;else if(o(s)){const t=Object.keys(s)[0],e=s[t];w=this.chart.scales[t].getPixelForValue(e)+g}k=this._getXAxisLabelAlignment()}else if("y"===e){if("center"===s)M=(t.left+t.right)/2-g;else if(o(s)){const t=Object.keys(s)[0],e=s[t];M=this.chart.scales[t].getPixelForValue(e)}k=this._getYAxisLabelAlignment(f).textAlign}"y"===e&&("start"===h?A="top":"end"===h&&(A="bottom"));const T=this._getLabelSizes();for(x=0,_=l.length;x<_;++x){y=l[x],v=y.label;const t=a.setContext(this.getContext(x));S=this.getPixelForTick(x)+a.labelOffset,P=this._resolveTickFontOptions(x),D=P.lineHeight,C=n(v)?v.length:1;const e=C/2,i=t.color,o=t.textStrokeColor,h=t.textStrokeWidth;let d,f=k;if(r?(M=S,"inner"===k&&(f=x===_-1?this.options.reverse?"left":"right":0===x?this.options.reverse?"right":"left":"center"),O="top"===s?"near"===c||0!==m?-C*D+D/2:"center"===c?-T.highest.height/2-e*D+D:-T.highest.height+D/2:"near"===c||0!==m?D/2:"center"===c?T.highest.height/2-e*D:T.highest.height-C*D,u&&(O*=-1),0===m||t.showLabelBackdrop||(M+=D/2*Math.sin(m))):(w=S,O=(1-C)*D/2),t.showLabelBackdrop){const e=ki(t.backdropPadding),i=T.heights[x],s=T.widths[x];let n=O-e.top,o=0-e.left;switch(A){case"middle":n-=i/2;break;case"bottom":n-=i}switch(k){case"center":o-=s/2;break;case"right":o-=s;break;case"inner":x===_-1?o-=s:x>0&&(o-=s/2)}d={left:o,top:n,width:s+e.width,height:i+e.height,color:t.backdropColor}}b.push({label:v,font:P,textOffset:O,options:{rotation:m,color:i,strokeColor:o,strokeWidth:h,textAlign:f,textBaseline:A,translation:[M,w],backdrop:d}})}return b}_getXAxisLabelAlignment(){const{position:t,ticks:e}=this.options;if(-$(this.labelRotation))return"top"===t?"left":"right";let i="center";return"start"===e.align?i="left":"end"===e.align?i="right":"inner"===e.align&&(i="inner"),i}_getYAxisLabelAlignment(t){const{position:e,ticks:{crossAlign:i,mirror:s,padding:n}}=this.options,o=t+n,a=this._getLabelSizes().widest.width;let r,l;return"left"===e?s?(l=this.right+n,"near"===i?r="left":"center"===i?(r="center",l+=a/2):(r="right",l+=a)):(l=this.right-o,"near"===i?r="right":"center"===i?(r="center",l-=a/2):(r="left",l=this.left)):"right"===e?s?(l=this.left+n,"near"===i?r="right":"center"===i?(r="center",l-=a/2):(r="left",l-=a)):(l=this.left+o,"near"===i?r="left":"center"===i?(r="center",l+=a/2):(r="right",l=this.right)):r="right",{textAlign:r,x:l}}_computeLabelArea(){if(this.options.ticks.mirror)return;const t=this.chart,e=this.options.position;return"left"===e||"right"===e?{top:0,left:this.left,bottom:t.height,right:this.right}:"top"===e||"bottom"===e?{top:this.top,left:0,bottom:this.bottom,right:t.width}:void 0}drawBackground(){const{ctx:t,options:{backgroundColor:e},left:i,top:s,width:n,height:o}=this;e&&(t.save(),t.fillStyle=e,t.fillRect(i,s,n,o),t.restore())}getLineWidthForValue(t){const e=this.options.grid;if(!this._isVisible()||!e.display)return 0;const i=this.ticks.findIndex((e=>e.value===t));if(i>=0){return e.setContext(this.getContext(i)).lineWidth}return 0}drawGrid(t){const e=this.options.grid,i=this.ctx,s=this._gridLineItems||(this._gridLineItems=this._computeGridLineItems(t));let n,o;const a=(t,e,s)=>{s.width&&s.color&&(i.save(),i.lineWidth=s.width,i.strokeStyle=s.color,i.setLineDash(s.borderDash||[]),i.lineDashOffset=s.borderDashOffset,i.beginPath(),i.moveTo(t.x,t.y),i.lineTo(e.x,e.y),i.stroke(),i.restore())};if(e.display)for(n=0,o=s.length;n<o;++n){const t=s[n];e.drawOnChartArea&&a({x:t.x1,y:t.y1},{x:t.x2,y:t.y2},t),e.drawTicks&&a({x:t.tx1,y:t.ty1},{x:t.tx2,y:t.ty2},{color:t.tickColor,width:t.tickWidth,borderDash:t.tickBorderDash,borderDashOffset:t.tickBorderDashOffset})}}drawBorder(){const{chart:t,ctx:e,options:{border:i,grid:s}}=this,n=i.setContext(this.getContext()),o=i.display?n.width:0;if(!o)return;const a=s.setContext(this.getContext(0)).lineWidth,r=this._borderValue;let l,h,c,d;this.isHorizontal()?(l=Ae(t,this.left,o)-o/2,h=Ae(t,this.right,a)+a/2,c=d=r):(c=Ae(t,this.top,o)-o/2,d=Ae(t,this.bottom,a)+a/2,l=h=r),e.save(),e.lineWidth=n.width,e.strokeStyle=n.color,e.beginPath(),e.moveTo(l,c),e.lineTo(h,d),e.stroke(),e.restore()}drawLabels(t){if(!this.options.ticks.display)return;const e=this.ctx,i=this._computeLabelArea();i&&Ie(e,i);const s=this.getLabelItems(t);for(const t of s){const i=t.options,s=t.font;Ne(e,t.label,0,t.textOffset,s,i)}i&&ze(e)}drawTitle(){const{ctx:t,options:{position:e,title:i,reverse:s}}=this;if(!i.display)return;const a=Si(i.font),r=ki(i.padding),l=i.align;let h=a.lineHeight/2;"bottom"===e||"center"===e||o(e)?(h+=r.bottom,n(i.text)&&(h+=a.lineHeight*(i.text.length-1))):h+=r.top;const{titleX:c,titleY:d,maxWidth:u,rotation:f}=function(t,e,i,s){const{top:n,left:a,bottom:r,right:l,chart:h}=t,{chartArea:c,scales:d}=h;let u,f,g,p=0;const m=r-n,b=l-a;if(t.isHorizontal()){if(f=ft(s,a,l),o(i)){const t=Object.keys(i)[0],s=i[t];g=d[t].getPixelForValue(s)+m-e}else g="center"===i?(c.bottom+c.top)/2+m-e:Ys(t,i,e);u=l-a}else{if(o(i)){const t=Object.keys(i)[0],s=i[t];f=d[t].getPixelForValue(s)-b+e}else f="center"===i?(c.left+c.right)/2-b+e:Ys(t,i,e);g=ft(s,r,n),p="left"===i?-E:E}return{titleX:f,titleY:g,maxWidth:u,rotation:p}}(this,h,e,l);Ne(t,i.text,0,0,a,{color:i.color,maxWidth:u,rotation:f,textAlign:Zs(l,e,s),textBaseline:"middle",translation:[c,d]})}draw(t){this._isVisible()&&(this.drawBackground(),this.drawGrid(t),this.drawBorder(),this.drawTitle(),this.drawLabels(t))}_layers(){const t=this.options,e=t.ticks&&t.ticks.z||0,i=l(t.grid&&t.grid.z,-1),s=l(t.border&&t.border.z,0);return this._isVisible()&&this.draw===Js.prototype.draw?[{z:i,draw:t=>{this.drawBackground(),this.drawGrid(t),this.drawTitle()}},{z:s,draw:()=>{this.drawBorder()}},{z:e,draw:t=>{this.drawLabels(t)}}]:[{z:e,draw:t=>{this.draw(t)}}]}getMatchingVisibleMetas(t){const e=this.chart.getSortedVisibleDatasetMetas(),i=this.axis+"AxisID",s=[];let n,o;for(n=0,o=e.length;n<o;++n){const o=e[n];o[i]!==this.id||t&&o.type!==t||s.push(o)}return s}_resolveTickFontOptions(t){return Si(this.options.ticks.setContext(this.getContext(t)).font)}_maxDigits(){const t=this._resolveTickFontOptions(0).lineHeight;return(this.isHorizontal()?this.width:this.height)/t}}class Qs{constructor(t,e,i){this.type=t,this.scope=e,this.override=i,this.items=Object.create(null)}isForType(t){return Object.prototype.isPrototypeOf.call(this.type.prototype,t.prototype)}register(t){const e=Object.getPrototypeOf(t);let i;(function(t){return"id"in t&&"defaults"in t})(e)&&(i=this.register(e));const s=this.items,n=t.id,o=this.scope+"."+n;if(!n)throw new Error("class does not have id: "+t);return n in s||(s[n]=t,function(t,e,i){const s=b(Object.create(null),[i?ue.get(i):{},ue.get(e),t.defaults]);ue.set(e,s),t.defaultRoutes&&function(t,e){Object.keys(e).forEach((i=>{const s=i.split("."),n=s.pop(),o=[t].concat(s).join("."),a=e[i].split("."),r=a.pop(),l=a.join(".");ue.route(o,n,l,r)}))}(e,t.defaultRoutes);t.descriptors&&ue.describe(e,t.descriptors)}(t,o,i),this.override&&ue.override(t.id,t.overrides)),o}get(t){return this.items[t]}unregister(t){const e=this.items,i=t.id,s=this.scope;i in e&&delete e[i],s&&i in ue[s]&&(delete ue[s][i],this.override&&delete re[i])}}class tn{constructor(){this.controllers=new Qs(Ns,"datasets",!0),this.elements=new Qs(Hs,"elements"),this.plugins=new Qs(Object,"plugins"),this.scales=new Qs(Js,"scales"),this._typedRegistries=[this.controllers,this.scales,this.elements]}add(...t){this._each("register",t)}remove(...t){this._each("unregister",t)}addControllers(...t){this._each("register",t,this.controllers)}addElements(...t){this._each("register",t,this.elements)}addPlugins(...t){this._each("register",t,this.plugins)}addScales(...t){this._each("register",t,this.scales)}getController(t){return this._get(t,this.controllers,"controller")}getElement(t){return this._get(t,this.elements,"element")}getPlugin(t){return this._get(t,this.plugins,"plugin")}getScale(t){return this._get(t,this.scales,"scale")}removeControllers(...t){this._each("unregister",t,this.controllers)}removeElements(...t){this._each("unregister",t,this.elements)}removePlugins(...t){this._each("unregister",t,this.plugins)}removeScales(...t){this._each("unregister",t,this.scales)}_each(t,e,i){[...e].forEach((e=>{const s=i||this._getRegistryForType(e);i||s.isForType(e)||s===this.plugins&&e.id?this._exec(t,s,e):u(e,(e=>{const s=i||this._getRegistryForType(e);this._exec(t,s,e)}))}))}_exec(t,e,i){const s=w(t);d(i["before"+s],[],i),e[t](i),d(i["after"+s],[],i)}_getRegistryForType(t){for(let e=0;e<this._typedRegistries.length;e++){const i=this._typedRegistries[e];if(i.isForType(t))return i}return this.plugins}_get(t,e,i){const s=e.get(t);if(void 0===s)throw new Error('"'+t+'" is not a registered '+i+".");return s}}var en=new tn;class sn{constructor(){this._init=[]}notify(t,e,i,s){"beforeInit"===e&&(this._init=this._createDescriptors(t,!0),this._notify(this._init,t,"install"));const n=s?this._descriptors(t).filter(s):this._descriptors(t),o=this._notify(n,t,e,i);return"afterDestroy"===e&&(this._notify(n,t,"stop"),this._notify(this._init,t,"uninstall")),o}_notify(t,e,i,s){s=s||{};for(const n of t){const t=n.plugin;if(!1===d(t[i],[e,s,n.options],t)&&s.cancelable)return!1}return!0}invalidate(){s(this._cache)||(this._oldCache=this._cache,this._cache=void 0)}_descriptors(t){if(this._cache)return this._cache;const e=this._cache=this._createDescriptors(t);return this._notifyStateChanges(t),e}_createDescriptors(t,e){const i=t&&t.config,s=l(i.options&&i.options.plugins,{}),n=function(t){const e={},i=[],s=Object.keys(en.plugins.items);for(let t=0;t<s.length;t++)i.push(en.getPlugin(s[t]));const n=t.plugins||[];for(let t=0;t<n.length;t++){const s=n[t];-1===i.indexOf(s)&&(i.push(s),e[s.id]=!0)}return{plugins:i,localIds:e}}(i);return!1!==s||e?function(t,{plugins:e,localIds:i},s,n){const o=[],a=t.getContext();for(const r of e){const e=r.id,l=nn(s[e],n);null!==l&&o.push({plugin:r,options:on(t.config,{plugin:r,local:i[e]},l,a)})}return o}(t,n,s,e):[]}_notifyStateChanges(t){const e=this._oldCache||[],i=this._cache,s=(t,e)=>t.filter((t=>!e.some((e=>t.plugin.id===e.plugin.id))));this._notify(s(e,i),t,"stop"),this._notify(s(i,e),t,"start")}}function nn(t,e){return e||!1!==t?!0===t?{}:t:null}function on(t,{plugin:e,local:i},s,n){const o=t.pluginScopeKeys(e),a=t.getOptionScopes(s,o);return i&&e.defaults&&a.push(e.defaults),t.createResolver(a,n,[""],{scriptable:!1,indexable:!1,allKeys:!0})}function an(t,e){const i=ue.datasets[t]||{};return((e.datasets||{})[t]||{}).indexAxis||e.indexAxis||i.indexAxis||"x"}function rn(t){if("x"===t||"y"===t||"r"===t)return t}function ln(t,...e){if(rn(t))return t;for(const s of e){const e=s.axis||("top"===(i=s.position)||"bottom"===i?"x":"left"===i||"right"===i?"y":void 0)||t.length>1&&rn(t[0].toLowerCase());if(e)return e}var i;throw new Error(`Cannot determine type of '${t}' axis. Please provide 'axis' or 'position' option.`)}function hn(t,e,i){if(i[e+"AxisID"]===t)return{axis:e}}function cn(t,e){const i=re[t.type]||{scales:{}},s=e.scales||{},n=an(t.type,e),a=Object.create(null);return Object.keys(s).forEach((e=>{const r=s[e];if(!o(r))return console.error(`Invalid scale configuration for scale: ${e}`);if(r._proxy)return console.warn(`Ignoring resolver passed as options for scale: ${e}`);const l=ln(e,r,function(t,e){if(e.data&&e.data.datasets){const i=e.data.datasets.filter((e=>e.xAxisID===t||e.yAxisID===t));if(i.length)return hn(t,"x",i[0])||hn(t,"y",i[0])}return{}}(e,t),ue.scales[r.type]),h=function(t,e){return t===e?"_index_":"_value_"}(l,n),c=i.scales||{};a[e]=x(Object.create(null),[{axis:l},r,c[l],c[h]])})),t.data.datasets.forEach((i=>{const n=i.type||t.type,o=i.indexAxis||an(n,e),r=(re[n]||{}).scales||{};Object.keys(r).forEach((t=>{const e=function(t,e){let i=t;return"_index_"===t?i=e:"_value_"===t&&(i="x"===e?"y":"x"),i}(t,o),n=i[e+"AxisID"]||e;a[n]=a[n]||Object.create(null),x(a[n],[{axis:e},s[n],r[t]])}))})),Object.keys(a).forEach((t=>{const e=a[t];x(e,[ue.scales[e.type],ue.scale])})),a}function dn(t){const e=t.options||(t.options={});e.plugins=l(e.plugins,{}),e.scales=cn(t,e)}function un(t){return(t=t||{}).datasets=t.datasets||[],t.labels=t.labels||[],t}const fn=new Map,gn=new Set;function pn(t,e){let i=fn.get(t);return i||(i=e(),fn.set(t,i),gn.add(i)),i}const mn=(t,e,i)=>{const s=M(e,i);void 0!==s&&t.add(s)};class bn{constructor(t){this._config=function(t){return(t=t||{}).data=un(t.data),dn(t),t}(t),this._scopeCache=new Map,this._resolverCache=new Map}get platform(){return this._config.platform}get type(){return this._config.type}set type(t){this._config.type=t}get data(){return this._config.data}set data(t){this._config.data=un(t)}get options(){return this._config.options}set options(t){this._config.options=t}get plugins(){return this._config.plugins}update(){const t=this._config;this.clearCache(),dn(t)}clearCache(){this._scopeCache.clear(),this._resolverCache.clear()}datasetScopeKeys(t){return pn(t,(()=>[[`datasets.${t}`,""]]))}datasetAnimationScopeKeys(t,e){return pn(`${t}.transition.${e}`,(()=>[[`datasets.${t}.transitions.${e}`,`transitions.${e}`],[`datasets.${t}`,""]]))}datasetElementScopeKeys(t,e){return pn(`${t}-${e}`,(()=>[[`datasets.${t}.elements.${e}`,`datasets.${t}`,`elements.${e}`,""]]))}pluginScopeKeys(t){const e=t.id;return pn(`${this.type}-plugin-${e}`,(()=>[[`plugins.${e}`,...t.additionalOptionScopes||[]]]))}_cachedScopes(t,e){const i=this._scopeCache;let s=i.get(t);return s&&!e||(s=new Map,i.set(t,s)),s}getOptionScopes(t,e,i){const{options:s,type:n}=this,o=this._cachedScopes(t,i),a=o.get(e);if(a)return a;const r=new Set;e.forEach((e=>{t&&(r.add(t),e.forEach((e=>mn(r,t,e)))),e.forEach((t=>mn(r,s,t))),e.forEach((t=>mn(r,re[n]||{},t))),e.forEach((t=>mn(r,ue,t))),e.forEach((t=>mn(r,le,t)))}));const l=Array.from(r);return 0===l.length&&l.push(Object.create(null)),gn.has(e)&&o.set(e,l),l}chartOptionScopes(){const{options:t,type:e}=this;return[t,re[e]||{},ue.datasets[e]||{},{type:e},ue,le]}resolveNamedOptions(t,e,i,s=[""]){const o={$shared:!0},{resolver:a,subPrefixes:r}=xn(this._resolverCache,t,s);let l=a;if(function(t,e){const{isScriptable:i,isIndexable:s}=Ye(t);for(const o of e){const e=i(o),a=s(o),r=(a||e)&&t[o];if(e&&(S(r)||_n(r))||a&&n(r))return!0}return!1}(a,e)){o.$shared=!1;l=$e(a,i=S(i)?i():i,this.createResolver(t,i,r))}for(const t of e)o[t]=l[t];return o}createResolver(t,e,i=[""],s){const{resolver:n}=xn(this._resolverCache,t,i);return o(e)?$e(n,e,void 0,s):n}}function xn(t,e,i){let s=t.get(e);s||(s=new Map,t.set(e,s));const n=i.join();let o=s.get(n);if(!o){o={resolver:je(e,i),subPrefixes:i.filter((t=>!t.toLowerCase().includes("hover")))},s.set(n,o)}return o}const _n=t=>o(t)&&Object.getOwnPropertyNames(t).some((e=>S(t[e])));const yn=["top","bottom","left","right","chartArea"];function vn(t,e){return"top"===t||"bottom"===t||-1===yn.indexOf(t)&&"x"===e}function Mn(t,e){return function(i,s){return i[t]===s[t]?i[e]-s[e]:i[t]-s[t]}}function wn(t){const e=t.chart,i=e.options.animation;e.notifyPlugins("afterRender"),d(i&&i.onComplete,[t],e)}function kn(t){const e=t.chart,i=e.options.animation;d(i&&i.onProgress,[t],e)}function Sn(t){return fe()&&"string"==typeof t?t=document.getElementById(t):t&&t.length&&(t=t[0]),t&&t.canvas&&(t=t.canvas),t}const Pn={},Dn=t=>{const e=Sn(t);return Object.values(Pn).filter((t=>t.canvas===e)).pop()};function Cn(t,e,i){const s=Object.keys(t);for(const n of s){const s=+n;if(s>=e){const o=t[n];delete t[n],(i>0||s>e)&&(t[s+i]=o)}}}function On(t,e,i){return t.options.clip?t[i]:e[i]}class An{static defaults=ue;static instances=Pn;static overrides=re;static registry=en;static version="4.4.6";static getChart=Dn;static register(...t){en.add(...t),Tn()}static unregister(...t){en.remove(...t),Tn()}constructor(t,e){const s=this.config=new bn(e),n=Sn(t),o=Dn(n);if(o)throw new Error("Canvas is already in use. Chart with ID '"+o.id+"' must be destroyed before the canvas with ID '"+o.canvas.id+"' can be reused.");const a=s.createResolver(s.chartOptionScopes(),this.getContext());this.platform=new(s.platform||ks(n)),this.platform.updateConfig(s);const r=this.platform.acquireContext(n,a.aspectRatio),l=r&&r.canvas,h=l&&l.height,c=l&&l.width;this.id=i(),this.ctx=r,this.canvas=l,this.width=c,this.height=h,this._options=a,this._aspectRatio=this.aspectRatio,this._layers=[],this._metasets=[],this._stacks=void 0,this.boxes=[],this.currentDevicePixelRatio=void 0,this.chartArea=void 0,this._active=[],this._lastEvent=void 0,this._listeners={},this._responsiveListeners=void 0,this._sortedMetasets=[],this.scales={},this._plugins=new sn,this.$proxies={},this._hiddenIndices={},this.attached=!1,this._animationsDisabled=void 0,this.$context=void 0,this._doResize=dt((t=>this.update(t)),a.resizeDelay||0),this._dataChanges=[],Pn[this.id]=this,r&&l?(xt.listen(this,"complete",wn),xt.listen(this,"progress",kn),this._initialize(),this.attached&&this.update()):console.error("Failed to create chart: can't acquire context from the given item")}get aspectRatio(){const{options:{aspectRatio:t,maintainAspectRatio:e},width:i,height:n,_aspectRatio:o}=this;return s(t)?e&&o?o:n?i/n:null:t}get data(){return this.config.data}set data(t){this.config.data=t}get options(){return this._options}set options(t){this.config.options=t}get registry(){return en}_initialize(){return this.notifyPlugins("beforeInit"),this.options.responsive?this.resize():ke(this,this.options.devicePixelRatio),this.bindEvents(),this.notifyPlugins("afterInit"),this}clear(){return Te(this.canvas,this.ctx),this}stop(){return xt.stop(this),this}resize(t,e){xt.running(this)?this._resizeBeforeDraw={width:t,height:e}:this._resize(t,e)}_resize(t,e){const i=this.options,s=this.canvas,n=i.maintainAspectRatio&&this.aspectRatio,o=this.platform.getMaximumSize(s,t,e,n),a=i.devicePixelRatio||this.platform.getDevicePixelRatio(),r=this.width?"resize":"attach";this.width=o.width,this.height=o.height,this._aspectRatio=this.aspectRatio,ke(this,a,!0)&&(this.notifyPlugins("resize",{size:o}),d(i.onResize,[this,o],this),this.attached&&this._doResize(r)&&this.render())}ensureScalesHaveIDs(){u(this.options.scales||{},((t,e)=>{t.id=e}))}buildOrUpdateScales(){const t=this.options,e=t.scales,i=this.scales,s=Object.keys(i).reduce(((t,e)=>(t[e]=!1,t)),{});let n=[];e&&(n=n.concat(Object.keys(e).map((t=>{const i=e[t],s=ln(t,i),n="r"===s,o="x"===s;return{options:i,dposition:n?"chartArea":o?"bottom":"left",dtype:n?"radialLinear":o?"category":"linear"}})))),u(n,(e=>{const n=e.options,o=n.id,a=ln(o,n),r=l(n.type,e.dtype);void 0!==n.position&&vn(n.position,a)===vn(e.dposition)||(n.position=e.dposition),s[o]=!0;let h=null;if(o in i&&i[o].type===r)h=i[o];else{h=new(en.getScale(r))({id:o,type:r,ctx:this.ctx,chart:this}),i[h.id]=h}h.init(n,t)})),u(s,((t,e)=>{t||delete i[e]})),u(i,(t=>{as.configure(this,t,t.options),as.addBox(this,t)}))}_updateMetasets(){const t=this._metasets,e=this.data.datasets.length,i=t.length;if(t.sort(((t,e)=>t.index-e.index)),i>e){for(let t=e;t<i;++t)this._destroyDatasetMeta(t);t.splice(e,i-e)}this._sortedMetasets=t.slice(0).sort(Mn("order","index"))}_removeUnreferencedMetasets(){const{_metasets:t,data:{datasets:e}}=this;t.length>e.length&&delete this._stacks,t.forEach(((t,i)=>{0===e.filter((e=>e===t._dataset)).length&&this._destroyDatasetMeta(i)}))}buildOrUpdateControllers(){const t=[],e=this.data.datasets;let i,s;for(this._removeUnreferencedMetasets(),i=0,s=e.length;i<s;i++){const s=e[i];let n=this.getDatasetMeta(i);const o=s.type||this.config.type;if(n.type&&n.type!==o&&(this._destroyDatasetMeta(i),n=this.getDatasetMeta(i)),n.type=o,n.indexAxis=s.indexAxis||an(o,this.options),n.order=s.order||0,n.index=i,n.label=""+s.label,n.visible=this.isDatasetVisible(i),n.controller)n.controller.updateIndex(i),n.controller.linkScales();else{const e=en.getController(o),{datasetElementType:s,dataElementType:a}=ue.datasets[o];Object.assign(e,{dataElementType:en.getElement(a),datasetElementType:s&&en.getElement(s)}),n.controller=new e(this,i),t.push(n.controller)}}return this._updateMetasets(),t}_resetElements(){u(this.data.datasets,((t,e)=>{this.getDatasetMeta(e).controller.reset()}),this)}reset(){this._resetElements(),this.notifyPlugins("reset")}update(t){const e=this.config;e.update();const i=this._options=e.createResolver(e.chartOptionScopes(),this.getContext()),s=this._animationsDisabled=!i.animation;if(this._updateScales(),this._checkEventBindings(),this._updateHiddenIndices(),this._plugins.invalidate(),!1===this.notifyPlugins("beforeUpdate",{mode:t,cancelable:!0}))return;const n=this.buildOrUpdateControllers();this.notifyPlugins("beforeElementsUpdate");let o=0;for(let t=0,e=this.data.datasets.length;t<e;t++){const{controller:e}=this.getDatasetMeta(t),i=!s&&-1===n.indexOf(e);e.buildOrUpdateElements(i),o=Math.max(+e.getMaxOverflow(),o)}o=this._minPadding=i.layout.autoPadding?o:0,this._updateLayout(o),s||u(n,(t=>{t.reset()})),this._updateDatasets(t),this.notifyPlugins("afterUpdate",{mode:t}),this._layers.sort(Mn("z","_idx"));const{_active:a,_lastEvent:r}=this;r?this._eventHandler(r,!0):a.length&&this._updateHoverStyles(a,a,!0),this.render()}_updateScales(){u(this.scales,(t=>{as.removeBox(this,t)})),this.ensureScalesHaveIDs(),this.buildOrUpdateScales()}_checkEventBindings(){const t=this.options,e=new Set(Object.keys(this._listeners)),i=new Set(t.events);P(e,i)&&!!this._responsiveListeners===t.responsive||(this.unbindEvents(),this.bindEvents())}_updateHiddenIndices(){const{_hiddenIndices:t}=this,e=this._getUniformDataChanges()||[];for(const{method:i,start:s,count:n}of e){Cn(t,s,"_removeElements"===i?-n:n)}}_getUniformDataChanges(){const t=this._dataChanges;if(!t||!t.length)return;this._dataChanges=[];const e=this.data.datasets.length,i=e=>new Set(t.filter((t=>t[0]===e)).map(((t,e)=>e+","+t.splice(1).join(",")))),s=i(0);for(let t=1;t<e;t++)if(!P(s,i(t)))return;return Array.from(s).map((t=>t.split(","))).map((t=>({method:t[1],start:+t[2],count:+t[3]})))}_updateLayout(t){if(!1===this.notifyPlugins("beforeLayout",{cancelable:!0}))return;as.update(this,this.width,this.height,t);const e=this.chartArea,i=e.width<=0||e.height<=0;this._layers=[],u(this.boxes,(t=>{i&&"chartArea"===t.position||(t.configure&&t.configure(),this._layers.push(...t._layers()))}),this),this._layers.forEach(((t,e)=>{t._idx=e})),this.notifyPlugins("afterLayout")}_updateDatasets(t){if(!1!==this.notifyPlugins("beforeDatasetsUpdate",{mode:t,cancelable:!0})){for(let t=0,e=this.data.datasets.length;t<e;++t)this.getDatasetMeta(t).controller.configure();for(let e=0,i=this.data.datasets.length;e<i;++e)this._updateDataset(e,S(t)?t({datasetIndex:e}):t);this.notifyPlugins("afterDatasetsUpdate",{mode:t})}}_updateDataset(t,e){const i=this.getDatasetMeta(t),s={meta:i,index:t,mode:e,cancelable:!0};!1!==this.notifyPlugins("beforeDatasetUpdate",s)&&(i.controller._update(e),s.cancelable=!1,this.notifyPlugins("afterDatasetUpdate",s))}render(){!1!==this.notifyPlugins("beforeRender",{cancelable:!0})&&(xt.has(this)?this.attached&&!xt.running(this)&&xt.start(this):(this.draw(),wn({chart:this})))}draw(){let t;if(this._resizeBeforeDraw){const{width:t,height:e}=this._resizeBeforeDraw;this._resizeBeforeDraw=null,this._resize(t,e)}if(this.clear(),this.width<=0||this.height<=0)return;if(!1===this.notifyPlugins("beforeDraw",{cancelable:!0}))return;const e=this._layers;for(t=0;t<e.length&&e[t].z<=0;++t)e[t].draw(this.chartArea);for(this._drawDatasets();t<e.length;++t)e[t].draw(this.chartArea);this.notifyPlugins("afterDraw")}_getSortedDatasetMetas(t){const e=this._sortedMetasets,i=[];let s,n;for(s=0,n=e.length;s<n;++s){const n=e[s];t&&!n.visible||i.push(n)}return i}getSortedVisibleDatasetMetas(){return this._getSortedDatasetMetas(!0)}_drawDatasets(){if(!1===this.notifyPlugins("beforeDatasetsDraw",{cancelable:!0}))return;const t=this.getSortedVisibleDatasetMetas();for(let e=t.length-1;e>=0;--e)this._drawDataset(t[e]);this.notifyPlugins("afterDatasetsDraw")}_drawDataset(t){const e=this.ctx,i=t._clip,s=!i.disabled,n=function(t,e){const{xScale:i,yScale:s}=t;return i&&s?{left:On(i,e,"left"),right:On(i,e,"right"),top:On(s,e,"top"),bottom:On(s,e,"bottom")}:e}(t,this.chartArea),o={meta:t,index:t.index,cancelable:!0};!1!==this.notifyPlugins("beforeDatasetDraw",o)&&(s&&Ie(e,{left:!1===i.left?0:n.left-i.left,right:!1===i.right?this.width:n.right+i.right,top:!1===i.top?0:n.top-i.top,bottom:!1===i.bottom?this.height:n.bottom+i.bottom}),t.controller.draw(),s&&ze(e),o.cancelable=!1,this.notifyPlugins("afterDatasetDraw",o))}isPointInArea(t){return Re(t,this.chartArea,this._minPadding)}getElementsAtEventForMode(t,e,i,s){const n=Xi.modes[e];return"function"==typeof n?n(this,t,i,s):[]}getDatasetMeta(t){const e=this.data.datasets[t],i=this._metasets;let s=i.filter((t=>t&&t._dataset===e)).pop();return s||(s={type:null,data:[],dataset:null,controller:null,hidden:null,xAxisID:null,yAxisID:null,order:e&&e.order||0,index:t,_dataset:e,_parsed:[],_sorted:!1},i.push(s)),s}getContext(){return this.$context||(this.$context=Ci(null,{chart:this,type:"chart"}))}getVisibleDatasetCount(){return this.getSortedVisibleDatasetMetas().length}isDatasetVisible(t){const e=this.data.datasets[t];if(!e)return!1;const i=this.getDatasetMeta(t);return"boolean"==typeof i.hidden?!i.hidden:!e.hidden}setDatasetVisibility(t,e){this.getDatasetMeta(t).hidden=!e}toggleDataVisibility(t){this._hiddenIndices[t]=!this._hiddenIndices[t]}getDataVisibility(t){return!this._hiddenIndices[t]}_updateVisibility(t,e,i){const s=i?"show":"hide",n=this.getDatasetMeta(t),o=n.controller._resolveAnimations(void 0,s);k(e)?(n.data[e].hidden=!i,this.update()):(this.setDatasetVisibility(t,i),o.update(n,{visible:i}),this.update((e=>e.datasetIndex===t?s:void 0)))}hide(t,e){this._updateVisibility(t,e,!1)}show(t,e){this._updateVisibility(t,e,!0)}_destroyDatasetMeta(t){const e=this._metasets[t];e&&e.controller&&e.controller._destroy(),delete this._metasets[t]}_stop(){let t,e;for(this.stop(),xt.remove(this),t=0,e=this.data.datasets.length;t<e;++t)this._destroyDatasetMeta(t)}destroy(){this.notifyPlugins("beforeDestroy");const{canvas:t,ctx:e}=this;this._stop(),this.config.clearCache(),t&&(this.unbindEvents(),Te(t,e),this.platform.releaseContext(e),this.canvas=null,this.ctx=null),delete Pn[this.id],this.notifyPlugins("afterDestroy")}toBase64Image(...t){return this.canvas.toDataURL(...t)}bindEvents(){this.bindUserEvents(),this.options.responsive?this.bindResponsiveEvents():this.attached=!0}bindUserEvents(){const t=this._listeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(t,e,i)=>{t.offsetX=e,t.offsetY=i,this._eventHandler(t)};u(this.options.events,(t=>i(t,s)))}bindResponsiveEvents(){this._responsiveListeners||(this._responsiveListeners={});const t=this._responsiveListeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(i,s)=>{t[i]&&(e.removeEventListener(this,i,s),delete t[i])},n=(t,e)=>{this.canvas&&this.resize(t,e)};let o;const a=()=>{s("attach",a),this.attached=!0,this.resize(),i("resize",n),i("detach",o)};o=()=>{this.attached=!1,s("resize",n),this._stop(),this._resize(0,0),i("attach",a)},e.isAttached(this.canvas)?a():o()}unbindEvents(){u(this._listeners,((t,e)=>{this.platform.removeEventListener(this,e,t)})),this._listeners={},u(this._responsiveListeners,((t,e)=>{this.platform.removeEventListener(this,e,t)})),this._responsiveListeners=void 0}updateHoverStyle(t,e,i){const s=i?"set":"remove";let n,o,a,r;for("dataset"===e&&(n=this.getDatasetMeta(t[0].datasetIndex),n.controller["_"+s+"DatasetHoverStyle"]()),a=0,r=t.length;a<r;++a){o=t[a];const e=o&&this.getDatasetMeta(o.datasetIndex).controller;e&&e[s+"HoverStyle"](o.element,o.datasetIndex,o.index)}}getActiveElements(){return this._active||[]}setActiveElements(t){const e=this._active||[],i=t.map((({datasetIndex:t,index:e})=>{const i=this.getDatasetMeta(t);if(!i)throw new Error("No dataset found at index "+t);return{datasetIndex:t,element:i.data[e],index:e}}));!f(i,e)&&(this._active=i,this._lastEvent=null,this._updateHoverStyles(i,e))}notifyPlugins(t,e,i){return this._plugins.notify(this,t,e,i)}isPluginEnabled(t){return 1===this._plugins._cache.filter((e=>e.plugin.id===t)).length}_updateHoverStyles(t,e,i){const s=this.options.hover,n=(t,e)=>t.filter((t=>!e.some((e=>t.datasetIndex===e.datasetIndex&&t.index===e.index)))),o=n(e,t),a=i?t:n(t,e);o.length&&this.updateHoverStyle(o,s.mode,!1),a.length&&s.mode&&this.updateHoverStyle(a,s.mode,!0)}_eventHandler(t,e){const i={event:t,replay:e,cancelable:!0,inChartArea:this.isPointInArea(t)},s=e=>(e.options.events||this.options.events).includes(t.native.type);if(!1===this.notifyPlugins("beforeEvent",i,s))return;const n=this._handleEvent(t,e,i.inChartArea);return i.cancelable=!1,this.notifyPlugins("afterEvent",i,s),(n||i.changed)&&this.render(),this}_handleEvent(t,e,i){const{_active:s=[],options:n}=this,o=e,a=this._getActiveElements(t,s,i,o),r=D(t),l=function(t,e,i,s){return i&&"mouseout"!==t.type?s?e:t:null}(t,this._lastEvent,i,r);i&&(this._lastEvent=null,d(n.onHover,[t,a,this],this),r&&d(n.onClick,[t,a,this],this));const h=!f(a,s);return(h||e)&&(this._active=a,this._updateHoverStyles(a,s,e)),this._lastEvent=l,h}_getActiveElements(t,e,i,s){if("mouseout"===t.type)return[];if(!i)return e;const n=this.options.hover;return this.getElementsAtEventForMode(t,n.mode,n,s)}}function Tn(){return u(An.instances,(t=>t._plugins.invalidate()))}function Ln(){throw new Error("This method is not implemented: Check that a complete date adapter is provided.")}class En{static override(t){Object.assign(En.prototype,t)}options;constructor(t){this.options=t||{}}init(){}formats(){return Ln()}parse(){return Ln()}format(){return Ln()}add(){return Ln()}diff(){return Ln()}startOf(){return Ln()}endOf(){return Ln()}}var Rn={_date:En};function In(t){const e=t.iScale,i=function(t,e){if(!t._cache.$bar){const i=t.getMatchingVisibleMetas(e);let s=[];for(let e=0,n=i.length;e<n;e++)s=s.concat(i[e].controller.getAllParsedValues(t));t._cache.$bar=lt(s.sort(((t,e)=>t-e)))}return t._cache.$bar}(e,t.type);let s,n,o,a,r=e._length;const l=()=>{32767!==o&&-32768!==o&&(k(a)&&(r=Math.min(r,Math.abs(o-a)||r)),a=o)};for(s=0,n=i.length;s<n;++s)o=e.getPixelForValue(i[s]),l();for(a=void 0,s=0,n=e.ticks.length;s<n;++s)o=e.getPixelForTick(s),l();return r}function zn(t,e,i,s){return n(t)?function(t,e,i,s){const n=i.parse(t[0],s),o=i.parse(t[1],s),a=Math.min(n,o),r=Math.max(n,o);let l=a,h=r;Math.abs(a)>Math.abs(r)&&(l=r,h=a),e[i.axis]=h,e._custom={barStart:l,barEnd:h,start:n,end:o,min:a,max:r}}(t,e,i,s):e[i.axis]=i.parse(t,s),e}function Fn(t,e,i,s){const n=t.iScale,o=t.vScale,a=n.getLabels(),r=n===o,l=[];let h,c,d,u;for(h=i,c=i+s;h<c;++h)u=e[h],d={},d[n.axis]=r||n.parse(a[h],h),l.push(zn(u,d,o,h));return l}function Vn(t){return t&&void 0!==t.barStart&&void 0!==t.barEnd}function Bn(t,e,i,s){let n=e.borderSkipped;const o={};if(!n)return void(t.borderSkipped=o);if(!0===n)return void(t.borderSkipped={top:!0,right:!0,bottom:!0,left:!0});const{start:a,end:r,reverse:l,top:h,bottom:c}=function(t){let e,i,s,n,o;return t.horizontal?(e=t.base>t.x,i="left",s="right"):(e=t.base<t.y,i="bottom",s="top"),e?(n="end",o="start"):(n="start",o="end"),{start:i,end:s,reverse:e,top:n,bottom:o}}(t);"middle"===n&&i&&(t.enableBorderRadius=!0,(i._top||0)===s?n=h:(i._bottom||0)===s?n=c:(o[Wn(c,a,r,l)]=!0,n=h)),o[Wn(n,a,r,l)]=!0,t.borderSkipped=o}function Wn(t,e,i,s){var n,o,a;return s?(a=i,t=Nn(t=(n=t)===(o=e)?a:n===a?o:n,i,e)):t=Nn(t,e,i),t}function Nn(t,e,i){return"start"===t?e:"end"===t?i:t}function Hn(t,{inflateAmount:e},i){t.inflateAmount="auto"===e?1===i?.33:0:e}class jn extends Ns{static id="doughnut";static defaults={datasetElementType:!1,dataElementType:"arc",animation:{animateRotate:!0,animateScale:!1},animations:{numbers:{type:"number",properties:["circumference","endAngle","innerRadius","outerRadius","startAngle","x","y","offset","borderWidth","spacing"]}},cutout:"50%",rotation:0,circumference:360,radius:"100%",spacing:0,indexAxis:"r"};static descriptors={_scriptable:t=>"spacing"!==t,_indexable:t=>"spacing"!==t&&!t.startsWith("borderDash")&&!t.startsWith("hoverBorderDash")};static overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:s}}=t.legend.options;return e.labels.map(((e,n)=>{const o=t.getDatasetMeta(0).controller.getStyle(n);return{text:e,fillStyle:o.backgroundColor,strokeStyle:o.borderColor,fontColor:s,lineWidth:o.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(n),index:n}}))}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}}};constructor(t,e){super(t,e),this.enableOptionSharing=!0,this.innerRadius=void 0,this.outerRadius=void 0,this.offsetX=void 0,this.offsetY=void 0}linkScales(){}parse(t,e){const i=this.getDataset().data,s=this._cachedMeta;if(!1===this._parsing)s._parsed=i;else{let n,a,r=t=>+i[t];if(o(i[t])){const{key:t="value"}=this._parsing;r=e=>+M(i[e],t)}for(n=t,a=t+e;n<a;++n)s._parsed[n]=r(n)}}_getRotation(){return $(this.options.rotation-90)}_getCircumference(){return $(this.options.circumference)}_getRotationExtents(){let t=O,e=-O;for(let i=0;i<this.chart.data.datasets.length;++i)if(this.chart.isDatasetVisible(i)&&this.chart.getDatasetMeta(i).type===this._type){const s=this.chart.getDatasetMeta(i).controller,n=s._getRotation(),o=s._getCircumference();t=Math.min(t,n),e=Math.max(e,n+o)}return{rotation:t,circumference:e-t}}update(t){const e=this.chart,{chartArea:i}=e,s=this._cachedMeta,n=s.data,o=this.getMaxBorderWidth()+this.getMaxOffset(n)+this.options.spacing,a=Math.max((Math.min(i.width,i.height)-o)/2,0),r=Math.min(h(this.options.cutout,a),1),l=this._getRingWeight(this.index),{circumference:d,rotation:u}=this._getRotationExtents(),{ratioX:f,ratioY:g,offsetX:p,offsetY:m}=function(t,e,i){let s=1,n=1,o=0,a=0;if(e<O){const r=t,l=r+e,h=Math.cos(r),c=Math.sin(r),d=Math.cos(l),u=Math.sin(l),f=(t,e,s)=>Z(t,r,l,!0)?1:Math.max(e,e*i,s,s*i),g=(t,e,s)=>Z(t,r,l,!0)?-1:Math.min(e,e*i,s,s*i),p=f(0,h,d),m=f(E,c,u),b=g(C,h,d),x=g(C+E,c,u);s=(p-b)/2,n=(m-x)/2,o=-(p+b)/2,a=-(m+x)/2}return{ratioX:s,ratioY:n,offsetX:o,offsetY:a}}(u,d,r),b=(i.width-o)/f,x=(i.height-o)/g,_=Math.max(Math.min(b,x)/2,0),y=c(this.options.radius,_),v=(y-Math.max(y*r,0))/this._getVisibleDatasetWeightTotal();this.offsetX=p*y,this.offsetY=m*y,s.total=this.calculateTotal(),this.outerRadius=y-v*this._getRingWeightOffset(this.index),this.innerRadius=Math.max(this.outerRadius-v*l,0),this.updateElements(n,0,n.length,t)}_circumference(t,e){const i=this.options,s=this._cachedMeta,n=this._getCircumference();return e&&i.animation.animateRotate||!this.chart.getDataVisibility(t)||null===s._parsed[t]||s.data[t].hidden?0:this.calculateCircumference(s._parsed[t]*n/O)}updateElements(t,e,i,s){const n="reset"===s,o=this.chart,a=o.chartArea,r=o.options.animation,l=(a.left+a.right)/2,h=(a.top+a.bottom)/2,c=n&&r.animateScale,d=c?0:this.innerRadius,u=c?0:this.outerRadius,{sharedOptions:f,includeOptions:g}=this._getSharedOptions(e,s);let p,m=this._getRotation();for(p=0;p<e;++p)m+=this._circumference(p,n);for(p=e;p<e+i;++p){const e=this._circumference(p,n),i=t[p],o={x:l+this.offsetX,y:h+this.offsetY,startAngle:m,endAngle:m+e,circumference:e,outerRadius:u,innerRadius:d};g&&(o.options=f||this.resolveDataElementOptions(p,i.active?"active":s)),m+=e,this.updateElement(i,p,o,s)}}calculateTotal(){const t=this._cachedMeta,e=t.data;let i,s=0;for(i=0;i<e.length;i++){const n=t._parsed[i];null===n||isNaN(n)||!this.chart.getDataVisibility(i)||e[i].hidden||(s+=Math.abs(n))}return s}calculateCircumference(t){const e=this._cachedMeta.total;return e>0&&!isNaN(t)?O*(Math.abs(t)/e):0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],n=ne(e._parsed[t],i.options.locale);return{label:s[t]||"",value:n}}getMaxBorderWidth(t){let e=0;const i=this.chart;let s,n,o,a,r;if(!t)for(s=0,n=i.data.datasets.length;s<n;++s)if(i.isDatasetVisible(s)){o=i.getDatasetMeta(s),t=o.data,a=o.controller;break}if(!t)return 0;for(s=0,n=t.length;s<n;++s)r=a.resolveDataElementOptions(s),"inner"!==r.borderAlign&&(e=Math.max(e,r.borderWidth||0,r.hoverBorderWidth||0));return e}getMaxOffset(t){let e=0;for(let i=0,s=t.length;i<s;++i){const t=this.resolveDataElementOptions(i);e=Math.max(e,t.offset||0,t.hoverOffset||0)}return e}_getRingWeightOffset(t){let e=0;for(let i=0;i<t;++i)this.chart.isDatasetVisible(i)&&(e+=this._getRingWeight(i));return e}_getRingWeight(t){return Math.max(l(this.chart.data.datasets[t].weight,1),0)}_getVisibleDatasetWeightTotal(){return this._getRingWeightOffset(this.chart.data.datasets.length)||1}}class $n extends Ns{static id="polarArea";static defaults={dataElementType:"arc",animation:{animateRotate:!0,animateScale:!0},animations:{numbers:{type:"number",properties:["x","y","startAngle","endAngle","innerRadius","outerRadius"]}},indexAxis:"r",startAngle:0};static overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:s}}=t.legend.options;return e.labels.map(((e,n)=>{const o=t.getDatasetMeta(0).controller.getStyle(n);return{text:e,fillStyle:o.backgroundColor,strokeStyle:o.borderColor,fontColor:s,lineWidth:o.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(n),index:n}}))}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}},scales:{r:{type:"radialLinear",angleLines:{display:!1},beginAtZero:!0,grid:{circular:!0},pointLabels:{display:!1},startAngle:0}}};constructor(t,e){super(t,e),this.innerRadius=void 0,this.outerRadius=void 0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],n=ne(e._parsed[t].r,i.options.locale);return{label:s[t]||"",value:n}}parseObjectData(t,e,i,s){return ii.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta.data;this._updateRadius(),this.updateElements(e,0,e.length,t)}getMinMax(){const t=this._cachedMeta,e={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY};return t.data.forEach(((t,i)=>{const s=this.getParsed(i).r;!isNaN(s)&&this.chart.getDataVisibility(i)&&(s<e.min&&(e.min=s),s>e.max&&(e.max=s))})),e}_updateRadius(){const t=this.chart,e=t.chartArea,i=t.options,s=Math.min(e.right-e.left,e.bottom-e.top),n=Math.max(s/2,0),o=(n-Math.max(i.cutoutPercentage?n/100*i.cutoutPercentage:1,0))/t.getVisibleDatasetCount();this.outerRadius=n-o*this.index,this.innerRadius=this.outerRadius-o}updateElements(t,e,i,s){const n="reset"===s,o=this.chart,a=o.options.animation,r=this._cachedMeta.rScale,l=r.xCenter,h=r.yCenter,c=r.getIndexAngle(0)-.5*C;let d,u=c;const f=360/this.countVisibleElements();for(d=0;d<e;++d)u+=this._computeAngle(d,s,f);for(d=e;d<e+i;d++){const e=t[d];let i=u,g=u+this._computeAngle(d,s,f),p=o.getDataVisibility(d)?r.getDistanceFromCenterForValue(this.getParsed(d).r):0;u=g,n&&(a.animateScale&&(p=0),a.animateRotate&&(i=g=c));const m={x:l,y:h,innerRadius:0,outerRadius:p,startAngle:i,endAngle:g,options:this.resolveDataElementOptions(d,e.active?"active":s)};this.updateElement(e,d,m,s)}}countVisibleElements(){const t=this._cachedMeta;let e=0;return t.data.forEach(((t,i)=>{!isNaN(this.getParsed(i).r)&&this.chart.getDataVisibility(i)&&e++})),e}_computeAngle(t,e,i){return this.chart.getDataVisibility(t)?$(this.resolveDataElementOptions(t,e).angle||i):0}}var Yn=Object.freeze({__proto__:null,BarController:class extends Ns{static id="bar";static defaults={datasetElementType:!1,dataElementType:"bar",categoryPercentage:.8,barPercentage:.9,grouped:!0,animations:{numbers:{type:"number",properties:["x","y","base","width","height"]}}};static overrides={scales:{_index_:{type:"category",offset:!0,grid:{offset:!0}},_value_:{type:"linear",beginAtZero:!0}}};parsePrimitiveData(t,e,i,s){return Fn(t,e,i,s)}parseArrayData(t,e,i,s){return Fn(t,e,i,s)}parseObjectData(t,e,i,s){const{iScale:n,vScale:o}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l="x"===n.axis?a:r,h="x"===o.axis?a:r,c=[];let d,u,f,g;for(d=i,u=i+s;d<u;++d)g=e[d],f={},f[n.axis]=n.parse(M(g,l),d),c.push(zn(M(g,h),f,o,d));return c}updateRangeFromParsed(t,e,i,s){super.updateRangeFromParsed(t,e,i,s);const n=i._custom;n&&e===this._cachedMeta.vScale&&(t.min=Math.min(t.min,n.min),t.max=Math.max(t.max,n.max))}getMaxOverflow(){return 0}getLabelAndValue(t){const e=this._cachedMeta,{iScale:i,vScale:s}=e,n=this.getParsed(t),o=n._custom,a=Vn(o)?"["+o.start+", "+o.end+"]":""+s.getLabelForValue(n[s.axis]);return{label:""+i.getLabelForValue(n[i.axis]),value:a}}initialize(){this.enableOptionSharing=!0,super.initialize();this._cachedMeta.stack=this.getDataset().stack}update(t){const e=this._cachedMeta;this.updateElements(e.data,0,e.data.length,t)}updateElements(t,e,i,n){const o="reset"===n,{index:a,_cachedMeta:{vScale:r}}=this,l=r.getBasePixel(),h=r.isHorizontal(),c=this._getRuler(),{sharedOptions:d,includeOptions:u}=this._getSharedOptions(e,n);for(let f=e;f<e+i;f++){const e=this.getParsed(f),i=o||s(e[r.axis])?{base:l,head:l}:this._calculateBarValuePixels(f),g=this._calculateBarIndexPixels(f,c),p=(e._stacks||{})[r.axis],m={horizontal:h,base:i.base,enableBorderRadius:!p||Vn(e._custom)||a===p._top||a===p._bottom,x:h?i.head:g.center,y:h?g.center:i.head,height:h?g.size:Math.abs(i.size),width:h?Math.abs(i.size):g.size};u&&(m.options=d||this.resolveDataElementOptions(f,t[f].active?"active":n));const b=m.options||t[f].options;Bn(m,b,p,a),Hn(m,b,c.ratio),this.updateElement(t[f],f,m,n)}}_getStacks(t,e){const{iScale:i}=this._cachedMeta,n=i.getMatchingVisibleMetas(this._type).filter((t=>t.controller.options.grouped)),o=i.options.stacked,a=[],r=this._cachedMeta.controller.getParsed(e),l=r&&r[i.axis],h=t=>{const e=t._parsed.find((t=>t[i.axis]===l)),n=e&&e[t.vScale.axis];if(s(n)||isNaN(n))return!0};for(const i of n)if((void 0===e||!h(i))&&((!1===o||-1===a.indexOf(i.stack)||void 0===o&&void 0===i.stack)&&a.push(i.stack),i.index===t))break;return a.length||a.push(void 0),a}_getStackCount(t){return this._getStacks(void 0,t).length}_getStackIndex(t,e,i){const s=this._getStacks(t,i),n=void 0!==e?s.indexOf(e):-1;return-1===n?s.length-1:n}_getRuler(){const t=this.options,e=this._cachedMeta,i=e.iScale,s=[];let n,o;for(n=0,o=e.data.length;n<o;++n)s.push(i.getPixelForValue(this.getParsed(n)[i.axis],n));const a=t.barThickness;return{min:a||In(e),pixels:s,start:i._startPixel,end:i._endPixel,stackCount:this._getStackCount(),scale:i,grouped:t.grouped,ratio:a?1:t.categoryPercentage*t.barPercentage}}_calculateBarValuePixels(t){const{_cachedMeta:{vScale:e,_stacked:i,index:n},options:{base:o,minBarLength:a}}=this,r=o||0,l=this.getParsed(t),h=l._custom,c=Vn(h);let d,u,f=l[e.axis],g=0,p=i?this.applyStack(e,l,i):f;p!==f&&(g=p-f,p=f),c&&(f=h.barStart,p=h.barEnd-h.barStart,0!==f&&F(f)!==F(h.barEnd)&&(g=0),g+=f);const m=s(o)||c?g:o;let b=e.getPixelForValue(m);if(d=this.chart.getDataVisibility(t)?e.getPixelForValue(g+p):b,u=d-b,Math.abs(u)<a){u=function(t,e,i){return 0!==t?F(t):(e.isHorizontal()?1:-1)*(e.min>=i?1:-1)}(u,e,r)*a,f===r&&(b-=u/2);const t=e.getPixelForDecimal(0),s=e.getPixelForDecimal(1),o=Math.min(t,s),h=Math.max(t,s);b=Math.max(Math.min(b,h),o),d=b+u,i&&!c&&(l._stacks[e.axis]._visualValues[n]=e.getValueForPixel(d)-e.getValueForPixel(b))}if(b===e.getPixelForValue(r)){const t=F(u)*e.getLineWidthForValue(r)/2;b+=t,u-=t}return{size:u,base:b,head:d,center:d+u/2}}_calculateBarIndexPixels(t,e){const i=e.scale,n=this.options,o=n.skipNull,a=l(n.maxBarThickness,1/0);let r,h;if(e.grouped){const i=o?this._getStackCount(t):e.stackCount,l="flex"===n.barThickness?function(t,e,i,s){const n=e.pixels,o=n[t];let a=t>0?n[t-1]:null,r=t<n.length-1?n[t+1]:null;const l=i.categoryPercentage;null===a&&(a=o-(null===r?e.end-e.start:r-o)),null===r&&(r=o+o-a);const h=o-(o-Math.min(a,r))/2*l;return{chunk:Math.abs(r-a)/2*l/s,ratio:i.barPercentage,start:h}}(t,e,n,i):function(t,e,i,n){const o=i.barThickness;let a,r;return s(o)?(a=e.min*i.categoryPercentage,r=i.barPercentage):(a=o*n,r=1),{chunk:a/n,ratio:r,start:e.pixels[t]-a/2}}(t,e,n,i),c=this._getStackIndex(this.index,this._cachedMeta.stack,o?t:void 0);r=l.start+l.chunk*c+l.chunk/2,h=Math.min(a,l.chunk*l.ratio)}else r=i.getPixelForValue(this.getParsed(t)[i.axis],t),h=Math.min(a,e.min*e.ratio);return{base:r-h/2,head:r+h/2,center:r,size:h}}draw(){const t=this._cachedMeta,e=t.vScale,i=t.data,s=i.length;let n=0;for(;n<s;++n)null===this.getParsed(n)[e.axis]||i[n].hidden||i[n].draw(this._ctx)}},BubbleController:class extends Ns{static id="bubble";static defaults={datasetElementType:!1,dataElementType:"point",animations:{numbers:{type:"number",properties:["x","y","borderWidth","radius"]}}};static overrides={scales:{x:{type:"linear"},y:{type:"linear"}}};initialize(){this.enableOptionSharing=!0,super.initialize()}parsePrimitiveData(t,e,i,s){const n=super.parsePrimitiveData(t,e,i,s);for(let t=0;t<n.length;t++)n[t]._custom=this.resolveDataElementOptions(t+i).radius;return n}parseArrayData(t,e,i,s){const n=super.parseArrayData(t,e,i,s);for(let t=0;t<n.length;t++){const s=e[i+t];n[t]._custom=l(s[2],this.resolveDataElementOptions(t+i).radius)}return n}parseObjectData(t,e,i,s){const n=super.parseObjectData(t,e,i,s);for(let t=0;t<n.length;t++){const s=e[i+t];n[t]._custom=l(s&&s.r&&+s.r,this.resolveDataElementOptions(t+i).radius)}return n}getMaxOverflow(){const t=this._cachedMeta.data;let e=0;for(let i=t.length-1;i>=0;--i)e=Math.max(e,t[i].size(this.resolveDataElementOptions(i))/2);return e>0&&e}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:n}=e,o=this.getParsed(t),a=s.getLabelForValue(o.x),r=n.getLabelForValue(o.y),l=o._custom;return{label:i[t]||"",value:"("+a+", "+r+(l?", "+l:"")+")"}}update(t){const e=this._cachedMeta.data;this.updateElements(e,0,e.length,t)}updateElements(t,e,i,s){const n="reset"===s,{iScale:o,vScale:a}=this._cachedMeta,{sharedOptions:r,includeOptions:l}=this._getSharedOptions(e,s),h=o.axis,c=a.axis;for(let d=e;d<e+i;d++){const e=t[d],i=!n&&this.getParsed(d),u={},f=u[h]=n?o.getPixelForDecimal(.5):o.getPixelForValue(i[h]),g=u[c]=n?a.getBasePixel():a.getPixelForValue(i[c]);u.skip=isNaN(f)||isNaN(g),l&&(u.options=r||this.resolveDataElementOptions(d,e.active?"active":s),n&&(u.options.radius=0)),this.updateElement(e,d,u,s)}}resolveDataElementOptions(t,e){const i=this.getParsed(t);let s=super.resolveDataElementOptions(t,e);s.$shared&&(s=Object.assign({},s,{$shared:!1}));const n=s.radius;return"active"!==e&&(s.radius=0),s.radius+=l(i&&i._custom,n),s}},DoughnutController:jn,LineController:class extends Ns{static id="line";static defaults={datasetElementType:"line",dataElementType:"point",showLine:!0,spanGaps:!1};static overrides={scales:{_index_:{type:"category"},_value_:{type:"linear"}}};initialize(){this.enableOptionSharing=!0,this.supportsDecimation=!0,super.initialize()}update(t){const e=this._cachedMeta,{dataset:i,data:s=[],_dataset:n}=e,o=this.chart._animationsDisabled;let{start:a,count:r}=pt(e,s,o);this._drawStart=a,this._drawCount=r,mt(e)&&(a=0,r=s.length),i._chart=this.chart,i._datasetIndex=this.index,i._decimated=!!n._decimated,i.points=s;const l=this.resolveDatasetElementOptions(t);this.options.showLine||(l.borderWidth=0),l.segment=this.options.segment,this.updateElement(i,void 0,{animated:!o,options:l},t),this.updateElements(s,a,r,t)}updateElements(t,e,i,n){const o="reset"===n,{iScale:a,vScale:r,_stacked:l,_dataset:h}=this._cachedMeta,{sharedOptions:c,includeOptions:d}=this._getSharedOptions(e,n),u=a.axis,f=r.axis,{spanGaps:g,segment:p}=this.options,m=N(g)?g:Number.POSITIVE_INFINITY,b=this.chart._animationsDisabled||o||"none"===n,x=e+i,_=t.length;let y=e>0&&this.getParsed(e-1);for(let i=0;i<_;++i){const g=t[i],_=b?g:{};if(i<e||i>=x){_.skip=!0;continue}const v=this.getParsed(i),M=s(v[f]),w=_[u]=a.getPixelForValue(v[u],i),k=_[f]=o||M?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,v,l):v[f],i);_.skip=isNaN(w)||isNaN(k)||M,_.stop=i>0&&Math.abs(v[u]-y[u])>m,p&&(_.parsed=v,_.raw=h.data[i]),d&&(_.options=c||this.resolveDataElementOptions(i,g.active?"active":n)),b||this.updateElement(g,i,_,n),y=v}}getMaxOverflow(){const t=this._cachedMeta,e=t.dataset,i=e.options&&e.options.borderWidth||0,s=t.data||[];if(!s.length)return i;const n=s[0].size(this.resolveDataElementOptions(0)),o=s[s.length-1].size(this.resolveDataElementOptions(s.length-1));return Math.max(i,n,o)/2}draw(){const t=this._cachedMeta;t.dataset.updateControlPoints(this.chart.chartArea,t.iScale.axis),super.draw()}},PieController:class extends jn{static id="pie";static defaults={cutout:0,rotation:0,circumference:360,radius:"100%"}},PolarAreaController:$n,RadarController:class extends Ns{static id="radar";static defaults={datasetElementType:"line",dataElementType:"point",indexAxis:"r",showLine:!0,elements:{line:{fill:"start"}}};static overrides={aspectRatio:1,scales:{r:{type:"radialLinear"}}};getLabelAndValue(t){const e=this._cachedMeta.vScale,i=this.getParsed(t);return{label:e.getLabels()[t],value:""+e.getLabelForValue(i[e.axis])}}parseObjectData(t,e,i,s){return ii.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta,i=e.dataset,s=e.data||[],n=e.iScale.getLabels();if(i.points=s,"resize"!==t){const e=this.resolveDatasetElementOptions(t);this.options.showLine||(e.borderWidth=0);const o={_loop:!0,_fullLoop:n.length===s.length,options:e};this.updateElement(i,void 0,o,t)}this.updateElements(s,0,s.length,t)}updateElements(t,e,i,s){const n=this._cachedMeta.rScale,o="reset"===s;for(let a=e;a<e+i;a++){const e=t[a],i=this.resolveDataElementOptions(a,e.active?"active":s),r=n.getPointPositionForValue(a,this.getParsed(a).r),l=o?n.xCenter:r.x,h=o?n.yCenter:r.y,c={x:l,y:h,angle:r.angle,skip:isNaN(l)||isNaN(h),options:i};this.updateElement(e,a,c,s)}}},ScatterController:class extends Ns{static id="scatter";static defaults={datasetElementType:!1,dataElementType:"point",showLine:!1,fill:!1};static overrides={interaction:{mode:"point"},scales:{x:{type:"linear"},y:{type:"linear"}}};getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:n}=e,o=this.getParsed(t),a=s.getLabelForValue(o.x),r=n.getLabelForValue(o.y);return{label:i[t]||"",value:"("+a+", "+r+")"}}update(t){const e=this._cachedMeta,{data:i=[]}=e,s=this.chart._animationsDisabled;let{start:n,count:o}=pt(e,i,s);if(this._drawStart=n,this._drawCount=o,mt(e)&&(n=0,o=i.length),this.options.showLine){this.datasetElementType||this.addElements();const{dataset:n,_dataset:o}=e;n._chart=this.chart,n._datasetIndex=this.index,n._decimated=!!o._decimated,n.points=i;const a=this.resolveDatasetElementOptions(t);a.segment=this.options.segment,this.updateElement(n,void 0,{animated:!s,options:a},t)}else this.datasetElementType&&(delete e.dataset,this.datasetElementType=!1);this.updateElements(i,n,o,t)}addElements(){const{showLine:t}=this.options;!this.datasetElementType&&t&&(this.datasetElementType=this.chart.registry.getElement("line")),super.addElements()}updateElements(t,e,i,n){const o="reset"===n,{iScale:a,vScale:r,_stacked:l,_dataset:h}=this._cachedMeta,c=this.resolveDataElementOptions(e,n),d=this.getSharedOptions(c),u=this.includeOptions(n,d),f=a.axis,g=r.axis,{spanGaps:p,segment:m}=this.options,b=N(p)?p:Number.POSITIVE_INFINITY,x=this.chart._animationsDisabled||o||"none"===n;let _=e>0&&this.getParsed(e-1);for(let c=e;c<e+i;++c){const e=t[c],i=this.getParsed(c),p=x?e:{},y=s(i[g]),v=p[f]=a.getPixelForValue(i[f],c),M=p[g]=o||y?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,i,l):i[g],c);p.skip=isNaN(v)||isNaN(M)||y,p.stop=c>0&&Math.abs(i[f]-_[f])>b,m&&(p.parsed=i,p.raw=h.data[c]),u&&(p.options=d||this.resolveDataElementOptions(c,e.active?"active":n)),x||this.updateElement(e,c,p,n),_=i}this.updateSharedOptions(d,n,c)}getMaxOverflow(){const t=this._cachedMeta,e=t.data||[];if(!this.options.showLine){let t=0;for(let i=e.length-1;i>=0;--i)t=Math.max(t,e[i].size(this.resolveDataElementOptions(i))/2);return t>0&&t}const i=t.dataset,s=i.options&&i.options.borderWidth||0;if(!e.length)return s;const n=e[0].size(this.resolveDataElementOptions(0)),o=e[e.length-1].size(this.resolveDataElementOptions(e.length-1));return Math.max(s,n,o)/2}}});function Un(t,e,i,s){const n=vi(t.options.borderRadius,["outerStart","outerEnd","innerStart","innerEnd"]);const o=(i-e)/2,a=Math.min(o,s*e/2),r=t=>{const e=(i-Math.min(o,t))*s/2;return J(t,0,Math.min(o,e))};return{outerStart:r(n.outerStart),outerEnd:r(n.outerEnd),innerStart:J(n.innerStart,0,a),innerEnd:J(n.innerEnd,0,a)}}function Xn(t,e,i,s){return{x:i+t*Math.cos(e),y:s+t*Math.sin(e)}}function qn(t,e,i,s,n,o){const{x:a,y:r,startAngle:l,pixelMargin:h,innerRadius:c}=e,d=Math.max(e.outerRadius+s+i-h,0),u=c>0?c+s+i+h:0;let f=0;const g=n-l;if(s){const t=((c>0?c-s:0)+(d>0?d-s:0))/2;f=(g-(0!==t?g*t/(t+s):g))/2}const p=(g-Math.max(.001,g*d-i/C)/d)/2,m=l+p+f,b=n-p-f,{outerStart:x,outerEnd:_,innerStart:y,innerEnd:v}=Un(e,u,d,b-m),M=d-x,w=d-_,k=m+x/M,S=b-_/w,P=u+y,D=u+v,O=m+y/P,A=b-v/D;if(t.beginPath(),o){const e=(k+S)/2;if(t.arc(a,r,d,k,e),t.arc(a,r,d,e,S),_>0){const e=Xn(w,S,a,r);t.arc(e.x,e.y,_,S,b+E)}const i=Xn(D,b,a,r);if(t.lineTo(i.x,i.y),v>0){const e=Xn(D,A,a,r);t.arc(e.x,e.y,v,b+E,A+Math.PI)}const s=(b-v/u+(m+y/u))/2;if(t.arc(a,r,u,b-v/u,s,!0),t.arc(a,r,u,s,m+y/u,!0),y>0){const e=Xn(P,O,a,r);t.arc(e.x,e.y,y,O+Math.PI,m-E)}const n=Xn(M,m,a,r);if(t.lineTo(n.x,n.y),x>0){const e=Xn(M,k,a,r);t.arc(e.x,e.y,x,m-E,k)}}else{t.moveTo(a,r);const e=Math.cos(k)*d+a,i=Math.sin(k)*d+r;t.lineTo(e,i);const s=Math.cos(S)*d+a,n=Math.sin(S)*d+r;t.lineTo(s,n)}t.closePath()}function Kn(t,e,i,s,n){const{fullCircles:o,startAngle:a,circumference:r,options:l}=e,{borderWidth:h,borderJoinStyle:c,borderDash:d,borderDashOffset:u}=l,f="inner"===l.borderAlign;if(!h)return;t.setLineDash(d||[]),t.lineDashOffset=u,f?(t.lineWidth=2*h,t.lineJoin=c||"round"):(t.lineWidth=h,t.lineJoin=c||"bevel");let g=e.endAngle;if(o){qn(t,e,i,s,g,n);for(let e=0;e<o;++e)t.stroke();isNaN(r)||(g=a+(r%O||O))}f&&function(t,e,i){const{startAngle:s,pixelMargin:n,x:o,y:a,outerRadius:r,innerRadius:l}=e;let h=n/r;t.beginPath(),t.arc(o,a,r,s-h,i+h),l>n?(h=n/l,t.arc(o,a,l,i+h,s-h,!0)):t.arc(o,a,n,i+E,s-E),t.closePath(),t.clip()}(t,e,g),o||(qn(t,e,i,s,g,n),t.stroke())}function Gn(t,e,i=e){t.lineCap=l(i.borderCapStyle,e.borderCapStyle),t.setLineDash(l(i.borderDash,e.borderDash)),t.lineDashOffset=l(i.borderDashOffset,e.borderDashOffset),t.lineJoin=l(i.borderJoinStyle,e.borderJoinStyle),t.lineWidth=l(i.borderWidth,e.borderWidth),t.strokeStyle=l(i.borderColor,e.borderColor)}function Zn(t,e,i){t.lineTo(i.x,i.y)}function Jn(t,e,i={}){const s=t.length,{start:n=0,end:o=s-1}=i,{start:a,end:r}=e,l=Math.max(n,a),h=Math.min(o,r),c=n<a&&o<a||n>r&&o>r;return{count:s,start:l,loop:e.loop,ilen:h<l&&!c?s+h-l:h-l}}function Qn(t,e,i,s){const{points:n,options:o}=e,{count:a,start:r,loop:l,ilen:h}=Jn(n,i,s),c=function(t){return t.stepped?Fe:t.tension||"monotone"===t.cubicInterpolationMode?Ve:Zn}(o);let d,u,f,{move:g=!0,reverse:p}=s||{};for(d=0;d<=h;++d)u=n[(r+(p?h-d:d))%a],u.skip||(g?(t.moveTo(u.x,u.y),g=!1):c(t,f,u,p,o.stepped),f=u);return l&&(u=n[(r+(p?h:0))%a],c(t,f,u,p,o.stepped)),!!l}function to(t,e,i,s){const n=e.points,{count:o,start:a,ilen:r}=Jn(n,i,s),{move:l=!0,reverse:h}=s||{};let c,d,u,f,g,p,m=0,b=0;const x=t=>(a+(h?r-t:t))%o,_=()=>{f!==g&&(t.lineTo(m,g),t.lineTo(m,f),t.lineTo(m,p))};for(l&&(d=n[x(0)],t.moveTo(d.x,d.y)),c=0;c<=r;++c){if(d=n[x(c)],d.skip)continue;const e=d.x,i=d.y,s=0|e;s===u?(i<f?f=i:i>g&&(g=i),m=(b*m+e)/++b):(_(),t.lineTo(e,i),u=s,b=0,f=g=i),p=i}_()}function eo(t){const e=t.options,i=e.borderDash&&e.borderDash.length;return!(t._decimated||t._loop||e.tension||"monotone"===e.cubicInterpolationMode||e.stepped||i)?to:Qn}const io="function"==typeof Path2D;function so(t,e,i,s){io&&!e.options.segment?function(t,e,i,s){let n=e._path;n||(n=e._path=new Path2D,e.path(n,i,s)&&n.closePath()),Gn(t,e.options),t.stroke(n)}(t,e,i,s):function(t,e,i,s){const{segments:n,options:o}=e,a=eo(e);for(const r of n)Gn(t,o,r.style),t.beginPath(),a(t,e,r,{start:i,end:i+s-1})&&t.closePath(),t.stroke()}(t,e,i,s)}class no extends Hs{static id="line";static defaults={borderCapStyle:"butt",borderDash:[],borderDashOffset:0,borderJoinStyle:"miter",borderWidth:3,capBezierPoints:!0,cubicInterpolationMode:"default",fill:!1,spanGaps:!1,stepped:!1,tension:0};static defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};static descriptors={_scriptable:!0,_indexable:t=>"borderDash"!==t&&"fill"!==t};constructor(t){super(),this.animated=!0,this.options=void 0,this._chart=void 0,this._loop=void 0,this._fullLoop=void 0,this._path=void 0,this._points=void 0,this._segments=void 0,this._decimated=!1,this._pointsUpdated=!1,this._datasetIndex=void 0,t&&Object.assign(this,t)}updateControlPoints(t,e){const i=this.options;if((i.tension||"monotone"===i.cubicInterpolationMode)&&!i.stepped&&!this._pointsUpdated){const s=i.spanGaps?this._loop:this._fullLoop;hi(this._points,i,t,s,e),this._pointsUpdated=!0}}set points(t){this._points=t,delete this._segments,delete this._path,this._pointsUpdated=!1}get points(){return this._points}get segments(){return this._segments||(this._segments=zi(this,this.options.segment))}first(){const t=this.segments,e=this.points;return t.length&&e[t[0].start]}last(){const t=this.segments,e=this.points,i=t.length;return i&&e[t[i-1].end]}interpolate(t,e){const i=this.options,s=t[e],n=this.points,o=Ii(this,{property:e,start:s,end:s});if(!o.length)return;const a=[],r=function(t){return t.stepped?pi:t.tension||"monotone"===t.cubicInterpolationMode?mi:gi}(i);let l,h;for(l=0,h=o.length;l<h;++l){const{start:h,end:c}=o[l],d=n[h],u=n[c];if(d===u){a.push(d);continue}const f=r(d,u,Math.abs((s-d[e])/(u[e]-d[e])),i.stepped);f[e]=t[e],a.push(f)}return 1===a.length?a[0]:a}pathSegment(t,e,i){return eo(this)(t,this,e,i)}path(t,e,i){const s=this.segments,n=eo(this);let o=this._loop;e=e||0,i=i||this.points.length-e;for(const a of s)o&=n(t,this,a,{start:e,end:e+i-1});return!!o}draw(t,e,i,s){const n=this.options||{};(this.points||[]).length&&n.borderWidth&&(t.save(),so(t,this,i,s),t.restore()),this.animated&&(this._pointsUpdated=!1,this._path=void 0)}}function oo(t,e,i,s){const n=t.options,{[i]:o}=t.getProps([i],s);return Math.abs(e-o)<n.radius+n.hitRadius}function ao(t,e){const{x:i,y:s,base:n,width:o,height:a}=t.getProps(["x","y","base","width","height"],e);let r,l,h,c,d;return t.horizontal?(d=a/2,r=Math.min(i,n),l=Math.max(i,n),h=s-d,c=s+d):(d=o/2,r=i-d,l=i+d,h=Math.min(s,n),c=Math.max(s,n)),{left:r,top:h,right:l,bottom:c}}function ro(t,e,i,s){return t?0:J(e,i,s)}function lo(t){const e=ao(t),i=e.right-e.left,s=e.bottom-e.top,n=function(t,e,i){const s=t.options.borderWidth,n=t.borderSkipped,o=Mi(s);return{t:ro(n.top,o.top,0,i),r:ro(n.right,o.right,0,e),b:ro(n.bottom,o.bottom,0,i),l:ro(n.left,o.left,0,e)}}(t,i/2,s/2),a=function(t,e,i){const{enableBorderRadius:s}=t.getProps(["enableBorderRadius"]),n=t.options.borderRadius,a=wi(n),r=Math.min(e,i),l=t.borderSkipped,h=s||o(n);return{topLeft:ro(!h||l.top||l.left,a.topLeft,0,r),topRight:ro(!h||l.top||l.right,a.topRight,0,r),bottomLeft:ro(!h||l.bottom||l.left,a.bottomLeft,0,r),bottomRight:ro(!h||l.bottom||l.right,a.bottomRight,0,r)}}(t,i/2,s/2);return{outer:{x:e.left,y:e.top,w:i,h:s,radius:a},inner:{x:e.left+n.l,y:e.top+n.t,w:i-n.l-n.r,h:s-n.t-n.b,radius:{topLeft:Math.max(0,a.topLeft-Math.max(n.t,n.l)),topRight:Math.max(0,a.topRight-Math.max(n.t,n.r)),bottomLeft:Math.max(0,a.bottomLeft-Math.max(n.b,n.l)),bottomRight:Math.max(0,a.bottomRight-Math.max(n.b,n.r))}}}}function ho(t,e,i,s){const n=null===e,o=null===i,a=t&&!(n&&o)&&ao(t,s);return a&&(n||tt(e,a.left,a.right))&&(o||tt(i,a.top,a.bottom))}function co(t,e){t.rect(e.x,e.y,e.w,e.h)}function uo(t,e,i={}){const s=t.x!==i.x?-e:0,n=t.y!==i.y?-e:0,o=(t.x+t.w!==i.x+i.w?e:0)-s,a=(t.y+t.h!==i.y+i.h?e:0)-n;return{x:t.x+s,y:t.y+n,w:t.w+o,h:t.h+a,radius:t.radius}}var fo=Object.freeze({__proto__:null,ArcElement:class extends Hs{static id="arc";static defaults={borderAlign:"center",borderColor:"#fff",borderDash:[],borderDashOffset:0,borderJoinStyle:void 0,borderRadius:0,borderWidth:2,offset:0,spacing:0,angle:void 0,circular:!0};static defaultRoutes={backgroundColor:"backgroundColor"};static descriptors={_scriptable:!0,_indexable:t=>"borderDash"!==t};circumference;endAngle;fullCircles;innerRadius;outerRadius;pixelMargin;startAngle;constructor(t){super(),this.options=void 0,this.circumference=void 0,this.startAngle=void 0,this.endAngle=void 0,this.innerRadius=void 0,this.outerRadius=void 0,this.pixelMargin=0,this.fullCircles=0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.getProps(["x","y"],i),{angle:n,distance:o}=X(s,{x:t,y:e}),{startAngle:a,endAngle:r,innerRadius:h,outerRadius:c,circumference:d}=this.getProps(["startAngle","endAngle","innerRadius","outerRadius","circumference"],i),u=(this.options.spacing+this.options.borderWidth)/2,f=l(d,r-a),g=Z(n,a,r)&&a!==r,p=f>=O||g,m=tt(o,h+u,c+u);return p&&m}getCenterPoint(t){const{x:e,y:i,startAngle:s,endAngle:n,innerRadius:o,outerRadius:a}=this.getProps(["x","y","startAngle","endAngle","innerRadius","outerRadius"],t),{offset:r,spacing:l}=this.options,h=(s+n)/2,c=(o+a+l+r)/2;return{x:e+Math.cos(h)*c,y:i+Math.sin(h)*c}}tooltipPosition(t){return this.getCenterPoint(t)}draw(t){const{options:e,circumference:i}=this,s=(e.offset||0)/4,n=(e.spacing||0)/2,o=e.circular;if(this.pixelMargin="inner"===e.borderAlign?.33:0,this.fullCircles=i>O?Math.floor(i/O):0,0===i||this.innerRadius<0||this.outerRadius<0)return;t.save();const a=(this.startAngle+this.endAngle)/2;t.translate(Math.cos(a)*s,Math.sin(a)*s);const r=s*(1-Math.sin(Math.min(C,i||0)));t.fillStyle=e.backgroundColor,t.strokeStyle=e.borderColor,function(t,e,i,s,n){const{fullCircles:o,startAngle:a,circumference:r}=e;let l=e.endAngle;if(o){qn(t,e,i,s,l,n);for(let e=0;e<o;++e)t.fill();isNaN(r)||(l=a+(r%O||O))}qn(t,e,i,s,l,n),t.fill()}(t,this,r,n,o),Kn(t,this,r,n,o),t.restore()}},BarElement:class extends Hs{static id="bar";static defaults={borderSkipped:"start",borderWidth:0,borderRadius:0,inflateAmount:"auto",pointStyle:void 0};static defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};constructor(t){super(),this.options=void 0,this.horizontal=void 0,this.base=void 0,this.width=void 0,this.height=void 0,this.inflateAmount=void 0,t&&Object.assign(this,t)}draw(t){const{inflateAmount:e,options:{borderColor:i,backgroundColor:s}}=this,{inner:n,outer:o}=lo(this),a=(r=o.radius).topLeft||r.topRight||r.bottomLeft||r.bottomRight?He:co;var r;t.save(),o.w===n.w&&o.h===n.h||(t.beginPath(),a(t,uo(o,e,n)),t.clip(),a(t,uo(n,-e,o)),t.fillStyle=i,t.fill("evenodd")),t.beginPath(),a(t,uo(n,e)),t.fillStyle=s,t.fill(),t.restore()}inRange(t,e,i){return ho(this,t,e,i)}inXRange(t,e){return ho(this,t,null,e)}inYRange(t,e){return ho(this,null,t,e)}getCenterPoint(t){const{x:e,y:i,base:s,horizontal:n}=this.getProps(["x","y","base","horizontal"],t);return{x:n?(e+s)/2:e,y:n?i:(i+s)/2}}getRange(t){return"x"===t?this.width/2:this.height/2}},LineElement:no,PointElement:class extends Hs{static id="point";parsed;skip;stop;static defaults={borderWidth:1,hitRadius:1,hoverBorderWidth:1,hoverRadius:4,pointStyle:"circle",radius:3,rotation:0};static defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};constructor(t){super(),this.options=void 0,this.parsed=void 0,this.skip=void 0,this.stop=void 0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.options,{x:n,y:o}=this.getProps(["x","y"],i);return Math.pow(t-n,2)+Math.pow(e-o,2)<Math.pow(s.hitRadius+s.radius,2)}inXRange(t,e){return oo(this,t,"x",e)}inYRange(t,e){return oo(this,t,"y",e)}getCenterPoint(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}size(t){let e=(t=t||this.options||{}).radius||0;e=Math.max(e,e&&t.hoverRadius||0);return 2*(e+(e&&t.borderWidth||0))}draw(t,e){const i=this.options;this.skip||i.radius<.1||!Re(this,e,this.size(i)/2)||(t.strokeStyle=i.borderColor,t.lineWidth=i.borderWidth,t.fillStyle=i.backgroundColor,Le(t,i,this.x,this.y))}getRange(){const t=this.options||{};return t.radius+t.hitRadius}}});function go(t,e,i,s){const n=t.indexOf(e);if(-1===n)return((t,e,i,s)=>("string"==typeof e?(i=t.push(e)-1,s.unshift({index:i,label:e})):isNaN(e)&&(i=null),i))(t,e,i,s);return n!==t.lastIndexOf(e)?i:n}function po(t){const e=this.getLabels();return t>=0&&t<e.length?e[t]:t}function mo(t,e,{horizontal:i,minRotation:s}){const n=$(s),o=(i?Math.sin(n):Math.cos(n))||.001,a=.75*e*(""+t).length;return Math.min(e/o,a)}class bo extends Js{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._endValue=void 0,this._valueRange=0}parse(t,e){return s(t)||("number"==typeof t||t instanceof Number)&&!isFinite(+t)?null:+t}handleTickRangeOptions(){const{beginAtZero:t}=this.options,{minDefined:e,maxDefined:i}=this.getUserBounds();let{min:s,max:n}=this;const o=t=>s=e?s:t,a=t=>n=i?n:t;if(t){const t=F(s),e=F(n);t<0&&e<0?a(0):t>0&&e>0&&o(0)}if(s===n){let e=0===n?1:Math.abs(.05*n);a(n+e),t||o(s-e)}this.min=s,this.max=n}getTickLimit(){const t=this.options.ticks;let e,{maxTicksLimit:i,stepSize:s}=t;return s?(e=Math.ceil(this.max/s)-Math.floor(this.min/s)+1,e>1e3&&(console.warn(`scales.${this.id}.ticks.stepSize: ${s} would result generating up to ${e} ticks. Limiting to 1000.`),e=1e3)):(e=this.computeTickLimit(),i=i||11),i&&(e=Math.min(i,e)),e}computeTickLimit(){return Number.POSITIVE_INFINITY}buildTicks(){const t=this.options,e=t.ticks;let i=this.getTickLimit();i=Math.max(2,i);const n=function(t,e){const i=[],{bounds:n,step:o,min:a,max:r,precision:l,count:h,maxTicks:c,maxDigits:d,includeBounds:u}=t,f=o||1,g=c-1,{min:p,max:m}=e,b=!s(a),x=!s(r),_=!s(h),y=(m-p)/(d+1);let v,M,w,k,S=B((m-p)/g/f)*f;if(S<1e-14&&!b&&!x)return[{value:p},{value:m}];k=Math.ceil(m/S)-Math.floor(p/S),k>g&&(S=B(k*S/g/f)*f),s(l)||(v=Math.pow(10,l),S=Math.ceil(S*v)/v),"ticks"===n?(M=Math.floor(p/S)*S,w=Math.ceil(m/S)*S):(M=p,w=m),b&&x&&o&&H((r-a)/o,S/1e3)?(k=Math.round(Math.min((r-a)/S,c)),S=(r-a)/k,M=a,w=r):_?(M=b?a:M,w=x?r:w,k=h-1,S=(w-M)/k):(k=(w-M)/S,k=V(k,Math.round(k),S/1e3)?Math.round(k):Math.ceil(k));const P=Math.max(U(S),U(M));v=Math.pow(10,s(l)?P:l),M=Math.round(M*v)/v,w=Math.round(w*v)/v;let D=0;for(b&&(u&&M!==a?(i.push({value:a}),M<a&&D++,V(Math.round((M+D*S)*v)/v,a,mo(a,y,t))&&D++):M<a&&D++);D<k;++D){const t=Math.round((M+D*S)*v)/v;if(x&&t>r)break;i.push({value:t})}return x&&u&&w!==r?i.length&&V(i[i.length-1].value,r,mo(r,y,t))?i[i.length-1].value=r:i.push({value:r}):x&&w!==r||i.push({value:w}),i}({maxTicks:i,bounds:t.bounds,min:t.min,max:t.max,precision:e.precision,step:e.stepSize,count:e.count,maxDigits:this._maxDigits(),horizontal:this.isHorizontal(),minRotation:e.minRotation||0,includeBounds:!1!==e.includeBounds},this._range||this);return"ticks"===t.bounds&&j(n,this,"value"),t.reverse?(n.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),n}configure(){const t=this.ticks;let e=this.min,i=this.max;if(super.configure(),this.options.offset&&t.length){const s=(i-e)/Math.max(t.length-1,1)/2;e-=s,i+=s}this._startValue=e,this._endValue=i,this._valueRange=i-e}getLabelForValue(t){return ne(t,this.chart.options.locale,this.options.ticks.format)}}class xo extends bo{static id="linear";static defaults={ticks:{callback:ae.formatters.numeric}};determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=a(t)?t:0,this.max=a(e)?e:1,this.handleTickRangeOptions()}computeTickLimit(){const t=this.isHorizontal(),e=t?this.width:this.height,i=$(this.options.ticks.minRotation),s=(t?Math.sin(i):Math.cos(i))||.001,n=this._resolveTickFontOptions(0);return Math.ceil(e/Math.min(40,n.lineHeight/s))}getPixelForValue(t){return null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getValueForPixel(t){return this._startValue+this.getDecimalForPixel(t)*this._valueRange}}const _o=t=>Math.floor(z(t)),yo=(t,e)=>Math.pow(10,_o(t)+e);function vo(t){return 1===t/Math.pow(10,_o(t))}function Mo(t,e,i){const s=Math.pow(10,i),n=Math.floor(t/s);return Math.ceil(e/s)-n}function wo(t,{min:e,max:i}){e=r(t.min,e);const s=[],n=_o(e);let o=function(t,e){let i=_o(e-t);for(;Mo(t,e,i)>10;)i++;for(;Mo(t,e,i)<10;)i--;return Math.min(i,_o(t))}(e,i),a=o<0?Math.pow(10,Math.abs(o)):1;const l=Math.pow(10,o),h=n>o?Math.pow(10,n):0,c=Math.round((e-h)*a)/a,d=Math.floor((e-h)/l/10)*l*10;let u=Math.floor((c-d)/Math.pow(10,o)),f=r(t.min,Math.round((h+d+u*Math.pow(10,o))*a)/a);for(;f<i;)s.push({value:f,major:vo(f),significand:u}),u>=10?u=u<15?15:20:u++,u>=20&&(o++,u=2,a=o>=0?1:a),f=Math.round((h+d+u*Math.pow(10,o))*a)/a;const g=r(t.max,f);return s.push({value:g,major:vo(g),significand:u}),s}class ko extends Js{static id="logarithmic";static defaults={ticks:{callback:ae.formatters.logarithmic,major:{enabled:!0}}};constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._valueRange=0}parse(t,e){const i=bo.prototype.parse.apply(this,[t,e]);if(0!==i)return a(i)&&i>0?i:null;this._zero=!0}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=a(t)?Math.max(0,t):null,this.max=a(e)?Math.max(0,e):null,this.options.beginAtZero&&(this._zero=!0),this._zero&&this.min!==this._suggestedMin&&!a(this._userMin)&&(this.min=t===yo(this.min,0)?yo(this.min,-1):yo(this.min,0)),this.handleTickRangeOptions()}handleTickRangeOptions(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let i=this.min,s=this.max;const n=e=>i=t?i:e,o=t=>s=e?s:t;i===s&&(i<=0?(n(1),o(10)):(n(yo(i,-1)),o(yo(s,1)))),i<=0&&n(yo(s,-1)),s<=0&&o(yo(i,1)),this.min=i,this.max=s}buildTicks(){const t=this.options,e=wo({min:this._userMin,max:this._userMax},this);return"ticks"===t.bounds&&j(e,this,"value"),t.reverse?(e.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),e}getLabelForValue(t){return void 0===t?"0":ne(t,this.chart.options.locale,this.options.ticks.format)}configure(){const t=this.min;super.configure(),this._startValue=z(t),this._valueRange=z(this.max)-z(t)}getPixelForValue(t){return void 0!==t&&0!==t||(t=this.min),null===t||isNaN(t)?NaN:this.getPixelForDecimal(t===this.min?0:(z(t)-this._startValue)/this._valueRange)}getValueForPixel(t){const e=this.getDecimalForPixel(t);return Math.pow(10,this._startValue+e*this._valueRange)}}function So(t){const e=t.ticks;if(e.display&&t.display){const t=ki(e.backdropPadding);return l(e.font&&e.font.size,ue.font.size)+t.height}return 0}function Po(t,e,i,s,n){return t===s||t===n?{start:e-i/2,end:e+i/2}:t<s||t>n?{start:e-i,end:e}:{start:e,end:e+i}}function Do(t){const e={l:t.left+t._padding.left,r:t.right-t._padding.right,t:t.top+t._padding.top,b:t.bottom-t._padding.bottom},i=Object.assign({},e),s=[],o=[],a=t._pointLabels.length,r=t.options.pointLabels,l=r.centerPointLabels?C/a:0;for(let u=0;u<a;u++){const a=r.setContext(t.getPointLabelContext(u));o[u]=a.padding;const f=t.getPointPosition(u,t.drawingArea+o[u],l),g=Si(a.font),p=(h=t.ctx,c=g,d=n(d=t._pointLabels[u])?d:[d],{w:Oe(h,c.string,d),h:d.length*c.lineHeight});s[u]=p;const m=G(t.getIndexAngle(u)+l),b=Math.round(Y(m));Co(i,e,m,Po(b,f.x,p.w,0,180),Po(b,f.y,p.h,90,270))}var h,c,d;t.setCenterPoint(e.l-i.l,i.r-e.r,e.t-i.t,i.b-e.b),t._pointLabelItems=function(t,e,i){const s=[],n=t._pointLabels.length,o=t.options,{centerPointLabels:a,display:r}=o.pointLabels,l={extra:So(o)/2,additionalAngle:a?C/n:0};let h;for(let o=0;o<n;o++){l.padding=i[o],l.size=e[o];const n=Oo(t,o,l);s.push(n),"auto"===r&&(n.visible=Ao(n,h),n.visible&&(h=n))}return s}(t,s,o)}function Co(t,e,i,s,n){const o=Math.abs(Math.sin(i)),a=Math.abs(Math.cos(i));let r=0,l=0;s.start<e.l?(r=(e.l-s.start)/o,t.l=Math.min(t.l,e.l-r)):s.end>e.r&&(r=(s.end-e.r)/o,t.r=Math.max(t.r,e.r+r)),n.start<e.t?(l=(e.t-n.start)/a,t.t=Math.min(t.t,e.t-l)):n.end>e.b&&(l=(n.end-e.b)/a,t.b=Math.max(t.b,e.b+l))}function Oo(t,e,i){const s=t.drawingArea,{extra:n,additionalAngle:o,padding:a,size:r}=i,l=t.getPointPosition(e,s+n+a,o),h=Math.round(Y(G(l.angle+E))),c=function(t,e,i){90===i||270===i?t-=e/2:(i>270||i<90)&&(t-=e);return t}(l.y,r.h,h),d=function(t){if(0===t||180===t)return"center";if(t<180)return"left";return"right"}(h),u=function(t,e,i){"right"===i?t-=e:"center"===i&&(t-=e/2);return t}(l.x,r.w,d);return{visible:!0,x:l.x,y:c,textAlign:d,left:u,top:c,right:u+r.w,bottom:c+r.h}}function Ao(t,e){if(!e)return!0;const{left:i,top:s,right:n,bottom:o}=t;return!(Re({x:i,y:s},e)||Re({x:i,y:o},e)||Re({x:n,y:s},e)||Re({x:n,y:o},e))}function To(t,e,i){const{left:n,top:o,right:a,bottom:r}=i,{backdropColor:l}=e;if(!s(l)){const i=wi(e.borderRadius),s=ki(e.backdropPadding);t.fillStyle=l;const h=n-s.left,c=o-s.top,d=a-n+s.width,u=r-o+s.height;Object.values(i).some((t=>0!==t))?(t.beginPath(),He(t,{x:h,y:c,w:d,h:u,radius:i}),t.fill()):t.fillRect(h,c,d,u)}}function Lo(t,e,i,s){const{ctx:n}=t;if(i)n.arc(t.xCenter,t.yCenter,e,0,O);else{let i=t.getPointPosition(0,e);n.moveTo(i.x,i.y);for(let o=1;o<s;o++)i=t.getPointPosition(o,e),n.lineTo(i.x,i.y)}}class Eo extends bo{static id="radialLinear";static defaults={display:!0,animate:!0,position:"chartArea",angleLines:{display:!0,lineWidth:1,borderDash:[],borderDashOffset:0},grid:{circular:!1},startAngle:0,ticks:{showLabelBackdrop:!0,callback:ae.formatters.numeric},pointLabels:{backdropColor:void 0,backdropPadding:2,display:!0,font:{size:10},callback:t=>t,padding:5,centerPointLabels:!1}};static defaultRoutes={"angleLines.color":"borderColor","pointLabels.color":"color","ticks.color":"color"};static descriptors={angleLines:{_fallback:"grid"}};constructor(t){super(t),this.xCenter=void 0,this.yCenter=void 0,this.drawingArea=void 0,this._pointLabels=[],this._pointLabelItems=[]}setDimensions(){const t=this._padding=ki(So(this.options)/2),e=this.width=this.maxWidth-t.width,i=this.height=this.maxHeight-t.height;this.xCenter=Math.floor(this.left+e/2+t.left),this.yCenter=Math.floor(this.top+i/2+t.top),this.drawingArea=Math.floor(Math.min(e,i)/2)}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!1);this.min=a(t)&&!isNaN(t)?t:0,this.max=a(e)&&!isNaN(e)?e:0,this.handleTickRangeOptions()}computeTickLimit(){return Math.ceil(this.drawingArea/So(this.options))}generateTickLabels(t){bo.prototype.generateTickLabels.call(this,t),this._pointLabels=this.getLabels().map(((t,e)=>{const i=d(this.options.pointLabels.callback,[t,e],this);return i||0===i?i:""})).filter(((t,e)=>this.chart.getDataVisibility(e)))}fit(){const t=this.options;t.display&&t.pointLabels.display?Do(this):this.setCenterPoint(0,0,0,0)}setCenterPoint(t,e,i,s){this.xCenter+=Math.floor((t-e)/2),this.yCenter+=Math.floor((i-s)/2),this.drawingArea-=Math.min(this.drawingArea/2,Math.max(t,e,i,s))}getIndexAngle(t){return G(t*(O/(this._pointLabels.length||1))+$(this.options.startAngle||0))}getDistanceFromCenterForValue(t){if(s(t))return NaN;const e=this.drawingArea/(this.max-this.min);return this.options.reverse?(this.max-t)*e:(t-this.min)*e}getValueForDistanceFromCenter(t){if(s(t))return NaN;const e=t/(this.drawingArea/(this.max-this.min));return this.options.reverse?this.max-e:this.min+e}getPointLabelContext(t){const e=this._pointLabels||[];if(t>=0&&t<e.length){const i=e[t];return function(t,e,i){return Ci(t,{label:i,index:e,type:"pointLabel"})}(this.getContext(),t,i)}}getPointPosition(t,e,i=0){const s=this.getIndexAngle(t)-E+i;return{x:Math.cos(s)*e+this.xCenter,y:Math.sin(s)*e+this.yCenter,angle:s}}getPointPositionForValue(t,e){return this.getPointPosition(t,this.getDistanceFromCenterForValue(e))}getBasePosition(t){return this.getPointPositionForValue(t||0,this.getBaseValue())}getPointLabelPosition(t){const{left:e,top:i,right:s,bottom:n}=this._pointLabelItems[t];return{left:e,top:i,right:s,bottom:n}}drawBackground(){const{backgroundColor:t,grid:{circular:e}}=this.options;if(t){const i=this.ctx;i.save(),i.beginPath(),Lo(this,this.getDistanceFromCenterForValue(this._endValue),e,this._pointLabels.length),i.closePath(),i.fillStyle=t,i.fill(),i.restore()}}drawGrid(){const t=this.ctx,e=this.options,{angleLines:i,grid:s,border:n}=e,o=this._pointLabels.length;let a,r,l;if(e.pointLabels.display&&function(t,e){const{ctx:i,options:{pointLabels:s}}=t;for(let n=e-1;n>=0;n--){const e=t._pointLabelItems[n];if(!e.visible)continue;const o=s.setContext(t.getPointLabelContext(n));To(i,o,e);const a=Si(o.font),{x:r,y:l,textAlign:h}=e;Ne(i,t._pointLabels[n],r,l+a.lineHeight/2,a,{color:o.color,textAlign:h,textBaseline:"middle"})}}(this,o),s.display&&this.ticks.forEach(((t,e)=>{if(0!==e||0===e&&this.min<0){r=this.getDistanceFromCenterForValue(t.value);const i=this.getContext(e),a=s.setContext(i),l=n.setContext(i);!function(t,e,i,s,n){const o=t.ctx,a=e.circular,{color:r,lineWidth:l}=e;!a&&!s||!r||!l||i<0||(o.save(),o.strokeStyle=r,o.lineWidth=l,o.setLineDash(n.dash||[]),o.lineDashOffset=n.dashOffset,o.beginPath(),Lo(t,i,a,s),o.closePath(),o.stroke(),o.restore())}(this,a,r,o,l)}})),i.display){for(t.save(),a=o-1;a>=0;a--){const s=i.setContext(this.getPointLabelContext(a)),{color:n,lineWidth:o}=s;o&&n&&(t.lineWidth=o,t.strokeStyle=n,t.setLineDash(s.borderDash),t.lineDashOffset=s.borderDashOffset,r=this.getDistanceFromCenterForValue(e.reverse?this.min:this.max),l=this.getPointPosition(a,r),t.beginPath(),t.moveTo(this.xCenter,this.yCenter),t.lineTo(l.x,l.y),t.stroke())}t.restore()}}drawBorder(){}drawLabels(){const t=this.ctx,e=this.options,i=e.ticks;if(!i.display)return;const s=this.getIndexAngle(0);let n,o;t.save(),t.translate(this.xCenter,this.yCenter),t.rotate(s),t.textAlign="center",t.textBaseline="middle",this.ticks.forEach(((s,a)=>{if(0===a&&this.min>=0&&!e.reverse)return;const r=i.setContext(this.getContext(a)),l=Si(r.font);if(n=this.getDistanceFromCenterForValue(this.ticks[a].value),r.showLabelBackdrop){t.font=l.string,o=t.measureText(s.label).width,t.fillStyle=r.backdropColor;const e=ki(r.backdropPadding);t.fillRect(-o/2-e.left,-n-l.size/2-e.top,o+e.width,l.size+e.height)}Ne(t,s.label,0,-n,l,{color:r.color,strokeColor:r.textStrokeColor,strokeWidth:r.textStrokeWidth})})),t.restore()}drawTitle(){}}const Ro={millisecond:{common:!0,size:1,steps:1e3},second:{common:!0,size:1e3,steps:60},minute:{common:!0,size:6e4,steps:60},hour:{common:!0,size:36e5,steps:24},day:{common:!0,size:864e5,steps:30},week:{common:!1,size:6048e5,steps:4},month:{common:!0,size:2628e6,steps:12},quarter:{common:!1,size:7884e6,steps:4},year:{common:!0,size:3154e7}},Io=Object.keys(Ro);function zo(t,e){return t-e}function Fo(t,e){if(s(e))return null;const i=t._adapter,{parser:n,round:o,isoWeekday:r}=t._parseOpts;let l=e;return"function"==typeof n&&(l=n(l)),a(l)||(l="string"==typeof n?i.parse(l,n):i.parse(l)),null===l?null:(o&&(l="week"!==o||!N(r)&&!0!==r?i.startOf(l,o):i.startOf(l,"isoWeek",r)),+l)}function Vo(t,e,i,s){const n=Io.length;for(let o=Io.indexOf(t);o<n-1;++o){const t=Ro[Io[o]],n=t.steps?t.steps:Number.MAX_SAFE_INTEGER;if(t.common&&Math.ceil((i-e)/(n*t.size))<=s)return Io[o]}return Io[n-1]}function Bo(t,e,i){if(i){if(i.length){const{lo:s,hi:n}=et(i,e);t[i[s]>=e?i[s]:i[n]]=!0}}else t[e]=!0}function Wo(t,e,i){const s=[],n={},o=e.length;let a,r;for(a=0;a<o;++a)r=e[a],n[r]=a,s.push({value:r,major:!1});return 0!==o&&i?function(t,e,i,s){const n=t._adapter,o=+n.startOf(e[0].value,s),a=e[e.length-1].value;let r,l;for(r=o;r<=a;r=+n.add(r,1,s))l=i[r],l>=0&&(e[l].major=!0);return e}(t,s,n,i):s}class No extends Js{static id="time";static defaults={bounds:"data",adapters:{},time:{parser:!1,unit:!1,round:!1,isoWeekday:!1,minUnit:"millisecond",displayFormats:{}},ticks:{source:"auto",callback:!1,major:{enabled:!1}}};constructor(t){super(t),this._cache={data:[],labels:[],all:[]},this._unit="day",this._majorUnit=void 0,this._offsets={},this._normalized=!1,this._parseOpts=void 0}init(t,e={}){const i=t.time||(t.time={}),s=this._adapter=new Rn._date(t.adapters.date);s.init(e),x(i.displayFormats,s.formats()),this._parseOpts={parser:i.parser,round:i.round,isoWeekday:i.isoWeekday},super.init(t),this._normalized=e.normalized}parse(t,e){return void 0===t?null:Fo(this,t)}beforeLayout(){super.beforeLayout(),this._cache={data:[],labels:[],all:[]}}determineDataLimits(){const t=this.options,e=this._adapter,i=t.time.unit||"day";let{min:s,max:n,minDefined:o,maxDefined:r}=this.getUserBounds();function l(t){o||isNaN(t.min)||(s=Math.min(s,t.min)),r||isNaN(t.max)||(n=Math.max(n,t.max))}o&&r||(l(this._getLabelBounds()),"ticks"===t.bounds&&"labels"===t.ticks.source||l(this.getMinMax(!1))),s=a(s)&&!isNaN(s)?s:+e.startOf(Date.now(),i),n=a(n)&&!isNaN(n)?n:+e.endOf(Date.now(),i)+1,this.min=Math.min(s,n-1),this.max=Math.max(s+1,n)}_getLabelBounds(){const t=this.getLabelTimestamps();let e=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY;return t.length&&(e=t[0],i=t[t.length-1]),{min:e,max:i}}buildTicks(){const t=this.options,e=t.time,i=t.ticks,s="labels"===i.source?this.getLabelTimestamps():this._generate();"ticks"===t.bounds&&s.length&&(this.min=this._userMin||s[0],this.max=this._userMax||s[s.length-1]);const n=this.min,o=nt(s,n,this.max);return this._unit=e.unit||(i.autoSkip?Vo(e.minUnit,this.min,this.max,this._getLabelCapacity(n)):function(t,e,i,s,n){for(let o=Io.length-1;o>=Io.indexOf(i);o--){const i=Io[o];if(Ro[i].common&&t._adapter.diff(n,s,i)>=e-1)return i}return Io[i?Io.indexOf(i):0]}(this,o.length,e.minUnit,this.min,this.max)),this._majorUnit=i.major.enabled&&"year"!==this._unit?function(t){for(let e=Io.indexOf(t)+1,i=Io.length;e<i;++e)if(Ro[Io[e]].common)return Io[e]}(this._unit):void 0,this.initOffsets(s),t.reverse&&o.reverse(),Wo(this,o,this._majorUnit)}afterAutoSkip(){this.options.offsetAfterAutoskip&&this.initOffsets(this.ticks.map((t=>+t.value)))}initOffsets(t=[]){let e,i,s=0,n=0;this.options.offset&&t.length&&(e=this.getDecimalForValue(t[0]),s=1===t.length?1-e:(this.getDecimalForValue(t[1])-e)/2,i=this.getDecimalForValue(t[t.length-1]),n=1===t.length?i:(i-this.getDecimalForValue(t[t.length-2]))/2);const o=t.length<3?.5:.25;s=J(s,0,o),n=J(n,0,o),this._offsets={start:s,end:n,factor:1/(s+1+n)}}_generate(){const t=this._adapter,e=this.min,i=this.max,s=this.options,n=s.time,o=n.unit||Vo(n.minUnit,e,i,this._getLabelCapacity(e)),a=l(s.ticks.stepSize,1),r="week"===o&&n.isoWeekday,h=N(r)||!0===r,c={};let d,u,f=e;if(h&&(f=+t.startOf(f,"isoWeek",r)),f=+t.startOf(f,h?"day":o),t.diff(i,e,o)>1e5*a)throw new Error(e+" and "+i+" are too far apart with stepSize of "+a+" "+o);const g="data"===s.ticks.source&&this.getDataTimestamps();for(d=f,u=0;d<i;d=+t.add(d,a,o),u++)Bo(c,d,g);return d!==i&&"ticks"!==s.bounds&&1!==u||Bo(c,d,g),Object.keys(c).sort(zo).map((t=>+t))}getLabelForValue(t){const e=this._adapter,i=this.options.time;return i.tooltipFormat?e.format(t,i.tooltipFormat):e.format(t,i.displayFormats.datetime)}format(t,e){const i=this.options.time.displayFormats,s=this._unit,n=e||i[s];return this._adapter.format(t,n)}_tickFormatFunction(t,e,i,s){const n=this.options,o=n.ticks.callback;if(o)return d(o,[t,e,i],this);const a=n.time.displayFormats,r=this._unit,l=this._majorUnit,h=r&&a[r],c=l&&a[l],u=i[e],f=l&&c&&u&&u.major;return this._adapter.format(t,s||(f?c:h))}generateTickLabels(t){let e,i,s;for(e=0,i=t.length;e<i;++e)s=t[e],s.label=this._tickFormatFunction(s.value,e,t)}getDecimalForValue(t){return null===t?NaN:(t-this.min)/(this.max-this.min)}getPixelForValue(t){const e=this._offsets,i=this.getDecimalForValue(t);return this.getPixelForDecimal((e.start+i)*e.factor)}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return this.min+i*(this.max-this.min)}_getLabelSize(t){const e=this.options.ticks,i=this.ctx.measureText(t).width,s=$(this.isHorizontal()?e.maxRotation:e.minRotation),n=Math.cos(s),o=Math.sin(s),a=this._resolveTickFontOptions(0).size;return{w:i*n+a*o,h:i*o+a*n}}_getLabelCapacity(t){const e=this.options.time,i=e.displayFormats,s=i[e.unit]||i.millisecond,n=this._tickFormatFunction(t,0,Wo(this,[t],this._majorUnit),s),o=this._getLabelSize(n),a=Math.floor(this.isHorizontal()?this.width/o.w:this.height/o.h)-1;return a>0?a:1}getDataTimestamps(){let t,e,i=this._cache.data||[];if(i.length)return i;const s=this.getMatchingVisibleMetas();if(this._normalized&&s.length)return this._cache.data=s[0].controller.getAllParsedValues(this);for(t=0,e=s.length;t<e;++t)i=i.concat(s[t].controller.getAllParsedValues(this));return this._cache.data=this.normalize(i)}getLabelTimestamps(){const t=this._cache.labels||[];let e,i;if(t.length)return t;const s=this.getLabels();for(e=0,i=s.length;e<i;++e)t.push(Fo(this,s[e]));return this._cache.labels=this._normalized?t:this.normalize(t)}normalize(t){return lt(t.sort(zo))}}function Ho(t,e,i){let s,n,o,a,r=0,l=t.length-1;i?(e>=t[r].pos&&e<=t[l].pos&&({lo:r,hi:l}=it(t,"pos",e)),({pos:s,time:o}=t[r]),({pos:n,time:a}=t[l])):(e>=t[r].time&&e<=t[l].time&&({lo:r,hi:l}=it(t,"time",e)),({time:s,pos:o}=t[r]),({time:n,pos:a}=t[l]));const h=n-s;return h?o+(a-o)*(e-s)/h:o}var jo=Object.freeze({__proto__:null,CategoryScale:class extends Js{static id="category";static defaults={ticks:{callback:po}};constructor(t){super(t),this._startValue=void 0,this._valueRange=0,this._addedLabels=[]}init(t){const e=this._addedLabels;if(e.length){const t=this.getLabels();for(const{index:i,label:s}of e)t[i]===s&&t.splice(i,1);this._addedLabels=[]}super.init(t)}parse(t,e){if(s(t))return null;const i=this.getLabels();return((t,e)=>null===t?null:J(Math.round(t),0,e))(e=isFinite(e)&&i[e]===t?e:go(i,t,l(e,t),this._addedLabels),i.length-1)}determineDataLimits(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let{min:i,max:s}=this.getMinMax(!0);"ticks"===this.options.bounds&&(t||(i=0),e||(s=this.getLabels().length-1)),this.min=i,this.max=s}buildTicks(){const t=this.min,e=this.max,i=this.options.offset,s=[];let n=this.getLabels();n=0===t&&e===n.length-1?n:n.slice(t,e+1),this._valueRange=Math.max(n.length-(i?0:1),1),this._startValue=this.min-(i?.5:0);for(let i=t;i<=e;i++)s.push({value:i});return s}getLabelForValue(t){return po.call(this,t)}configure(){super.configure(),this.isHorizontal()||(this._reversePixels=!this._reversePixels)}getPixelForValue(t){return"number"!=typeof t&&(t=this.parse(t)),null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getValueForPixel(t){return Math.round(this._startValue+this.getDecimalForPixel(t)*this._valueRange)}getBasePixel(){return this.bottom}},LinearScale:xo,LogarithmicScale:ko,RadialLinearScale:Eo,TimeScale:No,TimeSeriesScale:class extends No{static id="timeseries";static defaults=No.defaults;constructor(t){super(t),this._table=[],this._minPos=void 0,this._tableRange=void 0}initOffsets(){const t=this._getTimestampsForTable(),e=this._table=this.buildLookupTable(t);this._minPos=Ho(e,this.min),this._tableRange=Ho(e,this.max)-this._minPos,super.initOffsets(t)}buildLookupTable(t){const{min:e,max:i}=this,s=[],n=[];let o,a,r,l,h;for(o=0,a=t.length;o<a;++o)l=t[o],l>=e&&l<=i&&s.push(l);if(s.length<2)return[{time:e,pos:0},{time:i,pos:1}];for(o=0,a=s.length;o<a;++o)h=s[o+1],r=s[o-1],l=s[o],Math.round((h+r)/2)!==l&&n.push({time:l,pos:o/(a-1)});return n}_generate(){const t=this.min,e=this.max;let i=super.getDataTimestamps();return i.includes(t)&&i.length||i.splice(0,0,t),i.includes(e)&&1!==i.length||i.push(e),i.sort(((t,e)=>t-e))}_getTimestampsForTable(){let t=this._cache.all||[];if(t.length)return t;const e=this.getDataTimestamps(),i=this.getLabelTimestamps();return t=e.length&&i.length?this.normalize(e.concat(i)):e.length?e:i,t=this._cache.all=t,t}getDecimalForValue(t){return(Ho(this._table,t)-this._minPos)/this._tableRange}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return Ho(this._table,i*this._tableRange+this._minPos,!0)}}});const $o=["rgb(54, 162, 235)","rgb(255, 99, 132)","rgb(255, 159, 64)","rgb(255, 205, 86)","rgb(75, 192, 192)","rgb(153, 102, 255)","rgb(201, 203, 207)"],Yo=$o.map((t=>t.replace("rgb(","rgba(").replace(")",", 0.5)")));function Uo(t){return $o[t%$o.length]}function Xo(t){return Yo[t%Yo.length]}function qo(t){let e=0;return(i,s)=>{const n=t.getDatasetMeta(s).controller;n instanceof jn?e=function(t,e){return t.backgroundColor=t.data.map((()=>Uo(e++))),e}(i,e):n instanceof $n?e=function(t,e){return t.backgroundColor=t.data.map((()=>Xo(e++))),e}(i,e):n&&(e=function(t,e){return t.borderColor=Uo(e),t.backgroundColor=Xo(e),++e}(i,e))}}function Ko(t){let e;for(e in t)if(t[e].borderColor||t[e].backgroundColor)return!0;return!1}var Go={id:"colors",defaults:{enabled:!0,forceOverride:!1},beforeLayout(t,e,i){if(!i.enabled)return;const{data:{datasets:s},options:n}=t.config,{elements:o}=n,a=Ko(s)||(r=n)&&(r.borderColor||r.backgroundColor)||o&&Ko(o)||"rgba(0,0,0,0.1)"!==ue.borderColor||"rgba(0,0,0,0.1)"!==ue.backgroundColor;var r;if(!i.forceOverride&&a)return;const l=qo(t);s.forEach(l)}};function Zo(t){if(t._decimated){const e=t._data;delete t._decimated,delete t._data,Object.defineProperty(t,"data",{configurable:!0,enumerable:!0,writable:!0,value:e})}}function Jo(t){t.data.datasets.forEach((t=>{Zo(t)}))}var Qo={id:"decimation",defaults:{algorithm:"min-max",enabled:!1},beforeElementsUpdate:(t,e,i)=>{if(!i.enabled)return void Jo(t);const n=t.width;t.data.datasets.forEach(((e,o)=>{const{_data:a,indexAxis:r}=e,l=t.getDatasetMeta(o),h=a||e.data;if("y"===Pi([r,t.options.indexAxis]))return;if(!l.controller.supportsDecimation)return;const c=t.scales[l.xAxisID];if("linear"!==c.type&&"time"!==c.type)return;if(t.options.parsing)return;let{start:d,count:u}=function(t,e){const i=e.length;let s,n=0;const{iScale:o}=t,{min:a,max:r,minDefined:l,maxDefined:h}=o.getUserBounds();return l&&(n=J(it(e,o.axis,a).lo,0,i-1)),s=h?J(it(e,o.axis,r).hi+1,n,i)-n:i-n,{start:n,count:s}}(l,h);if(u<=(i.threshold||4*n))return void Zo(e);let f;switch(s(a)&&(e._data=h,delete e.data,Object.defineProperty(e,"data",{configurable:!0,enumerable:!0,get:function(){return this._decimated},set:function(t){this._data=t}})),i.algorithm){case"lttb":f=function(t,e,i,s,n){const o=n.samples||s;if(o>=i)return t.slice(e,e+i);const a=[],r=(i-2)/(o-2);let l=0;const h=e+i-1;let c,d,u,f,g,p=e;for(a[l++]=t[p],c=0;c<o-2;c++){let s,n=0,o=0;const h=Math.floor((c+1)*r)+1+e,m=Math.min(Math.floor((c+2)*r)+1,i)+e,b=m-h;for(s=h;s<m;s++)n+=t[s].x,o+=t[s].y;n/=b,o/=b;const x=Math.floor(c*r)+1+e,_=Math.min(Math.floor((c+1)*r)+1,i)+e,{x:y,y:v}=t[p];for(u=f=-1,s=x;s<_;s++)f=.5*Math.abs((y-n)*(t[s].y-v)-(y-t[s].x)*(o-v)),f>u&&(u=f,d=t[s],g=s);a[l++]=d,p=g}return a[l++]=t[h],a}(h,d,u,n,i);break;case"min-max":f=function(t,e,i,n){let o,a,r,l,h,c,d,u,f,g,p=0,m=0;const b=[],x=e+i-1,_=t[e].x,y=t[x].x-_;for(o=e;o<e+i;++o){a=t[o],r=(a.x-_)/y*n,l=a.y;const e=0|r;if(e===h)l<f?(f=l,c=o):l>g&&(g=l,d=o),p=(m*p+a.x)/++m;else{const i=o-1;if(!s(c)&&!s(d)){const e=Math.min(c,d),s=Math.max(c,d);e!==u&&e!==i&&b.push({...t[e],x:p}),s!==u&&s!==i&&b.push({...t[s],x:p})}o>0&&i!==u&&b.push(t[i]),b.push(a),h=e,m=0,f=g=l,c=d=u=o}}return b}(h,d,u,n);break;default:throw new Error(`Unsupported decimation algorithm '${i.algorithm}'`)}e._decimated=f}))},destroy(t){Jo(t)}};function ta(t,e,i,s){if(s)return;let n=e[t],o=i[t];return"angle"===t&&(n=G(n),o=G(o)),{property:t,start:n,end:o}}function ea(t,e,i){for(;e>t;e--){const t=i[e];if(!isNaN(t.x)&&!isNaN(t.y))break}return e}function ia(t,e,i,s){return t&&e?s(t[i],e[i]):t?t[i]:e?e[i]:0}function sa(t,e){let i=[],s=!1;return n(t)?(s=!0,i=t):i=function(t,e){const{x:i=null,y:s=null}=t||{},n=e.points,o=[];return e.segments.forEach((({start:t,end:e})=>{e=ea(t,e,n);const a=n[t],r=n[e];null!==s?(o.push({x:a.x,y:s}),o.push({x:r.x,y:s})):null!==i&&(o.push({x:i,y:a.y}),o.push({x:i,y:r.y}))})),o}(t,e),i.length?new no({points:i,options:{tension:0},_loop:s,_fullLoop:s}):null}function na(t){return t&&!1!==t.fill}function oa(t,e,i){let s=t[e].fill;const n=[e];let o;if(!i)return s;for(;!1!==s&&-1===n.indexOf(s);){if(!a(s))return s;if(o=t[s],!o)return!1;if(o.visible)return s;n.push(s),s=o.fill}return!1}function aa(t,e,i){const s=function(t){const e=t.options,i=e.fill;let s=l(i&&i.target,i);void 0===s&&(s=!!e.backgroundColor);if(!1===s||null===s)return!1;if(!0===s)return"origin";return s}(t);if(o(s))return!isNaN(s.value)&&s;let n=parseFloat(s);return a(n)&&Math.floor(n)===n?function(t,e,i,s){"-"!==t&&"+"!==t||(i=e+i);if(i===e||i<0||i>=s)return!1;return i}(s[0],e,n,i):["origin","start","end","stack","shape"].indexOf(s)>=0&&s}function ra(t,e,i){const s=[];for(let n=0;n<i.length;n++){const o=i[n],{first:a,last:r,point:l}=la(o,e,"x");if(!(!l||a&&r))if(a)s.unshift(l);else if(t.push(l),!r)break}t.push(...s)}function la(t,e,i){const s=t.interpolate(e,i);if(!s)return{};const n=s[i],o=t.segments,a=t.points;let r=!1,l=!1;for(let t=0;t<o.length;t++){const e=o[t],s=a[e.start][i],h=a[e.end][i];if(tt(n,s,h)){r=n===s,l=n===h;break}}return{first:r,last:l,point:s}}class ha{constructor(t){this.x=t.x,this.y=t.y,this.radius=t.radius}pathSegment(t,e,i){const{x:s,y:n,radius:o}=this;return e=e||{start:0,end:O},t.arc(s,n,o,e.end,e.start,!0),!i.bounds}interpolate(t){const{x:e,y:i,radius:s}=this,n=t.angle;return{x:e+Math.cos(n)*s,y:i+Math.sin(n)*s,angle:n}}}function ca(t){const{chart:e,fill:i,line:s}=t;if(a(i))return function(t,e){const i=t.getDatasetMeta(e),s=i&&t.isDatasetVisible(e);return s?i.dataset:null}(e,i);if("stack"===i)return function(t){const{scale:e,index:i,line:s}=t,n=[],o=s.segments,a=s.points,r=function(t,e){const i=[],s=t.getMatchingVisibleMetas("line");for(let t=0;t<s.length;t++){const n=s[t];if(n.index===e)break;n.hidden||i.unshift(n.dataset)}return i}(e,i);r.push(sa({x:null,y:e.bottom},s));for(let t=0;t<o.length;t++){const e=o[t];for(let t=e.start;t<=e.end;t++)ra(n,a[t],r)}return new no({points:n,options:{}})}(t);if("shape"===i)return!0;const n=function(t){const e=t.scale||{};if(e.getPointPositionForValue)return function(t){const{scale:e,fill:i}=t,s=e.options,n=e.getLabels().length,a=s.reverse?e.max:e.min,r=function(t,e,i){let s;return s="start"===t?i:"end"===t?e.options.reverse?e.min:e.max:o(t)?t.value:e.getBaseValue(),s}(i,e,a),l=[];if(s.grid.circular){const t=e.getPointPositionForValue(0,a);return new ha({x:t.x,y:t.y,radius:e.getDistanceFromCenterForValue(r)})}for(let t=0;t<n;++t)l.push(e.getPointPositionForValue(t,r));return l}(t);return function(t){const{scale:e={},fill:i}=t,s=function(t,e){let i=null;return"start"===t?i=e.bottom:"end"===t?i=e.top:o(t)?i=e.getPixelForValue(t.value):e.getBasePixel&&(i=e.getBasePixel()),i}(i,e);if(a(s)){const t=e.isHorizontal();return{x:t?s:null,y:t?null:s}}return null}(t)}(t);return n instanceof ha?n:sa(n,s)}function da(t,e,i){const s=ca(e),{line:n,scale:o,axis:a}=e,r=n.options,l=r.fill,h=r.backgroundColor,{above:c=h,below:d=h}=l||{};s&&n.points.length&&(Ie(t,i),function(t,e){const{line:i,target:s,above:n,below:o,area:a,scale:r}=e,l=i._loop?"angle":e.axis;t.save(),"x"===l&&o!==n&&(ua(t,s,a.top),fa(t,{line:i,target:s,color:n,scale:r,property:l}),t.restore(),t.save(),ua(t,s,a.bottom));fa(t,{line:i,target:s,color:o,scale:r,property:l}),t.restore()}(t,{line:n,target:s,above:c,below:d,area:i,scale:o,axis:a}),ze(t))}function ua(t,e,i){const{segments:s,points:n}=e;let o=!0,a=!1;t.beginPath();for(const r of s){const{start:s,end:l}=r,h=n[s],c=n[ea(s,l,n)];o?(t.moveTo(h.x,h.y),o=!1):(t.lineTo(h.x,i),t.lineTo(h.x,h.y)),a=!!e.pathSegment(t,r,{move:a}),a?t.closePath():t.lineTo(c.x,i)}t.lineTo(e.first().x,i),t.closePath(),t.clip()}function fa(t,e){const{line:i,target:s,property:n,color:o,scale:a}=e,r=function(t,e,i){const s=t.segments,n=t.points,o=e.points,a=[];for(const t of s){let{start:s,end:r}=t;r=ea(s,r,n);const l=ta(i,n[s],n[r],t.loop);if(!e.segments){a.push({source:t,target:l,start:n[s],end:n[r]});continue}const h=Ii(e,l);for(const e of h){const s=ta(i,o[e.start],o[e.end],e.loop),r=Ri(t,n,s);for(const t of r)a.push({source:t,target:e,start:{[i]:ia(l,s,"start",Math.max)},end:{[i]:ia(l,s,"end",Math.min)}})}}return a}(i,s,n);for(const{source:e,target:l,start:h,end:c}of r){const{style:{backgroundColor:r=o}={}}=e,d=!0!==s;t.save(),t.fillStyle=r,ga(t,a,d&&ta(n,h,c)),t.beginPath();const u=!!i.pathSegment(t,e);let f;if(d){u?t.closePath():pa(t,s,c,n);const e=!!s.pathSegment(t,l,{move:u,reverse:!0});f=u&&e,f||pa(t,s,h,n)}t.closePath(),t.fill(f?"evenodd":"nonzero"),t.restore()}}function ga(t,e,i){const{top:s,bottom:n}=e.chart.chartArea,{property:o,start:a,end:r}=i||{};"x"===o&&(t.beginPath(),t.rect(a,s,r-a,n-s),t.clip())}function pa(t,e,i,s){const n=e.interpolate(i,s);n&&t.lineTo(n.x,n.y)}var ma={id:"filler",afterDatasetsUpdate(t,e,i){const s=(t.data.datasets||[]).length,n=[];let o,a,r,l;for(a=0;a<s;++a)o=t.getDatasetMeta(a),r=o.dataset,l=null,r&&r.options&&r instanceof no&&(l={visible:t.isDatasetVisible(a),index:a,fill:aa(r,a,s),chart:t,axis:o.controller.options.indexAxis,scale:o.vScale,line:r}),o.$filler=l,n.push(l);for(a=0;a<s;++a)l=n[a],l&&!1!==l.fill&&(l.fill=oa(n,a,i.propagate))},beforeDraw(t,e,i){const s="beforeDraw"===i.drawTime,n=t.getSortedVisibleDatasetMetas(),o=t.chartArea;for(let e=n.length-1;e>=0;--e){const i=n[e].$filler;i&&(i.line.updateControlPoints(o,i.axis),s&&i.fill&&da(t.ctx,i,o))}},beforeDatasetsDraw(t,e,i){if("beforeDatasetsDraw"!==i.drawTime)return;const s=t.getSortedVisibleDatasetMetas();for(let e=s.length-1;e>=0;--e){const i=s[e].$filler;na(i)&&da(t.ctx,i,t.chartArea)}},beforeDatasetDraw(t,e,i){const s=e.meta.$filler;na(s)&&"beforeDatasetDraw"===i.drawTime&&da(t.ctx,s,t.chartArea)},defaults:{propagate:!0,drawTime:"beforeDatasetDraw"}};const ba=(t,e)=>{let{boxHeight:i=e,boxWidth:s=e}=t;return t.usePointStyle&&(i=Math.min(i,e),s=t.pointStyleWidth||Math.min(s,e)),{boxWidth:s,boxHeight:i,itemHeight:Math.max(e,i)}};class xa extends Hs{constructor(t){super(),this._added=!1,this.legendHitBoxes=[],this._hoveredItem=null,this.doughnutMode=!1,this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this.legendItems=void 0,this.columnSizes=void 0,this.lineWidths=void 0,this.maxHeight=void 0,this.maxWidth=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.height=void 0,this.width=void 0,this._margins=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e,i){this.maxWidth=t,this.maxHeight=e,this._margins=i,this.setDimensions(),this.buildLabels(),this.fit()}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=this._margins.left,this.right=this.width):(this.height=this.maxHeight,this.top=this._margins.top,this.bottom=this.height)}buildLabels(){const t=this.options.labels||{};let e=d(t.generateLabels,[this.chart],this)||[];t.filter&&(e=e.filter((e=>t.filter(e,this.chart.data)))),t.sort&&(e=e.sort(((e,i)=>t.sort(e,i,this.chart.data)))),this.options.reverse&&e.reverse(),this.legendItems=e}fit(){const{options:t,ctx:e}=this;if(!t.display)return void(this.width=this.height=0);const i=t.labels,s=Si(i.font),n=s.size,o=this._computeTitleHeight(),{boxWidth:a,itemHeight:r}=ba(i,n);let l,h;e.font=s.string,this.isHorizontal()?(l=this.maxWidth,h=this._fitRows(o,n,a,r)+10):(h=this.maxHeight,l=this._fitCols(o,s,a,r)+10),this.width=Math.min(l,t.maxWidth||this.maxWidth),this.height=Math.min(h,t.maxHeight||this.maxHeight)}_fitRows(t,e,i,s){const{ctx:n,maxWidth:o,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.lineWidths=[0],h=s+a;let c=t;n.textAlign="left",n.textBaseline="middle";let d=-1,u=-h;return this.legendItems.forEach(((t,f)=>{const g=i+e/2+n.measureText(t.text).width;(0===f||l[l.length-1]+g+2*a>o)&&(c+=h,l[l.length-(f>0?0:1)]=0,u+=h,d++),r[f]={left:0,top:u,row:d,width:g,height:s},l[l.length-1]+=g+a})),c}_fitCols(t,e,i,s){const{ctx:n,maxHeight:o,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.columnSizes=[],h=o-t;let c=a,d=0,u=0,f=0,g=0;return this.legendItems.forEach(((t,o)=>{const{itemWidth:p,itemHeight:m}=function(t,e,i,s,n){const o=function(t,e,i,s){let n=t.text;n&&"string"!=typeof n&&(n=n.reduce(((t,e)=>t.length>e.length?t:e)));return e+i.size/2+s.measureText(n).width}(s,t,e,i),a=function(t,e,i){let s=t;"string"!=typeof e.text&&(s=_a(e,i));return s}(n,s,e.lineHeight);return{itemWidth:o,itemHeight:a}}(i,e,n,t,s);o>0&&u+m+2*a>h&&(c+=d+a,l.push({width:d,height:u}),f+=d+a,g++,d=u=0),r[o]={left:f,top:u,col:g,width:p,height:m},d=Math.max(d,p),u+=m+a})),c+=d,l.push({width:d,height:u}),c}adjustHitBoxes(){if(!this.options.display)return;const t=this._computeTitleHeight(),{legendHitBoxes:e,options:{align:i,labels:{padding:s},rtl:n}}=this,o=Oi(n,this.left,this.width);if(this.isHorizontal()){let n=0,a=ft(i,this.left+s,this.right-this.lineWidths[n]);for(const r of e)n!==r.row&&(n=r.row,a=ft(i,this.left+s,this.right-this.lineWidths[n])),r.top+=this.top+t+s,r.left=o.leftForLtr(o.x(a),r.width),a+=r.width+s}else{let n=0,a=ft(i,this.top+t+s,this.bottom-this.columnSizes[n].height);for(const r of e)r.col!==n&&(n=r.col,a=ft(i,this.top+t+s,this.bottom-this.columnSizes[n].height)),r.top=a,r.left+=this.left+s,r.left=o.leftForLtr(o.x(r.left),r.width),a+=r.height+s}}isHorizontal(){return"top"===this.options.position||"bottom"===this.options.position}draw(){if(this.options.display){const t=this.ctx;Ie(t,this),this._draw(),ze(t)}}_draw(){const{options:t,columnSizes:e,lineWidths:i,ctx:s}=this,{align:n,labels:o}=t,a=ue.color,r=Oi(t.rtl,this.left,this.width),h=Si(o.font),{padding:c}=o,d=h.size,u=d/2;let f;this.drawTitle(),s.textAlign=r.textAlign("left"),s.textBaseline="middle",s.lineWidth=.5,s.font=h.string;const{boxWidth:g,boxHeight:p,itemHeight:m}=ba(o,d),b=this.isHorizontal(),x=this._computeTitleHeight();f=b?{x:ft(n,this.left+c,this.right-i[0]),y:this.top+c+x,line:0}:{x:this.left+c,y:ft(n,this.top+x+c,this.bottom-e[0].height),line:0},Ai(this.ctx,t.textDirection);const _=m+c;this.legendItems.forEach(((y,v)=>{s.strokeStyle=y.fontColor,s.fillStyle=y.fontColor;const M=s.measureText(y.text).width,w=r.textAlign(y.textAlign||(y.textAlign=o.textAlign)),k=g+u+M;let S=f.x,P=f.y;r.setWidth(this.width),b?v>0&&S+k+c>this.right&&(P=f.y+=_,f.line++,S=f.x=ft(n,this.left+c,this.right-i[f.line])):v>0&&P+_>this.bottom&&(S=f.x=S+e[f.line].width+c,f.line++,P=f.y=ft(n,this.top+x+c,this.bottom-e[f.line].height));if(function(t,e,i){if(isNaN(g)||g<=0||isNaN(p)||p<0)return;s.save();const n=l(i.lineWidth,1);if(s.fillStyle=l(i.fillStyle,a),s.lineCap=l(i.lineCap,"butt"),s.lineDashOffset=l(i.lineDashOffset,0),s.lineJoin=l(i.lineJoin,"miter"),s.lineWidth=n,s.strokeStyle=l(i.strokeStyle,a),s.setLineDash(l(i.lineDash,[])),o.usePointStyle){const a={radius:p*Math.SQRT2/2,pointStyle:i.pointStyle,rotation:i.rotation,borderWidth:n},l=r.xPlus(t,g/2);Ee(s,a,l,e+u,o.pointStyleWidth&&g)}else{const o=e+Math.max((d-p)/2,0),a=r.leftForLtr(t,g),l=wi(i.borderRadius);s.beginPath(),Object.values(l).some((t=>0!==t))?He(s,{x:a,y:o,w:g,h:p,radius:l}):s.rect(a,o,g,p),s.fill(),0!==n&&s.stroke()}s.restore()}(r.x(S),P,y),S=gt(w,S+g+u,b?S+k:this.right,t.rtl),function(t,e,i){Ne(s,i.text,t,e+m/2,h,{strikethrough:i.hidden,textAlign:r.textAlign(i.textAlign)})}(r.x(S),P,y),b)f.x+=k+c;else if("string"!=typeof y.text){const t=h.lineHeight;f.y+=_a(y,t)+c}else f.y+=_})),Ti(this.ctx,t.textDirection)}drawTitle(){const t=this.options,e=t.title,i=Si(e.font),s=ki(e.padding);if(!e.display)return;const n=Oi(t.rtl,this.left,this.width),o=this.ctx,a=e.position,r=i.size/2,l=s.top+r;let h,c=this.left,d=this.width;if(this.isHorizontal())d=Math.max(...this.lineWidths),h=this.top+l,c=ft(t.align,c,this.right-d);else{const e=this.columnSizes.reduce(((t,e)=>Math.max(t,e.height)),0);h=l+ft(t.align,this.top,this.bottom-e-t.labels.padding-this._computeTitleHeight())}const u=ft(a,c,c+d);o.textAlign=n.textAlign(ut(a)),o.textBaseline="middle",o.strokeStyle=e.color,o.fillStyle=e.color,o.font=i.string,Ne(o,e.text,u,h,i)}_computeTitleHeight(){const t=this.options.title,e=Si(t.font),i=ki(t.padding);return t.display?e.lineHeight+i.height:0}_getLegendItemAt(t,e){let i,s,n;if(tt(t,this.left,this.right)&&tt(e,this.top,this.bottom))for(n=this.legendHitBoxes,i=0;i<n.length;++i)if(s=n[i],tt(t,s.left,s.left+s.width)&&tt(e,s.top,s.top+s.height))return this.legendItems[i];return null}handleEvent(t){const e=this.options;if(!function(t,e){if(("mousemove"===t||"mouseout"===t)&&(e.onHover||e.onLeave))return!0;if(e.onClick&&("click"===t||"mouseup"===t))return!0;return!1}(t.type,e))return;const i=this._getLegendItemAt(t.x,t.y);if("mousemove"===t.type||"mouseout"===t.type){const o=this._hoveredItem,a=(n=i,null!==(s=o)&&null!==n&&s.datasetIndex===n.datasetIndex&&s.index===n.index);o&&!a&&d(e.onLeave,[t,o,this],this),this._hoveredItem=i,i&&!a&&d(e.onHover,[t,i,this],this)}else i&&d(e.onClick,[t,i,this],this);var s,n}}function _a(t,e){return e*(t.text?t.text.length:0)}var ya={id:"legend",_element:xa,start(t,e,i){const s=t.legend=new xa({ctx:t.ctx,options:i,chart:t});as.configure(t,s,i),as.addBox(t,s)},stop(t){as.removeBox(t,t.legend),delete t.legend},beforeUpdate(t,e,i){const s=t.legend;as.configure(t,s,i),s.options=i},afterUpdate(t){const e=t.legend;e.buildLabels(),e.adjustHitBoxes()},afterEvent(t,e){e.replay||t.legend.handleEvent(e.event)},defaults:{display:!0,position:"top",align:"center",fullSize:!0,reverse:!1,weight:1e3,onClick(t,e,i){const s=e.datasetIndex,n=i.chart;n.isDatasetVisible(s)?(n.hide(s),e.hidden=!0):(n.show(s),e.hidden=!1)},onHover:null,onLeave:null,labels:{color:t=>t.chart.options.color,boxWidth:40,padding:10,generateLabels(t){const e=t.data.datasets,{labels:{usePointStyle:i,pointStyle:s,textAlign:n,color:o,useBorderRadius:a,borderRadius:r}}=t.legend.options;return t._getSortedDatasetMetas().map((t=>{const l=t.controller.getStyle(i?0:void 0),h=ki(l.borderWidth);return{text:e[t.index].label,fillStyle:l.backgroundColor,fontColor:o,hidden:!t.visible,lineCap:l.borderCapStyle,lineDash:l.borderDash,lineDashOffset:l.borderDashOffset,lineJoin:l.borderJoinStyle,lineWidth:(h.width+h.height)/4,strokeStyle:l.borderColor,pointStyle:s||l.pointStyle,rotation:l.rotation,textAlign:n||l.textAlign,borderRadius:a&&(r||l.borderRadius),datasetIndex:t.index}}),this)}},title:{color:t=>t.chart.options.color,display:!1,position:"center",text:""}},descriptors:{_scriptable:t=>!t.startsWith("on"),labels:{_scriptable:t=>!["generateLabels","filter","sort"].includes(t)}}};class va extends Hs{constructor(t){super(),this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this._padding=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e){const i=this.options;if(this.left=0,this.top=0,!i.display)return void(this.width=this.height=this.right=this.bottom=0);this.width=this.right=t,this.height=this.bottom=e;const s=n(i.text)?i.text.length:1;this._padding=ki(i.padding);const o=s*Si(i.font).lineHeight+this._padding.height;this.isHorizontal()?this.height=o:this.width=o}isHorizontal(){const t=this.options.position;return"top"===t||"bottom"===t}_drawArgs(t){const{top:e,left:i,bottom:s,right:n,options:o}=this,a=o.align;let r,l,h,c=0;return this.isHorizontal()?(l=ft(a,i,n),h=e+t,r=n-i):("left"===o.position?(l=i+t,h=ft(a,s,e),c=-.5*C):(l=n-t,h=ft(a,e,s),c=.5*C),r=s-e),{titleX:l,titleY:h,maxWidth:r,rotation:c}}draw(){const t=this.ctx,e=this.options;if(!e.display)return;const i=Si(e.font),s=i.lineHeight/2+this._padding.top,{titleX:n,titleY:o,maxWidth:a,rotation:r}=this._drawArgs(s);Ne(t,e.text,0,0,i,{color:e.color,maxWidth:a,rotation:r,textAlign:ut(e.align),textBaseline:"middle",translation:[n,o]})}}var Ma={id:"title",_element:va,start(t,e,i){!function(t,e){const i=new va({ctx:t.ctx,options:e,chart:t});as.configure(t,i,e),as.addBox(t,i),t.titleBlock=i}(t,i)},stop(t){const e=t.titleBlock;as.removeBox(t,e),delete t.titleBlock},beforeUpdate(t,e,i){const s=t.titleBlock;as.configure(t,s,i),s.options=i},defaults:{align:"center",display:!1,font:{weight:"bold"},fullSize:!0,padding:10,position:"top",text:"",weight:2e3},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const wa=new WeakMap;var ka={id:"subtitle",start(t,e,i){const s=new va({ctx:t.ctx,options:i,chart:t});as.configure(t,s,i),as.addBox(t,s),wa.set(t,s)},stop(t){as.removeBox(t,wa.get(t)),wa.delete(t)},beforeUpdate(t,e,i){const s=wa.get(t);as.configure(t,s,i),s.options=i},defaults:{align:"center",display:!1,font:{weight:"normal"},fullSize:!0,padding:0,position:"top",text:"",weight:1500},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const Sa={average(t){if(!t.length)return!1;let e,i,s=new Set,n=0,o=0;for(e=0,i=t.length;e<i;++e){const i=t[e].element;if(i&&i.hasValue()){const t=i.tooltipPosition();s.add(t.x),n+=t.y,++o}}if(0===o||0===s.size)return!1;return{x:[...s].reduce(((t,e)=>t+e))/s.size,y:n/o}},nearest(t,e){if(!t.length)return!1;let i,s,n,o=e.x,a=e.y,r=Number.POSITIVE_INFINITY;for(i=0,s=t.length;i<s;++i){const s=t[i].element;if(s&&s.hasValue()){const t=q(e,s.getCenterPoint());t<r&&(r=t,n=s)}}if(n){const t=n.tooltipPosition();o=t.x,a=t.y}return{x:o,y:a}}};function Pa(t,e){return e&&(n(e)?Array.prototype.push.apply(t,e):t.push(e)),t}function Da(t){return("string"==typeof t||t instanceof String)&&t.indexOf("\n")>-1?t.split("\n"):t}function Ca(t,e){const{element:i,datasetIndex:s,index:n}=e,o=t.getDatasetMeta(s).controller,{label:a,value:r}=o.getLabelAndValue(n);return{chart:t,label:a,parsed:o.getParsed(n),raw:t.data.datasets[s].data[n],formattedValue:r,dataset:o.getDataset(),dataIndex:n,datasetIndex:s,element:i}}function Oa(t,e){const i=t.chart.ctx,{body:s,footer:n,title:o}=t,{boxWidth:a,boxHeight:r}=e,l=Si(e.bodyFont),h=Si(e.titleFont),c=Si(e.footerFont),d=o.length,f=n.length,g=s.length,p=ki(e.padding);let m=p.height,b=0,x=s.reduce(((t,e)=>t+e.before.length+e.lines.length+e.after.length),0);if(x+=t.beforeBody.length+t.afterBody.length,d&&(m+=d*h.lineHeight+(d-1)*e.titleSpacing+e.titleMarginBottom),x){m+=g*(e.displayColors?Math.max(r,l.lineHeight):l.lineHeight)+(x-g)*l.lineHeight+(x-1)*e.bodySpacing}f&&(m+=e.footerMarginTop+f*c.lineHeight+(f-1)*e.footerSpacing);let _=0;const y=function(t){b=Math.max(b,i.measureText(t).width+_)};return i.save(),i.font=h.string,u(t.title,y),i.font=l.string,u(t.beforeBody.concat(t.afterBody),y),_=e.displayColors?a+2+e.boxPadding:0,u(s,(t=>{u(t.before,y),u(t.lines,y),u(t.after,y)})),_=0,i.font=c.string,u(t.footer,y),i.restore(),b+=p.width,{width:b,height:m}}function Aa(t,e,i,s){const{x:n,width:o}=i,{width:a,chartArea:{left:r,right:l}}=t;let h="center";return"center"===s?h=n<=(r+l)/2?"left":"right":n<=o/2?h="left":n>=a-o/2&&(h="right"),function(t,e,i,s){const{x:n,width:o}=s,a=i.caretSize+i.caretPadding;return"left"===t&&n+o+a>e.width||"right"===t&&n-o-a<0||void 0}(h,t,e,i)&&(h="center"),h}function Ta(t,e,i){const s=i.yAlign||e.yAlign||function(t,e){const{y:i,height:s}=e;return i<s/2?"top":i>t.height-s/2?"bottom":"center"}(t,i);return{xAlign:i.xAlign||e.xAlign||Aa(t,e,i,s),yAlign:s}}function La(t,e,i,s){const{caretSize:n,caretPadding:o,cornerRadius:a}=t,{xAlign:r,yAlign:l}=i,h=n+o,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:f}=wi(a);let g=function(t,e){let{x:i,width:s}=t;return"right"===e?i-=s:"center"===e&&(i-=s/2),i}(e,r);const p=function(t,e,i){let{y:s,height:n}=t;return"top"===e?s+=i:s-="bottom"===e?n+i:n/2,s}(e,l,h);return"center"===l?"left"===r?g+=h:"right"===r&&(g-=h):"left"===r?g-=Math.max(c,u)+n:"right"===r&&(g+=Math.max(d,f)+n),{x:J(g,0,s.width-e.width),y:J(p,0,s.height-e.height)}}function Ea(t,e,i){const s=ki(i.padding);return"center"===e?t.x+t.width/2:"right"===e?t.x+t.width-s.right:t.x+s.left}function Ra(t){return Pa([],Da(t))}function Ia(t,e){const i=e&&e.dataset&&e.dataset.tooltip&&e.dataset.tooltip.callbacks;return i?t.override(i):t}const za={beforeTitle:e,title(t){if(t.length>0){const e=t[0],i=e.chart.data.labels,s=i?i.length:0;if(this&&this.options&&"dataset"===this.options.mode)return e.dataset.label||"";if(e.label)return e.label;if(s>0&&e.dataIndex<s)return i[e.dataIndex]}return""},afterTitle:e,beforeBody:e,beforeLabel:e,label(t){if(this&&this.options&&"dataset"===this.options.mode)return t.label+": "+t.formattedValue||t.formattedValue;let e=t.dataset.label||"";e&&(e+=": ");const i=t.formattedValue;return s(i)||(e+=i),e},labelColor(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{borderColor:e.borderColor,backgroundColor:e.backgroundColor,borderWidth:e.borderWidth,borderDash:e.borderDash,borderDashOffset:e.borderDashOffset,borderRadius:0}},labelTextColor(){return this.options.bodyColor},labelPointStyle(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{pointStyle:e.pointStyle,rotation:e.rotation}},afterLabel:e,afterBody:e,beforeFooter:e,footer:e,afterFooter:e};function Fa(t,e,i,s){const n=t[e].call(i,s);return void 0===n?za[e].call(i,s):n}class Va extends Hs{static positioners=Sa;constructor(t){super(),this.opacity=0,this._active=[],this._eventPosition=void 0,this._size=void 0,this._cachedAnimations=void 0,this._tooltipItems=[],this.$animations=void 0,this.$context=void 0,this.chart=t.chart,this.options=t.options,this.dataPoints=void 0,this.title=void 0,this.beforeBody=void 0,this.body=void 0,this.afterBody=void 0,this.footer=void 0,this.xAlign=void 0,this.yAlign=void 0,this.x=void 0,this.y=void 0,this.height=void 0,this.width=void 0,this.caretX=void 0,this.caretY=void 0,this.labelColors=void 0,this.labelPointStyles=void 0,this.labelTextColors=void 0}initialize(t){this.options=t,this._cachedAnimations=void 0,this.$context=void 0}_resolveAnimations(){const t=this._cachedAnimations;if(t)return t;const e=this.chart,i=this.options.setContext(this.getContext()),s=i.enabled&&e.options.animation&&i.animations,n=new Os(this.chart,s);return s._cacheable&&(this._cachedAnimations=Object.freeze(n)),n}getContext(){return this.$context||(this.$context=(t=this.chart.getContext(),e=this,i=this._tooltipItems,Ci(t,{tooltip:e,tooltipItems:i,type:"tooltip"})));var t,e,i}getTitle(t,e){const{callbacks:i}=e,s=Fa(i,"beforeTitle",this,t),n=Fa(i,"title",this,t),o=Fa(i,"afterTitle",this,t);let a=[];return a=Pa(a,Da(s)),a=Pa(a,Da(n)),a=Pa(a,Da(o)),a}getBeforeBody(t,e){return Ra(Fa(e.callbacks,"beforeBody",this,t))}getBody(t,e){const{callbacks:i}=e,s=[];return u(t,(t=>{const e={before:[],lines:[],after:[]},n=Ia(i,t);Pa(e.before,Da(Fa(n,"beforeLabel",this,t))),Pa(e.lines,Fa(n,"label",this,t)),Pa(e.after,Da(Fa(n,"afterLabel",this,t))),s.push(e)})),s}getAfterBody(t,e){return Ra(Fa(e.callbacks,"afterBody",this,t))}getFooter(t,e){const{callbacks:i}=e,s=Fa(i,"beforeFooter",this,t),n=Fa(i,"footer",this,t),o=Fa(i,"afterFooter",this,t);let a=[];return a=Pa(a,Da(s)),a=Pa(a,Da(n)),a=Pa(a,Da(o)),a}_createItems(t){const e=this._active,i=this.chart.data,s=[],n=[],o=[];let a,r,l=[];for(a=0,r=e.length;a<r;++a)l.push(Ca(this.chart,e[a]));return t.filter&&(l=l.filter(((e,s,n)=>t.filter(e,s,n,i)))),t.itemSort&&(l=l.sort(((e,s)=>t.itemSort(e,s,i)))),u(l,(e=>{const i=Ia(t.callbacks,e);s.push(Fa(i,"labelColor",this,e)),n.push(Fa(i,"labelPointStyle",this,e)),o.push(Fa(i,"labelTextColor",this,e))})),this.labelColors=s,this.labelPointStyles=n,this.labelTextColors=o,this.dataPoints=l,l}update(t,e){const i=this.options.setContext(this.getContext()),s=this._active;let n,o=[];if(s.length){const t=Sa[i.position].call(this,s,this._eventPosition);o=this._createItems(i),this.title=this.getTitle(o,i),this.beforeBody=this.getBeforeBody(o,i),this.body=this.getBody(o,i),this.afterBody=this.getAfterBody(o,i),this.footer=this.getFooter(o,i);const e=this._size=Oa(this,i),a=Object.assign({},t,e),r=Ta(this.chart,i,a),l=La(i,a,r,this.chart);this.xAlign=r.xAlign,this.yAlign=r.yAlign,n={opacity:1,x:l.x,y:l.y,width:e.width,height:e.height,caretX:t.x,caretY:t.y}}else 0!==this.opacity&&(n={opacity:0});this._tooltipItems=o,this.$context=void 0,n&&this._resolveAnimations().update(this,n),t&&i.external&&i.external.call(this,{chart:this.chart,tooltip:this,replay:e})}drawCaret(t,e,i,s){const n=this.getCaretPosition(t,i,s);e.lineTo(n.x1,n.y1),e.lineTo(n.x2,n.y2),e.lineTo(n.x3,n.y3)}getCaretPosition(t,e,i){const{xAlign:s,yAlign:n}=this,{caretSize:o,cornerRadius:a}=i,{topLeft:r,topRight:l,bottomLeft:h,bottomRight:c}=wi(a),{x:d,y:u}=t,{width:f,height:g}=e;let p,m,b,x,_,y;return"center"===n?(_=u+g/2,"left"===s?(p=d,m=p-o,x=_+o,y=_-o):(p=d+f,m=p+o,x=_-o,y=_+o),b=p):(m="left"===s?d+Math.max(r,h)+o:"right"===s?d+f-Math.max(l,c)-o:this.caretX,"top"===n?(x=u,_=x-o,p=m-o,b=m+o):(x=u+g,_=x+o,p=m+o,b=m-o),y=x),{x1:p,x2:m,x3:b,y1:x,y2:_,y3:y}}drawTitle(t,e,i){const s=this.title,n=s.length;let o,a,r;if(n){const l=Oi(i.rtl,this.x,this.width);for(t.x=Ea(this,i.titleAlign,i),e.textAlign=l.textAlign(i.titleAlign),e.textBaseline="middle",o=Si(i.titleFont),a=i.titleSpacing,e.fillStyle=i.titleColor,e.font=o.string,r=0;r<n;++r)e.fillText(s[r],l.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+a,r+1===n&&(t.y+=i.titleMarginBottom-a)}}_drawColorBox(t,e,i,s,n){const a=this.labelColors[i],r=this.labelPointStyles[i],{boxHeight:l,boxWidth:h}=n,c=Si(n.bodyFont),d=Ea(this,"left",n),u=s.x(d),f=l<c.lineHeight?(c.lineHeight-l)/2:0,g=e.y+f;if(n.usePointStyle){const e={radius:Math.min(h,l)/2,pointStyle:r.pointStyle,rotation:r.rotation,borderWidth:1},i=s.leftForLtr(u,h)+h/2,o=g+l/2;t.strokeStyle=n.multiKeyBackground,t.fillStyle=n.multiKeyBackground,Le(t,e,i,o),t.strokeStyle=a.borderColor,t.fillStyle=a.backgroundColor,Le(t,e,i,o)}else{t.lineWidth=o(a.borderWidth)?Math.max(...Object.values(a.borderWidth)):a.borderWidth||1,t.strokeStyle=a.borderColor,t.setLineDash(a.borderDash||[]),t.lineDashOffset=a.borderDashOffset||0;const e=s.leftForLtr(u,h),i=s.leftForLtr(s.xPlus(u,1),h-2),r=wi(a.borderRadius);Object.values(r).some((t=>0!==t))?(t.beginPath(),t.fillStyle=n.multiKeyBackground,He(t,{x:e,y:g,w:h,h:l,radius:r}),t.fill(),t.stroke(),t.fillStyle=a.backgroundColor,t.beginPath(),He(t,{x:i,y:g+1,w:h-2,h:l-2,radius:r}),t.fill()):(t.fillStyle=n.multiKeyBackground,t.fillRect(e,g,h,l),t.strokeRect(e,g,h,l),t.fillStyle=a.backgroundColor,t.fillRect(i,g+1,h-2,l-2))}t.fillStyle=this.labelTextColors[i]}drawBody(t,e,i){const{body:s}=this,{bodySpacing:n,bodyAlign:o,displayColors:a,boxHeight:r,boxWidth:l,boxPadding:h}=i,c=Si(i.bodyFont);let d=c.lineHeight,f=0;const g=Oi(i.rtl,this.x,this.width),p=function(i){e.fillText(i,g.x(t.x+f),t.y+d/2),t.y+=d+n},m=g.textAlign(o);let b,x,_,y,v,M,w;for(e.textAlign=o,e.textBaseline="middle",e.font=c.string,t.x=Ea(this,m,i),e.fillStyle=i.bodyColor,u(this.beforeBody,p),f=a&&"right"!==m?"center"===o?l/2+h:l+2+h:0,y=0,M=s.length;y<M;++y){for(b=s[y],x=this.labelTextColors[y],e.fillStyle=x,u(b.before,p),_=b.lines,a&&_.length&&(this._drawColorBox(e,t,y,g,i),d=Math.max(c.lineHeight,r)),v=0,w=_.length;v<w;++v)p(_[v]),d=c.lineHeight;u(b.after,p)}f=0,d=c.lineHeight,u(this.afterBody,p),t.y-=n}drawFooter(t,e,i){const s=this.footer,n=s.length;let o,a;if(n){const r=Oi(i.rtl,this.x,this.width);for(t.x=Ea(this,i.footerAlign,i),t.y+=i.footerMarginTop,e.textAlign=r.textAlign(i.footerAlign),e.textBaseline="middle",o=Si(i.footerFont),e.fillStyle=i.footerColor,e.font=o.string,a=0;a<n;++a)e.fillText(s[a],r.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+i.footerSpacing}}drawBackground(t,e,i,s){const{xAlign:n,yAlign:o}=this,{x:a,y:r}=t,{width:l,height:h}=i,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:f}=wi(s.cornerRadius);e.fillStyle=s.backgroundColor,e.strokeStyle=s.borderColor,e.lineWidth=s.borderWidth,e.beginPath(),e.moveTo(a+c,r),"top"===o&&this.drawCaret(t,e,i,s),e.lineTo(a+l-d,r),e.quadraticCurveTo(a+l,r,a+l,r+d),"center"===o&&"right"===n&&this.drawCaret(t,e,i,s),e.lineTo(a+l,r+h-f),e.quadraticCurveTo(a+l,r+h,a+l-f,r+h),"bottom"===o&&this.drawCaret(t,e,i,s),e.lineTo(a+u,r+h),e.quadraticCurveTo(a,r+h,a,r+h-u),"center"===o&&"left"===n&&this.drawCaret(t,e,i,s),e.lineTo(a,r+c),e.quadraticCurveTo(a,r,a+c,r),e.closePath(),e.fill(),s.borderWidth>0&&e.stroke()}_updateAnimationTarget(t){const e=this.chart,i=this.$animations,s=i&&i.x,n=i&&i.y;if(s||n){const i=Sa[t.position].call(this,this._active,this._eventPosition);if(!i)return;const o=this._size=Oa(this,t),a=Object.assign({},i,this._size),r=Ta(e,t,a),l=La(t,a,r,e);s._to===l.x&&n._to===l.y||(this.xAlign=r.xAlign,this.yAlign=r.yAlign,this.width=o.width,this.height=o.height,this.caretX=i.x,this.caretY=i.y,this._resolveAnimations().update(this,l))}}_willRender(){return!!this.opacity}draw(t){const e=this.options.setContext(this.getContext());let i=this.opacity;if(!i)return;this._updateAnimationTarget(e);const s={width:this.width,height:this.height},n={x:this.x,y:this.y};i=Math.abs(i)<.001?0:i;const o=ki(e.padding),a=this.title.length||this.beforeBody.length||this.body.length||this.afterBody.length||this.footer.length;e.enabled&&a&&(t.save(),t.globalAlpha=i,this.drawBackground(n,t,s,e),Ai(t,e.textDirection),n.y+=o.top,this.drawTitle(n,t,e),this.drawBody(n,t,e),this.drawFooter(n,t,e),Ti(t,e.textDirection),t.restore())}getActiveElements(){return this._active||[]}setActiveElements(t,e){const i=this._active,s=t.map((({datasetIndex:t,index:e})=>{const i=this.chart.getDatasetMeta(t);if(!i)throw new Error("Cannot find a dataset at index "+t);return{datasetIndex:t,element:i.data[e],index:e}})),n=!f(i,s),o=this._positionChanged(s,e);(n||o)&&(this._active=s,this._eventPosition=e,this._ignoreReplayEvents=!0,this.update(!0))}handleEvent(t,e,i=!0){if(e&&this._ignoreReplayEvents)return!1;this._ignoreReplayEvents=!1;const s=this.options,n=this._active||[],o=this._getActiveElements(t,n,e,i),a=this._positionChanged(o,t),r=e||!f(o,n)||a;return r&&(this._active=o,(s.enabled||s.external)&&(this._eventPosition={x:t.x,y:t.y},this.update(!0,e))),r}_getActiveElements(t,e,i,s){const n=this.options;if("mouseout"===t.type)return[];if(!s)return e.filter((t=>this.chart.data.datasets[t.datasetIndex]&&void 0!==this.chart.getDatasetMeta(t.datasetIndex).controller.getParsed(t.index)));const o=this.chart.getElementsAtEventForMode(t,n.mode,n,i);return n.reverse&&o.reverse(),o}_positionChanged(t,e){const{caretX:i,caretY:s,options:n}=this,o=Sa[n.position].call(this,t,e);return!1!==o&&(i!==o.x||s!==o.y)}}var Ba={id:"tooltip",_element:Va,positioners:Sa,afterInit(t,e,i){i&&(t.tooltip=new Va({chart:t,options:i}))},beforeUpdate(t,e,i){t.tooltip&&t.tooltip.initialize(i)},reset(t,e,i){t.tooltip&&t.tooltip.initialize(i)},afterDraw(t){const e=t.tooltip;if(e&&e._willRender()){const i={tooltip:e};if(!1===t.notifyPlugins("beforeTooltipDraw",{...i,cancelable:!0}))return;e.draw(t.ctx),t.notifyPlugins("afterTooltipDraw",i)}},afterEvent(t,e){if(t.tooltip){const i=e.replay;t.tooltip.handleEvent(e.event,i,e.inChartArea)&&(e.changed=!0)}},defaults:{enabled:!0,external:null,position:"average",backgroundColor:"rgba(0,0,0,0.8)",titleColor:"#fff",titleFont:{weight:"bold"},titleSpacing:2,titleMarginBottom:6,titleAlign:"left",bodyColor:"#fff",bodySpacing:2,bodyFont:{},bodyAlign:"left",footerColor:"#fff",footerSpacing:2,footerMarginTop:6,footerFont:{weight:"bold"},footerAlign:"left",padding:6,caretPadding:2,caretSize:5,cornerRadius:6,boxHeight:(t,e)=>e.bodyFont.size,boxWidth:(t,e)=>e.bodyFont.size,multiKeyBackground:"#fff",displayColors:!0,boxPadding:0,borderColor:"rgba(0,0,0,0)",borderWidth:0,animation:{duration:400,easing:"easeOutQuart"},animations:{numbers:{type:"number",properties:["x","y","width","height","caretX","caretY"]},opacity:{easing:"linear",duration:200}},callbacks:za},defaultRoutes:{bodyFont:"font",footerFont:"font",titleFont:"font"},descriptors:{_scriptable:t=>"filter"!==t&&"itemSort"!==t&&"external"!==t,_indexable:!1,callbacks:{_scriptable:!1,_indexable:!1},animation:{_fallback:!1},animations:{_fallback:"animation"}},additionalOptionScopes:["interaction"]};return An.register(Yn,jo,fo,t),An.helpers={...Wi},An._adapters=Rn,An.Animation=Cs,An.Animations=Os,An.animator=xt,An.controllers=en.controllers.items,An.DatasetController=Ns,An.Element=Hs,An.elements=fo,An.Interaction=Xi,An.layouts=as,An.platforms=Ss,An.Scale=Js,An.Ticks=ae,Object.assign(An,Yn,jo,fo,t,Ss),An.Chart=An,"undefined"!=typeof window&&(window.Chart=An),An}));

/*!
 * chartjs-adapter-date-fns v3.0.0
 * https://www.chartjs.org
 * (c) 2022 chartjs-adapter-date-fns Contributors
 * Released under the MIT license
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(require("chart.js")):"function"==typeof define&&define.amd?define(["chart.js"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).Chart)}(this,(function(t){"use strict";function e(t){if(null===t||!0===t||!1===t)return NaN;var e=Number(t);return isNaN(e)?e:e<0?Math.ceil(e):Math.floor(e)}function r(t,e){if(e.length<t)throw new TypeError(t+" argument"+(t>1?"s":"")+" required, but only "+e.length+" present")}function n(t){r(1,arguments);var e=Object.prototype.toString.call(t);return t instanceof Date||"object"==typeof t&&"[object Date]"===e?new Date(t.getTime()):"number"==typeof t||"[object Number]"===e?new Date(t):("string"!=typeof t&&"[object String]"!==e||"undefined"==typeof console||(console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"),console.warn((new Error).stack)),new Date(NaN))}function a(t,a){r(2,arguments);var i=n(t),o=e(a);return isNaN(o)?new Date(NaN):o?(i.setDate(i.getDate()+o),i):i}function i(t,a){r(2,arguments);var i=n(t),o=e(a);if(isNaN(o))return new Date(NaN);if(!o)return i;var u=i.getDate(),s=new Date(i.getTime());s.setMonth(i.getMonth()+o+1,0);var c=s.getDate();return u>=c?s:(i.setFullYear(s.getFullYear(),s.getMonth(),u),i)}function o(t,a){r(2,arguments);var i=n(t).getTime(),o=e(a);return new Date(i+o)}var u=36e5;function s(t,a){r(1,arguments);var i=a||{},o=i.locale,u=o&&o.options&&o.options.weekStartsOn,s=null==u?0:e(u),c=null==i.weekStartsOn?s:e(i.weekStartsOn);if(!(c>=0&&c<=6))throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");var d=n(t),l=d.getDay(),f=(l<c?7:0)+l-c;return d.setDate(d.getDate()-f),d.setHours(0,0,0,0),d}function c(t){var e=new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate(),t.getHours(),t.getMinutes(),t.getSeconds(),t.getMilliseconds()));return e.setUTCFullYear(t.getFullYear()),t.getTime()-e.getTime()}function d(t){r(1,arguments);var e=n(t);return e.setHours(0,0,0,0),e}var l=864e5;function f(t,e){r(2,arguments);var n=d(t),a=d(e),i=n.getTime()-c(n),o=a.getTime()-c(a);return Math.round((i-o)/l)}function h(t,e){r(2,arguments);var a=n(t),i=n(e),o=a.getTime()-i.getTime();return o<0?-1:o>0?1:o}function m(t){r(1,arguments);var e=n(t);return!isNaN(e)}function w(t,e){r(2,arguments);var a=n(t),i=n(e),o=a.getFullYear()-i.getFullYear(),u=a.getMonth()-i.getMonth();return 12*o+u}function g(t,e){r(2,arguments);var a=n(t),i=n(e);return a.getFullYear()-i.getFullYear()}function v(t,e){var r=t.getFullYear()-e.getFullYear()||t.getMonth()-e.getMonth()||t.getDate()-e.getDate()||t.getHours()-e.getHours()||t.getMinutes()-e.getMinutes()||t.getSeconds()-e.getSeconds()||t.getMilliseconds()-e.getMilliseconds();return r<0?-1:r>0?1:r}function y(t,e){r(2,arguments);var a=n(t),i=n(e),o=v(a,i),u=Math.abs(f(a,i));a.setDate(a.getDate()-o*u);var s=v(a,i)===-o,c=o*(u-s);return 0===c?0:c}function b(t,e){r(2,arguments);var a=n(t),i=n(e);return a.getTime()-i.getTime()}var T=36e5;function p(t){r(1,arguments);var e=n(t);return e.setHours(23,59,59,999),e}function C(t){r(1,arguments);var e=n(t),a=e.getMonth();return e.setFullYear(e.getFullYear(),a+1,0),e.setHours(23,59,59,999),e}function M(t){r(1,arguments);var e=n(t);return p(e).getTime()===C(e).getTime()}function D(t,e){r(2,arguments);var a,i=n(t),o=n(e),u=h(i,o),s=Math.abs(w(i,o));if(s<1)a=0;else{1===i.getMonth()&&i.getDate()>27&&i.setDate(30),i.setMonth(i.getMonth()-u*s);var c=h(i,o)===-u;M(n(t))&&1===s&&1===h(t,o)&&(c=!1),a=u*(s-c)}return 0===a?0:a}var x={lessThanXSeconds:{one:"less than a second",other:"less than {{count}} seconds"},xSeconds:{one:"1 second",other:"{{count}} seconds"},halfAMinute:"half a minute",lessThanXMinutes:{one:"less than a minute",other:"less than {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"about 1 hour",other:"about {{count}} hours"},xHours:{one:"1 hour",other:"{{count}} hours"},xDays:{one:"1 day",other:"{{count}} days"},aboutXWeeks:{one:"about 1 week",other:"about {{count}} weeks"},xWeeks:{one:"1 week",other:"{{count}} weeks"},aboutXMonths:{one:"about 1 month",other:"about {{count}} months"},xMonths:{one:"1 month",other:"{{count}} months"},aboutXYears:{one:"about 1 year",other:"about {{count}} years"},xYears:{one:"1 year",other:"{{count}} years"},overXYears:{one:"over 1 year",other:"over {{count}} years"},almostXYears:{one:"almost 1 year",other:"almost {{count}} years"}};function k(t){return function(e){var r=e||{},n=r.width?String(r.width):t.defaultWidth;return t.formats[n]||t.formats[t.defaultWidth]}}var U={date:k({formats:{full:"EEEE, MMMM do, y",long:"MMMM do, y",medium:"MMM d, y",short:"MM/dd/yyyy"},defaultWidth:"full"}),time:k({formats:{full:"h:mm:ss a zzzz",long:"h:mm:ss a z",medium:"h:mm:ss a",short:"h:mm a"},defaultWidth:"full"}),dateTime:k({formats:{full:"{{date}} 'at' {{time}}",long:"{{date}} 'at' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},defaultWidth:"full"})},Y={lastWeek:"'last' eeee 'at' p",yesterday:"'yesterday at' p",today:"'today at' p",tomorrow:"'tomorrow at' p",nextWeek:"eeee 'at' p",other:"P"};function N(t){return function(e,r){var n,a=r||{};if("formatting"===(a.context?String(a.context):"standalone")&&t.formattingValues){var i=t.defaultFormattingWidth||t.defaultWidth,o=a.width?String(a.width):i;n=t.formattingValues[o]||t.formattingValues[i]}else{var u=t.defaultWidth,s=a.width?String(a.width):t.defaultWidth;n=t.values[s]||t.values[u]}return n[t.argumentCallback?t.argumentCallback(e):e]}}function S(t){return function(e,r){var n=String(e),a=r||{},i=a.width,o=i&&t.matchPatterns[i]||t.matchPatterns[t.defaultMatchWidth],u=n.match(o);if(!u)return null;var s,c=u[0],d=i&&t.parsePatterns[i]||t.parsePatterns[t.defaultParseWidth];return s="[object Array]"===Object.prototype.toString.call(d)?function(t,e){for(var r=0;r<t.length;r++)if(e(t[r]))return r}(d,(function(t){return t.test(c)})):function(t,e){for(var r in t)if(t.hasOwnProperty(r)&&e(t[r]))return r}(d,(function(t){return t.test(c)})),s=t.valueCallback?t.valueCallback(s):s,{value:s=a.valueCallback?a.valueCallback(s):s,rest:n.slice(c.length)}}}var P,q={code:"en-US",formatDistance:function(t,e,r){var n;return r=r||{},n="string"==typeof x[t]?x[t]:1===e?x[t].one:x[t].other.replace("{{count}}",e),r.addSuffix?r.comparison>0?"in "+n:n+" ago":n},formatLong:U,formatRelative:function(t,e,r,n){return Y[t]},localize:{ordinalNumber:function(t,e){var r=Number(t),n=r%100;if(n>20||n<10)switch(n%10){case 1:return r+"st";case 2:return r+"nd";case 3:return r+"rd"}return r+"th"},era:N({values:{narrow:["B","A"],abbreviated:["BC","AD"],wide:["Before Christ","Anno Domini"]},defaultWidth:"wide"}),quarter:N({values:{narrow:["1","2","3","4"],abbreviated:["Q1","Q2","Q3","Q4"],wide:["1st quarter","2nd quarter","3rd quarter","4th quarter"]},defaultWidth:"wide",argumentCallback:function(t){return Number(t)-1}}),month:N({values:{narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],wide:["January","February","March","April","May","June","July","August","September","October","November","December"]},defaultWidth:"wide"}),day:N({values:{narrow:["S","M","T","W","T","F","S"],short:["Su","Mo","Tu","We","Th","Fr","Sa"],abbreviated:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],wide:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},defaultWidth:"wide"}),dayPeriod:N({values:{narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"}},defaultWidth:"wide",formattingValues:{narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"}},defaultFormattingWidth:"wide"})},match:{ordinalNumber:(P={matchPattern:/^(\d+)(th|st|nd|rd)?/i,parsePattern:/\d+/i,valueCallback:function(t){return parseInt(t,10)}},function(t,e){var r=String(t),n=e||{},a=r.match(P.matchPattern);if(!a)return null;var i=a[0],o=r.match(P.parsePattern);if(!o)return null;var u=P.valueCallback?P.valueCallback(o[0]):o[0];return{value:u=n.valueCallback?n.valueCallback(u):u,rest:r.slice(i.length)}}),era:S({matchPatterns:{narrow:/^(b|a)/i,abbreviated:/^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,wide:/^(before christ|before common era|anno domini|common era)/i},defaultMatchWidth:"wide",parsePatterns:{any:[/^b/i,/^(a|c)/i]},defaultParseWidth:"any"}),quarter:S({matchPatterns:{narrow:/^[1234]/i,abbreviated:/^q[1234]/i,wide:/^[1234](th|st|nd|rd)? quarter/i},defaultMatchWidth:"wide",parsePatterns:{any:[/1/i,/2/i,/3/i,/4/i]},defaultParseWidth:"any",valueCallback:function(t){return t+1}}),month:S({matchPatterns:{narrow:/^[jfmasond]/i,abbreviated:/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,wide:/^(january|february|march|april|may|june|july|august|september|october|november|december)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^ap/i,/^may/i,/^jun/i,/^jul/i,/^au/i,/^s/i,/^o/i,/^n/i,/^d/i]},defaultParseWidth:"any"}),day:S({matchPatterns:{narrow:/^[smtwf]/i,short:/^(su|mo|tu|we|th|fr|sa)/i,abbreviated:/^(sun|mon|tue|wed|thu|fri|sat)/i,wide:/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^s/i,/^m/i,/^t/i,/^w/i,/^t/i,/^f/i,/^s/i],any:[/^su/i,/^m/i,/^tu/i,/^w/i,/^th/i,/^f/i,/^sa/i]},defaultParseWidth:"any"}),dayPeriod:S({matchPatterns:{narrow:/^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,any:/^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i},defaultMatchWidth:"any",parsePatterns:{any:{am:/^a/i,pm:/^p/i,midnight:/^mi/i,noon:/^no/i,morning:/morning/i,afternoon:/afternoon/i,evening:/evening/i,night:/night/i}},defaultParseWidth:"any"})},options:{weekStartsOn:0,firstWeekContainsDate:1}};function H(t,n){r(2,arguments);var a=e(n);return o(t,-a)}function E(t,e){for(var r=t<0?"-":"",n=Math.abs(t).toString();n.length<e;)n="0"+n;return r+n}var O={y:function(t,e){var r=t.getUTCFullYear(),n=r>0?r:1-r;return E("yy"===e?n%100:n,e.length)},M:function(t,e){var r=t.getUTCMonth();return"M"===e?String(r+1):E(r+1,2)},d:function(t,e){return E(t.getUTCDate(),e.length)},a:function(t,e){var r=t.getUTCHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return r.toUpperCase();case"aaa":return r;case"aaaaa":return r[0];default:return"am"===r?"a.m.":"p.m."}},h:function(t,e){return E(t.getUTCHours()%12||12,e.length)},H:function(t,e){return E(t.getUTCHours(),e.length)},m:function(t,e){return E(t.getUTCMinutes(),e.length)},s:function(t,e){return E(t.getUTCSeconds(),e.length)},S:function(t,e){var r=e.length,n=t.getUTCMilliseconds();return E(Math.floor(n*Math.pow(10,r-3)),e.length)}},F=864e5;function W(t){r(1,arguments);var e=1,a=n(t),i=a.getUTCDay(),o=(i<e?7:0)+i-e;return a.setUTCDate(a.getUTCDate()-o),a.setUTCHours(0,0,0,0),a}function L(t){r(1,arguments);var e=n(t),a=e.getUTCFullYear(),i=new Date(0);i.setUTCFullYear(a+1,0,4),i.setUTCHours(0,0,0,0);var o=W(i),u=new Date(0);u.setUTCFullYear(a,0,4),u.setUTCHours(0,0,0,0);var s=W(u);return e.getTime()>=o.getTime()?a+1:e.getTime()>=s.getTime()?a:a-1}function Q(t){r(1,arguments);var e=L(t),n=new Date(0);n.setUTCFullYear(e,0,4),n.setUTCHours(0,0,0,0);var a=W(n);return a}var R=6048e5;function I(t){r(1,arguments);var e=n(t),a=W(e).getTime()-Q(e).getTime();return Math.round(a/R)+1}function G(t,a){r(1,arguments);var i=a||{},o=i.locale,u=o&&o.options&&o.options.weekStartsOn,s=null==u?0:e(u),c=null==i.weekStartsOn?s:e(i.weekStartsOn);if(!(c>=0&&c<=6))throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");var d=n(t),l=d.getUTCDay(),f=(l<c?7:0)+l-c;return d.setUTCDate(d.getUTCDate()-f),d.setUTCHours(0,0,0,0),d}function X(t,a){r(1,arguments);var i=n(t,a),o=i.getUTCFullYear(),u=a||{},s=u.locale,c=s&&s.options&&s.options.firstWeekContainsDate,d=null==c?1:e(c),l=null==u.firstWeekContainsDate?d:e(u.firstWeekContainsDate);if(!(l>=1&&l<=7))throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");var f=new Date(0);f.setUTCFullYear(o+1,0,l),f.setUTCHours(0,0,0,0);var h=G(f,a),m=new Date(0);m.setUTCFullYear(o,0,l),m.setUTCHours(0,0,0,0);var w=G(m,a);return i.getTime()>=h.getTime()?o+1:i.getTime()>=w.getTime()?o:o-1}function j(t,n){r(1,arguments);var a=n||{},i=a.locale,o=i&&i.options&&i.options.firstWeekContainsDate,u=null==o?1:e(o),s=null==a.firstWeekContainsDate?u:e(a.firstWeekContainsDate),c=X(t,n),d=new Date(0);d.setUTCFullYear(c,0,s),d.setUTCHours(0,0,0,0);var l=G(d,n);return l}var B=6048e5;function z(t,e){r(1,arguments);var a=n(t),i=G(a,e).getTime()-j(a,e).getTime();return Math.round(i/B)+1}var A="midnight",Z="noon",K="morning",$="afternoon",_="evening",J="night",V={G:function(t,e,r){var n=t.getUTCFullYear()>0?1:0;switch(e){case"G":case"GG":case"GGG":return r.era(n,{width:"abbreviated"});case"GGGGG":return r.era(n,{width:"narrow"});default:return r.era(n,{width:"wide"})}},y:function(t,e,r){if("yo"===e){var n=t.getUTCFullYear(),a=n>0?n:1-n;return r.ordinalNumber(a,{unit:"year"})}return O.y(t,e)},Y:function(t,e,r,n){var a=X(t,n),i=a>0?a:1-a;return"YY"===e?E(i%100,2):"Yo"===e?r.ordinalNumber(i,{unit:"year"}):E(i,e.length)},R:function(t,e){return E(L(t),e.length)},u:function(t,e){return E(t.getUTCFullYear(),e.length)},Q:function(t,e,r){var n=Math.ceil((t.getUTCMonth()+1)/3);switch(e){case"Q":return String(n);case"QQ":return E(n,2);case"Qo":return r.ordinalNumber(n,{unit:"quarter"});case"QQQ":return r.quarter(n,{width:"abbreviated",context:"formatting"});case"QQQQQ":return r.quarter(n,{width:"narrow",context:"formatting"});default:return r.quarter(n,{width:"wide",context:"formatting"})}},q:function(t,e,r){var n=Math.ceil((t.getUTCMonth()+1)/3);switch(e){case"q":return String(n);case"qq":return E(n,2);case"qo":return r.ordinalNumber(n,{unit:"quarter"});case"qqq":return r.quarter(n,{width:"abbreviated",context:"standalone"});case"qqqqq":return r.quarter(n,{width:"narrow",context:"standalone"});default:return r.quarter(n,{width:"wide",context:"standalone"})}},M:function(t,e,r){var n=t.getUTCMonth();switch(e){case"M":case"MM":return O.M(t,e);case"Mo":return r.ordinalNumber(n+1,{unit:"month"});case"MMM":return r.month(n,{width:"abbreviated",context:"formatting"});case"MMMMM":return r.month(n,{width:"narrow",context:"formatting"});default:return r.month(n,{width:"wide",context:"formatting"})}},L:function(t,e,r){var n=t.getUTCMonth();switch(e){case"L":return String(n+1);case"LL":return E(n+1,2);case"Lo":return r.ordinalNumber(n+1,{unit:"month"});case"LLL":return r.month(n,{width:"abbreviated",context:"standalone"});case"LLLLL":return r.month(n,{width:"narrow",context:"standalone"});default:return r.month(n,{width:"wide",context:"standalone"})}},w:function(t,e,r,n){var a=z(t,n);return"wo"===e?r.ordinalNumber(a,{unit:"week"}):E(a,e.length)},I:function(t,e,r){var n=I(t);return"Io"===e?r.ordinalNumber(n,{unit:"week"}):E(n,e.length)},d:function(t,e,r){return"do"===e?r.ordinalNumber(t.getUTCDate(),{unit:"date"}):O.d(t,e)},D:function(t,e,a){var i=function(t){r(1,arguments);var e=n(t),a=e.getTime();e.setUTCMonth(0,1),e.setUTCHours(0,0,0,0);var i=e.getTime(),o=a-i;return Math.floor(o/F)+1}(t);return"Do"===e?a.ordinalNumber(i,{unit:"dayOfYear"}):E(i,e.length)},E:function(t,e,r){var n=t.getUTCDay();switch(e){case"E":case"EE":case"EEE":return r.day(n,{width:"abbreviated",context:"formatting"});case"EEEEE":return r.day(n,{width:"narrow",context:"formatting"});case"EEEEEE":return r.day(n,{width:"short",context:"formatting"});default:return r.day(n,{width:"wide",context:"formatting"})}},e:function(t,e,r,n){var a=t.getUTCDay(),i=(a-n.weekStartsOn+8)%7||7;switch(e){case"e":return String(i);case"ee":return E(i,2);case"eo":return r.ordinalNumber(i,{unit:"day"});case"eee":return r.day(a,{width:"abbreviated",context:"formatting"});case"eeeee":return r.day(a,{width:"narrow",context:"formatting"});case"eeeeee":return r.day(a,{width:"short",context:"formatting"});default:return r.day(a,{width:"wide",context:"formatting"})}},c:function(t,e,r,n){var a=t.getUTCDay(),i=(a-n.weekStartsOn+8)%7||7;switch(e){case"c":return String(i);case"cc":return E(i,e.length);case"co":return r.ordinalNumber(i,{unit:"day"});case"ccc":return r.day(a,{width:"abbreviated",context:"standalone"});case"ccccc":return r.day(a,{width:"narrow",context:"standalone"});case"cccccc":return r.day(a,{width:"short",context:"standalone"});default:return r.day(a,{width:"wide",context:"standalone"})}},i:function(t,e,r){var n=t.getUTCDay(),a=0===n?7:n;switch(e){case"i":return String(a);case"ii":return E(a,e.length);case"io":return r.ordinalNumber(a,{unit:"day"});case"iii":return r.day(n,{width:"abbreviated",context:"formatting"});case"iiiii":return r.day(n,{width:"narrow",context:"formatting"});case"iiiiii":return r.day(n,{width:"short",context:"formatting"});default:return r.day(n,{width:"wide",context:"formatting"})}},a:function(t,e,r){var n=t.getUTCHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return r.dayPeriod(n,{width:"abbreviated",context:"formatting"});case"aaa":return r.dayPeriod(n,{width:"abbreviated",context:"formatting"}).toLowerCase();case"aaaaa":return r.dayPeriod(n,{width:"narrow",context:"formatting"});default:return r.dayPeriod(n,{width:"wide",context:"formatting"})}},b:function(t,e,r){var n,a=t.getUTCHours();switch(n=12===a?Z:0===a?A:a/12>=1?"pm":"am",e){case"b":case"bb":return r.dayPeriod(n,{width:"abbreviated",context:"formatting"});case"bbb":return r.dayPeriod(n,{width:"abbreviated",context:"formatting"}).toLowerCase();case"bbbbb":return r.dayPeriod(n,{width:"narrow",context:"formatting"});default:return r.dayPeriod(n,{width:"wide",context:"formatting"})}},B:function(t,e,r){var n,a=t.getUTCHours();switch(n=a>=17?_:a>=12?$:a>=4?K:J,e){case"B":case"BB":case"BBB":return r.dayPeriod(n,{width:"abbreviated",context:"formatting"});case"BBBBB":return r.dayPeriod(n,{width:"narrow",context:"formatting"});default:return r.dayPeriod(n,{width:"wide",context:"formatting"})}},h:function(t,e,r){if("ho"===e){var n=t.getUTCHours()%12;return 0===n&&(n=12),r.ordinalNumber(n,{unit:"hour"})}return O.h(t,e)},H:function(t,e,r){return"Ho"===e?r.ordinalNumber(t.getUTCHours(),{unit:"hour"}):O.H(t,e)},K:function(t,e,r){var n=t.getUTCHours()%12;return"Ko"===e?r.ordinalNumber(n,{unit:"hour"}):E(n,e.length)},k:function(t,e,r){var n=t.getUTCHours();return 0===n&&(n=24),"ko"===e?r.ordinalNumber(n,{unit:"hour"}):E(n,e.length)},m:function(t,e,r){return"mo"===e?r.ordinalNumber(t.getUTCMinutes(),{unit:"minute"}):O.m(t,e)},s:function(t,e,r){return"so"===e?r.ordinalNumber(t.getUTCSeconds(),{unit:"second"}):O.s(t,e)},S:function(t,e){return O.S(t,e)},X:function(t,e,r,n){var a=(n._originalDate||t).getTimezoneOffset();if(0===a)return"Z";switch(e){case"X":return et(a);case"XXXX":case"XX":return rt(a);default:return rt(a,":")}},x:function(t,e,r,n){var a=(n._originalDate||t).getTimezoneOffset();switch(e){case"x":return et(a);case"xxxx":case"xx":return rt(a);default:return rt(a,":")}},O:function(t,e,r,n){var a=(n._originalDate||t).getTimezoneOffset();switch(e){case"O":case"OO":case"OOO":return"GMT"+tt(a,":");default:return"GMT"+rt(a,":")}},z:function(t,e,r,n){var a=(n._originalDate||t).getTimezoneOffset();switch(e){case"z":case"zz":case"zzz":return"GMT"+tt(a,":");default:return"GMT"+rt(a,":")}},t:function(t,e,r,n){var a=n._originalDate||t;return E(Math.floor(a.getTime()/1e3),e.length)},T:function(t,e,r,n){return E((n._originalDate||t).getTime(),e.length)}};function tt(t,e){var r=t>0?"-":"+",n=Math.abs(t),a=Math.floor(n/60),i=n%60;if(0===i)return r+String(a);var o=e||"";return r+String(a)+o+E(i,2)}function et(t,e){return t%60==0?(t>0?"-":"+")+E(Math.abs(t)/60,2):rt(t,e)}function rt(t,e){var r=e||"",n=t>0?"-":"+",a=Math.abs(t);return n+E(Math.floor(a/60),2)+r+E(a%60,2)}var nt=V;function at(t,e){switch(t){case"P":return e.date({width:"short"});case"PP":return e.date({width:"medium"});case"PPP":return e.date({width:"long"});default:return e.date({width:"full"})}}function it(t,e){switch(t){case"p":return e.time({width:"short"});case"pp":return e.time({width:"medium"});case"ppp":return e.time({width:"long"});default:return e.time({width:"full"})}}var ot={p:it,P:function(t,e){var r,n=t.match(/(P+)(p+)?/),a=n[1],i=n[2];if(!i)return at(t,e);switch(a){case"P":r=e.dateTime({width:"short"});break;case"PP":r=e.dateTime({width:"medium"});break;case"PPP":r=e.dateTime({width:"long"});break;default:r=e.dateTime({width:"full"})}return r.replace("{{date}}",at(a,e)).replace("{{time}}",it(i,e))}},ut=ot,st=["D","DD"],ct=["YY","YYYY"];function dt(t){return-1!==st.indexOf(t)}function lt(t){return-1!==ct.indexOf(t)}function ft(t,e,r){if("YYYY"===t)throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(e,"`) for formatting years to the input `").concat(r,"`; see: https://git.io/fxCyr"));if("YY"===t)throw new RangeError("Use `yy` instead of `YY` (in `".concat(e,"`) for formatting years to the input `").concat(r,"`; see: https://git.io/fxCyr"));if("D"===t)throw new RangeError("Use `d` instead of `D` (in `".concat(e,"`) for formatting days of the month to the input `").concat(r,"`; see: https://git.io/fxCyr"));if("DD"===t)throw new RangeError("Use `dd` instead of `DD` (in `".concat(e,"`) for formatting days of the month to the input `").concat(r,"`; see: https://git.io/fxCyr"))}var ht=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,mt=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,wt=/^'([^]*?)'?$/,gt=/''/g,vt=/[a-zA-Z]/;function yt(t){return t.match(wt)[1].replace(gt,"'")}function bt(t,e){if(null==t)throw new TypeError("assign requires that input parameter not be null or undefined");for(var r in e=e||{})e.hasOwnProperty(r)&&(t[r]=e[r]);return t}function Tt(t,a,i){r(2,arguments);var o=i||{},u=o.locale,s=u&&u.options&&u.options.weekStartsOn,c=null==s?0:e(s),d=null==o.weekStartsOn?c:e(o.weekStartsOn);if(!(d>=0&&d<=6))throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");var l=n(t),f=e(a),h=l.getUTCDay(),m=f%7,w=(m+7)%7,g=(w<d?7:0)+f-h;return l.setUTCDate(l.getUTCDate()+g),l}var pt=/^(1[0-2]|0?\d)/,Ct=/^(3[0-1]|[0-2]?\d)/,Mt=/^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,Dt=/^(5[0-3]|[0-4]?\d)/,xt=/^(2[0-3]|[0-1]?\d)/,kt=/^(2[0-4]|[0-1]?\d)/,Ut=/^(1[0-1]|0?\d)/,Yt=/^(1[0-2]|0?\d)/,Nt=/^[0-5]?\d/,St=/^[0-5]?\d/,Pt=/^\d/,qt=/^\d{1,2}/,Ht=/^\d{1,3}/,Et=/^\d{1,4}/,Ot=/^-?\d+/,Ft=/^-?\d/,Wt=/^-?\d{1,2}/,Lt=/^-?\d{1,3}/,Qt=/^-?\d{1,4}/,Rt=/^([+-])(\d{2})(\d{2})?|Z/,It=/^([+-])(\d{2})(\d{2})|Z/,Gt=/^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,Xt=/^([+-])(\d{2}):(\d{2})|Z/,jt=/^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/;function Bt(t,e,r){var n=e.match(t);if(!n)return null;var a=parseInt(n[0],10);return{value:r?r(a):a,rest:e.slice(n[0].length)}}function zt(t,e){var r=e.match(t);return r?"Z"===r[0]?{value:0,rest:e.slice(1)}:{value:("+"===r[1]?1:-1)*(36e5*(r[2]?parseInt(r[2],10):0)+6e4*(r[3]?parseInt(r[3],10):0)+1e3*(r[5]?parseInt(r[5],10):0)),rest:e.slice(r[0].length)}:null}function At(t,e){return Bt(Ot,t,e)}function Zt(t,e,r){switch(t){case 1:return Bt(Pt,e,r);case 2:return Bt(qt,e,r);case 3:return Bt(Ht,e,r);case 4:return Bt(Et,e,r);default:return Bt(new RegExp("^\\d{1,"+t+"}"),e,r)}}function Kt(t,e,r){switch(t){case 1:return Bt(Ft,e,r);case 2:return Bt(Wt,e,r);case 3:return Bt(Lt,e,r);case 4:return Bt(Qt,e,r);default:return Bt(new RegExp("^-?\\d{1,"+t+"}"),e,r)}}function $t(t){switch(t){case"morning":return 4;case"evening":return 17;case"pm":case"noon":case"afternoon":return 12;default:return 0}}function _t(t,e){var r,n=e>0,a=n?e:1-e;if(a<=50)r=t||100;else{var i=a+50;r=t+100*Math.floor(i/100)-(t>=i%100?100:0)}return n?r:1-r}var Jt=[31,28,31,30,31,30,31,31,30,31,30,31],Vt=[31,29,31,30,31,30,31,31,30,31,30,31];function te(t){return t%400==0||t%4==0&&t%100!=0}var ee={G:{priority:140,parse:function(t,e,r,n){switch(e){case"G":case"GG":case"GGG":return r.era(t,{width:"abbreviated"})||r.era(t,{width:"narrow"});case"GGGGG":return r.era(t,{width:"narrow"});default:return r.era(t,{width:"wide"})||r.era(t,{width:"abbreviated"})||r.era(t,{width:"narrow"})}},set:function(t,e,r,n){return e.era=r,t.setUTCFullYear(r,0,1),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["R","u","t","T"]},y:{priority:130,parse:function(t,e,r,n){var a=function(t){return{year:t,isTwoDigitYear:"yy"===e}};switch(e){case"y":return Zt(4,t,a);case"yo":return r.ordinalNumber(t,{unit:"year",valueCallback:a});default:return Zt(e.length,t,a)}},validate:function(t,e,r){return e.isTwoDigitYear||e.year>0},set:function(t,e,r,n){var a=t.getUTCFullYear();if(r.isTwoDigitYear){var i=_t(r.year,a);return t.setUTCFullYear(i,0,1),t.setUTCHours(0,0,0,0),t}var o="era"in e&&1!==e.era?1-r.year:r.year;return t.setUTCFullYear(o,0,1),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["Y","R","u","w","I","i","e","c","t","T"]},Y:{priority:130,parse:function(t,e,r,n){var a=function(t){return{year:t,isTwoDigitYear:"YY"===e}};switch(e){case"Y":return Zt(4,t,a);case"Yo":return r.ordinalNumber(t,{unit:"year",valueCallback:a});default:return Zt(e.length,t,a)}},validate:function(t,e,r){return e.isTwoDigitYear||e.year>0},set:function(t,e,r,n){var a=X(t,n);if(r.isTwoDigitYear){var i=_t(r.year,a);return t.setUTCFullYear(i,0,n.firstWeekContainsDate),t.setUTCHours(0,0,0,0),G(t,n)}var o="era"in e&&1!==e.era?1-r.year:r.year;return t.setUTCFullYear(o,0,n.firstWeekContainsDate),t.setUTCHours(0,0,0,0),G(t,n)},incompatibleTokens:["y","R","u","Q","q","M","L","I","d","D","i","t","T"]},R:{priority:130,parse:function(t,e,r,n){return Kt("R"===e?4:e.length,t)},set:function(t,e,r,n){var a=new Date(0);return a.setUTCFullYear(r,0,4),a.setUTCHours(0,0,0,0),W(a)},incompatibleTokens:["G","y","Y","u","Q","q","M","L","w","d","D","e","c","t","T"]},u:{priority:130,parse:function(t,e,r,n){return Kt("u"===e?4:e.length,t)},set:function(t,e,r,n){return t.setUTCFullYear(r,0,1),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["G","y","Y","R","w","I","i","e","c","t","T"]},Q:{priority:120,parse:function(t,e,r,n){switch(e){case"Q":case"QQ":return Zt(e.length,t);case"Qo":return r.ordinalNumber(t,{unit:"quarter"});case"QQQ":return r.quarter(t,{width:"abbreviated",context:"formatting"})||r.quarter(t,{width:"narrow",context:"formatting"});case"QQQQQ":return r.quarter(t,{width:"narrow",context:"formatting"});default:return r.quarter(t,{width:"wide",context:"formatting"})||r.quarter(t,{width:"abbreviated",context:"formatting"})||r.quarter(t,{width:"narrow",context:"formatting"})}},validate:function(t,e,r){return e>=1&&e<=4},set:function(t,e,r,n){return t.setUTCMonth(3*(r-1),1),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["Y","R","q","M","L","w","I","d","D","i","e","c","t","T"]},q:{priority:120,parse:function(t,e,r,n){switch(e){case"q":case"qq":return Zt(e.length,t);case"qo":return r.ordinalNumber(t,{unit:"quarter"});case"qqq":return r.quarter(t,{width:"abbreviated",context:"standalone"})||r.quarter(t,{width:"narrow",context:"standalone"});case"qqqqq":return r.quarter(t,{width:"narrow",context:"standalone"});default:return r.quarter(t,{width:"wide",context:"standalone"})||r.quarter(t,{width:"abbreviated",context:"standalone"})||r.quarter(t,{width:"narrow",context:"standalone"})}},validate:function(t,e,r){return e>=1&&e<=4},set:function(t,e,r,n){return t.setUTCMonth(3*(r-1),1),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["Y","R","Q","M","L","w","I","d","D","i","e","c","t","T"]},M:{priority:110,parse:function(t,e,r,n){var a=function(t){return t-1};switch(e){case"M":return Bt(pt,t,a);case"MM":return Zt(2,t,a);case"Mo":return r.ordinalNumber(t,{unit:"month",valueCallback:a});case"MMM":return r.month(t,{width:"abbreviated",context:"formatting"})||r.month(t,{width:"narrow",context:"formatting"});case"MMMMM":return r.month(t,{width:"narrow",context:"formatting"});default:return r.month(t,{width:"wide",context:"formatting"})||r.month(t,{width:"abbreviated",context:"formatting"})||r.month(t,{width:"narrow",context:"formatting"})}},validate:function(t,e,r){return e>=0&&e<=11},set:function(t,e,r,n){return t.setUTCMonth(r,1),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["Y","R","q","Q","L","w","I","D","i","e","c","t","T"]},L:{priority:110,parse:function(t,e,r,n){var a=function(t){return t-1};switch(e){case"L":return Bt(pt,t,a);case"LL":return Zt(2,t,a);case"Lo":return r.ordinalNumber(t,{unit:"month",valueCallback:a});case"LLL":return r.month(t,{width:"abbreviated",context:"standalone"})||r.month(t,{width:"narrow",context:"standalone"});case"LLLLL":return r.month(t,{width:"narrow",context:"standalone"});default:return r.month(t,{width:"wide",context:"standalone"})||r.month(t,{width:"abbreviated",context:"standalone"})||r.month(t,{width:"narrow",context:"standalone"})}},validate:function(t,e,r){return e>=0&&e<=11},set:function(t,e,r,n){return t.setUTCMonth(r,1),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["Y","R","q","Q","M","w","I","D","i","e","c","t","T"]},w:{priority:100,parse:function(t,e,r,n){switch(e){case"w":return Bt(Dt,t);case"wo":return r.ordinalNumber(t,{unit:"week"});default:return Zt(e.length,t)}},validate:function(t,e,r){return e>=1&&e<=53},set:function(t,a,i,o){return G(function(t,a,i){r(2,arguments);var o=n(t),u=e(a),s=z(o,i)-u;return o.setUTCDate(o.getUTCDate()-7*s),o}(t,i,o),o)},incompatibleTokens:["y","R","u","q","Q","M","L","I","d","D","i","t","T"]},I:{priority:100,parse:function(t,e,r,n){switch(e){case"I":return Bt(Dt,t);case"Io":return r.ordinalNumber(t,{unit:"week"});default:return Zt(e.length,t)}},validate:function(t,e,r){return e>=1&&e<=53},set:function(t,a,i,o){return W(function(t,a){r(2,arguments);var i=n(t),o=e(a),u=I(i)-o;return i.setUTCDate(i.getUTCDate()-7*u),i}(t,i,o),o)},incompatibleTokens:["y","Y","u","q","Q","M","L","w","d","D","e","c","t","T"]},d:{priority:90,subPriority:1,parse:function(t,e,r,n){switch(e){case"d":return Bt(Ct,t);case"do":return r.ordinalNumber(t,{unit:"date"});default:return Zt(e.length,t)}},validate:function(t,e,r){var n=te(t.getUTCFullYear()),a=t.getUTCMonth();return n?e>=1&&e<=Vt[a]:e>=1&&e<=Jt[a]},set:function(t,e,r,n){return t.setUTCDate(r),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["Y","R","q","Q","w","I","D","i","e","c","t","T"]},D:{priority:90,subPriority:1,parse:function(t,e,r,n){switch(e){case"D":case"DD":return Bt(Mt,t);case"Do":return r.ordinalNumber(t,{unit:"date"});default:return Zt(e.length,t)}},validate:function(t,e,r){return te(t.getUTCFullYear())?e>=1&&e<=366:e>=1&&e<=365},set:function(t,e,r,n){return t.setUTCMonth(0,r),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["Y","R","q","Q","M","L","w","I","d","E","i","e","c","t","T"]},E:{priority:90,parse:function(t,e,r,n){switch(e){case"E":case"EE":case"EEE":return r.day(t,{width:"abbreviated",context:"formatting"})||r.day(t,{width:"short",context:"formatting"})||r.day(t,{width:"narrow",context:"formatting"});case"EEEEE":return r.day(t,{width:"narrow",context:"formatting"});case"EEEEEE":return r.day(t,{width:"short",context:"formatting"})||r.day(t,{width:"narrow",context:"formatting"});default:return r.day(t,{width:"wide",context:"formatting"})||r.day(t,{width:"abbreviated",context:"formatting"})||r.day(t,{width:"short",context:"formatting"})||r.day(t,{width:"narrow",context:"formatting"})}},validate:function(t,e,r){return e>=0&&e<=6},set:function(t,e,r,n){return(t=Tt(t,r,n)).setUTCHours(0,0,0,0),t},incompatibleTokens:["D","i","e","c","t","T"]},e:{priority:90,parse:function(t,e,r,n){var a=function(t){var e=7*Math.floor((t-1)/7);return(t+n.weekStartsOn+6)%7+e};switch(e){case"e":case"ee":return Zt(e.length,t,a);case"eo":return r.ordinalNumber(t,{unit:"day",valueCallback:a});case"eee":return r.day(t,{width:"abbreviated",context:"formatting"})||r.day(t,{width:"short",context:"formatting"})||r.day(t,{width:"narrow",context:"formatting"});case"eeeee":return r.day(t,{width:"narrow",context:"formatting"});case"eeeeee":return r.day(t,{width:"short",context:"formatting"})||r.day(t,{width:"narrow",context:"formatting"});default:return r.day(t,{width:"wide",context:"formatting"})||r.day(t,{width:"abbreviated",context:"formatting"})||r.day(t,{width:"short",context:"formatting"})||r.day(t,{width:"narrow",context:"formatting"})}},validate:function(t,e,r){return e>=0&&e<=6},set:function(t,e,r,n){return(t=Tt(t,r,n)).setUTCHours(0,0,0,0),t},incompatibleTokens:["y","R","u","q","Q","M","L","I","d","D","E","i","c","t","T"]},c:{priority:90,parse:function(t,e,r,n){var a=function(t){var e=7*Math.floor((t-1)/7);return(t+n.weekStartsOn+6)%7+e};switch(e){case"c":case"cc":return Zt(e.length,t,a);case"co":return r.ordinalNumber(t,{unit:"day",valueCallback:a});case"ccc":return r.day(t,{width:"abbreviated",context:"standalone"})||r.day(t,{width:"short",context:"standalone"})||r.day(t,{width:"narrow",context:"standalone"});case"ccccc":return r.day(t,{width:"narrow",context:"standalone"});case"cccccc":return r.day(t,{width:"short",context:"standalone"})||r.day(t,{width:"narrow",context:"standalone"});default:return r.day(t,{width:"wide",context:"standalone"})||r.day(t,{width:"abbreviated",context:"standalone"})||r.day(t,{width:"short",context:"standalone"})||r.day(t,{width:"narrow",context:"standalone"})}},validate:function(t,e,r){return e>=0&&e<=6},set:function(t,e,r,n){return(t=Tt(t,r,n)).setUTCHours(0,0,0,0),t},incompatibleTokens:["y","R","u","q","Q","M","L","I","d","D","E","i","e","t","T"]},i:{priority:90,parse:function(t,e,r,n){var a=function(t){return 0===t?7:t};switch(e){case"i":case"ii":return Zt(e.length,t);case"io":return r.ordinalNumber(t,{unit:"day"});case"iii":return r.day(t,{width:"abbreviated",context:"formatting",valueCallback:a})||r.day(t,{width:"short",context:"formatting",valueCallback:a})||r.day(t,{width:"narrow",context:"formatting",valueCallback:a});case"iiiii":return r.day(t,{width:"narrow",context:"formatting",valueCallback:a});case"iiiiii":return r.day(t,{width:"short",context:"formatting",valueCallback:a})||r.day(t,{width:"narrow",context:"formatting",valueCallback:a});default:return r.day(t,{width:"wide",context:"formatting",valueCallback:a})||r.day(t,{width:"abbreviated",context:"formatting",valueCallback:a})||r.day(t,{width:"short",context:"formatting",valueCallback:a})||r.day(t,{width:"narrow",context:"formatting",valueCallback:a})}},validate:function(t,e,r){return e>=1&&e<=7},set:function(t,a,i,o){return t=function(t,a){r(2,arguments);var i=e(a);i%7==0&&(i-=7);var o=1,u=n(t),s=u.getUTCDay(),c=((i%7+7)%7<o?7:0)+i-s;return u.setUTCDate(u.getUTCDate()+c),u}(t,i,o),t.setUTCHours(0,0,0,0),t},incompatibleTokens:["y","Y","u","q","Q","M","L","w","d","D","E","e","c","t","T"]},a:{priority:80,parse:function(t,e,r,n){switch(e){case"a":case"aa":case"aaa":return r.dayPeriod(t,{width:"abbreviated",context:"formatting"})||r.dayPeriod(t,{width:"narrow",context:"formatting"});case"aaaaa":return r.dayPeriod(t,{width:"narrow",context:"formatting"});default:return r.dayPeriod(t,{width:"wide",context:"formatting"})||r.dayPeriod(t,{width:"abbreviated",context:"formatting"})||r.dayPeriod(t,{width:"narrow",context:"formatting"})}},set:function(t,e,r,n){return t.setUTCHours($t(r),0,0,0),t},incompatibleTokens:["b","B","H","K","k","t","T"]},b:{priority:80,parse:function(t,e,r,n){switch(e){case"b":case"bb":case"bbb":return r.dayPeriod(t,{width:"abbreviated",context:"formatting"})||r.dayPeriod(t,{width:"narrow",context:"formatting"});case"bbbbb":return r.dayPeriod(t,{width:"narrow",context:"formatting"});default:return r.dayPeriod(t,{width:"wide",context:"formatting"})||r.dayPeriod(t,{width:"abbreviated",context:"formatting"})||r.dayPeriod(t,{width:"narrow",context:"formatting"})}},set:function(t,e,r,n){return t.setUTCHours($t(r),0,0,0),t},incompatibleTokens:["a","B","H","K","k","t","T"]},B:{priority:80,parse:function(t,e,r,n){switch(e){case"B":case"BB":case"BBB":return r.dayPeriod(t,{width:"abbreviated",context:"formatting"})||r.dayPeriod(t,{width:"narrow",context:"formatting"});case"BBBBB":return r.dayPeriod(t,{width:"narrow",context:"formatting"});default:return r.dayPeriod(t,{width:"wide",context:"formatting"})||r.dayPeriod(t,{width:"abbreviated",context:"formatting"})||r.dayPeriod(t,{width:"narrow",context:"formatting"})}},set:function(t,e,r,n){return t.setUTCHours($t(r),0,0,0),t},incompatibleTokens:["a","b","t","T"]},h:{priority:70,parse:function(t,e,r,n){switch(e){case"h":return Bt(Yt,t);case"ho":return r.ordinalNumber(t,{unit:"hour"});default:return Zt(e.length,t)}},validate:function(t,e,r){return e>=1&&e<=12},set:function(t,e,r,n){var a=t.getUTCHours()>=12;return a&&r<12?t.setUTCHours(r+12,0,0,0):a||12!==r?t.setUTCHours(r,0,0,0):t.setUTCHours(0,0,0,0),t},incompatibleTokens:["H","K","k","t","T"]},H:{priority:70,parse:function(t,e,r,n){switch(e){case"H":return Bt(xt,t);case"Ho":return r.ordinalNumber(t,{unit:"hour"});default:return Zt(e.length,t)}},validate:function(t,e,r){return e>=0&&e<=23},set:function(t,e,r,n){return t.setUTCHours(r,0,0,0),t},incompatibleTokens:["a","b","h","K","k","t","T"]},K:{priority:70,parse:function(t,e,r,n){switch(e){case"K":return Bt(Ut,t);case"Ko":return r.ordinalNumber(t,{unit:"hour"});default:return Zt(e.length,t)}},validate:function(t,e,r){return e>=0&&e<=11},set:function(t,e,r,n){return t.getUTCHours()>=12&&r<12?t.setUTCHours(r+12,0,0,0):t.setUTCHours(r,0,0,0),t},incompatibleTokens:["a","b","h","H","k","t","T"]},k:{priority:70,parse:function(t,e,r,n){switch(e){case"k":return Bt(kt,t);case"ko":return r.ordinalNumber(t,{unit:"hour"});default:return Zt(e.length,t)}},validate:function(t,e,r){return e>=1&&e<=24},set:function(t,e,r,n){var a=r<=24?r%24:r;return t.setUTCHours(a,0,0,0),t},incompatibleTokens:["a","b","h","H","K","t","T"]},m:{priority:60,parse:function(t,e,r,n){switch(e){case"m":return Bt(Nt,t);case"mo":return r.ordinalNumber(t,{unit:"minute"});default:return Zt(e.length,t)}},validate:function(t,e,r){return e>=0&&e<=59},set:function(t,e,r,n){return t.setUTCMinutes(r,0,0),t},incompatibleTokens:["t","T"]},s:{priority:50,parse:function(t,e,r,n){switch(e){case"s":return Bt(St,t);case"so":return r.ordinalNumber(t,{unit:"second"});default:return Zt(e.length,t)}},validate:function(t,e,r){return e>=0&&e<=59},set:function(t,e,r,n){return t.setUTCSeconds(r,0),t},incompatibleTokens:["t","T"]},S:{priority:30,parse:function(t,e,r,n){return Zt(e.length,t,(function(t){return Math.floor(t*Math.pow(10,3-e.length))}))},set:function(t,e,r,n){return t.setUTCMilliseconds(r),t},incompatibleTokens:["t","T"]},X:{priority:10,parse:function(t,e,r,n){switch(e){case"X":return zt(Rt,t);case"XX":return zt(It,t);case"XXXX":return zt(Gt,t);case"XXXXX":return zt(jt,t);default:return zt(Xt,t)}},set:function(t,e,r,n){return e.timestampIsSet?t:new Date(t.getTime()-r)},incompatibleTokens:["t","T","x"]},x:{priority:10,parse:function(t,e,r,n){switch(e){case"x":return zt(Rt,t);case"xx":return zt(It,t);case"xxxx":return zt(Gt,t);case"xxxxx":return zt(jt,t);default:return zt(Xt,t)}},set:function(t,e,r,n){return e.timestampIsSet?t:new Date(t.getTime()-r)},incompatibleTokens:["t","T","X"]},t:{priority:40,parse:function(t,e,r,n){return At(t)},set:function(t,e,r,n){return[new Date(1e3*r),{timestampIsSet:!0}]},incompatibleTokens:"*"},T:{priority:20,parse:function(t,e,r,n){return At(t)},set:function(t,e,r,n){return[new Date(r),{timestampIsSet:!0}]},incompatibleTokens:"*"}},re=ee,ne=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,ae=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,ie=/^'([^]*?)'?$/,oe=/''/g,ue=/\S/,se=/[a-zA-Z]/;function ce(t,e){if(e.timestampIsSet)return t;var r=new Date(0);return r.setFullYear(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate()),r.setHours(t.getUTCHours(),t.getUTCMinutes(),t.getUTCSeconds(),t.getUTCMilliseconds()),r}function de(t){return t.match(ie)[1].replace(oe,"'")}var le=36e5,fe={dateTimeDelimiter:/[T ]/,timeZoneDelimiter:/[Z ]/i,timezone:/([Z+-].*)$/},he=/^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,me=/^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,we=/^([+-])(\d{2})(?::?(\d{2}))?$/;function ge(t){var e,r={},n=t.split(fe.dateTimeDelimiter);if(n.length>2)return r;if(/:/.test(n[0])?(r.date=null,e=n[0]):(r.date=n[0],e=n[1],fe.timeZoneDelimiter.test(r.date)&&(r.date=t.split(fe.timeZoneDelimiter)[0],e=t.substr(r.date.length,t.length))),e){var a=fe.timezone.exec(e);a?(r.time=e.replace(a[1],""),r.timezone=a[1]):r.time=e}return r}function ve(t,e){var r=new RegExp("^(?:(\\d{4}|[+-]\\d{"+(4+e)+"})|(\\d{2}|[+-]\\d{"+(2+e)+"})$)"),n=t.match(r);if(!n)return{year:null};var a=n[1]&&parseInt(n[1]),i=n[2]&&parseInt(n[2]);return{year:null==i?a:100*i,restDateString:t.slice((n[1]||n[2]).length)}}function ye(t,e){if(null===e)return null;var r=t.match(he);if(!r)return null;var n=!!r[4],a=be(r[1]),i=be(r[2])-1,o=be(r[3]),u=be(r[4]),s=be(r[5])-1;if(n)return function(t,e,r){return e>=1&&e<=53&&r>=0&&r<=6}(0,u,s)?function(t,e,r){var n=new Date(0);n.setUTCFullYear(t,0,4);var a=n.getUTCDay()||7,i=7*(e-1)+r+1-a;return n.setUTCDate(n.getUTCDate()+i),n}(e,u,s):new Date(NaN);var c=new Date(0);return function(t,e,r){return e>=0&&e<=11&&r>=1&&r<=(Me[e]||(De(t)?29:28))}(e,i,o)&&function(t,e){return e>=1&&e<=(De(t)?366:365)}(e,a)?(c.setUTCFullYear(e,i,Math.max(a,o)),c):new Date(NaN)}function be(t){return t?parseInt(t):1}function Te(t){var e=t.match(me);if(!e)return null;var r=pe(e[1]),n=pe(e[2]),a=pe(e[3]);return function(t,e,r){if(24===t)return 0===e&&0===r;return r>=0&&r<60&&e>=0&&e<60&&t>=0&&t<25}(r,n,a)?r*le+6e4*n+1e3*a:NaN}function pe(t){return t&&parseFloat(t.replace(",","."))||0}function Ce(t){if("Z"===t)return 0;var e=t.match(we);if(!e)return 0;var r="+"===e[1]?-1:1,n=parseInt(e[2]),a=e[3]&&parseInt(e[3])||0;return function(t,e){return e>=0&&e<=59}(0,a)?r*(n*le+6e4*a):NaN}var Me=[31,null,31,30,31,30,31,31,30,31,30,31];function De(t){return t%400==0||t%4==0&&t%100}const xe={datetime:"MMM d, yyyy, h:mm:ss aaaa",millisecond:"h:mm:ss.SSS aaaa",second:"h:mm:ss aaaa",minute:"h:mm aaaa",hour:"ha",day:"MMM d",week:"PP",month:"MMM yyyy",quarter:"qqq - yyyy",year:"yyyy"};t._adapters._date.override({_id:"date-fns",formats:function(){return xe},parse:function(t,a){if(null==t)return null;const i=typeof t;return"number"===i||t instanceof Date?t=n(t):"string"===i&&(t="string"==typeof a?function(t,a,i,o){r(3,arguments);var u=String(t),s=String(a),d=o||{},l=d.locale||q;if(!l.match)throw new RangeError("locale must contain match property");var f=l.options&&l.options.firstWeekContainsDate,h=null==f?1:e(f),m=null==d.firstWeekContainsDate?h:e(d.firstWeekContainsDate);if(!(m>=1&&m<=7))throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");var w=l.options&&l.options.weekStartsOn,g=null==w?0:e(w),v=null==d.weekStartsOn?g:e(d.weekStartsOn);if(!(v>=0&&v<=6))throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");if(""===s)return""===u?n(i):new Date(NaN);var y,b={firstWeekContainsDate:m,weekStartsOn:v,locale:l},T=[{priority:10,subPriority:-1,set:ce,index:0}],p=s.match(ae).map((function(t){var e=t[0];return"p"===e||"P"===e?(0,ut[e])(t,l.formatLong,b):t})).join("").match(ne),C=[];for(y=0;y<p.length;y++){var M=p[y];!d.useAdditionalWeekYearTokens&&lt(M)&&ft(M,s,t),!d.useAdditionalDayOfYearTokens&&dt(M)&&ft(M,s,t);var D=M[0],x=re[D];if(x){var k=x.incompatibleTokens;if(Array.isArray(k)){for(var U=void 0,Y=0;Y<C.length;Y++){var N=C[Y].token;if(-1!==k.indexOf(N)||N===D){U=C[Y];break}}if(U)throw new RangeError("The format string mustn't contain `".concat(U.fullToken,"` and `").concat(M,"` at the same time"))}else if("*"===x.incompatibleTokens&&C.length)throw new RangeError("The format string mustn't contain `".concat(M,"` and any other token at the same time"));C.push({token:D,fullToken:M});var S=x.parse(u,M,l.match,b);if(!S)return new Date(NaN);T.push({priority:x.priority,subPriority:x.subPriority||0,set:x.set,validate:x.validate,value:S.value,index:T.length}),u=S.rest}else{if(D.match(se))throw new RangeError("Format string contains an unescaped latin alphabet character `"+D+"`");if("''"===M?M="'":"'"===D&&(M=de(M)),0!==u.indexOf(M))return new Date(NaN);u=u.slice(M.length)}}if(u.length>0&&ue.test(u))return new Date(NaN);var P=T.map((function(t){return t.priority})).sort((function(t,e){return e-t})).filter((function(t,e,r){return r.indexOf(t)===e})).map((function(t){return T.filter((function(e){return e.priority===t})).sort((function(t,e){return e.subPriority-t.subPriority}))})).map((function(t){return t[0]})),E=n(i);if(isNaN(E))return new Date(NaN);var O=H(E,c(E)),F={};for(y=0;y<P.length;y++){var W=P[y];if(W.validate&&!W.validate(O,W.value,b))return new Date(NaN);var L=W.set(O,F,W.value,b);L[0]?(O=L[0],bt(F,L[1])):O=L}return O}(t,a,new Date,this.options):function(t,n){r(1,arguments);var a=n||{},i=null==a.additionalDigits?2:e(a.additionalDigits);if(2!==i&&1!==i&&0!==i)throw new RangeError("additionalDigits must be 0, 1 or 2");if("string"!=typeof t&&"[object String]"!==Object.prototype.toString.call(t))return new Date(NaN);var o,u=ge(t);if(u.date){var s=ve(u.date,i);o=ye(s.restDateString,s.year)}if(isNaN(o)||!o)return new Date(NaN);var c,d=o.getTime(),l=0;if(u.time&&(l=Te(u.time),isNaN(l)||null===l))return new Date(NaN);if(!u.timezone){var f=new Date(d+l),h=new Date(0);return h.setFullYear(f.getUTCFullYear(),f.getUTCMonth(),f.getUTCDate()),h.setHours(f.getUTCHours(),f.getUTCMinutes(),f.getUTCSeconds(),f.getUTCMilliseconds()),h}return c=Ce(u.timezone),isNaN(c)?new Date(NaN):new Date(d+l+c)}(t,this.options)),m(t)?t.getTime():null},format:function(t,a){return function(t,a,i){r(2,arguments);var o=String(a),u=i||{},s=u.locale||q,d=s.options&&s.options.firstWeekContainsDate,l=null==d?1:e(d),f=null==u.firstWeekContainsDate?l:e(u.firstWeekContainsDate);if(!(f>=1&&f<=7))throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");var h=s.options&&s.options.weekStartsOn,w=null==h?0:e(h),g=null==u.weekStartsOn?w:e(u.weekStartsOn);if(!(g>=0&&g<=6))throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");if(!s.localize)throw new RangeError("locale must contain localize property");if(!s.formatLong)throw new RangeError("locale must contain formatLong property");var v=n(t);if(!m(v))throw new RangeError("Invalid time value");var y=c(v),b=H(v,y),T={firstWeekContainsDate:f,weekStartsOn:g,locale:s,_originalDate:v},p=o.match(mt).map((function(t){var e=t[0];return"p"===e||"P"===e?(0,ut[e])(t,s.formatLong,T):t})).join("").match(ht).map((function(e){if("''"===e)return"'";var r=e[0];if("'"===r)return yt(e);var n=nt[r];if(n)return!u.useAdditionalWeekYearTokens&&lt(e)&&ft(e,a,t),!u.useAdditionalDayOfYearTokens&&dt(e)&&ft(e,a,t),n(b,e,s.localize,T);if(r.match(vt))throw new RangeError("Format string contains an unescaped latin alphabet character `"+r+"`");return e})).join("");return p}(t,a,this.options)},add:function(t,n,s){switch(s){case"millisecond":return o(t,n);case"second":return function(t,n){r(2,arguments);var a=e(n);return o(t,1e3*a)}(t,n);case"minute":return function(t,n){r(2,arguments);var a=e(n);return o(t,6e4*a)}(t,n);case"hour":return function(t,n){r(2,arguments);var a=e(n);return o(t,a*u)}(t,n);case"day":return a(t,n);case"week":return function(t,n){r(2,arguments);var i=e(n),o=7*i;return a(t,o)}(t,n);case"month":return i(t,n);case"quarter":return function(t,n){r(2,arguments);var a=e(n),o=3*a;return i(t,o)}(t,n);case"year":return function(t,n){r(2,arguments);var a=e(n);return i(t,12*a)}(t,n);default:return t}},diff:function(t,e,a){switch(a){case"millisecond":return b(t,e);case"second":return function(t,e){r(2,arguments);var n=b(t,e)/1e3;return n>0?Math.floor(n):Math.ceil(n)}(t,e);case"minute":return function(t,e){r(2,arguments);var n=b(t,e)/6e4;return n>0?Math.floor(n):Math.ceil(n)}(t,e);case"hour":return function(t,e){r(2,arguments);var n=b(t,e)/T;return n>0?Math.floor(n):Math.ceil(n)}(t,e);case"day":return y(t,e);case"week":return function(t,e){r(2,arguments);var n=y(t,e)/7;return n>0?Math.floor(n):Math.ceil(n)}(t,e);case"month":return D(t,e);case"quarter":return function(t,e){r(2,arguments);var n=D(t,e)/3;return n>0?Math.floor(n):Math.ceil(n)}(t,e);case"year":return function(t,e){r(2,arguments);var a=n(t),i=n(e),o=h(a,i),u=Math.abs(g(a,i));a.setFullYear("1584"),i.setFullYear("1584");var s=h(a,i)===-o,c=o*(u-s);return 0===c?0:c}(t,e);default:return 0}},startOf:function(t,e,a){switch(e){case"second":return function(t){r(1,arguments);var e=n(t);return e.setMilliseconds(0),e}(t);case"minute":return function(t){r(1,arguments);var e=n(t);return e.setSeconds(0,0),e}(t);case"hour":return function(t){r(1,arguments);var e=n(t);return e.setMinutes(0,0,0),e}(t);case"day":return d(t);case"week":return s(t);case"isoWeek":return s(t,{weekStartsOn:+a});case"month":return function(t){r(1,arguments);var e=n(t);return e.setDate(1),e.setHours(0,0,0,0),e}(t);case"quarter":return function(t){r(1,arguments);var e=n(t),a=e.getMonth(),i=a-a%3;return e.setMonth(i,1),e.setHours(0,0,0,0),e}(t);case"year":return function(t){r(1,arguments);var e=n(t),a=new Date(0);return a.setFullYear(e.getFullYear(),0,1),a.setHours(0,0,0,0),a}(t);default:return t}},endOf:function(t,a){switch(a){case"second":return function(t){r(1,arguments);var e=n(t);return e.setMilliseconds(999),e}(t);case"minute":return function(t){r(1,arguments);var e=n(t);return e.setSeconds(59,999),e}(t);case"hour":return function(t){r(1,arguments);var e=n(t);return e.setMinutes(59,59,999),e}(t);case"day":return p(t);case"week":return function(t,a){r(1,arguments);var i=a||{},o=i.locale,u=o&&o.options&&o.options.weekStartsOn,s=null==u?0:e(u),c=null==i.weekStartsOn?s:e(i.weekStartsOn);if(!(c>=0&&c<=6))throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");var d=n(t),l=d.getDay(),f=6+(l<c?-7:0)-(l-c);return d.setDate(d.getDate()+f),d.setHours(23,59,59,999),d}(t);case"month":return C(t);case"quarter":return function(t){r(1,arguments);var e=n(t),a=e.getMonth(),i=a-a%3+3;return e.setMonth(i,0),e.setHours(23,59,59,999),e}(t);case"year":return function(t){r(1,arguments);var e=n(t),a=e.getFullYear();return e.setFullYear(a+1,0,0),e.setHours(23,59,59,999),e}(t);default:return t}}})}));

class ChartComponent {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.chart = null;
    }

    renderBacklogCurve(backlogCurveData, canvasId) {
        log(backlogCurveData, 'BacklogCurveData')
        // Настройка графика (например, с использованием Chart.js)
        const ctx = document.getElementById(canvasId);
    if (this.chart) {
        this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
        type: 'line',
        data: backlogCurveData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Тренд бэклога по командам',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'yyyy-MM-dd'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Дата'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Активные задачи'
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}
  
    // Метод для отображения бэклога команд на временной шкале
    renderTeamBacklogTimeline(issues) {
        const formattedIssues = issues.map(issue => ({
            ...issue,
            created: issue.created instanceof Date ? issue.created : new Date(issue.created)
          }));

          const teamBacklogData = this.processBacklogData(formattedIssues);

        // const teamBacklogData = this.processBacklogData(issues);
  
      const ctx = this.container.getContext('2d');
      if (this.chart) this.chart.destroy(); // Удаляем предыдущий график, если он существует
  
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: teamBacklogData.labels,
          datasets: teamBacklogData.datasets
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month'
              },
              title: {
                display: true,
                text: 'Дата создания задачи'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Количество задач'
              }
            }
          }
        }
      });

    }
  

    processBacklogData(issues) {
        const teamData = {};
        const labels = new Set();
      
        issues.forEach(issue => {
          const team = issue.team;
          log(typeof new Date(issue.created), "Created");
          const createdDate = new Date(issue.created);
          const month = createdDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' }); // Используем локализованный формат даты
          labels.add(month);
          teamData[team] = teamData[team] || {};
          teamData[team][month] = (teamData[team][month] || 0) + 1;
        });
      
        const datasets = [];
        for (const team of Object.keys(teamData)) {
          const data = [...labels].sort().map(label => teamData[team][label] || 0);
          datasets.push({
            label: team,
            data,
            borderColor: this.getRandomColor(),
            backgroundColor: this.getRandomColor(0.5)
          });
        }
      
        return { labels: [...labels].sort(), datasets };
      }
      
    // // Метод обработки данных для бэклога
    // processBacklogData(issues) {
    //   const teamData = {};
    //   issues.forEach(issue => {
    //     const team = issue.team;
    //     const createdDate = new Date(issue.created);
    //     if (!teamData[team]) teamData[team] = {};
  
    //     const month = createdDate.toISOString().slice(0, 7); // Форматируем дату в YYYY-MM
    //     if (!teamData[team][month]) teamData[team][month] = 0;
    //     teamData[team][month]++;
    //   });
  
    //   const labels = Array.from(
    //     new Set(issues.map(issue => issue.created.toISOString().slice(0, 7)))
    //   ).sort();
  
    //   const datasets = Object.keys(teamData).map(team => ({
    //     label: team,
    //     data: labels.map(label => teamData[team][label] || 0),
    //     borderColor: this.getRandomColor(),
    //     backgroundColor: this.getRandomColor(0.5)
    //   }));
  
    //   return { labels, datasets };
    // }
  
    // Генератор случайных цветов для графика
    getRandomColor(opacity = 1) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

}

class View {
    static #idCounter = 0;
    #element = null;
    
    constructor() {
        this.refact = Refact.getInstance();
    }

    /**
     * Generates a unique element ID based on the component name and a counter
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} Unique ID
     */
    generateId(prefix = '') {
        const componentName = this.constructor.name.toLowerCase();
        const uniqueId = `${componentName}-${prefix ? prefix + '-' : ''}${++View.#idCounter}`;
        return uniqueId;
    }

    createContainer(options = {}) {
        const container = this.createElement('div', options);
        for (const [key, value] of Object.entries(options)) {
            container.setAttribute(key, value);
        }
        this.setContainer(container);
        return container;
    }

    /**
     * Creates an HTML element with a unique ID
     * @param {string} tagName - HTML tag name
     * @param {Object} options - Element options (className, id prefix, etc.)
     * @returns {HTMLElement} Created element with unique ID
     */
    createElement(tagName, options = {}) {
        const element = document.createElement(tagName);
        
        if (options.className) {
            element.className = options.className;
        }

        const idPrefix = options.idPrefix || '';
        element.id = this.generateId(idPrefix);

        return element;
    }

    /**
     * Gets the main element of the component
     * @returns {HTMLElement}
     */
    getElement() {
        return this.#element;
    }

    getContainer() {
        return this.#element;
    }

    setContainer(container) {
        this.#element = container;
    }

    /**
     * Sets the main element of the component
     * @param {HTMLElement} element 
     */
    setElement(element) {
        if (!(element instanceof HTMLElement)) {
            throw new Error('Element must be an instance of HTMLElement');
        }
        this.#element = element;
    }

    /**
     * Renders the component
     * Must be implemented by child classes
     */
    render() {
        throw new Error('render() method must be implemented by child class');
    }
}
class MessageView extends View{
    static instance = null;
    static wrapper = null;
    static modalContent = null;

    static initialize() {
        if (!this.wrapper) {
            this.wrapper = document.createElement('div');
            this.wrapper.className = 'message-view';
            this.wrapper.style.display = 'none';
            document.body.appendChild(this.wrapper);
        }
    }

    static showMessage(title, message, callbackText, callbackAction) {
        this.initialize();

        // Create modal content
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'message-modal view-enter';
        
        // Create title container with close button
        const titleContainer = document.createElement('div');
        titleContainer.className = 'message-title-container';
        
        // Create title
        const titleElement = document.createElement('h2');
        titleElement.className = 'message-title';
        titleElement.textContent = title;
        
        // Create close icon button
        const closeIcon = document.createElement('button');
        closeIcon.className = 'message-close-icon';
        closeIcon.innerHTML = '&times;';
        closeIcon.onclick = (e) => {
            e.stopPropagation();
            this.hideMessage();
        };
        
        titleContainer.appendChild(titleElement);
        titleContainer.appendChild(closeIcon);
        
        // Create message
        const messageElement = document.createElement('p');
        messageElement.className = 'message-text';
        messageElement.textContent = message;
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'message-buttons';
        
        // Create close button first
        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary';
        closeButton.textContent = 'Закрыть';
        closeButton.onclick = (e) => {
            e.stopPropagation();
            this.hideMessage();
        };
        buttonsContainer.appendChild(closeButton);

        // Create action button if callback provided
        if (callbackText && callbackAction) {
            const actionButton = document.createElement('button');
            actionButton.className = 'btn btn-primary';
            actionButton.textContent = callbackText;
            actionButton.onclick = (e) => {
                e.stopPropagation();
                callbackAction();
                this.hideMessage();
            };
            // Insert action button before close button
            buttonsContainer.insertBefore(actionButton, closeButton);
        }
        
        // Assemble the modal
        this.modalContent.appendChild(titleContainer);
        this.modalContent.appendChild(messageElement);
        this.modalContent.appendChild(buttonsContainer);
        
        // Show the modal
        this.wrapper.innerHTML = '';
        this.wrapper.appendChild(this.modalContent);
        this.wrapper.style.display = 'flex';
        
        // Add click outside to close
        this.wrapper.onclick = (e) => {
            if (e.target === this.wrapper) {
                this.hideMessage();
            }
        };

        // Add escape key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideMessage();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    static async hideMessage() {
        if (this.modalContent) {
            this.modalContent.classList.remove('view-enter');
            this.modalContent.classList.add('view-exit');
            
            await new Promise(resolve => {
                this.modalContent.addEventListener('animationend', () => {
                    this.wrapper.style.display = 'none';
                    this.modalContent = null;
                    resolve();
                }, { once: true });
            });
        }
    }
}

class LayoutView extends View {
    constructor() {
        super();
        this.init();
    }

    createWrapper() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'layout-wrapper';
        
        // Navbar
        this.navbar = NavbarComponent.create({ animate: true });
        this.wrapper.appendChild(this.navbar.getElement());
        
        // Create main menu dropdown
        const mainMenuContainer = document.createElement('div');
        mainMenuContainer.className = 'dropdown';
        mainMenuContainer.id = 'mainMenu';

        const toggleButton = document.createElement('button');
        toggleButton.className = 'dropdown-toggle';
        toggleButton.innerHTML = `<img src="src/img/img/dot-menu.svg" alt="Menu Icon" class="navbar-icon-button" />`;

        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';

        mainMenuContainer.appendChild(toggleButton);
        mainMenuContainer.appendChild(dropdownMenu);
        this.navbar.getElement().appendChild(mainMenuContainer);

        // Initialize DropdownComponent
        const mainMenu = new DropdownComponent(mainMenuContainer);
        mainMenu.addItem('Загрузить файл', 'upload', () => console.log('Upload clicked'));
        mainMenu.addItem('Удалить данные', 'delete', () => console.log('Delete clicked'));
        mainMenu.addItem('', '', null, null, null); // Separator
        mainMenu.addItem('Настройки', 'settings', () => console.log('Settings clicked'));

        // Content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'content-container';
        this.wrapper.appendChild(this.contentContainer);
        
        // Reports dropdown
        this.reportDropdown = new ReportDropdown(this.navbar.getElement());
        
        // Upload button
        this.uploadButton = this.navbar.addButton('', 'src/img/upload-0.svg', () => {
            this.refact.setState({ view: 'upload' });
        });

        // Clear Local Storage button
        this.clearLocalStorageButton = this.navbar.addButton('', 'src/img/trash-bin-0.svg', () => {
            const dataManager = new DataManager();
            dataManager.clearLocalStorage();
            // window.location.reload();
            MessageView.showMessage('Данные удалены', 'Данные удалены из Local Storage', 'Удалить', () => {
                this.refact.setState({ clearLocalStorageData: true }, 'DataManager.clearLocalStorageData');
            });
        });

        return this.wrapper;
    }

    init() {
        this.container = this.createWrapper();
        this.setContainer(this.container);
        
        // First create the DateRangeDropdown
        this.dateRangeDropdown = new DateRangeDropdown();
        // Then add it to the navbar group
        this.leftNavbarGroup = this.navbar.addGroup('left', [this.dateRangeDropdown.getContainer()]);
    }

    setContent(content) {
        // Очищаем контейнер
        while (this.contentContainer.firstChild) {
            this.contentContainer.removeChild(this.contentContainer.firstChild);
        }
        // Добавляем новый контент
        if (content) {
            this.contentContainer.appendChild(content);
        }
    }

    showUploadView() {
        this.refact.setState({ view: 'upload' });
    }

    getWrapper() {
        return this.wrapper;
    }

    getContainer() {
        return this.contentContainer;
    }

    mount(targetElement) {
        if (targetElement) {
            targetElement.appendChild(this.container);
            return true;
        }
        return false;
    }
}

class ViewController {
    constructor(container) {
        this.refact = Refact.getInstance(container);
        this.container = container;
        this.views = {};
        this.currentView = null;
        this.init();
    }
    
    init(){
        this.refact.subscribe('view', this.showView.bind(this));
        this.refact.subscribe('issues', this.updateView.bind(this));
        this.refact.subscribe('reports', this.showReport.bind(this));
    
        // First create and mount the layout
        this.layoutView = new LayoutView();
        this.container.appendChild(this.layoutView.getWrapper());
        
        // Create and register views
        this.uploadView = new UploadView();
        this.dashboardView = new DashboardView();
        this.reportsView = new ReportsView();

        this.registerView('upload', this.uploadView);
        this.registerView('dashboard', this.dashboardView);
        this.registerView('reports', this.reportsView);
    }

    registerView(name, viewContainer) {
        this.views[name] = viewContainer;
        const container = viewContainer.getContainer();
        if (container && !container.parentElement) {
            this.layoutView.getContainer().appendChild(container);
        }
        container.style.display = 'none'; // Initially hide all views
    }

    async showView(name) {
        const targetView = this.views[name];
        if (!targetView) throw new Error(`View "${name}" not found`);

        const targetContainer = targetView.getContainer();
        
        // Hide all views except target and current
        Object.values(this.views).forEach(view => {
            if (view !== targetView && view !== this.currentView) {
                const container = view.getContainer();
                container.style.display = 'none';
                container.classList.remove('view-exit', 'view-enter');
            }
        });

        // If there's a current view, animate it out
        if (this.currentView && this.currentView !== targetView) {
            const currentContainer = this.currentView.getContainer();
            currentContainer.classList.add('view-exit');
            
            await new Promise(resolve => {
                currentContainer.addEventListener('animationend', () => {
                    currentContainer.style.display = 'none';
                    currentContainer.classList.remove('view-exit');
                    resolve();
                }, { once: true });
            });
        }

        // Animate new view in
        targetContainer.style.display = 'block';
        targetContainer.classList.add('view-enter');
        
        await new Promise(resolve => {
            targetContainer.addEventListener('animationend', () => {
                targetContainer.classList.remove('view-enter');
                resolve();
            }, { once: true });
        });

        this.currentView = targetView;
        this.refact.setState({ currentView: name }, 'ViewController.showView');
    }

    updateView() {
        const issues = this.refact.issues;
        if (!issues || !issues.length) {
            this.showView('upload');
        } else {
            this.showView('dashboard');
        }
    }

    showReport(report) {
        if (!report) return;

        const reportsView = this.views['reports'];
        const view = reportsView.render(report);

        this.showView('reports');
    }

    bindEvent(name, event, handler) {
        if (this.views[name]) {
            this.views[name].addEventListener(event, handler);
        }
    }
}

class DashboardView extends View {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.createView();
        this.setupReactivity();
        this.slidePanel = new SlidePanel();
    }

    createView() {
        // Container
        const container = this.createContainer({
            id: 'dashboard-view',
            className: 'dashboard-container'
        });

        // Cards row
        this.topCardsRow = this.createElement('div', { className: 'cards-row' });
        container.appendChild(this.topCardsRow);

        // Chart container
        this.chartContainer = this.createElement('div', { id: 'defects-chart-container' });
        container.appendChild(this.chartContainer);

        this.createCards();
    }

    addDefectCard(card) {
        this.topCardsRow.appendChild(card);
    }

    clearCards() {
        while (this.topCardsRow.firstChild) {
            this.topCardsRow.removeChild(this.topCardsRow.firstChild);
        }
    }

    showLoader() {
        this.topCardsRow.innerHTML = `
            <div class="loader"></div>
        `;
    }

    createCards() {
            // Defects
            this.defectsCard = new ValueCard(this.topCardsRow, {
                title: 'Дефекты',
                content: 'Загрузка...',
                iconSvg: 'src/img/jira-defect.svg',
                footer: 'Загрузка...'
            });
            this.defectsCard.element.addEventListener('click', () => {
                this.slidePanel.setTitle('Unresolved Tasks');
                const unresolvedIssues = this.refact.state.statistics.total.unresolvedIssues;
                const issueTable = new IssueTable(
                    ['taskId', 'reports', 'status', 'description', 'created'],
                    { isUpperCase: false }
                );
                issueTable.render(unresolvedIssues);
                this.slidePanel.updateContent(issueTable.container);
                this.slidePanel.open();
            });
            this.refact.subscribe('statistics', (statistics) => {
                if (!statistics) return;
                this.defectsCard.updateContent(statistics.total.unresolved, `${statistics.currentMonth.created} в этом месяце`);
            });
    
            // Reports
            this.unresolvedReportsCard = new ValueCard(this.topCardsRow, {
                title: 'Оборащения',
                content: 'Загрузка...',
                iconSvg: 'src/img/trigger.svg',
                footer: ''
            });
            this.unresolvedReportsCard.element.addEventListener('click', () => {
                this.slidePanel.setTitle('Unresolved Reports');
                const unresolvedReports = this.refact.state.statistics.total.unresolvedReports;
                const issueTable = new IssueTable(
                    ['taskId', 'reports', 'status', 'description', 'created'],
                    { isUpperCase: false }
                );
                
                // Sort unresolvedReports by reports count in descending order
                const sortedReports = [...unresolvedReports].sort((a, b) => (b.reports || 0) - (a.reports || 0));
                
                issueTable.render(sortedReports);
                this.slidePanel.updateContent(issueTable.container);
                this.slidePanel.open();
                
                // Trigger sort on the reports column to show sort indicator
                const reportsColumn = issueTable.availableColumns.reports;
                reportsColumn.sortDirection = 'desc';
                issueTable.sortByColumn(reportsColumn);
            });
            this.refact.subscribe('statistics', (statistics) => {
                if (!statistics) return;
                this.unresolvedReportsCard.updateContent(statistics.total.reportsCount, 'на открытых дефектах');
            });
  
    }

    setupReactivity() {
        this.refact.subscribe('defects', (defects) => {
            if (!defects) return;

            const { unresolved, reports } = statistics;
    });
    }

}

class UploadView extends View {
    constructor() {
        super();
        this.createView();
    }

    createView() {
        this.uploadContainer = document.createElement('div');
        this.uploadContainer.className = 'upload-container';
        this.uploadContainer.id = 'upload-data-view';
        
        // Создаем FileInput
        this.fileInput = new FileInputContainer(this.uploadContainer);
    }

    getContainer() {
        return this.uploadContainer;
    }
}

class ReportsView extends View {
    constructor() {
        super();
        this.container = document.createElement('div');
        this.container.className = 'reports-view';
        
        this.headers = [
            'Команда',
            'Всего открыто',
            'Всего закрыто',
            'Обращений по ним (с даты создания)',
            'Закрыто за пред. мес. (Т-30)',
            'Новых за пред.мес. (Т-30)',
            'Отклонено за пред.мес. (Т-30)',
            'Ср.время закрытия (дни)',
            'SLA'
        ];
        this.setupView();
    }
    
    setupView() {
        // Create table container
        this.tableContainer = document.createElement('div');
        this.tableContainer.className = 'reports-table-container';
        
        // Create table
        this.table = document.createElement('table');
        this.table.className = 'reports-table tablesorter';     
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.className = 'tablesorter-headerRow';
        
        this.headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.className = 'confluenceTh tablesorter-header';
            th.setAttribute('data-column', index);
            
            const headerInner = document.createElement('div');
            headerInner.className = 'tablesorter-header-inner';
            headerInner.textContent = header;
            
            th.appendChild(headerInner);
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        this.table.appendChild(thead);
        
        // Create table body
        this.tbody = document.createElement('tbody');
        this.table.appendChild(this.tbody);
        
        this.tableContainer.appendChild(this.table);
        this.container.appendChild(this.tableContainer);
    }

    createTeamLink(team) {
        const wrapper = document.createElement('div');
        wrapper.className = 'content-wrapper';
        
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        const a = document.createElement('a');
        
        a.href = `https://jira.moscow.alfaintra.net/issues/?jql="Команда устраняющая проблему" in ("${team}")`;
        a.target = '_blank';
        a.className = 'contentf-button aui-button btn-link';
        a.style.textDecoration = 'none';
        a.textContent = team;
        
        strong.appendChild(a);
        p.appendChild(strong);
        wrapper.appendChild(p);
        
        return wrapper;
    }
    
    render(teamsData) {
        if (!teamsData) return this.container;
        
        // Clear existing content
        this.tbody.innerHTML = '';
        
        // Sort teams by total reports
        const sortedTeams = Object.entries(teamsData)
            .sort(([, a], [, b]) => b.reportsTotal - a.reportsTotal);
        
        // Create rows for each team
        sortedTeams.forEach(([team, data]) => {
            if (data.reportsTotal === 0) return; // Skip teams with no reports
            
            const row = document.createElement('tr');
            
            // Calculate values
            const totalOpen = data.new + data.unresolved;
            const totalClosed = data.resolved + data.rejected;
            const reportsTotal = data.reportsTotal || '-';
            const last30Closed = data.last30Days.closed || 0;
            const last30New = data.last30Days.new || 0;
            const last30Rejected = data.last30Days.rejected || 0;
            const avgCloseTime = data.avgCloseTime ? data.avgCloseTime.toFixed(1) : '-';
            const slaPercentage = `${data.slaPercentage.toFixed(2)}%`;

            // Create cells
            [
                this.createTeamLink(team),
                totalOpen,
                totalClosed,
                reportsTotal,
                last30Closed,
                last30New,
                last30Rejected,
                avgCloseTime,
                slaPercentage
            ].forEach((value, index) => {
                const td = document.createElement('td');
                td.className = 'confluenceTd';
                
                if (value === '-') {
                    td.className += ' highlight-grey';
                    td.style.textAlign = 'center';
                    td.textContent = '-';
                } else if (value instanceof Element) {
                    td.appendChild(value);
                } else {
                    td.textContent = value;
                }
                
                row.appendChild(td);
            });
            
            this.tbody.appendChild(row);
        });
        
        return this.container;
    }
    
    getContainer() {
        return this.container;
    }
}

class TeamView {
    constructor(teamData) {
      this.teamData = teamData;
    }
  
    show() {
      const teamCard = document.getElementById('teamCard');
      const teamName = document.getElementById('teamName');
      const teamDescription = document.getElementById('teamDescription');
      const teamMembers = document.getElementById('teamMembers');
      const closeButton = document.getElementById('closeButton');
  
      teamName.textContent = this.teamData.name;
      teamDescription.textContent = `${this.teamData.description}\nКоличество задач: ${this.teamData.openTasks}`;
      teamMembers.innerHTML = '';
      
      if (this.teamData.members && this.teamData.members.length > 0) {
        this.teamData.members.forEach(member => {
          const listItem = document.createElement('li');
          listItem.textContent = member;
          teamMembers.appendChild(listItem);
        });
      } else {
        teamMembers.innerHTML = '<li>Информация о составе команды недоступна</li>';
      }
  
      teamCard.style.display = 'block';
  
      closeButton.onclick = () => {
        teamCard.style.display = 'none';
        
        // Показываем график команд и скрываем backlog график
        const teamsChartCanvas = document.getElementById('teams-backlog-chart-canvas');
        const backlogChartCanvas = document.getElementById('backlog-chart-canvas');
        
        if (teamsChartCanvas && backlogChartCanvas) {
          teamsChartCanvas.style.visibility = 'visible';
          backlogChartCanvas.style.visibility = 'hidden';
        }
      };
    }
  
    hide() {
      const teamCard = document.getElementById('teamCard');
      teamCard.style.opacity = '0';
      setTimeout(() => {
        teamCard.style.display = 'none';
      }, 500); // Время анимации совпадает с CSS
    }
  }
class BacklogView {
    constructor(containerId) {
        this.container = containerId;
        initComponents();
    }
    
    initComponents() {
        this.container = document.getElementById(this.container);
    
    }

}

// Store and manage application configuration
class ConfigManager {
    static instance = null;

    static getInstance(defaultConfig = {}) {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager(defaultConfig);
        }
        return ConfigManager.instance;
    }

    constructor(defaultConfig = {}) {
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }

        log('ConfigManager: Initializing with defaultConfig: ', defaultConfig);
        this.defaultConfig = defaultConfig;
        this.config = defaultConfig;
        this.refact = new Refact(document.body);

        // Load config from LocalStorage or use default
        const loadedConfig = this.loadConfigFromLocalStorage();
        if(loadedConfig === false) {
            console.log('ConfigManager: Using default config');
            this.setConfig(this.defaultConfig);
            this.saveConfigToLocalStorage();
        } else {
            console.log('ConfigManager: Using loaded config');
            this.setConfig(loadedConfig);
        }

        ConfigManager.instance = this;
    }

    setConfig(newConfig) {
        if (!newConfig) return;
        
        console.log('ConfigManager: Setting new config =', newConfig);
        Object.keys(newConfig).forEach(key => {
            this.refact.setState({ [key]: newConfig[key] }, 'ConfigManager.setConfig');
        });
        this.config = newConfig;
    }

    saveConfigToLocalStorage() {
        try {
            localStorage.setItem('config', JSON.stringify(this.config));
            console.log('ConfigManager: Saved config to localStorage');
        } catch (error) {
            console.error('ConfigManager: Error saving config to localStorage:', error);
        }
    }

    loadConfigFromLocalStorage() {
        try {
            const storedConfig = localStorage.getItem('config');
            if (!storedConfig) return false;
            
            const parsedConfig = JSON.parse(storedConfig);
            log('ConfigManager: Loaded config from localStorage:', parsedConfig);
            return parsedConfig;
        } catch (error) {
            console.error('ConfigManager: Error loading config from localStorage:', error);
            return false;
        }
    }

    resetToDefaultConfig() {
        this.setConfig(this.defaultConfig);
        this.saveConfigToLocalStorage();
    }
}

/**
 * DataTransformer class provides methods for transforming issue data into various formats
 * suitable for different visualization needs.
 */
class DataTransformer {
  /**
   * Creates a linear dataset from issues array
   * @param {Array} issues - Array of issue objects
   * @param {Object} options - Configuration options
   * @param {string} options.dateField - Field to use for X-axis (e.g., 'created', 'resolved')
   * @param {string} options.groupBy - Field to group by (e.g., 'team', 'status')
   * @param {string} options.aggregation - Type of aggregation ('count', 'sum')
   * @param {string} [options.valueField] - Field to aggregate (required if aggregation is 'sum')
   * @returns {Object} Dataset suitable for linear charts
   */

  getStateByStatus(status) {
    switch(status) {
      case 'Закрыт':
        return 'resolved';
      case 'Отклонен':
        return 'rejected';
      default:
        return 'unresolved'; 
    }
  }

  objectsToIssues( objects ) {    
    return objects.map(object => this.objectToIssue(object));
  }

  objectToIssue( object ) {
    const issue = {};
    Object.keys(object).forEach(key => {
      issue[key] = object[key];
    });

    issue.state = this.getStateByStatus(issue.status);
    issue.isOverdue = DataTransformer.isOverdue(issue);
    
    return issue;
  }

  // Is SLA ovedue
  static isOverdue(issue) {
    if (issue.state === 'unresolved')
      return false;

    const today = new Date();
    const dueDate = new Date(issue.slaDate);

    return today > dueDate;
  }

  static getLinearDataset(issues, options = {}) {
    const {
      dateField = 'created',
      groupBy = 'team',
      aggregation = 'count',
      valueField
    } = options;

    // Validate inputs
    if (!Array.isArray(issues)) {
      throw new Error('Issues must be an array');
    }
    if (aggregation === 'sum' && !valueField) {
      throw new Error('valueField is required when aggregation is "sum"');
    }

    // Group issues by date and specified groupBy field
    const groupedData = new Map();

    issues.forEach(issue => {
      const date = issue[dateField];
      if (!date) return;

      const dateStr = date instanceof Date ? 
        date.toISOString().split('T')[0] : 
        new Date(date).toISOString().split('T')[0];
      
      const groupValue = issue[groupBy] || 'Unknown';

      if (!groupedData.has(dateStr)) {
        groupedData.set(dateStr, new Map());
      }
      
      const dateGroup = groupedData.get(dateStr);
      if (!dateGroup.has(groupValue)) {
        dateGroup.set(groupValue, []);
      }
      
      dateGroup.get(groupValue).push(issue);
    });

    // Convert grouped data to dataset format
    const dataset = {
      labels: [],
      datasets: new Map()
    };

    // Sort dates
    const sortedDates = Array.from(groupedData.keys()).sort();
    dataset.labels = sortedDates;

    // Process each group
    for (const [date, groupMap] of groupedData) {
      for (const [groupValue, groupIssues] of groupMap) {
        if (!dataset.datasets.has(groupValue)) {
          dataset.datasets.set(groupValue, {
            label: groupValue,
            data: new Array(sortedDates.length).fill(0)
          });
        }

        const dateIndex = sortedDates.indexOf(date);
        const value = aggregation === 'count' ? 
          groupIssues.length : 
          groupIssues.reduce((sum, issue) => sum + (issue[valueField] || 0), 0);

        dataset.datasets.get(groupValue).data[dateIndex] = value;
      }
    }

    // Convert datasets Map to Array
    dataset.datasets = Array.from(dataset.datasets.values());

    return dataset;
  }

  /**
   * Creates a pie chart dataset from issues array
   * @param {Array} issues - Array of issue objects
   * @param {Object} options - Configuration options
   * @param {string} options.groupBy - Field to group by (e.g., 'team', 'status')
   * @param {string} options.aggregation - Type of aggregation ('count', 'sum')
   * @param {string} [options.valueField] - Field to aggregate (required if aggregation is 'sum')
   * @returns {Object} Dataset suitable for pie charts
   */
  static getPieDataset(issues, options = {}) {
    const {
      groupBy = 'team',
      aggregation = 'count',
      valueField
    } = options;

    // Validate inputs
    if (!Array.isArray(issues)) {
      throw new Error('Issues must be an array');
    }
    if (aggregation === 'sum' && !valueField) {
      throw new Error('valueField is required when aggregation is "sum"');
    }

    // Group issues by the specified field
    const groupedData = new Map();

    issues.forEach(issue => {
      const groupValue = issue[groupBy] || 'Unknown';
      
      if (!groupedData.has(groupValue)) {
        groupedData.set(groupValue, []);
      }
      
      groupedData.get(groupValue).push(issue);
    });

    // Convert to dataset format
    const dataset = {
      labels: [],
      data: []
    };

    for (const [groupValue, groupIssues] of groupedData) {
      dataset.labels.push(groupValue);
      
      const value = aggregation === 'count' ? 
        groupIssues.length : 
        groupIssues.reduce((sum, issue) => sum + (issue[valueField] || 0), 0);
      
      dataset.data.push(value);
    }

    return dataset;
  }

  /**
   * Creates a table dataset from issues array
   * @param {Array} issues - Array of issue objects
   * @param {Array} columns - Array of column configurations
   * @returns {Object} Dataset suitable for tables
   */
  static getTableDataset(issues, columns) {
    if (!Array.isArray(issues)) {
      throw new Error('Issues must be an array');
    }
    if (!Array.isArray(columns)) {
      throw new Error('Columns must be an array');
    }

    return {
      headers: columns.map(col => col.header),
      rows: issues.map(issue => 
        columns.map(col => {
          const value = issue[col.field];
          if (col.formatter) {
            return col.formatter(value);
          }
          return value;
        })
      )
    };
  }
}

class TeamManager {
    constructor() {
    }

    teams = 
      {
        "Meribel (Мерибель)": {
          "productOwner": "PO Гайд Гури",
          "skills": "Стратегия, Автоматизация, Розает, Продуктовый бразер платформы SDU, Имеет профкомпетенции, Продуктовые навыки"
        },
        "K2": {
          "productOwner": "PO Влад Гусак",
          "skills": "Привлечение PO, PO (Авторизация, Регистрация, Профиль), Долгосрочная дока, Обучение"
        },
        "Kilimanjaro (Килиманджаро)": {
          "productOwner": "PO Валерий Титоренко",
          "skills": "Прогнозы, чар и маркеты (Лид), План на 2024, Прогнозы и планы на три года, BI, Новые продукты, Стратегия, Сценарии использования, расчет, раздача Профита"
        },
        "Etna (Этна)": {
          "productOwner": "PO Олег Хахов",
          "skills": "Развитие продуктов: заказ, персонализация, гибкая опция, Стратегия, Предложение SPA в турнире, предзаказы, Продуктовые навыки, Продуктовые навыки, Вылет/Топливные фишки/что покупают клиенты, маркетинговые активности"
        },
        "Olympus (Олимп)": {
          "productOwner": "PO Александр Купцов",
          "skills": "Раздел Контентные платформы, Interfox, Новости и карточки, инструменты, раздел на главной, контентные блоки, Новости, Headtop"
        },
        "Makalu (Макалу)": {
          "productOwner": "PO Ступак Сергей",
          "skills": "Геймплей AI, API игр, Пути и трактер в геймплее"
        },
        "Everest (Эверест)": {
          "productOwner": "PO Михаил Хлестунов",
          "skills": "OTC, Торговые заявки Lite-Pro-uET, Tinkoff SuperApp, Интеграционные сценарии, Tinkoff BL, Коннекторы, биржевые интеграции, Выбираемая торговля Ай"
        },
        "Sierra (Сьерра)": {
          "productOwner": "PO Никита Краснопеев",
          "skills": "Tinkoff Pro, premium, облегчение, SDUI, техдоки, Выводы Валюты и Драгметаллы, Tinkoff BL, Документы, интеграция с MT, Цифровые подписки с УЗПГ, Кроссплатформ, Альтернативные инвестиции, Квартальные дедлайны"
        },
        "Elbrus (Эльбрус)": {
          "productOwner": "PO Елена Правина",
          "skills": "Тестопродажи плакальца, Стругу квад инвесторов, EDT, Автодокавление, Уведомления о доходной части-сценарии, Уведомления о доходной части-сценарии, Кейсы, клиенты, инвестиции в Премиум, рейтинг MarksWebb"
        },
        "Siple (Сайпл)": {
          "productOwner": "PO Сергей Тупеи",
          "skills": "Подростки и бюджетные лица"
        },
        "Appalachians (Аппалачи)": {
          "productOwner": "PO Оля Аверьянова",
          "skills": "Экран ВА, Торффлекс Pro и Lite (грофик, реализация), карточка, торговля, Риффы от Tinkoff BL, Коннекторы (интеграции, секьюрити), Оценка бумаг (анализ + детализация), Hot news"
        },
        "Fuji (Фудзи)": {
          "productOwner": "PO Николай Тихов",
          "skills": "Снижение инструментов в рисках, Фильтры и сортировки, Сценарии, Внутренние, Планы, Сценарии, Стратегии, Продуктовые навыки и кс секьюризации"
        },
        "Matterhorn (Маттерхорн)": {
          "productOwner": "PO Кирилл Михаров",
          "skills": "Партнерские интеграции, Продукты, VIP, Планы и сценарии бюджета, Выплаты удержания, Акции в торговле, Карточки инвестиционного менеджера, Сбор VOC, Фонд поддержки инвесторов, Сценарии использования, Стратегия участия в маркетинговых кампаниях"
        },
        "Weisshorn (Вайсхорн)": {
          "productOwner": "PO Юлия Карпенко",
          "skills": "Задачи CRM GI"
        },
        "Citadel (Цитадель)": {
          "productOwner": "PO Константин Вишневский",
          "skills": "Открытие счетов, карточки счетов, верификация, история операций, инвестиционные продукты"
        },
        "Twin Tree (Твин Три)": {
          "productOwner": "PO Александр Филонов",
          "skills": "Геймплейфлоушие механики: финансовые инструменты, пустые, профиль клиента, квисты"
        },
        "Black Rock (Блэк Рок)": {
          "productOwner": "PO Руслан Николайтанов",
          "skills": "Продуктовый менеджмент, инвестиции, стратегия, сценарии, карточки, инвестиции, продукты, платформы, Направленность"
        },
        "Millenium (Миллениум)": {
          "productOwner": "PO Екатерина Ефремова",
          "skills": "Продуктовый менеджмент, инвестиции на рынке и главные сценарии AM, инвестиции, стратегия, портфели"
        },
        "Renaissance (Ренессанс)": {
          "productOwner": "PO Валентин Белоус",
          "skills": "Продуктовый менеджмент, OMS, постторговый BC"
        },
        "Montblanc (Монблан)": {
          "productOwner": "PO Мария Казанцева",
          "skills": "Портфель: список позиций, Поиск и портфель Для инвесторов, Аналитика портфеля, Источники доходов, Аналитика портфеля, Источники доходов, Аналитика портфеля, Переименование BC, OTC и портфель, Выделен баланс на Главной, Вторичка pre-IPO в портфеле, Сценарии, Маркетплейс (портфель)"
        },
        "Kailash (Кайлас)": {
          "productOwner": "PO Екатерина Суслина",
          "skills": "UDA, Клиентоцентричные продукты и сервисы, Стратегия, Продуктовые навыки, Направленность"
        }
      }
    
    teamNames =[
          "Meribel",
          "K2",
          "Kilimanjaro",
          "Etna",
          "Olympus",
          "Makalu",
          "Everest",
          "Sierra",
          "Elbrus",
          "Siple",
          "Appalachians",
          "Fuji",
          "Matterhorn",
          "Weisshorn",
          "Citadel",
          "Twin Tree",
          "Black Rock",
          "Millenium",
          "Renaissance",
          "Montblanc",
          "Kailash"
    ];

    directions = {
      "Лучшая мобильная платформа": {
          owner: "Добкин А.",
          teams: ["Эльбрус", "Этна 1", "БлэкРок"],
          products: ["Топ-1 Markswebb", "BAU"],
      },
      "Рост транзакционной активности и цифровые продажи": {
          owner: "Добкин А.",
          teams: ["Этна 1", "БлэкРок", "Миллениум"],
          products: ["CRM", "Engagement", "endToEnd", "Команда от Лояльности", "Инвест. копилка"]
      },
      "Развитие Pro-решений": {
          owner: "Чаркин А.",
          teams: ["НТФ", "ПРО-терминалы", "WEB-терминалы", "Сайт ГИ"],
          products: ["Аналитика", "Статистика", "Сайт", "Бизнес-план", "Инвестиции", "Бизнес-логика", "Продукты", "Инфраструктура", "Блокчейн", "Сервисы", "Обучение", "Контент"]
      },
      "Digital-контент платформа": {
          owner: "Шишов Д.",
          teams: ["НТФ", "НТФ(ЛК)", "ПРО", "WEB", "Core"],
          products: ["Комьюнити-менеджер", "Команда аналитики", "Команда контента", "Олимпус", "Сатурн 2", "Сайт"]
      },
      "Красные команды": {
        owner: "Дрынкин В.",
        teams: ["core МП", "Веста", "Core", "АПИ", "Риски", "Плутон", "Плутон 1", "QA-десант"],
        products: ["Красные команды"]
      },
      "Привлечение и первичная активация": {
        owner: "Прилепская А.",
        teams: ["К2"],
        products: ["Онлайн продажи", "CRM", "Контент-менеджеры сайта", "WallStreetBet"]
      },
      "Digital-контент платформа": {
        owner: "Прилепская А.",
        teams: ["Олимпус", "Сатурн 2", "Сайт"],
        products: ["Соц. сеть", "Фабрика контента", "Цифр. продукт", "Медиапортал"],
      },
      "Персонализация клиентского опыта": {
        owner: "Прилепская А.",
        teams: ["Game 2", "ТвинТри", "Альфа-центавра"],
        products: ["Геймтрек"]
      },
    };
}
class ReportManager {
  constructor() {
    this.refact = Refact.getInstance();
    this.refact.subscribe('reportType', (type) => {
      this.generateReport(type);
    });
  }    


  months = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
  ];
  
  // Mapping of product areas
  productAreas = {
    "Портфель": ["портфел", "позици"],
    "Рынок": ["рынок", "торг", "котировк"],
    "Заявки": ["заявк", "поручен"],
    "Витрины, новости, аналитика": ["витрин", "новост", "аналитик"],
    "Терминалы": ["терминал"],
  };

 
  mobileTeams = ["Meribel", "K2", "Kilimanjaro", "Etna", "Olympus", "Makalu", "Everest", "Sierra", "Elbrus", "Siple", "Appalachians", "Fuji", "Matterhorn", "Weisshorn", "Citadel", "Twin Tree", "Black Rock", "Millenium", "Renaissance", "Montblanc", "Kailash"];

  generateReport(type) {
    switch (type) {
      case 'weekly':
        this.generateWeeklyReport();
        break;
      case 'mvp':
        this.getMvpReport(this.refact.state.issues, this.mobileTeams);
        break;
      default:
        break;
    }
  }
  
  isValidIssue(issue) {
    return issue && issue.id && issue.created && issue.state && issue.team;
  }

  isSlaOverdue(issue) {
    if (issue.state === 'rejected') {
      return undefined;
    }

    const today = new Date();
    const dueDate = new Date(issue.slaDate);

    if (issue.state === 'unresolved' && today > dueDate) {
      return true;
    }

    if (issue.state === 'resolved' && new Date(issue.resolved) > dueDate) {
      return true;
    }

    return false;
  }

  getMvpReport(issues, teams) {
    const overdueIssues = issues.filter(issue => this.isSlaOverdue(issue));
    log(overdueIssues, 'Overdue issues');
    log(teams,  'Teams');
    
    const teamsData = {};
    teams.forEach(team => {
        teamsData[team] = {
            new: 0,
            unresolved: 0,
            resolved: 0,
            rejected: 0,
            avgCloseTime: 0,
            reportsTotal: 0,
            reportsUnresolved: 0,
            slaPercentage: 0,
            last30Days: {
                closed: 0,
                new: 0,
                rejected: 0
            },
        };
    });

    if (issues.length === 0) {
        log('No valid issues found, returning empty array');
        return [];
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    issues.forEach(issue => {
        // Получаем команду из объекта issue
        const team = issue.team;
        
        if (!teamsData[team]) {
            return;
        }

        // Increment total count
        teamsData[team].new++;

        // Count reports
        if (issue.reports) {
            teamsData[team].reportsTotal += issue.reports;
            if (issue.state === 'unresolved') {
                teamsData[team].reportsUnresolved += issue.reports;
            }
        }

        // Process by state
        switch (issue.state) {
            case 'resolved':
            case 'rejected':
                const isOverdue = this.isSlaOverdue(issue);
                if (isOverdue === false) {
                    teamsData[team].slaPercentage++;
                }
                break;
            default:
                break;
        }

        // Process last 30 days statistics
        const createdDate = new Date(issue.created);
        if (createdDate >= thirtyDaysAgo) {
            teamsData[team].last30Days.new++;
        }

        if (issue.resolved) {
            const resolvedDate = new Date(issue.resolved);
            if (resolvedDate >= thirtyDaysAgo) {
                if (issue.state === 'rejected') {
                    teamsData[team].last30Days.rejected++;
                } else {
                    teamsData[team].last30Days.closed++;
                }
            }
        }

        // Process by state
        switch (issue.state) {
            case 'unresolved':
                teamsData[team].unresolved++;
                break;
            case 'resolved':
                teamsData[team].resolved++;
                if (issue.resolved && issue.created) {
                    const closeTime = new Date(issue.resolved) - new Date(issue.created);
                    teamsData[team].avgCloseTime = 
                        (teamsData[team].avgCloseTime * (teamsData[team].resolved - 1) + closeTime) 
                        / teamsData[team].resolved;
                }
                break;
            case 'rejected':
                teamsData[team].rejected++;
                break;
        }
    });

    // Calculate average resolution time for each team
    Object.keys(teamsData).forEach(team => {
        const teamData = teamsData[team];
        if (teamData.resolved > 0) {
            // Convert from milliseconds to days
            teamData.avgCloseTime = (teamData.avgCloseTime / (1000 * 60 * 60 * 24));
        }
    });

    // Calculate SLA percentage
    Object.keys(teamsData).forEach(team => {
        const totalIssues = teamsData[team].new + teamsData[team].resolved + teamsData[team].rejected;
        if (totalIssues > 0) {
            teamsData[team].slaPercentage = (teamsData[team].slaPercentage / totalIssues) * 100;
        }
    });

    log(teamsData, 'teamsData');
    this.refact.setState({ reports: teamsData }, 'ReportManager.getMvpReport'); // Save reports = teamsData;
    return teamsData;
}

}

class StatisticManager {
    constructor(issues = []) {
        this.issues = issues;
        this.init();
    }

    init(){
        this.types = {
            defects: this.statistics,
            requests: this.statistics,
            all: this.statistics
        }

        this.statistics = {
            total: this.values,
            currentMonth: this.values,
            lastMonth: this.values,
            last30Days: this.values,
            last90Days: this.values,
            last180Days: this.values
        }

        this.values = {
            resolved: [],
            unresolved: [],
            rejected: [],
            rejectedByTeam: [],
            total: [],
            slaDate: [],
            resolutionTime: [],
            backlogCount: 0,
            reportsCount: 0,
        }
    }

    static getFullStatistics(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] getFullStatistics requires an array of issues');
        }

        const calculateCreatedCount = (filteredIssues) => filteredIssues.length;
        const calculateCompletedCount = (filteredIssues) => filteredIssues.filter(issue => {
            const resolvedDate = new Date(issue.resolved);
            return !isNaN(resolvedDate) && ['resolved', 'rejected'].includes(issue.status);
        }).length;
        const calculateBacklog = (created, resolved, rejected) => created - (resolved + rejected);

        const filterUnresolvedIssues = (filteredIssues) => filteredIssues.filter(issue => issue.state === 'unresolved');

        return {
            total: {
                ...this.calculateStatistics(issues),
                unresolvedIssues: filterUnresolvedIssues(issues)
            },
            currentMonth: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues))
            },
            lastMonth: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues))
            },
            last30Days: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues))
            },
            last90Days: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues))
            },
            last180Days: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues))
            }
        };
    }

    static filterIssuesByDate(startDate, endDate, issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] filterIssuesByDate requires an array of issues');
        }

        if (!(startDate instanceof Date) || isNaN(startDate)) {
            throw new Error('[StatisticManager] Invalid startDate');
        }

        if (!(endDate instanceof Date) || isNaN(endDate)) {
            throw new Error('[StatisticManager] Invalid endDate');
        }

        return issues.filter(issue => {
            if (!issue.created) {
                console.Error(`[StatisticManager] Missing created date for issue: ${issue.id}`);
                return false;
            }
            const created = new Date(issue.created);
            if (isNaN(created)) {
                console.warn(`[StatisticManager] Invalid date for issue: ${issue.id}, date value: ${issue.created}`);
                return false;
            }
            return created >= startDate && created <= endDate;
        });
    }

    static calculateStatistics(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] calculateStatistics requires an array of issues');
        }

        const stateGroups = this.groupByState(issues);
        
        return {
            total: issues.length,
            resolved: stateGroups.resolved || 0,
            unresolved: stateGroups.unresolved || 0,
            rejected: stateGroups.rejected || 0,
            reportsCount: this.getReportsCount(issues.filter(i => i.state === 'unresolved')),
            slaDate: this.groupBySlaDate(issues),
            resolutionTime: this.getAverageTime(issues, 'resolved')
        };
    }

    static isDateInRange(date, startDate, endDate) {
        return date >= startDate && date <= endDate;
    }

    static groupBySlaDate(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] groupBySlaDate requires an array of issues');
        }

        return issues.reduce((acc, issue) => {
            if (issue.slaDate) {
                acc[issue.slaDate] = (acc[issue.slaDate] || 0) + 1;
            }
            return acc;
        }, {});
    }

    static getAverageTime(issues, property) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] getAverageTime requires an array of issues');
        }

        if (issues.length === 0) return 0;
        
        const total = issues.reduce((sum, issue) => sum + (issue[property] || 0), 0);
        return total / issues.length;
    }

    static getReportsCount(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] getReportsCount requires an array of issues');
        }
        
        return issues.reduce((sum, issue) => sum + (parseInt(issue.reports) || 0), 0);
    }

    static groupByState(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] groupByState requires an array of issues');
        }
        
        return issues.reduce((acc, issue) => {
            acc[issue.state] = (acc[issue.state] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Группирует задачи по датам создания
     * @param {Array} issues - массив задач для группировки (опционально, если не передан использует this.issues)
     * @returns {Object} объект, где ключи - даты в формате ISO, значения - задачи
     */
    groupIssuesByDate(issues = this.issues) {
        // Copy array
        const sortedIssues = [...issues];

        sortedIssues.sort((a, b) => new Date(a.created) - new Date(b.created));
        return sortedIssues.reduce((acc, issue) => {
            // Validate date
            try {
                const date = new Date(issue.created);
                if (isNaN(date.getTime())) {
                    console.warn('⚠️ [StatisticManager] Invalid date found:', issue.created, 'for issue:', issue.id);
                    return acc;
                }
                
                // Format YYYY-MM-DD
                const isoDate = date.toISOString().split('T')[0];
                
                // New date
                if (!acc[isoDate]) {
                    acc[isoDate] = [];
                }
                
                // Добавляем задачу в соответствующий массив
                acc[isoDate].push(issue);
            } catch (error) {
                console.warn('⚠️ [StatisticManager] Error processing date for issue:', issue.id, error);
            }
            
            return acc;
        }, {});
    }

    /**
     * Получает статистику задач за указанный период
     * @param {number} days - количество дней для анализа
     * @param {Array} issues - массив задач (опционально)
     * @returns {Object} сгруппированные задачи за указанный период
     */
    static getStatisticsByPeriod(days, issues = this.issues) {
        const now = new Date();
        const startDate = new Date(now.setDate(now.getDate() - days));
        
        // Фильтруем задачи за указанный период
        const filteredIssues = issues.filter(issue => {
            try {
                const issueDate = new Date(issue.created);
                if (isNaN(issueDate.getTime())) {
                    console.warn('⚠️ Invalid date found:', issue.created, 'for issue:', issue.id);
                    return false;
                }
                return issueDate >= startDate;
            } catch (error) {
                console.warn('⚠️ Error processing date for issue:', issue.id, error);
                return false;
            }
        });
        
        return this.groupIssuesByDate(filteredIssues);
    }

    /**
     * Получает общую статистику по задачам
     * @param {Array} issues - массив задач (опционально)
     * @returns {Object} объект с различными статистическими данными
     */
    static getStatistics(issues = this.issues) {
        const total = issues.length;
        const unresolved = issues.filter(issue => issue.status !== 'resolved').length;
        const closed = issues.filter(issue => issue.status === 'resolved').length;
        
        // Считаем просроченные задачи (если есть slaDate и она меньше текущей даты)
        const overdue = issues.filter(issue => {
            if (!issue.slaDate || issue.status === 'resolved') return false;
            return new Date(issue.slaDate) < new Date();
        }).length;

        // Группируем по приоритетам
        const byPriority = this.issues.reduce((acc, issue) => {
            const priority = issue.priority || 'none';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {});

        // Группируем по статусам
        const byStatus = this.issues.reduce((acc, issue) => {
            const status = issue.status || 'none';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Группируем по командам
        const byTeam = this.issues.reduce((acc, issue) => {
            const team = issue.team || 'none';
            acc[team] = (acc[team] || 0) + 1;
            return acc;
        }, {});

        // Статистика по времени закрытия (в днях)
        const closingTimes = this.issues
            .filter(issue => issue.status === 'resolved')
            .map(issue => {
                const created = new Date(issue.created);
                const resolved = new Date(issue.resolved);
                return Math.ceil((resolved - created) / (1000 * 60 * 60 * 24)); // в днях
            });

        const avgClosingTime = closingTimes.length 
            ? closingTimes.reduce((sum, time) => sum + time, 0) / closingTimes.length 
            : 0;

        // Получаем статистику по периодам
        const last30Days = this.getStatisticsByPeriod(30);
        const last90Days = this.getStatisticsByPeriod(90);

        return {
            total,
            open: unresolved,
            closed,
            overdue,
            byPriority,
            byStatus,
            byTeam,
            avgClosingTime,
            trends: {
                last30Days,
                last90Days
            }
        };
    }

    static indexIssues(issues) {
        const indexes = {
            byId: new Map(),
            byCreationDate: new Map(),
            byResolvedDate: new Map()
        };

        if (!Array.isArray(issues)) {
            console.warn('indexIssues: Input is not an array:', issues);
            return indexes;
        }

        issues.forEach(issue => {
            // Index by ID
            indexes.byId.set(issue.id, issue);

            // Parse dates
            const creationDate = issue.created ? new Date(issue.created).toISOString().split('T')[0] : null;
            const resolvedDate = issue.resolved ? new Date(issue.resolved).toISOString().split('T')[0] : null;

            // Index by creation date
            if (creationDate) {
                if (!indexes.byCreationDate.has(creationDate)) {
                    indexes.byCreationDate.set(creationDate, []);
                }
                indexes.byCreationDate.get(creationDate).push(issue);
            }

            // Index by resolution date
            if (resolvedDate) {
                if (!indexes.byResolvedDate.has(resolvedDate)) {
                    indexes.byResolvedDate.set(resolvedDate, []);
                }
                indexes.byResolvedDate.get(resolvedDate).push(issue);
            }
        });

        return indexes;
    }

    /**
     * Gets reports statistics for different time periods
     * @param {Array} issues - array of issues (optional)
     * @returns {Object} statistics about reports for different periods
     */
    static getReportsStatistics(issues = this.issues) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get start dates for different periods
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const startOfThreeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
        const startOfSixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);

        // Initialize statistics object
        const statistics = {
            unresolvedReports: 0,
            currentMonthReports: 0,
            lastMonthReports: 0,
            lastThreeMonthsReports: 0,
            lastSixMonthsReports: 0
        };

        issues.forEach(issue => {
            try {
                const createdDate = new Date(issue.created);
                const reports = parseInt(issue.reports) || 0;

                // Count unresolved reports
                if (issue.status !== 'resolved') {
                    statistics.unresolvedReports += reports;
                }

                // Count reports for different time periods
                if (createdDate >= startOfCurrentMonth) {
                    statistics.currentMonthReports += reports;
                }
                if (createdDate >= startOfLastMonth && createdDate < startOfCurrentMonth) {
                    statistics.lastMonthReports += reports;
                }
                if (createdDate >= startOfThreeMonthsAgo) {
                    statistics.lastThreeMonthsReports += reports;
                }
                if (createdDate >= startOfSixMonthsAgo) {
                    statistics.lastSixMonthsReports += reports;
                }
            } catch (error) {
                console.warn('⚠️ Error processing reports for issue:', issue.id, error);
            }
        });

        return statistics;
    }

    /**
     * Gets detailed reports statistics including trends
     * @param {Array} issues - array of issues (optional)
     * @returns {Object} detailed reports statistics
     */
    static getDetailedReportsStatistics(issues = this.issues) {
        const basicStats = this.getReportsStatistics(issues);
        const monthlyAverage = Math.round(basicStats.lastSixMonthsReports / 6);
        const monthlyTrend = basicStats.currentMonthReports - basicStats.lastMonthReports;

        return {
            ...basicStats,
            monthlyAverage,
            monthlyTrend,
            trendDirection: monthlyTrend > 0 ? 'up' : monthlyTrend < 0 ? 'down' : 'stable'
        };
    }
}
class ChartManager {
  constructor() {
      this.chartContainer = document.getElementById('chart-container');
      this.charts = new Map(); // Хранилище для графиков
      this.currentTheme = localStorage.getItem('theme') || 'light';
      
      // Listen for theme changes
      window.addEventListener('themeChanged', (e) => {
          this.currentTheme = e.detail.theme;
          this.updateChartsTheme();
      });
  }

  createChart(container, data, type) {
      const canvas = document.getElementById(container);
      if (!canvas) {
          return;
      }

      // Уничтожаем существующий график, если он есть
      if (this.charts.get(container)) {
          this.charts.get(container).destroy();
          this.charts.delete(container);
      }

      const chartData = this.prepareChartData(data);

      this.charts.set(container, new Chart(canvas, {
          type: 'line',
          data: chartData,
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  y: {
                      beginAtZero: true,
                      title: {
                          display: true,
                          text: 'Количество задач',
                          font: {
                              size: 14,
                              family: 'Roboto, sans-serif',
                              weight: '500'
                          },
                          color: '#666'
                      },
                      grid: {
                          display: false
                      },
                      ticks: {
                          color: '#666',
                          font: {
                              size: 12,
                              family: 'Roboto, sans-serif'
                          }
                      }
                  },
                  x: {
                      title: {
                          display: true,
                          text: 'Месяц',
                          font: {
                              size: 14,
                              family: 'Roboto, sans-serif',
                              weight: '500'
                          },
                          color: '#666'
                      },
                      grid: {
                          display: false
                      },
                      ticks: {
                          color: '#666',
                          font: {
                              size: 12,
                              family: 'Roboto, sans-serif'
                          }
                      }
                  }
              },
              plugins: {
                  title: {
                      display: true,
                    //   text: 'Статистика задач по месяцам',
                      font: {
                          size: 16,
                          family: 'Roboto, sans-serif',
                          weight: '700'
                      },
                      color: '#333'
                  },
                  tooltip: {
                      mode: 'index',
                      intersect: false,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      titleFont: {
                          size: 14,
                          family: 'Roboto, sans-serif',
                          weight: '500'
                      },
                      bodyFont: {
                          size: 12,
                          family: 'Roboto, sans-serif'
                      },
                      footerFont: {
                          size: 10,
                          family: 'Roboto, sans-serif'
                      }
                  },
                  legend: {
                      display: true,
                      labels: {
                          color: '#333',
                          font: {
                              size: 12,
                              family: 'Roboto, sans-serif'
                          }
                      }
                  }
              },
              elements: {
                  line: {
                      tension: 0.4,
                      borderWidth: 2
                  },
                  point: {
                      radius: 0,
                      borderWidth: 2,
                      backgroundColor: '#fff',
                      hoverRadius: 6,
                      hoverBorderWidth: 2
                  }
              }
          }
      }));
  }

  createTeamsBacklogChart(container, statusByMonth) {
      if (!statusByMonth) {
          return;
      }
      this.createChart(container, statusByMonth, 'type');
  }

  createBacklogLineChart(container, data) {
      if (!data) {
          return;
      }
      this.createChart(container, data, 'line');
  }

  clearCharts() {
    // Уничтожаем все графики перед очисткой
    this.charts.forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
    this.charts.clear(); // Очищаем сохраненные графики
    if (this.chartContainer) {
        this.chartContainer.innerHTML = ''; // Очищаем контейнер с графиками
    }
  }

  prepareChartData(data) {
    if (!data || typeof data !== 'object') {
      return {
        labels: [],
        datasets: []
      };
    }

    try {
      const months = Object.keys(data)
        .sort((a, b) => {
          const [yearA, monthA] = a.split('-').map(Number);
          const [yearB, monthB] = b.split('-').map(Number);
          return yearA !== yearB ? yearA - yearB : monthA - monthB;
        });
      const statuses = [ 'unresolved', 'resolved', 'rejected', 'to_be_closed','created'];
      const statusColors = {
        'resolved': 'rgba(75, 192, 192, 0.7)',
        'created': 'rgb(255, 99, 132)',
        'unresolved': 'rgb(255, 159, 64)',
        'delayed': 'rgb(153, 102, 255)',
        'rejected': '#4f4f4fbd',
      };

      const datasets = statuses.map(status => ({
        label: status === 'unresolved' ? 'бэклог' : status,
        label: status === ' resolved' ? 'исправлены' : status === 'unresolved' ? 'бэклог' : status === 'rejected' ? 'отклонены' : status === 'to_be_closed' ? 'к закрытию' : status === 'created' ? 'созданы' : status,

        data: months.map(month => data[month][status] || 0),
        borderColor: statusColors[status],
        backgroundColor: status === 'resolved' ? 'rgba(75, 192, 192, 1)' : 
        status === 'бэклог' ? '#7070702F' :
                       status === 'created' ? 'rgb(255, 99, 132)' :
                       statusColors[status],
        fill: status === 'resolved' || status === 'created' ,
        borderWidth: 2,
        tension: 0.4
      }));

      return {
        labels: months,
        datasets: datasets
      };
    } catch (error) {
      return {
        labels: [],
        datasets: []
      };
    }
  }

  updateChartsTheme() {
    this.charts.forEach(chart => {
        if (chart && chart.options) {
            chart.options.scales.x.grid.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--chart-grid-color');
            chart.options.scales.y.grid.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--chart-grid-color');
            chart.update();
        }
    });
  }
}

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
    this.refact.subscribe('clearLocalStorageData', (value) => {
      if (value === true) {
        this.clearLocalStorage();
        this.refact.setState({ dataStatus: 'empty' }, 'DataManager.clearLocalStorageData');
        this.refact.setState({ issues: null }, 'DataManager.clearLocalStorageData');
        this.refact.setState({ clearLocalStorageData: false }, 'DataManager.clearLocalStorageData');
        window.location.reload();
      }
    });
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
            let updatedCount = 0;
            loadedData.forEach(loadedItem => {
              const taskId = loadedItem['Номер дефекта'] || loadedItem['Номер драфта'];
              const existingIssue = this.refact.state.issues.find(issue => issue.id === taskId);
              if (existingIssue) {
                updatedCount++;
                existingIssue.slaDate = new Date(loadedItem['Дата наступления SLA']);
              }
            });

            if (updatedCount > 0) {
              MessageView.showMessage(
                'Обновление SLA', 
                `Обновлено ${updatedCount} дат SLA`, 
                'Обновить', 
                () => {
                  this.refact.setState({ issues: this.refact.state.issues }, 'DataManager.loadFromFile.updateSLA');
                  this.refact.setState({ dataStatus: 'loaded' }, 'DataManager.loadFromFile');
                  this.saveToLocalStorage();
                }
              );
            } else {
              MessageView.showMessage(
                'Обновление SLA', 
                'Не найдено задач для обновления SLA', 
                'Закрыть'
              );
            }
            
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
class UIManager extends EventEmitter {
  constructor(containerId = "app", theme = "light") {
    super();
    
    this.container = document.getElementById(containerId);
    this.theme = theme;
    this.applyTheme(this.theme);
    const componentsConfig = {
      "views-dropdown": { listeners: {} },
      "date-range-dropdown": { listeners: { click: this.switchTheme.bind(this) } },
      "teams-dropdown": { listeners: {} },
      "select-file-button": { listeners: {} },
      "upload-file-button": { listeners: { click: this.onUploadFileClick.bind(this) } },
      "menu-dropdown": { listeners: {} },
      "custom-file-input": { listeners: {} },
      "clear-storage": { listeners: { click: this.clearStorage.bind(this) } },
      "theme-toggle": { listeners: { click: this.switchTheme.bind(this) } },
      "chart-container": { listeners: {} },
      "teams-dropdown": { listeners: { change: this.handleTeamSelection.bind(this) } },
      "toggleChartView": { listeners: { click: this.toggleChartView.bind(this) } }
    };
    this.componentManager = new ComponentManager(componentsConfig);
    this.chartManager = new ChartManager();
    this.analyticManager = new AnalyticManager();

    this.issueTable = new IssueTable('issue-table-container');
    this.slidePanel = new SlidePanel('slide-panel');
    this.widgetsRow = new WidgetsRow('widgets-row-container');
    
    // File input component
    const onFileSelected = (file) => {
      if (file) {
        this.emit("onFileSelected", file);
      }
    };
    
    this.fileInput = new FileInputComponent('custom-file-input', onFileSelected);
    
    // Инициализируем дропдауны
    this.teamsDropdown = new TeamsDropdownComponent('teams-dropdown', 'Все команды');
    this.dateRangeDropdown = new DateRangeDropdown('date-range-dropdown', 'За всё время', null, null, this.onDateRangeChange.bind(this));
    
    this.initializeEventListeners();
    this.render();
  }

  applyTheme(theme) {
    document.body.classList.toggle("dark-theme", theme === "dark");
    document.body.classList.toggle("light-theme", theme === "light");
    this.theme = theme;
  }

  switchTheme = () => {
    const newTheme = this.theme === "dark" ? "light" : "dark";
    this.applyTheme(newTheme);
    this.emit("onThemeSwitch");
  };

  onDateRangeChange(startDate, endDate) {
    // Store dates as is - don't modify them
    this.currentDateStart = startDate;
    this.currentDateEnd = endDate;
    
    // Emit filter change event with current team and date range
    const selectedTeam = this.teamsDropdown.getSelectedTeam();
    
    const filters = {
      team: selectedTeam || 'all',
      dateStart: startDate,
      dateEnd: endDate
    };

    this.emit("onFilterChange", filters);
    
    // Перезапускаем обработку текущей выбранной команды с новым периодом
    if (selectedTeam) {
      this.handleTeamSelection(selectedTeam);
    } else {
      // Если команда не выбрана, просто обновляем графики с новым периодом
      let filteredIssues = this.issues;
      if (startDate && endDate) {
        filteredIssues = this.analyticManager.filterIssuesByDate(startDate, endDate, this.issues);
      }
      this.chartManager.updateCharts(filteredIssues);
    }
  }

  onUploadFileClick() {
    this.showView('upload-data-view');
  }

  showUploadDataView() {
    this.showView('upload-data-view');
  }

  showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
      view.style.display = 'none';
    });

    // Show requested view
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = '';
    }
  }

  clearStorage = () => this.emit("onClearLocalStorageClick");

  renderClass(className) {
    document.querySelectorAll(`.${className}`).forEach((element) => {
      switch (className) {
        case "app-dropdown":
          this.componentManager.addComponent(
            className,
            new DropdownComponent(
              element,
              ["Бэклог", "Обращения", "Календарь"],
              element.title
            )
          );
          break;
        case "app-dates-dropdown":
          this.componentManager.addComponent(
            className,
            new DatesDropdownComponent(
              element,
              new Date("2015-01-01"),
              new Date("2024-09-01")
            )
          );
          break;
        case "teams-dropdown":
          this.componentManager.addComponent(
            className,
            new TeamsDropdownComponent(element)
          );
          break;
      }
    });
  }

  applyTheme() {
    if (this.theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }

  render() {
    this.renderClass("app-dropdown");
    this.renderClass("app-dates-dropdown");
  }

  hideUploadDataView() {
    const uploadView = document.getElementById('upload-view');
    if (uploadView) {
      uploadView.style.display = 'none';
    }
  }

  showBacklogView(statistics) {
    console.log(statistics, '[UIManager] Statistics');
    
    if (!statistics) {
      log('🔴 [UI Manager] Statistics are undefined');
      return;
    }

    this.statistics = statistics;
    
    // Show loader overlay
    const loaderOverlay = document.getElementById('app-loader');
    if (loaderOverlay) {
      loaderOverlay.style.display = 'flex';
    }

    this.updateWidgets(statistics);

    try {
      // Create backlog line chart
      if (statistics.statusByMonth) {
        this.chartManager.createBacklogLineChart('backlog-chart-canvas', statistics.statusByMonth);
        this.chartManager.createTeamsBacklogChart('teams-backlog-chart-canvas', statistics.statusByMonth);
      }

      this.updateTeamsDropdown(statistics.teams);

      // Show container view
      this.showView('backlog-line-view');

      // Set visibility for charts
      const backlogChart = document.getElementById('backlog-chart-canvas');
      const teamsBacklogChart = document.getElementById('teams-backlog-chart-canvas');

      if (backlogChart) backlogChart.style.visibility = 'visible';
      if (teamsBacklogChart) teamsBacklogChart.style.visibility = 'visible';

      // Hide loader overlay after charts are loaded
      if (loaderOverlay) {
        loaderOverlay.style.display = 'none';
      }
    } catch (error) {
      log(error, 'Error on rendering view');
      // Hide loader overlay in case of error
      if (loaderOverlay) {
        loaderOverlay.style.display = 'none';
      }
    }
  }

  updateTeamsDropdown(teams) {
    this.teamsDropdown.updateTeams(teams);
  }

  updateWidgets(statistics) {
    if (!this.widgetsRow) return;

    // Считаем задачи, созданные в текущем месяце
    const startMonth = new Date(statistics.dateStart);
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);
    const endMonth = new Date(startMonth);
    endMonth.setMonth(endMonth.getMonth() + 1);
    endMonth.setDate(0);
    endMonth.setHours(23, 59, 59, 999);

    const createdInMonth = statistics.opened.filter(issue => {
      const created = new Date(issue.created);
      return created >= startMonth && created <= endMonth;
    }).length;

    // Создаем конфигурацию виджетов
    const widgets = [
      {
        // Backlog
        value: statistics.opened.length,
        label: 'Открытых дефектов',
        icon: 'src/img/layers-0.svg',
        trend: {
          direction: createdInMonth > 0 ? 'up' : 'down',
          text: `${createdInMonth} за месяц`
        },
        onClick: this.onBacklogClick,
      },
      {
        // Resolution time
        value: statistics.allTimeAverageResolution || 0,
        type: 'time',
        label: 'Среднее время исправления',
        icon: 'src/img/layers-0.svg',
        trend: {
          direction: 'neutral',
          text: 'В днях'
        }
      },
      {
        // Reports
        value: statistics.unresolvedReports || 0,
        label: 'обращений',
        icon: 'src/img/translation.svg',
        trend: {
          direction: 'neutral',
          text: '<a href="#" class="widget-link">За текущий месяц</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" class="widget-link">За всё время</a>'
        },
        onClick: this.onReportsClick.bind(this)
      }
    ];
    
    // Обновляем Widgets
    this.widgetsRow.updateWidgets(widgets);
  }

  onReportsClick() {
    const statistics = this.statistics;
    
    // Create view
    if (!this.reportsView) {
      this.reportsView = new ReportsView();
    }
    
    const view = this.reportsView.render(
      statistics.topReportedCurrentMonth,
      statistics.topReported
    );
    
    this.slidePanel.setLogo('src/img/user-speak.svg');
    this.slidePanel.setTitle('Обращения');
    this.slidePanel.updateContent(view);
    this.slidePanel.open();
  }

  updateTitle(newTitle) {
    document.title = newTitle;
  }

  initializeEventListeners() {
    document.addEventListener('teamSelected', (event) => {
      const selectedTeam = event.detail.team;
      this.handleTeamSelection(selectedTeam);
    });
  }

  handleTeamSelection(team) {
    const newLocal = this;
    // Select the current team
    newLocal.teamsDropdown.selectTeam(team);
    
    // Emit filters
    this.emit("onFilterChange", {
      team: team,
      dateStart: this.dateRangeDropdown.getDateRange().startDate,
      dateEnd: this.dateRangeDropdown.getDateRange().endDate
    });
  }

  updateChartsForTeam(team) {
    const teamData = this.analyticManager.getTeamData(team);
    const allIssues = this.analyticManager.getAllIssues();
    
    // Update backlog chart with team data
    this.chartManager.updateBacklogChart(teamData, {
      'unresolved': teamData.filter(issue => !this.analyticManager.isResolved(issue.status)).length
    });
    
    // Update teams chart with ALL issues
    this.chartManager.updateTeamsChart(allIssues, {
      'unresolved': allIssues.filter(issue => !this.analyticManager.isResolved(issue.status)).length
    });
    
    // Обновляем dropdown
    this.teamsDropdown.selectTeam(team);
  }

  updateChartsForAllTeams() {
    const allIssues = this.analyticManager.getAllIssues();
    this.chartManager.updateCharts(allIssues, {
      'unresolved': allIssues.filter(issue => !this.analyticManager.isResolved(issue.status)).length
    });
  }

  toggleChartView() {
    const teamsChartCanvas = document.getElementById('teams-backlog-chart-canvas');
    const backlogChartCanvas = document.getElementById('backlog-chart-canvas');
    
    if (teamsChartCanvas && backlogChartCanvas) {
      if (teamsChartCanvas.style.display === 'none') {
        teamsChartCanvas.style.display = 'block';
        backlogChartCanvas.style.display = 'none';
      } else {
        teamsChartCanvas.style.display = 'none';
        backlogChartCanvas.style.display = 'block';
      }
    }
  }

  onDateRangeChange(startDate, endDate) {
    this.emit("onFilterChange", {
      team: this.teamsDropdown.getSelectedTeam(),
      dateStart: startDate,
      dateEnd: endDate
    });
  }

}

class App {
    constructor(container) {
        this.container = container;
        this.refact = new Refact(container);
        this.init();
    }

    // Default config
    defaultConfig = {
        mode: "prod",
        dataPrefix: "defect-manager",
        theme: "light",
        filters : {
            dateStart: new Date('2021-01-01').toISOString(),
            dateEnd: new Date().toISOString(),
            team: 'all'
        }
    };

    init() {
        try {
            if (!this.container)
                throw new Error(`App: Parent container not found.`);

            this.config = new ConfigManager(this.defaultConfig);
            this.config.loadConfigFromLocalStorage();

            this.setupStates();
            this.setupManagers();
            this.setupEventListeners();

            this.dataManager.loadFromLocalStorage(this.config.config.dataPrefix);

            this.refact.setState({ appStatus: 'initialized' });
            console.log('[App] Initialized');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    setupStates() {            
        this.refact.setState({
            config: this.config.config,
            filters: this.config.config.filters,
            view: null,
            statistics: null,
            appStatus: 'initializing',
        });
    }

    setupManagers() {
        this.viewController = new ViewController(this.container);
        this.dataManager = new DataManager(this.config.config.dataPrefix);
        this.statisticManager = new StatisticManager();
        this.reportsManager = new ReportManager();
        this.dataTransformer = new DataTransformer();
    }

    setupEventListeners() {
        // Issues
        this.refact.subscribe('dataStatus', (status) => {
            if (status === 'error') {
                MessageView.showMessage('Ошибка', this.dataManager.lastError || 'Произошла ошибка при загрузке данных', 'OK', () => {
                    this.viewController.showView('dashboard');
                });
                return;
            }

            if (status === 'empty') {
                this.viewController.showView('empty');
                return;
            }

            if (status === 'loaded') {
                this.viewController.showView('dashboard');
                // Get issues from data manager
            const issues = this.dataManager.getIssues();
            if (!issues || !issues.length) return;

            // Transform and update state
            const transformedIssues = issues.map(issue => this.dataTransformer.objectToIssue(issue));
            this.refact.setState({ issues: transformedIssues }, 'App - issues');
            
            // Calculate and update statistics
            const statistics = StatisticManager.getFullStatistics(transformedIssues);
            console.log('📦 Statistics:', statistics);
            this.refact.setState({ statistics }, 'App - statistics');

            // Show dashboard
            this.viewController.showView('dashboard');     

                return;
            }
        });

        // Filters
        this.refact.subscribe('filters', (filters) => {
            this.config.config.filters = filters;
            this.config.saveConfigToLocalStorage();
            this.dataManager.loadFromLocalStorage(this.config.config.dataPrefix);
        });
    }

    showDashboard() {
        if (!this.dashboardView) {
            this.dashboardView = new DashboardView();
        }
        this.refact.setState({ currentView: 'dashboard' });
        this.layoutView.setContent(this.dashboardView.getContainer());
    }

    showUploadView() {
        if (!this.uploadView) {
            this.uploadView = new UploadView();
        }
        this.refact.setState({ currentView: 'upload' });
        this.layoutView.setContent(this.uploadView.getContainer());
    }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
    const app = new App(document.getElementById('app'));
});

