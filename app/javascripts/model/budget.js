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
      basic: 45,
      discretionary: 52,
      savings: 3,
      detailed: [10, 6, 31, 10, 4, 14, 7, 5, 7, 4]
    };
  } else if (income < 10e3) {
    rates = {
      basic: 48,
      discretionary: 49,
      savings: 3,
      detailed: [11, 6, 33, 10, 3, 15, 6, 5, 4, 6]
    };
  } else if (income < 15e3) {
    rates = {
      basic: 46,
      discretionary: 49,
      savings: 5,
      detailed: [11, 5, 31, 11, 3, 16, 8, 5, 4, 3]
    };
  } else if (income < 20e3) {
    rates = {
      basic: 43,
      discretionary: 51,
      savings: 6,
      detailed: [10, 6, 29, 10, 3, 15, 10, 5, 2, 4]
    };
  } else if (income < 30e3) {
    rates = {
      basic: 41,
      discretionary: 51,
      savings: 8,
      detailed: [9, 6, 28, 10, 3, 18, 10, 5, 1, 3]
    };
  } else if (income < 40e3) {
    rates = {
      basic: 39,
      discretionary: 51,
      savings: 10,
      detailed: [9, 6, 27, 9, 4, 17, 9, 5, 1, 4]
    };
  } else if (income < 50e3) {
    rates = {
      basic: 37,
      discretionary: 52,
      savings: 11,
      detailed: [8, 6, 26, 9, 4, 19, 9, 5, 1, 5]
    };
  } else if (income < 70e3) {
    rates = {
      basic: 35,
      discretionary: 52,
      savings: 13,
      detailed: [8, 6, 25, 8, 3, 19, 9, 5, 1, 4]
    };
  } else if (income >= 70e3) {
    rates = {
      basic: 31,
      discretionary: 51,
      savings: 18,
      detailed: [6, 6, 25, 6, 3, 17, 7, 6, 3, 4]
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
