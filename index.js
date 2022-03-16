#!/usr/bin/env node
const SuiteData = require('jetRunner').SuiteData;
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const request = require('request');
const version = require('./package.json').version;
const { Command } = require('commander');
// const prettier = require('prettier');
const { rawLogger: Log } = require('./js/logger');
const Execute = require('./js/execute');

const program = new Command();

program.version(version, '--version');
program
	.option('-p, --projectPath <type>', 'Specify the path of a Jetman Project to run')
	.option('-c, --configFile <type>', 'Specify the path of a Jetman configuration file')
	.option('--profile <type>', 'Specify the object to select from Jetman configuration file')
	.option('-d, --delay <type>', 'Specify the extent of delay between requests (milliseconds)')
	.option('-t, --timeout <type>', 'Specify a timeout for request to run (milliseconds)')
	.option('-i, --iteration <type>', 'Define the number of iterations to run')
	.option('-e, --env <type>', 'Specify the project envirnment')
	.option('-v, --verbose', 'Used for debug to print entire request response')
	.option('--tokenId <type>', 'Specify tokenid for storing response data to cloud')
	.parse(process.argv);
program.on('--help', function () {
	console.log('\nExamples:');
	console.log('  $ jetrunner-cli -h');
	console.log('  $ jetrunner-cli --help');
});

// const PrettierOptions = { trailingComma: 'es5', tabWidth: 2, useTabs: true, semi: true, singleQuote: true, bracketSpacing: true, bracketSameLine: true, arrowParens: 'always', endOfLine: 'lf', printWidth: 300, quoteProps: 'as-needed', parser: 'babel' };

const cmdOptionsObj = program.opts();
let delay = 0;
let iteration = 1;
let timeout = 0;
let projectPath = '';
let environment = '';
let tokenId = null;

const execChildProcess = async () => {
	return new Promise((resolve, reject) => {
		const { exec } = require('child_process');
		const osString = process.platform === 'darwin' ? 'pwd' : process.platform === 'win32' ? 'cd' : '';
		if (!osString) {
			resolve({ status: 'failed', message: 'Unhandled OS!' });
		}
		exec(osString, async (error, stdout, stderr) => {
			if (error || stderr) {
				resolve({ status: 'failed', message: stderr.message });
			}
			let configFilePath = path.join(stdout.replace(/\r?\n|\r/, ''), 'configfile.json');
			resolve({ status: 'success', configFilePath: configFilePath });
		});
	});
};

const RunProject = async () => {
	return new Promise(async (resolve, reject) => {
		if (!projectPath || projectPath.length === 0) {
			resolve({ status: 'failed', message: 'project  path not found!' });
		}
		const suiteDataRes = await new SuiteData({
			projectPath: `${projectPath}`,
		});
		if (suiteDataRes.status === 'success' && suiteDataRes.message === 'Project successfully Bootstrapped') {
			const suiteData = suiteDataRes.data;
			await suiteData.initSuites();
			// Declaring empty object to store envinment variables
			let selectedEnvObj = {};
			// if user enter env flag then fetch environment variables
			if (environment) {
				let envDbResponse = await suiteData.getAllEnvironments();
				if (envDbResponse.status == 'success' && envDbResponse.message == 'Data fetched') {
					envDbResponse.data.forEach((envObj) => {
						if (envObj.envName == environment) {
							selectedEnvObj = envObj.data;
						}
					});
				}
			}
			// getting all root level suites
			let getAllRootSuites = await suiteData.getAllRootSuites();
			if (getAllRootSuites.status === 'success' && getAllRootSuites.message === 'Data fetched') {
				let tokenStatus = await validateToken();
				let testId = new Date().getTime();
				// assigning root level suites to the rootSuites variable
				let rootSuites = getAllRootSuites.data;
				selectedEnvObj = JSON.stringify(selectedEnvObj);
				let emptyDirectoryRes = await emptyTestDirectory();
				if (emptyDirectoryRes) {
					let projectName = projectPath.split('/').pop();
					Log.Welcome(projectName);
					// loop on root suites and generate test file for each root suite
					let data = {}; // {suitename: [requests]}
					for (const suite of rootSuites) {
						let suiteRequests = await suiteData.getNestedSortedRequests([suite._id]);
						data[suite.suiteName] = suiteRequests;
					}
					await Execute({ data, iteration, envObj: selectedEnvObj });
					resolve();
				} else {
					resolve({ status: 'failed', message: 'error while removing files from test directory!' });
				}
			}
			resolve({
				status: 'success',
				envObj: selectedEnvObj,
			});
		} else {
			resolve({
				status: 'failed',
				message: 'Project cannot Bootstrapped, Valid Jetman project not found. Try Again.....',
			});
		}
	});
};

