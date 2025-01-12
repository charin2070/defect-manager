class IndexManager {
    constructor() {
        this.refact = null;
        this.groupedIndex = null;
    }

    bind(refact) {
        this.refact = refact;
        this.setupSubscriptions();
        return this;
    }

    setupSubscriptions() {
        this.refact.subscribe('issues', (issues) => {
            if (!issues) return;
            
            // Only rebuild if we don't have an index or if it's a different set of issues
            if (!this.groupedIndex || issues.length !== this.groupedIndex.defect?.length) {
                this.groupedIndex = IndexManager.getGroupedIndex(issues);
                this.refact.setState({ index: this.groupedIndex }, 'IndexManager');
            }
        });
    }

    static getGroupedIndex(issues) {
        if (!issues || !Array.isArray(issues)) return null;

        const index = {
            defect: issues,
            byStatus: IndexManager.indexBy(['status'], issues),
            byPriority: IndexManager.indexBy(['priority'], issues),
            byAssignee: IndexManager.indexBy(['assignee'], issues),
            byProject: IndexManager.indexBy(['project'], issues)
        };

        return index;
    }

    static indexBy(properties, issues) {
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

    static getIndex(issues) {
        if (!issues || issues.length === 0) {
            return {
                defect: {
                    all: {},
                    state: {
                        unresolved: []
                    },
                    created: {},
                    resolved: {}
                }
            };
        }

        const indexByType = IndexManager.indexBy(['type'], issues);
        
        // this.index['type'] = indexByType['type'];
        // For each type, create additional indexes

        const indexByKeys = {};
        for (const [type, typeIssues] of Object.entries(indexByType['type'] || {})) {
            indexByKeys[type] = IndexManager.indexBy(['taskId', 'state', 'status', 'priority', 'team', 'assignee', 'created', 'resolved'], typeIssues);
        }

        return indexByKeys;
    }

    static getStructuredIndex(rootKeys, childKeys, objects) {
        const result = {};
        rootKeys.forEach((rootKey) =>{
            result[rootKey] = {};
            childKeys.forEach((childKey) => {
                result[rootKey][childKey] = {};
                objects.forEach((object) => {
                    const rootValue = object[rootKey];
                    const childValue = object[childKey];
                    if (rootValue && childValue) {
                        if (!result[rootKey][childKey][rootValue]) {
                            result[rootKey][childKey][rootValue] = [];
                        }
                        result[rootKey][childKey][rootValue].push(object);
                    }
                });
            });
        })

        return result;
    }

    buildIndex(issues) {
        
    }


    static groupByMonth(issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn("[IndexManager] groupByMonth requires an array of issues. Current issues: " + issues);
            return null;
        }

        return issues.reduce((acc, issue) => {
            const yearMonth = new Date(issue.created).toISOString().slice(0, 7);
            if (!acc[yearMonth]) {
                acc[yearMonth] = [];
            }
            acc[yearMonth].push(issue);
            return acc;
        }, {});
    }

    static async filterIssues(filters, issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn("[IndexManager] filterIssues requires an array of issues");
            return { issues: [], index: {} };
        }

        const result = issues.filter(issue => {
            if (!issue) return false;

            // Check each filter
            const matches = Object.entries(filters || {}).every(([field, value]) => {
                if (!field || value === undefined) return true; // Skip invalid filters
                
                const issueValue = issue[field];
                
                switch (field) {
                    case 'dateRange':
                        if (!value || !value.dateStart || !value.dateEnd) {
                            return true; // Skip invalid date range
                        }
                        return isInDateRange(issue.created, value);
                    case 'type':
                        if (value === '*' || value === undefined || value === null) {
                            return true;
                        }
                        return issueValue === value;
                    default:
                        if (value === '*' || value === undefined || value === null) {
                            return true;
                        }
                        return issueValue === value;
                }
            });

            return matches;
        });
        
        console.log('[IndexManager.filterIssues] Result:', { 
            inputCount: issues.length,
            outputCount: result.length,
            filters: filters,
            issues: result
        });

        const resultIndex = await this.getStructuredIndex(result);
    log(resultIndex, 'IndexManager.INDEXED');

        return { 
            issues: result, 
            index: resultIndex 
        };
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


    static getById(taskId, issues) {
        if (!issues || !Array.isArray(issues)) {
            console.warn(`[IndexManager] getById requires an array of issues. Current issues: ${issues}`);
            return null;
        }

        return issues.find(issue => issue.taskId === taskId);
    }

   

}