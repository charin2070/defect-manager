class LayoutView extends ViewComponent {
    constructor() {
        super();
        this.createView();
    }

    createView() {
        const container = this.createElement('div', {
            id: 'layout-view',
            className: 'flex flex-col min-h-screen bg-gray-50'
        });
        
        // Header
        const header = this.createElement('header', {
            className: 'bg-white shadow-sm'
        });
        header.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <h1 class="text-2xl font-bold text-gray-900">Defect Manager</h1>
            </div>
        `;
        container.appendChild(header);

        // Main content area
        const main = this.createElement('main', {
            className: 'flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8'
        });
        container.appendChild(main);

        this.setContainer(container);
    }

    getContainer() {
        return this.container;
    }
}
