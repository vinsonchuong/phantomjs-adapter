import * as path from 'path';
import {childProcess, fs} from 'node-promise-es6';
import * as fse from 'fs-extra-promise-es6';
import RPCServer from 'phantomjs-promise-es6/lib/rpc-server';

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

  it('sends and receives JSON messages to/from a child process', async () => {
    const phantomProcess = childProcess.spawn('phantomjs', [scriptPath]);
    const server = new RPCServer(phantomProcess);

    const responses = [];
    const promise = new Promise((resolve) => {
      server.read((response) => {
        responses.push(response);
        if (responses.length === 3) {
          resolve();
        }
      });
    });

    server.write({id: 0});
    server.write({id: 1});
    server.write({id: 2});

    await promise;
    expect(responses[0]).toEqual({result: {id: 0}});
    expect(responses[1]).toEqual({result: {id: 1}});
    expect(responses[2]).toEqual({result: {id: 2}});
  });
});
