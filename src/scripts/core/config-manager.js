// Get/set/store config data
class ConfigManager {
    constructor(defaultConfig, container) {
        this.refact = new Refact(container);
        this.container = container;
        this.defaultConfig = defaultConfig;
        this.properties = {};
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

        // Копируем только свойства конфигурации
        this.properties = { ...config };
        
        // Сохраняем только properties, а не весь this
        this.saveToLocalStorage(this.properties);
        
        // Отправляем в состояние только properties
        this.refact.setState({ config: this.properties }, 'ConfigManager.setConfig');
    }

    saveToLocalStorage(config) {
        try {
            localStorage.setItem('config', JSON.stringify(config));
            console.log('🚀 [ConfigManager.saveToLocalStorage] Saved config to LocalStorage:', config);
        } catch (error) {
            console.error('❌ [ConfigManager.saveToLocalStorage] Error saving config:', error);
        }
    }

    getValue(key) {
        return this.properties[key];
    }

    loadFromLocalStorage() {
        console.log('🔃 [ConfigManager.loadFromLocalStorage] Loading config from LocalStorage...');
        try {
            const savedConfig = localStorage.getItem('config');
            
            if (!savedConfig) {
                console.log('🔃 [ConfigManager.loadFromLocalStorage] Config not found in LocalStorage');
                return null;
            }
            
            return JSON.parse(savedConfig);
        } catch (error) {
            console.error('❌ [ConfigManager.loadFromLocalStorage] Error loading config:', error);
            return null;
        }
    }

    resetToDefault() {
        this.setConfig(this.defaultConfig);
    }
}
