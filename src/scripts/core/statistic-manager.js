class StatisticManager {
    constructor(issues = []) {
        this.issues = issues;
        this.init();
    }

    init(){
        this.types = {
            defects: this.statistics,
            requests: this.statistics,
            all: this.statistics
        }

        this.statistics = {
            total: this.values,
            currentMonth: this.values,
            lastMonth: this.values,
            last30Days: this.values,
            last90Days: this.values,
            last180Days: this.values
        }

        this.values = {
            resolved: [],
            unresolved: [],
            rejected: [],
            rejectedByTeam: [],
            total: [],
            slaDate: [],
            resolutionTime: [],
            backlogCount: 0,
            reportsCount: 0,
        }
    }

    static getFullStatistics(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] getFullStatistics requires an array of issues');
        }

        const calculateCreatedCount = (filteredIssues) => filteredIssues.length;
        const calculateCompletedCount = (filteredIssues) => filteredIssues.filter(issue => {
            const resolvedDate = new Date(issue.resolved);
            return !isNaN(resolvedDate) && ['resolved', 'rejected'].includes(issue.status);
        }).length;
        const calculateBacklog = (created, resolved, rejected) => created - (resolved + rejected);

        const filterUnresolvedIssues = (filteredIssues) => filteredIssues.filter(issue => issue.state === 'unresolved');

        return {
            total: {
                ...this.calculateStatistics(issues),
                unresolvedIssues: filterUnresolvedIssues(issues)
            },
            currentMonth: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setDate(1)), new Date(), issues))
            },
            lastMonth: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), new Date(new Date().setDate(0)), issues))
            },
            last30Days: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date(), issues))
            },
            last90Days: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 90)), new Date(), issues))
            },
            last180Days: {
                ...this.calculateStatistics(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues)),
                created: calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues)),
                backlog: calculateBacklog(
                    calculateCreatedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues)),
                    calculateCompletedCount(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues))
                ),
                unresolvedIssues: filterUnresolvedIssues(this.filterIssuesByDate(new Date(new Date().setDate(new Date().getDate() - 180)), new Date(), issues))
            }
        };
    }

    static filterIssuesByDate(startDate, endDate, issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] filterIssuesByDate requires an array of issues');
        }

        if (!(startDate instanceof Date) || isNaN(startDate)) {
            throw new Error('[StatisticManager] Invalid startDate');
        }

        if (!(endDate instanceof Date) || isNaN(endDate)) {
            throw new Error('[StatisticManager] Invalid endDate');
        }

        return issues.filter(issue => {
            if (!issue.created) {
                console.Error(`[StatisticManager] Missing created date for issue: ${issue.id}`);
                return false;
            }
            const created = new Date(issue.created);
            if (isNaN(created)) {
                console.warn(`[StatisticManager] Invalid date for issue: ${issue.id}, date value: ${issue.created}`);
                return false;
            }
            return created >= startDate && created <= endDate;
        });
    }

    static calculateStatistics(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] calculateStatistics requires an array of issues');
        }

        const stateGroups = this.groupByState(issues);
        
        return {
            total: issues.length,
            resolved: stateGroups.resolved || 0,
            unresolved: stateGroups.unresolved || 0,
            rejected: stateGroups.rejected || 0,
            reportsCount: this.getReportsCount(issues.filter(i => i.state === 'unresolved')),
            slaDate: this.groupBySlaDate(issues),
            resolutionTime: this.getAverageTime(issues, 'resolved')
        };
    }

    static isDateInRange(date, startDate, endDate) {
        return date >= startDate && date <= endDate;
    }

    static groupBySlaDate(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] groupBySlaDate requires an array of issues');
        }

        return issues.reduce((acc, issue) => {
            if (issue.slaDate) {
                acc[issue.slaDate] = (acc[issue.slaDate] || 0) + 1;
            }
            return acc;
        }, {});
    }

    static getAverageTime(issues, property) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] getAverageTime requires an array of issues');
        }

        if (issues.length === 0) return 0;
        
        const total = issues.reduce((sum, issue) => sum + (issue[property] || 0), 0);
        return total / issues.length;
    }

    static getReportsCount(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] getReportsCount requires an array of issues');
        }
        
        return issues.reduce((sum, issue) => sum + (parseInt(issue.reports) || 0), 0);
    }

    static groupByState(issues) {
        if (!Array.isArray(issues)) {
            throw new Error('[StatisticManager] groupByState requires an array of issues');
        }
        
        return issues.reduce((acc, issue) => {
            acc[issue.state] = (acc[issue.state] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Группирует задачи по датам создания
     * @param {Array} issues - массив задач для группировки (опционально, если не передан использует this.issues)
     * @returns {Object} объект, где ключи - даты в формате ISO, значения - задачи
     */
    groupIssuesByDate(issues = this.issues) {
        // Copy array
        const sortedIssues = [...issues];

        sortedIssues.sort((a, b) => new Date(a.created) - new Date(b.created));
        return sortedIssues.reduce((acc, issue) => {
            // Validate date
            try {
                const date = new Date(issue.created);
                if (isNaN(date.getTime())) {
                    console.warn('⚠️ [StatisticManager] Invalid date found:', issue.created, 'for issue:', issue.id);
                    return acc;
                }
                
                // Format YYYY-MM-DD
                const isoDate = date.toISOString().split('T')[0];
                
                // New date
                if (!acc[isoDate]) {
                    acc[isoDate] = [];
                }
                
                // Добавляем задачу в соответствующий массив
                acc[isoDate].push(issue);
            } catch (error) {
                console.warn('⚠️ [StatisticManager] Error processing date for issue:', issue.id, error);
            }
            
            return acc;
        }, {});
    }

    /**
     * Получает статистику задач за указанный период
     * @param {number} days - количество дней для анализа
     * @param {Array} issues - массив задач (опционально)
     * @returns {Object} сгруппированные задачи за указанный период
     */
    static getStatisticsByPeriod(days, issues = this.issues) {
        const now = new Date();
        const startDate = new Date(now.setDate(now.getDate() - days));
        
        // Фильтруем задачи за указанный период
        const filteredIssues = issues.filter(issue => {
            try {
                const issueDate = new Date(issue.created);
                if (isNaN(issueDate.getTime())) {
                    console.warn('⚠️ Invalid date found:', issue.created, 'for issue:', issue.id);
                    return false;
                }
                return issueDate >= startDate;
            } catch (error) {
                console.warn('⚠️ Error processing date for issue:', issue.id, error);
                return false;
            }
        });
        
        return this.groupIssuesByDate(filteredIssues);
    }

    /**
     * Получает общую статистику по задачам
     * @param {Array} issues - массив задач (опционально)
     * @returns {Object} объект с различными статистическими данными
     */
    static getStatistics(issues = this.issues) {
        const total = issues.length;
        const unresolved = issues.filter(issue => issue.status !== 'resolved').length;
        const closed = issues.filter(issue => issue.status === 'resolved').length;
        
        // Считаем просроченные задачи (если есть slaDate и она меньше текущей даты)
        const overdue = issues.filter(issue => {
            if (!issue.slaDate || issue.status === 'resolved') return false;
            return new Date(issue.slaDate) < new Date();
        }).length;

        // Группируем по приоритетам
        const byPriority = this.issues.reduce((acc, issue) => {
            const priority = issue.priority || 'none';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {});

        // Группируем по статусам
        const byStatus = this.issues.reduce((acc, issue) => {
            const status = issue.status || 'none';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Группируем по командам
        const byTeam = this.issues.reduce((acc, issue) => {
            const team = issue.team || 'none';
            acc[team] = (acc[team] || 0) + 1;
            return acc;
        }, {});

        // Статистика по времени закрытия (в днях)
        const closingTimes = this.issues
            .filter(issue => issue.status === 'resolved')
            .map(issue => {
                const created = new Date(issue.created);
                const resolved = new Date(issue.resolved);
                return Math.ceil((resolved - created) / (1000 * 60 * 60 * 24)); // в днях
            });

        const avgClosingTime = closingTimes.length 
            ? closingTimes.reduce((sum, time) => sum + time, 0) / closingTimes.length 
            : 0;

        // Получаем статистику по периодам
        const last30Days = this.getStatisticsByPeriod(30);
        const last90Days = this.getStatisticsByPeriod(90);

        return {
            total,
            open: unresolved,
            closed,
            overdue,
            byPriority,
            byStatus,
            byTeam,
            avgClosingTime,
            trends: {
                last30Days,
                last90Days
            }
        };
    }

    static indexIssues(issues) {
        const indexes = {
            byId: new Map(),
            byCreationDate: new Map(),
            byResolvedDate: new Map()
        };

        if (!Array.isArray(issues)) {
            console.warn('indexIssues: Input is not an array:', issues);
            return indexes;
        }

        issues.forEach(issue => {
            // Index by ID
            indexes.byId.set(issue.id, issue);

            // Parse dates
            const creationDate = issue.created ? new Date(issue.created).toISOString().split('T')[0] : null;
            const resolvedDate = issue.resolved ? new Date(issue.resolved).toISOString().split('T')[0] : null;

            // Index by creation date
            if (creationDate) {
                if (!indexes.byCreationDate.has(creationDate)) {
                    indexes.byCreationDate.set(creationDate, []);
                }
                indexes.byCreationDate.get(creationDate).push(issue);
            }

            // Index by resolution date
            if (resolvedDate) {
                if (!indexes.byResolvedDate.has(resolvedDate)) {
                    indexes.byResolvedDate.set(resolvedDate, []);
                }
                indexes.byResolvedDate.get(resolvedDate).push(issue);
            }
        });

        return indexes;
    }

    /**
     * Gets reports statistics for different time periods
     * @param {Array} issues - array of issues (optional)
     * @returns {Object} statistics about reports for different periods
     */
    static getReportsStatistics(issues = this.issues) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get start dates for different periods
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const startOfThreeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
        const startOfSixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);

        // Initialize statistics object
        const statistics = {
            unresolvedReports: 0,
            currentMonthReports: 0,
            lastMonthReports: 0,
            lastThreeMonthsReports: 0,
            lastSixMonthsReports: 0
        };

        issues.forEach(issue => {
            try {
                const createdDate = new Date(issue.created);
                const reports = parseInt(issue.reports) || 0;

                // Count unresolved reports
                if (issue.status !== 'resolved') {
                    statistics.unresolvedReports += reports;
                }

                // Count reports for different time periods
                if (createdDate >= startOfCurrentMonth) {
                    statistics.currentMonthReports += reports;
                }
                if (createdDate >= startOfLastMonth && createdDate < startOfCurrentMonth) {
                    statistics.lastMonthReports += reports;
                }
                if (createdDate >= startOfThreeMonthsAgo) {
                    statistics.lastThreeMonthsReports += reports;
                }
                if (createdDate >= startOfSixMonthsAgo) {
                    statistics.lastSixMonthsReports += reports;
                }
            } catch (error) {
                console.warn('⚠️ Error processing reports for issue:', issue.id, error);
            }
        });

        return statistics;
    }

    /**
     * Gets detailed reports statistics including trends
     * @param {Array} issues - array of issues (optional)
     * @returns {Object} detailed reports statistics
     */
    static getDetailedReportsStatistics(issues = this.issues) {
        const basicStats = this.getReportsStatistics(issues);
        const monthlyAverage = Math.round(basicStats.lastSixMonthsReports / 6);
        const monthlyTrend = basicStats.currentMonthReports - basicStats.lastMonthReports;

        return {
            ...basicStats,
            monthlyAverage,
            monthlyTrend,
            trendDirection: monthlyTrend > 0 ? 'up' : monthlyTrend < 0 ? 'down' : 'stable'
        };
    }
}