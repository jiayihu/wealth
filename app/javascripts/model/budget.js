/**
 * Budget by Income
 */

var getDefaultRates = function(income, isDetailed) {
  if(typeof income !== 'number') {
    throw new Error('getDefaultRates(): wrong param: ' + JSON.stringify(income));
  }

  var rates;

  if(income < 5000) {
    rates = {
      basic: 46,
      discretionary: 52,
      savings: 2,
      detailed: [10, 6, 26, 5, 10, 4, 14, 7, 5, 7, 4]
    };
  } else if (income < 10e3) {
    rates = {
      basic: 48,
      discretionary: 51,
      savings: 1,
      detailed: [11, 6, 27, 6, 10, 3, 15, 6, 5, 4, 6]
    };
  } else if (income < 15e3) {
    rates = {
      basic: 47,
      discretionary: 50,
      savings: 3,
      detailed: [11, 5, 25, 6, 11, 3, 16, 8, 5, 4, 3]
    };
  } else if (income < 20e3) {
    rates = {
      basic: 43,
      discretionary: 51,
      savings: 6,
      detailed: [10, 6, 23, 6, 10, 3, 15, 10, 5, 2, 4]
    };
  } else if (income < 30e3) {
    rates = {
      basic: 41,
      discretionary: 52,
      savings: 7,
      detailed: [9, 6, 22, 6, 10, 3, 18, 10, 5, 1, 3]
    };
  } else if (income < 40e3) {
    rates = {
      basic: 39,
      discretionary: 51,
      savings: 10,
      detailed: [9, 5, 21, 6, 9, 4, 17, 9, 5, 1, 4]
    };
  } else if (income < 50e3) {
    rates = {
      basic: 37,
      discretionary: 54,
      savings: 9,
      detailed: [8, 5, 20, 6, 9, 4, 19, 9, 5, 1, 5]
    };
  } else if (income < 70e3) {
    rates = {
      basic: 35,
      discretionary: 52,
      savings: 13,
      detailed: [8, 5, 19, 6, 8, 3, 19, 9, 5, 1, 4]
    };
  } else if (income >= 70e3) {
    rates = {
      basic: 31,
      discretionary: 52,
      savings: 17,
      detailed: [6, 5, 18, 7, 6, 3, 17, 7, 6, 3, 4]
    };
  }

  if(!isDetailed) {
    delete rates.detailed;
  }

  return rates;
};

module.exports = {
  getDefaultRates: getDefaultRates
};
