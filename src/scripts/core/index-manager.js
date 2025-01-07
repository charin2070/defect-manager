class IndexManager {
    constructor() {
        this.groupedIndex = null;
        this.refact = Refact.getInstance();
        this.initialize();
    }

    initialize() {
        this.setupSubscriptions();
    }

    static async indexBy(properties, issues) {
        if (!properties || !Array.isArray(properties)) {
            console.warn("[IndexManager] indexBy requires an array of properties. Current properties: " + properties);
            return null;
        }
        
        if (!issues || !Array.isArray(issues)) {
            console.warn("[IndexManager] indexBy requires an array of issues. Current issues: " + issues);
            return null;
        }

        const indexed = {};
        issues.forEach(issue => {
            properties.forEach(prop => {
                const value = issue[prop];
                if (value) {
                    if (!indexed[prop]) {
                        indexed[prop] = {};
                    }
                    if (!indexed[prop][value]) {
                        indexed[prop][value] = [];
                    }
                    indexed[prop][value].push(issue);
                }
            });
        });

        return indexed;
    }

    async buildIndex(issues) {

        if (!issues || !Array.isArray(issues)) {
            console.warn("[IndexManager] buildIndex requires an array of issues. Current issues: " + issues);
            return null;
        }
        
        this.index = await IndexManager.indexBy(['taskId', 'state', 'type', 'status', 'priority', 'team', 'assignee'], issues); 
        this.refact.setState({ index: this.index }, 'IndexManager.buildIndex');
        log(this.index, '[IndexManager] index');
        return this.index;
    }

    setupSubscriptions() {
        this.refact.subscribe('issues', async (issues) => {
            if (!issues) return;
            
            // Only rebuild if we don't have an index or if it's a different set of issues
            if (!this.groupedIndex || issues.length !== this.groupedIndex.defect?.length) {
                this.groupedIndex = await IndexManager.getGroupedIndex(issues);
                this.refact.setState({ index: this.groupedIndex }, 'IndexManager.setupSubscriptions');
                console.log(this.groupedIndex, '[IndexManager] issues');
            }
        });
    }

    static async getGroupedIndex(issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn("[IndexManager] getGroupedIndex requires an array of issues. Current issues: " + issues);
            return null;
        }

        // Group issues by type
        const groupedIssues = {};
        issues.forEach(issue => {
            if (!groupedIssues[issue.type]) {
                groupedIssues[issue.type] = [];
            }
            groupedIssues[issue.type].push(issue);
        });

        return groupedIssues;
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

    static async getStructuredIndex(issues) {
        console.log ('[IndexManager] Building structured index...');

        if (!issues || !Array.isArray(issues)) {
            console.warn("[IndexManager] getStructuredStatistics requires an array of issues. Current issues: " + issues);
            return null;
        }

        const index = {
            id: {},
            defects: {
                resolved: {
                    count: 0,
                    resolutionDates: {},
                    slaDates: {}
                },
                unresolved: {
                    count: 0,
                    creationDates: {}
                },
                rejected: {
                    count: 0,
                    rejectionDates: {}
                }
            },
            requests: {
                resolved: {
                    count: 0
                },
                unresolved: {
                    count: 0
                },
                rejected: {
                    count: 0
                }
            }
        };
    
        issues.forEach(issue => {
            const type = issue.type;
            const state = issue.state;
            const taskId = issue.taskId;
            const creationDate = issue.created ? new Date(issue.created).toISOString().split('T')[0] : null;
            const resolvedDate = issue.resolved ? new Date(issue.resolved).toISOString().split('T')[0] : null;
            const slaDate = issue.sla ? new Date(issue.sla).toISOString().split('T')[0] : null;
    
            index.id[taskId] = issue;

            if (type === 'defect') {
                if (state === 'resolved') {
                    index.defects.resolved.count++;
                    if (resolvedDate) {
                        index.defects.resolved.resolutionDates[resolvedDate] =
                            index.defects.resolved.resolutionDates[resolvedDate] || [];
                        index.defects.resolved.resolutionDates[resolvedDate].push(taskId);
                    }
                    if (slaDate) {
                        index.defects.resolved.slaDates[slaDate] =
                            index.defects.resolved.slaDates[slaDate] || [];
                        index.defects.resolved.slaDates[slaDate].push(taskId);
                    }
                } else if (state === 'unresolved') {
                    index.defects.unresolved.count++;
                    if (creationDate) {
                        index.defects.unresolved.creationDates[creationDate] =
                            index.defects.unresolved.creationDates[creationDate] || [];
                        index.defects.unresolved.creationDates[creationDate].push(taskId);
                    }
                } else if (state === 'rejected') {
                    index.defects.rejected.count++;
                    if (resolvedDate) {
                        index.defects.rejected.rejectionDates[resolvedDate] =
                            index.defects.rejected.rejectionDates[resolvedDate] || [];
                        index.defects.rejected.rejectionDates[resolvedDate].push(taskId);
                    }
                }
            } else if (type === 'request') {
                const category = index.requests[state];
                if (category) {
                    category.count++;
                    category[creationDate] = category[creationDate] || [];
                    category[creationDate].push(taskId);
                }
            }
        });
    
        return index;
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

                        // taskId
                        if (issue.taskId) {
                            index.taskId[issue.taskId] = [];
                        }
                        index.taskId[issue.taskId].push(issue);

                        // Type
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

                        // Resolved date
                        if (issue.resolved) {
                            if (issue.status === 'Закрыт') {
                                if (!index.resolved[issue.resolved]) {
                                    index.resolved[issue.resolved] = [];
                                }
                                index.resolved[issue.resolved].push(issue.taskId);
                            } else if (issue.status === 'Отклонен') {
                                if (!index.rejected[issue.resolved]) {
                                    index.rejected[issue.resolved] = [];
                                }
                                index.rejected[issue.resolved].push(issue.taskId);
                            } else {
                                console.warn(`[IndexManager] Issue with taskId ${issue} has an invalid status: ${issue}`);
                            }

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

    static getIssuesEx(filter, issues) {
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