class DashboardNavbar {
    constructor(rootElement) {
        this.refact = new Refact(rootElement);
        this.refact.setState({ visible: true, items: [] });
    }

    // Show the navbar
    show() {
        this.refact.setState({ visible: true }, 'DashboardNavbar.show');
        this.rootElement.style.display = 'flex';
    }

    // Hide the navbar
    hide() {
        this.refact.setState({ visible: false }, 'DashboardNavbar.hide');
        this.rootElement.style.display = 'none';
    }

    // Toggle the visibility of the navbar
    toggle() {
        const currentState = this.refact.state.visible;
        this.refact.setState({ visible: !currentState }, 'DashboardNavbar.toggle');
        this.rootElement.style.display = currentState ? 'none' : 'flex';
    }

    // Add a new item to the navbar
    addItem(item) {
        const items = this.refact.state.items;
        items.push(item);
        this.refact.setState({ items }, 'DashboardNavbar.addItem');
        this.renderItems();
    }

    // Render items in the navbar
    renderItems() {
        const itemsContainer = this.rootElement.querySelector('.navbar-items-container');
        itemsContainer.innerHTML = ''; // Clear existing items
        
        // Add menu icon
        const menuIcon = document.createElement('div');
        menuIcon.className = 'navbar-menu-icon';
        menuIcon.innerHTML = `<img src="src/img/img/dot-menu.svg" style="width: 24px; height: 24px;">`;
        itemsContainer.appendChild(menuIcon);

        // Add items
        this.refact.state.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'navbar-item';
            itemElement.textContent = item;
            itemsContainer.appendChild(itemElement);
        });
    }
}