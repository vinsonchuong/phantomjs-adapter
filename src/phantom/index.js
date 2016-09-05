/* eslint-disable */
'use strict';
var stdio = require('./stdio');
var page = require('./page');

var methods = {
  exit: function(callback) {
    callback();
  },

  open: function(url, callback) {
    page.open(url, callback);
  },

  evaluate: function(functionBody, callback) {
    page.evaluate(functionBody, callback);
  },

  sendEvent: function() {
    var params = Array.prototype.slice.call(arguments, 0, -1);
    var callback = arguments[arguments.length - 1];
    page.sendEvent(params, callback);
  }
};

function processRequest() {
  var request = stdio.read();

  function processResponse(error, result) {
    stdio.write({
      id: request.id,
      error: error || undefined,
      result: (
        error ? undefined :
        typeof result === 'undefined' ? true :
        result
      )
    });

    if (request.method === 'exit') {
      phantom.exit(0);
    } else {
      setTimeout(processRequest, 0);
    }
  }

  methods[request.method].apply(null, request.params.concat(processResponse));
}
processRequest();
