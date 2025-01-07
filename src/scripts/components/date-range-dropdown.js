class DateRangeDropdown extends DropdownComponent {
    constructor(parent) {
        super({
            parent,
            id: 'date-range-dropdown',
            items: [
                { text: 'За всё время', value: 'all', onClick: () => this.setDateRange(null, null) },
                { text: '2024', value: '2024', onClick: () => this.setDateRange('2024-01-01', '2024-12-31') },
                { text: '2023', value: '2023', onClick: () => this.setDateRange('2023-01-01', '2023-12-31') },
                { text: '2022', value: '2022', onClick: () => this.setDateRange('2022-01-01', '2022-12-31') },
                { text: '2021', value: '2021', onClick: () => this.setDateRange('2021-01-01', '2021-12-31') }
            ]
        });
        
        this.setTitle('За всё время');
    }

    setDateRange(start, end) {
        const refact = window.app.refact;
        const dateStart = start ? new Date(start) : null;
        const dateEnd = end ? new Date(end) : null;

        refact.setState({ 
            dateStart, 
            dateEnd 
        }, 'DateRangeDropdown.setDateRange');

        this.setTitle(start ? new Date(start).getFullYear().toString() : 'За всё время');
    }
}
