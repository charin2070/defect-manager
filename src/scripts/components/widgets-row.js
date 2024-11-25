class WidgetsRow {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id ${containerId} not found`);
        }
    }

    formatTimeValue(days) {
        const DAYS_IN_MONTH = 30.44; // среднее количество дней в месяце
        const DAYS_IN_YEAR = 365.25; // среднее количество дней в году
        
        // Конвертируем в годы
        const years = days / DAYS_IN_YEAR;
        if (years >= 1) {
            const value = years.toFixed(1);
            const lastDigit = parseInt(value.split('.')[0]) % 10;
            let unit;
            if (lastDigit === 1 && parseInt(value) !== 11) {
                unit = 'год';
            } else if ([2,3,4].includes(lastDigit) && ![12,13,14].includes(parseInt(value))) {
                unit = 'года';
            } else {
                unit = 'лет';
            }
            return `${value} ${unit}`;
        }
        
        // Конвертируем в месяцы
        const months = days / DAYS_IN_MONTH;
        if (months >= 1) {
            const value = months.toFixed(1);
            const lastDigit = parseInt(value.split('.')[0]) % 10;
            let unit;
            if (lastDigit === 1 && parseInt(value) !== 11) {
                unit = 'месяц';
            } else if ([2,3,4].includes(lastDigit) && ![12,13,14].includes(parseInt(value))) {
                unit = 'месяца';
            } else {
                unit = 'месяцев';
            }
            return `${value} ${unit}`;
        }
        
        // Отображаем в днях
        const value = Math.max(days, 0).toFixed(1);
        const lastDigit = parseInt(value.split('.')[0]) % 10;
        let unit;
        if (lastDigit === 1 && parseInt(value) !== 11) {
            unit = 'день';
        } else if ([2,3,4].includes(lastDigit) && ![12,13,14].includes(parseInt(value))) {
            unit = 'дня';
        } else {
            unit = 'дней';
        }
        return `${value} ${unit}`;
    }

    createWidget(config) {
        const widget = document.createElement('div');
        widget.className = 'app-widget-container app-widget-loading';

        // Create top section
        const topSection = document.createElement('div');
        topSection.className = 'app-widget-top';

        // Create text wrapper
        const textWrapper = document.createElement('div');
        textWrapper.className = 'app-widget-top-text-wrapper';

        // Add value with time formatting if needed
        const valueText = document.createElement('span');
        valueText.className = 'app-widget-value-text';
        valueText.textContent = config.type === 'time' ? '00' : '0';
        
        // Имитация загрузки
        setTimeout(() => {
            widget.classList.remove('app-widget-loading');
            if (config.type === 'time') {
                valueText.textContent = this.formatTimeValue(config.value);
            } else {
                valueText.textContent = config.value;
            }
        }, 1000);
        
        textWrapper.appendChild(valueText);

        // Add label
        const labelText = document.createElement('span');
        labelText.className = 'app-widget-label-text';
        labelText.textContent = config.label;
        textWrapper.appendChild(labelText);

        // Add icon if provided
        if (config.icon) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'app-widget-icon';
            const icon = document.createElement('img');
            icon.className = 'app-widget-icon-img';
            icon.src = config.icon;
            icon.alt = 'Icon';
            iconWrapper.appendChild(icon);
            topSection.appendChild(iconWrapper);
        }

        topSection.appendChild(textWrapper);
        widget.appendChild(topSection);

        // Create bottom section if trend is provided
        if (config.trend) {
            const bottomSection = document.createElement('div');
            bottomSection.className = 'app-widget-bottom';

            // Add trend arrow
            const trendSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            trendSvg.setAttribute('width', '20');
            trendSvg.setAttribute('height', '20');
            trendSvg.setAttribute('viewBox', '0 0 20 20');
            trendSvg.setAttribute('fill', 'none');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M7.21375 4.79671C7.06297 4.94748 6.97061 5.15701 6.97091 5.38711L6.97091 5.48839C6.97091 5.94919 7.34394 6.32223 7.80415 6.32164L12.3571 6.32164L4.65532 14.0234C4.33005 14.3487 4.33005 14.8766 4.65532 15.2019C4.98059 15.5272 5.50856 5.5272 5.83383 15.2019L13.5356 7.50015V12.0531C13.5356 12.5139 13.9086 12.8869 14.3688 12.8863H14.4701C14.9309 12.8863 15.3039 12.5133 15.3034 12.0531V5.38711C15.3034 4.92632 14.9303 4.55328 14.4701 4.55387L7.80415 4.55387C7.57375 4.55387 7.36452 4.64593 7.21375 4.79671Z');
            path.setAttribute('fill', config.trend.direction === 'up' ? '#34C759' : '#FF3B30');
            
            if (config.trend.direction === 'down') {
                trendSvg.style.transform = 'rotate(180deg)';
            }
            
            trendSvg.appendChild(path);
            bottomSection.appendChild(trendSvg);

            // Add trend text
            const trendText = document.createElement('span');
            trendText.className = 'app-widget-bottom-text';
            trendText.textContent = config.trend.text;
            bottomSection.appendChild(trendText);

            widget.appendChild(bottomSection);
        }

        return widget;
    }

    addWidget(config) {
        const widget = this.createWidget(config);
        this.container.appendChild(widget);
        
        // Add divider if it's not the last widget
        if (!config.isLast) {
            const divider = document.createElement('div');
            divider.className = 'app-widgets-row-divider';
            this.container.appendChild(divider);
        }
    }

    clearWidgets() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }

    updateWidgets(widgetsConfig) {
        this.clearWidgets();
        widgetsConfig.forEach((config, index) => {
            this.addWidget({
                ...config,
                isLast: index === widgetsConfig.length - 1
            });
        });
    }
}
