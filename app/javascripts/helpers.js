/**
 * Helpers module
 * @module helpers
 */

'use strict';

var notie = require('notie');
var noUiSlider = require('nouislider');

/**
 * Throws a new Error visible to the user
 */
var makeError = function(msg) {
  notie.alert(3, msg, 3);
};

/**
 * Create a slider using noUiSlider
 * @param  {object} element HTML Node of the slider
 * @param  {object} options Slider options
 */
var createSlider = function(element, options) {
  if (typeof noUiSlider === 'undefined') {
    makeError('Nouislider', 'nouislider object is not declared.');
  }
  noUiSlider.create(element, options);
  element.handle = element.getElementsByClassName('noUi-handle')[0];
  element.tooltip = document.createElement('div');
  element.handle.appendChild(element.tooltip);

  element.tooltip.classList.add('slider-tooltip');
  element.tooltip.innerHTML = '<span></span>';
  element.tooltip = element.tooltip.firstElementChild;
};

/**
 * Formats the value to a specified type
 * @param  {string || number} value Value to be formatted
 * @param  {string} type Format type
 * @return {string} Formatted value
 */
var format = function(value, type) {
  if( (typeof value !== 'number') && (typeof value !== 'string') ) {
    throw new Error('format() requires a string or number as value');
  }

  var newValue = '';

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
 * Set the configMap of the module - It goes deep in the object
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
    } else {
      makeError('Wrong inputMap', 'Property "' + key + '" is not available in configMap');
    }
  }
};

var init = function() {

  /**
   * PROTOTYPE FUNCTIONS
   */

  // Allow for looping on nodes by chaining and using forEach on both Nodelists and HTMLCollections
  // qsa('.foo').forEach(function () {})
  NodeList.prototype.forEach = Array.prototype.forEach;
  HTMLCollection.prototype.forEach = Array.prototype.forEach;

  /**
   * Implement the ECMAScript 2015 'find' function in Arrays
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
   * @param  {function} !Array.prototype.find Function to execute on each value in the array
   * @return {undefined}
   */
  if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
      if (this === null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    };
  }
};

module.exports = {
  createSlider: createSlider,
  format: format,
  init: init,
  makeError: makeError,
  setConfigMap: setConfigMap
};
