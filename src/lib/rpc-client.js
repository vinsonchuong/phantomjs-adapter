import Observable from 'phantomjs-promise-es6/lib/observable';

export default class {
  constructor(server) {
    this.server = server;

    const observable = new Observable((produce) => server.read(produce));
    this.iterator = observable[Symbol.iterator]();
  }

  send(method, params) {
    this.server.write({method, params});
    return this.iterator.next().value;
  }
}
