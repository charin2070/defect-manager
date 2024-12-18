class BaseChart extends HtmlComponent {
  constructor(container) {
    super(container);
    // Store the container
    this.container = container;
  }

  createCanvas() {
    // Create a div wrapper
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '400px';
    wrapper.style.position = 'relative';
    
    // Create the canvas
    const canvas = document.createElement('canvas');
    wrapper.appendChild(canvas);
    
    return { wrapper, canvas };
  }

  createChart(type, data, labels, options = {}) {
    // Clean up any existing chart
    if (this.chart) {
      this.chart.destroy();
      this.container.innerHTML = '';
    }

    // Create new canvas
    const { wrapper, canvas } = this.createCanvas();
    this.container.appendChild(wrapper);

    // Create the chart
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false
    };

    const chartOptions = { ...defaultOptions, ...options };

    this.chart = new Chart(canvas, {
      type: type,
      data: data,
      options: chartOptions
    });

    return this.chart;
  }
}
