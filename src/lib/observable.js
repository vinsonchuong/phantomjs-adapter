import {encapsulated, internal} from 'esnext-decorators';

@encapsulated
export default class Observable {
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
      yield this.next();
    }
  }

  next() {
    this.nextPromise();
    return this.promises.shift();
  }

  map(transform) {
    return new Observable(async (produce) => {
      for (const promise of this) {
        produce(transform(await promise));
      }
    });
  }

  flatMap(transform) {
    return new Observable(async (produce) => {
      for (const promise of this) {
        transform(await promise).forEach(produce);
      }
    });
  }

  filter(include) {
    return new Observable(async (produce) => {
      for (const promise of this) {
        const value = await promise;
        if (include(value)) {
          produce(value);
        }
      }
    });
  }

  @internal
  nextPromise() {
    if (this.promises.length > 0 && this.resolves.length > 0) {
      return;
    }
    this.promises.push(new Promise((resolve) => {
      this.resolves.push(resolve);
    }));
  }
}
