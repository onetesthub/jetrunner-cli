const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
// Checks for available update and returns an instance
const notifier = updateNotifier({
	pkg,
	updateCheckInterval: 1000 * 60 * 60 * 24 * 7, // 1 week
});

// Notify using the built-in convenience method
notifier.notify();

// `notifier.update` contains some useful info about the update
if (notifier.update) {
	console.log(notifier.update.latest);
}
