class ReportManager {
  constructor() {
    this.refact = Refact.getInstance();
    this.refact.subscribe('reportType', (type) => {
      this.generateReport(type);
    });
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

 
  mobileTeams = ["Meribel", "K2", "Kilimanjaro", "Etna", "Olympus", "Makalu", "Everest", "Sierra", "Elbrus", "Siple", "Appalachians", "Fuji", "Matterhorn", "Weisshorn", "Citadel", "Twin Tree", "Black Rock", "Millenium", "Renaissance", "Montblanc", "Kailash"];

  generateReport(type) {
    switch (type) {
      case 'weekly':
        this.generateWeeklyReport();
        break;
      case 'mvp':
        this.getMvpReport(this.refact.state.issues, this.mobileTeams);
        break;
      default:
        break;
    }
  }
  
  isValidIssue(issue) {
    return issue && issue.id && issue.created && issue.state && issue.team;
  }

  isSlaOverdue(issue) {
    if (issue.state === 'rejected') {
      return undefined;
    }

    const today = new Date();
    const dueDate = new Date(issue.slaDate);

    if (issue.state === 'unresolved' && today > dueDate) {
      return true;
    }

    if (issue.state === 'resolved' && new Date(issue.resolved) > dueDate) {
      return true;
    }

    return false;
  }

  getMvpReport(issues, teams) {
    const overdueIssues = issues.filter(issue => this.isSlaOverdue(issue));
    log(overdueIssues, 'Overdue issues');
    log(teams,  'Teams');
    
    const teamsData = {};
    teams.forEach(team => {
        teamsData[team] = {
            new: 0,
            unresolved: 0,
            resolved: 0,
            rejected: 0,
            avgCloseTime: 0,
            reportsTotal: 0,
            reportsUnresolved: 0,
            slaPercentage: 0,
            last30Days: {
                closed: 0,
                new: 0,
                rejected: 0
            },
        };
    });

    if (issues.length === 0) {
        log('No valid issues found, returning empty array');
        return [];
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    issues.forEach(issue => {
        // Получаем команду из объекта issue
        const team = issue.team;
        
        if (!teamsData[team]) {
            return;
        }

        // Increment total count
        teamsData[team].new++;

        // Count reports
        if (issue.reports) {
            teamsData[team].reportsTotal += issue.reports;
            if (issue.state === 'unresolved') {
                teamsData[team].reportsUnresolved += issue.reports;
            }
        }

        // Process by state
        switch (issue.state) {
            case 'resolved':
            case 'rejected':
                const isOverdue = this.isSlaOverdue(issue);
                if (isOverdue === false) {
                    teamsData[team].slaPercentage++;
                }
                break;
            default:
                break;
        }

        // Process last 30 days statistics
        const createdDate = new Date(issue.created);
        if (createdDate >= thirtyDaysAgo) {
            teamsData[team].last30Days.new++;
        }

        if (issue.resolved) {
            const resolvedDate = new Date(issue.resolved);
            if (resolvedDate >= thirtyDaysAgo) {
                if (issue.state === 'rejected') {
                    teamsData[team].last30Days.rejected++;
                } else {
                    teamsData[team].last30Days.closed++;
                }
            }
        }

        // Process by state
        switch (issue.state) {
            case 'unresolved':
                teamsData[team].unresolved++;
                break;
            case 'resolved':
                teamsData[team].resolved++;
                if (issue.resolved && issue.created) {
                    const closeTime = new Date(issue.resolved) - new Date(issue.created);
                    teamsData[team].avgCloseTime = 
                        (teamsData[team].avgCloseTime * (teamsData[team].resolved - 1) + closeTime) 
                        / teamsData[team].resolved;
                }
                break;
            case 'rejected':
                teamsData[team].rejected++;
                break;
        }
    });

    // Calculate average resolution time for each team
    Object.keys(teamsData).forEach(team => {
        const teamData = teamsData[team];
        if (teamData.resolved > 0) {
            // Convert from milliseconds to days
            teamData.avgCloseTime = (teamData.avgCloseTime / (1000 * 60 * 60 * 24));
        }
    });

    // Calculate SLA percentage
    Object.keys(teamsData).forEach(team => {
        const totalIssues = teamsData[team].new + teamsData[team].resolved + teamsData[team].rejected;
        if (totalIssues > 0) {
            teamsData[team].slaPercentage = (teamsData[team].slaPercentage / totalIssues) * 100;
        }
    });

    log(teamsData, 'teamsData');
    this.refact.setState({ reports: teamsData }, 'ReportManager.getMvpReport'); // Save reports = teamsData;
    return teamsData;
}

}
