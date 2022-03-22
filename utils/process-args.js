//imports
const path = require('path');
const { FolderExists, FileExists, ReadFile } = require('./helper');
const chalk = require('chalk');
const { readFile } = require('fs');

const configFileName = `configfile.json`,
	dbEntryPoint = `metaInfo.db`;

module.exports = (args = {}) => {
	return new Promise(async (resolve, reject) => {
		try {
			let cliArguments = { ...args };
			const dirOfExecution = process.cwd();
			let projectPath, profileData;
			const configFilePath = cliArguments.configFile || path.join(dirOfExecution, configFileName);
			try {
				if (await FileExists(configFilePath)) {
					const fileDataString = await ReadFile(configFilePath);
					const fileData = JSON.parse(fileDataString);
					if (Object.keys(fileData).length == 1) {
						profileData = fileData[Object.keys(fileData)[0]];
					} else if (cliArguments.profile) {
						profileData = fileData[cliArguments.profile];
						if (!profileData && !cliArguments.project) {
							throw { type: 'custom', message: `Selected profile doesn't exists` };
						}
					} else if(!cliArguments.project) {
						throw { type: 'custom', message: 'Please specify profile using --profile <profile name>' };
					}
				}
				cliArguments = { ...profileData, ...cliArguments };
				if (!cliArguments.project || !(await FolderExists(cliArguments.project)) || !(await FileExists(path.join(cliArguments.project, dbEntryPoint)))) {
					throw { type: 'custom', message: chalk.red('No project found') + ', please specify project path using --project <project path> or run this command from project directory\n Run jetrunner-cli --help for options\n' };
				}
			} catch (error) {
				const message = error && error.type && error.type == 'custom' ? error.message : ' while loading config file';
				reject({ message: chalk.red('Error: ') + message });
			}
			resolve(cliArguments);
		} catch (error) {
			const message = error && error.type && error.type == 'custom' ? error.message : 'Unexpected error.';
			reject({ message });
		}
	});
};
