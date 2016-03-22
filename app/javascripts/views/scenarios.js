/**
 * Screen #6 - Scenarios module
 * @module 6-Scenarios
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = require('wNumb');
var Chartist = require('chartist');

var stateMap = {
  incomeSlider: null,
  investmentRateSlider: null,
  retirementSlider: null,

  investmentStyle: null,
  lineChart: null,
  retirementSavings: null
};


///////////////////////
// HELPERS FUNCTIONS //
///////////////////////

var moneyFormat = wNumb({
  thousand: ','
});

/**
 * returns the annualInterestRate relative to a given investment style
 * @param  {string} investmentStyle   Style of investment
 * @return {number} annualInterestRate
 */
var getInterestByInvestment = function(investmentStyle) {
  if(typeof investmentStyle !== 'string') {
    helpers.makeError('params', investmentStyle);
  }

  var annualInterestRate;

  switch (investmentStyle) {
    case 'safe':
      annualInterestRate = 0.02;
      break;
    case 'moderate':
      annualInterestRate = 0.06;
      break;
    case 'risky':
      annualInterestRate = 0.15;
      break;
    default:
      annualInterestRate = 0.06;
  }

  return annualInterestRate;
};

/**
 * Returns the accumulated money with the compound interest
 * @param  {number} interestRate % of interest (from 0 to 1)
 * @param  {number} term Years
 * @param  {number} amtInvested Initial investment
 * @param  {number} contribAmt Yearly contribution
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


/**
 * Returns an array containing the values for x axis ticks. You pass the first
 * and last values as parameters and it returns also the other values of the range.
 * In our case it's used to show the savings progress as the years increase
 * towards the retirement age.
 * @param  {Number} firstValue First value of the axis
 * @param  {Number} lastValue Last value of the axis
 * @return {Array}
 */
