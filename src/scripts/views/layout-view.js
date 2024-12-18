class LayoutView extends View {
    constructor(container) {
        super(container);
        this.container = container || document.getElementById('app');
        if (!this.container) {
            throw new Error('Container element not found');
        }
        this.init();
    }

    createWrapper() {
        // Очищаем контейнер перед добавлением нового wrapper
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

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

        // Add hover event to open dropdown
        dateRangeDropdown.addEventListener('mouseenter', () => {
          dateRangeDropdown.classList.add('open');
        });
        dateRangeDropdown.addEventListener('mouseleave', () => {
          dateRangeDropdown.classList.remove('open');
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
                icon: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>`,
                label: 'Загрузить файл'
            },
            {
                action: 'clearLocalStorageData',
                icon: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>`,
                label: 'Удалить данные'
            }],
            [{
                action: 'about',
                icon: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>`,
                label: 'Debug',
                submenu: [
                    {
                        action: 'debug',
                        icon: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>`,
                        label: 'Log states',
                    },
                    {
                        action: 'test',
                        icon: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <g id="log-white" fill="#000000" transform="translate(85.572501, 42.666667)">
                        <path d="M236.349632,7.10542736e-15 L1.68296533,7.10542736e-15 L1.68296533,234.666667 L44.349632,234.666667 L44.349632,192 L44.349632,169.6 L44.349632,42.6666667 L218.642965,42.6666667 L300.349632,124.373333 L300.349632,169.6 L300.349632,192 L300.349632,234.666667 L343.016299,234.666667 L343.016299,106.666667 L236.349632,7.10542736e-15 L236.349632,7.10542736e-15 Z M4.26325641e-14,405.333333 L4.26325641e-14,277.360521 L28.8096875,277.360521 L28.8096875,382.755208 L83.81,382.755208 L83.81,405.333333 L4.26325641e-14,405.333333 Z M153.17,275.102708 C173.279583,275.102708 188.692917,281.484792 199.41,294.248958 C209.705625,306.47125 214.853437,322.185625 214.853437,341.392083 C214.853437,362.404792 208.772396,379.112604 196.610312,391.515521 C186.134062,402.232604 171.653958,407.591146 153.17,407.591146 C133.060417,407.591146 117.647083,401.209062 106.93,388.444896 C96.634375,376.222604 91.4865625,360.267396 91.4865625,340.579271 C91.4865625,319.988021 97.5676042,303.490937 109.729687,291.088021 C120.266146,280.431146 134.74625,275.102708 153.17,275.102708 Z M153.079687,297.680833 C142.663646,297.680833 134.625833,302.015833 128.96625,310.685833 C123.848542,318.512917 121.289687,328.567708 121.289687,340.850208 C121.289687,355.059375 124.330208,366.0775 130.41125,373.904583 C136.131042,381.310208 143.717292,385.013021 153.17,385.013021 C163.525833,385.013021 171.59375,380.647917 177.37375,371.917708 C182.491458,364.211042 185.050312,354.035833 185.050312,341.392083 C185.050312,327.483958 182.009792,316.616354 175.92875,308.789271 C170.208958,301.383646 162.592604,297.680833 153.079687,297.680833 Z M343.91,333.715521 L343.91,399.011458 C336.564583,401.48 331.386667,403.105625 328.37625,403.888333 C319.043958,406.356875 309.019271,407.591146 298.302187,407.591146 C277.229271,407.591146 261.18375,402.292812 250.165625,391.696146 C237.943333,380.015729 231.832187,363.729375 231.832187,342.837083 C231.832187,318.813958 239.418437,300.69125 254.590937,288.468958 C265.609062,279.558125 280.480521,275.102708 299.205312,275.102708 C315.220729,275.102708 330.122292,278.022812 343.91,283.863021 L334.065937,306.350833 C327.563437,303.099583 321.87375,300.826719 316.996875,299.53224 C312.12,298.23776 306.761458,297.590521 300.92125,297.590521 C286.952917,297.590521 276.657292,302.13625 270.034375,311.227708 C264.435,318.934375 261.635312,329.079479 261.635312,341.663021 C261.635312,356.775312 265.849896,368.154687 274.279062,375.801146 C281.022396,381.942396 289.391354,385.013021 299.385937,385.013021 C305.226146,385.013021 310.765312,384.019583 316.003437,382.032708 L316.003437,356.293646 L293.967187,356.293646 L293.967187,333.715521 L343.91,333.715521 Z" id="XLS"></path>
        </g>
                        </svg>`,
                        label: 'Test',
                    },
                    {
                        action: 'showReports',
                        icon: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>`,
                        label: 'Show reports'
                    },
                    {
                        action: 'cleanupEntireLocalStorage',
                        icon: `<svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>`,
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
            buttonContent: '<img src="src/image/hamburger-0.svg" alt="Menu" class="w-5 h-5" />',
            items: mainMenuItems,
            onItemClick: (action) => {
                switch (action) {
                    case 'test':
                        this.refact.setState({ process: 'test_function' });
                        break;
                    case 'upload':
                        // this.refact.setState({ view: 'upload' });
                        this.setState({ process: 'file_upload' });
                        break;
                    case 'clearLocalStorageData':
                        // Используем единичный вызов setState с контекстом
                        this.refact.setState({ process: 'cleanup_local_storage_data' }, 'LayoutView.clearLocalStorageData');
                        break;
                    case 'debug':
                        // Выводим состояние Refact
                        this.setState({ process: 'logState' });
                        break;
                    case 'settings':
                        this.refact.setState({ view: 'settings' });
                        break;
                    case 'showReports':
                        this.refact.setState({ view: 'reports' });
                        break;
                    case 'cleanupEntireLocalStorage':
                        this.setState({ process: 'cleanup_local_storage' });
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
        this.setupSubscriptions();
    }

    setupSubscriptions() {
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
        slidePanel.setLogo('src/image/jira-defect.svg');

        // Get unresolved defects
        const unresolvedDefects = this.refact.state?.statistics?.defects?.unresolved || [];

        // Create and configure issue table
        const issueTable = new IssueTable(['taskId', 'status', 'description', 'reports', 'created']);
        issueTable.showIssues(unresolvedDefects);

        // Show panel with issue table
        slidePanel.open(issueTable.container, 'Открытые дефекты');
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
