class StatisticManager extends Reactive {
    constructor(issues) {
        super(document.body);
        this.issues = issues;     
            
        if (this.issues) {
            this.updateStatistics(this.issues);
        }

        this.setupSubscriptions();

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

    statistics = {
        index: {},
        lastMonth: {
            unresolved: [],
            resolved: [],
            rejected: [],
        },
        currentMonth: {
            unresolved: [],
            resolved: [],
            rejected: [],
        },
        total: {
            unresolved: [],
            resolved: [],
            rejected: [],
        }
    }

    

    updateStatistics(issues) {
        log(issues, '[Statistic Manager] Updating statistics');
        
        if (!issues || !Array.isArray(issues)) {
            console.warn('[StatisticManager] updateStatistics requires a defined array of issues');
            return;
        }

        const statistics = {
            defects: {
                lastMonth: StatisticManager.getIssueStatistics(
                    IndexManager.getIssues({ 
                        type: 'defect', 
                        creation: IndexManager.getDateFilter('last_month')
                    }, issues)
                ),
                currentMonth: StatisticManager.getIssueStatistics(
                    IndexManager.getIssues({ 
                        type: 'defect', 
                        creation: IndexManager.getDateFilter('current_month')
                    }, issues)
                ),
                total: StatisticManager.getIssueStatistics(
                    IndexManager.getIssues({ 
                        type: 'defect' 
                    }, issues)
                )
            },  
            requests: {
                lastMonth: StatisticManager.getIssueStatistics(
                    IndexManager.getIssues({ 
                        type: 'request', 
                        creation: IndexManager.getDateFilter('last_month')
                    }, issues)
                ),
                currentMonth: StatisticManager.getIssueStatistics(
                    IndexManager.getIssues({ 
                        type: 'request', 
                        creation: IndexManager.getDateFilter('current_month')
                    }, issues)
                ),
                total: StatisticManager.getIssueStatistics(
                    IndexManager.getIssues({ 
                        type: 'request' 
                    }, issues)
                )
            }
        };

        this.setState({ statistics: statistics }, '[StatisticManager] updateStatistics');
        log(statistics, '[StatisticManager] Statistics updated');
    }

    static getIssueStatistics(issues, dateRanges = []) {
        if (!issues || !Array.isArray(issues)) {
            log(issues, '[StatisticManager] calculateIssueStatistics requires an array of issues');
            return null;
        }

        const calculateStatistics = (filteredIssues) => {
            const stats = {
                unresolved: [],
                resolved: [],
                rejected: [],
                rejectedByTeam: [],
                reports: 0
            };

            filteredIssues.forEach(issue => {
                if (!issue) return;

                const state = issue.state || 'unresolved';
                switch(state.toLowerCase()) {
                    case 'unresolved':
                        stats.unresolved.push(issue); 
                        break;
                    case 'resolved':
                        stats.resolved.push(issue); 
                        break;
                    case 'rejected':
                        stats.rejected.push(issue); 
                        break;
                    default:
                        stats.unresolved.push(issue);
                }

                switch(issue.status){
                    case 'Отклонен':
                        stats.rejectedByTeam.push(issue);
                        break;
                }
                
                stats.reports += parseInt(issue.reports) || 0;
            });

            return stats;
        };

        if (dateRanges.length > 0) {
            return dateRanges.map(dateFilter => {
                const filteredIssues = issues.filter(issue => {
                    const issueDate = new Date(issue.created);
                    return issueDate >= dateFilter.startDate && issueDate <= dateFilter.endDate;
                });
                return calculateStatistics(filteredIssues);
            });
        }

        return calculateStatistics(issues);
    }
}