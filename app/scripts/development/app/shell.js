var app = window.app || {};

app.shell = (function(window) {
  /**
   * VIEWS CONTROLLERS
   */

  var aboutController = function() {
    app.views.about.bind('ageChanged', function(value) {
      wealthApp.model.update('aboutAge', value);
    });
    app.views.about.bind('incomeChanged', function(value) {
      wealthApp.model.update('aboutIncome', value);
      wealthApp.model.updateMoneyValues();
    });
    app.views.about.bind('situationChanged', function(value) {
      wealthApp.model.update('aboutSituation', value);
    });
    app.views.about.bind('livingChanged', function(value) {
      wealthApp.model.update('aboutLiving', value);
    });
  };

  var init = function() {
    //Screen #2
    var aboutContainer = document.getElementsByClassName('about-wrapper')[0];
    app.views.about.init(aboutContainer);
    aboutController();

    //Screen #3
    var youContainer = document.getElementsByClassName('you-wrapper')[0];
    app.views.you.init(youContainer);

    //Screen #5
    var pyramidContainer = document.getElementsByClassName('pyramid-wrapper')[0];
    app.views.pyramid.init(pyramidContainer);

    //Screen #6
    var scenariosContainer = document.getElementsByClassName('scenarios-wrapper')[0];
    app.views.scenarios.init(scenariosContainer);

    //Screen #7
    var goalContainer = document.getElementsByClassName('goal-wrapper')[0];
    app.views.goal.init(goalContainer);

    //Screen #8
    var retirementContainer = document.getElementsByClassName('retirement-wrapper')[0];
    app.views.retirement.init(retirementContainer);

    //Screen #9
    var planContainer = document.getElementsByClassName('plan-wrapper')[0];
    app.views.plan.init(planContainer);
  };

  return {
    init: init
  };

})(window);
