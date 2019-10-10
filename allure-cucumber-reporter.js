// import CucumberJSAllureFormatter from 'allure-cucumberjs';
// import AllureRuntime from 'allure-js-commons';

// export default class Reporter extends CucumberJSAllureFormatter {
//   constructor(options) {
//     super(
//       options,
//       new AllureRuntime({ resultsDir: "./allure-results" }),
//       {
//         labels: {
//           issue: [/@bug_(.*)/],
//           epic: [/@feature:(.*)/]
//         }
//       }
//     );
//   }
// }

var CucumberJSAllureFormatter = require('allure-cucumberjs').CucumberJSAllureFormatter;
var AllureRuntime = require('allure-js-commons').AllureRuntime;

function Reporter(options) {
    return new CucumberJSAllureFormatter(options,
        new AllureRuntime({ resultsDir: "./allure-results" }),
        {});
}
Reporter.prototype = Object.create(CucumberJSAllureFormatter.prototype);
Reporter.prototype.constructor = Reporter;

exports.default = Reporter;
