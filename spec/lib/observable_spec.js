import Observable from 'phantomjs-promise-es6/lib/observable';

describe('Observable', () => {
  it('does not expose any private methods', () => {
    const observable = new Observable(() => {});
    expect(observable.nextPromise).not.toEqual(jasmine.any(Function));
  });

  it('asynchronously yields values from a push interface', async () => {
    let observer;
    const observable = new Observable((produce) => {
      observer = produce;
    });

    observer(1);
    observer(2);
    observer(3);

    expect(await observable.next()).toBe(1);
    expect(await observable.next()).toBe(2);
    expect(await observable.next()).toBe(3);
  });

  it('can be read an arbitrary number of times', async () => {
    let observer;
    const observable = new Observable((produce) => {
      observer = produce;
    });

    const promise1 = observable.next();
    const promise2 = observable.next();
    const promise3 = observable.next();

    observer(1);
    observer(2);
    observer(3);

    expect(await promise1).toBe(1);
    expect(await promise2).toBe(2);
    expect(await promise3).toBe(3);
  });

  it('allows transforming each of its streamed values', async () => {
    let observer;
    const observable = new Observable((produce) => {
      observer = produce;
    })
      .map((value) => value * 2);

    observer(1);
    observer(2);
    observer(3);

    expect(await observable.next()).toBe(2);
    expect(await observable.next()).toBe(4);
    expect(await observable.next()).toBe(6);
  });

  it('allows transforming a streamed value into multiple values', async () => {
    let observer;
    const observable = new Observable((produce) => {
      observer = produce;
    })
      .flatMap((value) => [value, value * 2]);

    observer(1);
    observer(2);

    expect(await observable.next()).toBe(1);
    expect(await observable.next()).toBe(2);
    expect(await observable.next()).toBe(2);
    expect(await observable.next()).toBe(4);
  });

  it('can filter out streamed values', async () => {
    let observer;
    const observable = new Observable((produce) => {
      observer = produce;
    })
      .filter((value) => value % 2 === 0);

    observer(1);
    observer(2);
    observer(3);
    observer(4);

    expect(await observable.next()).toBe(2);
    expect(await observable.next()).toBe(4);
  });

  it('can compose transforms', async () => {
    let observer;
    const observable = new Observable((produce) => {
      observer = produce;
    })
      .map((value) => value * 2)
      .map((value) => value * 2)
      .filter((value) => value > 10);

    observer(1);
    observer(2);
    observer(3);

    expect(await observable.next()).toBe(12);
  });
});
