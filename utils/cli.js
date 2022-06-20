const meow = require('meow');
const Table = require('cli-table3');

const flags = {
	project: {
		type: 'string',
		desc: `Full absolute path of project to run. Relative path is not recommended.`,
	},
	delay: {
		type: 'number',
		desc: `Delay (in ms)`,
	},
	iteration: {
		type: 'number',
		desc: 'number of iterations to run, default 1',
	},
	timeout: {
		type: 'number',
		desc: `Request timeout (in ms), default 60000 ms`,
	},
	configFile: {
		type: 'string',
		desc: 'path of a Jetman configuration file',
	},
	env: {
		type: 'string',
		desc: 'Active enviroment template, if ot given default env will taken',
	},
	tokenId: {
		type: 'string',
		desc: 'Jetman token (to publish data to dashboard). Not supported at the moment.',
	},
	profile: {
		type: 'string',
		desc: 'Profile name from config file. This option works with config file having multiple profiles.',
	},
	clear: {
		type: 'string',
		desc: `Clear the console, default false`,
	},
	debug: {
		type: 'string',
		desc: `Prints parsed arguments, default true to show failed request logs, default true`,
	},
	showAll: {
		type: 'string',
		desc: 'Display detailed log data for requests/response, default false. (show only failed requests logs. works with --debug',
	},
	publish: {
		type: 'string',
		desc: 'Publish data to dashboard (Jetman dashboard). This feature is not supported yet.',
	},
	concurrency: {
		type: 'number',
		desc: 'Number of concurrent request to send',
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
