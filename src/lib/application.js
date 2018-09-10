const EventEmitter = require("events");

const AppEmitter = new class extends EventEmitter {}();

module.exports = exports = {
	name: "RIDE",
	repo: "github.com/Ruota-Lang/ride",
	on: AppEmitter.on,
	emit: AppEmitter.emit
};
