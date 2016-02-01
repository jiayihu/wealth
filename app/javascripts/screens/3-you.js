/**
 * Screen #3 - You module
 * @module 3-you
 */

'use strict';

var helpers = require('../helpers');
var wNumb = require('wNumb');
var $ = require('jQuery');
var Chartist = require('chartist');

var configMap = {
  aboutIncome: 60000,
  needsSlider: 'about__savings__slider--needs',
  expensesSlider: 'about__savings__slider--expenses',
  savingsSlider: 'current-savings__slider',
  //Slider options
  needsOptions: {
    start: 45,
    step: 1,
    range: {
      'min': 1,
      'max': 60
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
      'max': 40
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
  doughnutClass: 'about__savings__circle',
  doughnutData: {
    series: [{
      value: 45,
      name: 'Basic Needs'
    }, {
      value: 25,
      name: 'Discretionary'
    }]
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
      width: '170px',
      height: '170px'
    }]
  ]
};

var stateMap = {
  $pieChart: null,
  needsSlider: null,
  expensesSlider: null,
  savingsSlider: null
};


////////////////////
// DOM FUNCTIONS ///
////////////////////


var onChartDraw = function(data) {
  if (data.type === 'slice') {
    var pathLength = data.element._node.getTotalLength();
    data.element.attr({
      'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
    });
    var animationDefinition = {
      'stroke-dashoffset': {
        id: 'anim' + data.index,
        dur: 1000,
        from: -pathLength + 'px',
        to: '0px',
        easing: Chartist.Svg.Easing.easeOutQuint,
        fill: 'freeze'
      }
    };

    if (data.index !== 0) {
      animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
    }

    data.element.attr({
      'stroke-dashoffset': -pathLength + 'px'
    });
    data.element.animate(animationDefinition, false);
  }
};

var createDoughnutTooltip = function() {
  var $chart = $('.' + configMap.doughnutClass), //@FIXME isn't it stateMap.$pieChart?
    $toolTip = $chart
    .append('<div class="pie-tooltip"></div>')
    .find('.pie-tooltip')
    .hide();
  var moneyFormat = wNumb({
    thousand: '.',
    prefix: '$ '
  });

  var isTooltipShown = false;

  $chart.on('mouseenter', '.ct-slice-donut', function() {
    var $slice = $(this),
      value = $slice.attr('ct:value'),
      seriesName = $slice.parent().attr('ct:series-name');
    $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
      moneyFormat.to(Number(value) / 100 * configMap.aboutIncome)).show();
  });

  //For mobiles
  $chart.on('click', '.ct-slice-donut', function() {
    if (!isTooltipShown) {
      var $slice = $(this),
        value = $slice.attr('ct:value'),
        seriesName = $slice.parent().attr('ct:series-name');
      $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
        moneyFormat.to(Number(value) / 100 * configMap.aboutIncome)).show();
      isTooltipShown = true;
    } else {
      $toolTip.hide();
      isTooltipShown = false;
    }
  });

  $chart.on('mouseleave', '.ct-slice-donut', function() {
    $toolTip.hide();
  });

  $chart.on('mousemove', function(event) {
    $toolTip.css({
      left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
      top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 30
    });
  });
};

var createChart = function(htmlNode) {
  configMap.doughnutData.series[2] = {
    value: 100 - configMap.doughnutData.series[0].value - configMap.doughnutData.series[1].value,
    name: 'Savings'
  };

  stateMap.$pieChart = new Chartist.Pie(
    htmlNode,
    configMap.doughnutData,
    configMap.doughnutOptions,
    configMap.doughnutResponsiveOptions);

  stateMap.$pieChart.on('draw', onChartDraw);
  createDoughnutTooltip();
};


/**
 * Update the view of the Doughnut when sliders value change
 * @param {string} slider The name of the slider which changed
 */
var updateDOMDoughnut = function(slider, values) {
  if (slider === 'needsSlider') {
    configMap.doughnutData.series[0].value = Number(values[0]);
  } else {
    configMap.doughnutData.series[1].value = Number(values[0]);
  }
  configMap.doughnutData.series[2].value = 100 - configMap.doughnutData.series[0].value - configMap.doughnutData.series[1].value;
  stateMap.$pieChart.update();
};

/**
 * PUBLIC FUNCTIONS
 */

/**
 * Used by shell to bind event handlers to this module DOM events. It usually
 * means that we want the shell to update model when user interacts with this
 * screen.
 */
var bind = function(event, handler) {
  if (event === 'basicNeedsChanged') {
    stateMap.needsSlider.noUiSlider.on('change', function(values) {
      updateDOMDoughnut('needsSlider', values);
      handler(configMap.doughnutData.series[0].value, configMap.doughnutData.series[2].value);
    });
  } else if (event === 'expensesChanged') {
    stateMap.expensesSlider.noUiSlider.on('change', function(values) {
      updateDOMDoughnut('expensesSlider', values);
      handler(configMap.doughnutData.series[1].value, configMap.doughnutData.series[2].value);
    });
  } else if (event === 'savingsChanged') {
    stateMap.savingsSlider.noUiSlider.on('change', function(values) {
      handler(Number(values[0].replace('.', '')));
    });
  }
};

var configModule = function(inputMap) {
  helpers.setConfigMap(inputMap, configMap);
};

var init = function(container) {
  stateMap.needsSlider = container.getElementsByClassName(configMap.needsSlider)[0];
  stateMap.expensesSlider = container.getElementsByClassName(configMap.expensesSlider)[0];
  stateMap.savingsSlider = container.getElementsByClassName(configMap.savingsSlider)[0];
  var doughnutHtml = container.getElementsByClassName(configMap.doughnutClass)[0];

  //Create sliders
  helpers.createSlider(stateMap.needsSlider, configMap.needsOptions);
  stateMap.needsSlider.noUiSlider.on('update', function(values) {
    var tooltip = stateMap.needsSlider.getElementsByTagName('span')[0];
    tooltip.innerHTML = helpers.format(values[0], '%');
  });

  helpers.createSlider(stateMap.expensesSlider, configMap.expensesOptions);
  stateMap.expensesSlider.noUiSlider.on('update', function(values) {
    var tooltip = stateMap.expensesSlider.getElementsByTagName('span')[0];
    tooltip.innerHTML = helpers.format(values[0], '%');
  });

  helpers.createSlider(stateMap.savingsSlider, configMap.savingsOptions);
  stateMap.savingsSlider.noUiSlider.on('update', function(values) {
    var tooltip = stateMap.savingsSlider.getElementsByTagName('span')[0];
    tooltip.innerHTML = helpers.format(values[0], '$');
  });

  //Init Doughnut Chart
  createChart(doughnutHtml);
};

module.exports = {
  bind: bind,
  configModule: configModule,
  init: init
};
