(function() {
  var wrapper = document.getElementsByClassName('you-wrapper')[0],
      needsSlider = wrapper.getElementsByClassName('about__savings__slider--needs')[0],
      expensesSlider = wrapper.getElementsByClassName('about__savings__slider--expenses')[0];

  var needsOptions = {
    start: 20,
    step: 1,
    range: {
      'min': 1,
      'max': 40
    },
    format: wNumb({
      decimals: 0
    })
  },
  expensesOptions = {
    start: 20,
    step: 1,
    range: {
      'min': 1,
      'max': 60
    },
    format: wNumb({
      decimals: 0
    })
  };

  createSlider(needsSlider, needsOptions);
  needsSlider.noUiSlider.on('update', function( values, handle ){
    var tooltip = needsSlider.querySelector('.slider-tooltip span');
    tooltip.innerHTML = values[handle] + '%';
  });

  createSlider(expensesSlider, expensesOptions);
  expensesSlider.noUiSlider.on('update', function( values, handle ){
    var tooltip = expensesSlider.querySelector('.slider-tooltip span');
    tooltip.innerHTML = values[handle] + '%';
  });


  //Chart
  var savingsCtx = wrapper.getElementsByClassName('about__savings__circle')[0].getContext('2d'),
    savingsLegend = wrapper.getElementsByClassName('circle-legend')[0],
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
      tooltipTemplate: '<%if (label){%><%=label%>: <%}%><%= value %> \%',
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

})();
