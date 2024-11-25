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
