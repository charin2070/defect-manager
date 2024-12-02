class BacklogView {
    constructor(containerId) {
        this.container = containerId;
        initComponents();
    }
    
    initComponents() {
        this.container = document.getElementById(this.container);
    
    }

}