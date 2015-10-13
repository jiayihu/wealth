'use strict';

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
      var nav = document.querySelector(app.config.navClass);
      nav.addEventListener('click', app.onNavClick);

      var continueButtons = document.getElementsByClassName('continue');
      Array.prototype.forEach.call(continueButtons, function(element) {
        element.addEventListener('click', app.onContinueClick);
      });
    },

    onNavClick: function(e) {
      var nodeName = e.target.nodeName,
        nextStep, nextStepElement;
      if (nodeName === 'SPAN') {
        nextStep = e.target.dataset.template;
        app.setActive(e.target.parentNode, 'active');
      } else if (nodeName === 'LI') {
        nextStep = e.target.firstElementChild.dataset.template;
        app.setActive(e.target, 'active');
      }
      nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];
      app.setActive(nextStepElement, 'show');
    },

    onContinueClick: function() {
      var nextStep = this.dataset.template,
        nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];

      app.setActive(nextStepElement, 'show');
      var newActiveNavLink = document.getElementsByClassName('active')[0].nextElementSibling;
      //Check if it is the last nav link
      if(newActiveNavLink) {
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
