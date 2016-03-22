require('mocha-generators').install();
var helpers = require('./helpers');
var Nightmare = require('nightmare');
var expect = require('chai').expect;

var url = 'http://localhost:3000';

describe('Navigation', function() {
  var nightmare;
  this.timeout(15000);

  before(function() {
    nightmare = Nightmare(
      {
        webPreferences:{
          partition: 'wealthApp'
        }
      });
  });

  after(function*() {
    yield nightmare.end();
  });

  it('should display the intro', function* () {
    var isIntroShown = yield nightmare
      .goto(url)
      .evaluate(function() {
        return document.querySelector('.step--intro').classList.contains('show');
      });
    expect(isIntroShown).to.be.true;
  });

  it('should move to step #3', function* () {
    var isAboutShown = yield nightmare
      .goto(url)
      .click('.step--intro .continue')
      .visible('.step--about');
    expect(isAboutShown).to.be.true;

    var isExpensesShown = yield nightmare
      .goto(url)
      .click('.step--about .continue')
      .visible('.step--expenses');
    expect(isExpensesShown).to.be.true;
  });

  it('should not be able to move to step #4', function* () {
    var isScenariosShown = yield nightmare
      .goto(url)
      .click('.step-name--scenarios')
      .visible('.step--scenarios');
    expect(isScenariosShown).to.be.false;
  });

  it('should move to step #4 when we unblock disabled nav links', function* () {
    var isScenariosShown = yield nightmare
      .evaluate(helpers.enableNav)
      .click('.step-name--scenarios')
      .visible('.step--scenarios');
    expect(isScenariosShown).to.be.true;
  });
});