const readFile = async (path) => {
	return new Promise((resolve, reject) => {
		fs.readFile(`${path}`, 'utf8', (err, jsonString) => {
			if (err) {
				resolve({
					status: 'failed',
					message: 'Error: ENOENT: no such file! For more imformation regarding configfile.json please visit this link : ' + chalk.greenBright('https://jetmanlabs.com/jetmanDoc/#Jetman-CLI'),
					error: err,
				});
			} else if (jsonString != undefined) {
				resolve({ status: 'success', data: JSON.parse(jsonString) });
			} else {
				resolve({
					status: 'failed',
					message: 'Empty File',
				});
			}
		});
	});
};

function validateToken() {
	if (tokenId != null) {
		return new Promise(function (resolve, reject) {
			let commonapiendpoint = 'https://api.jetmanlabs.com/api';
			request(
				{
					url: `${commonapiendpoint}/validateToken/${tokenId}`,
					method: 'GET',
					json: true,
				},
				(error, res, body) => {
					if (error && body.status == 'empty') {
						resolve({ status: 'error' });
					} else if (body.status == 'success') {
						body.userId != null ? resolve({ status: 'success', tokenId: body.tokenid, clientId: body.userId }) : resolve({ status: 'error' });
					}
				}
			);
		});
	} else {
		return { status: 'error' };
	}
}

function emptyTestDirectory() {
	return new Promise((resolve, reject) => {
		try {
			fs.readdir(path.join(__dirname, 'test'), (err, files) => {
				if (err) resolve(false);
				for (const file of files) {
					if (file === '.gitkeep') continue;
					fs.unlink(path.join(__dirname, 'test', file), (err) => {
						if (err) resolve(false);
					});
				}
			});
			resolve(true);
		} catch (error) {
			resolve(false);
		}
	});
}

(async function () {
	let fileData;

	if (cmdOptionsObj.configFile && cmdOptionsObj.configFile.length > 0) {
		let __readFileResp = await readFile(cmdOptionsObj.configFile);
		if (__readFileResp.status == 'success') {
			fileData = __readFileResp.data;
		} else if (__readFileResp.status == 'failed') {
			console.log('Error :>> ', __readFileResp);
			return;
		}
	} else {
		let __childProcess = await execChildProcess();
		if (__childProcess.status == 'success') {
			let __readFileResp = await readFile(__childProcess.configFilePath);
			if (__readFileResp.status == 'success') {
				fileData = __readFileResp.data;
			} else if (__readFileResp.status == 'failed') {
				console.log('Message :', __readFileResp.message, '\nError :', __readFileResp.error);
				return;
			}
		} else if (__childProcess.status == 'failed') {
			console.log('Error :', __childProcess.message);
			return;
		}
	}
	if (cmdOptionsObj.profile && cmdOptionsObj.profile.length > 0) {
		if (fileData) {
			let profileOption = cmdOptionsObj.profile;
			let selectedProfile = fileData[`${profileOption}`];
			if (selectedProfile.delay) delay = parseInt(selectedProfile.delay, 10);
			if (selectedProfile.iteration) iteration = parseInt(selectedProfile.iteration, 10);
			if (selectedProfile.timeout) timeout = parseInt(selectedProfile.timeout, 10);
			if (selectedProfile.projectPath) projectPath = selectedProfile.projectPath;
			if (selectedProfile.env) environment = selectedProfile.env;
			if (selectedProfile.clientId) clientId = selectedProfile.clientId;
			if (selectedProfile.tokenId) tokenId = selectedProfile.tokenId;
		} else {
			console.log('Error: no such fileData');
			return;
		}
	} else {
		console.log('Error: mention profile name you want to run , For more imformation regarding profile visit : ' + chalk.greenBright('https://jetmanlabs.com/jetmanDoc/#Jetman-CLI'));
		return;
	}
	if (cmdOptionsObj.delay) {
		delay = parseInt(cmdOptionsObj.delay, 10);
	}
	if (cmdOptionsObj.iteration) {
		iteration = parseInt(cmdOptionsObj.iteration, 10);
	}
	if (cmdOptionsObj.timeout) {
		timeout = parseInt(cmdOptionsObj.timeout, 10);
	}
	if (cmdOptionsObj.env) {
		environment = cmdOptionsObj.env;
	}
	if (cmdOptionsObj.projectPath) {
		projectPath = cmdOptionsObj.projectPath;
	}
	if (cmdOptionsObj.tokenId) {
		tokenId = cmdOptionsObj.tokenId;
	}
	await RunProject();
})();
