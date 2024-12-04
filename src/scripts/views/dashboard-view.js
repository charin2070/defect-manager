class DashboardView extends View {
    constructor() {
        super();
        this.refact = Refact.getInstance();
        this.createView();
        this.setupReactivity();
    }

    createView() {
        this.container = document.createElement('div');
        this.container.className = 'dashboard-container';

        // Создаем контейнер для карточек
        this.cardsContainer = document.createElement('div');
        this.cardsContainer.className = 'cards-grid';
        this.cardsContainer.style.display = 'flex';
        this.cardsContainer.style.flexDirection = 'row';
        this.cardsContainer.style.gap = '1.5rem';
        this.cardsContainer.style.marginBottom = '2rem';
        this.cardsContainer.style.overflowX = 'auto';
        this.cardsContainer.style.paddingBottom = '1rem';
        
        this.container.appendChild(this.cardsContainer);
        this.createCards();
    }

    createCards() {
        // Карточка с общим количеством дефектов
        this.totalIssuesCard = new InfoCard(this.cardsContainer, {
            title: 'Всего дефектов',
            content: '0',
            iconSvg: this.getBugIcon(),
            footer: 'Общее количество дефектов'
        });

        // Карточка с открытыми дефектами
        this.openIssuesCard = new InfoCard(this.cardsContainer, {
            title: 'Открытые дефекты',
            content: '0',
            iconSvg: this.getOpenIcon(),
            footer: 'Дефекты в работе'
        });

        // Карточка с закрытыми дефектами
        this.closedIssuesCard = new InfoCard(this.cardsContainer, {
            title: 'Закрытые дефекты',
            content: '0',
            iconSvg: this.getCheckIcon(),
            footer: 'Исправленные дефекты'
        });

        // Карточка с просроченными дефектами
        this.overdueIssuesCard = new InfoCard(this.cardsContainer, {
            title: 'Просроченные',
            content: '0',
            iconSvg: this.getClockIcon(),
            footer: 'Дефекты с истекшим SLA'
        });
    }

    setupReactivity() {
        this.refact.subscribe('issues', (issues) => {
            if (issues) {
                this.updateStatistics(issues);
            }
        });
    }

    updateStatistics(issues) {
        // Общее количество
        this.totalIssuesCard.setContent(issues.length.toString());

        // Открытые дефекты
        const openIssues = issues.filter(issue => 
            ['new', 'in_progress', 'delayed'].includes(issue.status)
        );
        this.openIssuesCard.setContent(openIssues.length.toString());

        // Закрытые дефекты
        const closedIssues = issues.filter(issue => 
            issue.status === 'resolved'
        );
        this.closedIssuesCard.setContent(closedIssues.length.toString());

        // Просроченные дефекты
        const overdueIssues = issues.filter(issue => {
            if (!issue.slaDate) return false;
            const slaDate = new Date(issue.slaDate);
            return slaDate < new Date() && issue.status !== 'resolved';
        });
        this.overdueIssuesCard.setContent(overdueIssues.length.toString());
    }

    getContainer() {
        return this.container;
    }

    // SVG иконки для карточек
    getBugIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1.5c-1.5 0-2.8.9-3.4 2.2-.3.5-.6 1-.9 1.5-.3-.2-.6-.3-1-.3-1.1 0-2 .9-2 2 0 .7.4 1.3.9 1.7-.5.9-.9 1.8-1.1 2.8-.7.2-1.2.8-1.2 1.6 0 .9.7 1.6 1.5 1.6.3 0 .5-.1.8-.2.2 1 .6 1.9 1.1 2.8-.5.4-.9 1-.9 1.7 0 1.1.9 2 2 2 .4 0 .7-.1 1-.3.3.5.6 1 .9 1.5.6 1.3 1.9 2.2 3.4 2.2s2.8-.9 3.4-2.2c.3-.5.6-1 .9-1.5.3.2.6.3 1 .3 1.1 0 2-.9 2-2 0-.7-.4-1.3-.9-1.7.5-.9.9-1.8 1.1-2.8.3.1.5.2.8.2.8 0 1.5-.7 1.5-1.6 0-.8-.5-1.4-1.2-1.6-.2-1-.6-1.9-1.1-2.8.5-.4.9-1 .9-1.7 0-1.1-.9-2-2-2-.4 0-.7.1-1 .3-.3-.5-.6-1-.9-1.5-.6-1.3-1.9-2.2-3.4-2.2z"/></svg>';
    }

    getOpenIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>';
    }

    getCheckIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    getClockIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
    }
}
