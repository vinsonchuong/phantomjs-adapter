/* eslint-disable */
'use strict';
var system = require('system');

while (true) {
  system.stdout.writeLine(JSON.stringify({
    result: JSON.parse(system.stdin.readLine())
  }));
}
