'use strict';

require('./polyfills');
require('./components/hamburger');
// var helpers = require('./helpers');
var model = require('./model');
var view = require('./view');
var controller = require('./controller');

var init = function() {
  model.init('wealthApp');
  var initialState = model.read();
  view.init();
  controller(model, view.getViews(), initialState);

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
