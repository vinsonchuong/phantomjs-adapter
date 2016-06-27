/* eslint-disable */
'use strict';
var system = require('system');
var webpage = require('webpage');

function errorMessage(message, trace) {
  var lines = [message];
  (trace || []).forEach(function(frame) {
    lines.push(
      '    at ' +
      (frame.function || '') +
      ' (' +
      frame.file +
      ':' +
      frame.line +
      ')'
    );
  });
  return lines.join('\n');
}

var page;

var methods = {
  exit: function(callback) {
    callback({result: true});
  },
  open: function(url, callback) {
    var error;

    page = webpage.create();
    page.onError = function(message, trace) {
      error = errorMessage(message, trace);
    };
    page.open(url, function(status) {
      page.onError = null;
      callback(
        error ? {error: error} :
        status !== 'success' ? {error: 'Failed to open ' + url} :
        {result: true}
      );
    });
  },
  evaluate: function(functionBody, callback) {
    var error;
    page.onError = function(message, trace) {
      error = errorMessage(message, trace);
    };
    var result = page.evaluate(new Function(functionBody));
    callback(
      error ?
        {error: error} :
        {result: result}
    );
  },
  sendEvent: function() {
    var params = Array.prototype.slice.call(arguments, 0, -1);
    var callback = arguments[arguments.length - 1];
    page.sendEvent.apply(page, params);
    callback({result: true});
  }
};

function processRequest() {
  var request = JSON.parse(system.stdin.readLine());

  function callback(value) {
    system.stdout.writeLine(JSON.stringify(
      value.error ?
        {id: request.id, error: value.error} :
        {id: request.id, result: value.result}
    ));
    if (request.method === 'exit') {
      phantom.exit(0);
    } else {
      setTimeout(processRequest, 0);
    }
  }
  methods[request.method].apply(null, request.params.concat(callback));
}
processRequest();
