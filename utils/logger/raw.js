const chalk = require('chalk');
const sym = require('log-symbols');

const green = chalk.green;
const greenI = chalk.green.inverse;
const red = chalk.red;
const redI = chalk.red.bold.inverse;
const orange = chalk.keyword('orange');
const orangeI = chalk.keyword('orange').inverse;
const blue = chalk.blue;
const blueI = chalk.blue.inverse;
const primary = chalk.bold.underline.hex('#34D058');
const consoleLog = console.log;
console.log = () => undefined;

const Message = (options) => {
	const defaultOptions = { type: `error`, msg: `Unexpected error.` };
	const opts = { ...defaultOptions, ...options };
	const { type, msg, name } = opts;
	const printName = name ? name : type.toUpperCase();
	if (type === `success`) {
		return consoleLog(`\n${sym.success} ${green(msg)}\n`);
	}
	if (type === `warn`) {
		return consoleLog(`\n${sym.warning} ${orange(msg)}\n`);
	}
	if (type === `info`) {
		return consoleLog(`\n${sym.info} ${blue(msg)}\n`);
	}
	if (type === `error`) {
		return consoleLog(`\n${sym.error} ${red(msg)}\n`);
	}
	consoleLog(`\n${sym.error} ${red(msg)}\n`);
};

const Welcome = (projectname) => {
	consoleLog(`\n${primary('Jetman CLI')} \n`);
	projectname ? consoleLog(`Project name: ${projectname}`) : '';
};

const Pass = ({ count, method, name, suiteName, statusCode, time }) => {
	// ✔ | method | suitename | request name | time | status | assert
	consoleLog(`${sym.success} | ${count} | ${method.toUpperCase()} | ${suiteName} | ${name} | ${time + 'ms'} | ${green(statusCode)} | ${green('Assertion Pass')}`);
};

const AssertionFail = ({ count, method, suiteName, name, statusCode, time }) => {
	// count | method | suite name | request name | time | status | assert
	consoleLog(`${sym.warning} | ${count ? count : sym.warning} | ${method.toUpperCase()} | ${suiteName} | ${name} | ${time + 'ms'} | ${green(statusCode)} | ${red('Assertion Fail')}`);
};

const Fail = ({ count, method, suiteName, name, statusCode, time }) => {
	// ❌ | method | suite name | request name | time | status | assert
	consoleLog(`${sym.error} | ${count ? count : sym.error} | ${method.toUpperCase()} | ${suiteName} | ${name} | ${time ? time + 'ms' : '-'} | ${red(statusCode)} | -`);
};

const log = ({ label, value }) => {
	consoleLog(chalk.hex('#FFA500').bold(`\n${label}: ${value}`));
};

const SuiteLabel = (suiteName) => {
	consoleLog(chalk.bold(`\n Suite name: ${suiteName}\n`));
};

const PrintTableLabel = () => {
	// ❌ | method | suite name | request name | time | status | assert
	consoleLog(`Sr. no. | method | Suite name | Request name | time taken | status code | Assertion status\n`);
};

let Log = { log, Pass, Fail, AssertionFail, Message, Welcome, SuiteLabel, PrintTableLabel };

module.exports = Log;
