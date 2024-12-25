class ChartCard extends HtmlComponent {
    constructor(container) {
        super(container);
        this.container = this.createElement('div',
            {
                className: 'chart-card-container',
            });
            
            this.container = this.htmlToComponent(this.htmlTemplate);
        document.body.appendChild(this.container);

        this.titleElement = this.container.querySelector('header h2');
        this.valueElement = this.container.querySelector('.text-3xl');
        this.trendElement = this.container.querySelector('.c1lu4');
        this.chartCanvas = this.container.querySelector('canvas');
        this.menuButton = this.container.querySelector('header .cbm9w');
        this.menu = this.container.querySelector('header .cbx8s');
        this.chart = null;

        this.initMenu();
        this.initChart();
    }

    initMenu() {
        // this.menuButton.addEventListener('click', () => {
        //     this.menu.classList.toggle('hidden');  
        // });
    }

    render() {
        return this.container;
    }

    initChart() {
        this.chart = new Chart(this.chartCanvas, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Defects',
                    data: [],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(255, 206, 86, 0.5)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateChartData(data) {
        this.chart.data.labels = data.labels;
        this.chart.data.datasets[0].data = data.data;
        this.chart.update();
    }

    drawDateLine(values) {
        this.chart.data.labels = values.map((_, index) => index + 1);
        this.chart.data.datasets[0].data = values;
        this.chart.update();
    }

    setValue(value) {
        this.valueElement.textContent = `$${value.toLocaleString()}`;
    }

    setTrend(difference) {
        if (difference > 0) {
            this.trendElement.textContent = `+${difference}%`;
            this.trendElement.classList.remove('text-red-500');
            this.trendElement.classList.add('text-green-500');
        } else {
            this.trendElement.textContent = `${difference}%`;
            this.trendElement.classList.remove('text-green-500');
            this.trendElement.classList.add('text-red-500');
        }
    }

    setTitle(title) {
        this.titleElement.textContent = title;
    }

    htmlTemplate = `<div id="chart-card-container" class="flex bg-white c2vpa ci500 c18r2 coz6m c1hly c5vqk cetff">
        <div class="cx3hp cfkjc">
            <header class="flex cm3rx ce4zk c6f83">
                <h2 class="text-gray-800 dark:text-gray-100 cgulq c7x0x">Acme Plus</h2>
                <div class="inline-flex cm84d" x-data="{ open: false }">
                    <button class="rounded-full cdqku cg12x cmpw7 c3e4j" :class="open ? 'cyhlg cmr9m text-gray-500 dark:cdqku': 'cdqku cg12x cmpw7 c3e4j'" aria-haspopup="true" aria-expanded="false">
                        <span class="cn8jz">Menu</span>
                        <svg class="cbm9w cue4z cmwfi" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="2"></circle>
                            <circle cx="10" cy="16" r="2"></circle>
                            <circle cx="22" cy="16" r="2"></circle>
                        </svg>
                    </button>
                    <div class="bg-white border border-gray-200 cghq3 c2vpa cbx8s cxe43 cb8zv ccwri cqdkw ctd47 cr617 cgky2 cbxoy cvggx ccwg3 hidden" x-show="open" x-transition:enter="cxxol cbmha c8uqq c98dn" x-transition:enter-start="opacity-0 cx9xg" x-transition:enter-end="cgcrn csdj3" x-transition:leave="cxxol cbmha c8uqq" x-transition:leave-start="cgcrn" x-transition:leave-end="opacity-0">
                        <ul>
                            <li><a class="text-sm flex c196r cqahh c0zkc c1ukq c1k3n cb2br cwn3v" href="#0">Option 1</a></li>
                            <li><a class="text-sm flex c196r cqahh c0zkc c1ukq c1k3n cb2br cwn3v" href="#0">Option 2</a></li>
                            <li><a class="text-sm flex c84kf czr3n c1k3n cb2br cwn3v" href="#0">Remove</a></li>
                        </ul>
                    </div>
                </div>
            </header>
            <div class="cmpw7 cgulq cdqku c0ef0 c1iho cu6vl">Sales</div>
            <div class="flex ce4zk">
                <div class="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">$24,780</div>
                <div class="text-sm rounded-full c1lu4 c19il c1k3n c5idz">+49%</div>
            </div>
        </div>
        <div class="c2tvp cf4hy cbw8w">
            <canvas id="dashboard-card-01" width="414" height="115" style="display: block; box-sizing: border-box; height: 128px; width: 460px;"></canvas>
        </div>
    </div>`
}

// Пример использования
document.addEventListener('DOMContentLoaded', () => {
    const card = new ChartCard('chart-card-container');
    card.setTitle('Acme Plus');
    card.setValue(24780);
    card.setTrend(49);
    card.drawDateLine([10, 20, 15, 25, 30, 22, 35, 40, 38, 45, 50, 48]);
});
