class TrendManager {
    constructor() {
        this.months = [
            'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
            'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
        ];
    }

    // Пример данных: дата и количество жалоб
    complaintsPerDay = [
        { date: "2022-01-01", count: 10 },
        { date: "2022-01-02", count: 12 },
        { date: "2022-01-03", count: 8 },
        { date: "2024-01-01", count: 15 },
        // ... продолжение
    ];

    // Функция для расчета линейной регрессии
    calculateTrend(data) {
        // Преобразуем даты в дни с начала
        const startDate = new Date(data[0].date);
        const points = data.map((entry) => {
            const x = Math.floor((new Date(entry.date) - startDate) / (1000 * 60 * 60 * 24)); // дни с начала
            return { x, y: entry.count };
        });

        // Вычисляем суммы
        const N = points.length;
        const sumX = points.reduce((sum, p) => sum + p.x, 0);
        const sumY = points.reduce((sum, p) => sum + p.y, 0);
        const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
        const sumX2 = points.reduce((sum, p) => sum + p.x ** 2, 0);

        // Вычисляем коэффициенты
        const m = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX ** 2);
        const b = (sumY - m * sumX) / N;

        return { slope: m, intercept: b };
    }

}

// // Расчет тренда
// const trend = calculateTrend(complaintsPerDay);
// console.log("Наклон тренда (m):", trend.slope);
// console.log("Начальное значение (b):", trend.intercept);

// // Интерпретация
// if (trend.slope > 0) {
//     console.log("Тренд: количество жалоб увеличивается со временем.");
// } else if (trend.slope < 0) {
//     console.log("Тренд: количество жалоб уменьшается со временем.");
// } else {
//     console.log("Тренд: количество жалоб стабильно.");
// }