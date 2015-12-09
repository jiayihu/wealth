app.views.scenarios = (function(window, Chartist, wNumb) {
  var configMap = {
    savingsRate: 30,
    income: 60000,
    savings: 18000,
    //Sliders options
    savingRateSlider: 'option__slider--saving',
    incomeRateSlider: 'option__slider--income',
    savingRateOptions: {
      start: 30,
      step: 1,
      range: {'min': 1, 'max': 100},
      format: wNumb({ decimals: 0})
    },
    incomeOptions: {
      start: 60000,
      step: 1000,
      range: {'min': 18000, 'max': 200000},
      format: wNumb({decimals: 1, thousand: '.'})
    },
    //Line chart options
    chartClass: '.scenario__chart',
    chartData: {
      labels: [18, 25, 35, 45, 55, 65],
      series: []
    },
    chartOptions: {
      showArea: true,
      width: '410px',
      height: '250px',
      plugins: [
        Chartist.plugins.ctAxisTitle({
          axisX: {
            axisTitle: 'Age',
            axisClass: 'ct-axis-age',
            offset: {x: 0, y: 35},
            textAnchor: 'middle'
          },
          axisY: {
            axisTitle: 'Savings ($)',
            axisClass: 'ct-axis-savings',
            offset: {x: 0, y: 20},
            textAnchor: 'middle'
          }
        })
      ]
    }
  };

  var savingRateSlider, incomeRateSlider,
      lineChart;

  /**
   * DOM FUNCTIONS
   */

   var createLineChart = function(htmlNode, data, options) {
     lineChart = new Chartist.Line(htmlNode, data, options);
   };

   /**
    * EVENT HANDLERS
    */

  var sliderEventHandler = function(slider, values) {
    var tooltip = slider.getElementsByTagName('span')[0];
    if(slider.classList.contains(configMap.savingRateSlider)) {
      tooltip.innerHTML = values[0] + '%';
    } else {
      tooltip.innerHTML = '$' + values[0];
    }
  };

  var bindSlidersToChart = function() {
    savingRateSlider.noUiSlider.on('change', function( values ){
      for(var i=0; i < configMap.chartData.series[0].length; i++) {
        configMap.chartData.series[0][i] = parseInt(values[0]) * 0.01 * configMap.savings * (configMap.chartData.labels[i] - 18);
      }
      lineChart.update(configMap.chartData);
    });
    incomeRateSlider.noUiSlider.on('change', function( values ){
      var savingRate =savingRateSlider.noUiSlider.get();
      for(var i=0; i < configMap.chartData.series[0].length; i++) {
        configMap.chartData.series[0][i] = savingRate * 0.01 * parseInt(values[0].replace('.', '')) * (configMap.chartData.labels[i] - 18);
      }
      lineChart.update(configMap.chartData);
    });
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var calculateSeries = function() {
    configMap.savings = configMap.savingsRate * 0.01 * configMap.income;
    configMap.chartData.series[0] = [configMap.savings * 1, configMap.savings * 7, configMap.savings * 17, configMap.savings * 27, configMap.savings * 37, configMap.savings * 47];
    return configMap.chartData.series[0];
  };

  var configModule = function(inputMap) {
    window.setConfigMap(inputMap, configMap);
  };

  var init = function(container) {

    savingRateSlider = container.getElementsByClassName(configMap.savingRateSlider)[0];
    incomeRateSlider = container.getElementsByClassName(configMap.incomeRateSlider)[0];

    //Sliders
    window.createSlider(savingRateSlider, configMap.savingRateOptions);
    savingRateSlider.noUiSlider.on('update', function(values) {
      sliderEventHandler(savingRateSlider, values);
    });

    window.createSlider(incomeRateSlider, configMap.incomeOptions);
    incomeRateSlider.noUiSlider.on('update', function(values) {
      sliderEventHandler(incomeRateSlider, values);
    });

    //Line Chart
    calculateSeries();
    createLineChart(configMap.chartClass, configMap.chartData, configMap.chartOptions);
    bindSlidersToChart();
  };

  var setSlider = function(slider, value) {
    if(slider === 'income') {
      incomeRateSlider.noUiSlider.set(value);
    } else if(slider === 'savingsRate') {
      savingRateSlider.noUiSlider.set(value);
    }
  };

  var updateLineChart = function() {
    lineChart.update(configMap.chartData);
  };

  return {
    calculateSeries: calculateSeries,
    configModule: configModule,
    init: init,
    setSlider: setSlider,
    updateLineChart: updateLineChart
  };

})(window, Chartist, wNumb);
