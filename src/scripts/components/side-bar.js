// Assuming Refact is already imported or available in your environment

class Sidebar {
    constructor(rootElement) {
        this.refact = new Refact(rootElement);
        this.refact.setState({ visible: true, items: [] });
    }

    // Show the sidebar
    show() {
        this.refact.setState({ visible: true }, 'Sidebar.show');
        this.rootElement.style.display = 'block';
    }

    // Hide the sidebar
    hide() {
        this.refact.setState({ visible: false }, 'Sidebar.hide');
        this.rootElement.style.display = 'none';
    }

    // Toggle the visibility of the sidebar
    toggle() {
        const currentState = this.refact.state.visible;
        this.refact.setState({ visible: !currentState }, 'Sidebar.toggle');
        this.rootElement.style.display = currentState ? 'none' : 'block';
    }

    // Add a new item to the sidebar
    addItem(item) {
        const items = this.refact.state.items;
        items.push(item);
        this.refact.setState({ items }, 'Sidebar.addItem');
        this.renderItems();
    }

    // Render items in the sidebar
    renderItems() {
        const itemsContainer = this.rootElement.querySelector('.sidebar-content');
        itemsContainer.innerHTML = ''; // Clear existing items
        this.refact.state.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.textContent = item;
            itemsContainer.appendChild(itemElement);
        });
    }
}