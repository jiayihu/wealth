var helpers = require('../helpers');
var PubSub = require('pubsub-js');
var notie = require('notie');

var bindView = function(model, view) {
  view.bind('basicRateChanged', function(basicRate) {
    var discRate = model.read('aboutDiscretionaryRate');
    var savingsRate = 100 - basicRate - discRate;

    if(savingsRate < 0) {
      view.render('setSlider', {
        sliderName: 'basic',
        value: model.read('aboutBasicRate')
      });
      helpers.makeError('user', 'Error: the sum of basic & discretionary rates are superior than 100', notie.alert.bind(null, 3));
    }

    model.update({aboutBasicRate: basicRate});
    model.update({aboutSavingsRate: savingsRate});
    view.render('updatePieChart', {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
  });

  view.bind('discRateChanged', function(discRate) {
    var basicRate = model.read('aboutBasicRate');
    var savingsRate = 100 - basicRate - discRate;

    if(savingsRate < 0) {
      view.render('setSlider', {
        sliderName: 'discretionary',
        value: model.read('aboutDiscretionaryRate')
      });
      helpers.makeError('user', 'Error: the sum of basic & discretionary rates are superior than 100', notie.alert.bind(null, 3));
    }

    model.update({'aboutDiscretionaryRate': discRate});
    model.update({'aboutSavingsRate': savingsRate});
    view.render('updatePieChart', {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
  });

  view.bind('currentSavingsChanged', function(currentSavings) {
    model.update({'currentSavings': currentSavings});
  });

  view.bind('detailsChanged', function() {});

  view.bind('detailsReset', function() {
    var income = model.read('aboutIncome');
    var defaultExpenses = model.getDefaultRates(income, true).detailed;

    view.render('showDetailed', {
      expenses: defaultExpenses
    });
  });

  view.bind('detailsSaved', function(err, values) {
    if(err) {
      notie.alert(3, err);
    } else {
      var summaryExpenses = model.getSummaryExpenses(values);
      view.render('setSlider', {
        sliderName: 'basic',
        value: summaryExpenses.basic
      });
      view.render('setSlider', {
        sliderName: 'discretionary',
        value: summaryExpenses.discretionary
      });
      model.update({expenses: values});

      window.ga('send', {
        hitType: 'event',
        eventCategory: 'Step #3.5',
        eventAction: 'Continue'
      });
    }
  });
};

var setView = function(model, view, initialState) {
  var income = initialState.aboutIncome;
  var basicRate = initialState.aboutBasicRate;
  var discRate = initialState.aboutDiscretionaryRate;
  var currentSavings = initialState.currentSavings;
  var expenses = initialState.expenses;

  //If user has not entered detailed expenses yet
  if(expenses.length == 0) {
    expenses = model.getDefaultRates(income, true).detailed;
  }

  view.render('showSliders', {
    basicRate: basicRate,
    discRate: discRate,
    currentSavings: currentSavings
  });
  view.render('showPieChart', {
    income: income,
    basicRate: basicRate,
    discRate: discRate
  });
  view.render('showDetailed', {
    expenses: expenses
  });
};

var subscriber = function(model, view, topic, data) {
  if (topic === 'aboutIncome') {
    //data is the new income
    var defaultRates = model.getDefaultRates(data, true);
    view.render('setSlider', {
      sliderName: 'basic',
      value: defaultRates.basic
    });
    view.render('setSlider', {
      sliderName: 'discretionary',
      value: defaultRates.discretionary
    });
    view.render('updatePieTooltip', data);
    view.render('showDetailed', {
      expenses: defaultRates.detailed
    });
  }
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
  PubSub.subscribe('aboutIncome', subscriber.bind(null, model, view));
  PubSub.subscribe('step.expenses', function() {
    var expenses = model.read('expenses');
    if(!expenses.length) {
      view.render('showIntro');
    }
  });
};
