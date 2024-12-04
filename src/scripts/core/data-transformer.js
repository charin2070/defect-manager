/**
 * DataTransformer class provides methods for transforming issue data into various formats
 * suitable for different visualization needs.
 */
class DataTransformer {
  /**
   * Creates a linear dataset from issues array
   * @param {Array} issues - Array of issue objects
   * @param {Object} options - Configuration options
   * @param {string} options.dateField - Field to use for X-axis (e.g., 'created', 'resolved')
   * @param {string} options.groupBy - Field to group by (e.g., 'team', 'status')
   * @param {string} options.aggregation - Type of aggregation ('count', 'sum')
   * @param {string} [options.valueField] - Field to aggregate (required if aggregation is 'sum')
   * @returns {Object} Dataset suitable for linear charts
   */

  getStateByStatus(status) {
    switch(status) {
      case 'Закрыт':
        return 'resolved';
      case 'Отклонен':
        return 'rejected';
      default:
        return 'unresolved'; 
    }
  }

  objectToIssue( object ) {
    const issue = {};
    Object.keys(object).forEach(key => {
      issue[key] = object[key];
    });

    issue.state = DataTransformer.getStateByStatus(issue.status);
    issue.isOverdue = DataTransformer.isOverdue(issue);
    
    return issue;
  }

  // Is SLA ovedue
  static isOverdue(issue) {
    if (issue.state === 'unresolved')
      return false;

    const today = new Date();
    const dueDate = new Date(issue.slaDate);

    return today > dueDate;
  }

  static getLinearDataset(issues, options = {}) {
    const {
      dateField = 'created',
      groupBy = 'team',
      aggregation = 'count',
      valueField
    } = options;

    // Validate inputs
    if (!Array.isArray(issues)) {
      throw new Error('Issues must be an array');
    }
    if (aggregation === 'sum' && !valueField) {
      throw new Error('valueField is required when aggregation is "sum"');
    }

    // Group issues by date and specified groupBy field
    const groupedData = new Map();

    issues.forEach(issue => {
      const date = issue[dateField];
      if (!date) return;

      const dateStr = date instanceof Date ? 
        date.toISOString().split('T')[0] : 
        new Date(date).toISOString().split('T')[0];
      
      const groupValue = issue[groupBy] || 'Unknown';

      if (!groupedData.has(dateStr)) {
        groupedData.set(dateStr, new Map());
      }
      
      const dateGroup = groupedData.get(dateStr);
      if (!dateGroup.has(groupValue)) {
        dateGroup.set(groupValue, []);
      }
      
      dateGroup.get(groupValue).push(issue);
    });

    // Convert grouped data to dataset format
    const dataset = {
      labels: [],
      datasets: new Map()
    };

    // Sort dates
    const sortedDates = Array.from(groupedData.keys()).sort();
    dataset.labels = sortedDates;

    // Process each group
    for (const [date, groupMap] of groupedData) {
      for (const [groupValue, groupIssues] of groupMap) {
        if (!dataset.datasets.has(groupValue)) {
          dataset.datasets.set(groupValue, {
            label: groupValue,
            data: new Array(sortedDates.length).fill(0)
          });
        }

        const dateIndex = sortedDates.indexOf(date);
        const value = aggregation === 'count' ? 
          groupIssues.length : 
          groupIssues.reduce((sum, issue) => sum + (issue[valueField] || 0), 0);

        dataset.datasets.get(groupValue).data[dateIndex] = value;
      }
    }

    // Convert datasets Map to Array
    dataset.datasets = Array.from(dataset.datasets.values());

    return dataset;
  }

  /**
   * Creates a pie chart dataset from issues array
   * @param {Array} issues - Array of issue objects
   * @param {Object} options - Configuration options
   * @param {string} options.groupBy - Field to group by (e.g., 'team', 'status')
   * @param {string} options.aggregation - Type of aggregation ('count', 'sum')
   * @param {string} [options.valueField] - Field to aggregate (required if aggregation is 'sum')
   * @returns {Object} Dataset suitable for pie charts
   */
  static getPieDataset(issues, options = {}) {
    const {
      groupBy = 'team',
      aggregation = 'count',
      valueField
    } = options;

    // Validate inputs
    if (!Array.isArray(issues)) {
      throw new Error('Issues must be an array');
    }
    if (aggregation === 'sum' && !valueField) {
      throw new Error('valueField is required when aggregation is "sum"');
    }

    // Group issues by the specified field
    const groupedData = new Map();

    issues.forEach(issue => {
      const groupValue = issue[groupBy] || 'Unknown';
      
      if (!groupedData.has(groupValue)) {
        groupedData.set(groupValue, []);
      }
      
      groupedData.get(groupValue).push(issue);
    });

    // Convert to dataset format
    const dataset = {
      labels: [],
      data: []
    };

    for (const [groupValue, groupIssues] of groupedData) {
      dataset.labels.push(groupValue);
      
      const value = aggregation === 'count' ? 
        groupIssues.length : 
        groupIssues.reduce((sum, issue) => sum + (issue[valueField] || 0), 0);
      
      dataset.data.push(value);
    }

    return dataset;
  }

