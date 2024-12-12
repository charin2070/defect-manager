class IndexManager {
    constructor(issues) {
        this.issues = issues;
        this.index = null;
    }

    static getDateFilter(condition){
        if (typeof condition === 'string') {
            // Process condiion format '-30d'(lasr 30 days from now)
            if (condition.startsWith('-')) {
                const daysAgo = parseInt(condition.substring(1));
                const compareDate = new Date();
                compareDate.setDate(compareDate.getDate() + daysAgo);
                return {
                    startDate: compareDate,
                    endDate: new Date()
                };
            }
        }

        // Process condition format 'current_month', 'last_month'
        if (condition === 'current_month') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return {
                startDate: startOfMonth,
                endDate: endOfMonth
            };
        }

        if (condition === 'last_month') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            return {
                startDate: startOfMonth,
                endDate: endOfMonth
            };
        }

        return null;
    }

    static getFilter(field, condition) {
        switch (field) {
            case 'creation':
            case 'resolved':
                if (typeof condition === 'string') {
                    // Process condiion format '-30d'(lasr 30 days from now)
                    if (condition.startsWith('-')) {
                        const daysAgo = parseInt(condition.substring(1));
                        const compareDate = new Date();
                        compareDate.setDate(compareDate.getDate() + daysAgo);
                        condition = {
                            startDate: compareDate,
                            endDate: new Date()
                        };
                        return {
                            [field]: condition
                        };
                    }
                } else if (typeof condition === 'object' && condition.startDate && condition.endDate) {
                    if (condition.startDate instanceof Date && condition.endDate instanceof Date) {
                        condition = {
                            startDate: condition.startDate,
                            endDate: condition.endDate
                        };
                    } else {
                        // Process condition format 'current_month'
                        if (condition.startDate === 'current_month' && condition.endDate === 'current_month') {
                            const now = new Date();
                            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                            condition = {
                                startDate: startOfMonth,
                                endDate: endOfMonth
                            };
                        }
                    }
                } else if (typeof condition === 'object' && condition.startDate && !condition.endDate) {
                    // Process condition format 'current_month'
                    if (condition.startDate === 'current_month') {
                        const now = new Date();
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        condition = {
                            startDate: startOfMonth,
                            endDate: endOfMonth
                        };
                    }
                return {
                    [field]: {
                        startDate: condition.startDate,
                        endDate: condition.endDate
                    }
                };
               }
            default:
                return {
                    [field]: condition
                };
        }
    }

    static indexIssues(issues) {
        return new Promise((resolve, reject) => {
            if (!issues) {
                console.warn('[IndexManager] Input issues is null or undefined');
                resolve({
                    byType: {},
                    byId: {},
                    byCreationDate: {},
                    byResolvedDate: {},
                    byRejectedDate: {},
                    byState: { resolved: [], unresolved: [], rejected: [] }
                });
                return;
            }

            try {
                const index = {
                    type: {},
                    taskId: {},
                    created: {},
                    resolved: {},
                    rejected: {},
                    state: { resolved: [], unresolved: [], rejected: [] }
                };

                if (Array.isArray(issues)) {
                    issues.forEach(issue => {
                        if (!issue) return;

                        // Index by ID
                        if (issue.taskId) {
                            index.taskId[issue.taskId] = [];
                        }
                        index.taskId[issue.taskId].push(issue);

                        // Index by type
                        if (!index.type[issue.type]) {
                            index.type[issue.type] = [];
                        }
                        index.type[issue.type].push(issue.taskId);

                        // State
                        if (!index.state[issue.state]) {
                            index.state[issue.state] = [];
                        }
                        index.state[issue.state].push(issue.taskId);

                        // Creation date
                        if (issue.created) {
                            if (!index.created[issue.created]) {
                                index.created[issue.created] = [];
                            }
                            index.created[issue.created].push(issue.taskId);
                        }

                    });
                }

                resolve(index);
            } catch (error) {
                console.error('[IndexManager] Error indexing issues:', error);
                reject(error);
            }
        });
    }

    static getByTaskId(taskId, issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn(`[IndexManager] getByTaskId requires an array of issues. Current issues: ${issues}`);
            return null;
        }

        return issues.find(issue => issue.taskId === taskId);
    }

    static getIssues(filter, issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn(`[IndexManager] getIssues requires an array of issues, instead got: ${typeof issues}`);
            return [];
        }

        return issues.filter(issue => {
            for (const [field, condition] of Object.entries(filter)) {
                // Handle date range filters
                if (field === 'creation' || field === 'resolved') {
                    const dateField = field === 'creation' ? 'created' : 'resolved';
                    const issueDate = new Date(issue[dateField]);
                    
                    if (condition.startDate && new Date(condition.startDate) > issueDate) {
                        return false;
                    }
                    if (condition.endDate && new Date(condition.endDate) < issueDate) {
                        return false;
                    }
                }
                // Handle relative date filters (e.g., last 30 days)
                else if (field === 'creationDate' || field === 'resolvedDate') {
                    const dateField = field === 'creationDate' ? 'created' : 'resolved';
                    const issueDate = new Date(issue[dateField]);
                    const daysAgo = condition;
                    
                    if (!issueDate) continue;
                    
                    const compareDate = new Date();
                    compareDate.setDate(compareDate.getDate() + daysAgo);
                    
                    if (daysAgo < 0 && issueDate < compareDate) {
                        return false;
                    } else if (daysAgo > 0 && issueDate > compareDate) {
                        return false;
                    }
                }
                // Handle numeric comparisons
                else if (typeof issue[field] === 'number') {
                    if (typeof condition === 'string') {
                        const operator = condition.substring(0, 2);
                        const value = parseFloat(condition.substring(2));
                        
                        switch(operator) {
                            case '>=': if (!(issue[field] >= value)) return false; break;
                            case '<=': if (!(issue[field] <= value)) return false; break;
                            case '==': if (!(issue[field] === value)) return false; break;
                            case '!=': if (!(issue[field] !== value)) return false; break;
                            default:
                                if (condition.startsWith('>')) {
                                    if (!(issue[field] > parseFloat(condition.substring(1)))) return false;
                                } else if (condition.startsWith('<')) {
                                    if (!(issue[field] < parseFloat(condition.substring(1)))) return false;
                                }
                        }
                    } else if (typeof condition === 'number') {
                        if (issue[field] !== condition) return false;
                    }
                }
                // Handle team filter
                else if (field === 'team' && condition !== 'all') {
                    if (issue.team !== condition) return false;
                }
                // Handle simple equality comparisons
                else if (issue[field] !== condition) {
                    return false;
                }
            }
            return true;
        });
    }

}