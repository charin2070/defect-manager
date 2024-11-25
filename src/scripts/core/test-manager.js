// Class for testing cases
class TestManager extends EventEmitter {
    constructor() {
        super();
        this.testCount = 0;
        this.tests = {};
        this.failedTests = [];
        this.passedTests = [];

        this.runTests();

        this.init();
    }

    init() {
        this.dataManager = new DataManager("test");

        tests = {
            name: "prepareCsvData",
            function: this.dataManager.prepareCsvData.bind(this),
        }
    }
    
    test(param){
        let preparedCsvData = this.dataManager.prepareCsvData(param);
            log(preparedCsvData, '[TestManager. test] prepareCsvData');
            this.passedTests.push(param);
    }

    loadTests() {
        // Load test cases from a file or API
        // For this example, we'll just create some test cases
        this.tests.push(new Test('Test 1', () => {  
            console.log('Test 1 passed');
            this.passedTests.push('Test 1');
        }));
        this.tests.push(new Test('Test 2', () => {
            console.log('Test 2 failed');
            this.failedTests.push('Test 2');
        }));
        this.tests.push(new Test('Test 3', () => {
            console.log('Test 3 passed');
            this.passedTests.push('Test 3');
        }));
        
    
    }
}