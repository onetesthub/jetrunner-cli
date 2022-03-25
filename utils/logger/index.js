// module.exports = { consoleLog, jsonLogger, rawLogger };
module.exports = {
	consoleLog: console.log,
	GetLogger: (type) => {
		/*if (type == 'json') {
			return (jsonLogger = require('./json'));
		}
		*/
		return (rawLogger = require('./raw'));
	},
};
