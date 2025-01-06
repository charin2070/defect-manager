function logStyled(data, style) {
  // Check is data not contains special characters
  if (!/[^a-zA-Z0-9\s]/.test(data)) {
    console.log(`%c${data}`, style);
    return;
  }

  console.log(`%c${data}`, style);
}

function isSafeString(data) {
  return typeof data === 'string' && !/[^a-zA-Z0-9\s]/.test(data);
}

function log(data, description) {
  const dataType = typeof data;
  const functionName = getCallingFunction();

  // Log metadata
  if (isSafeString(data)) { 
    logStyled(`${functionName} (...) | type: ${dataType}`, 'color: silver');
  } else {
    console.log(data);
  }

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

}
  // Get calling function name
  function getCallingFunction() {
    let error = new Error();
    let stack = error.stack.split("\n");
    return stack[3]?.split("at ")[1]?.split(" ")[0] || "Unknown";
  }



class ConsoleToast extends HtmlComponent {
  constructor() {
    super();
    this.setupContainer();
    this.errorToast = new ErrorToast(this);
    this.logToast = new LogToast(this);
    this.toastContainer.append(this.errorToast.element, this.logToast.element);
    this.overrideConsoleMethods();
  }
}