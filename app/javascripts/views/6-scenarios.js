/**
 * Screen #6 - Scenarios module
 * @module 6-Scenarios
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = require('wNumb');
var Chartist = require('chartist');

var configMap = {
  savingsRate: 30,
  income: 60000,
  annualSavings: 18000,
  aboutAge: 35,
  //compound interest
  currentSavings: 1000,
  annualInterestRate: 0.06,
  investmentTermYrs: 30,
  //Advanced settings
  investment: 100,
  retirementAge: 65,
  //Sliders options
  savingRateSlider: 'option__slider--saving',
  incomeRateSlider: 'option__slider--income',
  investmentRateSlider: 'option__slider--investment',
  retirementSlider: 'option__slider--retirement',
  savingRateOptions: {
    start: 30,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  },
  incomeOptions: {
    start: 60000,
    step: 1000,
    range: {
      'min': 18000,
      'max': 200000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  },
  investmentOptions: {
    start: 100,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  },
  retirementOptions: {
    start: 65,
    step: 1,
    range: {
      'min': 65,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  },
  //Line chart options
  chartClass: '.scenario__chart',
  chartData: {
    labels: [18, 25, 35, 45, 55, 65],
    series: [
      [35000, 245000, 595000, 945000, 1295000, 1645000]
    ]
  },
  chartOptions: {
    axisY: {
      labelInterpolationFnc: function(value) {
        return (value/1000) + 'K';
      },
      high: 2000000,
      ticks: [0, 250000, 500000, 750000, 1000000, 1250000, 1500000, 1750000, 2000000],
      type: Chartist.FixedScaleAxis
    },
    showArea: true,
    width: '400px',
    height: '250px'
  },
  chartResponsiveOptions: [
    ['screen and (max-width: 480px)', {
      width: '300px'
    }]
  ],
  //savings at retirement age
  retirementSavingsHTML: 'savings__amount'
};

var savingRateSlider, incomeRateSlider, investmentRateSlider, retirementSlider,
  investmentStyleButtons,
  lineChart,
  retirementSavings;

var moneyFormat = wNumb({
  thousand: ','
});

///////////////////
// DOM FUNCTIONS //
///////////////////

/**
 * Create the sliders and show the value on a tooltip when the user interacts
 */
var createSliders = function() {
  domHelpers.createSlider(savingRateSlider, configMap.savingRateOptions, '%');

  domHelpers.createSlider(incomeRateSlider, configMap.incomeOptions, '$');

  domHelpers.createSlider(investmentRateSlider, configMap.investmentOptions, '%');

  domHelpers.createSlider(retirementSlider, configMap.retirementOptions);
};


////////////////////
// EVENT HANDLERS //
////////////////////


/**
 * Updates the line chart with the new investment style chosen by user
 * @param  {object} event Event object
 */
var investmentStyleButtonsHandler = function(event) {
  var investmentStyle = event.target.value;

  switch (investmentStyle) {
    case 'safe':
      configMap.annualInterestRate = 0.02;
      break;
    case 'moderate':
      configMap.annualInterestRate = 0.06;
      break;
    case 'risky':
      configMap.annualInterestRate = 0.15;
      break;
  }

  updateLineChart();
};

/**
 * Updates the line chart when user interacts with the sliders
 */
var bindSlidersToChart = function() {
  savingRateSlider.noUiSlider.on('change', function(values) {
    configMap.savingsRate = Number(values[0]);
    updateLineChart();
  });
  incomeRateSlider.noUiSlider.on('change', function(values) {
    configMap.income = Number(values[0].replace('.', ''));
    updateLineChart();
  });

  //Advanced options
  investmentRateSlider.noUiSlider.on('change', function(values) {
    configMap.investment = Number(values[0]);
    updateLineChart();
  });
  retirementSlider.noUiSlider.on('change', function(values) {
    configMap.retirementAge = Number(values[0]);
    updateLineChart();
  });
};


////////////////////////////////
// COMPOUND INTEREST FUNCTION //
////////////////////////////////


