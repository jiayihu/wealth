app.views.continue = (function() {
  var configMap = {
    continueClass: 'continue',
    navClass: 'nav'
  };
  var continueButtons;

  /**
   * DOM FUNCTIONS
   */

  var setActive = function(newActive, className) {
    var oldActive = document.getElementsByClassName(className)[0];
    oldActive.classList.remove(className);
    newActive.classList.add(className);
  };

  var activateNav = function() {
    var nav = document.getElementsByClassName(configMap.navClass)[0];
    var newActiveNavLink = nav.getElementsByClassName('active')[0].nextElementSibling;

    //Check if it is the last nav link, which doesn't have siblings
    if(newActiveNavLink) {
      //Activate the navigation item
      if(newActiveNavLink.classList.contains('disabled')) {
        newActiveNavLink.classList.remove('disabled');
      }
      setActive(newActiveNavLink, 'active');
      return newActiveNavLink;
    }

    return false;
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var bind = function(event, handler) {
    if(event === 'continueClicked') {
      continueButtons.forEach(function(element) {
        element.addEventListener('click', function(event) {
          var nextStep = this.dataset.template;
          var nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];
          setActive(nextStepElement, 'show');
          var nextActiveNavLink = activateNav();
          handler(nextActiveNavLink);
        });
      });
    }
  };

  var init = function() {
   continueButtons = document.getElementsByClassName(configMap.continueClass);
  };

  return {
    bind: bind,
    init: init
  };

})();
