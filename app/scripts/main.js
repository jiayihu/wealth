'use strict';
var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
if (viewportWidth > 768) {
  var hwpHeight = document.getElementsByClassName('hwp')[0].offsetHeight,
    headerHeight = document.getElementsByClassName('header')[0].offsetHeight;
  document.getElementsByClassName('nav')[0].style.height = hwpHeight - headerHeight + 'px';
}
