class SlidePanel {
    constructor() {
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'slide-panel-backdrop';
        document.body.appendChild(this.backdrop);

        // Create panel
        this.panel = document.createElement('div');
        this.panel.className = 'slide-panel';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'slide-panel-header';
            // Create and store logo element
            this.logo = document.createElement('img');
            this.logo.className = 'slide-panel-logo';
            this.logo.style.display = 'flex';
            this.logo.src = 'src/img/translation.svg';
            this.logo.alt = 'Logo';   

       header.appendChild(this.logo);
        // header.appendChild(this.logo);
        
        // Create and store title element
        this.title = document.createElement('span');
        this.title.className = 'title-text';
        this.title.textContent = 'Загрузка заголовка...';
        header.appendChild(this.title);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'slide-panel-close';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => this.close();
        header.appendChild(closeButton);
        
        // Create content container
        this.content = document.createElement('div');
        this.content.className = 'slide-panel-content issue-content';
        
        // Assemble panel
        this.panel.appendChild(header);
        this.panel.appendChild(this.content);
        document.body.appendChild(this.panel);
        
        // Add event listeners for panel closing
        this.backdrop.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });
    }

<<<<<<< HEAD
    clear() {
        this.content.innerHTML = '';
    }

=======
>>>>>>> 413ea59d99e7f4b83c6ec8cbf77e1de2e15d057b
    open() {
        this.panel.style.display = 'block';
        this.backdrop.style.display = 'block';
        requestAnimationFrame(() => {
            this.panel.classList.add('open');
            this.backdrop.classList.add('visible');
        });
    }
    
    close() {
        this.panel.classList.remove('open');
        this.backdrop.classList.remove('visible');
        
        const onTransitionEnd = () => {
            this.panel.style.display = 'none';
            this.backdrop.style.display = 'none';
            this.panel.removeEventListener('transitionend', onTransitionEnd);
        };
        
        this.panel.addEventListener('transitionend', onTransitionEnd);
    }

    setLogo(imageUrl) {
        // this.logo.src = imageUrl;
        // this.logo.className = 'slide-panel-logo';
        // this.logo.style.display = 'flex';
    }

    setTitle(title) {
        this.title.textContent = title;
    }

    updateContent(content) {
        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof Element) {
            this.content.innerHTML = '';
            this.content.appendChild(content);
        }
    }
}