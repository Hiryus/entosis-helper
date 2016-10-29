const fs          = require("fs");
const levenshtein = require('fast-levenshtein');
const root        = require("electron").remote.app.getAppPath();
const System      = require(root + "/js/system.class.js");

class Model {
    
    constructor() {
        // Systems attributes
        this.systems = [];
		this.systemNames = [];
		this.loadSystems().catch((err) => console.error(err));
        // Parsing regular expressions
        let statusList = [ "new", "friendly", "allied", "enemy", "opponent", "neutral", "unknown", "no view", "vanished", "disappeared" ];
        this.systemReg = "([a-z0-9-]+)";
        this.nodeReg = "([a-z][0-9]{2})";
        this.statusReg = "(" + statusList.map((status) => "(?:"+status+")").join("|") + ")";
    }
	
    reset() {
        this.systems.forEach((system) => system.destruct());
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
			this.systemNames = contents.split("\n").map((line) => line.trim());
		});
	}
	
	clean(str) {
        // Remove tags
        str = str.replace(/<\/?[^>]+(>|$)/g, "");
		// Remove symbols and other incorrect caracters
		str = str.replace(/[^a-z0-9-/\s]/ig, "")
		// Remove extra spaces
        return str.replace(/ {2,}/g, " ").trim();
	}
	
	checkSystem(system) {
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
            if(map[0].distance <= 2) return map[0].name;
            // Still not found ? Return null
            throw new Error("Unknown system \"" + system + "\".");
        });
	}
    
    getSystem(name) {
        return this.checkSystem(name.toUpperCase()).then((name) => {
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
    
    parse(line) {
        // Remove extra spaces, special characters, etc. in order to avoid typos
        line = this.clean(line);
        // Parse line
        let exp = new RegExp(this.systemReg + "\\s?/\\s?" + this.nodeReg + "\\s?/\\s?" + this.statusReg, "i");
        let patterns = line.match(exp);
        // Update system and nodes if it's a valid command
        if(patterns === null || patterns.length < 4) {
            return Promise.resolve(); // Nothing recognized
        } else if(patterns[3].match(/(unknown)|(no view)/i)) {
            return this.getSystem(patterns[1]).then((sys) => sys.setNode(patterns[2], null));
        } else if(patterns[3].match(/(new)|(neutral)/i)) {
            return this.getSystem(patterns[1]).then((sys) => sys.setNode(patterns[2], "neutral"));
        } else if(patterns[3].match(/(friendly)|(allied)/i)) {
            return this.getSystem(patterns[1]).then((sys) => sys.setNode(patterns[2], "friendly"));
        } else if(patterns[3].match(/(enemy)|(opponent)/i)) {
            return this.getSystem(patterns[1]).then((sys) => sys.setNode(patterns[2], "enemy"));
        } else if(patterns[3].match(/(vanished)|(disappeared)/i)) {
            return this.getSystem(patterns[1]).then((sys) => sys.deleteNode(patterns[2]));
        } else {
             // Something bad happened as we should never get here
            throw new Error("Unknown status " + patterns[3]);
        }
    }
    
}

module.exports = Model;