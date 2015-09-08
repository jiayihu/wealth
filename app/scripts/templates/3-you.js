/*global noUiSlider: false, wNumb: false, Chart: false*/

var needsSlider = document.getElementsByClassName('about__savings__slider--needs')[0],
    expensesSlider = document.getElementsByClassName('about__savings__slider--expenses')[0];

noUiSlider.create(needsSlider, {
  start: 20,
  step: 1,
  range: {
    'min': 1,
    'max': 60
  },
  format: wNumb({
    decimals: 0
  })
});

var tipHandles = needsSlider.getElementsByClassName('noUi-handle'),
  tooltips = [];

for ( var j = 0; j < tipHandles.length; j++ ){
  tooltips[j] = document.createElement('div');
  tipHandles[j].appendChild(tooltips[j]);
}

tooltips[0].className += 'slider-tooltip';
tooltips[0].innerHTML = '<span></span>';
tooltips[0] = tooltips[0].getElementsByTagName('span')[0];

// When the slider changes, write the value to the tooltips.
needsSlider.noUiSlider.on('update', function( values, handle ){
  tooltips[handle].innerHTML = values[handle] + '%';
});


noUiSlider.create(expensesSlider, {
  start: 20,
  step: 1,
  range: {
    'min': 1,
    'max': 40
  },
  format: wNumb({
    decimals: 0
  })
});

var tipHandles = expensesSlider.getElementsByClassName('noUi-handle'),
  expensesToolTips = [];

for ( var j = 0; j < tipHandles.length; j++ ){
  expensesToolTips[j] = document.createElement('div');
  tipHandles[j].appendChild(expensesToolTips[j]);
}

expensesToolTips[0].className += 'slider-tooltip';
expensesToolTips[0].innerHTML = '<span></span>';
expensesToolTips[0] = expensesToolTips[0].getElementsByTagName('span')[0];

// When the slider changes, write the value to the expensesToolTips.
expensesSlider.noUiSlider.on('update', function( values, handle ){
  expensesToolTips[handle].innerHTML = values[handle] + '%';
});

Chart.defaults.global.tooltipTemplate = '<%if (label){%><%=label%>: <%}%><%= value %> \%';

var savingsCtx = document.getElementsByClassName('about__savings__circle')[0].getContext('2d'),
  savingsLegend = document.getElementsByClassName('circle-legend')[0],
  data = [{
      value: 20,
      color: '#D3D3D3',
      label: 'Basic Needs'
    },
    {
      value: 20,
      color: '#E97B6C',
      label: 'Discretionary'
    }],
  options = {
    percentageInnerCutout : 75,
    legendTemplate: '<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background:<%=segments[i].value%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'
  };
data[2] = {
  value: 100 - data[0].value - data[1].value,
  color: '#9DDC57',
  label: 'Savings'
};
var savingsChart = new Chart(savingsCtx).Doughnut(data, options);
savingsLegend.innerHTML = savingsChart.generateLegend();

//Bind slider changes to circle update
needsSlider.noUiSlider.on('change', function( values, handle ){
  savingsChart.segments[0].value = parseInt(values[0]);
  savingsChart.segments[2].value = 100 - savingsChart.segments[0].value - savingsChart.segments[1].value;
  savingsChart.update();
});
expensesSlider.noUiSlider.on('change', function( values, handle ){
  savingsChart.segments[1].value = parseInt(values[0]);
  savingsChart.segments[2].value = 100 - savingsChart.segments[0].value - savingsChart.segments[1].value;
  savingsChart.update();
});
