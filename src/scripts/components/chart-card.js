class ChartCard extends HtmlComponent {
    constructor() {
        super();
        this.container = this.createElement('div', {
            className: 'chart-card-container',
        });
        
        this.refact = null;

        this.container = this.htmlToComponent(this.htmlTemplate);
        document.body.appendChild(this.container);

        this.valueNameVariants = {
            0: 'дефектов',
            1: 'дефект',
            2: 'дефекта',
            3: 'дефекта',
            4: 'дефекта',
            5: 'дефектов',
            6: 'дефектов',
            7: 'дефектов',
            8: 'дефектов',
            9: 'дефектов'
        }

        this.valueCountVariants = {
            0: 'открытых',
            1: 'открытый',
            2: 'открытых',
            3: 'открытых',
            4: 'открытых',
            5: 'открытых',
            6: 'открытых',
            7: 'открытых',
            8: 'открытых',
            9: 'открытых'
        }

        this.titleElement = this.container.querySelector('.chart-card-title');
        this.valueElement = this.container.querySelector('.chart-card-value');
        this.headerElement = this.container.querySelector('header');
        this.resizeIcon = this.container.querySelector('.resize-icon');
        this.trendElement = this.container.querySelector('.chart-card-trend');
        this.chartCanvas = this.container.querySelector('canvas');
        this.menuButton = this.container.querySelector('header .menu-icon');
        this.menu = this.container.querySelector('header .menu-dropdown');
        this.maximizeButton = this.container.querySelector('header .maximize-icon');
        
        this.dateRange = new DateRangeDropdown();
        this.dateRange.onChange = (dateRange) => {
            console.log(this);
            this.dateRange = dateRange;
            this.update();
        }

        this.container.querySelector('.date-range-dropdown').appendChild(this.dateRange.getContainer());
        this.dateRange.setActiveItemIndex(1);

        this.chart = null;

        this.isMaximized = false;

        this.initChart();
        // this.initMaximizeButton();
    }

    initChart() {
        const ctx = this.chartCanvas.getContext('2d');
        
        // Градиент для заливки под линией
        const gradient = ctx.createLinearGradient(0, 0, 0, 160);
        gradient.addColorStop(0, 'rgba(54, 162, 235, 0.2)');
        gradient.addColorStop(1, 'rgba(54, 162, 235, 0)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                datasets: [
                    {
                        label: 'Текущее значение',
                        data: [5, 8, 6, 7, 10, 6, 8],
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        backgroundColor: gradient,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
                        pointHoverBorderColor: 'white',
                        pointHoverBorderWidth: 2,
                    },
                    {
                        label: 'Месяц назад',
                        data: [4, 7, 5, 6, 9, 5, 7],
                        borderColor: 'rgba(128, 128, 128, 0.5)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart',
                    delay: (context) => {
                        // Задержка для каждой точки, создавая эффект появления слева направо
                        return context.dataIndex * 100;
                    }
                },
                transitions: {
                    show: {
                        animations: {
                            y: {
                                from: 120
                            }
                        }
                    },
                    hide: {
                        animations: {
                            y: {
                                to: 120
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#2f2f2f',
                        bodyColor: '#2f2f2f',
                        borderColor: 'rgba(54, 162, 235, 0.3)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            title: (tooltipItems) => {
                                return tooltipItems[0].label;
                            },
                            label: (context) => {
                                return `${context.dataset.label}: ${context.formattedValue}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        }
                    },
                    y: {
                        grid: {
                            display: false,
                        }
                    }
                }
            }
        });

        this.hideChartElements();
    }

    bind(refact) {
        this.refact = refact;
        this.listen();
    }

    listen() {
        this.refact.subscribe('index', (index) => {
            if (index) {
                this.setValue(index.defect?.state?.unresolved?.length);
                this.setTrend(index.defect?.state?.unresolved?.length - index.defect?.state?.resolved?.length);

                const backlog = StatisticManager.getBacklog(true,index, 'month');
                console.log(backlog, 'BACKLOG');
                this.drawMonthLine(backlog);
            }
        }); 
    }

    toggleMaximize() {
        if (this.isMaximized) {
            this.container.style.width = '100%';
            this.chart.resize();
        } else {
            this.container.style.width = '30%';
            this.chart.resize();
        }
        this.isMaximized = !this.isMaximized;
    }

    initMaximizeButton() {
        this.resizeIcon.addEventListener('click', () => {
            this.toggleMaximize();
        });
    }

    drawDateLine(values) {
        this.chart.data.labels = values.map((_, index) => index + 1);
        this.chart.data.datasets[0].data = values;
        this.chart.update();
    }

    drawMonthLine(monthlyValues) {
        console.log(monthlyValues, 'MONTHLY VALUES');

        const data = this.objectToData(monthlyValues);
        this.chart.data.labels = data.labels;
        this.chart.data.datasets[0].data = data.values;
        this.chart.update();

        console.log(`Chart Labels: ${this.chart.data.labels}, Chart Values: ${this.chart.data.datasets[0].data}`);
    }

    objectToData(object) {
        return {
            labels: Object.keys(object),
            values: Object.values(object).map(value => {
                if (Array.isArray(value)) {
                    return value.length;
                } else if (typeof value === 'object') {
                    return Object.keys(value).length;
                } else if (typeof value === 'number') {
                    return value;
                }
            })
        };
    }

    buildValueString(value) {
        return `${this.valueCountVariants[value % 10]} ${this.valueNameVariants[value % 10]}`;
    }

    setValue(value) {
        this.valueElement.textContent = value;
    }

    setTrend(difference) {
        this.trendElement.textContent = `${difference}%`;
        if (difference === 0) {
            this.trendElement.className = 'chart-card-trend neutral';
        } else if (difference > 0) {
            this.trendElement.className = 'chart-card-trend positive';
        } else {
            this.trendElement.className = 'chart-card-trend negative';
        }
    }

    hideChartElements() {
        // Скрыть сетку
        this.chart.options.scales.x.grid.display = false;
        this.chart.options.scales.y.grid.display = false;
        
        // Скрыть оси
        this.chart.options.scales.x.display = false;
        this.chart.options.scales.y.display = false;
        
        // Скрыть легенду
        this.chart.options.plugins.legend.display = false;
        
        // Скрыть точки на линии
        this.chart.data.datasets.forEach(dataset => {
            dataset.pointRadius = 0;
            dataset.pointHoverRadius = 0;
        });

        // Убрать отступы графика
        this.chart.options.layout = {
            padding: 0
        };
        
        this.chart.update();
    }

    setTitle(title) {
        this.titleElement.textContent = title;
    }

    update() {
        let index = this.refact.state.index;
        let unresolvedCount = StatisticManager.getUnresolvedDefects().count;
        let backlogData = StatisticManager.getBacklog(true, index);
        let unresolvedLostMonth = StatisticManager.getUnresolved
        this.chart.data.datasets[0].data = index;
        this.setValue(unresolvedCount || 0);
        this.setTrend(trendValue);
        
        this.chart.update();
    }

    updateLineStyle({
        color = 'rgba(54, 162, 235, 1)',
        width = 2,
        tension = 0.4
    } = {}) {
        this.chart.data.datasets[0].borderColor = color;
        this.chart.data.datasets[0].borderWidth = width;
        this.chart.data.datasets[0].tension = tension;
        
        // Обновляем градиент
        const ctx = this.chartCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 160);
        const rgba = color.replace(')', ', 0.2)').replace('rgb', 'rgba');
        gradient.addColorStop(0, rgba);
        gradient.addColorStop(1, rgba.replace('0.2', '0'));
        this.chart.data.datasets[0].backgroundColor = gradient;
        
        this.chart.update();
    }

    htmlTemplate = `
        <div class="card-container" style="position: relative; display: flex; flex-direction: column; height: 100%;">
            <div class="chart-container" style="position: absolute; inset: 0; z-index: 1;">
                <canvas class="chart-canvas"></canvas>
            </div>
            <div class="card-content-wrapper" style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;">
                <div class="chart-card-controls" style="position: absolute; top: 5px; right: 5px; display: flex; align-items: center; gap: 10px; z-index: 10;">
                    <div class="date-range-dropdown" style="position: relative; z-index: 1000;"></div>
                </div>
                <div class="chart-card-content" style="flex: 1;">
                    <header class="chart-card-header">
                        <div class="chart-card-title">Загрузка</div>
                    </header>
                    <div class="chart-card-value-container">
                        <div class="chart-card-value">0</div>
                        <div class="chart-card-trend">+0%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
