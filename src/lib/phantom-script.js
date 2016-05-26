/* eslint-disable */
'use strict';
var system = require('system');
var webpage = require('webpage');

var page;

var methods = {
  evaluate: function(functionBody, callback) {
    callback(page.evaluate(new Function(functionBody)));
  },
  exit: function(callback) {
    callback(true);
  },
  open: function(url, callback) {
    page = webpage.create();
    page.open(url, function(status) {
      callback(status === 'success');
    });
  }
};

function processRequest() {
  var request = JSON.parse(system.stdin.readLine());

  function callback(result) {
    system.stdout.writeLine(JSON.stringify({id: request.id, result: result}));
    if (request.method === 'exit') {
      phantom.exit(0);
    } else {
      processRequest();
    }
  }
  methods[request.method].apply(null, request.params.concat(callback));
}
processRequest();
