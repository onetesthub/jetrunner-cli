const request = require('request');
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
		return new Promise((resolve, reject) => {
			request(
				{
					url: `${mktoEndPoint}/api/public/es/publish`,
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					body: data,
					json: true,
				},
				(error, res, body) => {
					if (error) {
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
		console.log('\nLength of queue is :', this.elements.length);
		return this.elements.length;
	}

	print() {
		console.log('\nYour Queue is :', this.elements);
		return this.elements;
	}
};
