/*global noUiSlider: false*/

function createSlider(element, options) { //jshint ignore:line
  noUiSlider.create(element, options);
  element.handle = element.getElementsByClassName('noUi-handle')[0];
  element.tooltip = document.createElement('div');
  element.handle.appendChild(element.tooltip);

  element.tooltip.classList.add('slider-tooltip');
  element.tooltip.innerHTML = '<span></span>';
  element.tooltip = element.tooltip.firstElementChild;
}
