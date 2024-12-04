class ViewController {
    constructor(container) {
        this.refact = Refact.getInstance(container);
        this.container = container;
        this.views = {};
        this.init();
    }
    
    init(){
        this.refact.subscribe('view', this.showView.bind(this));
        this.refact.subscribe('issues', this.updateView.bind(this));
    
        // First create and mount the layout
        this.layoutView = new LayoutView();
        this.container.appendChild(this.layoutView.getWrapper());
        
        // Then create and register other views
        this.uploadView = new UploadView();
        this.registerView('upload', this.uploadView);
    }

    registerView(name, viewContainer) {
        this.views[name] = viewContainer;
        const container = viewContainer.getContainer();
        if (container && !container.parentElement) {
            this.layoutView.getContainer().appendChild(container);
        }
        container.style.display = 'none'; // Initially hide all views
    }

    showView(name) {
        log(this.refact, 'Showing view');
        Object.keys(this.views).forEach(viewName => {
            this.views[viewName].getContainer().style.display = viewName === name ? 'block' : 'none';
        });
    }

    updateView(name, content) {
        if (!this.refact.issues || this.refact.issues.length === 0) {
            this.showView('upload');
            return;
        }
        if (this.views[name]) {
            this.views[name].innerHTML = content;
        }
    }

    bindEvent(name, event, handler) {
        if (this.views[name]) {
            this.views[name].addEventListener(event, handler);
        }
    }

    setup
}
