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
    }
}
