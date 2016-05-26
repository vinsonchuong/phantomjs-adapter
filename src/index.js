import {spawn} from 'child_process';
import {path as phantomJsPath} from 'phantomjs-prebuilt';
import parseFunction from 'parse-function';
import Client from 'phantomjs-promise-es6/lib/client';

const phantomScriptPath = require.resolve('phantomjs-promise-es6/lib/phantom-script.js');

export default class {
  constructor() {
    this.process = spawn(phantomJsPath, [phantomScriptPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });
    this.client = new Client(this.process);
  }

  async evaluate(fn) {
    const functionBody = parseFunction(fn.toString()).body;
    return await this.client.send('evaluate', [functionBody]);
  }

  async exit() {
    return await this.client.send('exit');
  }

  async open(url) {
    return await this.client.send('open', [url]);
  }
}
