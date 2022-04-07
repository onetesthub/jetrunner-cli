//imports
const path = require('path');
const { FolderExists, FileExists, ReadFile } = require('./helper');
const chalk = require('chalk');
const { readFile } = require('fs');
const { consoleLog } = require('./logger');

const configFileName = `configfile.json`,
	dbEntryPoint = `metaInfo.db`;



module.exports = (args = {}) => {
	return new Promise(async (resolve, reject) => {
		try {
			let cliArguments = { ...args };
			//consoleLog('2->',cliArguments);
			const dirOfExecution = process.cwd();
			let projectPath, profileData={};
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
						throw { type: 'custom', message: 'Please specify profile using --profile <profile name>. Refer your config file.' };
					}
					cliArguments = Object.assign(profileData, args);
					resolve(cliArguments);
				}
				/*
				cliArguments.profile && delete cliArguments['profile'];
				*/
				if(await FileExists(path.join(dirOfExecution, dbEntryPoint)) && !cliArguments.project){
					cliArguments.project = dirOfExecution;
				}

				consoleLog(!cliArguments.project, !(await FolderExists(cliArguments.project)), !(await FileExists(path.join(dirOfExecution, dbEntryPoint))));
				if (!cliArguments.project && !(await FolderExists(cliArguments.project)) && !(await FileExists(path.join(dirOfExecution, dbEntryPoint)))) {
					reject( {status:'error', type: 'custom', message: chalk.red('Error: No project found ') + ',please specify full absolute project path using --project <project path> or run this command from project directory.\n' });
				}
			} catch (error) {
				const message = error && error.type && error.type == 'custom' ? error.message : ' while loading config file';
				reject({ status:'error', message: chalk.red('Error: ') + message });
			}
			resolve(cliArguments);
		} catch (error) {
			const message = error && error.type && error.type == 'custom' ? error.message : 'Unexpected error.';
			reject({ status:'error', message });
		}
	});
};
