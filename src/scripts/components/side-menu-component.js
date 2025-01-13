class SideMenuComponent extends HtmlComponent {
    constructor() {
        super();
        this.items = [];
        this.itemsById = new Map(); // карта id -> item
        this.collapsed = false;

        // Создаём главный контейнер
        this.container = this.createElement('nav', { className: 'side-menu' });

        this.render();
    }

    addItem(item) {
        this.items.push(item);
        if (item.id) {
            this.itemsById.set(item.id, item);
        }
        this.render();
    }

    setItems(items) {
        this.items = items;
        this.itemsById.clear();
        items.forEach(item => {
            if (item.id) {
                this.itemsById.set(item.id, item);
            }
        });
        this.render();
    }

    addSubItems(itemId, subItems) {
        const item = this.itemsById.get(itemId);
        if (!item) {
            console.warn(`Menu item with id "${itemId}" not found`);
            return;
        }
        if (!item.subItems) {
            item.subItems = [];
        }
        item.subItems.push(...subItems);
        this.render();
    }

    setSubItems(itemId, subItems) {
        const item = this.itemsById.get(itemId);
        if (!item) {
            console.warn(`Menu item with id "${itemId}" not found`);
            return;
        }
        item.subItems = subItems;
        this.render();
    }

    /**
     * Этот метод полностью перерисовывает структуру меню (ul > li, submenus и т.п.)
     */
    render() {
        // Очищаем контейнер перед рендером
        this.container.innerHTML = '';

        // Основной <ul> для пунктов меню
        const list = this.createElement('ul', { className: 'side-menu-list' });

        this.items.forEach((item, index) => {
            // каждый пункт <li>
            const li = this.createElement('li', {
                className: `side-menu-item 
                            ${item.active ? 'active' : ''} 
                            ${item.subItems?.length ? 'has-submenu' : ''}`,
                'data-index': index,
                'data-tooltip': item.text
            });

            // Контейнер для иконки и текста
            const itemContent = this.createElement('div', {
                className: 'menu-item-content'
            });

            // Если есть иконка
            if (item.icon) {
                const img = this.createElement('img', {
                    src: item.icon,
                    alt: item.text,
                    className: 'side-menu-icon'
                });
                itemContent.appendChild(img);
            }

            // Текст
            const span = this.createElement('span', {
                className: 'side-menu-text'
            });
            span.textContent = item.text;
            itemContent.appendChild(span);

            // Иконка для подменю, если subItems есть
            if (item.subItems?.length) {
                const submenuIcon = this.createElement('img', {
                    src: 'src/image/chevron-down.svg',
                    alt: 'Развернуть',
                    className: 'submenu-icon'
                });
                itemContent.appendChild(submenuIcon);
            }

            // Если есть кастомный onClick — навешиваем
            if (typeof item.onClick === 'function') {
                itemContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.onClick();
                });
            }

            // Добавляем обёртку с иконкой и текстом в li
            li.appendChild(itemContent);

            // Подменю, если есть
            if (item.subItems?.length) {
                const submenu = this.createElement('ul', {
                    className: 'submenu'
                });

                item.subItems.forEach((subItem, subIndex) => {
                    const subLi = this.createElement('li', {
                        className: 'submenu-item',
                        'data-parent-index': index,
                        'data-sub-index': subIndex
                    });

                    const subItemContent = this.createElement('div', {
                        className: 'submenu-item-content'
                    });

                    if (subItem.icon) {
                        const subImg = this.createElement('img', {
                            src: subItem.icon,
                            alt: subItem.text,
                            className: 'side-menu-icon'
                        });
                        subItemContent.appendChild(subImg);
                    }

                    const subSpan = this.createElement('span', {
                        className: 'side-menu-text'
                    });
                    subSpan.textContent = subItem.text;
                    subItemContent.appendChild(subSpan);

                    // Навешиваем свой onClick, если есть
                    if (typeof subItem.onClick === 'function') {
                        subItemContent.addEventListener('click', (e) => {
                            e.stopPropagation();
                            subItem.onClick();
                        });
                    }

                    subLi.appendChild(subItemContent);
                    submenu.appendChild(subLi);
                });

                li.appendChild(submenu);
            }

            list.appendChild(li);
        });

        // Прикрепляем список в контейнер
        this.container.appendChild(list);

        // Создаём кнопку сворачивания
        const collapseButton = this.createElement('div', {
            className: 'collapse-button'
        });
        const collapseIcon = this.createElement('img', {
            className: 'collapse-icon',
            src: 'src/image/chevron-left.svg', 
            alt: 'Collapse'
        });
        collapseButton.appendChild(collapseIcon);
        this.container.appendChild(collapseButton);

        // После создания всей структуры навешиваем события
        this.setupEventListeners();
    }

    /**
     * Логика кликов, развёртывания/свёртывания, выделения активных элементов и т.д.
     */
    setupEventListeners() {
        // Кнопка сворачивания
        const collapseButton = this.container.querySelector('.collapse-button');
        if (collapseButton) {
            // По клику меняем состояние collapsed
            collapseButton.addEventListener('click', () => {
                this.setCollapsed(!this.collapsed);

                // Сгенерируем событие "collapseChange"
                this.container.dispatchEvent(new CustomEvent('collapseChange', {
                    detail: { collapsed: this.collapsed }
                }));
            });
        }

        // Выбираем все пункты меню и подменю
        const items = this.container.querySelectorAll('.side-menu-item');
        const subItems = this.container.querySelectorAll('.submenu-item');

        items.forEach((item) => {
            item.addEventListener('click', (e) => {
                // Если кликнули по подменю — не обрабатываем здесь
                if (e.target.closest('.submenu')) {
                    return;
                }

                const hasSubmenu = item.classList.contains('has-submenu');
                const index = parseInt(item.dataset.index, 10);

                // Если есть подменю и меню не свернуто — раскрываем/скрываем
                if (hasSubmenu && !this.collapsed) {
                    item.classList.toggle('expanded');
                    const submenu = item.querySelector('.submenu');
                    if (submenu) {
                        submenu.classList.toggle('expanded');
                    }
                } else {
                    // Активный класс ставим только если нет подменю или меню свернуто
                    items.forEach(i => i.classList.remove('active'));
                    subItems.forEach(i => i.classList.remove('active'));

                    item.classList.add('active');

                    // Событие "menuChange"
                    this.container.dispatchEvent(new CustomEvent('menuChange', {
                        detail: { index, item: this.items[index] }
                    }));
                }
            });
        });

        subItems.forEach((subItem) => {
            subItem.addEventListener('click', (e) => {
                e.stopPropagation();

                // Удаляем active у всех
                items.forEach(i => i.classList.remove('active'));
                subItems.forEach(i => i.classList.remove('active'));

                subItem.classList.add('active');

                const parentIndex = parseInt(subItem.dataset.parentIndex, 10);
                const subIndex = parseInt(subItem.dataset.subIndex, 10);

                // Событие "menuChange" с детальной инфой — какой subItem выбран
                this.container.dispatchEvent(new CustomEvent('menuChange', {
                    detail: {
                        parentIndex,
                        subIndex,
                        item: this.items[parentIndex].subItems[subIndex]
                    }
                }));
            });
        });
    }

    /**
     * Устанавливает/снимает класс "collapsed" на контейнере
     */
    setCollapsed(collapsed) {
        this.collapsed = collapsed;
        if (this.collapsed) {
            this.container.classList.add('collapsed');
        } else {
            this.container.classList.remove('collapsed');
        }
    }
}