/**
 * Returns the accumulated money
 * @param  {number} interestRate % of interest (from 0 to 1)
 * @param  {number} term Years
 * @param  {number} amtInvested Initial investment
 * @param  {number} contribAmt Monthly contribution
 * @return {number}
 */
var getAccumulatedValue = function(interestRate, term, amtInvested, contribAmt) {
  var app = [];
  app[0] = amtInvested;
  var total = 0;
  var monthlyTerm = term * 12;
  var monthlyContribAmt = contribAmt / 12;

  for (var i = 1; i <= monthlyTerm; i++) {
    var appreciation = (interestRate / 12) * (app[i - 1]);
    app[i] = appreciation + app[i - 1] + monthlyContribAmt;
    total = app[i - 1];
  }
  app = null;
  return Math.round(total);
};


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////


/**
 * Returns an array containing the values for x axis. In our case it's used to
 * show the savings progress as the years increase towards the retirement age.
 * @param  {Number} firstValue First value of the axis
 * @param  {Number} lastValue Last value of the axis
 * @return {Array}
 */
var getAbscissas = function(firstValue, lastValue) {
  var values = [];
  //First and last values must be precise
  values[0] = firstValue;
  values[5] = lastValue;

  var difference = (lastValue - firstValue) / 5;
  for (var i = 1; i < 5; i++) {
    values[i] = Math.round(firstValue + (difference * i));
  }

  return values;
};

/**
 * @NOTE VERY IMPORTANT! This is the function which actually updates the line
 * chart based on user interactions.
 */
var updateLineChart = function() {
  var xValues = getAbscissas(configMap.aboutAge, configMap.retirementAge);
  var i = 0;

  configMap.chartData.labels = xValues;

  // We are also considering the investment rate in Advanced options.
  // So this is (annualSavings * investmentRate) to be precise.
  configMap.annualSavings = (configMap.savingsRate / 100) * configMap.income * (configMap.investment / 100);

  //We are settings the first Y value of the line chart, which corresponds
  //to the initial investment.
  configMap.chartData.series[0][0] = configMap.currentSavings;

  //We calculate and the other values for the line chart with the Compound interest function
  for (i = 1; i < 6; i += 1) {
    configMap.chartData.series[0][i] =
      getAccumulatedValue(configMap.annualInterestRate, xValues[i] - xValues[0], configMap.currentSavings, configMap.annualSavings);
  }

  //We set the first tick (absolute value) to the initial investment. It would be
  //otherwise 0.
  configMap.chartOptions.axisY.ticks[0] = configMap.currentSavings;

  lineChart.update(configMap.chartData, configMap.chartOptions);

  //Updates the amount of savings at retirement age
  retirementSavings.childNodes[1].textContent = moneyFormat.to(configMap.chartData.series[0][5]);
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
  if (slider === 'income') {
    incomeRateSlider.noUiSlider.set(value);
  } else if (slider === 'savingsRate') {
    savingRateSlider.noUiSlider.set(value);
  }
};

var init = function(container) {
  savingRateSlider = container.getElementsByClassName(configMap.savingRateSlider)[0];
  incomeRateSlider = container.getElementsByClassName(configMap.incomeRateSlider)[0];
  investmentRateSlider = container.getElementsByClassName(configMap.investmentRateSlider)[0];
  retirementSlider = container.getElementsByClassName(configMap.retirementSlider)[0];
  retirementSavings = container.getElementsByClassName(configMap.retirementSavingsHTML)[0];

  investmentStyleButtons = container.querySelectorAll('input[name="investment-style"]');
  investmentStyleButtons.forEach(function(element) {
    element.addEventListener('change', investmentStyleButtonsHandler);
  });

  createSliders();
  //Line Chart
  lineChart = new Chartist.Line(configMap.chartClass, configMap.chartData, configMap.chartOptions, configMap.chartResponsiveOptions);
  updateLineChart();
  bindSlidersToChart();
};

module.exports = {
  updateLineChart: updateLineChart,
  configModule: configModule,
  init: init,
  getAbscissas: getAbscissas,
  setSlider: setSlider
};
