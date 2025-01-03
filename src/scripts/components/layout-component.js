class LayoutComponent extends HtmlComponent {
    constructor(container) {
        super(container);
        this.appContainer = container;
        this.container = this.create();
        this.render();
    }

    render() {
        if (!this.container.parentElement && this.appContainer) {
            this.appContainer.appendChild(this.container);
        }
    }

    create() {
        const container = this.createElement('div', {
            id: 'layout-view',
            className: 'flex flex-col min-h-screen bg-gray-50'
        });

        // Navigation
        const nav = new NavbarComponent();
        // });
        // nav.innerHTML = `
        //     <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        //         <div class="flex justify-between h-16">
        //             <div class="flex">
        //                 <a href="#" data-route="dashboard" class="nav-link">Dashboard</a>
        //                 <a href="#" data-route="upload" class="nav-link">Upload</a>
        //                 <a href="#" data-route="reports" class="nav-link">Reports</a>
        //                 <a href="#" data-route="settings" class="nav-link">Settings</a>
        //             </div>
        //         </div>
        //     </div>
        // `;
        container.appendChild(nav.getElement());

        // Main content area with view container
        const main = this.createElement('main', {
            className: 'flex-grow container mx-auto px-4 py-8'
        });
        
        // View container for mounting views
        this.viewContainer = this.createElement('div', {
            id: 'view-container',
            className: 'w-full h-full'
        });
        main.appendChild(this.viewContainer);
        container.appendChild(main);
        
        return container;
    }

    getViewContainer() {
        return this.viewContainer;
    }

    getContainer() {
        return this.container;
    }
}
    