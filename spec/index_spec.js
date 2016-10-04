import {childProcess} from 'node-promise-es6';
import {catchError} from 'jasmine-es6';
import register from 'test-inject';
import {parallel} from 'esnext-async';
import Directory from 'directory-helpers';
import {path as phantomJsPath} from 'phantomjs-prebuilt';
import PhantomJS from 'phantomjs-adapter';

async function phantomPids() {
  try {
    const {stdout: pids} = await childProcess.exec(`pgrep -f '${phantomJsPath}'`);
    return pids.split('\n').filter(Boolean).map(Number);
  } catch (error) {
    return null;
  }
}

const inject = register({
  temp: {
    setUp: () => new Directory('temp'),
    tearDown: async (temp) => await temp.remove()
  },
  browser: {
    setUp: () => new PhantomJS(),
    tearDown: async (browser) => await browser.exit()
  }
});

describe('phantomjs-adapter', () => {
  it('can kill the phantomjs process', async () => {
    const browser = new PhantomJS();
    expect(await phantomPids()).toContain(browser.process.pid);
    await browser.exit();
    expect(await phantomPids()).not.toContain(browser.process.pid);
  });

  it('can open a URL', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
        <title>Hello World!</title>
      `
    });
    await browser.open(`file://${temp.path('index.html')}`);
    expect(await browser.title()).toContain('Hello World!');
  }));

  it('can read information about a DOM element', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
        <div
          id="root"
          class="container"
          style="position: absolute; top: 0; left: 0; width: 200px; height: 100px;"
        >
          Hello World!
        </div>
        <input value="text">
      `
    });
    await browser.open(`file://${temp.path('index.html')}`);

    const div = await browser.find('div');
    expect(div.textContent.trim()).toBe('Hello World!');
    expect(div.attributes.id).toBe('root');
    expect(div.attributes.class).toBe('container');
    expect(div.boundingClientRect).toEqual({
      top: 0,
      right: 200,
      bottom: 100,
      left: 0,
      width: 200,
      height: 100
    });

    const input = await browser.find('input');
    expect(input.value).toBe('text');
  }));

  it('can find a DOM element by text', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
        <span>Hello</span>
        <span>World!</span>
      `
    });
    await browser.open(`file://${temp.path('index.html')}`);

    const span = await browser.find('span', {text: 'World!'});
    expect(span.textContent).toBe('World!');
  }));

  it('returns null if a DOM element does not exist', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
      `
    });
    await browser.open(`file://${temp.path('index.html')}`);

    const missing = await browser.find('div');
    expect(missing).toBe(null);
  }));

  it('can wait until an element is found', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
        <script>
          setTimeout(function() {
            var p = document.createElement('p');
            p.textContent = 'Hello World!';
            document.body.appendChild(p);
          }, 1000);
        </script>
      `
    });
    await browser.open(`file://${temp.path('index.html')}`);

    const paragraph = await browser.find('p', {wait: 2000});
    expect(paragraph.textContent).toBe('Hello World!');
  }));

  it('returns null if an element cannot be found within the time limit', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
      `
    });
    await browser.open(`file://${temp.path('index.html')}`);

    const missing = await browser.find('p', {wait: 1000});
    expect(missing).toBe(null);
  }));

  it('can click on a DOM element', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
        <button onClick="root.textContent = 'Hello World!';">
          Button
        </button>
        <div id="root"></div>
      `
    });
    await browser.open(`file://${temp.path('index.html')}`);

    const button = await browser.find('button');
    await button.click();

    const root = await browser.find('#root');
    expect(root.textContent).toBe('Hello World!');
  }));

  it('can fill in a DOM element', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
        <input>
      `
    });
    await browser.open(`file://${temp.path('index.html')}`);

    let input = await browser.find('input');
    await input.fillIn('Hello World!');

    input = await browser.find('input');
    expect(input.value).toBe('Hello World!');
  }));

  it('throws an exception when it fails to open a page', inject(async ({browser}) => {
    expect(await catchError(browser.open('http://foo')))
      .toContain('Failed to open http://foo');
  }));

  it('throws an exception when it opens a page with a JavaScript exception', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
        <script>
          throw new Error('This is a JS error');
        </script>
      `
    });
    expect(await catchError(browser.open(`file://${temp.path('index.html')}`)))
      .toContain('This is a JS error');
  }));

  it('throws an exception when evaluating JS produces an exception', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
      `
    });
    await browser.open(`file://${temp.path('index.html')}`);
    expect(await catchError(
      browser.evaluate('throw new Error("This is an error.")')
    )).toContain('This is an error.');
  }));

  it('logs requests', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
        <img src="file://${temp.path('image.png')}">
      `
    });

    await parallel(
      async () => {
        await browser.open(`file://${temp.path('index.html')}`);
      },
      async () => {
        expect(await browser.logs).toEqual({
          type: 'request',
          id: 1,
          method: 'GET',
          url: `file://${temp.path('index.html')}`,
          headers: {
            'Accept': '*/*',
            'User-Agent': jasmine.stringMatching('PhantomJS')
          }
        });
        expect(await browser.logs).toEqual({
          type: 'request',
          id: 2,
          method: 'GET',
          url: `file://${temp.path('image.png')}`,
          headers: {
            'Accept': '*/*',
            'User-Agent': jasmine.stringMatching('PhantomJS')
          }
        });
        expect(await browser.logs).toEqual({
          type: 'response',
          id: 1,
          url: `file://${temp.path('index.html')}`,
          headers: {
            'Last-Modified': jasmine.any(String),
            'Content-Length': jasmine.any(String)
          }
        });
        expect(await browser.logs).toEqual({
          type: 'response',
          id: 2,
          url: `file://${temp.path('image.png')}`,
          error: jasmine.stringMatching('No such file')
        });
      }
    );
  }));

  it('logs console messages', inject(async ({temp, browser}) => {
    await temp.write({
      'index.html': `
        <!doctype html>
        <meta charset="utf-8">
        <script>console.log('Hello World!')</script>
      `
    });
    await parallel(
      async () => {
        await browser.open(`file://${temp.path('index.html')}`);
      },
      async () => {
        expect(
          await browser.logs.filter(({type}) => type === 'console')
        ).toEqual({
          type: 'console',
          message: 'Hello World!'
        });
      }
    );
  }));
});
