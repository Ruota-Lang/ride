const fs = require("fs");
const remote = require("electron").remote;
const { dialog, shell } = remote;
const w = remote.getCurrentWindow();
const application = require("./lib/application");
const editor = require("./lib/editor");
const components = {
	title: document.getElementById("title"),
	altmenu: document.getElementById("altmenu"),
	sidebarContainer: document.getElementById("sidebar"),
	sidebarHandle: document.getElementById("sidebar-handle"),
	sidebarTitle: document.getElementById("sidebar-workspace"),
	sidebar: document.getElementById("sidebar-content"),
	editor: document.getElementById("editor"),
	panel: document.getElementById("panel"),
	contextContainer: document.getElementById("context"),
	dialogContainer: document.getElementById("dialog"),
	minimizeApp: document.getElementById("action-minimize"),
	maximizeApp: document.getElementById("action-maximize"),
	closeApp: document.getElementById("action-close")
}

const dialogs = {
	newApp: {
		console() { return document.createElement("div") }, // placeholder
		forms() { return document.createElement("div") } // placeholder
	},
	extensions() { return document.createElement("div") } // placeholder
}

const menus = {
	"File": {
		"New File": undefined,		// new file
		"New": undefined,			// list of new items
		"divider0": "-",			//
		"Save": undefined,			// save (but autosave tho)
		"Save As": undefined,		// save as a different file
		"divider1": "-",			//
		"Open File": undefined,		// open a file
		"Open Project": undefined,	// open a folder
		"Open Recent": undefined,	// open a recent file or project
		"divider2": "-",			//
		"Import": undefined			// copy file from another project
	},
	"Edit": {
		"Cut": undefined,	// cut to clipboard
		"Copy": undefined,	// copy to clipboard
		"Paste": undefined	// paste from clipboard
	},
	"View": {
		"Side Bar": undefined,		// toggle sidebar
		"Status Bar": undefined,	// toggle status bar
		"divider0": "-",			//
		"Editor": undefined			// toggle main editor (why did I think)
	},
	"Tools": {
		"Refresh": () => window.location.reload(),				// refresh window
		"divider0": "-",										//
		"Extensions": () => showDialog(dialogs.extensions())	// open extensions dialog
	},
	"Help": {
		"About": () => showDialog(application.dialogs.about)	// about application
	}
}

let sidebarResizing = false;
let saveTimeout;

{ // create event handlers
	editor.on("load", () => {
		updateWorkspace();
	});

	editor.on("error", (message, e) => {
		console.error(`${message}\n\t${e}`);
	});

	application.on("load", () => {
		{ // shortcuts
			{ // set context menu actions
				document.addEventListener("mouseup",  () => components.contextContainer.classList.add("hidden"));
			}

			{ // keyboard shortcuts
				document.addEventListener("keyup", (e) => {
					// context menus
					if (!components.contextContainer.classList.contains("hidden")) {
						switch (e.key.toLowerCase()) {
							case "escape": {
								hideContext();
							} break;

							case "arrowup": {
								console.log("context menu up");
							} break;

							case "arrowdown": {
								console.log("context menu down");
							} break;
						}
					return }
					
					// dialogs
					if (!components.dialogContainer.classList.contains("hidden")) {
						switch (e.key.toLowerCase()) {
							case "escape": {
								hideDialog();
							} break;
						}
					return }
				});
			}
		}

		{ // sidebar
			let handle = components.sidebarHandle;

			handle.addEventListener("mousedown", () => sidebarResizing = true);

			document.addEventListener("mousemove", (e) => {
				if (sidebarResizing) components.sidebarContainer.style.width = e.clientX + "px";
			});

			document.addEventListener("mouseup", () => sidebarResizing = false);
		}

		{ // action buttons
			components.minimizeApp.onclick = () => w.minimize();
			components.maximizeApp.onclick = () => toggleMaximize();
			components.closeApp.onclick = () => window.close();
		}

		editor.emit("load");
	});
}

