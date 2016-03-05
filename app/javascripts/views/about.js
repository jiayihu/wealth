/**
 * Screen #2 - About module
 * @module about
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = require('wNumb');

var stateMap = {
  ageSlider: null,
  incomeSlider: null,
  situation: null,
  living: null
};


///////////////////
// DOM FUNCTIONS //
///////////////////


var showSliders = function(data) {
  var age = data.age;
  var income = data.income;

  if(!age || !income) {
    helpers.makeError('params', data);
  }

  var ageOptions = {
    start: age,
    step: 1,
    range: {
      'min': 18,
      'max': 65
    },
    pips: {
      mode: 'values',
      values: [20, 30, 40, 50, 60, 65],
      density: 5
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
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
      thousand: '.'
    })
  };

  domHelpers.createSlider(stateMap.ageSlider, ageOptions);
  domHelpers.createSlider(stateMap.incomeSlider, incomeOptions, '$');
};

var setSelects = function(data) {
  var situation = data.situation;
  var living = data.living;

  if(!situation || !living) {
    helpers.makeError('params', data);
  }

  stateMap.situation.value = situation;
  stateMap.living.value = living;
};

var setStateMap = function(container) {
  stateMap.ageSlider = container.get('about__age__slider');
  stateMap.incomeSlider = container.get('about__income__slider');
  stateMap.situation = container.get('about__select');
  stateMap.living = container.get('about__select', 1);
};


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * Used by shell to bind event handlers to this module DOM events. It usually
 * means that we want the shell to update model when user interacts with this
 * screen.
 * @param  {string} event Event name
 * @param  {function} handler Event handler
 */
var bind = function(event, handler) {
  switch(event) {
    case 'ageChanged':
      stateMap.ageSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0]));
      });
      break;
    case 'incomeChanged':
      stateMap.incomeSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0].replace('.', '')));
      });
      break;
    case 'situationChanged':
      stateMap.situation.addEventListener('change', function(event) {
        handler(event.target.value);
      });
      break;
    case 'livingChanged':
      stateMap.living.addEventListener('change', function(event) {
        handler(event.target.value);
      });
      break;
    default:
      return;
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showSliders':
      showSliders(data);
      break;
    case 'setSelects':
      setSelects(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

module.exports = {
  bind: bind,
  setStateMap: setStateMap,
  render: render
};
