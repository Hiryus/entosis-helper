const root = require("electron").remote.app.getAppPath();
const ihm  = require(root + "/js/ihm.singleton.js");

class Node {
    
    constructor(system, id) {
        this.system = system;
        this.id = id;
        this.state = "neutral";
        this.time = null;
        this.handler = null;
    }
    
    destroy() {
        this.resetTimer();
        ihm.getNodeDiv(this.system, this.id).detach();
        return this;
    }
    
    resetTimer() {
        this.time = null;
        clearInterval(this.handler);
        ihm.setNodeTime(this.system, this.id, null);
    }
    
    setStatus(state, time) {
		if(typeof state === "string" && this.state !== state && this.time !== null)
            this.resetTimer();
		if(typeof state === "string")
            this.state = state.toLowerCase();
		if(time === "warmup" || time instanceof Date)
            this.time = time;
        return this.update();
    }
    
    update() {
		// Update state
        ihm.moveNode(this.system, this.id, this.state);
		// Update time
		if(this.time === "warmup") {
			ihm.setNodeTime(this.system, this.id, this.time);
		} else if(this.time instanceof Date) {
            ihm.setNodeTime(this.system, this.id, this.time);
            this.handler = setInterval(() => {
                ihm.setNodeTime(this.system, this.id, this.time);
            }, 5000);
        }
        return this;
    }
    
    draw() {
        return ihm.drawNode(this.system, this.id).then(() => this);
    }
    
}

module.exports = Node;