class WideCard extends HtmlElement {
    constructor(container, options = {}) {
        super(container);
        this.container = container;
        this.options = options;
        this.refact = Refact.getInstance(this.container);
        this.card = this.createCard(this.options);
        this.setupReactivity();
        this.container.appendChild(this.card);
    }

    createCard(options) {
        const card = document.createElement('div');
        card.className = 'p-6 bg-white shadow rounded-2xl dark:bg-gray-900';
        card.innerHTML = `
            <dl class="space-y-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">${options.title || 'Title'}</dt>
                <dd class="text-5xl font-light md:text-6xl dark:text-white">${options.content || 'Content'}</dd>
                <dd class="flex items-center space-x-1 text-sm font-medium text-green-500 dark:text-green-400">
                    <span>${options.subContent || 'Sub Content'}</span>
                    <svg class="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M17.25 15.25V6.75H8.75"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M17 7L6.75 17.25"></path>
                    </svg>
                </dd>
            </dl>
        `;
        this.addHoverEffect(card);
        this.addClickHandler(card);
        return card;
    }

    addHoverEffect(card) {
        card.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        card.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    }

    onMouseEnter(event) {
        event.currentTarget.style.transform = 'scale(1.05)';
        event.currentTarget.style.transition = 'transform 0.3s ease-in-out';
    }

    onMouseLeave(event) {
        event.currentTarget.style.transform = 'scale(1)';
        event.currentTarget.style.transition = 'transform 0.3s ease-in-out';
    }

    addClickHandler(card) {
        card.addEventListener('click', this.options.onClick || this.defaultClickHandler.bind(this));
    }

    defaultClickHandler() {
        console.log('WideCard clicked!');
    }

    setupReactivity() {
        this.refact.subscribe(this.options.stateKey, (value) => {
            this.updateContent(value);
        });
    }

    updateContent(value) {
        this.card.querySelector('dd').textContent = value;
    }
}