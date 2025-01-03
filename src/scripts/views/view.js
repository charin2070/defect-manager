class View {
    constructor(container) {
        if (!container) {
            throw new Error('Container is required for View');
        }
        this.container = container;
        this.refact = Refact.getInstance(container);
    }

    render() {
        throw new Error('render() method must be implemented by View subclass');
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
