class DateRangeDropdown extends DropdownComponent {
    constructor(parentElement, dateStart, dateEnd) {
        // Create dropdown structure
        const container = document.createElement('div');
        container.className = 'dropdown date-range-dropdown';
        container.id = 'dateRangeContainer';
        
        const button = document.createElement('button');
        button.className = 'dropdown-toggle';
        button.textContent = 'За всё время';
        
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        
        container.appendChild(button);
        container.appendChild(menu);
        parentElement.appendChild(container);
        
        // Initialize dropdown
        super(container);
        
        // Set initial dates
        this.dateStart = dateStart ? new Date(dateStart) : null;
        this.dateEnd = dateEnd ? new Date(dateEnd) : null;
        
        this.setupDateMenu();
    }

    setupDateMenu() {
        this.clearItems();
        
        // Add "All Time" option
        this.addItem('За всё время', null, () => {
            this.setDateRange(null, null);
            if (window.app && window.app.refact) {
                window.app.refact.setState({ dateStart: null, dateEnd: null });
            }
        });

        // Add year options
        const currentYear = new Date().getFullYear();
        const startYear = 2020; // Or any other starting year

        for (let year = currentYear; year >= startYear; year--) {
            this.addItem(`${year}`, year, () => {
                const start = new Date(year, 0, 1);
                const end = new Date(year, 11, 31);
                this.setDateRange(start, end);
                if (window.app && window.app.refact) {
                    window.app.refact.setState({ dateStart: start, dateEnd: end });
                }
            });
        }

        // Add custom range option
        this.addItem('Выбрать период...', 'custom', () => {
            // Here you could open a date range picker
            console.log('Custom date range not implemented');
        });
    }

    setDateRange(start, end) {
        this.dateStart = start ? new Date(start) : null;
        this.dateEnd = end ? new Date(end) : null;
        
        if (start && end) {
            const startYear = start.getFullYear();
            const endYear = end.getFullYear();
            if (startYear === endYear) {
                this.button.textContent = `${startYear}`;
            } else {
                this.button.textContent = `${startYear} - ${endYear}`;
            }
        } else {
            this.button.textContent = 'За всё время';
        }
    }
}
