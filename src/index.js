import {spawn} from 'child_process';
import {path as phantomJsPath} from 'phantomjs-prebuilt';
import Client from 'phantomjs-promise-es6/lib/client';

const phantomScriptPath = require.resolve('phantomjs-promise-es6/lib/phantom-script.js');

export default class {
  constructor() {
    this.process = spawn(phantomJsPath, [phantomScriptPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });
    this.client = new Client(this.process);
  }

  async exit() {
    return await this.client.send('exit');
  }

  async open(url) {
    return await this.client.send('open', [url]);
  }

  async evaluate(functionBody) {
    return await this.client.send('evaluate', [functionBody]);
  }

  async title() {
    return await this.evaluate(`
      return document.title;
    `);
  }

  async find(selector) {
    return await this.evaluate(`
      var element = document.querySelector('${selector}');
      var attributes = {};
      for (var i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes[i];
        attributes[attribute.name] = attribute.value;
      }
      return {
        attributes: attributes,
        textContent: element.textContent
      };
    `);
  }
}
