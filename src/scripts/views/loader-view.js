class LoaderView extends HtmlComponent {
    constructor() {
        super();
        this.steps = [
            { id: 'reading', text: 'Reading data...' },
            { id: 'indexing', text: 'Building index...' },
            { id: 'statistics', text: 'Calculating statistics...' },
            { id: 'saving', text: 'Saving data...' }
        ];
        this.currentStep = 0;
    }

    initLoader() {
        if (document.querySelector('.loader-overlay')) {
            return;
        }

        const overlay = this.createElement('div', { 
            className: 'loader-overlay',
            styles: {
                display: 'none',
                opacity: '0'
            }
        });

        const container = this.createElement('div', { 
            className: 'loader-container'
        });

        // Create loader dots
        const loader = this.createElement('div', { 
            className: 'lds-ellipsis'
        });
        for (let i = 0; i < 4; i++) {
            loader.appendChild(this.createElement('div'));
        }
        container.appendChild(loader);

        // Create steps
        const steps = this.createElement('div', { 
            className: 'loader-steps'
        });

        this.steps.forEach((step, index) => {
            const stepEl = this.createElement('div', { 
                className: 'loader-step',
                attributes: { 'data-step': step.id }
            });
            
            const dot = this.createElement('div', { 
                className: 'step-dot'
            });
            
            const text = this.createElement('div', { 
                className: 'step-text',
                innerHTML: step.text
            });

            stepEl.appendChild(dot);
            stepEl.appendChild(text);
            steps.appendChild(stepEl);
        });

        container.appendChild(steps);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        this.setElement(overlay);
        
        log('[LoaderView] Loader initialized');
    }

    show(step = 'reading') {
        const element = this.getElement();
        if (!element) {
            console.error('[LoaderView] No element found');
            return;
        }

        log('[LoaderView] Showing loader with step:', step);
        element.style.display = 'flex';
        element.offsetHeight; // Force reflow
        requestAnimationFrame(() => {
            element.classList.add('visible');
            this.updateStep(step);
        });
    }

    hide() {
        const element = this.getElement();
        if (!element) {
            console.error('[LoaderView] No element found');
            return;
        }

        log('[LoaderView] Hiding loader');
        element.classList.remove('visible');
        element.addEventListener('transitionend', () => {
            element.style.display = 'none';
            this.resetSteps();
        }, { once: true });
    }

    updateStep(stepId) {
        const element = this.getElement();
        if (!element) {
            console.error('[LoaderView] No element found');
            return;
        }

        const steps = element.querySelectorAll('.loader-step');
        const currentIndex = this.steps.findIndex(s => s.id === stepId);
        
        if (currentIndex === -1) {
            console.error('[LoaderView] Invalid step:', stepId);
            return;
        }

        log('[LoaderView] Updating to step:', stepId);
        
        steps.forEach((step, index) => {
            if (index < currentIndex) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index === currentIndex) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('completed', 'active');
            }
        });
    }

    resetSteps() {
        const element = this.getElement();
        if (!element) {
            console.error('[LoaderView] No element found');
            return;
        }

        const steps = element.querySelectorAll('.loader-step');
        steps.forEach(step => {
            step.classList.remove('completed', 'active');
        });
    }
}
