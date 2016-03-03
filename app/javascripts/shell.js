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
var stateMap = {
  data: null
};



///////////////////////
// VIEWS CONTROLLERS //
///////////////////////

/**
 * Every controller's job is almost the same:
 * - to bind user interactions to functions which update the model
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
  });
  views.about.bind('incomeChanged', function(value) {
    model.update({'aboutIncome': value});
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
  if (topic === 'aboutIncome') {
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
  });
  views.you.bind('expensesChanged', function(expensesRate, savingsRate) {
    model.update({'aboutDiscretionaryRate': expensesRate});
    model.update({'aboutSavingsRate': savingsRate});
  });
  views.you.bind('savingsChanged', function(currentSavings) {
    model.update({'currentSavings': currentSavings});
  });

  PubSub.subscribe('aboutIncome', youSubscriber);
};

/**
 * 5-Pyramid
 */

var pyramidSubscriber = function(topic, data) {
  if (topic === 'aboutIncome') {
    views.pyramid.configModule({
      aboutIncome: data
    });
  } else if (topic === 'aboutSavingsRate') {
    var savingsRate = data;
    var basicRate = model.read('aboutBasicRate');
    var discRate = model.read('aboutDiscretionaryRate');
    views.pyramid.configModule({
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
  }
  views.pyramid.render();
};

var pyramidController = function() {
  PubSub.subscribe('aboutIncome', pyramidSubscriber);
  PubSub.subscribe('aboutSavingsRate', pyramidSubscriber);
  PubSub.subscribe('step.pyramid', pyramidSubscriber);
};

/**
 * 6-Scenarios
 */

var scenariosSubscriber = function(topic, data) {
  if (topic === 'age') {
    views.scenarios.configModule({
      aboutAge: data
    });
  } else if (topic === 'aboutIncome') {
    views.scenarios.configModule({
      income: data
    });
    views.scenarios.setSlider('income', data);
  } else if (topic === 'savingsRate') {
    views.scenarios.configModule({
      savingsRate: data
    });
    views.scenarios.setSlider('savingsRate', data);
  } else if (topic === 'currentSavings') {
    views.scenarios.configModule({
      currentSavings: data
    });
  }

  views.scenarios.updateLineChart();
};

var scenariosController = function() {
  PubSub.subscribe('aboutAge', scenariosSubscriber);
  PubSub.subscribe('aboutIncome', scenariosSubscriber);
  PubSub.subscribe('aboutSavingsRate', scenariosSubscriber);
  PubSub.subscribe('currentSavings', scenariosSubscriber);
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
  views.nav.setDisabledLinks(stateMap.data.lastUserStep);
  views.nav.bind('linkClicked', function(nextStep) {
    if(nextStep) {
      PubSub.publish('step.' + nextStep);
    }
  });
};

/**
 * Continue button
 */
var continueController = function() {
  views.continue.bind('continueClicked', function(nextActiveNavLink) {
    var link = nextActiveNavLink;
    //When user is on the last step the value of 'nextActiveNavLink' is 'false'
    if (link) {
      var lastUserStep = Number(link.get('step-number').textContent);
      var savedLastStep = stateMap.data.lastUserStep;
      var nextActiveStep = link.get('step-name').dataset.template;

      PubSub.publish('step.' + nextActiveStep);
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
  stateMap.data = model.read();
  var data = stateMap.data;

  //Screen #2
  var aboutContainer = document.get('about-wrapper');
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
  var youContainer = document.get('you-wrapper');
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
  var pyramidContainer = document.get('pyramid-wrapper');
  views.pyramid.configModule({
    aboutIncome: data.aboutIncome,
    basicRate: data.aboutBasicRate,
    discRate: data.aboutDiscretionaryRate,
    savingsRate: data.aboutSavingsRate
  });
  views.pyramid.init(pyramidContainer);
  pyramidController();

  //Screen #6
  var scenariosContainer = document.get('scenarios-wrapper');
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
  var goalContainer = document.get('goal-wrapper');
  views.goal.init(goalContainer, model.getGoals(), data.goals);
  goalController();

  //Screen #8
  var retirementContainer = document.get('retirement-wrapper');
  views.retirement.init(retirementContainer);
  retirementController();

  //Screen #9
  var planContainer = document.get('plan-wrapper');
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
  var resetButton = document.get('reset-model');
  resetButton.addEventListener('click', function() {
    model.reset();
    document.location.reload();
  });
  PubSub.subscribe('step', function(topic) {
    console.log('Step changed: ', topic);
  });
};

module.exports = {
  init: init
};
