// Store and manage application configuration
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

        // Load config from LocalStorage or use default
        const loadedConfig = this.loadConfigFromLocalStorage();
        if(loadedConfig === false) {
            console.log('ConfigManager: Using default config');
            this.setConfig(this.defaultConfig);
            this.saveConfigToLocalStorage();
        } else {
            console.log('ConfigManager: Using loaded config');
            this.setConfig(loadedConfig);
        }

        ConfigManager.instance = this;
    }

    setConfig(newConfig) {
        if (!newConfig) return;
        
        console.log('ConfigManager: Setting new config =', newConfig);
        Object.keys(newConfig).forEach(key => {
            this.refact.setState({ [key]: newConfig[key] }, 'ConfigManager.setConfig');
        });
        this.config = newConfig;
    }

    saveConfigToLocalStorage() {
        try {
            localStorage.setItem('config', JSON.stringify(this.config));
            console.log('ConfigManager: Saved config to localStorage');
        } catch (error) {
            console.error('ConfigManager: Error saving config to localStorage:', error);
        }
    }

    loadConfigFromLocalStorage() {
        try {
            const storedConfig = localStorage.getItem('config');
            if (!storedConfig) return false;
            
            const parsedConfig = JSON.parse(storedConfig);
            log('ConfigManager: Loaded config from localStorage:', parsedConfig);
            return parsedConfig;
        } catch (error) {
            console.error('ConfigManager: Error loading config from localStorage:', error);
            return false;
        }
    }

    resetToDefaultConfig() {
        this.setConfig(this.defaultConfig);
        this.saveConfigToLocalStorage();
    }
}