  /**
   * Creates a table dataset from issues array
   * @param {Array} issues - Array of issue objects
   * @param {Array} columns - Array of column configurations
   * @returns {Object} Dataset suitable for tables
   */
  static getTableDataset(issues, columns) {
    if (!Array.isArray(issues)) {
      throw new Error('Issues must be an array');
    }
    if (!Array.isArray(columns)) {
      throw new Error('Columns must be an array');
    }

    return {
      headers: columns.map(col => col.header),
      rows: issues.map(issue => 
        columns.map(col => {
          const value = issue[col.field];
          if (col.formatter) {
            return col.formatter(value);
          }
          return value;
        })
      )
    };
  }
}




// class DataTransformer {
//     /**
//      * Преобразует задачи в датасет для линейного графика.
//      * @param {Array} issues - Массив задач, каждая задача - объект с полями `date` и `value`.
//      * @returns {Object} Датасет для линейного графика.
//      */
//     getLinearDataset(issues) {
//       const labels = issues.map(issue => issue.date);
//       const data = issues.map(issue => issue.value);

//       return {
//           labels, // Метки (даты)
//           datasets: [
//               {
//                   label: 'Dataset', // Название набора данных
//                   data, // Значения
//                   fill: false, // График не закрашен
//                   borderColor: 'blue', // Цвет линии
//                   tension: 0.1 // Сглаживание
//               }
//           ]
//       };
//   }

//   /**
//    * Преобразует задачи в датасет для круговой диаграммы.
//    * @param {Array} issues - Массив задач, каждая задача - объект с полями `category` и `value`.
//    * @returns {Object} Датасет для круговой диаграммы.
//    */
//   getPieDataset(issues) {
//       const labels = Array.from(new Set(issues.map(issue => issue.category)));
//       const data = labels.map(label =>
//           issues.filter(issue => issue.category === label)
//               .reduce((sum, issue) => sum + issue.value, 0)
//       );

//       return {
//           labels, // Метки (категории)
//           datasets: [
//               {
//                   data, // Значения
//                   backgroundColor: labels.map(() => this.getRandomColor()) // Случайные цвета
//               }
//           ]
//       };
//   }

//   /**
//    * Преобразует задачи в датасет для столбчатой диаграммы.
//    * @param {Array} issues - Массив задач, каждая задача - объект с полями `date` и `category` и `value`.
//    * @returns {Object} Датасет для столбчатой диаграммы.
//    */
//   getBarDataset(issues) {
//       const dates = Array.from(new Set(issues.map(issue => issue.date)));
//       const categories = Array.from(new Set(issues.map(issue => issue.category)));

//       const datasets = categories.map(category => {
//           const data = dates.map(date =>
//               issues.filter(issue => issue.date === date && issue.category === category)
//                   .reduce((sum, issue) => sum + issue.value, 0)
//           );
//           return {
//               label: category,
//               data,
//               backgroundColor: this.getRandomColor()
//           };
//       });

//       return {
//           labels: dates, // Метки (даты)
//           datasets // Наборы данных по категориям
//       };
//   }

//   /**
//    * Генерирует случайный цвет в формате RGBA.
//    * @returns {String} Цвет в формате RGBA.
//    */
//   getRandomColor() {
//       const r = Math.floor(Math.random() * 256);
//       const g = Math.floor(Math.random() * 256);
//       const b = Math.floor(Math.random() * 256);
//       const a = 0.5;
//       return `rgba(${r}, ${g}, ${b}, ${a})`;
//   }
// }

// // Пример использования
// const transformer = new DataTransformer();

// const issues = [
//   { date: '2024-01-01', category: 'UI', value: 5 },
//   { date: '2024-01-01', category: 'Backend', value: 8 },
//   { date: '2024-01-02', category: 'UI', value: 3 },
//   { date: '2024-01-02', category: 'Backend', value: 7 },
//   { date: '2024-01-02', category: 'API', value: 4 }
// ];

// console.log(transformer.getLinearDataset(issues));
// console.log(transformer.getPieDataset(issues));
// console.log(transformer.getBarDataset(issues));

