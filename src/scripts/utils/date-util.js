
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

function isInCurrentMonth(date) {
  const curr = new Date();

  if (date.getMonth() === curr.getMonth() && date.getFullYear() === curr.getFullYear()) {
    return true;
  }
  return false;
}

function getDateRange(condition) {
  if (typeof condition === 'string') {
    // Process condiion format 'current_month', 'last_month', current_year', 'last_year'
    if (condition === 'current_month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { dateStart: startOfMonth, dateEnd: endOfMonth };
    }

    if (condition === 'last_month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return { dateStart: startOfMonth, dateEnd: endOfMonth };
    }

    if (condition === 'current_year') {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      return { dateStart: startOfYear, dateEnd: endOfYear };
    }

    if (condition === 'last_year') {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfYear = new Date(now.getFullYear() - 1, 11, 31);
      return { dateStart: startOfYear, dateEnd: endOfYear };    
    }

    if (condition === 'all_time') {
       // From 2021 to now
      const startOfYear = new Date(2021, 0, 1);
      const endOfYear = new Date();
      return { dateStart: startOfYear, dateEnd: endOfYear };
    }

    // If condition is a number, assume it's the number of days ago
    if (!isNaN(parseInt(condition))) {
      const now = new Date();
      const start = new Date(now.getTime() - condition * 24 * 60 * 60 * 1000);
      return { dateStart: start, dateEnd: now };
    }
  }

  if (typeof condition === 'object' && condition.startDate && condition.endDate) {
    if (condition.startDate instanceof Date && condition.endDate instanceof Date) {
      return { dateStart: condition.startDate, dateEnd: condition.endDate };
    }
  }

}