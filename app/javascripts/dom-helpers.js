var helpers = require('./helpers');
var noUiSlider = require('nouislider');

var appendTooltip = function(parent) {
  if(!parent.appendChild) {
    helpers.makeError('params', parent);
  }

  var tooltip = document.createElement('div');
  tooltip.classList.add('slider-tooltip');
  tooltip.innerHTML = '<span></span>';
  parent.appendChild(tooltip);
};

/**
 * Create a slider using noUiSlider
 * @param  {object} element HTML Node of the slider
 * @param  {object} options Slider options
 */
var createSlider = function(element, options) {
  if (typeof noUiSlider !== 'object') {
    helpers.makeError(null, 'nouislider object is not declared.');
  }
  noUiSlider.create(element, options);
  var handle = element.getElementsByClassName('noUi-handle')[0];
  appendTooltip(handle);
};

module.exports = {
  createSlider: createSlider
};
