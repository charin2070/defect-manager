// We don't use ES6 modules
// Requires: report-manager.js to be loaded before this file
class ReportDropdown extends DropdownComponent {
    constructor(parentElement) {
        // Create dropdown structure
        const container = document.createElement('div');
        container.className = 'dropdown report-dropdown';
        container.id = 'reportDropdownContainer';
        
        const button = document.createElement('button');
        button.className = 'dropdown-toggle';
        button.textContent = 'Отчёт';
        
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        
        container.appendChild(button);
        container.appendChild(menu);
        parentElement.appendChild(container);
        
        // Initialize dropdown
        super(container);
        
        this.refact = Refact.getInstance();
        this.setupItems();
    }

    setupItems() {
        this.clearItems();
        
        // Add report types
        this.addItem('Еженедельный отчёт по обращениям', 'weekly', () => {
            this.setReportType('weekly');
            this.button.textContent = 'Еженедельный отчёт по обращениям';
        });

        this.addItem('MVP отчёта по дефектам и доработкам', 'mvp', () => {
            this.setReportType('mvp');
            this.button.textContent = 'MVP отчёта по дефектам и доработкам';
        });
    }

    setReportType(type) {
        if (this.refact) {
            this.refact.setState({ reportType: type }, 'ReportDropdown');
        }
    }
}