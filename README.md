# phantomjs-promise-es6
[![Build Status](https://travis-ci.org/vinsonchuong/phantomjs-promise-es6.svg?branch=master)](https://travis-ci.org/vinsonchuong/phantomjs-promise-es6)

An ES6 promise adapter for [PhantomJS](http://phantomjs.org/) for use with
[ES7 async/await](https://github.com/lukehoban/ecmascript-asyncawait).

## Installing
`phantomjs-promise-es6` is available as an
[npm package](https://www.npmjs.com/package/phantomjs-promise-es6).

## Usage
```js
import PhantomJS from 'phantomjs-promise-es6';

async function run() {
  const page = new PhantomJS();
  await page.open('https://www.google.com');
  const inputRect = page.evaluate(() =>
    document.querySelector('[name="q"]').getBoundingClientRect()
  );
  page.sendEvent(
    'click',
    inputRect.x + inputRect.width / 2,
    inputRect.y + inputRect.height / 2
  );
  page.sendEvent('keypress', 'PhantomJS');
  page.sendEvent('keypress', page.event.key.Enter);
  const firstResult = page.evaluate(() =>
    document.querySelector('.g h3').textContent
  );
  console.log(firstResult);
}
run();
```

## Development
### Getting Started
The application requires the following external dependencies:
* Node.js

The rest of the dependencies are handled through:
```bash
npm install
```

Run tests with:
```bash
npm test
```
