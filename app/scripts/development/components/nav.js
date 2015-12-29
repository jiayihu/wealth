app.views.nav = (function() {
  var configMap = {
    blocking: true, //Whether steps should be disabled if not seen yet
    navClass: 'nav'
  };

  var setActive = function(newActive, className) {
    var oldActive = document.getElementsByClassName(className)[0];
    oldActive.classList.remove(className);
    newActive.classList.add(className);
  };

  var onNavClick = function(e) {
    var nodeName = e.target.nodeName,
      nextStep, nextStepElement, clickedLink;
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

  var init = function() {
    var nav = document.getElementsByClassName(configMap.navClass)[0];
    nav.addEventListener('click', onNavClick);
  };

  return {
    init: init
  };
})();
