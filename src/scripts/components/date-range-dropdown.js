class DateRangeDropdown extends DropdownComponent {
    constructor(parent, callback) {
        super({
            parent,
            id: 'date-range-dropdown',
        });
        this.callback = callback;
        this.dateRange = 'all_time';
        this.setupItems();
    }

    items = [
        { text: 'За всё время', value: 'all', onClick: () => this.setDateRange(getDateRange('all')) },
        { text: '2025', value: '2025', onClick: () => this.setDateRange(getDateRange('2025')) },
        { text: '2024', value: '2024', onClick: () => this.setDateRange(getDateRange('2024')) },
        { text: '2023', value: '2023', onClick: () => this.setDateRange(getDateRange('2023')) },
        { text: '2022', value: '2022', onClick: () => this.setDateRange(getDateRange('2022')) },
        { text: '2021', value: '2021', onClick: () => this.setDateRange(getDateRange('2021')) },
    ];

    setupItems() {
        this.clearItems();

        this.items.forEach(item => {
            this.addItem(item);
        });

        this.setActiveItem(this.items[0]);
    }

    setDateRange(dateRange) {
        this.dateRange = dateRange;
        this.callback(dateRange);
    }
}
