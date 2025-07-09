import Node from './node.js';

export default class System {
    /**
     * @param {String} name
     */
    constructor(name) {
        if (typeof name !== 'string') {
            throw new Error(`invalid name (expecting String, got ${typeof name}): ${name}`);
        }
        this.name = name;
        this.nodes = [];
    }

    /**
     * @param {Number} delay (milliseconds)
     */
    cleanStales(delay) {
        const stales = this.nodes.filter((node) => node.isStale(delay));
        this.nodes = this.nodes.filter((node) => !node.isStale(delay));
        return stales;
    }

    getSummary() {
        const neutral = this.nodes.filter((node) => node.state == 'neutral').length;
        const friendly = this.nodes.filter((node) => node.state == 'friendly').length;
        const enemy = this.nodes.filter((node) => node.state == 'enemy').length;
        return { neutral, friendly, enemy };
    }

    /**
     * @param {String} id
     */
    getNode(id, reportDate) {
        const node = this.nodes.find((node) => node.id == id.toUpperCase());
        if (node == null) {
            const node = new Node(id, reportDate, this.name);
            this.nodes.push(node);
            return node;
        }
        return node;
    }

    /**
     * @param {String} id
     */
    rmNode(id) {
        this.nodes = this.nodes.filter((node) => node.id !== id);
    }

    /**
     * @param {Date} reportDate
     * @param {String} nodeId
     * @param {String} nodeState
     * @param {Date|null} expiration
     */
    update(reportDate, nodeId, nodeState, expiration) {
        if(nodeState.match(/(vanished)|(done)|(disappeared)/i)) {
            this.rmNode(nodeId);
            return;
        }
        const node = this.getNode(nodeId, reportDate);
        node.update(nodeState, expiration);
    }
}
