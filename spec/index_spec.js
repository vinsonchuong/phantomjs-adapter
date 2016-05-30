import {childProcess} from 'node-promise-es6';
import Directory from 'directory-helpers';
import {path as phantomJsPath} from 'phantomjs-prebuilt';
import PhantomJS from 'phantomjs-promise-es6';

async function phantomPids() {
  try {
    const {stdout: pids} = await childProcess.exec(`pgrep -f '${phantomJsPath}'`);
    return pids.split('\n').filter(Boolean).map(Number);
  } catch (error) {
    return null;
  }
}

describe('phantomjs-promise-es6', () => {
  it('can kill the phantomjs process', async () => {
    const browser = new PhantomJS();
    expect(await phantomPids()).toContain(browser.process.pid);
    await browser.exit();
    expect(await phantomPids()).not.toContain(browser.process.pid);
  });

  it('can open a URL', async () => {
    const directory = new Directory('temp');
    const browser = new PhantomJS();
    try {
      await directory.write({
        'index.html': `
          <!doctype html>
          <meta charset="utf-8">
          <title>Hello World!</title>
        `
      });
      await browser.open(`file://${directory.path('index.html')}`);
      expect(await browser.title()).toContain('Hello World!');
    } finally {
      await browser.exit();
      await directory.remove();
    }
  });

  xit('it can read information about a DOM element', async () => {
    const browser = new PhantomJS();
    await browser.open('https://github.com');
    const {textContent} = await browser.find('.jumbotron-title');
    expect(textContent).toBe('How people build software');
    await browser.exit();
  });
});
