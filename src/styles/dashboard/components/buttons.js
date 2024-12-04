// JavaScript class for Button component
class Button {
    constructor(element) {
        this.element = element;
        this.element.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick() {
        console.log('Button clicked!');
    }
}

export default Button;
