const { getInstalledPathSync } = require('get-installed-path');
const fs = require('fs');
const pkg = require('./../package.json');
const axios = require('axios');

module.exports = {
	GetInstallationPath: () => {
		return new Promise((resolve, reject) => {
			try {
				const installationPath = getInstalledPathSync(pkg.name);
				resolve(installationPath);
			} catch (error) {
				reject();
			}
		});
	},
	FileExists: (filePath) => {
		return new Promise((resolve, reject) => {
			try {
				if (!fs.existsSync(filePath)) return resolve(false);
				let fsStats = fs.statSync(filePath);
				if (!fsStats.isFile()) return resolve(false);
				return resolve(true);
			} catch (error) {
				reject({ message: `Unexpected error while validating file path` });
			}
		});
	},
	FolderExists: (folderPath) => {
		return new Promise((resolve, reject) => {
			try {
				if (!fs.existsSync(folderPath)) return resolve(false);
				let fsStats = fs.statSync(folderPath);
				if (!fsStats.isDirectory()) return resolve(false);
				return resolve(true);
			} catch (error) {
				const message = error && error.message ? error.message : `Unexpected error while validating folder path`;
				reject({ message });
			}
		});
	},
	ReadFile: async (filePath) => {
		return new Promise((resolve, reject) => {
			try {
				fs.readFile(filePath, 'utf8', (err, data) => {
					if (err) {
						throw { type: customElements, message: 'Error while reading config file' };
					}
					resolve(data);
				});
			} catch (error) {
				const message = error && error.type && error.type == 'custom' ? error.message : 'Unexpected error while reading config file';
				reject({ message });
			}
		});
	},
	ValidateToken: (tokenId) => {
		return new Promise(async (resolve, reject) => {
			try {
				if (!tokenId) {
					throw { type: 'custom', message: 'no tokenId' };
				}
				const response = await axios.get(`https://api.jetmanlabs.com/api/validateToken/${tokenId}`);
				resolve({ tokenId: response.tokenid, clientId: response.userId });
			} catch (error) {
				console.log('error :>> ', error);
				const message = error && error.type && error.type == 'custom' ? error.message : 'Unexpected error while Validationg tokenId';
				reject({ message });
			}
		});
	},
};
