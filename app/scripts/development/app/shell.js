var app = window.app || {};

app.shell = (function(window, PubSub) {
  var data;

  /**
   * VIEWS CONTROLLERS
   */

  /**
   * 2-About
   */
  var aboutController = function() {
    app.views.about.bind('ageChanged', function(value) {
      wealthApp.model.update('aboutAge', value);
    });
    app.views.about.bind('incomeChanged', function(value) {
      wealthApp.model.update('aboutIncome', value, function(value) {
        PubSub.publish('aboutIncomeChanged', value);
      });
      wealthApp.model.updateMoneyValues(function(moneyValues) {
        PubSub.publish('moneyValuesChanged', moneyValues);
      });
    });
    app.views.about.bind('situationChanged', function(value) {
      wealthApp.model.update('aboutSituation', value);
    });
    app.views.about.bind('livingChanged', function(value) {
      wealthApp.model.update('aboutLiving', value);
    });
  };

  /**
   * 3-You
   */
  var youSubscriber = function(topic, data) {
    if(topic === 'aboutIncomeChanged') {
      app.views.you.configModule({
        aboutIncome: data
      });
    }
  };

  var youController = function() {
    app.views.you.bind('basicNeedsChanged', function(basicRate, savingsRate) {
      wealthApp.model.update('aboutBasicRate', basicRate);
      wealthApp.model.update('aboutSavingsRate', savingsRate, function(savingsRate) {
        PubSub.publish('savingsRateChanged', savingsRate);
      });
      wealthApp.model.updateMoneyValues(function(moneyValues) {
        PubSub.publish('moneyValuesChanged', moneyValues);
      });
    });
    app.views.you.bind('expensesChanged', function(expensesRate, savingsRate) {
      wealthApp.model.update('aboutDiscretionaryRate', expensesRate);
      wealthApp.model.update('aboutSavingsRate', savingsRate, function(savingsRate) {
        PubSub.publish('savingsRateChanged', savingsRate);
      });
      wealthApp.model.updateMoneyValues(function(moneyValues) {
        PubSub.publish('moneyValuesChanged', moneyValues);
      });
    });

    PubSub.subscribe('aboutIncomeChanged', youSubscriber);
  };

  /**
   * 5-Pyramid
   */
  var pyramidSubscriber = function(topic, data) {
    if(topic === 'aboutIncomeChanged') {
      app.views.pyramid.configModule({
        aboutIncome: data
      });
    } else if(topic === 'moneyValuesChanged') {
      app.views.pyramid.configModule(data);
    }
    app.views.pyramid.updateLabels();
  };

  var pyramidController = function() {
    PubSub.subscribe('aboutIncomeChanged', pyramidSubscriber);
    PubSub.subscribe('moneyValuesChanged', pyramidSubscriber);
  };

  /**
   * 6-Scenarios
   */
  var scenariosSubscriber = function(topic, data) {
    if(topic === 'aboutIncomeChanged') {
      app.views.scenarios.configModule({income: data});
      app.views.scenarios.updateLineChart();
      app.views.scenarios.setSlider('income', data);
    } else if(topic === 'savingsRateChanged') {
      app.views.scenarios.configModule({savingsRate: data});
      app.views.scenarios.updateLineChart();
      app.views.scenarios.setSlider('savingsRate', data);
    }
  };

  var scenariosController = function() {
    PubSub.subscribe('aboutIncomeChanged', scenariosSubscriber);
    PubSub.subscribe('savingsRateChanged', scenariosSubscriber);
  };

  /**
   * 7-Goal
   */
  var goalController = function() {
    app.views.goal.bind('goalToggled', function(goal) {
      wealthApp.model.toggleGoal(goal);
    });
  };

  /**
   * 8-Retirement
   */
  var retirementController = function() {
    app.views.retirement.bind('actionToggled', function(action) {
      wealthApp.model.toggleActions(action);
    });
  };

  /**
   * COMPONENTS CONTROLLERS
   */

  /**
   * Navigation
   */
  var navController = function() {
    app.views.nav.setDisabledLinks(data.lastUserStep);
  };

  /**
   * Continue button
   */
  var continueController = function() {
    app.views.continue.bind('continueClicked', function(nextActiveNavLink) {
      //When user is on the last step the value of 'nextActiveNavLink' is 'false'
      if(nextActiveNavLink) {
        var lastUserStep = Number(
          nextActiveNavLink
            .getElementsByClassName('step-number')[0]
            .textContent
        );
        var savedLastStep = data.lastUserStep;
        if(lastUserStep > savedLastStep) {
          wealthApp.model.update('lastUserStep', lastUserStep);
        }
      }
    });
  };


  /**
   * PUBLIC FUNCTIONS
   */

  var init = function() {
    data = wealthApp.model.read();
    //Screen #2
    var aboutContainer = document.getElementsByClassName('about-wrapper')[0];
    app.views.about.configModule({
      ageOptions: {
        start: data.aboutAge
      },
      incomeOptions: {
        start: data.aboutIncome
      },
      aboutSituation: data.aboutSituation,
      aboutLiving: data.aboutLiving
    });
    app.views.about.init(aboutContainer);
    aboutController();

    //Screen #3
    var youContainer = document.getElementsByClassName('you-wrapper')[0];
    app.views.you.configModule({
      aboutIncome: data.aboutIncome,
      needsOptions: {
        start: data.aboutBasicRate
      },
      expensesOptions: {
        start: data.aboutDiscretionaryRate
      },
      doughnutData: {
          series: [{value: data.aboutBasicRate, name: 'Basic Needs'}, {value: data.aboutDiscretionaryRate,name: 'Discretionary'}]
      }
    });
    app.views.you.init(youContainer);
    youController();

    //Screen #5
    var pyramidContainer = document.getElementsByClassName('pyramid-wrapper')[0];
    app.views.pyramid.configModule({
      basicNeeds: data.basicNeeds,
      savings: data.savings,
      discretionaryExpenses: data.discretionaryExpenses,
      aboutIncome: data.aboutIncome
    });
    app.views.pyramid.init(pyramidContainer);
    pyramidController();

    //Screen #6
    var scenariosContainer = document.getElementsByClassName('scenarios-wrapper')[0];
    app.views.scenarios.configModule({
      savingsRate: data.aboutSavingsRate,
      income: data.aboutIncome,
      savings: data.savings,
      savingRateOptions: {
        start: data.aboutSavingsRate
      },
      incomeOptions: {
        start: data.aboutIncome
      },
      chartData: {
        labels: app.views.scenarios.getAbscissas(data.aboutAge, 65)
      }
    });
    app.views.scenarios.init(scenariosContainer);
    scenariosController();

    //Screen #7
    var goalContainer = document.getElementsByClassName('goal-wrapper')[0];
    app.views.goal.init(goalContainer);
    goalController();

    //Screen #8
    var retirementContainer = document.getElementsByClassName('retirement-wrapper')[0];
    app.views.retirement.init(retirementContainer);
    retirementController();

    //Screen #9
    var planContainer = document.getElementsByClassName('plan-wrapper')[0];
    app.views.plan.init(planContainer);


    /* COMPONENTS */

    //Navigation
    app.views.nav.init();
    navController();

    //Continue buttons
    app.views.continue.init();
    continueController();

    /* PRODUCTION */
    var resetButton = document.getElementsByClassName('reset-model')[0];
    resetButton.addEventListener('click', function() {
      wealthApp.model.reset();
      document.location.reload();
    });
  };

  return {
    init: init
  };

})(window, PubSub);
