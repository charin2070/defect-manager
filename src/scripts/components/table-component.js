class TableComponent extends HtmlComponent {
    constructor() {
        super();
        this.element = this.createTable();
        this.columnTypes = new Map(); // Store column data types
        this.sortState = {
            column: null,
            ascending: true
        };
    }

    setColumnType(columnName, type) {
        // Supported types: 'string', 'number', 'date'
        this.columnTypes.set(columnName, type);
    }

    setColumnTypes(types) {
        // types is an object like { columnName: 'type' }
        Object.entries(types).forEach(([column, type]) => {
            this.setColumnType(column, type);
        });
    }

    compareValues(a, b, type) {
        if (a === b) return 0;
        if (a === null || a === undefined) return 1;
        if (b === null || b === undefined) return -1;

        switch (type) {
            case 'number':
                return Number(a) - Number(b);
            case 'date':
                return new Date(a) - new Date(b);
            default: // 'string' or any other type
                return String(a).localeCompare(String(b));
        }
    }

    sortByColumn(columnName) {
        const tbody = this.element.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const columnIndex = this.headers.indexOf(columnName);
        const type = this.columnTypes.get(columnName) || 'string';

        // Update sort state
        if (this.sortState.column === columnName) {
            this.sortState.ascending = !this.sortState.ascending;
        } else {
            this.sortState.column = columnName;
            this.sortState.ascending = true;
        }

        // Sort rows
        rows.sort((rowA, rowB) => {
            const cellA = rowA.cells[columnIndex].textContent;
            const cellB = rowB.cells[columnIndex].textContent;
            const comparison = this.compareValues(cellA, cellB, type);
            return this.sortState.ascending ? comparison : -comparison;
        });

        // Update visual sort indicators
        this.headers.forEach((header, index) => {
            const th = this.element.querySelector(`th[data-column="${header}"]`);
            th.classList.remove('sort-asc', 'sort-desc');
            if (header === columnName) {
                th.classList.add(this.sortState.ascending ? 'sort-asc' : 'sort-desc');
            }
        });

        // Reorder rows
        rows.forEach(row => tbody.appendChild(row));
    }

    getFieldsList(objects) {
        if (objects && Array.isArray(objects)) {
            const allFields = new Set();
            objects.forEach(obj => {
                Object.keys(obj).forEach(field => allFields.add(field));
            });
            return Array.from(allFields);
        }
        return [];
    }

    setHeaders(headers) {
        this.headers = headers;
        
        // Clear existing thead if any
        const existingThead = this.element.querySelector('thead');
        if (existingThead) {
            existingThead.remove();
        }

        // Create new thead structure
        const thead = this.createElement('thead');
        const tr = this.createElement('tr');
        thead.appendChild(tr);
        
        headers.forEach(header => {
            const th = this.createElement('th', {
                className: 'table-header',
                'data-column': header
            });
            th.textContent = header;
            
            // Add click handler for sorting
            th.addEventListener('click', () => this.sortByColumn(header));
            
            tr.appendChild(th);
        });

        // Insert thead at the beginning of the table
        this.element.insertBefore(thead, this.element.firstChild);
    }

    addRow(properties, isUpdateHeaders = false) {
        if (isUpdateHeaders) {
            this.setHeaders(this.getFieldsList([properties]));
        }

        let tbody = this.element.querySelector('tbody');
        if (!tbody) {
            tbody = this.createElement('tbody');
            this.element.appendChild(tbody);
        }

        const tr = this.createElement('tr');
        Object.keys(properties).forEach(key => {
            const td = this.createElement('td', {
                className: 'table-cell',
                'data-type': this.columnTypes.get(key) || 'string'
            });
            td.textContent = properties[key];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }

    updateItems(items) {
        // Create headers
        this.setHeaders(this.getFieldsList(items));

        // Clear existing rows
        const tbody = this.element.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
        }

        // Add new rows
        items.forEach(item => {
            this.addRow(item);
        });

        // If there was a sort column, maintain the sort
        if (this.sortState.column) {
            this.sortByColumn(this.sortState.column);
        }
    }

    createTable() {
        return this.createElement('table', {
            className: 'table-element'
        });
    }

    getContainer() {
        return this.element;
    }
}