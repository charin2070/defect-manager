class StatisticManager {
    constructor() {
        this.refact = null;
    }

    bind(refact) {
        this.refact = refact;
        return this;
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
