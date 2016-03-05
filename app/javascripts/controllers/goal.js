var bindView = function(model, view) {
  view.bind('goalToggled', function(goal) {
    model.toggleGoal(goal);
  });
};

var setView = function(model, view, initialState) {
  view.render('showGoals', {
    goalsList: model.getGoals(),
    pickedGoals: initialState.goals
  });
  view.render('createTooltips');
  view.render('setDragDrop');
  view.render('createDatepickers');
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
};