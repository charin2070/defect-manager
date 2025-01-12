class SettingsView extends ViewComponent {
    constructor() {
        super();
        this.dashboardLayout = this.#getDefaultDashboardLayout();
        this.#loadSettings();
        
        // Set container properties
        this.container.id = 'settings-view';
        this.container.className = 'view-container';
        
        // Initialize content
        this.#renderContent();
        this.#setupEventListeners();
    }

    #renderContent() {
        // Создаем контейнер настроек
        const settingsContainer = this.createElement('div', { className: 'settings-container' });
        const settingsContent = this.createElement('div', { className: 'settings-content' });
        
        // Создаем и добавляем боковое меню
        const sideMenuContainer = this.createElement('div', { className: 'side-menu-container' });
        this.sideMenu = new SideMenuComponent();
        sideMenuContainer.appendChild(this.sideMenu.getContainer());
        
        // Создаем основной контент
        const mainContent = this.createElement('div', { className: 'settings-section' });
        mainContent.innerHTML = `
            <div class="settings-section-header">
                <img class="w-6 h-6 md:w-6 md:h-auto md:rounded-none rounded-full mx-auto" src="src/image/folder.svg" alt="" width="1em" height="1em">
                <h2>Данные</h2>
            </div>

            <div class="settings-item">
                <div class="item-main">
                    <span class="item-title">Загрузить из файла</span>
                </div>
                <label class="chrome-toggle">
                    <input type="checkbox" id="theme-toggle">
                    <span class="toggle-slider"></span>
                </label>
            </div>

            <div class="settings-item">
                <div class="item-main">
                    <span class="item-title">Удалить данные</span>
                    <span class="item-subtitle">Удалить данные Jira, кэш и настройки</span>
                </div>
                <label class="chrome-toggle">
                    <input type="checkbox" id="animations-toggle">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
        
        // Собираем все вместе
        settingsContent.appendChild(sideMenuContainer);
        settingsContent.appendChild(mainContent);
        settingsContainer.appendChild(settingsContent);
        this.container.appendChild(settingsContainer);
    }

    #createDashboardLayoutControls() {
        const panels = [
            { id: 'statistics', label: 'Статистика', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'timeline', label: 'Временная шкала', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'priorities', label: 'Приоритеты', icon: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12' },
            { id: 'team', label: 'Команда', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
        ];

        return panels.map(panel => `
            <div class="panel-control bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div class="p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${panel.icon}"></path>
                            </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-900">${panel.label}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-700">Позиция:</label>
                        <input type="number" 
                               id="position_${panel.id}"
                               class="w-16 p-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                               min="1" 
                               max="4"
                               value="${this.dashboardLayout[panel.id]?.position}">
                    </div>
                </div>
            </div>
        `).join('');
    }

    #getDefaultFieldMappings() {
        return {
            'Issue key': 'Issue key',
            'summary': 'Summary',
            'description': 'Description',
            'status': 'Status',
            'priority': 'Priority',
            'assignee': 'Assignee',
            'reporter': 'Reporter',
            'created': 'Created',
            'updated': 'Updated',
            'labels': 'Labels',
            'issueType': 'Issue Type',
            'resolved': 'Resolved',
            'slaDate': 'Due Date',
            'customDescription': 'Custom field (Description)',
            'reportsCount': 'Reports',
            'team': 'Team',
            'businessSummary': 'Business Summary',
            'component': 'Component'
        };
    }

    #getDefaultDashboardLayout() {
        return {
            statistics: { position: 1 },
            timeline: { position: 2 },
            priorities: { position: 3 },
            team: { position: 4 }
        };
    }

    #loadSettings() {
        try {

            const savedLayout = localStorage.getItem('dashboardLayout');
            if (savedLayout) {
                this.dashboardLayout = JSON.parse(savedLayout);
            }
        } catch (error) {
            console.error('[SettingsView] Error loading settings:', error);
        }
    }

    #setupEventListeners() {
        const saveButton = this.getContainer()?.querySelector('#saveSettings');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.#saveSettings());
        }

        // Get all buttons in settings
        const buttons = this.container.querySelectorAll('button[data-action]');
        
        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                const action = button.dataset.action;
                
                switch (action) {
                    case 'clear':
                        // Set process to cleanup_local_storage
                        Refact.getInstance().setState({ process: 'cleanup_local_storage' }, 'SettingsView.clear');
                        break;
                    // Add other cases for different buttons
                }
            });
        });
    }

    #saveSettings() {
        try {
            // Сохраняем layout дашборда
            const newLayout = {};
            Object.keys(this.dashboardLayout).forEach(panel => {
                const input = this.getContainer()?.querySelector(`#position_${panel}`);
                if (input) {
                    newLayout[panel] = { position: parseInt(input.value, 10) };
                }
            });

            // Сохраняем в localStorage
            localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));

            // Обновляем состояние
            this.dashboardLayout = newLayout;

            // Уведомляем об изменениях
            this.setState({ 
                dashboardLayout: newLayout
            }, 'SettingsView.saveSettings');

            // Перерисовываем контент
            this.#renderContent();

        } catch (error) {
            console.error('[SettingsView] Error saving settings:', error);
        }
    }
}
