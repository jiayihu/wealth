/*global app, $on */
var gModel = {
  aboutAge: 20,
  aboutSituation: 'married',
  aboutLiving: 'rent',
  aboutIncome: 60000,
  aboutBasicRate: 45,
  aboutDiscretionaryRate: 25,
  aboutSavingsRate: 30,
  //aboutStage: 'home',
  basicNeeds: 27000,
  discretionaryExpenses: 15000,
  savings: 18000,
  pickedGoals: [],
  savedActions: []
};

(function(window) {
  'use strict';

  var WealthApp = function(name) {
    this.model = new app.Model(name);
  };

  window.wealthApp = new WealthApp('wealth');


})(window);
