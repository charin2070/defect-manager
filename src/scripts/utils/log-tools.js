function logStyled(data, style) {
  console.log(`%c${data}`, style);
}

function isSafeString(data) {
  return typeof data === 'string' && !/[^a-zA-Z0-9\s]/.test(data);
}

function log(data, description) {
  if (isSafeString(data)) {
    logStyled(data, 'color: #FF0000');
  } else {
    console.log(data);
  } 
}