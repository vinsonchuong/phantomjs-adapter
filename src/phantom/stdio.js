/* eslint-disable */
'use strict';
var system = require('system');

module.exports = {
  read: function() {
    return JSON.parse(system.stdin.readLine());
  },

  write: function(obj) {
    system.stdout.writeLine(JSON.stringify(obj));
  }
};
