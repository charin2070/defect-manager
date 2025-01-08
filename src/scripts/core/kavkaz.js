class FlowManager extends Refact {
    constructor({ dataManager, parseManager, indexManager, uiManager }, logger = console) {
        this.dataManager = dataManager;
        this.parseManager = parseManager;
        this.indexManager = indexManager;
        this.uiManager = uiManager;
        this.logger = logger;

        this.isRunning = false;
        this.retryInterval = 2000; // мс
    }

    async start() {
        this.isRunning = true;
        this.logger.log('[Kavkaz Flow Manager] Запуск менеджера потоков данных');

        while (this.isRunning) {
            try {
                // 1. Получаем очередную порцию данных (может вернуться пустой массив/undefined)
                const data = await this.dataManager.loadData();
                if (!data || data.length === 0) {
                    this.logger.log('[Kavkaz Flow Manager] Нет новых данных, ждем...');
                    await this._sleep(this.retryInterval);
                    continue;
                }

                // 2. Парсим данные
                const parsedData = await this.parseManager.parse(data);

                // 3. Индексируем результат парсинга
                const indexedData = await this.indexManager.index(parsedData);

                // 4. Отправляем результат в UI
                this.uiManager.updateUI(indexedData);

                this.logger.log('[MafkaFlow] Пакет данных успешно обработан');
            } catch (err) {
                // Если что-то пошло не так, логируем и ждём перед повторной попыткой
                this.logger.error('[MafkaFlow] Ошибка в потоке данных:', err);
                await this._sleep(this.retryInterval);
            }
        }
    }

    /**
     * Остановка обработки потоков данных.
     * В реальном приложении возможно, нужно предусмотреть логику «дочистки» очередей.
     */
    stop() {
        this.logger.log('[MafkaFlow] Остановка менеджера потоков данных');
        this.isRunning = false;
    }

    /**
     * Вспомогательный метод для «подождать» заданное число миллисекунд
     */
    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
