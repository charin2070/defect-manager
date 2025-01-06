class ReportsView extends ViewComponent {
    constructor() {
        super();
        this.container = document.createElement('div');
        this.container.className = 'view-container';
        
        this.headers = [
            'Команда',
            'Всего открыто',
            'Всего закрыто',
            'Обращений по ним (с даты создания)',
            'Закрыто за пред. мес. (Т-30)',
            'Новых за пред.мес. (Т-30)',
            'Отклонено за пред.мес. (Т-30)',
            'Ср.время закрытия (дни)',
            'SLA'
        ];
        this.setupView();
    }
    
    setupView() {
        // Create table container
        this.tableContainer = document.createElement('div');
        this.tableContainer.className = 'reports-table-container';
        
        // Create table
        this.table = document.createElement('table');
        this.table.className = 'reports-table tablesorter';     
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.className = 'tablesorter-headerRow';
        
        this.headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.className = 'confluenceTh tablesorter-header';
            th.setAttribute('data-column', index);
            
            const headerInner = document.createElement('div');
            headerInner.className = 'tablesorter-header-inner';
            headerInner.textContent = header;
            
            th.appendChild(headerInner);
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        this.table.appendChild(thead);
        
        // Create table body
        this.tbody = document.createElement('tbody');
        this.table.appendChild(this.tbody);
        
        this.tableContainer.appendChild(this.table);
        this.container.appendChild(this.tableContainer);
    }

    createTeamLink(team) {
        const wrapper = document.createElement('div');
        wrapper.className = 'content-wrapper';
        
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        const a = document.createElement('a');
        
        a.href = `https://jira.moscow.alfaintra.net/issues/?jql="Команда устраняющая проблему" in ("${team}")`;
        a.target = '_blank';
        a.className = 'contentf-button aui-button btn-link';
        a.style.textDecoration = 'none';
        a.textContent = team;
        
        strong.appendChild(a);
        p.appendChild(strong);
        wrapper.appendChild(p);
        
        return wrapper;
    }
    
    render(teamsData) {
        if (!teamsData) return this.container;
        
        // Clear existing content
        this.tbody.innerHTML = '';
        
        // Sort teams by total reports
        const sortedTeams = Object.entries(teamsData)
            .sort(([, a], [, b]) => b.reportsTotal - a.reportsTotal);
        
        // Create rows for each team
        sortedTeams.forEach(([team, data]) => {
            if (data.reportsTotal === 0) return; // Skip teams with no reports
            
            const row = document.createElement('tr');
            
            // Calculate values
            const totalOpen = data.new + data.unresolved;
            const totalClosed = data.resolved + data.rejected;
            const reportsTotal = data.reportsTotal || '-';
            const last30Closed = data.last30Days.closed || 0;
            const last30New = data.last30Days.new || 0;
            const last30Rejected = data.last30Days.rejected || 0;
            const avgCloseTime = data.avgCloseTime ? data.avgCloseTime.toFixed(1) : '-';
            const slaPercentage = `${data.slaPercentage.toFixed(2)}%`;

            // Create cells
            [
                this.createTeamLink(team),
                totalOpen,
                totalClosed,
                reportsTotal,
                last30Closed,
                last30New,
                last30Rejected,
                avgCloseTime,
                slaPercentage
            ].forEach((value, index) => {
                const td = document.createElement('td');
                td.className = 'confluenceTd';
                
                if (value === '-') {
                    td.className += ' highlight-grey';
                    td.style.textAlign = 'center';
                    td.textContent = '-';
                } else if (value instanceof Element) {
                    td.appendChild(value);
                } else {
                    td.textContent = value;
                }
                
                row.appendChild(td);
            });
            
            this.tbody.appendChild(row);
        });
        
        return this.container;
    }
    
    getContainer() {
        return this.container;
    }
}
