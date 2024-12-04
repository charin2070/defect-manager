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


    ]

    testDataParser(parser, dates = null) {
        
    }
}