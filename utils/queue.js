const request = require('request');
const { consoleLog } = require('./logger');
const mktoEndPoint = 'https://jetmanlabs.com';

module.exports = class Queue {
	constructor() {
		this.elements = [];
	}

	enqueue(e) {
		return new Promise(async (resolve, reject) => {
			this.elements.push(e);
			let dequeueRes = await this.dequeue();
			resolve(dequeueRes);
		});
	}

	dequeue() {
		let data = this.elements.shift();
		//consoleLog(data);
		if((typeof data).toLocaleLowerCase() == 'object'){
			data = JSON.stringify(data);
		}
		return new Promise((resolve, reject) => {
			request(
				{
					url: `${mktoEndPoint}/api/public/es/publish`,
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					body: data,
				},
				(error, res, body) => {
					if (error) {
						consoleLog('Error in publishing...')
						resolve(false);
					}
					resolve(true);
				}
			);
		});
	}

	isEmpty() {
		return this.elements.length == 0;
	}

	length() {
		return this.elements.length;
	}

	print() {
		return this.elements;
	}
};
