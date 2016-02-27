/**
 * Budget by Income
 */

var getDefaultRates = function(income) {
  if(typeof income !== 'number') {
    throw new Error('getDefaultRates(): wrong param: ' + JSON.stringify(income));
  }

  if(income < 5000) {
    return {
      basic: 45,
      discretionary: 52,
      savings: 3,
      detailed: [10, 5, 31, 10, 4, 14, 7, 5, 7, 5]
    };
  } else if (income < 10e3) {
    return {
      basic: 48,
      discretionary: 49,
      savings: 3,
      detailed: [11, 5, 33, 10, 3, 15, 6, 5, 4, 7]
    };
  } else if (income < 15e3) {
    return {
      basic: 46,
      discretionary: 49,
      savings: 5,
      detailed: [11, 4, 31, 11, 3, 16, 8, 5, 4, 9]
    };
  } else if (income < 20e3) {
    return {
      basic: 43,
      discretionary: 51,
      savings: 6,
      detailed: [10, 5, 29, 10, 3, 15, 10, 5, 3, 11]
    };
  } else if (income < 30e3) {
    return {
      basic: 41,
      discretionary: 51,
      savings: 8,
      detailed: [9, 5, 28, 10, 3, 18, 10, 5, 1, 12]
    };
  } else if (income < 40e3) {
    return {
      basic: 39,
      discretionary: 51,
      savings: 10,
      detailed: [9, 5, 27, 9, 4, 17, 9, 5, 2, 14]
    };
  } else if (income < 50e3) {
    return {
      basic: 37,
      discretionary: 52,
      savings: 11,
      detailed: [8, 5, 26, 9, 4, 19, 9, 5, 2, 15]
    };
  } else if (income < 70e3) {
    return {
      basic: 35,
      discretionary: 52,
      savings: 13,
      detailed: [8, 5, 25, 8, 3, 19, 9, 5, 2, 17]
    };
  } else if (income >= 70e3) {
    return {
      basic: 31,
      discretionary: 51,
      savings: 18,
      detailed: [6, 5, 25, 6, 3, 17, 7, 6, 1, 20]
    };
  }
};

module.exports = {
  getDefaultRates: getDefaultRates
};
