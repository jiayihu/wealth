'use strict';
// var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

var TEMPLATE_CONTAINER = document.getElementsByClassName('main')[0];

loadTemplate(TEMPLATE_CONTAINER, 'templates/6-scenarios.html', loadStep);

//Event delegation for changing template
var nav = document.querySelector('.nav ul');
nav.addEventListener('click', function(e) {
  var nodeName = e.target.nodeName,
      templateUrl;
  if (nodeName === 'SPAN') {
    templateUrl = e.target.dataset.template;
    loadTemplate(TEMPLATE_CONTAINER, templateUrl, loadStep);
    setActive(e.target.parentNode);
  } else if (nodeName === 'LI') {
    templateUrl = e.target.firstElementChild.dataset.template;
    loadTemplate(TEMPLATE_CONTAINER, templateUrl, loadStep);
    setActive(e.target);
  }
});


// Set the active link on the navigation
function setActive(newActive) {
  var oldActive = document.getElementsByClassName('active')[0];
  oldActive.classList.remove('active');
  newActive.classList.add('active');
}

// Load the HTML Template of the step from the /templates/ folder
function loadTemplate(container, templateUrl, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      container.innerHTML = xhr.response;
      callback(container, templateUrl);
    }
  };
  xhr.open('GET', templateUrl);
  xhr.send();
}

function loadStep(container, templateUrl) {
  var activeStep = templateUrl.match(/\d+/)[0];
  runStepFunctions(activeStep);

  var continueButton = document.getElementsByClassName('continue')[0];
  if(continueButton) {
    continueButton.addEventListener('click', function() {
      var nextStep = parseInt(activeStep) + 1;
      var nextTemplateUrl = continueButton.firstElementChild.dataset.template;
      loadTemplate(container, nextTemplateUrl, loadStep);
      setActive( document.querySelector('.nav ul li:nth-child(' + nextStep + ')') );
    });
  }
}

function runStepFunctions(stepNumber) {
  var script = document.createElement('script');
  if(stepNumber === '2') {
    script.src='scripts/templates/2-about.js';
  } else if(stepNumber === '3') {
    script.src='scripts/templates/3-you.js';
  } else if(stepNumber === '4') {
    script.src='scripts/templates/4-people.js';
  } else if(stepNumber === '6') {
    script.src='scripts/templates/6-scenarios.js';
  }
  TEMPLATE_CONTAINER.appendChild(script);
}
