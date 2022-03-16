const jsonLogger = require('./json');
const rawLogger = require('./raw');

const consoleLog = console.log;
// console.log = () => undefined;

module.exports = { consoleLog, jsonLogger, rawLogger };
