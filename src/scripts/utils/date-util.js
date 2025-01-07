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

function isInDateRange(date, dateRange) {
  if (!date || !dateRange || !dateRange.dateStart || !dateRange.dateEnd) {
    console.warn('[isInDateRange] Invalid input:', { date, dateRange });
    return false;
  }

  const parsedDate = date instanceof Date ? date : stringToDate(date);
  const dateStart = dateRange.dateStart instanceof Date ? dateRange.dateStart : stringToDate(dateRange.dateStart);
  const dateEnd = dateRange.dateEnd instanceof Date ? dateRange.dateEnd : stringToDate(dateRange.dateEnd);

  if (!parsedDate || !dateStart || !dateEnd) {
    console.warn('[isInDateRange] Failed to parse dates:', { 
      parsedDate, 
      dateStart, 
      dateEnd, 
      originalDate: date,
      originalRange: dateRange 
    });
    return false;
  }

  // console.log('[isInDateRange] Comparing dates:', {
  //   date: parsedDate.toISOString(),
  //   start: dateStart.toISOString(),
  //   end: dateEnd.toISOString()
  // });

  return parsedDate >= dateStart && parsedDate <= dateEnd;
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
    // '2007' format
    if (/^\d+$/.test(condition) && condition.length === 4) {
      const year = parseInt(condition);
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      return { dateStart: startOfYear, dateEnd: endOfYear };
    }

    // 'current_month' format
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);  
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    switch (condition) {
      case 'current_month':
        return { dateStart: startOfMonth, dateEnd: endOfMonth };
      case 'last_month':
        return { dateStart: startOfMonth, dateEnd: endOfMonth };
      case 'current_year':
        return { dateStart: startOfYear, dateEnd: endOfYear };
    }
  }
}