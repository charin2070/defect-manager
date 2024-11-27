class ReportsView extends View {
    constructor() {
        super();
        this.container = document.createElement('div');
        this.container.className = 'reports-view';
        
        this.headers = ['Задача', 'Обращений', 'Статус', 'Описание', 'Создан'];
        this.currentMonthTable = new IssueTable(this.headers);
        this.allTimeTable = new IssueTable(this.headers);
        
        // Store data for re-rendering
        this.currentMonthData = null;
        this.allTimeData = null;
        
        this.setupView();
    }
    
    setupView() {
        // Create tabs container
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'reports-tabs';
        
        // Create tabs
        this.currentMonthTab = document.createElement('button');
        this.currentMonthTab.className = 'tab-button active';
        this.currentMonthTab.textContent = 'За текущий месяц';
        this.currentMonthTab.addEventListener('click', () => this.switchTab('current'));
        
        this.allTimeTab = document.createElement('button');
        this.allTimeTab.className = 'tab-button';
        this.allTimeTab.textContent = 'За всё время';
        this.allTimeTab.addEventListener('click', () => this.switchTab('all'));
  
        //  tabsContainer.appendChild(this.logo);
        tabsContainer.appendChild(this.currentMonthTab);
        tabsContainer.appendChild(this.allTimeTab);
        
        // Create content containers
        this.currentMonthContent = document.createElement('div');
        this.currentMonthContent.className = 'tab-content active';
        
        this.allTimeContent = document.createElement('div');
        this.allTimeContent.className = 'tab-content';
        
        // Assemble view
        this.container.appendChild(tabsContainer);
        this.container.appendChild(this.currentMonthContent);
        this.container.appendChild(this.allTimeContent);
    }
    
    switchTab(tab) {
        // Remove active class from all tabs and contents
        this.currentMonthTab.classList.remove('active');
        this.allTimeTab.classList.remove('active');
        this.currentMonthContent.classList.remove('active');
        this.allTimeContent.classList.remove('active');
        
        // Activate selected tab
        if (tab === 'current') {
            this.currentMonthTab.classList.add('active');
            this.currentMonthContent.classList.add('active');
        } else {
            this.allTimeTab.classList.add('active');
            this.allTimeContent.classList.add('active');
        }
    }
    
    render(currentMonthData, allTimeData) {
        // Store data for potential re-renders
        this.currentMonthData = currentMonthData;
        this.allTimeData = allTimeData;
        
        // Clear existing content
        this.currentMonthContent.innerHTML = '';
        this.allTimeContent.innerHTML = '';
        
        // Render tables
        const currentMonthTable = this.currentMonthTable.showIssues(currentMonthData, this.headers);
        const allTimeTable = this.allTimeTable.showIssues(allTimeData, this.headers);
        
        // Append tables to content containers
        this.currentMonthContent.appendChild(currentMonthTable);
        this.allTimeContent.appendChild(allTimeTable);
        
        return this.container;
    }
}
