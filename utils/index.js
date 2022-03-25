const { SuiteData } = require('jetRunner');
const { ValidateToken, delayms } = require('./helper');
//
const assert = require('chai').assert;
const { sendRequest: Send } = require('./sendingRequest');
const { consoleLog, GetLogger } = require('./logger/index');
const { extractVariables } = require('./environment');
const Queue = require('./queue.js');
const { PrintWarning } = require('./logger/raw');

const publish = new Queue();

// check logger by user, default to raw
let Log;
//configArgments
let dynamicEnv = {};
module.exports = ExecuteProject = (configArgments) => {
	return new Promise(async (resolve, reject) => {
		try {
			let { project, env } = configArgments;
			const loggerType = 'raw';
			Log = GetLogger(loggerType);
			if (!project) {
				throw { type: 'custom', message: 'No project path given' };
			}
			const suiteDataRes = await new SuiteData({ projectPath: project });
			if (suiteDataRes.status !== 'success') {
				throw { type: 'custom', message: 'Not a Valid Jetman project.' };
			}
			const suiteData = suiteDataRes.data;
			await suiteData.initSuites();
			// Declaring empty object to store envinment variables
			let selectedEnvObj = {};
			// if user enter env flag then fetch environment variables

			let envDbResponse = await suiteData.getAllEnvironments();

			//consoleLog('envDbResponse->', envDbResponse);
			!env && consoleLog('Note: No env passed, Findings if any active env was selected in Jetman app..');

			let activeEnv, activeEnvObj;
			
			if (envDbResponse.status == 'success' && envDbResponse.message == 'Data fetched') {
				envDbResponse.data.forEach((envObj) => {
					if (env && envObj.envName == env) {
						selectedEnvObj = envObj.data;
						return;
					} else {
						if (envObj.isactive == true) {
							activeEnv = envObj.envName;
							activeEnvObj = envObj.data;
						}
					}
				});
			}
			if(!env && activeEnv && activeEnvObj){
				env = activeEnv;
				selectedEnvObj = activeEnvObj;
			}
			consoleLog('\nEnv name is: ', env);

			!(Object.keys(selectedEnvObj).length==0) ? consoleLog('Fetched Env params are: ',selectedEnvObj): PrintWarning('No parameters found in env object ... This could cause test to fail, please review env name.')
			// getting all root level suites
			let getAllRootSuites = await suiteData.getAllRootSuites();
			if (getAllRootSuites.status !== 'success') {
				throw { type: 'custom', message: 'Error while fetching suites' };
			}
			// Log.log({label: '95', value: 'data'});

			const testId = new Date().getTime();
			// assigning root level suites to the rootSuites variable
			let rootSuites = getAllRootSuites.data;
			selectedEnvObj = JSON.stringify(selectedEnvObj);
			// ! ---
			let projectName = project.split('/').pop();
			// todo: Log.Welcome(projectName);
			// loop on root suites and generate test file for each root suite
			let data = {};
			for (const suite of rootSuites) {
				let suiteRequests = await suiteData.getNestedSortedRequests([suite._id]);
				data[suite.suiteName] = suiteRequests;
			}
			let execAgrumentsObj = Object.assign(configArgments, { data, envObj: selectedEnvObj, projectName });
			let statusData = await Execute(execAgrumentsObj);
			resolve(statusData);
		} catch (error) {
			//consoleLog('Error: ', error);
			reject({ status: 'error', message: error.message || 'Unexpected error in processing requests' });
		}
	});
};

