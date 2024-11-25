// Date utils for Date objects

// Returns a Date object from '20024-11-08', '2024.11.08 17:14' etc. formats
function stringToDate(dateString) {
    if (!dateString || (typeof dateString !== "string" && typeof dateString !== "date") || dateString.length <= 7)
      return null;

    let dateParts = dateString.split(/[-. ]+/); // Разделяем строку на части по нескольким разделителям
    if (dateParts.length < 3) return null; // Если меньше 3 частей, то дата невалидна

    let day = parseInt(dateParts[0], 10);
    let month = parseInt(dateParts[1], 10) - 1; // месяц 0-based
    let year = parseInt(dateParts[2], 10);

    let date = new Date(year, month, day);
    return date;
  }
