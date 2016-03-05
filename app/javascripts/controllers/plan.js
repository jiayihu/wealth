var bindView = function(model, view) {
  view.bind('printClicked', function() {
    view.render('printPlan');
  });
};

var setView = function(model, view) {
  view.render('createPopovers');
  view.render('createDatePickers');
};

module.exports = function(model, view) {
  setView(model, view);
  bindView(model, view);
};