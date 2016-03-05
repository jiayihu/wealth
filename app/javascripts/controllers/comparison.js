// var helpers = require('../helpers');
var PubSub = require('pubsub-js');

var setView = function(model, view) {
  //we don't use initialState because setView() is used also when there are
  //events which need a complete re-render such as 'aboutIncome' changed
  var state = model.read();
  var income = state.aboutIncome;
  var basicRate = state.aboutBasicRate;
  var discRate = state.aboutDiscretionaryRate;
  var savingsRate = state.aboutSavingsRate;
  var othersExpenses = model.getDefaultRates(income);

  view.render('showSummaryChart', {
    basicRate: basicRate,
    discRate: discRate,
    savingsRate: savingsRate
  });
  view.render('showUserExpenses', {
    income: income,
    basicRate: basicRate,
    discRate: discRate,
    savingsRate: savingsRate
  });
  view.render('showOthersExpenses', {
    income: income,
    othersExpenses: othersExpenses
  });
  view.render('showDetailedChart');
  view.render('showConclusion', {
    userExpenses: {
      basic: basicRate,
      discretionary: discRate,
      savings: savingsRate
    },
    othersExpenses: othersExpenses
  });
};

var subscriber = function(model, view, topic) {
  if (topic === 'aboutSavingsRate') {
    var data = model.read();
    var income = data.aboutIncome;
    var basicRate = data.aboutBasicRate;
    var discRate = data.aboutDiscretionaryRate;
    var savingsRate = data.aboutSavingsRate;
    var userExpenses = {
      basic: basicRate,
      discretionary: discRate,
      savings: savingsRate
    };
    var othersExpenses =  model.getDefaultRates(income);

    view.render('showUserExpenses', {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
    view.render('updateSummaryChart', {
      userExpenses: userExpenses,
      othersExpenses:othersExpenses
    });
    view.render('showConclusion', {
      userExpenses: userExpenses,
      othersExpenses:othersExpenses
    });
  }
};

module.exports = function(model, view) {
  setView(model, view);
  PubSub.subscribe('aboutIncome', function() {
    setView(model, view);
  });
  PubSub.subscribe('aboutSavingsRate', subscriber.bind(null, model, view));
  PubSub.subscribe('step.pyramid', function() {
    setView(model, view);
  });
};