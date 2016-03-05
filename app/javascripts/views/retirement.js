/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */

'use strict';

var $ = require('jQuery');
var actionsList = require('../model/actions');

var stateMap = {
  tbody: null
};


///////////////////
// DOM FUNCTIONS //
///////////////////


var createActions = function(actionsList) {
  var docFragment = document.createDocumentFragment();
  var row;

  actionsList.forEach(function(element, index) {
    row = document.createElement('tr');
    row.innerHTML = '<td><i class="zmdi zmdi-check-circle" data-action="' + index + '"></i></td>' +
      '<td>' + element.todo + '</td>' +
      '<td>' + element.todonot + '</td>' +
      '<td><i class="zmdi zmdi-info-outline" data-toggle="tooltip" data-placement="left" title="' + element.why + '"></i></td>';
    docFragment.appendChild(row);
  });
  return docFragment;
};

/**
 * EVENT HANDLERS
 */

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'actionToggled') {
    stateMap.tbody.addEventListener('click', function(event) {
      var target = event.target;
      if (target.nodeName === 'I' && target.classList.contains('zmdi-check-circle')) {
        target.classList.toggle('saved');
        handler(actionsList[Number(target.dataset.action)]);
      }
    });
  }
};

var render = function(cmd) {
  switch(cmd) {
    case 'showActions':
      stateMap.tbody.appendChild(createActions(actionsList));
      break;
    case 'createTooltips':
      $('.retirement-wrapper .zmdi-info-outline').tooltip();
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
