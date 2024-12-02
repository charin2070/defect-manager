class ReportManager {
  constructor() {
    this.months = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];
  }
  
  // Mapping of product areas
  productAreas = {
    "Портфель": ["портфел", "позици"],
    "Рынок": ["рынок", "торг", "котировк"],
    "Заявки": ["заявк", "поручен"],
    "Витрины, новости, аналитика": ["витрин", "новост", "аналитик"],
    "Терминалы": ["терминал"]
  };

  /**
   * Groups issues by product area based on keywords
   * @param {Array} issues - Array of issues
   * @returns {Object} Grouped issues by area
   */
  groupIssuesByProductArea(issues) {
    if (!issues || !issues.length) {
      return {};
    }

    const groups = {};
    let otherCount = 0;

    issues.forEach(issue => {
      if (!issue.summary) return;
      
      let found = false;
      const summary = issue.summary.toLowerCase();

      for (const [area, keywords] of Object.entries(this.productAreas)) {
        if (keywords.some(keyword => summary.includes(keyword))) {
          groups[area] = groups[area] || [];
          groups[area].push(issue);
          found = true;
          break;
        }
      }

      if (!found) {
        groups['Прочее'] = groups['Прочее'] || [];
        groups['Прочее'].push(issue);
      }
    });

    return groups;
  }

  /**
   * Sorts issue groups by number of issues
   * @param {Object} groups - Grouped issues
   * @returns {Array} Sorted groups with counts
   */
  sortIssueGroups(groups) {
    return Object.entries(groups)
      .map(([area, issues]) => ({
        area,
        count: issues.length,
        issues
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Converts critical issues to text format
   * @param {Array} issues - Array of critical issues
   * @returns {Array} Array of text descriptions
   */
  formatCriticalIssues(issues) {
    if (!issues || !issues.length) return [];
    
    return issues.map(issue => ({
      taskId: issue.id,
      description: issue.summary,
      status: issue.status,
      priority: issue.priority,
      isTextOnly: true
    }));
  }

  /**
   * Finds critical issues from the list
   * @param {Array} issues - Array of issues
   * @returns {Array} Critical issues in text format
   */
  findCriticalIssues(issues) {
    if (!issues || !issues.length) return [];
    
    const criticalIssues = issues.filter(issue => 
      issue.priority === "Highest" || 
      issue.priority === "Critical" ||
      issue.priority === "Blocker"
    );

    return this.formatCriticalIssues(criticalIssues);
  }

  /**
   * Generates a report about unresolved issues with the highest number of reports
   * @param {Array} issues - Array of issue objects
   * @returns {string} Formatted report text
   */
  getWeeklyReportsReport(issues) {
    if (!issues || !issues.length) {
      return "Issue list is empty. Нет данных для формирования отчёта";
    }

    let report = { "Отчёт по неделям:": 'есть', 'Дефекты с критическим влиянием': '300' };
    log(report, " ReportManager.getWeeklyReportsReport - Report generated...");
    // Start with total counts
    // let report = "Общая статистика:\n";
    // report += `Всего задач: ${issues.length}\n`;
    // report += `Открытых задач: ${unresolvedIssues.length}\n`;
    // report += `Процент решенных: ${Math.round((issues.length - unresolvedIssues.length) / issues.length * 100)}%\n`;

    // // Group issues by product area
    // const issueGroups = this.groupIssuesByProductArea(unresolvedIssues);
    // const sortedGroups = this.sortIssueGroups(issueGroups);

    // // Generate distribution section
    // report += "\nРаспределение проблематики:\n";
    // sortedGroups.forEach(({area, count}) => {
    //   report += `${area}: ${count}\n`;
    // });

    // // Find and add critical issues
    // const criticalIssues = this.findCriticalIssues(unresolvedIssues);
    // if (criticalIssues.length > 0) {
    //   report += "\nДефекты с критическим влиянием\n";
    //   criticalIssues.forEach(issue => {
    //     report += `${issue.taskId}: ${issue.description} (${issue.priority.toLowerCase()})\n`;
    //   });
    // }

    return report;
  }

  /**
   * Gets report statistics as an object for easier manipulation in the UI
   * @param {Array} issues - Array of issue objects
   * @returns {Object} Report statistics object
   */
  getReportStatistics(issues) {
    if (!issues || !issues.length) {
      return {
        totalIssues: 0,
        openIssues: 0,
        resolvedPercentage: 0,
        distribution: [],
        criticalIssues: []
      };
    }

    // Filter only unresolved issues
    const unresolvedIssues = issues.filter(issue => 
      issue.status !== "resolved" && 
      issue.status !== "closed" &&
      issue.status !== "rejected"
    );

    // Calculate percentages
    const totalIssues = issues.length;
    const openIssues = unresolvedIssues.length;
    const resolvedPercentage = Math.round((totalIssues - openIssues) / totalIssues * 100);

    // Group and sort issues
    const issueGroups = this.groupIssuesByProductArea(unresolvedIssues);
    const sortedGroups = this.sortIssueGroups(issueGroups);
    
    // Format critical issues for the IssueTable
    const criticalIssues = this.findCriticalIssues(unresolvedIssues);

    return {
      totalIssues,
      openIssues,
      resolvedPercentage,
      distribution: sortedGroups,
      criticalIssues
    };
  }
  
  getMvpReport(teams, issues) {
    // "Всего открыто" = количеству unresolved задач из массива issues
    // "Всего закрыто" = количеству resolved задач из массива issues
    // "Обращений по ним (с даты создания)" = количеству reports на unresolved задачах команды
    // "Заакрыто за пред.мес" = задачи из массива issues, у которых дата resolved находится в пределах прошлого месяца.
    // "Новых за пред.мес" = задачи из массива issues, у которых дата created находится в пределах 30 дней от 
    // "Отклонено за пред. мес." = задачи со статусом "Отклонен" и датой resolved находящейся в пределах проошлого месяца

    // "Ср.время закрытия(дни)" = среднее количество дней между открытием и решением задачи.  
    
    const defectSummary = teams.map(team => {
      const teamIssues = issues.filter(issue => issue.team === team);
      const totalOpen = teamIssues.filter(issue => issue.status !== 'resolved').length;
      
      //  "ТОП-5 закрытых по количеству обращений" = Задачи, чей статус = "Закрыт" и чья дата resolution не позднее чем 90 дней от текущей даты.
      // "ТОП-5 новых" = Задачи, чья дата "created" (дата создания) не ранее чем 90 дней от текущей даты.
      const totalClosed= teamIssues.filter(issue => issue.status === 'resolved').length;
      const avgCloseTime = this.calculateAverageCloseTime(teamIssues);
      const totalReports = teamIssues.reduce((sum, issue) => sum + (issue.reports || 0), 0);

      const  tableData = {
      team,
        totalOpen,
        totalClosed,
        totalReports,
        closedLastMonth: this.countIssuesInLastDays(teamIssues, 'resolved', 30),
        newLastMonth: this.countIssuesInLastDays(teamIssues, 'new', 30),
        rejectedLastMonth: this.countIssuesInLastDays(teamIssues, 'rejected', 30),
        avgCloseTime,
      };

      return tableData;        
    });



    // Для того чтобы текст вставлялся в Confluence как таблица, нужно форматировать его в табличный вид с использованием символов табуляции (\t) для разделения колонок и символов новой строки (\n) для разделения строк. Затем этот формат можно скопировать в буфер обмена с использованием API Clipboard.
    // Заголовки таблицы: "Команда", "Всего открыто", "Всего закрыто", "Обращений по ним (с даты создания)", "Закрыто за пред. мес. (Т-30)", "Новых за пред. мес.", "Отклонено за пред. мес.", "Ср.время закрытия(дни)" 

    const topNewIssues = this.getTopIssues(issues, 'new', 90);
    const topClosedIssues = this.getTopIssues(issues, 'resolved', 90);

    
console.log(tableData)
    return {
      defectSummary,
      topNewIssues,
      topClosedIssues,

    };
  }

  countIssuesInLastDays(issues, status, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return issues.filter(issue => {
      const issueDate = new Date(issue.created);
      return issue.status === status && issueDate >= cutoffDate;
    }).length;
  }

  calculateAverageCloseTime(issues) {
    const closedIssues = issues.filter(issue => issue.status === 'resolved' && issue.resolved);
    const totalCloseTime = closedIssues.reduce((sum, issue) => {
      const openDate = new Date(issue.created);
      const closeDate = new Date(issue.resolved);
      return sum + (closeDate - openDate);
    }, 0);

    return closedIssues.length ? Math.round(totalCloseTime / closedIssues.length / (1000 * 60 * 60 * 24)) : '-';
  }

  getTopIssues(issues, status, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredIssues = issues.filter(issue => {
      const issueDate = new Date(issue.created);
      return issue.status === status && issueDate >= cutoffDate;
    });

    return filteredIssues.slice(0, 5).map(issue => ({
      defect: issue.summary,
      team: issue.team,
      registered: issue.created,
      status: issue.status,
      reports: issue.reports || '-',
    }));
  }

  
  
}
