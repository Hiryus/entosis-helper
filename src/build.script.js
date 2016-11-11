"use strict";

let os       = require("os");
let path     = require("path");
let fse      = require("fs-extra-promise");
let packager = require("electron-packager");

const OUTPUT = process.argv[2] || os.tmpdir();
const VERSION = "v" + require("./package.json").version;

function finalize(appPath) {
	return Promise.resolve().then(() => {
		// Read root directory
		return fse.readdirAsync(appPath)
	}).then((files) => {
		// Copy all files in a subfolder
		return Promise.all(
			files.map((file) => {
				let src = path.join(appPath, file);
				let dst = path.join(appPath, VERSION, file);
				return fse.moveAsync(src, dst);
			})
		);
	}).then(() => {
		// Create launcher
		if(process.platform == "win32") {
    	    let exe = path.join(VERSION, "entosis-helper.exe");
    		let launcher = path.join(appPath, "start.bat");
    		let cmd = "start " + exe;
			return fse.writeFileAsync(launcher, cmd, "utf8");
	    } else if(process.platform == "linux") {
    	    let exe = path.join(VERSION, "entosis-helper");
    		let launcher = path.join(appPath, "start.sh");
    		let cmd = "!/bin/bash\n" + exe;
			return fse.writeFileAsync(launcher, cmd, "utf8");
	    } else {
			return Promise.reject("Cannot update launcher: unsuported system.");
		}
	}).catch((err) => console.error(err.stack));
}

packager({
	dir: "src",
	out: OUTPUT,
	arch: ["ia32", "x64"],
	platform: ["win32", "linux"],
	asar: true,
	icon: "src/img/icon",
	overwrite: true,
	prune: true
}, (err, appPaths) => {
	if(err) console.error(err);
	appPaths.forEach((appPath) => finalize(appPath));
});