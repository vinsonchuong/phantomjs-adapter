import PhantomJS from 'phantomjs-promise-es6';

describe('phantomjs-promise-es6', () => {
  xit('can open URLs', async () => {
    const page = new PhantomJS();
    await page.open('https://www.google.com');
    const logo = await page.evaluate(`document.querySelector('#hplogo').alt`);
    expect(logo).toBe('Google');
  });
});
