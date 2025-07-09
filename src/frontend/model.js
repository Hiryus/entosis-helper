import System from './system.js';

export default class Model {
    constructor() {
        this.systems = [];
    }

    /**
     * @param {Number} delay (milliseconds)
     */
    cleanStales(delay) {
        const stales = this.systems.map((sys) => sys.cleanStales(delay)).flat();
        this.systems = this.systems.filter((sys) => sys.nodes.length > 0);
        return stales;
    }

    /**
     * @param {String} name
     */
    getSystem(name) {
        const system = this.systems.find((sys) => sys.name == name);
        if (system == null) {
            const system = new System(name);
            this.systems.push(system);
            return system;
        }
        return system;
    }

    /**
     * @param {String} name
     */
    hasSystem(name) {
        return this.systems.find((sys) => sys.name == name) != null;
    }

    /**
     * @param {String} name
     */
    rmSystem(name) {
        this.systems = this.systems.filter((sys) => sys.name !== name);
    }

    /**
     * @param {Date} reportDate
     * @param {String} systemName
     * @param {String} nodeId
     * @param {String} nodeState
     * @param {Date|null} expiration
     */
    update(reportDate, systemName, nodeId, nodeState, expiration) {
        const system = this.getSystem(systemName);
        if (system == null) {
            throw new Error(`Unknown system "${systemName}"`);
        }
        system.update(reportDate, nodeId, nodeState, expiration);
    }
}
