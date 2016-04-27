var PubSub = require('pubsub-js');
var notie = require('notie');

var bindView = function(model, view) {
  view.bind('linkClicked', function(nextStep) {
    if(nextStep) {
      PubSub.publish('step.' + nextStep);
    }
  });
  view.bind('resetClicked', function() {
    notie.confirm(
      'You will lose all the settings and the action plan. Are you sure?',
      'Yes',
      'Cancel',
      function() {
        model.reset();
        document.location.reload();
      }
    );
  });
};

var setView = function(view, initialState) {
  var lastUserStep = initialState.lastUserStep;

  view.render('disableLinks', {lastUserStep: lastUserStep});
};

var subscriber = function(model, view, topic, data) {
  var stepName = data;
  var stepNumber = Number(document.get('step-name--' + stepName).get('step-number').textContent);
  var lastUserStep = model.read('lastUserStep');

  view.render('activateStep', {
    stepName: stepName
  });

  if(lastUserStep < stepNumber) {
    model.update({lastUserStep: stepNumber});
  }

  // Google Analytics update the 'ga' function asynchronously when the library is loaded
  // so we assure to use the correct function
  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Step #' + stepNumber,
    eventAction: 'Continue'
  });

  PubSub.publish('step.' + stepName);
};

module.exports = function(model, view, initialState) {
  setView(view, initialState);
  bindView(model, view);
  PubSub.subscribe('activateStep', subscriber.bind(null, model, view));
};
