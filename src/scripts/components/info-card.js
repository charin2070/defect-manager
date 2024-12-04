class InfoCard {
    static slidePanel = null;

    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.refact = Refact.getInstance();
        
        // Slide panel
        if (!InfoCard.slidePanel) {
            InfoCard.slidePanel = SlidePanel.getInstance();
        }
        this.slidePanel = InfoCard.slidePanel;
        
        this.card = this.createCard();
        this.setupReactivity();
        this.applyStyles();
        
        // Добавляем карточку в контейнер
        this.container.appendChild(this.card);
    }

    createCard() {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        card.style.width = 'fit-content';
        card.style.minWidth = '200px';
        card.style.whiteSpace = 'nowrap';
        card.style.background = 'white';
        card.style.borderRadius = '0.5rem';
        card.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
        card.style.transition = 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out';

        // Добавляем hover эффект
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-3px)';
            card.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
        });

        // Add click handler if provided
        if (this.options.onClick) {
            card.addEventListener('click', this.options.onClick);
        }

        // Add default click handler for showing unresolved issues
        card.addEventListener('click', () => {
            const issueTable = new IssueTable(['taskId', 'reports', 'status', 'description', 'created'], {isUpperCase: true});
            const slidePanel = SlidePanel.getInstance();
            
            slidePanel.setTitle('Нерешенные задачи');
            slidePanel.clear();
            
            // Get issues from state
            const issues = this.refact.state.issues || [];
            const unresolvedIssues = issues.filter(issue => 
                !['resolved', 'closed', 'done'].includes(issue.status?.toLowerCase() || '')
            );
            const tableElement = issueTable.showIssues(unresolvedIssues);
            
            slidePanel.updateContent(tableElement);
            slidePanel.open();
        });

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        cardBody.style.padding = '1.25rem';

        const row = document.createElement('div');
        row.className = 'row';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '1rem';

        const colTitle = document.createElement('div');
        colTitle.className = 'col mt-0';
        colTitle.style.flex = '1';

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = this.options.title || 'Title';
        title.style.margin = '0';

        colTitle.appendChild(title);

        const colIcon = document.createElement('div');
        colIcon.className = 'col-auto';
        colIcon.style.display = 'flex';
        colIcon.style.alignItems = 'center';

        const stat = document.createElement('div');
        stat.className = 'stat text-primary';
        stat.style.display = 'flex';
        stat.style.alignItems = 'center';
        stat.style.justifyContent = 'center';
        stat.style.padding = '0.5rem';
        stat.style.borderRadius = '0.25rem';
        stat.style.background = 'rgba(0, 0, 0, 0.03)';

        // Create icon based on options or default
        if (this.options.iconUrl) {
            const img = document.createElement('img');
            img.src = this.options.iconUrl;
            img.width = 24;
            img.height = 24;
            stat.appendChild(img);
        } else if (this.options.iconSvg) {
            stat.innerHTML = this.options.iconSvg;
        } else {
            // Default SVG icon
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('width', '24');
            svg.setAttribute('height', '24');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            svg.setAttribute('class', 'feather feather-shopping-cart align-middle');

            const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle1.setAttribute('cx', '9');
            circle1.setAttribute('cy', '21');
            circle1.setAttribute('r', '1');

            const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle2.setAttribute('cx', '20');
            circle2.setAttribute('cy', '21');
            circle2.setAttribute('r', '1');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6');

            svg.appendChild(circle1);
            svg.appendChild(circle2);
            svg.appendChild(path);
            stat.appendChild(svg);
        }

        colIcon.appendChild(stat);
        row.appendChild(colTitle);
        row.appendChild(colIcon);

        const content = document.createElement('h1');
        content.className = 'mt-1 mb-3';
        content.textContent = this.options.content || 'Content';

        const footer = document.createElement('div');
        footer.className = 'mb-0';

        const footerText = document.createElement('span');
        footerText.className = 'text-danger';
        footerText.innerHTML = `<i class="mdi mdi-arrow-bottom-right"></i> ${this.options.footer || ''}`;

        footer.appendChild(footerText);
        cardBody.appendChild(row);
        cardBody.appendChild(content);
        cardBody.appendChild(footer);
        card.appendChild(cardBody);

        return card;
    }

    getContainer() {
        return this.card;
    }

    setupReactivity() {
        this.refact.subscribe('statistics', (statistics) => {
            if (statistics) {
                if (statistics.unresolved !== undefined) {
                    this.updateContent(statistics.unresolved);
                }
                if (statistics.createdThisMonth !== undefined) {
                    this.setFooter(`+${statistics.createdThisMonth} в этом месяце`);
                }
            }
        });
    }

    updateContent(value) {
        const body = this.card.querySelector('.card-body');
        const contentElement = body.querySelector('h1');
        contentElement.textContent = value;
    }

    applyStyles() {
        if (this.options.styles) {
            Object.assign(this.card.style, this.options.styles);
        }
    }

    setTitle(title) {
        const header = this.card.querySelector('.card-title');
        header.textContent = title;
    }

    setContent(content) {
        const body = this.card.querySelector('.card-body');
        const contentElement = body.querySelector('h1');
        contentElement.textContent = content;
    }

    setFooter(footer) {
        const footerElement = this.card.querySelector('.text-danger');
        footerElement.textContent = footer;
    }

    setOnClick(handler) {
        if (handler && typeof handler === 'function') {
            this.card.addEventListener('click', handler);
        } else {
            // Remove previous click handlers if any
            this.card.replaceWith(this.card.cloneNode(true));
        }
    }

    setIcon(options) {
        const stat = this.card.querySelector('.stat');
        if (!stat) return;

        // Clear current icon
        stat.innerHTML = '';

        if (options.iconUrl) {
            const img = document.createElement('img');
            img.src = options.iconUrl;
            img.width = 24;
            img.height = 24;
            stat.appendChild(img);
        } else if (options.iconSvg) {
            stat.innerHTML = options.iconSvg;
        }
    }

    setContentColor(color) {
        const body = this.card.querySelector('.card-body');
        const contentElement = body.querySelector('h1');
        contentElement.style.color = color;
    }
}
