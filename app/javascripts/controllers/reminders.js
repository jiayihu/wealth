var helpers = require('../helpers');
var notie = require('notie');

var bindView = function(model, view) {
  view.bind('printClicked', function() {
    view.render('printPlan');
  });

  view.bind('savedReminders', function(err, email) {
    if(err) {
      notie.alert(3, err.message, 5);
      return;
    }

    helpers.ajax({
      method: 'GET',
      url: 'http://www.mymoneymentor.org/wealthprojservices/ReminderRequest?value=' + email,
      callback: function(err, response) {
        console.log('Ajax call to web service: ', err, response);
      },
      contentType: 'text/xml; charset=utf-8'
    });
  });
};

var setView = function(model, view, initialState) {
  var actions = initialState.actions;
  view.render('showActionPlan', actions);
};

module.exports = function(model, view, initialState) {
  console.log('initialState', initialState);
  setView(model, view, initialState);
  bindView(model, view);
};
