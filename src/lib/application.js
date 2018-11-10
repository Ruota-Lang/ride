const EventEmitter = require("events");
const AppEmitter = new class extends EventEmitter {}();

const info = {
	name: "RIDE",
	version: "1.0.0",
	repo: "github.com/Ruota-Lang/ride"
}

module.exports = exports = {
	dialogs: {
		about: `<div class="dialog-modal">
					<h1>${info.name}</h1>
					<p>version ${info.version}</p>
				</div>`
	},
	info: info,
	on: AppEmitter.on,
	emit: AppEmitter.emit
}
