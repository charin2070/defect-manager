class LayoutView extends View {
    constructor() {
        super();
 
        this.init();
    }

    createWrapper() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'layout-wrapper';
        
        // Create navbar first
        this.navbar = NavbarComponent.create({ animate: true });
        this.wrapper.appendChild(this.navbar.getElement());
        
        // Create content container after navbar
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'content-container';
        this.wrapper.appendChild(this.contentContainer);
        
        // Initialize date range dropdown in navbar
        this.dateRangeDropdown = new DateRangeDropdown(this.navbar.getElement(), '2021-01-01', Date.now());
        
        // Create upload button in navbar
        const uploadButton = document.createElement('button');
        uploadButton.className = 'navbar-icon-button';
        const uploadIcon = document.createElement('img');
        uploadIcon.src = 'src/img/upload-0.svg';
        uploadIcon.alt = 'Upload';
        uploadButton.appendChild(uploadIcon);
        
        uploadButton.addEventListener('click', () => {
            this.refact.setState({ view: 'upload' });
        });
        
        this.navbar.getElement().appendChild(uploadButton);
        
        return this.wrapper;
    }

    init() {
        this.container = this.createWrapper();
        
        // Добавляем стили для layout
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'src/styles/layout.css';
        document.head.appendChild(link);
    }

    showUploadView() {
        if (this.uploadView) {
            this.uploadView.show();
        }
    }

    getWrapper() {
        return this.wrapper;
    }

    getContainer() {
        return this.contentContainer;
    }

    mount(targetElement) {
        if (targetElement) {
            targetElement.appendChild(this.container);
            return true;
        }
        return false;
    }
}
