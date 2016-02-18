import Observable from 'phantomjs-promise-es6/lib/observable';

export default class {
  constructor(serverProcess) {
    this.serverProcess = serverProcess;
    this.observable = new Observable((produce) => {
      this.serverProcess.stdout.on('data', produce);
    })
      .flatMap((buffer) => buffer.toString().split('\n'))
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line))
  }

  send(method, params) {
    this.serverProcess.stdin.write(JSON.stringify({method, params}) + '\n');
    return this.observable.next();
  }
}
