class DateRangeDropdown extends DropdownComponent {
    constructor(containerId, text = 'За всё время', dateStart, dateEnd, onChange) {
        super(containerId, text);
        this.dateStart = dateStart ? new Date(dateStart) : null;
        this.dateEnd = dateEnd ? new Date(dateEnd) : null;
        this.onChange = onChange;
        this.updateMenu();
    }

    setOnChange(callback) {
        this.onChange = callback;
    }

    updateMenu() {
        this.clearMenu();
        
        // Добавляем пункт "За всё время"
        const allTimeItem = this.createMenuItem('За всё время', () => {
            this.setButtonText('За всё время');
            if (this.onChange) {
                this.onChange(null, null);
            }
            this.close();
        });
        this.dropdownMenu.appendChild(allTimeItem);

        this.addDivider();

        // Добавляем годы
        const years = this.getYears();
        years.forEach(year => {
            const yearItem = this.createMenuItem(year.toString(), () => {
                this.setButtonText(`За ${year} год`);
                if (this.onChange) {
                    const startDate = new Date(year, 0, 1);
                    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
                    this.onChange(startDate, endDate);
                }
                this.close();
            });
            const yearSubmenu = this.createSubmenu();

            // Добавляем "За весь год"
            const fullYearItem = this.createMenuItem('За весь год', () => {
                this.setButtonText(`За ${year} год`);
                if (this.onChange) {
                    const startDate = new Date(year, 0, 1);
                    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
                    this.onChange(startDate, endDate);
                }
                this.close();
            });
            yearSubmenu.appendChild(fullYearItem);

            yearSubmenu.appendChild(document.createElement('div')).className = 'dropdown-divider';

            // Добавляем кварталы
            for (let quarter = 1; quarter <= 4; quarter++) {
                const quarterItem = this.createMenuItem(`${quarter} квартал`, () => {
                    this.setButtonText(`${quarter} квартал ${year} года`);
                    if (this.onChange) {
                        const startMonth = (quarter - 1) * 3;
                        const endMonth = startMonth + 2;
                        const startDate = new Date(year, startMonth, 1);
                        const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59, 999);
                        this.onChange(startDate, endDate);
                    }
                    this.close();
                });
                yearSubmenu.appendChild(quarterItem);
            }

            yearItem.appendChild(yearSubmenu);
            this.dropdownMenu.appendChild(yearItem);
        });
    }

    getYears() {
        const currentYear = new Date().getFullYear();
        return Array.from({length: 5}, (_, i) => currentYear - i);
    }
}
