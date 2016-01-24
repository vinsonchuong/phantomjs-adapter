import {childProcess} from 'node-promise-es6';

describe('phantomjs-promise-es6', () => {
  it('outputs "3...2...1...Hello World!"', async () => {
    const {stdout} = await childProcess.exec('phantomjs-promise-es6');
    expect(stdout.trim()).toBe('3...2...1...Hello World!');
  });
});
