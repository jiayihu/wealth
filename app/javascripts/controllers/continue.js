var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('continueClicked', function(nextActiveNavLink) {
    var link = nextActiveNavLink;
    //When user is on the last step the value of 'nextActiveNavLink' is 'false'
    if (link) {
      var lastUserStep = Number(link.get('step-number').textContent);
      var savedLastStep = model.read('lastUserStep');
      var nextActiveStep = link.get('step-name').dataset.template;

      PubSub.publish('step.' + nextActiveStep);
      if (lastUserStep > savedLastStep) {
        model.update({'lastUserStep': lastUserStep});
      }
    }
  });
};

module.exports = function(model, view) {
  bindView(model, view);
};