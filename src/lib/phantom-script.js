/* eslint-disable */
'use strict';
var system = require('system');
var webpage = require('webpage');

var page;

var methods = {
  exit: function(callback) {
    callback(true);
  },
  open: function(url, callback) {
    page = webpage.create();
    page.open(url, function(status) {
      callback(status === 'success');
    });
  },
  evaluate: function(functionBody, callback) {
    callback(page.evaluate(new Function(functionBody)));
  },
  sendEvent: function() {
    var params = Array.prototype.slice.call(arguments, 0, -1);
    var callback = arguments[arguments.length - 1];
    page.sendEvent.apply(page, params);
    callback(true);
  }
};

function processRequest() {
  var request = JSON.parse(system.stdin.readLine());

  function callback(result) {
    system.stdout.writeLine(JSON.stringify({id: request.id, result: result}));
    if (request.method === 'exit') {
      phantom.exit(0);
    } else {
      setTimeout(processRequest, 0);
    }
  }
  methods[request.method].apply(null, request.params.concat(callback));
}
processRequest();
