import {childProcess} from 'node-promise-es6';
import {path as phantomJsPath} from 'phantomjs-prebuilt';
import PhantomJS from 'phantomjs-promise-es6';

async function sleep(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function phantomPid() {
  try {
    const {stdout: pid} = await childProcess.exec(`pgrep -f '${phantomJsPath}'`);
    return pid.trim();
  } catch (error) {
    return null;
  }
}

describe('phantomjs-promise-es6', () => {
  describe('#exit', () => {
    fit('kills the phantomjs process', async () => {
      const browser = new PhantomJS();
      const pid = await phantomPid();
      expect(pid).not.toBeNull();
      process.stdout.write(`${pid}\n`);

      await browser.exit();
      await sleep(1000);
      expect(await phantomPid()).toBeNull();
    });
  });
});
