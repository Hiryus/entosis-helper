const remote = require("electron").remote;
const ejs    = require("ejs");
const $      = require("jquery");

class Ihm {
	
	setup(eventer) {
		this.eventer = eventer;
        // Hide console
        $(".console").hide();
        // Window resizing
        $(window).resize(() => this.resize());
        this.resize();
        // Buttons handlers
        $("#reset_btn").click(() => {
			this.eventer.emit("btn_click", "reset")
			$(".console pre").detach()
		});
        $("#select_chat_btn").click(() => this.eventer.emit("btn_click", "select_chat"));
		$("#help_btn").click(() => $(".help").toggle(300));
        $("#console_btn").click(() => $(".console").toggle(300));
		$("#minimize_btn").click(() => remote.getCurrentWindow().minimize());
		$("#close_btn").click(() => remote.getCurrentWindow().close());
		// Logs handlers
		this.setuplogs();
		// Set version
		this.setVersion();
	}
    
    resize() {
        let height = $(window).innerHeight() - $("h1").outerHeight() - $("footer").outerHeight();
        $("section").outerHeight(height);
    }
	
	setuplogs() {
		// Errors
        this.eventer.on("error", (err) => {
            console.error(err.stack);
            $("#console_contents").append($("<pre/>").text(err.stack));
        });
		// Infos
        this.eventer.on("info", (msg) => {
            console.info(msg);
            $("#console_contents").append($("<pre/>").text(msg));
        });
		// New command parsed
        this.eventer.on("new_cmd", (cmd) => {
			let args = [ cmd.system, cmd.node, cmd.state ];
			let time = this.formatTime(cmd.time);
			if(time !== null) args.push(time.replace(/\(|\)/g, ""));
			let msg = "Notification: new command parsed '" + args.join(" / ") + "'";
            $("#console_contents").append($("<pre/>").text(msg));
            console.info(msg);
        });
	}
	
	setVersion() {
		let version = require(remote.app.getAppPath() + "/package.json").version;
		$("#version").text("v" + version);
	}
	
    getSystemDiv(system) {
        return $("#" + system + "_system")
    }
    
    drawSystem(system) {
        return new Promise((resolve, reject) => {
			// Render HTML
            ejs.renderFile(root + "/html/system.ejs", {
				system:system
			}, {cache:true}, function(err, html) {
                if(err) reject(err);
                else resolve(html);
            });
        }).then((html) => {
			// Append to DOM
            $("#system_list").append(html);
            this.getSystemDiv(system).find(".system_details").hide();
            this.getSystemDiv(system).click(() => {
				this.getSystemDiv(system).find(".system_details").toggle(200)
			});
        });
    }
	
	setSystemSummary(system, nbNeutral, nbFriendly, nbEnemy) {
        this.getSystemDiv(system).find(".nb_neutral").text(nbNeutral);
        this.getSystemDiv(system).find(".nb_friendly").text(nbFriendly);
        this.getSystemDiv(system).find(".nb_enemy").text(nbEnemy);
	}
    
    getNodeDiv(system, node) {
        return $("#" + system + "_" + node + "_node");
    }
    
    drawNode(system, node) {
        return new Promise((resolve, reject) => {
			// Render HTML
            ejs.renderFile(root + "/html/node.ejs", {
                system: system,
                node: node
            }, { cache: true }, function(err, html) {
                if(err) reject(err);
                else resolve(html);
            });
        }).then((html) => {
			// Append to DOM
            let div = this.getSystemDiv(system).find(".neutral_nodes");
            if(div.text() == "none") div.html(html);
            else div.append(html);
        });
    }
    
    moveNode(system, node, state) {
        let nodeDiv = this.getNodeDiv(system, node);
        if(state == "friendly") {
            let div = this.getSystemDiv(system).find(".friendly_nodes");
            if(div.text() == "none") div.html(nodeDiv);
            else div.append(nodeDiv);
        } else if(state == "enemy") {
            let div = this.getSystemDiv(system).find(".enemy_nodes");
            if(div.text() == "none") div.html(nodeDiv);
            else div.append(nodeDiv);
        } else {
            let div = this.getSystemDiv(system).find(".neutral_nodes");
            if(div.text() == "none") div.html(nodeDiv);
            else div.append(nodeDiv);
        }
    }
	
	formatTime(time) {
        if(time === null) {
            // Timer reset
            return null;
		} else if(time === "warmup") {
            return "(warm)";
        } else if(time instanceof Date && time > new Date()) {
            // Timer ongoing
			let diff = Math.round(Math.abs((time - new Date())/1000));
			let minutes = Math.floor(diff/60);
			let seconds = diff%60;
			return "(" + minutes + ":" + (seconds >= 10 ? seconds : "0" + seconds) + ")";
        } else if(time instanceof Date && time <= new Date()) {
            // Timer have ended
            return "(done)";
        } else {
			// Something bad appended
            return null;
        }
	}
    
    setNodeTime(system, node, time) {
		let text = this.formatTime(time);
		this.getNodeDiv(system, node).find(".node_timer").text(text);
    }
    
}

module.exports = new Ihm();