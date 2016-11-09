"use strict";

let path = require("path");
let fs = require("./src/node_modules/fs-extra");
let packager = require("./src/node_modules/electron-packager");

const OUTPUT = path.join("D:", "entosis-helper");
const VERSION = "v" + require("./src/package.json").version;

function finalize(appPath) {
	return new Promise((resolve, reject) => {
		// Read root directory
		fs.readdir(appPath, (err, files) => {
			if(err) reject(err);
			else resolve(files);
		});
	}).then((files) => {
		// Copy all files in a subfolder
		return Promise.all(
			files.map((file) => {
				return new Promise((resolve, reject) => {
					let src = path.join(appPath, file);
					let dst = path.join(appPath, VERSION, file);
					fs.move(src, dst, (err) => {
						if(err) reject(err);
						else resolve();
					});
				});
			})
		);
	}).then(() => {
		// Create update folder
		return new Promise((resolve, reject) => {
			fs.mkdirs(path.join(appPath, "updates"), (err) => {
				if(err) return console.error(err);
				else return resolve();
			});
		});
	}).then(() => {
		// Create updates folder
		return new Promise((resolve, reject) => {
			fs.mkdirs(path.join(appPath, "updates"), (err) => {
				if(err) return console.error(err);
				else return resolve();
			});
		});
	}).then(() => {
		// Create launcher
		if(process.platform == "win32") {
    	    var exe = path.join(VERSION, "entosis-helper.exe");
    		var launcher = path.join(appPath, "start.bat");
    		var cmd = "start " + exe;
	    } else if(process.platform == "linux") {
    	    var exe = path.join(VERSION, "entosis-helper");
    		var launcher = path.join(appPath, "start.sh");
    		var cmd = "!/bin/bash\n" + exe;
	    }
	    return new Promise((resolve, reject) => {
	        fs.writeFile(launcher, cmd, "utf8", (err) => {
		        if(err) reject(err);
		        else resolve();
	        });
	    });
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