import {AwaitableObservable} from 'esnext-async';

export default class {
  constructor(serverProcess) {
    this.serverProcess = serverProcess;
    this.observable = new AwaitableObservable((observer) => {
      this.serverProcess.stdout.on('data', (data) => {
        observer.next(data);
      });
    })
      .flatMap((buffer) => buffer.toString().split('\n'))
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
  }

  send(method, params) {
    this.serverProcess.stdin.write(`${JSON.stringify({method, params})}\n`);
    return this.observable;
  }
}
