class DashboardView extends View {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.createView();
        this.setupReactivity();
    }

    createView() {
        // Container
        const container = this.createContainer({
            id: 'dashboard-view',
            className: 'dashboard-container'
        });

        // Sections
        this.defectsContainer = this.createElement('div', { 
            id: "defectsContainer", 
            className: 'statistics-section sectionStyle'
        });
        
        this.reportsContainer = this.createElement('div', { 
            id: "reportsContainer", 
            className: 'statistics-section sectionStyle'
        });

        // Cards row
        this.defectsCardsGrid = this.createElement('div', { className: 'cards-grid' });

        // Assemble the view
        this.defectsContainer.appendChild(this.defectsCardsGrid);
        container.appendChild(this.defectsContainer);

        this.createCards();
    }

    addDefectCard(card) {
        this.defectsCardsGrid.appendChild(card);
    }

    addReportCard(card) {
        this.reportsCardsGrid.appendChild(card);
    }

    clearCards() {
        while (this.defectsCardsGrid.firstChild) {
            this.defectsCardsGrid.removeChild(this.defectsCardsGrid.firstChild);
        }
    }

    createCards() {
        // Defects
        this.totalIssuesCard = new InfoCard(this.defectsCardsGrid, {
            title: 'Всего дефектов',
            content: '0',
            iconSvg: this.getBugIcon(),
            footer: 'Общее количество дефектов'
        });

        this.openIssuesCard = new InfoCard(this.defectsCardsGrid, {
            title: 'Открытые дефекты',
            content: '0',
            iconSvg: this.getOpenIcon(),
            footer: 'Дефекты в работе'
        });
    }

    setupReactivity() {
        this.refact.subscribe('defects', (defects) => {
            if (!defects) return;

            const { unresolved, reports } = statistics;

            // Обновляем статистику по дефектам
            if (overview) {
                this.totalIssuesCard.setContent(overview.total.toString());
                this.openIssuesCard.setContent(overview.open.toString());
                this.closedIssuesCard.setContent(overview.closed.toString());
            }

            // Обновляем статистику по обращениям
            if (reports) {
                this.unresolvedReportsCard.setContent(reports.unresolvedReports.toString());
                this.currentMonthReportsCard.setContent(reports.currentMonthReports.toString());
                
                // Форматируем тренд
                const trend = reports.monthlyTrend || 0;
                const trendSymbol = reports.trendDirection === 'up' ? '↑' : 
                                  reports.trendDirection === 'down' ? '↓' : '→';
                this.trendReportsCard.setContent(`${trend} ${trendSymbol}`);
                
                // Обновляем цвет тренда
                const trendColor = reports.trendDirection === 'up' ? 'var(--error-color)' : 
                                 reports.trendDirection === 'down' ? 'var(--success-color)' : 
                                 'var(--text-color)';
                this.trendReportsCard.setContentColor(trendColor);
            }
        });
    }

    // Иконки для карточек
    getBugIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"/><path d="M8 13H16M8 13V9M8 13L12 17L16 13M16 13V9"/></svg>';
    }

    getOpenIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4h8"/></svg>';
    }

    getCheckIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 11.8L11 14.8L16 9.8"/></svg>';
    }

    getAlertIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12h4v8a2 2 0 002 2h8a2 2 0 002-2v-8h4L12 2z"/><path d="M12 8v4m0 4h.01"/></svg>';
    }

    getCalendarIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    }

    getTrendIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>';
    }
}
