function logStyled(data, style) {
  console.log(`%c${data}`, style);
}

function log(data, description) {
  const dataType = typeof data;
  const functionName = getCallingFunction();

  // Log metadata
  logStyled(`${functionName} (...) | type: ${dataType}`, 'color: silver');

  // Log description
  if (description) {
    const cssStyles = getComputedStyle(document.body).getPropertyValue('--console-important-log');
    logStyled(`${description}:`, cssStyles);
  }

  // Log data
  if (dataType === "string") {
    logStyled(data, 'color: orange; font-weight: 800; font-size: 1em');
  } else {
    console.log(data);
  }

  // Get calling function name
  function getCallingFunction() {
    let error = new Error();
    let stack = error.stack.split("\n");
    return stack[3]?.split("at ")[1]?.split(" ")[0] || "Unknown";
  }
}

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

function subscribeForConsole(refact) {
  const consoleMethods = ['error', 'warn'];
  const pendingMessages = [];
  let isProcessing = false;

  function processMessages() {
    if (isProcessing || pendingMessages.length === 0) return;
    
    isProcessing = true;
    const { message, type } = pendingMessages.shift();
    
    try {
      refact.setState({ 
        toast: { message, type, duration: 5000 } 
      }, 'console.' + type);
    } finally {
      isProcessing = false;
      if (pendingMessages.length > 0) {
        setTimeout(processMessages, 100);
      }
    }
  }

  consoleMethods.forEach(method => {
    const original = console[method];
    console[method] = (...args) => {
      original.apply(console, args);
      
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (message.includes('Данные не найдены') || 
          message.includes('No data found') ||
          message.includes('Preventing recursive')) {
        return;
      }
      
      pendingMessages.push({
        message,
        type: method === 'error' ? 'error' : 'warning'
      });
      
      processMessages();
    };
  });

  window.addEventListener('error', event => {
    const message = `Error: ${event.message}`;
    pendingMessages.push({ message, type: 'error' });
    processMessages();
  });

  window.addEventListener('unhandledrejection', event => {
    const message = `Unhandled error: ${event.reason}`;
    pendingMessages.push({ message, type: 'error' });
    processMessages();
  });
}