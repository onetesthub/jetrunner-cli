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
			Log.PrintTableLabel();
			while (iterator <= totalIteration) {
				// iteration loop starts
				Log.log({ label: 'Itertation', value: iterator });
				dynamicEnv = {}; // initilize dynamic vaiables
				for (const suiteName in data) {
					// suite loop starts
					Log.SuiteLabel(suiteName);
					for (const request of data[suiteName]) {
						// request loop starts (request on 1 suite)
						let parsedRequest = extractVariables(request, envObj, dynamicEnv);
						abc = parsedRequest;
						let response = await sendReq(parsedRequest.req);
						const dataToLog = {
							method: request.req.reqObj.type,
							name: request.reqName,
							statusCode: response.response.status,
							time: response.response.elapsedTime || 0,
						};

						if (dataToLog.statusCode >= 200 && dataToLog.statusCode <= 299) {
							if (response.response.errorLog && response.response.errorLog.length) {
								// request pass && assertion fail
								Log.AssertionFail(dataToLog);
							} else {
								// request pass && assertion pass
								Log.Pass(dataToLog);
							}
						} else {
							// request fail
							Log.Fail(dataToLog);
						}
						// request loop ends
					}
					// Log.Message({ type: 'warn', msg: 'remove later' });
					// if (true) break;
					// suite loop ends
				}
				iterator++;
				// iteration loop ends
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
			// console.table(request);
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
	console.log(assertionText);
	return new Promise((resolve, reject) => {
		try {
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