function setTitle(title) {
	document.title = `${title} - ${application.info.name}`;
	components.title.innerText = `${title} - ${application.info.name}`;
}

function updateWorkspace() {
	editor.workspaceName = editor.workspaceDir != "" ? editor.workspaceDir.split("\\")[editor.workspaceDir.split("\\").length - 1] : editor.workspaceName;

	updateSidebar();
	updateEditor();

	generateMenu(menus);

	setTitle(editor.workspaceName);
}

function updateSidebar() {
	if (editor.workspaceDir != "") components.sidebar.innerHTML = generateFilelist(editor.workspaceDir);
	components.sidebarTitle.onclick = () => shell.openItem(editor.workspaceDir);
	components.sidebarTitle.innerText = editor.workspaceName;
}

function updateEditor() {
	let protocol = editor.open.split(":")[0];
	let location = editor.open.split(":"); location.shift(); location = location.join(":");
	components.editor.innerHTML = "";

	switch (protocol) {
		case "ride": {
			switch (location) {
				case "Welcome": {
					components.editor.innerHTML = `
						<div style="padding: 10vh 10vw; flex: 1; display: flex; flex-direction: column;">
							<div style="font-size: 3em; font-weight: bold; color: var(--color-font-primary);">Welcome!</div>
							<div style="padding-bottom: 0.6em; font-size: 0.8em; color: var(--color-font-secondary);">Ruota Integrated Development Enviroment, Ruota IDE</div>
							<div class="filelist no-icons">
								<div onclick="showDialog(dialogs.newApp.console())">New Console App...</div>
								<div disabled>New Forms App...</div>
								<div onclick="openProject()">Open Project...</div>
							</div>
						</div>
					`;
				} break;

				case "blank": {
					components.editor.innerHTML = `
						<div style="color: var(--color-font-secondary); font-size: 0.8em; display: flex; flex-direction: column; flex: 1;">
							<div style="display: flex; align-items: flex-end; justify-content: center; flex: 1document.createElement("div")"></div></div>
							<div style="height: 0.6em;"></div>
							<div style="display: flex; flex: 1;">
								<div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start; flex: 1;">
									<div>Open File</div>
									<div>Open Project</div>
									<div>Open Recent</div>
									<div>Toggle Terminal</div>
								</div>
								<div style="width: 0.6em;"></div>
								<div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; flex: 1;">
									<div>Ctrl+O</div>
									<div>Ctrl+Shift+O</div>
									<div>Ctrl+Alt+O</div>
									<div>Ctrl+\`</div>
								</div>
							</div>
						</div>
					`;
				} break;

				default: {
					components.editor.innerHTML = utilERRORTEMPLATE("404", "File Not Found; Internal Error");
				}
			}
		} break;

		case "file": {
			components.editor.innerHTML = "";

			let content = document.createElement("textarea");
			content.value = fs.readFileSync(location, "utf-8");

			content.style.background = "var(--color-primary)";
			content.style.margin = "0.5em";
			content.style.color = "var(--color-font-primary)";
			content.style.flex = "1";
			content.style.border = "none";
			content.style.outline = "none";

			content.oninput = () => {
				clearTimeout(saveTimeout);
				saveTimeout = setTimeout(() =>
					fs.writeFile(location, content.value, (e) => { if (e) editor.emit("error", "While Running Auto-Save", e) })
				, 500);
			}

			components.editor.appendChild(content);
		} break;

		default: {
			components.editor.innerHTML = utilERRORTEMPLATE("-1", "Bad Request; Invalid Protocol");
		}
	}
}

function showDialog(dialog) {
	if (dialog != "") {
		if (typeof dialog == "string") {
			components.dialogContainer.innerHTML = dialog
		} else {
			components.dialogContainer.innerHTML = "";
			components.dialogContainer.appendChild(dialog);
		}
	}
	components.dialogContainer.classList.remove("hidden");
}

