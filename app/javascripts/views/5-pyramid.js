/**
 * Screen #5 - Pyramid module
 * @module 5-Pyramid
 */

'use strict';

var helpers = require('../helpers');
var wNumb = require('wNumb');

var configMap = {
  savingsId: '#pyramid-savings',
  basicId: '#pyramid-basic',
  discretiotionaryId: '#pyramid-discretionary',
  incomeId: '#pyramid-income',
  basicNeeds: 0,
  annualSavings: 0,
  discretionaryExpenses: 0,
  aboutIncome: 0
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

  stateMap.savingsText.textContent = ' ' + moneyFormat.to(configMap.annualSavings) + '/yr';
  stateMap.basicText.textContent = moneyFormat.to(configMap.basicNeeds) + '/yr';
  stateMap.discretionaryText.textContent = moneyFormat.to(configMap.discretionaryExpenses) + '/yr';
  stateMap.incomeText.textContent = moneyFormat.to(configMap.aboutIncome) + '/yr';
};

/**
 * PUBLIC FUNCTIONS
 */

var configModule = function(inputMap) {
  helpers.setConfigMap(inputMap, configMap);
};

var init = function(container) {
  stateMap.savingsText = container.querySelector(configMap.savingsId);
  stateMap.basicText = container.querySelector(configMap.basicId);
  stateMap.discretionaryText = container.querySelector(configMap.discretiotionaryId);
  stateMap.incomeText = container.querySelector(configMap.incomeId);

  updateLabels();
};

module.exports = {
  configModule: configModule,
  init: init,
  updateLabels: updateLabels
};
