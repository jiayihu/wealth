/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */

'use strict';

var $ = require('jQuery');
var actionsList = require('../model/actions');

var tbody;


///////////////////
// DOM FUNCTIONS //
///////////////////


var createActions = function(actionsList) {
  var docFragment = document.createDocumentFragment(),
    row;

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
    tbody.addEventListener('click', function(event) {
      var target = event.target;
      if (target.nodeName === 'I' && target.classList.contains('zmdi-check-circle')) {
        target.classList.toggle('saved');
        console.log(actionsList[Number(target.dataset.action)]);
        handler(actionsList[Number(target.dataset.action)]);
      }
    });
  }
};

var init = function(container) {
  tbody = container.getElementsByTagName('tbody')[0];
  tbody.appendChild(createActions(actionsList));

  //Tooltips
  $('.retirement-wrapper .zmdi-info-outline').tooltip();
};

module.exports = {
  bind: bind,
  init: init
};
