/* eslint-disable */
'use strict';
var system = require('system');

var methods = {
  defineMethod: function(name, argumentNames, body) {
    this[name] = Function.apply(null, argumentNames.concat(body));
  }
};

var request, result;
while (true) {
  request = JSON.parse(system.stdin.readLine());
  var result = methods[request.method].apply(methods, request.params);

  system.stdout.writeLine(JSON.stringify({
    id: request.id,
    result: result
  }));
}
