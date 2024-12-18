class IndexManager extends Reactive {
    constructor(issues) {
        super();
        this.issues = issues;
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

        if (condition === 'all_time') {
            return {
                startDate: new Date('2021-01-01'),
                endDate: new Date()
            };
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

    static isValidDate(dateStr) {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date) && date.getTime() > 0;
    }

    static formatDate(dateStr) {
        if (!this.isValidDate(dateStr)) return null;
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch (error) {
            console.warn(`[IndexManager] Invalid date format: ${dateStr}`);
            return null;
        }
    }

    static async getStructuredIndex(issues) {
        log('[IndexManager] Building structured index...');

        if (!issues || !Array.isArray(issues)) {
            console.warn("[IndexManager] getStructuredStatistics requires an array of issues. Current issues: " + issues);
            throw new Error("Invalid input: issues must be an array");
        }

        try {
            const index = {
                id: {},
                defects: {
                    resolved: { count: 0, resolutionDates: {}, slaDates: {} },
                    unresolved: { count: 0, creationDates: {} },
                    rejected: { count: 0, rejectionDates: {} }
                },
                requests: {
                    resolved: { count: 0 },
                    unresolved: { count: 0 },
                    rejected: { count: 0 }
                }
            };

            // Process each issue
            for (const issue of issues) {
                const { type, state, taskId, created, resolved, sla } = issue;
                const creationDate = this.formatDate(created);
                const resolvedDate = this.formatDate(resolved);
                const slaDate = this.formatDate(sla);

                index.id[taskId] = issue;

                if (type === 'defect') {
                    if (state === 'resolved') {
                        index.defects.resolved.count++;
                        if (resolvedDate) {
                            index.defects.resolved.resolutionDates[resolvedDate] = index.defects.resolved.resolutionDates[resolvedDate] || [];
                            index.defects.resolved.resolutionDates[resolvedDate].push(taskId);
                        }
                        if (slaDate) {
                            index.defects.resolved.slaDates[slaDate] = index.defects.resolved.slaDates[slaDate] || [];
                            index.defects.resolved.slaDates[slaDate].push(taskId);
                        }
                    } else if (state === 'unresolved') {
                        index.defects.unresolved.count++;
                        if (creationDate) {
                            index.defects.unresolved.creationDates[creationDate] = index.defects.unresolved.creationDates[creationDate] || [];
                            index.defects.unresolved.creationDates[creationDate].push(taskId);
                        }
                    } else if (state === 'rejected') {
                        index.defects.rejected.count++;
                        if (resolvedDate) {
                            index.defects.rejected.rejectionDates[resolvedDate] = index.defects.rejected.rejectionDates[resolvedDate] || [];
                            index.defects.rejected.rejectionDates[resolvedDate].push(taskId);
                        }
                    }
                } else if (type === 'request') {
                    const category = index.requests[state];
                    if (category) {
                        category.count++;
                        if (creationDate) {
                            category[creationDate] = category[creationDate] || [];
                            category[creationDate].push(taskId);
                        }
                    }
                }
            }

            return index;
        } catch (error) {
            console.error('[IndexManager] Error building structured index:', error);
            throw error;
        }
    }

    static getByTaskId(taskId, issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn(`[IndexManager] getByTaskId requires an array of issues. Current issues: ${issues}`);
            return null;
        }

        return issues.find(issue => issue.taskId === taskId);
    }

    static filterIndex(filters = {}, index) {
        const filteredIndex = {
            type: {},
            taskId: {},
            created: {},
            resolved: {},
            rejected: {},
            state: { resolved: [], unresolved: [], rejected: [] }
        };

        const filterKeys = Object.keys(filters);

        filterKeys.forEach(key => {
            if (index[key]) {
                if (Array.isArray(index[key])) {
                    filteredIndex[key] = index[key].filter(item => filters[key].includes(item));
                } else {
                    filteredIndex[key] = {};
                    Object.keys(index[key]).forEach(subKey => {
                        if (filters[key].includes(subKey)) {
                            filteredIndex[key][subKey] = index[key][subKey];
                        }
                    });
                }
            }
        });

        log(filteredIndex, '[IndexManager] Filtered index');
        return filteredIndex;
    }

    static filterFlat(filters, index) {
        const result = [];

        const { type: typeFilter, team } = filters;
        const typeKey = typeFilter === 'defect' ? 'defects' : typeFilter;

        console.log('Filters:', filters);
        console.log('Index structure:', index);

        // Get all issues from the id index
        Object.values(index.id).forEach(issue => {
            if (issue) {
                let match = true;

                // Check type filter
                if (typeFilter && issue.type !== typeFilter) {
                    match = false;
                }

                // Check team filter
                if (team && issue.team !== team) {
                    match = false;
                }

                if (match) {
                    console.log(`Match found for issue:`, issue);
                    result.push(issue);
                }
            }
        });

        console.log('Filtered issues:', result);
        return result;
    }

    static getIssues(filters = {}, issues) { 
        if (!issues || !Array.isArray(issues)) {
            console.warn(`[IndexManager] getIssues requires an array of issues, instead got: ${typeof issues}`);
            return [];
        }

        return issues.filter(issue => {
            return Object.entries(filters).every(([field, condition]) => {
                if (field === 'creation' || field === 'resolved') {
                    const dateField = field === 'creation' ? 'created' : 'resolved';
                    const issueDate = new Date(issue[dateField]);
                    
                    if (condition.startDate && new Date(condition.startDate) > issueDate) {
                        return false;
                    }
                    if (condition.endDate && new Date(condition.endDate) < issueDate) {
                        return false;
                    }
                } else if (field === 'creationDate' || field === 'resolvedDate') {
                    const dateField = field === 'creationDate' ? 'created' : 'resolved';
                    const issueDate = new Date(issue[dateField]);
                    const daysAgo = condition;
                    
                    if (!issueDate) return false;
                    
                    const compareDate = new Date();
                    compareDate.setDate(compareDate.getDate() + daysAgo);
                    
                    if (daysAgo < 0 && issueDate < compareDate) {
                        return false;
                    } else if (daysAgo > 0 && issueDate > compareDate) {
                        return false;
                    }
                } else if (typeof issue[field] === 'number') {
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
                } else if (field === 'team' && condition !== 'all') {
                    if (issue.team !== condition) return false;
                } else if (issue[field] !== condition) {
                    return false;
                }
                return true;
            });
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