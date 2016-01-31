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

  it('receives responses from the server', () => {
    const server = new RPCServer();
    const client = new RPCClient(server);
    spyOn(client, 'receive');

    server.callback({result: 'response'});

    expect(client.receive).toHaveBeenCalledWith({result: 'response'});
  });

  it('associates method call and response by id', async () => {
    const server = new RPCServer();
    const client = new RPCClient(server);

    const call1 = client.send('call1', []);
    const call2 = client.send('call2', []);

    client.receive({id: server.writes[1].id, result: 'result2'});
    client.receive({id: server.writes[0].id, result: 'result1'});

    expect(await call1).toBe('result1');
    expect(await call2).toBe('result2');
  });
});
