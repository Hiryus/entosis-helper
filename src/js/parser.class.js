class Parser {
	
    constructor(eventer) {
        this.eventer = eventer;
		this.eventer.on("new_log", (line) => this.parse(line));
        // Parsing regular expressions
        let statusList = [ "new", "friendly", "allied", "enemy", "opponent",
			"neutral", "unknown", "no view", "vanished", "done", "disappeared" ];
        this.systemReg = "([a-z0-9-]+)";
        this.nodeReg = "([a-z][0-9]{2})";
        this.statusReg = "(" + statusList.map((status) => "(?:"+status+")").join("|") + ")";
        this.timerReg = "((?:warmup)|(?:[0-9]+.[0-9]+))";
    }
	
	clean(str) {
        // Remove tags
        str = str.replace(/<\/?[^>]+(>|$)/g, "");
		// Remove symbols and other incorrect caracters
		str = str.replace(/[^a-z0-9:/\s-]/ig, "")
		// Remove extra spaces
        return str.replace(/ {2,}/g, " ").trim();
	}
    
    parse(line) {
        // Remove extra spaces, special characters, etc. in order to avoid typos
        line = this.clean(line);
        // Parse line. Ex: DO6-HQ / D66 / friendly / 55:00
        let exp = new RegExp( this.systemReg + "\\s?/\\s?" + this.nodeReg
            + "\\s?/\\s?" + this.statusReg+ "(?:\\s?/\\s?" + this.timerReg + ")?", "i");
        let patterns = line.match(exp);
        // Check results
        if(patterns === null || patterns.length < 4) return Promise.resolve(); // Nothing recognized
        if(line.match(/EVE System Channel MOTD/i)) return Promise.resolve(); // Don't parse MOTD
        // Emit results
		this.eventer.emit("new_cmd", {
			system: patterns[1],
			node: patterns[2],
			state: patterns[3],
			time: this.parseTime(patterns[4])
		});
    }
    
    parseTime(str) {
		// Check and parse string
		if(typeof str !== "string") return null;
		if(str === "warmup") return "warmup";
        let patterns = str.match(/([0-9]+).([0-9]+)/i);
		if(patterns === null) return null;
		// Build date object
        let date = new Date();
        date.setSeconds(date.getSeconds() + parseInt(patterns[2]));
        date.setMinutes(date.getMinutes() + parseInt(patterns[1]));
        return date;
    }
    
}

module.exports = Parser;