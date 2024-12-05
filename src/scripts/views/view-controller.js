class ViewController {
    constructor(container) {
        this.refact = Refact.getInstance(container);
        this.container = container;
        this.views = {};
        this.currentView = null;
        this.init();
    }
    
    init(){
        this.refact.subscribe('view', this.showView.bind(this));
        this.refact.subscribe('issues', this.updateView.bind(this));
    
        // First create and mount the layout
        this.layoutView = new LayoutView();
        this.container.appendChild(this.layoutView.getWrapper());
        
        // Create and register views
        this.uploadView = new UploadView();
        this.dashboardView = new DashboardView();

        this.registerView('upload', this.uploadView);
        this.registerView('dashboard', this.dashboardView);
    }

    registerView(name, viewContainer) {
        this.views[name] = viewContainer;
        const container = viewContainer.getContainer();
        if (container && !container.parentElement) {
            this.layoutView.getContainer().appendChild(container);
        }
        container.style.display = 'none'; // Initially hide all views
    }

    async showView(name) {
        const targetView = this.views[name];
        if (!targetView) throw new Error(`View "${name}" not found`);

        const targetContainer = targetView.getContainer();
        
        // Hide all views except target and current
        Object.values(this.views).forEach(view => {
            if (view !== targetView && view !== this.currentView) {
                const container = view.getContainer();
                container.style.display = 'none';
                container.classList.remove('view-exit', 'view-enter');
            }
        });

        // If there's a current view, animate it out
        if (this.currentView && this.currentView !== targetView) {
            const currentContainer = this.currentView.getContainer();
            currentContainer.classList.add('view-exit');
            
            await new Promise(resolve => {
                currentContainer.addEventListener('animationend', () => {
                    currentContainer.style.display = 'none';
                    currentContainer.classList.remove('view-exit');
                    resolve();
                }, { once: true });
            });
        }

        // Animate new view in
        targetContainer.style.display = 'block';
        targetContainer.classList.add('view-enter');
        
        await new Promise(resolve => {
            targetContainer.addEventListener('animationend', () => {
                targetContainer.classList.remove('view-enter');
                resolve();
            }, { once: true });
        });

        this.currentView = targetView;
        this.refact.setState({ currentView: name }, 'ViewController.showView');
    }

    updateView() {
        const issues = this.refact.issues;
        if (!issues || !issues.length) {
            this.showView('upload');
        } else {
            this.showView('dashboard');
        }
    }

    bindEvent(name, event, handler) {
        if (this.views[name]) {
            this.views[name].addEventListener(event, handler);
        }
    }
}
