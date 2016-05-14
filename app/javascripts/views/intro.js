/**
 * Screen #2 - About module
 * @module about
 */

'use strict';

var introJs = require('intro.js').introJs;

var stateMap = {
  continue: null,
  features: null,
  offers: null
};

///////////////////
// DOM FUNCTIONS //
///////////////////

var showIntro = function() {
  var introSteps = [
    {
      element: stateMap.features,
      intro: 'Check our features!'
    },
    {
      element: stateMap.offers,
      intro: 'This is what you get!'
    },
    {
      element: stateMap.continue,
      intro: 'Let\'s get started!'
    }
  ];
  var intro = introJs();
  intro.setOptions({
    showBullets: false,
    showProgress: true,
    steps: introSteps,
    tooltipPosition: 'auto'
  });
  intro.start();
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var render = function(cmd) {
  switch(cmd) {
    case 'showIntro':
      showIntro();
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.continue = container.get('continue');
  stateMap.features = container.get('features');
  stateMap.offers = container.get('offers');
};

module.exports = {
  render: render,
  setStateMap: setStateMap
};
