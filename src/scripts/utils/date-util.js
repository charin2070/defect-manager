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


