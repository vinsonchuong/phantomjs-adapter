import {childProcess} from 'node-promise-es6';
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
    const browser = new PhantomJS();
    await browser.open('https://github.com');
    expect(await browser.evaluate(() => document.title)).toContain('GitHub');
    await browser.exit();
  });
});
