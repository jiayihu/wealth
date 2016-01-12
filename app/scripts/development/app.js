(function() {

  var init = function(window) {
    app.model.init('wealthApp');
    app.shell.init();
  };

  // Export to window
	window.app = window.app || {};
	window.app.init = init;

})();

app.init(window);
