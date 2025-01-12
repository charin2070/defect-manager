class Issue {
    constructor(properties) {
        this.initializeProperties(properties);
    }

    static csvObjectExample = {
        "Issue key": "ADIRINC-361",
        "Issue id": "1855183",
        "Assignee": "U_M12MD",
        "Status": "Закрыт",
        "Created": "25.11.2021 10:59",
        "Labels": "",
        "Issue Type": "Дефект промсреды",
        "Resolved": "24.01.2022 14:46",
        "Custom field (SLA дата наступления просрочки)": "2022-02-03 00:00:00.0",
        "Description": "Периодически не прогружается вкладка Портфель",
        "Custom field (description )": "",
        "Custom field (Количество обращений)": "",
        "Custom field (Команда устраняющая проблему)": "",
        "Custom field (Business Summary)": "",
        "Summary": "Не загружается Портфель в МТ",
        "Component/s": "",
        "Custom field (Mobile application component)": "",
        "Updated": "02.11.2023 12:35",
        "source": "ADIRINC-361,1855183,U_M12MD,Закрыт,25.11.2021 10:59,,,,,Дефект промсреды,24.01.2022 14:46,2022-02-03 00:00:00.0,Периодически не прогружается вкладка Портфель,,,,,Не загружается Портфель в МТ,,,,02.11.2023 12:35"
    }

    // Properies mapping
    static #fieldMappings = {
        "Issue key": "taskId",
        "Номер драфта": "taskId",
        "Summary": "summary",
        "Description": "description",
        "Created": "created",
        "дата открытия": "created",
        "дата закрытия": "resolved",
        "Resolved": "resolved",
        "Updated": "updated",
        "updated": "updated",
        "Custom field (SLA дата наступления просрочки)": "slaDate",
        "Assignee": "assignee",
        "Reporter": "reporter",
        "Custom field (Команда устраняющая проблему)": "team",
        "Команда устраняющая проблему": "team",
        "Component/s": "component",
        "component": "component",
        "Custom field (Количество обращений)": "reports",
        "reports": "reports",
        "Labels": "labels",
        "Status": "status",
        "status": "status",
        "Issue Type": "type",
        "type": "type"
    };

    static dataTypes = {
        created: 'date',
        updated: 'date',
        resolved: 'date',
        slaDate: 'date',
        reports: 'number',
        labels: 'array',
        taskId: 'string'
    }

    // Маппинг значений
    static #valueMappings = {
        status: {
            "NEW": "Новый",
            "Отклонен": "Отклонен",
            "На исправление": "На исправление",
            "В работе": "В работе",
            "Отложен": "Отложен",
            "Закрыт": "Закрыт",
            "Отклонен командой": "Отклонен командой"
        },
        type: {
            "Дефект промсреды": "defect",
            "Request (FR)": "request",
            "Task": "task",
            "Консультация": "consultation",
        },
        team: {
            "Core": "Ядро",
            "": "Не назначена",
            null: "Не назначена",
            undefined: "Не назначена"
        }
    };

    initializeProperties(properties) {
        if (!properties) return;
        const issueProperties = {};

        // Rename keys and parse values
        if (typeof properties === 'object') {
            Object.entries(properties).forEach(([key, value]) => {
                const propKey = Issue.#fieldMappings[key] || key;
                const parsedValue = Issue.parseValue(propKey, value);
                if (parsedValue !== undefined && parsedValue !== null) {
                    issueProperties[propKey] = parsedValue;
                }
            });
            
            // Add calculated properties
            if (issueProperties.taskId) {
                if (issueProperties.taskId.includes('ADIRINC')) {
                    issueProperties.project = 'AI';
                    issueProperties.taskId = issueProperties.taskId.replace('ADIRINC-', '');
                } else if (issueProperties.taskId.includes('GODUTY')) {
                    issueProperties.project = 'GO';
                    issueProperties.taskId = issueProperties.taskId.replace('GODUTY-', '');
                }
            }

            if (issueProperties.status) {
                issueProperties.state = Issue.#getStateByStatus(issueProperties.status);
            }

            if (issueProperties.type) {
                issueProperties.type = this.getType(issueProperties.type);
            }
        }
        
        // Assign properties to this instance
        Object.keys(issueProperties).forEach(key => {
            this[key] = issueProperties[key];
        });
    }

    static parseValue(key, value) {
        // Date
        if (Issue.dataTypes[key] === 'date') {
            const date = stringToDate(value);
            if (date) return date;
            return false;
        }
        // Number
        if (Issue.dataTypes[key] === 'number') {
            return this.#parseNumber(value);
        }
        // String
        return value;
    }

    fromJSON(object) {
        if (!object) return;
        this.initializeProperties(object);
    }

    static #parseDate(value) {
        if (!value) return null;
        try {
            if (typeof value === 'string') {
                // Русский формат даты DD.MM.YYYY HH:mm
                if (/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/.test(value)) {
                    const [datePart, timePart] = value.split(' ');
                    const [day, month, year] = datePart.split('.');
                    const [hours, minutes] = timePart.split(':');
                    const date = new Date(year, month - 1, day, hours, minutes);
                    if (!isNaN(date)) {
                        return date.toISOString();
                    }
                }

                // SLA формат YYYY-MM-DD HH:mm:ss.S
                if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+$/.test(value)) {
                    const date = new Date(value.replace(' ', 'T'));
                    if (!isNaN(date)) {
                        return date.toISOString();
                    }
                }

                // ISO формат
                if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    const date = new Date(value);
                    if (!isNaN(date)) {
                        return date.toISOString();
                    }
                }

                // Простой формат даты DD.MM.YYYY
                if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
                    const [day, month, year] = value.split('.');
                    const date = new Date(year, month - 1, day);
                    if (!isNaN(date)) {
                        return date.toISOString();
                    }
                }

                // Простой формат даты YYYY-MM-DD
                if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    const date = new Date(value);
                    if (!isNaN(date)) {
                        return date.toISOString();
                    }
                }
            }

            // Последняя попытка - просто создать дату
            const date = new Date(value);
            if (!isNaN(date)) {
                return date.toISOString();
            }

        } catch (e) {
            console.warn(`[Issue] Error parsing date: ${value}`, e);
        }
        return null;
    }

    static #parseNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Удаляем все нечисловые символы, кроме точки
            const cleaned = value.replace(/[^\d.]/g, '');
            const parsed = parseInt(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }

    static #getStateByStatus(status) {
        switch (status) {
            case 'Закрыт':
                return 'resolved';
            case 'Отклонен':
                return 'rejected';
            default:
                return 'unresolved';
        }
    }

    getType(data) {
        if (!data) {
            console.log('[Issue] No type data provided');
            return null;
        }

        switch (data.toLowerCase()) {
            case 'дефект промсреды':
                return 'defect';
            case 'request (fr)':
                return 'request';
            default:
                return data;
        }
    }

    // Метод для обновления свойств
    update(properties) {
        this.initializeProperties(properties);
    }
}