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