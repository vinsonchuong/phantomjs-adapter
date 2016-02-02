export default class {
  constructor(callback) {
    this.promises = [];
    this.resolves = [];

    callback((data) => {
      this.nextPromise();
      this.resolves.shift()(data);
    });
  }

  * [Symbol.iterator]() {
    while (true) {
      this.nextPromise();
      yield this.promises.shift();
    }
  }

  nextPromise() {
    if (this.promises.length > 0 && this.resolves.length > 0) {
      return;
    }
    this.promises.push(new Promise((resolve) => this.resolves.push(resolve)));
  }
}
