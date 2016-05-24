import Directory from 'directory-helpers';
import Client from 'phantomjs-promise-es6/lib/client';

const phantomScript = `
'use strict';
var system = require('system');
var request;
while (true) {
  request = JSON.parse(system.stdin.readLine());
  system.stdout.writeLine(JSON.stringify({
    id: request.id,
    result: request
  }));

  if (request.method === 'exit') {
    break;
  }
}
`;

describe('Client', () => {
  let phantomProcess;
  afterEach(async () => {
    const directory = new Directory('temp');
    if (phantomProcess) {
      phantomProcess.kill();
    }
    await directory.remove();
  });

  it('sends and receives JSON messages to/from a child process', async () => {
    const directory = new Directory('temp');
    await directory.write({'phantom-script.js': phantomScript});

    const phantom = directory.spawn('phantomjs', ['phantom-script.js']);
    phantomProcess = phantom.process;

    const client = new Client(phantom.process);

    const promise1 = client.send('call1', []);
    const promise2 = client.send('call2', []);
    expect(await promise1).toEqual({
      id: 1,
      result: {id: 1, method: 'call1', params: []}
    });
    expect(await promise2).toEqual({
      id: 2,
      result: {id: 2, method: 'call2', params: []}
    });

    await client.send('exit');
  });
});
