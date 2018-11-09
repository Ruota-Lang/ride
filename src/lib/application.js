const EventEmitter = require("events");
const AppEmitter = new class extends EventEmitter {}();

module.exports = exports = {
	info: {
		name: "RIDE",
		version: "1.0.0",
		repo: "github.com/Ruota-Lang/ride"
	},
	dialogs: {
		about: `<div class="dialog-modal">
					<h1>${info.name}</h1>
					<p>version ${info.version}</p>
				</div>`
	},
	on: AppEmitter.on,
	emit: AppEmitter.emit
};
