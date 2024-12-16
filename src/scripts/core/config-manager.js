// Get/set/store config data
class ConfigManager {
    constructor(defaultConfig) {
        this.defaultConfig = defaultConfig;
        if (!this.loadFromLocalStorage())
            this.setConfig(defaultConfig);
    }

    setConfig(config) {
        if (!config) {
            log(config, '⚙️ [ConfigManager.setConfig] Config is null.');
            return;
        }

        Object.assign(this, config);
        this.saveToLocalStorage(this);
    }

    saveToLocalStorage(config) {
        localStorage.setItem('config', JSON.stringify(config));
    }

    getValue(key) {
        return this[key];
    }

    loadFromLocalStorage() {
        log('⚙️ [ConfigManager.loadFromLocalStorage] Loading config from LocalStorage...');
        const savedConfig = localStorage.getItem('config');
        
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                log(parsedConfig, '⚙️ [ConfigManager]: Config loaded from LocalStorage');
                return parsedConfig;
            } catch (error) {
                log(error, '⚙️ [ConfigManager]: Error parsing config from LocalStorage:');
            }
        } else {
            log(localStorage, '⚙️ [ConfigManager]: No config found in LocalStorage');
            return null;
        }
    }

    resetToDefault() {
        this.setConfig(this.defaultConfig);
    }
}
