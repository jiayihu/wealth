app.views.nav = (function() {
  var configMap = {
    blocking: true, //Whether steps should be disabled if not seen yet
    navClass: 'nav'
  };
  var nav;

  var setActive = function(newActive, className) {
    var oldActive = document.getElementsByClassName(className)[0];
    oldActive.classList.remove(className);
    newActive.classList.add(className);
  };

  var onNavClick = function(e) {
    var nodeName = e.target.nodeName,
      nextStep, nextStepElement, clickedLink;

    //If it is the 'Reset Model' button
    if(nodeName === 'A') {
      return;
    }

    if (nodeName === 'SPAN') {
      nextStep = e.target.dataset.template;
      clickedLink = e.target.parentNode;
    } else if (nodeName === 'LI') {
      nextStep = e.target.firstElementChild.dataset.template;
      clickedLink = e.target;
    }
    if(!clickedLink.classList.contains('disabled') && configMap.blocking) {
      setActive(clickedLink, 'active');
      nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];
      setActive(nextStepElement, 'show');
    }
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var init = function() {
    nav = document.getElementsByClassName(configMap.navClass)[0];
    nav.addEventListener('click', onNavClick);
  };

  /**
   * Adds 'disabled' class to navigation links from the item number 'start'
   * @param  {number} start Number of the first link to start with
   */
  var setDisabledLinks = function(start) {
    var navItems = nav.getElementsByTagName('li');
    for(var i = start, len = navItems.length; i < len; i++) {
      navItems[i].classList.add('disabled');
    }
  };

  return {
    init: init,
    setDisabledLinks: setDisabledLinks
  };
})();
