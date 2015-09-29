'use strict';
// var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

var gModel = {};

var TEMPLATE_CONTAINER = document.getElementsByClassName('main')[0],
  templates = ['intro', 'about', 'you', 'people', 'pyramid', 'scenarios',
  'goal', 'retirement', 'plan'];

loadTemplates(TEMPLATE_CONTAINER, templates);

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

// Load the HTML Template of the step from the /templates/ folder
function loadTemplates(container, templatesUrl) {
  var xhr, templateUrl, activeStep, stepWrapper;
  for(var i=0; i < templatesUrl.length; i++) {
    xhr = new XMLHttpRequest();
    templateUrl = 'templates/' + (i+1) + '-' + templatesUrl[i] + '.html';
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        stepWrapper = document.createElement('div');
        if( !(templatesUrl[i] === 'you' || templatesUrl[i] === 'scenarios') ) {
          stepWrapper.classList.add('step-wrapper');
        }
        if(i === 8) {
          stepWrapper.classList.add('show');
        }
        stepWrapper.classList.add(templatesUrl[i] + '-wrapper');
        stepWrapper.innerHTML = xhr.response;
        container.appendChild(stepWrapper);
        activeStep = templateUrl.match(/\d+/)[0];
        runStepFunctions(activeStep);
      }
    };
    xhr.open('GET', templateUrl, false);
    xhr.send();
  }
}

function runStepFunctions(stepNumber) {
  stepNumber = parseInt(stepNumber);
  var script = document.createElement('script');
  if(stepNumber === 2) {
    script.src='scripts/templates/2-about.js';
  } else if(stepNumber === 3) {
    script.src='scripts/templates/3-you.js';
  } else if(stepNumber === 4) {
    script.src='scripts/templates/4-people.js';
  } else if(stepNumber === 6) {
    script.src='scripts/templates/6-scenarios.js';
  } else if(stepNumber === 7) {
    script.src='scripts/templates/7-goal.js';
  } else if(stepNumber === 8) {
    script.src='scripts/templates/8-retirement.js';
  } else if(stepNumber === 9) {
    script.src='scripts/templates/9-plan.js';
  }
  TEMPLATE_CONTAINER.appendChild(script);
}

// Set the active link on the navigation
function setActive(newActive, className) {
  var oldActive = document.getElementsByClassName(className)[0];
  oldActive.classList.remove(className);
  newActive.classList.add(className);
}
