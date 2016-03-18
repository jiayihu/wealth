/**
 * Continue buttons module
 * @module continue
 */

'use strict';

var stateMap = {
  continue: null,
  backward: null
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'continueClicked') {
    stateMap.continue.forEach(function(button) {
      button.addEventListener('click', function() {
        var template = this.dataset.template;
        handler(template);
      });
    });
    stateMap.backward.forEach(function(button) {
      button.addEventListener('click', function() {
        handler(this.dataset.template);
      });
    });
  }
};

var setStateMap = function() {
  stateMap.continue = document.getAll('continue');
  stateMap.backward = document.getAll('backward');
};

module.exports = {
  bind: bind,
  setStateMap: setStateMap
};
