class ChartCard extends HtmlComponent {
    constructor() {
        super();
        this.container = this.createElement('div', {
            className: 'chart-card-container',
        });

        this.container = this.htmlToComponent(this.htmlTemplate);
        document.body.appendChild(this.container);

        this.titleElement = this.container.querySelector('header .chart-card-title');
        this.valueElement = this.container.querySelector('.chart-card-value');
        this.trendElement = this.container.querySelector('.chart-card-trend');
        this.chartCanvas = this.container.querySelector('canvas');
        this.menuButton = this.container.querySelector('header .menu-icon');
        this.menu = this.container.querySelector('header .menu-dropdown');
        this.chart = null;

        this.initChart();
    }

    initChart() {
        this.chart = new Chart(this.chartCanvas, {
            type: 'line',
            data: {
                labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                datasets: [
                    {
                        label: 'Current Week',
                        data: [5, 8, 6, 7, 10, 6, 8],
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: false,
                    },
                    {
                        label: 'Previous Week',
                        data: [4, 7, 5, 6, 9, 5, 7],
                        borderColor: 'rgba(128, 128, 128, 0.5)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false,
                        },
                    },
                },
            },
        });
    }

    drawDateLine(values) {
        this.chart.data.labels = values.map((_, index) => index + 1);
        this.chart.data.datasets[0].data = values;
        this.chart.update();
    }

    setValue(value) {
        this.valueElement.textContent = `${value.toLocaleString()}`;
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

    setTitle(title) {
        this.titleElement.textContent = title;
    }

    htmlTemplate = `
        <div class="card-container">
            <div class="chart-card-content">
                <header class="chart-card-header">
                    <h2 class="chart-card-title">New Clients</h2>
                    <span class="chart-card-period">Last 7 days</span>
                </header>
                <div class="chart-card-value-container">
                    <div class="chart-card-value">6,782</div>
                    <div class="chart-card-trend neutral">0%</div>
                </div>
            </div>
            <div class="chart-container">
                <canvas class="chart-canvas"></canvas>
            </div>
        </div>
    `;
}
