import {Observable} from 'esnext-async';

class RequestQueue {
  constructor() {
    this.nextId = 1;
    this.requests = new Map();
  }

  defer(makeRequest) {
    return new Promise((resolve) => {
      const id = this.nextId++;
      this.requests.set(id, resolve);
      makeRequest(id);
    });
  }

  resolve(id, response) {
    this.requests.get(id)(response);
    this.requests.delete(id);
  }
}

export default class {
  constructor(serverProcess) {
    this.serverProcess = serverProcess;
    this.requests = new RequestQueue();

    new Observable((observer) => {
      this.serverProcess.stdout.on('data', (data) => {
        observer.next(data);
      });
    })
      .flatMap((buffer) => buffer.toString().split('\n'))
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line))
      .forEach((response) => {
        this.requests.resolve(response.id, response);
      });
  }

  send(method, params) {
    return this.requests.defer((id) => {
      const payload = {id, method, params};
      this.serverProcess.stdin.write(`${JSON.stringify(payload)}\n`);
    });
  }
}
