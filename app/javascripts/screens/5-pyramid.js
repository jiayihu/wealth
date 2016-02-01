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

var savingsText, basicText, discretionaryText, incomeText;

/**
 * DOM FUNCTIONS
 */

var updateLabels = function() {
  var moneyFormat = wNumb({
    thousand: ',',
    prefix: '$ '
  });

  savingsText.textContent = ' ' + moneyFormat.to(configMap.annualSavings) + '/yr';
  basicText.textContent = moneyFormat.to(configMap.basicNeeds) + '/yr';
  discretionaryText.textContent = moneyFormat.to(configMap.discretionaryExpenses) + '/yr';
  incomeText.textContent = moneyFormat.to(configMap.aboutIncome) + '/yr';
};

/**
 * PUBLIC FUNCTIONS
 */

var configModule = function(inputMap) {
  helpers.setConfigMap(inputMap, configMap);
};

var init = function(container) {
  savingsText = container.querySelector(configMap.savingsId);
  basicText = container.querySelector(configMap.basicId);
  discretionaryText = container.querySelector(configMap.discretiotionaryId);
  incomeText = container.querySelector(configMap.incomeId);

  updateLabels();
};

module.exports = {
  configModule: configModule,
  init: init,
  updateLabels: updateLabels
};
