const axios = require('axios');
var FormData = require('form-data');
var fs = require('fs');
const { consoleLog } = require('./logger');
const helper = require('./helper');

const sendRequest = (reqObject, timeout) => {
	return new Promise((resolve, reject) => {
		try {
			let axiosObject = {};
			axiosObject['method'] = `${reqObject.type}`;
			if (!reqObject.url.includes('http')) {
				reqObject.url = 'http://' + reqObject.url;
			}
			axiosObject['url'] = `${reqObject.url}`;
			if (reqObject.params) {
				axiosObject['params'] = reqObject.params;
			}
			if (reqObject.auth) {
				const authHeader = helper.setAuth(reqObject.auth);
				reqObject.headers ? Object.assign(reqObject.headers, authHeader) : (reqObject.headers = authHeader);
			}
			if (reqObject.headers) {
				axiosObject['headers'] = reqObject.headers;
			}

			if(reqObject['req_body_type'] === 'body_form') {
				if(axiosObject['headers']['content-type']){
					delete axiosObject['headers']['content-type']
				}
				else if(axiosObject['headers']['Content-Type']){
					delete axiosObject['headers']['Content-Type']
				}
			}
			let data;
			try {
				data = JSON.parse(reqObject.data);
			} catch (error) {
				data = reqObject.data;
				if (data) {
					if (reqObject['req_body_type'] === 'body_form') {
						let reqBody = new FormData();
						for (let key in data) {
							let value = data[key];
							reqBody.append(key, value);
						}
						data = reqBody;
					} else if (reqObject['req_body_type'] === 'request_body_editor') {
						//do nothing as it is handeled in try block.
					} else if (reqObject['req_body_type'] === 'urlencoded_form') {
						postData = Object.keys(data)
							.map(function (key) {
								return (
									encodeURIComponent(key) +
									'=' +
									encodeURIComponent(bodyData[key])
								);
							})
							.join('&');
						data = postData;
					}
				}
			}
			if (data) {
				axiosObject['data'] = data;
			}
			axiosObject['timeout'] = timeout;
			const startTime = new Date().getTime();
			axios(axiosObject)
				.then(function (response) {
					let endTime = new Date().getTime();
					response.config && delete response.config;
					response.request && delete response.request;
					resolve({
						body: response.data,
						status: response.status,
						contentType: response.headers['content-type'],
						contentLength: response.headers['content-length'],
						elapsedTime: endTime - startTime,
						timestamp: startTime,
						request: axiosObject,
						response: response,
					});
				})
				.catch(function (error) {
					//consoleLog('Error occured in Request object->');
					//console.dir(axiosObject.url,{ depth: 4 })
					if (!error.response) {
						return resolve({
							status: 'error',
							message: `Error in send request with url: ${reqObject.url}`,
						});
					}

					let endTime = new Date().getTime();
					error.response.config && delete error.response.config;
					error.response.request && delete error.response.request;
					resolve({
						body: error.response ? error.response.data : '',
						status: error.response ? error.response.status : '',
						contentType: error.response ? error.response.headers['content-type'] : '',
						contentLength: error.response ? error.response.headers['content-length'] : '',
						elapsedTime: endTime - startTime,
						timestamp: startTime,
						request: axiosObject,
						response: error.response,
					});
				});
		} catch (error) {
			resolve({
				status: 'error',
				message: 'Error in send request with having error ' + error,
			});
		}
	});
};

module.exports = {
	sendRequest,
};
