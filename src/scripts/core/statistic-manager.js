class StatisticManager {
    constructor() {
        this.refact = null;
    }

    bind(refact) {
        this.refact = refact;
        return this;
    }

    static getUnresolvedDefects() {
        const state = Refact.getInstance().state;
        const issues = state.index?.defect?.state?.unresolved || [];
        return {
            count: issues.length,
            issues: issues
        };
    }

    static getByDateRange(dateRange) {
        const state = Refact.getInstance().state;
        if (!state.index?.defect?.all) return { count: 0, issues: [] };

        let result = { count: 0, issues: [] };
        const flatIssues = Object.values(state.index.defect.all);

        result.issues = flatIssues.filter(issue => 
            isInDateRange(issue.creation, dateRange) || 
            isInDateRange(issue.resolution, dateRange)
        );
        result.count = result.issues.length;

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
   
    static getBacklog() {
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
            result[date] = runningBacklog;
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
