class TrendManager {
    constructor() {
        this.trends = {};
    }

    /**
     * Получает тренды на основе массива нерешенных отчетов
     * @param {Array} unresolvedReports - Массив нерешенных отчетов
     * @returns {Object} Объект с трендами
     */
    getTrends(unresolvedReports) {
        if (!unresolvedReports || !unresolvedReports.length) {
            return {
                daily: 0,
                weekly: 0,
                monthly: 0
            };
        }

        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const daily = this.calculateTrend(unresolvedReports, oneDayAgo);
        const weekly = this.calculateTrend(unresolvedReports, oneWeekAgo);
        const monthly = this.calculateTrend(unresolvedReports, oneMonthAgo);

        return {
            daily,
            weekly,
            monthly
        };
    }

    /**
     * Вычисляет тренд для заданного периода
     * @param {Array} reports - Массив отчетов
     * @param {Date} startDate - Начальная дата периода
     * @returns {number} Процент изменения
     */
    calculateTrend(reports, startDate) {
        const recentReports = reports.filter(report => {
            const reportDate = new Date(report.date);
            return reportDate >= startDate;
        });

        if (recentReports.length === 0) return 0;

        const totalReports = recentReports.reduce((sum, report) => sum + report.reports, 0);
        const averageReports = reports.reduce((sum, report) => sum + report.reports, 0) / reports.length;

        if (averageReports === 0) return 0;

        // Вычисляем процент изменения
        return ((totalReports - averageReports) / averageReports) * 100;
    }
}
