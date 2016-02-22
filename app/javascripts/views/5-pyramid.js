/**
 * Screen #5 - Pyramid module
 * @module 5-Pyramid
 */

'use strict';

var helpers = require('../helpers');
var wNumb = require('wNumb');

var configMap = {
  aboutIncome: 0,
  basicRate: 0,
  discRate: 0,
  savingsRate: 0,
  savingsId: '#pyramid-savings',
  basicId: '#pyramid-basic',
  discretiotionaryId: '#pyramid-discretionary',
  incomeId: '#pyramid-income'
};

var stateMap = {
  savingsText: null,
  basicText: null,
  discretionaryText: null,
  incomeText: null
};

/**
 * DOM FUNCTIONS
 */

var updateLabels = function() {
  var moneyFormat = wNumb({
    thousand: ',',
    prefix: '$ '
  });

  var values = helpers.valuesOfSummary(
    configMap.aboutIncome,
    configMap.basicRate,
    configMap.discRate,
    configMap.savingsRate
  );

  stateMap.savingsText.textContent = ' ' + moneyFormat.to(values.annualSavings) + '/yr';
  stateMap.basicText.textContent = moneyFormat.to(values.basicNeeds) + '/yr';
  stateMap.discretionaryText.textContent = moneyFormat.to(values.discretionaryExpenses) + '/yr';
  stateMap.incomeText.textContent = moneyFormat.to(configMap.aboutIncome) + '/yr';
};

var setStateMap = function(container) {
  stateMap.savingsText = container.querySelector(configMap.savingsId);
  stateMap.basicText = container.querySelector(configMap.basicId);
  stateMap.discretionaryText = container.querySelector(configMap.discretiotionaryId);
  stateMap.incomeText = container.querySelector(configMap.incomeId);
};

/**
 * PUBLIC FUNCTIONS
 */

var configModule = function(inputMap) {
  helpers.setConfigMap(inputMap, configMap);
};

var init = function(container) {
  setStateMap(container);
  updateLabels();
};

module.exports = {
  configModule: configModule,
  init: init,
  updateLabels: updateLabels
};
