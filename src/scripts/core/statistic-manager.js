class StatisticManager {
    constructor(issues = []) {
      this.issues = issues;
    }

    getStatistics(issues, dateStart, dateEnd, team) {

}

  indexIssues(issues) {
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
}