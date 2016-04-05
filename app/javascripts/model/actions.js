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
      notToDo: 'Dont\' do this thing'
    },
    {
      id: 1,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Dont\' do this thing'
    },
    {
      id: 2,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Dont\' do this thing'
    },
    {
      id: 3,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Dont\' do this thing'
    }
  ],
  car: [
    {
      id: 0,
      toDo: 'Buy or Lease?',
      details: [
        'Buying a pre-owned certified car is usually the best value for your money but an advantage of leasing is that you do not need a substantial down payment. <br />In addition, you return the car to the car dealer at the end of the lease period, so you do not need to worry about finding a buyer for the car. '
      ],
      notToDo: 'Don\'t buy a new car. It will depreciate the day you drive it off the lot.'
    },
    {
      id: 1,
      toDo: 'Decide how much to spend',
      details: [
        'Get some prospective - figure how much you will spend on a car each year and multiply by how long you will own it for. This is how much you should budget for you car.',
        'Your decision about much money you should spend on a car is critical because it can affect your budget as well as your lifestyle.',
        'When making this decision, carefully consider how your choices could affect your spending on other needs, and your lifestyle in general.'
      ],
      notToDo: 'Don\'t forget to consider other expenditure and lifestyle'
    },
    {
      id: 2,
      toDo: 'Compare cars in your price range',
      details: [
        'While you have already determined the amount that you are willing to spend, you should compare the prices of the cars that fit your preferences and are within your price range. '
      ],
      notToDo: 'Don\'t compare cars out of set price range'
    },
    {
      id: 3,
      toDo: 'Weigh your financing options',
      details: [
        'Pay with cash if you can but used car loans can be very reasonable depending on the bank.',
        'If you plan to finance your car purchase through the car dealer, you should compare financing rates among dealers. One dealer may charge a lower price for the car but charge higher financing costs for the loan.',
        'If you are leasing, read the fine print carefully.'
      ],
      notToDo: 'Don’t assume all dealers offer the same options and rates'
    },
    {
      id: 4,
      toDo: 'Get an extended warranty',
      details: [
        'Dealers offer different packages for different prices. Like financing, take the cost into consideration when choosing a dealer.'
      ],
      notToDo: 'Don\'t underestimate potential repair and maintence costs'
    },
    {
      id: 5,
      toDo: 'Assess the condition of car thoroughly to avoid repair expense',
      details: [
        'The cost of having a mechanic evaluate the car is worthwhile, because it may enable you to avoid buying a car that will ultimately result in large repair expenses.',
        'Use AutoCheck or CARFAX to review the car\'s history.'
      ],
      notToDo: 'Don\'t assume the car is in good shape based on miles and appearance'
    },
    {
      id: 6,
      toDo: 'Obtain insurance estimates before purchase.',
      details: [
        'Some cars are subject to significantly higher insurance costs because they are more difficult to repair after accidents, are higher priced, or are common theft targets'
      ],
      notToDo: 'Don\'t fail to take into account higher insurance cost.'
    },
    {
      id: 7,
      toDo: 'Revise car loan contract',
      details: [
        'Some car dealers will allow a car buyer to write a check for the down payment, fill out a car loan application, and drive the car home. <br /> If the application is not approved, the car buyer may have to reapply for a car loan that is set at a higher rate.'
      ],
      notToDo: 'Don\'t fill car loan application without revision'
    },
    {
      id: 8,
      toDo: 'AutoCheck report or CARFAX',
      details: [
        'Review the repair history. Also, the fewer the owners the better. '
      ],
      notToDo: 'Don\'t buy a car that had water damage. Don\'t buy a car with too many repairs or has had more than two owners.'
    },
    {
      id: 9,
      toDo: 'Get the best price',
      details: [
        'Check Kelley Blue Book'
      ],
      notToDo: 'Don\'t assume that the advertsed price is the best price.'
    },
    {
      id: 10,
      toDo: 'Budget for additional costs (ex. registration fees, taxes, transportaion fees, insurance, etc.)',
      details: [
        'Estimate ownership costs at <a href=\'http://www.edmunds.com\' target=\'_blank\'>Edmund</a>'
      ],
      notToDo: ''
    }
  ],
  cards: [
    {
      id: 0,
      toDo: 'Pay off balance on credit cards before investing elsewhere.',
      details: [
        'When you finance credit card balances, your cost of financing will normally be much higher than the return you are receiving on any money market investments that you hold.'
      ],
      notToDo: 'Don\'t carry balance on credit card if there is a cash to pay the balance. '
    },
    {
      id: 1,
      toDo: 'Pay off credit card debt before other debt',
      details: [
        'If you have other debt outstanding, you should pay off credit card debt first (assuming that the credit card debt has a higher interest rate).'
      ],
      notToDo: 'Don\'t prefer payment of anyother debt over credit card debt. '
    },
    {
      id: 2,
      toDo: 'Pay off the balance with the highest annual percentage rate (APR) first.',
      details: [
        'Pay off 0% annual % rate (APR) balance transfer amount first'
      ],
      notToDo: 'Don\'t cancel credit card accounts until you pay them off or consolidate them. <br /> Don\'t only make the minimum payment. <br />Don\'t rob your emergency fund or home '
    },
    {
      id: 3,
      toDo: 'Try to fix mistake on credit report on your own',
      details: [
        'Companies that offer credit repair services claim to be able to solve your credit problems. For example, they may help you fix a mistake on your credit report. However, you could have done this yourself, without paying for the service.'
      ],
      notToDo: 'Don\'t pay for Credit repair services'
    },
    {
      id: 4,
      toDo: 'Target one debt at a time',
      details: [
        'You\'ll get a higher return on yur effort and feel more successful.'
      ],
      notToDo: 'Don\'t dilute your efforts by taking on too many account'
    },
    {
      id: 5,
      toDo: 'Debt Consolidation for a fixed monthly payment',
      details: [
        'Find a low balance transfer rate and move debt off high-interest cards to the lower ones or ask your bank for help setting-up a new loan to may help  lower your monthly payment.'
      ],
      notToDo: 'Don\'t continue to keep multiple accounts.'
    },
    {
      id: 6,
      toDo: 'Use credit card as a mean of convenience - not a source of funds',
      details: [
        'Use Credit card only if you have the cash to cover the payment within next payment period.'
      ],
      notToDo: 'Don\'t charge items you can\'t pay off in a month'
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
      notToDo: 'Dont\' rely on a conventional savings account'
    },
    {
      id: 1,
      toDo: 'Calculate Your College Expense',
      details: [
        'Use this resource to estimate how much you will need: <a href=\'http://www.savingforcollege.com/college-savings-calculator/index.php\' target=\'_blank\'>College cost calculator</a>'
      ],
      notToDo: 'Dont\' guess on how much you will need. Chances are it will be more than you expected.'
    },
    {
      id: 2,
      toDo: 'Estimate Your Expected Family Contribution (EFC) ',
      details: [
        '<a href=\'https://fafsa.ed.gov/FAFSA/app/f4cForm\' target=\'_blank\'>Federal Student Aid</a>'
      ],
      notToDo: 'Dont\' assume that everyone pays the same amount.'
    },
    {
      id: 3,
      toDo: 'Add the same amount every time you get paid',
      details: [
        'Plan this into your budget. Use automatic payments if possible'
      ],
      notToDo: 'Dont\' be inconsistent with your savings. Slow and steady wins the race.'
    },
    {
      id: 4,
      toDo: 'Take classes for college credits at a lower cost community college',
      details: [
        'Save money by taking required general education class at a city college',
        'Make sure credits are transferable first',
        'AP classes in high school are another great option'
      ],
      notToDo: 'Dont\' assume that all of your course work has to be at a 4-year institution'
    },
    {
      id: 5,
      toDo: 'Apply to colleges with large endowments',
      details: [
        'Expensive private colleges may actually be the least expensive when you factor in generous endowments for qualified students'
      ],
      notToDo: 'Dont\' assume that private school is cheaper than public'
    },
    {
      id: 6,
      toDo: 'Find Scholarships',
      details: [
        'Go to <a href=\'http://www2.ed.gov/programs/fws/index.html\' target=\'_blank\'>FastWeb.com</a> to find scholarships and explore work-study programs'
      ],
      notToDo: 'Dont\' sc this thingholarship is too small to apply for. Multiple scholarships add up'
    }
  ],
  funds: [
    {
      id: 0,
      toDo: 'Determine how much you need',
      details: [
        'Calculate your monthly expenses and use this calculator: <a href=\'http://www.moneyunder30.com/emergency-fund-calculator\' target=\'_blank\'>Emergency fund calculator</a>'
      ],
      notToDo: 'Dont\' underestimate what you\'ll need or how long it will take you to find a new job if you lose yours.'
    },
    {
      id: 1,
      toDo: 'Setup a separate account exclusively for you Emergency Fund',
      details: [
        'Keep your emergency fund separate from you checking and saving account. You\'ll think differently about this fund if dedicate to an emergency (i.e. you\'ll be less likely to spend it)'
      ],
      notToDo: 'Dont\' co-mingle funds with your checking or saving account'
    },
    {
      id: 2,
      toDo: 'Start now - make a minum deposit of $25',
      details: [
        'This is your safety-net. You\'ll need more later but this will go a long way toward getting started.'
      ],
      notToDo: 'Dont\' wait until you have an emergency'
    },
    {
      id: 3,
      toDo: 'Add the same amount every time you get paid',
      details: [
        'Make this a priority before any other financial goals. '
      ],
      notToDo: 'Dont\' quit before you achieve your goal. Consistancy is key.'
    },
    {
      id: 4,
      toDo: 'Pay yourself first',
      details: [
        'Setup direct deposit for your monthly budgeted contribution to this fund'
      ],
      notToDo: 'Dont\'aAssume you\'ll stay diciplined after you start saving.'
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
      notToDo: 'Dont\' assume you already have a policy or think you don\'t need one.'
    }
  ]
};

module.exports = function(goal) {
  if(typeof goal !== 'string') {
    helpers.makeError('params', goal);
  }

  return actions[goal];
};
