import {Observable} from 'esnext-async';

export default class {
  constructor(serverProcess) {
    this.serverProcess = serverProcess;
    this.requestId = 1;
    this.requests = new Map();

    new Observable((observer) => {
      this.serverProcess.stdout.on('data', (data) => {
        observer.next(data);
      });
    })
      .flatMap((buffer) => buffer.toString().split('\n'))
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line))
      .forEach((response) => {
        this.requests.get(response.id)(response);
        this.requests.delete(response.id);
      });
  }

  send(method, params) {
    return new Promise((resolve) => {
      const id = this.requestId++;
      this.requests.set(id, resolve);
      const payload = {id, method, params};
      this.serverProcess.stdin.write(`${JSON.stringify(payload)}\n`);
    });
  }
}
