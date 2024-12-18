class StatisticManager extends Reactive {
    constructor() {
        super();
        this.state = {
            statistics: null
        };
    }

    static async updateStatistics(indexedIssues) {
        log(indexedIssues, '[StatisticManager.updateStatistics] Updating statistics with indexed issues...');

        if (!indexedIssues || typeof indexedIssues !== 'object') {
            log(indexedIssues, '[StatisticManager] updateStatistics requires a indexed issues object.');
            throw new Error('Invalid input data');
        }

        try {
            // Get current date and calculate period dates
            const now = new Date();
            const last30Days = new Date(now);
            last30Days.setDate(now.getDate() - 30);
            
            const last90Days = new Date(now);
            last90Days.setDate(now.getDate() - 90);
            
            const last180Days = new Date(now);
            last180Days.setDate(now.getDate() - 180);

            // Get all issues from the indexed data
            let allIssues = [];
            
            // Handle different input formats
            if (Array.isArray(indexedIssues)) {
                // If input is array of issues
                allIssues = indexedIssues;
            } else if (indexedIssues.issues && Array.isArray(indexedIssues.issues)) {
                // If input has issues array property
                allIssues = indexedIssues.issues;
            } else if (typeof indexedIssues === 'object') {
                // If input is object with issue entries
                allIssues = Object.values(indexedIssues).filter(item => 
                    item && typeof item === 'object' && item.taskId && item.created
                );
            }

            log(allIssues, '[StatisticManager] Processing issues:', allIssues.length);

            if (!allIssues.length) {
                log('[StatisticManager] No valid issues found in input data');
                return {
                    last30days: { index: {}, issues: [] },
                    last90days: { index: {}, issues: [] },
                    last180days: { index: {}, issues: [] },
                    total: { index: {}, issues: [] }
                };
            }

            // Filter issues for each period
            const filterIssuesByDate = (issues, startDate) => {
                return issues.filter(issue => {
                    if (!issue || !issue.created) return false;
                    const issueDate = new Date(issue.created);
                    return issueDate >= startDate && issueDate <= now;
                });
            };

            // Create period-specific issue arrays
            const last30DaysIssues = filterIssuesByDate(allIssues, last30Days);
            const last90DaysIssues = filterIssuesByDate(allIssues, last90Days);
            const last180DaysIssues = filterIssuesByDate(allIssues, last180Days);

            log('[StatisticManager] Filtered issues:', {
                total: allIssues.length,
                last30: last30DaysIssues.length,
                last90: last90DaysIssues.length,
                last180: last180DaysIssues.length
            });

            // Get structured indexes for each period
            const last30DaysIndex = await IndexManager.getStructuredIndex(last30DaysIssues);
            const last90DaysIndex = await IndexManager.getStructuredIndex(last90DaysIssues);
            const last180DaysIndex = await IndexManager.getStructuredIndex(last180DaysIssues);
            const totalIndex = await IndexManager.getStructuredIndex(allIssues);

            // Create statistics object with all periods
            const statistics = {
                last30days: {
                    index: last30DaysIndex,
                    issues: last30DaysIssues
                },
                last90days: {
                    index: last90DaysIndex,
                    issues: last90DaysIssues
                },
                last180days: {
                    index: last180DaysIndex,
                    issues: last180DaysIssues
                },
                total: {
                    index: totalIndex,
                    issues: allIssues
                }
            }

            this.setState({ statistics }, '[StatisticManager.updateStatistics]');   

            log(statistics, '[StatisticManager] Statistics updated');
            return statistics;
        } catch (error) {
            log(error, '[StatisticManager] Error updating statistics');
            throw error;
        }
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
        "description": "10.08 по инструментам проставился запрет на торговлю инструментом, \р  подробнее в [https://rc.alfa-bank.net/channel/adir-avarii?msg=AvtnNSMQZRMhGMtdX]",
        "summary": "Изменение IdTradePeriodStatus в [AdFront].[fi].[FinInfoExt] и [AdFront].[ts].[FinInfoExt]",
        "type": "Дефект промсреды",
        "priority": null,
        "assignee": "U_M00ZM",
        "reporter": null,
        "team": "Core",
        "isOverdue": null,
        "source": "ADIRINC-1203,3529833,U_M00ZM,Закрыт,10.08.2023 13:17,,,,,Дефект промсреды,07.02.2024 11:49,2023-11-02 00:00:00.0,\"10.08 по инструментам проставился запрет на торговлю инструментом, \р  подробнее в [https://rc.alfa-bank.net/channel/adir-avarii?msg=AvtnNSMQZRMhGMtdX]\",,67.0,Core,,Изменение IdTradePeriodStatus в [AdFront].[fi].[FinInfoExt] и [AdFront].[ts].[FinInfoExt],Портфель - Некорректный состав портфеля (вкл. некорректный минус по счету) (1) - critical,,,08.08.2024 23:49",
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

    static getFlatStatistics(index) {
        if (!index) {
            log({ index, issues }, '[StatisticManager.getStatisticsFromIndex] Index is null');
            return null;
        }

    }

    static getStatisticsFromIndex(index, filters = {type: 'defect', dateRange: IndexManager.getDateFilter("all_time")}) {
        if (!index) {
            log({ index, issues }, '[StatisticManager.getStatisticsFromIndex] Index is null');
            return null;
        }

        const statistics = {
            unresolved: [],
            resolved: [],
            rejected: [],
            rejectedByTeam: [],
            created: [],
            slaOverdue: [],
            averageResolutionTime: 0,
            reports: 0,
            activeReports: 0,
            reportsTop: 0,
            reportsDynamic: null,
            slaAchieved: []
        };

        const { dateStart, dateEnd } = filters.dateRange;
        const issues = Object.values(index.id).flat();
        log(issues, '[StatisticManager.getStatisticsFromIndex] Filtered issues');

        // Created
        issues.forEach(issue => {
            if (issue) {
                const issueDate = new Date(issue.created);
                if (issueDate >= dateStart && issueDate <= dateEnd) {
                statistics.created.push(issue);
            }

            // Resolved
            if (issue.state === "resolved") {
                if (isInDateRange(issue.resolved, dateStart, dateEnd))
                    statistics.resolved.push(issue);
            } else {
                if (issue.state === "unresolved" && isInDateRange(issue.created, dateStart, dateEnd) && issue.status !== "Отклонен")
                    statistics.unresolved.push(issue);
            }

            // Rejected
            if (issue.state === "rejected") {
                if (isInDateRange(issue.resolved, dateStart, dateEnd)) {
                }
            }

            // Rejected by team
            if (issue.status === "Отклонен командой" && isInDateRange(issue.created, dateStart, dateEnd))
                    statistics.rejectedByTeam.push(issue);
             
            // SLA overdue
            if (issue.state === "unresolved" && isInDateRange(issue.slaDate, dateStart, dateEnd) && new Date(issue.created) > new Date(issue.slaDate)) {
                statistics.slaOverdue.push(issue);
            } else {
                statistics.slaAchieved.push(issue);
            }
            
            // Average resolution time
            if (issue.state === "resolved" && isInDateRange(issue.resolved, dateStart, dateEnd)) {
                const createdDate = new Date(issue.created);
                const resolvedDate = new Date(issue.resolved);
                statistics.averageResolutionTime += (resolvedDate - createdDate) / (1000 * 60 * 60 * 24); // Перевод миллисекунд в дни
            }

            // Reports
            if (isInDateRange(issue.created, dateStart, dateEnd)) {
                statistics.reports += issue.reports;
            }

            // Active reports
            if (issue.state === "unresolved" && isInDateRange(issue.created, dateStart, dateEnd) && issue.reports > 0) {
                statistics.activeReports += 1;
            }

            // Reports top
            if (issue.state === "unresolved" && isInDateRange(issue.created, dateStart, dateEnd) && issue.reports > 0) {
                statistics.reportsTop[issue.taskId] += issue.reports;
            }

            // Reports dynamic
            if (issue.state === "unresolved" && isInDateRange(issue.created, dateStart, dateEnd) && issue.reports > 0) {
                statistics.reportsDynamic[issue.taskId] = StatisticManager.getDynamicReports(issue);
            }
            }
        }); 
    }
}