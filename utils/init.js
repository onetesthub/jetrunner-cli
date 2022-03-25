const welcome = require('cli-welcome');
const pkg = require('./../package.json');
const unhandled = require('cli-handle-unhandled');

module.exports = ({ clear = false }) => {
	unhandled();
	welcome({
		title: `Jetrunner-cli`,
		tagLine: `by Jetmanlabs`,
		description: pkg.description,
		version: pkg.version,
		bgColor: '#34D058',
		color: '#000000',
		bold: true,
		clear,
	});
};
