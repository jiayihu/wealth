/**
 * Screen #5 - Pyramid module
 * @module 5-Pyramid
 */

'use strict';

var helpers = require('../helpers');
var wNumb = require('wNumb');
var getDefaultRates = require('../model').getDefaultRates;
var Chartist = require('chartist');

var configMap = {
  aboutIncome: 0,
  basicRate: 0,
  discRate: 0,
  savingsRate: 0,

  incomeHTMLClass: '.budget__income .value__actual',

  //User budget & others summary HTML elements
  budget: {
    basicHTMLClass: '.budget__category--basic .budget__category__value',
    discretiotionaryHTMLClass: '.budget__category--discretionary .budget__category__value',
    savingsHTMLClass: '.budget__category--savings .budget__category__value'
  },
  others: {
    basicHTMLClass: '.others__category__basic .others__category__value',
    discretiotionaryHTMLClass: '.others__category--discretionary .others__category__value',
    savingsHTMLClass: '.others__category--savings .others__category__value'
  },

  // Bar Chart Configuration
  chartHTMLClass: '.comparison-chart',
  chartData: {
    labels: ['Basic Needs', 'Discretionary Expenses', 'Savings'],
    series: [
      [5, 4, 3],
      [3, 2, 9]
    ]
  },
  chartOptions: {
    seriesBarDistance: 10
  },
  chartResponsiveOptions: [
    ['screen and (max-width: 640px)', {
      seriesBarDistance: 5,
      axisX: {
        labelInterpolationFnc: function (value) {
          return value[0];
        }
      }
    }]
  ]
};

var stateMap = {
  income: null,
  budget: {},
  others: {},
  barChart: null,
  conclusion: null
};


////////////////////
// DATA FUNCTIONS //
////////////////////

/**
 * Copies the actual values of the summary into a new object whose key names
 * are needed to be basic, discretionary and savings.
 * @param  {object} values Category values of the summary
 * @return {object}
 */
var mapActualValues = function(values) {
  return {
    basic: values.basicNeeds,
    discretionary: values.discretionaryExpenses,
    savings: values.annualSavings
  };
};

/**
 * The same of mapActualValues() but for category rates
 * @return {object}
 */
var mapRates = function() {
  return {
    basic: configMap.basicRate,
    discretionary: configMap.discRate,
    savings: configMap.savingsRate
  };
};

var moneyFormat = wNumb({
  thousand: ',',
  prefix: '$ '
});


///////////////////
// DOM FUNCTIONS //
///////////////////

var createChart = function() {
  stateMap.barChart = new Chartist.Bar(configMap.chartHTMLClass, configMap.chartData, configMap.chartOptions, configMap.chartResponsiveOptions);
};

/**
 * Returns an object map of the DOM elements which displays the categories
 * @param  {Object.DOM} container DOM Container
 * @param  {string} who user budget or others
 * @param  {array} categories Array of names of categories
 * @return {object}
 */
var getSummaryDOM = function(container, who, categories) {
  var domMap = {};
  who = '.' + who;

  //The leverage HTML Elements which can be selected with a className like
  //'.budget__category--basic .budget__category__value'
  categories.forEach(function(category) {
    var htmlClass = who + '__category--' + category + ' ' + who + '__category__value';
    domMap[category] = container.querySelector(htmlClass);
  });

  return domMap;
};

var setStateMap = function(container) {
  var categories = ['basic', 'discretionary', 'savings'];

  stateMap.income = container.querySelector(configMap.incomeHTMLClass);

  stateMap.budget = getSummaryDOM(container, 'budget', categories);
  stateMap.others = getSummaryDOM(container, 'others', categories);

  stateMap.conclusion = container.querySelector('.conclusion');
};

var updateBarChart = function(budgetRates, othersRates) {
  var series = configMap.chartData.series;
  series[0] = Object.keys(budgetRates).map(function(category) {
    return budgetRates[category];
  });
  series[1] = Object.keys(othersRates).map(function(category) {
    return othersRates[category];
  });
  // console.log(configMap.chartData.series);
  stateMap.barChart.update(configMap.chartData);
};

var updateConclusion = function(budgetRates, othersRates) {
  var template = 'You spend {spend} on {category} so you save {save} than others';
  var text, spend, save;
  var category = Math.abs(budgetRates.basic < othersRates.basic) > Math.abs(budgetRates.discretionary < othersRates.discretionary) ? 'Basic Needs' : 'Discretionary Expenses';

  if(budgetRates.savings === othersRates.savings) {
    text = 'You spend the same as others of your category';
  } else if(budgetRates.savings > othersRates.savings) {
    spend = 'less';
    save = 'more';
  } else {
    spend = 'more';
    save = 'less';
  }

  if(spend && save) {
    text = helpers.template(template, {
      spend: spend,
      category: category,
      save: save
    });
  }
  stateMap.conclusion.textContent = text;
};

var updateTextContent = function(element, text) {
  element.textContent = text;
};

var updateSummary = function(domMap, actualValues, rates) {
  Object.keys(domMap).forEach(function(category) {
    updateTextContent(
      domMap[category].querySelector('.actual'),
      moneyFormat.to(actualValues[category])
    );
    updateTextContent(
      domMap[category].querySelector('.rate'),
      helpers.format(rates[category], '%')
    );
  });
};


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var configModule = function(inputMap) {
  helpers.setConfigMap(inputMap, configMap);
};

var render = function() {
  var income = configMap.aboutIncome;
  var actualValues = mapActualValues(helpers.valuesOfSummary(
    income,
    configMap.basicRate,
    configMap.discRate,
    configMap.savingsRate
  ));
  var budgetRates = mapRates();
  var othersRates = getDefaultRates(income);
  var othersValues = mapActualValues(helpers.valuesOfSummary(
    income,
    othersRates.basic,
    othersRates.discretionary,
    othersRates.savings
  ));

  updateTextContent(stateMap.income, moneyFormat.to(income));
  updateSummary(stateMap.budget, actualValues, budgetRates);
  updateSummary(stateMap.others, othersValues, othersRates);
  updateBarChart(budgetRates, othersRates);
  updateConclusion(budgetRates, othersRates);
};

var init = function(container) {
  setStateMap(container);
  createChart();
  render();
};

module.exports = {
  configModule: configModule,
  init: init,
  render: render
};
