/**
 * Shell module. This could be the master controller with tiny controllers for
 * each view, in MVC pattern.
 * To be more precise this is more likely the Presenter in MVP pattern.
 * Our views/screens are 'dumb'. They don't know anything about the Model, so
 * the Presenter has the job to update the screens when Model changes and viceversa.
 * @see {@link https://addyosmani.com/resources/essentialjsdesignpatterns/book/#detailmvp}
 * @module shell
 */

'use strict';

var PubSub = require('pubsub-js');
var model = require('./model');
var views = {
  //Screens
  about: require('./views/2-about'),
  you: require('./views/3-you'),
  pyramid: require('./views/5-pyramid'),
  scenarios: require('./views/6-scenarios'),
  goal: require('./views/7-goal'),
  retirement: require('./views/8-retirement'),
  plan: require('./views/9-plan'),

  //Components
  nav: require('./components/nav'),
  hamburger: require('./components/hamburger'),
  continue: require('./components/continue')
};

//Store model data in this variables, to be used throughtout this module.
var data;



///////////////////////
// VIEWS CONTROLLERS //
///////////////////////

/**
 * Every controller's job is almost the same:
 * - to bind user interactions to Model
 *   changes and publish this change to update Model observers/subscribers.
 * - to subscribe functions to update the DOM (rendering the data) whenever
 *   the Model is changed
 * @see {@url https://addyosmani.com/resources/essentialjsdesignpatterns/book/#observerpatternjavascript}
 */

/**
 * 2-About
 */

var aboutController = function() {
  views.about.bind('ageChanged', function(value) {
    model.update({'aboutAge': value});
    PubSub.publish('ageChanged', value);
  });
  views.about.bind('incomeChanged', function(value) {
    model.update({'aboutIncome': value});
    PubSub.publish('aboutIncomeChanged', value);
  });
  views.about.bind('situationChanged', function(value) {
    model.update({'aboutSituation': value});
  });
  views.about.bind('livingChanged', function(value) {
    model.update({'aboutLiving': value});
  });
};

/**
 * 3-You
 */

var youSubscriber = function(topic, data) {
  if (topic === 'aboutIncomeChanged') {
    var rates = model.getDefaultRates(data);

    views.you.configModule({
      aboutIncome: data
    });
    views.you.setSlider('basic', rates.basic);
    views.you.setSlider('discretionary', rates.discretionary);
  }
};

var youController = function() {
  views.you.bind('basicNeedsChanged', function(basicRate, savingsRate) {
    model.update({'aboutBasicRate': basicRate});
    model.update({'aboutSavingsRate': savingsRate});
    PubSub.publish('savingsRateChanged', savingsRate);
  });
  views.you.bind('expensesChanged', function(expensesRate, savingsRate) {
    model.update({'aboutDiscretionaryRate': expensesRate});
    model.update({'aboutSavingsRate': savingsRate});
    PubSub.publish('savingsRateChanged', savingsRate);
  });
  views.you.bind('savingsChanged', function(currentSavings) {
    model.update({'currentSavings': currentSavings});
    PubSub.publish('currentSavingsChanged', currentSavings);
  });

  PubSub.subscribe('aboutIncomeChanged', youSubscriber);
};

/**
 * 5-Pyramid
 */

