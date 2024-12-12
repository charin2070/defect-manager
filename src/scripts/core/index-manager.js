class IndexManager {
    constructor(issues) {
        this.issues = issues;
        this.index = null;
    }

    static indexIssues(issues) {
        return new Promise((resolve, reject) => {
            try {
                const index = {
                    byType: {},
                    byId: {},
                    byCreationDate: {},
                    byResolvedDate: {},
                    byRejectedDate: {},
                    byState: { resolved: [], unresolved: [], rejected: [] },
                };
    
                if (!Array.isArray(issues)) {
                    log(issues, '[IndexManager] Input is not an array');
                    reject(console.warn('[INdexManager] Input is not an array:', typeof issues));
                }
    
                issues.forEach(issue => {
                    // Index by ID
                    index.byId[issue.id] = issue;
    
                    // Index by type
                    if (!index.byType[issue.type]) {
                        index.byType[issue.type] = [];
                    }
                    index.byType[issue.type].push(issue);   
    
                    // // Index by creation date
                    // index.byCreationDate.set(issue.created, issue);
                    // index.byCreationDate = new Map([...index.byCreationDate].sort((a, b) => new Date(a[0]) - new Date(b[0])));
                    
                    // // Index by resolved date
                    // index.byResolvedDate.set(issue.resolved, issue);
                    // index.byResolvedDate = new Map([...index.byResolvedDate].sort((a, b) => new Date(a[0]) - new Date(b[0])));
                    
                    // // Index by rejected date
                    // index.byRejectedDate.set(issue.rejected, issue);
                    // index.byRejectedDate = new Map([...index.byRejectedDate].sort((a, b) => new Date(a[0]) - new Date(b[0])));
                    
                    // Index by state
                    // indexes.byState[issue.state].push(issue);
                });
    
                resolve(index);
            } catch (error) {
                reject(error);
            }
        });
    }

}