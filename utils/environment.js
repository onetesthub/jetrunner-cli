const envNameRegex = new RegExp('[${](.*?)[}]', 'g');

function flattenObject(obj) {
	// to flatten object
	let toReturn = {}; //declaring empty object
	for (let i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		if (typeof obj[i] == 'object' && obj[i] !== null) {
			let flatObject = flattenObject(obj[i]);
			for (let x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;
				toReturn[i + '.' + x] = flatObject[x];
			}
		} else toReturn[i] = obj[i];
	}
	return toReturn;
}

function unflatten(flatObj) {
	// to unflatten object
	let result = {};
	for (let i in flatObj) {
		let keys = i.split('.');
		keys.reduce(function (r, e, j) {
			return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 == j ? flatObj[i] : {}) : []);
		}, result);
	}
	return result;
}

function extractVariables(obj, envTemplateData, dynamicEnv) {
	try {
		if ((typeof envTemplateData).toLowerCase() == 'string') {
			envTemplateData = JSON.parse(envTemplateData);
		}
	} catch (error) {
		return obj;
	}
	let flattedObj = flattenObject(obj);
	if (envTemplateData) {
		for (let key in flattedObj) {
			if (flattedObj.hasOwnProperty(key)) {
				if (flattedObj[key]) {
					let replacedValue = flattedObj[key].toString().replace(envNameRegex, function (__match, __offset, __string) {
						let envVariable = __offset.split('{')[1];
						for (envKey in envTemplateData) {
							if (envKey == envVariable) {
								return envTemplateData[envKey];
							}
						}
						for (dynamicEnvKey in dynamicEnv) {
							if (dynamicEnvKey == envVariable) {
								return dynamicEnv[dynamicEnvKey];
							}
						}
						return __match;
					});
					flattedObj[key] = replacedValue;
				} else flattedObj[key];
			}
		}
	} else {
		for (let key in flattedObj) {
			if (flattedObj.hasOwnProperty(key)) {
				if (flattedObj[key]) {
					let replacedValue = flattedObj[key].toString().replace(envNameRegex, function (__match, __offset, __string) {
						let envVariable = __offset.split('{')[1];
						for (dynamicEnvKey in dynamicEnv) {
							if (dynamicEnvKey == envVariable) {
								return dynamicEnv[dynamicEnvKey];
							}
						}
						return __match;
					});
					flattedObj[key] = replacedValue;
				} else flattedObj[key];
			}
		}
	}
	let unFlattedOBj = unflatten(flattedObj);
	return unFlattedOBj;
}

module.exports = {
	extractVariables,
};
