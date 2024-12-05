class InfoCard extends HtmlElement {
    constructor(container, options = {}) {
        super(container);
        this.container = container;
        this.options = options;
        this.refact = Refact.getInstance(this.container);
        this.card = this.createCard();
        this.setupReactivity();
        this.container.appendChild(this.card);
    }

    createCard() {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.style.borderRadius = '12px';
        card.style.overflow = 'hidden';
        card.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="info-card-header">
                <img src="src/img/jira-defect.svg" alt="Icon" style="width: 24px; height: 24px; margin-right: 8px;">
                ${this.options.title || 'Title'}
            </div>
            <div class="info-card-body">${this.options.content || 'Content'}</div>
            <div class="info-card-footer">${this.options.footer || 'Footer'}</div>
        `;
        this.addEventListeners(card);
        return card;
    }

    addEventListeners(card) {
        card.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        card.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        card.addEventListener('click', this.options.onClick || this.defaultClickHandler.bind(this));
    }

    onMouseEnter(event) {
        event.currentTarget.style.transform = 'scale(1.1)';
        event.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
        const icon = event.currentTarget.querySelector('img');
        icon.style.transition = 'transform 0.6s ease-in-out, filter 0.6s ease-in-out';
        icon.style.filter = 'brightness(1.5)';
        icon.style.transform = 'scale(1.2)';
    }

    onMouseLeave(event) {
        event.currentTarget.style.transform = 'scale(1)';
        event.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        const icon = event.currentTarget.querySelector('img');
        icon.style.filter = 'brightness(1)';
        icon.style.transform = 'scale(1)';
    }

    defaultClickHandler(event) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        this.card.appendChild(ripple);

        const rect = this.card.getBoundingClientRect();
        ripple.style.left = `${event.clientX - rect.left - ripple.offsetWidth / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - ripple.offsetHeight / 2}px`;

        ripple.style.animation = 'ripple-effect 5s ease-in-out forwards';

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });

        // Card press and bounce effect
        this.card.style.transition = 'transform 0.2s cubic-bezier(0.3, 0.07, 0.4, 1.5)';
        this.card.style.transform = 'scale(0.95)';

        setTimeout(() => {
            this.card.style.transform = 'scale(1)';
        }, 200);

        console.log('InfoCard clicked!');
    }

    setupReactivity() {
        this.refact.subscribe(this.options.stateKey, (value) => {
            this.updateContent(value);
        });
    }

    updateContent(value, description) {
        this.card.querySelector('.info-card-body').textContent = value;
        this.card.querySelector('.info-card-footer').textContent = description;
    }
}
