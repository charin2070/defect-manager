/**
 * Генерирует гармоничные цвета по аналогичной схеме.
 * @param {string} baseColor - Базовый цвет в формате hex.
 * @param {number} count - Количество цветов в палитре.
 * @returns {string[]} Массив гармоничных цветов.
 */
function generateHarmoniousColors(baseColor, count = 5) {
    // Функция для преобразования hex в RGB
    const hexToRgb = hex => {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };

    // Функция для преобразования RGB в hex
    const rgbToHex = (r, g, b) => 
        `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

    // Создаем базовый цвет
    const [r, g, b] = hexToRgb(baseColor);
    const colors = [baseColor];

    // Генерируем дополнительные цвета, изменяя оттенок
    for (let i = 1; i < count; i++) {
        const hueShift = 30 * i; // Смещение оттенка для гармонии
        const newR = Math.round((r + hueShift) % 255);
        const newG = Math.round((g + hueShift / 2) % 255);
        const newB = Math.round((b + hueShift / 3) % 255);

        colors.push(rgbToHex(newR, newG, newB));
    }

    return colors;
}

function getRandomColorFromPalette() {
    const paletteColors = [
      "#66bb6a",
      "#ffccbc",
      "#ff9800",
      "#ffcc80",
      "#3f51b5",
      "#9e9e9e",
      "#212121",
      "#455a64",
      "#c5cae9"
    ];
    return paletteColors[Math.floor(Math.random() * paletteColors.length)];
  }

function generateTealAndOrangePalette(){
    const baseColor = "#0097a7"; // Базовый цвет teal
    const count = 5; // Количество цветов в палитре
    const colors = generateHarmoniousColors(baseColor, count);
    return colors;
}