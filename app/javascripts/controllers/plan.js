var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('actionToggled', function(action) {
    model.toggleActions(action);
  });
};

var setView = function(model, view, initialState) {
  var goals = initialState.goals;
  var goalsActions = goals.map(function(goal) {
    var actions = model.getActions(goal.id);
    if(actions) {
      return Object.assign({}, goal, {actions: actions});
    }

    return;
  }).filter(function(goalActions) { //filter not undefined goal actions
    return goalActions;
  });
  // We add the general tips to the beginning
  goalsActions.unshift({
    id: 'general',
    actions: model.getActions('general'),
    title: 'General Tips'
  });

  view.render('showGoalsActions', goalsActions);
  view.render('createPopovers');
};

var subscriber = function(model, view, topic, data) {
  setView(model, view, {goals: data});
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
  PubSub.subscribe('goals', subscriber.bind(null, model, view));
};