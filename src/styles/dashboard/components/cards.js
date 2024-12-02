// JavaScript class for Card component
class Card {
    constructor(element) {
        this.element = element;
    }

    setHeader(headerText) {
        this.element.querySelector('.card-header').textContent = headerText;
    }

    setContent(contentText) {
        this.element.querySelector('.card-content').textContent = contentText;
    }
}

export default Card;
