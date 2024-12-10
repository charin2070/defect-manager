class LayoutView extends View {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.init();
    }

    createWrapper() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'min-h-screen bg-gray-100 no-cursor-select';
        this.wrapper.id = 'layout-main-container';
        
        // Create navbar
        const navbarElement = document.createElement('nav');
        navbarElement.className = 'navbar fixed top-0 left-0 w-full bg-white shadow-sm border-b border-gray-200 z-50 no-cursor-select';
        navbarElement.id = 'layout-navbar';
        
        const navbarContainer = document.createElement('div');
        navbarContainer.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 no-cursor-select';
        navbarContainer.id = 'layout-navbar-container';
        
        const navbarContent = document.createElement('div');
        navbarContent.className = 'flex justify-between h-16 no-cursor-select';
        navbarContent.id = 'layout-navbar-content';
        
        // Left section
        const leftSection = document.createElement('div');
        leftSection.className = 'flex items-center no-cursor-select';
        leftSection.id = 'layout-navbar-left-section';
        
        // Logo/Brand section
        const brandSection = document.createElement('div');
        brandSection.className = 'flex-shrink-0 flex items-center no-cursor-select';
        brandSection.id = 'layout-navbar-brand-section';
        
        // Date range dropdown
        const dateRangeDropdown = document.createElement('div');
        dateRangeDropdown.className = 'ml-6 relative no-cursor-select';
        dateRangeDropdown.id = 'layout-navbar-date-range-dropdown';
        
        const dateRangeButton = document.createElement('button');
        dateRangeButton.className = 'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
        dateRangeButton.id = 'layout-navbar-date-range-button';
        dateRangeButton.innerHTML = `
            <span>За всё время</span>
            <svg class="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        `;
        
        const dateRangeContent = document.createElement('div');
        dateRangeContent.className = 'hidden origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none no-cursor-select';
        dateRangeContent.id = 'layout-navbar-date-range-content';
        dateRangeContent.innerHTML = `
            <div class="py-1" role="none">
                <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Сегодня</a>
                <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Вчера</a>
                <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Последние 7 дней</a>
                <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Последние 30 дней</a>
            </div>
        `;
        
        dateRangeDropdown.appendChild(dateRangeButton);
        dateRangeDropdown.appendChild(dateRangeContent);
        
        // Toggle dropdown functionality
        dateRangeButton.addEventListener('click', () => {
            const isHidden = dateRangeContent.classList.contains('hidden');
            if (isHidden) {
                dateRangeContent.classList.remove('hidden');
            } else {
                dateRangeContent.classList.add('hidden');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!dateRangeDropdown.contains(event.target)) {
                dateRangeContent.classList.add('hidden');
            }
        });
        
        leftSection.appendChild(brandSection);
        leftSection.appendChild(dateRangeDropdown);
        
        // Right section
        const rightSection = document.createElement('div');
        rightSection.className = 'flex items-center space-x-4 no-cursor-select';
        rightSection.id = 'layout-navbar-right-section';
        
        // Create main menu dropdown
        const mainMenuItems = [
            [{
                action: 'upload',
                innerHTML: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>`,
                label: 'Загрузить файл'
            },
            {
                action: 'delete',
                innerHTML: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>`,
                label: 'Удалить данные'
            }],
            [{
                action: 'about',
                icon: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`,
                label: 'Debug',
                submenu: [
                    {
                        action: 'debug',
                        label: 'Log states',
                    },
                    {
                        action: 'showReports',
                        label: 'Show reports'
                    },
                    {
                        action: 'cleanupEntireLocalStorage',
                        label: 'Cleanup entire Local Storage'
                    }
                ]
            }],
            [{
                action: 'settings',
                icon: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>`,
                label: 'Настройки'
            }]
        ];

        const mainMenu = new DropdownComponent(rightSection, {
            id: 'layout-navbar-main-menu',
            buttonContent: '<img src="src/image/menu.svg" alt="Menu" class="w-5 h-5" />',
            items: mainMenuItems,
            onItemClick: (action) => {
                switch(action) {
                    case 'upload':
                        this.refact.setState({ view: 'upload' });
                        console.log('Upload clicked');
                        break;
                    case 'clearLocalStorageData':
                        this.refact.setState({ clearLocalStorageData: true }, 'DataManager.clearLocalStorageData');
                        break;
                    case 'debug':
                        // Выводим состояние Refact
                        console.log('Current Refact state:', this.refact.state);
                        break;
                    case 'settings':
                        this.refact.setState({ view: 'settings' });
                        break;
                    case 'showReports':
                        this.refact.setState({ view: 'reports' });
                        break;
                    case 'cleanupEntireLocalStorage':
                        localStorage.clear();
                        console.log('Local Storage cleared');
                        break;
                }
            }
        });

        const mainMenuButton = document.createElement('button');
        mainMenuButton.id = 'layout-navbar-main-menu-button';
        mainMenuButton.setAttribute('role', 'button');
        mainMenuButton.className = 'relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 no-cursor-select';

        // Assemble navbar
        navbarContent.appendChild(leftSection);
        navbarContent.appendChild(rightSection);
        navbarContainer.appendChild(navbarContent);
        navbarElement.appendChild(navbarContainer);
        
        this.wrapper.appendChild(navbarElement);
        
        // Initialize components
        this.navbar = {
            getElement: () => navbarElement,
            addGroup: (position, elements) => {
                const container = position === 'left' ? leftSection : rightSection;
                elements.forEach(element => container.appendChild(element));
                return container;
            }
        };
        
        // Add padding to account for fixed navbar
        const mainContent = document.createElement('div');
        mainContent.className = 'pt-16 no-cursor-select'; // Add padding-top equal to navbar height
        mainContent.id = 'layout-main-content';
        
        // Content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'container mx-auto px-4 py-6 no-cursor-select';
        this.contentContainer.id = 'layout-content-container';
        mainContent.appendChild(this.contentContainer);
        this.wrapper.appendChild(mainContent);
        
        return this.wrapper;
    }

    init() {
        this.createWrapper();
        this.setupEventListeners();
        this.setupSubscriptions();
    }

    setupSubscriptions() {
        // Subscribe to statistics updates
        this.refact.subscribe('statisticsUpdated', (statistics) => {
            this.handleStatisticsUpdate(statistics);
        });

        // Subscribe to defect card clicks
        document.addEventListener('click', (event) => {
            const defectCard = event.target.closest('[data-card-type="defect"]');
            if (defectCard) {
                this.handleDefectCardClick();
            }
        });
    }

    handleDefectCardClick() {
        const slidePanel = SlidePanel.getInstance();
        slidePanel.setTitle('Нерешенные дефекты');
        slidePanel.setLogo('src/image/bug-0.svg');

        // Get unresolved defects
        const unresolvedDefects = this.refact.state?.statistics?.defects?.unresolved || [];
        
        // Create and configure issue table
        const issueTable = new IssueTable(['taskId', 'status', 'description', 'reports', 'created']);
        issueTable.showIssues(unresolvedDefects);
        
        // Show panel with issue table
        slidePanel.setContent(issueTable.container);
        slidePanel.show();
    }

    setupEventListeners() {
        // Add event listeners here
    }

    setContent(content) {
        // Очищаем контейнер
        while (this.contentContainer.firstChild) {
            this.contentContainer.removeChild(this.contentContainer.firstChild);
        }
        // Добавляем новый контент
        if (content) {
            this.contentContainer.appendChild(content);
        }
    }

    showUploadView() {
        this.refact.setState({ view: 'upload' });
    }

    getWrapper() {
        return this.wrapper;
    }

    getContainer() {
        return this.contentContainer;
    }

    mount(targetElement) {
        if (targetElement) {
            targetElement.appendChild(this.container);
            return true;
        }
        return false;
    }
}
