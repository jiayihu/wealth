var expect = require('chai').expect;
var helpers = require('../../app/javascripts/helpers');

describe('makeError', function() {
  var makeError = helpers.makeError;

  it('should throw error', function() {
    expect(makeError.bind(null, 'params', 'something')).to.throw(Error, /something/);
    expect(makeError.bind(null, null, 'something')).to.throw(Error, /something/);
  });
});

describe('template', function() {
  var template = helpers.template;

  it('should replace words', function() {
    var string = 'A simple sentence with {words} to be replaced by {values}';
    var valuesMap = {
      words: 'something',
      values: 'whatever'
    };
    var expectedResult = 'A simple sentence with something to be replaced by whatever';

    expect(template(string, valuesMap)).to.equal(expectedResult);
  });
});

describe('format', function() {
  var format = helpers.format;

  it('should prefix the value', function() {
    expect(format(2, '$')).to.equal('$2');
    expect(format('2', '$')).to.equal('$2');
  });

  it('should suffix the value', function() {
    expect(format(2, '%')).to.equal('2%');
  });
});

describe('isNumber', function() {
  var isNumber = helpers.isNumber;

  it('should check if it is a number', function() {
    expect(isNumber(2)).to.be.true;
    expect(isNumber('2')).to.be.false;
    expect(isNumber(NaN)).to.be.false;
    expect(isNumber({})).to.be.false;
    expect(isNumber([1])).to.be.false;
  });
});

describe('reverse', function() {
  var reverse = helpers.reverse;

  it('should returned the reversed array without side effects', function() {
    var initialArray = [1, 2, 3];
    var expectedArray = [3, 2, 1];

    expect(reverse(initialArray)).to.deep.equal(expectedArray);
  });
});

describe('setConfigMap', function() {
  var setConfigMap = helpers.setConfigMap;

  it('should config not nested objects', function() {
    var configMap = {
      'a': 1,
      'b': 2
    };
    var inputMap = {
      'a': 3,
      //should be ignored by the function since not present in configMap
      'c': 'whatever'
    };
    var expectedMap = {
      'a': 3,
      'b': 2
    };

    expect(setConfigMap(inputMap, configMap)).to.deep.equal(expectedMap);
  });

  it('should config also nested objects', function() {
    var configMap = {
      'a': 1,
      'b': 2,
      'c': {
        'd': 3
      }
    };
    var inputMap = {
      'a': 3,
      'c': {
        'd': 4
      }
    };
    var expectedMap = {
      'a': 3,
      'b': 2,
      'c': {
        'd': 4
      }
    };

    expect(setConfigMap(inputMap, configMap)).to.deep.equal(expectedMap);
  });
});

describe('template', function() {
  var template = helpers.template;

  it('should replace with the values', function() {
    var string = '{user} says {object} to {user}';
    var data = {
      user: 'Mary',
      object: 'hello'
    };
    var expectedString = 'Mary says hello to Mary';

    expect(template(string, data)).to.equal(expectedString);
  });
});

describe('toggleArrayItem', function() {
  var toggleArrayItem = helpers.toggleArrayItem;

  it('should add the item if not already contained', function() {
    var item = 'item';

    expect(toggleArrayItem([], item)).to.deep.equal([item]);
  });

  it('should delete the item if already contained', function() {
    var array = [
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'Word'
      }
    ];
    var item = {
      id: 1,
      text: 'Hello changed'
    };
    var expectedArray = [
      {
        id: 2,
        text: 'Word'
      }
    ];

    expect(toggleArrayItem(array, item)).to.deep.equal(expectedArray);
  });
});

describe('valuesOfSummary', function() {
  var valuesOfSummary = helpers.valuesOfSummary;

  it('should calculate the actual values of the rates', function() {
    expect(valuesOfSummary(1000, 30, 30, 40)).to.deep.equal({
      basicNeeds: 300,
      discretionaryExpenses: 300,
      annualSavings: 400
    });
  });
});
