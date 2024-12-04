// JavaScript class for Modal component
class Modal {
    constructor(element) {
        this.element = element;
        this.closeButton = this.element.querySelector('.close');
        this.closeButton.addEventListener('click', this.close.bind(this));
    }

    open() {
        this.element.style.display = 'flex';
    }

    close() {
        this.element.style.display = 'none';
    }
}

export default Modal;
