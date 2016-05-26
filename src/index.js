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
    const response = await this.client.send('evaluate', [functionBody]);
    return response.result;
  }

  async exit() {
    const response = await this.client.send('exit');
    return response.result;
  }

  async open(url) {
    const response = await this.client.send('open', [url]);
    return response.result;
  }
}
