(function() {
  var bindings = {
    config: {
      incomeSliderClass: 'about__income__slider'
    },

    init: function() {
      bindings.incomeBinding();
    },

    incomeBinding: function() {
      var slider = document.getElementsByClassName(bindings.config.incomeSliderClass)[0];
      slider.noUiSlider.on('change', function(values) {
        gModel.aboutIncome = parseInt(values[0].replace('.', ''));
        gModel.savings = gModel.aboutSavingsRate * 0.01 * gModel.aboutIncome;

        Pyramid.updateLabels();

        Scenarios.chartData.series = [
          [gModel.savings * 1, gModel.savings * 12, gModel.savings * 22, gModel.savings * 32, gModel.savings * 42, gModel.savings * 52, gModel.savings * 62]
        ];
        Scenarios.incomeRateSlider.noUiSlider.set(values[0]);
        Scenarios.lineChart.update(Scenarios.chartData);
      });
    }
  };

  bindings.init();
})();
