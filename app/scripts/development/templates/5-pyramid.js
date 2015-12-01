app.views.pyramid = (function() {
  var configMap = {
    savingsId: '#pyramid-savings',
    basicId: '#pyramid-basic',
    discretiotionaryId: '#pyramid-discretionary',
    incomeId: '#pyramid-income'
  };

  var savingsText, basicText, discretionaryText, incomeText;

  /**
   * DOM FUNCTIONS
   */

  var updateLabels = function() {
    var moneyFormat = wNumb({
      thousand: '.',
      prefix: '$ '
    });

    savingsText.textContent = ' ' + moneyFormat.to( wealthApp.model.read('savings') ) + '/yr';
    basicText.textContent = moneyFormat.to( wealthApp.model.read('basicNeeds') ) + '/yr';
    discretionaryText.textContent = moneyFormat.to( wealthApp.model.read('discretionaryExpenses') ) + '/yr';
    incomeText.textContent = moneyFormat.to( wealthApp.model.read('aboutIncome') ) + '/yr';
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var init = function(container) {
    savingsText = container.querySelector(configMap.savingsId);
    basicText = container.querySelector(configMap.basicId);
    discretionaryText = container.querySelector(configMap.discretiotionaryId);
    incomeText = container.querySelector(configMap.incomeId);

    updateLabels();
  };

  return {
    updateLabels: updateLabels,
    init: init
  };

})();
