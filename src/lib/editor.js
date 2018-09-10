const EventEmitter = require("events");

const EditorEmitter = new class extends EventEmitter {}();

module.exports = exports = {
	workspaceName: "Welcome",
	workspaceDir: "",
	open: "ride:Welcome",
	on: EditorEmitter.on,
	emit: EditorEmitter.emit
};
