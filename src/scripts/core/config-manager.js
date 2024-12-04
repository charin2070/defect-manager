<<<<<<< HEAD
class ConfigManager {
    constructor(defaultConfig = {}) {
        this.defaultConfig = defaultConfig;
        this.refact = new Refact(document.body);
        this.init();
    }

    init() {
        this.config = this.loadFromLocalStorage();
        this.refact.subscribe('config', this.onConfigChange.bind(this));
        this.refact.setState(this.config);
    }

    onConfigChange(newConfig) {
        this.config = newConfig;
        this.saveToLocalStorage();

        log(this.refact, 'ConfigManager.onConfigChange', this.config);
    }

    // Устанавливаем новое значение для конфигурации
    setConfig(newConfig) {
        if (typeof refact !== 'undefined') {
            refact.setState(newConfig);
        }
        localStorage.setItem('appConfig', JSON.stringify(newConfig));
    }

    // Получаем текущее состояние конфигурации
    getConfig() {
        return typeof refact !== 'undefined' ? refact.state : this.config;
    }

    getValue(key) {
        const config = this.getConfig();
        return config[key];
    }

    setValue(key, value) {
        const newConfig = { ...this.getConfig(), [key]: value };
        this.setConfig(newConfig);
    }

    // Подписываемся на изменения конкретного параметра
    subscribe(key, callback) {
        if (typeof refact !== 'undefined') {
            refact.subscribe(key, callback);
        }
    }

    // Сохраняем конфигурацию в LocalStorage
    saveToLocalStorage() {
        localStorage.setItem('appConfig', JSON.stringify(this.getConfig()));
    }

    // Загружаем конфигурацию из LocalStorage
    loadFromLocalStorage() {
        this.config = localStorage.getItem('config');
        if (!this.config) {
            this.config = this.defaultConfig;
            this.saveToLocalStorage();
            return this.config;
        }

        this.config = JSON.parse(this.config);
        return this.config;
    }

    // Сбрасываем конфигурацию к значениям по умолчанию
    resetToDefaultConfig() {
        this.setConfig(this.defaultConfig);
=======
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
>>>>>>> 413ea59d99e7f4b83c6ec8cbf77e1de2e15d057b
    }
}
