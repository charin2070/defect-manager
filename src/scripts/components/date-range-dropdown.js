class DateRangeDropdown extends DropdownComponent {
    constructor(callback) {
        super({
            id: 'date-range-dropdown',
        });
        this.onChange = (dateRange)=> { console.log(this.dateRange); };
        this.dateRange = 'all_time';
        this.setupItems();
    }

    items = [
        { text: 'За всё время', value: 'all', onClick: () => this.setDateRange(getDateRange('all')) },
        { text: 'За месяц', value: 'this_month', onClick: () => this.setDateRange(getDateRange('current_month')) },
        { text: 'Год', subItems: [
            {text: '2025', onClick: () => this.setDateRange(getDateRange('2025'))}, 
            {text: '2024', onClick: () => this.setDateRange(getDateRange('2024'))},
            {text: '2023', onClick: () => this.setDateRange(getDateRange('2023'))}, 
            {text: '2022', onClick: () => this.setDateRange(getDateRange('2022'))}, 
            {text: '2021', onClick: () => this.setDateRange(getDateRange('2021'))} 
        ] },
    ];

    setActiveItemIndex(index) {
        this.setActiveItem(this.items[index]);
    }

    setupItems() {
        this.setItems(this.items);  
        this.setActiveItem(this.items[0]);
    }

    setDateRange(dateRange) {
        this.dateRange = dateRange;
        this.onChange(this.dateRange);
    }
}
