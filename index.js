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
	debug: true,
	showAll: false,
	publish: false,
	timeout: 60000,
	iteration: 1,
	tokenId: undefined,
	delay: 0,
};
const input = cli.input;
let flags = cli.flags;

(async () => {

	//consoleLog('cli flags raw : \n', cli.flags);
	//process flags with boolean, but parsed as string to boolean
	if(flags.clear)
		flags.clear == 'true' ? (flags.clear = true) : (flags.clear = false);
	if(flags.debug)
		flags.debug == 'true' ? (flags.debug = true) : (flags.debug= false);
	if(flags.showAll)
		flags.showAll == 'true' ? (flags.showAll = true) : (flags.showAll = false);
	if(flags.publish)
		flags.publish == 'true' ? (flags.publish = true) : (flags.publish = false);

	const { clear, debug } = flags;
	try {
		init({ clear });
		if (input.includes(`help`)) {
			cli.showHelp(0);
		}
		//consoleLog('defaultFlags->', defaultFlags);
		//consoleLog('cli flags : \n', cli.flags);
		let ParsedArguments = await parseArguments(cli.flags);
		consoleLog('--->',ParsedArguments);
		ParsedArguments = Object.assign(defaultFlags, ParsedArguments, cli.flags);
		consoleLog("Project Run Time parameters are: \n", ParsedArguments);
		ExecuteProject(ParsedArguments);
	} catch (error) {
		// todo: log error
		consoleLog('\n',error.message);
		consoleLog(' Run ' + chalk.bold('jetrunner-cli --help') + ' for command line arguments or read docs for more information ', 'https://github.com/jetmanlabs/app/wiki#Jetrunner-cli-Run-APi-suites-from-command-line\n');
		process.exit(1);
	}
})();
