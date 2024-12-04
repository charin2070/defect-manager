class View {
<<<<<<< HEAD
    constructor(container) {
        this.container = container;
        this.refact = Refact.getInstance(document.body);
    }
    
    setupView() {
    }
    
    render(content) {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'view-container';
        }
        
        if (content instanceof HTMLElement) {
            this.container.innerHTML = '';
            this.container.appendChild(content);
        } else {
            this.container.innerHTML = content;
        }
        
        return this.container;
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    getContainer() {
=======
    constructor() {
        this.container = document.createElement('div');
    }
        
    setupView() {
    }
    
    render() {
>>>>>>> 413ea59d99e7f4b83c6ec8cbf77e1de2e15d057b
        return this.container;
    }
}