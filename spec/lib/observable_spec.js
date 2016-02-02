import Observable from 'phantomjs-promise-es6/lib/observable';

describe('Observable', () => {
  it('asynchronously yields values from a push interface', async () => {
    let observer;
    const observable = new Observable((produce) => observer = produce);

    observer(1);
    observer(2);
    observer(3);

    let count = 1;
    for (const promise of observable) {
      expect(await promise).toBe(count++);
      if (count > 3) {
        break;
      }
    }
  });

  it('can be read an arbitrary number of times', async () => {
    let observer;
    const observable = new Observable((produce) => observer = produce);
    const iterator = observable[Symbol.iterator]();

    const promise1 = iterator.next().value;
    const promise2 = iterator.next().value;
    const promise3 = iterator.next().value;

    observer(1);
    observer(2);
    observer(3);

    expect(await promise1).toBe(1);
    expect(await promise2).toBe(2);
    expect(await promise3).toBe(3);
  });
});
