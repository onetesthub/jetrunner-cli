const axios = require('axios');

const sendRequest = (reqObject, timeout) => {
	return new Promise((resolve, reject) => {
		let axiosObject = {};
		let startTime = new Date().getTime();
		axiosObject['method'] = `${reqObject.type}`;
		axiosObject['url'] = `${reqObject.url}`;
		if (reqObject.params) axiosObject['params'] = reqObject.params;
		if (reqObject.headers) axiosObject['headers'] = reqObject.headers;
		if (reqObject.data) axiosObject['data'] = JSON.parse(reqObject.data);
		axiosObject['timeout'] = timeout;

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
					body: error.response.data,
					status: error.response.status,
					contentType: error.response.headers['content-type'],
					contentLength: error.response.headers['content-length'],
					elapsedTime: endTime - startTime,
					timestamp: startTime,
				});
			});
	});
};

module.exports = {
	sendRequest,
};
