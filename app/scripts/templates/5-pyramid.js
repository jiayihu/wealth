(function() {
  var savingsText = document.getElementById('pyramid-savings'),
    basicText = document.getElementById('pyramid-basic'),
    discretionaryText = document.getElementById('pyramid-discretionary'),
    incomeText = document.getElementById('pyramid-income');

  var moneyFormat = wNumb({
    thousand: '.',
    prefix: '$ '
  });

  savingsText.textContent = ' ' + moneyFormat.to(gModel.savings) + '/yr';
  basicText.textContent = moneyFormat.to(gModel.basicNeeds) + '/yr';
  discretionaryText.textContent = moneyFormat.to(gModel.discretionaryExpenses) + '/yr';
  incomeText.textContent = moneyFormat.to(gModel.aboutIncome) + 'per year';
})();
