import * as path from 'path';
import {childProcess, fs} from 'node-promise-es6';
import * as fse from 'fs-extra-promise-es6';
import RPCClient from 'phantomjs-promise-es6/lib/rpc-client';

const scriptPath = path.resolve('phantom-script.js');
const script = `
'use strict';
var system = require('system');
var request;
while (true) {
  system.stdout.writeLine(JSON.stringify({
    result: JSON.parse(system.stdin.readLine())
  }));
}
`;

describe('RPCClient', () => {
  beforeEach(async () => {
    await fs.writeFile(scriptPath, script);
  });

  afterEach(async () => {
    await fse.remove(scriptPath);
  });

  it('sends and receives JSON messages to/from a child process', async () => {
    const phantomProcess = childProcess.spawn('phantomjs', [scriptPath]);
    const client = new RPCClient(phantomProcess);

    const promise1 = client.send('call1', []);
    const promise2 = client.send('call2', []);

    expect(await promise1).toEqual({result: {method: 'call1', params: []}});
    expect(await promise2).toEqual({result: {method: 'call2', params: []}});
  });
});
