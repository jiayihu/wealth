var helpers = require('../helpers');
var notie = require('notie');
var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('printClicked', function() {
    // view.render('printPlan');
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
        if(err) {
          notie.alert(3, 'Error sending the email to the server. Please try again or report the issue.', 5);
        } else {
          notie.alert(1, 'Thank you for submitting your email! ' + response, 5);
        }
      },
      contentType: 'text/xml; charset=utf-8'
    });
  });
};

var setView = function(model, view, initialState) {
  var actions = initialState.actions;
  view.render('showActionPlan', actions);
};

var subscriber = function(model, view, topic, data) {
  setView(model, view, {actions: data});
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
  PubSub.subscribe('actions', subscriber.bind(null, model, view));
  PubSub.subscribe('step.reminders', function() {
    notie.alert(2, '<a href="http://www.mymoneymentor.org/wealthproject/Donate.aspx" target="_blank">Donate $1</a> To Help Fund New Features. Thanks!</a>', 10);
  });
};
