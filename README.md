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
  const browser = new PhantomJS();
  await browser.open('https://www.google.com');

  const searchBox = await browser.find('input[name="q"]');
  await searchBox.fillIn('Hello World!')

  const searchButton = await browser.find('input[value="Search"]');
  await searchButton.click();

  const body = await browser.find('body');
  console.log(body.textContent);
}
run();
```

### API Documentation
#### PhantomJS
An Class that mediates communication with a PhantomJS browser instance.

##### Constructor
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
}
run();
```
Spawns a PhantomJS process and instruments it to be controlled by method calls
on this object.

##### Exit
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.exit();
}
run();
```
Exits the PhantomJS process. Note that that process may not have fully exited
by the time the promise is resolved; it is at least guaranteed to exit soon
after.

##### Open
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');
  await browser.exit();
}
run();
```
Instructs the PhantomJS process to open a URL using
[`WebPage.open`](http://phantomjs.org/api/webpage/method/open.html).

##### Evaluate
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');
  await browser.evaluate('return document.title');
  await browser.exit();
}
run();
```
Instructs the PhantomJS process to evaluate a JavaScript function using
[`WebPage#evaluate`](http://phantomjs.org/api/webpage/method/evaluate.html),
given as a string, within the context of the currently open page. It is assumed
that `PhantomJS#open` has been called and its returned promise resolved. The
promise returned by `PhantomJS#evaluate` will be resolved with the return value
of the given function body. It is assumed that the return value can be
serialized using `JSON.stringify`.

##### SendEvent
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');
  await browser.sendEvent('click', 20, 20);
  await browser.exit();
}
run();
```
Instructs the PhantomJS process to provide user input to the currently open
page using
['WebPage#sendEvent'](http://phantomjs.org/api/webpage/method/send-event.html).
It is assumed that `PhantomJS#open` has been called and its returned promise
resolved.

##### Find
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');

  const title = await browser.find('h1.jumbotron-title');
  console.log(title.textContent);

  const signUpButton = await browser.find('a', {text: 'Sign up'});
  await signUpButton.click();

  await browser.exit();
}
run();
```
Finds an element on the currently open page given a CSS selector and optional
text content substring. The promise is resolved with an instance of `Element`.
The CSS selector and text content substring are converted into XPath and
evaluated using `document.evaluate`. It is assumed that `PhantomJS#open` has
been called and its returned promise resolved.

### Element
A class that represents a snapshot of an element rendered in the currently open
page of a PhantomJS browser. It exposes data about the element and provides an
interface for sending user actions to that element. Element instances are
returned by `PhantomJS#find`.

#### Attributes
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');

  const title = await browser.find('h1.jumbotron-title');
  console.log(title.attributes.class);

  await browser.exit();
}
run();
```
An object representing the HTML attributes of the element.

#### BoundingClientRect
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');

  const title = await browser.find('h1.jumbotron-title');
  console.log(title.boundingClientRect);

  await browser.exit();
}
run();
```
An object containing the size and position of the element. These values are
read using
[`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).

#### TextContent
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');

  const title = await browser.find('h1.jumbotron-title');
  console.log(title.textContent);

  await browser.exit();
}
run();
```
The inner text of the element. It is read from the `textContent` attribute of
the underlying element.

#### Value
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');

  const title = await browser.find('h1.jumbotron-title');
  console.log(title.value);

  await browser.exit();
}
run();
```
The value of the element if it is an input element. It is read from the `value`
attribute of the underlying element. If the element is not an input, `value` is
`undefined`.

#### Click
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');

  const signUpButton = await browser.find('a', {text: 'Sign up'});
  await signUpButton.click();

  await browser.exit();
}
run();
```
Instructs the PhantomJS process to click on the center of the element, at the
time `PhantomJS#find` was executed, using `PhantomJS#sendEvent`.

#### FillIn
```js
import PhantomJS from 'phantomjs'

async function run() {
  const browser = new PhantomJS();
  await browser.open('http://github.com');

  const searchInput = await browser.find('input[name="q"]');
  await searchInput.fillIn('awesome code');

  await browser.exit();
}
run();
```
Instructs the PhantomJS process to focus an element assumed to be a text input
using `Element#click` and then send `keypress` events via `PhantomJS#sendEvent`.

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
