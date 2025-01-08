class SlidePanel extends HtmlComponent {
    static instance = null;

    constructor(options = {}) {
        if (options.isSingle && SlidePanel.instance) {
            return SlidePanel.instance;
        }

        super();
        
        this.isOpen = false;
        this.isSingle = options.isSingle || false;

        if (this.isSingle) {
            SlidePanel.instance = this;
        }

        this.backdrop = this.createElement('div',
            { className: 'fixed inset-0 bg-black/25 opacity-0 invisible transition-opacity duration-500 ease-in-out z-40 backdrop-filter backdrop-blur-sm' },
        );
        this.backdrop.id = `slide-panel-backdrop-${Math.floor(Math.random() * 10000)}`;
        document.body.appendChild(this.backdrop);

        // Create panel
        this.panel = this.createElement('div',
            { className: 'fixed top-0 -right-full w-[30%] max-w-[90%] h-full bg-white shadow-2xl transition-all duration-300 ease-in-out z-50 flex flex-col' },
        );
        this.panel.id = `slide-panel-container-${Math.floor(Math.random() * 10000)}`;
        document.body.appendChild(this.panel);
        
        // Create header
        const header = this.createElement('div',
            { className: 'flex justify-between items-center px-6 py-4 border-b border-gray-200' },
        );

        // Create header left section with icon and title
        const headerLeft = this.createElement('div',
            { className: 'flex items-center space-x-3' },
        );
            
        // Create and store logo element
        this.logo = this.createElement('div',
            { className: 'flex items-center justify-center w-10 h-10 rounded-lg' },
        );
        const logoImg = this.createElement('img',
            { src: 'src/image/translation.svg', alt: 'Logo', className: 'w-6 h-6' },
        );
        this.logo.appendChild(logoImg);
        headerLeft.appendChild(this.logo);
        
        // Create and store title element
        this.title = document.createElement('h2');
        this.title.className = 'text-lg font-semibold text-gray-900';
        this.title.textContent = 'Загрузка...';
        headerLeft.appendChild(this.title);
        
        header.appendChild(headerLeft);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200';
        closeButton.innerHTML = `...`; // SVG for close button
        closeButton.addEventListener('click', () => this.close());
        header.appendChild(closeButton);
        
        this.panel.appendChild(header);
        
        // Create content container
        this.content = this.createElement('div',
            { className: 'slide-panel-container' },
        );
        
        this.panel.appendChild(this.content);

        // Bind close on backdrop click
        this.backdrop.onclick = () => this.close();
    }

    setContent(content) {
        this.content.innerHTML = '';
        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof HtmlComponent) {
            this.content.appendChild(content.getContainer());
        }
    }

    open(content, title = '') {
        this.isOpen = true;
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
        this.isOpen = false;

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