import {catchError} from 'jasmine-es6';
import Directory from 'directory-helpers';
import Client from 'phantomjs-adapter/lib/client';

function withClient(script, test) {
  return async () => {
    const directory = new Directory('temp');
    await directory.write({'phantom-script.js': script});
    const phantom = directory.spawn('phantomjs', ['phantom-script.js']);
    try {
      const client = new Client(phantom.process);
      await test(client);
    } finally {
      phantom.process.kill();
      await directory.remove();
    }
  };
}


describe('Client', () => {
  it('sends and receives JSON messages to/from a child process', withClient(
    `
      'use strict';
      var system = require('system');
      var request;
      while (true) {
        request = JSON.parse(system.stdin.readLine());
        system.stdout.writeLine(JSON.stringify({
          id: request.id,
          result: request
        }));
      }
    `,
    async (client) => {
      const promise1 = client.send('call1', []);
      const promise2 = client.send('call2', []);
      expect(await promise1).toEqual({id: 1, method: 'call1', params: []});
      expect(await promise2).toEqual({id: 2, method: 'call2', params: []});
    })
  );

  it('receives and propagates exceptions', withClient(
    `
      'use strict';
      var system = require('system');
      var request = JSON.parse(system.stdin.readLine());
      system.stdout.writeLine(JSON.stringify({
        id: request.id,
        error: 'This is an error.'
      }));
    `,
    async (client) => {
      expect(await catchError(client.send('call', [])))
        .toBe('This is an error.');
    })
  );
});
