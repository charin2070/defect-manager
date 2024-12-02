class HTMLView extends HTMLElement {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    getContainer(){
        return this.container;
    }


}