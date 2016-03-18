var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('linkClicked', function(nextStep) {
    if(nextStep) {
      PubSub.publish('step.' + nextStep);
    }
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

  PubSub.publish('step.' + stepName);
};

module.exports = function(model, view, initialState) {
  setView(view, initialState);
  bindView(model, view);
  PubSub.subscribe('activateStep', subscriber.bind(null, model, view));

  /* DEVELOPMENT ONLY */
  //@NOTE This could be useful also for users and not only for development
  var resetButton = document.get('reset-model');
  resetButton.addEventListener('click', function() {
    model.reset();
    document.location.reload();
  });
  PubSub.subscribe('step', function(topic) {
    console.log('Step changed: ', topic);
  });
};