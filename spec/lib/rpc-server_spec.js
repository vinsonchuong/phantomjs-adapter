import * as path from 'path';
import {childProcess, fs} from 'node-promise-es6';
import * as fse from 'fs-extra-promise-es6';
import RPCServer from 'phantomjs-promise-es6/lib/rpc-server';
import Observable from 'phantomjs-promise-es6/lib/observable';

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

describe('RPCServer', () => {
  beforeEach(async () => {
    await fs.writeFile(scriptPath, script);
  });

  afterEach(async () => {
    await fse.remove(scriptPath);
  });

  it('sends JSON messages to a child process', async () => {
    const phantomProcess = childProcess.spawn('phantomjs', [scriptPath]);
    const server = new RPCServer(phantomProcess);

    server.write({id: 0});
  });

  it('sends and receives JSON messages to/from a child process', async () => {
    const phantomProcess = childProcess.spawn('phantomjs', [scriptPath]);
    const server = new RPCServer(phantomProcess);

    const observable = new Observable((produce) => server.read(produce));

    server.write({id: 0});
    server.write({id: 1});
    server.write({id: 2});

    let count = 0;
    for (const promise of observable) {
      expect(await promise).toEqual({result: {id: count++}});
      if (count === 3) {
        break;
      }
    }
  });
});
