class StatisticManager {
    constructor(issues = []) {
      this.issues = issues;
    }
  
    // === Группировка задач ===
    groupBy(key) {
      return this.issues.reduce((acc, issue) => {
        const groupKey = issue[key] || 'Unknown';
        acc[groupKey] = acc[groupKey] || [];
        acc[groupKey].push(issue);
        return acc;
      }, {});
    }
  
    // === Счетчики ===
    getCountsBy(key) {
      return this.issues.reduce((acc, issue) => {
        const groupKey = issue[key] || 'Unknown';
        acc[groupKey] = (acc[groupKey] || 0) + 1;
        return acc;
      }, {});
    }
  
    // === Среднее время решения задачи (в днях) ===
    calculateAverageResolutionTime() {
      const resolutionTimes = this.issues
        .filter(issue => issue.resolved)
        .map(issue => {
          const created = new Date(issue.created);
          const resolved = new Date(issue.resolved);
          return (resolved - created) / (1000 * 60 * 60 * 24);
        });
  
      if (!resolutionTimes.length) return 0;
      return Math.round(resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length);
    }
  
    // === Прогнозы ===
    predictResolutionDates() {
      const avgTime = this.calculateAverageResolutionTime();
      const now = new Date();
      return this.issues
        .filter(issue => !issue.resolved)
        .map(issue => {
          const created = new Date(issue.created);
          const predictedDate = new Date(created.getTime() + avgTime * 24 * 60 * 60 * 1000);
          return { id: issue.id, predictedResolutionDate: predictedDate.toISOString() };
        });
    }
  
    // === Тренды по времени ===
    trendAnalysisByMonth() {
      const monthlyTrends = this.issues.reduce((acc, issue) => {
        const month = new Date(issue.created).toISOString().slice(0, 7); // YYYY-MM
        acc[month] = acc[month] || { created: 0, resolved: 0 };
        acc[month].created += 1;
        if (issue.resolved) acc[month].resolved += 1;
        return acc;
      }, {});
      return monthlyTrends;
    }
  
    // === Влияние жалоб ===
    analyzeReports() {
      const reportIssues = this.issues.filter(issue => issue.reports > 0);
      const totalReports = reportIssues.reduce((sum, issue) => sum + issue.reports, 0);
      const avgReportsPerIssue = totalReports / reportIssues.length || 0;
      const topReported = reportIssues
        .map(issue => ({ id: issue.id, reports: issue.reports }))
        .sort((a, b) => b.reports - a.reports);
  
      return {
        totalReports,
        avgReportsPerIssue,
        topReported: topReported.slice(0, 10),
      };
    }
  
    // === Самые долгие нерешенные задачи ===
    longestUnresolvedIssues() {
      const unresolved = this.issues
        .filter(issue => !issue.resolved)
        .map(issue => {
          const created = new Date(issue.created);
          const now = new Date();
          const daysOpen = Math.round((now - created) / (1000 * 60 * 60 * 24));
          return { id: issue.id, daysOpen };
        })
        .sort((a, b) => b.daysOpen - a.daysOpen);
      return unresolved.slice(0, 10);
    }
  
    // === Самые эффективные команды ===
    topPerformingTeams() {
      const teamData = this.groupBy('team');
      const performance = Object.entries(teamData).map(([team, issues]) => {
        const resolved = issues.filter(issue => issue.resolved).length;
        const total = issues.length;
        return { team, resolved, total, performanceRate: (resolved / total) * 100 || 0 };
      });
      return performance.sort((a, b) => b.performanceRate - a.performanceRate);
    }
  
    // === Общая статистика ===
    getStatisticsAndPredictions() {
      const avgResolutionTime = this.calculateAverageResolutionTime();
      const teamCounts = this.getCountsBy('team');
      const statusCounts = this.getCountsBy('status');
      const typeCounts = this.getCountsBy('Issue Type');
      const reportsAnalysis = this.analyzeReports();
      const predictionDates = this.predictResolutionDates();
      const monthlyTrends = this.trendAnalysisByMonth();
      const topPerformers = this.topPerformingTeams();
      const longestUnresolved = this.longestUnresolvedIssues();
  
      const sortedByDate = [...this.issues].sort(
        (a, b) => new Date(a.created) - new Date(b.created)
      );
      const oldestIssue = sortedByDate[0] || null;
      const newestIssue = sortedByDate[sortedByDate.length - 1] || null;
  
      return {
        totalIssues: this.issues.length,
        avgResolutionTime,
        teamCounts,
        statusCounts,
        typeCounts,
        unresolvedIssues: this.issues.filter(issue => !issue.resolved).length,
        resolvedIssues: this.issues.filter(issue => issue.resolved).length,
        oldestIssue,
        newestIssue,
        reportsAnalysis,
        predictedResolutionDates: predictionDates,
        monthlyTrends,
        topPerformers,
        longestUnresolved,
      };
    }

    // Get unresolved issues sorted by creation date
    getUnresolved() {
        return this.issues
            .filter(issue => !this.isResolved(issue.status))
            .sort((a, b) => new Date(b.created) - new Date(a.created));
    }
    
    // Check if issue is resolved
    isResolved(status) {
        return status === "Закрыт" || status === "Отклонен";
    }

    // Get comprehensive statistics and predictions
    getStatisticsAndPredictionsNew() {
        const avgResolutionTime = this.calculateAverageResolutionTime();
        const teamCounts = this.getCountsBy('team');
        const statusCounts = this.getCountsBy('status');
        const typeCounts = this.getCountsBy('Issue Type');
        const predictions = this.predictResolutionDates();
        const unresolved = this.getUnresolved();

        return {
            totalIssues: this.issues.length,
            avgResolutionTime,
            teamCounts,
            statusCounts,
            typeCounts,
            unresolvedIssues: unresolved.length,
            resolvedIssues: this.issues.filter(issue => this.isResolved(issue.status)).length,
            predictions,
            unresolved
        };
    }
    
}
  
  // Пример использования
  // const issues = [...]; // Массив задач из Jira
  // const analytics = new AdvancedAnalytics(issues);
  // const result = analytics.getStatisticsAndPredictions();
  // console.log(result);
  