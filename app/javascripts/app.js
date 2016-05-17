'use strict';

require('./polyfills');
require('./components/hamburger');
var model = require('./model');
var view = require('./view');
var controller = require('./controller');
var notie = require('notie');

var VERSION = '0.2.1';
var DEV = true;

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

  window.addEventListener('error', function (e) {
    var stack = e.error.stack;
    var message = e.error.toString();
    if (stack) {
      message += '\n' + stack;
    }
  });

  if(DEV) {
    notie.alert(2, 'Welcome to the beta version - This is a Working in Progress', 10);
    window.model = model;
  }
};

init();
