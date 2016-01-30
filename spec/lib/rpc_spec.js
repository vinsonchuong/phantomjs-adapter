import RPC from 'phantomjs-promise-es6/lib/rpc';
import {childProcess} from 'node-promise-es6';

describe('RPC', () => {
  it('supports defining and running commands in PhantomJS', async () => {
    const {stdout: phantomVersion} = await childProcess.exec('phantomjs -v');

    /* eslint-disable */
    const rpc = new RPC({
      version() {
        return [
          phantom.version.major,
          phantom.version.minor,
          phantom.version.patch
        ].join('.');
      },

      sum(num1, num2, num3) {
        return num1 + num2 + num3;
      }
    });
    /* eslint-enable */

    expect(await rpc.version()).toBe(phantomVersion.trim());
    expect(await rpc.sum(3, 5, 7)).toBe(15);
  });
});
