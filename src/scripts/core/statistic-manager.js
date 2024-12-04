class StatisticManager {
    constructor(issues = []) {
        this.issues = issues;
    }

    /**
     * Группирует задачи по датам создания
     * @param {Array} issues - массив задач для группировки (опционально, если не передан использует this.issues)
     * @returns {Object} объект, где ключи - даты в формате ISO, значения - задачи
     */
    groupIssuesByDate(issues = this.issues) {
        // Создаем копию массива, чтобы не мутировать оригинальный
        const sortedIssues = [...issues];
        
        // Сортируем по дате создания (от старых к новым)
        sortedIssues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Группируем по датам
        return sortedIssues.reduce((acc, issue) => {
            // Получаем дату в формате ISO (YYYY-MM-DD)
            const date = new Date(issue.createdAt).toISOString().split('T')[0];
            
            // Если для этой даты еще нет массива задач, создаем его
            if (!acc[date]) {
                acc[date] = [];
            }
            
            // Добавляем задачу в соответствующий массив
            acc[date].push(issue);
            
            return acc;
        }, {});
    }

    /**
     * Получает статистику задач за указанный период
     * @param {number} days - количество дней для анализа
     * @param {Array} issues - массив задач (опционально)
     * @returns {Object} сгруппированные задачи за указанный период
     */
    getStatisticsByPeriod(days, issues = this.issues) {
        const now = new Date();
        const startDate = new Date(now.setDate(now.getDate() - days));
        
        // Фильтруем задачи за указанный период
        const filteredIssues = issues.filter(issue => {
            const issueDate = new Date(issue.createdAt);
            return issueDate >= startDate;
        });
        
        return this.groupIssuesByDate(filteredIssues);
    }

    /**
     * Получает общую статистику по задачам
     * @returns {Object} объект с различными статистическими данными
     */
    getStatistics() {
        const total = this.issues.length;
        const open = this.issues.filter(issue => !issue.closedAt).length;
        const closed = this.issues.filter(issue => issue.closedAt).length;
        
        // Считаем просроченные задачи (если есть dueDate и она меньше текущей даты)
        const overdue = this.issues.filter(issue => {
            if (!issue.dueDate || issue.closedAt) return false;
            return new Date(issue.dueDate) < new Date();
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

        // Статистика по времени закрытия (в днях)
        const closingTimes = this.issues
            .filter(issue => issue.closedAt)
            .map(issue => {
                const created = new Date(issue.createdAt);
                const closed = new Date(issue.closedAt);
                return Math.ceil((closed - created) / (1000 * 60 * 60 * 24)); // в днях
            });

        const avgClosingTime = closingTimes.length 
            ? closingTimes.reduce((sum, time) => sum + time, 0) / closingTimes.length 
            : 0;

        // Получаем статистику по периодам
        const last30Days = this.getStatisticsByPeriod(30);
        const last90Days = this.getStatisticsByPeriod(90);

        return {
            total,
            open,
            closed,
            overdue,
            byPriority,
            byStatus,
            avgClosingTime,
            trends: {
                last30Days,
                last90Days
            }
        };
    }
}