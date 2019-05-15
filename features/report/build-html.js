var reporter = require('cucumber-html-reporter');

var options = {
    theme: 'bootstrap',
    jsonFile: 'features/report/cucumber_report.json',
    output: 'features/report/cucumber_report.html',
    reportSuiteAsScenarios: true,
    launchReport: false,
    metadata: {
        "Test Environment": "Development"
    }
};

reporter.generate(options);