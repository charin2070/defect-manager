class IssueTable {
        constructor(headers) {
            this.headers = headers;
            this.container = document.createElement('div');
            this.container.className = 'issue-table-container';
            
            // Define column mappings for data
            this.columnMappings = [
                { 
                    key: 'taskId', 
                    formatter: (issue) => `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img src="src/img/jira-defect.svg" alt="Defect" style="width: 16px; height: 16px;">
                            <a href="https://jira.moscow.alfaintra.net/browse/${issue.id}" 
                               target="_blank" 
                               class="jira-link"
                               title="Открыть в Jira">${issue.id}</a>
                        </div>`,
                    className: ''
                },
                { 
                    key: 'reports', 
                    formatter: (issue) => issue.reports || 0,
                    className: ''
                },
                { 
                    key: 'status', 
                    formatter: (issue) => {
                        const status = (issue.status || 'Новый').toLowerCase();
                        return `<span class="status-badge status-${status}">${issue.status || 'Новый'}</span>`;
                    },
                    className: ''
                },
                { 
                    key: 'description', 
                    formatter: (issue) => issue.description || '',
                    className: 'description-cell'
                },
                { 
                    key: 'created', 
                    formatter: (issue) => new Date(issue.created).toLocaleDateString('ru-RU'),
                    className: ''
                },
                { 
                    key: 'resolved', 
                    formatter: (issue) => new Date(issue.resolved).toLocaleDateString('ru-RU'),
                    className: ''
                }
            ];
        }

        createTableHeader() {
            const thead = document.createElement('thead');
            const tr = document.createElement('tr');
            
            this.headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                tr.appendChild(th);
            });
            
            thead.appendChild(tr);
            return thead;
        }

        createTableRow(issue) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', issue.id);
            
            this.columnMappings.forEach(column => {
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
            
            const table = document.createElement('table');
            table.className = 'issue-table';
            
            // Add header
            table.appendChild(this.createTableHeader());
            
            // Add body
            const tbody = document.createElement('tbody');
            issues.forEach(issue => {
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
            }
        }

        removeRow(issueId) {
            const row = this.container.querySelector(`tr[data-id="${issueId}"]`);
            if (row) {
                row.remove();
            }
        }
    }