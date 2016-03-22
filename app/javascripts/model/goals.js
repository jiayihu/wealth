var helpers = require('../helpers');

var goalsList = [
  {
    id: 'college',
    title: 'Save for college',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'home',
    title: 'Buy a home',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'car',
    title: 'Save for car',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'funds',
    title: 'Emergency funds',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'cards',
    title: 'Pay-down Credit Cards',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'retire',
    title: 'Retire',
    date: 'January 2017',
    probability: '50%'
  }
];

module.exports = function(id) {
  if(id && (typeof id !== 'string')) {
    helpers.makeError('params', id);
  }

  if(id) {
    return goalsList.find(function(goal) {
      return goal.id === id;
    });
  }

  return goalsList;
};
