/**
 * Action data
 * @module actions
 */

var helpers = require('../helpers');

var actions = {
  general: [
    {
      id: 0,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Thing not to do'
    },
    {
      id: 1,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Thing not to do'
    },
    {
      id: 2,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Thing not to do'
    },
    {
      id: 3,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Thing not to do'
    }
  ],
  college: [
    {
      id: 0,
      toDo: 'Start a tax-deferred saving plan',
      details: [
        'Tax-free investment growth and tax-free withdrawals will save you 10% to 30% on taxes that you would otherwise give to the tax man',
        '529 Plan for College',
        'Coverdell Education Savings Account (ESA) for K thru 12'
      ],
      notToDo: 'Rely on a conventional savings account'
    },
    {
      id: 1,
      toDo: 'Calculate Your College Expense',
      details: [
        'Use this resource to estimate how much you will need: <a href=\'http://www.savingforcollege.com/college-savings-calculator/index.php\'>College cost calculator</a>'
      ],
      notToDo: 'Guess on how much you will need. Chances are it will be more than you expected.'
    },
    {
      id: 2,
      toDo: 'Estimate Your Expected Family Contribution (EFC) ',
      details: [
        '<a href=\'https://fafsa.ed.gov/FAFSA/app/f4cForm\'>Federal Student Aid</a>'
      ],
      notToDo: 'Assume that everyone pays the same amount.'
    },
    {
      id: 3,
      toDo: 'Add the same amount every time you get paid',
      details: [
        'Plan this into your budget. Use automatic payments if possible'
      ],
      notToDo: 'Be inconsistent with your savings. Slow and steady wins the race.'
    },
    {
      id: 4,
      toDo: 'Take classes for college credits at a lower cost community college',
      details: [
        'Save money by taking required general education class at a city college',
        'Make sure credits are transferable first',
        'AP classes in high school are another great option'
      ],
      notToDo: 'Assume that all of your course work has to be at a 4-year institution'
    },
    {
      id: 5,
      toDo: 'Apply to colleges with large endowments',
      details: [
        'Expensive private colleges may actually be the least expensive when you factor in generous endowments for qualified students'
      ],
      notToDo: 'Assume that private school is cheaper than public'
    },
    {
      id: 6,
      toDo: 'Find Scholarships',
      details: [
        'Go to <a href=\'http://www2.ed.gov/programs/fws/index.html\'>FastWeb.com</a> to find scholarships and explore work-study programs'
      ],
      notToDo: 'Think that a scholarship is too small to apply for. Multiple scholarships add up'
    }
  ],
  funds: [
    {
      id: 0,
      toDo: 'Determine how much you need',
      details: [
        'Calculate your monthly expenses and use this calculator: <a href=\'http://www.moneyunder30.com/emergency-fund-calculator\'>Emergency fund calculator</a>'
      ],
      notToDo: 'Underestimate what you\'ll need or how long it will take you to find a new job if you lose yours.'
    },
    {
      id: 1,
      toDo: 'Setup a separate account exclusively for you Emergency Fund',
      details: [
        'Keep your emergency fund separate from you checking and saving account. You\'ll think differently about this fund if dedicate to an emergency (i.e. you\'ll be less likely to spend it)'
      ],
      notToDo: 'Co-mingle funds with your checking or saving account'
    },
    {
      id: 2,
      toDo: 'Start now - make a minum deposit of $25',
      details: [
        'This is your safety-net. You\'ll need more later but this will go a long way toward getting started.'
      ],
      notToDo: 'Wait until you have an emergency'
    },
    {
      id: 3,
      toDo: 'Add the same amount every time you get paid',
      details: [
        'Make this a priority before any other financial goals. '
      ],
      notToDo: 'Quit before you achieve your goal. Consistancy is key.'
    },
    {
      id: 4,
      toDo: 'Pay yourself first',
      details: [
        'Setup direct deposit for your monthly budgeted contribution to this fund'
      ],
      notToDo: 'Assume you\'ll stay diciplined after you start saving.'
    },
    {
      id: 5,
      toDo: 'Add windfalls (rebates, cash gift, bonuses, etc.)',
      details: [

      ],
      notToDo: ''
    },
    {
      id: 6,
      toDo: 'Make sure you have disability insurance',
      details: [
        'You may already have this through your employer. If not, consider getting a policy on your own.'
      ],
      notToDo: 'Assume you already have a policy or think you don\'t need one.'
    }
  ]
};

module.exports = function(goal) {
  if(typeof goal !== 'string') {
    helpers.makeError('params', goal);
  }

  return actions[goal];
};
