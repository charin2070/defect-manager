class ReportManager {
  constructor() {
    
  }

  months = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
  ];
  
  // Mapping of product areas
  productAreas = {
    "Портфель": ["портфел", "позици"],
    "Рынок": ["рынок", "торг", "котировк"],
    "Заявки": ["заявк", "поручен"],
    "Витрины, новости, аналитика": ["витрин", "новост", "аналитик"],
    "Терминалы": ["терминал"],
  };

  getMvpReport(issues) {
    if (!Array.isArray(issues)) {
        throw new Error('[ReportManager] getMvpReport requires an array of issues');
    }

    const statistics = StatisticManager.getFullStatistics(issues);
    const teams = {};

    issues.forEach(issue => {
        const team = issue.team || 'Unknown';
        if (!teams[team]) {
            teams[team] = {
                open: 0,
                closed: 0,
                rejected: 0,
                avgCloseTime: 0,
                last30Days: {
                    closed: 0,
                    new: 0,
                    rejected: 0
                }
            };
        }

        if (issue.state === 'unresolved') teams[team].open++;
        if (issue.state === 'resolved') teams[team].closed++;
        if (issue.state === 'rejected') teams[team].rejected++;
    });

    const tableData = Object.entries(teams).map(([team, data]) => {
        return {
            team,
            open: data.open,
            closed: data.closed,
            reports: '-',
            closedLast30: data.last30Days.closed,
            newLast30: data.last30Days.new,
            rejectedLast30: data.last30Days.rejected,
            avgCloseTime: data.avgCloseTime || '-'
        };
    });

    return tableData;
}
}
