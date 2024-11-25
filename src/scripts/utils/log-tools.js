function logStyled(data, style) {
  // console.log(`%c${data}`, style);
}

// Логирование с описанием и вызовом из конкретной функции
function log(data, description) {
  const dataType = typeof data;
  const functionName = getCallingFunction();

  // Логирование метаданных
  // logStyled(`${functionName} (...) | type: ${dataType}`, 'color: silver');

  // Логирование описания
  if (description) {
    // logStyled(`${description}:`, 'font-weight: bold; font-size: 1em; color: lightgreen');
  }

  // Логирование данных
  if (dataType === "string") {
    // logStyled(data, 'color: orange; font-weight: 800; font-size: 1em');
  } else {
    // console.log(data);
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
