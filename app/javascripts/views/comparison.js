/**
 * Screen #5 - Pyramid module
 * @module 5-Pyramid
 */

'use strict';

var helpers = require('../helpers');
var wNumb = require('wNumb');
var Chartist = require('chartist');
var details = require('./comparison-details');

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
 * are needed to be 'basic', 'discretionary' and 'savings'.
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

var moneyFormat = wNumb({
  thousand: ',',
  prefix: '$ '
});


///////////////////
// DOM FUNCTIONS //
///////////////////

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

var updateTextContent = function(element, text) {
  element.textContent = text;
};

/**
 * Updates the text for user & others summary categories, with the rates and
 * actual values.
 * @param  {object} domMap       Object with the DOM nodes for basic, discretionary
 * and savings
 * @param  {object} actualValues Object with the actual values for each category
 * @param  {object} rates        Object with the rates for each category
 * @example
 * updateSummary(
 *   {
 *     basic: HTMLNode,
 *     discretionary: HTMLNode,
 *     savings: HTMLNode
 *   },
 *   {
 *     basic: 20000,
 *     discretionary: 13000,
 *     savings: 8000
 *   },
 *   {
 *     basic: 45,
 *     discretionary: 35,
 *     savings: 20
 *   }
 *  )
 */
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
// RENDER FUNCTIONS //
//////////////////////

var showSummaryChart = function(data) {
  var user = data.user;
  var others = data.others;

  if(
    !helpers.isNumber(user.basicRate + user.discRate + user.savingsRate) ||
    !helpers.isNumber(others.basic + others.discretionary + others.savings)
  ) {
    helpers.makeError('params', data);
  }

  var chartData = {
    labels: ['Basic Needs', 'Discretionary Expenses', 'Savings'],
    series: [
      [user.basicRate, user.discRate, user.savingsRate],
      [others.basic, others.discretionary, others.savings]
    ]
  };
  var chartOptions = {
    seriesBarDistance: 22
  };

  stateMap.barChart = new Chartist.Bar('.comparison-chart', chartData, chartOptions);
};

var showUserExpenses = function(data) {
  var income = data.income || 0;
  var basicRate = data.basicRate;
  var discRate = data.discRate;
  var savingsRate = data.savingsRate;

  if(typeof (income + basicRate + discRate + savingsRate) !== 'number') {
    helpers.makeError('params', data);
  }

  var actualValues = mapActualValues(
    helpers.valuesOfSummary(income, basicRate, discRate, savingsRate)
  );
  var budgetRates = {
    basic: basicRate,
    discretionary: discRate,
    savings: savingsRate
  };

  if(income) {
    updateTextContent(stateMap.income, moneyFormat.to(income));
  }
  updateSummary(stateMap.budget, actualValues, budgetRates);
};

var showOthersExpenses = function(data) {
  var income = data.income;
  var othersExpenses = data.othersExpenses;

  if( (typeof income !== 'number') || (typeof othersExpenses !== 'object') ) {
    helpers.makeError('params', data);
  }

  var othersValues = mapActualValues(helpers.valuesOfSummary(
    income,
    othersExpenses.basic,
    othersExpenses.discretionary,
    othersExpenses.savings
  ));

  updateSummary(stateMap.others, othersValues, othersExpenses);
};

var updateSummaryChart = function(data) {
  var userExpenses = data.userExpenses;
  var othersExpenses = data.othersExpenses;

  var chartData = {
    labels: ['Basic Needs', 'Discretionary Expenses', 'Savings'],
    series: [
      [userExpenses.basic, userExpenses.discretionary, userExpenses.savings],
      [41, 51, 8]
    ]
  };

  var series = chartData.series;
  var expense;

  series[0] = Object.keys(userExpenses).map(function(category) {
    expense = userExpenses[category];
    if(typeof expense !== 'number') {
      helpers.makeError('params', data);
    }
    return expense;
  });
  series[1] = Object.keys(othersExpenses).map(function(category) {
    expense = othersExpenses[category];
    if(typeof expense !== 'number') {
      helpers.makeError('params', data);
    }
    return expense;
  });
  stateMap.barChart.update(chartData);
};

var showConclusion = function(data) {
  var userExpenses = data.userExpenses;
  var othersExpenses = data.othersExpenses;

  var template = 'You spend {spend} on {category} so you save {save} than others';
  var text, spend, save;
  var category = Math.abs(userExpenses.basic < othersExpenses.basic) > Math.abs(userExpenses.discretionary < othersExpenses.discretionary) ? 'Basic Needs' : 'Discretionary Expenses';

  if(userExpenses.savings === othersExpenses.savings) {
    text = 'You spend the same as others of your category';
  } else if(userExpenses.savings > othersExpenses.savings) {
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


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var render = function(cmd, data) {
  switch(cmd) {
    case 'showSummaryChart':
      showSummaryChart(data);
      break;
    case 'showUserExpenses':
      showUserExpenses(data);
      break;
    case 'showOthersExpenses':
      showOthersExpenses(data);
      break;
    case 'showDetailedChart':
      details.render('showDetailedChart', data);
      break;
    case 'showConclusion':
      showConclusion(data);
      break;
    case 'updateDetailedChart':
      details.render('updateDetailedChart', data);
      break;
    case 'updateSummaryChart':
      updateSummaryChart(data);
      break;
    default:
      console.error('No command found');
      return;
  }
};

var setStateMap = function(container) {
  var categories = ['basic', 'discretionary', 'savings'];

  stateMap.income = container.querySelector('.budget__income .value__actual');

  stateMap.budget = getSummaryDOM(container, 'budget', categories);
  stateMap.others = getSummaryDOM(container, 'others', categories);

  stateMap.conclusion = container.querySelector('.conclusion');

  details.setStateMap(container);
};

module.exports = {
  setStateMap: setStateMap,
  render: render
};
