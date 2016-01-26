'use strict';
var system = require('system');

var command;
while (true) {
  command = JSON.parse(system.stdin.readLine())
  system.stdout.writeLine(JSON.stringify(command));
}
