/* eslint-disable */
'use strict';
var stdio = require('./stdio');
var format = require('./format');

function log(payload) {
  stdio.write({log: payload});
}

var networkCache = {};

module.exports = {
  console: function(message) {
    log({
      type: 'console',
      message: message
    });
  },

  network: function(data) {
    if (
      data.id in networkCache ||
      'stage' in data && data.stage !== 'end'
    ) {
      return;
    }

    if ('status' in data) {
      networkCache[data.id] = true;
    }

    log(format.network(data));
  }
};
