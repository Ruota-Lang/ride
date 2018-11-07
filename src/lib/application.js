const EventEmitter = require("events");

const AppEmitter = new class extends EventEmitter {}();

const dialogs = {
	about: "<null-null></null-null>"
}

module.exports = exports = {
	name: "RIDE",
	repo: "github.com/Ruota-Lang/ride",
	dialogs: dialogs,
	on: AppEmitter.on,
	emit: AppEmitter.emit
};
