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
        this.container.innerHTML = `
            <div class="settings-container">
                <div class="settings-header">
                    <div class="header-with-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        </svg>
                        <h1>Настройки</h1>
                    </div>
                </div>

                <div class="settings-content">
                    <div class="settings-section">
                        <div class="section-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zM8 12h8M12 16V8"/>
                            </svg>
                            <h2>Данные</h2>
                        </div>
                        
                        <div class="settings-item">
                            <div class="item-main">
                                <span class="item-title">Импортировать файл из Jira</span>
                            </div>
                            <button class="chrome-button" data-action="import">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path>
                                </svg>
                                Импортировать
                            </button>
                        </div>

                        <div class="settings-item">
                            <div class="item-main">
                                <span class="item-title">Сохранить в файл</span>
                            </div>
                            <button class="chrome-button" data-action="export">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 4v12"></path>
                                </svg>
                                Сохранить
                            </button>
                        </div>

                        <div class="settings-item">
                            <div class="item-main">
                               <button class="chrome-button danger" data-action="clear">
                                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Удалить все данные
                            </button>
                            </div>
                           
                        </div>
                    </div>

                    <div class="settings-section">
                        <div class="section-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"/>
                            </svg>
                            <h2>Интерфейс</h2>
                        </div>

                        <div class="settings-item">
                            <div class="item-main">
                                <span class="item-title">Тёмная тема</span>
                                <span class="item-subtitle">Изменить цветовую схему приложения</span>
                            </div>
                            <label class="chrome-toggle">
                                <input type="checkbox" id="theme-toggle">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="settings-item">
                            <div class="item-main">
                                <span class="item-title">Отключить анимации</span>
                                <span class="item-subtitle">Уменьшает нагрузку на систему</span>
                            </div>
                            <label class="chrome-toggle">
                                <input type="checkbox" id="animations-toggle">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <div class="section-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                            </svg>
                            <h2>Экспериментальные функции</h2>
                        </div>

                        <div class="settings-item">
                            <div class="item-main">
                                <span class="item-title">Сохранять индекс</span>
                                <span class="item-subtitle">Ускоряет поиск, но увеличивает размер хранилища</span>
                            </div>
                            <label class="chrome-toggle">
                                <input type="checkbox" id="save-index-toggle">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .settings-container {
                width: 100%;
            
                margin: 0 auto;
                padding: 24px 48px;
                color: var(--text-primary);
            }

            .settings-header {
                position: sticky;
                top: 0;
                background: var(--surface-primary);
                padding: 8px 0;
                margin-bottom: 20px;
                z-index: 1;
            }

            .header-with-icon {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .header-with-icon svg {
                color: var(--text-secondary);
            }

            .settings-header h1 {
                font-size: 1.375rem;
                font-weight: 500;
                color: var(--text-primary);
            }

            .settings-content {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .settings-section {
                background: var(--surface-primary);
                border-radius: 4px;
                padding: 16px 0;
            }

            .section-header {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 0 20px 12px;
                border-bottom: 1px solid var(--border-color);
                margin-bottom: 8px;
            }

            .section-header svg {
                color: var(--text-secondary);
            }

            .section-header h2 {
                font-size: 1.1rem;
                font-weight: 500;
                color: var(--text-primary);
            }

            .settings-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 20px;
                min-height: 52px;
                transition: background-color 0.1s;
            }

            .settings-item:hover {
                background: var(--surface-hover);
            }

            .item-main {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .item-title {
                font-size: 0.9375rem;
                color: var(--text-primary);
            }

            .item-subtitle {
                font-size: 0.8125rem;
                color: var(--text-secondary);
            }

            .chrome-button {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                border-radius: 4px;
                border: 1px solid var(--border-color);
                background: var(--button-secondary);
                color: var(--text-primary);
                font-size: 0.8125rem;
                cursor: pointer;
                transition: background-color 0.1s;
            }

            .chrome-button:hover {
                background: var(--button-secondary-hover);
            }

            .chrome-button.danger {
                color: var(--text-danger);
            }

            .chrome-button.danger:hover {
                background: var(--button-danger-hover);
            }

            .chrome-toggle {
                position: relative;
                display: inline-block;
                width: 36px;
                height: 20px;
            }

            .chrome-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--toggle-bg);
                transition: .2s;
                border-radius: 20px;
            }

            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 2px;
                bottom: 2px;
                background-color: white;
                transition: .2s;
                border-radius: 50%;
            }

            input:checked + .toggle-slider {
                background-color: var(--toggle-active);
            }

            input:checked + .toggle-slider:before {
                transform: translateX(16px);
            }
        `;
        document.head.appendChild(style);
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
