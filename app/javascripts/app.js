'use strict';

require('./polyfills');
require('./components/hamburger');
// var helpers = require('./helpers');
var model = require('./model');
var view = require('./view');
var controller = require('./controller');

var VERSION = '0.1.1';

var init = function() {
  model.init('wealthApp');

  var initialState = model.read();
  var userVersion = initialState.version;

  if(userVersion !== VERSION) {
    console.log('The code is old, its version %s whereas the updated one is %s', userVersion, VERSION);
    model.reset();
    model.update({
      version: VERSION
    });
    initialState = model.read();
  }
  view.init();
  controller(model, view.getViews(), initialState);

  // Debug only
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
