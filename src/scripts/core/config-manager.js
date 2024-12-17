// Get/set/store config data
class ConfigManager {
    constructor(defaultConfig, container) {
        // super(container);
        this.refact = new Refact(container);
        this.container = container;
        this.defaultConfig = defaultConfig;
        this.init();
    }

    init() {
    
        const loadedConfig = this.loadFromLocalStorage();
        console.log('🔃 [ConfigManager] Loaded config from LocalStorage:', loadedConfig);
        if (loadedConfig) {
            this.setConfig(loadedConfig);
        } else {
            this.setConfig(this.defaultConfig);
        }
    }


    setConfig(config) {
        if (!config) {
            console.log('⚙️ [ConfigManager.setConfig] Config is null:', config);
            return;
        }

        this.properties = config;
        this.saveToLocalStorage(this);
        this.refact.setState({ config: this });
    }

    saveToLocalStorage(config) {
        localStorage.setItem('config', JSON.stringify(config));
        log(localStorage.getItem('config'), '🚀 [ConfigManager.saveToLocalStorage] Saved config to LocalStorage');
    }

    getValue(key) {
        return this[key];
    }

    loadFromLocalStorage() {
        console.log('🔃 [ConfigManager.loadFromLocalStorage] Loading config from LocalStorage...');
        const savedConfig = localStorage.getItem('config');
        
        if (!savedConfig) {
            console.log('🔃 [ConfigManager.loadFromLocalStorage] Config not found in LocalStorage');
            return null
        }
        
        const parsedConfig = JSON.parse(savedConfig);
        log(parsedConfig, '✅ [ConfigManager.loadFromLocalStorage] Config loaded from LocalStorage');
        return parsedConfig;
    }

    resetToDefault() {
        this.setConfig(this.defaultConfig);
    }
}
