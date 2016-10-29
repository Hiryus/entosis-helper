class Pool {
    
    constructor() {
        this.pool = [];
        this.processing = false;
    }
    
    add(f) {
        if(typeof f != "function")
            throw new Error("Pool only accepts functions returning a promise.");
        this.pool.push(f);
        this.process();
    }
    
    process() {
        if(this.processing || this.pool.length == 0) return;
        this.processing = true;
        this.pool.shift()().then(() => {
            this.processing = false;
            this.process();
        });
    }
    
}

module.exports = Pool;