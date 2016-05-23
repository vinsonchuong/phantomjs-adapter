import Directory from 'directory-helpers';
import Client from 'phantomjs-promise-es6/lib/client';

const phantomScript = `
'use strict';
var system = require('system');
var request;
while (true) {
  system.stdout.writeLine(JSON.stringify({
    result: JSON.parse(system.stdin.readLine())
  }));
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

    expect(await client.send('call1', []))
      .toEqual({result: {method: 'call1', params: []}});
    expect(await client.send('call2', []))
      .toEqual({result: {method: 'call2', params: []}});
  });
});
