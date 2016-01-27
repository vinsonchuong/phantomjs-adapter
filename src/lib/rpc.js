import * as childProcess from 'child_process';
import * as path from 'path';

const phantomScript = path.resolve(__dirname, 'runloop.js');

export default class {
  constructor(methods) {
    this.id = 1;
    this.outstandingMethods = {};

    this.phantomjs = childProcess.spawn('phantomjs', [phantomScript]);
    this.commandQueue = [];
    this.phantomjs.stdout.on('data', (buffer) => {
      for (const line of buffer.toString().split('\n')) {
        if (line.trim().length === 0) {
          continue;
        }
        this.receiveResult(JSON.parse(line));
      }
    });

    for (const method of Object.keys(methods)) {
      const implementation = methods[method].toString();
      const [, signature, body] = implementation.match(/\((.*)\) {([\s\S]*)}/);
      const argumentNames = signature ? signature.split(/\s*,\s*/) : [];

      this.sendMethod('defineMethod', [method, argumentNames, body]);
      this[method] = (...args) => {
        return this.sendMethod(method, args);
      };
    }
  }

  sendMethod(method, params) {
    const id = this.id++;
    const promise = new Promise((resolve) => {
      this.outstandingMethods[id] = resolve;
      this.phantomjs.stdin.write(JSON.stringify({id, method, params}) + '\n');
    });
    return promise;
  }

  receiveResult({id, result}) {
    const resolve = this.outstandingMethods[id];
    resolve(result);
  }
}
