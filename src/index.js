import {spawn} from 'child_process';
import {path as phantomJsPath} from 'phantomjs-prebuilt';
import cssToXPath from 'css-to-xpath';
import Client from 'phantomjs-promise-es6/lib/client';

const phantomScriptPath = require.resolve('phantomjs-promise-es6/lib/phantom-script.js');

export class Element {
  constructor(browser, selector, data) {
    this.browser = browser;
    this.selector = selector;
    Object.assign(this, data);
  }

  async click() {
    const {top, left, width, height} = this.boundingClientRect;
    return await this.browser.sendEvent(
      'click',
      top + width / 2,
      left + height / 2
    );
  }

  async fillIn(text) {
    await this.click();
    return await this.browser.sendEvent('keypress', text);
  }
}

export default class {
  static Element = Element;

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

  async sendEvent(...args) {
    return await this.client.send('sendEvent', [...args]);
  }

  async title() {
    return await this.evaluate(`
      return document.title;
    `);
  }

  async find(selector, {text} = {}) {
    const xpath = Object.is(text, undefined) ?
      cssToXPath(selector) :
      cssToXPath
        .parse(selector)
        .where(cssToXPath.xPathBuilder.text().contains(text))
        .toXPath();
    const data = await this.evaluate(`
      var element = document.evaluate(
        '${xpath.replace(/'/g, "\\'")}',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      var attributes = {};
      for (var i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes[i];
        attributes[attribute.name] = attribute.value;
      }

      return {
        attributes: attributes,
        boundingClientRect: element.getBoundingClientRect(),
        textContent: element.textContent,
        value: element.value
      };
    `);
    return new this.constructor.Element(this, selector, data);
  }
}
