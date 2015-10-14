var Pyramid = (function() {
  var pyramidModule = {
    config: {
      savingsId: 'pyramid-savings',
      basicId: 'pyramid-basic',
      discretiotionaryId: 'pyramid-discretionary',
      incomeId: 'pyramid-income'
    },

    init: function() {
      pyramidModule.updateLabels();
    },

    updateLabels: function() {
      var savingsText = document.getElementById(pyramidModule.config.savingsId),
        basicText = document.getElementById(pyramidModule.config.basicId),
        discretionaryText = document.getElementById(pyramidModule.config.discretiotionaryId),
        incomeText = document.getElementById(pyramidModule.config.incomeId);

      var moneyFormat = wNumb({
        thousand: '.',
        prefix: '$ '
      });

      savingsText.textContent = ' ' + moneyFormat.to(gModel.savings) + '/yr';
      basicText.textContent = moneyFormat.to(gModel.basicNeeds) + '/yr';
      discretionaryText.textContent = moneyFormat.to(gModel.discretionaryExpenses) + '/yr';
      incomeText.textContent = moneyFormat.to(gModel.aboutIncome) + '/yr';
    }
  };

  pyramidModule.init();

  return {
    updateLabels: pyramidModule.updateLabels
  };

})();
