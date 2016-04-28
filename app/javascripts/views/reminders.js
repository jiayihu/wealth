/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */
'use strict';

var helpers = require('../helpers');

var stateMap = {
  print: null,
  saveReminders: null,
  signEmail: null
};

/**
 * Renders the table of actions picked by user and ordered by goal
 * @param  {Array} actionGroups Actions grouped by goal
 */
var showActionPlan = function(actionGroups) {
  
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  if(event === 'printClicked') {
    stateMap.print.addEventListener('click', handler);
  } else if(event === 'savedReminders') {
    stateMap.saveReminders.addEventListener('click', function() {
      var email = stateMap.signEmail.value;
      var isValid = helpers.isValidEmail(email);

      if(isValid) {
        handler(null, email);
      } else {
        handler(new Error('Not a valid email'), null);
      }
    });
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showActionPlan':
      showActionPlan(data);
      break;
    default:
      console.error('No cmd found.');
  }
};

var setStateMap = function(container) {
  stateMap.print = container.get('print');
  stateMap.saveReminders = container.get('sign__save');
  stateMap.signEmail = container.get('sign__email');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};
