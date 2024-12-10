class ValueCard extends HtmlElement {
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
        card.className = 'relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6';
        
        card.innerHTML = `
            <dt>
                <div class="absolute rounded-md bg-blue-500 p-3">
                    <img src="${this.options.iconSvg || 'src/image/jira-defect.svg'}" 
                         class="h-5 w-5 text-white" 
                         aria-hidden="true" />
                </div>
                <p class="ml-16 truncate text-sm font-medium text-gray-500">${this.options.title || 'Title'}</p>
            </dt>
            <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p class="text-2xl font-semibold text-gray-900">${this.options.content || 'Content'}</p>
                <p class="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                    ${this.options.footer || 'Footer'}
                </p>
            </dd>
        `;

        this.addEventListeners(card);
        return card;
    }

    addEventListeners(card) {
        card.addEventListener('click', this.options.onClick || this.defaultClickHandler.bind(this));
    }

    defaultClickHandler(event) {
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'absolute rounded-full bg-blue-100/50 pointer-events-none transform scale-0 animate-ripple';
        card.appendChild(ripple);

        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size/2}px`;
        ripple.style.top = `${event.clientY - rect.top - size/2}px`;

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });

        console.log('ValueCard clicked!');
    }

    updateContent(value, description) {
        const valueEl = this.card.querySelector('.text-2xl');
        const descriptionEl = this.card.querySelector('.text-sm');
        
        if (valueEl) valueEl.textContent = value;
        if (descriptionEl) descriptionEl.textContent = description;
    }

    setupReactivity() {
        if (this.options.stateKey) {
            this.refact.subscribe(this.options.stateKey, (value) => {
                this.updateContent(value);
            });
        }
    }
}
