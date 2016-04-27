/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */
'use strict';

var $ = require('jQuery');

var stateMap = {
  actionTitles: null,
  print: null,
  saveReminders: null
};

/**
 * DOM FUNCTIONS
 */

var printPlan = function() {
  var printPage = document.createElement('div'),
    html = '<h1 class="text-center">Your Action Plan</h1>';

  printPage.classList.add('print-page');

  var planActions = [{
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }];

  var tHead = '<table class="table"><thead><tr><th>Title</th><th>type</th><th>Date</th><th>Details</th></tr></thead>',
    tBody = '<tbody>';

  for (var i = 0, len = planActions.length; i < len; i++) {
    tBody += '<tr><td>' + planActions[i].title + '</td>' +
      '<td>' + planActions[i].type + '</td>' +
      '<td>' + planActions[i].date + '</td>' +
      '<td>' + planActions[i].details + '</td><tr>';
  }

  tBody += '</tbody></table>';
  html += tHead + tBody;

  printPage.innerHTML = html;
  document.body.appendChild(printPage);
  document.body.classList.add('no-print');

  window.print();

  document.body.classList.remove('no-print');
  printPage.innerHTML = '';
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  if(event === 'printClicked') {
    stateMap.print.addEventListener('click', handler);
  } else if(event === 'savedReminders') {
    stateMap.saveReminders.addEventListener('click', handler);
  }
};

var render = function(cmd) {
  switch(cmd) {
    case 'createPopovers':
      $('.plan-wrapper .zmdi-info-outline').popover({
        placement: 'left'
      });
      break;
    case 'createDatepickers':
      $('.plan-wrapper .zmdi-calendar-alt')
        .datepicker({
          autoclose: true,
          format: 'M d yyyy'
        })
        .on('changeDate', function(event) {
          this.dataset.date = event.format();
        });
      break;
    case 'printPlan':
      printPlan();
      break;
  }
};

var setStateMap = function(container) {
  stateMap.actionTitles = container.getAll('action__title');
  stateMap.print = container.get('print');
  stateMap.saveReminders = container.get('sign__save');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};
