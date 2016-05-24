/* eslint-disable */
'use strict';
var system = require('system');
var request;
while (true) {
  request = JSON.parse(system.stdin.readLine());
  system.stdout.writeLine(JSON.stringify({
    id: request.id,
    result: true
  }));

  phantom.exit(0);
  break;
}
