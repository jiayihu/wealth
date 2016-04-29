var bindView = function(model, view) {
  view.bind('goalToggled', function(data) {
    // data is the date object passed by the view
    var goalName = data.id;
    var goal = Object.assign({}, model.getGoals(goalName), {date: data.date});
    model.toggleGoal(goal);

    var actions = model.getActions(goalName);
    var actionsGroup = {
      id: goal.id,
      title: goal.title,
      actions: actions
    };
    model.toggleActionsGroup(actionsGroup);
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
