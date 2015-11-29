var app = window.app || {};

app.shell = (function(window) {
  var config = {

  },
  stateMap = {

  };


  var init = function() {
    var aboutContainer = document.getElementsByClassName('about-wrapper')[0];
    app.views.about.init(aboutContainer);
  };

  return {
    init: init
  };

})(window);
