/*global noUiSlider: false, wNumb: false*/
'use strict';
// var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

// Set the active link on the navigation
function setActive(newActive) {
  var oldActive = document.getElementsByClassName('active')[0];
  oldActive.classList.remove('active');
  newActive.classList.add('active');
}

// Load the HTML Template of the step from the /templates/ folder
function loadTemplate(templateUrl) {
  var mainDiv = document.getElementsByClassName('main')[0],
    xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var activeStep = templateUrl.match(/\d+/)[0];
      mainDiv.innerHTML = xhr.response;
      runStepFunctions(activeStep);

      var continueButton = document.getElementsByClassName('continue')[0];
      continueButton.addEventListener('click', function() {
        var nextStep = parseInt(activeStep) + 1;
        console.log(activeStep);
        var templateUrl = continueButton.firstElementChild.dataset.template;
        loadTemplate(templateUrl);
        setActive( document.querySelector('.nav ul li:nth-child(' + nextStep + ')') );
      });
    }
  };
  xhr.open('GET', templateUrl);
  xhr.send();
}

function runStepFunctions(stepNumber) {
  if(stepNumber === '2') {
    var ageSlider = document.getElementsByClassName('about__age__slider')[0],
        incomeSlider = document.getElementsByClassName('about__income__slider')[0];

    noUiSlider.create(ageSlider, {
      start: 20,
      step: 1,
      range: {
        'min': 18,
        'max': 70
      },
      pips: {
        mode: 'values',
        values: [20, 30, 40, 50, 60, 70],
        density: 5
      },
      format: wNumb({
    		decimals: 1,
    		thousand: '.'
    	})
    });
    var ageHandles = ageSlider.getElementsByClassName('noUi-handle'),
    	ageTooltips = [];

    for ( var i = 0; i < ageHandles.length; i++ ){
    	ageTooltips[i] = document.createElement('div');
    	ageHandles[i].appendChild(ageTooltips[i]);
    }

    ageTooltips[0].className += 'slider-tooltip';
    ageTooltips[0].innerHTML = '<span></span>';
    ageTooltips[0] = ageTooltips[0].getElementsByTagName('span')[0];

    // When the slider changes, write the value to the Tooltips.
    ageSlider.noUiSlider.on('update', function( values, handle ){
    	ageTooltips[handle].innerHTML = values[handle];
    });

    noUiSlider.create(incomeSlider, {
      start: 24000,
      step: 1000,
      range: {
        'min': 18000,
        'max': 100000
      },
      format: wNumb({
    		decimals: 1,
    		thousand: '.'
    	})
    });

    var tipHandles = incomeSlider.getElementsByClassName('noUi-handle'),
    	tooltips = [];

    for ( var j = 0; j < tipHandles.length; j++ ){
    	tooltips[j] = document.createElement('div');
    	tipHandles[j].appendChild(tooltips[j]);
    }

    tooltips[0].className += 'slider-tooltip';
    tooltips[0].innerHTML = '<span></span>';
    tooltips[0] = tooltips[0].getElementsByTagName('span')[0];

    // When the slider changes, write the value to the tooltips.
    incomeSlider.noUiSlider.on('update', function( values, handle ){
    	tooltips[handle].innerHTML = values[handle];
    });
  }
}

//Event delegation for changing template
var nav = document.querySelector('.nav ul');
nav.addEventListener('click', function(e) {
  var nodeName = e.target.nodeName,
      templateUrl;
  if (nodeName === 'SPAN') {
    templateUrl = e.target.dataset.template;
    loadTemplate(templateUrl);
    setActive(e.target.parentNode);
  } else if (nodeName === 'LI') {
    templateUrl = e.target.firstElementChild.dataset.template;
    loadTemplate(templateUrl);
    setActive(e.target);
  }
});

//Setting the first step template on load
loadTemplate('templates/1-intro.html');
