app.views.continue = (function() {
  var configMap = {
    navClass: 'nav'
  };

  /**
   * DOM FUNCTIONS
   */

  var setActive = function(newActive, className) {
    var oldActive = document.getElementsByClassName(className)[0];
    oldActive.classList.remove(className);
    newActive.classList.add(className);
  };

  /**
   * EVENT HANDLER
   */

  var onContinueClick = function() {
    var nextStep = this.dataset.template;
    var nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];

    setActive(nextStepElement, 'show');
    var nav = document.getElementsByClassName(configMap.navClass)[0];
    var newActiveNavLink = nav.getElementsByClassName('active')[0].nextElementSibling;

    //Check if it is the last nav link, which doesn't have siblings
    if(newActiveNavLink) {
      //Activate the navigation item
      if(newActiveNavLink.classList.contains('disabled')) {
        newActiveNavLink.classList.remove('disabled');
      }
      setActive(newActiveNavLink, 'active');
    }
  };

  /**
   * PUBLIC FUNCTIONS
   */

   var init = function() {
     var continueButtons = document.getElementsByClassName('continue');
     Array.prototype.forEach.call(continueButtons, function(element) {
       element.addEventListener('click', onContinueClick);
     });
   };

   return {
     init: init
   };

})();
