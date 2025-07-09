export default class Log {
    /**
     * @param {String} character
     * @param {Date} reportDate
     * @param {Date} expiration
     * @param {String} nodeId
     * @param {String} state
     * @param {String} systemName
     */
    constructor(character, reportDate, expiration, nodeId, state, systemName) {
        Object.assign(this, { character, reportDate, expiration, nodeId, state, systemName });
    }
}
