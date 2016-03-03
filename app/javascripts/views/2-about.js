/**
 * Screen #2 - About module
 * @module 2-about
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = require('wNumb');

var configMap = {
  ageOptions: {
    start: 35,
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
  },
  incomeOptions: {
    start: 60000,
    step: 1000,
    range: {
      'min': 18000,
      'max': 200000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  },
  aboutSituation: null,
  aboutLiving: null
};

var stateMap = {
  ageSlider: null,
  incomeSlider: null,
  situation: null,
  living: null
};


///////////////////
// DOM FUNCTIONS //
///////////////////


var createSliders = function() {
  domHelpers.createSlider(stateMap.ageSlider, configMap.ageOptions);
  domHelpers.createSlider(stateMap.incomeSlider, configMap.incomeOptions, '$');
};

var setSelectValues = function() {
  stateMap.situation.value = configMap.aboutSituation;
  stateMap.living.value = configMap.aboutLiving;
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
  if (event === 'ageChanged') {
    stateMap.ageSlider.noUiSlider.on('change', function(values) {
      handler(Number(values[0]));
    });
  } else if (event === 'incomeChanged') {
    stateMap.incomeSlider.noUiSlider.on('change', function(values) {
      handler(Number(values[0].replace('.', '')));
    });
  } else if (event === 'situationChanged') {
    stateMap.situation.addEventListener('change', function(event) {
      handler(event.target.value);
    });
  } else if (event === 'livingChanged') {
    stateMap.living.addEventListener('change', function(event) {
      handler(event.target.value);
    });
  }
};

var configModule = function(inputMap) {
  helpers.setConfigMap(inputMap, configMap);
};

var init = function(container) {
  setStateMap(container);
  createSliders();
  setSelectValues();
};

module.exports = {
  bind: bind,
  configModule: configModule,
  init: init
};
