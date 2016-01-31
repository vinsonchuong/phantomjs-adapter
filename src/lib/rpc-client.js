class CallQueue {
  constructor() {
    this.currentId = 1;
  }

  defer(callback) {
    callback(this.currentId);
    return new Promise((resolve) => {
      this[this.currentId++] = resolve;
    });
  }

  resolve(id, result) {
    this[id](result);
  }
}

export default class {
  constructor(server) {
    this.server = server;
    this.calls = new CallQueue();
    server.read((response) => this.receive(response));
  }

  send(method, params) {
    return this.calls.defer((id) => {
      this.server.write({id, method, params});
    });
  }

  receive({id, result}) {
    this.calls.resolve(id, result);
  }
}
