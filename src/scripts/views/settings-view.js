class SettingsView extends ViewComponent {
    constructor() {
        super();
        this.fieldMappings = this.#getDefaultFieldMappings();
        this.dashboardLayout = this.#getDefaultDashboardLayout();
        this.#loadSettings();
        this.createView();
        this.#setupEventListeners();
    }

    createView() {
        const container = this.createElement('div', {
            id: 'settings-view',
            className: 'settings-view p-6'
        });

        this.setContainer(container);
        this.#renderContent();
    }

    #renderContent() {
        if (!this.getContainer()) return;
    
        this.getContainer().innerHTML = `
            <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                    <svg class="w-8 h-8 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Настройки
                </h2>
    
                <!-- Data Management Section -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
                    <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                        </svg>
                        Управление данными
                    </h3>
                    <div class="data-management-options">
                        <button class="bg-blue-500 text-white px-4 py-2 rounded" data-action="loadData">Загрузить данные</button>
                        <button class="bg-red-500 text-white px-4 py-2 rounded" data-action="clearLocalStorageData">Очистить локальные данные</button>
                    </div>
                </div>
    
                <!-- Dashboard Layout Section -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
                    <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                        </svg>
                        Настройка панели инструментов
                    </h3,`;}

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
            const savedMappings = localStorage.getItem('fieldMappings');
            const savedLayout = localStorage.getItem('dashboardLayout');

            if (savedMappings) {
                this.fieldMappings = JSON.parse(savedMappings);
            }

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
    }

    #saveSettings() {
        try {
            // Сохраняем маппинг полей
            const newMappings = {};
            Object.keys(this.fieldMappings).forEach(field => {
                const input = this.getContainer()?.querySelector(`#mapping_${field}`);
                if (input) {
                    newMappings[field] = input.value;
                }
            });

            // Сохраняем layout дашборда
            const newLayout = {};
            Object.keys(this.dashboardLayout).forEach(panel => {
                const input = this.getContainer()?.querySelector(`#position_${panel}`);
                if (input) {
                    newLayout[panel] = { position: parseInt(input.value, 10) };
                }
            });

            // Сохраняем в localStorage
            localStorage.setItem('fieldMappings', JSON.stringify(newMappings));
            localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));

            // Обновляем состояние
            this.fieldMappings = newMappings;
            this.dashboardLayout = newLayout;

            // Уведомляем об изменениях
            this.setState({ 
                fieldMappings: newMappings,
                dashboardLayout: newLayout
            }, 'SettingsView.saveSettings');

            // Перерисовываем контент
            this.#renderContent();

        } catch (error) {
            console.error('[SettingsView] Error saving settings:', error);
        }
    }
}
