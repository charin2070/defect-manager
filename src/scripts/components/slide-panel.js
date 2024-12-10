class SlidePanel {
    static instance = null;

    static getInstance() {
        if (!SlidePanel.instance) {
            SlidePanel.instance = new SlidePanel();
        }
        return SlidePanel.instance;
    }

    constructor() {
        if (SlidePanel.instance) {
            return SlidePanel.instance;
        }
        SlidePanel.instance = this;

        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'fixed inset-0 bg-black/50 opacity-0 invisible transition-opacity duration-300 ease-in-out z-40';
        this.backdrop.id = `slide-panel-backdrop-${Math.floor(Math.random() * 10000)}`;
        document.body.appendChild(this.backdrop);

        // Create panel
        this.panel = document.createElement('div');
        this.panel.className = 'fixed top-0 -right-full w-[800px] max-w-[90%] h-full bg-white shadow-2xl transition-all duration-300 ease-in-out z-50 flex flex-col';
        this.panel.id = `slide-panel-container-${Math.floor(Math.random() * 10000)}`;
        document.body.appendChild(this.panel);
        
        // Create header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center px-6 py-4 border-b border-gray-200';
        header.id = `slide-panel-header-${Math.floor(Math.random() * 10000)}`;
        
        // Create header left section with icon and title
        const headerLeft = document.createElement('div');
        headerLeft.className = 'flex items-center space-x-3';
        
        // Create and store logo element
        this.logo = document.createElement('div');
        this.logo.className = 'flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg';
        this.logo.id = `slide-panel-logo-${Math.floor(Math.random() * 10000)}`;
        const logoImg = document.createElement('img');
        logoImg.src = 'src/image/translation.svg';
        logoImg.alt = 'Logo';
        logoImg.className = 'w-6 h-6';
        this.logo.appendChild(logoImg);
        headerLeft.appendChild(this.logo);
        
        // Create and store title element
        this.title = document.createElement('h2');
        this.title.className = 'text-lg font-semibold text-gray-900';
        this.title.id = `slide-panel-title-${Math.floor(Math.random() * 10000)}`;
        this.title.textContent = 'Загрузка...';
        headerLeft.appendChild(this.title);
        
        header.appendChild(headerLeft);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200';
        closeButton.innerHTML = `
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        closeButton.addEventListener('click', () => this.close());
        header.appendChild(closeButton);
        
        this.panel.appendChild(header);
        
        // Create content container
        this.content = document.createElement('div');
        this.content.className = 'flex-1 overflow-y-auto px-6 py-4';
        this.content.id = `slide-panel-content-${Math.floor(Math.random() * 10000)}`;
        this.panel.appendChild(this.content);

        // Bind close on backdrop click
        this.backdrop.onclick = () => this.close();
    }

    open(content, title = '') {
        // Set content
        this.content.innerHTML = '';
        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof Element) {
            this.content.appendChild(content);
        }
        
        // Update title
        this.title.textContent = title;

        // Show panel with animation
        requestAnimationFrame(() => {
            this.backdrop.classList.remove('invisible', 'opacity-0');
            this.panel.style.right = '0';
        });
    }

    close() {
        this.backdrop.classList.add('invisible', 'opacity-0');
        this.panel.style.right = '-100%';
    }

    setTitle(title) {
        this.title.textContent = title;
    }

    setLogo(src) {
        const logoImg = this.logo.querySelector('img');
        logoImg.src = src;
    }
}