class StatisticManager {
    constructor() {
        this.refact = null;
    }

    bind(refact) {
        this.refact = refact;
        return this;
    }

    static groupBacklog(backlog, step = 'month') {
        const result = {
            labels: []
        };
        
        Object.entries(backlog).forEach(([dateKey, data]) => {
            const date = new Date(dateKey);
            let formattedDate;
            
            switch (step) {
                case 'month':
                    formattedDate = date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
                    break;
                case 'day':
                    formattedDate = date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
                    break;
                case 'year':
                    formattedDate = date.toLocaleDateString('ru-RU', { year: 'numeric' });
                    break;
                default:
                    formattedDate = dateKey;
            }
            
            if (!result[formattedDate]) {
                result[formattedDate] = { backlog: 0, created: 0, resolved: 0 };
                result.labels.push(formattedDate);
            }
            
            result[formattedDate].backlog = data.backlog;
            result[formattedDate].created = data.created;
            result[formattedDate].resolved = data.resolved;
        });
        
        return { ...result, data: Object.values(result).filter(item => item !== result.labels) };
    }

    getStatistics(issues, index) {
        let statistics = {
            total: null,
            currentMonth: null,
            lastMonth: null,
        };

        const currentMonthDateRange = getDateRange('current_month');
        const lastMonthDateRange = getDateRange('last_month');
        console.log('lastMonthDateRange', lastMonthDateRange);
        let currntMonthIssues = StatisticManager.getIssuesInDateRange(getDateRange('current_month'), index.defect.created);
        console.log('currntMonthIssues (by StatisticManager)', currntMonthIssues);
        statistics.currentMonth = {
        }
    }

static getTeamAnalytics(index, teamName) {
        // 1) Достаём все задачи этой команды:
        // Если в index.team[teamName] нет (команда не найдена), вернём пустую структуру:
        const teamIssues = index.defect.team[teamName] || [];
        if (!teamIssues.length) {
          return {
            team: teamName,
            totalIssues: 0,
            message: 'No issues for this team'
          };
        }
      
        // 2) Считаем общее число задач
        const totalIssues = teamIssues.length;
      
        // 3) Разобьём их по state (resolved / unresolved / rejected)
        let resolvedCount = 0;
        let unresolvedCount = 0;
        let rejectedCount = 0;
      
        // массивы для детального анализа
        const resolvedIssues = [];
        const unresolvedIssues = [];
        const rejectedIssues = [];
      
        teamIssues.forEach(issue => {
          if (issue.state === 'resolved') {
            resolvedCount++;
            resolvedIssues.push(issue);
          } else if (issue.state === 'unresolved') {
            unresolvedCount++;
            unresolvedIssues.push(issue);
          } else if (issue.state === 'rejected') {
            rejectedCount++;
            rejectedIssues.push(issue);
          }
        });
      
        // 4) Среднее и медианное время решения (только для resolvedIssues)
        let averageResolutionTimeDays = 0;
        let medianResolutionTimeDays = 0;
      
        if (resolvedIssues.length > 0) {
          // Подсчитываем массив длительностей (days)
          const durations = resolvedIssues.map(issue => {
            const createdTime = new Date(issue.created).getTime();
            const resolvedTime = new Date(issue.resolved).getTime();
            return (resolvedTime - createdTime) / (1000 * 60 * 60 * 24);
          });
      
          // Среднее
          const sum = durations.reduce((acc, d) => acc + d, 0);
          averageResolutionTimeDays = sum / durations.length;
      
          // Медиана
          durations.sort((a, b) => a - b);
          const mid = Math.floor(durations.length / 2);
          if (durations.length % 2 === 0) {
            // среднее двух серединных
            medianResolutionTimeDays = (durations[mid - 1] + durations[mid]) / 2;
          } else {
            medianResolutionTimeDays = durations[mid];
          }
        }
      
        // 5) Распределение открытых задач (unresolved) по «возрастным» группам
        //    Например: 0-7, 8-14, 15-30, 30+
        const now = Date.now();
        const openIssuesAging = {
          '0-7': 0,
          '8-14': 0,
          '15-30': 0,
          '30plus': 0
        };
        unresolvedIssues.forEach(issue => {
          const createdTime = new Date(issue.created).getTime();
          const daysOpen = (now - createdTime) / (1000 * 60 * 60 * 24);
          if (daysOpen <= 7) {
            openIssuesAging['0-7']++;
          } else if (daysOpen <= 14) {
            openIssuesAging['8-14']++;
          } else if (daysOpen <= 30) {
            openIssuesAging['15-30']++;
          } else {
            openIssuesAging['30plus']++;
          }
        });
      
        // 6) Распределение по приоритету (если имеется поле "priority" в issue)
        //    (можем собрать в объект { P1: count, P2: count, ... })
        const byPriority = {};
        teamIssues.forEach(issue => {
          const prio = issue.priority || 'UNSPECIFIED';
          if (!byPriority[prio]) {
            byPriority[prio] = 0;
          }
          byPriority[prio]++;
        });
      
        // 7) Топ-5 задач, которые дольше всего решались
        //    (смотрим только resolved)
        let topLongestResolved = [];
        if (resolvedIssues.length > 0) {
          topLongestResolved = resolvedIssues
            .map(issue => {
              const createdTime = new Date(issue.created).getTime();
              const resolvedTime = new Date(issue.resolved).getTime();
              const daysToResolve = (resolvedTime - createdTime) / (1000 * 60 * 60 * 24);
              return {
                issueId: issue.issueId,
                summary: issue.summary,
                daysToResolve
              };
            })
            .sort((a, b) => b.daysToResolve - a.daysToResolve)
            .slice(0, 5);
        }
      
        // 8) Статистика по исполнителям внутри этой команды
        //    Сгруппируем всё по assignee, а потом посчитаем resolved/unresolved
        const assigneeMap = {}; // { assigneeName: { resolved: [...], unresolved: [...], ... } }
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
      
        // Превратим это в массив объектов для удобного рендера
        const assigneeStats = [];
        for (const [assigneeName, { resolved, unresolved, rejected }] of Object.entries(assigneeMap)) {
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
      
          assigneeStats.push({
            assignee: assigneeName,
            resolvedCount: resolved.length,
            unresolvedCount: unresolved.length,
            rejectedCount: rejected.length,
            averageResolutionTimeDays: avgResTime
          });
        }
      
        // 9) "Проблемные" задачи — например, самые долгоживущие из unresolved
        //    Выберем топ-5 по дню создания
        let problematicIssues = [];
        if (unresolvedIssues.length > 0) {
          problematicIssues = unresolvedIssues
            .map(issue => {
              const createdTime = new Date(issue.created).getTime();
              const daysOpen = (now - createdTime) / (1000 * 60 * 60 * 24);
              return {
                issueId: issue.issueId,
                summary: issue.summary,
                daysOpen,
                state: issue.state
              };
            })
            .sort((a, b) => b.daysOpen - a.daysOpen)
            .slice(0, 5);
        }
      
        // 10) Формируем итоговый JSON-объект
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
          problematicIssues
        };
      }



    static getUnresolvedDefects() {
        const state = Refact.getInstance().state;
        const issues = state.index?.defect?.state?.unresolved || [];
        return {
            count: issues.length,
            issues: issues
        };
    }
    

    static getIssuesInDateRange(dateRange, issuesDates) {
        if (!dateRange || !issuesDates) return [];
        
        const { dateStart, dateEnd } = dateRange;
        const start = new Date(dateStart);
        const end = new Date(dateEnd);
        
        let result = [];
        
        // Перебираем все даты и их задачи
        for (const [dateStr, issues] of Object.entries(issuesDates)) {
            const date = new Date(dateStr);
            
            // Проверяем, попадает ли дата в диапазон
            if (date >= start && date <= end) {
                // Если дата в диапазоне, добавляем все задачи за эту дату
                if (Array.isArray(issues)) {
                    result = result.concat(issues);
                } else {
                    result.push(issues);
                }
            }
        }
        
        return result;
    }
   
    static groupByMonth(data) {
        const grouped = {};
        Object.keys(data).forEach(date => {
            const month = date.slice(0, 7); // Берём только "YYYY-MM"
            if (!grouped[month]) grouped[month] = 0;
            grouped[month] += data[date].length; // Суммируем количество задач
        });
        return grouped;
    }
   
    static getBacklog(isDefects = true, index) {
        const state = Refact.getInstance().state;
        if (!state.index?.defect?.created || !state.index?.defect?.resolved) {
            return {};
        }

        const created = state.index.defect.created;
        const resolved = state.index.defect.resolved;

        // Собираем все уникальные даты из созданных и решённых задач
        const allDates = new Set([
            ...Object.keys(created),
            ...Object.keys(resolved)
        ]);

        // Сортируем даты
        const sortedDates = Array.from(allDates).sort();

        let runningBacklog = 0; // Текущий бэклог
        const result = {};

        sortedDates.forEach(date => {
            const createdCount = created[date]?.length || 0;
            const resolvedCount = resolved[date]?.length || 0;

            runningBacklog += createdCount - resolvedCount;
            result[date] = { backlog: runningBacklog,
                             created: createdCount,
                         resolved: resolvedCount };
        });

        return result;
    }

    static compareDateRange(dateRangeA, dateRangeB, indexedIssues) {
        const defectsA = StatisticManager.getByDateRange(dateRangeA, indexedIssues.defect);
        const defectsB = StatisticManager.getByDateRange(dateRangeB, indexedIssues.defect);
        
        const result = {
            created: {
                a: defectsA.length,
                b: defectsB.length,
                trend: defectsA.length - defectsB.length
            },
        }

        return result;
    }

}
