const chalk = require('chalk');
const sym = require('log-symbols');

const green = chalk.green;
const greenI = chalk.green.inverse;
const red = chalk.hex('#ff5d53');
const redI = chalk.red.bold.inverse;
const orange = chalk.keyword('orange');
const orangeI = chalk.keyword('orange').inverse;
const blue = chalk.blue;
const blueI = chalk.blue.inverse;
const primary = chalk.bold.underline.hex('#34D058');
const greenUL = chalk.bold.underline.hex('#34D058');
const redUL = chalk.bold.underline.hex('ff5d53');
const blueUL = chalk.bold.underline.hex('#6187f9f5');
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

const Pass = ({ count, method, requestName, suiteName, statusCode, elapsedTime, assertionResult }) => {
	// ✔ | method | suitename | request name | time | status | assert
	consoleLog(`${sym.success} | ${count} | ${method.toUpperCase()} | ${suiteName} | ${requestName} | ${elapsedTime + 'ms'} | ${green(statusCode)} | ${green(assertionResult)}\n`);
};

const AssertionFail = ({ count, method, suiteName, requestName, statusCode, elapsedTime, assertionResult }) => {
	// count | method | suite name | request name | time | status | assert
	consoleLog(`${sym.error} | ${count ? count : sym.error} | ${method.toUpperCase()} | ${suiteName} | ${requestName} | ${elapsedTime + 'ms'} | ${green(statusCode)} | ${red(assertionResult)}\n`);
};

const Fail = ({ count, method, suiteName, requestName, statusCode, elapsedTime, assertionResult }) => {
	// ❌ | method | suite name | request name | time | status | assert
	consoleLog(`${sym.error} | ${count ? count : sym.error} | ${method.toUpperCase()} | ${suiteName} | ${requestName} | ${elapsedTime ? elapsedTime + 'ms' : '-'} | ${red(statusCode)} | -\n`);
};

const log = ({ label, value }) => {
	consoleLog(chalk.hex('#FFA500').bold(`\n${label}: ${value}`));
};

const SuiteLabel = (suiteName) => {
	consoleLog(chalk.bold(`\n Suite name: ${suiteName}\n`));
};

const PrintTableLabel = () => {
	// ❌ | method | suite name | request name | time | status | assert
	consoleLog(`  Sno.| method | Suite name | Request name | time taken | status code | Assertion status\n`);
};

const PrintSummary = ({ totalRequestCount, passRequestCount, failRequestCount }) => {
	// count | method | suite name | request name | time | status | assert
	consoleLog(`Total Requests: ${blueUL(totalRequestCount)}, Pass Requests: ${greenUL(passRequestCount)}, Fail Requests: ${redUL(failRequestCount)}\n`);
};

const PrintMessage = (message) => {
	consoleLog(`${orange(message)}\n`);
};
const PrintRequestDetail = ({requestResponseDetail,showAll=false}) =>{
	try{
	let {requestMetaData} = requestResponseDetail;
	requestResponseDetail['requestMetaData'] && delete requestResponseDetail['requestMetaData'];

	
		if(requestMetaData.requestStatus == 'Fail'){
			consoleLog(`sno:${redUL(requestMetaData.count)} | suite:${redUL(requestMetaData.suiteName)} | req:${redUL(requestMetaData.requestName)} | req status:${redUL(requestMetaData.requestStatus)}\n`);
			console.dir(requestResponseDetail,{ depth: 4 });
		}
		else if(requestMetaData.requestStatus == 'Pass' && showAll){
			consoleLog(`sno:${greenUL(requestMetaData.count)} | suite:${greenUL(requestMetaData.suiteName)} | req:${greenUL(requestMetaData.requestName)} | req status:${greenUL(requestMetaData.requestStatus)}\n`);
			console.dir(requestResponseDetail,{ depth: 4 });
		}
	}
	catch(error){
		consoleLog('Error occured in printing PrintRequestDetail..', error.message);
	}
}

let Log = { log, Pass, Fail, AssertionFail, Message, Welcome, SuiteLabel, PrintTableLabel, PrintSummary, PrintMessage, PrintRequestDetail };

module.exports = Log;
