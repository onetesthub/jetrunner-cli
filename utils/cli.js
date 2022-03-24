const meow = require('meow');
const Table = require('cli-table3');

const flags = {
	clear: {
		type: `boolean`,
		default: false,
		// alias: `c`,
		desc: `Clear the console`,
	},
	debug: {
		type: `boolean`,
		default: true,
		// alias: `d`,
		desc: `Prints parsed arguments, default true to show failed request logs`,
	},
	showAll: {
		type: 'boolean',
		// alias: 'j',
		desc: 'Display detailed log data for requests/response, default false (show only failed requests logs. works with --debug',
		default: false,
	},
	publish: {
		type: 'boolean',
		// default: false,
		desc: 'Publish data to dashboard (Jetman dashboard)',
	},
	delay: {
		type: 'number',
		// alias: 'd',
		desc: `Delay (in ms)`,
		// default: 0,
	},
	iteration: {
		type: 'number',
		// alias: 'i',
		desc: 'number of iterations to run, default 1',
		default: 1
	},
	timeout: {
		type: 'number',
		desc: `Request timeout (in ms), default 60000 ms`,
		default: 60000,
	},
	project: {
		type: 'string',
		// alias: 'p',
		desc: `Path of project to run`,
	},
	configFile: {
		type: 'string',
		// alias: 'c',
		desc: 'path of a Jetman configuration file',
	},
	env: {
		type: 'string',
		// alias: 'e',
		desc: 'Active enviroment template, if ot given default env will taken',
	},
	tokenId: {
		type: 'string',
		// alias: 't',
		desc: 'Jetman token (to publish data to dashboard)',
	},
	profile: {
		type: 'string',
		desc: 'Profile name from config file',
	},
};

let helpText = `Usage: Jetrunner-cli [options]

options: \n`;
const table = new Table({
	chars: { top: '', 'top-mid': '', 'top-left': '', 'top-right': '', bottom: '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '', left: '', 'left-mid': '', mid: '', 'mid-mid': '', right: '', 'right-mid': '', middle: ' ' },
	style: { 'padding-left': 0, 'padding-right': 2 },
});

((flags) => {
	for (const key in flags) {
		table.push([`--${key}`, flags[key].desc || '']);
	}
	helpText += table.toString();
})(flags);

const options = {
	inferType: true,
	description: false,
	hardRejection: true,
	flags,
};
module.exports = meow(helpText, options);
