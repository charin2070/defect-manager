class StatisticManager extends Reactive {
    constructor(issues) {
        super(document.body);
        this.issues = issues;     
            
        if (this.issues) {
            this.updateIndex(this.issues).then((index)=> {
                this.index = index;
                this.setState({ index: this.index }, 'StatisticManager.updateIndex');
                this.updateStatistics(index);
            });
        }

        this.setupSubscriptions();
    }

    setupSubscriptions() {
        this.subscribe('data', (issues) => {
            this.updateStatistics(issues);
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

    static filterIssues(filter, issues) {
        if (!issues || !Array.isArray(issues)) {
            log(issues, '[StatisticManager] filterIssues requires an array of issues');
            return [];
        }

        return issues.filter(issue => {
            for (const [field, condition] of Object.entries(filter)) {
                // Handle date range filters
                if (field === 'creation' || field === 'resolved') {
                    const dateField = field === 'creation' ? 'created' : 'resolved';
                    const issueDate = new Date(issue[dateField]);
                    
                    if (condition.startDate && new Date(condition.startDate) > issueDate) {
                        return false;
                    }
                    if (condition.endDate && new Date(condition.endDate) < issueDate) {
                        return false;
                    }
                }
                // Handle relative date filters (e.g., last 30 days)
                else if (field === 'creationDate' || field === 'resolvedDate') {
                    const dateField = field === 'creationDate' ? 'created' : 'resolved';
                    const issueDate = new Date(issue[dateField]);
                    const daysAgo = condition;
                    
                    if (!issueDate) continue;
                    
                    const compareDate = new Date();
                    compareDate.setDate(compareDate.getDate() + daysAgo);
                    
                    if (daysAgo < 0 && issueDate < compareDate) {
                        return false;
                    } else if (daysAgo > 0 && issueDate > compareDate) {
                        return false;
                    }
                }
                // Handle numeric comparisons
                else if (typeof issue[field] === 'number') {
                    if (typeof condition === 'string') {
                        const operator = condition.substring(0, 2);
                        const value = parseFloat(condition.substring(2));
                        
                        switch(operator) {
                            case '>=': if (!(issue[field] >= value)) return false; break;
                            case '<=': if (!(issue[field] <= value)) return false; break;
                            case '==': if (!(issue[field] === value)) return false; break;
                            case '!=': if (!(issue[field] !== value)) return false; break;
                            default:
                                if (condition.startsWith('>')) {
                                    if (!(issue[field] > parseFloat(condition.substring(1)))) return false;
                                } else if (condition.startsWith('<')) {
                                    if (!(issue[field] < parseFloat(condition.substring(1)))) return false;
                                }
                        }
                    } else if (typeof condition === 'number') {
                        if (issue[field] !== condition) return false;
                    }
                }
                // Handle team filter
                else if (field === 'team' && condition !== 'all') {
                    if (issue.team !== condition) return false;
                }
                // Handle simple equality comparisons
                else if (issue[field] !== condition) {
                    return false;
                }
            }
            return true;
        });
    }

    updateStatistics(issues) {
        log(issues, '[Statistic Manager] Updating statistics');
        
        if (!issues) {
            log(issues, '[StatisticManager] updateStatistics requires an array of issues');
            return;
        }

        totalStatistics = StatisticManager.calculateStatistics(issues);
        last30daysIssues = StatisticManager.filterIssues({creationDate: -30, resolvedDate: -30, team: 'all'}, issues);

        this.statistics = {
            lastMonth: {
                unresolved: null,
                resolved: null,
                rejected: null,
            },
            currentMonth: {
                unresolved: null,
                resolved: null,
                rejected: null,
            },
            total: {
                unresolved: null,
                resolved: null,
                rejected: null,
            }
        }

        this.setState({ statistics: this.statistics }, 'StatisticManager.updateStatistics');
        log(this.statistics, '[StatisticManager] Statistics updated');
    }
    

    
}   