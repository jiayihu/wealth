(function() {
  var savingRateSlider = document.getElementsByClassName('option__slider--saving')[0],
    expensesRateSlider = document.getElementsByClassName('option__slider--expenses')[0],
    incomeRateSlider = document.getElementsByClassName('option__slider--income')[0];

  var savingRateOptions = {
    start: gModel.aboutSavings,
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
    start: gModel.aboutIncome,
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
    gModel.aboutSavings = parseInt(values[handle]);
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
    gModel.aboutIncome = parseInt(values[handle].replace('.', ''));
    tooltip.innerHTML = '$' + values[handle];
  });

  var data = {
    labels: [18, 30, 40, 50, 60, 70, 80],
    series: [
      [gModel.savings * 1, gModel.savings * 12, gModel.savings * 22, gModel.savings * 32, gModel.savings * 42, gModel.savings * 52, gModel.savings * 62]
    ]
  },
  options = {
    showArea: true,
    width: '410px',
    height: '250px',
    plugins: [
      Chartist.plugins.ctAxisTitle({
        axisX: {
          axisTitle: 'Age',
          axisClass: 'ct-axis-age',
          offset: {
            x: 0,
            y: 35
          },
          textAnchor: 'middle'
        },
        axisY: {
          axisTitle: 'Savings ($)',
          axisClass: 'ct-axis-savings',
          offset: {
            x: 0,
            y: 20
          },
          textAnchor: 'middle'
        }
      })
    ]
  };

  var lineChart = new Chartist.Line('.scenario__chart', data, options);

  savingRateSlider.noUiSlider.on('change', function( values ){
    for(var i=0; i < data.series[0].length; i++) {
      data.series[0][i] = parseInt(values[0]) * 0.01 * gModel.aboutIncome * (data.labels[i] - 18);
    }
    console.log(data.series[0]);
    lineChart.update(data);
  });
  incomeRateSlider.noUiSlider.on('change', function( values ){
    for(var i=0; i < data.series[0].length; i++) {
      data.series[0][i] = savingRateSlider.noUiSlider.get() * 0.01 * parseInt(values[0]) * (data.labels[i] - 18);
    }
    console.log(data.series[0]);
    lineChart.update(data);
  });

})();
