var Scenarios = (function() {
  var scenariosModule = {
    config: {
      wrapper: 'scenarios-wrapper',

      //Sliders options
      savingRateSlider: 'option__slider--saving',
      incomeRateSlider: 'option__slider--income',
      savingRateOptions: {
        start: gModel.aboutSavingsRate,
        step: 1,
        range: {
          'min': 1,
          'max': 100
        },
        format: wNumb({
          decimals: 0
        })
      },
      incomeRateOptions: {
        start: gModel.aboutIncome,
        step: 1000,
        range: {
          'min': 18000,
          'max': 200000
        },
        format: wNumb({
          decimals: 1,
          thousand: '.'
        })
      },

      //Line chart options
      chartClass: '.scenario__chart',
      chartData: {
        labels: [18, 25, 35, 45, 55, 65],
        series: [
          [gModel.savings * 1, gModel.savings * 7, gModel.savings * 17, gModel.savings * 27, gModel.savings * 37, gModel.savings * 47]
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
      }
    },

    init: function() {
      scenariosModule.wrapper = document.getElementsByClassName(scenariosModule.config.wrapper)[0];
      scenariosModule.savingRateSlider = scenariosModule.wrapper.getElementsByClassName(scenariosModule.config.savingRateSlider)[0];
      scenariosModule.incomeRateSlider = scenariosModule.wrapper.getElementsByClassName(scenariosModule.config.incomeRateSlider)[0];

      //Sliders
      scenariosModule.createSlider(scenariosModule.savingRateSlider, scenariosModule.config.savingRateOptions);
      scenariosModule.savingRateSlider.noUiSlider.on('update', function(values) {
        scenariosModule.eventHandler(scenariosModule.savingRateSlider, values);
      });

      scenariosModule.createSlider(scenariosModule.incomeRateSlider, scenariosModule.config.incomeRateOptions);
      scenariosModule.incomeRateSlider.noUiSlider.on('update', function(values) {
        scenariosModule.eventHandler(scenariosModule.incomeRateSlider, values);
      });

      //Line Chart
      scenariosModule.createLineChart(scenariosModule.config.chartData);
      scenariosModule.updateLineChart();
    },

    createSlider: function(element, options) {
      noUiSlider.create(element, options);
      element.handle = element.getElementsByClassName('noUi-handle')[0];
      element.tooltip = document.createElement('div');
      element.handle.appendChild(element.tooltip);

      element.tooltip.classList.add('slider-tooltip');
      element.tooltip.innerHTML = '<span></span>';
      element.tooltip = element.tooltip.firstElementChild;
    },

    eventHandler: function(slider, values) {
      var tooltip = slider.getElementsByTagName('span')[0];
      if(slider.classList.contains(scenariosModule.config.savingRateSlider)) {
        tooltip.innerHTML = values[0] + '%';
      } else {
        tooltip.innerHTML = '$' + values[0];
      }
    },

    createLineChart: function(data) {
      scenariosModule.chartData = data;

      scenariosModule.lineChart = new Chartist.Line(scenariosModule.config.chartClass, scenariosModule.chartData, scenariosModule.config.chartOptions);
    },

    updateLineChart: function() {
      scenariosModule.savingRateSlider.noUiSlider.on('change', function( values ){
        for(var i=0; i < scenariosModule.chartData.series[0].length; i++) {
          scenariosModule.chartData.series[0][i] = parseInt(values[0]) * 0.01 * gModel.aboutIncome * (scenariosModule.chartData.labels[i] - 18);
        }
        scenariosModule.lineChart.update(scenariosModule.chartData);
      });
      scenariosModule.incomeRateSlider.noUiSlider.on('change', function( values ){
        for(var i=0; i < scenariosModule.chartData.series[0].length; i++) {
          scenariosModule.chartData.series[0][i] = scenariosModule.savingRateSlider.noUiSlider.get() * 0.01 * parseInt(values[0].replace('.', '')) * (scenariosModule.chartData.labels[i] - 18);
        }
        scenariosModule.lineChart.update(scenariosModule.chartData);
      });
    },

    updateSeries: function() {
      return [gModel.savings * 1, gModel.savings * 7, gModel.savings * 17, gModel.savings * 27, gModel.savings * 37, gModel.savings * 47];
    }

  };

  scenariosModule.init();

  return scenariosModule;

})();
