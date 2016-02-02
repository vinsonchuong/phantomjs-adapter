import RPCClient from 'phantomjs-promise-es6/lib/rpc-client';

class RPCServer {
  constructor() {
    this.writes = [];
  }

  read(callback) {
    this.callback = callback;
  }

  write(data) {
    this.writes.push(data);
  }
}

describe('RPCClient', () => {
  it('sends method calls to the server', () => {
    const server = new RPCServer();
    const client = new RPCClient(server);

    client.send('methodName', ['param1', 'param2']);

    expect(server.writes[0].method).toBe('methodName');
    expect(server.writes[0].params).toEqual(['param1', 'param2']);
  });

  it('receives responses from the server', async () => {
    const server = new RPCServer();
    const client = new RPCClient(server);

    const call1 = client.send('call1', []);
    const call2 = client.send('call2', []);

    server.callback({result: 'result1'});
    server.callback({result: 'result2'});

    const call3 = client.send('call3', []);
    server.callback({result: 'result3'});

    expect(await call1).toEqual({result: 'result1'});
    expect(await call2).toEqual({result: 'result2'});
    expect(await call3).toEqual({result: 'result3'});
  });
});
