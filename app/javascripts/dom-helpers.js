var helpers = require('./helpers');
var noUiSlider = require('nouislider');

/**
 * Appends an HTML element as tooltip to the slider
 * @param  {object} slider Slider DOM Element
 * @return {object}
 */
var appendTooltip = function(slider) {
  if(!slider.appendChild) {
    helpers.makeError('params', slider);
  }

  var handle = slider.getElementsByClassName('noUi-handle')[0];
  var tooltip = document.createElement('div');
  tooltip.classList.add('slider-tooltip');
  tooltip.innerHTML = '<span></span>';
  handle.appendChild(tooltip);

  return slider;
};

/**
 * Create a slider using noUiSlider
 * @param  {HTMLElement} element HTML Node of the slider
 * @param  {object} options Slider options
 * @param  {string} format Tooltip value format
 * @return {HTMLElement} tooltip-handle
 */
var createSlider = function(element, options) {
  if (typeof noUiSlider !== 'object') {
    helpers.makeError(null, 'nouislider object is not declared.');
  }
  noUiSlider.create(element, options);
  return element;
};

var updateHandler = function(slider, format) {
  var tooltip = slider.getElementsByTagName('span')[0];
  slider.noUiSlider.on('update', function(values) {
    tooltip.innerHTML = helpers.format(values[0], format);
  });
};

var sliderWithTooltips = function(element, options, format) {
  updateHandler(
    appendTooltip( createSlider(element, options) ),
    format
  );
};

module.exports = {
  createSlider: sliderWithTooltips
};
