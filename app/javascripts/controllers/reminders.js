var helpers = require('../helpers');

var bindView = function(model, view) {
  view.bind('printClicked', function() {
    view.render('printPlan');
  });

  view.bind('savedReminders', function() {
    helpers.ajax({
      method: 'GET',
      url: 'http://wealthprojservices.azurewebsites.net//ReminderRequest.svc?text-number=+393122222222&text-email=testing@wealth.com',
      callback: function(err, response) {
        console.log(err, response);
      }
    });
  });
};

var setView = function(model, view) {
  view.render('createPopovers');
  view.render('createDatePickers');
};

module.exports = function(model, view) {
  setView(model, view);
  bindView(model, view);
};
