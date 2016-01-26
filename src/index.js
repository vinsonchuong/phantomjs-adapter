import * as childProcess from 'child_process';
import * as path from 'path';

const phantomScript = path.resolve(__dirname, 'phantom.js');

export default class {
  constructor() {
    this.phantomjs = childProcess.spawn('phantomjs', [phantomScript]);
    this.commandQueue = [];
    this.phantomjs.stdout.on('data', (buffer) => {
      this.receiveResponse(buffer.toString());
    });
  }

  sendCommand(command) {
    this.commandQueue.push(command);
    this.phantomjs.stdin.write(`${JSON.stringify(command)}\n`);
  }

  receiveResponse(json) {
    const command = this.commandQueue.shift();
    const response = JSON.parse(json);
    console.log(json);
  }
}
