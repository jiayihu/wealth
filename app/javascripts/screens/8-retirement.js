/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */

'use strict';

var $ = require('jQuery');

var configMap = {
  jsonUrl: 'scripts/model/actions.json'
};

var tbody,
  data;

/**
 * DOM FUNCTIONS
 */

var createActions = function(data) {
  var docFragment = document.createDocumentFragment(),
    row;

  data.actions.forEach(function(element, index) {
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
        handler(data.actions[Number(target.dataset.action)]);
      }
    });
  }
};

var init = function(container) {
  tbody = container.getElementsByTagName('tbody')[0];

  var request = new XMLHttpRequest();
  request.open('GET', configMap.jsonUrl, true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      data = JSON.parse(request.responseText);
      tbody.appendChild(createActions(data));
      //Tooltips
      $('.retirement-wrapper .zmdi-info-outline').tooltip();
    } else {
      console.log('Error with the connection.');
    }
  };
  request.onerror = function() {
    console.log('Error with the connection.');
  };
  request.send();
};

module.exports = {
  bind: bind,
  init: init
};
