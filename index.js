#!/usr/bin/env node

/**
 * Jetman-cli
 * CLI client to run Jetman projects
 *
 * @author Jetmanlabs <https://jetmanlabs.com>
 */
const init = require('./utils/init');
const cli = require('./utils/cli');
const parseArguments = require('./utils/process-args');
require('./utils/update-notifier');
const chalk = require('chalk');
const { ValidateToken } = require('./utils/helper');
const ExecuteProject = require('./utils/index');
const { consoleLog } = require('./utils/logger');

const defaultFlags = {
	clear: false,
	debug:true,
	showAll: false,
	publish: false,
	timeout: 60000,
	iteration: 1,
	tokenId:undefined,
	delay:0
}
const input = cli.input;
let flags = cli.flags
//Overwrite default flags with command line args..
flags = { ...defaultFlags, ...cli.flags };

const { clear, debug } = flags;

(async () => {
	try {
		init({ clear });
		if (input.includes(`help`)) {
			cli.showHelp(0);
		}
		let ParsedArguments = await parseArguments(flags);
		consoleLog("Project Run Time parameters are: \n", ParsedArguments);
		ExecuteProject(ParsedArguments);
	} catch (error) {
		// todo: log error
		console.log(error);
		console.log('\nRun ' + chalk.bold('jetrunner-cli --help') + ' for command line arguments\n or read docs for more information ', 'https://jetmanlabs.com/jetmanDoc/#Jetman-CLI');
		process.exit(1);
	}
})();
