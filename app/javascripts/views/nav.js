'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');

var stateMap = {
  nav: null,
  reset: null
};


///////////////////
// DOM FUNCTIONS //
///////////////////

var activateNav = function(stepName) {
  if(typeof stepName !== 'string') {
    helpers.makeError('params', stepName);
  }

  var newActiveLink = stateMap.nav.get('step-name--' + stepName).parentNode;

  //Activate the navigation item
  if(newActiveLink.classList.contains('disabled')) {
    newActiveLink.classList.remove('disabled');
  }

  domHelpers.setActive(newActiveLink, 'active');
};

var activateStep = function(stepName) {
  if(typeof stepName !== 'string') {
    helpers.makeError('params', stepName);
  }

  var nextStepWrapper = document.get('step--' + stepName);
  domHelpers.setActive(nextStepWrapper, 'show');
};

var bindLinkClicked = function(e, handler) {
  var nodeName = e.target.nodeName;
  var nextStepName, clickedLink;

  //If it is the 'Reset Model' button
  if (nodeName === 'A') {
    return;
  }

  if (nodeName === 'SPAN') {
    nextStepName = e.target.dataset.template;
    clickedLink = e.target.parentNode;
  } else if (nodeName === 'LI') {
    nextStepName = e.target.firstElementChild.dataset.template;
    clickedLink = e.target;
  }

  if ( clickedLink && !clickedLink.classList.contains('disabled')) {
    domHelpers.setActive(clickedLink, 'active');
    activateStep(nextStepName);
    handler(nextStepName);
  }
};

/**
 * Adds 'disabled' class to navigation links from the item number 'start'
 * @param  {object} data Object with the number of the first link to start with
 */
var disableLinks = function(data) {
  var lastUserStep = data.lastUserStep;

  if(typeof lastUserStep !== 'number') {
    helpers.makeError('params', lastUserStep);
  }

  var navItems = stateMap.nav.getElementsByTagName('li');

  //We disable links after the last one seen by user in previous session
  for (var i = lastUserStep, len = navItems.length; i < len; i++) {
    navItems[i].classList.add('disabled');
  }
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if(event === 'linkClicked') {
    stateMap.nav.addEventListener('click', function(e) {
      bindLinkClicked(e, handler);
    });
  } else if(event === 'resetClicked') {
    stateMap.reset.addEventListener('click', handler);
  }
};

var setStateMap = function() {
  stateMap.nav = document.get('nav');
  stateMap.reset = document.get('reset');
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'activateStep':
      activateStep(data.stepName);
      activateNav(data.stepName);
      break;
    case 'disableLinks':
      disableLinks(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};
