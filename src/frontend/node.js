export default class Node {
    /**
     * @param {String} id
     * @param {Date} reportDate
     * @param {String} systemName
     */
    constructor(id, reportDate, systemName) {
        if (typeof id !== 'string') {
            throw new Error(`invalid id (expecting String, got ${typeof id}): ${id}`);
        }
        if (!(reportDate instanceof Date)) {
            throw new Error(`invalid reportDate (expecting instanceof Date, got ${typeof reportDate}): ${reportDate}`);
        }
        if (typeof systemName !== 'string') {
            throw new Error(`invalid systemName (expecting String, got ${typeof systemName}): ${systemName}`);
        }

        this.id = id;
        this.expiration = null;
        this.reportDate = reportDate;
        this.state = 'neutral';
        this.systemName = systemName;
    }

    /**
     * @param {Number} delay (milliseconds)
     */
    isStale(delay) {
        if(this.expiration instanceof Date) {
            return this.expiration.getTime() + delay < Date.now();
        }
        return this.reportDate.getTime() + 5000 < Date.now();
    }

    /**
     * @param {String} state
     * @param {Date|null} expiration
     */
    update(state, expiration) {
        if(state.match(/(unknown)|(no view)/i)) {
            this.state = 'unknown';
        } else if(state.match(/(new)|(neutral)/i)) {
            this.state = 'neutral';
            this.expiration = expiration;
        } else if(state.match(/(friendly)|(allied)/i)) {
            this.state = 'friendly';
            this.expiration = expiration;
        } else if(state.match(/(enemy)|(opponent)/i)) {
            this.state = 'enemy';
            this.expiration = expiration;
        } else {
             // Something bad happened as we should never get here
            throw new Error(`Unknown state "${state}"`);
        }
    }
}
