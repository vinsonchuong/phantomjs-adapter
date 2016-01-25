import PhantomJS from 'phantomjs-promise-es6';

describe('phantomjs-promise-es6', () => {
  it('says Hello World!', async () => {
    expect(PhantomJS).toBe('Hello World!');
  });
});
