/**
 * Screen #2 - About module
 * @module 2-about
 */

'use strict';

var helpers = require('../helpers');
var wNumb = require('wNumb');

var configMap = {
  ageSlider: 'about__age__slider',
  incomeSlider: 'about__income__slider',
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
  optionLists: 'about__select',
  aboutSituation: 'married-kids',
  aboutLiving: 'rent'
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
  helpers.createSlider(stateMap.ageSlider, configMap.ageOptions);
  helpers.createSlider(stateMap.incomeSlider, configMap.incomeOptions);

  stateMap.ageSlider.noUiSlider.on('update', function(values) {
    var tooltip = stateMap.ageSlider.getElementsByTagName('span')[0];
    tooltip.innerHTML = values[0];
  });

  stateMap.incomeSlider.noUiSlider.on('update', function(values) {
    var tooltip = stateMap.incomeSlider.getElementsByTagName('span')[0];
    tooltip.innerHTML = helpers.format(values[0], '$');
  });
};

var setOptionLists = function() {
  stateMap.situation.value = configMap.aboutSituation;
  stateMap.living.value = configMap.aboutLiving;
};


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * Used by shell to bind event handlers to this module DOM events. It usually
 * means that we want the shell to update model when user interacts with this
 * screen.
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
  //DOM elements
  stateMap.ageSlider = container.getElementsByClassName(configMap.ageSlider)[0];
  stateMap.incomeSlider = container.getElementsByClassName(configMap.incomeSlider)[0];
  stateMap.situation = container.getElementsByClassName('about__select')[0];
  stateMap.living = container.getElementsByClassName('about__select')[1];

  createSliders();

  setOptionLists();
};

module.exports = {
  bind: bind,
  configModule: configModule,
  init: init
};
