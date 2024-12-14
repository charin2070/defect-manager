class StatisticManager extends Reactive {
    constructor(issues) {
        super(document.body);
        this.issues = issues;     
            
        if (this.issues) {
            this.updateStatistics(this.issues);
        }

        this.setupSubscriptions();

    }

    updateStatistics(issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn('[StatisticManager] updateStatistics requires a defined array of issues');
            return;
        }

        const issueStatistics = StatisticManager.getStructuredStatistics(issues);
        log(issueStatistics, '📊 [StatisticManager] Issue statistics');
        // Преобразуем статистику в нужный формат
        const formattedStatistics = {
            defects: {
                total: {
                    unresolved: issueStatistics.statisticsTotal.unresolved || [],
                },
                currentMonth: {
                    created: issueStatistics.currentMonthStatistics.created || [],
                }
            },
            requests: {
                total: {
                    unresolved: issueStatistics.statisticsTotal.unresolved || [],
                },
                currentMonth: {
                    created: issueStatistics.currentMonthStatistics.created || [],
                }
            }
        };

        this.setState({ statistics: formattedStatistics }, '[StatisticManager] updateStatistics');
        log(formattedStatistics, '📊 [StatisticManager] Statistics updated');
    }

    setupSubscriptions() {
    }

    // Example of Issue object
    exampleIssue = {
        "taskId": "ADIRINC-1203",
        "created": "2023-08-10T10:17:00.000Z",
        "resolved": "2024-02-07T08:49:00.000Z",
        "reports": 67,
        "slaDate": "2023-11-01T21:00:00.000Z",
        "status": "Закрыт",
        "state": null,
        "description": "10.08 по инструментам проставился запрет на торговлю инструментом, \r  подробнее в [https://rc.alfa-bank.net/channel/adir-avarii?msg=AvtnNSMQZRMhGMtdX]",
        "summary": "Изменение IdTradePeriodStatus в [AdFront].[fi].[FinInfoExt] и [AdFront].[ts].[FinInfoExt]",
        "type": "Дефект промсреды",
        "priority": null,
        "assignee": "U_M00ZM",
        "reporter": null,
        "team": "Core",
        "isOverdue": null,
        "source": "ADIRINC-1203,3529833,U_M00ZM,Закрыт,10.08.2023 13:17,,,,,Дефект промсреды,07.02.2024 11:49,2023-11-02 00:00:00.0,\"10.08 по инструментам проставился запрет на торговлю инструментом, \r  подробнее в [https://rc.alfa-bank.net/channel/adir-avarii?msg=AvtnNSMQZRMhGMtdX]\",,67.0,Core,,Изменение IdTradePeriodStatus в [AdFront].[fi].[FinInfoExt] и [AdFront].[ts].[FinInfoExt],Портфель - Некорректный состав портфеля (вкл. некорректный минус по счету) (1) - critical,,,08.08.2024 23:49",
        "notes": null,
        "alarms": null,
        "component": "",
        "updated": "2024-08-08T20:49:00.000Z",
        "Issue id": "3529833",
        "labels": "",
        "Custom field (description )": "",
        "Custom field (Business Summary)": "",
        "Custom field (Mobile application component)": ""
    }

    // Statiistics structure
    issueStatistics = {
            unresolved: [], // Не исправленные
            resolved: [], // Исправленные
            rejected: [], // Отклоненные
            rejectedByTeam: [], // Отклонены командой сопровождени
            created: [],  // Созданные
            verified: [], // Приняты к исправлению
            overdue: [], // Просроченные
            averageResolutionTime: 0, // Среднее время исправления
            reports: 0 // Количество обращений от пользователей на не исправленных задачах
    }

    static getStructuredStatistics(issues) {
        const statisticsStructure = {
            defects: {
                resolved: {
                    count: 0,
                    resolutionDates: {},
                    slaDates: {}
                },
                unresolved: {
                    count: 0,
                    creationDates: {}
                },
                rejected: {
                    count: 0,
                    rejectionDates: {}
                }
            },
            requests: {
                resolved: {
                    count: 0
                },
                unresolved: {
                    count: 0
                },
                rejected: {
                    count: 0
                }
            }
        };
    
        if (!issues || !Array.isArray(issues)) {
            console.warn("[IndexManager] getStructuredStatistics requires an array of issues.");
            return statisticsStructure;
        }
    
        issues.forEach(issue => {
            const type = issue.type;
            const state = issue.state;
            const taskId = issue.taskId;
            const creationDate = issue.created ? new Date(issue.created).toISOString().split('T')[0] : null;
            const resolvedDate = issue.resolved ? new Date(issue.resolved).toISOString().split('T')[0] : null;
            const slaDate = issue.sla ? new Date(issue.sla).toISOString().split('T')[0] : null;
    
            if (type === 'defect') {
                if (state === 'resolved') {
                    statisticsStructure.defects.resolved.count++;
                    if (resolvedDate) {
                        statisticsStructure.defects.resolved.resolutionDates[resolvedDate] =
                            statisticsStructure.defects.resolved.resolutionDates[resolvedDate] || [];
                        statisticsStructure.defects.resolved.resolutionDates[resolvedDate].push(taskId);
                    }
                    if (slaDate) {
                        statisticsStructure.defects.resolved.slaDates[slaDate] =
                            statisticsStructure.defects.resolved.slaDates[slaDate] || [];
                        statisticsStructure.defects.resolved.slaDates[slaDate].push(taskId);
                    }
                } else if (state === 'unresolved') {
                    statisticsStructure.defects.unresolved.count++;
                    if (creationDate) {
                        statisticsStructure.defects.unresolved.creationDates[creationDate] =
                            statisticsStructure.defects.unresolved.creationDates[creationDate] || [];
                        statisticsStructure.defects.unresolved.creationDates[creationDate].push(taskId);
                    }
                } else if (state === 'rejected') {
                    statisticsStructure.defects.rejected.count++;
                    if (resolvedDate) {
                        statisticsStructure.defects.rejected.rejectionDates[resolvedDate] =
                            statisticsStructure.defects.rejected.rejectionDates[resolvedDate] || [];
                        statisticsStructure.defects.rejected.rejectionDates[resolvedDate].push(taskId);
                    }
                }
            } else if (type === 'request') {
                const category = statisticsStructure.requests[state];
                if (category) {
                    category.count++;
                    category[creationDate] = category[creationDate] || [];
                    category[creationDate].push(taskId);
                }
            }
        });
    
        return statisticsStructure;
    }

    static getIssueStatistics(issues) {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const last30Days = new Date(now);
        last30Days.setDate(now.getDate() - 30);
        const last90Days = new Date(now);
        last90Days.setDate(now.getDate() - 90);
    
        const statisticsTotal = {
            unresolved: [],
            resolved: [],
            rejected: [],
            rejectedByTeam: [],
            created: [],
            verified: [],
            averageResolutionTime: 0,
            reports: 0
        };
    
        const currentMonthStatistics = JSON.parse(JSON.stringify(statisticsTotal));
        const last30daysStatistics = JSON.parse(JSON.stringify(statisticsTotal));
        const last90daysStatistics = JSON.parse(JSON.stringify(statisticsTotal));
    
        if (!issues || !Array.isArray(issues)) {
            console.error("[StatisticManager] getIssueStatistics requires an array of issues.");
            return { statisticsTotal, currentMonthStatistics, last30daysStatistics, last90daysStatistics };
        }
    
        let totalResolutionTime = 0;
        let resolvedCount = 0;
    
        const updateStatistics = (statistics, issue, createdDate, resolvedDate) => {
            if (issue.state === 'unresolved') {
                statistics.unresolved.push(issue);
                statistics.reports += issue.reports || 0;
            }
    
            if (issue.state === 'resolved') {
                statistics.resolved.push(issue);
                if (resolvedDate) {
                    statistics.totalResolutionTime = (statistics.totalResolutionTime || 0) + (resolvedDate - createdDate);
                    statistics.resolvedCount = (statistics.resolvedCount || 0) + 1;
                }
            }
    
            if (issue.state === 'rejected') {
                statistics.rejected.push(issue);
            }
    
            if (issue.status === 'Отклонен командой') {
                statistics.rejectedByTeam.push(issue);
            }
    
            if (issue.status !== 'Новый' && issue.state !== 'unresolved') {
                statistics.verified.push(issue);
            }
        };
    
        issues.forEach(issue => {
            const createdDate = new Date(issue.created);
            const resolvedDate = issue.resolved ? new Date(issue.resolved) : null;
    
            // Update Total Statistics
            updateStatistics(statisticsTotal, issue, createdDate, resolvedDate);
    
            // Update Current Month Statistics
            if (createdDate >= startOfCurrentMonth || (resolvedDate && resolvedDate >= startOfCurrentMonth)) {
                updateStatistics(currentMonthStatistics, issue, createdDate, resolvedDate);
            }
    
            // Update Last 30 Days Statistics
            if (createdDate >= last30Days || (resolvedDate && resolvedDate >= last30Days)) {
                updateStatistics(last30daysStatistics, issue, createdDate, resolvedDate);
            }
    
            // Update Last 90 Days Statistics
            if (createdDate >= last90Days || (resolvedDate && resolvedDate >= last90Days)) {
                updateStatistics(last90daysStatistics, issue, createdDate, resolvedDate);
            }
        });
    
        // Finalize Average Resolution Time Calculation
        const finalizeAverageResolutionTime = (statistics) => {
            if (statistics.resolvedCount > 0) {
                statistics.averageResolutionTime = 
                    (statistics.totalResolutionTime / statistics.resolvedCount) / (1000 * 60 * 60 * 24);
            }
            delete statistics.totalResolutionTime;
            delete statistics.resolvedCount;
        };
    
        finalizeAverageResolutionTime(statisticsTotal);
        finalizeAverageResolutionTime(currentMonthStatistics);
        finalizeAverageResolutionTime(last30daysStatistics);
        finalizeAverageResolutionTime(last90daysStatistics);
    
        return { statisticsTotal, currentMonthStatistics, last30daysStatistics, last90daysStatistics };
    }
    

    static getStatisticsFromIndex(index, issues, dateRange) {
        const { dateStart: startDate, dateEnd: endDate } = dateRange;
        const statistics = {
            unresolved: [],
            resolved: [],
            rejected: [],
            rejectedByTeam: [],
            created: [],
            verified: [],
            overdue: [],
            averageResolutionTime: 0,
            reports: 0
        };

        // Используем Set для быстрого поиска и исключения дубликатов
        const processedTasks = new Set();
        let totalResolutionTime = 0;
        let resolvedCount = 0;

        // Обработка созданных задач
        if (index.created) {
            Object.entries(index.created).forEach(([dateStr, taskIds]) => {
                const date = new Date(dateStr);
                if (date >= startDate && date <= endDate) {
                    taskIds.forEach(taskId => {
                        if (!processedTasks.has(taskId)) {
                            const issue = issues[taskId];
                            if (issue) {
                                statistics.created.push(issue);
                                processedTasks.add(taskId);
                            }
                        }
                    });
                }
            });
        }

        // Обработка решенных задач и подсчет среднего времени
        if (index.resolved) {
            Object.entries(index.resolved).forEach(([dateStr, taskIds]) => {
                const date = new Date(dateStr);
                if (date >= startDate && date <= endDate) {
                    taskIds.forEach(taskId => {
                        if (!processedTasks.has(taskId)) {
                            const issue = issues[taskId];
                            if (issue) {
                                statistics.resolved.push(issue);
                                processedTasks.add(taskId);

                                // Подсчет среднего времени решения
                                if (issue.created && issue.resolved) {
                                    const createdDate = new Date(issue.created);
                                    const resolvedDate = new Date(issue.resolved);
                                    totalResolutionTime += resolvedDate - createdDate;
                                    resolvedCount++;
                                }
                            }
                        }
                    });
                }
            });
        }

        // Обработка отклоненных задач
        if (index.rejected) {
            Object.entries(index.rejected).forEach(([dateStr, taskIds]) => {
                const date = new Date(dateStr);
                if (date >= startDate && date <= endDate) {
                    taskIds.forEach(taskId => {
                        if (!processedTasks.has(taskId)) {
                            const issue = issues[taskId];
                            if (issue) {
                                if (issue.team) {
                                    statistics.rejectedByTeam.push(issue);
                                } else {
                                    statistics.rejected.push(issue);
                                }
                                processedTasks.add(taskId);
                            }
                        }
                    });
                }
            });
        }

        // Обработка состояний (verified, unresolved, overdue)
        if (index.state) {
            Object.entries(index.state).forEach(([state, taskIds]) => {
                taskIds.forEach(taskId => {
                    if (!processedTasks.has(taskId)) {
                        const issue = issues[taskId];
                        if (issue) {
                            const createdDate = new Date(issue.created);
                            if (createdDate >= startDate && createdDate <= endDate) {
                                switch (state) {
                                    case 'verified':
                                        statistics.verified.push(issue);
                                        break;
                                    case 'unresolved':
                                        statistics.unresolved.push(issue);
                                        statistics.reports += issue.reports || 0;
                                        // Проверка на просроченные
                                        if (issue.slaDate && new Date(issue.slaDate) < new Date()) {
                                            statistics.overdue.push(issue);
                                        }
                                        break;
                                }
                                processedTasks.add(taskId);
                            }
                        }
                    }
                });
            });
        }

        // Вычисление среднего времени решения
        statistics.averageResolutionTime = resolvedCount > 0 
            ? totalResolutionTime / resolvedCount 
            : 0;

        console.log('Processing statistics for range:', { startDate, endDate });
        console.log('Index structure:', Object.keys(index));
        console.log('Number of issues:', Object.keys(issues).length);
        console.log('Processed tasks:', processedTasks.size);

        return statistics;
    }

    
}