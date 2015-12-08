(function() {
  var bindings = {
    config: {
      incomeSliderClass: 'about__income__slider',
      basicRateSliderClass: 'about__savings__slider--needs',
      discretionaryRateSliderClass: 'about__savings__slider--expenses'
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
    },

    discretionaryRateBinding: function() {
      var slider = document.getElementsByClassName(bindings.config.discretionaryRateSliderClass)[0];
      slider.noUiSlider.on('change', function(values) {
        gModel.aboutDiscretionaryRate = parseInt(values[0]);
        gModel.discretionaryExpenses = gModel.aboutIncome * gModel.aboutDiscretionaryRate * 0.01;
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
