function logStyled(data, style) {
  console.log(`%c${data}`, style);
}

function isSafeString(data) {
  return typeof data === 'string' && !/[^a-zA-Z0-9\s]/.test(data);
}

function log(data, description) {
  const dataType = typeof data;
  const functionName = getCallingFunction();

  // Log metadata and description in one line if present
  const metaText = description 
    ? `${functionName} | ${description}`
    : functionName;
    
  logStyled(metaText, 'color: #666');

  // Log data only once with appropriate styling
  if (dataType === "string") {
    logStyled(data, 'color: #f4a261; font-weight: 600');
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