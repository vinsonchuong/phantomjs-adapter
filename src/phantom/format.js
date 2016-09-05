/* eslint-disable */
'use strict';

module.exports = {
  error: function(message, trace) {
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
  },

  network: function(data) {
    var type = 'status' in data ? 'response' : 'request';

    var headers;
    if ('headers' in data) {
      headers = {};
      data.headers.forEach(function(header) {
        headers[header.name] = header.value;
      });
    }

    return {
      type: type,
      id: data.id,
      method: data.method || undefined,
      url: data.url,
      headers: headers,
      redirect: data.redirectURL || undefined,
      error: data.errorString || undefined
    };
  }
};
