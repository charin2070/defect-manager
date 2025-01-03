// Get/set/store config data
class ConfigManager {
    constructor(container) {
        this.refact = Refact.getInstance(container);
        this.container = container;
        this.defaultConfig = {
            mode: "dev",
            dataKey: "defect-manager",
            theme: "light",
            dataKeys: ["issues", "index", "statistics", "dataUpdated"],
            dataStatus: 'empty',
            uploadedFile: null,
            dataSource: null,
            appStatus: 'initializing',
            error: null,
            process: null,
            filters: {
                dateStart: new Date('2021-01-01'),
                dateEnd: new Date(),
                team: 'all',
            },
            view: 'upload'
        };
        this.properties = {};
        this.init();
    }

    init() {
        this.loadFromLocalStorage().then((config) => {
            console.log(' [ConfigManager] Loaded config from LocalStorage:', config);
        });
    }

    loadFromLocalStorage() {
        log('[ConfigManager.loadFromLocalStorage] Loading config from LocalStorage...');
        return new Promise((resolve) => {
            try {
                const storedConfig = localStorage.getItem('config');
                let config;

                if (storedConfig) {
                    config = JSON.parse(storedConfig);
                    log('[ConfigManager.loadFromLocalStorage] Config loaded from LocalStorage:', config);
                } else {
                    config = this.defaultConfig;
                    log('[ConfigManager.loadFromLocalStorage] Using default config');
                }

                // Ensure we have all required fields
                config = { ...this.defaultConfig, ...config };
                
                this.setConfig(config);
                resolve(config);
            } catch (error) {
                console.error('[ConfigManager.loadFromLocalStorage] Error:', error);
                this.setConfig(this.defaultConfig);
                resolve(this.defaultConfig);
            }
        });
    }

    setConfig(config) {
        log('[ConfigManager] Setting config:', config);
        this.refact.setState({ config }, 'ConfigManager.setConfig');
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        log('[ConfigManager.saveToLocalStorage] Saving config...');
        try {
            localStorage.setItem('config', JSON.stringify(this.refact.state.config));
            log('[ConfigManager.saveToLocalStorage] Config saved successfully');
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
