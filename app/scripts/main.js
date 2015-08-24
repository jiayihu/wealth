'use strict';
var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
if (viewportWidth > 768) {
  var hwpHeight = document.getElementsByClassName('hwp')[0].offsetHeight,
    headerHeight = document.getElementsByClassName('header')[0].offsetHeight;
  document.getElementsByClassName('nav')[0].style.height = hwpHeight - headerHeight + 'px';
}

// Load the HTML Template of the step from the /templates/ folder
function loadTemplate(templateUrl) {
  var mainDiv = document.getElementsByClassName('main')[0],
    xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      console.log(xhr);
      mainDiv.innerHTML = xhr.response;
    }
  };
  xhr.open('GET', templateUrl);
  xhr.send();
}

//Event delegation for changing template
var nav = document.querySelector('.nav');
nav.addEventListener('click', function(e) {
  console.log(e.target);
  if (e.target.nodeName === 'SPAN') {
    var templateUrl = e.target.dataset.template,
      activeLink = document.getElementsByClassName('active')[0];
    loadTemplate(templateUrl);
    activeLink.classList.remove('active');
    e.target.parentNode.classList.add('active');
  }
});

//Setting the first step template on load
loadTemplate('templates/first.html');
