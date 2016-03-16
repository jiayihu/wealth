/**
 * Continue buttons module
 * @module continue
 */

'use strict';

var configMap = {
  continueClass: 'continue',
  navClass: 'nav'
};
var stateMap = {
  continueButtons: null,
  nav: null
};

/**
 * DOM FUNCTIONS
 */


/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'continueClicked') {
    document.addEventListener('click', function(e) {
      var classList = e.target.classList;
      var stepName = e.target.dataset.template;

      if((classList.contains('continue') || classList.contains('backward')) && stepName) {
        handler(stepName);
      }
    });
  }
};

var setStateMap = function() {
  stateMap.continueButtons = document.getAll(configMap.continueClass);
  stateMap.nav = document.get(configMap.navClass);
};

module.exports = {
  bind: bind,
  setStateMap: setStateMap
};
