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
					resolve({
						body: response.data,
						status: response.status,
						contentType: response.headers['content-type'],
						contentLength: response.headers['content-length'],
						elapsedTime: endTime - startTime,
						timestamp: startTime,
					});
				})
				.catch(function (error) {
					let endTime = new Date().getTime();
					resolve({
						body: error.response ? error.response.data : '',
						status: error.response ? error.response.status : '',
						contentType: error.response ? error.response.headers['content-type'] : '',
						contentLength: error.response ? error.response.headers['content-length'] : '',
						elapsedTime: endTime - startTime,
						timestamp: startTime,
					});
				});
		} catch (error) {
			reject();
		}
	});
};

module.exports = {
	sendRequest,
};
