import EventEmitter from 'node:events';
import fs from 'node:fs';
import path from 'node:path';

export default class Watcher extends EventEmitter {
    constructor() {
        super();
        this.buffer = Buffer.alloc(16 * 1024);
        this.fileName = null;
        this.fd = null;
    }

    async getLogFile(channel, folder) {
        // Read files name in folder
        let files = await fs.promises.readdir(folder);
        files = files.map((name) => path.join(folder, name));
        // Filter on file name
        let regexp = new RegExp(channel + '.*\.txt', 'i');
        files = files.filter((name) => name.match(regexp));
        // Get last modified date
        files = await Promise.all(files.map(async (path) => {
            const stats = await fs.promises.stat(path);
            return ({ path, stats });
        }));
        // Get newest log file
        files.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
        return files[0].path;
    }

    async manage(fileName) {
        await this.reset();
        this.fileName = fileName;
        fs.watchFile(fileName, { persistent: true, interval: 5*1000 }, (curr, prev) => {
            if(curr.size > prev.size) this.process();
        });
        return this.process();
    }

    async process() {
        await this.open();
        await this.read().catch((err) => this.emit('error', err));
        await this.close();
    }

    async reset() {
        await this.close();
        if(this.fileName !== null) {
            fs.unwatchFile(this.fileName);
        }
        this.fileName = null;
        this.position = 0;
        this.data = '';
    }

    async open() {
        if(this.fd !== null) {
            return Promise.resolve(this.fd);
        } else {
            return new Promise((resolve, reject) => {
                fs.open(this.fileName, 'r', (err, fd) => {
                    if(err) reject(err);
                    else resolve(this.fd = fd);
                });
            });
        }
    }

    async close() {
        if(this.fd === null) {
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject) => {
                fs.close(this.fd, (err) => resolve());
            }).then(() => this.fd = null);
        }
    }

    async read() {
        const bytesRead = await new Promise((resolve, reject) => {
            fs.read(this.fd, this.buffer, 0, this.buffer.length, this.position, (err, bytesRead, buffer) => {
                if(err) return reject(err);
                this.position += bytesRead;
                resolve(bytesRead);
            });
        });
        if(bytesRead > 0) {
            this.parse(this.buffer.slice(0, bytesRead));
            await this.read();
        }
    }

    parse(chunk) {
        this.data += chunk.toString('utf16le'); // UTF16LE ? CCPPls...
        let lines = this.data.split(/\r?\n/);
        if(lines.length > 1) {
            lines.forEach((line) => this.emit('new_log', line) );
            this.data = lines[lines.length-1];
        }
    }
}
