/*global wNumb: false, createSlider:false */

var ageSlider = document.getElementsByClassName('about__age__slider')[0],
    incomeSlider = document.getElementsByClassName('about__income__slider')[0];

var ageOptions = {
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
},
incomeOptions = {
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
};

createSlider(ageSlider, ageOptions);
ageSlider.noUiSlider.on('update', function( values, handle ){
  var tooltip = ageSlider.getElementsByTagName('span')[0];
  tooltip.innerHTML = values[handle];
});

createSlider(incomeSlider, incomeOptions);
incomeSlider.noUiSlider.on('update', function( values, handle ){
  var tooltip = incomeSlider.getElementsByTagName('span')[0];
  tooltip.innerHTML = values[handle];
});
