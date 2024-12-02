class DashboardView extends View {
    constructor(container) {
        super(container);
        this.refact = new Refact(container);
        this.container = this.createView();
    }

    createView() {
        const container = document.createElement('div');
        container.className = 'dashboard-view';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'dashboard-header';
        header.innerHTML = '<h2>Dashboard</h2>';
        
        // Create filters section
        const filters = document.createElement('div');
        filters.className = 'dashboard-filters';
        
        // Create date range filter
        const dateRange = document.createElement('div');
        dateRange.className = 'date-range-filter';
        dateRange.innerHTML = `
            <label>Date Range:</label>
            <input type="date" class="start-date" />
            <input type="date" class="end-date" />
        `;
        
        // Create team filter
        const teamFilter = document.createElement('div');
        teamFilter.className = 'team-filter';
        teamFilter.innerHTML = `
            <label>Team:</label>
            <select>
                <option value="all">All Teams</option>
            </select>
        `;
        
        // Create charts container
        const chartsContainer = document.createElement('div');
        chartsContainer.className = 'charts-container';
        
        // Create statistics container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';
        
        // Append all elements
        filters.appendChild(dateRange);
        filters.appendChild(teamFilter);
        container.appendChild(header);
        container.appendChild(filters);
        container.appendChild(chartsContainer);
        container.appendChild(statsContainer);
        
        this.setupEventListeners(container);
        return container;
    }

    setupEventListeners(container) {
        // Date range filter listeners
        const startDate = container.querySelector('.start-date');
        const endDate = container.querySelector('.end-date');
        const teamSelect = container.querySelector('.team-filter select');

        // Set initial values from state
        this.refact.subscribe('filters', (filters) => {
            if (filters) {
                startDate.value = new Date(filters.dateStart).toISOString().split('T')[0];
                endDate.value = new Date(filters.dateEnd).toISOString().split('T')[0];
                teamSelect.value = filters.team;
            }
        });

        // Update filters when values change
        const updateFilters = () => {
            this.refact.setState({
                filters: {
                    dateStart: startDate.value,
                    dateEnd: endDate.value,
                    team: teamSelect.value
                }
            }, 'DashboardView.updateFilters');
        };

        startDate.addEventListener('change', updateFilters);
        endDate.addEventListener('change', updateFilters);
        teamSelect.addEventListener('change', updateFilters);
    }

    getView() {
        return this.container;
    }
}
