class ConfigManager {
    static instance = null;

    static getInstance(defaultConfig = {}) {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager(defaultConfig);
        }
        return ConfigManager.instance;
    }

    constructor(defaultConfig = {}) {
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }

        log('ConfigManager: Initializing with defaultConfig: ', defaultConfig);
        this.defaultConfig = defaultConfig;
        this.config = defaultConfig;
        this.refact = new Refact(document.body);
        this._configLoaded = false;

        // Load config from LocalStorage or use default
        const loadedConfig = this.loadFromLocalStorage();
        if(loadedConfig === false) {
            console.log('ConfigManager: Using default config');
            this.setConfig(this.defaultConfig);
        } else {
            console.log('ConfigManager: Using loaded config');
            this.setConfig(loadedConfig);
        }

        ConfigManager.instance = this;
    }

    setConfig(newConfig) {
        if (!newConfig) return;
        
        console.log('ConfigManager: Setting new config =', newConfig);
        this.config = newConfig;
        this._configLoaded = true;
        
        // Update state in one batch
        this.refact.setState({
            mode: newConfig.mode,
            dataPrefix: newConfig.dataPrefix,
            theme: newConfig.theme,
            filters: newConfig.filters
        }, 'ConfigManager.setConfig');
        
        // Save to localStorage
        localStorage.setItem('config', JSON.stringify(newConfig));
    }

    loadFromLocalStorage() {
        if (this._configLoaded) {
            return this.config;
        }

        log(localStorage, 'ConfigManager.loadFromLocalStorage');
        const savedConfig = localStorage.getItem('config');
        
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                console.log('ConfigManager: Using loaded config');
                this._configLoaded = true;
                return parsedConfig;
            } catch (error) {
                console.error('ConfigManager: Error parsing config:', error);
            }
        }
        
        console.log('ConfigManager: Using default config');
        return this.defaultConfig;
    }

    resetToDefault() {
        this.setConfig(this.defaultConfig);
    }
}
