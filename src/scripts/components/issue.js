class Issue {
    constructor(properties) {
        // Основные поля, которые должны быть всегда
        this.taskId = null;
        this.created = null;
        this.resolved = null;
        this.reports = 0;
        this.slaDate = null;
        this.status = null;
        this.state = null;
        this.description = null;
        this.summary = null;
        this.type = null;

        // Дополнительные поля
        this.priority = null;
        this.assignee = null;
        this.reporter = null;
        this.team = null;
        this.isOverdue = null;
        this.source = null;
        this.notes = null;
        this.alarms = null;
        this.component = null;
        this.updated = null;

        if (properties) {
            this.#normalizeAndSetProperties(properties);
        }
    }

    // Маппинг полей из разных источников
    static #fieldMappings = {
        // ID задачи
        "Issue key": "taskId",
        "Issue id": "taskId",
        "Номер драфта": "taskId",
        "id": "taskId",
        
        // Основные поля
        "Summary": "summary",
        "Description": "description",
        "Custom field (description )": "description",
        "Custom field (Business Summary)": "summary",
        
        // Даты
        "Created": "created",
        "дата открытия": "created",
        "Resolved": "resolved",
        "дата закрытия": "resolved",
        "Updated": "updated",
        "updated": "updated",
        "Custom field (SLA дата наступления просрочки)": "slaDate",
        "Дата наступления SLA": "slaDate",
        
        // Назначения
        "Assignee": "assignee",
        "Reporter": "reporter",
        "Custom field (Команда устраняющая проблему)": "team",
        "Команда устраняющая проблему": "team",
        
        // Компоненты
        "Component/s": "component",
        "component": "component",
        
        // Метрики
        "Custom field (Количество обращений)": "reports",
        "reports": "reports",
        "Labels": "labels",

        // Статус
        "Status": "status",
        "status": "status",

        // Тип
        "Issue Type": "type",
        "type": "type"
    };

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
            "Request (FR)": "Request (FR)",
            "Task": "Task",
            "Консультация": "Консультация",
        },
        team: {
            "Core": "Ядро",
            "": "Не назначена",
            null: "Не назначена",
            undefined: "Не назначена"
        }
    };

    #normalizeAndSetProperties(properties) {
        if (!properties) return;
        // Первый проход: нормализуем имена полей
        const normalizedProps = {};  
        for (const [key, value] of Object.entries(properties)) {
            const normalizedKey = Issue.#fieldMappings[key] || key;
            
            // Пропускаем пустые значения если уже есть значение
            if (normalizedProps[normalizedKey] && (!value || value === "")) continue;
            
            normalizedProps[normalizedKey] = value;
        }

        // Второй проход: обрабатываем значения
        for (const [key, value] of Object.entries(normalizedProps)) {
            let processedValue = value;

            // Обработка дат
            if (["created", "resolved", "slaDate", "updated"].includes(key)) {
                processedValue = this.#parseDate(value);
                if (!processedValue && (key === "created" || key === "slaDate")) {
                    console.warn(`[Issue] Failed to parse "${key}" date: "${value}" for issue: ${normalizedProps.taskId || 'unknown'}`);
                }
            }
            // Обработка чисел
            else if (key === "reports") {
                processedValue = this.#parseNumber(value);
            }
            // Обработка маппированных значений
            else if (Issue.#valueMappings[key]) {
                processedValue = Issue.#valueMappings[key][value] || value;
            }

            this[key] = processedValue;
        }

        // Проверяем обязательные поля
        if (!this.created || !this.slaDate) {
            console.warn(`[Issue] Missing created date or slaDate for issue: ${this.taskId || 'unknown'}`);
        }

        // Устанавливаем состояние на основе статуса
        this.state = this.#getStateByStatus(this.status);
    }

    #parseDate(value) {
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

    #parseNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Удаляем все нечисловые символы, кроме точки
            const cleaned = value.replace(/[^\d.]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }

    #getStateByStatus(status) {
        switch (status) {
            case 'Закрыт':
                return 'resolved';
            case 'Отклонен':
                return 'rejected';
            default:
                return 'unresolved';
        }
    }

    #getType(data) {
        if (!data) {
            console.log('[Issue] No type data provided');
            return null;
        }

        // Проверяем поле Issue Type из CSV
        const issueType = (data['Issue Type'] || '').trim();
        switch (issueType) {
            case 'Request (FR)':
                return 'request';
            case 'Дефект промсреды':
                return 'defect';
            default: return issueType;
        }
    }

    // Метод для обновления свойств
    update(properties) {
        this.#normalizeAndSetProperties(properties);
    }
}