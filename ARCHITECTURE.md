# Архитектура Defect Manager

## Оглавление
- [Обзор архитектуры](#обзор-архитектуры)
- [Структура проекта](#структура-проекта)
- [Компоненты](#компоненты)
- [Порядок загрузки](#порядок-загрузки)

## Обзор архитектуры

Defect Manager построен на модульной архитектуре с четким разделением ответственности:

- **Core** - ядро приложения, управляющее данными и состоянием
- **Components** - переиспользуемые UI компоненты
- **Views** - представления для отдельных страниц/разделов
- **Utils** - вспомогательные утилиты

### Ключевые концепции

1. **Событийная модель** - компоненты общаются через события
2. **Модульность** - каждый компонент независим и переиспользуем
3. **Единый источник данных** - централизованное управление через DataManager

## Структура проекта

### Графики и аналитика
- `chart-manager.js` (core)
  - Управление графиками и их конфигурацией
  - `.createChart()` - создание нового графика
  - `.updateChart()` - обновление данных графика
  - `.destroyChart()` - удаление графика
  - `.getChartConfig()` - получение конфигурации

- `base-chart.js` (components)
  - Базовый класс для всех графиков
  - `.render()` - отрисовка графика
  - `.update()` - обновление данных
  - `.clear()` - очистка данных

- `backlog-chart.js` (components)
  - График бэклога
  - `.renderBacklogData()` - отрисовка данных бэклога
  - `.updateBacklogTrend()` - обновление тренда

- `teams-chart.js` (components)
  - График по командам
  - `.renderTeamMetrics()` - отрисовка метрик команды
  - `.updateTeamData()` - обновление данных команды

- `chart-component.js` (components)
  - Компонент для отображения графиков
  - `.initChart()` - инициализация графика
  - `.refreshData()` - обновление данных

- `analytic-manager.js` (utils)
  - Анализ и обработка данных
  - `.calculateMetrics()` - расчет метрик
  - `.processData()` - обработка данных

- `graphic-utils.js` (utils)
  - Утилиты для работы с графикой
  - `.formatChartData()` - форматирование данных
  - `.generateColors()` - генерация цветов

### UI компоненты
- `ui-manager.js` (core)
  - Управление UI и состоянием интерфейса
  - `.initComponents()` - инициализация компонентов
  - `.updateState()` - обновление состояния
  - `.renderView()` - отрисовка представления

- `html-view.js` (components)
  - Базовый класс для HTML-компонентов
  - `.render()` - отрисовка компонента
  - `.update()` - обновление состояния
  - `.destroy()` - удаление компонента

- `dropdown-component.js` (components)
  - Базовый компонент выпадающего списка
  - `.show()` - показать список
  - `.hide()` - скрыть список
  - `.select()` - выбор элемента

- `date-range-dropdown.js` (components)
  - Выбор диапазона дат
  - `.setRange()` - установка диапазона
  - `.getSelectedRange()` - получение выбранного диапазона

- `teams-dropdown-component.js` (components)
  - Выбор команд
  - `.loadTeams()` - загрузка списка команд
  - `.getSelectedTeam()` - получение выбранной команды

- `widgets-row.js` (components)
  - Строка с виджетами статистики
  - `.addWidget()` - добавление виджета
  - `.updateWidgets()` - обновление виджетов

- `file-input.js` (components)
  - Компонент загрузки файлов
  - `.upload()` - загрузка файла
  - `.validate()` - валидация файла

- `loader-view.js` (components)
  - Компонент загрузки
  - `.showLoader()` - показать индикатор
  - `.hideLoader()` - скрыть индикатор

### Данные и события
- `data-manager.js` (core)
  - Управление данными приложения
  - `.loadData()` - загрузка данных
  - `.saveData()` - сохранение данных
  - `.processData()` - обработка данных

- `event-emitter.js` (core)
  - Базовый класс для работы с событиями
  - `.on()` - подписка на событие
  - `.emit()` - отправка события
  - `.off()` - отписка от события

- `component-manager.js` (components)
  - Управление компонентами
  - `.registerComponent()` - регистрация компонента
  - `.getComponent()` - получение компонента
  - `.destroyComponent()` - удаление компонента

### Утилиты
- `log-tools.js` (utils)
  - Инструменты логирования
  - `.log()` - логирование
  - `.error()` - ошибки
  - `.debug()` - отладка

- `date-util.js` (utils)
  - Утилиты для работы с датами
  - `.formatDate()` - форматирование даты
  - `.parseDate()` - парсинг даты
  - `.getDateRange()` - получение диапазона

- `console-panel.js` (utils)
  - Панель консоли для отладки
  - `.show()` - показать панель
  - `.log()` - вывод в панель
  - `.clear()` - очистка панели

### Представления
- `team-view.js` (views)
  - Представление команды
  - `.renderTeam()` - отрисовка команды
  - `.updateMetrics()` - обновление метрик

- `backlog-view.js` (views)
  - Представление бэклога
  - `.renderBacklog()` - отрисовка бэклога
  - `.updateStats()` - обновление статистики

### Стили
- `app-components.css` - Стили компонентов
- `theme.css` - Темы оформления
- `style.css` - Общие стили
- `tailwind.min.css` - Утилиты Tailwind CSS

### Внешние библиотеки
- `chart.js` - Библиотека Chart.js
- `chartjs-adapter-date-fns@3.js` - Адаптер для работы с датами

## Порядок загрузки

> ⚠️ Порядок загрузки скриптов критичен для работы приложения

```html
<!-- Утилиты -->
<script src="src/scripts/utils/graphic-utils.js"></script>
<script src="src/scripts/utils/log-tools.js"></script>
<script src="src/scripts/utils/date-util.js"></script>
<script src="src/scripts/utils/console-panel.js"></script>

<!-- Базовые классы -->
<script src="src/scripts/core/event-emitter.js"></script>
<script src="src/scripts/core/theme-manager.js"></script>
<script src="src/scripts/components/html-view.js"></script>

<!-- Компоненты -->
<script src="src/scripts/components/dropdown-component.js"></script>
<script src="src/scripts/components/date-range-dropdown.js"></script>
<script src="src/scripts/components/teams-dropdown-component.js"></script>
<script src="src/scripts/components/widgets-row.js"></script>
<script src="src/scripts/components/component-manager.js"></script>
<script src="src/scripts/components/file-input.js"></script>

<!-- Графики -->
<script src="src/scripts/components/base-chart.js"></script>
<script src="src/scripts/components/backlog-chart.js"></script>
<script src="src/scripts/components/teams-chart.js"></script>
<script src="src/scripts/vendor/chart.js"></script>
<script src="src/scripts/vendor/chartjs-adapter-date-fns@3.js"></script>
<script src="src/scripts/components/chart-component.js"></script>

<!-- Представления -->
<script src="src/scripts/views/team-view.js"></script>
<script src="src/scripts/views/backlog-view.js"></script>

<!-- Менеджеры -->
<script src="src/scripts/core/chart-manager.js"></script>
<script src="src/scripts/components/loader-view.js"></script>
<script src="src/scripts/utils/analytic-manager.js"></script>
<script src="src/scripts/core/data-manager.js"></script>
<script src="src/scripts/core/ui-manager.js"></script>

<!-- Запуск приложения -->
<script src="src/scripts/core/app.js"></script>
```
