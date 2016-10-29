const ejs = require("ejs");
const $ = require("jquery");

class System {
    
    constructor(name) {
        this.name = name;
        this.nodes = [];
    }
    
    destruct() {
        $("#" + this.name + "_system").detach();
    }
    
    createNode(id) {
        let node = { id: id, state: "neutral" };
        this.nodes.push(node);
        return node;
    }
    
    deleteNode(id) {
        id = id.toUpperCase();
        this.nodes = this.nodes.filter((node) => node.id != id);
        this.update();
    }
    
    getNode(id) {
        id = id.toUpperCase();
        let nodes = this.nodes.filter((node) => node.id == id);
        if(nodes.length > 0) return nodes[0];
        else return this.createNode(id);
    }
    
    setNode(id, state) {
        let node = this.getNode(id);
		if(state != null) node.state = state;
        this.update();
    }
    
    update() {
        function formatNodes(list) {
            if(list.length > 0) return list.map((node) => node.id).join(", ");
            else return "none";
        }
        let neutral = this.nodes.filter((node) => node.state == "neutral");
        let friendly = this.nodes.filter((node) => node.state == "friendly");
        let enemy = this.nodes.filter((node) => node.state == "enemy");
        // System summary
        $("#" + this.name + "_system .nb_neutral").text(neutral.length);
        $("#" + this.name + "_system .nb_friendly").text(friendly.length);
        $("#" + this.name + "_system .nb_enemy").text(enemy.length);
        // System details
        $("#" + this.name + "_neutral_nodes").text(formatNodes(neutral));
        $("#" + this.name + "_friendly_nodes").text(formatNodes(friendly));
        $("#" + this.name + "_enemy_nodes").text(formatNodes(enemy));
    }
    
    draw() {
        return new Promise((resolve, reject) => {
            ejs.renderFile(root + "/html/system.ejs", {
                system: this.name
            }, function(err, html) {
                if(err) reject(err);
                else resolve(html);
            });
        }).then((html) => {
            $("#system_list").append(html);
            $("#" + this.name + "_system .system_details").hide();
            $("#" + this.name + "_system").click(() => {
                $("#" + this.name + "_system .system_details").toggle(200);
            });
        });
    }
    
}

module.exports = System;