function hideDialog() {
	components.dialogContainer.classList.add("hidden");
}

function spawnContext(menu, x, y) {
	components.contextContainer.innerHTML = "";

	Object.keys(menu).forEach((item) => {
		let button = document.createElement("div");
		
		if (menu[item] == "-") {
			button.classList.add("divider");
		} else {
			button.classList.add("context-item");
			button.innerText = item;
			button.onmouseup = typeof menu[item] == "object" ? undefined /* open child submenu */ : menu[item];
		}

		components.contextContainer.appendChild(button);
	});

	components.contextContainer.style.left = `${x}px`;
	components.contextContainer.style.top = `${y}px`;

	components.contextContainer.classList.remove("hidden");
}

function hideContext() {
	components.contextContainer.classList.add("hidden");
}

function generateMenu(menu) {
	components.altmenu.innerHTML = "";

	Object.keys(menu).forEach((item) => {
		let button = document.createElement("div"); components.altmenu.appendChild(button);
		button.classList.add("menu-item", "button-small");
		button.innerText = item;
		button.addEventListener("click", (e) => spawnContext(menu[item], button.offsetLeft, button.offsetTop + button.clientHeight));
	});
}

function generateFilelist(p) {
	const path = process.platform == "win32" ? p.endsWith("\\") ? p : p + "\\" : p.endsWith("/") ? p : p + "/";
	let files = "";
	let folders = "";

	fs.readdirSync(path).forEach((f) => {
		let stats = fs.statSync(path + f);
		if (stats.isFile()) {
			let extension = f.split(".")[f.split(".").length - 1]; if (extension.includes(" ")) extension = "";

			files += `<div onclick='editor.open = "file:${path.replace(/\\/g, "\\\\")}${f}"; updateEditor()'`;
			files += ` class="${extension == "" ? "" : "file-extension-" + extension}"`;
			files += `>${f}</div>`;
		} else
			folders += `<div class="folder">${f}</div>`;
	});

	return `${folders}\n${files}`;
}

function toggleMaximize() {
	if (w.isMaximized()) {
		components.maximizeApp.classList.add("button-maximize");
		components.maximizeApp.classList.remove("button-maximized");
		w.unmaximize();
	} else {
		components.maximizeApp.classList.add("button-maximized");
		components.maximizeApp.classList.remove("button-maximize");
		w.maximize();
	}
}

function openProject(p = undefined) {
	if (p) {
		open(p);
	} else {
		dialog.showOpenDialog({
			title: "Select Project/Directory",
			message: "Select Project/Directory", // macOS
			properties: [
				"openDirectory",
				"createDirectory" // macOS
			]
		}, (path) => {
			if (!path) return;
			open(path[0]);
		});
	}

	function open(path) {
		if (fs.existsSync(path)) {
			editor.workspaceDir = path;
			editor.open = "ride:blank";
			updateWorkspace();
		} else {
			console.error("oh no the thing doesn't do\nyou should really tell the user that it didn't\nmaybe in the form of a dialog\n\n...just a thought...");
		}
	}
}

function utilDIALOGTEMPLATE(body) {
	if (typeof body == "string") {
		return `<div class="dialog>${body}</div>`;
	} else {
		let outer = document.createElement("div");
		outer.classList.add("dialog");
		outer.appendChild(body);
	}
}

function utilERRORTEMPLATE(code = "404", details = "Missing File") {
	return `
		<div style="padding: 10vh 10vw; flex: 1; display: flex; flex-direction: column;">
			<div style="font-size: 3em; font-weight: bold; color: #f44336;">error ${code}</div>
			<div style="font-size: 1em; color: var(--color-font-primary);">${details.toLowerCase()}</div>
			<div style="font-size: 0.8em; color: var(--color-font-secondary);">if you do not know how this error occured, ask on the <a href="https://${application.info.repo}/issues">GitHub issues page</a>.</div>
		</div>
	`;
}

// begin
application.emit("load");
