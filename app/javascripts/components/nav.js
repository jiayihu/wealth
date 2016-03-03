'use strict';

var configMap = {
  blocking: true, //Whether steps should be disabled if not seen yet
  navClass: 'nav'
};
var nav;

var setActive = function(newActive, className) {
  var oldActive = document.get(className);
  oldActive.classList.remove(className);
  newActive.classList.add(className);
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if(event === 'linkClicked') {
    nav.addEventListener('click', function(e) {
      var nodeName = e.target.nodeName;
      var nextStep, nextStepElement, clickedLink;

      //If it is the 'Reset Model' button
      if (nodeName === 'A') {
        return;
      }

      if (nodeName === 'SPAN') {
        nextStep = e.target.dataset.template;
        clickedLink = e.target.parentNode;
      } else if (nodeName === 'LI') {
        nextStep = e.target.firstElementChild.dataset.template;
        clickedLink = e.target;
      }
      if ( clickedLink && !clickedLink.classList.contains('disabled') && configMap.blocking) {
        setActive(clickedLink, 'active');
        nextStepElement = document.get(nextStep + '-wrapper');
        setActive(nextStepElement, 'show');
        handler(nextStep);
      }
    });
  }
};

var init = function() {
  nav = document.get(configMap.navClass);
};

/**
 * Adds 'disabled' class to navigation links from the item number 'start'
 * @param  {number} start Number of the first link to start with
 */
var setDisabledLinks = function(start) {
  var navItems = nav.getElementsByTagName('li');
  for (var i = start, len = navItems.length; i < len; i++) {
    navItems[i].classList.add('disabled');
  }
};

module.exports = {
  bind: bind,
  init: init,
  setDisabledLinks: setDisabledLinks
};
