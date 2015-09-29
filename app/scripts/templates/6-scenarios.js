(function() {
  var wrapper = document.getElementsByClassName('scenarios-wrapper')[0],
    savingRateSlider = document.getElementsByClassName('option__slider--saving')[0],
    expensesRateSlider = document.getElementsByClassName('option__slider--expenses')[0],
    incomeRateSlider = document.getElementsByClassName('option__slider--income')[0];

  var scenario = {};
  scenario.savingRate = 20;
  scenario.income = 24000;
  scenario.saving = scenario.savingRate * 0.01 * scenario.income;

  var savingRateOptions = {
    start: scenario.savingRate,
    step: 1,
    range: {
      'min': 1,
      'max': 40
    },
    format: wNumb({
      decimals: 0
    })
  },
  expensesRateOptions = {
    start: 20,
    step: 1,
    range: {
      'min': 1,
      'max': 60
    },
    format: wNumb({
      decimals: 0
    })
  },
  incomeRateOptions = {
    start: scenario.income,
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

  createSlider(savingRateSlider, savingRateOptions);
  savingRateSlider.noUiSlider.on('update', function( values, handle ){
    var tooltip = savingRateSlider.querySelector('.slider-tooltip span');
    scenario.savingRate = parseInt(values[handle]);
    tooltip.innerHTML = values[handle] + '%';
  });

  createSlider(expensesRateSlider, expensesRateOptions);
  expensesRateSlider.noUiSlider.on('update', function( values, handle ){
    var tooltip = expensesRateSlider.querySelector('.slider-tooltip span');
    tooltip.innerHTML = values[handle] + '%';
  });

  createSlider(incomeRateSlider, incomeRateOptions);
  incomeRateSlider.noUiSlider.on('update', function( values, handle ){
    var tooltip = incomeRateSlider.querySelector('.slider-tooltip span');
    scenario.income = parseInt(values[handle].replace('.', ''));
    tooltip.innerHTML = '$' + values[handle];
  });

  var drawChart = function() {
    var scenarioCtx = document.getElementsByClassName('scenario__chart')[0].getContext('2d');
    var data = {
      labels: ['18', '30', '40', '50', '60', '70', '80'],
      datasets: [
        {
            label: 'What if scenario',
            fillColor: 'rgba(157,220,87,0.1)',
            strokeColor: '#182C4D',
            pointColor: '#182C4D',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#9DDC57',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: [scenario.saving*2, scenario.saving*4, scenario.saving*12, scenario.saving*16, scenario.saving*25, scenario.saving*48, scenario.saving*70]
        }
      ]
    };
    var options = {
      responsive: true,
      tooltipTemplate: '<%if (label){%><%=label%>: $<%}%><%= value %>'
    };
    var scenarioChart = new Chart(scenarioCtx).Line(data, options);

    savingRateSlider.noUiSlider.on('change', function( values, handle ){
      for(var i=0; i < 7; i++) {
        scenario.saving = parseInt(scenario.savingRate) * 0.01 * scenario.income;
        scenarioChart.datasets[0].points[i].value = scenario.saving * (i+1) * 10;
      }
      scenarioChart.update();
    });
    incomeRateSlider.noUiSlider.on('change', function( values, handle ){
      for(var i=0; i < 7; i++) {
        scenario.saving = scenario.savingRate * 0.01 * scenario.income;
        scenarioChart.datasets[0].points[i].value = scenario.saving * (i+1) * 10;
      }
      scenarioChart.update();
    });

    if(!scenarioChart) {
      window.setTimeOut(100, drawChart);
    } else {
      wrapper.classList.add('step-wrapper');
    }

  };

  drawChart();

})();
