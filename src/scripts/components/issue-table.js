class IssueTable {
    constructor(headers, config = {}) {
        this.isUpperCase = config.isUpperCase ?? true;
        this.container = document.createElement('div');
        this.container.className = 'issue-table-container';
        
        // Define available columns with their configurations
        this.availableColumns = {
            taskId: { 
                header: 'Задача',
                formatter: (issue) => `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="src/img/jira-defect.svg" alt="Defect" style="width: 16px; height: 16px;">
                        <a href="https://jira.moscow.alfaintra.net/browse/${issue.id}" 
                           target="_blank" 
                           class="jira-link"
                           title="Открыть в Jira">${issue.id}</a>
                    </div>`,
                className: '',
                sortable: true,
                sortFn: (a, b) => a.id.localeCompare(b.id)
            },
            reports: { 
                header: 'Обращений',
                formatter: (issue) => issue.reports || 0,
                className: '',
                sortable: true,
                sortFn: (a, b) => (a.reports || 0) - (b.reports || 0)
            },
            status: { 
                header: 'Статус',
                formatter: (issue) => {
                    const status = (issue.status || 'Новый').toLowerCase();
                    return `<span class="status-badge status-${status}">${issue.status || 'Новый'}</span>`;
                },
                className: '',
                sortable: true,
                sortFn: (a, b) => (a.status || '').localeCompare(b.status || '')
            },
            description: { 
                header: 'Описание',
                formatter: (issue) => issue.description || '',
                className: 'description-cell',
                sortable: true,
                sortFn: (a, b) => (a.description || '').localeCompare(b.description || '')
            },
            created: { 
                header: 'Создан',
                formatter: (issue) => new Date(issue.created).toLocaleDateString('ru-RU'),
                className: '',
                sortable: true,
                sortFn: (a, b) => new Date(a.created) - new Date(b.created)
            },
            resolved: { 
                header: 'Решен',
                formatter: (issue) => issue.resolved ? new Date(issue.resolved).toLocaleDateString('ru-RU') : '-',
                className: '',
                sortable: true,
                sortFn: (a, b) => new Date(a.resolved || 0) - new Date(b.resolved || 0)
            }
        };

        // Initialize columns based on headers
        this.initializeColumns(headers);
    }

    initializeColumns(headers) {
        if (Array.isArray(headers)) {
            // If headers is an array of strings, use default column configs
            this.activeColumns = headers.map(header => {
                const columnKey = Object.keys(this.availableColumns)
                    .find(key => this.availableColumns[key].header === header);
                return columnKey ? this.availableColumns[columnKey] : null;
            }).filter(Boolean);
        } else if (typeof headers === 'object') {
            // If headers is an object with custom configurations
            this.activeColumns = Object.entries(headers)
                .map(([key, customConfig]) => ({
                    ...this.availableColumns[key],
                    ...customConfig
                }))
                .filter(Boolean);
        }
    }

    createTableHeader() {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        
        this.activeColumns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.header;
            th.style.cursor = 'pointer';
            if (this.isUpperCase) {
                th.textContent = th.textContent.toUpperCase();
            }
            if (column.sortable) {
                th.classList.add('sortable');
                th.addEventListener('click', () => this.sortByColumn(column));
            }
            tr.appendChild(th);
        });
        
        thead.appendChild(tr);
        return thead;
    }

    createTableRow(issue) {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', issue.id);
        
        this.activeColumns.forEach(column => {
            const td = document.createElement('td');
            if (column.className) {
                td.className = column.className;
            }
            td.innerHTML = column.formatter(issue);
            tr.appendChild(td);
        });
        
        return tr;
    }

    sortByColumn(column) {
        if (!this.currentData || !column.sortable) return;
        
        const table = this.container.querySelector('table');
        const headers = table.querySelectorAll('th');
        
        // Toggle sort direction
        column.sortDirection = column.sortDirection === 'asc' ? 'desc' : 'asc';
        
        // Update header classes
        headers.forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
        const headerIndex = this.activeColumns.indexOf(column);
        headers[headerIndex].classList.add(`sort-${column.sortDirection}`);
        
        // Sort data
        this.currentData.sort((a, b) => {
            const result = column.sortFn(a, b);
            return column.sortDirection === 'asc' ? result : -result;
        });
        
        // Re-render table body
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        this.currentData.forEach(issue => {
            tbody.appendChild(this.createTableRow(issue));
        });
    }

    showIssues(issues, headers) {
        if (headers) {
            this.initializeColumns(headers);
        }
        return this.render(issues);
    }

    render(issues) {
        this.currentData = [...issues]; // Store for sorting
        this.container.innerHTML = '';
        
        const table = document.createElement('table');
        table.className = 'issue-table';
        
        // Add header
        table.appendChild(this.createTableHeader());
        
        // Add body
        const tbody = document.createElement('tbody');
        this.currentData.forEach(issue => {
            tbody.appendChild(this.createTableRow(issue));
        });
        
        table.appendChild(tbody);
        this.container.appendChild(table);
        
        return this.container;
    }

    updateRow(issueId, updatedData) {
        const row = this.container.querySelector(`tr[data-id="${issueId}"]`);
        if (row) {
            const newRow = this.createTableRow({ ...updatedData, id: issueId });
            row.replaceWith(newRow);
            
            // Update data in currentData array
            const index = this.currentData.findIndex(issue => issue.id === issueId);
            if (index !== -1) {
                this.currentData[index] = { ...updatedData, id: issueId };
            }
        }
    }

    removeRow(issueId) {
        const row = this.container.querySelector(`tr[data-id="${issueId}"]`);
        if (row) {
            row.remove();
            // Update currentData array
            this.currentData = this.currentData.filter(issue => issue.id !== issueId);
        }
    }
}