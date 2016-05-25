import {spawn} from 'child_process';
import {path as phantomJsPath} from 'phantomjs-prebuilt';
import Client from 'phantomjs-promise-es6/lib/client';

const phantomScriptPath = require.resolve('phantomjs-promise-es6/lib/phantom-script.js');

export default class {
  constructor() {
    this.client = new Client(spawn(phantomJsPath, [phantomScriptPath]));
  }

  async exit() {
    await this.client.send('exit');
  }
}
