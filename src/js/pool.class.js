class Pool {
    
    /*
    *   Pool constructor
    */
    constructor() {
        this.pool = [];
        this.processing = false;
    }
    
    /*
    *   add()
    *   Add a function (@f) to the pool and process it after the others.
    *   @f must return a promise.
    */
    add(f) {
        if(typeof f != "function")
            throw new Error("Pool only accepts functions returning a promise.");
        this.pool.push(f);
        this.process();
    }
    
    /*
    *   process()
    *   Run functions one by one in added order.
    */
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