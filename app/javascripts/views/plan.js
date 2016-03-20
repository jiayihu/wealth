/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */

'use strict';

var helpers = require('../helpers');
var $ = require('jQuery');

var stateMap = {
  tbody: null
};

var actionTemplate = '<tr><td><i class="zmdi zmdi-check-circle" data-action="{index}"></i></td>' +
  '<td>{toDo}</td>' +
  '<td>{notToDo}</td>' +
  '<td><i class="zmdi zmdi-info-outline" data-toggle="popover" data-placement="left" data-content="{details}""></i></td></tr>';


///////////////////
// DOM FUNCTIONS //
///////////////////

/**
 * Returns the markup for the goals
 * @param  {object} goal Object map with goal properties and its actions
 * @return {string}
 */
var getActionsHTML = function(goal) {
  var id = goal.id;
  var actions = goal.actions;
  var markup = '';

  if( (typeof id !== 'string') || (typeof actions !== 'object') ) {
    helpers.makeError('params', goal);
  }

  markup +=
    '<tr class="' + id + '">' +
      '<td colspan="4"><h4>' + id[0].toUpperCase() + id.slice(1) + '</h4></td>' +
    '</tr>';

  actions.forEach(function(action) {
    var details = action.details.reduce(function(prev, cur) {
      return prev + '<li>' + cur + '</li>';
    }, '');

    details = '<ul>' + details + '</ul>';
    markup += helpers.template(actionTemplate, {
      id: id,
      index: action.id,
      toDo: action.toDo,
      notToDo: action.notToDo,
      details: details
    });
  });

  return markup;
};


//////////////////////
// RENDER FUNCTIONS //
//////////////////////

var showGoalsActions = function(data) {
  var goals = data;
  if(!Array.isArray(goals)) {
    helpers.makeError('params', goals);
  }

  if(goals.length == 0) {
    return;
  }

  var actionsHTML = '';

  goals.forEach(function(goal) {
    actionsHTML += getActionsHTML(goal);
  });

  stateMap.tbody.innerHTML = actionsHTML;
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'actionToggled') {
    stateMap.tbody.addEventListener('click', function(event) {
      var target = event.target;
      if (target.nodeName === 'I' && target.classList.contains('zmdi-check-circle')) {
        target.classList.toggle('saved');
        console.log(target.dataset.action);
      }
    });
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showGoalsActions':
      showGoalsActions(data);
      break;
    case 'createPopovers':
      $('.step--plan .zmdi-info-outline').popover({
        html: true,
        title: 'Details'
      });
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.tbody = container.getElementsByTagName('tbody')[0];
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};
