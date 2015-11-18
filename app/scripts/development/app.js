//Global variable with user data
//Defaul values
var gModel = {
  aboutAge: 20,
  aboutSituation: 'married',
  aboutLiving: 'rent',
  aboutIncome: 60000,
  aboutBasicRate: 45,
  aboutDiscretionaryRate: 25,
  aboutSavingsRate: 30,
  aboutStage: 'home',
  basicNeeds: 27000,
  discretionaryExpenses: 15000,
  savings: 18000,
  pickedGoals: [],
  savedActions: []
};

(function() {
  var app = {
    config: {
      navClass: '.nav ul'
    },

    init: function() {
      var continueButtons = document.getElementsByClassName('continue');
      Array.prototype.forEach.call(continueButtons, function(element) {
        element.addEventListener('click', app.onContinueClick);
      });
    },

    onContinueClick: function() {
      var nextStep = this.dataset.template,
        nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];

      app.setActive(nextStepElement, 'show');
      var newActiveNavLink = document.getElementsByClassName('active')[0].nextElementSibling;
      //Check if it is the last nav link
      if(newActiveNavLink) {
        //Active the navigation item
        if(newActiveNavLink.classList.contains('disabled')) {
          newActiveNavLink.classList.remove('disabled');
        }
        app.setActive(newActiveNavLink, 'active');
      }
    },

    setActive: function(newActive, className) {
      var oldActive = document.getElementsByClassName(className)[0];
      oldActive.classList.remove(className);
      newActive.classList.add(className);
    }
  };

  app.init();
})();
