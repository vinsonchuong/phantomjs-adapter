import * as childProcess from 'child_process';
import Observable from 'phantomjs-promise-es6/lib/observable';

xdescribe('PhantomJS RPC Script', () => {
  it('echos stdin to stdout', async () => {
    const scriptPath = require.resolve('phantomjs-promise-es6/lib/phantomjs-rpc');
    const phantomjs = childProcess.spawn('phantomjs', [scriptPath]);
    const observable = new Observable((produce) => {
      server.stdout.on('data', produce);
    });
  });
});
