(function() {

  var init = function(window) {
    var WealthApp = function(name) {
      this.model = new app.Model(name);
    };

    window.wealthApp = new WealthApp('wealth');

    app.shell.init();
  };

  // Export to window
	window.app = window.app || {};
	window.app.init = init;

})();

app.init(window);
