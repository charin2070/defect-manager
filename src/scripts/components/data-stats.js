class DataStats extends Reactive {
    constructor(container, options = {}) {
        super(container);
        this.options = {
            theme: options.theme || 'light',
            layout: options.layout || 'default',
            columns: options.columns || 3,
            showChange: options.showChange !== false,
            ...options
        };

        // Add animation styles
        this.#injectStyles();
        this.templates = {
            default: this.#createDefaultTemplate(),
            simple: this.#createSimpleTemplate(),
            detailed: this.#createDetailedTemplate(),
            compact: this.#createCompactTemplate()
        };

        this.setupSubscriptions();
    }
    
    setupSubscriptions() {
        this.subscribe('statistics', (value) => {
            this.update(value);
        });
    }

    #injectStyles() {
        if (!document.getElementById('data-stats-styles')) {
            const styles = `
                .data-stats-card {
                    transition: all 0.3s ease-in-out;
                    position: relative;
                    overflow: hidden;
                    z-index: 10;
                    cursor: pointer;
                }               
                
                .data-stats-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                }
                
                .data-stats-icon {
                    transition: all 0.3s ease;
                }
                
                .data-stats-card:hover .data-stats-icon {
                    transform: scale(1.1);
                }
                
                .data-stats-value {
                    transition: all 0.3s ease;
                    background: linear-gradient(90deg, #3B82F6, #10B981);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
                
                .data-stats-trend {
                    transition: all 0.3s ease;
                }
                
                .data-stats-trend.up {
                    background: linear-gradient(135deg, #059669, #10B981);
                }
                
                .data-stats-trend.down {
                    background: linear-gradient(135deg, #DC2626, #EF4444);
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                
                .data-stats-loading {
                    animation: pulse 1.5s infinite ease-in-out;
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.id = 'data-stats-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }

    // Update statistics data
    update(stats) {
        if (!Array.isArray(stats)) {
            console.error('Stats must be an array of stat objects');
            return;
        }

        const processedStats = stats.map(stat => ({
            ...stat,
            id: stat.id || this.#generateId(),
            change: this.#calculateChange(stat),
            trend: this.#calculateTrend(stat)
        }));

        this.render(processedStats);
    }

    // Render statistics based on selected layout
    render(stats) {
        const template = this.templates[this.options.layout];
        if (!template) {
            console.error(`Layout template '${this.options.layout}' not found`);
            return;
        }

        const html = template(stats);
        this.container.innerHTML = html;
        this.#addEventListeners();
    }

    #createDetailedTemplate() {
        return (stats) => {
            const isDark = this.options.theme === 'dark';
            const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
            const textClass = isDark ? 'text-white' : 'text-gray-900';

            return `
                <dl class="mt-5 flex flex-rowa gap-5">
                    ${stats.map(stat => {
                        // Convert attributes object to string of HTML attributes
                        const attributesStr = stat.attributes ? 
                            Object.entries(stat.attributes)
                                .map(([key, value]) => `${key}="${value}"`)
                                .join(' ') 
                            : '';

                        return `
                            <div class="data-stats-card relative overflow-hidden rounded-lg ${bgClass} px-4 pb-12 pt-5 shadow-lg sm:px-6 sm:pt-6 backdrop-blur-sm no-cursor-select" 
                                 data-stat-id="${stat.id}"
                                 ${attributesStr}>
                                <dt>
                                    ${stat.icon ? `
                                        <div class="data-stats-icon absolute rounded-md p-3">
                                            <img src="${stat.icon}" alt="${stat.label}" class="h-6 w-6 text-white" />
                                        </div>
                                    ` : ''}
                                    <p class="ml-16 truncate text-sm font-medium text-gray-500">${stat.label}</p>
                                </dt>
                                <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
                                    <p class="data-stats-value text-2xl font-semibold ${stat.value === 'Загрузка...' ? 'data-stats-loading' : ''}">${stat.value}</p>
                                    ${this.#renderTrendIndicator(stat)}
                                    ${stat.footer ? `
                                        <div class="absolute inset-x-0 bottom-0 bg-gray-50/30 backdrop-blur-sm px-4 py-4 sm:px-6">
                                            <div class="text-sm text-gray-600">
                                                ${stat.footer}
                                            </div>
                                        </div>
                                    ` : ''}
                                </dd>
                            </div>
                        `;
                    }).join('')}
                </dl>`;
        };
    }

    #createSimpleTemplate() {
        return (stats) => {
            const isDark = this.options.theme === 'dark';
            const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
            const textClass = isDark ? 'text-white' : 'text-gray-900';

            return `
                <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-${this.options.columns}">
                    ${stats.map(stat => `
                        <div class="data-stats-card overflow-hidden rounded-lg ${bgClass} px-4 py-5 shadow-lg sm:p-6 no-cursor-select" data-stat-id="${stat.id}">
                            <dt class="truncate text-sm font-medium text-gray-500">${stat.label}</dt>
                            <dd class="mt-1 text-3xl font-semibold tracking-tight data-stats-value">${stat.value}</dd>
                        </div>
                    `).join('')}
                </dl>`;
        };
    }

    #createDefaultTemplate() {
        return (stats) => {
            const cols = this.options.columns;
            const isDark = this.options.theme === 'dark';
            const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
            const textClass = isDark ? 'text-white' : 'text-gray-900';

            return `
                <div class="data-stats-card no-cursor-select">
                    <div class="flex items-center justify-between mb-4">
                        <div class="data-stats-icon">
                            <img src="src/image/defects.svg" alt="Defects" class="w-8 h-8">
                        </div>
                        <div class="data-stats-trend"></div>
                    </div>
                    <div class="data-stats-value text-2xl font-bold mb-1">0</div>
                    <div class="data-stats-label text-gray-600">Дефектов</div>
                    <div class="text-sm text-gray-500 mt-2 cursor-pointer hover:text-blue-600 transition-colors" onclick="DataStats.handleMonthlyDefectsClick()">
                        <span class="monthly-defects">0 в этом месяце</span>
                    </div>
                </div>
            `;
        };
    }

    #createCompactTemplate() {
        return (stats) => {
            const isDark = this.options.theme === 'dark';
            const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
            const textClass = isDark ? 'text-white' : 'text-gray-900';

            return `
                <div class="${bgClass} shadow-lg rounded-lg overflow-hidden no-cursor-select">
                    <div class="mx-auto">
                        <div class="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-${this.options.columns}">
                            ${stats.map(stat => `
                                <div class="data-stats-card ${bgClass} px-4 py-6 sm:px-6 lg:px-8 no-cursor-select" data-stat-id="${stat.id}">
                                    <p class="text-sm font-medium leading-6 text-gray-400">${stat.label}</p>
                                    <p class="mt-2 flex items-baseline gap-x-2">
                                        <span class="data-stats-value text-4xl font-semibold tracking-tight">${stat.value}</span>
                                        ${stat.unit ? `<span class="text-sm text-gray-400">${stat.unit}</span>` : ''}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>`;
        };
    }

    #renderTrendIndicator(stat) {
        if (!this.options.showChange || !stat.trend) return '';
        
        const change = this.#calculateChange(stat);
        const isPositive = stat.trend === 'up';
        const trendClass = `data-stats-trend ${stat.trend}`;
        
        return `
            <div class="inline-flex items-baseline rounded-full ${trendClass} px-2.5 py-0.5 text-sm font-medium text-white md:mt-2 lg:mt-0 no-cursor-select">
                <svg class="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center" 
                     viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" 
                          d="${isPositive ? 
                              'M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z' : 
                              'M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z'}"
                          clip-rule="evenodd" />
                </svg>
                <span class="sr-only">${isPositive ? 'Increased' : 'Decreased'} by</span>
                ${Math.abs(change)}%
            </div>`;
    }

    // Helper methods
    #generateId() {
        return `stat#${Math.random().toString(36).substr(2, 9)}`;
    }

    #calculateChange(stat) {
        if (!stat.previousValue || !stat.value) return null;
        const prev = parseFloat(stat.previousValue);
        const curr = parseFloat(stat.value);
        if (isNaN(prev) || isNaN(curr)) return null;
        return ((curr - prev) / prev * 100).toFixed(2);
    }

    #calculateTrend(stat) {
        const change = this.#calculateChange(stat);
        if (change === null) return null;
        return parseFloat(change) >= 0 ? 'up' : 'down';
    }

    #addEventListeners() {
        const cards = this.container.querySelectorAll('.data-stats-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const statId = card.getAttribute('data-stat-id');
                if (this.options.onStatClick) {
                    this.options.onStatClick(statId);
                }
            });
        });
    }

    static async handleMonthlyDefectsClick() {
        const slidePanel = SlidePanel.getInstance();
        const refact = Refact.getInstance();
        const statistics = refact.state.statistics;
        
        if (!statistics || !statistics.total) return;
        
        const unresolvedIssues = statistics.total.unresolvedIssues || [];
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        // Filter issues for current month
        const currentMonthIssues = unresolvedIssues.filter(issue => {
            const issueDate = new Date(issue.created);
            return issueDate >= monthStart && issueDate <= currentDate;
        });

        if (currentMonthIssues.length > 0) {
            const issueTable = new IssueTable(
                ['taskId', 'reports', 'status', 'description', 'created'],
                { isUpperCase: false }
            );
            
            issueTable.render(currentMonthIssues);
            
            const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            slidePanel.open(issueTable.container, `Открытые дефекты за ${monthNames[currentDate.getMonth()]}`);
        } else {
            // If no issues, show empty state
            const emptyState = `
                <div class="flex flex-col items-center justify-center p-8 text-center">
                    <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Нет открытых дефектов</h3>
                    <p class="text-gray-500">В этом месяце не было зарегистрировано новых дефектов</p>
                </div>
            `;
            
            const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            slidePanel.open(emptyState, `Дефекты за ${monthNames[currentDate.getMonth()]}`);
        }
    }
}