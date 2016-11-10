const app        = require("electron").app;
const path       = require("path");
const fse        = require("fs-extra-promise");
const pRequest   = require("request-promise");
const request    = require("request");
const AdmZip     = require("adm-zip");
const dialog     = require("electron").dialog;

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
			return path.join(app.getAppPath(), "..", "tests");
		} else {
			let exePath = path.dirname(app.getPath("exe"));
			return path.join(exePath, "..");
		}
	}
	
	createDirs() {
		let dir = path.join(this.getLauncherPath(), "updates");
		return fse.ensureDirAsync(dir);
	}
	
	getZipName() {
	    return ["entosis-helper", this.release.tag_name, process.platform, process.arch ].join("-");
	}
	
	getExtractName() {
	    return ["entosis-helper", process.platform, process.arch ].join("-");
	}
	
	getZipFile() {
	    return path.join(this.getLauncherPath(), "updates", this.getZipName() + ".zip");
	}
	
	checkForUpdate() {
		return this.getReleaseInfo().then((release) => {
		    this.release = release;
			if(this.isUpToDate(this.version, release.tag_name)) return "up_to_date";
			else return this.update();
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
	    return this.createDirs()
			.then(() => this.downloadBinary())
	        .then(() => this.unzipBinary())
	        .then(() => this.updateLauncher())
	        .then(() => this.notifyUser());
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
		    // Extract binary
		    require("electron-patch-fs").patch(); // Needed for the .asar in the archive
			let zip = new AdmZip(this.getZipFile());
			zip.extractAllTo(this.getLauncherPath(), true); // /!\ Synchronous
			require("electron-patch-fs").unpatch(); // Restore .asar management
			resolve();
		}).then(() => {
		   // Rename extracted folder with the version tag
		   let oldName = path.join(this.getLauncherPath(), this.getExtractName());
		   let newName = path.join(this.getLauncherPath(), this.release.tag_name);
		   return fse.renameAsync(oldName, newName);
		});
	}
	
	updateLauncher() {
		console.log("Updating launcher...");
		if(process.platform == "win32") {
    	    let exe = path.join(".", this.release.tag_name, "entosis-helper.exe");
    		let launcher = path.join(this.getLauncherPath(), "start.bat");
    		let cmd = "start " + exe;
			return fse.writeFileAsync(launcher, cmd, "utf8");
	    } else if(process.platform == "linux") {
    	    let exe = path.join(".", this.release.tag_name, "entosis-helper");
    		let launcher = path.join(this.getLauncherPath(), "start.sh");
    		let cmd = "!/bin/bash\n" + exe;
			return fse.writeFileAsync(launcher, cmd, "utf8");
	    } else {
			return Promise.reject("Cannot update launcher: unsuported system.");
		}
	}
	
	notifyUser() {
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