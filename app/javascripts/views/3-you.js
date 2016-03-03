/**
 * Screen #3 - You module
 * @module 3-you
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var notie = require('notie');
var wNumb = require('wNumb');
var $ = require('jQuery');
var Chartist = require('chartist');

var configMap = {
  aboutIncome: 60000,
  //Slider options
  needsOptions: {
    start: 45,
    step: 1,
    range: {
      'min': 1,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  },
  expensesOptions: {
    start: 25,
    step: 1,
    range: {
      'min': 1,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  },
  savingsOptions: {
    start: 10000,
    step: 1000,
    range: {
      'min': 1000,
      'max': 500000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  },
  //Doughnut options
  doughnutData: {
    series: [
      {
        value: 45,
        name: 'Basic Needs'
      },
      {
        value: 25,
        name: 'Discretionary'
      },
      {
        value: 30,
        name: 'Savings'
      }
    ]
  },
  doughnutOptions: {
    donut: true,
    donutWidth: 20,
    chartPadding: 10,
    labelOffset: 50,
    width: '220px',
    height: '220px'
  },
  doughnutResponsiveOptions: [
    ['screen and (max-width: 480px)', {
      donutWidth: 30,
      width: '280px',
      height: '280px'
    }]
  ]
};

var stateMap = {
  $pieChart: null,
  basicSlider: null,
  expensesSlider: null,
  savingsSlider: null,
  detailsList: null
};

// Variables by reference
var basicRate = configMap.doughnutData.series[0];
var discRate = configMap.doughnutData.series[1];
var savingsRate = configMap.doughnutData.series[2];


////////////////////
// PURE FUNCTIONS //
////////////////////

/**
 * Returns if the rate value is valid, that is not superior to 100 if summed with
 * the other rate
 * @param  {[type]} type [description]
 * @param  {[type]} value [description]
 * @return {[type]}
 */
var isRateValid = function(type, value) {
  if(typeof value !== 'number') {
    throw new Error('isRateValid(): wrong param: ' + JSON.stringify(value));
  }

  if( (type === 'basic') && (value + discRate.value > 100) ) {
    return false;
  }
  if( (type === 'discretionary') && (value + basicRate.value > 100) ) {
    return false;
  }

  return true;
};

////////////////////
// DOM FUNCTIONS ///
////////////////////

var createDoughnutTooltip = function(pieChart) {
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
        moneyFormat.to(Number(value) / 100 * configMap.aboutIncome)
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

var createChart = function(htmlNode) {
  var chart = new Chartist.Pie(
    htmlNode,
    configMap.doughnutData,
    configMap.doughnutOptions,
    configMap.doughnutResponsiveOptions);
  stateMap.$pieChart = chart;
  return chart.container;
};

var createSliders = function() {
  domHelpers.createSlider(stateMap.basicSlider, configMap.needsOptions, '%');
  domHelpers.createSlider(stateMap.expensesSlider, configMap.expensesOptions, '%');
  domHelpers.createSlider(stateMap.savingsSlider, configMap.savingsOptions, '$');
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

var renderDetailed = function() {
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
      // updateSerie(e.target.name, Number(e.target.value));
      // render();
    }
  });
};

var setStateMap = function(container) {
  stateMap.basicSlider = container.get('about__savings__slider--needs');
  stateMap.expensesSlider = container.get('about__savings__slider--expenses');
  stateMap.savingsSlider = container.get('current-savings__slider');

  stateMap.detailsList = container.get('details-values');
};

/**
 * Update the view of the Doughnut when sliders value change
 * @param {string} slider The name of the slider which changed
 * @param {number} value New value
 */
var updateDOMDoughnut = function(slider, value) {
  if (slider === 'basicSlider') {
    basicRate.value = value;
  } else {
    discRate.value = value;
  }
  savingsRate.value = 100 - basicRate.value - discRate.value;
  stateMap.$pieChart.update();
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
    case 'basicNeedsChanged':
      stateMap.basicSlider.noUiSlider.on('set', function(values) {
        var value = Number(values[0]);
        if(isRateValid('basic', value)) {
          updateDOMDoughnut('basicSlider', value);
          handler(basicRate.value, savingsRate.value);
        } else {
          this.set(basicRate.value);
          helpers.makeError('user', 'Error: the sum of basic & discretionary rates are superior than 100', notie.alert.bind(null, 3));
        }
      });
      break;
    case 'expensesChanged':
      stateMap.expensesSlider.noUiSlider.on('set', function(values) {
        var value = Number(values[0]);
        if(isRateValid('discretionary', value)) {
          updateDOMDoughnut('expensesSlider', value);
          handler(discRate.value, savingsRate.value);
        } else {
          this.set(discRate.value);
          helpers.makeError('user', 'Error: the sum of basic & discretionary rates are superior than 100', notie.alert.bind(null, 3));
        }
      });
      break;
    case 'savingsChanged':
      stateMap.savingsSlider.noUiSlider.on('set', function(values) {
        handler(Number(values[0].replace('.', '')));
      });
      break;
    default:
      return;
  }
};

var configModule = function(inputMap) {
  helpers.setConfigMap(inputMap, configMap);
};

/**
 * Used by shell to set the sliders values when data is changed on some other
 * screens, for example the income.
 * @param  {string} slider Slider name
 * @param  {string} value Value
 */
var setSlider = function(slider, value) {
  if (slider === 'basic') {
    stateMap.basicSlider.noUiSlider.set(value);
  } else if (slider === 'discretionary') {
    stateMap.expensesSlider.noUiSlider.set(value);
  }
};

var init = function(container) {
  setStateMap(container);
  createSliders();
  createDoughnutTooltip(
    createChart(container.get('about__savings__circle'))
  );
  renderDetailed();
};

module.exports = {
  bind: bind,
  configModule: configModule,
  init: init,
  setSlider: setSlider
};
