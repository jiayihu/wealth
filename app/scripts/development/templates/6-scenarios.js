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
      series: [
        [35000, 245000, 595000, 945000, 1295000, 1645000]
      ]
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
      configMap.savingsRate = Number(values[0]);
      calculateSeries();
    });
    incomeRateSlider.noUiSlider.on('change', function( values ){
      configMap.income = Number(values[0].replace('.', ''));
      calculateSeries();
    });
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var calculateSeries = function() {
    configMap.savings = configMap.savingsRate * 0.01 * configMap.income;
    configMap.chartData.series[0] = [
      configMap.savings * 1,
      configMap.savings * 10,
      configMap.savings * 20,
      configMap.savings * 30,
      configMap.savings * 40,
      configMap.savings * 50
    ];
    lineChart.update(configMap.chartData);
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
    createLineChart(configMap.chartClass, configMap.chartData, configMap.chartOptions);
    calculateSeries();
    bindSlidersToChart();
  };

  var setSlider = function(slider, value) {
    if(slider === 'income') {
      incomeRateSlider.noUiSlider.set(value);
    } else if(slider === 'savingsRate') {
      savingRateSlider.noUiSlider.set(value);
    }
  };

  return {
    calculateSeries: calculateSeries,
    configModule: configModule,
    init: init,
    setSlider: setSlider
  };

})(window, Chartist, wNumb);
