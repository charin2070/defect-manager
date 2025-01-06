class StatisticManager extends Refact {
    constructor() {
        super(document.body);   
    }

    static async updateStatistics(indexedIssues) {
        log(indexedIssues, '[StatisticManager.updateStatistics] Updating statistics with indexed issues...');

        return new Promise((resolve, reject) => {
            if (!indexedIssues || typeof indexedIssues !== 'object') {
                log(indexedIssues, '[StatisticManager] updateStatistics requires a indexed issues object.');
                reject(new Error('Invalid input data'));
                return;
            }

            const issueStatistics = {
                currentMonth: null,
                last30days: null,
                last90days: null,
                total: null
            };

            try {
                // Получаем текущую дату и начало месяца
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const last30Days = new Date(now.setDate(now.getDate() - 30));
                const last90Days = new Date(now.setDate(now.getDate() - 90));

                // Обрабатываем каждый период
                issueStatistics.currentMonth = this.getIssueStatistics(indexedIssues, { 
                    dateStart: startOfMonth,
                    dateEnd: new Date()
                });
                issueStatistics.last30days = this.getIssueStatistics(indexedIssues, {
                    dateStart: last30Days,
                    dateEnd: new Date()
                });
                issueStatistics.last90days = this.getIssueStatistics(indexedIssues, {
                    dateStart: last90Days,
                    dateEnd: new Date()
                });
                issueStatistics.total = indexedIssues;

                log(issueStatistics, '[StatisticManager] Statistics updated');
                resolve(issueStatistics);
            } catch (error) {
                reject(error);
            }
        });
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

    static async getIssueStatistics(issues, dateRange) {
        if (!issues || !issues.index || !issues.issues) {
            log(issues, '[StatisticManager] getIssueStatistics requires an object with index and issues.'); 
            console.error("[StatisticManager] getIssueStatistics requires an object with index and issues.");
            return null;
        }

        return {
            index: issues.index,
            issues: issues.issues
        };
    }

    static getStatisticsFromIndex(index, issues, dateRange) {
        if (!index || !issues) {
            log({ index, issues }, '[StatisticManager.getStatisticsFromIndex] Invalid input');
            return null;
        }

        const statistics = {
            unresolved: [],
            resolved: [],
            rejected: [],
            created: [],
            index: index,
            issues: issues
        };

        // Подсчитываем статистику только если есть диапазон дат
        if (dateRange) {
            const { dateStart, dateEnd } = dateRange;
            
            // Фильтруем задачи по дате создания
            if (index.created) {
                Object.entries(index.created)
                    .filter(([date]) => {
                        const taskDate = new Date(date);
                        return taskDate >= dateStart && taskDate <= dateEnd;
                    })
                    .forEach(([_, taskIds]) => {
                        taskIds.forEach(taskId => {
                            if (issues[taskId]) {
                                statistics.created.push(issues[taskId]);
                            }
                        });
                    });
            }
        }

        // Добавляем общую статистику независимо от дат
        if (index.state) {
            ['unresolved', 'resolved', 'rejected'].forEach(state => {
                if (index.state[state]) {
                    index.state[state].forEach(taskId => {
                        if (issues[taskId]) {
                            statistics[state].push(issues[taskId]);
                        }
                    });
                }
            });
        }

        return statistics;
    }
}