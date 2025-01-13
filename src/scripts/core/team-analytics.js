class TeamAnalytics {
    constructor(index) {
      this.index = index;
    }
  
    /**
     * Главный метод — даёт исчерпывающую аналитику по команде teamName.
     * Возвращает большой JSON-объект с метриками.
     */
    getTeamAnalytics(teamName) {
      const teamIssues = this.index.team[teamName] || [];
      if (!teamIssues.length) {
        return {
          team: teamName,
          totalIssues: 0,
          message: 'No issues for this team'
        };
      }
  
      // Основные группировки
      const { resolvedIssues, unresolvedIssues, rejectedIssues } =
        this.splitIssuesByState(teamIssues);
  
      const totalIssues = teamIssues.length;
      const resolvedCount = resolvedIssues.length;
      const unresolvedCount = unresolvedIssues.length;
      const rejectedCount = rejectedIssues.length;
  
      // Среднее/медианное время решения
      const {
        averageResolutionTimeDays,
        medianResolutionTimeDays
      } = this.getResolutionTimeStats(resolvedIssues);
  
      // Возраст открытых
      const openIssuesAging = this.getOpenIssuesAging(unresolvedIssues);
  
      // Распределение по приоритету
      const byPriority = this.getDistributionByPriority(teamIssues);
  
      // Топ-5 самых долго решавшихся
      const topLongestResolved = this.getTopLongestResolved(resolvedIssues);
  
      // Статистика по исполнителям
      const assigneeStats = this.getAssigneeStats(teamIssues);
  
      // Топ-5 самых долгоживущих нерешённых
      const problematicIssues = this.getProblematicIssues(unresolvedIssues);
  
      // Аналитика по жалобам
      const {
        totalReports,
        averageReports,
        topReportedIssues
      } = this.getReportsAnalysis(teamIssues);
  
      // Анализ текстов summary
      const textAnalysis = this.getTextAnalysis(teamIssues);
  
      // «Креативные» выводы + SLA-инсайты
      const creativeInsights = this.getCreativeInsights(teamIssues);
  
      return {
        team: teamName,
        totalIssues,
        byState: {
          resolved: resolvedCount,
          unresolved: unresolvedCount,
          rejected: rejectedCount
        },
        averageResolutionTimeDays,
        medianResolutionTimeDays,
        openIssuesAging,
        byPriority,
        topLongestResolved,
        assigneeStats,
        problematicIssues,
        totalReports,
        averageReports,
        topReportedIssues,
        topWords: textAnalysis.topWords,
        topicAnalysis: textAnalysis.topicAnalysis,
  
        // Важные SLA-метрики
        slaInsights: this.getSlaInsights(teamIssues),
  
        // И другие «креативные» метрики
        creativeInsights
      };
    }
  
    // ==========================
    // Базовые методы разбора
    // ==========================
  
    splitIssuesByState(teamIssues) {
      const resolvedIssues = [];
      const unresolvedIssues = [];
      const rejectedIssues = [];
      teamIssues.forEach(issue => {
        switch (issue.state) {
          case 'resolved':
            resolvedIssues.push(issue);
            break;
          case 'unresolved':
            unresolvedIssues.push(issue);
            break;
          case 'rejected':
            rejectedIssues.push(issue);
            break;
          default:
            // Игнорируем или логируем иные состояния
            break;
        }
      });
      return { resolvedIssues, unresolvedIssues, rejectedIssues };
    }
  
    getResolutionTimeStats(resolvedIssues) {
      if (!resolvedIssues.length) {
        return { averageResolutionTimeDays: 0, medianResolutionTimeDays: 0 };
      }
      const durations = resolvedIssues.map(issue => {
        const c = new Date(issue.created).getTime();
        const r = new Date(issue.resolved).getTime();
        return (r - c) / (1000 * 60 * 60 * 24);
      });
  
      const sum = durations.reduce((acc, d) => acc + d, 0);
      const average = sum / durations.length;
  
      durations.sort((a, b) => a - b);
      const mid = Math.floor(durations.length / 2);
      let median = 0;
      if (durations.length % 2 === 0) {
        median = (durations[mid - 1] + durations[mid]) / 2;
      } else {
        median = durations[mid];
      }
  
      return {
        averageResolutionTimeDays: average,
        medianResolutionTimeDays: median
      };
    }
  
    getOpenIssuesAging(unresolvedIssues) {
      const now = Date.now();
      const aging = {
        '0-7': 0,
        '8-14': 0,
        '15-30': 0,
        '30plus': 0
      };
      unresolvedIssues.forEach(issue => {
        const createdTime = new Date(issue.created).getTime();
        const daysOpen = (now - createdTime) / (1000 * 60 * 60 * 24);
        if (daysOpen <= 7) {
          aging['0-7']++;
        } else if (daysOpen <= 14) {
          aging['8-14']++;
        } else if (daysOpen <= 30) {
          aging['15-30']++;
        } else {
          aging['30plus']++;
        }
      });
      return aging;
    }
  
    getDistributionByPriority(issues) {
      const byPriority = {};
      issues.forEach(issue => {
        const prio = issue.priority || 'UNSPECIFIED';
        if (!byPriority[prio]) {
          byPriority[prio] = 0;
        }
        byPriority[prio]++;
      });
      return byPriority;
    }
  
    getTopLongestResolved(resolvedIssues) {
      if (!resolvedIssues.length) return [];
      const withDuration = resolvedIssues.map(issue => {
        const c = new Date(issue.created).getTime();
        const r = new Date(issue.resolved).getTime();
        const daysToResolve = (r - c) / (1000 * 60 * 60 * 24);
        return {
          issueId: issue.issueId,
          summary: issue.summary,
          daysToResolve,
          reports: issue.reports || 0
        };
      });
      withDuration.sort((a, b) => b.daysToResolve - a.daysToResolve);
      return withDuration.slice(0, 5);
    }
  
    getAssigneeStats(teamIssues) {
      const assigneeMap = {};
      teamIssues.forEach(issue => {
        const a = issue.assignee || 'UNKNOWN';
        if (!assigneeMap[a]) {
          assigneeMap[a] = {
            resolved: [],
            unresolved: [],
            rejected: []
          };
        }
        if (issue.state === 'resolved') {
          assigneeMap[a].resolved.push(issue);
        } else if (issue.state === 'unresolved') {
          assigneeMap[a].unresolved.push(issue);
        } else if (issue.state === 'rejected') {
          assigneeMap[a].rejected.push(issue);
        }
      });
  
      const assigneeStats = [];
      for (const [assigneeName, { resolved, unresolved, rejected }] of Object.entries(assigneeMap)) {
        // Среднее время решения
        let avgResTime = 0;
        if (resolved.length > 0) {
          const durations = resolved.map(issue => {
            const c = new Date(issue.created).getTime();
            const r = new Date(issue.resolved).getTime();
            return (r - c) / (1000 * 60 * 60 * 24);
          });
          const sum = durations.reduce((acc, d) => acc + d, 0);
          avgResTime = sum / durations.length;
        }
  
        // Суммируем жалобы
        let reportsSum = 0;
        [...resolved, ...unresolved, ...rejected].forEach(issue => {
          reportsSum += (issue.reports || 0);
        });
  
        assigneeStats.push({
          assignee: assigneeName,
          resolvedCount: resolved.length,
          unresolvedCount: unresolved.length,
          rejectedCount: rejected.length,
          averageResolutionTimeDays: avgResTime,
          totalReports: reportsSum
        });
      }
  
      return assigneeStats;
    }
  
    getProblematicIssues(unresolvedIssues) {
      if (!unresolvedIssues.length) return [];
      const now = Date.now();
      const withDaysOpen = unresolvedIssues.map(issue => {
        const c = new Date(issue.created).getTime();
        const daysOpen = (now - c) / (1000 * 60 * 60 * 24);
        return {
          issueId: issue.issueId,
          summary: issue.summary,
          daysOpen,
          state: issue.state,
          reports: issue.reports || 0
        };
      });
      withDaysOpen.sort((a, b) => b.daysOpen - a.daysOpen);
      return withDaysOpen.slice(0, 5);
    }
  
    getReportsAnalysis(teamIssues) {
      let totalReports = 0;
      teamIssues.forEach(issue => {
        totalReports += (issue.reports || 0);
      });
      const averageReports = teamIssues.length
        ? totalReports / teamIssues.length
        : 0;
  
      const topReportedIssues = [...teamIssues]
        .sort((a, b) => (b.reports || 0) - (a.reports || 0))
        .slice(0, 5)
        .map(issue => ({
          issueId: issue.issueId,
          summary: issue.summary,
          reports: issue.reports || 0,
          state: issue.state
        }));
  
      return { totalReports, averageReports, topReportedIssues };
    }
  
    getTextAnalysis(teamIssues) {
      const allSummaries = teamIssues.map(i => (i.summary || '').toLowerCase());
      const stopWords = new Set([
        'и','в','на','a','the','of','to','и.','and','т.','др.','',
        '—','!','…','не','что','это','как','по'
      ]);
  
      const allWords = [];
      allSummaries.forEach(s => {
        const words = s
          .split(/[^a-zA-Zа-яА-Я0-9ёЁ]+/g)
          .map(w => w.trim())
          .filter(w => w.length > 1 && !stopWords.has(w));
        allWords.push(...words);
      });
  
      const wordCount = {};
      allWords.forEach(word => {
        if (!wordCount[word]) {
          wordCount[word] = 0;
        }
        wordCount[word]++;
      });
  
      const sortedWords = Object.entries(wordCount)
        .sort(([, aCount], [, bCount]) => bCount - aCount)
        .slice(0, 15);
  
      const topWords = sortedWords.map(([word, count]) => ({ word, count }));
  
      // Небольшой «topicAnalysis» по первым 3 словам
      const topicAnalysis = {};
      topWords.slice(0, 3).forEach(({ word }) => {
        topicAnalysis[word] = teamIssues
          .filter(issue => 
            issue.summary && issue.summary.toLowerCase().includes(word)
          )
          .map(issue => ({
            issueId: issue.issueId,
            summary: issue.summary,
            reports: issue.reports || 0,
            state: issue.state
          }));
      });
  
      return {
        topWords,
        topicAnalysis
      };
    }
  
    // ==========================
    // SLA-инсайты
    // ==========================
    /**
     * Если issue.slaOverdue === true, значит SLA просрочен.
     * - Считаем, сколько всего таких задач
     * - Долю (процент) от всех задач команды
     * - Распределение slaOverdue задач по приоритетам
     * - Топ-5 самых старых (daysOpen) из просроченных
     * - Среднее время «просрочки» (если есть issue.slaOverdueDays)
     */
    getSlaInsights(teamIssues) {
      // 1) Отфильтровываем задачи, где slaOverdue === true
      const overdueIssues = teamIssues.filter(i => i.slaOverdue === true);
      const countOverdue = overdueIssues.length;
      const total = teamIssues.length;
      const ratioOverdue = total > 0 ? (countOverdue / total) : 0;
  
      // 2) Распределение по приоритетам среди просроченных
      const priorityDist = {};
      overdueIssues.forEach(issue => {
        const prio = issue.priority || 'UNSPECIFIED';
        if (!priorityDist[prio]) priorityDist[prio] = 0;
        priorityDist[prio]++;
      });
  
      // 3) Топ-5 самых старых по daysOpen
      //    (для просроченных задач, которые не решены)
      const now = Date.now();
      const overdueWithAge = overdueIssues.map(issue => {
        const createdTime = new Date(issue.created).getTime();
        const daysOpen = (now - createdTime) / (1000 * 60 * 60 * 24);
        return {
          issueId: issue.issueId,
          summary: issue.summary,
          daysOpen,
          state: issue.state,
          reports: issue.reports || 0
        };
      });
      overdueWithAge.sort((a, b) => b.daysOpen - a.daysOpen);
      const topOverdueOld = overdueWithAge.slice(0, 5);
  
      // 4) Среднее количество дней просрочки, если есть issue.slaOverdueDays
      let totalOverdueDays = 0;
      let hasOverdueDaysField = false;
      overdueIssues.forEach(issue => {
        if (typeof issue.slaOverdueDays === 'number') {
          hasOverdueDaysField = true;
          totalOverdueDays += issue.slaOverdueDays;
        }
      });
      let avgOverdueDays = 0;
      if (hasOverdueDaysField && countOverdue > 0) {
        avgOverdueDays = totalOverdueDays / countOverdue;
      }
  
      return {
        totalSlaOverdue: countOverdue,
        slaOverdueRatio: ratioOverdue,  // доля от общего числа задач
        slaOverduePriorityDistribution: priorityDist,
        topOverdueOld,
        hasOverdueDaysField,
        averageSlaOverdueDays: avgOverdueDays
      };
    }
  
    // ==========================
    // Пример дополнительных "креативных" идей
    // ==========================
    getCreativeInsights(teamIssues) {
      const results = {};
  
      // Пример: "Коэффициент срочности" (priority + reports + aging)
      const priorityMap = { P1: 3, P2: 2, P3: 1 };
      const now = Date.now();
      const issuesWithUrgency = [];
      teamIssues.forEach(issue => {
        const createdTime = new Date(issue.created).getTime();
        const daysOpen = (now - createdTime) / (1000 * 60 * 60 * 24);
        const agingFactor = 1 + Math.log10(1 + daysOpen) / 2;
        const pVal = priorityMap[issue.priority] || 1;
        const r = issue.reports || 0;
        const urgency = (pVal + r) * agingFactor;
        issuesWithUrgency.push({
          issueId: issue.issueId,
          summary: issue.summary,
          priority: issue.priority,
          reports: issue.reports || 0,
          daysOpen,
          urgency
        });
      });
      issuesWithUrgency.sort((a, b) => b.urgency - a.urgency);
      results.topUrgent = issuesWithUrgency.slice(0, 5);
  
      // Пример: если есть сигнатуры ошибок
      const errorSignatures = ['npe', 'exception', 'outofbounds', 'subaccount'];
      const errorStats = {};
      errorSignatures.forEach(sig => (errorStats[sig] = 0));
      teamIssues.forEach(issue => {
        const s = (issue.summary || '').toLowerCase();
        errorSignatures.forEach(sig => {
          if (s.includes(sig)) errorStats[sig]++;
        });
      });
      results.errorSignatures = errorStats;
  
      // "Ветхие" нерешённые задачи (больше года)
      const yearInDays = 365;
      const ancientIssues = teamIssues
        .filter(i => i.state !== 'resolved')
        .map(i => {
          const c = new Date(i.created).getTime();
          const daysOpen = (now - c) / (1000 * 60 * 60 * 24);
          return { ...i, daysOpen };
        })
        .filter(i => i.daysOpen > yearInDays);
      results.longLivingCount = ancientIssues.length;
      ancientIssues.sort((a, b) => b.daysOpen - a.daysOpen);
      results.longLivingExamples = ancientIssues.slice(0, 5).map(i => ({
        issueId: i.issueId,
        summary: i.summary,
        daysOpen: i.daysOpen,
        reports: i.reports || 0
      }));
  
      return results;
    }
  }
  
  // =====================
  // Пример использования:
  // =====================
  // const analytics = new TeamAnalytics(index);
  // const result = analytics.getTeamAnalytics("Core");
  // console.log(JSON.stringify(result, null, 2));
  