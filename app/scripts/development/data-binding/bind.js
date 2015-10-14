(function() {
  var bindings = {
    config: {
      incomeSliderClass: 'about__income__slider',
      basicRateSliderClass: 'about__savings__slider--needs'
    },

    init: function() {
      bindings.incomeBinding();
      bindings.basicRateBinding();
    },

    incomeBinding: function() {
      var slider = document.getElementsByClassName(bindings.config.incomeSliderClass)[0];
      slider.noUiSlider.on('change', function(values) {
        //Update the model
        gModel.aboutIncome = parseInt(values[0].replace('.', ''));
        gModel.basicNeeds = gModel.aboutIncome * gModel.aboutBasicRate * 0.01;
        gModel.discretionaryExpenses = gModel.aboutIncome * gModel.aboutDiscretionaryRate * 0.01;
        gModel.savings = gModel.aboutSavingsRate * 0.01 * gModel.aboutIncome;

        Pyramid.updateLabels();

        Scenarios.chartData.series[0] = Scenarios.updateSeries();
        Scenarios.incomeRateSlider.noUiSlider.set(values[0]);
        Scenarios.lineChart.update(Scenarios.chartData);
      });
    },

    basicRateBinding: function() {
      var slider = document.getElementsByClassName(bindings.config.basicRateSliderClass)[0];
      slider.noUiSlider.on('change', function(values) {
        gModel.aboutBasicRate = parseInt(values[0]);
        gModel.basicNeeds = gModel.aboutIncome * gModel.aboutBasicRate * 0.01;
        gModel.aboutSavingsRate = 100 - gModel.aboutBasicRate - gModel.aboutDiscretionaryRate;
        gModel.savings = gModel.aboutSavingsRate * 0.01 * gModel.aboutIncome;

        Pyramid.updateLabels();

        Scenarios.chartData.series[0] = Scenarios.updateSeries();
        Scenarios.savingRateSlider.noUiSlider.set(gModel.aboutSavingsRate);
        Scenarios.lineChart.update(Scenarios.chartData);
      });
    }
  };

  bindings.init();
})();
