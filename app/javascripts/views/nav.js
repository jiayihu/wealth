'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');

var stateMap = {
  nav: null
};

var bindLinkClicked = function(e, handler) {
  var nodeName = e.target.nodeName;
  var nextStepName, nextStepWrapper, clickedLink;

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
    nextStepWrapper = document.get(nextStepName + '-wrapper');
    domHelpers.setActive(nextStepWrapper, 'show');
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
  }
};

var setStateMap = function() {
  stateMap.nav = document.get('nav');
};

var render = function(cmd, data) {
  switch(cmd) {
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