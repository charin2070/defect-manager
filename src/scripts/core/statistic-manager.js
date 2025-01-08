class StatisticManager {
    constructor() {
       
    }

    static getUnresolvedDefects(indexedIssues) {
        let result = { count: 0, issues: [] };
        result.count = indexedIssues.defect.state.unresolved.length;
        result.issues = indexedIssues.defect.state.unresolved;
        return result;
    }

    static getByDateRange(dateRange, indexedIssues) {
        let result = { count: 0, issues: [] };
        const flatIssues = Object.values(indexedIssues).flat();

        result.issues = flatIssues.filter(issue => isInDateRange(issue.creation, dateRange) || isInDateRange(issue.resolution, dateRange));
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
   
    static getBacklog(indexedIssues) {
        const created = indexedIssues.defect.created;
        const resolved = indexedIssues.defect.resolved;
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
        
                result[date] = {
                    created: createdCount,
                    resolved: resolvedCount,
                    backlog: runningBacklog
                };
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
