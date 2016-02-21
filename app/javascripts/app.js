'use strict';

require('./polyfills');
var helpers = require('./helpers');
var model = require('./model');
var shell = require('./shell');

var init = function() {
  model.init('wealthApp');
  shell.init();
  window.model = model;
};

init();

// try {
//   init();
// } catch (e) {
//   console.error(e);
//   //@FIXME update email address
//   helpers.makeError(null, 'Something wrong happened. Please try refreshing the page and report the problem at ...');
// }
