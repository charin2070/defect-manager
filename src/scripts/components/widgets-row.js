class WidgetsRow {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.issueTable = new IssueTable();
        if (!this.container) {
            throw new Error(`Container with id ${containerId} not found`);
        }
    }

    formatTimeValue(days) {
        const DAYS_IN_MONTH = 30.44; // среднее количество дней в месяце
        const DAYS_IN_YEAR = 365.25; // среднее количество дней в году

        if (days >= DAYS_IN_YEAR) {
            const years = Math.floor(days / DAYS_IN_YEAR);
            const months = Math.floor((days % DAYS_IN_YEAR) / DAYS_IN_MONTH);
            return `${years} г ${months} мес`;
        } else if (days >= DAYS_IN_MONTH) {
            const months = Math.floor(days / DAYS_IN_MONTH);
            const remainingDays = Math.floor(days % DAYS_IN_MONTH);
            return `${months} мес ${remainingDays} дн`;
        } else {
            return `${Math.floor(days)} дн`;
        }
    }

    createWidget(config = { type: 'time', value: 0, label: '', trend: null, icon: null }, onClick = null) {
        this.onClick = config.onClick;

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

            // Add trend text
            const trendText = document.createElement('div');
            trendText.innerHTML = config.trend.text;
            trendText.className = 'app-widget-bottom-text';
            bottomSection.appendChild(trendText);

            widget.appendChild(bottomSection);
        }

        // Добавляем обработчик клика
        widget.addEventListener('click', this.onClick);

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