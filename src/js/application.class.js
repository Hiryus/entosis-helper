const remote       = require("electron").remote;
const dialog       = remote.dialog;
const app          = remote.app;
const root         = app.getAppPath();
const EventEmitter = require("events");
const path         = require("path");
const fse          = require("fs-extra-promise");
const $            = require("jquery");
const ihm          = require(root + "/js/ihm.singleton.js");
const Model        = require(root + "/js/model.class.js");
const Watcher      = require(root + "/js/watcher.class.js");
const Parser       = require(root + "/js/parser.class.js");

class Application {
    
    constructor() {
        // Create objects
        this.eventer = new EventEmitter();
        this.watcher = new Watcher(this.eventer);
        this.parser = new Parser(this.eventer);
        this.model = new Model(this.eventer);
        // Setup IHM
		ihm.setup(this.eventer);
        // Create events handlers
		this.eventer.on("btn_click", (event) => {
			if(event === "reset") this.model.reset();
			else if(event === "select_chat") this.changeLogFile();
		});
        // Get and read log file
        this.readLogFile("fleet");
    }
    
    changeLogFile() {
        // Show file dialog
        let file = dialog.showOpenDialog({
            title: "Change log file",
            defaultPath: path.join(app.getPath("documents"), "EVE", "logs", "Chatlogs"),
            buttonLabel: "Select",
            filters: [
                { name: "Default", extensions: ["txt"] },
                { name: "All", extensions: ["*"] }
            ],
            properties: [ "openFile" ]
        });
        // If use selected a file, watch it (it will unwatch the old one)
        if(typeof file != "undefined" && file.length > 0) {
			this.eventer.emit("info", "Loading logfile " + path.basename(file[0]));
            this.watcher.manage(file[0]);
		}
    }
    
    readLogFile(channel) {
        return this.getLogFile(channel).then((file) => {
			this.eventer.emit("info", "Loading logfile " + path.basename(file));
            this.watcher.manage(file);
        }).catch((err) => {
            eventer.emit("error", err);
        });
    }
    
    getLogFile(channel) {
        const folder = app.getPath("documents") + "/EVE/logs/Chatlogs/";
        return Promise.resolve().then(() => {
            // Read files name in folder
            return fse.readdirAsync(folder);
        }).then((files) => {
            // Filter on file name
            let regexp = new RegExp(channel + ".*", "i");
            return files.filter((name) => name.match(regexp));
        }).then((files) => {
            // Get newest log file
            return this.getNewest(folder, files);
        }).then((file) => {
            // Return path + file
            return folder + file;
        });
    }
    
    getNewest(folder, files) {
        // Get last modified date
        return Promise.all(files.map((name) => {
            return fse.statAsync(folder + name)
				.then((stats) => ({name: name, stats: stats}))
        })).then((files) => {
            // Sort by last modification date
            return files.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
        }).then((files) => {
            // Return first file name
            return files[0].name;
        });
    }
    
}

module.exports = Application;