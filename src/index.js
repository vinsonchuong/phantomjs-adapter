import {spawn} from 'child_process';
import {path as phantomJsPath} from 'phantomjs-prebuilt';
import cssToXPath from 'css-to-xpath';
import Client from 'phantomjs-adapter/lib/client';
import findScript from 'phantomjs-adapter/lib/find-script';

export class Element {
  constructor(browser, data) {
    this.browser = browser;
    Object.assign(this, data);
  }

  async click() {
    const {top, left, width, height} = this.boundingClientRect;
    return await this.browser.sendEvent(
      'click',
      left + width / 2,
      top + height / 2
    );
  }

  async fillIn(text) {
    await this.click();
    return await this.browser.sendEvent('keypress', text);
  }
}

export default class {
  static Element = Element;
  static scriptPath = require.resolve('phantomjs-adapter/phantom');

  constructor() {
    this.process = spawn(phantomJsPath, [this.constructor.scriptPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });
    this.client = new Client(this.process);
  }

  get logs() {
    return this.client.logs;
  }

  async exit() {
    return await this.client.send('exit');
  }

  async open(url) {
    await this.client.send('open', [url]);
  }

  async evaluate(functionBody) {
    return await this.client.send('evaluate', [functionBody]);
  }

  async sendEvent(...args) {
    return await this.client.send('sendEvent', [...args]);
  }

  async title() {
    return await this.evaluate(`
      return document.title;
    `);
  }

  async find(selector, {text, wait = 0} = {}) {
    const xpath = typeof text === 'string' ?
      cssToXPath
        .parse(selector)
        .where(cssToXPath.xPathBuilder.text().contains(text))
        .toXPath() :
      cssToXPath(selector);
    const script = findScript(xpath);

    async function sleep(ms) {
      await new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    let data = await this.evaluate(script);
    let remainingWait = wait;
    while (!data && remainingWait > 0) {
      await sleep(100);
      remainingWait -= 100;
      data = await this.evaluate(script);
    }

    return data ?
      new this.constructor.Element(this, data) :
      null;
  }
}
