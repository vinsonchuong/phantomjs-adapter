/* eslint-disable */
'use strict';
var webpage = require('webpage');
var format = require('./format');
var log = require('./log');

var currentPage;
module.exports = {
  open: function(url, callback) {
    currentPage = webpage.create();

    currentPage.onResourceRequested = log.network;
    currentPage.onResourceReceived = log.network;
    currentPage.onResourceError = log.network;
    currentPage.onResourceTimeout = log.network;

    var error;
    currentPage.onError = function(message, trace) {
      error = format.error(message, trace);
    };
    currentPage.open(url, function(status) {
      currentPage.onError = null;
      callback(
        error ? error :
        status !== 'success' ? 'Failed to open ' + url :
        null
      );
    });
  },

  evaluate: function(functionBody, callback) {
    var error;
    currentPage.onError = function(message, trace) {
      error = format.error(message, trace);
    };
    var result = currentPage.evaluate(new Function(functionBody));
    currentPage.onError = null;
    callback(error, result);
  },

  sendEvent: function(params, callback) {
    currentPage.sendEvent.apply(currentPage, params);
    callback();
  }
};
