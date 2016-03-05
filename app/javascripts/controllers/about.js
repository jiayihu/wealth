var bindView = function(model, view) {
  view.bind('ageChanged', function(value) {
    model.update({'aboutAge': value});
  });
  view.bind('incomeChanged', function(value) {
    model.update({'aboutIncome': value});
  });
  view.bind('situationChanged', function(value) {
    model.update({'aboutSituation': value});
  });
  view.bind('livingChanged', function(value) {
    model.update({'aboutLiving': value});
  });
};

var setView = function(view, initialState) {
  var age = initialState.aboutAge;
  var income = initialState.aboutIncome;
  var situation = initialState.aboutSituation;
  var living = initialState.aboutLiving;

  view.render('showSliders', {age: age, income: income});
  view.render('setSelects', {situation: situation, living: living});
};

module.exports = function(model, view, initialState) {
  setView(view, initialState);
  bindView(model, view);
};