var getXTicks = function(firstValue, lastValue) {
  if(!helpers.isNumber(firstValue + lastValue)) {
    helpers.makeError('params', {firstValue: firstValue, lastValue: lastValue});
  }

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
 * Returns an array with the Y axis values
 * @param  {object} data Object with data needed for the calculation
 * @return {array} serie Array with Y axis values
 * @example
 * getYSerie({
 *   income: 35000,
 *   investmentRate: 100,
 *   savingsRate: 30,
 *   currentSavings: 20000,
 *   xTicks: [23, 33, 43, 53, 63, 73],
 *   annualInterestRate: 0.06
 * })
 */
var getYSerie = function(data) {
  var income = data.income;
  var investmentRate = data.investmentRate;
  var savingsRate = data.savingsRate;
  var currentSavings = data.currentSavings;
  var xTicks = data.xTicks;
  var annualInterestRate =  data.annualInterestRate;

  if(
    !helpers.isNumber(income + investmentRate + savingsRate + currentSavings + annualInterestRate) ||
    !Array.isArray(xTicks)
  ) {
    helpers.makeError('params', data);
  }

  // We are also considering the investment rate in Advanced options.
  // So this is (annualSavings * investmentRate) to be precise.
  var annualSavings = (savingsRate / 100) * income * (investmentRate / 100);

  var i = 0;
  var serie = [];

  //We are settings the first Y value of the line chart, which corresponds
  //to the initial investment.
  serie[0] = currentSavings;

  //We calculate the other values of Y serie with the Compound interest function
  for (i = 1; i < 6; i+= 1) {
    serie[i] = getAccumulatedValue(
      annualInterestRate,
      xTicks[i] - xTicks[0],
      currentSavings,
      annualSavings
    );
  }

  return serie;
};

var updateRetirementSavings = function(retirementSavings) {
  stateMap.retirementSavings.childNodes[1].textContent = moneyFormat.to(retirementSavings);
};

//////////////////////
// RENDER FUNCTIONS //
//////////////////////


var showSliders = function(data) {
  var income = data.income;
  var savingsRate = data.savingsRate;

  //We check data are all numbers by summing them
  if(!helpers.isNumber(income + savingsRate)) {
    helpers.makeError('params', data);
  }

  var savingRateOptions = {
    start: savingsRate,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  };
  var incomeOptions = {
    start: income,
    step: 1000,
    range: {
      'min': 18000,
      'max': 200000
    },
    format: wNumb({
      decimals: 1,
      thousand: ','
    })
  };

  var investmentOptions = {
    start: 100,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  };
  var retirementOptions = {
    start: 65,
    step: 1,
    range: {
      'min': 55,
      'max': 75
    },
    format: wNumb({
      decimals: 0
    })
  };

  domHelpers.createSlider(stateMap.savingRateSlider, savingRateOptions, '%');
  domHelpers.createSlider(stateMap.incomeSlider, incomeOptions, '$');
  domHelpers.createSlider(stateMap.investmentRateSlider, investmentOptions, '%');
  domHelpers.createSlider(stateMap.retirementSlider, retirementOptions);
};

var showLineChart = function(data) {
  var age = data.age;
  var income = data.income;
  var savingsRate = data.savingsRate;
  var currentSavings = data.currentSavings;

  if(!helpers.isNumber(age + income + savingsRate + currentSavings)) {
    helpers.makeError('params', data);
  }

  var annualInterestRate = 0.06;
  var investmentRate = Number( stateMap.investmentRateSlider.noUiSlider.get() );
  var retirementAge = Number( stateMap.retirementSlider.noUiSlider.get() );
  var xTicks = getXTicks(age, retirementAge);
  var ySerie = getYSerie({
    income: income,
    investmentRate: investmentRate,
    savingsRate: savingsRate,
    currentSavings: currentSavings,
    xTicks: xTicks,
    annualInterestRate: annualInterestRate
  });
  var chartData = {
    labels: xTicks,
    series: [ySerie]
  };
  var chartOptions = {
    axisY: {
      labelInterpolationFnc: function(value) {
        return (value/1000) + 'K';
      },
      high: 2000000,
      ticks: [currentSavings, 250000, 500000, 750000, 1000000, 1250000, 1500000, 1750000, 2000000],
      type: Chartist.FixedScaleAxis
    },
    showArea: true,
    width: '400px',
    height: '250px'
  };
  var responsiveOptions = [
    ['screen and (max-width: 480px)', {
      width: '300px'
    }]
  ];

  stateMap.lineChart = new Chartist.Line('.scenario__chart', chartData, chartOptions, responsiveOptions);
  updateRetirementSavings(ySerie[5]);
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

  if (sliderName === 'income') {
    stateMap.incomeSlider.noUiSlider.set(value);
  } else if (sliderName === 'savingsRate') {
    stateMap.savingRateSlider.noUiSlider.set(value);
  }
};

/**
 * Updates the line chart with a new Y serie when user changes investment style
 * @param  {object} data Object with the data needed to calculate the serie
 * @example
 * updateLineChartSerie({
 *   income: 30000,
 *   investmentRate: 100, //optional
 *   savingsRate: 30,
 *   annualInterestRate: 0.06, //optional
 *   age: 20,
 *   retirementAge: 65, //optional
 *   currentSavings: 20000
 * })
 */
var updateLineChartSerie = function(data) {
  var lineChart = stateMap.lineChart;
  var chartData = lineChart.data;
  var chartOptions = lineChart.options;

  var age = data.age;
  var investmentRate = data.investmentRate || Number( stateMap.investmentRateSlider.noUiSlider.get() );
  var annualInterestRate = data.annualInterestRate || getInterestByInvestment( stateMap.investmentStyle.querySelector('input:checked').value );
  var retirementAge = data.retirementAge || Number( stateMap.retirementSlider.noUiSlider.get() ) ;
  var xTicks = getXTicks(age, retirementAge);

  if(!Array.isArray(xTicks)) {
    helpers.makeError('params', data);
  }

  var ySerie = getYSerie({
    income: data.income,
    investmentRate: investmentRate,
    savingsRate: data.savingsRate,
    annualInterestRate: annualInterestRate,
    currentSavings: data.currentSavings,
    xTicks: xTicks
  });

  chartData.labels = xTicks;
  chartData.series[0] = ySerie;
  chartOptions.axisY.ticks[0] = data.currentSavings;

  lineChart.update(chartData, chartOptions);
  updateRetirementSavings(ySerie[5]);
};


//////////////////////
// PUBLiC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  switch(event) {
    case 'annualInterestRateChanged':
      stateMap.investmentStyle.addEventListener('change', function(e) {
        handler( getInterestByInvestment(e.target.value) );
      });
      break;
    case 'savingsRateChanged':
      stateMap.savingRateSlider.noUiSlider.on('set', function(values) {
        handler(Number(values[0]));
      });
      break;
    case 'incomeChanged':
      stateMap.incomeSlider.noUiSlider.on('set', function(values) {
        var income = Number(values[0].replace(',', ''));
        handler(income);
      });
      break;
    case 'investmentRateChanged':
      stateMap.investmentRateSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0]));
      });
      break;
    case 'retirementAgeChanged':
      stateMap.retirementSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0]));
      });
      break;
    default:
      console.error('No bind event found.');
      return;
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'setSlider':
      setSlider(data);
      break;
    case 'showSliders':
      showSliders(data);
      break;
    case 'showLineChart':
      showLineChart(data);
      break;
    case 'updateLineChartSerie':
      updateLineChartSerie(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.savingRateSlider = container.get('option__slider--saving');
  stateMap.incomeSlider = container.get('option__slider--income');
  stateMap.investmentRateSlider = container.get('option__slider--investment');
  stateMap.retirementSlider = container.get('option__slider--retirement');

  stateMap.investmentStyle = container.get('investment');

  stateMap.retirementSavings = container.get('savings__amount');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};
