import {catchError} from 'jasmine-es6';
import register from 'test-inject';
import Directory from 'directory-helpers';
import Client from 'phantomjs-adapter/lib/client';

const inject = register({
  makeClient: class {
    static setUp() {
      return async (script) => {
        this.directory = new Directory('temp');
        await this.directory.write({'phantom-script.js': script});
        this.phantom = this.directory.spawn('phantomjs', ['phantom-script.js']);
        return new Client(this.phantom.process);
      };
    }
    static async tearDown() {
      this.phantom.process.kill();
      await this.directory.remove();
    }
  }
});

describe('Client', () => {
  it('sends and receives JSON messages to/from a child process', inject(async ({makeClient}) => {
    const client = await makeClient(`
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
    `);

    const promise1 = client.send('call1', []);
    const promise2 = client.send('call2', []);
    expect(await promise1).toEqual({id: 1, method: 'call1', params: []});
    expect(await promise2).toEqual({id: 2, method: 'call2', params: []});
  }));

  it('receives and propagates exceptions', inject(async ({makeClient}) => {
    const client = await makeClient(`
      'use strict';
      var system = require('system');
      var request = JSON.parse(system.stdin.readLine());
      system.stdout.writeLine(JSON.stringify({
        id: request.id,
        error: 'This is an error.'
      }));
    `);
    expect(await catchError(client.send('call', []))).toBe('This is an error.');
  }));
});
