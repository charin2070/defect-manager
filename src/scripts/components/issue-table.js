class IssueTable {
    constructor(headers, config = {}) {
        this.isUpperCase = config.isUpperCase ?? true;
        this.container = document.createElement('div');
        this.container.className = 'overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5 bg-white';
        this.slidePanel = new SlidePanel();
        
        // Define available columns with their configurations
        this.availableColumns = {
            taskId: { 
                header: 'Задача',
                formatter: (issue) => `
                    <div class="flex items-center space-x-3">
                        <img src="src/image/bug-0.svg" alt="Defect" class="w-5 h-5">
                        <a href="https://jira.moscow.alfaintra.net/browse/${issue.id}" 
                           target="_blank" 
                           class="text-indigo-600 hover:text-indigo-900 font-medium"
                           title="Открыть в Jira">${issue.id}</a>
                    </div>`,
                className: 'pl-4',
                sortable: true,
                sortFn: (a, b) => a.id.localeCompare(b.id)
            },
            reports: { 
                header: 'Обращений',
                formatter: (issue) => `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.reports > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }">
                        ${issue.reports || 0}
                    </span>`,
                className: 'text-center',
                sortable: true,
                sortFn: (a, b) => (a.reports || 0) - (b.reports || 0)
            },
            status: { 
                header: 'Статус',
                formatter: (issue) => {
                    const status = (issue.status || 'Новый').toLowerCase();
                    const statusClasses = {
                        'новый': 'bg-blue-100 text-blue-800',
                        'в работе': 'bg-yellow-100 text-yellow-800',
                        'resolved': 'bg-green-100 text-green-800',
                        'rejected': 'bg-red-100 text-red-800',
                        'default': 'bg-gray-100 text-gray-800'
                    };
                    const className = statusClasses[status] || statusClasses.default;
                    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}">
                        ${issue.status || 'Новый'}
                    </span>`;
                },
                className: '',
                sortable: true,
                sortFn: (a, b) => (a.status || '').localeCompare(b.status || '')
            },
            description: { 
                header: 'Описание',
                formatter: (issue) => `
                    <div class="max-w-xl">
                        <div class="text-sm text-gray-900 line-clamp-2 hover:line-clamp-none">
                            ${issue.description || ''}
                        </div>
                    </div>`,
                className: 'max-w-xl',
                sortable: true,
                sortFn: (a, b) => (a.description || '').localeCompare(b.description || '')
            },
            created: { 
                header: 'Создан',
                formatter: (issue) => `
                    <div class="text-sm text-gray-500">
                        ${new Date(issue.created).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>`,
                className: 'whitespace-nowrap',
                sortable: true,
                sortFn: (a, b) => new Date(a.created) - new Date(b.created)
            }
        };

        // Initialize columns based on headers
        this.initializeColumns(headers);
    }

    initializeColumns(headers) {
        if (Array.isArray(headers)) {
            // Store just the column keys that we want to display
            this.activeColumns = headers;
        } else if (typeof headers === 'object') {
            // If headers is an object with custom configurations
            this.activeColumns = Object.keys(headers);
            // Merge custom configs with defaults
            Object.entries(headers).forEach(([key, customConfig]) => {
                if (this.availableColumns[key]) {
                    this.availableColumns[key] = {
                        ...this.availableColumns[key],
                        ...customConfig
                    };
                }
            });
        }
    }

    createTableHeader() {
        const thead = document.createElement('thead');
        thead.className = 'bg-gray-50';
        const tr = document.createElement('tr');
        
        Object.entries(this.availableColumns)
            .filter(([key]) => this.activeColumns.includes(key))
            .forEach(([key, column]) => {
                const th = document.createElement('th');
                th.className = `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`;
                th.textContent = this.isUpperCase ? column.header.toUpperCase() : column.header;
                
                if (column.sortable) {
                    th.classList.add('cursor-pointer', 'hover:bg-gray-100', 'transition-colors');
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
        tr.style.cursor = 'pointer';
        
        // Add click handler to show issue details
        tr.addEventListener('click', () => {
            const issueCard = new IssueCard({
                title: issue.id,
                timeAgo: new Date(issue.created).toLocaleDateString('ru-RU'),
                description: issue.description || 'Нет описания',
                footer: `Статус: ${issue.status || 'Новый'}`
            });
            
            this.slidePanel.setTitle(`Задача ${issue.id}`);
            this.slidePanel.clear();
            this.slidePanel.updateContent(issueCard.createCard());
            this.slidePanel.open();
        });
        
        Object.entries(this.availableColumns)
            .filter(([key]) => this.activeColumns.includes(key))
            .forEach(([key, column]) => {
                const td = document.createElement('td');
                if (column.className) {
                    td.className = column.className;
                }
                td.innerHTML = column.formatter(issue);
                tr.appendChild(td);
            });
        
        return tr;
    }

    render(issues) {
        this.container.innerHTML = '';
        
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'overflow-x-auto';
        
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        
        const thead = this.createTableHeader();
        const tbody = document.createElement('tbody');
        tbody.className = 'bg-white divide-y divide-gray-200';
        
        issues.forEach((issue, index) => {
            const tr = document.createElement('tr');
            tr.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            tr.classList.add('hover:bg-gray-100', 'transition-colors');
            
            Object.entries(this.availableColumns)
                .filter(([key]) => this.activeColumns.includes(key))
                .forEach(([key, column]) => {
                    const td = document.createElement('td');
                    td.className = `px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`;
                    td.innerHTML = column.formatter(issue);
                    tr.appendChild(td);
                });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        this.container.appendChild(tableWrapper);
    }

    showIssues(issues, headers) {
        if (headers) {
            this.initializeColumns(headers);
        }
        return this.render(issues);
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