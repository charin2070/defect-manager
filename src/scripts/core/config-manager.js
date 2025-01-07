// Get/set/store config data
class ConfigManager {
    constructor(defaultConfig, config) {
        this.defaultConfig = defaultConfig;
        this.refact = Refact.getInstance();

        this.init();

        if (config) {
            this.load(config);
            return;
        }

        this.loadFromLocalStorage();
    }

    init() {
    
    }

    loadFromLocalStorage() {
        log('[ConfigManager.loadFromLocalStorage] Loading config from LocalStorage...');
            try {
                const storedConfig = localStorage.getItem('config');
                let config;

                if (storedConfig) {
                    config = JSON.parse(storedConfig);
                    log('✅ [ConfigManager.loadFromLocalStorage] Config loaded from LocalStorage:', config);
                } else {
                    config = this.defaultConfig;
                    log('🟢 [ConfigManager.loadFromLocalStorage] Using default config');
                }

                // Ensure we have all required fields
                config = { ...this.defaultConfig, ...config };
                
                this.setConfig(config);
            } catch (error) {
                console.error('[ConfigManager.loadFromLocalStorage] Error:', error);
                this.setConfig(this.defaultConfig);
            }
    }

    setConfig(config) {
        log('[ConfigManager] Setting config:', config);
        
        this.refact.setState({ ...config }, 'ConfigManager.setConfig');
    }

    saveToLocalStorage(config) {
        log('[ConfigManager.saveToLocalStorage] Saving config...');
        try {
            localStorage.setItem('config', JSON.stringify(config));
            log('✅ [ConfigManager.saveToLocalStorage] Config saved successfully');
        } catch (error) {
            console.error('[ConfigManager.saveToLocalStorage] Error:', error);
        }
    }

    getValue(key) {
        return this.refact.state.config[key];
    }

    resetToDefault() {
        this.setConfig(this.defaultConfig);
    }
}
