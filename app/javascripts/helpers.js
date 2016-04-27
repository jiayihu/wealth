/**
 * Helpers module
 * @module helpers
 */

'use strict';

var ajax = function(options) {
  if( (typeof options.method !== 'string') || (typeof options.url !== 'string') ) {
    throw new Error('Wrong params' +  JSON.stringify(options));
  }

  var callback = options.callback || function() {};
  var request = new XMLHttpRequest();
  request.open(options.method, options.url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      callback(null, data); //callback(err, value)
    } else {
      callback('Something went wrong', null);
    }
  };

  request.onerror = function(error) {
    callback(error, null);
  };

  if(options.method === 'GET') {
    request.setRequestHeader('Accept', 'application/json');
  } else {
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  }

  request.send(options.data);
};

var customErrorConstructor = function(name, desc) {
  var ErrorConstructor = function(msg) {
    this.message = desc + msg;
    this.stack = (new Error()).stack;
  };
  ErrorConstructor.prototype = Object.create(Error.prototype);
  ErrorConstructor.prototype.name = name;

  return ErrorConstructor;
};

var ParamsError = customErrorConstructor('ParamsError', 'Invalid parameters: ');
var UserError = customErrorConstructor('UserError', 'Invalid user input: ');

/**
 * Throws an error
 * @param  {string} type Error type/constructor
 * @param  {object} data Data to pass in the msg
 * @param  {Function} callback Optional callback. Useful if you need to display
 * the error to the user for example.
 */
var makeError = function(type, data, callback) {
  var msg;
  callback = callback || function() {};

  try {
    msg = JSON.stringify(data);
  } catch (e) {
    msg = JSON.stringify(e);
  }

  callback(msg);

  switch (type) {
    case 'params':
      throw new ParamsError(msg);
    case 'user':
      throw new UserError(msg);
    default:
      throw new Error(msg);
  }
};

/**
 * Checks whether the input is strictly a isNumber
 * @param {*} value Value to check
 * @return {boolean}
 */
var isNumber = function(value) {
  //Check also with isNaN because (typeof NaN === 'number') is true
  return !isNaN(value) && (typeof value === 'number');
};

/**
 * Formats the value to a specified type
 * @param  {string} value Value to be formatted
 * @param  {string} type Format
 * @return {string} Formatted value
 */
var format = function(value, type) {
  if((type && typeof type !== 'string') ) {
    makeError('params', value);
  }

  var newValue = '';

  value = String(value).replace(/(\.0)$/, '');

  switch (type) {
    case '$':
      newValue = '$' + value;
      break;
    case '%':
      newValue = value + '%';
      break;
    default:
      newValue = value;
  }

  return newValue;
};

/**
 * Returns the reversed array without side effects
 * @param  {array} array Initial array
 * @return {array}
 */
var reverse = function(array) {
  if(!Array.isArray(array)) {
    makeError('params', array);
  }

  return array.slice().reverse();
};

/**
 * Set the configMap of the module - It goes deep in the object
 * @param  {object} inputMap Object map with new properties and values
 * @param  {object} configMap Initial object map
 * @return {object} configMap Updated map
 */
var setConfigMap = function(inputMap, configMap) {
  var key;

  for (key in inputMap) {
    if (configMap.hasOwnProperty(key)) {
      if (inputMap[key] instanceof Object) {
        setConfigMap(inputMap[key], configMap[key]);
      } else {
        configMap[key] = inputMap[key];
      }
    }
  }

  return configMap;
};

/**
 * Replaces mustache-wrapped words with values
 * @param  {string} string Initial string
 * @param  {object} valuesMap Object map of values
 * @return {string}
 */
var template = function(string, valuesMap){
  var s = string || '';

  Object.keys(valuesMap).forEach(function(value) {
    s = s.replace(new RegExp('{' + value + '}', 'g'), valuesMap[value]);
  });

  return s;
};

/**
 * Toggles a item in array, adding or removing it whether it's already contained
 * @param  {array} array Array
 * @param  {object} item Item
 * @return {array} myArray Updated array
 */
var toggleArrayItem = function(array, item) {
  //We clone the array to avoid side effects
  var myArray = array.slice(0);

  var isThere = myArray.find(function(arrayItem, index) {
    if(arrayItem.id === item.id) {
      myArray.splice(index, 1);
      return true;
    }
  });

  if(!isThere) {
    myArray.push(item);
  }

  return myArray;
};

/**
 * Returns the actual value of a rate
 * @param  {number} total Total
 * @param  {number} rate Rate
 * @return {number}
 */
var valueOfRate = function(total, rate) {
  if( (typeof rate !== 'number') || (typeof total !== 'number') ) {
    makeError('params', {rate: rate, total: total});
  }

  return rate * total * 0.01;
};

/**
 * Returns the actual values of summary rates based on income
 * @param  {number} income Income
 * @param  {number} basicRate Basic needs rate
 * @param  {number} discRate Discretionary Expenses rate
 * @param  {number} savingsRate Savings rate
 * @return {object}
 */
var valuesOfSummary = function(income, basicRate, discRate, savingsRate) {
  var valueOfCategory = valueOfRate.bind(null, income);
  return {
    basicNeeds: valueOfCategory(basicRate),
    discretionaryExpenses: valueOfCategory(discRate),
    annualSavings: valueOfCategory(savingsRate)
  };
};


module.exports = {
  ajax: ajax,
  format: format,
  makeError: makeError,
  isNumber: isNumber,
  reverse: reverse,
  setConfigMap: setConfigMap,
  template: template,
  toggleArrayItem: toggleArrayItem,
  valueOfRate: valueOfRate,
  valuesOfSummary: valuesOfSummary
};
