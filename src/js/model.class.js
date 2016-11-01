const fs          = require("fs");
const levenshtein = require('fast-levenshtein');
const root        = require("electron").remote.app.getAppPath();
const System      = require(root + "/js/system.class.js");

class Model {
    
    constructor(eventer) {
        this.eventer = eventer;
        // Systems attributes
        this.systems = [];
		this.systemNames = [];
		// Events handler
		this.eventer.on("new_cmd", (log) => {
			this.update(log.system, log.node, log.state, log.time).catch((err) => {
				this.eventer.emit("error", err);
			});
		});
    }
	
    reset() {
        this.systems.forEach((system) => system.destroy());
        this.systems = [];
    }
    
	loadSystems() {
		if(this.systemNames.length != 0) return Promise.resolve();
		else return new Promise((resolve, reject) => {
			fs.readFile(root + "/data/systems.txt", "utf8", (err, contents) => {
				if(err) reject(err);
				else resolve(contents);
			});
		}).then((contents) => {
			this.systemNames = contents.split("\n").map((line) => line.trim().toUpperCase());
		});
	}
	
	checkSystem(system) {
        system = system.toUpperCase();
        return this.loadSystems().then(() => {
            // 1. Look for exact match
            if(this.systemNames.indexOf(system) != -1) return system;
            // 2. Look for match without dashes
            let matchs = this.systemNames.filter((name) => {
                return name.replace("-", "") == system.replace("-", "");
            });
            if(matchs.length > 0) return matchs[0];
            // 3. Look for partial match
            matchs = this.systemNames.filter((name) => {
                return name.substr(0, system.length) == system;
            });
            // 3. Look for partial match without dashes
            matchs = this.systemNames.filter((name) => {
                let noDash = system.replace("-", "");
                return name.replace("-", "").substr(0, noDash.length) == noDash;
            });
            if(matchs.length > 0) return matchs[0];
            // 5. Look for closest levenshtein match
            let map = this.systemNames.map((name) => ({
                name: name,
                distance: levenshtein.get(name, system)
            })).sort((a, b) => a.distance - b.distance);
            if(map[0].distance <= 1) return map[0].name;
            // Still not found ? Return null
            throw new Error("Unknown system \"" + system + "\".");
        });
	}
    
    getSystem(system) {
        return this.checkSystem(system).then((name) => {
            let systems = this.systems.filter((sys) => sys.name == name);
            if(systems.length > 0) return Promise.resolve(systems[0]);
            else return this.createSystem(name);
        });
    }
    
    createSystem(name) {
        let system = new System(name);
        this.systems.push(system);
        return system.draw().then(() => system);
    }
    
    update(system, node, state, time) {
        if(state.match(/(unknown)|(no view)/i)) {
            return this.getSystem(system).then((sys) => sys.setNode(node, null, null));
        } else if(state.match(/(new)|(neutral)/i)) {
            return this.getSystem(system).then((sys) => sys.setNode(node, "neutral", time));
        } else if(state.match(/(friendly)|(allied)/i)) {
            return this.getSystem(system).then((sys) => sys.setNode(node, "friendly", time));
        } else if(state.match(/(enemy)|(opponent)/i)) {
            return this.getSystem(system).then((sys) => sys.setNode(node, "enemy", time));
        } else if(state.match(/(vanished)|(done)|(disappeared)/i)) {
            return this.getSystem(system).then((sys) => sys.deleteNode(node));
        } else {
             // Something bad happened as we should never get here
            throw new Error("Unknown status " + patterns[3]);
        }
    }
    
}

module.exports = Model;