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
      savings: 3
    };
  } else if (income < 10e3) {
    return {
      basic: 48,
      discretionary: 49,
      savings: 3
    };
  } else if (income < 15e3) {
    return {
      basic: 46,
      discretionary: 49,
      savings: 5
    };
  } else if (income < 20e3) {
    return {
      basic: 43,
      discretionary: 51,
      savings: 6
    };
  } else if (income < 30e3) {
    return {
      basic: 41,
      discretionary: 51,
      savings: 8
    };
  } else if (income < 40e3) {
    return {
      basic: 39,
      discretionary: 51,
      savings: 10
    };
  } else if (income < 50e3) {
    return {
      basic: 37,
      discretionary: 52,
      savings: 11
    };
  } else if (income < 60e3) {
    return {
      basic: 35,
      discretionary: 52,
      savings: 13
    };
  } else if (income > 70e3) {
    return {
      basic: 31,
      discretionary: 51,
      savings: 18
    };
  }
};

module.exports = {
  getDefaultRates: getDefaultRates
};
