// var helpers = require('../helpers');
var PubSub = require('pubsub-js');
// var notie = require('notie');

var renderUpdate = function(model, view, propName, propValue) {
  var state = model.read();
  var data = {
    income: state.aboutIncome,
    savingsRate: state.aboutSavingsRate,
    age: state.aboutAge,
    currentSavings: state.currentSavings
  };
  data[propName] = propValue;

  view.render('updateLineChartSerie', data);
};

var setView = function(model, view, initialState) {
  var age = initialState.aboutAge;
  var income = initialState.aboutIncome;
  var savingsRate = initialState.aboutSavingsRate;
  var currentSavings = initialState.currentSavings;

  view.render('showSliders', {
    income: income,
    savingsRate: savingsRate
  });
  view.render('showLineChart', {
    age: age,
    income: income,
    savingsRate: savingsRate,
    currentSavings: currentSavings
  });
};

var bindView = function(model, view) {
  var bindedRenderUpdate = renderUpdate.bind(null, model, view);
  var events = [
    'annualInterestRateChanged',
    'savingsRateChanged',
    'incomeChanged',
    'investmentRateChanged',
    'retirementAgeChanged'
  ];

  events.forEach(function(eventName) {
    view.bind(eventName, bindedRenderUpdate.bind(null,  eventName.replace('Changed', '')));
  });
};

var subscriber = function(model, view, topic, data) {
  var bindedRenderUpdate = renderUpdate.bind(null, model, view);

  if (topic === 'aboutAge') {
    bindedRenderUpdate('age', data);
  } else if(topic === 'aboutIncome') {
    view.render('setSlider', {
      sliderName: 'income',
      value: data
    });
    bindedRenderUpdate('income', data);
  } else if(topic === 'aboutSavingsRate') {
    view.render('setSlider', {
      sliderName: 'savingsRate',
      value: data
    });
    bindedRenderUpdate('savingsRate', data);
  } else if (topic === 'currentSavings') {
    bindedRenderUpdate('currentSavings', data);
  }
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);

  PubSub.subscribe('aboutAge', subscriber.bind(null, model, view));
  PubSub.subscribe('aboutIncome', subscriber.bind(null, model, view));
  PubSub.subscribe('aboutSavingsRate', subscriber.bind(null, model, view));
  PubSub.subscribe('currentSavings', subscriber.bind(null, model, view));
};