const app        = require("electron").app;
const path       = require("path");
const pRequest   = require("request-promise");
const request    = require("request");
const AdmZip     = require("adm-zip");
const dialog     = require("electron").dialog;
require("electron-patch-fs").patch();
const fse        = require("fs-extra-promise");
require("electron-patch-fs").unpatch();

/*
	Directory structure:
	|- entosis-helper/
	    |- start.bat
	    |- v1.0.0/
	    |- v0.3.0/
	    |- updates/
	        |- v1.0.0.zip
	        |- v0.3.0.zip
*/

class Updater {
	
	constructor() {
		this.version = require(app.getAppPath() + "/package.json").version;
		this.release = null;
	}
	
	getLauncherPath() {
		if(app.getPath("exe").match(/src.node_modules.electron/i)) {
			// Debug mode, application not built
			return path.join(app.getPath("downloads"), "entosis-helper-autoupdate-tests");
		} else {
			let exePath = path.dirname(app.getPath("exe"));
			return path.join(exePath, "..");
		}
	}
	
	getExtractPath() {
		let extractName = ["entosis-helper", process.platform, process.arch ].join("-");
		return path.join(this.getLauncherPath(), "updates", extractName);
	}
	
	getZipFile() {
		let zipName = ["entosis-helper", this.release.tag_name, process.platform, process.arch ].join("-") + ".zip";
	    return path.join(this.getLauncherPath(), "updates", zipName);
	}
	
	cleanup() {
		console.log("Cleaning update directory...");
		let dir = path.join(this.getLauncherPath(), "updates");
		return Promise.resolve().then(() => {
			// Remove .asar archives management
		    require("electron-patch-fs").patch();
			// Create update directory
			return fse.ensureDirAsync(dir);
		}).then(() => {
			// Empty update directory
			return fse.emptyDirAsync(dir);
		}).then(() => {
			// Restore .asar management
			require("electron-patch-fs").unpatch();
		}).catch((err) => console.error(err.stack || err));
	}
	
	checkForUpdate() {
		return Promise.resolve().then(() => {
			return this.cleanup();
		}).then(() => {
			return this.getReleaseInfo();
		}).then((release) => {
		    this.release = release;
			if(this.isUpToDate(this.version, release.tag_name)) {
				console.log("Application is up to date.");
				return "up_to_date";
			} else {
				console.log("Application needs update. Starting now...");
				return this.update();
			}
		});
	}
	
	getReleaseInfo() {
		return pRequest({
			uri: "https://api.github.com/repos/ShadowRyanis/entosis-helper/releases/latest",
			headers: { "User-Agent": "entosis-helper" },
			json: true
		});
	}
	
	isUpToDate(current, latest) {
		// Remove leading "v" if needed and split into major and minor numbers
		current = (current.match(/v.+/) ? current.substr(0, current.length) : current).split(".");
		latest = (latest.match(/v.+/) ? latest.substr(0, latest.length) : latest).split(".");
		// Convert strings to numbers
		current = current.map((v) => parseInt(v));
		latest = latest.map((v) => parseInt(v));
		// Compare versions numbers
		if(latest.length !== 3) return true; 
		else if(current[0] < latest[0]) return false;
		else if(current[1] < latest[1]) return false;
		else if(current[2] < latest[2]) return false;
		else return true;
	}
	
	update() {
		console.log("Updating application...");
	    return this.cleanup()
			.then(() => this.downloadBinary())
	        .then(() => this.unzipBinary())
	        .then(() => this.setupApp())
	        .then(() => this.cleanup())
	        .then(() => this.notifyUser())
	}
	
	downloadBinary() {
		// Get the right binary url
		const url = this.release.assets.filter((pack) => {
			const exp = new RegExp(process.platform + ".*" + process.arch, "i");
			return pack.name.match(exp);
		})[0].browser_download_url;
		// Download zip
		return new Promise((resolve, reject) => {
			console.log("Downloading " + url + "...");
			request(url).pipe(fse.createWriteStream(this.getZipFile()))
				.on("finish", () => resolve("ok"))
				.on("error", (err) => reject(err));
		});
	}
	
	unzipBinary() {
		console.log("Unzipping " + this.getZipFile() + "...");
		return new Promise((resolve, reject) => {
			try {
				let dest = path.join(this.getLauncherPath(), "updates");
				require("electron-patch-fs").patch(); // Remove .asar archives management
				let zip = new AdmZip(this.getZipFile());
				zip.extractAllTo(dest, true); // /!\ Synchronous, freeze application
				require("electron-patch-fs").unpatch(); // Restore .asar management
				resolve();
			} catch(err) {
				reject(err);
			}
		});
	}
	
	setupApp() {
		console.log("Setting up application and launcher...");
		return Promise.resolve().then(() => {
			// Remove .asar archives management
			require("electron-patch-fs").patch();
		}).then(() => {
			// Read all files in update
			return fse.readdirAsync(this.getExtractPath());
		}).then((files) => {
			// Move all files in launcher folder
			return Promise.all(
				files.map((file) => {
					if(file == "updates") return Promise.resolve(); // Don't try to move this one !
					let oldName = path.join(this.getExtractPath(), file);
					let newName = path.join(this.getLauncherPath(), file);
					return fse.removeAsync(newName).then(() => fse.copyAsync(oldName, newName));
				})
			);
		}).then(() => {
			// Restore .asar management
			require("electron-patch-fs").unpatch();
		});
	}
	
	notifyUser() {
		console.log("Update complete.");
		dialog.showMessageBox({
			type: "info",
			title: "Update downloaded",
			message: "An update was successfully downloaded.\n"
				+ "Please restart the application from the launcher.",
			buttons: ["Got it"],
			defaultId: 0
		});
	}
	
}

module.exports = new Updater();