class Dropdown {
    constructor(parentContainer, text = 'UE', options) {
        this.parentContainer = parentContainer;
        this.text = text;
        this.options = options || [];
        this.refact = new Refact(this.parentContainer);
        this.dropdown = this.createDropdown();
        this.setupEventListeners();

        // Initialize state
        this.refact.setState({ menudropdownOpen: false, dropdownOpen: false }, 'Dropdown.constructor');
        this.refact.subscribe('menudropdownOpen', (isOpen) => {
            if (isOpen) {
                this.menu.classList.add('show');
            } else {
                this.menu.classList.remove('show');
            }
        });
    }

    createDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'app-dropdown-toggle';
        this.container = this.dropdown;

        this.toggle = document.createElement('a');
        this.toggle.className = 'dropdown-toggle-button';
        this.toggle.href = '#';
        this.toggle.setAttribute('data-bs-toggle', 'dropdown');
        this.setText(this.text);

        this.menu = document.createElement('ul');
        this.menu.className = 'dropdown-menu';

        this.options.forEach(option => {
            this.addItem(option.label, option.imagePath, option.onClick);
        });

        this.dropdown.appendChild(this.toggle);
        this.dropdown.appendChild(this.menu);
        this.parentContainer.appendChild(this.dropdown);

        return this.dropdown;
    }

    setText(text) {
        this.toggle.textContent = text;
    }

    setImage(imagePath) {
        if (this.toggleImage) {
            this.toggleImage.src = imagePath;
        } else {
            const img = document.createElement('img');
            img.className = 'dropdown-toggle-icon';
            img.src = imagePath;
            img.style.marginRight = '8px';
            this.toggle.insertBefore(img, this.toggle.firstChild);
            this.toggleImage = img;
        }
    }

    addItem(text, imagePath, onClick){
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'dropdown-item';

        if (imagePath) {
            const img = document.createElement('img');
            img.className = 'dropdown-item-icon';
            img.src = imagePath;
            img.style.width = '16px';
            img.style.height = '16px';
            img.style.marginRight = '8px';
            link.appendChild(img);
        }
        link.textContent = text;
        link.addEventListener('click', onClick);
        item.appendChild(link);
        this.menu.appendChild(item);
    }

    getContainer(){
        return this.container;
    }

    setupEventListeners() {
        this.toggle.addEventListener('click', (event) => {
            event.preventDefault();
            this.toggleDropdown();
        });

        document.addEventListener('click', (event) => {
            if (!this.dropdown.contains(event.target)) {
                this.refact.setState({ menudropdownOpen: false }, 'Dropdown.setupEventListeners');
            }
        });
    }

    toggleDropdown() {
        const currentState = this.refact.state.menudropdownOpen;
        this.refact.setState({ menudropdownOpen: !currentState }, 'Dropdown.toggleDropdown');
    }
}