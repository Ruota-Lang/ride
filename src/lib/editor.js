const EventEmitter = require("events");
const EditorEmitter = new class extends EventEmitter {}();

const parsers = {
	"txt": {
		whitespace: /\s+/,
		other: /\S+/
	},
	"ruo": {
		whitespace: /\s+/,
		comment: /\/\*([^\*]|\*[^\/])*(\*\/?)?|(\/\/|#)[^\r\n]*/,
		string: /"(\\.|[^"\r\n])*"?|'(\\.|[^'\r\n])*'?/,
		number: /0x[\dA-Fa-f]+|-?(\d+\.?\d*|\.\d+)/,
		keyword: /(and|as|case|catch|class|const|def|delete|die|do|else|elseif|esac|exit|extends|false|fi|finally|for|foreach|function|global|if|new|null|or|private|protected|public|published|resource|return|self|static|struct|switch|then|this|throw|true|try|var|void|while|xor)(?!\w|=)/,
		variable: /[\$\%\@](\->|\w)+(?!\w)|\${\w*}?/,
		define: /[$A-Z_a-z0-9]+/,
		op: /[\+\-\*\/=<>!]=?|[\(\)\{\}\[\]\.\|]/,
		other: /\S+/,
	}
}

module.exports = exports = {
	workspaceName: "Welcome",
	workspaceDir: "",
	open: "ride:Welcome",
	parsers: parsers,
	on: EditorEmitter.on,
	emit: EditorEmitter.emit
};
