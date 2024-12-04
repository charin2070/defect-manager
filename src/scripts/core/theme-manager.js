class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggleBtn.querySelector('img');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        // Apply saved theme on load
        this.applyTheme(this.currentTheme);
        
        // Set up event listener
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
            this.themeIcon.src = 'src/img/sun-0.svg';
        } else {
            document.documentElement.classList.remove('dark-theme');
            this.themeIcon.src = 'src/img/moon-stars-0.svg';
        }

        // Dispatch event for other components that might need to react to theme changes
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
}
