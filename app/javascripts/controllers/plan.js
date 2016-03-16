var bindView = function(model, view) {
  view.bind('actionToggled', function(action) {
    model.toggleActions(action);
  });
};

var setView = function(model, view) {
  view.render('showActions');
  view.render('createTooltips');
};

module.exports = function(model, view) {
  setView(model, view);
  bindView(model, view);
};