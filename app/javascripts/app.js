'use strict';

var helpers = require('./helpers');
var model = require('./model');
var shell = require('./shell');

var init = function() {
  helpers.init();
  model.init('wealthApp');
  shell.init();
  window.model = model;
};

try {
  init();
} catch (e) {
  //@FIXME update email address
  helpers.makeError('Something wrong happened. Please try refreshing the page and report the problem at ...');
  console.error(e);
}
