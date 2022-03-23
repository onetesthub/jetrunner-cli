const { SuiteData } = require('jetRunner');
const { ValidateToken } = require('./helper');
//
const assert = require('chai').assert;
const { sendRequest: Send } = require('./sendingRequest');
const { consoleLog, GetLogger } = require('./logger/index');
const { extractVariables } = require('./environment');

// check logger by user, default to raw
let Log;

let dynamicEnv = {};
module.exports = ExecuteProject = (configArgments) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { project, env, tokenId, iteration, json, debug } = configArgments;
			const loggerType = json === true || json === 'true' ? 'json' : 'raw';
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
			if (env) {
				let envDbResponse = await suiteData.getAllEnvironments();
				if (envDbResponse.status == 'success' && envDbResponse.message == 'Data fetched') {
					envDbResponse.data.forEach((envObj) => {
						if (envObj.envName == env) {
							selectedEnvObj = envObj.data;
						}
					});
				}
			}
			// getting all root level suites
			let getAllRootSuites = await suiteData.getAllRootSuites();
			if (getAllRootSuites.status !== 'success') {
				throw { type: 'custom', message: 'Error while fetching suites' };
			}
			// Log.log({label: '95', value: 'data'});
			//we will use this validation for publish connector, May remove this piece from here and add in connector
			const tokenStatus = tokenId && (await ValidateToken(tokenId));

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
			let statusData = await Execute({ data, iteration, envObj: selectedEnvObj, projectName, debug });
			resolve(statusData);
		} catch (error) {
			consoleLog('Error: ', error)
			reject({status:"error", message: error.massage|| "Unexpected error in processing requests"});
		}
	});
};

const Execute = ({ data, iteration, envObj, projectName, debug }) => {
	return new Promise(async (resolve, reject) => {
		try {
			let totalIteration = iteration || 1;
			let iterationCounter = 1;
			let testId = new Date().getTime();

			Log.log({ label: 'TestId', value: testId });
			Log.log({ label: 'Project Name: ', value: projectName });

			while (iterationCounter <= totalIteration) {
				let requestCounter = 1;
				
				let testSummary = {
					totalRequestCount:0,
					passRequestCount:0,
					failRequestCount:0
				}
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
						let { response, assertionResult } = await sendReq_Validate(parsedRequest.req);

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
							assertionResult: assertionResult.status
						};

						//check if any assertion fails, fail the request.
						if((assertionResult.status).toLowerCase().includes('fail') && assertionResult.errorMessage){
							metricData['assertionFailureReason']= assertionResult.errorMessage;
							metricData['assertionFailureDetails'] = assertionResult.assertionFailureDetails;
							metricData['requestStatus'] = "Fail";
							Log.AssertionFail(metricData);
							testSummary.failRequestCount = testSummary.failRequestCount +1;
							
						}
						//check if any assertion passes, pass the request.
						else if((assertionResult.status).toLowerCase().includes('pass')){
							metricData['requestStatus'] = "Pass";
							Log.Pass(metricData);
							testSummary.passRequestCount = testSummary.passRequestCount +1;
						}
						//if assertion status is null
						else{
							if(metricData.statusCode >= 200 && metricData.statusCode <= 304){
								metricData['requestStatus'] = "Pass";
								Log.Pass(metricData);
								testSummary.passRequestCount = testSummary.passRequestCount +1;
							}
							else{
								metricData['requestStatus'] = "Fail";
								Log.Fail(metricData);
								testSummary.failRequestCount = testSummary.failRequestCount +1;
							}
						}
						testSummary.totalRequestCount = testSummary.totalRequestCount +1;
						requestResponseDetail[requestCounter] = {requestMetaData:metricData,assertionResult:assertionResult,request:response.request,response:response.response};
						requestCounter++;
						// request loop ends
					}
					// suite loop ends
				}
				
				consoleLog('\nTest Run Summary: \n');
				Log.PrintSummary(testSummary);

				if (debug && (debug === 'true' || debug === true)){
					Log.log({label:'Failed Request Test Run Details with Request, Response and Assertion Validations....\n',value:''});

					for(let key in requestResponseDetail){
						requestResponseDetail[key]['requestMetaData']['requestStatus'] == "Fail" && consoleLog(`Request ${requestResponseDetail[key]['requestMetaData']['count']}\n`,requestResponseDetail[key]);
					}
				}
				iterationCounter++;
				// iteration loop ends
			}
			resolve({status:"success"});
		} catch (error) {
			reject({status:"error", message: error.massage|| "Unexpected error in processing requests"});
		}
	});
};

const sendReq_Validate = (request) => {
	return new Promise(async (resolve, reject) => {
		try {
			//consoleLog('request.reqObj->', request.reqObj);
			let response = await Send(request.reqObj);
			//consoleLog('response->', response);
			//Evaluate assertion if exist
			let assertionResult = await CheckAssertion({ assertionText: request.reqObj.assertText, request, response });

			//Process run time responseExtractor if exist
			request.reqObj.responseExtractorText && (await ExtractDynamicVariables({ extractorText: request.reqObj.responseExtractorText, request, response }));

			resolve({ response, assertionResult });
		} catch (error) {
			let massage = {
				status: 'error',
				type: 'unexpected_sendReq_process_error',
				message: 'Error: ' + error.message,
			};
			reject(massage);
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
			errorDetails : []
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
							assertionResult.status = 'Assertion Pass'
							//save result of assert statements in array of object
					} catch (error) {
						let errObj = {
							assertText : assertion, failureReason: error.message, actual: error.actual, expected: error.expected, operator:error.operator
						};
						assertionResult.errorDetails.push(errObj);
						assertionResult.status = 'Assertion Fail';
						assertionResult.errorType = 'assertion_validations_failed';
						assertionResult.errorMessage = assertionResult.errorMessage? assertionResult.errorMessage +'\n' + error.message:error.message;
					}
				}
			}
			resolve(assertionResult);
		} catch (error) {
			assertionResult.status = 'Assertion Fail';
			assertionResult.errorType = 'unexpected_assertion_process_error';
			assertionResult.errorMessage = error;
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
