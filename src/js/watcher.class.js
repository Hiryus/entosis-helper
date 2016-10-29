const fs = require("fs");

class Watcher {
    
    /*
    *   Watcher constructor
    */
    constructor(eventer) {
        this.buffer = Buffer.alloc(16*1024);
        this.eventer = eventer;
        this.fileName = null;
        this.fd = null;
    }
    
    /*
    *   manage()
    *   Watch @fileName and unwatch old file if needed.
    */
    manage(fileName) {
        this.reset().then(() => {
            this.fileName = fileName;
            return this.watch();
        }).then(() => {
            return this.process();
        });
    }
    
    /*
    *   process()
    *   Open, read and close file (called periodically).
    */
    process() {
        return this.open()
        .then(() => this.read())
        .then(() => this.close())
        .catch((err) => {
            this.eventer.emit("error", err)
            return this.close();
        });
    }
    
    /*
    *   reset()
    *   Close file and stop watching it.
    */
    reset() {
        return this.close().then(() => {
            if(this.fileName !== null) fs.unwatchFile(this.fileName);
            this.fileName = null;
            this.position = 0;
            this.data = "";
        });
    }
    
    /*
    *   watch()
    *   Watch file avery 5s. If new content, process it.
    */
    watch() {
        fs.watchFile(this.fileName, { persistent: true, interval: 5*1000 }, (curr, prev) => {
            if(curr.size > prev.size) this.process();
        });
    }
    
    /*
    *   open()
    *   Open file.
    */
    open() {
        if(this.fd !== null) return Promise.resolve(this.fd);
        else return new Promise((resolve, reject) => {
            fs.open(this.fileName, "r", (err, fd) => {
                if(err) reject(err);
                else resolve(this.fd = fd);
            });
        });
    }
    
    /*
    *   close()
    *   Close file.
    */
    close() {
        if(this.fd === null) {
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject) => {
                fs.close(this.fd, (err) => {
                    if(err) reject(err);
                    else resolve();
                });
            }).then(() => this.fd = null)
            .catch(() => this.fd = null);
        }
    }
    
    /*
    *   read()
    *   Read file and decode content.
    */
    read() {
        return new Promise((resolve, reject) => {
            fs.read(this.fd, this.buffer, 0, this.buffer.length, this.position, (err, bytesRead, buffer) => {
                if(err) return reject(err);
                this.position += bytesRead;
                resolve(bytesRead);
            });
        }).then((bytesRead) => {
            if(bytesRead > 0) {
                this.parse(this.buffer.slice(0, bytesRead));
                this.read();
            }
        });
    }
    
    /*
    *   parse()
    *   Decode content and emit "newLog" when a new line is available.
    */
    parse(chunk) {
        this.data += chunk.toString("utf16le"); // UTF16LE ? CCPls...
        let lines = this.data.split(/\r?\n/);
        if(lines.length > 1) {
            lines.forEach((line) => this.eventer.emit("newLog", line) );
            this.data = lines[lines.length-1];
        }
    }
    
}

module.exports = Watcher;