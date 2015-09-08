/*global noUiSlider: false, wNumb: false*/

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
