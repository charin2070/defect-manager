class DataCard extends HtmlComponent {
    constructor(parentContainer, options = {}) {
        super();
        this.parentContainer = parentContainer;
        this.container = this.createElement('div', options);
        this.parentContainer.appendChild(this.container);

        this.options = {
            id: options.id || this.generateId('data-card'),
            valueSource: options.valueSource || '',
            title: options.title || '',
            icon: options.icon || '',
            value: options.value || '0',
            description: options.description || '',
            theme: options.theme || 'light',
            ...options
        };

        this.render();
        this.setupElements();
    }

    render() {
        const html = `
            <div id="${this.options.id}" class="data-card-card">
                <div class="data-card-header">
                <div class="data-card-icon">
                        <img src="${this.options.icon}" alt="${this.options.title} icon">
                    </div>
                    <span class="data-card-title">${this.options.title}</span>
                </div>
                <div class="data-card-value">${this.options.value}</div>
                <div class="data-card-description">${this.options.description}</div>
            </div>
        `;
        this.container.innerHTML = html;
    }

    setupElements() {
        this.elements = {
            card: this.container.querySelector('.data-card-card'),
            title: this.container.querySelector('.data-card-title'),
            icon: this.container.querySelector('.data-card-icon img'),
            value: this.container.querySelector('.data-card-value'),
            description: this.container.querySelector('.data-card-description')
        };

        this.elements.card.addEventListener('click', () => {
            this.options.onClick && this.options.onClick();
        });

        this.setValue(this.getState(this.options.valueSource));
    }

    // Простые методы для обновления содержимого
    setTitle(title) {
        this.options.title = title;
        this.elements.title.textContent = title;
    }

    setIcon(iconUrl) {
        this.options.icon = iconUrl;
        this.elements.icon.src = iconUrl;
    }

    setValue(value) {
        this.options.value = value;
        this.elements.value.textContent = value;
    }

    setDescription(description) {
        this.options.description = description;
        this.elements.description.textContent = description;
    }

    // Метод для подписки на изменение значения
    subscribeValue(field) {
        this.subscribe(field, (value) => {
            this.setValue(value);
        });
    }
}
