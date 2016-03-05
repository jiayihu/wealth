/**
 * Screen #3 - You module
 * @module 3-you
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = require('wNumb');
var $ = require('jQuery');
var Chartist = require('chartist');

var stateMap = {
  chartNode: null,
  $pieChart: null,
  basicSlider: null,
  expensesSlider: null,
  savingsSlider: null,
  detailsList: null
};

////////////////////
// DOM FUNCTIONS ///
////////////////////

var createPieTooltip = function(pieChart, income) {
  var $chart = $(pieChart);
  var $toolTip = $chart
    .append('<div class="pie-tooltip"></div>')
    .find('.pie-tooltip')
    .hide();
  var moneyFormat = wNumb({
    thousand: '.',
    prefix: '$ '
  });
  var isTooltipShown = false;

  //For mobiles
  $chart.on('click mouseenter', '.ct-slice-donut', function(e) {
    if (!isTooltipShown || e.type === 'mouseenter') {
      var $slice = $(this);
      var value = $slice.attr('ct:value');
      var seriesName = $slice.parent().attr('ct:series-name');
      $toolTip
      .html(
        '<strong>' + seriesName + '</strong>: ' +
          value + '%/ ' +
        moneyFormat.to(Number(value) / 100 * income)
      )
      .show();
      isTooltipShown = true;
    } else {
      $toolTip.hide();
      isTooltipShown = false;
    }
  });

  $chart.on('mouseleave', '.ct-slice-donut', function() {
    $toolTip.hide();
  });

  $chart.on('click mousemove', function(event) {
    $toolTip.css({
      left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
      top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 30
    });
  });
};

var getDetailsList = function(detailTemplate, detailsNames, defaultValues) {
  var listHTML = '';
  detailsNames.forEach(function(name, index) {
    listHTML += helpers.template(detailTemplate, {
      name: name,
      value: defaultValues[index]
    });
  });
  return listHTML;
};

var showDetailed = function() {
  var detailsNames = ['Food at home', 'Food away from home', 'Housing', 'Utilities, fuels, public services', 'Apparel & services', 'Trasportation', 'Healthcare', 'Entertainment & Reading', 'Education', 'Miscellaneous'];
  var defaultValues = [12, 3, 36, 5, 4, 12, 9, 5, 5, 9];
  var detailTemplate =
    '<li class="detail">' +
      '<span class="detail__name">{name}</span>' +
      '<input class="detail__value" type="number" value="{value}" name="{name}" >' +
    '</li>';

  stateMap.detailsList.innerHTML = getDetailsList(detailTemplate, detailsNames, defaultValues);
  stateMap.detailsList.addEventListener('change', function(e) {
    if(e.target.classList.contains('detail__value')) {
      console.log('Details changed: ', e);
    }
  });
};

var showSliders = function(data) {
  var basicRate = data.basicRate;
  var discRate = data.discRate;
  var currentSavings = data.currentSavings;

  //We check data are all numbers by summing them
  if(typeof (basicRate + discRate + currentSavings) !== 'number') {
    helpers.makeError('params', data);
  }

  var basicOptions = {
    start: basicRate,
    step: 1,
    range: {
      'min': 1,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  };
  var discOptions = {
    start: discRate,
    step: 1,
    range: {
      'min': 1,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  };
  var savingsOptions = {
    start: currentSavings,
    step: 1000,
    range: {
      'min': 1000,
      'max': 500000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  };

  domHelpers.createSlider(stateMap.basicSlider, basicOptions, '%');
  domHelpers.createSlider(stateMap.expensesSlider, discOptions, '%');
  domHelpers.createSlider(stateMap.savingsSlider, savingsOptions, '$');
};

var showPieChart = function(data) {
  var income = data.income;
  var basicRate = data.basicRate;
  var discRate = data.discRate;
  var savingsRate = 100 - basicRate - discRate;

  //We check data are all numbers by summing them
  if(typeof savingsRate !== 'number') {
    helpers.makeError('params', data);
  }

  var pieData = {
    series: [
      {
        value: basicRate,
        name: 'Basic Needs'
      },
      {
        value: discRate,
        name: 'Discretionary'
      },
      {
        value: savingsRate,
        name: 'Savings'
      }
    ]
  };
  var pieOptions = {
    donut: true,
    donutWidth: 20,
    chartPadding: 10,
    labelOffset: 50,
    width: '220px',
    height: '220px'
  };
  var pieResponsiveOptions = [
    ['screen and (max-width: 480px)', {
      donutWidth: 30,
      width: '280px',
      height: '280px'
    }]
  ];

  stateMap.$pieChart = new Chartist.Pie(stateMap.chartNode, pieData, pieOptions, pieResponsiveOptions);
  createPieTooltip(stateMap.chartNode, income);
};

/**
 * Update the view of the Doughnut when sliders values change
 * @param {object} rates Object with the new rates
 * @example
 * updatePieChart({
 *   basicRate: 30,
 *   discRate: 40,
 *   savingsRate: 30
 * })
 */
var updatePieChart = function(rates) {
  var updatedData = {
    series: [
      {
        value: rates.basicRate,
        name: 'Basic Needs'
      },
      {
        value: rates.discRate,
        name: 'Discretionary'
      },
      {
        value: rates.savingsRate,
        name: 'Savings'
      }
    ]
  };
  stateMap.$pieChart.update(updatedData);
};


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * Used by shell to bind event handlers to this module DOM events. It usually
 * means that we want the shell to update model when user interacts with this
 * screen.
 * @param  {string} event Event name
 * @param  {function} handler Event handler
 */
var bind = function(event, handler) {
  switch (event) {
    case 'basicRateChanged':
      stateMap.basicSlider.noUiSlider.on('set', function(values) {
        handler( Number(values[0]) );
      });
      break;
    case 'discRateChanged':
      stateMap.expensesSlider.noUiSlider.on('set', function(values) {
        handler( Number(values[0]) );
      });
      break;
    case 'currentSavingsChanged':
      stateMap.savingsSlider.noUiSlider.on('set', function(values) {
        handler(Number(values[0].replace('.', '')));
      });
      break;
    default:
      return;
  }
};

/**
 * Used by shell to set the sliders values when data is changed on some other
 * screens.
 * @param {object} data Object with sliderName and value properties
 */
var setSlider = function(data) {
  var sliderName = data.sliderName;
  var value = data.value;

  if( (typeof sliderName !== 'string') || (typeof value !== 'number') ) {
    helpers.makeError('params', data);
  }

  if (sliderName === 'basic') {
    stateMap.basicSlider.noUiSlider.set(value);
  } else if (sliderName === 'discretionary') {
    stateMap.expensesSlider.noUiSlider.set(value);
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showSliders':
      showSliders(data);
      break;
    case 'showPieChart':
      showPieChart(data);
      break;
    case 'showDetailed':
      showDetailed();
      break;
    case 'setSlider':
      setSlider(data);
      break;
    case 'updatePieChart':
      updatePieChart(data);
      break;
    case 'updatePieTooltip':
      createPieTooltip(stateMap.chartNode, data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.basicSlider = container.get('about__savings__slider--needs');
  stateMap.expensesSlider = container.get('about__savings__slider--expenses');
  stateMap.savingsSlider = container.get('current-savings__slider');

  stateMap.chartNode = container.get('about__savings__circle');

  stateMap.detailsList = container.get('details-values');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};
