/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */
'use strict';

var helpers = require('../helpers');
var $ = require('jQuery');

var stateMap = {
  print: null,
  saveReminders: null,
  signEmail: null,
  workPlan: null
};

var actionTemplate =
  '<tr>' +
    '<td>{toDo}</td>' +
    '<td>{notToDo}</td>' +
  '</tr>';

/**
 * Renders the table of actions picked by user and ordered by goal
 * @param  {Array} actionGroups Actions grouped by goal
 */
var showActionPlan = function(actionGroups) {
  console.log(actionGroups);
  var actionGroupMarkup = actionGroups.reduce(function(sumGroup, currGroup) {
    sumGroup +=
      '<h4 class="well"><a data-toggle="collapse" data-target=".' + currGroup.id + '">' + currGroup.title + '</a></h4>' +
      '<div class="collapse ' + currGroup.id + '">' +
      '<table class="table table-striped table-bordered">' +
        '<thead><tr><th class="to-do">Things to Do</th><th class="not-do">Things to Avoid</th></tr></thead>' +
      '<tbody>';

    sumGroup += currGroup.actions.reduce(function(sumActions, currAction) {
      return sumActions + helpers.template(actionTemplate, {
        toDo: currAction.toDo,
        notToDo: currAction.notToDo
      });
    }, '');

    sumGroup += '</tbody></table></div>';

    return sumGroup;
  }, '');

  stateMap.workPlan.innerHTML = actionGroupMarkup;
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  if(event === 'printClicked') {
    stateMap.print.addEventListener('click', function() {
      // Open the accordions and style the page before printing
      $('.step--reminders .collapse').collapse('show');
      document.body.classList.add('no-print');

      window.print();

      // Reset the page to its previous state
      document.body.classList.remove('no-print');
      $('.step--reminders .collapse').collapse('hide');
    });
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
  stateMap.workPlan = container.get('work-plan');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};
