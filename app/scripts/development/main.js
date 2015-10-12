'use strict';
// var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

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

//Event delegation for changing template
var nav = document.querySelector('.nav ul');
nav.addEventListener('click', function(e) {
  var nodeName = e.target.nodeName,
      nextStep, nextStepElement;
  if (nodeName === 'SPAN') {
    nextStep = e.target.dataset.template;
    setActive(e.target.parentNode, 'active');
  } else if (nodeName === 'LI') {
    nextStep = e.target.firstElementChild.dataset.template;
    setActive(e.target, 'active');
  }
  nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];
  setActive(nextStepElement, 'show');
});

// Continue buttons to change to next step
var continueButtons = document.getElementsByClassName('continue');
for(var i = 0; i < continueButtons.length; i++) {
  continueButtons[i].addEventListener('click', function() {
    var nextStep = this.dataset.template,
      nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];

    setActive(nextStepElement, 'show');
    var newActiveNavLink = document.getElementsByClassName('active')[0].nextElementSibling;
    if(newActiveNavLink) {
      setActive(newActiveNavLink, 'active');
    }
  });
}

// Set the active link on the navigation
function setActive(newActive, className) {
  var oldActive = document.getElementsByClassName(className)[0];
  oldActive.classList.remove(className);
  newActive.classList.add(className);
}

function createSlider(element, options) { //jshint ignore:line
  noUiSlider.create(element, options);
  element.handle = element.getElementsByClassName('noUi-handle')[0];
  element.tooltip = document.createElement('div');
  element.handle.appendChild(element.tooltip);

  element.tooltip.classList.add('slider-tooltip');
  element.tooltip.innerHTML = '<span></span>';
  element.tooltip = element.tooltip.firstElementChild;
}

//@@include('./templates/1-intro.js')
//@@include('./templates/2-about.js')
//@@include('./templates/3-you.js')
//@@include('./templates/4-people.js')
//@@include('./templates/5-pyramid.js')
//@@include('./templates/6-scenarios.js')
//@@include('./templates/7-goal.js')
//@@include('./templates/8-retirement.js')
//@@include('./templates/9-plan.js')
