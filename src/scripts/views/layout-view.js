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

        const menuContainer = document.createElement('div');
        this.mainMenu = new DropdownComponent(menuContainer);
        this.mainMenu.addItem('Удалить данные', null, null, 'src/img/trash-bin-0.svg', {'dataState': 'clearLocalStorageData'});
        this.navbar.addItem(this.mainMenu.getContainer());

        return this.wrapper;
    }

    init() {
        this.container = this.createWrapper();
        this.setContainer(this.container);
        
        // First create the DateRangeDropdown
        this.dateRangeDropdown = new DateRangeDropdown();
        // Then add it to the navbar group
        this.leftNavbarGroup = this.navbar.addGroup('left', [this.dateRangeDropdown.getContainer()]);
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
