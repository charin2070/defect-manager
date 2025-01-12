class SideMenuComponent extends HtmlComponent {
    constructor() {
        super();
        this.items = [
            { 
                icon: 'src/image/folder.svg',
                text: 'Данные',
                active: true
            },
            {
                icon: 'src/image/brush.svg',
                text: 'Внешний вид'
            },
            {
                icon: 'src/image/chart.svg',
                text: 'Статистика',
                subItems: [
                    {
                        icon: 'src/image/chart.svg',
                        text: 'За месяц'
                    },
                    {
                        icon: 'src/image/chart.svg',
                        text: 'За всё время'
                    }
                ]
            },
            {
                icon: 'src/image/keyboard.svg',
                text: 'Горячие клавиши'
            },
            {
                icon: 'src/image/info.svg',
                text: 'О приложении'
            }
        ];
        
        this.container = this.createElement('nav', { className: 'side-menu' });
        this.render();
        this.setupEventListeners();
    }

    render() {
        const list = this.createElement('ul', { className: 'side-menu-list' });
        
        this.items.forEach((item, index) => {
            const li = this.createElement('li', { 
                className: `side-menu-item ${item.active ? 'active' : ''} ${item.subItems ? 'has-submenu' : ''}`,
                'data-index': index
            });
            
            const img = this.createElement('img', {
                src: item.icon,
                alt: item.text,
                className: 'side-menu-icon'
            });
            
            const span = this.createElement('span', {
                className: 'side-menu-text'
            });
            span.textContent = item.text;
            
            li.appendChild(img);
            li.appendChild(span);
            
            // Добавляем значок для подменю
            if (item.subItems) {
                const submenuIcon = this.createElement('img', {
                    src: 'src/image/chevron-down.svg',
                    alt: 'Развернуть',
                    className: 'submenu-icon'
                });
                li.appendChild(submenuIcon);
                
                const submenu = this.createElement('ul', { className: 'submenu' });
                
                item.subItems.forEach((subItem, subIndex) => {
                    const subLi = this.createElement('li', { 
                        className: 'submenu-item',
                        'data-parent-index': index,
                        'data-sub-index': subIndex
                    });
                    
                    const subImg = this.createElement('img', {
                        src: subItem.icon,
                        alt: subItem.text,
                        className: 'side-menu-icon'
                    });
                    
                    const subSpan = this.createElement('span', {
                        className: 'side-menu-text'
                    });
                    subSpan.textContent = subItem.text;
                    
                    subLi.appendChild(subImg);
                    subLi.appendChild(subSpan);
                    submenu.appendChild(subLi);
                });
                
                li.appendChild(submenu);
            }
            
            list.appendChild(li);
        });
        
        this.container.appendChild(list);
    }

    setupEventListeners() {
        const items = this.container.querySelectorAll('.side-menu-item');
        const subItems = this.container.querySelectorAll('.submenu-item');
        
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                // Проверяем, был ли клик по подменю
                if (e.target.closest('.submenu')) {
                    return;
                }
                
                const hasSubmenu = item.classList.contains('has-submenu');
                const index = parseInt(item.dataset.index);
                
                if (hasSubmenu) {
                    // Переключаем состояние подменю
                    item.classList.toggle('expanded');
                    const submenu = item.querySelector('.submenu');
                    if (submenu) {
                        submenu.classList.toggle('expanded');
                    }
                } else {
                    // Убираем активный класс у всех элементов
                    items.forEach(i => i.classList.remove('active'));
                    subItems.forEach(i => i.classList.remove('active'));
                    
                    // Добавляем активный класс к выбранному элементу
                    item.classList.add('active');
                    
                    // Вызываем событие изменения
                    this.container.dispatchEvent(new CustomEvent('menuChange', {
                        detail: { index, item: this.items[index] }
                    }));
                }
            });
        });
        
        subItems.forEach(subItem => {
            subItem.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем всплытие события
                
                // Убираем активный класс у всех элементов
                items.forEach(i => i.classList.remove('active'));
                subItems.forEach(i => i.classList.remove('active'));
                
                // Добавляем активный класс к выбранному подэлементу
                subItem.classList.add('active');
                
                const parentIndex = parseInt(subItem.dataset.parentIndex);
                const subIndex = parseInt(subItem.dataset.subIndex);
                
                // Вызываем событие изменения
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
}
