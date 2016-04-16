var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('continueClicked', function(stepName) {
    PubSub.publish('activateStep', stepName);
  });
};

module.exports = function(model, view) {
  bindView(model, view);
};
