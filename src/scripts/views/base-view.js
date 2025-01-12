class BaseView extends HtmlComponent {
    constructor() {
        super();
        this.container = this.createElement('div', {
            className: 'view-container'
        });
        this.cards = new Map();
        this.gridCells = {
            columns: 3,
            rows: 2
        };
        this.cardShadow = this.createCardShadow();
        this.initDragAndDrop();
    }

    // Получение координат ближайшей ячейки сетки
    getClosestGridCell(x, y) {
        const containerRect = this.container.getBoundingClientRect();
        const cellWidth = containerRect.width / this.gridCells.columns;
        const cellHeight = containerRect.height / this.gridCells.rows;
        
        // Определяем индекс колонки и строки
        const col = Math.floor((x - containerRect.left) / cellWidth);
        const row = Math.floor((y - containerRect.top) / cellHeight);
        
        // Ограничиваем значения в пределах сетки
        const validCol = Math.max(0, Math.min(col, this.gridCells.columns - 1));
        const validRow = Math.max(0, Math.min(row, this.gridCells.rows - 1));
        
        return {
            x: containerRect.left + validCol * cellWidth,
            y: containerRect.top + validRow * cellHeight,
            width: cellWidth,
            height: cellHeight
        };
    }

    // Создание новой карточки
    createCard(id, title, content) {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = id;
        card.innerHTML = `
            <div class="card-header" draggable="true">
                <h3>${title}</h3>
                <div class="card-controls">
                    <button class="minimize-btn">_</button>
                    <button class="maximize-btn">□</button>
                </div>
            </div>
            <div class="card-content">
                ${content}
            </div>
            <div class="resize-edge top"></div>
            <div class="resize-edge bottom"></div>
            <div class="resize-edge left"></div>
            <div class="resize-edge right"></div>
            <div class="resize-edge top-left"></div>
            <div class="resize-edge top-right"></div>
            <div class="resize-edge bottom-left"></div>
            <div class="resize-edge bottom-right"></div>
        `;

        // Находим первую свободную ячейку
        const containerRect = this.container.getBoundingClientRect();
        const cellWidth = containerRect.width / this.gridCells.columns;
        const cellHeight = containerRect.height / this.gridCells.rows;
        
        let placed = false;
        for(let row = 0; row < this.gridCells.rows && !placed; row++) {
            for(let col = 0; col < this.gridCells.columns && !placed; col++) {
                if(!this.isCellOccupied(col, row)) {
                    card.style.left = `${col * cellWidth}px`;
                    card.style.top = `${row * cellHeight}px`;
                    placed = true;
                }
            }
        }

        this.setupCardControls(card);
        this.cards.set(id, card);
        this.container.appendChild(card);
        return card;
    }

    // Проверка занятости ячейки
    isCellOccupied(col, row) {
        const containerRect = this.container.getBoundingClientRect();
        const cellWidth = containerRect.width / this.gridCells.columns;
        const cellHeight = containerRect.height / this.gridCells.rows;
        const targetX = containerRect.left + col * cellWidth;
        const targetY = containerRect.top + row * cellHeight;

        for(const card of this.cards.values()) {
            const cardRect = card.getBoundingClientRect();
            if(Math.abs(cardRect.left - targetX) < 10 && Math.abs(cardRect.top - targetY) < 10) {
                return true;
            }
        }
        return false;
    }

    // Настройка элементов управления карточкой
    setupCardControls(card) {
        const header = card.querySelector('.card-header');
        const minimizeBtn = card.querySelector('.minimize-btn');
        const maximizeBtn = card.querySelector('.maximize-btn');
        const content = card.querySelector('.card-content');
        const resizeEdges = card.querySelectorAll('.resize-edge');

        minimizeBtn.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });

        maximizeBtn.addEventListener('click', () => {
            card.classList.toggle('maximized');
        });

        let isResizing = false;
        let currentEdge = null;
        let initialWidth, initialHeight, initialX, initialY;
        let initialLeft, initialTop;

        resizeEdges.forEach(edge => {
            edge.addEventListener('mousedown', (e) => {
                isResizing = true;
                currentEdge = edge;
                const rect = card.getBoundingClientRect();
                
                initialWidth = rect.width;
                initialHeight = rect.height;
                initialX = e.clientX;
                initialY = e.clientY;
                initialLeft = rect.left;
                initialTop = rect.top;

                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
                e.preventDefault(); // Предотвращаем выделение текста
            });
        });

        const handleResize = (e) => {
            if (!isResizing) return;

            const containerRect = this.container.getBoundingClientRect();
            const cellWidth = containerRect.width / this.gridCells.columns;
            const cellHeight = containerRect.height / this.gridCells.rows;
            
            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newLeft = parseInt(card.style.left) || 0;
            let newTop = parseInt(card.style.top) || 0;
            
            const deltaX = e.clientX - initialX;
            const deltaY = e.clientY - initialY;

            // Определяем направление изменения размера
            if (currentEdge.classList.contains('right') || currentEdge.classList.contains('bottom-right') || currentEdge.classList.contains('top-right')) {
                newWidth = Math.round((initialWidth + deltaX) / cellWidth) * cellWidth - 20;
            }
            if (currentEdge.classList.contains('bottom') || currentEdge.classList.contains('bottom-right') || currentEdge.classList.contains('bottom-left')) {
                newHeight = Math.round((initialHeight + deltaY) / cellHeight) * cellHeight - 20;
            }
            if (currentEdge.classList.contains('left') || currentEdge.classList.contains('top-left') || currentEdge.classList.contains('bottom-left')) {
                const possibleWidth = Math.round((initialWidth - deltaX) / cellWidth) * cellWidth - 20;
                const possibleLeft = Math.round((initialLeft + deltaX - containerRect.left) / cellWidth) * cellWidth;
                if (possibleWidth > 0 && possibleLeft >= 0) {
                    newWidth = possibleWidth;
                    newLeft = possibleLeft;
                }
            }
            if (currentEdge.classList.contains('top') || currentEdge.classList.contains('top-left') || currentEdge.classList.contains('top-right')) {
                const possibleHeight = Math.round((initialHeight - deltaY) / cellHeight) * cellHeight - 20;
                const possibleTop = Math.round((initialTop + deltaY - containerRect.top) / cellHeight) * cellHeight;
                if (possibleHeight > 0 && possibleTop >= 0) {
                    newHeight = possibleHeight;
                    newTop = possibleTop;
                }
            }

            // Применяем новые размеры с учетом минимальных значений и границ сетки
            card.style.width = `${Math.max(cellWidth - 20, Math.min(newWidth, containerRect.width - newLeft - 20))}px`;
            card.style.height = `${Math.max(cellHeight - 20, Math.min(newHeight, containerRect.height - newTop - 20))}px`;
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
        };

        const stopResize = () => {
            isResizing = false;
            currentEdge = null;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        };
    }

    // Создание тени-подсказки
    createCardShadow() {
        const shadow = document.createElement('div');
        shadow.className = 'card-shadow';
        this.container.appendChild(shadow);
        return shadow;
    }

    // Инициализация drag and drop
    initDragAndDrop() {
        let draggedCard = null;
        let offsetX, offsetY;

        this.container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('card-header')) {
                draggedCard = e.target.closest('.card');
                const rect = draggedCard.getBoundingClientRect();
                const containerRect = this.container.getBoundingClientRect();
                
                // Используем смещение относительно контейнера
                offsetX = e.clientX - (rect.left - containerRect.left);
                offsetY = e.clientY - (rect.top - containerRect.top);
                
                this.cardShadow.style.width = `${rect.width}px`;
                this.cardShadow.style.height = `${rect.height}px`;
                
                draggedCard.classList.add('dragging');
                this.cardShadow.classList.add('visible');
                
                const dragImage = document.createElement('div');
                dragImage.style.opacity = '0';
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, 0, 0);
                setTimeout(() => document.body.removeChild(dragImage), 0);
            }
        });

        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedCard) return;

            const containerRect = this.container.getBoundingClientRect();
            
            // Вычисляем позицию относительно контейнера
            const x = e.clientX - containerRect.left - offsetX;
            const y = e.clientY - containerRect.top - offsetY;
            
            // Ограничиваем движение пределами контейнера
            const maxX = containerRect.width - parseInt(this.cardShadow.style.width);
            const maxY = containerRect.height - parseInt(this.cardShadow.style.height);
            
            const cardX = Math.max(0, Math.min(x, maxX));
            const cardY = Math.max(0, Math.min(y, maxY));
            
            // Применяем transform вместо left/top для более плавного движения
            draggedCard.style.transform = `translate(${cardX}px, ${cardY}px)`;
            
            // Получаем ближайшую ячейку сетки для тени
            const cell = this.getClosestGridCell(
                e.clientX - containerRect.left,
                e.clientY - containerRect.top
            );
            
            // Обновляем позицию тени
            this.cardShadow.style.transform = `translate(${cell.x}px, ${cell.y}px)`;
        });

        this.container.addEventListener('dragend', (e) => {
            if (draggedCard) {
                draggedCard.classList.remove('dragging');
                draggedCard.classList.add('snapping');
                
                const containerRect = this.container.getBoundingClientRect();
                const cell = this.getClosestGridCell(
                    e.clientX - containerRect.left,
                    e.clientY - containerRect.top
                );
                
                // Сбрасываем transform и устанавливаем конечную позицию
                draggedCard.style.transform = '';
                draggedCard.style.left = `${cell.x}px`;
                draggedCard.style.top = `${cell.y}px`;
                
                this.cardShadow.classList.remove('visible');
                this.cardShadow.style.transform = '';
                
                setTimeout(() => {
                    draggedCard.classList.remove('snapping');
                }, 300);
                
                draggedCard = null;
            }
        });
    }

    // Удаление карточки
    removeCard(id) {
        const card = this.cards.get(id);
        if (card) {
            card.remove();
            this.cards.delete(id);
        }
    }

    // Очистка всех карточек
    clear() {
        this.cards.forEach(card => card.remove());
        this.cards.clear();
    }
}
