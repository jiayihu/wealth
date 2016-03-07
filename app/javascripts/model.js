/**
 * Model module
 * @module model
 */

'use strict';

var helpers = require('./helpers');
var PubSub = require('pubsub-js');
var notie = require('notie').alert;

var budget = require('./model/budget');
var goalsList = require('./model/goals');

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
  expenses: [8, 6, 25, 8, 3, 19, 9, 5, 1, 4],
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
 * Returns the list of available goals
 * @return {array}
 */
var getGoals = function() {
  return goalsList;
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

var init = function(name) {
  stateMap.dbName = name;

  if(typeof window.Storage === undefined) {
    helpers.makeError(null, 'localStorage support', 'Error: localStorage is not supported.', notie.bind(null, 3));
  }

  if(!localStorage[name]) {
    localStorage[name] = JSON.stringify(defaultModel);
  }
};

module.exports = {
  getDefaultRates: budget.getDefaultRates,
  getGoals: getGoals,
  init: init,
  read: read,
  reset: reset,
  remove: remove,
  toggleActions: toggleListItem.bind(null, 'actions'),
  toggleGoal: toggleListItem.bind(null, 'goals'),
  update: update
};
