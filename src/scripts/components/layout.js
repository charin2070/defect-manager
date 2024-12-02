// Creates a base layout: sidebar, navbar, content container
// 1. Creates sidebar, navbar and content container componenents (conented content)
// 2. Creates views 
class Layout {
    constructor(parentContainer) { 
        this.parentContainer = parentContainer || document.body;
        this.refact = new Refact(this.parentContainer);
        this.refact.setState({ clearLocalStorageData: false }, 'Layout.constructor');

        this.container = null;
        this.sidebar = null;
        this.contentContainer = null;
        this.navbar = null;

        this.init();
    }

    init() {
        // Create wrapper container with flex layout
        this.wrapper = document.createElement('div');
        Object.assign(this.wrapper.style, {
            display: 'flex',
            minHeight: '100vh',
            width: '100%'
        });

        // Create main content container
        this.container = document.createElement('div');
        this.container.className = 'main';
        Object.assign(this.container.style, {
            flex: '1',
            display: 'flex',
            flexDirection: 'column'
        });

        // Create sidebar
        this.sidebar = document.createElement('div');
        this.sidebar.className = 'sidebar';
        
        // Create navbar
        this.navbar = document.createElement('div');
        this.navbar.className = 'navbar';
        
        // Create content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'content';
        Object.assign(this.contentContainer.style, {
            flex: '1',
            padding: '20px'
        });

        // Append elements
        this.container.appendChild(this.navbar);
        this.container.appendChild(this.contentContainer);
        this.wrapper.appendChild(this.sidebar);
        this.wrapper.appendChild(this.container);
        this.parentContainer.appendChild(this.wrapper);
    }

    getContainer() {
        return this.contentContainer;
    }

    getSidebar() {
        return this.sidebar;
    }

    getContentContainer() {
        return this.contentContainer;
    }
}
