const axios = require('axios');
const { consoleLog } = require('./logger');

const sendRequest = (reqObject, timeout) => {
	return new Promise((resolve, reject) => {
		try {
			let axiosObject = {};
			axiosObject['method'] = `${reqObject.type}`;
			axiosObject['url'] = `${reqObject.url}`;
			if (reqObject.params) {
				axiosObject['params'] = reqObject.params;
			}
			if (reqObject.headers) {
				axiosObject['headers'] = reqObject.headers;
			}
			let data;
			try {
				data = JSON.parse(reqObject.data);
			} catch (error) {
				data = reqObject.data;
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
						request:axiosObject,
						response:response
					});
				})
				.catch(function (error) {
					//consoleLog('Error occured in Request object->');
					//console.dir(axiosObject.url,{ depth: 4 })
					if(!error.response){
						return resolve({
							status: "error",
							message: `Error in send request with url: ${reqObject.url}`
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
						request:axiosObject,
						response:error.response
					});
				});
		} catch (error) {
			resolve(
				{
					status: "error",
					message: "Error in send request with having error " + error
				}
			);
		}
	});
};

module.exports = {
	sendRequest,
};
