class NavbarComponent {
    constructor() {
        this.navbar = this.createNavbar();
        this.menuItems = [];
    }

    createNavbar() {
        const navbar = document.createElement('div');
        navbar.className = 'container'; // Use the appropriate class from your CSS
        return navbar;
    }

    addMenuItem({ side, icon, size, title, callback }) {
        const menuItem = document.createElement('div');
        menuItem.className = `menu-item ${side}`; // Add side class for styling
        menuItem.style.display = 'flex';
        menuItem.style.alignItems = 'center';

        const iconElement = document.createElement('img');
        iconElement.src = icon;
        iconElement.alt = title;
        iconElement.style.width = size || '24px'; // Default size if not provided

        const titleElement = document.createElement('span');
        titleElement.innerText = title;

        menuItem.appendChild(iconElement);
        menuItem.appendChild(titleElement);
        menuItem.addEventListener('click', callback);

        this.navbar.appendChild(menuItem);
        this.menuItems.push(menuItem); // Store reference to menu items
    }

    getContainer() {
        return this.navbar; // Return the navbar element for appending to the DOM
    }

    clearMenu() {
        this.menuItems.forEach(item => this.navbar.removeChild(item));
        this.menuItems = []; // Reset the menu items array
    }

    render() {
        // Additional rendering logic if needed
        document.body.appendChild(this.navbar); // Append to body or a specific container
    }
}

// Usage
const navbar = new NavbarComponent();
navbar.addMenuItem({ side: 'left', icon: 'src/image/jira-defect.svg', size: '1.5em', title: 'Дефекты', callback: () => console.log('Дефекты clicked') });
navbar.addMenuItem({ side: 'left', icon: 'src/image/user-svgrepo-com.svg', size: '1.5em', title: 'Все команды', callback: () => console.log('Все команды clicked') });
navbar.addMenuItem({ side: 'right', icon: 'src/image/upload-svgrepo-com.svg', title: 'Upload', callback: () => console.log('Upload clicked') });
navbar.render();