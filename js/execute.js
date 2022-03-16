const assert = require('chai').assert;
const { sendRequest: Send } = require('./sendingRequest');
const { consoleLog, jsonLogger, rawLogger } = require('./logger/index');
const { extractVariables } = require('./environment');

// check logger by user, default to raw
let Log;
if (true) {
	Log = rawLogger;
}

let dynamicEnv = {};

module.exports = Execute = ({ data, iteration, envObj }) => {
	return new Promise(async (resolve, reject) => {
		try {
			let totalIteration = iteration || 1;
			let iterator = 1;
			let debugData = {};
			let errorLogCounter = 1;
			while (iterator <= totalIteration) {
				// iteration loop starts
				Log.log({ label: 'Itertation', value: iterator });
				Log.PrintTableLabel();
				dynamicEnv = {}; // initilize dynamic vaiables
				for (const suiteName in data) {
					// suite loop starts
					for (const request of data[suiteName]) {
						// request loop starts (request on 1 suite)
						let parsedRequest = extractVariables(request, envObj, dynamicEnv);
						let response = await sendReq(parsedRequest.req);
						const dataToLog = {
							count: errorLogCounter,
							method: parsedRequest.req.reqObj.type,
							suiteName: parsedRequest.suiteName,
							name: parsedRequest.reqName,
							statusCode: response.response.status,
							time: response.response.elapsedTime || 0,
						};
						errorLogCounter++;
						// console.error(40)
						if (dataToLog.statusCode >= 200 && dataToLog.statusCode <= 299) {
							const errorLog = response.errorLog;
							// console.error(errorLog);
							if (!errorLog || !errorLog.length) {
								// request pass && assertion pass
								Log.Pass(dataToLog);
								continue;
							}
							// request pass && assertion fail
							Log.AssertionFail(dataToLog);
							debugData[dataToLog.count] = { name: parsedRequest.reqName, errorLog };
						} else {
							// request fail
							Log.Fail(dataToLog);
							let errorLog = [`status: ${response.response.status}`, 'request:', parsedRequest.req.reqObj, 'response:', response.response ? response.response : ''];
							debugData[dataToLog.count] = { name: parsedRequest.reqName, errorLog };
						}
						// request loop ends
					}
					// suite loop ends
				}
				iterator++;
				// iteration loop ends
			}
			console.error('\nError logs');
			for (const count in debugData) {
				console.error(`\n${count}. ${debugData[count].name}`);
				for (const error of debugData[count].errorLog) {
					console.error(error);
				}
			}
			resolve();
		} catch (error) {
			console.log('18: ', error);
			const message = error && error.type == 'custom' ? error.message : 'Unexpected error';
			Log.Message({ type: 'error', msg: message });
			reject({ message });
		}
	});
};

const sendReq = (request) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await Send(request.reqObj);
			let errorLog = request.reqObj.assertText && (await CheckAssertion({ assertionText: request.reqObj.assertText, request, response }));
			request.reqObj.responseExtractorText && (await ExtractDynamicVariables({ extractorText: request.reqObj.responseExtractorText, request, response }));
			resolve({ response, errorLog });
		} catch (error) {
			console.log('error..:..', error);
			const message = error && error.type == 'custom' ? error.message : 'Unexpected error';
			reject({ message });
		}
	});
};

// method - name - status code - time taken - assertion
const CheckAssertion = ({ assertionText, request, response }) => {
	return new Promise((resolve, reject) => {
		try {
			// console.error(request);
			let errorLog = [];
			if ((typeof assertionText).toLowerCase() !== 'string') {
				throw { type: 'custom', message: 'Unknown assertion type' };
			}
			if (assertionText.length) {
				const assertions = assertionText.split('\n');
				for (const assertion of assertions) {
					try {
						// console.log = () => '';
						eval(assertion);
					} catch (error) {
						error && error.message ? errorLog.push(error.message) : 'Unexpected asserition error ';
					}
				}
			}
			resolve(errorLog);
		} catch (error) {
			const message = error && error.type == 'custom' ? error.message : 'Unexpected error';
			reject({ message });
		}
	});
};

const ExtractDynamicVariables = ({ extractorText, response, request }) => {
	return new Promise((resolve, reject) => {
		try {
			if ((typeof extractorText).toLowerCase() !== 'string') {
				throw { type: 'custom', message: 'Unknown assertion type' };
			}
			if (extractorText.length) {
				eval(extractorText);
			}
			resolve();
		} catch (error) {
			console.log('error :>> ', error);
			const message = error && error.type == 'custom' ? error.message : 'Unexpected error';
			reject({ message });
		}
	});
};

const setEnv = (key, value) => {
	try {
		dynamicEnv[key] = value;
	} catch (error) {
		consoleLog('error in setEnv()', error);
		return;
	}
};
