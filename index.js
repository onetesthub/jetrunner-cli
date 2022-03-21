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

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;
// process.on('unhandledRejection', error=>{
// 	console.log('....unhandledRejection....', error);
// })
(async () => {
	try {
		init({ clear });
		if (input.includes(`help`)) {
			cli.showHelp(0);
		}
		let ParsedArguments = await parseArguments(flags);
		console.log(ParsedArguments);
		ExecuteProject(ParsedArguments);
	} catch (error) {
		// todo: log error
		console.log(error.message);
		console.log('\nRun ' + chalk.bold('jetrunner-cli --help') + ' for command line arguments\n or read docs for more information ', 'https://jetmanlabs.com/jetmanDoc/#Jetman-CLI');
		process.exit(1);
	}
})();