const Execute = ({ data, iteration, envObj, projectName, debug, showAll, timeout, delay, tokenId }) => {
	return new Promise(async (resolve, reject) => {
		try {
			let totalIteration = iteration || 1;
			let iterationCounter = 1;
			let testId = new Date().getTime();

			Log.log({ label: 'TestId', value: testId });
			Log.log({ label: 'Project Name: ', value: projectName });

			//Add logic to validate token and send metricData to queue for publish
			const tokenStatus = tokenId && (await ValidateToken(tokenId));
			if (tokenStatus && tokenStatus.status == 'success') {
				tokenId = tokenStatus.tokenId;
			} else {
				tokenId = undefined;
				consoleLog('\nNote: tokenId is Invalid, Setting token to ', tokenId);
			}
			while (iterationCounter <= totalIteration) {
				let requestCounter = 1;

				let testSummary = {
					totalRequestCount: 0,
					passRequestCount: 0,
					failRequestCount: 0,
				};
				let requestResponseDetail = {};
				// iteration loop starts
				Log.log({ label: 'Itertation', value: iterationCounter });
				consoleLog('\n');
				Log.PrintTableLabel();
				dynamicEnv = {}; // initilize dynamic vaiables
				for (const suiteName in data) {
					// suite loop starts
					for (const request of data[suiteName]) {
						// request loop starts (request on 1 suite)
						let timeStamp = new Date().getTime();
						let parsedRequest = extractVariables(request, envObj, dynamicEnv);
						let { response, assertionResult } = await sendReq_Validate(parsedRequest.req, timeout);

						delay && (await delayms(delay));

						const metricData = {
							testId: testId,
							projectName: projectName,
							suiteName: parsedRequest.suiteName,
							requestName: parsedRequest.reqName,
							method: parsedRequest.req.reqObj.type,
							url: parsedRequest.req.reqObj.url,
							elapsedTime: response.elapsedTime,
							statusCode: response.status,
							contentLength: response.contentLength,
							count: requestCounter,
							iteration: iterationCounter,
							timeStamp: timeStamp,
							assertionResult: assertionResult.status,
						};

						//check if any assertion fails, fail the request.
						if (assertionResult.status.toLowerCase().includes('fail') && assertionResult.errorMessage) {
							metricData['assertionFailureReason'] = assertionResult.errorMessage;
							//metricData['assertionFailureDetails'] = assertionResult.assertionFailureDetails;
							metricData['requestStatus'] = 'Fail';
							Log.AssertionFail(metricData);
							testSummary.failRequestCount = testSummary.failRequestCount + 1;
						}
						//check if any assertion passes, pass the request.
						else if (assertionResult.status.toLowerCase().includes('pass')) {
							metricData['requestStatus'] = 'Pass';
							Log.Pass(metricData);
							testSummary.passRequestCount = testSummary.passRequestCount + 1;
						}
						//if assertion status is null
						else {
							if (metricData.statusCode >= 200 && metricData.statusCode <= 304) {
								metricData['requestStatus'] = 'Pass';
								Log.Pass(metricData);
								testSummary.passRequestCount = testSummary.passRequestCount + 1;
							} else {
								metricData['requestStatus'] = 'Fail';
								Log.Fail(metricData);
								testSummary.failRequestCount = testSummary.failRequestCount + 1;
							}
						}
						testSummary.totalRequestCount = testSummary.totalRequestCount + 1;
						requestResponseDetail[requestCounter] = { requestMetaData: metricData, request: response.request, response: response.response, assertionResult: assertionResult };

						//Publish to queue if token is valid
						if (tokenId && publish && metricData) {
							metricData.tokenId = tokenId;
							publish.enqueue(metricData);
						}
						requestCounter++;
						// request loop ends
					}
					// suite loop ends
				}
				consoleLog('\nTest Run Summary: \n');
				Log.PrintSummary(testSummary);
				//Print request detial of request if debug is true and filter is all/fail
				if (debug && (debug === 'true' || debug === true)) {
					Log.PrintMessage('Failed Request Test Run Details with Request, Response and Assertion Validations....');
					for (let key in requestResponseDetail) {
						Log.PrintRequestDetail({ requestResponseDetail: requestResponseDetail[key], showAll }); // showAll true->all pass and fail. showAll false ->only failed requests.
					}
				}

				iterationCounter++;
				// iteration loop ends
			}
			if (tokenId && publish) {
				let handle = setInterval(function () {
					consoleLog('Checking publish queue length ', publish.length());
					if (publish.isEmpty()) {
						clearInterval(handle);
						consoleLog('Completed publishing all metrics..');
						resolve({ status: 'success' });
					}
				}, 1000);
			} else {
				resolve({ status: 'success' });
			}
		} catch (error) {
			reject({ status: 'error', message: error || 'Unexpected error in processing requests' });
		}
	});
};

const sendReq_Validate = (request, timeout) => {
	return new Promise(async (resolve, reject) => {
		try {
			//consoleLog('request.reqObj->', request.reqObj);
			let response = await Send(request.reqObj, timeout);
			consoleLog('response->', response);
			//Evaluate assertion if exist
			let assertionResult = await CheckAssertion({ assertionText: request.reqObj.assertText, request, response });

			//Process run time responseExtractor if exist
			request.reqObj.responseExtractorText && (await ExtractDynamicVariables({ extractorText: request.reqObj.responseExtractorText, request, response }));

			resolve({ response, assertionResult });
		} catch (error) {
			reject(error);
		}
	});
};

// method - name - status code - time taken - assertion
//data array object will exist if all assertion or partial assertions passes.
const CheckAssertion = ({ assertionText, request, response }) => {
	return new Promise((resolve, reject) => {
		let assertionResult = {
			status: '',
			errorType: undefined,
			errorMessage: undefined,
			errorDetails: [],
		};
		try {
			if (assertionText && (typeof assertionText).toLowerCase() !== 'string') {
				assertionResult.status = '';
				assertionResult.errorType = 'assertion_parser_error';
				assertionResult.errorMessage = 'Assertion parsing failed, Not a valid assertion text.';
				resolve(assertionResult);
			} else if (assertionText && assertionText.length) {
				const assertions = assertionText.split('\n');
				for (const assertion of assertions) {
					try {
						eval(assertion);
						assertionResult.status = 'testPassed'; //keeping it testPassed so that current dashboard can work. Later change to Assertion Pass, Assertion Pass here and in App Runner, Mkto
						//save result of assert statements in array of object
					} catch (error) {
						let errObj = {
							assertText: assertion,
							failureReason: error.message,
							actual: error.actual,
							expected: error.expected,
							operator: error.operator,
						};
						assertionResult.errorDetails.push(errObj);
						assertionResult.status = 'testFailed'; //keeping it testFailed so that current dashboard can work. Later change to Assertion Pass, Assertion Fail here and in App Runner, Mkto
						assertionResult.errorType = 'assertion_validations_failed';
						assertionResult.errorMessage = assertionResult.errorMessage ? assertionResult.errorMessage + '\n' + error.message : error.message;
					}
				}
			}
			resolve(assertionResult);
		} catch (error) {
			assertionResult.status = 'error'; //keeping it testFailed so that current dashboard can work. Later change to Assertion Pass, Assertion Fail here and in App Runner, Mkto
			assertionResult.errorType = 'unexpected_assertion_process_error';
			assertionResult.errorMessage = error;
			assertionResult.message= error,
			resolve(assertionResult);
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
			error && error.message ? message = error.message : 'Unexpected error';
			reject({ status: "error", message });
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
