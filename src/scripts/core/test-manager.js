class TestManager {
    constructor() {
        this.setupKeyBindings();
    }
    
    logStates() {
        states = {
            param: state => {
                console.log(state);
                log(this, ' [App] STATES ');
                log(localStorage, 'LOCAL STORAGE');
                log(this.refact.issues, 'ISSUES');
            log(this.refact.index, 'INDEX');
            console.log(this.refact.groupedIssues, 'GROUPED ISSUES');
            console.log(this.refact.statistics, 'STATISTICS');
            log(this.refact.state, 'STATE');
        }
    }

    return states;
}

    setupKeyBindings() {
        document.addEventListener('keydown', (event) => {
            if (event.shiftKey && ['D', 'd', 'В', 'в'].includes(event.key)) {
                console.log(this.states.param);
                return;
            }

            if (event.shiftKey && ['C', 'c', 'C', 'c'].includes(event.key)) {
                Refact.setGlobal({ process: 'cleanup_local_storage' }, 'App.setupKeyBindings');
                return;
            }
        });
    }





    static test(...args) {
        console.debug(...args);
    }
}