class LayoutView extends View {
    constructor() {
        super();
        this.init();
    }

    createWrapper() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'layout-wrapper';
        
        // Navbar
        this.navbar = NavbarComponent.create({ animate: true });
        this.wrapper.appendChild(this.navbar.getElement());
        
        // Content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'content-container';
        this.wrapper.appendChild(this.contentContainer);
        
        // Reports dropdown
        this.reportDropdown = new ReportDropdown(this.navbar.getElement());
        
        // Upload button
        this.uploadButton = this.navbar.addButton('', 'src/img/upload-0.svg', () => {
            this.refact.setState({ view: 'upload' });
        });

        // Clear Local Storage button
        this.clearLocalStorageButton = this.navbar.addButton('', 'src/img/trash-bin-0.svg', () => {
            const dataManager = new DataManager();
            dataManager.clearLocalStorage();
            window.location.reload();
        });
        
        // Upload button
        const uploadButton = document.createElement('button');
        uploadButton.className = 'navbar-icon-button';
        const uploadIcon = document.createElement('img');
        uploadIcon.src = 'src/img/upload-0.svg';
        uploadIcon.alt = 'Upload';
        uploadButton.appendChild(uploadIcon);
        uploadButton.addEventListener('click', () => {
            this.refact.setState({ view: 'upload' });
        });

        // Clear local storage button
        const clearButton = document.createElement('button');
        clearButton.className = 'navbar-icon-button';
        clearButton.id = 'clear-local-storage-button';
        const clearIcon = document.createElement('img');
        clearIcon.src = 'src/img/trash-bin-0.svg';
        clearIcon.alt = 'Clear Storage';
        clearButton.appendChild(clearIcon);
        
        clearButton.addEventListener('click', () => {
            const dataManager = new DataManager();
            dataManager.clearLocalStorage();
            window.location.reload();
        });
        
        // Append
        const navbarElement = this.navbar.getElement();
        navbarElement.appendChild(uploadButton);
        navbarElement.appendChild(clearButton);
        
        return this.wrapper;
    }

    init() {
        this.container = this.createWrapper();
        this.setContainer(this.container);
        this.dateRangeDropdown = new DateRangeDropdown();
        this.navbar.addGroup('left', [this.dateRangeDropdown.getContainer()]);
        
    }

    setContent(content) {
        // Очищаем контейнер
        while (this.contentContainer.firstChild) {
            this.contentContainer.removeChild(this.contentContainer.firstChild);
        }
        // Добавляем новый контент
        if (content) {
            this.contentContainer.appendChild(content);
        }
    }

    showUploadView() {
        this.refact.setState({ view: 'upload' });
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
