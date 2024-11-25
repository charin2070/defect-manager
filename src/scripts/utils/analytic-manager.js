class AnalyticManager {
    constructor(issues) {   
      this.issues = issues || []; // Initialize with empty array if issues is undefined
    }
  
    // Метод для получения всех уникальных команд
    getUniqueTeams() {
        if (!Array.isArray(this.issues)) {
            return [];
        }
        const teams = new Set();
        this.issues.forEach(issue => {
            if (issue.team) {
                teams.add(issue.team);
            }
        });
        return Array.from(teams);
    }
  
    // Метод для получения количества задач по статусу
    getCountByStatus(issues) {
      const statusCount = { resolved: [], unresolved: [] };
      issues.forEach(issue => {
        if (issue.status) {
          if (!issue.resolved) statusCount['unresolved'].push(issue.id);
          statusCount[issue.status] = (statusCount[issue.status] || 0) + 1;
        }
      });
      return statusCount;
    }

    getUnresolvedIssues(issues) {
      return issues.filter(issue => !issue.resolved);
    }
  
    // Метод для получения количества задач по типу
    getCountByIssueType() {
      const issueTypeCount = {};
      this.issues.forEach(issue => {
        if (issue["Issue Type"]) {
          issueTypeCount[issue["Issue Type"]] = (issueTypeCount[issue["Issue Type"]] || 0) + 1;
        }
      });
      return issueTypeCount;
    }
  
    // Метод для получения средней длительности решения задач в днях
    getAverageResolutionTime() {
      const resolutionTimes = this.issues
        .filter(issue => issue.resolved)
        .map(issue => {
          const createdDate = new Date(issue.created);
          const resolvedDate = new Date(issue.resolved);
          return (resolvedDate - createdDate) / (1000 * 60 * 60 * 24); // Перевод миллисекунд в дни
        });
  
      if (resolutionTimes.length === 0) return 0;
  
      const totalTime = resolutionTimes.reduce((sum, time) => sum + time, 0);
      return Math.round(totalTime / resolutionTimes.length);
    }

    // Метод для получения задач определенной команды
    getTeamData(team) {
      if (team === 'all') {
        return this.issues;
      }
      return this.issues.filter(issue => issue.team === team);
    }
  
    // Метод для получения всех задач, назначенных конкретному исполнителю
    getIssuesByAssignee(assignee) {
      return this.issues.filter(issue => issue.assignee === assignee);
    }
  
    // Метод для проверки, завершена ли задача
    isResolved(taskStatus) {
      return taskStatus === "Закрыт" || taskStatus === "Отклонен";
    }
  
    // Backlog chart
    createBacklogChart(tasks, canvasId) {
      const createdCounts = {};
      const resolvedCounts = {};
      const labels = new Set();
  
      tasks.forEach(task => {
        const createdDate = new Date(task.created);
        const resolvedDate = task.resolved ? new Date(task.resolved) : null;
        const monthYearCreated = `${createdDate.getFullYear()}-${(createdDate.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthYearResolved = resolvedDate ? `${resolvedDate.getFullYear()}-${(resolvedDate.getMonth() + 1).toString().padStart(2, '0')}` : null;
  
        // Добавляем месяц и год создания в метки
        labels.add(monthYearCreated);
        createdCounts[monthYearCreated] = (createdCounts[monthYearCreated] || 0) + 1;
  
        if (monthYearResolved) {
          labels.add(monthYearResolved);
          resolvedCounts[monthYearResolved] = (resolvedCounts[monthYearResolved] || 0) + 1;
        }
      });
  
      const sortedLabels = Array.from(labels).sort();
      const createdissuses = sortedLabels.map(label => createdCounts[label] || 0);
      const resolvedissuses = sortedLabels.map(label => resolvedCounts[label] || 0);
      const backlogissuses = [];
      let cumulativeBacklog = 0;
  
      sortedLabels.forEach((label, index) => {
        const createdCount = createdissuses[index];
        const resolvedCount = resolvedissuses[index];
        cumulativeBacklog += createdCount - resolvedCount;
        backlogissuses.push(Math.max(cumulativeBacklog, 0)); // Обеспечиваем, чтобы бэклог не уходил в минус
      });
  
      new Chart(canvasId, {
        type: 'line',
        data: {
          labels: sortedLabels,
          datasets: [
            {
              label: 'Созданные задачи',
              data: createdissuses,
              tension: 0.5,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true
            },
            {
              label: 'Закрытые задачи',
              data: resolvedissuses,
              tension: 0.5,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true
            },
            {
              label: 'Бэклог',
              data: backlogissuses,
              tension: 0.5,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Бэклог',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Дата'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Количество задач'
              }
            }
          }
        }
      });
    }
  
    // Метод для получения количества открытых и закрытых задач по каждой команде
    getOpenAndClosedTaskCountsByTeam() {
      const teamOpenCounts = {};
      const teamClosedCounts = {};
      const teamReports = [];
      this.issues.forEach(issue => {
        if (issue.team) {
          if (!this.isResolved(issue.status)) {
            teamOpenCounts[issue.team] = (teamOpenCounts[issue.team] || 0) + 1;
            if (issue.reports && parseInt(issue.reports) > 0) {
                teamReports[issue.team] = (teamReports[issue.team] || 0) + 1;
              }
          } else if (issue.status === "Закрыт") {
            teamClosedCounts[issue.team] = (teamClosedCounts[issue.team] || 0) + 1;
          }
        }
      });
      return { teamOpenCounts, teamClosedCounts, teamReports };
    }
  
    // Метод для создания вертикального графика с командами
    createTeamsBacklogChart(canvasId) {
      const { teamOpenCounts, teamClosedCounts, teamReports } = this.getOpenAndClosedTaskCountsByTeam();
      const teams = this.getUniqueTeams();
  
      // Подготовка данных для графика
      const labels = teams;
      const openissuses = teams.map(team => teamOpenCounts[team] || 0);
      const closedissuses = teams.map(team => teamClosedCounts[team] || 0);
      const reportsissuses = teams.map(team => teamReports[team] || 0);
  
      new Chart(canvasId, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Открыто',
              data: openissuses,
              backgroundColor: 'rgba(255, 99, 132, 0.8)'
            },
            {
              label: 'Обращения',
              data: reportsissuses,
              backgroundColor: 'rgba(75, 192, 192, 0.8)',
              enabled: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Команды',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          indexAxis: 'x', // Отображение графика вертикально
          scales: {
            y: {
              title: {
                display: true,
                text: 'Количество задач'
              },
              stacked: true,
            },
            x: {
                stacked: true,
              beginAtZero: true,
              title: {
                display: true,
                text: ''
              }
            }
          }
        }
      });
    }

    getTeams() {
        // Get unique team names from issues
        const teams = new Set();
        this.issues.forEach(issue => {
            if (issue.team) {
                teams.add(issue.team);
            }
        });
        return Array.from(teams).sort();
    }

    // Метод для фильтрации задач по дате
    filterIssuesByDate(startDate, endDate, issues) {
      if (!startDate || !endDate) return issues;
      
      return issues.filter(issue => {
        const created = new Date(issue.created);
        return created >= startDate && created <= endDate;
      });
    }

    findOldestIssue(issues) {
        if (!Array.isArray(issues) || issues.length === 0) return null;
        return issues.reduce((oldest, issue) => {
            if (!issue.created) return oldest;
            const createdDate = new Date(issue.created);
            if (!oldest || createdDate < new Date(oldest.created)) {
                return issue;
            }
            return oldest;
        }, null);
    }

    findNewestIssue(issues) {
        if (!Array.isArray(issues) || issues.length === 0) return null;
        return issues.reduce((newest, issue) => {
            if (!issue.created) return newest;
            const createdDate = new Date(issue.created);
            if (!newest || createdDate > new Date(newest.created)) {
                return issue;
            }
            return newest;
        }, null);
    }

    getStatistics() {
        const opened = this.issues.filter(issue => !this.isResolved(issue.status));
        const resolved = this.issues.filter(issue => this.isResolved(issue.status));
        const rejected = this.issues.filter(issue => issue.resolved && issue.status === "Отклонен");
        const unresolved = this.issues.filter(issue => !this.isResolved(issue.status));
        
        // Get unique team names
        const teamNames = [...new Set(this.issues.map(issue => issue.team))];

        // Find oldest and newest issues considering both created and resolved dates
        let dateStart = null;
        let dateEnd = null;

        this.issues.forEach(issue => {
            const created = new Date(issue.created);
            const resolved = issue.resolved ? new Date(issue.resolved) : new Date();

            if (!dateStart || created < dateStart) {
                dateStart = created;
            }
            if (!dateEnd || resolved > dateEnd) {
                dateEnd = resolved;
            }
        });

        // Calculate average resolution time
        let totalResolutionTime = 0;
        let resolvedCount = 0;

        resolved.forEach(issue => {
            if (issue.resolved) {
                const created = new Date(issue.created);
                const resolved = new Date(issue.resolved);
                const resolutionTime = (resolved - created) / (1000 * 60 * 60 * 24); // Convert to days
                totalResolutionTime += resolutionTime;
                resolvedCount++;
            }
        });

        const allTimeAverageResolution = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

        // Calculate total reports for unresolved issues
        const unresolvedReports = this.issues
            .filter(issue => !this.isResolved(issue.status))
            .reduce((total, issue) => total + (issue.reports || 0), 0);

        // Get top reported unresolved issues (sorted by number of reports)
        const topReported = [...this.issues]
            .filter(issue => !this.isResolved(issue.status))
            .sort((a, b) => (b.reports || 0) - (a.reports || 0))
            .slice(0, 20)
            .map(issue => ({
                id: issue.id,
                summary: issue.summary,
                reportsCount: issue.reports || 0,
                team: issue.team
            }));

        // Calculate status by month statistics
        const statusByMonth = {};
        const teamBacklog = {};
        
        // Initialize teamBacklog for each team
        teamNames.forEach(team => {
            teamBacklog[team] = {};
        });
        
        // Sort issues by creation date
        const sortedIssues = [...this.issues].sort((a, b) => new Date(a.created) - new Date(b.created));
        
        sortedIssues.forEach(issue => {
            const createdDate = new Date(issue.created);
            const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
            
            // Initialize month data if it doesn't exist
            if (!statusByMonth[monthKey]) {
                statusByMonth[monthKey] = {
                    created: 0,
                    resolved: 0,
                    unresolved: 0,
                    rejected: 0,
                    teams: {},
                    statusCounts: {}
                };
                // Initialize data for each team in this month
                teamNames.forEach(team => {
                    statusByMonth[monthKey].teams[team] = {
                        backlog: 0
                    };
                });
            }
            
            // Count created tasks
            statusByMonth[monthKey].created++;
            
            // Count tasks by status
            const status = issue.status || "NEW";
            statusByMonth[monthKey].statusCounts[status] = (statusByMonth[monthKey].statusCounts[status] || 0) + 1;
            
            // Count resolved and rejected tasks
            if (issue.resolved) {
                const resolvedDate = new Date(issue.resolved);
                const resolvedMonthKey = `${resolvedDate.getFullYear()}-${String(resolvedDate.getMonth() + 1).padStart(2, '0')}`;
                
                if (!statusByMonth[resolvedMonthKey]) {
                    statusByMonth[resolvedMonthKey] = {
                        created: 0,
                        resolved: 0,
                        unresolved: 0,
                        rejected: 0,
                        teams: {},
                        statusCounts: {}
                    };
                    // Initialize data for each team in this month
                    teamNames.forEach(team => {
                        statusByMonth[resolvedMonthKey].teams[team] = {
                            backlog: 0
                        };
                    });
                }
                
                if (issue.status === "Отклонен") {
                    statusByMonth[resolvedMonthKey].rejected++;
                } else {
                    statusByMonth[resolvedMonthKey].resolved++;
                }
            }
        });
        
        // Calculate running total of unresolved tasks per team and overall
        let unresolvedTotal = 0;
        const monthKeys = Object.keys(statusByMonth).sort();
        
        // Calculate team backlogs for each month
        teamNames.forEach(team => {
            monthKeys.forEach(month => {
                // Calculate team's unresolved tasks for this month
                const monthIssues = sortedIssues.filter(issue => {
                    const createdDate = new Date(issue.created);
                    const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
                    const isCreatedInOrBeforeMonth = monthKey <= month;
                    
                    if (!isCreatedInOrBeforeMonth) return false;
                    if (issue.team !== team) return false;
                    
                    // Check if task was resolved after this month
                    if (issue.resolved) {
                        const resolvedDate = new Date(issue.resolved);
                        const resolvedMonthKey = `${resolvedDate.getFullYear()}-${String(resolvedDate.getMonth() + 1).padStart(2, '0')}`;
                        return resolvedMonthKey > month;
                    }
                    
                    return true; // Task is still unresolved
                }).length;
                
                // Update team backlog in statusByMonth
                statusByMonth[month].teams[team].backlog = monthIssues;
            });
        });
        
        // Calculate overall unresolved total
        Object.keys(statusByMonth).sort().forEach(month => {
            unresolvedTotal += statusByMonth[month].created - statusByMonth[month].resolved - statusByMonth[month].rejected;
            statusByMonth[month].unresolved = unresolvedTotal;
        });
        
        return {
            created: this.issues.length,
            resolved: resolved.length,
            rejected: rejected.length,
            unresolved: unresolved.length,
            opened: this.issues.filter(issue => !this.isResolved(issue.status)),
            teams: teamNames,
            dateStart,
            dateEnd,
            allTimeAverageResolution,
            topReported,
            unresolvedReports,
            statusByMonth,
            teamBacklog
        };
    }

    calculateAverageResolutionTime(resolvedIssues) {
        const resolutionTimes = resolvedIssues.map(issue => {
            const createdDate = new Date(issue.created);
            const resolvedDate = new Date(issue.resolved);
            return (resolvedDate - createdDate) / (1000 * 60 * 60 * 24); // в днях
        });

        if (resolutionTimes.length === 0) return 0;

        const totalTime = resolutionTimes.reduce((sum, time) => sum + time, 0);
        return Math.round(totalTime / resolutionTimes.length);
    }
  }