var pyramidSubscriber = function(topic, data) {
  if (topic === 'aboutIncomeChanged') {
    views.pyramid.configModule({
      aboutIncome: data
    });
  } else if (topic === 'savingsRateChanged') {
    var savingsRate = data;
    var basicRate = model.read('aboutBasicRate');
    var discRate = model.read('aboutDiscretionaryRate');
    views.pyramid.configModule({
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
  }
  views.pyramid.updateLabels();
};

var pyramidController = function() {
  PubSub.subscribe('aboutIncomeChanged', pyramidSubscriber);
  PubSub.subscribe('savingsRateChanged', pyramidSubscriber);
};

/**
 * 6-Scenarios
 */

var scenariosSubscriber = function(topic, data) {
  if (topic === 'ageChanged') {
    views.scenarios.configModule({
      aboutAge: data
    });
  } else if (topic === 'aboutIncomeChanged') {
    views.scenarios.configModule({
      income: data
    });
    views.scenarios.setSlider('income', data);
  } else if (topic === 'savingsRateChanged') {
    views.scenarios.configModule({
      savingsRate: data
    });
    views.scenarios.setSlider('savingsRate', data);
  } else if (topic === 'currentSavingsChanged') {
    views.scenarios.configModule({
      currentSavings: data
    });
  }

  views.scenarios.updateLineChart();
};

var scenariosController = function() {
  PubSub.subscribe('ageChanged', scenariosSubscriber);
  PubSub.subscribe('aboutIncomeChanged', scenariosSubscriber);
  PubSub.subscribe('savingsRateChanged', scenariosSubscriber);
  PubSub.subscribe('currentSavingsChanged', scenariosSubscriber);
};

/**
 * 7-Goal
 */
var goalController = function() {
  views.goal.bind('goalToggled', function(goal) {
    model.toggleGoal(goal);
  });
};

/**
 * 8-Retirement
 */
var retirementController = function() {
  views.retirement.bind('actionToggled', function(action) {
    model.toggleActions(action);
  });
};


////////////////////////////
// COMPONENTS CONTROLLERS //
////////////////////////////

/**
 * Navigation
 */
var navController = function() {
  views.nav.setDisabledLinks(data.lastUserStep);
};

/**
 * Continue button
 */
var continueController = function() {
  views.continue.bind('continueClicked', function(nextActiveNavLink) {
    //When user is on the last step the value of 'nextActiveNavLink' is 'false'
    if (nextActiveNavLink) {
      var lastUserStep = Number(
        nextActiveNavLink
        .getElementsByClassName('step-number')[0]
        .textContent
      );
      var savedLastStep = data.lastUserStep;
      if (lastUserStep > savedLastStep) {
        model.update({'lastUserStep': lastUserStep});
      }
    }
  });
};



//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * Inits the views and components. Configures the views with initial Model data
 * when it is needed. Calls also the controllers for Model-Views & Views-Model
 * bindings.
 */
var init = function() {
  //get Model data only once
  data = model.read();

  //Screen #2
  var aboutContainer = document.getElementsByClassName('about-wrapper')[0];
  views.about.configModule({
    ageOptions: {
      start: data.aboutAge
    },
    incomeOptions: {
      start: data.aboutIncome
    },
    aboutSituation: data.aboutSituation,
    aboutLiving: data.aboutLiving
  });
  views.about.init(aboutContainer);
  aboutController();

  //Screen #3
  var youContainer = document.getElementsByClassName('you-wrapper')[0];
  views.you.configModule({
    aboutIncome: data.aboutIncome,
    needsOptions: {
      start: data.aboutBasicRate
    },
    expensesOptions: {
      start: data.aboutDiscretionaryRate
    },
    savingsOptions: {
      start: data.currentSavings
    },
    doughnutData: {
      series: [
        {
          value: data.aboutBasicRate,
          name: 'Basic Needs'
        },
        {
          value: data.aboutDiscretionaryRate,
          name: 'Discretionary'
        },
        {
          value: 100 - data.aboutBasicRate - data.aboutDiscretionaryRate,
          name: 'Savings'
        }
      ]
    }
  });
  views.you.init(youContainer);
  youController();

  //Screen #5
  var pyramidContainer = document.getElementsByClassName('pyramid-wrapper')[0];
  views.pyramid.configModule({
    aboutIncome: data.aboutIncome,
    basicRate: data.aboutBasicRate,
    discRate: data.aboutDiscretionaryRate,
    savingsRate: data.aboutSavingsRate
  });
  views.pyramid.init(pyramidContainer);
  pyramidController();

  //Screen #6
  var scenariosContainer = document.getElementsByClassName('scenarios-wrapper')[0];
  views.scenarios.configModule({
    savingsRate: data.aboutSavingsRate,
    income: data.aboutIncome,
    annualSavings: data.annualSavings,
    aboutAge: data.aboutAge,
    currentSavings: data.currentSavings,
    savingRateOptions: {
      start: data.aboutSavingsRate
    },
    incomeOptions: {
      start: data.aboutIncome
    },
    chartData: {
      labels: views.scenarios.getAbscissas(data.aboutAge, 65)
    }
  });
  views.scenarios.init(scenariosContainer);
  scenariosController();

  //Screen #7
  var goalContainer = document.getElementsByClassName('goal-wrapper')[0];
  views.goal.init(goalContainer, model.getGoals(), data.goals);
  goalController();

  //Screen #8
  var retirementContainer = document.getElementsByClassName('retirement-wrapper')[0];
  views.retirement.init(retirementContainer);
  retirementController();

  //Screen #9
  var planContainer = document.getElementsByClassName('plan-wrapper')[0];
  views.plan.init(planContainer);


  /* COMPONENTS */

  //Navigation
  views.nav.init();
  navController();

  //Continue buttons
  views.continue.init();
  continueController();

  //Hamburger menu
  views.hamburger.init();

  /* DEVELOPMENT ONLY */
  //@NOTE This could be useful also for users and not only for development
  var resetButton = document.getElementsByClassName('reset-model')[0];
  resetButton.addEventListener('click', function() {
    model.reset();
    document.location.reload();
  });
};

module.exports = {
  init: init
};
