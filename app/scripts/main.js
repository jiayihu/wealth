define(function(require) {
  var TEMPLATE_CONTAINER = document.getElementsByClassName('main')[0];

  loadTemplate(TEMPLATE_CONTAINER, 'templates/1-intro.html', runStepFunctions);
  //Event delegation for changing template
  var nav = document.querySelector('.nav ul');
  nav.addEventListener('click', function(e) {
    var nodeName = e.target.nodeName,
        templateUrl;
    if (nodeName === 'SPAN') {
      templateUrl = e.target.dataset.template;
      loadTemplate(TEMPLATE_CONTAINER, templateUrl, runStepFunctions);
      setActive(e.target.parentNode);
    } else if (nodeName === 'LI') {
      templateUrl = e.target.firstElementChild.dataset.template;
      loadTemplate(TEMPLATE_CONTAINER, templateUrl, runStepFunctions);
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
        var activeStep = templateUrl.match(/\d+/)[0],
          continueButton = document.getElementsByClassName('continue')[0];
        if(continueButton) {
          continueButton.addEventListener('click', function() {
            var nextStep = parseInt(activeStep) + 1;
            var nextTemplateUrl = continueButton.firstElementChild.dataset.template;
            loadTemplate(container, nextTemplateUrl, runStepFunctions);
            setActive( document.querySelector('.nav ul li:nth-child(' + nextStep + ')') );
          });
        }
        callback(activeStep);
      }
    };
    xhr.open('GET', templateUrl);
    xhr.send();
  }

  function runStepFunctions(stepNumber) {
    if(stepNumber === '2') {
      require(['templates/2-about'], function() {
      });
    } else if(stepNumber === '3') {
      require(['templates/3-you'], function() {
      });
    } else if(stepNumber === '4') {

    } else if(stepNumber === '6') {

    } else if(stepNumber === '7') {

    }
  }
});
