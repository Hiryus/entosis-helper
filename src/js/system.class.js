const root = require("electron").remote.app.getAppPath();
const ihm  = require(root + "/js/ihm.singleton.js");
const Node = require(root + "/js/node.class.js");

class System {
    
    constructor(name) {
        this.name = name;
        this.nodes = [];
    }
    
    destroy() {
        this.nodes.forEach((node) => node.destroy);
        ihm.getSystemDiv(this.name).detach();
        return this;
    }
    
    createNode(id) {
        let node = new Node(this.name, id);
        this.nodes.push(node);
        return node.draw();
    }
    
    deleteNode(id) {
        return this.getNode(id).then((node) => {
            return node.destroy();
        }).then((node) => {
            this.nodes = this.nodes.filter((e) => node.id != e.id);
            return this.update();
        });
    }
    
    getNode(id) {
        id = id.toUpperCase();
        let nodes = this.nodes.filter((node) => node.id == id);
        if(nodes.length > 0) return Promise.resolve(nodes[0]);
        else return this.createNode(id);
    }
    
    setNode(id, state, timer) {
        return this.getNode(id)
            .then((node) => node.setStatus(state, timer))
            .then(() => this.update())
            .then(() => this);
    }
    
    update() {
        // Compute
        let neutral = this.nodes.filter((node) => node.state == "neutral");
        let friendly = this.nodes.filter((node) => node.state == "friendly");
        let enemy = this.nodes.filter((node) => node.state == "enemy");
        // Update
        ihm.setSystemSummary(this.name, neutral.length, friendly.length, enemy.length);
        return this;
    }
    
    draw() {
        return ihm.drawSystem(this.name);
    }
    
}

module.exports = System;