/**
 * Model module
 * @module model
 */

'use strict';

var helpers = require('./helpers');
var PubSub = require('pubsub-js');
var notie = require('notie').alert;

var actions = require('./model/actions');
var budget = require('./model/budget');
var getGoals = require('./model/goals');

var stateMap = {
  dbName: ''
};

var defaultModel = {
  aboutAge: 35,
  aboutSituation: 'married',
  aboutLiving: 'own',
  aboutIncome: 60000,
  aboutBasicRate: 35,
  aboutDiscretionaryRate: 52,
  aboutSavingsRate: 13,
  currentSavings: 10000,
  expenses: [],
  //aboutStage: 'home',
  lastUserStep: 1,
  goals: [],
  actions: []
};


///////////////////////////
// BASIC STORE FUNCTIONS //
///////////////////////////

/**
 * Returns the value of the property in the model.
 * @param  {string} property The name of the property
 * @return {anything}
 */
var read = function(property) {
  var data = JSON.parse(localStorage[stateMap.dbName]);

  if(typeof property === 'undefined') {
    return data;
  }

  return data[property];
};

/**
 * Updates model by giving it the property name and its value.
 * @param  {string} updateMap The name of the property to update
 */
var update = function (updateMap) {
  if(typeof updateMap !== 'object') {
    helpers.makeError('params', updateMap);
  }

  var data = read();

  Object.keys(updateMap).forEach(function(property) {
    data[property] = updateMap[property];
    PubSub.publish(property, updateMap[property]);
    console.log(property, updateMap[property]);
  });

  localStorage[stateMap.dbName] = JSON.stringify(data);
};

/**
 * Removes data from model
 * @param  {string} property The name of the property to be removed from model.
 */
var remove = function (property) {
  var data = read();

  delete data[property];

  localStorage[stateMap.dbName] = JSON.stringify(data);
};

/**
 * WARNING: Will remove ALL data from storage.
 */
var reset = function () {
  localStorage[stateMap.dbName] = JSON.stringify(defaultModel);
};


//////////////////////////////
// SPECIFIC MODEL FUNCTIONS //
//////////////////////////////


/**
 * Returns summary expenses from the detailed one
 * @param  {array} detailedExpenses Array of the values of detailed expenses
 * @return {Object}
 */
var getSummaryExpenses = function(detailedExpenses) {
  /**
   * Positions of the basic categories in the list of detailed expenses
   * @type {Array}
   * @NOTE This should be improved since it requires the parameter array to
   * have always the same structure, but it would require much more code
   */
  var basicCategories = [0, 2, 4];
  var basicExpenses = 0;
  var discExpenses = 0;

  if(!Array.isArray(detailedExpenses)) {
    helpers.makeError('params', detailedExpenses);
  }

  detailedExpenses.forEach(function(expense, index) {
    if(~basicCategories.indexOf(index)) {
      basicExpenses += expense;
    } else {
      discExpenses += expense;
    }
  });

  return {
    basic: basicExpenses,
    discretionary: discExpenses
  };
};

/**
 * Updates the stored list adding or removing the element
 * @param  {string} listName Name of the list
 * @param  {object} item item to add or delete
 */
var toggleListItem = function(listName, item) {
  if(typeof listName !== 'string') {
    helpers.makeError('params', listName);
  }

  var list = read()[listName];
  var updatedList = helpers.toggleArrayItem(list, item);
  var updateMap = {};
  updateMap[listName] = updatedList;
  update(updateMap);
};

var toggleAction = function(goalId, action) {
  if( (typeof goalId !== 'string') || (typeof action !== 'object') ) {
    helpers.makeError('params', goalId);
  }

  var groups = read('actions');
  var actionGroup = groups.find(function(actionGroup) {
    return actionGroup.id === goalId;
  });
  actionGroup.actions = helpers.toggleArrayItem(actionGroup.actions, action);

  update({
    actions: groups
  });
};

/**
 * Add/removes the actions of a goal
 * @param  {Object} actionsGroup The actions grouped by goal
 */
var toggleActionsGroup = function(actionsGroup) {
  toggleListItem('actions', actionsGroup);
};

/**
 * Add/removes the goal and returns whether it was added or removed
 * @param  {Object} goal Goal to toggle
 * @return {Boolean}
 */
var toggleGoal = function(goal) {
  var initialLength = read('goals').length;
  toggleListItem('goals', goal);
  var currentLength = read('goals').length;

  return currentLength > initialLength;
};

var init = function(name) {
  stateMap.dbName = name;

  if(typeof window.Storage === undefined) {
    helpers.makeError(null, 'Error: localStorage is not supported.', notie.bind(null, 3));
  }

  if(!localStorage[name]) {
    try {
      localStorage[name] = JSON.stringify(defaultModel);
    } catch(error) {
      helpers.makeError(null, 'Error: localStorage is a browser feature requested by this application and it is not supported or available. Are using Private Navigation?', notie.bind(null, 3));
    }
  }
};

module.exports = {
  getAction: actions.getAction,
  getActions: actions.getActions,
  getDefaultRates: budget.getDefaultRates,
  getGoals: getGoals,
  getSummaryExpenses: getSummaryExpenses,
  init: init,
  read: read,
  reset: reset,
  remove: remove,
  toggleAction: toggleAction,
  toggleActionsGroup: toggleActionsGroup,
  toggleGoal: toggleGoal,
  update: update
};
