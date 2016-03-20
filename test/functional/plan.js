require('mocha-generators').install();
var helpers = require('./helpers');
var Nightmare = require('nightmare');
var expect = require('chai').expect;

var url = 'http://localhost:3000';

describe('Plan actions', function() {
  var nightmare;
  this.timeout(15000);

  before(function() {
    nightmare = Nightmare();
  });

  after(function*() {
    yield nightmare.end();
  });

  it('should display the actions when a new goal is added', function* () {
    var areActionsAdded = yield nightmare
      .goto(url)
      .evaluate(helpers.enableNav)
      .click('.step-name--goal')
      .click('.goal--college .add-goal')
      .exists('.step--plan .funds');
    expect(areActionsAdded).to.be.true;
  });
});