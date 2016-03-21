(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./polyfills');
require('./components/hamburger');
// var helpers = require('./helpers');
var model = require('./model');
var view = require('./view');
var controller = require('./controller');

var init = function() {
  model.init('wealthApp');
  var initialState = model.read();
  view.init();
  controller(model, view.getViews(), initialState);

  window.model = model;
};

init();

// try {
//   init();
// } catch (e) {
//   console.error(e);
//   //@FIXME update email address
//   helpers.makeError(null, 'Something wrong happened. Please try refreshing the page and report the problem at ...');
// }

},{"./components/hamburger":2,"./controller":3,"./model":15,"./polyfills":19,"./view":20}],2:[function(require,module,exports){
'use strict';

var toggle = document.querySelector('.c-hamburger');
toggle.addEventListener('click', function(e) {
  e.preventDefault();
  if (this.classList.contains('is-active')) {
    document.body.classList.remove('menu-open');
    this.classList.remove('is-active');
  } else {
    document.body.classList.add('menu-open');
    this.classList.add('is-active');
  }
});
},{}],3:[function(require,module,exports){
/**
 * Controller module. This module executes the controllers for each view, in MVC
 * pattern. To be more precise this is more likely the Presenter in MVP pattern.
 * Our views/screens are 'dumb'. They don't know anything about the Model, so
 * the Presenter has the job to update the screens when Model changes and viceversa.
 * @see {@link https://addyosmani.com/resources/essentialjsdesignpatterns/book/#detailmvp}
 * @module controller
 */

var controllers = [
  require('./controllers/about'),
  require('./controllers/expenses'),
  require('./controllers/comparison'),
  require('./controllers/scenarios'),
  require('./controllers/goal'),
  require('./controllers/plan'),
  require('./controllers/reminders'),
  require('./controllers/nav'),
  require('./controllers/continue')
];

module.exports = function(model, view, initialState) {
  /*
   * Every controller's job is almost the same:
   * - to set/render the view the first time, on window load
   * - to bind user interactions to functions which update the model
   * - to update the DOM (rendering the data) whenever the Model is changed by
   *   subscribing to Model changes
   * @see {@url https://addyosmani.com/resources/essentialjsdesignpatterns/book/#observerpatternjavascript}
   */
  controllers.forEach(function(controller, index) {
    controller(model, view[index], initialState);
  });
};
},{"./controllers/about":4,"./controllers/comparison":5,"./controllers/continue":6,"./controllers/expenses":7,"./controllers/goal":8,"./controllers/nav":9,"./controllers/plan":10,"./controllers/reminders":11,"./controllers/scenarios":12}],4:[function(require,module,exports){
var bindView = function(model, view) {
  view.bind('ageChanged', function(value) {
    model.update({'aboutAge': value});
  });
  view.bind('incomeChanged', function(value) {
    model.update({'aboutIncome': value});
  });
  view.bind('situationChanged', function(value) {
    model.update({'aboutSituation': value});
  });
  view.bind('livingChanged', function(value) {
    model.update({'aboutLiving': value});
  });
};

var setView = function(view, initialState) {
  var age = initialState.aboutAge;
  var income = initialState.aboutIncome;
  var situation = initialState.aboutSituation;
  var living = initialState.aboutLiving;

  view.render('showSliders', {age: age, income: income});
  view.render('setSelects', {situation: situation, living: living});
};

module.exports = function(model, view, initialState) {
  setView(view, initialState);
  bindView(model, view);
};
},{}],5:[function(require,module,exports){
// var helpers = require('../helpers');
var PubSub = require('pubsub-js');

var setView = function(model, view) {
  //we don't use initialState because setView() is used also when there are
  //events which need a complete re-render such as 'aboutIncome' changed
  var state = model.read();
  var income = state.aboutIncome;
  var basicRate = state.aboutBasicRate;
  var discRate = state.aboutDiscretionaryRate;
  var savingsRate = state.aboutSavingsRate;
  var userExpenses = state.expenses;
  var othersExpenses = model.getDefaultRates(income, true);

  view.render('showSummaryChart', {
    user: {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    },
    others: othersExpenses
  });
  view.render('showUserExpenses', {
    income: income,
    basicRate: basicRate,
    discRate: discRate,
    savingsRate: savingsRate
  });
  view.render('showOthersExpenses', {
    income: income,
    othersExpenses: othersExpenses
  });
  view.render('showDetailedChart', {
    userExpenses: userExpenses,
    othersExpenses: othersExpenses.detailed
  });
  view.render('showConclusion', {
    userExpenses: {
      basic: basicRate,
      discretionary: discRate,
      savings: savingsRate
    },
    othersExpenses: othersExpenses
  });
};

var subscriber = function(model, view, topic, msg) {
  if (topic === 'aboutSavingsRate') {
    var data = model.read();
    var income = data.aboutIncome;
    var basicRate = data.aboutBasicRate;
    var discRate = data.aboutDiscretionaryRate;
    var savingsRate = data.aboutSavingsRate;
    var userExpenses = {
      basic: basicRate,
      discretionary: discRate,
      savings: savingsRate
    };
    var othersExpenses =  model.getDefaultRates(income);

    view.render('showUserExpenses', {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
    view.render('updateSummaryChart', {
      userExpenses: userExpenses,
      othersExpenses:othersExpenses
    });
    view.render('showConclusion', {
      userExpenses: userExpenses,
      othersExpenses: othersExpenses
    });
  } else if(topic === 'expenses') {
    view.render('updateDetailedChart', {
      userExpenses: msg
    });
  }
};

module.exports = function(model, view) {
  setView(model, view);
  PubSub.subscribe('aboutIncome', function() {
    setView(model, view);
  });
  PubSub.subscribe('aboutSavingsRate', subscriber.bind(null, model, view));
  PubSub.subscribe('step.comparison', function() {
    setView(model, view);
  });
  PubSub.subscribe('expenses', subscriber.bind(null, model, view));
};
},{"pubsub-js":42}],6:[function(require,module,exports){
var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('continueClicked', function(stepName) {
    PubSub.publish('activateStep', stepName);
  });
};

module.exports = function(model, view) {
  bindView(model, view);
};
},{"pubsub-js":42}],7:[function(require,module,exports){
var helpers = require('../helpers');
var PubSub = require('pubsub-js');
var notie = require('notie');

var bindView = function(model, view) {
  view.bind('basicRateChanged', function(basicRate) {
    var discRate = model.read('aboutDiscretionaryRate');
    var savingsRate = 100 - basicRate - discRate;

    if(savingsRate < 0) {
      view.render('setSlider', {
        sliderName: 'basic',
        value: model.read('aboutBasicRate')
      });
      helpers.makeError('user', 'Error: the sum of basic & discretionary rates are superior than 100', notie.alert.bind(null, 3));
    }

    model.update({aboutBasicRate: basicRate});
    model.update({aboutSavingsRate: savingsRate});
    view.render('updatePieChart', {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
  });
  view.bind('discRateChanged', function(discRate) {
    var basicRate = model.read('aboutBasicRate');
    var savingsRate = 100 - basicRate - discRate;

    if(savingsRate < 0) {
      view.render('setSlider', {
        sliderName: 'discretionary',
        value: model.read('aboutDiscretionaryRate')
      });
      helpers.makeError('user', 'Error: the sum of basic & discretionary rates are superior than 100', notie.alert.bind(null, 3));
    }

    model.update({'aboutDiscretionaryRate': discRate});
    model.update({'aboutSavingsRate': savingsRate});
    view.render('updatePieChart', {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
  });
  view.bind('currentSavingsChanged', function(currentSavings) {
    model.update({'currentSavings': currentSavings});
  });
  view.bind('detailsChanged', function() {});
  view.bind('detailsReset', function() {
    var income = model.read('aboutIncome');
    var defaultExpenses = model.getDefaultRates(income, true).detailed;

    view.render('showDetailed', {
      expenses: defaultExpenses
    });
  });
  view.bind('detailsSaved', function(err, values) {
    if(err) {
      notie.alert(3, err);
    } else {
      var summaryExpenses = model.getSummaryExpenses(values);
      view.render('setSlider', {
        sliderName: 'basic',
        value: summaryExpenses.basic
      });
      view.render('setSlider', {
        sliderName: 'discretionary',
        value: summaryExpenses.discretionary
      });
      model.update({expenses: values});
    }
  });
};

var setView = function(model, view, initialState) {
  var income = initialState.aboutIncome;
  var basicRate = initialState.aboutBasicRate;
  var discRate = initialState.aboutDiscretionaryRate;
  var currentSavings = initialState.currentSavings;
  var expenses = initialState.expenses;

  //If user has not entered detailed expenses yet
  if(expenses.length == 0) {
    expenses = model.getDefaultRates(income, true).detailed;
  }

  view.render('showSliders', {
    basicRate: basicRate,
    discRate: discRate,
    currentSavings: currentSavings
  });
  view.render('showPieChart', {
    income: income,
    basicRate: basicRate,
    discRate: discRate
  });
  view.render('showDetailed', {
    expenses: expenses
  });
};

var subscriber = function(model, view, topic, data) {
  if (topic === 'aboutIncome') {
    //data is the new income
    var defaultRates = model.getDefaultRates(data, true);
    view.render('setSlider', {
      sliderName: 'basic',
      value: defaultRates.basic
    });
    view.render('setSlider', {
      sliderName: 'discretionary',
      value: defaultRates.discretionary
    });
    view.render('updatePieTooltip', data);
    view.render('showDetailed', {
      expenses: defaultRates.detailed
    });
  }
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
  PubSub.subscribe('aboutIncome', subscriber.bind(null, model, view));
};
},{"../helpers":14,"notie":40,"pubsub-js":42}],8:[function(require,module,exports){
var bindView = function(model, view) {
  view.bind('goalToggled', function(data) {
    var goal = Object.assign({}, model.getGoals(data.id), {date: data.date});
    model.toggleGoal(goal);
  });
};

var setView = function(model, view, initialState) {
  view.render('showGoals', {
    goalsList: model.getGoals(),
    pickedGoals: initialState.goals
  });
  view.render('createTooltips');
  view.render('setDragDrop');
  view.render('createDatepickers');
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
};
},{}],9:[function(require,module,exports){
var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('linkClicked', function(nextStep) {
    if(nextStep) {
      PubSub.publish('step.' + nextStep);
    }
  });
};

var setView = function(view, initialState) {
  var lastUserStep = initialState.lastUserStep;

  view.render('disableLinks', {lastUserStep: lastUserStep});
};

var subscriber = function(model, view, topic, data) {
  var stepName = data;
  var stepNumber = Number(document.get('step-name--' + stepName).get('step-number').textContent);
  var lastUserStep = model.read('lastUserStep');

  view.render('activateStep', {
    stepName: stepName
  });

  if(lastUserStep < stepNumber) {
    model.update({lastUserStep: stepNumber});
  }

  PubSub.publish('step.' + stepName);
};

module.exports = function(model, view, initialState) {
  setView(view, initialState);
  bindView(model, view);
  PubSub.subscribe('activateStep', subscriber.bind(null, model, view));

  /* DEVELOPMENT ONLY */
  //@NOTE This could be useful also for users and not only for development
  var resetButton = document.get('reset-model');
  resetButton.addEventListener('click', function() {
    model.reset();
    document.location.reload();
  });
};
},{"pubsub-js":42}],10:[function(require,module,exports){
var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('actionToggled', function(action) {
    model.toggleActions(action);
  });
};

var setView = function(model, view, initialState) {
  var goals = initialState.goals;
  var goalsActions = goals.map(function(goal) {
    var actions = model.getActions(goal.id);
    if(actions) {
      return Object.assign({}, goal, {actions: actions});
    }

    return;
  }).filter(function(goalActions) { //filter not undefined goal actions
    return goalActions;
  });
  // We add the general tips to the beginning
  goalsActions.unshift({
    id: 'general',
    actions: model.getActions('general'),
    title: 'General Tips'
  });

  view.render('showGoalsActions', goalsActions);
  view.render('createPopovers');
};

var subscriber = function(model, view, topic, data) {
  setView(model, view, {goals: data});
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
  PubSub.subscribe('goals', subscriber.bind(null, model, view));
};
},{"pubsub-js":42}],11:[function(require,module,exports){
var bindView = function(model, view) {
  view.bind('printClicked', function() {
    view.render('printPlan');
  });
};

var setView = function(model, view) {
  view.render('createPopovers');
  view.render('createDatePickers');
};

module.exports = function(model, view) {
  setView(model, view);
  bindView(model, view);
};
},{}],12:[function(require,module,exports){
// var helpers = require('../helpers');
var PubSub = require('pubsub-js');
// var notie = require('notie');

var renderUpdate = function(model, view, propName, propValue) {
  var state = model.read();
  var data = {
    income: state.aboutIncome,
    savingsRate: state.aboutSavingsRate,
    age: state.aboutAge,
    currentSavings: state.currentSavings
  };
  data[propName] = propValue;

  view.render('updateLineChartSerie', data);
};

var setView = function(model, view, initialState) {
  var age = initialState.aboutAge;
  var income = initialState.aboutIncome;
  var savingsRate = initialState.aboutSavingsRate;
  var currentSavings = initialState.currentSavings;

  view.render('showSliders', {
    income: income,
    savingsRate: savingsRate
  });
  view.render('showLineChart', {
    age: age,
    income: income,
    savingsRate: savingsRate,
    currentSavings: currentSavings
  });
};

var bindView = function(model, view) {
  var bindedRenderUpdate = renderUpdate.bind(null, model, view);
  var events = [
    'annualInterestRateChanged',
    'savingsRateChanged',
    'incomeChanged',
    'investmentRateChanged',
    'retirementAgeChanged'
  ];

  events.forEach(function(eventName) {
    view.bind(eventName, bindedRenderUpdate.bind(null,  eventName.replace('Changed', '')));
  });
};

var subscriber = function(model, view, topic, data) {
  var bindedRenderUpdate = renderUpdate.bind(null, model, view);

  if (topic === 'aboutAge') {
    bindedRenderUpdate('age', data);
  } else if(topic === 'aboutIncome') {
    view.render('setSlider', {
      sliderName: 'income',
      value: data
    });
    bindedRenderUpdate('income', data);
  } else if(topic === 'aboutSavingsRate') {
    view.render('setSlider', {
      sliderName: 'savingsRate',
      value: data
    });
    bindedRenderUpdate('savingsRate', data);
  } else if (topic === 'currentSavings') {
    bindedRenderUpdate('currentSavings', data);
  }
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);

  PubSub.subscribe('aboutAge', subscriber.bind(null, model, view));
  PubSub.subscribe('aboutIncome', subscriber.bind(null, model, view));
  PubSub.subscribe('aboutSavingsRate', subscriber.bind(null, model, view));
  PubSub.subscribe('currentSavings', subscriber.bind(null, model, view));
};
},{"pubsub-js":42}],13:[function(require,module,exports){
'use strict';

var helpers = require('./helpers');
var noUiSlider = require('nouislider');

/**
 * Appends an HTML element as tooltip to the slider
 * @param  {object} slider Slider DOM Element
 * @return {object}
 */
var appendTooltip = function(slider) {
  if(!slider.appendChild) {
    helpers.makeError('params', slider);
  }

  var handle = slider.get('noUi-handle');
  var tooltip = document.createElement('div');
  tooltip.classList.add('slider-tooltip');
  tooltip.innerHTML = '<span></span>';
  handle.appendChild(tooltip);

  return slider;
};

/**
 * Create a slider using noUiSlider
 * @param  {HTMLElement} element HTML Node of the slider
 * @param  {object} options Slider options
 * @param  {string} format Tooltip value format
 * @return {HTMLElement} tooltip-handle
 */
var createSlider = function(element, options) {
  if (typeof noUiSlider !== 'object') {
    helpers.makeError(null, 'nouislider object is not declared.');
  }
  noUiSlider.create(element, options);
  return element;
};

var updateHandler = function(slider, format) {
  var tooltip = slider.getElementsByTagName('span')[0];
  slider.noUiSlider.on('update', function(values) {
    console.log(values);
    tooltip.innerHTML = helpers.format(values[0], format);
  });
};

var sliderWithTooltips = function(element, options, format) {
  updateHandler(
    appendTooltip( createSlider(element, options) ),
    format
  );
};

/**
 * Removes a className from the current active element and applies it to the
 * new one
 * @param {Element} newActive New active element
 * @param {string} className Classname to apply
 */
var setActive = function(newActive, className) {
  var oldActive = document.get(className);
  oldActive.classList.remove(className);
  newActive.classList.add(className);
};

module.exports = {
  createSlider: sliderWithTooltips,
  setActive: setActive
};

},{"./helpers":14,"nouislider":41}],14:[function(require,module,exports){
/**
 * Helpers module
 * @module helpers
 */

'use strict';

var customErrorConstructor = function(name, desc) {
  var ErrorConstructor = function(msg) {
    this.message = desc + msg;
    this.stack = (new Error()).stack;
  };
  ErrorConstructor.prototype = Object.create(Error.prototype);
  ErrorConstructor.prototype.name = name;

  return ErrorConstructor;
};

var ParamsError = customErrorConstructor('ParamsError', 'Invalid parameters: ');
var UserError = customErrorConstructor('UserError', 'Invalid user input: ');

/**
 * Throws an error
 * @param  {string} type Error type/constructor
 * @param  {object} data Data to pass in the msg
 * @param  {Function} callback Optional callback. Useful if you need to display
 * the error to the user for example.
 */
var makeError = function(type, data, callback) {
  var msg;
  callback = callback || function() {};

  try {
    msg = JSON.stringify(data);
  } catch (e) {
    msg = JSON.stringify(e);
  }

  callback(msg);

  switch (type) {
    case 'params':
      throw new ParamsError(msg);
    case 'user':
      throw new UserError(msg);
    default:
      throw new Error(msg);
  }
};

/**
 * Checks whether the input is strictly a isNumber
 * @param {*} value Value to check
 * @return {boolean}
 */
var isNumber = function(value) {
  //Check also with isNaN because (typeof NaN === 'number') is true
  return !isNaN(value) && (typeof value === 'number');
};

/**
 * Formats the value to a specified type
 * @param  {string} value Value to be formatted
 * @param  {string} type Format
 * @return {string} Formatted value
 */
var format = function(value, type) {
  if((type && typeof type !== 'string') ) {
    makeError('params', value);
  }

  var newValue = '';

  value = String(value).replace(/(\.0)$/, '');

  switch (type) {
    case '$':
      newValue = '$' + value;
      break;
    case '%':
      newValue = value + '%';
      break;
    default:
      newValue = value;
  }

  return newValue;
};

/**
 * Returns the reversed array without side effects
 * @param  {array} array Initial array
 * @return {array}
 */
var reverse = function(array) {
  if(!Array.isArray(array)) {
    makeError('params', array);
  }

  return array.slice().reverse();
};

/**
 * Set the configMap of the module - It goes deep in the object
 * @param  {object} inputMap Object map with new properties and values
 * @param  {object} configMap Initial object map
 * @return {object} configMap Updated map
 */
var setConfigMap = function(inputMap, configMap) {
  var key;

  for (key in inputMap) {
    if (configMap.hasOwnProperty(key)) {
      if (inputMap[key] instanceof Object) {
        setConfigMap(inputMap[key], configMap[key]);
      } else {
        configMap[key] = inputMap[key];
      }
    }
  }

  return configMap;
};

/**
 * Replaces mustache-wrapped words with values
 * @param  {string} string Initial string
 * @param  {object} valuesMap Object map of values
 * @return {string}
 */
var template = function(string, valuesMap){
  var s = string || '';

  Object.keys(valuesMap).forEach(function(value) {
    s = s.replace(new RegExp('{' + value + '}', 'g'), valuesMap[value]);
  });

  return s;
};

/**
 * Toggles a item in array, adding or removing it whether it's already contained
 * @param  {array} array Array
 * @param  {object} item Item
 * @return {array} myArray Updated array
 */
var toggleArrayItem = function(array, item) {
  //We clone the array to avoid side effects
  var myArray = array.slice(0);

  var isThere = myArray.find(function(arrayItem, index) {
    if(arrayItem.id === item.id) {
      myArray.splice(index, 1);
      return true;
    }
  });

  if(!isThere) {
    myArray.push(item);
  }

  return myArray;
};

/**
 * Returns the actual value of a rate
 * @param  {number} total Total
 * @param  {number} rate Rate
 * @return {number}
 */
var valueOfRate = function(total, rate) {
  if( (typeof rate !== 'number') || (typeof total !== 'number') ) {
    makeError('params', {rate: rate, total: total});
  }

  return rate * total * 0.01;
};

/**
 * Returns the actual values of summary rates based on income
 * @param  {number} income Income
 * @param  {number} basicRate Basic needs rate
 * @param  {number} discRate Discretionary Expenses rate
 * @param  {number} savingsRate Savings rate
 * @return {object}
 */
var valuesOfSummary = function(income, basicRate, discRate, savingsRate) {
  var valueOfCategory = valueOfRate.bind(null, income);
  return {
    basicNeeds: valueOfCategory(basicRate),
    discretionaryExpenses: valueOfCategory(discRate),
    annualSavings: valueOfCategory(savingsRate)
  };
};


module.exports = {
  format: format,
  makeError: makeError,
  isNumber: isNumber,
  reverse: reverse,
  setConfigMap: setConfigMap,
  template: template,
  toggleArrayItem: toggleArrayItem,
  valueOfRate: valueOfRate,
  valuesOfSummary: valuesOfSummary
};

},{}],15:[function(require,module,exports){
/**
 * Model module
 * @module model
 */

'use strict';

var helpers = require('./helpers');
var PubSub = require('pubsub-js');
var notie = require('notie').alert;

var actions = require('./model/actions');
var budget = require('./model/budget');
var getGoals = require('./model/goals');

var stateMap = {
  dbName: ''
};

var defaultModel = {
  aboutAge: 35,
  aboutSituation: 'married',
  aboutLiving: 'own',
  aboutIncome: 60000,
  aboutBasicRate: 35,
  aboutDiscretionaryRate: 52,
  aboutSavingsRate: 13,
  currentSavings: 10000,
  expenses: [],
  //aboutStage: 'home',
  lastUserStep: 1,
  goals: [],
  actions: []
};


///////////////////////////
// BASIC STORE FUNCTIONS //
///////////////////////////

/**
 * Returns the value of the property in the model.
 * @param  {string} property The name of the property
 * @return {anything}
 */
var read = function(property) {
  var data = JSON.parse(localStorage[stateMap.dbName]);

  if(typeof property === 'undefined') {
    return data;
  }

  return data[property];
};

/**
 * Updates model by giving it the property name and its value.
 * @param  {string} updateMap The name of the property to update
 */
var update = function (updateMap) {
  if(typeof updateMap !== 'object') {
    helpers.makeError('params', updateMap);
  }

  var data = read();

  Object.keys(updateMap).forEach(function(property) {
    data[property] = updateMap[property];
    PubSub.publish(property, updateMap[property]);
    console.log(property, updateMap[property]);
  });

  localStorage[stateMap.dbName] = JSON.stringify(data);
};

/**
 * Removes data from model
 * @param  {string} property The name of the property to be removed from model.
 */
var remove = function (property) {
  var data = read();

  delete data[property];

  localStorage[stateMap.dbName] = JSON.stringify(data);
};

/**
 * WARNING: Will remove ALL data from storage.
 */
var reset = function () {
  localStorage[stateMap.dbName] = JSON.stringify(defaultModel);
};


//////////////////////////////
// SPECIFIC MODEL FUNCTIONS //
//////////////////////////////


/**
 * Returns summary expenses from the detailed one
 * @param  {array} detailedExpenses Array of the values of detailed expenses
 * @return {Object}
 */
var getSummaryExpenses = function(detailedExpenses) {
  /**
   * Positions of the basic categories in the list of detailed expenses
   * @type {Array}
   * @NOTE This should be improved since it requires the parameter array to
   * have always the same structure, but it would require much more code
   */
  var basicCategories = [0, 2, 4];
  var basicExpenses = 0;
  var discExpenses = 0;

  if(!Array.isArray(detailedExpenses)) {
    helpers.makeError('params', detailedExpenses);
  }

  detailedExpenses.forEach(function(expense, index) {
    if(~basicCategories.indexOf(index)) {
      basicExpenses += expense;
    } else {
      discExpenses += expense;
    }
  });

  return {
    basic: basicExpenses,
    discretionary: discExpenses
  };
};

/**
 * Updates the stored list adding or removing the element
 * @param  {string} listName Name of the list
 * @param  {object} item item to add or delete
 */
var toggleListItem = function(listName, item) {
  if(typeof listName !== 'string') {
    helpers.makeError('params', listName);
  }

  var list = read()[listName];
  var updatedList = helpers.toggleArrayItem(list, item);
  var updateMap = {};
  updateMap[listName] = updatedList;
  update(updateMap);
};

var init = function(name) {
  stateMap.dbName = name;

  if(typeof window.Storage === undefined) {
    helpers.makeError(null, 'Error: localStorage is not supported.', notie.bind(null, 3));
  }

  if(!localStorage[name]) {
    try {
      localStorage[name] = JSON.stringify(defaultModel);
    } catch(error) {
      helpers.makeError(null, 'Error: localStorage is a browser feature requested by this application and it is not supported or available. Are using Private Navigation?', notie.bind(null, 3));
    }
  }
};

module.exports = {
  getActions: actions,
  getDefaultRates: budget.getDefaultRates,
  getGoals: getGoals,
  getSummaryExpenses: getSummaryExpenses,
  init: init,
  read: read,
  reset: reset,
  remove: remove,
  toggleActions: toggleListItem.bind(null, 'actions'),
  toggleGoal: toggleListItem.bind(null, 'goals'),
  update: update
};

},{"./helpers":14,"./model/actions":16,"./model/budget":17,"./model/goals":18,"notie":40,"pubsub-js":42}],16:[function(require,module,exports){
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

},{"../helpers":14}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"../helpers":14}],19:[function(require,module,exports){
/**
 * PROTOTYPE FUNCTIONS
 */

// Allow for looping on nodes by chaining and using forEach on both Nodelists and HTMLCollections
// qsa('.foo').forEach(function () {})
NodeList.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.forEach = Array.prototype.forEach;

/**
 * Shortcut for getElementsByClassName, returns the first found element of the
 * HTMLCollection
 * @param  {string} className Class name
 * @param  {number} [index] HTMLCollection index of the element to return
 * @return {Element}
 */
Element.prototype.get = function(className, index) {
  if( (typeof className !== 'string') || (index && (typeof index !== 'number')) ) {
    throw new Error('Wrong className or index');
  }

  index = index || 0;

  return this.getElementsByClassName(className)[index];
};

Element.prototype.getAll = function(className) {
  if(typeof className !== 'string') {
    throw new Error('Wrong className');
  }

  return this.getElementsByClassName(className);
};

document.get = Element.prototype.get;
document.getAll = Element.prototype.getAll;

if (Element && !Element.prototype.matches) {
  var proto = Element.prototype;
  proto.matches = proto.matchesSelector ||
    proto.mozMatchesSelector || proto.msMatchesSelector ||
    proto.oMatchesSelector || proto.webkitMatchesSelector ||
    function(selector) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(selector);
      var i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) ;
      return i > -1;
    };
}

/*
 * Implements the ECMAScript 2015 'find' function in Arrays
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
 * @param  {function} !Array.prototype.find Function to execute on each value in the array
 * @return {undefined}
 */
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

//The Object.assign() method is used to copy the values of all enumerable own
//properties from one or more source objects to a target object. It will return
//the target object.
if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}

},{}],20:[function(require,module,exports){
'use strict';

var viewsNames = [
  'about',
  'expenses',
  'comparison',
  'scenarios',
  'goal',
  'plan',
  'reminders'
];
var views = [
  require('./views/about'),
  require('./views/expenses'),
  require('./views/comparison'),
  require('./views/scenarios'),
  require('./views/goal'),
  require('./views/plan'),
  require('./views/reminders'),
  require('./views/nav'),
  require('./views/continue')
];

var getViews = function() {
  return views;
};

var init = function() {
  views.forEach(function(view, index) {
    var container = index < 7? document.get('step--' + viewsNames[index]) : null;
    view.setStateMap(container);
  });
};

module.exports = {
  init: init,
  getViews: getViews
};
},{"./views/about":21,"./views/comparison":23,"./views/continue":24,"./views/expenses":25,"./views/goal":26,"./views/nav":27,"./views/plan":28,"./views/reminders":29,"./views/scenarios":30}],21:[function(require,module,exports){
(function (global){
/**
 * Screen #2 - About module
 * @module about
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);

var stateMap = {
  ageSlider: null,
  incomeSlider: null,
  situation: null,
  living: null
};


///////////////////
// DOM FUNCTIONS //
///////////////////


var showSliders = function(data) {
  var age = data.age;
  var income = data.income;

  if(!age || !income) {
    helpers.makeError('params', data);
  }

  var ageOptions = {
    start: age,
    step: 1,
    range: {
      'min': 18,
      'max': 65
    },
    pips: {
      mode: 'values',
      values: [20, 30, 40, 50, 60, 65],
      density: 5
    },
    format: wNumb({
      decimals: 0
    })
  };
  var incomeOptions = {
    start: income,
    step: 1000,
    range: {
      'min': 18000,
      'max': 200000
    },
    format: wNumb({
      decimals: 1,
      thousand: ','
    })
  };

  domHelpers.createSlider(stateMap.ageSlider, ageOptions);
  domHelpers.createSlider(stateMap.incomeSlider, incomeOptions, '$');
};

var setSelects = function(data) {
  var situation = data.situation;
  var living = data.living;

  if(!situation || !living) {
    helpers.makeError('params', data);
  }

  stateMap.situation.value = situation;
  stateMap.living.value = living;
};


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * Used by shell to bind event handlers to this module DOM events. It usually
 * means that we want the shell to update model when user interacts with this
 * screen.
 * @param  {string} event Event name
 * @param  {function} handler Event handler
 */
var bind = function(event, handler) {
  switch(event) {
    case 'ageChanged':
      stateMap.ageSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0]));
      });
      break;
    case 'incomeChanged':
      stateMap.incomeSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0].replace(',', '')));
      });
      break;
    case 'situationChanged':
      stateMap.situation.addEventListener('change', function(event) {
        handler(event.target.value);
      });
      break;
    case 'livingChanged':
      stateMap.living.addEventListener('change', function(event) {
        handler(event.target.value);
      });
      break;
    default:
      return;
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showSliders':
      showSliders(data);
      break;
    case 'setSelects':
      setSelects(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.ageSlider = container.get('age__slider');
  stateMap.incomeSlider = container.get('income__slider');
  stateMap.situation = container.get('select');
  stateMap.living = container.get('select', 1);
};

module.exports = {
  bind: bind,
  setStateMap: setStateMap,
  render: render
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../dom-helpers":13,"../helpers":14}],22:[function(require,module,exports){
var helpers = require('../helpers');
var Chartist = require('chartist');

var stateMap = {
  chartWrapper: null,
  chart: null
};


var showDetailedChart = function(data) {
  var userExpenses = helpers.reverse(data.userExpenses);
  var othersExpenses = helpers.reverse(data.othersExpenses);

  if(!Array.isArray(userExpenses) || !Array.isArray(othersExpenses)) {
    helpers.makeError('params', data);
  }

  //If user has not entered detailed expenses yet
  if(userExpenses.length == 0) {
    userExpenses = othersExpenses;
  } else {
    stateMap.chartWrapper.classList.add('show-chart');
  }

  var chartData = {
    labels: ['Miscellaneous', 'Education', 'Entertainment & Reading', 'Healthcare', 'Trasportation', 'Apparel & services', 'Utilities, fuels, public services', 'Misc Housing Related', 'Housing', 'Food away from home', 'Food at home'],
    series: [
      userExpenses,
      othersExpenses
    ]
  };
  var chartOptions =  {
    axisY: {
      offset: 100
    },
    axisX: {
      labelOffset: {
        x: -7,
        y: 0
      }
    },
    seriesBarDistance: 10,
    horizontalBars: true
  };
  stateMap.chart = new Chartist.Bar('.detailed-chart', chartData, chartOptions);
};

//For now it's used only when user changes his expenses and not for 'income
//changes/default expenses changes' since they are dealt with showDetailedChart()
var updateDetailedChart = function(data) {
  var userExpenses = helpers.reverse(data.userExpenses);

  if(!Array.isArray(userExpenses)) {
    helpers.makeError('params', data);
  }

  stateMap.chartWrapper.classList.add('show-chart');
  stateMap.chart.data.series[0] = userExpenses;
  stateMap.chart.update();
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var render = function(cmd, data) {
  switch(cmd) {
    case 'showDetailedChart':
      showDetailedChart(data);
      break;
    case 'updateDetailedChart':
      updateDetailedChart(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.chartWrapper = container.get('advanced-comparison');
};

module.exports = {
  render:  render,
  setStateMap: setStateMap
};

},{"../helpers":14,"chartist":32}],23:[function(require,module,exports){
(function (global){
/**
 * Screen #5 - Pyramid module
 * @module 5-Pyramid
 */

'use strict';

var helpers = require('../helpers');
var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);
var Chartist = require('chartist');
var details = require('./comparison-details');

var stateMap = {
  income: null,
  budget: {},
  others: {},
  barChart: null,
  conclusion: null
};


////////////////////
// DATA FUNCTIONS //
////////////////////

/**
 * Copies the actual values of the summary into a new object whose key names
 * are needed to be 'basic', 'discretionary' and 'savings'.
 * @param  {object} values Category values of the summary
 * @return {object}
 */
var mapActualValues = function(values) {
  return {
    basic: values.basicNeeds,
    discretionary: values.discretionaryExpenses,
    savings: values.annualSavings
  };
};

var moneyFormat = wNumb({
  thousand: ',',
  prefix: '$ '
});


///////////////////
// DOM FUNCTIONS //
///////////////////

/**
 * Returns an object map of the DOM elements which displays the categories
 * @param  {Object.DOM} container DOM Container
 * @param  {string} who user budget or others
 * @param  {array} categories Array of names of categories
 * @return {object}
 */
var getSummaryDOM = function(container, who, categories) {
  var domMap = {};
  who = '.' + who;

  //The leverage HTML Elements which can be selected with a className like
  //'.budget__category--basic .budget__category__value'
  categories.forEach(function(category) {
    var htmlClass = who + '__category--' + category + ' ' + who + '__category__value';
    domMap[category] = container.querySelector(htmlClass);
  });

  return domMap;
};

var updateTextContent = function(element, text) {
  element.textContent = text;
};

/**
 * Updates the text for user & others summary categories, with the rates and
 * actual values.
 * @param  {object} domMap       Object with the DOM nodes for basic, discretionary
 * and savings
 * @param  {object} actualValues Object with the actual values for each category
 * @param  {object} rates        Object with the rates for each category
 * @example
 * updateSummary(
 *   {
 *     basic: HTMLNode,
 *     discretionary: HTMLNode,
 *     savings: HTMLNode
 *   },
 *   {
 *     basic: 20000,
 *     discretionary: 13000,
 *     savings: 8000
 *   },
 *   {
 *     basic: 45,
 *     discretionary: 35,
 *     savings: 20
 *   }
 *  )
 */
var updateSummary = function(domMap, actualValues, rates) {
  Object.keys(domMap).forEach(function(category) {
    updateTextContent(
      domMap[category].querySelector('.actual'),
      moneyFormat.to(actualValues[category])
    );
    updateTextContent(
      domMap[category].querySelector('.rate'),
      helpers.format(rates[category], '%')
    );
  });
};

//////////////////////
// RENDER FUNCTIONS //
//////////////////////

var showSummaryChart = function(data) {
  var user = data.user;
  var others = data.others;

  if(
    !helpers.isNumber(user.basicRate + user.discRate + user.savingsRate) ||
    !helpers.isNumber(others.basic + others.discretionary + others.savings)
  ) {
    helpers.makeError('params', data);
  }

  var chartData = {
    labels: ['Basic Needs', 'Discretionary Expenses', 'Savings'],
    series: [
      [user.basicRate, user.discRate, user.savingsRate],
      [others.basic, others.discretionary, others.savings]
    ]
  };
  var chartOptions = {
    seriesBarDistance: 22
  };

  stateMap.barChart = new Chartist.Bar('.comparison-chart', chartData, chartOptions);
};

var showUserExpenses = function(data) {
  var income = data.income || 0;
  var basicRate = data.basicRate;
  var discRate = data.discRate;
  var savingsRate = data.savingsRate;

  if(typeof (income + basicRate + discRate + savingsRate) !== 'number') {
    helpers.makeError('params', data);
  }

  var actualValues = mapActualValues(
    helpers.valuesOfSummary(income, basicRate, discRate, savingsRate)
  );
  var budgetRates = {
    basic: basicRate,
    discretionary: discRate,
    savings: savingsRate
  };

  if(income) {
    updateTextContent(stateMap.income, moneyFormat.to(income));
  }
  updateSummary(stateMap.budget, actualValues, budgetRates);
};

var showOthersExpenses = function(data) {
  var income = data.income;
  var othersExpenses = data.othersExpenses;

  if( (typeof income !== 'number') || (typeof othersExpenses !== 'object') ) {
    helpers.makeError('params', data);
  }

  var othersValues = mapActualValues(helpers.valuesOfSummary(
    income,
    othersExpenses.basic,
    othersExpenses.discretionary,
    othersExpenses.savings
  ));

  updateSummary(stateMap.others, othersValues, othersExpenses);
};

var updateSummaryChart = function(data) {
  var userExpenses = data.userExpenses;
  var othersExpenses = data.othersExpenses;

  var chartData = {
    labels: ['Basic Needs', 'Discretionary Expenses', 'Savings'],
    series: [
      [userExpenses.basic, userExpenses.discretionary, userExpenses.savings],
      [41, 51, 8]
    ]
  };

  var series = chartData.series;
  var expense;

  series[0] = Object.keys(userExpenses).map(function(category) {
    expense = userExpenses[category];
    if(typeof expense !== 'number') {
      helpers.makeError('params', data);
    }
    return expense;
  });
  series[1] = Object.keys(othersExpenses).map(function(category) {
    expense = othersExpenses[category];
    if(typeof expense !== 'number') {
      helpers.makeError('params', data);
    }
    return expense;
  });
  stateMap.barChart.update(chartData);
};

var showConclusion = function(data) {
  var userExpenses = data.userExpenses;
  var othersExpenses = data.othersExpenses;

  var template = 'You spend {spend} on {category} so you save {save} than others';
  var text, spend, save;
  var category = Math.abs(userExpenses.basic < othersExpenses.basic) > Math.abs(userExpenses.discretionary < othersExpenses.discretionary) ? 'Basic Needs' : 'Discretionary Expenses';

  if(userExpenses.savings === othersExpenses.savings) {
    text = 'You spend the same as others of your category';
  } else if(userExpenses.savings > othersExpenses.savings) {
    spend = 'less';
    save = 'more';
  } else {
    spend = 'more';
    save = 'less';
  }

  if(spend && save) {
    text = helpers.template(template, {
      spend: spend,
      category: category,
      save: save
    });
  }
  stateMap.conclusion.textContent = text;
};


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var render = function(cmd, data) {
  switch(cmd) {
    case 'showSummaryChart':
      showSummaryChart(data);
      break;
    case 'showUserExpenses':
      showUserExpenses(data);
      break;
    case 'showOthersExpenses':
      showOthersExpenses(data);
      break;
    case 'showDetailedChart':
      details.render('showDetailedChart', data);
      break;
    case 'showConclusion':
      showConclusion(data);
      break;
    case 'updateDetailedChart':
      details.render('updateDetailedChart', data);
      break;
    case 'updateSummaryChart':
      updateSummaryChart(data);
      break;
    default:
      console.error('No command found');
      return;
  }
};

var setStateMap = function(container) {
  var categories = ['basic', 'discretionary', 'savings'];

  stateMap.income = container.querySelector('.budget__income .value__actual');

  stateMap.budget = getSummaryDOM(container, 'budget', categories);
  stateMap.others = getSummaryDOM(container, 'others', categories);

  stateMap.conclusion = container.querySelector('.conclusion');

  details.setStateMap(container);
};

module.exports = {
  setStateMap: setStateMap,
  render: render
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../helpers":14,"./comparison-details":22,"chartist":32}],24:[function(require,module,exports){
/**
 * Continue buttons module
 * @module continue
 */

'use strict';

var stateMap = {
  continue: null,
  backward: null
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'continueClicked') {
    stateMap.continue.forEach(function(button) {
      button.addEventListener('click', function() {
        var template = this.dataset.template;
        handler(template);
      });
    });
    stateMap.backward.forEach(function(button) {
      button.addEventListener('click', function() {
        handler(this.dataset.template);
      });
    });
  }
};

var setStateMap = function() {
  stateMap.continue = document.getAll('continue');
  stateMap.backward = document.getAll('backward');
};

module.exports = {
  bind: bind,
  setStateMap: setStateMap
};

},{}],25:[function(require,module,exports){
(function (global){
/**
 * Screen #3 - You module
 * @module 3-you
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Chartist = require('chartist');

var stateMap = {
  chartNode: null,
  $pieChart: null,

  basicSlider: null,
  expensesSlider: null,
  savingsSlider: null,

  $modal: null,
  detailsList: null,
  detailsInputs: null,
  detailsSum: null,
  detailsSavings: null,
  saveDetails: null
};

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

/**
 * Returns if every item is not equal zero
 * @param  {array} values Array of values to be checked
 * @return {boolean}
 */
var areNotZero = function(values) {
  if(!Array.isArray(values)) {
    helpers.makeError('params', values);
  }

  return !values.some(function(element) {
    return element === 0;
  });
};

/**
 * Returns the innerHTML of the list of inputs for detailed expenses
 * @param  {string} detailTemplate Template for each input of the list
 * @param  {array} detailsNames   Input names corresponding to the expense category
 * @param  {array} defaultValues  Value for the inputs
 * @return {string}
 */
var getDetailsList = function(detailTemplate, detailsNames, defaultValues) {
  var listHTML = '';
  detailsNames.forEach(function(name, index) {
    listHTML += helpers.template(detailTemplate, {
      name: name,
      value: defaultValues[index]
    });
  });
  return listHTML;
};

/**
 * Returns the sum of the values
 * @param  {Array}  values Array of values to be summed
 * @return {Number}
 */
var sum = function(values) {
  if(!Array.isArray(values)) {
    helpers.makeError('params', values);
  }

  return values.reduce(function(previous, current) {
    return previous + current;
  });
};

///////////////////////
// RENDER FUNCTIONS ///
///////////////////////

var createPieTooltip = function(pieChart, income) {
  var $chart = $(pieChart);
  var $toolTip = $chart
    .append('<div class="pie-tooltip"></div>')
    .find('.pie-tooltip')
    .hide();
  var moneyFormat = wNumb({
    thousand: '.',
    prefix: '$ '
  });
  var isTooltipShown = false;

  //For mobiles
  $chart.on('click mouseenter', '.ct-slice-donut', function(e) {
    if (!isTooltipShown || e.type === 'mouseenter') {
      var $slice = $(this);
      var value = $slice.attr('ct:value');
      var seriesName = $slice.parent().attr('ct:series-name');
      $toolTip
      .html(
        '<strong>' + seriesName + '</strong>: ' +
          value + '%/ ' +
        moneyFormat.to(Number(value) / 100 * income)
      )
      .show();
      isTooltipShown = true;
    } else {
      $toolTip.hide();
      isTooltipShown = false;
    }
  });

  $chart.on('mouseleave', '.ct-slice-donut', function() {
    $toolTip.hide();
  });

  $chart.on('click mousemove', function(event) {
    $toolTip.css({
      left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
      top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 30
    });
  });
};

var showDetailed = function(data) {
  var detailsNames = ['Food at home', 'Food away from home', 'Housing', 'Misc Housing Related', 'Utilities, fuels, public services', 'Apparel & services', 'Trasportation', 'Healthcare', 'Entertainment & Reading', 'Education', 'Miscellaneous'];
  var expenses = data.expenses;

  if(!Array.isArray(expenses)) {
    helpers.makeError('params', data);
  }

  var detailTemplate =
    '<li class="detail">' +
      '<span class="detail__name">{name}</span>' +
      '<span class="value-wrapper">' +
        '<input class="detail__value" type="number" value="{value}" name="{name}" >' +
      '</span>' +
    '</li>';

  stateMap.detailsList.innerHTML = getDetailsList(detailTemplate, detailsNames, expenses);
};

var showDetailsSum = function(data) {
  var sum = data.sum;

  if(!helpers.isNumber(sum)) {
    helpers.makeError('params', data);
  }

  stateMap.detailsSum.textContent = sum;
  stateMap.detailsSavings.textContent = 100 - sum;
};

var showSliders = function(data) {
  var basicRate = data.basicRate;
  var discRate = data.discRate;
  var currentSavings = data.currentSavings;

  //We check data are all numbers by summing them
  if(typeof (basicRate + discRate + currentSavings) !== 'number') {
    helpers.makeError('params', data);
  }

  var basicOptions = {
    start: basicRate,
    step: 1,
    range: {
      'min': 1,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  };
  var discOptions = {
    start: discRate,
    step: 1,
    range: {
      'min': 1,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  };
  var savingsOptions = {
    start: currentSavings,
    step: 1000,
    range: {
      'min': 1000,
      'max': 500000
    },
    format: wNumb({
      decimals: 1,
      thousand: ','
    })
  };

  domHelpers.createSlider(stateMap.basicSlider, basicOptions, '%');
  domHelpers.createSlider(stateMap.expensesSlider, discOptions, '%');
  domHelpers.createSlider(stateMap.savingsSlider, savingsOptions, '$');
};

var showPieChart = function(data) {
  var income = data.income;
  var basicRate = data.basicRate;
  var discRate = data.discRate;
  var savingsRate = 100 - basicRate - discRate;

  //We check data are all numbers by summing them
  if(typeof savingsRate !== 'number') {
    helpers.makeError('params', data);
  }

  var pieData = {
    series: [
      {
        value: basicRate,
        name: 'Basic Needs'
      },
      {
        value: discRate,
        name: 'Discretionary'
      },
      {
        value: savingsRate,
        name: 'Savings'
      }
    ]
  };
  var pieOptions = {
    donut: true,
    donutWidth: 20,
    chartPadding: 10,
    labelOffset: 50,
    width: '220px',
    height: '220px'
  };
  var pieResponsiveOptions = [
    ['screen and (max-width: 480px)', {
      donutWidth: 30,
      width: '280px',
      height: '280px'
    }]
  ];

  stateMap.$pieChart = new Chartist.Pie(stateMap.chartNode, pieData, pieOptions, pieResponsiveOptions);
  createPieTooltip(stateMap.chartNode, income);
};

/**
 * Used by shell to set the sliders values when data is changed on some other
 * screens.
 * @param {object} data Object with sliderName and value properties
 */
var setSlider = function(data) {
  var sliderName = data.sliderName;
  var value = data.value;

  if( (typeof sliderName !== 'string') || (typeof value !== 'number') ) {
    helpers.makeError('params', data);
  }

  if (sliderName === 'basic') {
    stateMap.basicSlider.noUiSlider.set(value);
  } else if (sliderName === 'discretionary') {
    stateMap.expensesSlider.noUiSlider.set(value);
  }
};

var updateDetailsSum = function() {
  var values = Array.prototype.map.call(stateMap.detailsInputs, function(input) {
    return Number(input.value);
  });
  var detailsSum = sum(values);
  showDetailsSum({sum: detailsSum});
};

/**
 * Update the view of the Doughnut when sliders values change
 * @param {object} rates Object with the new rates
 * @example
 * updatePieChart({
 *   basicRate: 30,
 *   discRate: 40,
 *   savingsRate: 30
 * })
 */
var updatePieChart = function(rates) {
  var updatedData = {
    series: [
      {
        value: rates.basicRate,
        name: 'Basic Needs'
      },
      {
        value: rates.discRate,
        name: 'Discretionary'
      },
      {
        value: rates.savingsRate,
        name: 'Savings'
      }
    ]
  };
  stateMap.$pieChart.update(updatedData);
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * Used by shell to bind event handlers to this module DOM events. It usually
 * means that we want the shell to update model when user interacts with this
 * screen.
 * @param  {string} event Event name
 * @param  {function} handler Event handler
 */
var bind = function(event, handler) {
  switch (event) {
    case 'basicRateChanged':
      stateMap.basicSlider.noUiSlider.on('set', function(values) {
        handler( Number(values[0]) );
      });
      break;
    case 'discRateChanged':
      stateMap.expensesSlider.noUiSlider.on('set', function(values) {
        handler( Number(values[0]) );
      });
      break;
    case 'currentSavingsChanged':
      stateMap.savingsSlider.noUiSlider.on('set', function(values) {
        handler(Number(values[0].replace(',', '')));
      });
      break;
    case 'detailsChanged':
      stateMap.detailsList.addEventListener('change', updateDetailsSum);
      break;
    case 'detailsReset':
      stateMap.detailsReset.addEventListener('click', handler);
      break;
    case 'detailsSaved':
      stateMap.saveDetails.addEventListener('click', function() {
        var values = Array.prototype.map.call(stateMap.detailsInputs, function(input) {
          return Number(input.value);
        });
        var valid = areNotZero(values) && (sum(values) <= 100);
        if(valid) {
          handler(null, values);
          stateMap.$modal.modal('hide');
        } else {
          handler(new Error('Values must not be zeros and their sum not superior 100'), null);
        }
      });
      break;
    default:
      return;
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showSliders':
      showSliders(data);
      break;
    case 'showPieChart':
      showPieChart(data);
      break;
    case 'showDetailed':
      showDetailed(data);
      stateMap.detailsInputs = stateMap.detailsList.getAll('detail__value');
      var inputsValues = Array.prototype.map.call(stateMap.detailsInputs, function(input) {
        return Number(input.value);
      });
      showDetailsSum({
        sum: sum(inputsValues)
      });
      break;
    case 'setSlider':
      setSlider(data);
      break;
    case 'updatePieChart':
      updatePieChart(data);
      break;
    case 'updatePieTooltip':
      createPieTooltip(stateMap.chartNode, data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  window.sum = sum;
  stateMap.basicSlider = container.get('slider--needs');
  stateMap.expensesSlider = container.get('slider--expenses');
  stateMap.savingsSlider = container.get('current-savings__slider');

  stateMap.chartNode = container.get('summary__chart');

  stateMap.$modal = $('#details-modal');
  stateMap.detailsList = container.get('details-values');
  stateMap.detailsReset = container.get('reset-detailed');
  stateMap.detailsSum = container.get('details-sum');
  stateMap.detailsSavings = container.get('details-savings');
  stateMap.saveDetails = container.get('save-detailed-expense');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../dom-helpers":13,"../helpers":14,"chartist":32}],26:[function(require,module,exports){
(function (global){
/**
 * Screen #7 - Goal module
 * @module 7-Goal
 */

'use strict';

var helpers = require('../helpers');
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var dragula = require('dragula');

var configMap = {
  toggleButtons: 'toggle-goal',
  datepicker: '.goal__date__picker'
};

var stateMap = {
  freeGoals: null,
  pickedGoals: null,
  toggleButtons: null
};


///////////////
// TEMPLATES //
///////////////

/**
 * Templates for goals to be picked and the picked one. We are using templates
 * here in Javascript instead of putting it directly into HTML files because
 * it's easier to generate and manipulate them dinamically based on the Model.
 * @type {string}
 */
var freeGoalTemplate =
  '<div class="goal goal--{id} {picked}">' +
    '<div class="goal__details">' +
      '<p class="goal__title">{title}</p>' +
      '<span class="goal__date" data-placement="bottom" data-toggle="tooltip" title="Expected achievement date based on your data">' +
        '<i class="zmdi zmdi-calendar-alt"></i>' +
        '<span>{date}</span>' +
      '</span>' +
      '<span class="goal__success" data-placement="bottom" data-toggle="tooltip" title="Expected achievement probability based on your data">' +
        '<i class="zmdi zmdi-chart"></i>' +
        '<span>{probability}</span>' +
      '</span>' +
    '</div>' +
    '<i class="toggle-goal add-goal zmdi zmdi-plus-circle" data-goal="{id}"></i>' +
  '</div>';
var pickedGoalTemplate =
  '<div class="picked picked--{id} {picked}">' +
    '<div class="picked__details">' +
      '<div class="dragger"></div>' +
      '<p class="picked__title">{title}</p>' +
      '<p class="picked__date">' +
        '<i class="zmdi zmdi-calendar-alt"></i>' +
        '<input class="goal__date__picker" type="text" value="{date}" readonly>' +
        '<i class="zmdi zmdi-edit"></i>' +
      '</p>' +
      '<p class="picked__success"><i class="zmdi zmdi-chart"></i>{probability}</p>' +
    '</div>' +
    '<i class="toggle-goal delete-goal zmdi zmdi-minus-circle" data-goal="{id}"></i>' +
  '</div>';

/*
 * Generates the HTML list of goals to be picked. If the goal is already picked
 * we add a CSS class to hide it. In this way it's faster to hide/show goals in
 * both lists (to be picked & already picked) when the user interacts and moreover
 * we avoid recreating DOM for the goals each time.
 * @param  {array} goalsList List of available goals
 * @param  {array} pickedGoals Goals already picked by the user
 * @return {string}
 */
var getListGoals = function(goalsList, pickedGoals, template, className) {
  var view = '';

  goalsList.forEach(function(goal) {
    var goalClassName = '';
    var isPicked = pickedGoals.find(function(pickedGoal) {
      return pickedGoal.id === goal.id;
    });

    if (isPicked) {
      goalClassName = className;
    }

    view += helpers.template(template, {
      id: goal.id,
      title: goal.title,
      picked: goalClassName,
      date: goal.date,
      probability: goal.probability
    });
  });

  return view;
};


//////////////////////
// RENDER FUNCTIONS //
//////////////////////

var showGoals = function(data) {
  var goalsList = data.goalsList;
  var pickedGoals = data.pickedGoals;

  if( !Array.isArray(goalsList) || !Array.isArray(pickedGoals) ) {
    helpers.makeError('params', data);
  }

  var freeGoalsView = getListGoals(goalsList, pickedGoals, freeGoalTemplate, 'goal--hide');
  var pickedGoalsView = getListGoals(goalsList, pickedGoals, pickedGoalTemplate, 'picked--show');
  stateMap.freeGoals.innerHTML = freeGoalsView;
  stateMap.pickedGoals.innerHTML = pickedGoalsView;
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  if (event === 'goalToggled') {
    /**
     * Every time a button to add/remove a goal (in both lists) is clicked
     * we toggle the visibility of the goal and call the shell's function to
     * update the Model
     */
    stateMap.toggleButtons.forEach(function(element) {
      /* @FIXME This could need an improvement with 'Event Delegation' if the
        number of goals increase because we are adding an Event Listener to each
        goal */
      element.addEventListener('click', function() {
        var goalName = this.dataset.goal;
        var toggledGoal = stateMap.pickedGoals.get('picked--' + goalName);
        var date = toggledGoal.querySelector(configMap.datepicker).value;

        toggledGoal.classList.toggle('picked--show');
        stateMap.freeGoals.get('goal--' + goalName).classList.toggle('goal--hide');

        handler({
          id: goalName,
          date: date
        });
      });
    });
  }
};

var setStateMap = function(container) {
  stateMap.freeGoals = container.get('goals');
  stateMap.pickedGoals = container.get('picked-goals');

  stateMap.toggleButtons = container.getAll(configMap.toggleButtons);
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showGoals':
      showGoals(data);
      break;
    case 'createTooltips':
      $('.goal__details > span').tooltip();
      break;
    case 'setDragDrop':
      dragula([stateMap.pickedGoals]);
      break;
    case 'createDatepickers':
      $(configMap.datepicker).datepicker({
        autoclose: true,
        format: 'M d yyyy'
      });
      break;
    default:
      console.error('No command found.');
      return;
  }
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../helpers":14,"dragula":39}],27:[function(require,module,exports){
'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');

var stateMap = {
  nav: null
};


///////////////////
// DOM FUNCTIONS //
///////////////////

var activateNav = function(stepName) {
  if(typeof stepName !== 'string') {
    helpers.makeError('params', stepName);
  }

  var newActiveLink = stateMap.nav.get('step-name--' + stepName).parentNode;

  //Activate the navigation item
  if(newActiveLink.classList.contains('disabled')) {
    newActiveLink.classList.remove('disabled');
  }

  domHelpers.setActive(newActiveLink, 'active');
};

var activateStep = function(stepName) {
  if(typeof stepName !== 'string') {
    helpers.makeError('params', stepName);
  }

  var nextStepWrapper = document.get('step--' + stepName);
  domHelpers.setActive(nextStepWrapper, 'show');
};

var bindLinkClicked = function(e, handler) {
  var nodeName = e.target.nodeName;
  var nextStepName, clickedLink;

  //If it is the 'Reset Model' button
  if (nodeName === 'A') {
    return;
  }

  if (nodeName === 'SPAN') {
    nextStepName = e.target.dataset.template;
    clickedLink = e.target.parentNode;
  } else if (nodeName === 'LI') {
    nextStepName = e.target.firstElementChild.dataset.template;
    clickedLink = e.target;
  }

  if ( clickedLink && !clickedLink.classList.contains('disabled')) {
    domHelpers.setActive(clickedLink, 'active');
    activateStep(nextStepName);
    handler(nextStepName);
  }
};

/**
 * Adds 'disabled' class to navigation links from the item number 'start'
 * @param  {object} data Object with the number of the first link to start with
 */
var disableLinks = function(data) {
  var lastUserStep = data.lastUserStep;

  if(typeof lastUserStep !== 'number') {
    helpers.makeError('params', lastUserStep);
  }

  var navItems = stateMap.nav.getElementsByTagName('li');

  //We disable links after the last one seen by user in previous session
  for (var i = lastUserStep, len = navItems.length; i < len; i++) {
    navItems[i].classList.add('disabled');
  }
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if(event === 'linkClicked') {
    stateMap.nav.addEventListener('click', function(e) {
      bindLinkClicked(e, handler);
    });
  }
};

var setStateMap = function() {
  stateMap.nav = document.get('nav');
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'activateStep':
      activateStep(data.stepName);
      activateNav(data.stepName);
      break;
    case 'disableLinks':
      disableLinks(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};
},{"../dom-helpers":13,"../helpers":14}],28:[function(require,module,exports){
(function (global){
/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */

'use strict';

var helpers = require('../helpers');
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var stateMap = {
  tbody: null
};

var actionTemplate = '<tr><td><i class="zmdi zmdi-check-circle saved" data-action="{index}"></i></td>' +
  '<td>{toDo}</td>' +
  '<td>{notToDo}</td>' +
  '<td><a class="zmdi zmdi-info-outline" data-toggle="popover" data-placement="left" data-content="{details}" tabindex="0" role="button"></a></td></tr>';


///////////////////
// DOM FUNCTIONS //
///////////////////

/**
 * Returns the markup for the goals
 * @param  {object} goal Object map with goal properties and its actions
 * @return {string}
 */
var getActionsHTML = function(goal) {
  var id = goal.id;
  var actions = goal.actions;
  var title = goal.title;
  var markup = '';

  if( (typeof id !== 'string') || (typeof actions !== 'object') ) {
    helpers.makeError('params', goal);
  }

  markup +=
    '<tr class="' + id + '">' +
      '<td colspan="4"><h4>' + title + '</h4></td>' +
    '</tr>';

  actions.forEach(function(action) {
    var details = action.details.reduce(function(prev, cur) {
      return prev + '<li>' + cur + '</li>';
    }, '');

    details = '<ul>' + details + '</ul>';
    markup += helpers.template(actionTemplate, {
      id: id,
      index: action.id,
      toDo: action.toDo,
      notToDo: action.notToDo,
      details: details
    });
  });

  return markup;
};


//////////////////////
// RENDER FUNCTIONS //
//////////////////////

var showGoalsActions = function(data) {
  var goals = data;
  if(!Array.isArray(goals)) {
    helpers.makeError('params', goals);
  }

  if(goals.length == 0) {
    return;
  }

  var actionsHTML = '';

  goals.forEach(function(goal) {
    actionsHTML += getActionsHTML(goal);
  });

  stateMap.tbody.innerHTML = actionsHTML;
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'actionToggled') {
    stateMap.tbody.addEventListener('click', function(event) {
      var target = event.target;
      if (target.nodeName === 'I' && target.classList.contains('zmdi-check-circle')) {
        target.classList.toggle('saved');
        console.log(target.dataset.action);
      }
    });
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showGoalsActions':
      showGoalsActions(data);
      break;
    case 'createPopovers':
      $('.step--plan .zmdi-info-outline').popover({
        html: true,
        title: 'Details',
        trigger: 'focus'
      });
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.tbody = container.getElementsByTagName('tbody')[0];
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../helpers":14}],29:[function(require,module,exports){
(function (global){
/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */
'use strict';

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var stateMap = {
  actionTitles: null,
  printButton: null
};

/**
 * DOM FUNCTIONS
 */

var printPlan = function() {
  var printPage = document.createElement('div'),
    html = '<h1 class="text-center">Your Action Plan</h1>';

  printPage.classList.add('print-page');

  var planActions = [{
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }];

  var tHead = '<table class="table"><thead><tr><th>Title</th><th>type</th><th>Date</th><th>Details</th></tr></thead>',
    tBody = '<tbody>';

  for (var i = 0, len = planActions.length; i < len; i++) {
    tBody += '<tr><td>' + planActions[i].title + '</td>' +
      '<td>' + planActions[i].type + '</td>' +
      '<td>' + planActions[i].date + '</td>' +
      '<td>' + planActions[i].details + '</td><tr>';
  }

  tBody += '</tbody></table>';
  html += tHead + tBody;

  printPage.innerHTML = html;
  document.body.appendChild(printPage);
  document.body.classList.add('no-print');

  window.print();

  document.body.classList.remove('no-print');
  printPage.innerHTML = '';
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  if(event === 'printClicked') {
    stateMap.printButton.addEventListener('click', function() {
      handler();
    });
  }
};

var render = function(cmd) {
  switch(cmd) {
    case 'createPopovers':
      $('.plan-wrapper .zmdi-info-outline').popover({
        placement: 'left'
      });
      break;
    case 'createDatepickers':
      $('.plan-wrapper .zmdi-calendar-alt')
        .datepicker({
          autoclose: true,
          format: 'M d yyyy'
        })
        .on('changeDate', function(event) {
          this.dataset.date = event.format();
        });
      break;
    case 'printPlan':
      printPlan();
      break;
  }
};

var setStateMap = function(container) {
  stateMap.actionTitles = container.getAll('action__title');
  stateMap.printButton = container.get('print');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],30:[function(require,module,exports){
(function (global){
/**
 * Screen #6 - Scenarios module
 * @module 6-Scenarios
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);
var Chartist = require('chartist');

var stateMap = {
  incomeSlider: null,
  investmentRateSlider: null,
  retirementSlider: null,

  investmentStyle: null,
  lineChart: null,
  retirementSavings: null
};


///////////////////////
// HELPERS FUNCTIONS //
///////////////////////

var moneyFormat = wNumb({
  thousand: ','
});

/**
 * returns the annualInterestRate relative to a given investment style
 * @param  {string} investmentStyle   Style of investment
 * @return {number} annualInterestRate
 */
var getInterestByInvestment = function(investmentStyle) {
  if(typeof investmentStyle !== 'string') {
    helpers.makeError('params', investmentStyle);
  }

  var annualInterestRate;

  switch (investmentStyle) {
    case 'safe':
      annualInterestRate = 0.02;
      break;
    case 'moderate':
      annualInterestRate = 0.06;
      break;
    case 'risky':
      annualInterestRate = 0.15;
      break;
    default:
      annualInterestRate = 0.06;
  }

  return annualInterestRate;
};

/**
 * Returns the accumulated money with the compound interest
 * @param  {number} interestRate % of interest (from 0 to 1)
 * @param  {number} term Years
 * @param  {number} amtInvested Initial investment
 * @param  {number} contribAmt Yearly contribution
 * @return {number}
 */
var getAccumulatedValue = function(interestRate, term, amtInvested, contribAmt) {
  var app = [];
  app[0] = amtInvested;
  var total = 0;
  var monthlyTerm = term * 12;
  var monthlyContribAmt = contribAmt / 12;

  for (var i = 1; i <= monthlyTerm; i++) {
    var appreciation = (interestRate / 12) * (app[i - 1]);
    app[i] = appreciation + app[i - 1] + monthlyContribAmt;
    total = app[i - 1];
  }
  app = null;
  return Math.round(total);
};


/**
 * Returns an array containing the values for x axis ticks. You pass the first
 * and last values as parameters and it returns also the other values of the range.
 * In our case it's used to show the savings progress as the years increase
 * towards the retirement age.
 * @param  {Number} firstValue First value of the axis
 * @param  {Number} lastValue Last value of the axis
 * @return {Array}
 */
var getXTicks = function(firstValue, lastValue) {
  if(!helpers.isNumber(firstValue + lastValue)) {
    helpers.makeError('params', {firstValue: firstValue, lastValue: lastValue});
  }

  var values = [];
  //First and last values must be precise
  values[0] = firstValue;
  values[5] = lastValue;

  var difference = (lastValue - firstValue) / 5;
  for (var i = 1; i < 5; i++) {
    values[i] = Math.round(firstValue + (difference * i));
  }

  return values;
};

/**
 * Returns an array with the Y axis values
 * @param  {object} data Object with data needed for the calculation
 * @return {array} serie Array with Y axis values
 * @example
 * getYSerie({
 *   income: 35000,
 *   investmentRate: 100,
 *   savingsRate: 30,
 *   currentSavings: 20000,
 *   xTicks: [23, 33, 43, 53, 63, 73],
 *   annualInterestRate: 0.06
 * })
 */
var getYSerie = function(data) {
  var income = data.income;
  var investmentRate = data.investmentRate;
  var savingsRate = data.savingsRate;
  var currentSavings = data.currentSavings;
  var xTicks = data.xTicks;
  var annualInterestRate =  data.annualInterestRate;

  if(
    !helpers.isNumber(income + investmentRate + savingsRate + currentSavings + annualInterestRate) ||
    !Array.isArray(xTicks)
  ) {
    helpers.makeError('params', data);
  }

  // We are also considering the investment rate in Advanced options.
  // So this is (annualSavings * investmentRate) to be precise.
  var annualSavings = (savingsRate / 100) * income * (investmentRate / 100);

  var i = 0;
  var serie = [];

  //We are settings the first Y value of the line chart, which corresponds
  //to the initial investment.
  serie[0] = currentSavings;

  //We calculate the other values of Y serie with the Compound interest function
  for (i = 1; i < 6; i+= 1) {
    serie[i] = getAccumulatedValue(
      annualInterestRate,
      xTicks[i] - xTicks[0],
      currentSavings,
      annualSavings
    );
  }

  return serie;
};

var updateRetirementSavings = function(retirementSavings) {
  stateMap.retirementSavings.childNodes[1].textContent = moneyFormat.to(retirementSavings);
};

//////////////////////
// RENDER FUNCTIONS //
//////////////////////


var showSliders = function(data) {
  var income = data.income;
  var savingsRate = data.savingsRate;

  //We check data are all numbers by summing them
  if(!helpers.isNumber(income + savingsRate)) {
    helpers.makeError('params', data);
  }

  var savingRateOptions = {
    start: savingsRate,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  };
  var incomeOptions = {
    start: income,
    step: 1000,
    range: {
      'min': 18000,
      'max': 200000
    },
    format: wNumb({
      decimals: 1,
      thousand: ','
    })
  };

  var investmentOptions = {
    start: 100,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  };
  var retirementOptions = {
    start: 65,
    step: 1,
    range: {
      'min': 55,
      'max': 75
    },
    format: wNumb({
      decimals: 0
    })
  };

  domHelpers.createSlider(stateMap.savingRateSlider, savingRateOptions, '%');
  domHelpers.createSlider(stateMap.incomeSlider, incomeOptions, '$');
  domHelpers.createSlider(stateMap.investmentRateSlider, investmentOptions, '%');
  domHelpers.createSlider(stateMap.retirementSlider, retirementOptions);
};

var showLineChart = function(data) {
  var age = data.age;
  var income = data.income;
  var savingsRate = data.savingsRate;
  var currentSavings = data.currentSavings;

  if(!helpers.isNumber(age + income + savingsRate + currentSavings)) {
    helpers.makeError('params', data);
  }

  var annualInterestRate = 0.06;
  var investmentRate = Number( stateMap.investmentRateSlider.noUiSlider.get() );
  var retirementAge = Number( stateMap.retirementSlider.noUiSlider.get() );
  var xTicks = getXTicks(age, retirementAge);
  var ySerie = getYSerie({
    income: income,
    investmentRate: investmentRate,
    savingsRate: savingsRate,
    currentSavings: currentSavings,
    xTicks: xTicks,
    annualInterestRate: annualInterestRate
  });
  var chartData = {
    labels: xTicks,
    series: [ySerie]
  };
  var chartOptions = {
    axisY: {
      labelInterpolationFnc: function(value) {
        return (value/1000) + 'K';
      },
      high: 2000000,
      ticks: [currentSavings, 250000, 500000, 750000, 1000000, 1250000, 1500000, 1750000, 2000000],
      type: Chartist.FixedScaleAxis
    },
    showArea: true,
    width: '400px',
    height: '250px'
  };
  var responsiveOptions = [
    ['screen and (max-width: 480px)', {
      width: '300px'
    }]
  ];

  stateMap.lineChart = new Chartist.Line('.scenario__chart', chartData, chartOptions, responsiveOptions);
  updateRetirementSavings(ySerie[5]);
};

/**
 * Used by shell to set the sliders values when data is changed on some other
 * screens.
 * @param {object} data Object with sliderName and value properties
 */
var setSlider = function(data) {
  var sliderName = data.sliderName;
  var value = data.value;

  if( (typeof sliderName !== 'string') || (typeof value !== 'number') ) {
    helpers.makeError('params', data);
  }

  if (sliderName === 'income') {
    stateMap.incomeSlider.noUiSlider.set(value);
  } else if (sliderName === 'savingsRate') {
    stateMap.savingRateSlider.noUiSlider.set(value);
  }
};

/**
 * Updates the line chart with a new Y serie when user changes investment style
 * @param  {object} data Object with the data needed to calculate the serie
 * @example
 * updateLineChartSerie({
 *   income: 30000,
 *   investmentRate: 100, //optional
 *   savingsRate: 30,
 *   annualInterestRate: 0.06, //optional
 *   age: 20,
 *   retirementAge: 65, //optional
 *   currentSavings: 20000
 * })
 */
var updateLineChartSerie = function(data) {
  var lineChart = stateMap.lineChart;
  var chartData = lineChart.data;
  var chartOptions = lineChart.options;

  var age = data.age;
  var investmentRate = data.investmentRate || Number( stateMap.investmentRateSlider.noUiSlider.get() );
  var annualInterestRate = data.annualInterestRate || getInterestByInvestment( stateMap.investmentStyle.querySelector('input:checked').value );
  var retirementAge = data.retirementAge || Number( stateMap.retirementSlider.noUiSlider.get() ) ;
  var xTicks = getXTicks(age, retirementAge);

  if(!Array.isArray(xTicks)) {
    helpers.makeError('params', data);
  }

  var ySerie = getYSerie({
    income: data.income,
    investmentRate: investmentRate,
    savingsRate: data.savingsRate,
    annualInterestRate: annualInterestRate,
    currentSavings: data.currentSavings,
    xTicks: xTicks
  });

  chartData.labels = xTicks;
  chartData.series[0] = ySerie;
  chartOptions.axisY.ticks[0] = data.currentSavings;

  lineChart.update(chartData, chartOptions);
  updateRetirementSavings(ySerie[5]);
};


//////////////////////
// PUBLiC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  switch(event) {
    case 'annualInterestRateChanged':
      stateMap.investmentStyle.addEventListener('change', function(e) {
        handler( getInterestByInvestment(e.target.value) );
      });
      break;
    case 'savingsRateChanged':
      stateMap.savingRateSlider.noUiSlider.on('set', function(values) {
        handler(Number(values[0]));
      });
      break;
    case 'incomeChanged':
      stateMap.incomeSlider.noUiSlider.on('set', function(values) {
        var income = Number(values[0].replace(',', ''));
        handler(income);
      });
      break;
    case 'investmentRateChanged':
      stateMap.investmentRateSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0]));
      });
      break;
    case 'retirementAgeChanged':
      stateMap.retirementSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0]));
      });
      break;
    default:
      console.error('No bind event found.');
      return;
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'setSlider':
      setSlider(data);
      break;
    case 'showSliders':
      showSliders(data);
      break;
    case 'showLineChart':
      showLineChart(data);
      break;
    case 'updateLineChartSerie':
      updateLineChartSerie(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.savingRateSlider = container.get('option__slider--saving');
  stateMap.incomeSlider = container.get('option__slider--income');
  stateMap.investmentRateSlider = container.get('option__slider--investment');
  stateMap.retirementSlider = container.get('option__slider--retirement');

  stateMap.investmentStyle = container.get('investment');

  stateMap.retirementSavings = container.get('savings__amount');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../dom-helpers":13,"../helpers":14,"chartist":32}],31:[function(require,module,exports){
module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }

},{}],32:[function(require,module,exports){
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (root['Chartist'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Chartist'] = factory();
  }
}(this, function () {

/* Chartist.js 0.9.5
 * Copyright © 2015 Gion Kunz
 * Free to use under the WTFPL license.
 * http://www.wtfpl.net/
 */
/**
 * The core module of Chartist that is mainly providing static functions and higher level functions for chart modules.
 *
 * @module Chartist.Core
 */
var Chartist = {
  version: '0.9.5'
};

(function (window, document, Chartist) {
  'use strict';

  /**
   * Helps to simplify functional style code
   *
   * @memberof Chartist.Core
   * @param {*} n This exact value will be returned by the noop function
   * @return {*} The same value that was provided to the n parameter
   */
  Chartist.noop = function (n) {
    return n;
  };

  /**
   * Generates a-z from a number 0 to 26
   *
   * @memberof Chartist.Core
   * @param {Number} n A number from 0 to 26 that will result in a letter a-z
   * @return {String} A character from a-z based on the input number n
   */
  Chartist.alphaNumerate = function (n) {
    // Limit to a-z
    return String.fromCharCode(97 + n % 26);
  };

  /**
   * Simple recursive object extend
   *
   * @memberof Chartist.Core
   * @param {Object} target Target object where the source will be merged into
   * @param {Object...} sources This object (objects) will be merged into target and then target is returned
   * @return {Object} An object that has the same reference as target but is extended and merged with the properties of source
   */
  Chartist.extend = function (target) {
    target = target || {};

    var sources = Array.prototype.slice.call(arguments, 1);
    sources.forEach(function(source) {
      for (var prop in source) {
        if (typeof source[prop] === 'object' && source[prop] !== null && !(source[prop] instanceof Array)) {
          target[prop] = Chartist.extend({}, target[prop], source[prop]);
        } else {
          target[prop] = source[prop];
        }
      }
    });

    return target;
  };

  /**
   * Replaces all occurrences of subStr in str with newSubStr and returns a new string.
   *
   * @memberof Chartist.Core
   * @param {String} str
   * @param {String} subStr
   * @param {String} newSubStr
   * @return {String}
   */
  Chartist.replaceAll = function(str, subStr, newSubStr) {
    return str.replace(new RegExp(subStr, 'g'), newSubStr);
  };

  /**
   * Converts a number to a string with a unit. If a string is passed then this will be returned unmodified.
   *
   * @memberof Chartist.Core
   * @param {Number} value
   * @param {String} unit
   * @return {String} Returns the passed number value with unit.
   */
  Chartist.ensureUnit = function(value, unit) {
    if(typeof value === 'number') {
      value = value + unit;
    }

    return value;
  };

  /**
   * Converts a number or string to a quantity object.
   *
   * @memberof Chartist.Core
   * @param {String|Number} input
   * @return {Object} Returns an object containing the value as number and the unit as string.
   */
  Chartist.quantity = function(input) {
    if (typeof input === 'string') {
      var match = (/^(\d+)\s*(.*)$/g).exec(input);
      return {
        value : +match[1],
        unit: match[2] || undefined
      };
    }
    return { value: input };
  };

  /**
   * This is a wrapper around document.querySelector that will return the query if it's already of type Node
   *
   * @memberof Chartist.Core
   * @param {String|Node} query The query to use for selecting a Node or a DOM node that will be returned directly
   * @return {Node}
   */
  Chartist.querySelector = function(query) {
    return query instanceof Node ? query : document.querySelector(query);
  };

  /**
   * Functional style helper to produce array with given length initialized with undefined values
   *
   * @memberof Chartist.Core
   * @param length
   * @return {Array}
   */
  Chartist.times = function(length) {
    return Array.apply(null, new Array(length));
  };

  /**
   * Sum helper to be used in reduce functions
   *
   * @memberof Chartist.Core
   * @param previous
   * @param current
   * @return {*}
   */
  Chartist.sum = function(previous, current) {
    return previous + (current ? current : 0);
  };

  /**
   * Multiply helper to be used in `Array.map` for multiplying each value of an array with a factor.
   *
   * @memberof Chartist.Core
   * @param {Number} factor
   * @returns {Function} Function that can be used in `Array.map` to multiply each value in an array
   */
  Chartist.mapMultiply = function(factor) {
    return function(num) {
      return num * factor;
    };
  };

  /**
   * Add helper to be used in `Array.map` for adding a addend to each value of an array.
   *
   * @memberof Chartist.Core
   * @param {Number} addend
   * @returns {Function} Function that can be used in `Array.map` to add a addend to each value in an array
   */
  Chartist.mapAdd = function(addend) {
    return function(num) {
      return num + addend;
    };
  };

  /**
   * Map for multi dimensional arrays where their nested arrays will be mapped in serial. The output array will have the length of the largest nested array. The callback function is called with variable arguments where each argument is the nested array value (or undefined if there are no more values).
   *
   * @memberof Chartist.Core
   * @param arr
   * @param cb
   * @return {Array}
   */
  Chartist.serialMap = function(arr, cb) {
    var result = [],
        length = Math.max.apply(null, arr.map(function(e) {
          return e.length;
        }));

    Chartist.times(length).forEach(function(e, index) {
      var args = arr.map(function(e) {
        return e[index];
      });

      result[index] = cb.apply(null, args);
    });

    return result;
  };

  /**
   * This helper function can be used to round values with certain precision level after decimal. This is used to prevent rounding errors near float point precision limit.
   *
   * @memberof Chartist.Core
   * @param {Number} value The value that should be rounded with precision
   * @param {Number} [digits] The number of digits after decimal used to do the rounding
   * @returns {number} Rounded value
   */
  Chartist.roundWithPrecision = function(value, digits) {
    var precision = Math.pow(10, digits || Chartist.precision);
    return Math.round(value * precision) / precision;
  };

  /**
   * Precision level used internally in Chartist for rounding. If you require more decimal places you can increase this number.
   *
   * @memberof Chartist.Core
   * @type {number}
   */
  Chartist.precision = 8;

  /**
   * A map with characters to escape for strings to be safely used as attribute values.
   *
   * @memberof Chartist.Core
   * @type {Object}
   */
  Chartist.escapingMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;'
  };

  /**
   * This function serializes arbitrary data to a string. In case of data that can't be easily converted to a string, this function will create a wrapper object and serialize the data using JSON.stringify. The outcoming string will always be escaped using Chartist.escapingMap.
   * If called with null or undefined the function will return immediately with null or undefined.
   *
   * @memberof Chartist.Core
   * @param {Number|String|Object} data
   * @return {String}
   */
  Chartist.serialize = function(data) {
    if(data === null || data === undefined) {
      return data;
    } else if(typeof data === 'number') {
      data = ''+data;
    } else if(typeof data === 'object') {
      data = JSON.stringify({data: data});
    }

    return Object.keys(Chartist.escapingMap).reduce(function(result, key) {
      return Chartist.replaceAll(result, key, Chartist.escapingMap[key]);
    }, data);
  };

  /**
   * This function de-serializes a string previously serialized with Chartist.serialize. The string will always be unescaped using Chartist.escapingMap before it's returned. Based on the input value the return type can be Number, String or Object. JSON.parse is used with try / catch to see if the unescaped string can be parsed into an Object and this Object will be returned on success.
   *
   * @memberof Chartist.Core
   * @param {String} data
   * @return {String|Number|Object}
   */
  Chartist.deserialize = function(data) {
    if(typeof data !== 'string') {
      return data;
    }

    data = Object.keys(Chartist.escapingMap).reduce(function(result, key) {
      return Chartist.replaceAll(result, Chartist.escapingMap[key], key);
    }, data);

    try {
      data = JSON.parse(data);
      data = data.data !== undefined ? data.data : data;
    } catch(e) {}

    return data;
  };

  /**
   * Create or reinitialize the SVG element for the chart
   *
   * @memberof Chartist.Core
   * @param {Node} container The containing DOM Node object that will be used to plant the SVG element
   * @param {String} width Set the width of the SVG element. Default is 100%
   * @param {String} height Set the height of the SVG element. Default is 100%
   * @param {String} className Specify a class to be added to the SVG element
   * @return {Object} The created/reinitialized SVG element
   */
  Chartist.createSvg = function (container, width, height, className) {
    var svg;

    width = width || '100%';
    height = height || '100%';

    // Check if there is a previous SVG element in the container that contains the Chartist XML namespace and remove it
    // Since the DOM API does not support namespaces we need to manually search the returned list http://www.w3.org/TR/selectors-api/
    Array.prototype.slice.call(container.querySelectorAll('svg')).filter(function filterChartistSvgObjects(svg) {
      return svg.getAttributeNS('http://www.w3.org/2000/xmlns/', Chartist.xmlNs.prefix);
    }).forEach(function removePreviousElement(svg) {
      container.removeChild(svg);
    });

    // Create svg object with width and height or use 100% as default
    svg = new Chartist.Svg('svg').attr({
      width: width,
      height: height
    }).addClass(className).attr({
      style: 'width: ' + width + '; height: ' + height + ';'
    });

    // Add the DOM node to our container
    container.appendChild(svg._node);

    return svg;
  };


  /**
   * Reverses the series, labels and series data arrays.
   *
   * @memberof Chartist.Core
   * @param data
   */
  Chartist.reverseData = function(data) {
    data.labels.reverse();
    data.series.reverse();
    for (var i = 0; i < data.series.length; i++) {
      if(typeof(data.series[i]) === 'object' && data.series[i].data !== undefined) {
        data.series[i].data.reverse();
      } else if(data.series[i] instanceof Array) {
        data.series[i].reverse();
      }
    }
  };

  /**
   * Convert data series into plain array
   *
   * @memberof Chartist.Core
   * @param {Object} data The series object that contains the data to be visualized in the chart
   * @param {Boolean} reverse If true the whole data is reversed by the getDataArray call. This will modify the data object passed as first parameter. The labels as well as the series order is reversed. The whole series data arrays are reversed too.
   * @param {Boolean} multi Create a multi dimensional array from a series data array where a value object with `x` and `y` values will be created.
   * @return {Array} A plain array that contains the data to be visualized in the chart
   */
  Chartist.getDataArray = function (data, reverse, multi) {
    // If the data should be reversed but isn't we need to reverse it
    // If it's reversed but it shouldn't we need to reverse it back
    // That's required to handle data updates correctly and to reflect the responsive configurations
    if(reverse && !data.reversed || !reverse && data.reversed) {
      Chartist.reverseData(data);
      data.reversed = !data.reversed;
    }

    // Recursively walks through nested arrays and convert string values to numbers and objects with value properties
    // to values. Check the tests in data core -> data normalization for a detailed specification of expected values
    function recursiveConvert(value) {
      if(Chartist.isFalseyButZero(value)) {
        // This is a hole in data and we should return undefined
        return undefined;
      } else if((value.data || value) instanceof Array) {
        return (value.data || value).map(recursiveConvert);
      } else if(value.hasOwnProperty('value')) {
        return recursiveConvert(value.value);
      } else {
        if(multi) {
          var multiValue = {};

          // Single series value arrays are assumed to specify the Y-Axis value
          // For example: [1, 2] => [{x: undefined, y: 1}, {x: undefined, y: 2}]
          // If multi is a string then it's assumed that it specified which dimension should be filled as default
          if(typeof multi === 'string') {
            multiValue[multi] = Chartist.getNumberOrUndefined(value);
          } else {
            multiValue.y = Chartist.getNumberOrUndefined(value);
          }

          multiValue.x = value.hasOwnProperty('x') ? Chartist.getNumberOrUndefined(value.x) : multiValue.x;
          multiValue.y = value.hasOwnProperty('y') ? Chartist.getNumberOrUndefined(value.y) : multiValue.y;

          return multiValue;

        } else {
          return Chartist.getNumberOrUndefined(value);
        }
      }
    }

    return data.series.map(recursiveConvert);
  };

  /**
   * Converts a number into a padding object.
   *
   * @memberof Chartist.Core
   * @param {Object|Number} padding
   * @param {Number} [fallback] This value is used to fill missing values if a incomplete padding object was passed
   * @returns {Object} Returns a padding object containing top, right, bottom, left properties filled with the padding number passed in as argument. If the argument is something else than a number (presumably already a correct padding object) then this argument is directly returned.
   */
  Chartist.normalizePadding = function(padding, fallback) {
    fallback = fallback || 0;

    return typeof padding === 'number' ? {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    } : {
      top: typeof padding.top === 'number' ? padding.top : fallback,
      right: typeof padding.right === 'number' ? padding.right : fallback,
      bottom: typeof padding.bottom === 'number' ? padding.bottom : fallback,
      left: typeof padding.left === 'number' ? padding.left : fallback
    };
  };

  Chartist.getMetaData = function(series, index) {
    var value = series.data ? series.data[index] : series[index];
    return value ? Chartist.serialize(value.meta) : undefined;
  };

  /**
   * Calculate the order of magnitude for the chart scale
   *
   * @memberof Chartist.Core
   * @param {Number} value The value Range of the chart
   * @return {Number} The order of magnitude
   */
  Chartist.orderOfMagnitude = function (value) {
    return Math.floor(Math.log(Math.abs(value)) / Math.LN10);
  };

  /**
   * Project a data length into screen coordinates (pixels)
   *
   * @memberof Chartist.Core
   * @param {Object} axisLength The svg element for the chart
   * @param {Number} length Single data value from a series array
   * @param {Object} bounds All the values to set the bounds of the chart
   * @return {Number} The projected data length in pixels
   */
  Chartist.projectLength = function (axisLength, length, bounds) {
    return length / bounds.range * axisLength;
  };

  /**
   * Get the height of the area in the chart for the data series
   *
   * @memberof Chartist.Core
   * @param {Object} svg The svg element for the chart
   * @param {Object} options The Object that contains all the optional values for the chart
   * @return {Number} The height of the area in the chart for the data series
   */
  Chartist.getAvailableHeight = function (svg, options) {
    return Math.max((Chartist.quantity(options.height).value || svg.height()) - (options.chartPadding.top +  options.chartPadding.bottom) - options.axisX.offset, 0);
  };

  /**
   * Get highest and lowest value of data array. This Array contains the data that will be visualized in the chart.
   *
   * @memberof Chartist.Core
   * @param {Array} data The array that contains the data to be visualized in the chart
   * @param {Object} options The Object that contains the chart options
   * @param {String} dimension Axis dimension 'x' or 'y' used to access the correct value and high / low configuration
   * @return {Object} An object that contains the highest and lowest value that will be visualized on the chart.
   */
  Chartist.getHighLow = function (data, options, dimension) {
    // TODO: Remove workaround for deprecated global high / low config. Axis high / low configuration is preferred
    options = Chartist.extend({}, options, dimension ? options['axis' + dimension.toUpperCase()] : {});

    var highLow = {
        high: options.high === undefined ? -Number.MAX_VALUE : +options.high,
        low: options.low === undefined ? Number.MAX_VALUE : +options.low
      };
    var findHigh = options.high === undefined;
    var findLow = options.low === undefined;

    // Function to recursively walk through arrays and find highest and lowest number
    function recursiveHighLow(data) {
      if(data === undefined) {
        return undefined;
      } else if(data instanceof Array) {
        for (var i = 0; i < data.length; i++) {
          recursiveHighLow(data[i]);
        }
      } else {
        var value = dimension ? +data[dimension] : +data;

        if (findHigh && value > highLow.high) {
          highLow.high = value;
        }

        if (findLow && value < highLow.low) {
          highLow.low = value;
        }
      }
    }

    // Start to find highest and lowest number recursively
    if(findHigh || findLow) {
      recursiveHighLow(data);
    }

    // Overrides of high / low based on reference value, it will make sure that the invisible reference value is
    // used to generate the chart. This is useful when the chart always needs to contain the position of the
    // invisible reference value in the view i.e. for bipolar scales.
    if (options.referenceValue || options.referenceValue === 0) {
      highLow.high = Math.max(options.referenceValue, highLow.high);
      highLow.low = Math.min(options.referenceValue, highLow.low);
    }

    // If high and low are the same because of misconfiguration or flat data (only the same value) we need
    // to set the high or low to 0 depending on the polarity
    if (highLow.high <= highLow.low) {
      // If both values are 0 we set high to 1
      if (highLow.low === 0) {
        highLow.high = 1;
      } else if (highLow.low < 0) {
        // If we have the same negative value for the bounds we set bounds.high to 0
        highLow.high = 0;
      } else {
        // If we have the same positive value for the bounds we set bounds.low to 0
        highLow.low = 0;
      }
    }

    return highLow;
  };

  /**
   * Checks if the value is a valid number or string with a number.
   *
   * @memberof Chartist.Core
   * @param value
   * @returns {Boolean}
   */
  Chartist.isNum = function(value) {
    return !isNaN(value) && isFinite(value);
  };

  /**
   * Returns true on all falsey values except the numeric value 0.
   *
   * @memberof Chartist.Core
   * @param value
   * @returns {boolean}
   */
  Chartist.isFalseyButZero = function(value) {
    return !value && value !== 0;
  };

  /**
   * Returns a number if the passed parameter is a valid number or the function will return undefined. On all other values than a valid number, this function will return undefined.
   *
   * @memberof Chartist.Core
   * @param value
   * @returns {*}
   */
  Chartist.getNumberOrUndefined = function(value) {
    return isNaN(+value) ? undefined : +value;
  };

  /**
   * Gets a value from a dimension `value.x` or `value.y` while returning value directly if it's a valid numeric value. If the value is not numeric and it's falsey this function will return undefined.
   *
   * @param value
   * @param dimension
   * @returns {*}
   */
  Chartist.getMultiValue = function(value, dimension) {
    if(Chartist.isNum(value)) {
      return +value;
    } else if(value) {
      return value[dimension || 'y'] || 0;
    } else {
      return 0;
    }
  };

  /**
   * Pollard Rho Algorithm to find smallest factor of an integer value. There are more efficient algorithms for factorization, but this one is quite efficient and not so complex.
   *
   * @memberof Chartist.Core
   * @param {Number} num An integer number where the smallest factor should be searched for
   * @returns {Number} The smallest integer factor of the parameter num.
   */
  Chartist.rho = function(num) {
    if(num === 1) {
      return num;
    }

    function gcd(p, q) {
      if (p % q === 0) {
        return q;
      } else {
        return gcd(q, p % q);
      }
    }

    function f(x) {
      return x * x + 1;
    }

    var x1 = 2, x2 = 2, divisor;
    if (num % 2 === 0) {
      return 2;
    }

    do {
      x1 = f(x1) % num;
      x2 = f(f(x2)) % num;
      divisor = gcd(Math.abs(x1 - x2), num);
    } while (divisor === 1);

    return divisor;
  };

  /**
   * Calculate and retrieve all the bounds for the chart and return them in one array
   *
   * @memberof Chartist.Core
   * @param {Number} axisLength The length of the Axis used for
   * @param {Object} highLow An object containing a high and low property indicating the value range of the chart.
   * @param {Number} scaleMinSpace The minimum projected length a step should result in
   * @param {Boolean} onlyInteger
   * @return {Object} All the values to set the bounds of the chart
   */
  Chartist.getBounds = function (axisLength, highLow, scaleMinSpace, onlyInteger) {
    var i,
      optimizationCounter = 0,
      newMin,
      newMax,
      bounds = {
        high: highLow.high,
        low: highLow.low
      };

    bounds.valueRange = bounds.high - bounds.low;
    bounds.oom = Chartist.orderOfMagnitude(bounds.valueRange);
    bounds.step = Math.pow(10, bounds.oom);
    bounds.min = Math.floor(bounds.low / bounds.step) * bounds.step;
    bounds.max = Math.ceil(bounds.high / bounds.step) * bounds.step;
    bounds.range = bounds.max - bounds.min;
    bounds.numberOfSteps = Math.round(bounds.range / bounds.step);

    // Optimize scale step by checking if subdivision is possible based on horizontalGridMinSpace
    // If we are already below the scaleMinSpace value we will scale up
    var length = Chartist.projectLength(axisLength, bounds.step, bounds);
    var scaleUp = length < scaleMinSpace;
    var smallestFactor = onlyInteger ? Chartist.rho(bounds.range) : 0;

    // First check if we should only use integer steps and if step 1 is still larger than scaleMinSpace so we can use 1
    if(onlyInteger && Chartist.projectLength(axisLength, 1, bounds) >= scaleMinSpace) {
      bounds.step = 1;
    } else if(onlyInteger && smallestFactor < bounds.step && Chartist.projectLength(axisLength, smallestFactor, bounds) >= scaleMinSpace) {
      // If step 1 was too small, we can try the smallest factor of range
      // If the smallest factor is smaller than the current bounds.step and the projected length of smallest factor
      // is larger than the scaleMinSpace we should go for it.
      bounds.step = smallestFactor;
    } else {
      // Trying to divide or multiply by 2 and find the best step value
      while (true) {
        if (scaleUp && Chartist.projectLength(axisLength, bounds.step, bounds) <= scaleMinSpace) {
          bounds.step *= 2;
        } else if (!scaleUp && Chartist.projectLength(axisLength, bounds.step / 2, bounds) >= scaleMinSpace) {
          bounds.step /= 2;
          if(onlyInteger && bounds.step % 1 !== 0) {
            bounds.step *= 2;
            break;
          }
        } else {
          break;
        }

        if(optimizationCounter++ > 1000) {
          throw new Error('Exceeded maximum number of iterations while optimizing scale step!');
        }
      }
    }

    // Narrow min and max based on new step
    newMin = bounds.min;
    newMax = bounds.max;
    while(newMin + bounds.step <= bounds.low) {
      newMin += bounds.step;
    }
    while(newMax - bounds.step >= bounds.high) {
      newMax -= bounds.step;
    }
    bounds.min = newMin;
    bounds.max = newMax;
    bounds.range = bounds.max - bounds.min;

    bounds.values = [];
    for (i = bounds.min; i <= bounds.max; i += bounds.step) {
      bounds.values.push(Chartist.roundWithPrecision(i));
    }

    return bounds;
  };

  /**
   * Calculate cartesian coordinates of polar coordinates
   *
   * @memberof Chartist.Core
   * @param {Number} centerX X-axis coordinates of center point of circle segment
   * @param {Number} centerY X-axis coordinates of center point of circle segment
   * @param {Number} radius Radius of circle segment
   * @param {Number} angleInDegrees Angle of circle segment in degrees
   * @return {{x:Number, y:Number}} Coordinates of point on circumference
   */
  Chartist.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  /**
   * Initialize chart drawing rectangle (area where chart is drawn) x1,y1 = bottom left / x2,y2 = top right
   *
   * @memberof Chartist.Core
   * @param {Object} svg The svg element for the chart
   * @param {Object} options The Object that contains all the optional values for the chart
   * @param {Number} [fallbackPadding] The fallback padding if partial padding objects are used
   * @return {Object} The chart rectangles coordinates inside the svg element plus the rectangles measurements
   */
  Chartist.createChartRect = function (svg, options, fallbackPadding) {
    var hasAxis = !!(options.axisX || options.axisY);
    var yAxisOffset = hasAxis ? options.axisY.offset : 0;
    var xAxisOffset = hasAxis ? options.axisX.offset : 0;
    // If width or height results in invalid value (including 0) we fallback to the unitless settings or even 0
    var width = svg.width() || Chartist.quantity(options.width).value || 0;
    var height = svg.height() || Chartist.quantity(options.height).value || 0;
    var normalizedPadding = Chartist.normalizePadding(options.chartPadding, fallbackPadding);

    // If settings were to small to cope with offset (legacy) and padding, we'll adjust
    width = Math.max(width, yAxisOffset + normalizedPadding.left + normalizedPadding.right);
    height = Math.max(height, xAxisOffset + normalizedPadding.top + normalizedPadding.bottom);

    var chartRect = {
      padding: normalizedPadding,
      width: function () {
        return this.x2 - this.x1;
      },
      height: function () {
        return this.y1 - this.y2;
      }
    };

    if(hasAxis) {
      if (options.axisX.position === 'start') {
        chartRect.y2 = normalizedPadding.top + xAxisOffset;
        chartRect.y1 = Math.max(height - normalizedPadding.bottom, chartRect.y2 + 1);
      } else {
        chartRect.y2 = normalizedPadding.top;
        chartRect.y1 = Math.max(height - normalizedPadding.bottom - xAxisOffset, chartRect.y2 + 1);
      }

      if (options.axisY.position === 'start') {
        chartRect.x1 = normalizedPadding.left + yAxisOffset;
        chartRect.x2 = Math.max(width - normalizedPadding.right, chartRect.x1 + 1);
      } else {
        chartRect.x1 = normalizedPadding.left;
        chartRect.x2 = Math.max(width - normalizedPadding.right - yAxisOffset, chartRect.x1 + 1);
      }
    } else {
      chartRect.x1 = normalizedPadding.left;
      chartRect.x2 = Math.max(width - normalizedPadding.right, chartRect.x1 + 1);
      chartRect.y2 = normalizedPadding.top;
      chartRect.y1 = Math.max(height - normalizedPadding.bottom, chartRect.y2 + 1);
    }

    return chartRect;
  };

  /**
   * Creates a grid line based on a projected value.
   *
   * @memberof Chartist.Core
   * @param position
   * @param index
   * @param axis
   * @param offset
   * @param length
   * @param group
   * @param classes
   * @param eventEmitter
   */
  Chartist.createGrid = function(position, index, axis, offset, length, group, classes, eventEmitter) {
    var positionalData = {};
    positionalData[axis.units.pos + '1'] = position;
    positionalData[axis.units.pos + '2'] = position;
    positionalData[axis.counterUnits.pos + '1'] = offset;
    positionalData[axis.counterUnits.pos + '2'] = offset + length;

    var gridElement = group.elem('line', positionalData, classes.join(' '));

    // Event for grid draw
    eventEmitter.emit('draw',
      Chartist.extend({
        type: 'grid',
        axis: axis,
        index: index,
        group: group,
        element: gridElement
      }, positionalData)
    );
  };

  /**
   * Creates a label based on a projected value and an axis.
   *
   * @memberof Chartist.Core
   * @param position
   * @param length
   * @param index
   * @param labels
   * @param axis
   * @param axisOffset
   * @param labelOffset
   * @param group
   * @param classes
   * @param useForeignObject
   * @param eventEmitter
   */
  Chartist.createLabel = function(position, length, index, labels, axis, axisOffset, labelOffset, group, classes, useForeignObject, eventEmitter) {
    var labelElement;
    var positionalData = {};

    positionalData[axis.units.pos] = position + labelOffset[axis.units.pos];
    positionalData[axis.counterUnits.pos] = labelOffset[axis.counterUnits.pos];
    positionalData[axis.units.len] = length;
    positionalData[axis.counterUnits.len] = axisOffset - 10;

    if(useForeignObject) {
      // We need to set width and height explicitly to px as span will not expand with width and height being
      // 100% in all browsers
      var content = '<span class="' + classes.join(' ') + '" style="' +
        axis.units.len + ': ' + Math.round(positionalData[axis.units.len]) + 'px; ' +
        axis.counterUnits.len + ': ' + Math.round(positionalData[axis.counterUnits.len]) + 'px">' +
        labels[index] + '</span>';

      labelElement = group.foreignObject(content, Chartist.extend({
        style: 'overflow: visible;'
      }, positionalData));
    } else {
      labelElement = group.elem('text', positionalData, classes.join(' ')).text(labels[index]);
    }

    eventEmitter.emit('draw', Chartist.extend({
      type: 'label',
      axis: axis,
      index: index,
      group: group,
      element: labelElement,
      text: labels[index]
    }, positionalData));
  };

  /**
   * Helper to read series specific options from options object. It automatically falls back to the global option if
   * there is no option in the series options.
   *
   * @param {Object} series Series object
   * @param {Object} options Chartist options object
   * @param {string} key The options key that should be used to obtain the options
   * @returns {*}
   */
  Chartist.getSeriesOption = function(series, options, key) {
    if(series.name && options.series && options.series[series.name]) {
      var seriesOptions = options.series[series.name];
      return seriesOptions.hasOwnProperty(key) ? seriesOptions[key] : options[key];
    } else {
      return options[key];
    }
  };

  /**
   * Provides options handling functionality with callback for options changes triggered by responsive options and media query matches
   *
   * @memberof Chartist.Core
   * @param {Object} options Options set by user
   * @param {Array} responsiveOptions Optional functions to add responsive behavior to chart
   * @param {Object} eventEmitter The event emitter that will be used to emit the options changed events
   * @return {Object} The consolidated options object from the defaults, base and matching responsive options
   */
  Chartist.optionsProvider = function (options, responsiveOptions, eventEmitter) {
    var baseOptions = Chartist.extend({}, options),
      currentOptions,
      mediaQueryListeners = [],
      i;

    function updateCurrentOptions(preventChangedEvent) {
      var previousOptions = currentOptions;
      currentOptions = Chartist.extend({}, baseOptions);

      if (responsiveOptions) {
        for (i = 0; i < responsiveOptions.length; i++) {
          var mql = window.matchMedia(responsiveOptions[i][0]);
          if (mql.matches) {
            currentOptions = Chartist.extend(currentOptions, responsiveOptions[i][1]);
          }
        }
      }

      if(eventEmitter && !preventChangedEvent) {
        eventEmitter.emit('optionsChanged', {
          previousOptions: previousOptions,
          currentOptions: currentOptions
        });
      }
    }

    function removeMediaQueryListeners() {
      mediaQueryListeners.forEach(function(mql) {
        mql.removeListener(updateCurrentOptions);
      });
    }

    if (!window.matchMedia) {
      throw 'window.matchMedia not found! Make sure you\'re using a polyfill.';
    } else if (responsiveOptions) {

      for (i = 0; i < responsiveOptions.length; i++) {
        var mql = window.matchMedia(responsiveOptions[i][0]);
        mql.addListener(updateCurrentOptions);
        mediaQueryListeners.push(mql);
      }
    }
    // Execute initially so we get the correct options
    updateCurrentOptions(true);

    return {
      removeMediaQueryListeners: removeMediaQueryListeners,
      getCurrentOptions: function getCurrentOptions() {
        return Chartist.extend({}, currentOptions);
      }
    };
  };

}(window, document, Chartist));
;/**
 * Chartist path interpolation functions.
 *
 * @module Chartist.Interpolation
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  Chartist.Interpolation = {};

  /**
   * This interpolation function does not smooth the path and the result is only containing lines and no curves.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.none({
   *     fillHoles: false
   *   })
   * });
   *
   *
   * @memberof Chartist.Interpolation
   * @return {Function}
   */
  Chartist.Interpolation.none = function(options) {
    var defaultOptions = {
      fillHoles: false
    };
    options = Chartist.extend({}, defaultOptions, options);
    return function none(pathCoordinates, valueData) {
      var path = new Chartist.Svg.Path();
      var hole = true;

      for(var i = 0; i < pathCoordinates.length; i += 2) {
        var currX = pathCoordinates[i];
        var currY = pathCoordinates[i + 1];
        var currData = valueData[i / 2];

        if(currData.value !== undefined) {

          if(hole) {
            path.move(currX, currY, false, currData);
          } else {
            path.line(currX, currY, false, currData);
          }

          hole = false;
        } else if(!options.fillHoles) {
          hole = true;
        }
      }

      return path;
    };
  };

  /**
   * Simple smoothing creates horizontal handles that are positioned with a fraction of the length between two data points. You can use the divisor option to specify the amount of smoothing.
   *
   * Simple smoothing can be used instead of `Chartist.Smoothing.cardinal` if you'd like to get rid of the artifacts it produces sometimes. Simple smoothing produces less flowing lines but is accurate by hitting the points and it also doesn't swing below or above the given data point.
   *
   * All smoothing functions within Chartist are factory functions that accept an options parameter. The simple interpolation function accepts one configuration parameter `divisor`, between 1 and ∞, which controls the smoothing characteristics.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.simple({
   *     divisor: 2,
   *     fillHoles: false
   *   })
   * });
   *
   *
   * @memberof Chartist.Interpolation
   * @param {Object} options The options of the simple interpolation factory function.
   * @return {Function}
   */
  Chartist.Interpolation.simple = function(options) {
    var defaultOptions = {
      divisor: 2,
      fillHoles: false
    };
    options = Chartist.extend({}, defaultOptions, options);

    var d = 1 / Math.max(1, options.divisor);

    return function simple(pathCoordinates, valueData) {
      var path = new Chartist.Svg.Path();
      var prevX, prevY, prevData;

      for(var i = 0; i < pathCoordinates.length; i += 2) {
        var currX = pathCoordinates[i];
        var currY = pathCoordinates[i + 1];
        var length = (currX - prevX) * d;
        var currData = valueData[i / 2];

        if(currData.value !== undefined) {

          if(prevData === undefined) {
            path.move(currX, currY, false, currData);
          } else {
            path.curve(
              prevX + length,
              prevY,
              currX - length,
              currY,
              currX,
              currY,
              false,
              currData
            );
          }

          prevX = currX;
          prevY = currY;
          prevData = currData;
        } else if(!options.fillHoles) {
          prevX = currX = prevData = undefined;
        }
      }

      return path;
    };
  };

  /**
   * Cardinal / Catmull-Rome spline interpolation is the default smoothing function in Chartist. It produces nice results where the splines will always meet the points. It produces some artifacts though when data values are increased or decreased rapidly. The line may not follow a very accurate path and if the line should be accurate this smoothing function does not produce the best results.
   *
   * Cardinal splines can only be created if there are more than two data points. If this is not the case this smoothing will fallback to `Chartist.Smoothing.none`.
   *
   * All smoothing functions within Chartist are factory functions that accept an options parameter. The cardinal interpolation function accepts one configuration parameter `tension`, between 0 and 1, which controls the smoothing intensity.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.cardinal({
   *     tension: 1,
   *     fillHoles: false
   *   })
   * });
   *
   * @memberof Chartist.Interpolation
   * @param {Object} options The options of the cardinal factory function.
   * @return {Function}
   */
  Chartist.Interpolation.cardinal = function(options) {
    var defaultOptions = {
      tension: 1,
      fillHoles: false
    };

    options = Chartist.extend({}, defaultOptions, options);

    var t = Math.min(1, Math.max(0, options.tension)),
      c = 1 - t;

    // This function will help us to split pathCoordinates and valueData into segments that also contain pathCoordinates
    // and valueData. This way the existing functions can be reused and the segment paths can be joined afterwards.
    // This functionality is necessary to treat "holes" in the line charts
    function splitIntoSegments(pathCoordinates, valueData) {
      var segments = [];
      var hole = true;

      for(var i = 0; i < pathCoordinates.length; i += 2) {
        // If this value is a "hole" we set the hole flag
        if(valueData[i / 2].value === undefined) {
          if(!options.fillHoles) {
            hole = true;
          }
        } else {
          // If it's a valid value we need to check if we're coming out of a hole and create a new empty segment
          if(hole) {
            segments.push({
              pathCoordinates: [],
              valueData: []
            });
            // As we have a valid value now, we are not in a "hole" anymore
            hole = false;
          }

          // Add to the segment pathCoordinates and valueData
          segments[segments.length - 1].pathCoordinates.push(pathCoordinates[i], pathCoordinates[i + 1]);
          segments[segments.length - 1].valueData.push(valueData[i / 2]);
        }
      }

      return segments;
    }

    return function cardinal(pathCoordinates, valueData) {
      // First we try to split the coordinates into segments
      // This is necessary to treat "holes" in line charts
      var segments = splitIntoSegments(pathCoordinates, valueData);

      // If the split resulted in more that one segment we need to interpolate each segment individually and join them
      // afterwards together into a single path.
      if(segments.length > 1) {
        var paths = [];
        // For each segment we will recurse the cardinal function
        segments.forEach(function(segment) {
          paths.push(cardinal(segment.pathCoordinates, segment.valueData));
        });
        // Join the segment path data into a single path and return
        return Chartist.Svg.Path.join(paths);
      } else {
        // If there was only one segment we can proceed regularly by using pathCoordinates and valueData from the first
        // segment
        pathCoordinates = segments[0].pathCoordinates;
        valueData = segments[0].valueData;

        // If less than two points we need to fallback to no smoothing
        if(pathCoordinates.length <= 4) {
          return Chartist.Interpolation.none()(pathCoordinates, valueData);
        }

        var path = new Chartist.Svg.Path().move(pathCoordinates[0], pathCoordinates[1], false, valueData[0]),
          z;

        for (var i = 0, iLen = pathCoordinates.length; iLen - 2 * !z > i; i += 2) {
          var p = [
            {x: +pathCoordinates[i - 2], y: +pathCoordinates[i - 1]},
            {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]},
            {x: +pathCoordinates[i + 2], y: +pathCoordinates[i + 3]},
            {x: +pathCoordinates[i + 4], y: +pathCoordinates[i + 5]}
          ];
          if (z) {
            if (!i) {
              p[0] = {x: +pathCoordinates[iLen - 2], y: +pathCoordinates[iLen - 1]};
            } else if (iLen - 4 === i) {
              p[3] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
            } else if (iLen - 2 === i) {
              p[2] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
              p[3] = {x: +pathCoordinates[2], y: +pathCoordinates[3]};
            }
          } else {
            if (iLen - 4 === i) {
              p[3] = p[2];
            } else if (!i) {
              p[0] = {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]};
            }
          }

          path.curve(
            (t * (-p[0].x + 6 * p[1].x + p[2].x) / 6) + (c * p[2].x),
            (t * (-p[0].y + 6 * p[1].y + p[2].y) / 6) + (c * p[2].y),
            (t * (p[1].x + 6 * p[2].x - p[3].x) / 6) + (c * p[2].x),
            (t * (p[1].y + 6 * p[2].y - p[3].y) / 6) + (c * p[2].y),
            p[2].x,
            p[2].y,
            false,
            valueData[(i + 2) / 2]
          );
        }

        return path;
      }
    };
  };

  /**
   * Step interpolation will cause the line chart to move in steps rather than diagonal or smoothed lines. This interpolation will create additional points that will also be drawn when the `showPoint` option is enabled.
   *
   * All smoothing functions within Chartist are factory functions that accept an options parameter. The step interpolation function accepts one configuration parameter `postpone`, that can be `true` or `false`. The default value is `true` and will cause the step to occur where the value actually changes. If a different behaviour is needed where the step is shifted to the left and happens before the actual value, this option can be set to `false`.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.step({
   *     postpone: true,
   *     fillHoles: false
   *   })
   * });
   *
   * @memberof Chartist.Interpolation
   * @param options
   * @returns {Function}
   */
  Chartist.Interpolation.step = function(options) {
    var defaultOptions = {
      postpone: true,
      fillHoles: false
    };

    options = Chartist.extend({}, defaultOptions, options);

    return function step(pathCoordinates, valueData) {
      var path = new Chartist.Svg.Path();

      var prevX, prevY, prevData;

      for (var i = 0; i < pathCoordinates.length; i += 2) {
        var currX = pathCoordinates[i];
        var currY = pathCoordinates[i + 1];
        var currData = valueData[i / 2];

        // If the current point is also not a hole we can draw the step lines
        if(currData.value !== undefined) {
          if(prevData === undefined) {
            path.move(currX, currY, false, currData);
          } else {
            if(options.postpone) {
              // If postponed we should draw the step line with the value of the previous value
              path.line(currX, prevY, false, prevData);
            } else {
              // If not postponed we should draw the step line with the value of the current value
              path.line(prevX, currY, false, currData);
            }
            // Line to the actual point (this should only be a Y-Axis movement
            path.line(currX, currY, false, currData);
          }

          prevX = currX;
          prevY = currY;
          prevData = currData;
        } else if(!options.fillHoles) {
          prevX = prevY = prevData = undefined;
        }
      }

      return path;
    };
  };

}(window, document, Chartist));
;/**
 * A very basic event module that helps to generate and catch events.
 *
 * @module Chartist.Event
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  Chartist.EventEmitter = function () {
    var handlers = [];

    /**
     * Add an event handler for a specific event
     *
     * @memberof Chartist.Event
     * @param {String} event The event name
     * @param {Function} handler A event handler function
     */
    function addEventHandler(event, handler) {
      handlers[event] = handlers[event] || [];
      handlers[event].push(handler);
    }

    /**
     * Remove an event handler of a specific event name or remove all event handlers for a specific event.
     *
     * @memberof Chartist.Event
     * @param {String} event The event name where a specific or all handlers should be removed
     * @param {Function} [handler] An optional event handler function. If specified only this specific handler will be removed and otherwise all handlers are removed.
     */
    function removeEventHandler(event, handler) {
      // Only do something if there are event handlers with this name existing
      if(handlers[event]) {
        // If handler is set we will look for a specific handler and only remove this
        if(handler) {
          handlers[event].splice(handlers[event].indexOf(handler), 1);
          if(handlers[event].length === 0) {
            delete handlers[event];
          }
        } else {
          // If no handler is specified we remove all handlers for this event
          delete handlers[event];
        }
      }
    }

    /**
     * Use this function to emit an event. All handlers that are listening for this event will be triggered with the data parameter.
     *
     * @memberof Chartist.Event
     * @param {String} event The event name that should be triggered
     * @param {*} data Arbitrary data that will be passed to the event handler callback functions
     */
    function emit(event, data) {
      // Only do something if there are event handlers with this name existing
      if(handlers[event]) {
        handlers[event].forEach(function(handler) {
          handler(data);
        });
      }

      // Emit event to star event handlers
      if(handlers['*']) {
        handlers['*'].forEach(function(starHandler) {
          starHandler(event, data);
        });
      }
    }

    return {
      addEventHandler: addEventHandler,
      removeEventHandler: removeEventHandler,
      emit: emit
    };
  };

}(window, document, Chartist));
;/**
 * This module provides some basic prototype inheritance utilities.
 *
 * @module Chartist.Class
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  function listToArray(list) {
    var arr = [];
    if (list.length) {
      for (var i = 0; i < list.length; i++) {
        arr.push(list[i]);
      }
    }
    return arr;
  }

  /**
   * Method to extend from current prototype.
   *
   * @memberof Chartist.Class
   * @param {Object} properties The object that serves as definition for the prototype that gets created for the new class. This object should always contain a constructor property that is the desired constructor for the newly created class.
   * @param {Object} [superProtoOverride] By default extens will use the current class prototype or Chartist.class. With this parameter you can specify any super prototype that will be used.
   * @return {Function} Constructor function of the new class
   *
   * @example
   * var Fruit = Class.extend({
     * color: undefined,
     *   sugar: undefined,
     *
     *   constructor: function(color, sugar) {
     *     this.color = color;
     *     this.sugar = sugar;
     *   },
     *
     *   eat: function() {
     *     this.sugar = 0;
     *     return this;
     *   }
     * });
   *
   * var Banana = Fruit.extend({
     *   length: undefined,
     *
     *   constructor: function(length, sugar) {
     *     Banana.super.constructor.call(this, 'Yellow', sugar);
     *     this.length = length;
     *   }
     * });
   *
   * var banana = new Banana(20, 40);
   * console.log('banana instanceof Fruit', banana instanceof Fruit);
   * console.log('Fruit is prototype of banana', Fruit.prototype.isPrototypeOf(banana));
   * console.log('bananas prototype is Fruit', Object.getPrototypeOf(banana) === Fruit.prototype);
   * console.log(banana.sugar);
   * console.log(banana.eat().sugar);
   * console.log(banana.color);
   */
  function extend(properties, superProtoOverride) {
    var superProto = superProtoOverride || this.prototype || Chartist.Class;
    var proto = Object.create(superProto);

    Chartist.Class.cloneDefinitions(proto, properties);

    var constr = function() {
      var fn = proto.constructor || function () {},
        instance;

      // If this is linked to the Chartist namespace the constructor was not called with new
      // To provide a fallback we will instantiate here and return the instance
      instance = this === Chartist ? Object.create(proto) : this;
      fn.apply(instance, Array.prototype.slice.call(arguments, 0));

      // If this constructor was not called with new we need to return the instance
      // This will not harm when the constructor has been called with new as the returned value is ignored
      return instance;
    };

    constr.prototype = proto;
    constr.super = superProto;
    constr.extend = this.extend;

    return constr;
  }

  // Variable argument list clones args > 0 into args[0] and retruns modified args[0]
  function cloneDefinitions() {
    var args = listToArray(arguments);
    var target = args[0];

    args.splice(1, args.length - 1).forEach(function (source) {
      Object.getOwnPropertyNames(source).forEach(function (propName) {
        // If this property already exist in target we delete it first
        delete target[propName];
        // Define the property with the descriptor from source
        Object.defineProperty(target, propName,
          Object.getOwnPropertyDescriptor(source, propName));
      });
    });

    return target;
  }

  Chartist.Class = {
    extend: extend,
    cloneDefinitions: cloneDefinitions
  };

}(window, document, Chartist));
;/**
 * Base for all chart types. The methods in Chartist.Base are inherited to all chart types.
 *
 * @module Chartist.Base
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  // TODO: Currently we need to re-draw the chart on window resize. This is usually very bad and will affect performance.
  // This is done because we can't work with relative coordinates when drawing the chart because SVG Path does not
  // work with relative positions yet. We need to check if we can do a viewBox hack to switch to percentage.
  // See http://mozilla.6506.n7.nabble.com/Specyfing-paths-with-percentages-unit-td247474.html
  // Update: can be done using the above method tested here: http://codepen.io/gionkunz/pen/KDvLj
  // The problem is with the label offsets that can't be converted into percentage and affecting the chart container
  /**
   * Updates the chart which currently does a full reconstruction of the SVG DOM
   *
   * @param {Object} [data] Optional data you'd like to set for the chart before it will update. If not specified the update method will use the data that is already configured with the chart.
   * @param {Object} [options] Optional options you'd like to add to the previous options for the chart before it will update. If not specified the update method will use the options that have been already configured with the chart.
   * @param {Boolean} [override] If set to true, the passed options will be used to extend the options that have been configured already. Otherwise the chart default options will be used as the base
   * @memberof Chartist.Base
   */
  function update(data, options, override) {
    if(data) {
      this.data = data;
      // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
      this.eventEmitter.emit('data', {
        type: 'update',
        data: this.data
      });
    }

    if(options) {
      this.options = Chartist.extend({}, override ? this.options : this.defaultOptions, options);

      // If chartist was not initialized yet, we just set the options and leave the rest to the initialization
      // Otherwise we re-create the optionsProvider at this point
      if(!this.initializeTimeoutId) {
        this.optionsProvider.removeMediaQueryListeners();
        this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
      }
    }

    // Only re-created the chart if it has been initialized yet
    if(!this.initializeTimeoutId) {
      this.createChart(this.optionsProvider.getCurrentOptions());
    }

    // Return a reference to the chart object to chain up calls
    return this;
  }

  /**
   * This method can be called on the API object of each chart and will un-register all event listeners that were added to other components. This currently includes a window.resize listener as well as media query listeners if any responsive options have been provided. Use this function if you need to destroy and recreate Chartist charts dynamically.
   *
   * @memberof Chartist.Base
   */
  function detach() {
    // Only detach if initialization already occurred on this chart. If this chart still hasn't initialized (therefore
    // the initializationTimeoutId is still a valid timeout reference, we will clear the timeout
    if(!this.initializeTimeoutId) {
      window.removeEventListener('resize', this.resizeListener);
      this.optionsProvider.removeMediaQueryListeners();
    } else {
      window.clearTimeout(this.initializeTimeoutId);
    }

    return this;
  }

  /**
   * Use this function to register event handlers. The handler callbacks are synchronous and will run in the main thread rather than the event loop.
   *
   * @memberof Chartist.Base
   * @param {String} event Name of the event. Check the examples for supported events.
   * @param {Function} handler The handler function that will be called when an event with the given name was emitted. This function will receive a data argument which contains event data. See the example for more details.
   */
  function on(event, handler) {
    this.eventEmitter.addEventHandler(event, handler);
    return this;
  }

  /**
   * Use this function to un-register event handlers. If the handler function parameter is omitted all handlers for the given event will be un-registered.
   *
   * @memberof Chartist.Base
   * @param {String} event Name of the event for which a handler should be removed
   * @param {Function} [handler] The handler function that that was previously used to register a new event handler. This handler will be removed from the event handler list. If this parameter is omitted then all event handlers for the given event are removed from the list.
   */
  function off(event, handler) {
    this.eventEmitter.removeEventHandler(event, handler);
    return this;
  }

  function initialize() {
    // Add window resize listener that re-creates the chart
    window.addEventListener('resize', this.resizeListener);

    // Obtain current options based on matching media queries (if responsive options are given)
    // This will also register a listener that is re-creating the chart based on media changes
    this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
    // Register options change listener that will trigger a chart update
    this.eventEmitter.addEventHandler('optionsChanged', function() {
      this.update();
    }.bind(this));

    // Before the first chart creation we need to register us with all plugins that are configured
    // Initialize all relevant plugins with our chart object and the plugin options specified in the config
    if(this.options.plugins) {
      this.options.plugins.forEach(function(plugin) {
        if(plugin instanceof Array) {
          plugin[0](this, plugin[1]);
        } else {
          plugin(this);
        }
      }.bind(this));
    }

    // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
    this.eventEmitter.emit('data', {
      type: 'initial',
      data: this.data
    });

    // Create the first chart
    this.createChart(this.optionsProvider.getCurrentOptions());

    // As chart is initialized from the event loop now we can reset our timeout reference
    // This is important if the chart gets initialized on the same element twice
    this.initializeTimeoutId = undefined;
  }

  /**
   * Constructor of chart base class.
   *
   * @param query
   * @param data
   * @param defaultOptions
   * @param options
   * @param responsiveOptions
   * @constructor
   */
  function Base(query, data, defaultOptions, options, responsiveOptions) {
    this.container = Chartist.querySelector(query);
    this.data = data;
    this.defaultOptions = defaultOptions;
    this.options = options;
    this.responsiveOptions = responsiveOptions;
    this.eventEmitter = Chartist.EventEmitter();
    this.supportsForeignObject = Chartist.Svg.isSupported('Extensibility');
    this.supportsAnimations = Chartist.Svg.isSupported('AnimationEventsAttribute');
    this.resizeListener = function resizeListener(){
      this.update();
    }.bind(this);

    if(this.container) {
      // If chartist was already initialized in this container we are detaching all event listeners first
      if(this.container.__chartist__) {
        this.container.__chartist__.detach();
      }

      this.container.__chartist__ = this;
    }

    // Using event loop for first draw to make it possible to register event listeners in the same call stack where
    // the chart was created.
    this.initializeTimeoutId = setTimeout(initialize.bind(this), 0);
  }

  // Creating the chart base class
  Chartist.Base = Chartist.Class.extend({
    constructor: Base,
    optionsProvider: undefined,
    container: undefined,
    svg: undefined,
    eventEmitter: undefined,
    createChart: function() {
      throw new Error('Base chart type can\'t be instantiated!');
    },
    update: update,
    detach: detach,
    on: on,
    off: off,
    version: Chartist.version,
    supportsForeignObject: false
  });

}(window, document, Chartist));
;/**
 * Chartist SVG module for simple SVG DOM abstraction
 *
 * @module Chartist.Svg
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  var svgNs = 'http://www.w3.org/2000/svg',
    xmlNs = 'http://www.w3.org/2000/xmlns/',
    xhtmlNs = 'http://www.w3.org/1999/xhtml';

  Chartist.xmlNs = {
    qualifiedName: 'xmlns:ct',
    prefix: 'ct',
    uri: 'http://gionkunz.github.com/chartist-js/ct'
  };

  /**
   * Chartist.Svg creates a new SVG object wrapper with a starting element. You can use the wrapper to fluently create sub-elements and modify them.
   *
   * @memberof Chartist.Svg
   * @constructor
   * @param {String|Element} name The name of the SVG element to create or an SVG dom element which should be wrapped into Chartist.Svg
   * @param {Object} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
   * @param {String} className This class or class list will be added to the SVG element
   * @param {Object} parent The parent SVG wrapper object where this newly created wrapper and it's element will be attached to as child
   * @param {Boolean} insertFirst If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
   */
  function Svg(name, attributes, className, parent, insertFirst) {
    // If Svg is getting called with an SVG element we just return the wrapper
    if(name instanceof Element) {
      this._node = name;
    } else {
      this._node = document.createElementNS(svgNs, name);

      // If this is an SVG element created then custom namespace
      if(name === 'svg') {
        this._node.setAttributeNS(xmlNs, Chartist.xmlNs.qualifiedName, Chartist.xmlNs.uri);
      }
    }

    if(attributes) {
      this.attr(attributes);
    }

    if(className) {
      this.addClass(className);
    }

    if(parent) {
      if (insertFirst && parent._node.firstChild) {
        parent._node.insertBefore(this._node, parent._node.firstChild);
      } else {
        parent._node.appendChild(this._node);
      }
    }
  }

  /**
   * Set attributes on the current SVG element of the wrapper you're currently working on.
   *
   * @memberof Chartist.Svg
   * @param {Object|String} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added. If this parameter is a String then the function is used as a getter and will return the attribute value.
   * @param {String} ns If specified, the attributes will be set as namespace attributes with ns as prefix.
   * @return {Object|String} The current wrapper object will be returned so it can be used for chaining or the attribute value if used as getter function.
   */
  function attr(attributes, ns) {
    if(typeof attributes === 'string') {
      if(ns) {
        return this._node.getAttributeNS(ns, attributes);
      } else {
        return this._node.getAttribute(attributes);
      }
    }

    Object.keys(attributes).forEach(function(key) {
      // If the attribute value is undefined we can skip this one
      if(attributes[key] === undefined) {
        return;
      }

      if(ns) {
        this._node.setAttributeNS(ns, [Chartist.xmlNs.prefix, ':', key].join(''), attributes[key]);
      } else {
        this._node.setAttribute(key, attributes[key]);
      }
    }.bind(this));

    return this;
  }

  /**
   * Create a new SVG element whose wrapper object will be selected for further operations. This way you can also create nested groups easily.
   *
   * @memberof Chartist.Svg
   * @param {String} name The name of the SVG element that should be created as child element of the currently selected element wrapper
   * @param {Object} [attributes] An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
   * @param {String} [className] This class or class list will be added to the SVG element
   * @param {Boolean} [insertFirst] If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
   * @return {Chartist.Svg} Returns a Chartist.Svg wrapper object that can be used to modify the containing SVG data
   */
  function elem(name, attributes, className, insertFirst) {
    return new Chartist.Svg(name, attributes, className, this, insertFirst);
  }

  /**
   * Returns the parent Chartist.SVG wrapper object
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} Returns a Chartist.Svg wrapper around the parent node of the current node. If the parent node is not existing or it's not an SVG node then this function will return null.
   */
  function parent() {
    return this._node.parentNode instanceof SVGElement ? new Chartist.Svg(this._node.parentNode) : null;
  }

  /**
   * This method returns a Chartist.Svg wrapper around the root SVG element of the current tree.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The root SVG element wrapped in a Chartist.Svg element
   */
  function root() {
    var node = this._node;
    while(node.nodeName !== 'svg') {
      node = node.parentNode;
    }
    return new Chartist.Svg(node);
  }

  /**
   * Find the first child SVG element of the current element that matches a CSS selector. The returned object is a Chartist.Svg wrapper.
   *
   * @memberof Chartist.Svg
   * @param {String} selector A CSS selector that is used to query for child SVG elements
   * @return {Chartist.Svg} The SVG wrapper for the element found or null if no element was found
   */
  function querySelector(selector) {
    var foundNode = this._node.querySelector(selector);
    return foundNode ? new Chartist.Svg(foundNode) : null;
  }

  /**
   * Find the all child SVG elements of the current element that match a CSS selector. The returned object is a Chartist.Svg.List wrapper.
   *
   * @memberof Chartist.Svg
   * @param {String} selector A CSS selector that is used to query for child SVG elements
   * @return {Chartist.Svg.List} The SVG wrapper list for the element found or null if no element was found
   */
  function querySelectorAll(selector) {
    var foundNodes = this._node.querySelectorAll(selector);
    return foundNodes.length ? new Chartist.Svg.List(foundNodes) : null;
  }

  /**
   * This method creates a foreignObject (see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) that allows to embed HTML content into a SVG graphic. With the help of foreignObjects you can enable the usage of regular HTML elements inside of SVG where they are subject for SVG positioning and transformation but the Browser will use the HTML rendering capabilities for the containing DOM.
   *
   * @memberof Chartist.Svg
   * @param {Node|String} content The DOM Node, or HTML string that will be converted to a DOM Node, that is then placed into and wrapped by the foreignObject
   * @param {String} [attributes] An object with properties that will be added as attributes to the foreignObject element that is created. Attributes with undefined values will not be added.
   * @param {String} [className] This class or class list will be added to the SVG element
   * @param {Boolean} [insertFirst] Specifies if the foreignObject should be inserted as first child
   * @return {Chartist.Svg} New wrapper object that wraps the foreignObject element
   */
  function foreignObject(content, attributes, className, insertFirst) {
    // If content is string then we convert it to DOM
    // TODO: Handle case where content is not a string nor a DOM Node
    if(typeof content === 'string') {
      var container = document.createElement('div');
      container.innerHTML = content;
      content = container.firstChild;
    }

    // Adding namespace to content element
    content.setAttribute('xmlns', xhtmlNs);

    // Creating the foreignObject without required extension attribute (as described here
    // http://www.w3.org/TR/SVG/extend.html#ForeignObjectElement)
    var fnObj = this.elem('foreignObject', attributes, className, insertFirst);

    // Add content to foreignObjectElement
    fnObj._node.appendChild(content);

    return fnObj;
  }

  /**
   * This method adds a new text element to the current Chartist.Svg wrapper.
   *
   * @memberof Chartist.Svg
   * @param {String} t The text that should be added to the text element that is created
   * @return {Chartist.Svg} The same wrapper object that was used to add the newly created element
   */
  function text(t) {
    this._node.appendChild(document.createTextNode(t));
    return this;
  }

  /**
   * This method will clear all child nodes of the current wrapper object.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The same wrapper object that got emptied
   */
  function empty() {
    while (this._node.firstChild) {
      this._node.removeChild(this._node.firstChild);
    }

    return this;
  }

  /**
   * This method will cause the current wrapper to remove itself from its parent wrapper. Use this method if you'd like to get rid of an element in a given DOM structure.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The parent wrapper object of the element that got removed
   */
  function remove() {
    this._node.parentNode.removeChild(this._node);
    return this.parent();
  }

  /**
   * This method will replace the element with a new element that can be created outside of the current DOM.
   *
   * @memberof Chartist.Svg
   * @param {Chartist.Svg} newElement The new Chartist.Svg object that will be used to replace the current wrapper object
   * @return {Chartist.Svg} The wrapper of the new element
   */
  function replace(newElement) {
    this._node.parentNode.replaceChild(newElement._node, this._node);
    return newElement;
  }

  /**
   * This method will append an element to the current element as a child.
   *
   * @memberof Chartist.Svg
   * @param {Chartist.Svg} element The Chartist.Svg element that should be added as a child
   * @param {Boolean} [insertFirst] Specifies if the element should be inserted as first child
   * @return {Chartist.Svg} The wrapper of the appended object
   */
  function append(element, insertFirst) {
    if(insertFirst && this._node.firstChild) {
      this._node.insertBefore(element._node, this._node.firstChild);
    } else {
      this._node.appendChild(element._node);
    }

    return this;
  }

  /**
   * Returns an array of class names that are attached to the current wrapper element. This method can not be chained further.
   *
   * @memberof Chartist.Svg
   * @return {Array} A list of classes or an empty array if there are no classes on the current element
   */
  function classes() {
    return this._node.getAttribute('class') ? this._node.getAttribute('class').trim().split(/\s+/) : [];
  }

  /**
   * Adds one or a space separated list of classes to the current element and ensures the classes are only existing once.
   *
   * @memberof Chartist.Svg
   * @param {String} names A white space separated list of class names
   * @return {Chartist.Svg} The wrapper of the current element
   */
  function addClass(names) {
    this._node.setAttribute('class',
      this.classes(this._node)
        .concat(names.trim().split(/\s+/))
        .filter(function(elem, pos, self) {
          return self.indexOf(elem) === pos;
        }).join(' ')
    );

    return this;
  }

  /**
   * Removes one or a space separated list of classes from the current element.
   *
   * @memberof Chartist.Svg
   * @param {String} names A white space separated list of class names
   * @return {Chartist.Svg} The wrapper of the current element
   */
  function removeClass(names) {
    var removedClasses = names.trim().split(/\s+/);

    this._node.setAttribute('class', this.classes(this._node).filter(function(name) {
      return removedClasses.indexOf(name) === -1;
    }).join(' '));

    return this;
  }

  /**
   * Removes all classes from the current element.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The wrapper of the current element
   */
  function removeAllClasses() {
    this._node.setAttribute('class', '');

    return this;
  }

  /**
   * "Save" way to get property value from svg BoundingBox.
   * This is a workaround. Firefox throws an NS_ERROR_FAILURE error if getBBox() is called on an invisible node.
   * See [NS_ERROR_FAILURE: Component returned failure code: 0x80004005](http://jsfiddle.net/sym3tri/kWWDK/)
   *
   * @memberof Chartist.Svg
   * @param {SVGElement} node The svg node to
   * @param {String} prop The property to fetch (ex.: height, width, ...)
   * @returns {Number} The value of the given bbox property
   */
  function getBBoxProperty(node, prop) {
    try {
      return node.getBBox()[prop];
    } catch(e) {}

    return 0;
  }

  /**
   * Get element height with fallback to svg BoundingBox or parent container dimensions:
   * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
   *
   * @memberof Chartist.Svg
   * @return {Number} The elements height in pixels
   */
  function height() {
    return this._node.clientHeight || Math.round(getBBoxProperty(this._node, 'height')) || this._node.parentNode.clientHeight;
  }

  /**
   * Get element width with fallback to svg BoundingBox or parent container dimensions:
   * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
   *
   * @memberof Chartist.Core
   * @return {Number} The elements width in pixels
   */
  function width() {
    return this._node.clientWidth || Math.round(getBBoxProperty(this._node, 'width')) || this._node.parentNode.clientWidth;
  }

  /**
   * The animate function lets you animate the current element with SMIL animations. You can add animations for multiple attributes at the same time by using an animation definition object. This object should contain SMIL animation attributes. Please refer to http://www.w3.org/TR/SVG/animate.html for a detailed specification about the available animation attributes. Additionally an easing property can be passed in the animation definition object. This can be a string with a name of an easing function in `Chartist.Svg.Easing` or an array with four numbers specifying a cubic Bézier curve.
   * **An animations object could look like this:**
   * ```javascript
   * element.animate({
   *   opacity: {
   *     dur: 1000,
   *     from: 0,
   *     to: 1
   *   },
   *   x1: {
   *     dur: '1000ms',
   *     from: 100,
   *     to: 200,
   *     easing: 'easeOutQuart'
   *   },
   *   y1: {
   *     dur: '2s',
   *     from: 0,
   *     to: 100
   *   }
   * });
   * ```
   * **Automatic unit conversion**
   * For the `dur` and the `begin` animate attribute you can also omit a unit by passing a number. The number will automatically be converted to milli seconds.
   * **Guided mode**
   * The default behavior of SMIL animations with offset using the `begin` attribute is that the attribute will keep it's original value until the animation starts. Mostly this behavior is not desired as you'd like to have your element attributes already initialized with the animation `from` value even before the animation starts. Also if you don't specify `fill="freeze"` on an animate element or if you delete the animation after it's done (which is done in guided mode) the attribute will switch back to the initial value. This behavior is also not desired when performing simple one-time animations. For one-time animations you'd want to trigger animations immediately instead of relative to the document begin time. That's why in guided mode Chartist.Svg will also use the `begin` property to schedule a timeout and manually start the animation after the timeout. If you're using multiple SMIL definition objects for an attribute (in an array), guided mode will be disabled for this attribute, even if you explicitly enabled it.
   * If guided mode is enabled the following behavior is added:
   * - Before the animation starts (even when delayed with `begin`) the animated attribute will be set already to the `from` value of the animation
   * - `begin` is explicitly set to `indefinite` so it can be started manually without relying on document begin time (creation)
   * - The animate element will be forced to use `fill="freeze"`
   * - The animation will be triggered with `beginElement()` in a timeout where `begin` of the definition object is interpreted in milli seconds. If no `begin` was specified the timeout is triggered immediately.
   * - After the animation the element attribute value will be set to the `to` value of the animation
   * - The animate element is deleted from the DOM
   *
   * @memberof Chartist.Svg
   * @param {Object} animations An animations object where the property keys are the attributes you'd like to animate. The properties should be objects again that contain the SMIL animation attributes (usually begin, dur, from, and to). The property begin and dur is auto converted (see Automatic unit conversion). You can also schedule multiple animations for the same attribute by passing an Array of SMIL definition objects. Attributes that contain an array of SMIL definition objects will not be executed in guided mode.
   * @param {Boolean} guided Specify if guided mode should be activated for this animation (see Guided mode). If not otherwise specified, guided mode will be activated.
   * @param {Object} eventEmitter If specified, this event emitter will be notified when an animation starts or ends.
   * @return {Chartist.Svg} The current element where the animation was added
   */
  function animate(animations, guided, eventEmitter) {
    if(guided === undefined) {
      guided = true;
    }

    Object.keys(animations).forEach(function createAnimateForAttributes(attribute) {

      function createAnimate(animationDefinition, guided) {
        var attributeProperties = {},
          animate,
          timeout,
          easing;

        // Check if an easing is specified in the definition object and delete it from the object as it will not
        // be part of the animate element attributes.
        if(animationDefinition.easing) {
          // If already an easing Bézier curve array we take it or we lookup a easing array in the Easing object
          easing = animationDefinition.easing instanceof Array ?
            animationDefinition.easing :
            Chartist.Svg.Easing[animationDefinition.easing];
          delete animationDefinition.easing;
        }

        // If numeric dur or begin was provided we assume milli seconds
        animationDefinition.begin = Chartist.ensureUnit(animationDefinition.begin, 'ms');
        animationDefinition.dur = Chartist.ensureUnit(animationDefinition.dur, 'ms');

        if(easing) {
          animationDefinition.calcMode = 'spline';
          animationDefinition.keySplines = easing.join(' ');
          animationDefinition.keyTimes = '0;1';
        }

        // Adding "fill: freeze" if we are in guided mode and set initial attribute values
        if(guided) {
          animationDefinition.fill = 'freeze';
          // Animated property on our element should already be set to the animation from value in guided mode
          attributeProperties[attribute] = animationDefinition.from;
          this.attr(attributeProperties);

          // In guided mode we also set begin to indefinite so we can trigger the start manually and put the begin
          // which needs to be in ms aside
          timeout = Chartist.quantity(animationDefinition.begin || 0).value;
          animationDefinition.begin = 'indefinite';
        }

        animate = this.elem('animate', Chartist.extend({
          attributeName: attribute
        }, animationDefinition));

        if(guided) {
          // If guided we take the value that was put aside in timeout and trigger the animation manually with a timeout
          setTimeout(function() {
            // If beginElement fails we set the animated attribute to the end position and remove the animate element
            // This happens if the SMIL ElementTimeControl interface is not supported or any other problems occured in
            // the browser. (Currently FF 34 does not support animate elements in foreignObjects)
            try {
              animate._node.beginElement();
            } catch(err) {
              // Set animated attribute to current animated value
              attributeProperties[attribute] = animationDefinition.to;
              this.attr(attributeProperties);
              // Remove the animate element as it's no longer required
              animate.remove();
            }
          }.bind(this), timeout);
        }

        if(eventEmitter) {
          animate._node.addEventListener('beginEvent', function handleBeginEvent() {
            eventEmitter.emit('animationBegin', {
              element: this,
              animate: animate._node,
              params: animationDefinition
            });
          }.bind(this));
        }

        animate._node.addEventListener('endEvent', function handleEndEvent() {
          if(eventEmitter) {
            eventEmitter.emit('animationEnd', {
              element: this,
              animate: animate._node,
              params: animationDefinition
            });
          }

          if(guided) {
            // Set animated attribute to current animated value
            attributeProperties[attribute] = animationDefinition.to;
            this.attr(attributeProperties);
            // Remove the animate element as it's no longer required
            animate.remove();
          }
        }.bind(this));
      }

      // If current attribute is an array of definition objects we create an animate for each and disable guided mode
      if(animations[attribute] instanceof Array) {
        animations[attribute].forEach(function(animationDefinition) {
          createAnimate.bind(this)(animationDefinition, false);
        }.bind(this));
      } else {
        createAnimate.bind(this)(animations[attribute], guided);
      }

    }.bind(this));

    return this;
  }

  Chartist.Svg = Chartist.Class.extend({
    constructor: Svg,
    attr: attr,
    elem: elem,
    parent: parent,
    root: root,
    querySelector: querySelector,
    querySelectorAll: querySelectorAll,
    foreignObject: foreignObject,
    text: text,
    empty: empty,
    remove: remove,
    replace: replace,
    append: append,
    classes: classes,
    addClass: addClass,
    removeClass: removeClass,
    removeAllClasses: removeAllClasses,
    height: height,
    width: width,
    animate: animate
  });

  /**
   * This method checks for support of a given SVG feature like Extensibility, SVG-animation or the like. Check http://www.w3.org/TR/SVG11/feature for a detailed list.
   *
   * @memberof Chartist.Svg
   * @param {String} feature The SVG 1.1 feature that should be checked for support.
   * @return {Boolean} True of false if the feature is supported or not
   */
  Chartist.Svg.isSupported = function(feature) {
    return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#' + feature, '1.1');
  };

  /**
   * This Object contains some standard easing cubic bezier curves. Then can be used with their name in the `Chartist.Svg.animate`. You can also extend the list and use your own name in the `animate` function. Click the show code button to see the available bezier functions.
   *
   * @memberof Chartist.Svg
   */
  var easingCubicBeziers = {
    easeInSine: [0.47, 0, 0.745, 0.715],
    easeOutSine: [0.39, 0.575, 0.565, 1],
    easeInOutSine: [0.445, 0.05, 0.55, 0.95],
    easeInQuad: [0.55, 0.085, 0.68, 0.53],
    easeOutQuad: [0.25, 0.46, 0.45, 0.94],
    easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
    easeInCubic: [0.55, 0.055, 0.675, 0.19],
    easeOutCubic: [0.215, 0.61, 0.355, 1],
    easeInOutCubic: [0.645, 0.045, 0.355, 1],
    easeInQuart: [0.895, 0.03, 0.685, 0.22],
    easeOutQuart: [0.165, 0.84, 0.44, 1],
    easeInOutQuart: [0.77, 0, 0.175, 1],
    easeInQuint: [0.755, 0.05, 0.855, 0.06],
    easeOutQuint: [0.23, 1, 0.32, 1],
    easeInOutQuint: [0.86, 0, 0.07, 1],
    easeInExpo: [0.95, 0.05, 0.795, 0.035],
    easeOutExpo: [0.19, 1, 0.22, 1],
    easeInOutExpo: [1, 0, 0, 1],
    easeInCirc: [0.6, 0.04, 0.98, 0.335],
    easeOutCirc: [0.075, 0.82, 0.165, 1],
    easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
    easeInBack: [0.6, -0.28, 0.735, 0.045],
    easeOutBack: [0.175, 0.885, 0.32, 1.275],
    easeInOutBack: [0.68, -0.55, 0.265, 1.55]
  };

  Chartist.Svg.Easing = easingCubicBeziers;

  /**
   * This helper class is to wrap multiple `Chartist.Svg` elements into a list where you can call the `Chartist.Svg` functions on all elements in the list with one call. This is helpful when you'd like to perform calls with `Chartist.Svg` on multiple elements.
   * An instance of this class is also returned by `Chartist.Svg.querySelectorAll`.
   *
   * @memberof Chartist.Svg
   * @param {Array<Node>|NodeList} nodeList An Array of SVG DOM nodes or a SVG DOM NodeList (as returned by document.querySelectorAll)
   * @constructor
   */
  function SvgList(nodeList) {
    var list = this;

    this.svgElements = [];
    for(var i = 0; i < nodeList.length; i++) {
      this.svgElements.push(new Chartist.Svg(nodeList[i]));
    }

    // Add delegation methods for Chartist.Svg
    Object.keys(Chartist.Svg.prototype).filter(function(prototypeProperty) {
      return ['constructor',
          'parent',
          'querySelector',
          'querySelectorAll',
          'replace',
          'append',
          'classes',
          'height',
          'width'].indexOf(prototypeProperty) === -1;
    }).forEach(function(prototypeProperty) {
      list[prototypeProperty] = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        list.svgElements.forEach(function(element) {
          Chartist.Svg.prototype[prototypeProperty].apply(element, args);
        });
        return list;
      };
    });
  }

  Chartist.Svg.List = Chartist.Class.extend({
    constructor: SvgList
  });
}(window, document, Chartist));
;/**
 * Chartist SVG path module for SVG path description creation and modification.
 *
 * @module Chartist.Svg.Path
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  /**
   * Contains the descriptors of supported element types in a SVG path. Currently only move, line and curve are supported.
   *
   * @memberof Chartist.Svg.Path
   * @type {Object}
   */
  var elementDescriptions = {
    m: ['x', 'y'],
    l: ['x', 'y'],
    c: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
    a: ['rx', 'ry', 'xAr', 'lAf', 'sf', 'x', 'y']
  };

  /**
   * Default options for newly created SVG path objects.
   *
   * @memberof Chartist.Svg.Path
   * @type {Object}
   */
  var defaultOptions = {
    // The accuracy in digit count after the decimal point. This will be used to round numbers in the SVG path. If this option is set to false then no rounding will be performed.
    accuracy: 3
  };

  function element(command, params, pathElements, pos, relative, data) {
    var pathElement = Chartist.extend({
      command: relative ? command.toLowerCase() : command.toUpperCase()
    }, params, data ? { data: data } : {} );

    pathElements.splice(pos, 0, pathElement);
  }

  function forEachParam(pathElements, cb) {
    pathElements.forEach(function(pathElement, pathElementIndex) {
      elementDescriptions[pathElement.command.toLowerCase()].forEach(function(paramName, paramIndex) {
        cb(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
      });
    });
  }

  /**
   * Used to construct a new path object.
   *
   * @memberof Chartist.Svg.Path
   * @param {Boolean} close If set to true then this path will be closed when stringified (with a Z at the end)
   * @param {Object} options Options object that overrides the default objects. See default options for more details.
   * @constructor
   */
  function SvgPath(close, options) {
    this.pathElements = [];
    this.pos = 0;
    this.close = close;
    this.options = Chartist.extend({}, defaultOptions, options);
  }

  /**
   * Gets or sets the current position (cursor) inside of the path. You can move around the cursor freely but limited to 0 or the count of existing elements. All modifications with element functions will insert new elements at the position of this cursor.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} [pos] If a number is passed then the cursor is set to this position in the path element array.
   * @return {Chartist.Svg.Path|Number} If the position parameter was passed then the return value will be the path object for easy call chaining. If no position parameter was passed then the current position is returned.
   */
  function position(pos) {
    if(pos !== undefined) {
      this.pos = Math.max(0, Math.min(this.pathElements.length, pos));
      return this;
    } else {
      return this.pos;
    }
  }

  /**
   * Removes elements from the path starting at the current position.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} count Number of path elements that should be removed from the current position.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function remove(count) {
    this.pathElements.splice(this.pos, count);
    return this;
  }

  /**
   * Use this function to add a new move SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The x coordinate for the move element.
   * @param {Number} y The y coordinate for the move element.
   * @param {Boolean} [relative] If set to true the move element will be created with relative coordinates (lowercase letter)
   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function move(x, y, relative, data) {
    element('M', {
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative, data);
    return this;
  }

  /**
   * Use this function to add a new line SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The x coordinate for the line element.
   * @param {Number} y The y coordinate for the line element.
   * @param {Boolean} [relative] If set to true the line element will be created with relative coordinates (lowercase letter)
   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function line(x, y, relative, data) {
    element('L', {
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative, data);
    return this;
  }

  /**
   * Use this function to add a new curve SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x1 The x coordinate for the first control point of the bezier curve.
   * @param {Number} y1 The y coordinate for the first control point of the bezier curve.
   * @param {Number} x2 The x coordinate for the second control point of the bezier curve.
   * @param {Number} y2 The y coordinate for the second control point of the bezier curve.
   * @param {Number} x The x coordinate for the target point of the curve element.
   * @param {Number} y The y coordinate for the target point of the curve element.
   * @param {Boolean} [relative] If set to true the curve element will be created with relative coordinates (lowercase letter)
   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function curve(x1, y1, x2, y2, x, y, relative, data) {
    element('C', {
      x1: +x1,
      y1: +y1,
      x2: +x2,
      y2: +y2,
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative, data);
    return this;
  }

  /**
   * Use this function to add a new non-bezier curve SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} rx The radius to be used for the x-axis of the arc.
   * @param {Number} ry The radius to be used for the y-axis of the arc.
   * @param {Number} xAr Defines the orientation of the arc
   * @param {Number} lAf Large arc flag
   * @param {Number} sf Sweep flag
   * @param {Number} x The x coordinate for the target point of the curve element.
   * @param {Number} y The y coordinate for the target point of the curve element.
   * @param {Boolean} [relative] If set to true the curve element will be created with relative coordinates (lowercase letter)
   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function arc(rx, ry, xAr, lAf, sf, x, y, relative, data) {
    element('A', {
      rx: +rx,
      ry: +ry,
      xAr: +xAr,
      lAf: +lAf,
      sf: +sf,
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative, data);
    return this;
  }

  /**
   * Parses an SVG path seen in the d attribute of path elements, and inserts the parsed elements into the existing path object at the current cursor position. Any closing path indicators (Z at the end of the path) will be ignored by the parser as this is provided by the close option in the options of the path object.
   *
   * @memberof Chartist.Svg.Path
   * @param {String} path Any SVG path that contains move (m), line (l) or curve (c) components.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function parse(path) {
    // Parsing the SVG path string into an array of arrays [['M', '10', '10'], ['L', '100', '100']]
    var chunks = path.replace(/([A-Za-z])([0-9])/g, '$1 $2')
      .replace(/([0-9])([A-Za-z])/g, '$1 $2')
      .split(/[\s,]+/)
      .reduce(function(result, element) {
        if(element.match(/[A-Za-z]/)) {
          result.push([]);
        }

        result[result.length - 1].push(element);
        return result;
      }, []);

    // If this is a closed path we remove the Z at the end because this is determined by the close option
    if(chunks[chunks.length - 1][0].toUpperCase() === 'Z') {
      chunks.pop();
    }

    // Using svgPathElementDescriptions to map raw path arrays into objects that contain the command and the parameters
    // For example {command: 'M', x: '10', y: '10'}
    var elements = chunks.map(function(chunk) {
        var command = chunk.shift(),
          description = elementDescriptions[command.toLowerCase()];

        return Chartist.extend({
          command: command
        }, description.reduce(function(result, paramName, index) {
          result[paramName] = +chunk[index];
          return result;
        }, {}));
      });

    // Preparing a splice call with the elements array as var arg params and insert the parsed elements at the current position
    var spliceArgs = [this.pos, 0];
    Array.prototype.push.apply(spliceArgs, elements);
    Array.prototype.splice.apply(this.pathElements, spliceArgs);
    // Increase the internal position by the element count
    this.pos += elements.length;

    return this;
  }

  /**
   * This function renders to current SVG path object into a final SVG string that can be used in the d attribute of SVG path elements. It uses the accuracy option to round big decimals. If the close parameter was set in the constructor of this path object then a path closing Z will be appended to the output string.
   *
   * @memberof Chartist.Svg.Path
   * @return {String}
   */
  function stringify() {
    var accuracyMultiplier = Math.pow(10, this.options.accuracy);

    return this.pathElements.reduce(function(path, pathElement) {
        var params = elementDescriptions[pathElement.command.toLowerCase()].map(function(paramName) {
          return this.options.accuracy ?
            (Math.round(pathElement[paramName] * accuracyMultiplier) / accuracyMultiplier) :
            pathElement[paramName];
        }.bind(this));

        return path + pathElement.command + params.join(',');
      }.bind(this), '') + (this.close ? 'Z' : '');
  }

  /**
   * Scales all elements in the current SVG path object. There is an individual parameter for each coordinate. Scaling will also be done for control points of curves, affecting the given coordinate.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The number which will be used to scale the x, x1 and x2 of all path elements.
   * @param {Number} y The number which will be used to scale the y, y1 and y2 of all path elements.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function scale(x, y) {
    forEachParam(this.pathElements, function(pathElement, paramName) {
      pathElement[paramName] *= paramName[0] === 'x' ? x : y;
    });
    return this;
  }

  /**
   * Translates all elements in the current SVG path object. The translation is relative and there is an individual parameter for each coordinate. Translation will also be done for control points of curves, affecting the given coordinate.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The number which will be used to translate the x, x1 and x2 of all path elements.
   * @param {Number} y The number which will be used to translate the y, y1 and y2 of all path elements.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function translate(x, y) {
    forEachParam(this.pathElements, function(pathElement, paramName) {
      pathElement[paramName] += paramName[0] === 'x' ? x : y;
    });
    return this;
  }

  /**
   * This function will run over all existing path elements and then loop over their attributes. The callback function will be called for every path element attribute that exists in the current path.
   * The method signature of the callback function looks like this:
   * ```javascript
   * function(pathElement, paramName, pathElementIndex, paramIndex, pathElements)
   * ```
   * If something else than undefined is returned by the callback function, this value will be used to replace the old value. This allows you to build custom transformations of path objects that can't be achieved using the basic transformation functions scale and translate.
   *
   * @memberof Chartist.Svg.Path
   * @param {Function} transformFnc The callback function for the transformation. Check the signature in the function description.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function transform(transformFnc) {
    forEachParam(this.pathElements, function(pathElement, paramName, pathElementIndex, paramIndex, pathElements) {
      var transformed = transformFnc(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
      if(transformed || transformed === 0) {
        pathElement[paramName] = transformed;
      }
    });
    return this;
  }

  /**
   * This function clones a whole path object with all its properties. This is a deep clone and path element objects will also be cloned.
   *
   * @memberof Chartist.Svg.Path
   * @param {Boolean} [close] Optional option to set the new cloned path to closed. If not specified or false, the original path close option will be used.
   * @return {Chartist.Svg.Path}
   */
  function clone(close) {
    var c = new Chartist.Svg.Path(close || this.close);
    c.pos = this.pos;
    c.pathElements = this.pathElements.slice().map(function cloneElements(pathElement) {
      return Chartist.extend({}, pathElement);
    });
    c.options = Chartist.extend({}, this.options);
    return c;
  }

  /**
   * Split a Svg.Path object by a specific command in the path chain. The path chain will be split and an array of newly created paths objects will be returned. This is useful if you'd like to split an SVG path by it's move commands, for example, in order to isolate chunks of drawings.
   *
   * @memberof Chartist.Svg.Path
   * @param {String} command The command you'd like to use to split the path
   * @return {Array<Chartist.Svg.Path>}
   */
  function splitByCommand(command) {
    var split = [
      new Chartist.Svg.Path()
    ];

    this.pathElements.forEach(function(pathElement) {
      if(pathElement.command === command.toUpperCase() && split[split.length - 1].pathElements.length !== 0) {
        split.push(new Chartist.Svg.Path());
      }

      split[split.length - 1].pathElements.push(pathElement);
    });

    return split;
  }

  /**
   * This static function on `Chartist.Svg.Path` is joining multiple paths together into one paths.
   *
   * @memberof Chartist.Svg.Path
   * @param {Array<Chartist.Svg.Path>} paths A list of paths to be joined together. The order is important.
   * @param {boolean} close If the newly created path should be a closed path
   * @param {Object} options Path options for the newly created path.
   * @return {Chartist.Svg.Path}
   */

  function join(paths, close, options) {
    var joinedPath = new Chartist.Svg.Path(close, options);
    for(var i = 0; i < paths.length; i++) {
      var path = paths[i];
      for(var j = 0; j < path.pathElements.length; j++) {
        joinedPath.pathElements.push(path.pathElements[j]);
      }
    }
    return joinedPath;
  }

  Chartist.Svg.Path = Chartist.Class.extend({
    constructor: SvgPath,
    position: position,
    remove: remove,
    move: move,
    line: line,
    curve: curve,
    arc: arc,
    scale: scale,
    translate: translate,
    transform: transform,
    parse: parse,
    stringify: stringify,
    clone: clone,
    splitByCommand: splitByCommand
  });

  Chartist.Svg.Path.elementDescriptions = elementDescriptions;
  Chartist.Svg.Path.join = join;
}(window, document, Chartist));
;/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  var axisUnits = {
    x: {
      pos: 'x',
      len: 'width',
      dir: 'horizontal',
      rectStart: 'x1',
      rectEnd: 'x2',
      rectOffset: 'y2'
    },
    y: {
      pos: 'y',
      len: 'height',
      dir: 'vertical',
      rectStart: 'y2',
      rectEnd: 'y1',
      rectOffset: 'x1'
    }
  };

  function Axis(units, chartRect, ticks, options) {
    this.units = units;
    this.counterUnits = units === axisUnits.x ? axisUnits.y : axisUnits.x;
    this.chartRect = chartRect;
    this.axisLength = chartRect[units.rectEnd] - chartRect[units.rectStart];
    this.gridOffset = chartRect[units.rectOffset];
    this.ticks = ticks;
    this.options = options;
  }

  function createGridAndLabels(gridGroup, labelGroup, useForeignObject, chartOptions, eventEmitter) {
    var axisOptions = chartOptions['axis' + this.units.pos.toUpperCase()];
    var projectedValues = this.ticks.map(this.projectValue.bind(this));
    var labelValues = this.ticks.map(axisOptions.labelInterpolationFnc);

    projectedValues.forEach(function(projectedValue, index) {
      var labelOffset = {
        x: 0,
        y: 0
      };

      // TODO: Find better solution for solving this problem
      // Calculate how much space we have available for the label
      var labelLength;
      if(projectedValues[index + 1]) {
        // If we still have one label ahead, we can calculate the distance to the next tick / label
        labelLength = projectedValues[index + 1] - projectedValue;
      } else {
        // If we don't have a label ahead and we have only two labels in total, we just take the remaining distance to
        // on the whole axis length. We limit that to a minimum of 30 pixel, so that labels close to the border will
        // still be visible inside of the chart padding.
        labelLength = Math.max(this.axisLength - projectedValue, 30);
      }

      // Skip grid lines and labels where interpolated label values are falsey (execpt for 0)
      if(!labelValues[index] && labelValues[index] !== 0) {
        return;
      }

      // Transform to global coordinates using the chartRect
      // We also need to set the label offset for the createLabel function
      if(this.units.pos === 'x') {
        projectedValue = this.chartRect.x1 + projectedValue;
        labelOffset.x = chartOptions.axisX.labelOffset.x;

        // If the labels should be positioned in start position (top side for vertical axis) we need to set a
        // different offset as for positioned with end (bottom)
        if(chartOptions.axisX.position === 'start') {
          labelOffset.y = this.chartRect.padding.top + chartOptions.axisX.labelOffset.y + (useForeignObject ? 5 : 20);
        } else {
          labelOffset.y = this.chartRect.y1 + chartOptions.axisX.labelOffset.y + (useForeignObject ? 5 : 20);
        }
      } else {
        projectedValue = this.chartRect.y1 - projectedValue;
        labelOffset.y = chartOptions.axisY.labelOffset.y - (useForeignObject ? labelLength : 0);

        // If the labels should be positioned in start position (left side for horizontal axis) we need to set a
        // different offset as for positioned with end (right side)
        if(chartOptions.axisY.position === 'start') {
          labelOffset.x = useForeignObject ? this.chartRect.padding.left + chartOptions.axisY.labelOffset.x : this.chartRect.x1 - 10;
        } else {
          labelOffset.x = this.chartRect.x2 + chartOptions.axisY.labelOffset.x + 10;
        }
      }

      if(axisOptions.showGrid) {
        Chartist.createGrid(projectedValue, index, this, this.gridOffset, this.chartRect[this.counterUnits.len](), gridGroup, [
          chartOptions.classNames.grid,
          chartOptions.classNames[this.units.dir]
        ], eventEmitter);
      }

      if(axisOptions.showLabel) {
        Chartist.createLabel(projectedValue, labelLength, index, labelValues, this, axisOptions.offset, labelOffset, labelGroup, [
          chartOptions.classNames.label,
          chartOptions.classNames[this.units.dir],
          chartOptions.classNames[axisOptions.position]
        ], useForeignObject, eventEmitter);
      }
    }.bind(this));
  }

  Chartist.Axis = Chartist.Class.extend({
    constructor: Axis,
    createGridAndLabels: createGridAndLabels,
    projectValue: function(value, index, data) {
      throw new Error('Base axis can\'t be instantiated!');
    }
  });

  Chartist.Axis.units = axisUnits;

}(window, document, Chartist));
;/**
 * The auto scale axis uses standard linear scale projection of values along an axis. It uses order of magnitude to find a scale automatically and evaluates the available space in order to find the perfect amount of ticks for your chart.
 * **Options**
 * The following options are used by this axis in addition to the default axis options outlined in the axis configuration of the chart default settings.
 * ```javascript
 * var options = {
 *   // If high is specified then the axis will display values explicitly up to this value and the computed maximum from the data is ignored
 *   high: 100,
 *   // If low is specified then the axis will display values explicitly down to this value and the computed minimum from the data is ignored
 *   low: 0,
 *   // This option will be used when finding the right scale division settings. The amount of ticks on the scale will be determined so that as many ticks as possible will be displayed, while not violating this minimum required space (in pixel).
 *   scaleMinSpace: 20,
 *   // Can be set to true or false. If set to true, the scale will be generated with whole numbers only.
 *   onlyInteger: true,
 *   // The reference value can be used to make sure that this value will always be on the chart. This is especially useful on bipolar charts where the bipolar center always needs to be part of the chart.
 *   referenceValue: 5
 * };
 * ```
 *
 * @module Chartist.AutoScaleAxis
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  function AutoScaleAxis(axisUnit, data, chartRect, options) {
    // Usually we calculate highLow based on the data but this can be overriden by a highLow object in the options
    var highLow = options.highLow || Chartist.getHighLow(data.normalized, options, axisUnit.pos);
    this.bounds = Chartist.getBounds(chartRect[axisUnit.rectEnd] - chartRect[axisUnit.rectStart], highLow, options.scaleMinSpace || 20, options.onlyInteger);
    this.range = {
      min: this.bounds.min,
      max: this.bounds.max
    };

    Chartist.AutoScaleAxis.super.constructor.call(this,
      axisUnit,
      chartRect,
      this.bounds.values,
      options);
  }

  function projectValue(value) {
    return this.axisLength * (+Chartist.getMultiValue(value, this.units.pos) - this.bounds.min) / this.bounds.range;
  }

  Chartist.AutoScaleAxis = Chartist.Axis.extend({
    constructor: AutoScaleAxis,
    projectValue: projectValue
  });

}(window, document, Chartist));
;/**
 * The fixed scale axis uses standard linear projection of values along an axis. It makes use of a divisor option to divide the range provided from the minimum and maximum value or the options high and low that will override the computed minimum and maximum.
 * **Options**
 * The following options are used by this axis in addition to the default axis options outlined in the axis configuration of the chart default settings.
 * ```javascript
 * var options = {
 *   // If high is specified then the axis will display values explicitly up to this value and the computed maximum from the data is ignored
 *   high: 100,
 *   // If low is specified then the axis will display values explicitly down to this value and the computed minimum from the data is ignored
 *   low: 0,
 *   // If specified then the value range determined from minimum to maximum (or low and high) will be divided by this number and ticks will be generated at those division points. The default divisor is 1.
 *   divisor: 4,
 *   // If ticks is explicitly set, then the axis will not compute the ticks with the divisor, but directly use the data in ticks to determine at what points on the axis a tick need to be generated.
 *   ticks: [1, 10, 20, 30]
 * };
 * ```
 *
 * @module Chartist.FixedScaleAxis
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  function FixedScaleAxis(axisUnit, data, chartRect, options) {
    var highLow = options.highLow || Chartist.getHighLow(data.normalized, options, axisUnit.pos);
    this.divisor = options.divisor || 1;
    this.ticks = options.ticks || Chartist.times(this.divisor).map(function(value, index) {
      return highLow.low + (highLow.high - highLow.low) / this.divisor * index;
    }.bind(this));
    this.ticks.sort(function(a, b) {
      return a - b;
    });
    this.range = {
      min: highLow.low,
      max: highLow.high
    };

    Chartist.FixedScaleAxis.super.constructor.call(this,
      axisUnit,
      chartRect,
      this.ticks,
      options);

    this.stepLength = this.axisLength / this.divisor;
  }

  function projectValue(value) {
    return this.axisLength * (+Chartist.getMultiValue(value, this.units.pos) - this.range.min) / (this.range.max - this.range.min);
  }

  Chartist.FixedScaleAxis = Chartist.Axis.extend({
    constructor: FixedScaleAxis,
    projectValue: projectValue
  });

}(window, document, Chartist));
;/**
 * The step axis for step based charts like bar chart or step based line charts. It uses a fixed amount of ticks that will be equally distributed across the whole axis length. The projection is done using the index of the data value rather than the value itself and therefore it's only useful for distribution purpose.
 * **Options**
 * The following options are used by this axis in addition to the default axis options outlined in the axis configuration of the chart default settings.
 * ```javascript
 * var options = {
 *   // Ticks to be used to distribute across the axis length. As this axis type relies on the index of the value rather than the value, arbitrary data that can be converted to a string can be used as ticks.
 *   ticks: ['One', 'Two', 'Three'],
 *   // If set to true the full width will be used to distribute the values where the last value will be at the maximum of the axis length. If false the spaces between the ticks will be evenly distributed instead.
 *   stretch: true
 * };
 * ```
 *
 * @module Chartist.StepAxis
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  function StepAxis(axisUnit, data, chartRect, options) {
    Chartist.StepAxis.super.constructor.call(this,
      axisUnit,
      chartRect,
      options.ticks,
      options);

    this.stepLength = this.axisLength / (options.ticks.length - (options.stretch ? 1 : 0));
  }

  function projectValue(value, index) {
    return this.stepLength * index;
  }

  Chartist.StepAxis = Chartist.Axis.extend({
    constructor: StepAxis,
    projectValue: projectValue
  });

}(window, document, Chartist));
;/**
 * The Chartist line chart can be used to draw Line or Scatter charts. If used in the browser you can access the global `Chartist` namespace where you find the `Line` function as a main entry point.
 *
 * For examples on how to use the line chart please check the examples of the `Chartist.Line` method.
 *
 * @module Chartist.Line
 */
/* global Chartist */
(function(window, document, Chartist){
  'use strict';

  /**
   * Default options in line charts. Expand the code view to see a detailed list of options with comments.
   *
   * @memberof Chartist.Line
   */
  var defaultOptions = {
    // Options for X-Axis
    axisX: {
      // The offset of the labels to the chart area
      offset: 30,
      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
      position: 'end',
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // Set the axis type to be used to project values on this axis. If not defined, Chartist.StepAxis will be used for the X-Axis, where the ticks option will be set to the labels in the data and the stretch option will be set to the global fullWidth option. This type can be changed to any axis constructor available (e.g. Chartist.FixedScaleAxis), where all axis options should be present here.
      type: undefined
    },
    // Options for Y-Axis
    axisY: {
      // The offset of the labels to the chart area
      offset: 40,
      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
      position: 'start',
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // Set the axis type to be used to project values on this axis. If not defined, Chartist.AutoScaleAxis will be used for the Y-Axis, where the high and low options will be set to the global high and low options. This type can be changed to any axis constructor available (e.g. Chartist.FixedScaleAxis), where all axis options should be present here.
      type: undefined,
      // This value specifies the minimum height in pixel of the scale steps
      scaleMinSpace: 20,
      // Use only integer values (whole numbers) for the scale steps
      onlyInteger: false
    },
    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
    width: undefined,
    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
    height: undefined,
    // If the line should be drawn or not
    showLine: true,
    // If dots should be drawn or not
    showPoint: true,
    // If the line chart should draw an area
    showArea: false,
    // The base for the area chart that will be used to close the area shape (is normally 0)
    areaBase: 0,
    // Specify if the lines should be smoothed. This value can be true or false where true will result in smoothing using the default smoothing interpolation function Chartist.Interpolation.cardinal and false results in Chartist.Interpolation.none. You can also choose other smoothing / interpolation functions available in the Chartist.Interpolation module, or write your own interpolation function. Check the examples for a brief description.
    lineSmooth: true,
    // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
    low: undefined,
    // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
    high: undefined,
    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
    chartPadding: {
      top: 15,
      right: 15,
      bottom: 5,
      left: 10
    },
    // When set to true, the last grid line on the x-axis is not drawn and the chart elements will expand to the full available width of the chart. For the last label to be drawn correctly you might need to add chart padding or offset the last label with a draw event handler.
    fullWidth: false,
    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
    reverseData: false,
    // Override the class names that get used to generate the SVG structure of the chart
    classNames: {
      chart: 'ct-chart-line',
      label: 'ct-label',
      labelGroup: 'ct-labels',
      series: 'ct-series',
      line: 'ct-line',
      point: 'ct-point',
      area: 'ct-area',
      grid: 'ct-grid',
      gridGroup: 'ct-grids',
      vertical: 'ct-vertical',
      horizontal: 'ct-horizontal',
      start: 'ct-start',
      end: 'ct-end'
    }
  };

  /**
   * Creates a new chart
   *
   */
  function createChart(options) {
    var data = {
      raw: this.data,
      normalized: Chartist.getDataArray(this.data, options.reverseData, true)
    };

    // Create new svg object
    this.svg = Chartist.createSvg(this.container, options.width, options.height, options.classNames.chart);
    // Create groups for labels, grid and series
    var gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup);
    var seriesGroup = this.svg.elem('g');
    var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup);

    var chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);
    var axisX, axisY;

    if(options.axisX.type === undefined) {
      axisX = new Chartist.StepAxis(Chartist.Axis.units.x, data, chartRect, Chartist.extend({}, options.axisX, {
        ticks: data.raw.labels,
        stretch: options.fullWidth
      }));
    } else {
      axisX = options.axisX.type.call(Chartist, Chartist.Axis.units.x, data, chartRect, options.axisX);
    }

    if(options.axisY.type === undefined) {
      axisY = new Chartist.AutoScaleAxis(Chartist.Axis.units.y, data, chartRect, Chartist.extend({}, options.axisY, {
        high: Chartist.isNum(options.high) ? options.high : options.axisY.high,
        low: Chartist.isNum(options.low) ? options.low : options.axisY.low
      }));
    } else {
      axisY = options.axisY.type.call(Chartist, Chartist.Axis.units.y, data, chartRect, options.axisY);
    }

    axisX.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);
    axisY.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);

    // Draw the series
    data.raw.series.forEach(function(series, seriesIndex) {
      var seriesElement = seriesGroup.elem('g');

      // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
      seriesElement.attr({
        'series-name': series.name,
        'meta': Chartist.serialize(series.meta)
      }, Chartist.xmlNs.uri);

      // Use series class from series data or if not set generate one
      seriesElement.addClass([
        options.classNames.series,
        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
      ].join(' '));

      var pathCoordinates = [],
        pathData = [];

      data.normalized[seriesIndex].forEach(function(value, valueIndex) {
        var p = {
          x: chartRect.x1 + axisX.projectValue(value, valueIndex, data.normalized[seriesIndex]),
          y: chartRect.y1 - axisY.projectValue(value, valueIndex, data.normalized[seriesIndex])
        };
        pathCoordinates.push(p.x, p.y);
        pathData.push({
          value: value,
          valueIndex: valueIndex,
          meta: Chartist.getMetaData(series, valueIndex)
        });
      }.bind(this));

      var seriesOptions = {
        lineSmooth: Chartist.getSeriesOption(series, options, 'lineSmooth'),
        showPoint: Chartist.getSeriesOption(series, options, 'showPoint'),
        showLine: Chartist.getSeriesOption(series, options, 'showLine'),
        showArea: Chartist.getSeriesOption(series, options, 'showArea'),
        areaBase: Chartist.getSeriesOption(series, options, 'areaBase')
      };

      var smoothing = typeof seriesOptions.lineSmooth === 'function' ?
        seriesOptions.lineSmooth : (seriesOptions.lineSmooth ? Chartist.Interpolation.cardinal() : Chartist.Interpolation.none());
      // Interpolating path where pathData will be used to annotate each path element so we can trace back the original
      // index, value and meta data
      var path = smoothing(pathCoordinates, pathData);

      // If we should show points we need to create them now to avoid secondary loop
      // Points are drawn from the pathElements returned by the interpolation function
      // Small offset for Firefox to render squares correctly
      if (seriesOptions.showPoint) {

        path.pathElements.forEach(function(pathElement) {
          var point = seriesElement.elem('line', {
            x1: pathElement.x,
            y1: pathElement.y,
            x2: pathElement.x + 0.01,
            y2: pathElement.y
          }, options.classNames.point).attr({
            'value': [pathElement.data.value.x, pathElement.data.value.y].filter(function(v) {
                return v;
              }).join(','),
            'meta': pathElement.data.meta
          }, Chartist.xmlNs.uri);

          this.eventEmitter.emit('draw', {
            type: 'point',
            value: pathElement.data.value,
            index: pathElement.data.valueIndex,
            meta: pathElement.data.meta,
            series: series,
            seriesIndex: seriesIndex,
            axisX: axisX,
            axisY: axisY,
            group: seriesElement,
            element: point,
            x: pathElement.x,
            y: pathElement.y
          });
        }.bind(this));
      }

      if(seriesOptions.showLine) {
        var line = seriesElement.elem('path', {
          d: path.stringify()
        }, options.classNames.line, true);

        this.eventEmitter.emit('draw', {
          type: 'line',
          values: data.normalized[seriesIndex],
          path: path.clone(),
          chartRect: chartRect,
          index: seriesIndex,
          series: series,
          seriesIndex: seriesIndex,
          axisX: axisX,
          axisY: axisY,
          group: seriesElement,
          element: line
        });
      }

      // Area currently only works with axes that support a range!
      if(seriesOptions.showArea && axisY.range) {
        // If areaBase is outside the chart area (< min or > max) we need to set it respectively so that
        // the area is not drawn outside the chart area.
        var areaBase = Math.max(Math.min(seriesOptions.areaBase, axisY.range.max), axisY.range.min);

        // We project the areaBase value into screen coordinates
        var areaBaseProjected = chartRect.y1 - axisY.projectValue(areaBase);

        // In order to form the area we'll first split the path by move commands so we can chunk it up into segments
        path.splitByCommand('M').filter(function onlySolidSegments(pathSegment) {
          // We filter only "solid" segments that contain more than one point. Otherwise there's no need for an area
          return pathSegment.pathElements.length > 1;
        }).map(function convertToArea(solidPathSegments) {
          // Receiving the filtered solid path segments we can now convert those segments into fill areas
          var firstElement = solidPathSegments.pathElements[0];
          var lastElement = solidPathSegments.pathElements[solidPathSegments.pathElements.length - 1];

          // Cloning the solid path segment with closing option and removing the first move command from the clone
          // We then insert a new move that should start at the area base and draw a straight line up or down
          // at the end of the path we add an additional straight line to the projected area base value
          // As the closing option is set our path will be automatically closed
          return solidPathSegments.clone(true)
            .position(0)
            .remove(1)
            .move(firstElement.x, areaBaseProjected)
            .line(firstElement.x, firstElement.y)
            .position(solidPathSegments.pathElements.length + 1)
            .line(lastElement.x, areaBaseProjected);

        }).forEach(function createArea(areaPath) {
          // For each of our newly created area paths, we'll now create path elements by stringifying our path objects
          // and adding the created DOM elements to the correct series group
          var area = seriesElement.elem('path', {
            d: areaPath.stringify()
          }, options.classNames.area, true).attr({
            'values': data.normalized[seriesIndex]
          }, Chartist.xmlNs.uri);

          // Emit an event for each area that was drawn
          this.eventEmitter.emit('draw', {
            type: 'area',
            values: data.normalized[seriesIndex],
            path: areaPath.clone(),
            series: series,
            seriesIndex: seriesIndex,
            axisX: axisX,
            axisY: axisY,
            chartRect: chartRect,
            index: seriesIndex,
            group: seriesElement,
            element: area
          });
        }.bind(this));
      }
    }.bind(this));

    this.eventEmitter.emit('created', {
      bounds: axisY.bounds,
      chartRect: chartRect,
      axisX: axisX,
      axisY: axisY,
      svg: this.svg,
      options: options
    });
  }

  /**
   * This method creates a new line chart.
   *
   * @memberof Chartist.Line
   * @param {String|Node} query A selector query string or directly a DOM element
   * @param {Object} data The data object that needs to consist of a labels and a series array
   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
   * @return {Object} An object which exposes the API for the created chart
   *
   * @example
   * // Create a simple line chart
   * var data = {
   *   // A labels array that can contain any sort of values
   *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
   *   // Our series array that contains series objects or in this case series data arrays
   *   series: [
   *     [5, 2, 4, 2, 0]
   *   ]
   * };
   *
   * // As options we currently only set a static size of 300x200 px
   * var options = {
   *   width: '300px',
   *   height: '200px'
   * };
   *
   * // In the global name space Chartist we call the Line function to initialize a line chart. As a first parameter we pass in a selector where we would like to get our chart created. Second parameter is the actual data object and as a third parameter we pass in our options
   * new Chartist.Line('.ct-chart', data, options);
   *
   * @example
   * // Use specific interpolation function with configuration from the Chartist.Interpolation module
   *
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [
   *     [1, 1, 8, 1, 7]
   *   ]
   * }, {
   *   lineSmooth: Chartist.Interpolation.cardinal({
   *     tension: 0.2
   *   })
   * });
   *
   * @example
   * // Create a line chart with responsive options
   *
   * var data = {
   *   // A labels array that can contain any sort of values
   *   labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
   *   // Our series array that contains series objects or in this case series data arrays
   *   series: [
   *     [5, 2, 4, 2, 0]
   *   ]
   * };
   *
   * // In adition to the regular options we specify responsive option overrides that will override the default configutation based on the matching media queries.
   * var responsiveOptions = [
   *   ['screen and (min-width: 641px) and (max-width: 1024px)', {
   *     showPoint: false,
   *     axisX: {
   *       labelInterpolationFnc: function(value) {
   *         // Will return Mon, Tue, Wed etc. on medium screens
   *         return value.slice(0, 3);
   *       }
   *     }
   *   }],
   *   ['screen and (max-width: 640px)', {
   *     showLine: false,
   *     axisX: {
   *       labelInterpolationFnc: function(value) {
   *         // Will return M, T, W etc. on small screens
   *         return value[0];
   *       }
   *     }
   *   }]
   * ];
   *
   * new Chartist.Line('.ct-chart', data, null, responsiveOptions);
   *
   */
  function Line(query, data, options, responsiveOptions) {
    Chartist.Line.super.constructor.call(this,
      query,
      data,
      defaultOptions,
      Chartist.extend({}, defaultOptions, options),
      responsiveOptions);
  }

  // Creating line chart type in Chartist namespace
  Chartist.Line = Chartist.Base.extend({
    constructor: Line,
    createChart: createChart
  });

}(window, document, Chartist));
;/**
 * The bar chart module of Chartist that can be used to draw unipolar or bipolar bar and grouped bar charts.
 *
 * @module Chartist.Bar
 */
/* global Chartist */
(function(window, document, Chartist){
  'use strict';

  /**
   * Default options in bar charts. Expand the code view to see a detailed list of options with comments.
   *
   * @memberof Chartist.Bar
   */
  var defaultOptions = {
    // Options for X-Axis
    axisX: {
      // The offset of the chart drawing area to the border of the container
      offset: 30,
      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
      position: 'end',
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // This value specifies the minimum width in pixel of the scale steps
      scaleMinSpace: 30,
      // Use only integer values (whole numbers) for the scale steps
      onlyInteger: false
    },
    // Options for Y-Axis
    axisY: {
      // The offset of the chart drawing area to the border of the container
      offset: 40,
      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
      position: 'start',
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // This value specifies the minimum height in pixel of the scale steps
      scaleMinSpace: 20,
      // Use only integer values (whole numbers) for the scale steps
      onlyInteger: false
    },
    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
    width: undefined,
    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
    height: undefined,
    // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
    high: undefined,
    // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
    low: undefined,
    // Use only integer values (whole numbers) for the scale steps
    onlyInteger: false,
    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
    chartPadding: {
      top: 15,
      right: 15,
      bottom: 5,
      left: 10
    },
    // Specify the distance in pixel of bars in a group
    seriesBarDistance: 15,
    // If set to true this property will cause the series bars to be stacked. Check the `stackMode` option for further stacking options.
    stackBars: false,
    // If set to 'overlap' this property will force the stacked bars to draw from the zero line.
    // If set to 'accumulate' this property will form a total for each series point. This will also influence the y-axis and the overall bounds of the chart. In stacked mode the seriesBarDistance property will have no effect.
    stackMode: 'accumulate',
    // Inverts the axes of the bar chart in order to draw a horizontal bar chart. Be aware that you also need to invert your axis settings as the Y Axis will now display the labels and the X Axis the values.
    horizontalBars: false,
    // If set to true then each bar will represent a series and the data array is expected to be a one dimensional array of data values rather than a series array of series. This is useful if the bar chart should represent a profile rather than some data over time.
    distributeSeries: false,
    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
    reverseData: false,
    // Override the class names that get used to generate the SVG structure of the chart
    classNames: {
      chart: 'ct-chart-bar',
      horizontalBars: 'ct-horizontal-bars',
      label: 'ct-label',
      labelGroup: 'ct-labels',
      series: 'ct-series',
      bar: 'ct-bar',
      grid: 'ct-grid',
      gridGroup: 'ct-grids',
      vertical: 'ct-vertical',
      horizontal: 'ct-horizontal',
      start: 'ct-start',
      end: 'ct-end'
    }
  };

  /**
   * Creates a new chart
   *
   */
  function createChart(options) {
    var data = {
      raw: this.data,
      normalized: options.distributeSeries ? Chartist.getDataArray(this.data, options.reverseData, options.horizontalBars ? 'x' : 'y').map(function(value) {
        return [value];
      }) : Chartist.getDataArray(this.data, options.reverseData, options.horizontalBars ? 'x' : 'y')
    };

    var highLow;

    // Create new svg element
    this.svg = Chartist.createSvg(
      this.container,
      options.width,
      options.height,
      options.classNames.chart + (options.horizontalBars ? ' ' + options.classNames.horizontalBars : '')
    );

    // Drawing groups in correct order
    var gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup);
    var seriesGroup = this.svg.elem('g');
    var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup);

    if(options.stackBars) {
      // If stacked bars we need to calculate the high low from stacked values from each series
      var serialSums = Chartist.serialMap(data.normalized, function serialSums() {
        return Array.prototype.slice.call(arguments).map(function(value) {
          return value;
        }).reduce(function(prev, curr) {
          return {
            x: prev.x + curr.x || 0,
            y: prev.y + curr.y || 0
          };
        }, {x: 0, y: 0});
      });

      highLow = Chartist.getHighLow([serialSums], Chartist.extend({}, options, {
        referenceValue: 0
      }), options.horizontalBars ? 'x' : 'y');
    } else {
      highLow = Chartist.getHighLow(data.normalized, Chartist.extend({}, options, {
        referenceValue: 0
      }), options.horizontalBars ? 'x' : 'y');
    }
    // Overrides of high / low from settings
    highLow.high = +options.high || (options.high === 0 ? 0 : highLow.high);
    highLow.low = +options.low || (options.low === 0 ? 0 : highLow.low);

    var chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);

    var valueAxis,
      labelAxisTicks,
      labelAxis,
      axisX,
      axisY;

    // We need to set step count based on some options combinations
    if(options.distributeSeries && options.stackBars) {
      // If distributed series are enabled and bars need to be stacked, we'll only have one bar and therefore should
      // use only the first label for the step axis
      labelAxisTicks = data.raw.labels.slice(0, 1);
    } else {
      // If distributed series are enabled but stacked bars aren't, we should use the series labels
      // If we are drawing a regular bar chart with two dimensional series data, we just use the labels array
      // as the bars are normalized
      labelAxisTicks = data.raw.labels;
    }

    // Set labelAxis and valueAxis based on the horizontalBars setting. This setting will flip the axes if necessary.
    if(options.horizontalBars) {
      if(options.axisX.type === undefined) {
        valueAxis = axisX = new Chartist.AutoScaleAxis(Chartist.Axis.units.x, data, chartRect, Chartist.extend({}, options.axisX, {
          highLow: highLow,
          referenceValue: 0
        }));
      } else {
        valueAxis = axisX = options.axisX.type.call(Chartist, Chartist.Axis.units.x, data, chartRect, Chartist.extend({}, options.axisX, {
          highLow: highLow,
          referenceValue: 0
        }));
      }

      if(options.axisY.type === undefined) {
        labelAxis = axisY = new Chartist.StepAxis(Chartist.Axis.units.y, data, chartRect, {
          ticks: labelAxisTicks
        });
      } else {
        labelAxis = axisY = options.axisY.type.call(Chartist, Chartist.Axis.units.y, data, chartRect, options.axisY);
      }
    } else {
      if(options.axisX.type === undefined) {
        labelAxis = axisX = new Chartist.StepAxis(Chartist.Axis.units.x, data, chartRect, {
          ticks: labelAxisTicks
        });
      } else {
        labelAxis = axisX = options.axisX.type.call(Chartist, Chartist.Axis.units.x, data, chartRect, options.axisX);
      }

      if(options.axisY.type === undefined) {
        valueAxis = axisY = new Chartist.AutoScaleAxis(Chartist.Axis.units.y, data, chartRect, Chartist.extend({}, options.axisY, {
          highLow: highLow,
          referenceValue: 0
        }));
      } else {
        valueAxis = axisY = options.axisY.type.call(Chartist, Chartist.Axis.units.y, data, chartRect, Chartist.extend({}, options.axisY, {
          highLow: highLow,
          referenceValue: 0
        }));
      }
    }

    // Projected 0 point
    var zeroPoint = options.horizontalBars ? (chartRect.x1 + valueAxis.projectValue(0)) : (chartRect.y1 - valueAxis.projectValue(0));
    // Used to track the screen coordinates of stacked bars
    var stackedBarValues = [];

    labelAxis.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);
    valueAxis.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);

    // Draw the series
    data.raw.series.forEach(function(series, seriesIndex) {
      // Calculating bi-polar value of index for seriesOffset. For i = 0..4 biPol will be -1.5, -0.5, 0.5, 1.5 etc.
      var biPol = seriesIndex - (data.raw.series.length - 1) / 2;
      // Half of the period width between vertical grid lines used to position bars
      var periodHalfLength;
      // Current series SVG element
      var seriesElement;

      // We need to set periodHalfLength based on some options combinations
      if(options.distributeSeries && !options.stackBars) {
        // If distributed series are enabled but stacked bars aren't, we need to use the length of the normaizedData array
        // which is the series count and divide by 2
        periodHalfLength = labelAxis.axisLength / data.normalized.length / 2;
      } else if(options.distributeSeries && options.stackBars) {
        // If distributed series and stacked bars are enabled we'll only get one bar so we should just divide the axis
        // length by 2
        periodHalfLength = labelAxis.axisLength / 2;
      } else {
        // On regular bar charts we should just use the series length
        periodHalfLength = labelAxis.axisLength / data.normalized[seriesIndex].length / 2;
      }

      // Adding the series group to the series element
      seriesElement = seriesGroup.elem('g');

      // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
      seriesElement.attr({
        'series-name': series.name,
        'meta': Chartist.serialize(series.meta)
      }, Chartist.xmlNs.uri);

      // Use series class from series data or if not set generate one
      seriesElement.addClass([
        options.classNames.series,
        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
      ].join(' '));

      data.normalized[seriesIndex].forEach(function(value, valueIndex) {
        var projected,
          bar,
          previousStack,
          labelAxisValueIndex;

        // We need to set labelAxisValueIndex based on some options combinations
        if(options.distributeSeries && !options.stackBars) {
          // If distributed series are enabled but stacked bars aren't, we can use the seriesIndex for later projection
          // on the step axis for label positioning
          labelAxisValueIndex = seriesIndex;
        } else if(options.distributeSeries && options.stackBars) {
          // If distributed series and stacked bars are enabled, we will only get one bar and therefore always use
          // 0 for projection on the label step axis
          labelAxisValueIndex = 0;
        } else {
          // On regular bar charts we just use the value index to project on the label step axis
          labelAxisValueIndex = valueIndex;
        }

        // We need to transform coordinates differently based on the chart layout
        if(options.horizontalBars) {
          projected = {
            x: chartRect.x1 + valueAxis.projectValue(value && value.x ? value.x : 0, valueIndex, data.normalized[seriesIndex]),
            y: chartRect.y1 - labelAxis.projectValue(value && value.y ? value.y : 0, labelAxisValueIndex, data.normalized[seriesIndex])
          };
        } else {
          projected = {
            x: chartRect.x1 + labelAxis.projectValue(value && value.x ? value.x : 0, labelAxisValueIndex, data.normalized[seriesIndex]),
            y: chartRect.y1 - valueAxis.projectValue(value && value.y ? value.y : 0, valueIndex, data.normalized[seriesIndex])
          }
        }

        // If the label axis is a step based axis we will offset the bar into the middle of between two steps using
        // the periodHalfLength value. Also we do arrange the different series so that they align up to each other using
        // the seriesBarDistance. If we don't have a step axis, the bar positions can be chosen freely so we should not
        // add any automated positioning.
        if(labelAxis instanceof Chartist.StepAxis) {
          // Offset to center bar between grid lines, but only if the step axis is not stretched
          if(!labelAxis.options.stretch) {
            projected[labelAxis.units.pos] += periodHalfLength * (options.horizontalBars ? -1 : 1);
          }
          // Using bi-polar offset for multiple series if no stacked bars or series distribution is used
          projected[labelAxis.units.pos] += (options.stackBars || options.distributeSeries) ? 0 : biPol * options.seriesBarDistance * (options.horizontalBars ? -1 : 1);
        }

        // Enter value in stacked bar values used to remember previous screen value for stacking up bars
        previousStack = stackedBarValues[valueIndex] || zeroPoint;
        stackedBarValues[valueIndex] = previousStack - (zeroPoint - projected[labelAxis.counterUnits.pos]);

        // Skip if value is undefined
        if(value === undefined) {
          return;
        }

        var positions = {};
        positions[labelAxis.units.pos + '1'] = projected[labelAxis.units.pos];
        positions[labelAxis.units.pos + '2'] = projected[labelAxis.units.pos];

        if(options.stackBars && (options.stackMode === 'accumulate' || !options.stackMode)) {
          // Stack mode: accumulate (default)
          // If bars are stacked we use the stackedBarValues reference and otherwise base all bars off the zero line
          // We want backwards compatibility, so the expected fallback without the 'stackMode' option
          // to be the original behaviour (accumulate)
          positions[labelAxis.counterUnits.pos + '1'] = previousStack;
          positions[labelAxis.counterUnits.pos + '2'] = stackedBarValues[valueIndex];
        } else {
          // Draw from the zero line normally
          // This is also the same code for Stack mode: overlap
          positions[labelAxis.counterUnits.pos + '1'] = zeroPoint;
          positions[labelAxis.counterUnits.pos + '2'] = projected[labelAxis.counterUnits.pos];
        }

        // Limit x and y so that they are within the chart rect
        positions.x1 = Math.min(Math.max(positions.x1, chartRect.x1), chartRect.x2);
        positions.x2 = Math.min(Math.max(positions.x2, chartRect.x1), chartRect.x2);
        positions.y1 = Math.min(Math.max(positions.y1, chartRect.y2), chartRect.y1);
        positions.y2 = Math.min(Math.max(positions.y2, chartRect.y2), chartRect.y1);

        // Create bar element
        bar = seriesElement.elem('line', positions, options.classNames.bar).attr({
          'value': [value.x, value.y].filter(function(v) {
            return v;
          }).join(','),
          'meta': Chartist.getMetaData(series, valueIndex)
        }, Chartist.xmlNs.uri);

        this.eventEmitter.emit('draw', Chartist.extend({
          type: 'bar',
          value: value,
          index: valueIndex,
          meta: Chartist.getMetaData(series, valueIndex),
          series: series,
          seriesIndex: seriesIndex,
          axisX: axisX,
          axisY: axisY,
          chartRect: chartRect,
          group: seriesElement,
          element: bar
        }, positions));
      }.bind(this));
    }.bind(this));

    this.eventEmitter.emit('created', {
      bounds: valueAxis.bounds,
      chartRect: chartRect,
      axisX: axisX,
      axisY: axisY,
      svg: this.svg,
      options: options
    });
  }

  /**
   * This method creates a new bar chart and returns API object that you can use for later changes.
   *
   * @memberof Chartist.Bar
   * @param {String|Node} query A selector query string or directly a DOM element
   * @param {Object} data The data object that needs to consist of a labels and a series array
   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
   * @return {Object} An object which exposes the API for the created chart
   *
   * @example
   * // Create a simple bar chart
   * var data = {
   *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
   *   series: [
   *     [5, 2, 4, 2, 0]
   *   ]
   * };
   *
   * // In the global name space Chartist we call the Bar function to initialize a bar chart. As a first parameter we pass in a selector where we would like to get our chart created and as a second parameter we pass our data object.
   * new Chartist.Bar('.ct-chart', data);
   *
   * @example
   * // This example creates a bipolar grouped bar chart where the boundaries are limitted to -10 and 10
   * new Chartist.Bar('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5, 6, 7],
   *   series: [
   *     [1, 3, 2, -5, -3, 1, -6],
   *     [-5, -2, -4, -1, 2, -3, 1]
   *   ]
   * }, {
   *   seriesBarDistance: 12,
   *   low: -10,
   *   high: 10
   * });
   *
   */
  function Bar(query, data, options, responsiveOptions) {
    Chartist.Bar.super.constructor.call(this,
      query,
      data,
      defaultOptions,
      Chartist.extend({}, defaultOptions, options),
      responsiveOptions);
  }

  // Creating bar chart type in Chartist namespace
  Chartist.Bar = Chartist.Base.extend({
    constructor: Bar,
    createChart: createChart
  });

}(window, document, Chartist));
;/**
 * The pie chart module of Chartist that can be used to draw pie, donut or gauge charts
 *
 * @module Chartist.Pie
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  /**
   * Default options in line charts. Expand the code view to see a detailed list of options with comments.
   *
   * @memberof Chartist.Pie
   */
  var defaultOptions = {
    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
    width: undefined,
    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
    height: undefined,
    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
    chartPadding: 5,
    // Override the class names that are used to generate the SVG structure of the chart
    classNames: {
      chartPie: 'ct-chart-pie',
      chartDonut: 'ct-chart-donut',
      series: 'ct-series',
      slicePie: 'ct-slice-pie',
      sliceDonut: 'ct-slice-donut',
      label: 'ct-label'
    },
    // The start angle of the pie chart in degrees where 0 points north. A higher value offsets the start angle clockwise.
    startAngle: 0,
    // An optional total you can specify. By specifying a total value, the sum of the values in the series must be this total in order to draw a full pie. You can use this parameter to draw only parts of a pie or gauge charts.
    total: undefined,
    // If specified the donut CSS classes will be used and strokes will be drawn instead of pie slices.
    donut: false,
    // Specify the donut stroke width, currently done in javascript for convenience. May move to CSS styles in the future.
    // This option can be set as number or string to specify a relative width (i.e. 100 or '30%').
    donutWidth: 60,
    // If a label should be shown or not
    showLabel: true,
    // Label position offset from the standard position which is half distance of the radius. This value can be either positive or negative. Positive values will position the label away from the center.
    labelOffset: 0,
    // This option can be set to 'inside', 'outside' or 'center'. Positioned with 'inside' the labels will be placed on half the distance of the radius to the border of the Pie by respecting the 'labelOffset'. The 'outside' option will place the labels at the border of the pie and 'center' will place the labels in the absolute center point of the chart. The 'center' option only makes sense in conjunction with the 'labelOffset' option.
    labelPosition: 'inside',
    // An interpolation function for the label value
    labelInterpolationFnc: Chartist.noop,
    // Label direction can be 'neutral', 'explode' or 'implode'. The labels anchor will be positioned based on those settings as well as the fact if the labels are on the right or left side of the center of the chart. Usually explode is useful when labels are positioned far away from the center.
    labelDirection: 'neutral',
    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
    reverseData: false
  };

  /**
   * Determines SVG anchor position based on direction and center parameter
   *
   * @param center
   * @param label
   * @param direction
   * @return {string}
   */
  function determineAnchorPosition(center, label, direction) {
    var toTheRight = label.x > center.x;

    if(toTheRight && direction === 'explode' ||
      !toTheRight && direction === 'implode') {
      return 'start';
    } else if(toTheRight && direction === 'implode' ||
      !toTheRight && direction === 'explode') {
      return 'end';
    } else {
      return 'middle';
    }
  }

  /**
   * Creates the pie chart
   *
   * @param options
   */
  function createChart(options) {
    var seriesGroups = [],
      labelsGroup,
      chartRect,
      radius,
      labelRadius,
      totalDataSum,
      startAngle = options.startAngle,
      dataArray = Chartist.getDataArray(this.data, options.reverseData);

    // Create SVG.js draw
    this.svg = Chartist.createSvg(this.container, options.width, options.height,options.donut ? options.classNames.chartDonut : options.classNames.chartPie);
    // Calculate charting rect
    chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);
    // Get biggest circle radius possible within chartRect
    radius = Math.min(chartRect.width() / 2, chartRect.height() / 2);
    // Calculate total of all series to get reference value or use total reference from optional options
    totalDataSum = options.total || dataArray.reduce(function(previousValue, currentValue) {
      return previousValue + currentValue;
    }, 0);

    var donutWidth = Chartist.quantity(options.donutWidth);
    if (donutWidth.unit === '%') {
      donutWidth.value *= radius / 100;
    }

    // If this is a donut chart we need to adjust our radius to enable strokes to be drawn inside
    // Unfortunately this is not possible with the current SVG Spec
    // See this proposal for more details: http://lists.w3.org/Archives/Public/www-svg/2003Oct/0000.html
    radius -= options.donut ? donutWidth.value / 2  : 0;

    // If labelPosition is set to `outside` or a donut chart is drawn then the label position is at the radius,
    // if regular pie chart it's half of the radius
    if(options.labelPosition === 'outside' || options.donut) {
      labelRadius = radius;
    } else if(options.labelPosition === 'center') {
      // If labelPosition is center we start with 0 and will later wait for the labelOffset
      labelRadius = 0;
    } else {
      // Default option is 'inside' where we use half the radius so the label will be placed in the center of the pie
      // slice
      labelRadius = radius / 2;
    }
    // Add the offset to the labelRadius where a negative offset means closed to the center of the chart
    labelRadius += options.labelOffset;

    // Calculate end angle based on total sum and current data value and offset with padding
    var center = {
      x: chartRect.x1 + chartRect.width() / 2,
      y: chartRect.y2 + chartRect.height() / 2
    };

    // Check if there is only one non-zero value in the series array.
    var hasSingleValInSeries = this.data.series.filter(function(val) {
      return val.hasOwnProperty('value') ? val.value !== 0 : val !== 0;
    }).length === 1;

    //if we need to show labels we create the label group now
    if(options.showLabel) {
      labelsGroup = this.svg.elem('g', null, null, true);
    }

    // Draw the series
    // initialize series groups
    for (var i = 0; i < this.data.series.length; i++) {
      var series = this.data.series[i];
      seriesGroups[i] = this.svg.elem('g', null, null, true);

      // If the series is an object and contains a name or meta data we add a custom attribute
      seriesGroups[i].attr({
        'series-name': series.name
      }, Chartist.xmlNs.uri);

      // Use series class from series data or if not set generate one
      seriesGroups[i].addClass([
        options.classNames.series,
        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(i))
      ].join(' '));

      var endAngle = startAngle + dataArray[i] / totalDataSum * 360;
      // If we need to draw the arc for all 360 degrees we need to add a hack where we close the circle
      // with Z and use 359.99 degrees
      if(endAngle - startAngle === 360) {
        endAngle -= 0.01;
      }

      var start = Chartist.polarToCartesian(center.x, center.y, radius, startAngle - (i === 0 || hasSingleValInSeries ? 0 : 0.2)),
        end = Chartist.polarToCartesian(center.x, center.y, radius, endAngle);

      // Create a new path element for the pie chart. If this isn't a donut chart we should close the path for a correct stroke
      var path = new Chartist.Svg.Path(!options.donut)
        .move(end.x, end.y)
        .arc(radius, radius, 0, endAngle - startAngle > 180, 0, start.x, start.y);

      // If regular pie chart (no donut) we add a line to the center of the circle for completing the pie
      if(!options.donut) {
        path.line(center.x, center.y);
      }

      // Create the SVG path
      // If this is a donut chart we add the donut class, otherwise just a regular slice
      var pathElement = seriesGroups[i].elem('path', {
        d: path.stringify()
      }, options.donut ? options.classNames.sliceDonut : options.classNames.slicePie);

      // Adding the pie series value to the path
      pathElement.attr({
        'value': dataArray[i],
        'meta': Chartist.serialize(series.meta)
      }, Chartist.xmlNs.uri);

      // If this is a donut, we add the stroke-width as style attribute
      if(options.donut) {
        pathElement.attr({
          'style': 'stroke-width: ' + donutWidth.value + 'px'
        });
      }

      // Fire off draw event
      this.eventEmitter.emit('draw', {
        type: 'slice',
        value: dataArray[i],
        totalDataSum: totalDataSum,
        index: i,
        meta: series.meta,
        series: series,
        group: seriesGroups[i],
        element: pathElement,
        path: path.clone(),
        center: center,
        radius: radius,
        startAngle: startAngle,
        endAngle: endAngle
      });

      // If we need to show labels we need to add the label for this slice now
      if(options.showLabel) {
        // Position at the labelRadius distance from center and between start and end angle
        var labelPosition = Chartist.polarToCartesian(center.x, center.y, labelRadius, startAngle + (endAngle - startAngle) / 2),
          interpolatedValue = options.labelInterpolationFnc(this.data.labels ? this.data.labels[i] : dataArray[i], i);

        if(interpolatedValue || interpolatedValue === 0) {
          var labelElement = labelsGroup.elem('text', {
            dx: labelPosition.x,
            dy: labelPosition.y,
            'text-anchor': determineAnchorPosition(center, labelPosition, options.labelDirection)
          }, options.classNames.label).text('' + interpolatedValue);

          // Fire off draw event
          this.eventEmitter.emit('draw', {
            type: 'label',
            index: i,
            group: labelsGroup,
            element: labelElement,
            text: '' + interpolatedValue,
            x: labelPosition.x,
            y: labelPosition.y
          });
        }
      }

      // Set next startAngle to current endAngle. Use slight offset so there are no transparent hairline issues
      // (except for last slice)
      startAngle = endAngle;
    }

    this.eventEmitter.emit('created', {
      chartRect: chartRect,
      svg: this.svg,
      options: options
    });
  }

  /**
   * This method creates a new pie chart and returns an object that can be used to redraw the chart.
   *
   * @memberof Chartist.Pie
   * @param {String|Node} query A selector query string or directly a DOM element
   * @param {Object} data The data object in the pie chart needs to have a series property with a one dimensional data array. The values will be normalized against each other and don't necessarily need to be in percentage. The series property can also be an array of value objects that contain a value property and a className property to override the CSS class name for the series group.
   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
   * @return {Object} An object with a version and an update method to manually redraw the chart
   *
   * @example
   * // Simple pie chart example with four series
   * new Chartist.Pie('.ct-chart', {
   *   series: [10, 2, 4, 3]
   * });
   *
   * @example
   * // Drawing a donut chart
   * new Chartist.Pie('.ct-chart', {
   *   series: [10, 2, 4, 3]
   * }, {
   *   donut: true
   * });
   *
   * @example
   * // Using donut, startAngle and total to draw a gauge chart
   * new Chartist.Pie('.ct-chart', {
   *   series: [20, 10, 30, 40]
   * }, {
   *   donut: true,
   *   donutWidth: 20,
   *   startAngle: 270,
   *   total: 200
   * });
   *
   * @example
   * // Drawing a pie chart with padding and labels that are outside the pie
   * new Chartist.Pie('.ct-chart', {
   *   series: [20, 10, 30, 40]
   * }, {
   *   chartPadding: 30,
   *   labelOffset: 50,
   *   labelDirection: 'explode'
   * });
   *
   * @example
   * // Overriding the class names for individual series as well as a name and meta data.
   * // The name will be written as ct:series-name attribute and the meta data will be serialized and written
   * // to a ct:meta attribute.
   * new Chartist.Pie('.ct-chart', {
   *   series: [{
   *     value: 20,
   *     name: 'Series 1',
   *     className: 'my-custom-class-one',
   *     meta: 'Meta One'
   *   }, {
   *     value: 10,
   *     name: 'Series 2',
   *     className: 'my-custom-class-two',
   *     meta: 'Meta Two'
   *   }, {
   *     value: 70,
   *     name: 'Series 3',
   *     className: 'my-custom-class-three',
   *     meta: 'Meta Three'
   *   }]
   * });
   */
  function Pie(query, data, options, responsiveOptions) {
    Chartist.Pie.super.constructor.call(this,
      query,
      data,
      defaultOptions,
      Chartist.extend({}, defaultOptions, options),
      responsiveOptions);
  }

  // Creating pie chart type in Chartist namespace
  Chartist.Pie = Chartist.Base.extend({
    constructor: Pie,
    createChart: createChart,
    determineAnchorPosition: determineAnchorPosition
  });

}(window, document, Chartist));

return Chartist;

}));

},{}],33:[function(require,module,exports){
'use strict';

var ticky = require('ticky');

module.exports = function debounce (fn, args, ctx) {
  if (!fn) { return; }
  ticky(function run () {
    fn.apply(ctx || null, args || []);
  });
};

},{"ticky":43}],34:[function(require,module,exports){
'use strict';

var atoa = require('atoa');
var debounce = require('./debounce');

module.exports = function emitter (thing, options) {
  var opts = options || {};
  var evt = {};
  if (thing === undefined) { thing = {}; }
  thing.on = function (type, fn) {
    if (!evt[type]) {
      evt[type] = [fn];
    } else {
      evt[type].push(fn);
    }
    return thing;
  };
  thing.once = function (type, fn) {
    fn._once = true; // thing.off(fn) still works!
    thing.on(type, fn);
    return thing;
  };
  thing.off = function (type, fn) {
    var c = arguments.length;
    if (c === 1) {
      delete evt[type];
    } else if (c === 0) {
      evt = {};
    } else {
      var et = evt[type];
      if (!et) { return thing; }
      et.splice(et.indexOf(fn), 1);
    }
    return thing;
  };
  thing.emit = function () {
    var args = atoa(arguments);
    return thing.emitterSnapshot(args.shift()).apply(this, args);
  };
  thing.emitterSnapshot = function (type) {
    var et = (evt[type] || []).slice(0);
    return function () {
      var args = atoa(arguments);
      var ctx = this || thing;
      if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
      et.forEach(function emitter (listen) {
        if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
        if (listen._once) { thing.off(type, listen); }
      });
      return thing;
    };
  };
  return thing;
};

},{"./debounce":33,"atoa":31}],35:[function(require,module,exports){
(function (global){
'use strict';

var customEvent = require('custom-event');
var eventmap = require('./eventmap');
var doc = global.document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!global.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

function addEventEasy (el, type, fn, capturing) {
  return el.addEventListener(type, fn, capturing);
}

function addEventHard (el, type, fn) {
  return el.attachEvent('on' + type, wrap(el, type, fn));
}

function removeEventEasy (el, type, fn, capturing) {
  return el.removeEventListener(type, fn, capturing);
}

function removeEventHard (el, type, fn) {
  var listener = unwrap(el, type, fn);
  if (listener) {
    return el.detachEvent('on' + type, listener);
  }
}

function fabricateEvent (el, type, model) {
  var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
  if (el.dispatchEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent('on' + type, e);
  }
  function makeClassicEvent () {
    var e;
    if (doc.createEvent) {
      e = doc.createEvent('Event');
      e.initEvent(type, true, true);
    } else if (doc.createEventObject) {
      e = doc.createEventObject();
    }
    return e;
  }
  function makeCustomEvent () {
    return new customEvent(type, { detail: model });
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || global.event;
    e.target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    e.which = e.which || e.keyCode;
    fn.call(el, e);
  };
}

function wrap (el, type, fn) {
  var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
  hardCache.push({
    wrapper: wrapper,
    element: el,
    type: type,
    fn: fn
  });
  return wrapper;
}

function unwrap (el, type, fn) {
  var i = find(el, type, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (el, type, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === el && item.type === type && item.fn === fn) {
      return i;
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./eventmap":36,"custom-event":37}],36:[function(require,module,exports){
(function (global){
'use strict';

var eventmap = [];
var eventname = '';
var ron = /^on/;

for (eventname in global) {
  if (ron.test(eventname)) {
    eventmap.push(eventname.slice(2));
  }
}

module.exports = eventmap;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],37:[function(require,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],38:[function(require,module,exports){
'use strict';

var cache = {};
var start = '(?:^|\\s)';
var end = '(?:\\s|$)';

function lookupClass (className) {
  var cached = cache[className];
  if (cached) {
    cached.lastIndex = 0;
  } else {
    cache[className] = cached = new RegExp(start + className + end, 'g');
  }
  return cached;
}

function addClass (el, className) {
  var current = el.className;
  if (!current.length) {
    el.className = className;
  } else if (!lookupClass(className).test(current)) {
    el.className += ' ' + className;
  }
}

function rmClass (el, className) {
  el.className = el.className.replace(lookupClass(className), ' ').trim();
}

module.exports = {
  add: addClass,
  rm: rmClass
};

},{}],39:[function(require,module,exports){
(function (global){
'use strict';

var emitter = require('contra/emitter');
var crossvent = require('crossvent');
var classes = require('./classes');
var doc = document;
var documentElement = doc.documentElement;

function dragula (initialContainers, options) {
  var len = arguments.length;
  if (len === 1 && Array.isArray(initialContainers) === false) {
    options = initialContainers;
    initialContainers = [];
  }
  var _mirror; // mirror image
  var _source; // source container
  var _item; // item being dragged
  var _offsetX; // reference x
  var _offsetY; // reference y
  var _moveX; // reference move x
  var _moveY; // reference move y
  var _initialSibling; // reference sibling when grabbed
  var _currentSibling; // reference sibling now
  var _copy; // item used for copying
  var _renderTimer; // timer for setTimeout renderMirrorImage
  var _lastDropTarget = null; // last container item was over
  var _grabbed; // holds mousedown context until first mousemove

  var o = options || {};
  if (o.moves === void 0) { o.moves = always; }
  if (o.accepts === void 0) { o.accepts = always; }
  if (o.invalid === void 0) { o.invalid = invalidTarget; }
  if (o.containers === void 0) { o.containers = initialContainers || []; }
  if (o.isContainer === void 0) { o.isContainer = never; }
  if (o.copy === void 0) { o.copy = false; }
  if (o.copySortSource === void 0) { o.copySortSource = false; }
  if (o.revertOnSpill === void 0) { o.revertOnSpill = false; }
  if (o.removeOnSpill === void 0) { o.removeOnSpill = false; }
  if (o.direction === void 0) { o.direction = 'vertical'; }
  if (o.ignoreInputTextSelection === void 0) { o.ignoreInputTextSelection = true; }
  if (o.mirrorContainer === void 0) { o.mirrorContainer = doc.body; }

  var drake = emitter({
    containers: o.containers,
    start: manualStart,
    end: end,
    cancel: cancel,
    remove: remove,
    destroy: destroy,
    dragging: false
  });

  if (o.removeOnSpill === true) {
    drake.on('over', spillOver).on('out', spillOut);
  }

  events();

  return drake;

  function isContainer (el) {
    return drake.containers.indexOf(el) !== -1 || o.isContainer(el);
  }

  function events (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousedown', grab);
    touchy(documentElement, op, 'mouseup', release);
  }

  function eventualMovements (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
  }

  function movements (remove) {
    var op = remove ? 'remove' : 'add';
    crossvent[op](documentElement, 'selectstart', preventGrabbed); // IE8
    crossvent[op](documentElement, 'click', preventGrabbed);
  }

  function destroy () {
    events(true);
    release({});
  }

  function preventGrabbed (e) {
    if (_grabbed) {
      e.preventDefault();
    }
  }

  function grab (e) {
    _moveX = e.clientX;
    _moveY = e.clientY;

    var ignore = whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
    if (ignore) {
      return; // we only care about honest-to-god left clicks and touch events
    }
    var item = e.target;
    var context = canStart(item);
    if (!context) {
      return;
    }
    _grabbed = context;
    eventualMovements();
    if (e.type === 'mousedown') {
      if (isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
        item.focus(); // fixes https://github.com/bevacqua/dragula/issues/176
      } else {
        e.preventDefault(); // fixes https://github.com/bevacqua/dragula/issues/155
      }
    }
  }

  function startBecauseMouseMoved (e) {
    if (!_grabbed) {
      return;
    }
    if (whichMouseButton(e) === 0) {
      release({});
      return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
    }
    // truthy check fixes #239, equality fixes #207
    if (e.clientX !== void 0 && e.clientX === _moveX && e.clientY !== void 0 && e.clientY === _moveY) {
      return;
    }
    if (o.ignoreInputTextSelection) {
      var clientX = getCoord('clientX', e);
      var clientY = getCoord('clientY', e);
      var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
      if (isInput(elementBehindCursor)) {
        return;
      }
    }

    var grabbed = _grabbed; // call to end() unsets _grabbed
    eventualMovements(true);
    movements();
    end();
    start(grabbed);

    var offset = getOffset(_item);
    _offsetX = getCoord('pageX', e) - offset.left;
    _offsetY = getCoord('pageY', e) - offset.top;

    classes.add(_copy || _item, 'gu-transit');
    renderMirrorImage();
    drag(e);
  }

  function canStart (item) {
    if (drake.dragging && _mirror) {
      return;
    }
    if (isContainer(item)) {
      return; // don't drag container itself
    }
    var handle = item;
    while (getParent(item) && isContainer(getParent(item)) === false) {
      if (o.invalid(item, handle)) {
        return;
      }
      item = getParent(item); // drag target should be a top element
      if (!item) {
        return;
      }
    }
    var source = getParent(item);
    if (!source) {
      return;
    }
    if (o.invalid(item, handle)) {
      return;
    }

    var movable = o.moves(item, source, handle, nextEl(item));
    if (!movable) {
      return;
    }

    return {
      item: item,
      source: source
    };
  }

  function manualStart (item) {
    var context = canStart(item);
    if (context) {
      start(context);
    }
  }

  function start (context) {
    if (isCopy(context.item, context.source)) {
      _copy = context.item.cloneNode(true);
      drake.emit('cloned', _copy, context.item, 'copy');
    }

    _source = context.source;
    _item = context.item;
    _initialSibling = _currentSibling = nextEl(context.item);

    drake.dragging = true;
    drake.emit('drag', _item, _source);
  }

  function invalidTarget () {
    return false;
  }

  function end () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    drop(item, getParent(item));
  }

  function ungrab () {
    _grabbed = false;
    eventualMovements(true);
    movements(true);
  }

  function release (e) {
    ungrab();

    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var clientX = getCoord('clientX', e);
    var clientY = getCoord('clientY', e);
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    if (dropTarget && ((_copy && o.copySortSource) || (!_copy || dropTarget !== _source))) {
      drop(item, dropTarget);
    } else if (o.removeOnSpill) {
      remove();
    } else {
      cancel();
    }
  }

  function drop (item, target) {
    var parent = getParent(item);
    if (_copy && o.copySortSource && target === _source) {
      parent.removeChild(_item);
    }
    if (isInitialPlacement(target)) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, target, _source, _currentSibling);
    }
    cleanup();
  }

  function remove () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var parent = getParent(item);
    if (parent) {
      parent.removeChild(item);
    }
    drake.emit(_copy ? 'cancel' : 'remove', item, parent, _source);
    cleanup();
  }

  function cancel (revert) {
    if (!drake.dragging) {
      return;
    }
    var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
    var item = _copy || _item;
    var parent = getParent(item);
    if (parent === _source && _copy) {
      parent.removeChild(_copy);
    }
    var initial = isInitialPlacement(parent);
    if (initial === false && !_copy && reverts) {
      _source.insertBefore(item, _initialSibling);
    }
    if (initial || reverts) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, parent, _source, _currentSibling);
    }
    cleanup();
  }

  function cleanup () {
    var item = _copy || _item;
    ungrab();
    removeMirrorImage();
    if (item) {
      classes.rm(item, 'gu-transit');
    }
    if (_renderTimer) {
      clearTimeout(_renderTimer);
    }
    drake.dragging = false;
    if (_lastDropTarget) {
      drake.emit('out', item, _lastDropTarget, _source);
    }
    drake.emit('dragend', item);
    _source = _item = _copy = _initialSibling = _currentSibling = _renderTimer = _lastDropTarget = null;
  }

  function isInitialPlacement (target, s) {
    var sibling;
    if (s !== void 0) {
      sibling = s;
    } else if (_mirror) {
      sibling = _currentSibling;
    } else {
      sibling = nextEl(_copy || _item);
    }
    return target === _source && sibling === _initialSibling;
  }

  function findDropTarget (elementBehindCursor, clientX, clientY) {
    var target = elementBehindCursor;
    while (target && !accepted()) {
      target = getParent(target);
    }
    return target;

    function accepted () {
      var droppable = isContainer(target);
      if (droppable === false) {
        return false;
      }

      var immediate = getImmediateChild(target, elementBehindCursor);
      var reference = getReference(target, immediate, clientX, clientY);
      var initial = isInitialPlacement(target, reference);
      if (initial) {
        return true; // should always be able to drop it right back where it was
      }
      return o.accepts(_item, target, _source, reference);
    }
  }

  function drag (e) {
    if (!_mirror) {
      return;
    }
    e.preventDefault();

    var clientX = getCoord('clientX', e);
    var clientY = getCoord('clientY', e);
    var x = clientX - _offsetX;
    var y = clientY - _offsetY;

    _mirror.style.left = x + 'px';
    _mirror.style.top = y + 'px';

    var item = _copy || _item;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    var changed = dropTarget !== null && dropTarget !== _lastDropTarget;
    if (changed || dropTarget === null) {
      out();
      _lastDropTarget = dropTarget;
      over();
    }
    var parent = getParent(item);
    if (dropTarget === _source && _copy && !o.copySortSource) {
      if (parent) {
        parent.removeChild(item);
      }
      return;
    }
    var reference;
    var immediate = getImmediateChild(dropTarget, elementBehindCursor);
    if (immediate !== null) {
      reference = getReference(dropTarget, immediate, clientX, clientY);
    } else if (o.revertOnSpill === true && !_copy) {
      reference = _initialSibling;
      dropTarget = _source;
    } else {
      if (_copy && parent) {
        parent.removeChild(item);
      }
      return;
    }
    if (
      reference === null ||
      reference !== item &&
      reference !== nextEl(item) &&
      reference !== _currentSibling
    ) {
      _currentSibling = reference;
      dropTarget.insertBefore(item, reference);
      drake.emit('shadow', item, dropTarget, _source);
    }
    function moved (type) { drake.emit(type, item, _lastDropTarget, _source); }
    function over () { if (changed) { moved('over'); } }
    function out () { if (_lastDropTarget) { moved('out'); } }
  }

  function spillOver (el) {
    classes.rm(el, 'gu-hide');
  }

  function spillOut (el) {
    if (drake.dragging) { classes.add(el, 'gu-hide'); }
  }

  function renderMirrorImage () {
    if (_mirror) {
      return;
    }
    var rect = _item.getBoundingClientRect();
    _mirror = _item.cloneNode(true);
    _mirror.style.width = getRectWidth(rect) + 'px';
    _mirror.style.height = getRectHeight(rect) + 'px';
    classes.rm(_mirror, 'gu-transit');
    classes.add(_mirror, 'gu-mirror');
    o.mirrorContainer.appendChild(_mirror);
    touchy(documentElement, 'add', 'mousemove', drag);
    classes.add(o.mirrorContainer, 'gu-unselectable');
    drake.emit('cloned', _mirror, _item, 'mirror');
  }

  function removeMirrorImage () {
    if (_mirror) {
      classes.rm(o.mirrorContainer, 'gu-unselectable');
      touchy(documentElement, 'remove', 'mousemove', drag);
      getParent(_mirror).removeChild(_mirror);
      _mirror = null;
    }
  }

  function getImmediateChild (dropTarget, target) {
    var immediate = target;
    while (immediate !== dropTarget && getParent(immediate) !== dropTarget) {
      immediate = getParent(immediate);
    }
    if (immediate === documentElement) {
      return null;
    }
    return immediate;
  }

  function getReference (dropTarget, target, x, y) {
    var horizontal = o.direction === 'horizontal';
    var reference = target !== dropTarget ? inside() : outside();
    return reference;

    function outside () { // slower, but able to figure out any position
      var len = dropTarget.children.length;
      var i;
      var el;
      var rect;
      for (i = 0; i < len; i++) {
        el = dropTarget.children[i];
        rect = el.getBoundingClientRect();
        if (horizontal && rect.left > x) { return el; }
        if (!horizontal && rect.top > y) { return el; }
      }
      return null;
    }

    function inside () { // faster, but only available if dropped inside a child element
      var rect = target.getBoundingClientRect();
      if (horizontal) {
        return resolve(x > rect.left + getRectWidth(rect) / 2);
      }
      return resolve(y > rect.top + getRectHeight(rect) / 2);
    }

    function resolve (after) {
      return after ? nextEl(target) : target;
    }
  }

  function isCopy (item, container) {
    return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
  }
}

function touchy (el, op, type, fn) {
  var touch = {
    mouseup: 'touchend',
    mousedown: 'touchstart',
    mousemove: 'touchmove'
  };
  var pointers = {
    mouseup: 'pointerup',
    mousedown: 'pointerdown',
    mousemove: 'pointermove'
  };
  var microsoft = {
    mouseup: 'MSPointerUp',
    mousedown: 'MSPointerDown',
    mousemove: 'MSPointerMove'
  };
  if (global.navigator.pointerEnabled) {
    crossvent[op](el, pointers[type], fn);
  } else if (global.navigator.msPointerEnabled) {
    crossvent[op](el, microsoft[type], fn);
  } else {
    crossvent[op](el, touch[type], fn);
    crossvent[op](el, type, fn);
  }
}

function whichMouseButton (e) {
  if (e.touches !== void 0) { return e.touches.length; }
  if (e.buttons !== void 0) { return e.buttons; }
  if (e.which !== void 0) { return e.which; }
  var button = e.button;
  if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
    return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
  }
}

function getOffset (el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + getScroll('scrollLeft', 'pageXOffset'),
    top: rect.top + getScroll('scrollTop', 'pageYOffset')
  };
}

function getScroll (scrollProp, offsetProp) {
  if (typeof global[offsetProp] !== 'undefined') {
    return global[offsetProp];
  }
  if (documentElement.clientHeight) {
    return documentElement[scrollProp];
  }
  return doc.body[scrollProp];
}

function getElementBehindPoint (point, x, y) {
  var p = point || {};
  var state = p.className;
  var el;
  p.className += ' gu-hide';
  el = doc.elementFromPoint(x, y);
  p.className = state;
  return el;
}

function never () { return false; }
function always () { return true; }
function getRectWidth (rect) { return rect.width || (rect.right - rect.left); }
function getRectHeight (rect) { return rect.height || (rect.bottom - rect.top); }
function getParent (el) { return el.parentNode === doc ? null : el.parentNode; }
function isInput (el) { return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || isEditable(el); }
function isEditable (el) {
  if (!el) { return false; } // no parents were editable
  if (el.contentEditable === 'false') { return false; } // stop the lookup
  if (el.contentEditable === 'true') { return true; } // found a contentEditable element in the chain
  return isEditable(getParent(el)); // contentEditable is set to 'inherit'
}

function nextEl (el) {
  return el.nextElementSibling || manually();
  function manually () {
    var sibling = el;
    do {
      sibling = sibling.nextSibling;
    } while (sibling && sibling.nodeType !== 1);
    return sibling;
  }
}

function getEventHost (e) {
  // on touchend event, we have to use `e.changedTouches`
  // see http://stackoverflow.com/questions/7192563/touchend-event-properties
  // see https://github.com/bevacqua/dragula/issues/34
  if (e.targetTouches && e.targetTouches.length) {
    return e.targetTouches[0];
  }
  if (e.changedTouches && e.changedTouches.length) {
    return e.changedTouches[0];
  }
  return e;
}

function getCoord (coord, e) {
  var host = getEventHost(e);
  var missMap = {
    pageX: 'clientX', // IE8
    pageY: 'clientY' // IE8
  };
  if (coord in missMap && !(coord in host) && missMap[coord] in host) {
    coord = missMap[coord];
  }
  return host[coord];
}

module.exports = dragula;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes":38,"contra/emitter":34,"crossvent":35}],40:[function(require,module,exports){
/*
 * notie.js - A clean and simple notification plugin (alert/growl style) for javascript, with no dependencies.
 *
 * Copyright (c) 2015 Jared Reich
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://jaredreich.com/projects/notie.js
 *
 * Version:  2.1.0
 *
*/

var notie = function(){

    // SETTINGS
    // *********************************************
    
    // General
    var shadow = true;
    var font_size_small = '18px';
    var font_size_big = '24px';
    var font_change_screen_width = 600;
    var animation_delay = 0.3;
    var background_click_dismiss = true;
    
    // notie.alert colors
    var alert_color_success_background = '#57BF57';
    var alert_color_warning_background = '#E3B771';
    var alert_color_error_background = '#E1715B';
    var alert_color_info_background = '#4D82D6';
    var alert_color_text = '#FFF';

    // notie.confirm colors
    var confirm_and_input_color_background = '#4D82D6';
    var confirm_and_input_color_yes_background = '#57BF57';
    var confirm_and_input_color_no_background = '#E1715B';
    var confirm_and_input_color_text = '#FFF';
    var confirm_and_input_color_yes_text = '#FFF';
    var confirm_and_input_color_no_text = '#FFF';
    
    // ID's for use within your own .css file (OPTIONAL)
    // (Be sure to use !important to override the javascript)
    // Example: #notie-alert-inner { padding: 30px !important; }
    var alert_outer_id = 'notie-alert-outer';
    var alert_inner_id = 'notie-alert-inner';
    var alert_text_id = 'notie-alert-text';
    var confirm_outer_id = 'notie-confirm-outer';
    var confirm_inner_id = 'notie-confirm-inner';
    var confirm_background_id = 'notie-confirm-background';
    var confirm_yes_id = 'notie-confirm-yes';
    var confirm_no_id = 'notie-confirm-no';
    var confirm_text_id = 'notie-confirm-text';
    var confirm_yes_text_id = 'notie-confirm-yes-text';
    var confirm_no_text_id = 'notie-confirm-no-text';
    var input_outer_id = 'notie-input-outer';
    var input_inner_id = 'notie-input-inner';
    var input_background_id = 'notie-input-background';
    var input_div_id = 'notie-input-div';
    var input_field_id = 'notie-input-field';
    var input_yes_id = 'notie-input-yes';
    var input_no_id = 'notie-input-no';
    var input_text_id = 'notie-input-text';
    var input_yes_text_id = 'notie-input-yes-text';
    var input_no_text_id = 'notie-input-no-text';
    
    // *********************************************
    
    
    
    
    
    // HELPERS
    // *********************************************
    
    // Function for resize listeners for font-size
    var resizeListener = function resizeListener(ele) {
        if (window.innerWidth <= font_change_screen_width) { ele.style.fontSize = font_size_small; }
        else { ele.style.fontSize = font_size_big; }
    };
    
    
    // Debounce function (credit to Underscore.js)
    var debounce_time = 500;
    var debounce = function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    
    // Event listener for enter and escape keys
    window.addEventListener('keydown', function(event) {
        var enter_clicked = (event.which == 13 || event.keyCode == 13);
        var escape_clicked = (event.which == 27 || event.keyCode == 27);
        if (alert_is_showing) {
            if (enter_clicked || escape_clicked) {
                clearTimeout(alert_timeout_1);
                clearTimeout(alert_timeout_2);
                alert_hide();
            }
        }
        else if (confirm_is_showing) {
            if (enter_clicked) {
                confirm_yes.click();
            }
            else if (escape_clicked) {
                confirm_no.click();
            }
        }
        else if (input_is_showing) {
            if (enter_clicked) {
                input_yes.click();
            }
            else if (escape_clicked) {
                input_no.click();
            }
        }
    });
    
    
    // addEventListener polyfill, fixes a style.height issue for IE8
    if (typeof Element.prototype.addEventListener === 'undefined') {
        Element.prototype.addEventListener = Window.prototype.addEventListener = function (e, callback) {
            e = 'on' + e;
            return this.attachEvent(e, callback);
        };
    }


    // Scroll disable and enable for notie.confirm and notie.input
    var original_body_height, original_body_overflow;
    function scroll_disable() {
        original_body_height = document.body.style.height;
        original_body_overflow = document.body.style.overflow;
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
    }
    function scroll_enable() {
        document.body.style.height = original_body_height;
        document.body.style.overflow = original_body_overflow;
    }
    // *********************************************
    
    
    
    // NOTIE.ALERT
    // *********************************************

    // notie elements and styling
    var alert_outer = document.createElement('div');
    alert_outer.id = alert_outer_id;
    alert_outer.style.position = 'fixed';
    alert_outer.style.top = '0';
    alert_outer.style.left = '0';
    alert_outer.style.zIndex = '999999999';
    alert_outer.style.height = 'auto';
    alert_outer.style.width = '100%';
    alert_outer.style.display = 'none';
    alert_outer.style.textAlign = 'center';
    alert_outer.style.cursor = 'default';
    alert_outer.style.MozTransition = '';
    alert_outer.style.WebkitTransition = '';
    alert_outer.style.transition = '';
    alert_outer.style.cursor = 'pointer';
    
    // Hide alert on click
    alert_outer.onclick = function() {
        clearTimeout(alert_timeout_1);
        clearTimeout(alert_timeout_2);
        alert_hide();
    };
    
    var alert_inner = document.createElement('div');
    alert_inner.id = alert_inner_id;
    alert_inner.style.padding = '20px';
    alert_inner.style.display = 'table-cell';
    alert_inner.style.verticalAlign = 'middle';
    alert_outer.appendChild(alert_inner);
    
    // Initialize notie text
    var alert_text = document.createElement('span');
    alert_text.id = alert_text_id;
    alert_text.style.color = alert_color_text;
    if (window.innerWidth <= font_change_screen_width) { alert_text.style.fontSize = font_size_small; }
    else { alert_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, alert_text), debounce_time), true);
    alert_inner.appendChild(alert_text);

    // Attach notie to the body element
    document.body.appendChild(alert_outer);

    // Declare variables
    var height = 0;
    var alert_is_showing = false;
    var alert_timeout_1;
    var alert_timeout_2;
    var was_clicked_counter = 0;

    function alert(type, message, seconds) {
        
        // Blur active element for use of enter key, focus input
        document.activeElement.blur();

        was_clicked_counter++;

        setTimeout(function() {
            was_clicked_counter--;
        }, (animation_delay * 1000 + 10));

        if (was_clicked_counter == 1) {

            if (alert_is_showing) {

                clearTimeout(alert_timeout_1);
                clearTimeout(alert_timeout_2);

                alert_hide(function() {
                    alert_show(type, message, seconds);
                });

            }
            else {
                alert_show(type, message, seconds);
            }

        }

    }

    function alert_show(type, message, seconds) {

        alert_is_showing = true;

        var duration = 0;
        if (typeof seconds == 'undefined') {
            var duration = 3000;
        }
        else if (seconds < 1) {
            duration = 1000;
        }
        else {
            duration = seconds * 1000;
        }

        // Set notie type (background color)
        switch(type) {
            case 1:
                alert_outer.style.backgroundColor = alert_color_success_background;
                break;
            case 2:
                alert_outer.style.backgroundColor = alert_color_warning_background;
                break;
            case 3:
                alert_outer.style.backgroundColor = alert_color_error_background;
                break;
            case 4:
                alert_outer.style.backgroundColor = alert_color_info_background;
                break;
        }

        // Set notie text
        alert_text.innerHTML = message;

        // Get notie's height
        alert_outer.style.top = '-10000px';
        alert_outer.style.display = 'table';
        alert_outer.style.top = '-' + alert_outer.offsetHeight - 5 + 'px';

        alert_timeout_1 = setTimeout(function() {

            if (shadow) { alert_outer.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.5)'; }
            alert_outer.style.MozTransition = 'all ' + animation_delay + 's ease';
            alert_outer.style.WebkitTransition = 'all ' + animation_delay + 's ease';
            alert_outer.style.transition = 'all ' + animation_delay + 's ease';

            alert_outer.style.top = 0;

            alert_timeout_2 = setTimeout(function() {

                alert_hide(function() {
                    // Nothing
                });

            }, duration);

        }, 20);

    }

    function alert_hide(callback) {

        alert_outer.style.top = '-' + alert_outer.offsetHeight - 5 + 'px';

        setTimeout(function() {

            if (shadow) { alert_outer.style.boxShadow = ''; }
            alert_outer.style.MozTransition = '';
            alert_outer.style.WebkitTransition = '';
            alert_outer.style.transition = '';
            
            alert_outer.style.top = '-10000px';

            alert_is_showing = false;

            if (callback) { callback(); }

        }, (animation_delay * 1000 + 10));

    }



    // NOTIE.CONFIRM
    // *********************************************

    // confirm elements and styling
    var confirm_outer = document.createElement('div');
    confirm_outer.id = confirm_outer_id;
    confirm_outer.style.position = 'fixed';
    confirm_outer.style.top = '0';
    confirm_outer.style.left = '0';
    confirm_outer.style.zIndex = '999999998';
    confirm_outer.style.height = 'auto';
    confirm_outer.style.width = '100%';
    confirm_outer.style.display = 'none';
    confirm_outer.style.textAlign = 'center';
    confirm_outer.style.MozTransition = '';
    confirm_outer.style.WebkitTransition = '';
    confirm_outer.style.transition = '';

    var confirm_background = document.createElement('div');
    confirm_background.id = confirm_background_id;
    confirm_background.style.position = 'fixed';
    confirm_background.style.top = '0';
    confirm_background.style.left = '0';
    confirm_background.style.zIndex = '999999997';
    confirm_background.style.height = '100%';
    confirm_background.style.width = '100%';
    confirm_background.style.display = 'none';
    confirm_background.style.backgroundColor = 'white';
    confirm_background.style.MozTransition = 'all ' + animation_delay + 's ease';
    confirm_background.style.WebkitTransition = 'all ' + animation_delay + 's ease';
    confirm_background.style.transition = 'all ' + animation_delay + 's ease';
    confirm_background.style.opacity = '0';
    
    // Hide notie.confirm on background click
    confirm_background.onclick = function() {
        if (background_click_dismiss) {
            confirm_hide();
        }
    };

    var confirm_inner = document.createElement('div');
    confirm_inner.id = confirm_inner_id;
    confirm_inner.style.boxSizing = 'border-box';
    confirm_inner.style.width = '100%';
    confirm_inner.style.padding = '20px';
    confirm_inner.style.display = 'block';
    confirm_inner.style.cursor = 'default';
    confirm_inner.style.backgroundColor = confirm_and_input_color_background;
    confirm_outer.appendChild(confirm_inner);

    var confirm_yes = document.createElement('div');
    confirm_yes.id = confirm_yes_id;
    confirm_yes.style.cssFloat = 'left';
    confirm_yes.style.height = '50px';
    confirm_yes.style.lineHeight = '50px';
    confirm_yes.style.width = '50%';
    confirm_yes.style.cursor = 'pointer';
    confirm_yes.style.backgroundColor = confirm_and_input_color_yes_background;
    confirm_outer.appendChild(confirm_yes);

    var confirm_no = document.createElement('div');
    confirm_no.id = confirm_no_id;
    confirm_no.style.cssFloat = 'right';
    confirm_no.style.height = '50px';
    confirm_no.style.lineHeight = '50px';
    confirm_no.style.width = '50%';
    confirm_no.style.cursor = 'pointer';
    confirm_no.style.backgroundColor = confirm_and_input_color_no_background;
    confirm_no.onclick = function() { confirm_hide(); }
    confirm_outer.appendChild(confirm_no);

    // Initialize confirm text
    var confirm_text = document.createElement('span');
    confirm_text.id = confirm_text_id;
    confirm_text.style.color = confirm_and_input_color_text;
    if (window.innerWidth <= font_change_screen_width) { confirm_text.style.fontSize = font_size_small; }
    else { confirm_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, confirm_text), debounce_time), true);
    confirm_inner.appendChild(confirm_text);

    var confirm_yes_text = document.createElement('span');
    confirm_yes_text.id = confirm_yes_text_id;
    confirm_yes_text.style.color = confirm_and_input_color_yes_text;
    if (window.innerWidth <= font_change_screen_width) { confirm_yes_text.style.fontSize = font_size_small; }
    else { confirm_yes_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, confirm_yes_text), debounce_time), true);
    confirm_yes.appendChild(confirm_yes_text);

    var confirm_no_text = document.createElement('span');
    confirm_no_text.id = confirm_no_text_id;
    confirm_no_text.style.color = confirm_and_input_color_no_text;
    if (window.innerWidth <= font_change_screen_width) { confirm_no_text.style.fontSize = font_size_small; }
    else { confirm_no_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, confirm_no_text), debounce_time), true);
    confirm_no.appendChild(confirm_no_text);

    // Attach confirm elements to the body element
    document.body.appendChild(confirm_outer);
    document.body.appendChild(confirm_background);

    // Declare variables
    var confirm_height = 0;
    var confirm_is_showing = false;

    function confirm(title, yes_text, no_text, yes_callback) {
        
        // Blur active element for use of enter key
        document.activeElement.blur();
        
        if (alert_is_showing) {
            // Hide notie.alert
            clearTimeout(alert_timeout_1);
            clearTimeout(alert_timeout_2);
            alert_hide(function() {
                confirm_show(title, yes_text, no_text, yes_callback);
            });
        }
        else {
            confirm_show(title, yes_text, no_text, yes_callback);
        }
        

    }
    function confirm_show(title, yes_text, no_text, yes_callback) {

        scroll_disable();

        // Yes callback function
        confirm_yes.onclick = function() {
            confirm_hide();
            setTimeout(function() {
                yes_callback();
            }, (animation_delay * 1000 + 10));
        }

        function confirm_show_inner() {

            // Set confirm text
            confirm_text.innerHTML = title;
            confirm_yes_text.innerHTML = yes_text;
            confirm_no_text.innerHTML = no_text;

            // Get confirm's height
            confirm_outer.style.top = '-10000px';
            confirm_outer.style.display = 'table';
            confirm_outer.style.top = '-' + confirm_outer.offsetHeight - 5 + 'px';
            confirm_background.style.display = 'block';

            setTimeout(function() {

                if (shadow) { confirm_outer.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.5)'; }
                confirm_outer.style.MozTransition = 'all ' + animation_delay + 's ease';
                confirm_outer.style.WebkitTransition = 'all ' + animation_delay + 's ease';
                confirm_outer.style.transition = 'all ' + animation_delay + 's ease';

                confirm_outer.style.top = 0;
                confirm_background.style.opacity = '0.75';

                setTimeout(function() {
                    confirm_is_showing = true;
                }, (animation_delay * 1000 + 10));

            }, 20);

        }

        if (confirm_is_showing) {
            confirm_hide();
            setTimeout(function() {
                confirm_show_inner();
            }, (animation_delay * 1000 + 10));
        }
        else {
            confirm_show_inner();
        }

    }

    function confirm_hide() {

        confirm_outer.style.top = '-' + confirm_outer.offsetHeight - 5 + 'px';
        confirm_background.style.opacity = '0';

        setTimeout(function() {

            if (shadow) { confirm_outer.style.boxShadow = ''; }
            confirm_outer.style.MozTransition = '';
            confirm_outer.style.WebkitTransition = '';
            confirm_outer.style.transition = '';
            confirm_background.style.display = 'none';
            
            confirm_outer.style.top = '-10000px';

            scroll_enable();

            confirm_is_showing = false;

        }, (animation_delay * 1000 + 10));

    }
    
    
    
    
    // NOTIE.INPUT
    // *********************************************

    // input elements and styling
    var input_outer = document.createElement('div');
    input_outer.id = input_outer_id;
    input_outer.style.position = 'fixed';
    input_outer.style.top = '0';
    input_outer.style.left = '0';
    input_outer.style.zIndex = '999999998';
    input_outer.style.height = 'auto';
    input_outer.style.width = '100%';
    input_outer.style.display = 'none';
    input_outer.style.textAlign = 'center';
    input_outer.style.MozTransition = '';
    input_outer.style.WebkitTransition = '';
    input_outer.style.transition = '';

    var input_background = document.createElement('div');
    input_background.id = input_background_id;
    input_background.style.position = 'fixed';
    input_background.style.top = '0';
    input_background.style.left = '0';
    input_background.style.zIndex = '999999997';
    input_background.style.height = '100%';
    input_background.style.width = '100%';
    input_background.style.display = 'none';
    input_background.style.backgroundColor = 'white';
    input_background.style.MozTransition = 'all ' + animation_delay + 's ease';
    input_background.style.WebkitTransition = 'all ' + animation_delay + 's ease';
    input_background.style.transition = 'all ' + animation_delay + 's ease';
    input_background.style.opacity = '0';
    
    // Hide notie.input on background click
    input_background.onclick = function() {
        if (background_click_dismiss) {
            input_hide();
        }
    };

    var input_inner = document.createElement('div');
    input_inner.id = input_inner_id;
    input_inner.style.boxSizing = 'border-box';
    input_inner.style.width = '100%';
    input_inner.style.padding = '20px';
    input_inner.style.display = 'block';
    input_inner.style.cursor = 'default';
    input_inner.style.backgroundColor = confirm_and_input_color_background;
    input_outer.appendChild(input_inner);
    
    var input_div = document.createElement('div');
    input_div.id = input_div_id;
    input_div.style.boxSizing = 'border-box';
    input_div.style.height = '55px';
    input_div.style.width = '100%';
    input_div.style.display = 'block';
    input_div.style.cursor = 'default';
    input_div.style.backgroundColor = '#FFF';
    input_outer.appendChild(input_div);
    
    var input_field = document.createElement('input');
    input_field.id = input_field_id;    
    input_field.setAttribute('autocomplete', 'off');
    input_field.setAttribute('autocorrect', 'off');
    input_field.setAttribute('autocapitalize', 'off');
    input_field.setAttribute('spellcheck', 'false');
    input_field.style.boxSizing = 'border-box';
    input_field.style.height = '55px';
    input_field.style.width = '100%';
    input_field.style.textAlign = 'center';
    input_field.style.textIndent = '10px';
    input_field.style.paddingRight = '10px';
    input_field.style.outline = '0';
    input_field.style.border = '0';
    input_field.style.fontFamily = 'inherit';
    input_field.style.fontSize = font_size_big;
    if (window.innerWidth <= font_change_screen_width) { input_field.style.fontSize = font_size_small; }
    else { input_field.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, input_field), debounce_time), true);
    input_div.appendChild(input_field);

    var input_yes = document.createElement('div');
    input_yes.id = input_yes_id;
    input_yes.style.cssFloat = 'left';
    input_yes.style.height = '50px';
    input_yes.style.lineHeight = '50px';
    input_yes.style.width = '50%';
    input_yes.style.cursor = 'pointer';
    input_yes.style.backgroundColor = confirm_and_input_color_yes_background;
    input_outer.appendChild(input_yes);

    var input_no = document.createElement('div');
    input_no.id = input_no_id;
    input_no.style.cssFloat = 'right';
    input_no.style.height = '50px';
    input_no.style.lineHeight = '50px';
    input_no.style.width = '50%';
    input_no.style.cursor = 'pointer';
    input_no.style.backgroundColor = confirm_and_input_color_no_background;
    input_no.onclick = function() { input_hide(); }
    input_outer.appendChild(input_no);

    // Initialize input text
    var input_text = document.createElement('span');
    input_text.id = input_text_id;
    input_text.style.color = confirm_and_input_color_text;
    if (window.innerWidth <= font_change_screen_width) { input_text.style.fontSize = font_size_small; }
    else { input_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, input_text), debounce_time), true);
    input_inner.appendChild(input_text);

    var input_yes_text = document.createElement('span');
    input_yes_text.id = input_yes_text_id;
    input_yes_text.style.color = confirm_and_input_color_yes_text;
    if (window.innerWidth <= font_change_screen_width) { input_yes_text.style.fontSize = font_size_small; }
    else { input_yes_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, input_yes_text), debounce_time), true);
    input_yes.appendChild(input_yes_text);

    var input_no_text = document.createElement('span');
    input_no_text.id = input_no_text_id;
    input_no_text.style.color = confirm_and_input_color_no_text;
    if (window.innerWidth <= font_change_screen_width) { input_no_text.style.fontSize = font_size_small; }
    else { input_no_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, input_no_text), debounce_time), true);
    input_no.appendChild(input_no_text);

    // Attach input elements to the body element
    document.body.appendChild(input_outer);
    document.body.appendChild(input_background);

    // Declare variables
    var input_height = 0;
    var input_is_showing = false;

    function input(title, submit_text, cancel_text, type, placeholder, submit_callback, prefilled_value_optional) {
        
        // Blur active element for use of enter key, focus input
        document.activeElement.blur();
        setTimeout(function() { input_field.focus(); }, (animation_delay * 1000));
        
        input_field.setAttribute('type', type);
        input_field.setAttribute('placeholder', placeholder);
        input_field.value = '';
        if (typeof prefilled_value_optional !== 'undefined' && prefilled_value_optional.length > 0) { input_field.value = prefilled_value_optional }
        
        if (alert_is_showing) {
            // Hide notie.alert
            clearTimeout(alert_timeout_1);
            clearTimeout(alert_timeout_2);
            alert_hide(function() {
                input_show(title, submit_text, cancel_text, submit_callback);
            });
        }
        else {
            input_show(title, submit_text, cancel_text, submit_callback);
        }

    }
    function input_show(title, submit_text, cancel_text, submit_callback) {

        scroll_disable();

        // Yes callback function
        input_yes.onclick = function() {
            input_hide();
            setTimeout(function() {
                submit_callback(input_field.value);
            }, (animation_delay * 1000 + 10));
        }

        function input_show_inner() {

            // Set input text
            input_text.innerHTML = title;
            input_yes_text.innerHTML = submit_text;
            input_no_text.innerHTML = cancel_text;

            // Get input's height
            input_outer.style.top = '-10000px';
            input_outer.style.display = 'table';
            input_outer.style.top = '-' + input_outer.offsetHeight - 5 + 'px';
            input_background.style.display = 'block';

            setTimeout(function() {

                if (shadow) { input_outer.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.5)'; }
                input_outer.style.MozTransition = 'all ' + animation_delay + 's ease';
                input_outer.style.WebkitTransition = 'all ' + animation_delay + 's ease';
                input_outer.style.transition = 'all ' + animation_delay + 's ease';

                input_outer.style.top = 0;
                input_background.style.opacity = '0.75';

                setTimeout(function() {
                    input_is_showing = true;
                }, (animation_delay * 1000 + 10));

            }, 20);

        }

        if (input_is_showing) {
            input_hide();
            setTimeout(function() {
                input_show_inner();
            }, (animation_delay * 1000 + 10));
        }
        else {
            input_show_inner();
        }

    }

    function input_hide() {

        input_outer.style.top = '-' + input_outer.offsetHeight - 5 + 'px';
        input_background.style.opacity = '0';

        setTimeout(function() {

            if (shadow) { input_outer.style.boxShadow = ''; }
            input_outer.style.MozTransition = '';
            input_outer.style.WebkitTransition = '';
            input_outer.style.transition = '';
            input_background.style.display = 'none';
            
            input_outer.style.top = '-10000px';

            scroll_enable();

            input_is_showing = false;

        }, (animation_delay * 1000 + 10));

    }
    
    
    
    return {
        alert: alert,
        confirm: confirm,
        input: input
    };

}();

if (typeof module !== 'undefined' && module) {
    module.exports = notie;
}
},{}],41:[function(require,module,exports){
/*! nouislider - 8.2.1 - 2015-12-02 21:43:14 */

(function (factory) {

    if ( typeof define === 'function' && define.amd ) {

        // AMD. Register as an anonymous module.
        define([], factory);

    } else if ( typeof exports === 'object' ) {

        // Node/CommonJS
        module.exports = factory();

    } else {

        // Browser globals
        window.noUiSlider = factory();
    }

}(function( ){

	'use strict';


	// Removes duplicates from an array.
	function unique(array) {
		return array.filter(function(a){
			return !this[a] ? this[a] = true : false;
		}, {});
	}

	// Round a value to the closest 'to'.
	function closest ( value, to ) {
		return Math.round(value / to) * to;
	}

	// Current position of an element relative to the document.
	function offset ( elem ) {

	var rect = elem.getBoundingClientRect(),
		doc = elem.ownerDocument,
		docElem = doc.documentElement,
		pageOffset = getPageOffset();

		// getBoundingClientRect contains left scroll in Chrome on Android.
		// I haven't found a feature detection that proves this. Worst case
		// scenario on mis-match: the 'tap' feature on horizontal sliders breaks.
		if ( /webkit.*Chrome.*Mobile/i.test(navigator.userAgent) ) {
			pageOffset.x = 0;
		}

		return {
			top: rect.top + pageOffset.y - docElem.clientTop,
			left: rect.left + pageOffset.x - docElem.clientLeft
		};
	}

	// Checks whether a value is numerical.
	function isNumeric ( a ) {
		return typeof a === 'number' && !isNaN( a ) && isFinite( a );
	}

	// Rounds a number to 7 supported decimals.
	function accurateNumber( number ) {
		var p = Math.pow(10, 7);
		return Number((Math.round(number*p)/p).toFixed(7));
	}

	// Sets a class and removes it after [duration] ms.
	function addClassFor ( element, className, duration ) {
		addClass(element, className);
		setTimeout(function(){
			removeClass(element, className);
		}, duration);
	}

	// Limits a value to 0 - 100
	function limit ( a ) {
		return Math.max(Math.min(a, 100), 0);
	}

	// Wraps a variable as an array, if it isn't one yet.
	function asArray ( a ) {
		return Array.isArray(a) ? a : [a];
	}

	// Counts decimals
	function countDecimals ( numStr ) {
		var pieces = numStr.split(".");
		return pieces.length > 1 ? pieces[1].length : 0;
	}

	// http://youmightnotneedjquery.com/#add_class
	function addClass ( el, className ) {
		if ( el.classList ) {
			el.classList.add(className);
		} else {
			el.className += ' ' + className;
		}
	}

	// http://youmightnotneedjquery.com/#remove_class
	function removeClass ( el, className ) {
		if ( el.classList ) {
			el.classList.remove(className);
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	}

	// http://youmightnotneedjquery.com/#has_class
	function hasClass ( el, className ) {
		if ( el.classList ) {
			el.classList.contains(className);
		} else {
			new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY#Notes
	function getPageOffset ( ) {

		var supportPageOffset = window.pageXOffset !== undefined,
			isCSS1Compat = ((document.compatMode || "") === "CSS1Compat"),
			x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft,
			y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

		return {
			x: x,
			y: y
		};
	}

	// Shorthand for stopPropagation so we don't have to create a dynamic method
	function stopPropagation ( e ) {
		e.stopPropagation();
	}

	// todo
	function addCssPrefix(cssPrefix) {
		return function(className) {
			return cssPrefix + className;
		};
	}


	var
	// Determine the events to bind. IE11 implements pointerEvents without
	// a prefix, which breaks compatibility with the IE10 implementation.
	/** @const */
	actions = window.navigator.pointerEnabled ? {
		start: 'pointerdown',
		move: 'pointermove',
		end: 'pointerup'
	} : window.navigator.msPointerEnabled ? {
		start: 'MSPointerDown',
		move: 'MSPointerMove',
		end: 'MSPointerUp'
	} : {
		start: 'mousedown touchstart',
		move: 'mousemove touchmove',
		end: 'mouseup touchend'
	},
	defaultCssPrefix = 'noUi-';


// Value calculation

	// Determine the size of a sub-range in relation to a full range.
	function subRangeRatio ( pa, pb ) {
		return (100 / (pb - pa));
	}

	// (percentage) How many percent is this value of this range?
	function fromPercentage ( range, value ) {
		return (value * 100) / ( range[1] - range[0] );
	}

	// (percentage) Where is this value on this range?
	function toPercentage ( range, value ) {
		return fromPercentage( range, range[0] < 0 ?
			value + Math.abs(range[0]) :
				value - range[0] );
	}

	// (value) How much is this percentage on this range?
	function isPercentage ( range, value ) {
		return ((value * ( range[1] - range[0] )) / 100) + range[0];
	}


// Range conversion

	function getJ ( value, arr ) {

		var j = 1;

		while ( value >= arr[j] ){
			j += 1;
		}

		return j;
	}

	// (percentage) Input a value, find where, on a scale of 0-100, it applies.
	function toStepping ( xVal, xPct, value ) {

		if ( value >= xVal.slice(-1)[0] ){
			return 100;
		}

		var j = getJ( value, xVal ), va, vb, pa, pb;

		va = xVal[j-1];
		vb = xVal[j];
		pa = xPct[j-1];
		pb = xPct[j];

		return pa + (toPercentage([va, vb], value) / subRangeRatio (pa, pb));
	}

	// (value) Input a percentage, find where it is on the specified range.
	function fromStepping ( xVal, xPct, value ) {

		// There is no range group that fits 100
		if ( value >= 100 ){
			return xVal.slice(-1)[0];
		}

		var j = getJ( value, xPct ), va, vb, pa, pb;

		va = xVal[j-1];
		vb = xVal[j];
		pa = xPct[j-1];
		pb = xPct[j];

		return isPercentage([va, vb], (value - pa) * subRangeRatio (pa, pb));
	}

	// (percentage) Get the step that applies at a certain value.
	function getStep ( xPct, xSteps, snap, value ) {

		if ( value === 100 ) {
			return value;
		}

		var j = getJ( value, xPct ), a, b;

		// If 'snap' is set, steps are used as fixed points on the slider.
		if ( snap ) {

			a = xPct[j-1];
			b = xPct[j];

			// Find the closest position, a or b.
			if ((value - a) > ((b-a)/2)){
				return b;
			}

			return a;
		}

		if ( !xSteps[j-1] ){
			return value;
		}

		return xPct[j-1] + closest(
			value - xPct[j-1],
			xSteps[j-1]
		);
	}


// Entry parsing

	function handleEntryPoint ( index, value, that ) {

		var percentage;

		// Wrap numerical input in an array.
		if ( typeof value === "number" ) {
			value = [value];
		}

		// Reject any invalid input, by testing whether value is an array.
		if ( Object.prototype.toString.call( value ) !== '[object Array]' ){
			throw new Error("noUiSlider: 'range' contains invalid value.");
		}

		// Covert min/max syntax to 0 and 100.
		if ( index === 'min' ) {
			percentage = 0;
		} else if ( index === 'max' ) {
			percentage = 100;
		} else {
			percentage = parseFloat( index );
		}

		// Check for correct input.
		if ( !isNumeric( percentage ) || !isNumeric( value[0] ) ) {
			throw new Error("noUiSlider: 'range' value isn't numeric.");
		}

		// Store values.
		that.xPct.push( percentage );
		that.xVal.push( value[0] );

		// NaN will evaluate to false too, but to keep
		// logging clear, set step explicitly. Make sure
		// not to override the 'step' setting with false.
		if ( !percentage ) {
			if ( !isNaN( value[1] ) ) {
				that.xSteps[0] = value[1];
			}
		} else {
			that.xSteps.push( isNaN(value[1]) ? false : value[1] );
		}
	}

	function handleStepPoint ( i, n, that ) {

		// Ignore 'false' stepping.
		if ( !n ) {
			return true;
		}

		// Factor to range ratio
		that.xSteps[i] = fromPercentage([
			 that.xVal[i]
			,that.xVal[i+1]
		], n) / subRangeRatio (
			that.xPct[i],
			that.xPct[i+1] );
	}


// Interface

	// The interface to Spectrum handles all direction-based
	// conversions, so the above values are unaware.

	function Spectrum ( entry, snap, direction, singleStep ) {

		this.xPct = [];
		this.xVal = [];
		this.xSteps = [ singleStep || false ];
		this.xNumSteps = [ false ];

		this.snap = snap;
		this.direction = direction;

		var index, ordered = [ /* [0, 'min'], [1, '50%'], [2, 'max'] */ ];

		// Map the object keys to an array.
		for ( index in entry ) {
			if ( entry.hasOwnProperty(index) ) {
				ordered.push([entry[index], index]);
			}
		}

		// Sort all entries by value (numeric sort).
		if ( ordered.length && typeof ordered[0][0] === "object" ) {
			ordered.sort(function(a, b) { return a[0][0] - b[0][0]; });
		} else {
			ordered.sort(function(a, b) { return a[0] - b[0]; });
		}


		// Convert all entries to subranges.
		for ( index = 0; index < ordered.length; index++ ) {
			handleEntryPoint(ordered[index][1], ordered[index][0], this);
		}

		// Store the actual step values.
		// xSteps is sorted in the same order as xPct and xVal.
		this.xNumSteps = this.xSteps.slice(0);

		// Convert all numeric steps to the percentage of the subrange they represent.
		for ( index = 0; index < this.xNumSteps.length; index++ ) {
			handleStepPoint(index, this.xNumSteps[index], this);
		}
	}

	Spectrum.prototype.getMargin = function ( value ) {
		return this.xPct.length === 2 ? fromPercentage(this.xVal, value) : false;
	};

	Spectrum.prototype.toStepping = function ( value ) {

		value = toStepping( this.xVal, this.xPct, value );

		// Invert the value if this is a right-to-left slider.
		if ( this.direction ) {
			value = 100 - value;
		}

		return value;
	};

	Spectrum.prototype.fromStepping = function ( value ) {

		// Invert the value if this is a right-to-left slider.
		if ( this.direction ) {
			value = 100 - value;
		}

		return accurateNumber(fromStepping( this.xVal, this.xPct, value ));
	};

	Spectrum.prototype.getStep = function ( value ) {

		// Find the proper step for rtl sliders by search in inverse direction.
		// Fixes issue #262.
		if ( this.direction ) {
			value = 100 - value;
		}

		value = getStep(this.xPct, this.xSteps, this.snap, value );

		if ( this.direction ) {
			value = 100 - value;
		}

		return value;
	};

	Spectrum.prototype.getApplicableStep = function ( value ) {

		// If the value is 100%, return the negative step twice.
		var j = getJ(value, this.xPct), offset = value === 100 ? 2 : 1;
		return [this.xNumSteps[j-2], this.xVal[j-offset], this.xNumSteps[j-offset]];
	};

	// Outside testing
	Spectrum.prototype.convert = function ( value ) {
		return this.getStep(this.toStepping(value));
	};

/*	Every input option is tested and parsed. This'll prevent
	endless validation in internal methods. These tests are
	structured with an item for every option available. An
	option can be marked as required by setting the 'r' flag.
	The testing function is provided with three arguments:
		- The provided value for the option;
		- A reference to the options object;
		- The name for the option;

	The testing function returns false when an error is detected,
	or true when everything is OK. It can also modify the option
	object, to make sure all values can be correctly looped elsewhere. */

	var defaultFormatter = { 'to': function( value ){
		return value !== undefined && value.toFixed(2);
	}, 'from': Number };

	function testStep ( parsed, entry ) {

		if ( !isNumeric( entry ) ) {
			throw new Error("noUiSlider: 'step' is not numeric.");
		}

		// The step option can still be used to set stepping
		// for linear sliders. Overwritten if set in 'range'.
		parsed.singleStep = entry;
	}

	function testRange ( parsed, entry ) {

		// Filter incorrect input.
		if ( typeof entry !== 'object' || Array.isArray(entry) ) {
			throw new Error("noUiSlider: 'range' is not an object.");
		}

		// Catch missing start or end.
		if ( entry.min === undefined || entry.max === undefined ) {
			throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");
		}

		// Catch equal start or end.
		if ( entry.min === entry.max ) {
			throw new Error("noUiSlider: 'range' 'min' and 'max' cannot be equal.");
		}

		parsed.spectrum = new Spectrum(entry, parsed.snap, parsed.dir, parsed.singleStep);
	}

	function testStart ( parsed, entry ) {

		entry = asArray(entry);

		// Validate input. Values aren't tested, as the public .val method
		// will always provide a valid location.
		if ( !Array.isArray( entry ) || !entry.length || entry.length > 2 ) {
			throw new Error("noUiSlider: 'start' option is incorrect.");
		}

		// Store the number of handles.
		parsed.handles = entry.length;

		// When the slider is initialized, the .val method will
		// be called with the start options.
		parsed.start = entry;
	}

	function testSnap ( parsed, entry ) {

		// Enforce 100% stepping within subranges.
		parsed.snap = entry;

		if ( typeof entry !== 'boolean' ){
			throw new Error("noUiSlider: 'snap' option must be a boolean.");
		}
	}

	function testAnimate ( parsed, entry ) {

		// Enforce 100% stepping within subranges.
		parsed.animate = entry;

		if ( typeof entry !== 'boolean' ){
			throw new Error("noUiSlider: 'animate' option must be a boolean.");
		}
	}

	function testConnect ( parsed, entry ) {

		if ( entry === 'lower' && parsed.handles === 1 ) {
			parsed.connect = 1;
		} else if ( entry === 'upper' && parsed.handles === 1 ) {
			parsed.connect = 2;
		} else if ( entry === true && parsed.handles === 2 ) {
			parsed.connect = 3;
		} else if ( entry === false ) {
			parsed.connect = 0;
		} else {
			throw new Error("noUiSlider: 'connect' option doesn't match handle count.");
		}
	}

	function testOrientation ( parsed, entry ) {

		// Set orientation to an a numerical value for easy
		// array selection.
		switch ( entry ){
		  case 'horizontal':
			parsed.ort = 0;
			break;
		  case 'vertical':
			parsed.ort = 1;
			break;
		  default:
			throw new Error("noUiSlider: 'orientation' option is invalid.");
		}
	}

	function testMargin ( parsed, entry ) {

		if ( !isNumeric(entry) ){
			throw new Error("noUiSlider: 'margin' option must be numeric.");
		}

		parsed.margin = parsed.spectrum.getMargin(entry);

		if ( !parsed.margin ) {
			throw new Error("noUiSlider: 'margin' option is only supported on linear sliders.");
		}
	}

	function testLimit ( parsed, entry ) {

		if ( !isNumeric(entry) ){
			throw new Error("noUiSlider: 'limit' option must be numeric.");
		}

		parsed.limit = parsed.spectrum.getMargin(entry);

		if ( !parsed.limit ) {
			throw new Error("noUiSlider: 'limit' option is only supported on linear sliders.");
		}
	}

	function testDirection ( parsed, entry ) {

		// Set direction as a numerical value for easy parsing.
		// Invert connection for RTL sliders, so that the proper
		// handles get the connect/background classes.
		switch ( entry ) {
		  case 'ltr':
			parsed.dir = 0;
			break;
		  case 'rtl':
			parsed.dir = 1;
			parsed.connect = [0,2,1,3][parsed.connect];
			break;
		  default:
			throw new Error("noUiSlider: 'direction' option was not recognized.");
		}
	}

	function testBehaviour ( parsed, entry ) {

		// Make sure the input is a string.
		if ( typeof entry !== 'string' ) {
			throw new Error("noUiSlider: 'behaviour' must be a string containing options.");
		}

		// Check if the string contains any keywords.
		// None are required.
		var tap = entry.indexOf('tap') >= 0,
			drag = entry.indexOf('drag') >= 0,
			fixed = entry.indexOf('fixed') >= 0,
			snap = entry.indexOf('snap') >= 0,
			hover = entry.indexOf('hover') >= 0;

		// Fix #472
		if ( drag && !parsed.connect ) {
			throw new Error("noUiSlider: 'drag' behaviour must be used with 'connect': true.");
		}

		parsed.events = {
			tap: tap || snap,
			drag: drag,
			fixed: fixed,
			snap: snap,
			hover: hover
		};
	}

	function testTooltips ( parsed, entry ) {

		var i;

		if ( entry === false ) {
			return;
		} else if ( entry === true ) {

			parsed.tooltips = [];

			for ( i = 0; i < parsed.handles; i++ ) {
				parsed.tooltips.push(true);
			}

		} else {

			parsed.tooltips = asArray(entry);

			if ( parsed.tooltips.length !== parsed.handles ) {
				throw new Error("noUiSlider: must pass a formatter for all handles.");
			}

			parsed.tooltips.forEach(function(formatter){
				if ( typeof formatter !== 'boolean' && (typeof formatter !== 'object' || typeof formatter.to !== 'function') ) {
					throw new Error("noUiSlider: 'tooltips' must be passed a formatter or 'false'.");
				}
			});
		}
	}

	function testFormat ( parsed, entry ) {

		parsed.format = entry;

		// Any object with a to and from method is supported.
		if ( typeof entry.to === 'function' && typeof entry.from === 'function' ) {
			return true;
		}

		throw new Error( "noUiSlider: 'format' requires 'to' and 'from' methods.");
	}

	function testCssPrefix ( parsed, entry ) {

		if ( entry !== undefined && typeof entry !== 'string' ) {
			throw new Error( "noUiSlider: 'cssPrefix' must be a string.");
		}

		parsed.cssPrefix = entry;
	}

	// Test all developer settings and parse to assumption-safe values.
	function testOptions ( options ) {

		// To prove a fix for #537, freeze options here.
		// If the object is modified, an error will be thrown.
		// Object.freeze(options);

		var parsed = {
			margin: 0,
			limit: 0,
			animate: true,
			format: defaultFormatter
		}, tests;

		// Tests are executed in the order they are presented here.
		tests = {
			'step': { r: false, t: testStep },
			'start': { r: true, t: testStart },
			'connect': { r: true, t: testConnect },
			'direction': { r: true, t: testDirection },
			'snap': { r: false, t: testSnap },
			'animate': { r: false, t: testAnimate },
			'range': { r: true, t: testRange },
			'orientation': { r: false, t: testOrientation },
			'margin': { r: false, t: testMargin },
			'limit': { r: false, t: testLimit },
			'behaviour': { r: true, t: testBehaviour },
			'format': { r: false, t: testFormat },
			'tooltips': { r: false, t: testTooltips },
			'cssPrefix': { r: false, t: testCssPrefix }
		};

		var defaults = {
			'connect': false,
			'direction': 'ltr',
			'behaviour': 'tap',
			'orientation': 'horizontal'
		};

		// Run all options through a testing mechanism to ensure correct
		// input. It should be noted that options might get modified to
		// be handled properly. E.g. wrapping integers in arrays.
		Object.keys(tests).forEach(function( name ){

			// If the option isn't set, but it is required, throw an error.
			if ( options[name] === undefined && defaults[name] === undefined ) {

				if ( tests[name].r ) {
					throw new Error("noUiSlider: '" + name + "' is required.");
				}

				return true;
			}

			tests[name].t( parsed, options[name] === undefined ? defaults[name] : options[name] );
		});

		// Forward pips options
		parsed.pips = options.pips;

		// Pre-define the styles.
		parsed.style = parsed.ort ? 'top' : 'left';

		return parsed;
	}


function closure ( target, options ){

	// All variables local to 'closure' are prefixed with 'scope_'
	var scope_Target = target,
		scope_Locations = [-1, -1],
		scope_Base,
		scope_Handles,
		scope_Spectrum = options.spectrum,
		scope_Values = [],
		scope_Events = {},
		scope_Self;

  var cssClasses = [
    /*  0 */  'target'
    /*  1 */ ,'base'
    /*  2 */ ,'origin'
    /*  3 */ ,'handle'
    /*  4 */ ,'horizontal'
    /*  5 */ ,'vertical'
    /*  6 */ ,'background'
    /*  7 */ ,'connect'
    /*  8 */ ,'ltr'
    /*  9 */ ,'rtl'
    /* 10 */ ,'draggable'
    /* 11 */ ,''
    /* 12 */ ,'state-drag'
    /* 13 */ ,''
    /* 14 */ ,'state-tap'
    /* 15 */ ,'active'
    /* 16 */ ,''
    /* 17 */ ,'stacking'
    /* 18 */ ,'tooltip'
    /* 19 */ ,''
    /* 20 */ ,'pips'
    /* 21 */ ,'marker'
    /* 22 */ ,'value'
  ].map(addCssPrefix(options.cssPrefix || defaultCssPrefix));


	// Delimit proposed values for handle positions.
	function getPositions ( a, b, delimit ) {

		// Add movement to current position.
		var c = a + b[0], d = a + b[1];

		// Only alter the other position on drag,
		// not on standard sliding.
		if ( delimit ) {
			if ( c < 0 ) {
				d += Math.abs(c);
			}
			if ( d > 100 ) {
				c -= ( d - 100 );
			}

			// Limit values to 0 and 100.
			return [limit(c), limit(d)];
		}

		return [c,d];
	}

	// Provide a clean event with standardized offset values.
	function fixEvent ( e, pageOffset ) {

		// Prevent scrolling and panning on touch events, while
		// attempting to slide. The tap event also depends on this.
		e.preventDefault();

		// Filter the event to register the type, which can be
		// touch, mouse or pointer. Offset changes need to be
		// made on an event specific basis.
		var touch = e.type.indexOf('touch') === 0,
			mouse = e.type.indexOf('mouse') === 0,
			pointer = e.type.indexOf('pointer') === 0,
			x,y, event = e;

		// IE10 implemented pointer events with a prefix;
		if ( e.type.indexOf('MSPointer') === 0 ) {
			pointer = true;
		}

		if ( touch ) {
			// noUiSlider supports one movement at a time,
			// so we can select the first 'changedTouch'.
			x = e.changedTouches[0].pageX;
			y = e.changedTouches[0].pageY;
		}

		pageOffset = pageOffset || getPageOffset();

		if ( mouse || pointer ) {
			x = e.clientX + pageOffset.x;
			y = e.clientY + pageOffset.y;
		}

		event.pageOffset = pageOffset;
		event.points = [x, y];
		event.cursor = mouse || pointer; // Fix #435

		return event;
	}

	// Append a handle to the base.
	function addHandle ( direction, index ) {

		var origin = document.createElement('div'),
			handle = document.createElement('div'),
			additions = [ '-lower', '-upper' ];

		if ( direction ) {
			additions.reverse();
		}

		addClass(handle, cssClasses[3]);
		addClass(handle, cssClasses[3] + additions[index]);

		addClass(origin, cssClasses[2]);
		origin.appendChild(handle);

		return origin;
	}

	// Add the proper connection classes.
	function addConnection ( connect, target, handles ) {

		// Apply the required connection classes to the elements
		// that need them. Some classes are made up for several
		// segments listed in the class list, to allow easy
		// renaming and provide a minor compression benefit.
		switch ( connect ) {
			case 1:	addClass(target, cssClasses[7]);
					addClass(handles[0], cssClasses[6]);
					break;
			case 3: addClass(handles[1], cssClasses[6]);
					/* falls through */
			case 2: addClass(handles[0], cssClasses[7]);
					/* falls through */
			case 0: addClass(target, cssClasses[6]);
					break;
		}
	}

	// Add handles to the slider base.
	function addHandles ( nrHandles, direction, base ) {

		var index, handles = [];

		// Append handles.
		for ( index = 0; index < nrHandles; index += 1 ) {

			// Keep a list of all added handles.
			handles.push( base.appendChild(addHandle( direction, index )) );
		}

		return handles;
	}

	// Initialize a single slider.
	function addSlider ( direction, orientation, target ) {

		// Apply classes and data to the target.
		addClass(target, cssClasses[0]);
		addClass(target, cssClasses[8 + direction]);
		addClass(target, cssClasses[4 + orientation]);

		var div = document.createElement('div');
		addClass(div, cssClasses[1]);
		target.appendChild(div);
		return div;
	}


	function addTooltip ( handle, index ) {

		if ( !options.tooltips[index] ) {
			return false;
		}

		var element = document.createElement('div');
		element.className = cssClasses[18];
		return handle.firstChild.appendChild(element);
	}

	// The tooltips option is a shorthand for using the 'update' event.
	function tooltips ( ) {

		if ( options.dir ) {
			options.tooltips.reverse();
		}

		// Tooltips are added with options.tooltips in original order.
		var tips = scope_Handles.map(addTooltip);

		if ( options.dir ) {
			tips.reverse();
			options.tooltips.reverse();
		}

		bindEvent('update', function(f, o, r) {
			if ( tips[o] ) {
				tips[o].innerHTML = options.tooltips[o] === true ? f[o] : options.tooltips[o].to(r[o]);
			}
		});
	}


	function getGroup ( mode, values, stepped ) {

		// Use the range.
		if ( mode === 'range' || mode === 'steps' ) {
			return scope_Spectrum.xVal;
		}

		if ( mode === 'count' ) {

			// Divide 0 - 100 in 'count' parts.
			var spread = ( 100 / (values-1) ), v, i = 0;
			values = [];

			// List these parts and have them handled as 'positions'.
			while ((v=i++*spread) <= 100 ) {
				values.push(v);
			}

			mode = 'positions';
		}

		if ( mode === 'positions' ) {

			// Map all percentages to on-range values.
			return values.map(function( value ){
				return scope_Spectrum.fromStepping( stepped ? scope_Spectrum.getStep( value ) : value );
			});
		}

		if ( mode === 'values' ) {

			// If the value must be stepped, it needs to be converted to a percentage first.
			if ( stepped ) {

				return values.map(function( value ){

					// Convert to percentage, apply step, return to value.
					return scope_Spectrum.fromStepping( scope_Spectrum.getStep( scope_Spectrum.toStepping( value ) ) );
				});

			}

			// Otherwise, we can simply use the values.
			return values;
		}
	}

	function generateSpread ( density, mode, group ) {

		function safeIncrement(value, increment) {
			// Avoid floating point variance by dropping the smallest decimal places.
			return (value + increment).toFixed(7) / 1;
		}

		var originalSpectrumDirection = scope_Spectrum.direction,
			indexes = {},
			firstInRange = scope_Spectrum.xVal[0],
			lastInRange = scope_Spectrum.xVal[scope_Spectrum.xVal.length-1],
			ignoreFirst = false,
			ignoreLast = false,
			prevPct = 0;

		// This function loops the spectrum in an ltr linear fashion,
		// while the toStepping method is direction aware. Trick it into
		// believing it is ltr.
		scope_Spectrum.direction = 0;

		// Create a copy of the group, sort it and filter away all duplicates.
		group = unique(group.slice().sort(function(a, b){ return a - b; }));

		// Make sure the range starts with the first element.
		if ( group[0] !== firstInRange ) {
			group.unshift(firstInRange);
			ignoreFirst = true;
		}

		// Likewise for the last one.
		if ( group[group.length - 1] !== lastInRange ) {
			group.push(lastInRange);
			ignoreLast = true;
		}

		group.forEach(function ( current, index ) {

			// Get the current step and the lower + upper positions.
			var step, i, q,
				low = current,
				high = group[index+1],
				newPct, pctDifference, pctPos, type,
				steps, realSteps, stepsize;

			// When using 'steps' mode, use the provided steps.
			// Otherwise, we'll step on to the next subrange.
			if ( mode === 'steps' ) {
				step = scope_Spectrum.xNumSteps[ index ];
			}

			// Default to a 'full' step.
			if ( !step ) {
				step = high-low;
			}

			// Low can be 0, so test for false. If high is undefined,
			// we are at the last subrange. Index 0 is already handled.
			if ( low === false || high === undefined ) {
				return;
			}

			// Find all steps in the subrange.
			for ( i = low; i <= high; i = safeIncrement(i, step) ) {

				// Get the percentage value for the current step,
				// calculate the size for the subrange.
				newPct = scope_Spectrum.toStepping( i );
				pctDifference = newPct - prevPct;

				steps = pctDifference / density;
				realSteps = Math.round(steps);

				// This ratio represents the ammount of percentage-space a point indicates.
				// For a density 1 the points/percentage = 1. For density 2, that percentage needs to be re-devided.
				// Round the percentage offset to an even number, then divide by two
				// to spread the offset on both sides of the range.
				stepsize = pctDifference/realSteps;

				// Divide all points evenly, adding the correct number to this subrange.
				// Run up to <= so that 100% gets a point, event if ignoreLast is set.
				for ( q = 1; q <= realSteps; q += 1 ) {

					// The ratio between the rounded value and the actual size might be ~1% off.
					// Correct the percentage offset by the number of points
					// per subrange. density = 1 will result in 100 points on the
					// full range, 2 for 50, 4 for 25, etc.
					pctPos = prevPct + ( q * stepsize );
					indexes[pctPos.toFixed(5)] = ['x', 0];
				}

				// Determine the point type.
				type = (group.indexOf(i) > -1) ? 1 : ( mode === 'steps' ? 2 : 0 );

				// Enforce the 'ignoreFirst' option by overwriting the type for 0.
				if ( !index && ignoreFirst ) {
					type = 0;
				}

				if ( !(i === high && ignoreLast)) {
					// Mark the 'type' of this point. 0 = plain, 1 = real value, 2 = step value.
					indexes[newPct.toFixed(5)] = [i, type];
				}

				// Update the percentage count.
				prevPct = newPct;
			}
		});

		// Reset the spectrum.
		scope_Spectrum.direction = originalSpectrumDirection;

		return indexes;
	}

	function addMarking ( spread, filterFunc, formatter ) {

		var style = ['horizontal', 'vertical'][options.ort],
			element = document.createElement('div');

		addClass(element, cssClasses[20]);
		addClass(element, cssClasses[20] + '-' + style);

		function getSize( type ){
			return [ '-normal', '-large', '-sub' ][type];
		}

		function getTags( offset, source, values ) {
			return 'class="' + source + ' ' +
				source + '-' + style + ' ' +
				source + getSize(values[1]) +
				'" style="' + options.style + ': ' + offset + '%"';
		}

		function addSpread ( offset, values ){

			if ( scope_Spectrum.direction ) {
				offset = 100 - offset;
			}

			// Apply the filter function, if it is set.
			values[1] = (values[1] && filterFunc) ? filterFunc(values[0], values[1]) : values[1];

			// Add a marker for every point
			element.innerHTML += '<div ' + getTags(offset, cssClasses[21], values) + '></div>';

			// Values are only appended for points marked '1' or '2'.
			if ( values[1] ) {
				element.innerHTML += '<div '+getTags(offset, cssClasses[22], values)+'>' + formatter.to(values[0]) + '</div>';
			}
		}

		// Append all points.
		Object.keys(spread).forEach(function(a){
			addSpread(a, spread[a]);
		});

		return element;
	}

	function pips ( grid ) {

	var mode = grid.mode,
		density = grid.density || 1,
		filter = grid.filter || false,
		values = grid.values || false,
		stepped = grid.stepped || false,
		group = getGroup( mode, values, stepped ),
		spread = generateSpread( density, mode, group ),
		format = grid.format || {
			to: Math.round
		};

		return scope_Target.appendChild(addMarking(
			spread,
			filter,
			format
		));
	}


	// Shorthand for base dimensions.
	function baseSize ( ) {
		return scope_Base['offset' + ['Width', 'Height'][options.ort]];
	}

	// External event handling
	function fireEvent ( event, handleNumber, tap ) {

		if ( handleNumber !== undefined && options.handles !== 1 ) {
			handleNumber = Math.abs(handleNumber - options.dir);
		}

		Object.keys(scope_Events).forEach(function( targetEvent ) {

			var eventType = targetEvent.split('.')[0];

			if ( event === eventType ) {
				scope_Events[targetEvent].forEach(function( callback ) {
					// .reverse is in place
					// Return values as array, so arg_1[arg_2] is always valid.
					callback.call(scope_Self, asArray(valueGet()), handleNumber, asArray(inSliderOrder(Array.prototype.slice.call(scope_Values))), tap || false);
				});
			}
		});
	}

	// Returns the input array, respecting the slider direction configuration.
	function inSliderOrder ( values ) {

		// If only one handle is used, return a single value.
		if ( values.length === 1 ){
			return values[0];
		}

		if ( options.dir ) {
			return values.reverse();
		}

		return values;
	}


	// Handler for attaching events trough a proxy.
	function attach ( events, element, callback, data ) {

		// This function can be used to 'filter' events to the slider.
		// element is a node, not a nodeList

		var method = function ( e ){

			if ( scope_Target.hasAttribute('disabled') ) {
				return false;
			}

			// Stop if an active 'tap' transition is taking place.
			if ( hasClass(scope_Target, cssClasses[14]) ) {
				return false;
			}

			e = fixEvent(e, data.pageOffset);

			// Ignore right or middle clicks on start #454
			if ( events === actions.start && e.buttons !== undefined && e.buttons > 1 ) {
				return false;
			}

			// Ignore right or middle clicks on start #454
			if ( data.hover && e.buttons ) {
				return false;
			}

			e.calcPoint = e.points[ options.ort ];

			// Call the event handler with the event [ and additional data ].
			callback ( e, data );

		}, methods = [];

		// Bind a closure on the target for every event type.
		events.split(' ').forEach(function( eventName ){
			element.addEventListener(eventName, method, false);
			methods.push([eventName, method]);
		});

		return methods;
	}

	// Handle movement on document for handle and range drag.
	function move ( event, data ) {

		// Fix #498
		// Check value of .buttons in 'start' to work around a bug in IE10 mobile (data.buttonsProperty).
		// https://connect.microsoft.com/IE/feedback/details/927005/mobile-ie10-windows-phone-buttons-property-of-pointermove-event-always-zero
		// IE9 has .buttons and .which zero on mousemove.
		// Firefox breaks the spec MDN defines.
		if ( navigator.appVersion.indexOf("MSIE 9") === -1 && event.buttons === 0 && data.buttonsProperty !== 0 ) {
			return end(event, data);
		}

		var handles = data.handles || scope_Handles, positions, state = false,
			proposal = ((event.calcPoint - data.start) * 100) / data.baseSize,
			handleNumber = handles[0] === scope_Handles[0] ? 0 : 1, i;

		// Calculate relative positions for the handles.
		positions = getPositions( proposal, data.positions, handles.length > 1);

		state = setHandle ( handles[0], positions[handleNumber], handles.length === 1 );

		if ( handles.length > 1 ) {

			state = setHandle ( handles[1], positions[handleNumber?0:1], false ) || state;

			if ( state ) {
				// fire for both handles
				for ( i = 0; i < data.handles.length; i++ ) {
					fireEvent('slide', i);
				}
			}
		} else if ( state ) {
			// Fire for a single handle
			fireEvent('slide', handleNumber);
		}
	}

	// Unbind move events on document, call callbacks.
	function end ( event, data ) {

		// The handle is no longer active, so remove the class.
		var active = scope_Base.querySelector( '.' + cssClasses[15] ),
			handleNumber = data.handles[0] === scope_Handles[0] ? 0 : 1;

		if ( active !== null ) {
			removeClass(active, cssClasses[15]);
		}

		// Remove cursor styles and text-selection events bound to the body.
		if ( event.cursor ) {
			document.body.style.cursor = '';
			document.body.removeEventListener('selectstart', document.body.noUiListener);
		}

		var d = document.documentElement;

		// Unbind the move and end events, which are added on 'start'.
		d.noUiListeners.forEach(function( c ) {
			d.removeEventListener(c[0], c[1]);
		});

		// Remove dragging class.
		removeClass(scope_Target, cssClasses[12]);

		// Fire the change and set events.
		fireEvent('set', handleNumber);
		fireEvent('change', handleNumber);

		// If this is a standard handle movement, fire the end event.
		if ( data.handleNumber !== undefined ) {
			fireEvent('end', data.handleNumber);
		}
	}

	// Fire 'end' when a mouse or pen leaves the document.
	function documentLeave ( event, data ) {
		if ( event.type === "mouseout" && event.target.nodeName === "HTML" && event.relatedTarget === null ){
			end ( event, data );
		}
	}

	// Bind move events on document.
	function start ( event, data ) {

		var d = document.documentElement;

		// Mark the handle as 'active' so it can be styled.
		if ( data.handles.length === 1 ) {
			addClass(data.handles[0].children[0], cssClasses[15]);

			// Support 'disabled' handles
			if ( data.handles[0].hasAttribute('disabled') ) {
				return false;
			}
		}

		// Fix #551, where a handle gets selected instead of dragged.
		event.preventDefault();

		// A drag should never propagate up to the 'tap' event.
		event.stopPropagation();

		// Attach the move and end events.
		var moveEvent = attach(actions.move, d, move, {
			start: event.calcPoint,
			baseSize: baseSize(),
			pageOffset: event.pageOffset,
			handles: data.handles,
			handleNumber: data.handleNumber,
			buttonsProperty: event.buttons,
			positions: [
				scope_Locations[0],
				scope_Locations[scope_Handles.length - 1]
			]
		}), endEvent = attach(actions.end, d, end, {
			handles: data.handles,
			handleNumber: data.handleNumber
		});

		var outEvent = attach("mouseout", d, documentLeave, {
			handles: data.handles,
			handleNumber: data.handleNumber
		});

		d.noUiListeners = moveEvent.concat(endEvent, outEvent);

		// Text selection isn't an issue on touch devices,
		// so adding cursor styles can be skipped.
		if ( event.cursor ) {

			// Prevent the 'I' cursor and extend the range-drag cursor.
			document.body.style.cursor = getComputedStyle(event.target).cursor;

			// Mark the target with a dragging state.
			if ( scope_Handles.length > 1 ) {
				addClass(scope_Target, cssClasses[12]);
			}

			var f = function(){
				return false;
			};

			document.body.noUiListener = f;

			// Prevent text selection when dragging the handles.
			document.body.addEventListener('selectstart', f, false);
		}

		if ( data.handleNumber !== undefined ) {
			fireEvent('start', data.handleNumber);
		}
	}

	// Move closest handle to tapped location.
	function tap ( event ) {

		var location = event.calcPoint, total = 0, handleNumber, to;

		// The tap event shouldn't propagate up and cause 'edge' to run.
		event.stopPropagation();

		// Add up the handle offsets.
		scope_Handles.forEach(function(a){
			total += offset(a)[ options.style ];
		});

		// Find the handle closest to the tapped position.
		handleNumber = ( location < total/2 || scope_Handles.length === 1 ) ? 0 : 1;

		location -= offset(scope_Base)[ options.style ];

		// Calculate the new position.
		to = ( location * 100 ) / baseSize();

		if ( !options.events.snap ) {
			// Flag the slider as it is now in a transitional state.
			// Transition takes 300 ms, so re-enable the slider afterwards.
			addClassFor( scope_Target, cssClasses[14], 300 );
		}

		// Support 'disabled' handles
		if ( scope_Handles[handleNumber].hasAttribute('disabled') ) {
			return false;
		}

		// Find the closest handle and calculate the tapped point.
		// The set handle to the new position.
		setHandle( scope_Handles[handleNumber], to );

		fireEvent('slide', handleNumber, true);
		fireEvent('set', handleNumber, true);
		fireEvent('change', handleNumber, true);

		if ( options.events.snap ) {
			start(event, { handles: [scope_Handles[handleNumber]] });
		}
	}

	// Fires a 'hover' event for a hovered mouse/pen position.
	function hover ( event ) {

		var location = event.calcPoint - offset(scope_Base)[ options.style ],
			to = scope_Spectrum.getStep(( location * 100 ) / baseSize()),
			value = scope_Spectrum.fromStepping( to );

		Object.keys(scope_Events).forEach(function( targetEvent ) {
			if ( 'hover' === targetEvent.split('.')[0] ) {
				scope_Events[targetEvent].forEach(function( callback ) {
					callback.call( scope_Self, value );
				});
			}
		});
	}

	// Attach events to several slider parts.
	function events ( behaviour ) {

		var i, drag;

		// Attach the standard drag event to the handles.
		if ( !behaviour.fixed ) {

			for ( i = 0; i < scope_Handles.length; i += 1 ) {

				// These events are only bound to the visual handle
				// element, not the 'real' origin element.
				attach ( actions.start, scope_Handles[i].children[0], start, {
					handles: [ scope_Handles[i] ],
					handleNumber: i
				});
			}
		}

		// Attach the tap event to the slider base.
		if ( behaviour.tap ) {

			attach ( actions.start, scope_Base, tap, {
				handles: scope_Handles
			});
		}

		// Fire hover events
		if ( behaviour.hover ) {
			attach ( actions.move, scope_Base, hover, { hover: true } );
			for ( i = 0; i < scope_Handles.length; i += 1 ) {
				['mousemove MSPointerMove pointermove'].forEach(function( eventName ){
					scope_Handles[i].children[0].addEventListener(eventName, stopPropagation, false);
				});
			}
		}

		// Make the range draggable.
		if ( behaviour.drag ){

			drag = [scope_Base.querySelector( '.' + cssClasses[7] )];
			addClass(drag[0], cssClasses[10]);

			// When the range is fixed, the entire range can
			// be dragged by the handles. The handle in the first
			// origin will propagate the start event upward,
			// but it needs to be bound manually on the other.
			if ( behaviour.fixed ) {
				drag.push(scope_Handles[(drag[0] === scope_Handles[0] ? 1 : 0)].children[0]);
			}

			drag.forEach(function( element ) {
				attach ( actions.start, element, start, {
					handles: scope_Handles
				});
			});
		}
	}


	// Test suggested values and apply margin, step.
	function setHandle ( handle, to, noLimitOption ) {

		var trigger = handle !== scope_Handles[0] ? 1 : 0,
			lowerMargin = scope_Locations[0] + options.margin,
			upperMargin = scope_Locations[1] - options.margin,
			lowerLimit = scope_Locations[0] + options.limit,
			upperLimit = scope_Locations[1] - options.limit;

		// For sliders with multiple handles,
		// limit movement to the other handle.
		// Apply the margin option by adding it to the handle positions.
		if ( scope_Handles.length > 1 ) {
			to = trigger ? Math.max( to, lowerMargin ) : Math.min( to, upperMargin );
		}

		// The limit option has the opposite effect, limiting handles to a
		// maximum distance from another. Limit must be > 0, as otherwise
		// handles would be unmoveable. 'noLimitOption' is set to 'false'
		// for the .val() method, except for pass 4/4.
		if ( noLimitOption !== false && options.limit && scope_Handles.length > 1 ) {
			to = trigger ? Math.min ( to, lowerLimit ) : Math.max( to, upperLimit );
		}

		// Handle the step option.
		to = scope_Spectrum.getStep( to );

		// Limit to 0/100 for .val input, trim anything beyond 7 digits, as
		// JavaScript has some issues in its floating point implementation.
		to = limit(parseFloat(to.toFixed(7)));

		// Return false if handle can't move
		if ( to === scope_Locations[trigger] ) {
			return false;
		}

		// Set the handle to the new position.
		// Use requestAnimationFrame for efficient painting.
		// No significant effect in Chrome, Edge sees dramatic
		// performace improvements.
		if ( window.requestAnimationFrame ) {
			window.requestAnimationFrame(function(){
				handle.style[options.style] = to + '%';
			});
		} else {
			handle.style[options.style] = to + '%';
		}

		// Force proper handle stacking
		if ( !handle.previousSibling ) {
			removeClass(handle, cssClasses[17]);
			if ( to > 50 ) {
				addClass(handle, cssClasses[17]);
			}
		}

		// Update locations.
		scope_Locations[trigger] = to;

		// Convert the value to the slider stepping/range.
		scope_Values[trigger] = scope_Spectrum.fromStepping( to );

		fireEvent('update', trigger);

		return true;
	}

	// Loop values from value method and apply them.
	function setValues ( count, values ) {

		var i, trigger, to;

		// With the limit option, we'll need another limiting pass.
		if ( options.limit ) {
			count += 1;
		}

		// If there are multiple handles to be set run the setting
		// mechanism twice for the first handle, to make sure it
		// can be bounced of the second one properly.
		for ( i = 0; i < count; i += 1 ) {

			trigger = i%2;

			// Get the current argument from the array.
			to = values[trigger];

			// Setting with null indicates an 'ignore'.
			// Inputting 'false' is invalid.
			if ( to !== null && to !== false ) {

				// If a formatted number was passed, attemt to decode it.
				if ( typeof to === 'number' ) {
					to = String(to);
				}

				to = options.format.from( to );

				// Request an update for all links if the value was invalid.
				// Do so too if setting the handle fails.
				if ( to === false || isNaN(to) || setHandle( scope_Handles[trigger], scope_Spectrum.toStepping( to ), i === (3 - options.dir) ) === false ) {
					fireEvent('update', trigger);
				}
			}
		}
	}

	// Set the slider value.
	function valueSet ( input ) {

		var count, values = asArray( input ), i;

		// The RTL settings is implemented by reversing the front-end,
		// internal mechanisms are the same.
		if ( options.dir && options.handles > 1 ) {
			values.reverse();
		}

		// Animation is optional.
		// Make sure the initial values where set before using animated placement.
		if ( options.animate && scope_Locations[0] !== -1 ) {
			addClassFor( scope_Target, cssClasses[14], 300 );
		}

		// Determine how often to set the handles.
		count = scope_Handles.length > 1 ? 3 : 1;

		if ( values.length === 1 ) {
			count = 1;
		}

		setValues ( count, values );

		// Fire the 'set' event for both handles.
		for ( i = 0; i < scope_Handles.length; i++ ) {
			fireEvent('set', i);
		}
	}

	// Get the slider value.
	function valueGet ( ) {

		var i, retour = [];

		// Get the value from all handles.
		for ( i = 0; i < options.handles; i += 1 ){
			retour[i] = options.format.to( scope_Values[i] );
		}

		return inSliderOrder( retour );
	}

	// Removes classes from the root and empties it.
	function destroy ( ) {
		cssClasses.forEach(function(cls){
			if ( !cls ) { return; } // Ignore empty classes
			removeClass(scope_Target, cls);
		});
		scope_Target.innerHTML = '';
		delete scope_Target.noUiSlider;
	}

	// Get the current step size for the slider.
	function getCurrentStep ( ) {

		// Check all locations, map them to their stepping point.
		// Get the step point, then find it in the input list.
		var retour = scope_Locations.map(function( location, index ){

			var step = scope_Spectrum.getApplicableStep( location ),

				// As per #391, the comparison for the decrement step can have some rounding issues.
				// Round the value to the precision used in the step.
				stepDecimals = countDecimals(String(step[2])),

				// Get the current numeric value
				value = scope_Values[index],

				// To move the slider 'one step up', the current step value needs to be added.
				// Use null if we are at the maximum slider value.
				increment = location === 100 ? null : step[2],

				// Going 'one step down' might put the slider in a different sub-range, so we
				// need to switch between the current or the previous step.
				prev = Number((value - step[2]).toFixed(stepDecimals)),

				// If the value fits the step, return the current step value. Otherwise, use the
				// previous step. Return null if the slider is at its minimum value.
				decrement = location === 0 ? null : (prev >= step[1]) ? step[2] : (step[0] || false);

			return [decrement, increment];
		});

		// Return values in the proper order.
		return inSliderOrder( retour );
	}

	// Attach an event to this slider, possibly including a namespace
	function bindEvent ( namespacedEvent, callback ) {
		scope_Events[namespacedEvent] = scope_Events[namespacedEvent] || [];
		scope_Events[namespacedEvent].push(callback);

		// If the event bound is 'update,' fire it immediately for all handles.
		if ( namespacedEvent.split('.')[0] === 'update' ) {
			scope_Handles.forEach(function(a, index){
				fireEvent('update', index);
			});
		}
	}

	// Undo attachment of event
	function removeEvent ( namespacedEvent ) {

		var event = namespacedEvent.split('.')[0],
			namespace = namespacedEvent.substring(event.length);

		Object.keys(scope_Events).forEach(function( bind ){

			var tEvent = bind.split('.')[0],
				tNamespace = bind.substring(tEvent.length);

			if ( (!event || event === tEvent) && (!namespace || namespace === tNamespace) ) {
				delete scope_Events[bind];
			}
		});
	}

	// Updateable: margin, limit, step, range, animate, snap
	function updateOptions ( optionsToUpdate ) {

		var v = valueGet(), i, newOptions = testOptions({
			start: [0, 0],
			margin: optionsToUpdate.margin,
			limit: optionsToUpdate.limit,
			step: optionsToUpdate.step,
			range: optionsToUpdate.range,
			animate: optionsToUpdate.animate,
			snap: optionsToUpdate.snap === undefined ? options.snap : optionsToUpdate.snap
		});

		['margin', 'limit', 'step', 'range', 'animate'].forEach(function(name){
			if ( optionsToUpdate[name] !== undefined ) {
				options[name] = optionsToUpdate[name];
			}
		});

		scope_Spectrum = newOptions.spectrum;

		// Invalidate the current positioning so valueSet forces an update.
		scope_Locations = [-1, -1];
		valueSet(v);

		for ( i = 0; i < scope_Handles.length; i++ ) {
			fireEvent('update', i);
		}
	}


	// Throw an error if the slider was already initialized.
	if ( scope_Target.noUiSlider ) {
		throw new Error('Slider was already initialized.');
	}

	// Create the base element, initialise HTML and set classes.
	// Add handles and links.
	scope_Base = addSlider( options.dir, options.ort, scope_Target );
	scope_Handles = addHandles( options.handles, options.dir, scope_Base );

	// Set the connect classes.
	addConnection ( options.connect, scope_Target, scope_Handles );

	if ( options.pips ) {
		pips(options.pips);
	}

	if ( options.tooltips ) {
		tooltips();
	}

	scope_Self = {
		destroy: destroy,
		steps: getCurrentStep,
		on: bindEvent,
		off: removeEvent,
		get: valueGet,
		set: valueSet,
		updateOptions: updateOptions
	};

	// Attach user events.
	events( options.events );

	return scope_Self;

}


	// Run the standard initializer
	function initialize ( target, originalOptions ) {

		if ( !target.nodeName ) {
			throw new Error('noUiSlider.create requires a single element.');
		}

		// Test the options and create the slider environment;
		var options = testOptions( originalOptions, target ),
			slider = closure( target, options );

		// Use the public value method to set the start values.
		slider.set(options.start);

		target.noUiSlider = slider;
		return slider;
	}

	// Use an object instead of a function for future expansibility;
	return {
		create: initialize
	};

}));
},{}],42:[function(require,module,exports){
/*
Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
License: MIT - http://mrgnrdrck.mit-license.org

https://github.com/mroderick/PubSubJS
*/
(function (root, factory){
	'use strict';

    if (typeof define === 'function' && define.amd){
        // AMD. Register as an anonymous module.
        define(['exports'], factory);

    } else if (typeof exports === 'object'){
        // CommonJS
        factory(exports);

    }

    // Browser globals
    var PubSub = {};
    root.PubSub = PubSub;
    factory(PubSub);
    
}(( typeof window === 'object' && window ) || this, function (PubSub){
	'use strict';

	var messages = {},
		lastUid = -1;

	function hasKeys(obj){
		var key;

		for (key in obj){
			if ( obj.hasOwnProperty(key) ){
				return true;
			}
		}
		return false;
	}

	/**
	 *	Returns a function that throws the passed exception, for use as argument for setTimeout
	 *	@param { Object } ex An Error object
	 */
	function throwException( ex ){
		return function reThrowException(){
			throw ex;
		};
	}

	function callSubscriberWithDelayedExceptions( subscriber, message, data ){
		try {
			subscriber( message, data );
		} catch( ex ){
			setTimeout( throwException( ex ), 0);
		}
	}

	function callSubscriberWithImmediateExceptions( subscriber, message, data ){
		subscriber( message, data );
	}

	function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
		var subscribers = messages[matchedMessage],
			callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
			s;

		if ( !messages.hasOwnProperty( matchedMessage ) ) {
			return;
		}

		for (s in subscribers){
			if ( subscribers.hasOwnProperty(s)){
				callSubscriber( subscribers[s], originalMessage, data );
			}
		}
	}

	function createDeliveryFunction( message, data, immediateExceptions ){
		return function deliverNamespaced(){
			var topic = String( message ),
				position = topic.lastIndexOf( '.' );

			// deliver the message as it is now
			deliverMessage(message, message, data, immediateExceptions);

			// trim the hierarchy and deliver message to each level
			while( position !== -1 ){
				topic = topic.substr( 0, position );
				position = topic.lastIndexOf('.');
				deliverMessage( message, topic, data, immediateExceptions );
			}
		};
	}

	function messageHasSubscribers( message ){
		var topic = String( message ),
			found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic])),
			position = topic.lastIndexOf( '.' );

		while ( !found && position !== -1 ){
			topic = topic.substr( 0, position );
			position = topic.lastIndexOf( '.' );
			found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic]));
		}

		return found;
	}

	function publish( message, data, sync, immediateExceptions ){
		var deliver = createDeliveryFunction( message, data, immediateExceptions ),
			hasSubscribers = messageHasSubscribers( message );

		if ( !hasSubscribers ){
			return false;
		}

		if ( sync === true ){
			deliver();
		} else {
			setTimeout( deliver, 0 );
		}
		return true;
	}

	/**
	 *	PubSub.publish( message[, data] ) -> Boolean
	 *	- message (String): The message to publish
	 *	- data: The data to pass to subscribers
	 *	Publishes the the message, passing the data to it's subscribers
	**/
	PubSub.publish = function( message, data ){
		return publish( message, data, false, PubSub.immediateExceptions );
	};

	/**
	 *	PubSub.publishSync( message[, data] ) -> Boolean
	 *	- message (String): The message to publish
	 *	- data: The data to pass to subscribers
	 *	Publishes the the message synchronously, passing the data to it's subscribers
	**/
	PubSub.publishSync = function( message, data ){
		return publish( message, data, true, PubSub.immediateExceptions );
	};

	/**
	 *	PubSub.subscribe( message, func ) -> String
	 *	- message (String): The message to subscribe to
	 *	- func (Function): The function to call when a new message is published
	 *	Subscribes the passed function to the passed message. Every returned token is unique and should be stored if
	 *	you need to unsubscribe
	**/
	PubSub.subscribe = function( message, func ){
		if ( typeof func !== 'function'){
			return false;
		}

		// message is not registered yet
		if ( !messages.hasOwnProperty( message ) ){
			messages[message] = {};
		}

		// forcing token as String, to allow for future expansions without breaking usage
		// and allow for easy use as key names for the 'messages' object
		var token = 'uid_' + String(++lastUid);
		messages[message][token] = func;

		// return token for unsubscribing
		return token;
	};

	/* Public: Clears all subscriptions
	 */
	PubSub.clearAllSubscriptions = function clearAllSubscriptions(){
		messages = {};
	};

	/*Public: Clear subscriptions by the topic
	*/
	PubSub.clearSubscriptions = function clearSubscriptions(topic){
		var m; 
		for (m in messages){
			if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0){
				delete messages[m];
			}
		}
	};

	/* Public: removes subscriptions.
	 * When passed a token, removes a specific subscription.
	 * When passed a function, removes all subscriptions for that function
	 * When passed a topic, removes all subscriptions for that topic (hierarchy)
	 *
	 * value - A token, function or topic to unsubscribe.
	 *
	 * Examples
	 *
	 *		// Example 1 - unsubscribing with a token
	 *		var token = PubSub.subscribe('mytopic', myFunc);
	 *		PubSub.unsubscribe(token);
	 *
	 *		// Example 2 - unsubscribing with a function
	 *		PubSub.unsubscribe(myFunc);
	 *
	 *		// Example 3 - unsubscribing a topic
	 *		PubSub.unsubscribe('mytopic');
	 */
	PubSub.unsubscribe = function(value){
		var isTopic    = typeof value === 'string' && messages.hasOwnProperty(value),
			isToken    = !isTopic && typeof value === 'string',
			isFunction = typeof value === 'function',
			result = false,
			m, message, t;

		if (isTopic){
			delete messages[value];
			return;
		}

		for ( m in messages ){
			if ( messages.hasOwnProperty( m ) ){
				message = messages[m];

				if ( isToken && message[value] ){
					delete message[value];
					result = value;
					// tokens are unique, so we can just stop here
					break;
				}

				if (isFunction) {
					for ( t in message ){
						if (message.hasOwnProperty(t) && message[t] === value){
							delete message[t];
							result = true;
						}
					}
				}
			}
		}

		return result;
	};
}));

},{}],43:[function(require,module,exports){
var si = typeof setImmediate === 'function', tick;
if (si) {
  tick = function (fn) { setImmediate(fn); };
} else {
  tick = function (fn) { setTimeout(fn, 0); };
}

module.exports = tick;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvamF2YXNjcmlwdHMvYXBwLmpzIiwiYXBwL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaGFtYnVyZ2VyLmpzIiwiYXBwL2phdmFzY3JpcHRzL2NvbnRyb2xsZXIuanMiLCJhcHAvamF2YXNjcmlwdHMvY29udHJvbGxlcnMvYWJvdXQuanMiLCJhcHAvamF2YXNjcmlwdHMvY29udHJvbGxlcnMvY29tcGFyaXNvbi5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9jb250aW51ZS5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9leHBlbnNlcy5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9nb2FsLmpzIiwiYXBwL2phdmFzY3JpcHRzL2NvbnRyb2xsZXJzL25hdi5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9wbGFuLmpzIiwiYXBwL2phdmFzY3JpcHRzL2NvbnRyb2xsZXJzL3JlbWluZGVycy5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9zY2VuYXJpb3MuanMiLCJhcHAvamF2YXNjcmlwdHMvZG9tLWhlbHBlcnMuanMiLCJhcHAvamF2YXNjcmlwdHMvaGVscGVycy5qcyIsImFwcC9qYXZhc2NyaXB0cy9tb2RlbC5qcyIsImFwcC9qYXZhc2NyaXB0cy9tb2RlbC9hY3Rpb25zLmpzIiwiYXBwL2phdmFzY3JpcHRzL21vZGVsL2J1ZGdldC5qcyIsImFwcC9qYXZhc2NyaXB0cy9tb2RlbC9nb2Fscy5qcyIsImFwcC9qYXZhc2NyaXB0cy9wb2x5ZmlsbHMuanMiLCJhcHAvamF2YXNjcmlwdHMvdmlldy5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9hYm91dC5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9jb21wYXJpc29uLWRldGFpbHMuanMiLCJhcHAvamF2YXNjcmlwdHMvdmlld3MvY29tcGFyaXNvbi5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9jb250aW51ZS5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9leHBlbnNlcy5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9nb2FsLmpzIiwiYXBwL2phdmFzY3JpcHRzL3ZpZXdzL25hdi5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9wbGFuLmpzIiwiYXBwL2phdmFzY3JpcHRzL3ZpZXdzL3JlbWluZGVycy5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9zY2VuYXJpb3MuanMiLCJub2RlX21vZHVsZXMvYXRvYS9hdG9hLmpzIiwibm9kZV9tb2R1bGVzL2NoYXJ0aXN0L2Rpc3QvY2hhcnRpc3QuanMiLCJub2RlX21vZHVsZXMvY29udHJhL2RlYm91bmNlLmpzIiwibm9kZV9tb2R1bGVzL2NvbnRyYS9lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvY3Jvc3N2ZW50LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvZXZlbnRtYXAuanMiLCJub2RlX21vZHVsZXMvY3VzdG9tLWV2ZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RyYWd1bGEvY2xhc3Nlcy5qcyIsIm5vZGVfbW9kdWxlcy9kcmFndWxhL2RyYWd1bGEuanMiLCJub2RlX21vZHVsZXMvbm90aWUvbm90aWUuanMiLCJub2RlX21vZHVsZXMvbm91aXNsaWRlci9kaXN0cmlidXRlL25vdWlzbGlkZXIuanMiLCJub2RlX21vZHVsZXMvcHVic3ViLWpzL3NyYy9wdWJzdWIuanMiLCJub2RlX21vZHVsZXMvdGlja3kvdGlja3ktYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWFBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4aElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDemxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6d0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0MERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vcG9seWZpbGxzJyk7XG5yZXF1aXJlKCcuL2NvbXBvbmVudHMvaGFtYnVyZ2VyJyk7XG4vLyB2YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xudmFyIG1vZGVsID0gcmVxdWlyZSgnLi9tb2RlbCcpO1xudmFyIHZpZXcgPSByZXF1aXJlKCcuL3ZpZXcnKTtcbnZhciBjb250cm9sbGVyID0gcmVxdWlyZSgnLi9jb250cm9sbGVyJyk7XG5cbnZhciBpbml0ID0gZnVuY3Rpb24oKSB7XG4gIG1vZGVsLmluaXQoJ3dlYWx0aEFwcCcpO1xuICB2YXIgaW5pdGlhbFN0YXRlID0gbW9kZWwucmVhZCgpO1xuICB2aWV3LmluaXQoKTtcbiAgY29udHJvbGxlcihtb2RlbCwgdmlldy5nZXRWaWV3cygpLCBpbml0aWFsU3RhdGUpO1xuXG4gIHdpbmRvdy5tb2RlbCA9IG1vZGVsO1xufTtcblxuaW5pdCgpO1xuXG4vLyB0cnkge1xuLy8gICBpbml0KCk7XG4vLyB9IGNhdGNoIChlKSB7XG4vLyAgIGNvbnNvbGUuZXJyb3IoZSk7XG4vLyAgIC8vQEZJWE1FIHVwZGF0ZSBlbWFpbCBhZGRyZXNzXG4vLyAgIGhlbHBlcnMubWFrZUVycm9yKG51bGwsICdTb21ldGhpbmcgd3JvbmcgaGFwcGVuZWQuIFBsZWFzZSB0cnkgcmVmcmVzaGluZyB0aGUgcGFnZSBhbmQgcmVwb3J0IHRoZSBwcm9ibGVtIGF0IC4uLicpO1xuLy8gfVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdG9nZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmMtaGFtYnVyZ2VyJyk7XG50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgaWYgKHRoaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbWVudS1vcGVuJyk7XG4gICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21lbnUtb3BlbicpO1xuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG4gIH1cbn0pOyIsIi8qKlxuICogQ29udHJvbGxlciBtb2R1bGUuIFRoaXMgbW9kdWxlIGV4ZWN1dGVzIHRoZSBjb250cm9sbGVycyBmb3IgZWFjaCB2aWV3LCBpbiBNVkNcbiAqIHBhdHRlcm4uIFRvIGJlIG1vcmUgcHJlY2lzZSB0aGlzIGlzIG1vcmUgbGlrZWx5IHRoZSBQcmVzZW50ZXIgaW4gTVZQIHBhdHRlcm4uXG4gKiBPdXIgdmlld3Mvc2NyZWVucyBhcmUgJ2R1bWInLiBUaGV5IGRvbid0IGtub3cgYW55dGhpbmcgYWJvdXQgdGhlIE1vZGVsLCBzb1xuICogdGhlIFByZXNlbnRlciBoYXMgdGhlIGpvYiB0byB1cGRhdGUgdGhlIHNjcmVlbnMgd2hlbiBNb2RlbCBjaGFuZ2VzIGFuZCB2aWNldmVyc2EuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2FkZHlvc21hbmkuY29tL3Jlc291cmNlcy9lc3NlbnRpYWxqc2Rlc2lnbnBhdHRlcm5zL2Jvb2svI2RldGFpbG12cH1cbiAqIEBtb2R1bGUgY29udHJvbGxlclxuICovXG5cbnZhciBjb250cm9sbGVycyA9IFtcbiAgcmVxdWlyZSgnLi9jb250cm9sbGVycy9hYm91dCcpLFxuICByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL2V4cGVuc2VzJyksXG4gIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvY29tcGFyaXNvbicpLFxuICByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL3NjZW5hcmlvcycpLFxuICByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL2dvYWwnKSxcbiAgcmVxdWlyZSgnLi9jb250cm9sbGVycy9wbGFuJyksXG4gIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvcmVtaW5kZXJzJyksXG4gIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvbmF2JyksXG4gIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvY29udGludWUnKVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgaW5pdGlhbFN0YXRlKSB7XG4gIC8qXG4gICAqIEV2ZXJ5IGNvbnRyb2xsZXIncyBqb2IgaXMgYWxtb3N0IHRoZSBzYW1lOlxuICAgKiAtIHRvIHNldC9yZW5kZXIgdGhlIHZpZXcgdGhlIGZpcnN0IHRpbWUsIG9uIHdpbmRvdyBsb2FkXG4gICAqIC0gdG8gYmluZCB1c2VyIGludGVyYWN0aW9ucyB0byBmdW5jdGlvbnMgd2hpY2ggdXBkYXRlIHRoZSBtb2RlbFxuICAgKiAtIHRvIHVwZGF0ZSB0aGUgRE9NIChyZW5kZXJpbmcgdGhlIGRhdGEpIHdoZW5ldmVyIHRoZSBNb2RlbCBpcyBjaGFuZ2VkIGJ5XG4gICAqICAgc3Vic2NyaWJpbmcgdG8gTW9kZWwgY2hhbmdlc1xuICAgKiBAc2VlIHtAdXJsIGh0dHBzOi8vYWRkeW9zbWFuaS5jb20vcmVzb3VyY2VzL2Vzc2VudGlhbGpzZGVzaWducGF0dGVybnMvYm9vay8jb2JzZXJ2ZXJwYXR0ZXJuamF2YXNjcmlwdH1cbiAgICovXG4gIGNvbnRyb2xsZXJzLmZvckVhY2goZnVuY3Rpb24oY29udHJvbGxlciwgaW5kZXgpIHtcbiAgICBjb250cm9sbGVyKG1vZGVsLCB2aWV3W2luZGV4XSwgaW5pdGlhbFN0YXRlKTtcbiAgfSk7XG59OyIsInZhciBiaW5kVmlldyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3KSB7XG4gIHZpZXcuYmluZCgnYWdlQ2hhbmdlZCcsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgbW9kZWwudXBkYXRlKHsnYWJvdXRBZ2UnOiB2YWx1ZX0pO1xuICB9KTtcbiAgdmlldy5iaW5kKCdpbmNvbWVDaGFuZ2VkJywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICBtb2RlbC51cGRhdGUoeydhYm91dEluY29tZSc6IHZhbHVlfSk7XG4gIH0pO1xuICB2aWV3LmJpbmQoJ3NpdHVhdGlvbkNoYW5nZWQnLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgIG1vZGVsLnVwZGF0ZSh7J2Fib3V0U2l0dWF0aW9uJzogdmFsdWV9KTtcbiAgfSk7XG4gIHZpZXcuYmluZCgnbGl2aW5nQ2hhbmdlZCcsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgbW9kZWwudXBkYXRlKHsnYWJvdXRMaXZpbmcnOiB2YWx1ZX0pO1xuICB9KTtcbn07XG5cbnZhciBzZXRWaWV3ID0gZnVuY3Rpb24odmlldywgaW5pdGlhbFN0YXRlKSB7XG4gIHZhciBhZ2UgPSBpbml0aWFsU3RhdGUuYWJvdXRBZ2U7XG4gIHZhciBpbmNvbWUgPSBpbml0aWFsU3RhdGUuYWJvdXRJbmNvbWU7XG4gIHZhciBzaXR1YXRpb24gPSBpbml0aWFsU3RhdGUuYWJvdXRTaXR1YXRpb247XG4gIHZhciBsaXZpbmcgPSBpbml0aWFsU3RhdGUuYWJvdXRMaXZpbmc7XG5cbiAgdmlldy5yZW5kZXIoJ3Nob3dTbGlkZXJzJywge2FnZTogYWdlLCBpbmNvbWU6IGluY29tZX0pO1xuICB2aWV3LnJlbmRlcignc2V0U2VsZWN0cycsIHtzaXR1YXRpb246IHNpdHVhdGlvbiwgbGl2aW5nOiBsaXZpbmd9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSkge1xuICBzZXRWaWV3KHZpZXcsIGluaXRpYWxTdGF0ZSk7XG4gIGJpbmRWaWV3KG1vZGVsLCB2aWV3KTtcbn07IiwiLy8gdmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG52YXIgUHViU3ViID0gcmVxdWlyZSgncHVic3ViLWpzJyk7XG5cbnZhciBzZXRWaWV3ID0gZnVuY3Rpb24obW9kZWwsIHZpZXcpIHtcbiAgLy93ZSBkb24ndCB1c2UgaW5pdGlhbFN0YXRlIGJlY2F1c2Ugc2V0VmlldygpIGlzIHVzZWQgYWxzbyB3aGVuIHRoZXJlIGFyZVxuICAvL2V2ZW50cyB3aGljaCBuZWVkIGEgY29tcGxldGUgcmUtcmVuZGVyIHN1Y2ggYXMgJ2Fib3V0SW5jb21lJyBjaGFuZ2VkXG4gIHZhciBzdGF0ZSA9IG1vZGVsLnJlYWQoKTtcbiAgdmFyIGluY29tZSA9IHN0YXRlLmFib3V0SW5jb21lO1xuICB2YXIgYmFzaWNSYXRlID0gc3RhdGUuYWJvdXRCYXNpY1JhdGU7XG4gIHZhciBkaXNjUmF0ZSA9IHN0YXRlLmFib3V0RGlzY3JldGlvbmFyeVJhdGU7XG4gIHZhciBzYXZpbmdzUmF0ZSA9IHN0YXRlLmFib3V0U2F2aW5nc1JhdGU7XG4gIHZhciB1c2VyRXhwZW5zZXMgPSBzdGF0ZS5leHBlbnNlcztcbiAgdmFyIG90aGVyc0V4cGVuc2VzID0gbW9kZWwuZ2V0RGVmYXVsdFJhdGVzKGluY29tZSwgdHJ1ZSk7XG5cbiAgdmlldy5yZW5kZXIoJ3Nob3dTdW1tYXJ5Q2hhcnQnLCB7XG4gICAgdXNlcjoge1xuICAgICAgYmFzaWNSYXRlOiBiYXNpY1JhdGUsXG4gICAgICBkaXNjUmF0ZTogZGlzY1JhdGUsXG4gICAgICBzYXZpbmdzUmF0ZTogc2F2aW5nc1JhdGVcbiAgICB9LFxuICAgIG90aGVyczogb3RoZXJzRXhwZW5zZXNcbiAgfSk7XG4gIHZpZXcucmVuZGVyKCdzaG93VXNlckV4cGVuc2VzJywge1xuICAgIGluY29tZTogaW5jb21lLFxuICAgIGJhc2ljUmF0ZTogYmFzaWNSYXRlLFxuICAgIGRpc2NSYXRlOiBkaXNjUmF0ZSxcbiAgICBzYXZpbmdzUmF0ZTogc2F2aW5nc1JhdGVcbiAgfSk7XG4gIHZpZXcucmVuZGVyKCdzaG93T3RoZXJzRXhwZW5zZXMnLCB7XG4gICAgaW5jb21lOiBpbmNvbWUsXG4gICAgb3RoZXJzRXhwZW5zZXM6IG90aGVyc0V4cGVuc2VzXG4gIH0pO1xuICB2aWV3LnJlbmRlcignc2hvd0RldGFpbGVkQ2hhcnQnLCB7XG4gICAgdXNlckV4cGVuc2VzOiB1c2VyRXhwZW5zZXMsXG4gICAgb3RoZXJzRXhwZW5zZXM6IG90aGVyc0V4cGVuc2VzLmRldGFpbGVkXG4gIH0pO1xuICB2aWV3LnJlbmRlcignc2hvd0NvbmNsdXNpb24nLCB7XG4gICAgdXNlckV4cGVuc2VzOiB7XG4gICAgICBiYXNpYzogYmFzaWNSYXRlLFxuICAgICAgZGlzY3JldGlvbmFyeTogZGlzY1JhdGUsXG4gICAgICBzYXZpbmdzOiBzYXZpbmdzUmF0ZVxuICAgIH0sXG4gICAgb3RoZXJzRXhwZW5zZXM6IG90aGVyc0V4cGVuc2VzXG4gIH0pO1xufTtcblxudmFyIHN1YnNjcmliZXIgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgdG9waWMsIG1zZykge1xuICBpZiAodG9waWMgPT09ICdhYm91dFNhdmluZ3NSYXRlJykge1xuICAgIHZhciBkYXRhID0gbW9kZWwucmVhZCgpO1xuICAgIHZhciBpbmNvbWUgPSBkYXRhLmFib3V0SW5jb21lO1xuICAgIHZhciBiYXNpY1JhdGUgPSBkYXRhLmFib3V0QmFzaWNSYXRlO1xuICAgIHZhciBkaXNjUmF0ZSA9IGRhdGEuYWJvdXREaXNjcmV0aW9uYXJ5UmF0ZTtcbiAgICB2YXIgc2F2aW5nc1JhdGUgPSBkYXRhLmFib3V0U2F2aW5nc1JhdGU7XG4gICAgdmFyIHVzZXJFeHBlbnNlcyA9IHtcbiAgICAgIGJhc2ljOiBiYXNpY1JhdGUsXG4gICAgICBkaXNjcmV0aW9uYXJ5OiBkaXNjUmF0ZSxcbiAgICAgIHNhdmluZ3M6IHNhdmluZ3NSYXRlXG4gICAgfTtcbiAgICB2YXIgb3RoZXJzRXhwZW5zZXMgPSAgbW9kZWwuZ2V0RGVmYXVsdFJhdGVzKGluY29tZSk7XG5cbiAgICB2aWV3LnJlbmRlcignc2hvd1VzZXJFeHBlbnNlcycsIHtcbiAgICAgIGJhc2ljUmF0ZTogYmFzaWNSYXRlLFxuICAgICAgZGlzY1JhdGU6IGRpc2NSYXRlLFxuICAgICAgc2F2aW5nc1JhdGU6IHNhdmluZ3NSYXRlXG4gICAgfSk7XG4gICAgdmlldy5yZW5kZXIoJ3VwZGF0ZVN1bW1hcnlDaGFydCcsIHtcbiAgICAgIHVzZXJFeHBlbnNlczogdXNlckV4cGVuc2VzLFxuICAgICAgb3RoZXJzRXhwZW5zZXM6b3RoZXJzRXhwZW5zZXNcbiAgICB9KTtcbiAgICB2aWV3LnJlbmRlcignc2hvd0NvbmNsdXNpb24nLCB7XG4gICAgICB1c2VyRXhwZW5zZXM6IHVzZXJFeHBlbnNlcyxcbiAgICAgIG90aGVyc0V4cGVuc2VzOiBvdGhlcnNFeHBlbnNlc1xuICAgIH0pO1xuICB9IGVsc2UgaWYodG9waWMgPT09ICdleHBlbnNlcycpIHtcbiAgICB2aWV3LnJlbmRlcigndXBkYXRlRGV0YWlsZWRDaGFydCcsIHtcbiAgICAgIHVzZXJFeHBlbnNlczogbXNnXG4gICAgfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kZWwsIHZpZXcpIHtcbiAgc2V0Vmlldyhtb2RlbCwgdmlldyk7XG4gIFB1YlN1Yi5zdWJzY3JpYmUoJ2Fib3V0SW5jb21lJywgZnVuY3Rpb24oKSB7XG4gICAgc2V0Vmlldyhtb2RlbCwgdmlldyk7XG4gIH0pO1xuICBQdWJTdWIuc3Vic2NyaWJlKCdhYm91dFNhdmluZ3NSYXRlJywgc3Vic2NyaWJlci5iaW5kKG51bGwsIG1vZGVsLCB2aWV3KSk7XG4gIFB1YlN1Yi5zdWJzY3JpYmUoJ3N0ZXAuY29tcGFyaXNvbicsIGZ1bmN0aW9uKCkge1xuICAgIHNldFZpZXcobW9kZWwsIHZpZXcpO1xuICB9KTtcbiAgUHViU3ViLnN1YnNjcmliZSgnZXhwZW5zZXMnLCBzdWJzY3JpYmVyLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpKTtcbn07IiwidmFyIFB1YlN1YiA9IHJlcXVpcmUoJ3B1YnN1Yi1qcycpO1xuXG52YXIgYmluZFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICB2aWV3LmJpbmQoJ2NvbnRpbnVlQ2xpY2tlZCcsIGZ1bmN0aW9uKHN0ZXBOYW1lKSB7XG4gICAgUHViU3ViLnB1Ymxpc2goJ2FjdGl2YXRlU3RlcCcsIHN0ZXBOYW1lKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3KSB7XG4gIGJpbmRWaWV3KG1vZGVsLCB2aWV3KTtcbn07IiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG52YXIgUHViU3ViID0gcmVxdWlyZSgncHVic3ViLWpzJyk7XG52YXIgbm90aWUgPSByZXF1aXJlKCdub3RpZScpO1xuXG52YXIgYmluZFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICB2aWV3LmJpbmQoJ2Jhc2ljUmF0ZUNoYW5nZWQnLCBmdW5jdGlvbihiYXNpY1JhdGUpIHtcbiAgICB2YXIgZGlzY1JhdGUgPSBtb2RlbC5yZWFkKCdhYm91dERpc2NyZXRpb25hcnlSYXRlJyk7XG4gICAgdmFyIHNhdmluZ3NSYXRlID0gMTAwIC0gYmFzaWNSYXRlIC0gZGlzY1JhdGU7XG5cbiAgICBpZihzYXZpbmdzUmF0ZSA8IDApIHtcbiAgICAgIHZpZXcucmVuZGVyKCdzZXRTbGlkZXInLCB7XG4gICAgICAgIHNsaWRlck5hbWU6ICdiYXNpYycsXG4gICAgICAgIHZhbHVlOiBtb2RlbC5yZWFkKCdhYm91dEJhc2ljUmF0ZScpXG4gICAgICB9KTtcbiAgICAgIGhlbHBlcnMubWFrZUVycm9yKCd1c2VyJywgJ0Vycm9yOiB0aGUgc3VtIG9mIGJhc2ljICYgZGlzY3JldGlvbmFyeSByYXRlcyBhcmUgc3VwZXJpb3IgdGhhbiAxMDAnLCBub3RpZS5hbGVydC5iaW5kKG51bGwsIDMpKTtcbiAgICB9XG5cbiAgICBtb2RlbC51cGRhdGUoe2Fib3V0QmFzaWNSYXRlOiBiYXNpY1JhdGV9KTtcbiAgICBtb2RlbC51cGRhdGUoe2Fib3V0U2F2aW5nc1JhdGU6IHNhdmluZ3NSYXRlfSk7XG4gICAgdmlldy5yZW5kZXIoJ3VwZGF0ZVBpZUNoYXJ0Jywge1xuICAgICAgYmFzaWNSYXRlOiBiYXNpY1JhdGUsXG4gICAgICBkaXNjUmF0ZTogZGlzY1JhdGUsXG4gICAgICBzYXZpbmdzUmF0ZTogc2F2aW5nc1JhdGVcbiAgICB9KTtcbiAgfSk7XG4gIHZpZXcuYmluZCgnZGlzY1JhdGVDaGFuZ2VkJywgZnVuY3Rpb24oZGlzY1JhdGUpIHtcbiAgICB2YXIgYmFzaWNSYXRlID0gbW9kZWwucmVhZCgnYWJvdXRCYXNpY1JhdGUnKTtcbiAgICB2YXIgc2F2aW5nc1JhdGUgPSAxMDAgLSBiYXNpY1JhdGUgLSBkaXNjUmF0ZTtcblxuICAgIGlmKHNhdmluZ3NSYXRlIDwgMCkge1xuICAgICAgdmlldy5yZW5kZXIoJ3NldFNsaWRlcicsIHtcbiAgICAgICAgc2xpZGVyTmFtZTogJ2Rpc2NyZXRpb25hcnknLFxuICAgICAgICB2YWx1ZTogbW9kZWwucmVhZCgnYWJvdXREaXNjcmV0aW9uYXJ5UmF0ZScpXG4gICAgICB9KTtcbiAgICAgIGhlbHBlcnMubWFrZUVycm9yKCd1c2VyJywgJ0Vycm9yOiB0aGUgc3VtIG9mIGJhc2ljICYgZGlzY3JldGlvbmFyeSByYXRlcyBhcmUgc3VwZXJpb3IgdGhhbiAxMDAnLCBub3RpZS5hbGVydC5iaW5kKG51bGwsIDMpKTtcbiAgICB9XG5cbiAgICBtb2RlbC51cGRhdGUoeydhYm91dERpc2NyZXRpb25hcnlSYXRlJzogZGlzY1JhdGV9KTtcbiAgICBtb2RlbC51cGRhdGUoeydhYm91dFNhdmluZ3NSYXRlJzogc2F2aW5nc1JhdGV9KTtcbiAgICB2aWV3LnJlbmRlcigndXBkYXRlUGllQ2hhcnQnLCB7XG4gICAgICBiYXNpY1JhdGU6IGJhc2ljUmF0ZSxcbiAgICAgIGRpc2NSYXRlOiBkaXNjUmF0ZSxcbiAgICAgIHNhdmluZ3NSYXRlOiBzYXZpbmdzUmF0ZVxuICAgIH0pO1xuICB9KTtcbiAgdmlldy5iaW5kKCdjdXJyZW50U2F2aW5nc0NoYW5nZWQnLCBmdW5jdGlvbihjdXJyZW50U2F2aW5ncykge1xuICAgIG1vZGVsLnVwZGF0ZSh7J2N1cnJlbnRTYXZpbmdzJzogY3VycmVudFNhdmluZ3N9KTtcbiAgfSk7XG4gIHZpZXcuYmluZCgnZGV0YWlsc0NoYW5nZWQnLCBmdW5jdGlvbigpIHt9KTtcbiAgdmlldy5iaW5kKCdkZXRhaWxzUmVzZXQnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5jb21lID0gbW9kZWwucmVhZCgnYWJvdXRJbmNvbWUnKTtcbiAgICB2YXIgZGVmYXVsdEV4cGVuc2VzID0gbW9kZWwuZ2V0RGVmYXVsdFJhdGVzKGluY29tZSwgdHJ1ZSkuZGV0YWlsZWQ7XG5cbiAgICB2aWV3LnJlbmRlcignc2hvd0RldGFpbGVkJywge1xuICAgICAgZXhwZW5zZXM6IGRlZmF1bHRFeHBlbnNlc1xuICAgIH0pO1xuICB9KTtcbiAgdmlldy5iaW5kKCdkZXRhaWxzU2F2ZWQnLCBmdW5jdGlvbihlcnIsIHZhbHVlcykge1xuICAgIGlmKGVycikge1xuICAgICAgbm90aWUuYWxlcnQoMywgZXJyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN1bW1hcnlFeHBlbnNlcyA9IG1vZGVsLmdldFN1bW1hcnlFeHBlbnNlcyh2YWx1ZXMpO1xuICAgICAgdmlldy5yZW5kZXIoJ3NldFNsaWRlcicsIHtcbiAgICAgICAgc2xpZGVyTmFtZTogJ2Jhc2ljJyxcbiAgICAgICAgdmFsdWU6IHN1bW1hcnlFeHBlbnNlcy5iYXNpY1xuICAgICAgfSk7XG4gICAgICB2aWV3LnJlbmRlcignc2V0U2xpZGVyJywge1xuICAgICAgICBzbGlkZXJOYW1lOiAnZGlzY3JldGlvbmFyeScsXG4gICAgICAgIHZhbHVlOiBzdW1tYXJ5RXhwZW5zZXMuZGlzY3JldGlvbmFyeVxuICAgICAgfSk7XG4gICAgICBtb2RlbC51cGRhdGUoe2V4cGVuc2VzOiB2YWx1ZXN9KTtcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIHNldFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgaW5pdGlhbFN0YXRlKSB7XG4gIHZhciBpbmNvbWUgPSBpbml0aWFsU3RhdGUuYWJvdXRJbmNvbWU7XG4gIHZhciBiYXNpY1JhdGUgPSBpbml0aWFsU3RhdGUuYWJvdXRCYXNpY1JhdGU7XG4gIHZhciBkaXNjUmF0ZSA9IGluaXRpYWxTdGF0ZS5hYm91dERpc2NyZXRpb25hcnlSYXRlO1xuICB2YXIgY3VycmVudFNhdmluZ3MgPSBpbml0aWFsU3RhdGUuY3VycmVudFNhdmluZ3M7XG4gIHZhciBleHBlbnNlcyA9IGluaXRpYWxTdGF0ZS5leHBlbnNlcztcblxuICAvL0lmIHVzZXIgaGFzIG5vdCBlbnRlcmVkIGRldGFpbGVkIGV4cGVuc2VzIHlldFxuICBpZihleHBlbnNlcy5sZW5ndGggPT0gMCkge1xuICAgIGV4cGVuc2VzID0gbW9kZWwuZ2V0RGVmYXVsdFJhdGVzKGluY29tZSwgdHJ1ZSkuZGV0YWlsZWQ7XG4gIH1cblxuICB2aWV3LnJlbmRlcignc2hvd1NsaWRlcnMnLCB7XG4gICAgYmFzaWNSYXRlOiBiYXNpY1JhdGUsXG4gICAgZGlzY1JhdGU6IGRpc2NSYXRlLFxuICAgIGN1cnJlbnRTYXZpbmdzOiBjdXJyZW50U2F2aW5nc1xuICB9KTtcbiAgdmlldy5yZW5kZXIoJ3Nob3dQaWVDaGFydCcsIHtcbiAgICBpbmNvbWU6IGluY29tZSxcbiAgICBiYXNpY1JhdGU6IGJhc2ljUmF0ZSxcbiAgICBkaXNjUmF0ZTogZGlzY1JhdGVcbiAgfSk7XG4gIHZpZXcucmVuZGVyKCdzaG93RGV0YWlsZWQnLCB7XG4gICAgZXhwZW5zZXM6IGV4cGVuc2VzXG4gIH0pO1xufTtcblxudmFyIHN1YnNjcmliZXIgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgdG9waWMsIGRhdGEpIHtcbiAgaWYgKHRvcGljID09PSAnYWJvdXRJbmNvbWUnKSB7XG4gICAgLy9kYXRhIGlzIHRoZSBuZXcgaW5jb21lXG4gICAgdmFyIGRlZmF1bHRSYXRlcyA9IG1vZGVsLmdldERlZmF1bHRSYXRlcyhkYXRhLCB0cnVlKTtcbiAgICB2aWV3LnJlbmRlcignc2V0U2xpZGVyJywge1xuICAgICAgc2xpZGVyTmFtZTogJ2Jhc2ljJyxcbiAgICAgIHZhbHVlOiBkZWZhdWx0UmF0ZXMuYmFzaWNcbiAgICB9KTtcbiAgICB2aWV3LnJlbmRlcignc2V0U2xpZGVyJywge1xuICAgICAgc2xpZGVyTmFtZTogJ2Rpc2NyZXRpb25hcnknLFxuICAgICAgdmFsdWU6IGRlZmF1bHRSYXRlcy5kaXNjcmV0aW9uYXJ5XG4gICAgfSk7XG4gICAgdmlldy5yZW5kZXIoJ3VwZGF0ZVBpZVRvb2x0aXAnLCBkYXRhKTtcbiAgICB2aWV3LnJlbmRlcignc2hvd0RldGFpbGVkJywge1xuICAgICAgZXhwZW5zZXM6IGRlZmF1bHRSYXRlcy5kZXRhaWxlZFxuICAgIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpIHtcbiAgc2V0Vmlldyhtb2RlbCwgdmlldywgaW5pdGlhbFN0YXRlKTtcbiAgYmluZFZpZXcobW9kZWwsIHZpZXcpO1xuICBQdWJTdWIuc3Vic2NyaWJlKCdhYm91dEluY29tZScsIHN1YnNjcmliZXIuYmluZChudWxsLCBtb2RlbCwgdmlldykpO1xufTsiLCJ2YXIgYmluZFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICB2aWV3LmJpbmQoJ2dvYWxUb2dnbGVkJywgZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBnb2FsID0gT2JqZWN0LmFzc2lnbih7fSwgbW9kZWwuZ2V0R29hbHMoZGF0YS5pZCksIHtkYXRlOiBkYXRhLmRhdGV9KTtcbiAgICBtb2RlbC50b2dnbGVHb2FsKGdvYWwpO1xuICB9KTtcbn07XG5cbnZhciBzZXRWaWV3ID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSkge1xuICB2aWV3LnJlbmRlcignc2hvd0dvYWxzJywge1xuICAgIGdvYWxzTGlzdDogbW9kZWwuZ2V0R29hbHMoKSxcbiAgICBwaWNrZWRHb2FsczogaW5pdGlhbFN0YXRlLmdvYWxzXG4gIH0pO1xuICB2aWV3LnJlbmRlcignY3JlYXRlVG9vbHRpcHMnKTtcbiAgdmlldy5yZW5kZXIoJ3NldERyYWdEcm9wJyk7XG4gIHZpZXcucmVuZGVyKCdjcmVhdGVEYXRlcGlja2VycycpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgaW5pdGlhbFN0YXRlKSB7XG4gIHNldFZpZXcobW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSk7XG4gIGJpbmRWaWV3KG1vZGVsLCB2aWV3KTtcbn07IiwidmFyIFB1YlN1YiA9IHJlcXVpcmUoJ3B1YnN1Yi1qcycpO1xuXG52YXIgYmluZFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICB2aWV3LmJpbmQoJ2xpbmtDbGlja2VkJywgZnVuY3Rpb24obmV4dFN0ZXApIHtcbiAgICBpZihuZXh0U3RlcCkge1xuICAgICAgUHViU3ViLnB1Ymxpc2goJ3N0ZXAuJyArIG5leHRTdGVwKTtcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIHNldFZpZXcgPSBmdW5jdGlvbih2aWV3LCBpbml0aWFsU3RhdGUpIHtcbiAgdmFyIGxhc3RVc2VyU3RlcCA9IGluaXRpYWxTdGF0ZS5sYXN0VXNlclN0ZXA7XG5cbiAgdmlldy5yZW5kZXIoJ2Rpc2FibGVMaW5rcycsIHtsYXN0VXNlclN0ZXA6IGxhc3RVc2VyU3RlcH0pO1xufTtcblxudmFyIHN1YnNjcmliZXIgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgdG9waWMsIGRhdGEpIHtcbiAgdmFyIHN0ZXBOYW1lID0gZGF0YTtcbiAgdmFyIHN0ZXBOdW1iZXIgPSBOdW1iZXIoZG9jdW1lbnQuZ2V0KCdzdGVwLW5hbWUtLScgKyBzdGVwTmFtZSkuZ2V0KCdzdGVwLW51bWJlcicpLnRleHRDb250ZW50KTtcbiAgdmFyIGxhc3RVc2VyU3RlcCA9IG1vZGVsLnJlYWQoJ2xhc3RVc2VyU3RlcCcpO1xuXG4gIHZpZXcucmVuZGVyKCdhY3RpdmF0ZVN0ZXAnLCB7XG4gICAgc3RlcE5hbWU6IHN0ZXBOYW1lXG4gIH0pO1xuXG4gIGlmKGxhc3RVc2VyU3RlcCA8IHN0ZXBOdW1iZXIpIHtcbiAgICBtb2RlbC51cGRhdGUoe2xhc3RVc2VyU3RlcDogc3RlcE51bWJlcn0pO1xuICB9XG5cbiAgUHViU3ViLnB1Ymxpc2goJ3N0ZXAuJyArIHN0ZXBOYW1lKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSkge1xuICBzZXRWaWV3KHZpZXcsIGluaXRpYWxTdGF0ZSk7XG4gIGJpbmRWaWV3KG1vZGVsLCB2aWV3KTtcbiAgUHViU3ViLnN1YnNjcmliZSgnYWN0aXZhdGVTdGVwJywgc3Vic2NyaWJlci5iaW5kKG51bGwsIG1vZGVsLCB2aWV3KSk7XG5cbiAgLyogREVWRUxPUE1FTlQgT05MWSAqL1xuICAvL0BOT1RFIFRoaXMgY291bGQgYmUgdXNlZnVsIGFsc28gZm9yIHVzZXJzIGFuZCBub3Qgb25seSBmb3IgZGV2ZWxvcG1lbnRcbiAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0KCdyZXNldC1tb2RlbCcpO1xuICByZXNldEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIG1vZGVsLnJlc2V0KCk7XG4gICAgZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKCk7XG4gIH0pO1xufTsiLCJ2YXIgUHViU3ViID0gcmVxdWlyZSgncHVic3ViLWpzJyk7XG5cbnZhciBiaW5kVmlldyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3KSB7XG4gIHZpZXcuYmluZCgnYWN0aW9uVG9nZ2xlZCcsIGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIG1vZGVsLnRvZ2dsZUFjdGlvbnMoYWN0aW9uKTtcbiAgfSk7XG59O1xuXG52YXIgc2V0VmlldyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpIHtcbiAgdmFyIGdvYWxzID0gaW5pdGlhbFN0YXRlLmdvYWxzO1xuICB2YXIgZ29hbHNBY3Rpb25zID0gZ29hbHMubWFwKGZ1bmN0aW9uKGdvYWwpIHtcbiAgICB2YXIgYWN0aW9ucyA9IG1vZGVsLmdldEFjdGlvbnMoZ29hbC5pZCk7XG4gICAgaWYoYWN0aW9ucykge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGdvYWwsIHthY3Rpb25zOiBhY3Rpb25zfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9KS5maWx0ZXIoZnVuY3Rpb24oZ29hbEFjdGlvbnMpIHsgLy9maWx0ZXIgbm90IHVuZGVmaW5lZCBnb2FsIGFjdGlvbnNcbiAgICByZXR1cm4gZ29hbEFjdGlvbnM7XG4gIH0pO1xuICAvLyBXZSBhZGQgdGhlIGdlbmVyYWwgdGlwcyB0byB0aGUgYmVnaW5uaW5nXG4gIGdvYWxzQWN0aW9ucy51bnNoaWZ0KHtcbiAgICBpZDogJ2dlbmVyYWwnLFxuICAgIGFjdGlvbnM6IG1vZGVsLmdldEFjdGlvbnMoJ2dlbmVyYWwnKSxcbiAgICB0aXRsZTogJ0dlbmVyYWwgVGlwcydcbiAgfSk7XG5cbiAgdmlldy5yZW5kZXIoJ3Nob3dHb2Fsc0FjdGlvbnMnLCBnb2Fsc0FjdGlvbnMpO1xuICB2aWV3LnJlbmRlcignY3JlYXRlUG9wb3ZlcnMnKTtcbn07XG5cbnZhciBzdWJzY3JpYmVyID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIHRvcGljLCBkYXRhKSB7XG4gIHNldFZpZXcobW9kZWwsIHZpZXcsIHtnb2FsczogZGF0YX0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgaW5pdGlhbFN0YXRlKSB7XG4gIHNldFZpZXcobW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSk7XG4gIGJpbmRWaWV3KG1vZGVsLCB2aWV3KTtcbiAgUHViU3ViLnN1YnNjcmliZSgnZ29hbHMnLCBzdWJzY3JpYmVyLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpKTtcbn07IiwidmFyIGJpbmRWaWV3ID0gZnVuY3Rpb24obW9kZWwsIHZpZXcpIHtcbiAgdmlldy5iaW5kKCdwcmludENsaWNrZWQnLCBmdW5jdGlvbigpIHtcbiAgICB2aWV3LnJlbmRlcigncHJpbnRQbGFuJyk7XG4gIH0pO1xufTtcblxudmFyIHNldFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICB2aWV3LnJlbmRlcignY3JlYXRlUG9wb3ZlcnMnKTtcbiAgdmlldy5yZW5kZXIoJ2NyZWF0ZURhdGVQaWNrZXJzJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3KSB7XG4gIHNldFZpZXcobW9kZWwsIHZpZXcpO1xuICBiaW5kVmlldyhtb2RlbCwgdmlldyk7XG59OyIsIi8vIHZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xudmFyIFB1YlN1YiA9IHJlcXVpcmUoJ3B1YnN1Yi1qcycpO1xuLy8gdmFyIG5vdGllID0gcmVxdWlyZSgnbm90aWUnKTtcblxudmFyIHJlbmRlclVwZGF0ZSA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCBwcm9wTmFtZSwgcHJvcFZhbHVlKSB7XG4gIHZhciBzdGF0ZSA9IG1vZGVsLnJlYWQoKTtcbiAgdmFyIGRhdGEgPSB7XG4gICAgaW5jb21lOiBzdGF0ZS5hYm91dEluY29tZSxcbiAgICBzYXZpbmdzUmF0ZTogc3RhdGUuYWJvdXRTYXZpbmdzUmF0ZSxcbiAgICBhZ2U6IHN0YXRlLmFib3V0QWdlLFxuICAgIGN1cnJlbnRTYXZpbmdzOiBzdGF0ZS5jdXJyZW50U2F2aW5nc1xuICB9O1xuICBkYXRhW3Byb3BOYW1lXSA9IHByb3BWYWx1ZTtcblxuICB2aWV3LnJlbmRlcigndXBkYXRlTGluZUNoYXJ0U2VyaWUnLCBkYXRhKTtcbn07XG5cbnZhciBzZXRWaWV3ID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSkge1xuICB2YXIgYWdlID0gaW5pdGlhbFN0YXRlLmFib3V0QWdlO1xuICB2YXIgaW5jb21lID0gaW5pdGlhbFN0YXRlLmFib3V0SW5jb21lO1xuICB2YXIgc2F2aW5nc1JhdGUgPSBpbml0aWFsU3RhdGUuYWJvdXRTYXZpbmdzUmF0ZTtcbiAgdmFyIGN1cnJlbnRTYXZpbmdzID0gaW5pdGlhbFN0YXRlLmN1cnJlbnRTYXZpbmdzO1xuXG4gIHZpZXcucmVuZGVyKCdzaG93U2xpZGVycycsIHtcbiAgICBpbmNvbWU6IGluY29tZSxcbiAgICBzYXZpbmdzUmF0ZTogc2F2aW5nc1JhdGVcbiAgfSk7XG4gIHZpZXcucmVuZGVyKCdzaG93TGluZUNoYXJ0Jywge1xuICAgIGFnZTogYWdlLFxuICAgIGluY29tZTogaW5jb21lLFxuICAgIHNhdmluZ3NSYXRlOiBzYXZpbmdzUmF0ZSxcbiAgICBjdXJyZW50U2F2aW5nczogY3VycmVudFNhdmluZ3NcbiAgfSk7XG59O1xuXG52YXIgYmluZFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICB2YXIgYmluZGVkUmVuZGVyVXBkYXRlID0gcmVuZGVyVXBkYXRlLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpO1xuICB2YXIgZXZlbnRzID0gW1xuICAgICdhbm51YWxJbnRlcmVzdFJhdGVDaGFuZ2VkJyxcbiAgICAnc2F2aW5nc1JhdGVDaGFuZ2VkJyxcbiAgICAnaW5jb21lQ2hhbmdlZCcsXG4gICAgJ2ludmVzdG1lbnRSYXRlQ2hhbmdlZCcsXG4gICAgJ3JldGlyZW1lbnRBZ2VDaGFuZ2VkJ1xuICBdO1xuXG4gIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgIHZpZXcuYmluZChldmVudE5hbWUsIGJpbmRlZFJlbmRlclVwZGF0ZS5iaW5kKG51bGwsICBldmVudE5hbWUucmVwbGFjZSgnQ2hhbmdlZCcsICcnKSkpO1xuICB9KTtcbn07XG5cbnZhciBzdWJzY3JpYmVyID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIHRvcGljLCBkYXRhKSB7XG4gIHZhciBiaW5kZWRSZW5kZXJVcGRhdGUgPSByZW5kZXJVcGRhdGUuYmluZChudWxsLCBtb2RlbCwgdmlldyk7XG5cbiAgaWYgKHRvcGljID09PSAnYWJvdXRBZ2UnKSB7XG4gICAgYmluZGVkUmVuZGVyVXBkYXRlKCdhZ2UnLCBkYXRhKTtcbiAgfSBlbHNlIGlmKHRvcGljID09PSAnYWJvdXRJbmNvbWUnKSB7XG4gICAgdmlldy5yZW5kZXIoJ3NldFNsaWRlcicsIHtcbiAgICAgIHNsaWRlck5hbWU6ICdpbmNvbWUnLFxuICAgICAgdmFsdWU6IGRhdGFcbiAgICB9KTtcbiAgICBiaW5kZWRSZW5kZXJVcGRhdGUoJ2luY29tZScsIGRhdGEpO1xuICB9IGVsc2UgaWYodG9waWMgPT09ICdhYm91dFNhdmluZ3NSYXRlJykge1xuICAgIHZpZXcucmVuZGVyKCdzZXRTbGlkZXInLCB7XG4gICAgICBzbGlkZXJOYW1lOiAnc2F2aW5nc1JhdGUnLFxuICAgICAgdmFsdWU6IGRhdGFcbiAgICB9KTtcbiAgICBiaW5kZWRSZW5kZXJVcGRhdGUoJ3NhdmluZ3NSYXRlJywgZGF0YSk7XG4gIH0gZWxzZSBpZiAodG9waWMgPT09ICdjdXJyZW50U2F2aW5ncycpIHtcbiAgICBiaW5kZWRSZW5kZXJVcGRhdGUoJ2N1cnJlbnRTYXZpbmdzJywgZGF0YSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSkge1xuICBzZXRWaWV3KG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpO1xuICBiaW5kVmlldyhtb2RlbCwgdmlldyk7XG5cbiAgUHViU3ViLnN1YnNjcmliZSgnYWJvdXRBZ2UnLCBzdWJzY3JpYmVyLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpKTtcbiAgUHViU3ViLnN1YnNjcmliZSgnYWJvdXRJbmNvbWUnLCBzdWJzY3JpYmVyLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpKTtcbiAgUHViU3ViLnN1YnNjcmliZSgnYWJvdXRTYXZpbmdzUmF0ZScsIHN1YnNjcmliZXIuYmluZChudWxsLCBtb2RlbCwgdmlldykpO1xuICBQdWJTdWIuc3Vic2NyaWJlKCdjdXJyZW50U2F2aW5ncycsIHN1YnNjcmliZXIuYmluZChudWxsLCBtb2RlbCwgdmlldykpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgbm9VaVNsaWRlciA9IHJlcXVpcmUoJ25vdWlzbGlkZXInKTtcblxuLyoqXG4gKiBBcHBlbmRzIGFuIEhUTUwgZWxlbWVudCBhcyB0b29sdGlwIHRvIHRoZSBzbGlkZXJcbiAqIEBwYXJhbSAge29iamVjdH0gc2xpZGVyIFNsaWRlciBET00gRWxlbWVudFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG52YXIgYXBwZW5kVG9vbHRpcCA9IGZ1bmN0aW9uKHNsaWRlcikge1xuICBpZighc2xpZGVyLmFwcGVuZENoaWxkKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIHNsaWRlcik7XG4gIH1cblxuICB2YXIgaGFuZGxlID0gc2xpZGVyLmdldCgnbm9VaS1oYW5kbGUnKTtcbiAgdmFyIHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKCdzbGlkZXItdG9vbHRpcCcpO1xuICB0b29sdGlwLmlubmVySFRNTCA9ICc8c3Bhbj48L3NwYW4+JztcbiAgaGFuZGxlLmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gIHJldHVybiBzbGlkZXI7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIHNsaWRlciB1c2luZyBub1VpU2xpZGVyXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCBIVE1MIE5vZGUgb2YgdGhlIHNsaWRlclxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zIFNsaWRlciBvcHRpb25zXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGZvcm1hdCBUb29sdGlwIHZhbHVlIGZvcm1hdFxuICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHRvb2x0aXAtaGFuZGxlXG4gKi9cbnZhciBjcmVhdGVTbGlkZXIgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7XG4gIGlmICh0eXBlb2Ygbm9VaVNsaWRlciAhPT0gJ29iamVjdCcpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcihudWxsLCAnbm91aXNsaWRlciBvYmplY3QgaXMgbm90IGRlY2xhcmVkLicpO1xuICB9XG4gIG5vVWlTbGlkZXIuY3JlYXRlKGVsZW1lbnQsIG9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn07XG5cbnZhciB1cGRhdGVIYW5kbGVyID0gZnVuY3Rpb24oc2xpZGVyLCBmb3JtYXQpIHtcbiAgdmFyIHRvb2x0aXAgPSBzbGlkZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXTtcbiAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIGNvbnNvbGUubG9nKHZhbHVlcyk7XG4gICAgdG9vbHRpcC5pbm5lckhUTUwgPSBoZWxwZXJzLmZvcm1hdCh2YWx1ZXNbMF0sIGZvcm1hdCk7XG4gIH0pO1xufTtcblxudmFyIHNsaWRlcldpdGhUb29sdGlwcyA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMsIGZvcm1hdCkge1xuICB1cGRhdGVIYW5kbGVyKFxuICAgIGFwcGVuZFRvb2x0aXAoIGNyZWF0ZVNsaWRlcihlbGVtZW50LCBvcHRpb25zKSApLFxuICAgIGZvcm1hdFxuICApO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGEgY2xhc3NOYW1lIGZyb20gdGhlIGN1cnJlbnQgYWN0aXZlIGVsZW1lbnQgYW5kIGFwcGxpZXMgaXQgdG8gdGhlXG4gKiBuZXcgb25lXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5ld0FjdGl2ZSBOZXcgYWN0aXZlIGVsZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgQ2xhc3NuYW1lIHRvIGFwcGx5XG4gKi9cbnZhciBzZXRBY3RpdmUgPSBmdW5jdGlvbihuZXdBY3RpdmUsIGNsYXNzTmFtZSkge1xuICB2YXIgb2xkQWN0aXZlID0gZG9jdW1lbnQuZ2V0KGNsYXNzTmFtZSk7XG4gIG9sZEFjdGl2ZS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gIG5ld0FjdGl2ZS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlU2xpZGVyOiBzbGlkZXJXaXRoVG9vbHRpcHMsXG4gIHNldEFjdGl2ZTogc2V0QWN0aXZlXG59O1xuIiwiLyoqXG4gKiBIZWxwZXJzIG1vZHVsZVxuICogQG1vZHVsZSBoZWxwZXJzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3VzdG9tRXJyb3JDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKG5hbWUsIGRlc2MpIHtcbiAgdmFyIEVycm9yQ29uc3RydWN0b3IgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBkZXNjICsgbXNnO1xuICAgIHRoaXMuc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrO1xuICB9O1xuICBFcnJvckNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbiAgRXJyb3JDb25zdHJ1Y3Rvci5wcm90b3R5cGUubmFtZSA9IG5hbWU7XG5cbiAgcmV0dXJuIEVycm9yQ29uc3RydWN0b3I7XG59O1xuXG52YXIgUGFyYW1zRXJyb3IgPSBjdXN0b21FcnJvckNvbnN0cnVjdG9yKCdQYXJhbXNFcnJvcicsICdJbnZhbGlkIHBhcmFtZXRlcnM6ICcpO1xudmFyIFVzZXJFcnJvciA9IGN1c3RvbUVycm9yQ29uc3RydWN0b3IoJ1VzZXJFcnJvcicsICdJbnZhbGlkIHVzZXIgaW5wdXQ6ICcpO1xuXG4vKipcbiAqIFRocm93cyBhbiBlcnJvclxuICogQHBhcmFtICB7c3RyaW5nfSB0eXBlIEVycm9yIHR5cGUvY29uc3RydWN0b3JcbiAqIEBwYXJhbSAge29iamVjdH0gZGF0YSBEYXRhIHRvIHBhc3MgaW4gdGhlIG1zZ1xuICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIE9wdGlvbmFsIGNhbGxiYWNrLiBVc2VmdWwgaWYgeW91IG5lZWQgdG8gZGlzcGxheVxuICogdGhlIGVycm9yIHRvIHRoZSB1c2VyIGZvciBleGFtcGxlLlxuICovXG52YXIgbWFrZUVycm9yID0gZnVuY3Rpb24odHlwZSwgZGF0YSwgY2FsbGJhY2spIHtcbiAgdmFyIG1zZztcbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xuXG4gIHRyeSB7XG4gICAgbXNnID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBtc2cgPSBKU09OLnN0cmluZ2lmeShlKTtcbiAgfVxuXG4gIGNhbGxiYWNrKG1zZyk7XG5cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAncGFyYW1zJzpcbiAgICAgIHRocm93IG5ldyBQYXJhbXNFcnJvcihtc2cpO1xuICAgIGNhc2UgJ3VzZXInOlxuICAgICAgdGhyb3cgbmV3IFVzZXJFcnJvcihtc2cpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgaW5wdXQgaXMgc3RyaWN0bHkgYSBpc051bWJlclxuICogQHBhcmFtIHsqfSB2YWx1ZSBWYWx1ZSB0byBjaGVja1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xudmFyIGlzTnVtYmVyID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgLy9DaGVjayBhbHNvIHdpdGggaXNOYU4gYmVjYXVzZSAodHlwZW9mIE5hTiA9PT0gJ251bWJlcicpIGlzIHRydWVcbiAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpO1xufTtcblxuLyoqXG4gKiBGb3JtYXRzIHRoZSB2YWx1ZSB0byBhIHNwZWNpZmllZCB0eXBlXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHZhbHVlIFZhbHVlIHRvIGJlIGZvcm1hdHRlZFxuICogQHBhcmFtICB7c3RyaW5nfSB0eXBlIEZvcm1hdFxuICogQHJldHVybiB7c3RyaW5nfSBGb3JtYXR0ZWQgdmFsdWVcbiAqL1xudmFyIGZvcm1hdCA9IGZ1bmN0aW9uKHZhbHVlLCB0eXBlKSB7XG4gIGlmKCh0eXBlICYmIHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJykgKSB7XG4gICAgbWFrZUVycm9yKCdwYXJhbXMnLCB2YWx1ZSk7XG4gIH1cblxuICB2YXIgbmV3VmFsdWUgPSAnJztcblxuICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvKFxcLjApJC8sICcnKTtcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICckJzpcbiAgICAgIG5ld1ZhbHVlID0gJyQnICsgdmFsdWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICclJzpcbiAgICAgIG5ld1ZhbHVlID0gdmFsdWUgKyAnJSc7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbmV3VmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBuZXdWYWx1ZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcmV2ZXJzZWQgYXJyYXkgd2l0aG91dCBzaWRlIGVmZmVjdHNcbiAqIEBwYXJhbSAge2FycmF5fSBhcnJheSBJbml0aWFsIGFycmF5XG4gKiBAcmV0dXJuIHthcnJheX1cbiAqL1xudmFyIHJldmVyc2UgPSBmdW5jdGlvbihhcnJheSkge1xuICBpZighQXJyYXkuaXNBcnJheShhcnJheSkpIHtcbiAgICBtYWtlRXJyb3IoJ3BhcmFtcycsIGFycmF5KTtcbiAgfVxuXG4gIHJldHVybiBhcnJheS5zbGljZSgpLnJldmVyc2UoKTtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjb25maWdNYXAgb2YgdGhlIG1vZHVsZSAtIEl0IGdvZXMgZGVlcCBpbiB0aGUgb2JqZWN0XG4gKiBAcGFyYW0gIHtvYmplY3R9IGlucHV0TWFwIE9iamVjdCBtYXAgd2l0aCBuZXcgcHJvcGVydGllcyBhbmQgdmFsdWVzXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZ01hcCBJbml0aWFsIG9iamVjdCBtYXBcbiAqIEByZXR1cm4ge29iamVjdH0gY29uZmlnTWFwIFVwZGF0ZWQgbWFwXG4gKi9cbnZhciBzZXRDb25maWdNYXAgPSBmdW5jdGlvbihpbnB1dE1hcCwgY29uZmlnTWFwKSB7XG4gIHZhciBrZXk7XG5cbiAgZm9yIChrZXkgaW4gaW5wdXRNYXApIHtcbiAgICBpZiAoY29uZmlnTWFwLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGlmIChpbnB1dE1hcFtrZXldIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIHNldENvbmZpZ01hcChpbnB1dE1hcFtrZXldLCBjb25maWdNYXBba2V5XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25maWdNYXBba2V5XSA9IGlucHV0TWFwW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmZpZ01hcDtcbn07XG5cbi8qKlxuICogUmVwbGFjZXMgbXVzdGFjaGUtd3JhcHBlZCB3b3JkcyB3aXRoIHZhbHVlc1xuICogQHBhcmFtICB7c3RyaW5nfSBzdHJpbmcgSW5pdGlhbCBzdHJpbmdcbiAqIEBwYXJhbSAge29iamVjdH0gdmFsdWVzTWFwIE9iamVjdCBtYXAgb2YgdmFsdWVzXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKHN0cmluZywgdmFsdWVzTWFwKXtcbiAgdmFyIHMgPSBzdHJpbmcgfHwgJyc7XG5cbiAgT2JqZWN0LmtleXModmFsdWVzTWFwKS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcyA9IHMucmVwbGFjZShuZXcgUmVnRXhwKCd7JyArIHZhbHVlICsgJ30nLCAnZycpLCB2YWx1ZXNNYXBbdmFsdWVdKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHM7XG59O1xuXG4vKipcbiAqIFRvZ2dsZXMgYSBpdGVtIGluIGFycmF5LCBhZGRpbmcgb3IgcmVtb3ZpbmcgaXQgd2hldGhlciBpdCdzIGFscmVhZHkgY29udGFpbmVkXG4gKiBAcGFyYW0gIHthcnJheX0gYXJyYXkgQXJyYXlcbiAqIEBwYXJhbSAge29iamVjdH0gaXRlbSBJdGVtXG4gKiBAcmV0dXJuIHthcnJheX0gbXlBcnJheSBVcGRhdGVkIGFycmF5XG4gKi9cbnZhciB0b2dnbGVBcnJheUl0ZW0gPSBmdW5jdGlvbihhcnJheSwgaXRlbSkge1xuICAvL1dlIGNsb25lIHRoZSBhcnJheSB0byBhdm9pZCBzaWRlIGVmZmVjdHNcbiAgdmFyIG15QXJyYXkgPSBhcnJheS5zbGljZSgwKTtcblxuICB2YXIgaXNUaGVyZSA9IG15QXJyYXkuZmluZChmdW5jdGlvbihhcnJheUl0ZW0sIGluZGV4KSB7XG4gICAgaWYoYXJyYXlJdGVtLmlkID09PSBpdGVtLmlkKSB7XG4gICAgICBteUFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmKCFpc1RoZXJlKSB7XG4gICAgbXlBcnJheS5wdXNoKGl0ZW0pO1xuICB9XG5cbiAgcmV0dXJuIG15QXJyYXk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGFjdHVhbCB2YWx1ZSBvZiBhIHJhdGVcbiAqIEBwYXJhbSAge251bWJlcn0gdG90YWwgVG90YWxcbiAqIEBwYXJhbSAge251bWJlcn0gcmF0ZSBSYXRlXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbnZhciB2YWx1ZU9mUmF0ZSA9IGZ1bmN0aW9uKHRvdGFsLCByYXRlKSB7XG4gIGlmKCAodHlwZW9mIHJhdGUgIT09ICdudW1iZXInKSB8fCAodHlwZW9mIHRvdGFsICE9PSAnbnVtYmVyJykgKSB7XG4gICAgbWFrZUVycm9yKCdwYXJhbXMnLCB7cmF0ZTogcmF0ZSwgdG90YWw6IHRvdGFsfSk7XG4gIH1cblxuICByZXR1cm4gcmF0ZSAqIHRvdGFsICogMC4wMTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYWN0dWFsIHZhbHVlcyBvZiBzdW1tYXJ5IHJhdGVzIGJhc2VkIG9uIGluY29tZVxuICogQHBhcmFtICB7bnVtYmVyfSBpbmNvbWUgSW5jb21lXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGJhc2ljUmF0ZSBCYXNpYyBuZWVkcyByYXRlXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGRpc2NSYXRlIERpc2NyZXRpb25hcnkgRXhwZW5zZXMgcmF0ZVxuICogQHBhcmFtICB7bnVtYmVyfSBzYXZpbmdzUmF0ZSBTYXZpbmdzIHJhdGVcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xudmFyIHZhbHVlc09mU3VtbWFyeSA9IGZ1bmN0aW9uKGluY29tZSwgYmFzaWNSYXRlLCBkaXNjUmF0ZSwgc2F2aW5nc1JhdGUpIHtcbiAgdmFyIHZhbHVlT2ZDYXRlZ29yeSA9IHZhbHVlT2ZSYXRlLmJpbmQobnVsbCwgaW5jb21lKTtcbiAgcmV0dXJuIHtcbiAgICBiYXNpY05lZWRzOiB2YWx1ZU9mQ2F0ZWdvcnkoYmFzaWNSYXRlKSxcbiAgICBkaXNjcmV0aW9uYXJ5RXhwZW5zZXM6IHZhbHVlT2ZDYXRlZ29yeShkaXNjUmF0ZSksXG4gICAgYW5udWFsU2F2aW5nczogdmFsdWVPZkNhdGVnb3J5KHNhdmluZ3NSYXRlKVxuICB9O1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZm9ybWF0OiBmb3JtYXQsXG4gIG1ha2VFcnJvcjogbWFrZUVycm9yLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIHJldmVyc2U6IHJldmVyc2UsXG4gIHNldENvbmZpZ01hcDogc2V0Q29uZmlnTWFwLFxuICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gIHRvZ2dsZUFycmF5SXRlbTogdG9nZ2xlQXJyYXlJdGVtLFxuICB2YWx1ZU9mUmF0ZTogdmFsdWVPZlJhdGUsXG4gIHZhbHVlc09mU3VtbWFyeTogdmFsdWVzT2ZTdW1tYXJ5XG59O1xuIiwiLyoqXG4gKiBNb2RlbCBtb2R1bGVcbiAqIEBtb2R1bGUgbW9kZWxcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgUHViU3ViID0gcmVxdWlyZSgncHVic3ViLWpzJyk7XG52YXIgbm90aWUgPSByZXF1aXJlKCdub3RpZScpLmFsZXJ0O1xuXG52YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4vbW9kZWwvYWN0aW9ucycpO1xudmFyIGJ1ZGdldCA9IHJlcXVpcmUoJy4vbW9kZWwvYnVkZ2V0Jyk7XG52YXIgZ2V0R29hbHMgPSByZXF1aXJlKCcuL21vZGVsL2dvYWxzJyk7XG5cbnZhciBzdGF0ZU1hcCA9IHtcbiAgZGJOYW1lOiAnJ1xufTtcblxudmFyIGRlZmF1bHRNb2RlbCA9IHtcbiAgYWJvdXRBZ2U6IDM1LFxuICBhYm91dFNpdHVhdGlvbjogJ21hcnJpZWQnLFxuICBhYm91dExpdmluZzogJ293bicsXG4gIGFib3V0SW5jb21lOiA2MDAwMCxcbiAgYWJvdXRCYXNpY1JhdGU6IDM1LFxuICBhYm91dERpc2NyZXRpb25hcnlSYXRlOiA1MixcbiAgYWJvdXRTYXZpbmdzUmF0ZTogMTMsXG4gIGN1cnJlbnRTYXZpbmdzOiAxMDAwMCxcbiAgZXhwZW5zZXM6IFtdLFxuICAvL2Fib3V0U3RhZ2U6ICdob21lJyxcbiAgbGFzdFVzZXJTdGVwOiAxLFxuICBnb2FsczogW10sXG4gIGFjdGlvbnM6IFtdXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gQkFTSUMgU1RPUkUgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1vZGVsLlxuICogQHBhcmFtICB7c3RyaW5nfSBwcm9wZXJ0eSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHlcbiAqIEByZXR1cm4ge2FueXRoaW5nfVxuICovXG52YXIgcmVhZCA9IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gIHZhciBkYXRhID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Vbc3RhdGVNYXAuZGJOYW1lXSk7XG5cbiAgaWYodHlwZW9mIHByb3BlcnR5ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgcmV0dXJuIGRhdGFbcHJvcGVydHldO1xufTtcblxuLyoqXG4gKiBVcGRhdGVzIG1vZGVsIGJ5IGdpdmluZyBpdCB0aGUgcHJvcGVydHkgbmFtZSBhbmQgaXRzIHZhbHVlLlxuICogQHBhcmFtICB7c3RyaW5nfSB1cGRhdGVNYXAgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHVwZGF0ZVxuICovXG52YXIgdXBkYXRlID0gZnVuY3Rpb24gKHVwZGF0ZU1hcCkge1xuICBpZih0eXBlb2YgdXBkYXRlTWFwICE9PSAnb2JqZWN0Jykge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCB1cGRhdGVNYXApO1xuICB9XG5cbiAgdmFyIGRhdGEgPSByZWFkKCk7XG5cbiAgT2JqZWN0LmtleXModXBkYXRlTWFwKS5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgZGF0YVtwcm9wZXJ0eV0gPSB1cGRhdGVNYXBbcHJvcGVydHldO1xuICAgIFB1YlN1Yi5wdWJsaXNoKHByb3BlcnR5LCB1cGRhdGVNYXBbcHJvcGVydHldKTtcbiAgICBjb25zb2xlLmxvZyhwcm9wZXJ0eSwgdXBkYXRlTWFwW3Byb3BlcnR5XSk7XG4gIH0pO1xuXG4gIGxvY2FsU3RvcmFnZVtzdGF0ZU1hcC5kYk5hbWVdID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgZGF0YSBmcm9tIG1vZGVsXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHByb3BlcnR5IFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBiZSByZW1vdmVkIGZyb20gbW9kZWwuXG4gKi9cbnZhciByZW1vdmUgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgdmFyIGRhdGEgPSByZWFkKCk7XG5cbiAgZGVsZXRlIGRhdGFbcHJvcGVydHldO1xuXG4gIGxvY2FsU3RvcmFnZVtzdGF0ZU1hcC5kYk5hbWVdID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG59O1xuXG4vKipcbiAqIFdBUk5JTkc6IFdpbGwgcmVtb3ZlIEFMTCBkYXRhIGZyb20gc3RvcmFnZS5cbiAqL1xudmFyIHJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICBsb2NhbFN0b3JhZ2Vbc3RhdGVNYXAuZGJOYW1lXSA9IEpTT04uc3RyaW5naWZ5KGRlZmF1bHRNb2RlbCk7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gU1BFQ0lGSUMgTU9ERUwgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4vKipcbiAqIFJldHVybnMgc3VtbWFyeSBleHBlbnNlcyBmcm9tIHRoZSBkZXRhaWxlZCBvbmVcbiAqIEBwYXJhbSAge2FycmF5fSBkZXRhaWxlZEV4cGVuc2VzIEFycmF5IG9mIHRoZSB2YWx1ZXMgb2YgZGV0YWlsZWQgZXhwZW5zZXNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xudmFyIGdldFN1bW1hcnlFeHBlbnNlcyA9IGZ1bmN0aW9uKGRldGFpbGVkRXhwZW5zZXMpIHtcbiAgLyoqXG4gICAqIFBvc2l0aW9ucyBvZiB0aGUgYmFzaWMgY2F0ZWdvcmllcyBpbiB0aGUgbGlzdCBvZiBkZXRhaWxlZCBleHBlbnNlc1xuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBOT1RFIFRoaXMgc2hvdWxkIGJlIGltcHJvdmVkIHNpbmNlIGl0IHJlcXVpcmVzIHRoZSBwYXJhbWV0ZXIgYXJyYXkgdG9cbiAgICogaGF2ZSBhbHdheXMgdGhlIHNhbWUgc3RydWN0dXJlLCBidXQgaXQgd291bGQgcmVxdWlyZSBtdWNoIG1vcmUgY29kZVxuICAgKi9cbiAgdmFyIGJhc2ljQ2F0ZWdvcmllcyA9IFswLCAyLCA0XTtcbiAgdmFyIGJhc2ljRXhwZW5zZXMgPSAwO1xuICB2YXIgZGlzY0V4cGVuc2VzID0gMDtcblxuICBpZighQXJyYXkuaXNBcnJheShkZXRhaWxlZEV4cGVuc2VzKSkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkZXRhaWxlZEV4cGVuc2VzKTtcbiAgfVxuXG4gIGRldGFpbGVkRXhwZW5zZXMuZm9yRWFjaChmdW5jdGlvbihleHBlbnNlLCBpbmRleCkge1xuICAgIGlmKH5iYXNpY0NhdGVnb3JpZXMuaW5kZXhPZihpbmRleCkpIHtcbiAgICAgIGJhc2ljRXhwZW5zZXMgKz0gZXhwZW5zZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlzY0V4cGVuc2VzICs9IGV4cGVuc2U7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGJhc2ljOiBiYXNpY0V4cGVuc2VzLFxuICAgIGRpc2NyZXRpb25hcnk6IGRpc2NFeHBlbnNlc1xuICB9O1xufTtcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBzdG9yZWQgbGlzdCBhZGRpbmcgb3IgcmVtb3ZpbmcgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSAge3N0cmluZ30gbGlzdE5hbWUgTmFtZSBvZiB0aGUgbGlzdFxuICogQHBhcmFtICB7b2JqZWN0fSBpdGVtIGl0ZW0gdG8gYWRkIG9yIGRlbGV0ZVxuICovXG52YXIgdG9nZ2xlTGlzdEl0ZW0gPSBmdW5jdGlvbihsaXN0TmFtZSwgaXRlbSkge1xuICBpZih0eXBlb2YgbGlzdE5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGxpc3ROYW1lKTtcbiAgfVxuXG4gIHZhciBsaXN0ID0gcmVhZCgpW2xpc3ROYW1lXTtcbiAgdmFyIHVwZGF0ZWRMaXN0ID0gaGVscGVycy50b2dnbGVBcnJheUl0ZW0obGlzdCwgaXRlbSk7XG4gIHZhciB1cGRhdGVNYXAgPSB7fTtcbiAgdXBkYXRlTWFwW2xpc3ROYW1lXSA9IHVwZGF0ZWRMaXN0O1xuICB1cGRhdGUodXBkYXRlTWFwKTtcbn07XG5cbnZhciBpbml0ID0gZnVuY3Rpb24obmFtZSkge1xuICBzdGF0ZU1hcC5kYk5hbWUgPSBuYW1lO1xuXG4gIGlmKHR5cGVvZiB3aW5kb3cuU3RvcmFnZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IobnVsbCwgJ0Vycm9yOiBsb2NhbFN0b3JhZ2UgaXMgbm90IHN1cHBvcnRlZC4nLCBub3RpZS5iaW5kKG51bGwsIDMpKTtcbiAgfVxuXG4gIGlmKCFsb2NhbFN0b3JhZ2VbbmFtZV0pIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlW25hbWVdID0gSlNPTi5zdHJpbmdpZnkoZGVmYXVsdE1vZGVsKTtcbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICBoZWxwZXJzLm1ha2VFcnJvcihudWxsLCAnRXJyb3I6IGxvY2FsU3RvcmFnZSBpcyBhIGJyb3dzZXIgZmVhdHVyZSByZXF1ZXN0ZWQgYnkgdGhpcyBhcHBsaWNhdGlvbiBhbmQgaXQgaXMgbm90IHN1cHBvcnRlZCBvciBhdmFpbGFibGUuIEFyZSB1c2luZyBQcml2YXRlIE5hdmlnYXRpb24/Jywgbm90aWUuYmluZChudWxsLCAzKSk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0QWN0aW9uczogYWN0aW9ucyxcbiAgZ2V0RGVmYXVsdFJhdGVzOiBidWRnZXQuZ2V0RGVmYXVsdFJhdGVzLFxuICBnZXRHb2FsczogZ2V0R29hbHMsXG4gIGdldFN1bW1hcnlFeHBlbnNlczogZ2V0U3VtbWFyeUV4cGVuc2VzLFxuICBpbml0OiBpbml0LFxuICByZWFkOiByZWFkLFxuICByZXNldDogcmVzZXQsXG4gIHJlbW92ZTogcmVtb3ZlLFxuICB0b2dnbGVBY3Rpb25zOiB0b2dnbGVMaXN0SXRlbS5iaW5kKG51bGwsICdhY3Rpb25zJyksXG4gIHRvZ2dsZUdvYWw6IHRvZ2dsZUxpc3RJdGVtLmJpbmQobnVsbCwgJ2dvYWxzJyksXG4gIHVwZGF0ZTogdXBkYXRlXG59O1xuIiwiLyoqXG4gKiBBY3Rpb24gZGF0YVxuICogQG1vZHVsZSBhY3Rpb25zXG4gKi9cblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG5cbnZhciBhY3Rpb25zID0ge1xuICBnZW5lcmFsOiBbXG4gICAge1xuICAgICAgaWQ6IDAsXG4gICAgICB0b0RvOiAnVGhpbmcgdG8gZG8nLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnRGV0YWlscycsXG4gICAgICAgICdEZXRhaWxzJyxcbiAgICAgICAgJ0RldGFpbHMnXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1RoaW5nIG5vdCB0byBkbydcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAxLFxuICAgICAgdG9EbzogJ1RoaW5nIHRvIGRvJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ0RldGFpbHMnLFxuICAgICAgICAnRGV0YWlscycsXG4gICAgICAgICdEZXRhaWxzJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdUaGluZyBub3QgdG8gZG8nXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogMixcbiAgICAgIHRvRG86ICdUaGluZyB0byBkbycsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICdEZXRhaWxzJyxcbiAgICAgICAgJ0RldGFpbHMnLFxuICAgICAgICAnRGV0YWlscydcbiAgICAgIF0sXG4gICAgICBub3RUb0RvOiAnVGhpbmcgbm90IHRvIGRvJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDMsXG4gICAgICB0b0RvOiAnVGhpbmcgdG8gZG8nLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnRGV0YWlscycsXG4gICAgICAgICdEZXRhaWxzJyxcbiAgICAgICAgJ0RldGFpbHMnXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1RoaW5nIG5vdCB0byBkbydcbiAgICB9XG4gIF0sXG4gIGNvbGxlZ2U6IFtcbiAgICB7XG4gICAgICBpZDogMCxcbiAgICAgIHRvRG86ICdTdGFydCBhIHRheC1kZWZlcnJlZCBzYXZpbmcgcGxhbicsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICdUYXgtZnJlZSBpbnZlc3RtZW50IGdyb3d0aCBhbmQgdGF4LWZyZWUgd2l0aGRyYXdhbHMgd2lsbCBzYXZlIHlvdSAxMCUgdG8gMzAlIG9uIHRheGVzIHRoYXQgeW91IHdvdWxkIG90aGVyd2lzZSBnaXZlIHRvIHRoZSB0YXggbWFuJyxcbiAgICAgICAgJzUyOSBQbGFuIGZvciBDb2xsZWdlJyxcbiAgICAgICAgJ0NvdmVyZGVsbCBFZHVjYXRpb24gU2F2aW5ncyBBY2NvdW50IChFU0EpIGZvciBLIHRocnUgMTInXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1JlbHkgb24gYSBjb252ZW50aW9uYWwgc2F2aW5ncyBhY2NvdW50J1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDEsXG4gICAgICB0b0RvOiAnQ2FsY3VsYXRlIFlvdXIgQ29sbGVnZSBFeHBlbnNlJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ1VzZSB0aGlzIHJlc291cmNlIHRvIGVzdGltYXRlIGhvdyBtdWNoIHlvdSB3aWxsIG5lZWQ6IDxhIGhyZWY9XFwnaHR0cDovL3d3dy5zYXZpbmdmb3Jjb2xsZWdlLmNvbS9jb2xsZWdlLXNhdmluZ3MtY2FsY3VsYXRvci9pbmRleC5waHBcXCc+Q29sbGVnZSBjb3N0IGNhbGN1bGF0b3I8L2E+J1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdHdWVzcyBvbiBob3cgbXVjaCB5b3Ugd2lsbCBuZWVkLiBDaGFuY2VzIGFyZSBpdCB3aWxsIGJlIG1vcmUgdGhhbiB5b3UgZXhwZWN0ZWQuJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDIsXG4gICAgICB0b0RvOiAnRXN0aW1hdGUgWW91ciBFeHBlY3RlZCBGYW1pbHkgQ29udHJpYnV0aW9uIChFRkMpICcsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICc8YSBocmVmPVxcJ2h0dHBzOi8vZmFmc2EuZWQuZ292L0ZBRlNBL2FwcC9mNGNGb3JtXFwnPkZlZGVyYWwgU3R1ZGVudCBBaWQ8L2E+J1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdBc3N1bWUgdGhhdCBldmVyeW9uZSBwYXlzIHRoZSBzYW1lIGFtb3VudC4nXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogMyxcbiAgICAgIHRvRG86ICdBZGQgdGhlIHNhbWUgYW1vdW50IGV2ZXJ5IHRpbWUgeW91IGdldCBwYWlkJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ1BsYW4gdGhpcyBpbnRvIHlvdXIgYnVkZ2V0LiBVc2UgYXV0b21hdGljIHBheW1lbnRzIGlmIHBvc3NpYmxlJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdCZSBpbmNvbnNpc3RlbnQgd2l0aCB5b3VyIHNhdmluZ3MuIFNsb3cgYW5kIHN0ZWFkeSB3aW5zIHRoZSByYWNlLidcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiA0LFxuICAgICAgdG9EbzogJ1Rha2UgY2xhc3NlcyBmb3IgY29sbGVnZSBjcmVkaXRzIGF0IGEgbG93ZXIgY29zdCBjb21tdW5pdHkgY29sbGVnZScsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICdTYXZlIG1vbmV5IGJ5IHRha2luZyByZXF1aXJlZCBnZW5lcmFsIGVkdWNhdGlvbiBjbGFzcyBhdCBhIGNpdHkgY29sbGVnZScsXG4gICAgICAgICdNYWtlIHN1cmUgY3JlZGl0cyBhcmUgdHJhbnNmZXJhYmxlIGZpcnN0JyxcbiAgICAgICAgJ0FQIGNsYXNzZXMgaW4gaGlnaCBzY2hvb2wgYXJlIGFub3RoZXIgZ3JlYXQgb3B0aW9uJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdBc3N1bWUgdGhhdCBhbGwgb2YgeW91ciBjb3Vyc2Ugd29yayBoYXMgdG8gYmUgYXQgYSA0LXllYXIgaW5zdGl0dXRpb24nXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogNSxcbiAgICAgIHRvRG86ICdBcHBseSB0byBjb2xsZWdlcyB3aXRoIGxhcmdlIGVuZG93bWVudHMnLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnRXhwZW5zaXZlIHByaXZhdGUgY29sbGVnZXMgbWF5IGFjdHVhbGx5IGJlIHRoZSBsZWFzdCBleHBlbnNpdmUgd2hlbiB5b3UgZmFjdG9yIGluIGdlbmVyb3VzIGVuZG93bWVudHMgZm9yIHF1YWxpZmllZCBzdHVkZW50cydcbiAgICAgIF0sXG4gICAgICBub3RUb0RvOiAnQXNzdW1lIHRoYXQgcHJpdmF0ZSBzY2hvb2wgaXMgY2hlYXBlciB0aGFuIHB1YmxpYydcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiA2LFxuICAgICAgdG9EbzogJ0ZpbmQgU2Nob2xhcnNoaXBzJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ0dvIHRvIDxhIGhyZWY9XFwnaHR0cDovL3d3dzIuZWQuZ292L3Byb2dyYW1zL2Z3cy9pbmRleC5odG1sXFwnPkZhc3RXZWIuY29tPC9hPiB0byBmaW5kIHNjaG9sYXJzaGlwcyBhbmQgZXhwbG9yZSB3b3JrLXN0dWR5IHByb2dyYW1zJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdUaGluayB0aGF0IGEgc2Nob2xhcnNoaXAgaXMgdG9vIHNtYWxsIHRvIGFwcGx5IGZvci4gTXVsdGlwbGUgc2Nob2xhcnNoaXBzIGFkZCB1cCdcbiAgICB9XG4gIF0sXG4gIGZ1bmRzOiBbXG4gICAge1xuICAgICAgaWQ6IDAsXG4gICAgICB0b0RvOiAnRGV0ZXJtaW5lIGhvdyBtdWNoIHlvdSBuZWVkJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ0NhbGN1bGF0ZSB5b3VyIG1vbnRobHkgZXhwZW5zZXMgYW5kIHVzZSB0aGlzIGNhbGN1bGF0b3I6IDxhIGhyZWY9XFwnaHR0cDovL3d3dy5tb25leXVuZGVyMzAuY29tL2VtZXJnZW5jeS1mdW5kLWNhbGN1bGF0b3JcXCc+RW1lcmdlbmN5IGZ1bmQgY2FsY3VsYXRvcjwvYT4nXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1VuZGVyZXN0aW1hdGUgd2hhdCB5b3VcXCdsbCBuZWVkIG9yIGhvdyBsb25nIGl0IHdpbGwgdGFrZSB5b3UgdG8gZmluZCBhIG5ldyBqb2IgaWYgeW91IGxvc2UgeW91cnMuJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDEsXG4gICAgICB0b0RvOiAnU2V0dXAgYSBzZXBhcmF0ZSBhY2NvdW50IGV4Y2x1c2l2ZWx5IGZvciB5b3UgRW1lcmdlbmN5IEZ1bmQnLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnS2VlcCB5b3VyIGVtZXJnZW5jeSBmdW5kIHNlcGFyYXRlIGZyb20geW91IGNoZWNraW5nIGFuZCBzYXZpbmcgYWNjb3VudC4gWW91XFwnbGwgdGhpbmsgZGlmZmVyZW50bHkgYWJvdXQgdGhpcyBmdW5kIGlmIGRlZGljYXRlIHRvIGFuIGVtZXJnZW5jeSAoaS5lLiB5b3VcXCdsbCBiZSBsZXNzIGxpa2VseSB0byBzcGVuZCBpdCknXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ0NvLW1pbmdsZSBmdW5kcyB3aXRoIHlvdXIgY2hlY2tpbmcgb3Igc2F2aW5nIGFjY291bnQnXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogMixcbiAgICAgIHRvRG86ICdTdGFydCBub3cgLSBtYWtlIGEgbWludW0gZGVwb3NpdCBvZiAkMjUnLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnVGhpcyBpcyB5b3VyIHNhZmV0eS1uZXQuIFlvdVxcJ2xsIG5lZWQgbW9yZSBsYXRlciBidXQgdGhpcyB3aWxsIGdvIGEgbG9uZyB3YXkgdG93YXJkIGdldHRpbmcgc3RhcnRlZC4nXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1dhaXQgdW50aWwgeW91IGhhdmUgYW4gZW1lcmdlbmN5J1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDMsXG4gICAgICB0b0RvOiAnQWRkIHRoZSBzYW1lIGFtb3VudCBldmVyeSB0aW1lIHlvdSBnZXQgcGFpZCcsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICdNYWtlIHRoaXMgYSBwcmlvcml0eSBiZWZvcmUgYW55IG90aGVyIGZpbmFuY2lhbCBnb2Fscy4gJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdRdWl0IGJlZm9yZSB5b3UgYWNoaWV2ZSB5b3VyIGdvYWwuIENvbnNpc3RhbmN5IGlzIGtleS4nXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogNCxcbiAgICAgIHRvRG86ICdQYXkgeW91cnNlbGYgZmlyc3QnLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnU2V0dXAgZGlyZWN0IGRlcG9zaXQgZm9yIHlvdXIgbW9udGhseSBidWRnZXRlZCBjb250cmlidXRpb24gdG8gdGhpcyBmdW5kJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdBc3N1bWUgeW91XFwnbGwgc3RheSBkaWNpcGxpbmVkIGFmdGVyIHlvdSBzdGFydCBzYXZpbmcuJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDUsXG4gICAgICB0b0RvOiAnQWRkIHdpbmRmYWxscyAocmViYXRlcywgY2FzaCBnaWZ0LCBib251c2VzLCBldGMuKScsXG4gICAgICBkZXRhaWxzOiBbXG5cbiAgICAgIF0sXG4gICAgICBub3RUb0RvOiAnJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDYsXG4gICAgICB0b0RvOiAnTWFrZSBzdXJlIHlvdSBoYXZlIGRpc2FiaWxpdHkgaW5zdXJhbmNlJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ1lvdSBtYXkgYWxyZWFkeSBoYXZlIHRoaXMgdGhyb3VnaCB5b3VyIGVtcGxveWVyLiBJZiBub3QsIGNvbnNpZGVyIGdldHRpbmcgYSBwb2xpY3kgb24geW91ciBvd24uJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdBc3N1bWUgeW91IGFscmVhZHkgaGF2ZSBhIHBvbGljeSBvciB0aGluayB5b3UgZG9uXFwndCBuZWVkIG9uZS4nXG4gICAgfVxuICBdXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGdvYWwpIHtcbiAgaWYodHlwZW9mIGdvYWwgIT09ICdzdHJpbmcnKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGdvYWwpO1xuICB9XG5cbiAgcmV0dXJuIGFjdGlvbnNbZ29hbF07XG59O1xuIiwiLyoqXG4gKiBCdWRnZXQgYnkgSW5jb21lXG4gKi9cblxudmFyIGdldERlZmF1bHRSYXRlcyA9IGZ1bmN0aW9uKGluY29tZSwgaXNEZXRhaWxlZCkge1xuICBpZih0eXBlb2YgaW5jb21lICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBFcnJvcignZ2V0RGVmYXVsdFJhdGVzKCk6IHdyb25nIHBhcmFtOiAnICsgSlNPTi5zdHJpbmdpZnkoaW5jb21lKSk7XG4gIH1cblxuICB2YXIgcmF0ZXM7XG5cbiAgaWYoaW5jb21lIDwgNTAwMCkge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDQ2LFxuICAgICAgZGlzY3JldGlvbmFyeTogNTIsXG4gICAgICBzYXZpbmdzOiAyLFxuICAgICAgZGV0YWlsZWQ6IFsxMCwgNiwgMjYsIDUsIDEwLCA0LCAxNCwgNywgNSwgNywgNF1cbiAgICB9O1xuICB9IGVsc2UgaWYgKGluY29tZSA8IDEwZTMpIHtcbiAgICByYXRlcyA9IHtcbiAgICAgIGJhc2ljOiA0OCxcbiAgICAgIGRpc2NyZXRpb25hcnk6IDUxLFxuICAgICAgc2F2aW5nczogMSxcbiAgICAgIGRldGFpbGVkOiBbMTEsIDYsIDI3LCA2LCAxMCwgMywgMTUsIDYsIDUsIDQsIDZdXG4gICAgfTtcbiAgfSBlbHNlIGlmIChpbmNvbWUgPCAxNWUzKSB7XG4gICAgcmF0ZXMgPSB7XG4gICAgICBiYXNpYzogNDcsXG4gICAgICBkaXNjcmV0aW9uYXJ5OiA1MCxcbiAgICAgIHNhdmluZ3M6IDMsXG4gICAgICBkZXRhaWxlZDogWzExLCA1LCAyNSwgNiwgMTEsIDMsIDE2LCA4LCA1LCA0LCAzXVxuICAgIH07XG4gIH0gZWxzZSBpZiAoaW5jb21lIDwgMjBlMykge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDQzLFxuICAgICAgZGlzY3JldGlvbmFyeTogNTEsXG4gICAgICBzYXZpbmdzOiA2LFxuICAgICAgZGV0YWlsZWQ6IFsxMCwgNiwgMjMsIDYsIDEwLCAzLCAxNSwgMTAsIDUsIDIsIDRdXG4gICAgfTtcbiAgfSBlbHNlIGlmIChpbmNvbWUgPCAzMGUzKSB7XG4gICAgcmF0ZXMgPSB7XG4gICAgICBiYXNpYzogNDEsXG4gICAgICBkaXNjcmV0aW9uYXJ5OiA1MixcbiAgICAgIHNhdmluZ3M6IDcsXG4gICAgICBkZXRhaWxlZDogWzksIDYsIDIyLCA2LCAxMCwgMywgMTgsIDEwLCA1LCAxLCAzXVxuICAgIH07XG4gIH0gZWxzZSBpZiAoaW5jb21lIDwgNDBlMykge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDM5LFxuICAgICAgZGlzY3JldGlvbmFyeTogNTEsXG4gICAgICBzYXZpbmdzOiAxMCxcbiAgICAgIGRldGFpbGVkOiBbOSwgNSwgMjEsIDYsIDksIDQsIDE3LCA5LCA1LCAxLCA0XVxuICAgIH07XG4gIH0gZWxzZSBpZiAoaW5jb21lIDwgNTBlMykge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDM3LFxuICAgICAgZGlzY3JldGlvbmFyeTogNTQsXG4gICAgICBzYXZpbmdzOiA5LFxuICAgICAgZGV0YWlsZWQ6IFs4LCA1LCAyMCwgNiwgOSwgNCwgMTksIDksIDUsIDEsIDVdXG4gICAgfTtcbiAgfSBlbHNlIGlmIChpbmNvbWUgPCA3MGUzKSB7XG4gICAgcmF0ZXMgPSB7XG4gICAgICBiYXNpYzogMzUsXG4gICAgICBkaXNjcmV0aW9uYXJ5OiA1MixcbiAgICAgIHNhdmluZ3M6IDEzLFxuICAgICAgZGV0YWlsZWQ6IFs4LCA1LCAxOSwgNiwgOCwgMywgMTksIDksIDUsIDEsIDRdXG4gICAgfTtcbiAgfSBlbHNlIGlmIChpbmNvbWUgPj0gNzBlMykge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDMxLFxuICAgICAgZGlzY3JldGlvbmFyeTogNTIsXG4gICAgICBzYXZpbmdzOiAxNyxcbiAgICAgIGRldGFpbGVkOiBbNiwgNSwgMTgsIDcsIDYsIDMsIDE3LCA3LCA2LCAzLCA0XVxuICAgIH07XG4gIH1cblxuICBpZighaXNEZXRhaWxlZCkge1xuICAgIGRlbGV0ZSByYXRlcy5kZXRhaWxlZDtcbiAgfVxuXG4gIHJldHVybiByYXRlcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXREZWZhdWx0UmF0ZXM6IGdldERlZmF1bHRSYXRlc1xufTtcbiIsInZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xuXG52YXIgZ29hbHNMaXN0ID0gW1xuICB7XG4gICAgaWQ6ICdjb2xsZWdlJyxcbiAgICB0aXRsZTogJ1NhdmUgZm9yIGNvbGxlZ2UnLFxuICAgIGRhdGU6ICdKYW51YXJ5IDIwMTcnLFxuICAgIHByb2JhYmlsaXR5OiAnNTAlJ1xuICB9LFxuICB7XG4gICAgaWQ6ICdob21lJyxcbiAgICB0aXRsZTogJ0J1eSBhIGhvbWUnLFxuICAgIGRhdGU6ICdKYW51YXJ5IDIwMTcnLFxuICAgIHByb2JhYmlsaXR5OiAnNTAlJ1xuICB9LFxuICB7XG4gICAgaWQ6ICdjYXInLFxuICAgIHRpdGxlOiAnU2F2ZSBmb3IgY2FyJyxcbiAgICBkYXRlOiAnSmFudWFyeSAyMDE3JyxcbiAgICBwcm9iYWJpbGl0eTogJzUwJSdcbiAgfSxcbiAge1xuICAgIGlkOiAnZnVuZHMnLFxuICAgIHRpdGxlOiAnRW1lcmdlbmN5IGZ1bmRzJyxcbiAgICBkYXRlOiAnSmFudWFyeSAyMDE3JyxcbiAgICBwcm9iYWJpbGl0eTogJzUwJSdcbiAgfSxcbiAge1xuICAgIGlkOiAnY2FyZHMnLFxuICAgIHRpdGxlOiAnUGF5LWRvd24gQ3JlZGl0IENhcmRzJyxcbiAgICBkYXRlOiAnSmFudWFyeSAyMDE3JyxcbiAgICBwcm9iYWJpbGl0eTogJzUwJSdcbiAgfSxcbiAge1xuICAgIGlkOiAncmV0aXJlJyxcbiAgICB0aXRsZTogJ1JldGlyZScsXG4gICAgZGF0ZTogJ0phbnVhcnkgMjAxNycsXG4gICAgcHJvYmFiaWxpdHk6ICc1MCUnXG4gIH1cbl07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaWQpIHtcbiAgaWYoaWQgJiYgKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGlkKTtcbiAgfVxuXG4gIGlmKGlkKSB7XG4gICAgcmV0dXJuIGdvYWxzTGlzdC5maW5kKGZ1bmN0aW9uKGdvYWwpIHtcbiAgICAgIHJldHVybiBnb2FsLmlkID09PSBpZDtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBnb2Fsc0xpc3Q7XG59O1xuIiwiLyoqXG4gKiBQUk9UT1RZUEUgRlVOQ1RJT05TXG4gKi9cblxuLy8gQWxsb3cgZm9yIGxvb3Bpbmcgb24gbm9kZXMgYnkgY2hhaW5pbmcgYW5kIHVzaW5nIGZvckVhY2ggb24gYm90aCBOb2RlbGlzdHMgYW5kIEhUTUxDb2xsZWN0aW9uc1xuLy8gcXNhKCcuZm9vJykuZm9yRWFjaChmdW5jdGlvbiAoKSB7fSlcbk5vZGVMaXN0LnByb3RvdHlwZS5mb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG5IVE1MQ29sbGVjdGlvbi5wcm90b3R5cGUuZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoO1xuXG4vKipcbiAqIFNob3J0Y3V0IGZvciBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lLCByZXR1cm5zIHRoZSBmaXJzdCBmb3VuZCBlbGVtZW50IG9mIHRoZVxuICogSFRNTENvbGxlY3Rpb25cbiAqIEBwYXJhbSAge3N0cmluZ30gY2xhc3NOYW1lIENsYXNzIG5hbWVcbiAqIEBwYXJhbSAge251bWJlcn0gW2luZGV4XSBIVE1MQ29sbGVjdGlvbiBpbmRleCBvZiB0aGUgZWxlbWVudCB0byByZXR1cm5cbiAqIEByZXR1cm4ge0VsZW1lbnR9XG4gKi9cbkVsZW1lbnQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGNsYXNzTmFtZSwgaW5kZXgpIHtcbiAgaWYoICh0eXBlb2YgY2xhc3NOYW1lICE9PSAnc3RyaW5nJykgfHwgKGluZGV4ICYmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSkgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBjbGFzc05hbWUgb3IgaW5kZXgnKTtcbiAgfVxuXG4gIGluZGV4ID0gaW5kZXggfHwgMDtcblxuICByZXR1cm4gdGhpcy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNsYXNzTmFtZSlbaW5kZXhdO1xufTtcblxuRWxlbWVudC5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gIGlmKHR5cGVvZiBjbGFzc05hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBjbGFzc05hbWUnKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xhc3NOYW1lKTtcbn07XG5cbmRvY3VtZW50LmdldCA9IEVsZW1lbnQucHJvdG90eXBlLmdldDtcbmRvY3VtZW50LmdldEFsbCA9IEVsZW1lbnQucHJvdG90eXBlLmdldEFsbDtcblxuaWYgKEVsZW1lbnQgJiYgIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgdmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG4gIHByb3RvLm1hdGNoZXMgPSBwcm90by5tYXRjaGVzU2VsZWN0b3IgfHxcbiAgICBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICBwcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fFxuICAgIGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgbWF0Y2hlcyA9ICh0aGlzLmRvY3VtZW50IHx8IHRoaXMub3duZXJEb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICB2YXIgaSA9IG1hdGNoZXMubGVuZ3RoO1xuICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gdGhpcykgO1xuICAgICAgcmV0dXJuIGkgPiAtMTtcbiAgICB9O1xufVxuXG4vKlxuICogSW1wbGVtZW50cyB0aGUgRUNNQVNjcmlwdCAyMDE1ICdmaW5kJyBmdW5jdGlvbiBpbiBBcnJheXNcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbmRcbiAqIEBwYXJhbSAge2Z1bmN0aW9ufSAhQXJyYXkucHJvdG90eXBlLmZpbmQgRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBlYWNoIHZhbHVlIGluIHRoZSBhcnJheVxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5pZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gIEFycmF5LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgaWYgKHRoaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LnByb3RvdHlwZS5maW5kIGNhbGxlZCBvbiBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICB2YXIgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIHZhbHVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG59XG5cbi8vVGhlIE9iamVjdC5hc3NpZ24oKSBtZXRob2QgaXMgdXNlZCB0byBjb3B5IHRoZSB2YWx1ZXMgb2YgYWxsIGVudW1lcmFibGUgb3duXG4vL3Byb3BlcnRpZXMgZnJvbSBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byBhIHRhcmdldCBvYmplY3QuIEl0IHdpbGwgcmV0dXJuXG4vL3RoZSB0YXJnZXQgb2JqZWN0LlxuaWYgKHR5cGVvZiBPYmplY3QuYXNzaWduICE9ICdmdW5jdGlvbicpIHtcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICBPYmplY3QuYXNzaWduID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dHB1dCA9IE9iamVjdCh0YXJnZXQpO1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgIGlmIChzb3VyY2UgIT09IHVuZGVmaW5lZCAmJiBzb3VyY2UgIT09IG51bGwpIHtcbiAgICAgICAgICBmb3IgKHZhciBuZXh0S2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShuZXh0S2V5KSkge1xuICAgICAgICAgICAgICBvdXRwdXRbbmV4dEtleV0gPSBzb3VyY2VbbmV4dEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG4gIH0pKCk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB2aWV3c05hbWVzID0gW1xuICAnYWJvdXQnLFxuICAnZXhwZW5zZXMnLFxuICAnY29tcGFyaXNvbicsXG4gICdzY2VuYXJpb3MnLFxuICAnZ29hbCcsXG4gICdwbGFuJyxcbiAgJ3JlbWluZGVycydcbl07XG52YXIgdmlld3MgPSBbXG4gIHJlcXVpcmUoJy4vdmlld3MvYWJvdXQnKSxcbiAgcmVxdWlyZSgnLi92aWV3cy9leHBlbnNlcycpLFxuICByZXF1aXJlKCcuL3ZpZXdzL2NvbXBhcmlzb24nKSxcbiAgcmVxdWlyZSgnLi92aWV3cy9zY2VuYXJpb3MnKSxcbiAgcmVxdWlyZSgnLi92aWV3cy9nb2FsJyksXG4gIHJlcXVpcmUoJy4vdmlld3MvcGxhbicpLFxuICByZXF1aXJlKCcuL3ZpZXdzL3JlbWluZGVycycpLFxuICByZXF1aXJlKCcuL3ZpZXdzL25hdicpLFxuICByZXF1aXJlKCcuL3ZpZXdzL2NvbnRpbnVlJylcbl07XG5cbnZhciBnZXRWaWV3cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdmlld3M7XG59O1xuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2aWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcsIGluZGV4KSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGluZGV4IDwgNz8gZG9jdW1lbnQuZ2V0KCdzdGVwLS0nICsgdmlld3NOYW1lc1tpbmRleF0pIDogbnVsbDtcbiAgICB2aWV3LnNldFN0YXRlTWFwKGNvbnRhaW5lcik7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGluaXQsXG4gIGdldFZpZXdzOiBnZXRWaWV3c1xufTsiLCIvKipcbiAqIFNjcmVlbiAjMiAtIEFib3V0IG1vZHVsZVxuICogQG1vZHVsZSBhYm91dFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG52YXIgZG9tSGVscGVycyA9IHJlcXVpcmUoJy4uL2RvbS1oZWxwZXJzJyk7XG52YXIgd051bWIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd051bWInXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dOdW1iJ10gOiBudWxsKTtcblxudmFyIHN0YXRlTWFwID0ge1xuICBhZ2VTbGlkZXI6IG51bGwsXG4gIGluY29tZVNsaWRlcjogbnVsbCxcbiAgc2l0dWF0aW9uOiBudWxsLFxuICBsaXZpbmc6IG51bGxcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gRE9NIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbnZhciBzaG93U2xpZGVycyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGFnZSA9IGRhdGEuYWdlO1xuICB2YXIgaW5jb21lID0gZGF0YS5pbmNvbWU7XG5cbiAgaWYoIWFnZSB8fCAhaW5jb21lKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgdmFyIGFnZU9wdGlvbnMgPSB7XG4gICAgc3RhcnQ6IGFnZSxcbiAgICBzdGVwOiAxLFxuICAgIHJhbmdlOiB7XG4gICAgICAnbWluJzogMTgsXG4gICAgICAnbWF4JzogNjVcbiAgICB9LFxuICAgIHBpcHM6IHtcbiAgICAgIG1vZGU6ICd2YWx1ZXMnLFxuICAgICAgdmFsdWVzOiBbMjAsIDMwLCA0MCwgNTAsIDYwLCA2NV0sXG4gICAgICBkZW5zaXR5OiA1XG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAwXG4gICAgfSlcbiAgfTtcbiAgdmFyIGluY29tZU9wdGlvbnMgPSB7XG4gICAgc3RhcnQ6IGluY29tZSxcbiAgICBzdGVwOiAxMDAwLFxuICAgIHJhbmdlOiB7XG4gICAgICAnbWluJzogMTgwMDAsXG4gICAgICAnbWF4JzogMjAwMDAwXG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAxLFxuICAgICAgdGhvdXNhbmQ6ICcsJ1xuICAgIH0pXG4gIH07XG5cbiAgZG9tSGVscGVycy5jcmVhdGVTbGlkZXIoc3RhdGVNYXAuYWdlU2xpZGVyLCBhZ2VPcHRpb25zKTtcbiAgZG9tSGVscGVycy5jcmVhdGVTbGlkZXIoc3RhdGVNYXAuaW5jb21lU2xpZGVyLCBpbmNvbWVPcHRpb25zLCAnJCcpO1xufTtcblxudmFyIHNldFNlbGVjdHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBzaXR1YXRpb24gPSBkYXRhLnNpdHVhdGlvbjtcbiAgdmFyIGxpdmluZyA9IGRhdGEubGl2aW5nO1xuXG4gIGlmKCFzaXR1YXRpb24gfHwgIWxpdmluZykge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHN0YXRlTWFwLnNpdHVhdGlvbi52YWx1ZSA9IHNpdHVhdGlvbjtcbiAgc3RhdGVNYXAubGl2aW5nLnZhbHVlID0gbGl2aW5nO1xufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBQVUJMSUMgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogVXNlZCBieSBzaGVsbCB0byBiaW5kIGV2ZW50IGhhbmRsZXJzIHRvIHRoaXMgbW9kdWxlIERPTSBldmVudHMuIEl0IHVzdWFsbHlcbiAqIG1lYW5zIHRoYXQgd2Ugd2FudCB0aGUgc2hlbGwgdG8gdXBkYXRlIG1vZGVsIHdoZW4gdXNlciBpbnRlcmFjdHMgd2l0aCB0aGlzXG4gKiBzY3JlZW4uXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGV2ZW50IEV2ZW50IG5hbWVcbiAqIEBwYXJhbSAge2Z1bmN0aW9ufSBoYW5kbGVyIEV2ZW50IGhhbmRsZXJcbiAqL1xudmFyIGJpbmQgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICBzd2l0Y2goZXZlbnQpIHtcbiAgICBjYXNlICdhZ2VDaGFuZ2VkJzpcbiAgICAgIHN0YXRlTWFwLmFnZVNsaWRlci5ub1VpU2xpZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaGFuZGxlcihOdW1iZXIodmFsdWVzWzBdKSk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2luY29tZUNoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuaW5jb21lU2xpZGVyLm5vVWlTbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBoYW5kbGVyKE51bWJlcih2YWx1ZXNbMF0ucmVwbGFjZSgnLCcsICcnKSkpO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaXR1YXRpb25DaGFuZ2VkJzpcbiAgICAgIHN0YXRlTWFwLnNpdHVhdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBoYW5kbGVyKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xpdmluZ0NoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAubGl2aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGhhbmRsZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufTtcblxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKGNtZCwgZGF0YSkge1xuICBzd2l0Y2goY21kKSB7XG4gICAgY2FzZSAnc2hvd1NsaWRlcnMnOlxuICAgICAgc2hvd1NsaWRlcnMoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZXRTZWxlY3RzJzpcbiAgICAgIHNldFNlbGVjdHMoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5lcnJvcignTm8gY29tbWFuZCBmb3VuZC4nKTtcbiAgICAgIHJldHVybjtcbiAgfVxufTtcblxudmFyIHNldFN0YXRlTWFwID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gIHN0YXRlTWFwLmFnZVNsaWRlciA9IGNvbnRhaW5lci5nZXQoJ2FnZV9fc2xpZGVyJyk7XG4gIHN0YXRlTWFwLmluY29tZVNsaWRlciA9IGNvbnRhaW5lci5nZXQoJ2luY29tZV9fc2xpZGVyJyk7XG4gIHN0YXRlTWFwLnNpdHVhdGlvbiA9IGNvbnRhaW5lci5nZXQoJ3NlbGVjdCcpO1xuICBzdGF0ZU1hcC5saXZpbmcgPSBjb250YWluZXIuZ2V0KCdzZWxlY3QnLCAxKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kOiBiaW5kLFxuICBzZXRTdGF0ZU1hcDogc2V0U3RhdGVNYXAsXG4gIHJlbmRlcjogcmVuZGVyXG59O1xuIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG52YXIgQ2hhcnRpc3QgPSByZXF1aXJlKCdjaGFydGlzdCcpO1xuXG52YXIgc3RhdGVNYXAgPSB7XG4gIGNoYXJ0V3JhcHBlcjogbnVsbCxcbiAgY2hhcnQ6IG51bGxcbn07XG5cblxudmFyIHNob3dEZXRhaWxlZENoYXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgdXNlckV4cGVuc2VzID0gaGVscGVycy5yZXZlcnNlKGRhdGEudXNlckV4cGVuc2VzKTtcbiAgdmFyIG90aGVyc0V4cGVuc2VzID0gaGVscGVycy5yZXZlcnNlKGRhdGEub3RoZXJzRXhwZW5zZXMpO1xuXG4gIGlmKCFBcnJheS5pc0FycmF5KHVzZXJFeHBlbnNlcykgfHwgIUFycmF5LmlzQXJyYXkob3RoZXJzRXhwZW5zZXMpKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgLy9JZiB1c2VyIGhhcyBub3QgZW50ZXJlZCBkZXRhaWxlZCBleHBlbnNlcyB5ZXRcbiAgaWYodXNlckV4cGVuc2VzLmxlbmd0aCA9PSAwKSB7XG4gICAgdXNlckV4cGVuc2VzID0gb3RoZXJzRXhwZW5zZXM7XG4gIH0gZWxzZSB7XG4gICAgc3RhdGVNYXAuY2hhcnRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ3Nob3ctY2hhcnQnKTtcbiAgfVxuXG4gIHZhciBjaGFydERhdGEgPSB7XG4gICAgbGFiZWxzOiBbJ01pc2NlbGxhbmVvdXMnLCAnRWR1Y2F0aW9uJywgJ0VudGVydGFpbm1lbnQgJiBSZWFkaW5nJywgJ0hlYWx0aGNhcmUnLCAnVHJhc3BvcnRhdGlvbicsICdBcHBhcmVsICYgc2VydmljZXMnLCAnVXRpbGl0aWVzLCBmdWVscywgcHVibGljIHNlcnZpY2VzJywgJ01pc2MgSG91c2luZyBSZWxhdGVkJywgJ0hvdXNpbmcnLCAnRm9vZCBhd2F5IGZyb20gaG9tZScsICdGb29kIGF0IGhvbWUnXSxcbiAgICBzZXJpZXM6IFtcbiAgICAgIHVzZXJFeHBlbnNlcyxcbiAgICAgIG90aGVyc0V4cGVuc2VzXG4gICAgXVxuICB9O1xuICB2YXIgY2hhcnRPcHRpb25zID0gIHtcbiAgICBheGlzWToge1xuICAgICAgb2Zmc2V0OiAxMDBcbiAgICB9LFxuICAgIGF4aXNYOiB7XG4gICAgICBsYWJlbE9mZnNldDoge1xuICAgICAgICB4OiAtNyxcbiAgICAgICAgeTogMFxuICAgICAgfVxuICAgIH0sXG4gICAgc2VyaWVzQmFyRGlzdGFuY2U6IDEwLFxuICAgIGhvcml6b250YWxCYXJzOiB0cnVlXG4gIH07XG4gIHN0YXRlTWFwLmNoYXJ0ID0gbmV3IENoYXJ0aXN0LkJhcignLmRldGFpbGVkLWNoYXJ0JywgY2hhcnREYXRhLCBjaGFydE9wdGlvbnMpO1xufTtcblxuLy9Gb3Igbm93IGl0J3MgdXNlZCBvbmx5IHdoZW4gdXNlciBjaGFuZ2VzIGhpcyBleHBlbnNlcyBhbmQgbm90IGZvciAnaW5jb21lXG4vL2NoYW5nZXMvZGVmYXVsdCBleHBlbnNlcyBjaGFuZ2VzJyBzaW5jZSB0aGV5IGFyZSBkZWFsdCB3aXRoIHNob3dEZXRhaWxlZENoYXJ0KClcbnZhciB1cGRhdGVEZXRhaWxlZENoYXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgdXNlckV4cGVuc2VzID0gaGVscGVycy5yZXZlcnNlKGRhdGEudXNlckV4cGVuc2VzKTtcblxuICBpZighQXJyYXkuaXNBcnJheSh1c2VyRXhwZW5zZXMpKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgc3RhdGVNYXAuY2hhcnRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ3Nob3ctY2hhcnQnKTtcbiAgc3RhdGVNYXAuY2hhcnQuZGF0YS5zZXJpZXNbMF0gPSB1c2VyRXhwZW5zZXM7XG4gIHN0YXRlTWFwLmNoYXJ0LnVwZGF0ZSgpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUFVCTElDIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oY21kLCBkYXRhKSB7XG4gIHN3aXRjaChjbWQpIHtcbiAgICBjYXNlICdzaG93RGV0YWlsZWRDaGFydCc6XG4gICAgICBzaG93RGV0YWlsZWRDaGFydChkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VwZGF0ZURldGFpbGVkQ2hhcnQnOlxuICAgICAgdXBkYXRlRGV0YWlsZWRDaGFydChkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmVycm9yKCdObyBjb21tYW5kIGZvdW5kLicpO1xuICAgICAgcmV0dXJuO1xuICB9XG59O1xuXG52YXIgc2V0U3RhdGVNYXAgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgc3RhdGVNYXAuY2hhcnRXcmFwcGVyID0gY29udGFpbmVyLmdldCgnYWR2YW5jZWQtY29tcGFyaXNvbicpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlbmRlcjogIHJlbmRlcixcbiAgc2V0U3RhdGVNYXA6IHNldFN0YXRlTWFwXG59O1xuIiwiLyoqXG4gKiBTY3JlZW4gIzUgLSBQeXJhbWlkIG1vZHVsZVxuICogQG1vZHVsZSA1LVB5cmFtaWRcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xudmFyIHdOdW1iID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dOdW1iJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3TnVtYiddIDogbnVsbCk7XG52YXIgQ2hhcnRpc3QgPSByZXF1aXJlKCdjaGFydGlzdCcpO1xudmFyIGRldGFpbHMgPSByZXF1aXJlKCcuL2NvbXBhcmlzb24tZGV0YWlscycpO1xuXG52YXIgc3RhdGVNYXAgPSB7XG4gIGluY29tZTogbnVsbCxcbiAgYnVkZ2V0OiB7fSxcbiAgb3RoZXJzOiB7fSxcbiAgYmFyQ2hhcnQ6IG51bGwsXG4gIGNvbmNsdXNpb246IG51bGxcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIERBVEEgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIENvcGllcyB0aGUgYWN0dWFsIHZhbHVlcyBvZiB0aGUgc3VtbWFyeSBpbnRvIGEgbmV3IG9iamVjdCB3aG9zZSBrZXkgbmFtZXNcbiAqIGFyZSBuZWVkZWQgdG8gYmUgJ2Jhc2ljJywgJ2Rpc2NyZXRpb25hcnknIGFuZCAnc2F2aW5ncycuXG4gKiBAcGFyYW0gIHtvYmplY3R9IHZhbHVlcyBDYXRlZ29yeSB2YWx1ZXMgb2YgdGhlIHN1bW1hcnlcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xudmFyIG1hcEFjdHVhbFZhbHVlcyA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICByZXR1cm4ge1xuICAgIGJhc2ljOiB2YWx1ZXMuYmFzaWNOZWVkcyxcbiAgICBkaXNjcmV0aW9uYXJ5OiB2YWx1ZXMuZGlzY3JldGlvbmFyeUV4cGVuc2VzLFxuICAgIHNhdmluZ3M6IHZhbHVlcy5hbm51YWxTYXZpbmdzXG4gIH07XG59O1xuXG52YXIgbW9uZXlGb3JtYXQgPSB3TnVtYih7XG4gIHRob3VzYW5kOiAnLCcsXG4gIHByZWZpeDogJyQgJ1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gRE9NIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IG1hcCBvZiB0aGUgRE9NIGVsZW1lbnRzIHdoaWNoIGRpc3BsYXlzIHRoZSBjYXRlZ29yaWVzXG4gKiBAcGFyYW0gIHtPYmplY3QuRE9NfSBjb250YWluZXIgRE9NIENvbnRhaW5lclxuICogQHBhcmFtICB7c3RyaW5nfSB3aG8gdXNlciBidWRnZXQgb3Igb3RoZXJzXG4gKiBAcGFyYW0gIHthcnJheX0gY2F0ZWdvcmllcyBBcnJheSBvZiBuYW1lcyBvZiBjYXRlZ29yaWVzXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cbnZhciBnZXRTdW1tYXJ5RE9NID0gZnVuY3Rpb24oY29udGFpbmVyLCB3aG8sIGNhdGVnb3JpZXMpIHtcbiAgdmFyIGRvbU1hcCA9IHt9O1xuICB3aG8gPSAnLicgKyB3aG87XG5cbiAgLy9UaGUgbGV2ZXJhZ2UgSFRNTCBFbGVtZW50cyB3aGljaCBjYW4gYmUgc2VsZWN0ZWQgd2l0aCBhIGNsYXNzTmFtZSBsaWtlXG4gIC8vJy5idWRnZXRfX2NhdGVnb3J5LS1iYXNpYyAuYnVkZ2V0X19jYXRlZ29yeV9fdmFsdWUnXG4gIGNhdGVnb3JpZXMuZm9yRWFjaChmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIHZhciBodG1sQ2xhc3MgPSB3aG8gKyAnX19jYXRlZ29yeS0tJyArIGNhdGVnb3J5ICsgJyAnICsgd2hvICsgJ19fY2F0ZWdvcnlfX3ZhbHVlJztcbiAgICBkb21NYXBbY2F0ZWdvcnldID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoaHRtbENsYXNzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRvbU1hcDtcbn07XG5cbnZhciB1cGRhdGVUZXh0Q29udGVudCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHRleHQpIHtcbiAgZWxlbWVudC50ZXh0Q29udGVudCA9IHRleHQ7XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIHRleHQgZm9yIHVzZXIgJiBvdGhlcnMgc3VtbWFyeSBjYXRlZ29yaWVzLCB3aXRoIHRoZSByYXRlcyBhbmRcbiAqIGFjdHVhbCB2YWx1ZXMuXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRvbU1hcCAgICAgICBPYmplY3Qgd2l0aCB0aGUgRE9NIG5vZGVzIGZvciBiYXNpYywgZGlzY3JldGlvbmFyeVxuICogYW5kIHNhdmluZ3NcbiAqIEBwYXJhbSAge29iamVjdH0gYWN0dWFsVmFsdWVzIE9iamVjdCB3aXRoIHRoZSBhY3R1YWwgdmFsdWVzIGZvciBlYWNoIGNhdGVnb3J5XG4gKiBAcGFyYW0gIHtvYmplY3R9IHJhdGVzICAgICAgICBPYmplY3Qgd2l0aCB0aGUgcmF0ZXMgZm9yIGVhY2ggY2F0ZWdvcnlcbiAqIEBleGFtcGxlXG4gKiB1cGRhdGVTdW1tYXJ5KFxuICogICB7XG4gKiAgICAgYmFzaWM6IEhUTUxOb2RlLFxuICogICAgIGRpc2NyZXRpb25hcnk6IEhUTUxOb2RlLFxuICogICAgIHNhdmluZ3M6IEhUTUxOb2RlXG4gKiAgIH0sXG4gKiAgIHtcbiAqICAgICBiYXNpYzogMjAwMDAsXG4gKiAgICAgZGlzY3JldGlvbmFyeTogMTMwMDAsXG4gKiAgICAgc2F2aW5nczogODAwMFxuICogICB9LFxuICogICB7XG4gKiAgICAgYmFzaWM6IDQ1LFxuICogICAgIGRpc2NyZXRpb25hcnk6IDM1LFxuICogICAgIHNhdmluZ3M6IDIwXG4gKiAgIH1cbiAqICApXG4gKi9cbnZhciB1cGRhdGVTdW1tYXJ5ID0gZnVuY3Rpb24oZG9tTWFwLCBhY3R1YWxWYWx1ZXMsIHJhdGVzKSB7XG4gIE9iamVjdC5rZXlzKGRvbU1hcCkuZm9yRWFjaChmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIHVwZGF0ZVRleHRDb250ZW50KFxuICAgICAgZG9tTWFwW2NhdGVnb3J5XS5xdWVyeVNlbGVjdG9yKCcuYWN0dWFsJyksXG4gICAgICBtb25leUZvcm1hdC50byhhY3R1YWxWYWx1ZXNbY2F0ZWdvcnldKVxuICAgICk7XG4gICAgdXBkYXRlVGV4dENvbnRlbnQoXG4gICAgICBkb21NYXBbY2F0ZWdvcnldLnF1ZXJ5U2VsZWN0b3IoJy5yYXRlJyksXG4gICAgICBoZWxwZXJzLmZvcm1hdChyYXRlc1tjYXRlZ29yeV0sICclJylcbiAgICApO1xuICB9KTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFJFTkRFUiBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIHNob3dTdW1tYXJ5Q2hhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciB1c2VyID0gZGF0YS51c2VyO1xuICB2YXIgb3RoZXJzID0gZGF0YS5vdGhlcnM7XG5cbiAgaWYoXG4gICAgIWhlbHBlcnMuaXNOdW1iZXIodXNlci5iYXNpY1JhdGUgKyB1c2VyLmRpc2NSYXRlICsgdXNlci5zYXZpbmdzUmF0ZSkgfHxcbiAgICAhaGVscGVycy5pc051bWJlcihvdGhlcnMuYmFzaWMgKyBvdGhlcnMuZGlzY3JldGlvbmFyeSArIG90aGVycy5zYXZpbmdzKVxuICApIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICB2YXIgY2hhcnREYXRhID0ge1xuICAgIGxhYmVsczogWydCYXNpYyBOZWVkcycsICdEaXNjcmV0aW9uYXJ5IEV4cGVuc2VzJywgJ1NhdmluZ3MnXSxcbiAgICBzZXJpZXM6IFtcbiAgICAgIFt1c2VyLmJhc2ljUmF0ZSwgdXNlci5kaXNjUmF0ZSwgdXNlci5zYXZpbmdzUmF0ZV0sXG4gICAgICBbb3RoZXJzLmJhc2ljLCBvdGhlcnMuZGlzY3JldGlvbmFyeSwgb3RoZXJzLnNhdmluZ3NdXG4gICAgXVxuICB9O1xuICB2YXIgY2hhcnRPcHRpb25zID0ge1xuICAgIHNlcmllc0JhckRpc3RhbmNlOiAyMlxuICB9O1xuXG4gIHN0YXRlTWFwLmJhckNoYXJ0ID0gbmV3IENoYXJ0aXN0LkJhcignLmNvbXBhcmlzb24tY2hhcnQnLCBjaGFydERhdGEsIGNoYXJ0T3B0aW9ucyk7XG59O1xuXG52YXIgc2hvd1VzZXJFeHBlbnNlcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGluY29tZSA9IGRhdGEuaW5jb21lIHx8IDA7XG4gIHZhciBiYXNpY1JhdGUgPSBkYXRhLmJhc2ljUmF0ZTtcbiAgdmFyIGRpc2NSYXRlID0gZGF0YS5kaXNjUmF0ZTtcbiAgdmFyIHNhdmluZ3NSYXRlID0gZGF0YS5zYXZpbmdzUmF0ZTtcblxuICBpZih0eXBlb2YgKGluY29tZSArIGJhc2ljUmF0ZSArIGRpc2NSYXRlICsgc2F2aW5nc1JhdGUpICE9PSAnbnVtYmVyJykge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHZhciBhY3R1YWxWYWx1ZXMgPSBtYXBBY3R1YWxWYWx1ZXMoXG4gICAgaGVscGVycy52YWx1ZXNPZlN1bW1hcnkoaW5jb21lLCBiYXNpY1JhdGUsIGRpc2NSYXRlLCBzYXZpbmdzUmF0ZSlcbiAgKTtcbiAgdmFyIGJ1ZGdldFJhdGVzID0ge1xuICAgIGJhc2ljOiBiYXNpY1JhdGUsXG4gICAgZGlzY3JldGlvbmFyeTogZGlzY1JhdGUsXG4gICAgc2F2aW5nczogc2F2aW5nc1JhdGVcbiAgfTtcblxuICBpZihpbmNvbWUpIHtcbiAgICB1cGRhdGVUZXh0Q29udGVudChzdGF0ZU1hcC5pbmNvbWUsIG1vbmV5Rm9ybWF0LnRvKGluY29tZSkpO1xuICB9XG4gIHVwZGF0ZVN1bW1hcnkoc3RhdGVNYXAuYnVkZ2V0LCBhY3R1YWxWYWx1ZXMsIGJ1ZGdldFJhdGVzKTtcbn07XG5cbnZhciBzaG93T3RoZXJzRXhwZW5zZXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBpbmNvbWUgPSBkYXRhLmluY29tZTtcbiAgdmFyIG90aGVyc0V4cGVuc2VzID0gZGF0YS5vdGhlcnNFeHBlbnNlcztcblxuICBpZiggKHR5cGVvZiBpbmNvbWUgIT09ICdudW1iZXInKSB8fCAodHlwZW9mIG90aGVyc0V4cGVuc2VzICE9PSAnb2JqZWN0JykgKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgdmFyIG90aGVyc1ZhbHVlcyA9IG1hcEFjdHVhbFZhbHVlcyhoZWxwZXJzLnZhbHVlc09mU3VtbWFyeShcbiAgICBpbmNvbWUsXG4gICAgb3RoZXJzRXhwZW5zZXMuYmFzaWMsXG4gICAgb3RoZXJzRXhwZW5zZXMuZGlzY3JldGlvbmFyeSxcbiAgICBvdGhlcnNFeHBlbnNlcy5zYXZpbmdzXG4gICkpO1xuXG4gIHVwZGF0ZVN1bW1hcnkoc3RhdGVNYXAub3RoZXJzLCBvdGhlcnNWYWx1ZXMsIG90aGVyc0V4cGVuc2VzKTtcbn07XG5cbnZhciB1cGRhdGVTdW1tYXJ5Q2hhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciB1c2VyRXhwZW5zZXMgPSBkYXRhLnVzZXJFeHBlbnNlcztcbiAgdmFyIG90aGVyc0V4cGVuc2VzID0gZGF0YS5vdGhlcnNFeHBlbnNlcztcblxuICB2YXIgY2hhcnREYXRhID0ge1xuICAgIGxhYmVsczogWydCYXNpYyBOZWVkcycsICdEaXNjcmV0aW9uYXJ5IEV4cGVuc2VzJywgJ1NhdmluZ3MnXSxcbiAgICBzZXJpZXM6IFtcbiAgICAgIFt1c2VyRXhwZW5zZXMuYmFzaWMsIHVzZXJFeHBlbnNlcy5kaXNjcmV0aW9uYXJ5LCB1c2VyRXhwZW5zZXMuc2F2aW5nc10sXG4gICAgICBbNDEsIDUxLCA4XVxuICAgIF1cbiAgfTtcblxuICB2YXIgc2VyaWVzID0gY2hhcnREYXRhLnNlcmllcztcbiAgdmFyIGV4cGVuc2U7XG5cbiAgc2VyaWVzWzBdID0gT2JqZWN0LmtleXModXNlckV4cGVuc2VzKS5tYXAoZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICBleHBlbnNlID0gdXNlckV4cGVuc2VzW2NhdGVnb3J5XTtcbiAgICBpZih0eXBlb2YgZXhwZW5zZSAhPT0gJ251bWJlcicpIHtcbiAgICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cGVuc2U7XG4gIH0pO1xuICBzZXJpZXNbMV0gPSBPYmplY3Qua2V5cyhvdGhlcnNFeHBlbnNlcykubWFwKGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgZXhwZW5zZSA9IG90aGVyc0V4cGVuc2VzW2NhdGVnb3J5XTtcbiAgICBpZih0eXBlb2YgZXhwZW5zZSAhPT0gJ251bWJlcicpIHtcbiAgICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cGVuc2U7XG4gIH0pO1xuICBzdGF0ZU1hcC5iYXJDaGFydC51cGRhdGUoY2hhcnREYXRhKTtcbn07XG5cbnZhciBzaG93Q29uY2x1c2lvbiA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHVzZXJFeHBlbnNlcyA9IGRhdGEudXNlckV4cGVuc2VzO1xuICB2YXIgb3RoZXJzRXhwZW5zZXMgPSBkYXRhLm90aGVyc0V4cGVuc2VzO1xuXG4gIHZhciB0ZW1wbGF0ZSA9ICdZb3Ugc3BlbmQge3NwZW5kfSBvbiB7Y2F0ZWdvcnl9IHNvIHlvdSBzYXZlIHtzYXZlfSB0aGFuIG90aGVycyc7XG4gIHZhciB0ZXh0LCBzcGVuZCwgc2F2ZTtcbiAgdmFyIGNhdGVnb3J5ID0gTWF0aC5hYnModXNlckV4cGVuc2VzLmJhc2ljIDwgb3RoZXJzRXhwZW5zZXMuYmFzaWMpID4gTWF0aC5hYnModXNlckV4cGVuc2VzLmRpc2NyZXRpb25hcnkgPCBvdGhlcnNFeHBlbnNlcy5kaXNjcmV0aW9uYXJ5KSA/ICdCYXNpYyBOZWVkcycgOiAnRGlzY3JldGlvbmFyeSBFeHBlbnNlcyc7XG5cbiAgaWYodXNlckV4cGVuc2VzLnNhdmluZ3MgPT09IG90aGVyc0V4cGVuc2VzLnNhdmluZ3MpIHtcbiAgICB0ZXh0ID0gJ1lvdSBzcGVuZCB0aGUgc2FtZSBhcyBvdGhlcnMgb2YgeW91ciBjYXRlZ29yeSc7XG4gIH0gZWxzZSBpZih1c2VyRXhwZW5zZXMuc2F2aW5ncyA+IG90aGVyc0V4cGVuc2VzLnNhdmluZ3MpIHtcbiAgICBzcGVuZCA9ICdsZXNzJztcbiAgICBzYXZlID0gJ21vcmUnO1xuICB9IGVsc2Uge1xuICAgIHNwZW5kID0gJ21vcmUnO1xuICAgIHNhdmUgPSAnbGVzcyc7XG4gIH1cblxuICBpZihzcGVuZCAmJiBzYXZlKSB7XG4gICAgdGV4dCA9IGhlbHBlcnMudGVtcGxhdGUodGVtcGxhdGUsIHtcbiAgICAgIHNwZW5kOiBzcGVuZCxcbiAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICAgIHNhdmU6IHNhdmVcbiAgICB9KTtcbiAgfVxuICBzdGF0ZU1hcC5jb25jbHVzaW9uLnRleHRDb250ZW50ID0gdGV4dDtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUFVCTElDIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oY21kLCBkYXRhKSB7XG4gIHN3aXRjaChjbWQpIHtcbiAgICBjYXNlICdzaG93U3VtbWFyeUNoYXJ0JzpcbiAgICAgIHNob3dTdW1tYXJ5Q2hhcnQoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG93VXNlckV4cGVuc2VzJzpcbiAgICAgIHNob3dVc2VyRXhwZW5zZXMoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG93T3RoZXJzRXhwZW5zZXMnOlxuICAgICAgc2hvd090aGVyc0V4cGVuc2VzKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2hvd0RldGFpbGVkQ2hhcnQnOlxuICAgICAgZGV0YWlscy5yZW5kZXIoJ3Nob3dEZXRhaWxlZENoYXJ0JywgZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG93Q29uY2x1c2lvbic6XG4gICAgICBzaG93Q29uY2x1c2lvbihkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VwZGF0ZURldGFpbGVkQ2hhcnQnOlxuICAgICAgZGV0YWlscy5yZW5kZXIoJ3VwZGF0ZURldGFpbGVkQ2hhcnQnLCBkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VwZGF0ZVN1bW1hcnlDaGFydCc6XG4gICAgICB1cGRhdGVTdW1tYXJ5Q2hhcnQoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5lcnJvcignTm8gY29tbWFuZCBmb3VuZCcpO1xuICAgICAgcmV0dXJuO1xuICB9XG59O1xuXG52YXIgc2V0U3RhdGVNYXAgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgdmFyIGNhdGVnb3JpZXMgPSBbJ2Jhc2ljJywgJ2Rpc2NyZXRpb25hcnknLCAnc2F2aW5ncyddO1xuXG4gIHN0YXRlTWFwLmluY29tZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuYnVkZ2V0X19pbmNvbWUgLnZhbHVlX19hY3R1YWwnKTtcblxuICBzdGF0ZU1hcC5idWRnZXQgPSBnZXRTdW1tYXJ5RE9NKGNvbnRhaW5lciwgJ2J1ZGdldCcsIGNhdGVnb3JpZXMpO1xuICBzdGF0ZU1hcC5vdGhlcnMgPSBnZXRTdW1tYXJ5RE9NKGNvbnRhaW5lciwgJ290aGVycycsIGNhdGVnb3JpZXMpO1xuXG4gIHN0YXRlTWFwLmNvbmNsdXNpb24gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLmNvbmNsdXNpb24nKTtcblxuICBkZXRhaWxzLnNldFN0YXRlTWFwKGNvbnRhaW5lcik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0U3RhdGVNYXA6IHNldFN0YXRlTWFwLFxuICByZW5kZXI6IHJlbmRlclxufTtcbiIsIi8qKlxuICogQ29udGludWUgYnV0dG9ucyBtb2R1bGVcbiAqIEBtb2R1bGUgY29udGludWVcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdGF0ZU1hcCA9IHtcbiAgY29udGludWU6IG51bGwsXG4gIGJhY2t3YXJkOiBudWxsXG59O1xuXG4vKipcbiAqIFBVQkxJQyBGVU5DVElPTlNcbiAqL1xuXG52YXIgYmluZCA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gIGlmIChldmVudCA9PT0gJ2NvbnRpbnVlQ2xpY2tlZCcpIHtcbiAgICBzdGF0ZU1hcC5jb250aW51ZS5mb3JFYWNoKGZ1bmN0aW9uKGJ1dHRvbikge1xuICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMuZGF0YXNldC50ZW1wbGF0ZTtcbiAgICAgICAgaGFuZGxlcih0ZW1wbGF0ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBzdGF0ZU1hcC5iYWNrd2FyZC5mb3JFYWNoKGZ1bmN0aW9uKGJ1dHRvbikge1xuICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGhhbmRsZXIodGhpcy5kYXRhc2V0LnRlbXBsYXRlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59O1xuXG52YXIgc2V0U3RhdGVNYXAgPSBmdW5jdGlvbigpIHtcbiAgc3RhdGVNYXAuY29udGludWUgPSBkb2N1bWVudC5nZXRBbGwoJ2NvbnRpbnVlJyk7XG4gIHN0YXRlTWFwLmJhY2t3YXJkID0gZG9jdW1lbnQuZ2V0QWxsKCdiYWNrd2FyZCcpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJpbmQ6IGJpbmQsXG4gIHNldFN0YXRlTWFwOiBzZXRTdGF0ZU1hcFxufTtcbiIsIi8qKlxuICogU2NyZWVuICMzIC0gWW91IG1vZHVsZVxuICogQG1vZHVsZSAzLXlvdVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG52YXIgZG9tSGVscGVycyA9IHJlcXVpcmUoJy4uL2RvbS1oZWxwZXJzJyk7XG52YXIgd051bWIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd051bWInXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dOdW1iJ10gOiBudWxsKTtcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBDaGFydGlzdCA9IHJlcXVpcmUoJ2NoYXJ0aXN0Jyk7XG5cbnZhciBzdGF0ZU1hcCA9IHtcbiAgY2hhcnROb2RlOiBudWxsLFxuICAkcGllQ2hhcnQ6IG51bGwsXG5cbiAgYmFzaWNTbGlkZXI6IG51bGwsXG4gIGV4cGVuc2VzU2xpZGVyOiBudWxsLFxuICBzYXZpbmdzU2xpZGVyOiBudWxsLFxuXG4gICRtb2RhbDogbnVsbCxcbiAgZGV0YWlsc0xpc3Q6IG51bGwsXG4gIGRldGFpbHNJbnB1dHM6IG51bGwsXG4gIGRldGFpbHNTdW06IG51bGwsXG4gIGRldGFpbHNTYXZpbmdzOiBudWxsLFxuICBzYXZlRGV0YWlsczogbnVsbFxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gSEVMUEVSIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIFJldHVybnMgaWYgZXZlcnkgaXRlbSBpcyBub3QgZXF1YWwgemVyb1xuICogQHBhcmFtICB7YXJyYXl9IHZhbHVlcyBBcnJheSBvZiB2YWx1ZXMgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xudmFyIGFyZU5vdFplcm8gPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgaWYoIUFycmF5LmlzQXJyYXkodmFsdWVzKSkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCB2YWx1ZXMpO1xuICB9XG5cbiAgcmV0dXJuICF2YWx1ZXMuc29tZShmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQgPT09IDA7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbm5lckhUTUwgb2YgdGhlIGxpc3Qgb2YgaW5wdXRzIGZvciBkZXRhaWxlZCBleHBlbnNlc1xuICogQHBhcmFtICB7c3RyaW5nfSBkZXRhaWxUZW1wbGF0ZSBUZW1wbGF0ZSBmb3IgZWFjaCBpbnB1dCBvZiB0aGUgbGlzdFxuICogQHBhcmFtICB7YXJyYXl9IGRldGFpbHNOYW1lcyAgIElucHV0IG5hbWVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGV4cGVuc2UgY2F0ZWdvcnlcbiAqIEBwYXJhbSAge2FycmF5fSBkZWZhdWx0VmFsdWVzICBWYWx1ZSBmb3IgdGhlIGlucHV0c1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZ2V0RGV0YWlsc0xpc3QgPSBmdW5jdGlvbihkZXRhaWxUZW1wbGF0ZSwgZGV0YWlsc05hbWVzLCBkZWZhdWx0VmFsdWVzKSB7XG4gIHZhciBsaXN0SFRNTCA9ICcnO1xuICBkZXRhaWxzTmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpbmRleCkge1xuICAgIGxpc3RIVE1MICs9IGhlbHBlcnMudGVtcGxhdGUoZGV0YWlsVGVtcGxhdGUsIHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICB2YWx1ZTogZGVmYXVsdFZhbHVlc1tpbmRleF1cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBsaXN0SFRNTDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc3VtIG9mIHRoZSB2YWx1ZXNcbiAqIEBwYXJhbSAge0FycmF5fSAgdmFsdWVzIEFycmF5IG9mIHZhbHVlcyB0byBiZSBzdW1tZWRcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHN1bSA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICBpZighQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIHZhbHVlcyk7XG4gIH1cblxuICByZXR1cm4gdmFsdWVzLnJlZHVjZShmdW5jdGlvbihwcmV2aW91cywgY3VycmVudCkge1xuICAgIHJldHVybiBwcmV2aW91cyArIGN1cnJlbnQ7XG4gIH0pO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFJFTkRFUiBGVU5DVElPTlMgLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgY3JlYXRlUGllVG9vbHRpcCA9IGZ1bmN0aW9uKHBpZUNoYXJ0LCBpbmNvbWUpIHtcbiAgdmFyICRjaGFydCA9ICQocGllQ2hhcnQpO1xuICB2YXIgJHRvb2xUaXAgPSAkY2hhcnRcbiAgICAuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicGllLXRvb2x0aXBcIj48L2Rpdj4nKVxuICAgIC5maW5kKCcucGllLXRvb2x0aXAnKVxuICAgIC5oaWRlKCk7XG4gIHZhciBtb25leUZvcm1hdCA9IHdOdW1iKHtcbiAgICB0aG91c2FuZDogJy4nLFxuICAgIHByZWZpeDogJyQgJ1xuICB9KTtcbiAgdmFyIGlzVG9vbHRpcFNob3duID0gZmFsc2U7XG5cbiAgLy9Gb3IgbW9iaWxlc1xuICAkY2hhcnQub24oJ2NsaWNrIG1vdXNlZW50ZXInLCAnLmN0LXNsaWNlLWRvbnV0JywgZnVuY3Rpb24oZSkge1xuICAgIGlmICghaXNUb29sdGlwU2hvd24gfHwgZS50eXBlID09PSAnbW91c2VlbnRlcicpIHtcbiAgICAgIHZhciAkc2xpY2UgPSAkKHRoaXMpO1xuICAgICAgdmFyIHZhbHVlID0gJHNsaWNlLmF0dHIoJ2N0OnZhbHVlJyk7XG4gICAgICB2YXIgc2VyaWVzTmFtZSA9ICRzbGljZS5wYXJlbnQoKS5hdHRyKCdjdDpzZXJpZXMtbmFtZScpO1xuICAgICAgJHRvb2xUaXBcbiAgICAgIC5odG1sKFxuICAgICAgICAnPHN0cm9uZz4nICsgc2VyaWVzTmFtZSArICc8L3N0cm9uZz46ICcgK1xuICAgICAgICAgIHZhbHVlICsgJyUvICcgK1xuICAgICAgICBtb25leUZvcm1hdC50byhOdW1iZXIodmFsdWUpIC8gMTAwICogaW5jb21lKVxuICAgICAgKVxuICAgICAgLnNob3coKTtcbiAgICAgIGlzVG9vbHRpcFNob3duID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHRvb2xUaXAuaGlkZSgpO1xuICAgICAgaXNUb29sdGlwU2hvd24gPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gICRjaGFydC5vbignbW91c2VsZWF2ZScsICcuY3Qtc2xpY2UtZG9udXQnLCBmdW5jdGlvbigpIHtcbiAgICAkdG9vbFRpcC5oaWRlKCk7XG4gIH0pO1xuXG4gICRjaGFydC5vbignY2xpY2sgbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAkdG9vbFRpcC5jc3Moe1xuICAgICAgbGVmdDogKGV2ZW50Lm9mZnNldFggfHwgZXZlbnQub3JpZ2luYWxFdmVudC5sYXllclgpIC0gJHRvb2xUaXAud2lkdGgoKSAvIDIgLSAxMCxcbiAgICAgIHRvcDogKGV2ZW50Lm9mZnNldFkgfHwgZXZlbnQub3JpZ2luYWxFdmVudC5sYXllclkpIC0gJHRvb2xUaXAuaGVpZ2h0KCkgLSAzMFxuICAgIH0pO1xuICB9KTtcbn07XG5cbnZhciBzaG93RGV0YWlsZWQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBkZXRhaWxzTmFtZXMgPSBbJ0Zvb2QgYXQgaG9tZScsICdGb29kIGF3YXkgZnJvbSBob21lJywgJ0hvdXNpbmcnLCAnTWlzYyBIb3VzaW5nIFJlbGF0ZWQnLCAnVXRpbGl0aWVzLCBmdWVscywgcHVibGljIHNlcnZpY2VzJywgJ0FwcGFyZWwgJiBzZXJ2aWNlcycsICdUcmFzcG9ydGF0aW9uJywgJ0hlYWx0aGNhcmUnLCAnRW50ZXJ0YWlubWVudCAmIFJlYWRpbmcnLCAnRWR1Y2F0aW9uJywgJ01pc2NlbGxhbmVvdXMnXTtcbiAgdmFyIGV4cGVuc2VzID0gZGF0YS5leHBlbnNlcztcblxuICBpZighQXJyYXkuaXNBcnJheShleHBlbnNlcykpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICB2YXIgZGV0YWlsVGVtcGxhdGUgPVxuICAgICc8bGkgY2xhc3M9XCJkZXRhaWxcIj4nICtcbiAgICAgICc8c3BhbiBjbGFzcz1cImRldGFpbF9fbmFtZVwiPntuYW1lfTwvc3Bhbj4nICtcbiAgICAgICc8c3BhbiBjbGFzcz1cInZhbHVlLXdyYXBwZXJcIj4nICtcbiAgICAgICAgJzxpbnB1dCBjbGFzcz1cImRldGFpbF9fdmFsdWVcIiB0eXBlPVwibnVtYmVyXCIgdmFsdWU9XCJ7dmFsdWV9XCIgbmFtZT1cIntuYW1lfVwiID4nICtcbiAgICAgICc8L3NwYW4+JyArXG4gICAgJzwvbGk+JztcblxuICBzdGF0ZU1hcC5kZXRhaWxzTGlzdC5pbm5lckhUTUwgPSBnZXREZXRhaWxzTGlzdChkZXRhaWxUZW1wbGF0ZSwgZGV0YWlsc05hbWVzLCBleHBlbnNlcyk7XG59O1xuXG52YXIgc2hvd0RldGFpbHNTdW0gPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBzdW0gPSBkYXRhLnN1bTtcblxuICBpZighaGVscGVycy5pc051bWJlcihzdW0pKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgc3RhdGVNYXAuZGV0YWlsc1N1bS50ZXh0Q29udGVudCA9IHN1bTtcbiAgc3RhdGVNYXAuZGV0YWlsc1NhdmluZ3MudGV4dENvbnRlbnQgPSAxMDAgLSBzdW07XG59O1xuXG52YXIgc2hvd1NsaWRlcnMgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBiYXNpY1JhdGUgPSBkYXRhLmJhc2ljUmF0ZTtcbiAgdmFyIGRpc2NSYXRlID0gZGF0YS5kaXNjUmF0ZTtcbiAgdmFyIGN1cnJlbnRTYXZpbmdzID0gZGF0YS5jdXJyZW50U2F2aW5ncztcblxuICAvL1dlIGNoZWNrIGRhdGEgYXJlIGFsbCBudW1iZXJzIGJ5IHN1bW1pbmcgdGhlbVxuICBpZih0eXBlb2YgKGJhc2ljUmF0ZSArIGRpc2NSYXRlICsgY3VycmVudFNhdmluZ3MpICE9PSAnbnVtYmVyJykge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHZhciBiYXNpY09wdGlvbnMgPSB7XG4gICAgc3RhcnQ6IGJhc2ljUmF0ZSxcbiAgICBzdGVwOiAxLFxuICAgIHJhbmdlOiB7XG4gICAgICAnbWluJzogMSxcbiAgICAgICdtYXgnOiA3MFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMFxuICAgIH0pXG4gIH07XG4gIHZhciBkaXNjT3B0aW9ucyA9IHtcbiAgICBzdGFydDogZGlzY1JhdGUsXG4gICAgc3RlcDogMSxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDEsXG4gICAgICAnbWF4JzogNzBcbiAgICB9LFxuICAgIGZvcm1hdDogd051bWIoe1xuICAgICAgZGVjaW1hbHM6IDBcbiAgICB9KVxuICB9O1xuICB2YXIgc2F2aW5nc09wdGlvbnMgPSB7XG4gICAgc3RhcnQ6IGN1cnJlbnRTYXZpbmdzLFxuICAgIHN0ZXA6IDEwMDAsXG4gICAgcmFuZ2U6IHtcbiAgICAgICdtaW4nOiAxMDAwLFxuICAgICAgJ21heCc6IDUwMDAwMFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMSxcbiAgICAgIHRob3VzYW5kOiAnLCdcbiAgICB9KVxuICB9O1xuXG4gIGRvbUhlbHBlcnMuY3JlYXRlU2xpZGVyKHN0YXRlTWFwLmJhc2ljU2xpZGVyLCBiYXNpY09wdGlvbnMsICclJyk7XG4gIGRvbUhlbHBlcnMuY3JlYXRlU2xpZGVyKHN0YXRlTWFwLmV4cGVuc2VzU2xpZGVyLCBkaXNjT3B0aW9ucywgJyUnKTtcbiAgZG9tSGVscGVycy5jcmVhdGVTbGlkZXIoc3RhdGVNYXAuc2F2aW5nc1NsaWRlciwgc2F2aW5nc09wdGlvbnMsICckJyk7XG59O1xuXG52YXIgc2hvd1BpZUNoYXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgaW5jb21lID0gZGF0YS5pbmNvbWU7XG4gIHZhciBiYXNpY1JhdGUgPSBkYXRhLmJhc2ljUmF0ZTtcbiAgdmFyIGRpc2NSYXRlID0gZGF0YS5kaXNjUmF0ZTtcbiAgdmFyIHNhdmluZ3NSYXRlID0gMTAwIC0gYmFzaWNSYXRlIC0gZGlzY1JhdGU7XG5cbiAgLy9XZSBjaGVjayBkYXRhIGFyZSBhbGwgbnVtYmVycyBieSBzdW1taW5nIHRoZW1cbiAgaWYodHlwZW9mIHNhdmluZ3NSYXRlICE9PSAnbnVtYmVyJykge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHZhciBwaWVEYXRhID0ge1xuICAgIHNlcmllczogW1xuICAgICAge1xuICAgICAgICB2YWx1ZTogYmFzaWNSYXRlLFxuICAgICAgICBuYW1lOiAnQmFzaWMgTmVlZHMnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB2YWx1ZTogZGlzY1JhdGUsXG4gICAgICAgIG5hbWU6ICdEaXNjcmV0aW9uYXJ5J1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdmFsdWU6IHNhdmluZ3NSYXRlLFxuICAgICAgICBuYW1lOiAnU2F2aW5ncydcbiAgICAgIH1cbiAgICBdXG4gIH07XG4gIHZhciBwaWVPcHRpb25zID0ge1xuICAgIGRvbnV0OiB0cnVlLFxuICAgIGRvbnV0V2lkdGg6IDIwLFxuICAgIGNoYXJ0UGFkZGluZzogMTAsXG4gICAgbGFiZWxPZmZzZXQ6IDUwLFxuICAgIHdpZHRoOiAnMjIwcHgnLFxuICAgIGhlaWdodDogJzIyMHB4J1xuICB9O1xuICB2YXIgcGllUmVzcG9uc2l2ZU9wdGlvbnMgPSBbXG4gICAgWydzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ4MHB4KScsIHtcbiAgICAgIGRvbnV0V2lkdGg6IDMwLFxuICAgICAgd2lkdGg6ICcyODBweCcsXG4gICAgICBoZWlnaHQ6ICcyODBweCdcbiAgICB9XVxuICBdO1xuXG4gIHN0YXRlTWFwLiRwaWVDaGFydCA9IG5ldyBDaGFydGlzdC5QaWUoc3RhdGVNYXAuY2hhcnROb2RlLCBwaWVEYXRhLCBwaWVPcHRpb25zLCBwaWVSZXNwb25zaXZlT3B0aW9ucyk7XG4gIGNyZWF0ZVBpZVRvb2x0aXAoc3RhdGVNYXAuY2hhcnROb2RlLCBpbmNvbWUpO1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IHNoZWxsIHRvIHNldCB0aGUgc2xpZGVycyB2YWx1ZXMgd2hlbiBkYXRhIGlzIGNoYW5nZWQgb24gc29tZSBvdGhlclxuICogc2NyZWVucy5cbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIE9iamVjdCB3aXRoIHNsaWRlck5hbWUgYW5kIHZhbHVlIHByb3BlcnRpZXNcbiAqL1xudmFyIHNldFNsaWRlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHNsaWRlck5hbWUgPSBkYXRhLnNsaWRlck5hbWU7XG4gIHZhciB2YWx1ZSA9IGRhdGEudmFsdWU7XG5cbiAgaWYoICh0eXBlb2Ygc2xpZGVyTmFtZSAhPT0gJ3N0cmluZycpIHx8ICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSApIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICBpZiAoc2xpZGVyTmFtZSA9PT0gJ2Jhc2ljJykge1xuICAgIHN0YXRlTWFwLmJhc2ljU2xpZGVyLm5vVWlTbGlkZXIuc2V0KHZhbHVlKTtcbiAgfSBlbHNlIGlmIChzbGlkZXJOYW1lID09PSAnZGlzY3JldGlvbmFyeScpIHtcbiAgICBzdGF0ZU1hcC5leHBlbnNlc1NsaWRlci5ub1VpU2xpZGVyLnNldCh2YWx1ZSk7XG4gIH1cbn07XG5cbnZhciB1cGRhdGVEZXRhaWxzU3VtID0gZnVuY3Rpb24oKSB7XG4gIHZhciB2YWx1ZXMgPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoc3RhdGVNYXAuZGV0YWlsc0lucHV0cywgZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gTnVtYmVyKGlucHV0LnZhbHVlKTtcbiAgfSk7XG4gIHZhciBkZXRhaWxzU3VtID0gc3VtKHZhbHVlcyk7XG4gIHNob3dEZXRhaWxzU3VtKHtzdW06IGRldGFpbHNTdW19KTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSB2aWV3IG9mIHRoZSBEb3VnaG51dCB3aGVuIHNsaWRlcnMgdmFsdWVzIGNoYW5nZVxuICogQHBhcmFtIHtvYmplY3R9IHJhdGVzIE9iamVjdCB3aXRoIHRoZSBuZXcgcmF0ZXNcbiAqIEBleGFtcGxlXG4gKiB1cGRhdGVQaWVDaGFydCh7XG4gKiAgIGJhc2ljUmF0ZTogMzAsXG4gKiAgIGRpc2NSYXRlOiA0MCxcbiAqICAgc2F2aW5nc1JhdGU6IDMwXG4gKiB9KVxuICovXG52YXIgdXBkYXRlUGllQ2hhcnQgPSBmdW5jdGlvbihyYXRlcykge1xuICB2YXIgdXBkYXRlZERhdGEgPSB7XG4gICAgc2VyaWVzOiBbXG4gICAgICB7XG4gICAgICAgIHZhbHVlOiByYXRlcy5iYXNpY1JhdGUsXG4gICAgICAgIG5hbWU6ICdCYXNpYyBOZWVkcydcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHZhbHVlOiByYXRlcy5kaXNjUmF0ZSxcbiAgICAgICAgbmFtZTogJ0Rpc2NyZXRpb25hcnknXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB2YWx1ZTogcmF0ZXMuc2F2aW5nc1JhdGUsXG4gICAgICAgIG5hbWU6ICdTYXZpbmdzJ1xuICAgICAgfVxuICAgIF1cbiAgfTtcbiAgc3RhdGVNYXAuJHBpZUNoYXJ0LnVwZGF0ZSh1cGRhdGVkRGF0YSk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBQVUJMSUMgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogVXNlZCBieSBzaGVsbCB0byBiaW5kIGV2ZW50IGhhbmRsZXJzIHRvIHRoaXMgbW9kdWxlIERPTSBldmVudHMuIEl0IHVzdWFsbHlcbiAqIG1lYW5zIHRoYXQgd2Ugd2FudCB0aGUgc2hlbGwgdG8gdXBkYXRlIG1vZGVsIHdoZW4gdXNlciBpbnRlcmFjdHMgd2l0aCB0aGlzXG4gKiBzY3JlZW4uXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGV2ZW50IEV2ZW50IG5hbWVcbiAqIEBwYXJhbSAge2Z1bmN0aW9ufSBoYW5kbGVyIEV2ZW50IGhhbmRsZXJcbiAqL1xudmFyIGJpbmQgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICBzd2l0Y2ggKGV2ZW50KSB7XG4gICAgY2FzZSAnYmFzaWNSYXRlQ2hhbmdlZCc6XG4gICAgICBzdGF0ZU1hcC5iYXNpY1NsaWRlci5ub1VpU2xpZGVyLm9uKCdzZXQnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaGFuZGxlciggTnVtYmVyKHZhbHVlc1swXSkgKTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGlzY1JhdGVDaGFuZ2VkJzpcbiAgICAgIHN0YXRlTWFwLmV4cGVuc2VzU2xpZGVyLm5vVWlTbGlkZXIub24oJ3NldCcsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBoYW5kbGVyKCBOdW1iZXIodmFsdWVzWzBdKSApO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjdXJyZW50U2F2aW5nc0NoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuc2F2aW5nc1NsaWRlci5ub1VpU2xpZGVyLm9uKCdzZXQnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaGFuZGxlcihOdW1iZXIodmFsdWVzWzBdLnJlcGxhY2UoJywnLCAnJykpKTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGV0YWlsc0NoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuZGV0YWlsc0xpc3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdXBkYXRlRGV0YWlsc1N1bSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXRhaWxzUmVzZXQnOlxuICAgICAgc3RhdGVNYXAuZGV0YWlsc1Jlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXRhaWxzU2F2ZWQnOlxuICAgICAgc3RhdGVNYXAuc2F2ZURldGFpbHMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChzdGF0ZU1hcC5kZXRhaWxzSW5wdXRzLCBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICAgIHJldHVybiBOdW1iZXIoaW5wdXQudmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHZhbGlkID0gYXJlTm90WmVybyh2YWx1ZXMpICYmIChzdW0odmFsdWVzKSA8PSAxMDApO1xuICAgICAgICBpZih2YWxpZCkge1xuICAgICAgICAgIGhhbmRsZXIobnVsbCwgdmFsdWVzKTtcbiAgICAgICAgICBzdGF0ZU1hcC4kbW9kYWwubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoYW5kbGVyKG5ldyBFcnJvcignVmFsdWVzIG11c3Qgbm90IGJlIHplcm9zIGFuZCB0aGVpciBzdW0gbm90IHN1cGVyaW9yIDEwMCcpLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuO1xuICB9XG59O1xuXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oY21kLCBkYXRhKSB7XG4gIHN3aXRjaChjbWQpIHtcbiAgICBjYXNlICdzaG93U2xpZGVycyc6XG4gICAgICBzaG93U2xpZGVycyhkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3dQaWVDaGFydCc6XG4gICAgICBzaG93UGllQ2hhcnQoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG93RGV0YWlsZWQnOlxuICAgICAgc2hvd0RldGFpbGVkKGRhdGEpO1xuICAgICAgc3RhdGVNYXAuZGV0YWlsc0lucHV0cyA9IHN0YXRlTWFwLmRldGFpbHNMaXN0LmdldEFsbCgnZGV0YWlsX192YWx1ZScpO1xuICAgICAgdmFyIGlucHV0c1ZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChzdGF0ZU1hcC5kZXRhaWxzSW5wdXRzLCBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gTnVtYmVyKGlucHV0LnZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgc2hvd0RldGFpbHNTdW0oe1xuICAgICAgICBzdW06IHN1bShpbnB1dHNWYWx1ZXMpXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NldFNsaWRlcic6XG4gICAgICBzZXRTbGlkZXIoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd1cGRhdGVQaWVDaGFydCc6XG4gICAgICB1cGRhdGVQaWVDaGFydChkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VwZGF0ZVBpZVRvb2x0aXAnOlxuICAgICAgY3JlYXRlUGllVG9vbHRpcChzdGF0ZU1hcC5jaGFydE5vZGUsIGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGNvbW1hbmQgZm91bmQuJyk7XG4gICAgICByZXR1cm47XG4gIH1cbn07XG5cbnZhciBzZXRTdGF0ZU1hcCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICB3aW5kb3cuc3VtID0gc3VtO1xuICBzdGF0ZU1hcC5iYXNpY1NsaWRlciA9IGNvbnRhaW5lci5nZXQoJ3NsaWRlci0tbmVlZHMnKTtcbiAgc3RhdGVNYXAuZXhwZW5zZXNTbGlkZXIgPSBjb250YWluZXIuZ2V0KCdzbGlkZXItLWV4cGVuc2VzJyk7XG4gIHN0YXRlTWFwLnNhdmluZ3NTbGlkZXIgPSBjb250YWluZXIuZ2V0KCdjdXJyZW50LXNhdmluZ3NfX3NsaWRlcicpO1xuXG4gIHN0YXRlTWFwLmNoYXJ0Tm9kZSA9IGNvbnRhaW5lci5nZXQoJ3N1bW1hcnlfX2NoYXJ0Jyk7XG5cbiAgc3RhdGVNYXAuJG1vZGFsID0gJCgnI2RldGFpbHMtbW9kYWwnKTtcbiAgc3RhdGVNYXAuZGV0YWlsc0xpc3QgPSBjb250YWluZXIuZ2V0KCdkZXRhaWxzLXZhbHVlcycpO1xuICBzdGF0ZU1hcC5kZXRhaWxzUmVzZXQgPSBjb250YWluZXIuZ2V0KCdyZXNldC1kZXRhaWxlZCcpO1xuICBzdGF0ZU1hcC5kZXRhaWxzU3VtID0gY29udGFpbmVyLmdldCgnZGV0YWlscy1zdW0nKTtcbiAgc3RhdGVNYXAuZGV0YWlsc1NhdmluZ3MgPSBjb250YWluZXIuZ2V0KCdkZXRhaWxzLXNhdmluZ3MnKTtcbiAgc3RhdGVNYXAuc2F2ZURldGFpbHMgPSBjb250YWluZXIuZ2V0KCdzYXZlLWRldGFpbGVkLWV4cGVuc2UnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kOiBiaW5kLFxuICByZW5kZXI6IHJlbmRlcixcbiAgc2V0U3RhdGVNYXA6IHNldFN0YXRlTWFwXG59O1xuIiwiLyoqXG4gKiBTY3JlZW4gIzcgLSBHb2FsIG1vZHVsZVxuICogQG1vZHVsZSA3LUdvYWxcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIGRyYWd1bGEgPSByZXF1aXJlKCdkcmFndWxhJyk7XG5cbnZhciBjb25maWdNYXAgPSB7XG4gIHRvZ2dsZUJ1dHRvbnM6ICd0b2dnbGUtZ29hbCcsXG4gIGRhdGVwaWNrZXI6ICcuZ29hbF9fZGF0ZV9fcGlja2VyJ1xufTtcblxudmFyIHN0YXRlTWFwID0ge1xuICBmcmVlR29hbHM6IG51bGwsXG4gIHBpY2tlZEdvYWxzOiBudWxsLFxuICB0b2dnbGVCdXR0b25zOiBudWxsXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vL1xuLy8gVEVNUExBVEVTIC8vXG4vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBUZW1wbGF0ZXMgZm9yIGdvYWxzIHRvIGJlIHBpY2tlZCBhbmQgdGhlIHBpY2tlZCBvbmUuIFdlIGFyZSB1c2luZyB0ZW1wbGF0ZXNcbiAqIGhlcmUgaW4gSmF2YXNjcmlwdCBpbnN0ZWFkIG9mIHB1dHRpbmcgaXQgZGlyZWN0bHkgaW50byBIVE1MIGZpbGVzIGJlY2F1c2VcbiAqIGl0J3MgZWFzaWVyIHRvIGdlbmVyYXRlIGFuZCBtYW5pcHVsYXRlIHRoZW0gZGluYW1pY2FsbHkgYmFzZWQgb24gdGhlIE1vZGVsLlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xudmFyIGZyZWVHb2FsVGVtcGxhdGUgPVxuICAnPGRpdiBjbGFzcz1cImdvYWwgZ29hbC0te2lkfSB7cGlja2VkfVwiPicgK1xuICAgICc8ZGl2IGNsYXNzPVwiZ29hbF9fZGV0YWlsc1wiPicgK1xuICAgICAgJzxwIGNsYXNzPVwiZ29hbF9fdGl0bGVcIj57dGl0bGV9PC9wPicgK1xuICAgICAgJzxzcGFuIGNsYXNzPVwiZ29hbF9fZGF0ZVwiIGRhdGEtcGxhY2VtZW50PVwiYm90dG9tXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgdGl0bGU9XCJFeHBlY3RlZCBhY2hpZXZlbWVudCBkYXRlIGJhc2VkIG9uIHlvdXIgZGF0YVwiPicgK1xuICAgICAgICAnPGkgY2xhc3M9XCJ6bWRpIHptZGktY2FsZW5kYXItYWx0XCI+PC9pPicgK1xuICAgICAgICAnPHNwYW4+e2RhdGV9PC9zcGFuPicgK1xuICAgICAgJzwvc3Bhbj4nICtcbiAgICAgICc8c3BhbiBjbGFzcz1cImdvYWxfX3N1Y2Nlc3NcIiBkYXRhLXBsYWNlbWVudD1cImJvdHRvbVwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIHRpdGxlPVwiRXhwZWN0ZWQgYWNoaWV2ZW1lbnQgcHJvYmFiaWxpdHkgYmFzZWQgb24geW91ciBkYXRhXCI+JyArXG4gICAgICAgICc8aSBjbGFzcz1cInptZGkgem1kaS1jaGFydFwiPjwvaT4nICtcbiAgICAgICAgJzxzcGFuPntwcm9iYWJpbGl0eX08L3NwYW4+JyArXG4gICAgICAnPC9zcGFuPicgK1xuICAgICc8L2Rpdj4nICtcbiAgICAnPGkgY2xhc3M9XCJ0b2dnbGUtZ29hbCBhZGQtZ29hbCB6bWRpIHptZGktcGx1cy1jaXJjbGVcIiBkYXRhLWdvYWw9XCJ7aWR9XCI+PC9pPicgK1xuICAnPC9kaXY+JztcbnZhciBwaWNrZWRHb2FsVGVtcGxhdGUgPVxuICAnPGRpdiBjbGFzcz1cInBpY2tlZCBwaWNrZWQtLXtpZH0ge3BpY2tlZH1cIj4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpY2tlZF9fZGV0YWlsc1wiPicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJkcmFnZ2VyXCI+PC9kaXY+JyArXG4gICAgICAnPHAgY2xhc3M9XCJwaWNrZWRfX3RpdGxlXCI+e3RpdGxlfTwvcD4nICtcbiAgICAgICc8cCBjbGFzcz1cInBpY2tlZF9fZGF0ZVwiPicgK1xuICAgICAgICAnPGkgY2xhc3M9XCJ6bWRpIHptZGktY2FsZW5kYXItYWx0XCI+PC9pPicgK1xuICAgICAgICAnPGlucHV0IGNsYXNzPVwiZ29hbF9fZGF0ZV9fcGlja2VyXCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIntkYXRlfVwiIHJlYWRvbmx5PicgK1xuICAgICAgICAnPGkgY2xhc3M9XCJ6bWRpIHptZGktZWRpdFwiPjwvaT4nICtcbiAgICAgICc8L3A+JyArXG4gICAgICAnPHAgY2xhc3M9XCJwaWNrZWRfX3N1Y2Nlc3NcIj48aSBjbGFzcz1cInptZGkgem1kaS1jaGFydFwiPjwvaT57cHJvYmFiaWxpdHl9PC9wPicgK1xuICAgICc8L2Rpdj4nICtcbiAgICAnPGkgY2xhc3M9XCJ0b2dnbGUtZ29hbCBkZWxldGUtZ29hbCB6bWRpIHptZGktbWludXMtY2lyY2xlXCIgZGF0YS1nb2FsPVwie2lkfVwiPjwvaT4nICtcbiAgJzwvZGl2Pic7XG5cbi8qXG4gKiBHZW5lcmF0ZXMgdGhlIEhUTUwgbGlzdCBvZiBnb2FscyB0byBiZSBwaWNrZWQuIElmIHRoZSBnb2FsIGlzIGFscmVhZHkgcGlja2VkXG4gKiB3ZSBhZGQgYSBDU1MgY2xhc3MgdG8gaGlkZSBpdC4gSW4gdGhpcyB3YXkgaXQncyBmYXN0ZXIgdG8gaGlkZS9zaG93IGdvYWxzIGluXG4gKiBib3RoIGxpc3RzICh0byBiZSBwaWNrZWQgJiBhbHJlYWR5IHBpY2tlZCkgd2hlbiB0aGUgdXNlciBpbnRlcmFjdHMgYW5kIG1vcmVvdmVyXG4gKiB3ZSBhdm9pZCByZWNyZWF0aW5nIERPTSBmb3IgdGhlIGdvYWxzIGVhY2ggdGltZS5cbiAqIEBwYXJhbSAge2FycmF5fSBnb2Fsc0xpc3QgTGlzdCBvZiBhdmFpbGFibGUgZ29hbHNcbiAqIEBwYXJhbSAge2FycmF5fSBwaWNrZWRHb2FscyBHb2FscyBhbHJlYWR5IHBpY2tlZCBieSB0aGUgdXNlclxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZ2V0TGlzdEdvYWxzID0gZnVuY3Rpb24oZ29hbHNMaXN0LCBwaWNrZWRHb2FscywgdGVtcGxhdGUsIGNsYXNzTmFtZSkge1xuICB2YXIgdmlldyA9ICcnO1xuXG4gIGdvYWxzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGdvYWwpIHtcbiAgICB2YXIgZ29hbENsYXNzTmFtZSA9ICcnO1xuICAgIHZhciBpc1BpY2tlZCA9IHBpY2tlZEdvYWxzLmZpbmQoZnVuY3Rpb24ocGlja2VkR29hbCkge1xuICAgICAgcmV0dXJuIHBpY2tlZEdvYWwuaWQgPT09IGdvYWwuaWQ7XG4gICAgfSk7XG5cbiAgICBpZiAoaXNQaWNrZWQpIHtcbiAgICAgIGdvYWxDbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgfVxuXG4gICAgdmlldyArPSBoZWxwZXJzLnRlbXBsYXRlKHRlbXBsYXRlLCB7XG4gICAgICBpZDogZ29hbC5pZCxcbiAgICAgIHRpdGxlOiBnb2FsLnRpdGxlLFxuICAgICAgcGlja2VkOiBnb2FsQ2xhc3NOYW1lLFxuICAgICAgZGF0ZTogZ29hbC5kYXRlLFxuICAgICAgcHJvYmFiaWxpdHk6IGdvYWwucHJvYmFiaWxpdHlcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHZpZXc7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFJFTkRFUiBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIHNob3dHb2FscyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGdvYWxzTGlzdCA9IGRhdGEuZ29hbHNMaXN0O1xuICB2YXIgcGlja2VkR29hbHMgPSBkYXRhLnBpY2tlZEdvYWxzO1xuXG4gIGlmKCAhQXJyYXkuaXNBcnJheShnb2Fsc0xpc3QpIHx8ICFBcnJheS5pc0FycmF5KHBpY2tlZEdvYWxzKSApIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICB2YXIgZnJlZUdvYWxzVmlldyA9IGdldExpc3RHb2Fscyhnb2Fsc0xpc3QsIHBpY2tlZEdvYWxzLCBmcmVlR29hbFRlbXBsYXRlLCAnZ29hbC0taGlkZScpO1xuICB2YXIgcGlja2VkR29hbHNWaWV3ID0gZ2V0TGlzdEdvYWxzKGdvYWxzTGlzdCwgcGlja2VkR29hbHMsIHBpY2tlZEdvYWxUZW1wbGF0ZSwgJ3BpY2tlZC0tc2hvdycpO1xuICBzdGF0ZU1hcC5mcmVlR29hbHMuaW5uZXJIVE1MID0gZnJlZUdvYWxzVmlldztcbiAgc3RhdGVNYXAucGlja2VkR29hbHMuaW5uZXJIVE1MID0gcGlja2VkR29hbHNWaWV3O1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUFVCTElDIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgYmluZCA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gIGlmIChldmVudCA9PT0gJ2dvYWxUb2dnbGVkJykge1xuICAgIC8qKlxuICAgICAqIEV2ZXJ5IHRpbWUgYSBidXR0b24gdG8gYWRkL3JlbW92ZSBhIGdvYWwgKGluIGJvdGggbGlzdHMpIGlzIGNsaWNrZWRcbiAgICAgKiB3ZSB0b2dnbGUgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGdvYWwgYW5kIGNhbGwgdGhlIHNoZWxsJ3MgZnVuY3Rpb24gdG9cbiAgICAgKiB1cGRhdGUgdGhlIE1vZGVsXG4gICAgICovXG4gICAgc3RhdGVNYXAudG9nZ2xlQnV0dG9ucy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIC8qIEBGSVhNRSBUaGlzIGNvdWxkIG5lZWQgYW4gaW1wcm92ZW1lbnQgd2l0aCAnRXZlbnQgRGVsZWdhdGlvbicgaWYgdGhlXG4gICAgICAgIG51bWJlciBvZiBnb2FscyBpbmNyZWFzZSBiZWNhdXNlIHdlIGFyZSBhZGRpbmcgYW4gRXZlbnQgTGlzdGVuZXIgdG8gZWFjaFxuICAgICAgICBnb2FsICovXG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBnb2FsTmFtZSA9IHRoaXMuZGF0YXNldC5nb2FsO1xuICAgICAgICB2YXIgdG9nZ2xlZEdvYWwgPSBzdGF0ZU1hcC5waWNrZWRHb2Fscy5nZXQoJ3BpY2tlZC0tJyArIGdvYWxOYW1lKTtcbiAgICAgICAgdmFyIGRhdGUgPSB0b2dnbGVkR29hbC5xdWVyeVNlbGVjdG9yKGNvbmZpZ01hcC5kYXRlcGlja2VyKS52YWx1ZTtcblxuICAgICAgICB0b2dnbGVkR29hbC5jbGFzc0xpc3QudG9nZ2xlKCdwaWNrZWQtLXNob3cnKTtcbiAgICAgICAgc3RhdGVNYXAuZnJlZUdvYWxzLmdldCgnZ29hbC0tJyArIGdvYWxOYW1lKS5jbGFzc0xpc3QudG9nZ2xlKCdnb2FsLS1oaWRlJyk7XG5cbiAgICAgICAgaGFuZGxlcih7XG4gICAgICAgICAgaWQ6IGdvYWxOYW1lLFxuICAgICAgICAgIGRhdGU6IGRhdGVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufTtcblxudmFyIHNldFN0YXRlTWFwID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gIHN0YXRlTWFwLmZyZWVHb2FscyA9IGNvbnRhaW5lci5nZXQoJ2dvYWxzJyk7XG4gIHN0YXRlTWFwLnBpY2tlZEdvYWxzID0gY29udGFpbmVyLmdldCgncGlja2VkLWdvYWxzJyk7XG5cbiAgc3RhdGVNYXAudG9nZ2xlQnV0dG9ucyA9IGNvbnRhaW5lci5nZXRBbGwoY29uZmlnTWFwLnRvZ2dsZUJ1dHRvbnMpO1xufTtcblxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKGNtZCwgZGF0YSkge1xuICBzd2l0Y2goY21kKSB7XG4gICAgY2FzZSAnc2hvd0dvYWxzJzpcbiAgICAgIHNob3dHb2FscyhkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZVRvb2x0aXBzJzpcbiAgICAgICQoJy5nb2FsX19kZXRhaWxzID4gc3BhbicpLnRvb2x0aXAoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NldERyYWdEcm9wJzpcbiAgICAgIGRyYWd1bGEoW3N0YXRlTWFwLnBpY2tlZEdvYWxzXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjcmVhdGVEYXRlcGlja2Vycyc6XG4gICAgICAkKGNvbmZpZ01hcC5kYXRlcGlja2VyKS5kYXRlcGlja2VyKHtcbiAgICAgICAgYXV0b2Nsb3NlOiB0cnVlLFxuICAgICAgICBmb3JtYXQ6ICdNIGQgeXl5eSdcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGNvbW1hbmQgZm91bmQuJyk7XG4gICAgICByZXR1cm47XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kOiBiaW5kLFxuICByZW5kZXI6IHJlbmRlcixcbiAgc2V0U3RhdGVNYXA6IHNldFN0YXRlTWFwXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcbnZhciBkb21IZWxwZXJzID0gcmVxdWlyZSgnLi4vZG9tLWhlbHBlcnMnKTtcblxudmFyIHN0YXRlTWFwID0ge1xuICBuYXY6IG51bGxcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gRE9NIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgYWN0aXZhdGVOYXYgPSBmdW5jdGlvbihzdGVwTmFtZSkge1xuICBpZih0eXBlb2Ygc3RlcE5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIHN0ZXBOYW1lKTtcbiAgfVxuXG4gIHZhciBuZXdBY3RpdmVMaW5rID0gc3RhdGVNYXAubmF2LmdldCgnc3RlcC1uYW1lLS0nICsgc3RlcE5hbWUpLnBhcmVudE5vZGU7XG5cbiAgLy9BY3RpdmF0ZSB0aGUgbmF2aWdhdGlvbiBpdGVtXG4gIGlmKG5ld0FjdGl2ZUxpbmsuY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXNhYmxlZCcpKSB7XG4gICAgbmV3QWN0aXZlTGluay5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xuICB9XG5cbiAgZG9tSGVscGVycy5zZXRBY3RpdmUobmV3QWN0aXZlTGluaywgJ2FjdGl2ZScpO1xufTtcblxudmFyIGFjdGl2YXRlU3RlcCA9IGZ1bmN0aW9uKHN0ZXBOYW1lKSB7XG4gIGlmKHR5cGVvZiBzdGVwTmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgc3RlcE5hbWUpO1xuICB9XG5cbiAgdmFyIG5leHRTdGVwV3JhcHBlciA9IGRvY3VtZW50LmdldCgnc3RlcC0tJyArIHN0ZXBOYW1lKTtcbiAgZG9tSGVscGVycy5zZXRBY3RpdmUobmV4dFN0ZXBXcmFwcGVyLCAnc2hvdycpO1xufTtcblxudmFyIGJpbmRMaW5rQ2xpY2tlZCA9IGZ1bmN0aW9uKGUsIGhhbmRsZXIpIHtcbiAgdmFyIG5vZGVOYW1lID0gZS50YXJnZXQubm9kZU5hbWU7XG4gIHZhciBuZXh0U3RlcE5hbWUsIGNsaWNrZWRMaW5rO1xuXG4gIC8vSWYgaXQgaXMgdGhlICdSZXNldCBNb2RlbCcgYnV0dG9uXG4gIGlmIChub2RlTmFtZSA9PT0gJ0EnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKG5vZGVOYW1lID09PSAnU1BBTicpIHtcbiAgICBuZXh0U3RlcE5hbWUgPSBlLnRhcmdldC5kYXRhc2V0LnRlbXBsYXRlO1xuICAgIGNsaWNrZWRMaW5rID0gZS50YXJnZXQucGFyZW50Tm9kZTtcbiAgfSBlbHNlIGlmIChub2RlTmFtZSA9PT0gJ0xJJykge1xuICAgIG5leHRTdGVwTmFtZSA9IGUudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkLmRhdGFzZXQudGVtcGxhdGU7XG4gICAgY2xpY2tlZExpbmsgPSBlLnRhcmdldDtcbiAgfVxuXG4gIGlmICggY2xpY2tlZExpbmsgJiYgIWNsaWNrZWRMaW5rLmNsYXNzTGlzdC5jb250YWlucygnZGlzYWJsZWQnKSkge1xuICAgIGRvbUhlbHBlcnMuc2V0QWN0aXZlKGNsaWNrZWRMaW5rLCAnYWN0aXZlJyk7XG4gICAgYWN0aXZhdGVTdGVwKG5leHRTdGVwTmFtZSk7XG4gICAgaGFuZGxlcihuZXh0U3RlcE5hbWUpO1xuICB9XG59O1xuXG4vKipcbiAqIEFkZHMgJ2Rpc2FibGVkJyBjbGFzcyB0byBuYXZpZ2F0aW9uIGxpbmtzIGZyb20gdGhlIGl0ZW0gbnVtYmVyICdzdGFydCdcbiAqIEBwYXJhbSAge29iamVjdH0gZGF0YSBPYmplY3Qgd2l0aCB0aGUgbnVtYmVyIG9mIHRoZSBmaXJzdCBsaW5rIHRvIHN0YXJ0IHdpdGhcbiAqL1xudmFyIGRpc2FibGVMaW5rcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGxhc3RVc2VyU3RlcCA9IGRhdGEubGFzdFVzZXJTdGVwO1xuXG4gIGlmKHR5cGVvZiBsYXN0VXNlclN0ZXAgIT09ICdudW1iZXInKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGxhc3RVc2VyU3RlcCk7XG4gIH1cblxuICB2YXIgbmF2SXRlbXMgPSBzdGF0ZU1hcC5uYXYuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyk7XG5cbiAgLy9XZSBkaXNhYmxlIGxpbmtzIGFmdGVyIHRoZSBsYXN0IG9uZSBzZWVuIGJ5IHVzZXIgaW4gcHJldmlvdXMgc2Vzc2lvblxuICBmb3IgKHZhciBpID0gbGFzdFVzZXJTdGVwLCBsZW4gPSBuYXZJdGVtcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIG5hdkl0ZW1zW2ldLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG4gIH1cbn07XG5cbi8qKlxuICogUFVCTElDIEZVTkNUSU9OU1xuICovXG5cbnZhciBiaW5kID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgaWYoZXZlbnQgPT09ICdsaW5rQ2xpY2tlZCcpIHtcbiAgICBzdGF0ZU1hcC5uYXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICBiaW5kTGlua0NsaWNrZWQoZSwgaGFuZGxlcik7XG4gICAgfSk7XG4gIH1cbn07XG5cbnZhciBzZXRTdGF0ZU1hcCA9IGZ1bmN0aW9uKCkge1xuICBzdGF0ZU1hcC5uYXYgPSBkb2N1bWVudC5nZXQoJ25hdicpO1xufTtcblxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKGNtZCwgZGF0YSkge1xuICBzd2l0Y2goY21kKSB7XG4gICAgY2FzZSAnYWN0aXZhdGVTdGVwJzpcbiAgICAgIGFjdGl2YXRlU3RlcChkYXRhLnN0ZXBOYW1lKTtcbiAgICAgIGFjdGl2YXRlTmF2KGRhdGEuc3RlcE5hbWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGlzYWJsZUxpbmtzJzpcbiAgICAgIGRpc2FibGVMaW5rcyhkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmVycm9yKCdObyBjb21tYW5kIGZvdW5kLicpO1xuICAgICAgcmV0dXJuO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmluZDogYmluZCxcbiAgcmVuZGVyOiByZW5kZXIsXG4gIHNldFN0YXRlTWFwOiBzZXRTdGF0ZU1hcFxufTsiLCIvKipcbiAqIFNjcmVlbiAjOCAtIFJldGlyZW1lbnQgbW9kdWxlXG4gKiBAbW9kdWxlIDgtUmV0aXJlbWVudFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBzdGF0ZU1hcCA9IHtcbiAgdGJvZHk6IG51bGxcbn07XG5cbnZhciBhY3Rpb25UZW1wbGF0ZSA9ICc8dHI+PHRkPjxpIGNsYXNzPVwiem1kaSB6bWRpLWNoZWNrLWNpcmNsZSBzYXZlZFwiIGRhdGEtYWN0aW9uPVwie2luZGV4fVwiPjwvaT48L3RkPicgK1xuICAnPHRkPnt0b0RvfTwvdGQ+JyArXG4gICc8dGQ+e25vdFRvRG99PC90ZD4nICtcbiAgJzx0ZD48YSBjbGFzcz1cInptZGkgem1kaS1pbmZvLW91dGxpbmVcIiBkYXRhLXRvZ2dsZT1cInBvcG92ZXJcIiBkYXRhLXBsYWNlbWVudD1cImxlZnRcIiBkYXRhLWNvbnRlbnQ9XCJ7ZGV0YWlsc31cIiB0YWJpbmRleD1cIjBcIiByb2xlPVwiYnV0dG9uXCI+PC9hPjwvdGQ+PC90cj4nO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIERPTSBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXJrdXAgZm9yIHRoZSBnb2Fsc1xuICogQHBhcmFtICB7b2JqZWN0fSBnb2FsIE9iamVjdCBtYXAgd2l0aCBnb2FsIHByb3BlcnRpZXMgYW5kIGl0cyBhY3Rpb25zXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBnZXRBY3Rpb25zSFRNTCA9IGZ1bmN0aW9uKGdvYWwpIHtcbiAgdmFyIGlkID0gZ29hbC5pZDtcbiAgdmFyIGFjdGlvbnMgPSBnb2FsLmFjdGlvbnM7XG4gIHZhciB0aXRsZSA9IGdvYWwudGl0bGU7XG4gIHZhciBtYXJrdXAgPSAnJztcblxuICBpZiggKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpIHx8ICh0eXBlb2YgYWN0aW9ucyAhPT0gJ29iamVjdCcpICkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBnb2FsKTtcbiAgfVxuXG4gIG1hcmt1cCArPVxuICAgICc8dHIgY2xhc3M9XCInICsgaWQgKyAnXCI+JyArXG4gICAgICAnPHRkIGNvbHNwYW49XCI0XCI+PGg0PicgKyB0aXRsZSArICc8L2g0PjwvdGQ+JyArXG4gICAgJzwvdHI+JztcblxuICBhY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgdmFyIGRldGFpbHMgPSBhY3Rpb24uZGV0YWlscy5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgICByZXR1cm4gcHJldiArICc8bGk+JyArIGN1ciArICc8L2xpPic7XG4gICAgfSwgJycpO1xuXG4gICAgZGV0YWlscyA9ICc8dWw+JyArIGRldGFpbHMgKyAnPC91bD4nO1xuICAgIG1hcmt1cCArPSBoZWxwZXJzLnRlbXBsYXRlKGFjdGlvblRlbXBsYXRlLCB7XG4gICAgICBpZDogaWQsXG4gICAgICBpbmRleDogYWN0aW9uLmlkLFxuICAgICAgdG9EbzogYWN0aW9uLnRvRG8sXG4gICAgICBub3RUb0RvOiBhY3Rpb24ubm90VG9EbyxcbiAgICAgIGRldGFpbHM6IGRldGFpbHNcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIG1hcmt1cDtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUkVOREVSIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgc2hvd0dvYWxzQWN0aW9ucyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGdvYWxzID0gZGF0YTtcbiAgaWYoIUFycmF5LmlzQXJyYXkoZ29hbHMpKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGdvYWxzKTtcbiAgfVxuXG4gIGlmKGdvYWxzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGFjdGlvbnNIVE1MID0gJyc7XG5cbiAgZ29hbHMuZm9yRWFjaChmdW5jdGlvbihnb2FsKSB7XG4gICAgYWN0aW9uc0hUTUwgKz0gZ2V0QWN0aW9uc0hUTUwoZ29hbCk7XG4gIH0pO1xuXG4gIHN0YXRlTWFwLnRib2R5LmlubmVySFRNTCA9IGFjdGlvbnNIVE1MO1xufTtcblxuLyoqXG4gKiBQVUJMSUMgRlVOQ1RJT05TXG4gKi9cblxudmFyIGJpbmQgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICBpZiAoZXZlbnQgPT09ICdhY3Rpb25Ub2dnbGVkJykge1xuICAgIHN0YXRlTWFwLnRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09PSAnSScgJiYgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnem1kaS1jaGVjay1jaXJjbGUnKSkge1xuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSgnc2F2ZWQnKTtcbiAgICAgICAgY29uc29sZS5sb2codGFyZ2V0LmRhdGFzZXQuYWN0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKGNtZCwgZGF0YSkge1xuICBzd2l0Y2goY21kKSB7XG4gICAgY2FzZSAnc2hvd0dvYWxzQWN0aW9ucyc6XG4gICAgICBzaG93R29hbHNBY3Rpb25zKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY3JlYXRlUG9wb3ZlcnMnOlxuICAgICAgJCgnLnN0ZXAtLXBsYW4gLnptZGktaW5mby1vdXRsaW5lJykucG9wb3Zlcih7XG4gICAgICAgIGh0bWw6IHRydWUsXG4gICAgICAgIHRpdGxlOiAnRGV0YWlscycsXG4gICAgICAgIHRyaWdnZXI6ICdmb2N1cydcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGNvbW1hbmQgZm91bmQuJyk7XG4gICAgICByZXR1cm47XG4gIH1cbn07XG5cbnZhciBzZXRTdGF0ZU1hcCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICBzdGF0ZU1hcC50Ym9keSA9IGNvbnRhaW5lci5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGJvZHknKVswXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kOiBiaW5kLFxuICByZW5kZXI6IHJlbmRlcixcbiAgc2V0U3RhdGVNYXA6IHNldFN0YXRlTWFwXG59O1xuIiwiLyoqXG4gKiBTY3JlZW4gIzggLSBSZXRpcmVtZW50IG1vZHVsZVxuICogQG1vZHVsZSA4LVJldGlyZW1lbnRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBzdGF0ZU1hcCA9IHtcbiAgYWN0aW9uVGl0bGVzOiBudWxsLFxuICBwcmludEJ1dHRvbjogbnVsbFxufTtcblxuLyoqXG4gKiBET00gRlVOQ1RJT05TXG4gKi9cblxudmFyIHByaW50UGxhbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcHJpbnRQYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgaHRtbCA9ICc8aDEgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdXIgQWN0aW9uIFBsYW48L2gxPic7XG5cbiAgcHJpbnRQYWdlLmNsYXNzTGlzdC5hZGQoJ3ByaW50LXBhZ2UnKTtcblxuICB2YXIgcGxhbkFjdGlvbnMgPSBbe1xuICAgIHRpdGxlOiAnUGxheSBhIHN0YXktY2F0aW9uJyxcbiAgICB0eXBlOiAnVmFyaWFibGUgZXhwZW5zZScsXG4gICAgZGF0ZTogJ05vdmVtYmVyIDI4dGggMjAxNicsXG4gICAgZGV0YWlsczogJ0Jhbmsgd2hhdCB5b3Ugc2F2ZSdcbiAgfSwge1xuICAgIHRpdGxlOiAnUGxheSBhIHN0YXktY2F0aW9uJyxcbiAgICB0eXBlOiAnVmFyaWFibGUgZXhwZW5zZScsXG4gICAgZGF0ZTogJ05vdmVtYmVyIDI4dGggMjAxNicsXG4gICAgZGV0YWlsczogJ0Jhbmsgd2hhdCB5b3Ugc2F2ZSdcbiAgfSwge1xuICAgIHRpdGxlOiAnUGxheSBhIHN0YXktY2F0aW9uJyxcbiAgICB0eXBlOiAnVmFyaWFibGUgZXhwZW5zZScsXG4gICAgZGF0ZTogJ05vdmVtYmVyIDI4dGggMjAxNicsXG4gICAgZGV0YWlsczogJ0Jhbmsgd2hhdCB5b3Ugc2F2ZSdcbiAgfSwge1xuICAgIHRpdGxlOiAnUGxheSBhIHN0YXktY2F0aW9uJyxcbiAgICB0eXBlOiAnVmFyaWFibGUgZXhwZW5zZScsXG4gICAgZGF0ZTogJ05vdmVtYmVyIDI4dGggMjAxNicsXG4gICAgZGV0YWlsczogJ0Jhbmsgd2hhdCB5b3Ugc2F2ZSdcbiAgfSwge1xuICAgIHRpdGxlOiAnUGxheSBhIHN0YXktY2F0aW9uJyxcbiAgICB0eXBlOiAnVmFyaWFibGUgZXhwZW5zZScsXG4gICAgZGF0ZTogJ05vdmVtYmVyIDI4dGggMjAxNicsXG4gICAgZGV0YWlsczogJ0Jhbmsgd2hhdCB5b3Ugc2F2ZSdcbiAgfV07XG5cbiAgdmFyIHRIZWFkID0gJzx0YWJsZSBjbGFzcz1cInRhYmxlXCI+PHRoZWFkPjx0cj48dGg+VGl0bGU8L3RoPjx0aD50eXBlPC90aD48dGg+RGF0ZTwvdGg+PHRoPkRldGFpbHM8L3RoPjwvdHI+PC90aGVhZD4nLFxuICAgIHRCb2R5ID0gJzx0Ym9keT4nO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwbGFuQWN0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHRCb2R5ICs9ICc8dHI+PHRkPicgKyBwbGFuQWN0aW9uc1tpXS50aXRsZSArICc8L3RkPicgK1xuICAgICAgJzx0ZD4nICsgcGxhbkFjdGlvbnNbaV0udHlwZSArICc8L3RkPicgK1xuICAgICAgJzx0ZD4nICsgcGxhbkFjdGlvbnNbaV0uZGF0ZSArICc8L3RkPicgK1xuICAgICAgJzx0ZD4nICsgcGxhbkFjdGlvbnNbaV0uZGV0YWlscyArICc8L3RkPjx0cj4nO1xuICB9XG5cbiAgdEJvZHkgKz0gJzwvdGJvZHk+PC90YWJsZT4nO1xuICBodG1sICs9IHRIZWFkICsgdEJvZHk7XG5cbiAgcHJpbnRQYWdlLmlubmVySFRNTCA9IGh0bWw7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocHJpbnRQYWdlKTtcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCduby1wcmludCcpO1xuXG4gIHdpbmRvdy5wcmludCgpO1xuXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8tcHJpbnQnKTtcbiAgcHJpbnRQYWdlLmlubmVySFRNTCA9ICcnO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUFVCTElDIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgYmluZCA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gIGlmKGV2ZW50ID09PSAncHJpbnRDbGlja2VkJykge1xuICAgIHN0YXRlTWFwLnByaW50QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICBoYW5kbGVyKCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbnZhciByZW5kZXIgPSBmdW5jdGlvbihjbWQpIHtcbiAgc3dpdGNoKGNtZCkge1xuICAgIGNhc2UgJ2NyZWF0ZVBvcG92ZXJzJzpcbiAgICAgICQoJy5wbGFuLXdyYXBwZXIgLnptZGktaW5mby1vdXRsaW5lJykucG9wb3Zlcih7XG4gICAgICAgIHBsYWNlbWVudDogJ2xlZnQnXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZURhdGVwaWNrZXJzJzpcbiAgICAgICQoJy5wbGFuLXdyYXBwZXIgLnptZGktY2FsZW5kYXItYWx0JylcbiAgICAgICAgLmRhdGVwaWNrZXIoe1xuICAgICAgICAgIGF1dG9jbG9zZTogdHJ1ZSxcbiAgICAgICAgICBmb3JtYXQ6ICdNIGQgeXl5eSdcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdjaGFuZ2VEYXRlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICB0aGlzLmRhdGFzZXQuZGF0ZSA9IGV2ZW50LmZvcm1hdCgpO1xuICAgICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3ByaW50UGxhbic6XG4gICAgICBwcmludFBsYW4oKTtcbiAgICAgIGJyZWFrO1xuICB9XG59O1xuXG52YXIgc2V0U3RhdGVNYXAgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgc3RhdGVNYXAuYWN0aW9uVGl0bGVzID0gY29udGFpbmVyLmdldEFsbCgnYWN0aW9uX190aXRsZScpO1xuICBzdGF0ZU1hcC5wcmludEJ1dHRvbiA9IGNvbnRhaW5lci5nZXQoJ3ByaW50Jyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmluZDogYmluZCxcbiAgcmVuZGVyOiByZW5kZXIsXG4gIHNldFN0YXRlTWFwOiBzZXRTdGF0ZU1hcFxufTtcbiIsIi8qKlxuICogU2NyZWVuICM2IC0gU2NlbmFyaW9zIG1vZHVsZVxuICogQG1vZHVsZSA2LVNjZW5hcmlvc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG52YXIgZG9tSGVscGVycyA9IHJlcXVpcmUoJy4uL2RvbS1oZWxwZXJzJyk7XG52YXIgd051bWIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd051bWInXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dOdW1iJ10gOiBudWxsKTtcbnZhciBDaGFydGlzdCA9IHJlcXVpcmUoJ2NoYXJ0aXN0Jyk7XG5cbnZhciBzdGF0ZU1hcCA9IHtcbiAgaW5jb21lU2xpZGVyOiBudWxsLFxuICBpbnZlc3RtZW50UmF0ZVNsaWRlcjogbnVsbCxcbiAgcmV0aXJlbWVudFNsaWRlcjogbnVsbCxcblxuICBpbnZlc3RtZW50U3R5bGU6IG51bGwsXG4gIGxpbmVDaGFydDogbnVsbCxcbiAgcmV0aXJlbWVudFNhdmluZ3M6IG51bGxcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEhFTFBFUlMgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgbW9uZXlGb3JtYXQgPSB3TnVtYih7XG4gIHRob3VzYW5kOiAnLCdcbn0pO1xuXG4vKipcbiAqIHJldHVybnMgdGhlIGFubnVhbEludGVyZXN0UmF0ZSByZWxhdGl2ZSB0byBhIGdpdmVuIGludmVzdG1lbnQgc3R5bGVcbiAqIEBwYXJhbSAge3N0cmluZ30gaW52ZXN0bWVudFN0eWxlICAgU3R5bGUgb2YgaW52ZXN0bWVudFxuICogQHJldHVybiB7bnVtYmVyfSBhbm51YWxJbnRlcmVzdFJhdGVcbiAqL1xudmFyIGdldEludGVyZXN0QnlJbnZlc3RtZW50ID0gZnVuY3Rpb24oaW52ZXN0bWVudFN0eWxlKSB7XG4gIGlmKHR5cGVvZiBpbnZlc3RtZW50U3R5bGUgIT09ICdzdHJpbmcnKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGludmVzdG1lbnRTdHlsZSk7XG4gIH1cblxuICB2YXIgYW5udWFsSW50ZXJlc3RSYXRlO1xuXG4gIHN3aXRjaCAoaW52ZXN0bWVudFN0eWxlKSB7XG4gICAgY2FzZSAnc2FmZSc6XG4gICAgICBhbm51YWxJbnRlcmVzdFJhdGUgPSAwLjAyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW9kZXJhdGUnOlxuICAgICAgYW5udWFsSW50ZXJlc3RSYXRlID0gMC4wNjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Jpc2t5JzpcbiAgICAgIGFubnVhbEludGVyZXN0UmF0ZSA9IDAuMTU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYW5udWFsSW50ZXJlc3RSYXRlID0gMC4wNjtcbiAgfVxuXG4gIHJldHVybiBhbm51YWxJbnRlcmVzdFJhdGU7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGFjY3VtdWxhdGVkIG1vbmV5IHdpdGggdGhlIGNvbXBvdW5kIGludGVyZXN0XG4gKiBAcGFyYW0gIHtudW1iZXJ9IGludGVyZXN0UmF0ZSAlIG9mIGludGVyZXN0IChmcm9tIDAgdG8gMSlcbiAqIEBwYXJhbSAge251bWJlcn0gdGVybSBZZWFyc1xuICogQHBhcmFtICB7bnVtYmVyfSBhbXRJbnZlc3RlZCBJbml0aWFsIGludmVzdG1lbnRcbiAqIEBwYXJhbSAge251bWJlcn0gY29udHJpYkFtdCBZZWFybHkgY29udHJpYnV0aW9uXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbnZhciBnZXRBY2N1bXVsYXRlZFZhbHVlID0gZnVuY3Rpb24oaW50ZXJlc3RSYXRlLCB0ZXJtLCBhbXRJbnZlc3RlZCwgY29udHJpYkFtdCkge1xuICB2YXIgYXBwID0gW107XG4gIGFwcFswXSA9IGFtdEludmVzdGVkO1xuICB2YXIgdG90YWwgPSAwO1xuICB2YXIgbW9udGhseVRlcm0gPSB0ZXJtICogMTI7XG4gIHZhciBtb250aGx5Q29udHJpYkFtdCA9IGNvbnRyaWJBbXQgLyAxMjtcblxuICBmb3IgKHZhciBpID0gMTsgaSA8PSBtb250aGx5VGVybTsgaSsrKSB7XG4gICAgdmFyIGFwcHJlY2lhdGlvbiA9IChpbnRlcmVzdFJhdGUgLyAxMikgKiAoYXBwW2kgLSAxXSk7XG4gICAgYXBwW2ldID0gYXBwcmVjaWF0aW9uICsgYXBwW2kgLSAxXSArIG1vbnRobHlDb250cmliQW10O1xuICAgIHRvdGFsID0gYXBwW2kgLSAxXTtcbiAgfVxuICBhcHAgPSBudWxsO1xuICByZXR1cm4gTWF0aC5yb3VuZCh0b3RhbCk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSB2YWx1ZXMgZm9yIHggYXhpcyB0aWNrcy4gWW91IHBhc3MgdGhlIGZpcnN0XG4gKiBhbmQgbGFzdCB2YWx1ZXMgYXMgcGFyYW1ldGVycyBhbmQgaXQgcmV0dXJucyBhbHNvIHRoZSBvdGhlciB2YWx1ZXMgb2YgdGhlIHJhbmdlLlxuICogSW4gb3VyIGNhc2UgaXQncyB1c2VkIHRvIHNob3cgdGhlIHNhdmluZ3MgcHJvZ3Jlc3MgYXMgdGhlIHllYXJzIGluY3JlYXNlXG4gKiB0b3dhcmRzIHRoZSByZXRpcmVtZW50IGFnZS5cbiAqIEBwYXJhbSAge051bWJlcn0gZmlyc3RWYWx1ZSBGaXJzdCB2YWx1ZSBvZiB0aGUgYXhpc1xuICogQHBhcmFtICB7TnVtYmVyfSBsYXN0VmFsdWUgTGFzdCB2YWx1ZSBvZiB0aGUgYXhpc1xuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbnZhciBnZXRYVGlja3MgPSBmdW5jdGlvbihmaXJzdFZhbHVlLCBsYXN0VmFsdWUpIHtcbiAgaWYoIWhlbHBlcnMuaXNOdW1iZXIoZmlyc3RWYWx1ZSArIGxhc3RWYWx1ZSkpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywge2ZpcnN0VmFsdWU6IGZpcnN0VmFsdWUsIGxhc3RWYWx1ZTogbGFzdFZhbHVlfSk7XG4gIH1cblxuICB2YXIgdmFsdWVzID0gW107XG4gIC8vRmlyc3QgYW5kIGxhc3QgdmFsdWVzIG11c3QgYmUgcHJlY2lzZVxuICB2YWx1ZXNbMF0gPSBmaXJzdFZhbHVlO1xuICB2YWx1ZXNbNV0gPSBsYXN0VmFsdWU7XG5cbiAgdmFyIGRpZmZlcmVuY2UgPSAobGFzdFZhbHVlIC0gZmlyc3RWYWx1ZSkgLyA1O1xuICBmb3IgKHZhciBpID0gMTsgaSA8IDU7IGkrKykge1xuICAgIHZhbHVlc1tpXSA9IE1hdGgucm91bmQoZmlyc3RWYWx1ZSArIChkaWZmZXJlbmNlICogaSkpO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSB3aXRoIHRoZSBZIGF4aXMgdmFsdWVzXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgT2JqZWN0IHdpdGggZGF0YSBuZWVkZWQgZm9yIHRoZSBjYWxjdWxhdGlvblxuICogQHJldHVybiB7YXJyYXl9IHNlcmllIEFycmF5IHdpdGggWSBheGlzIHZhbHVlc1xuICogQGV4YW1wbGVcbiAqIGdldFlTZXJpZSh7XG4gKiAgIGluY29tZTogMzUwMDAsXG4gKiAgIGludmVzdG1lbnRSYXRlOiAxMDAsXG4gKiAgIHNhdmluZ3NSYXRlOiAzMCxcbiAqICAgY3VycmVudFNhdmluZ3M6IDIwMDAwLFxuICogICB4VGlja3M6IFsyMywgMzMsIDQzLCA1MywgNjMsIDczXSxcbiAqICAgYW5udWFsSW50ZXJlc3RSYXRlOiAwLjA2XG4gKiB9KVxuICovXG52YXIgZ2V0WVNlcmllID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgaW5jb21lID0gZGF0YS5pbmNvbWU7XG4gIHZhciBpbnZlc3RtZW50UmF0ZSA9IGRhdGEuaW52ZXN0bWVudFJhdGU7XG4gIHZhciBzYXZpbmdzUmF0ZSA9IGRhdGEuc2F2aW5nc1JhdGU7XG4gIHZhciBjdXJyZW50U2F2aW5ncyA9IGRhdGEuY3VycmVudFNhdmluZ3M7XG4gIHZhciB4VGlja3MgPSBkYXRhLnhUaWNrcztcbiAgdmFyIGFubnVhbEludGVyZXN0UmF0ZSA9ICBkYXRhLmFubnVhbEludGVyZXN0UmF0ZTtcblxuICBpZihcbiAgICAhaGVscGVycy5pc051bWJlcihpbmNvbWUgKyBpbnZlc3RtZW50UmF0ZSArIHNhdmluZ3NSYXRlICsgY3VycmVudFNhdmluZ3MgKyBhbm51YWxJbnRlcmVzdFJhdGUpIHx8XG4gICAgIUFycmF5LmlzQXJyYXkoeFRpY2tzKVxuICApIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICAvLyBXZSBhcmUgYWxzbyBjb25zaWRlcmluZyB0aGUgaW52ZXN0bWVudCByYXRlIGluIEFkdmFuY2VkIG9wdGlvbnMuXG4gIC8vIFNvIHRoaXMgaXMgKGFubnVhbFNhdmluZ3MgKiBpbnZlc3RtZW50UmF0ZSkgdG8gYmUgcHJlY2lzZS5cbiAgdmFyIGFubnVhbFNhdmluZ3MgPSAoc2F2aW5nc1JhdGUgLyAxMDApICogaW5jb21lICogKGludmVzdG1lbnRSYXRlIC8gMTAwKTtcblxuICB2YXIgaSA9IDA7XG4gIHZhciBzZXJpZSA9IFtdO1xuXG4gIC8vV2UgYXJlIHNldHRpbmdzIHRoZSBmaXJzdCBZIHZhbHVlIG9mIHRoZSBsaW5lIGNoYXJ0LCB3aGljaCBjb3JyZXNwb25kc1xuICAvL3RvIHRoZSBpbml0aWFsIGludmVzdG1lbnQuXG4gIHNlcmllWzBdID0gY3VycmVudFNhdmluZ3M7XG5cbiAgLy9XZSBjYWxjdWxhdGUgdGhlIG90aGVyIHZhbHVlcyBvZiBZIHNlcmllIHdpdGggdGhlIENvbXBvdW5kIGludGVyZXN0IGZ1bmN0aW9uXG4gIGZvciAoaSA9IDE7IGkgPCA2OyBpKz0gMSkge1xuICAgIHNlcmllW2ldID0gZ2V0QWNjdW11bGF0ZWRWYWx1ZShcbiAgICAgIGFubnVhbEludGVyZXN0UmF0ZSxcbiAgICAgIHhUaWNrc1tpXSAtIHhUaWNrc1swXSxcbiAgICAgIGN1cnJlbnRTYXZpbmdzLFxuICAgICAgYW5udWFsU2F2aW5nc1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gc2VyaWU7XG59O1xuXG52YXIgdXBkYXRlUmV0aXJlbWVudFNhdmluZ3MgPSBmdW5jdGlvbihyZXRpcmVtZW50U2F2aW5ncykge1xuICBzdGF0ZU1hcC5yZXRpcmVtZW50U2F2aW5ncy5jaGlsZE5vZGVzWzFdLnRleHRDb250ZW50ID0gbW9uZXlGb3JtYXQudG8ocmV0aXJlbWVudFNhdmluZ3MpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUkVOREVSIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbnZhciBzaG93U2xpZGVycyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGluY29tZSA9IGRhdGEuaW5jb21lO1xuICB2YXIgc2F2aW5nc1JhdGUgPSBkYXRhLnNhdmluZ3NSYXRlO1xuXG4gIC8vV2UgY2hlY2sgZGF0YSBhcmUgYWxsIG51bWJlcnMgYnkgc3VtbWluZyB0aGVtXG4gIGlmKCFoZWxwZXJzLmlzTnVtYmVyKGluY29tZSArIHNhdmluZ3NSYXRlKSkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHZhciBzYXZpbmdSYXRlT3B0aW9ucyA9IHtcbiAgICBzdGFydDogc2F2aW5nc1JhdGUsXG4gICAgc3RlcDogMSxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDEsXG4gICAgICAnbWF4JzogMTAwXG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAwXG4gICAgfSlcbiAgfTtcbiAgdmFyIGluY29tZU9wdGlvbnMgPSB7XG4gICAgc3RhcnQ6IGluY29tZSxcbiAgICBzdGVwOiAxMDAwLFxuICAgIHJhbmdlOiB7XG4gICAgICAnbWluJzogMTgwMDAsXG4gICAgICAnbWF4JzogMjAwMDAwXG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAxLFxuICAgICAgdGhvdXNhbmQ6ICcsJ1xuICAgIH0pXG4gIH07XG5cbiAgdmFyIGludmVzdG1lbnRPcHRpb25zID0ge1xuICAgIHN0YXJ0OiAxMDAsXG4gICAgc3RlcDogMSxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDEsXG4gICAgICAnbWF4JzogMTAwXG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAwXG4gICAgfSlcbiAgfTtcbiAgdmFyIHJldGlyZW1lbnRPcHRpb25zID0ge1xuICAgIHN0YXJ0OiA2NSxcbiAgICBzdGVwOiAxLFxuICAgIHJhbmdlOiB7XG4gICAgICAnbWluJzogNTUsXG4gICAgICAnbWF4JzogNzVcbiAgICB9LFxuICAgIGZvcm1hdDogd051bWIoe1xuICAgICAgZGVjaW1hbHM6IDBcbiAgICB9KVxuICB9O1xuXG4gIGRvbUhlbHBlcnMuY3JlYXRlU2xpZGVyKHN0YXRlTWFwLnNhdmluZ1JhdGVTbGlkZXIsIHNhdmluZ1JhdGVPcHRpb25zLCAnJScpO1xuICBkb21IZWxwZXJzLmNyZWF0ZVNsaWRlcihzdGF0ZU1hcC5pbmNvbWVTbGlkZXIsIGluY29tZU9wdGlvbnMsICckJyk7XG4gIGRvbUhlbHBlcnMuY3JlYXRlU2xpZGVyKHN0YXRlTWFwLmludmVzdG1lbnRSYXRlU2xpZGVyLCBpbnZlc3RtZW50T3B0aW9ucywgJyUnKTtcbiAgZG9tSGVscGVycy5jcmVhdGVTbGlkZXIoc3RhdGVNYXAucmV0aXJlbWVudFNsaWRlciwgcmV0aXJlbWVudE9wdGlvbnMpO1xufTtcblxudmFyIHNob3dMaW5lQ2hhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBhZ2UgPSBkYXRhLmFnZTtcbiAgdmFyIGluY29tZSA9IGRhdGEuaW5jb21lO1xuICB2YXIgc2F2aW5nc1JhdGUgPSBkYXRhLnNhdmluZ3NSYXRlO1xuICB2YXIgY3VycmVudFNhdmluZ3MgPSBkYXRhLmN1cnJlbnRTYXZpbmdzO1xuXG4gIGlmKCFoZWxwZXJzLmlzTnVtYmVyKGFnZSArIGluY29tZSArIHNhdmluZ3NSYXRlICsgY3VycmVudFNhdmluZ3MpKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgdmFyIGFubnVhbEludGVyZXN0UmF0ZSA9IDAuMDY7XG4gIHZhciBpbnZlc3RtZW50UmF0ZSA9IE51bWJlciggc3RhdGVNYXAuaW52ZXN0bWVudFJhdGVTbGlkZXIubm9VaVNsaWRlci5nZXQoKSApO1xuICB2YXIgcmV0aXJlbWVudEFnZSA9IE51bWJlciggc3RhdGVNYXAucmV0aXJlbWVudFNsaWRlci5ub1VpU2xpZGVyLmdldCgpICk7XG4gIHZhciB4VGlja3MgPSBnZXRYVGlja3MoYWdlLCByZXRpcmVtZW50QWdlKTtcbiAgdmFyIHlTZXJpZSA9IGdldFlTZXJpZSh7XG4gICAgaW5jb21lOiBpbmNvbWUsXG4gICAgaW52ZXN0bWVudFJhdGU6IGludmVzdG1lbnRSYXRlLFxuICAgIHNhdmluZ3NSYXRlOiBzYXZpbmdzUmF0ZSxcbiAgICBjdXJyZW50U2F2aW5nczogY3VycmVudFNhdmluZ3MsXG4gICAgeFRpY2tzOiB4VGlja3MsXG4gICAgYW5udWFsSW50ZXJlc3RSYXRlOiBhbm51YWxJbnRlcmVzdFJhdGVcbiAgfSk7XG4gIHZhciBjaGFydERhdGEgPSB7XG4gICAgbGFiZWxzOiB4VGlja3MsXG4gICAgc2VyaWVzOiBbeVNlcmllXVxuICB9O1xuICB2YXIgY2hhcnRPcHRpb25zID0ge1xuICAgIGF4aXNZOiB7XG4gICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAodmFsdWUvMTAwMCkgKyAnSyc7XG4gICAgICB9LFxuICAgICAgaGlnaDogMjAwMDAwMCxcbiAgICAgIHRpY2tzOiBbY3VycmVudFNhdmluZ3MsIDI1MDAwMCwgNTAwMDAwLCA3NTAwMDAsIDEwMDAwMDAsIDEyNTAwMDAsIDE1MDAwMDAsIDE3NTAwMDAsIDIwMDAwMDBdLFxuICAgICAgdHlwZTogQ2hhcnRpc3QuRml4ZWRTY2FsZUF4aXNcbiAgICB9LFxuICAgIHNob3dBcmVhOiB0cnVlLFxuICAgIHdpZHRoOiAnNDAwcHgnLFxuICAgIGhlaWdodDogJzI1MHB4J1xuICB9O1xuICB2YXIgcmVzcG9uc2l2ZU9wdGlvbnMgPSBbXG4gICAgWydzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ4MHB4KScsIHtcbiAgICAgIHdpZHRoOiAnMzAwcHgnXG4gICAgfV1cbiAgXTtcblxuICBzdGF0ZU1hcC5saW5lQ2hhcnQgPSBuZXcgQ2hhcnRpc3QuTGluZSgnLnNjZW5hcmlvX19jaGFydCcsIGNoYXJ0RGF0YSwgY2hhcnRPcHRpb25zLCByZXNwb25zaXZlT3B0aW9ucyk7XG4gIHVwZGF0ZVJldGlyZW1lbnRTYXZpbmdzKHlTZXJpZVs1XSk7XG59O1xuXG4vKipcbiAqIFVzZWQgYnkgc2hlbGwgdG8gc2V0IHRoZSBzbGlkZXJzIHZhbHVlcyB3aGVuIGRhdGEgaXMgY2hhbmdlZCBvbiBzb21lIG90aGVyXG4gKiBzY3JlZW5zLlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgT2JqZWN0IHdpdGggc2xpZGVyTmFtZSBhbmQgdmFsdWUgcHJvcGVydGllc1xuICovXG52YXIgc2V0U2xpZGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgc2xpZGVyTmFtZSA9IGRhdGEuc2xpZGVyTmFtZTtcbiAgdmFyIHZhbHVlID0gZGF0YS52YWx1ZTtcblxuICBpZiggKHR5cGVvZiBzbGlkZXJOYW1lICE9PSAnc3RyaW5nJykgfHwgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpICkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIGlmIChzbGlkZXJOYW1lID09PSAnaW5jb21lJykge1xuICAgIHN0YXRlTWFwLmluY29tZVNsaWRlci5ub1VpU2xpZGVyLnNldCh2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoc2xpZGVyTmFtZSA9PT0gJ3NhdmluZ3NSYXRlJykge1xuICAgIHN0YXRlTWFwLnNhdmluZ1JhdGVTbGlkZXIubm9VaVNsaWRlci5zZXQodmFsdWUpO1xuICB9XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIGxpbmUgY2hhcnQgd2l0aCBhIG5ldyBZIHNlcmllIHdoZW4gdXNlciBjaGFuZ2VzIGludmVzdG1lbnQgc3R5bGVcbiAqIEBwYXJhbSAge29iamVjdH0gZGF0YSBPYmplY3Qgd2l0aCB0aGUgZGF0YSBuZWVkZWQgdG8gY2FsY3VsYXRlIHRoZSBzZXJpZVxuICogQGV4YW1wbGVcbiAqIHVwZGF0ZUxpbmVDaGFydFNlcmllKHtcbiAqICAgaW5jb21lOiAzMDAwMCxcbiAqICAgaW52ZXN0bWVudFJhdGU6IDEwMCwgLy9vcHRpb25hbFxuICogICBzYXZpbmdzUmF0ZTogMzAsXG4gKiAgIGFubnVhbEludGVyZXN0UmF0ZTogMC4wNiwgLy9vcHRpb25hbFxuICogICBhZ2U6IDIwLFxuICogICByZXRpcmVtZW50QWdlOiA2NSwgLy9vcHRpb25hbFxuICogICBjdXJyZW50U2F2aW5nczogMjAwMDBcbiAqIH0pXG4gKi9cbnZhciB1cGRhdGVMaW5lQ2hhcnRTZXJpZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGxpbmVDaGFydCA9IHN0YXRlTWFwLmxpbmVDaGFydDtcbiAgdmFyIGNoYXJ0RGF0YSA9IGxpbmVDaGFydC5kYXRhO1xuICB2YXIgY2hhcnRPcHRpb25zID0gbGluZUNoYXJ0Lm9wdGlvbnM7XG5cbiAgdmFyIGFnZSA9IGRhdGEuYWdlO1xuICB2YXIgaW52ZXN0bWVudFJhdGUgPSBkYXRhLmludmVzdG1lbnRSYXRlIHx8IE51bWJlciggc3RhdGVNYXAuaW52ZXN0bWVudFJhdGVTbGlkZXIubm9VaVNsaWRlci5nZXQoKSApO1xuICB2YXIgYW5udWFsSW50ZXJlc3RSYXRlID0gZGF0YS5hbm51YWxJbnRlcmVzdFJhdGUgfHwgZ2V0SW50ZXJlc3RCeUludmVzdG1lbnQoIHN0YXRlTWFwLmludmVzdG1lbnRTdHlsZS5xdWVyeVNlbGVjdG9yKCdpbnB1dDpjaGVja2VkJykudmFsdWUgKTtcbiAgdmFyIHJldGlyZW1lbnRBZ2UgPSBkYXRhLnJldGlyZW1lbnRBZ2UgfHwgTnVtYmVyKCBzdGF0ZU1hcC5yZXRpcmVtZW50U2xpZGVyLm5vVWlTbGlkZXIuZ2V0KCkgKSA7XG4gIHZhciB4VGlja3MgPSBnZXRYVGlja3MoYWdlLCByZXRpcmVtZW50QWdlKTtcblxuICBpZighQXJyYXkuaXNBcnJheSh4VGlja3MpKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgdmFyIHlTZXJpZSA9IGdldFlTZXJpZSh7XG4gICAgaW5jb21lOiBkYXRhLmluY29tZSxcbiAgICBpbnZlc3RtZW50UmF0ZTogaW52ZXN0bWVudFJhdGUsXG4gICAgc2F2aW5nc1JhdGU6IGRhdGEuc2F2aW5nc1JhdGUsXG4gICAgYW5udWFsSW50ZXJlc3RSYXRlOiBhbm51YWxJbnRlcmVzdFJhdGUsXG4gICAgY3VycmVudFNhdmluZ3M6IGRhdGEuY3VycmVudFNhdmluZ3MsXG4gICAgeFRpY2tzOiB4VGlja3NcbiAgfSk7XG5cbiAgY2hhcnREYXRhLmxhYmVscyA9IHhUaWNrcztcbiAgY2hhcnREYXRhLnNlcmllc1swXSA9IHlTZXJpZTtcbiAgY2hhcnRPcHRpb25zLmF4aXNZLnRpY2tzWzBdID0gZGF0YS5jdXJyZW50U2F2aW5ncztcblxuICBsaW5lQ2hhcnQudXBkYXRlKGNoYXJ0RGF0YSwgY2hhcnRPcHRpb25zKTtcbiAgdXBkYXRlUmV0aXJlbWVudFNhdmluZ3MoeVNlcmllWzVdKTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUFVCTGlDIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgYmluZCA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gIHN3aXRjaChldmVudCkge1xuICAgIGNhc2UgJ2FubnVhbEludGVyZXN0UmF0ZUNoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuaW52ZXN0bWVudFN0eWxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaGFuZGxlciggZ2V0SW50ZXJlc3RCeUludmVzdG1lbnQoZS50YXJnZXQudmFsdWUpICk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NhdmluZ3NSYXRlQ2hhbmdlZCc6XG4gICAgICBzdGF0ZU1hcC5zYXZpbmdSYXRlU2xpZGVyLm5vVWlTbGlkZXIub24oJ3NldCcsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBoYW5kbGVyKE51bWJlcih2YWx1ZXNbMF0pKTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaW5jb21lQ2hhbmdlZCc6XG4gICAgICBzdGF0ZU1hcC5pbmNvbWVTbGlkZXIubm9VaVNsaWRlci5vbignc2V0JywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBpbmNvbWUgPSBOdW1iZXIodmFsdWVzWzBdLnJlcGxhY2UoJywnLCAnJykpO1xuICAgICAgICBoYW5kbGVyKGluY29tZSk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ludmVzdG1lbnRSYXRlQ2hhbmdlZCc6XG4gICAgICBzdGF0ZU1hcC5pbnZlc3RtZW50UmF0ZVNsaWRlci5ub1VpU2xpZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaGFuZGxlcihOdW1iZXIodmFsdWVzWzBdKSk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JldGlyZW1lbnRBZ2VDaGFuZ2VkJzpcbiAgICAgIHN0YXRlTWFwLnJldGlyZW1lbnRTbGlkZXIubm9VaVNsaWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIGhhbmRsZXIoTnVtYmVyKHZhbHVlc1swXSkpO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5lcnJvcignTm8gYmluZCBldmVudCBmb3VuZC4nKTtcbiAgICAgIHJldHVybjtcbiAgfVxufTtcblxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKGNtZCwgZGF0YSkge1xuICBzd2l0Y2goY21kKSB7XG4gICAgY2FzZSAnc2V0U2xpZGVyJzpcbiAgICAgIHNldFNsaWRlcihkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3dTbGlkZXJzJzpcbiAgICAgIHNob3dTbGlkZXJzKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2hvd0xpbmVDaGFydCc6XG4gICAgICBzaG93TGluZUNoYXJ0KGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndXBkYXRlTGluZUNoYXJ0U2VyaWUnOlxuICAgICAgdXBkYXRlTGluZUNoYXJ0U2VyaWUoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5lcnJvcignTm8gY29tbWFuZCBmb3VuZC4nKTtcbiAgICAgIHJldHVybjtcbiAgfVxufTtcblxudmFyIHNldFN0YXRlTWFwID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gIHN0YXRlTWFwLnNhdmluZ1JhdGVTbGlkZXIgPSBjb250YWluZXIuZ2V0KCdvcHRpb25fX3NsaWRlci0tc2F2aW5nJyk7XG4gIHN0YXRlTWFwLmluY29tZVNsaWRlciA9IGNvbnRhaW5lci5nZXQoJ29wdGlvbl9fc2xpZGVyLS1pbmNvbWUnKTtcbiAgc3RhdGVNYXAuaW52ZXN0bWVudFJhdGVTbGlkZXIgPSBjb250YWluZXIuZ2V0KCdvcHRpb25fX3NsaWRlci0taW52ZXN0bWVudCcpO1xuICBzdGF0ZU1hcC5yZXRpcmVtZW50U2xpZGVyID0gY29udGFpbmVyLmdldCgnb3B0aW9uX19zbGlkZXItLXJldGlyZW1lbnQnKTtcblxuICBzdGF0ZU1hcC5pbnZlc3RtZW50U3R5bGUgPSBjb250YWluZXIuZ2V0KCdpbnZlc3RtZW50Jyk7XG5cbiAgc3RhdGVNYXAucmV0aXJlbWVudFNhdmluZ3MgPSBjb250YWluZXIuZ2V0KCdzYXZpbmdzX19hbW91bnQnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kOiBiaW5kLFxuICByZW5kZXI6IHJlbmRlcixcbiAgc2V0U3RhdGVNYXA6IHNldFN0YXRlTWFwXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhdG9hIChhLCBuKSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhLCBuKTsgfVxuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUgdW5sZXNzIGFtZE1vZHVsZUlkIGlzIHNldFxuICAgIGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIChyb290WydDaGFydGlzdCddID0gZmFjdG9yeSgpKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAvLyBsaWtlIE5vZGUuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdFsnQ2hhcnRpc3QnXSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbi8qIENoYXJ0aXN0LmpzIDAuOS41XG4gKiBDb3B5cmlnaHQgwqkgMjAxNSBHaW9uIEt1bnpcbiAqIEZyZWUgdG8gdXNlIHVuZGVyIHRoZSBXVEZQTCBsaWNlbnNlLlxuICogaHR0cDovL3d3dy53dGZwbC5uZXQvXG4gKi9cbi8qKlxuICogVGhlIGNvcmUgbW9kdWxlIG9mIENoYXJ0aXN0IHRoYXQgaXMgbWFpbmx5IHByb3ZpZGluZyBzdGF0aWMgZnVuY3Rpb25zIGFuZCBoaWdoZXIgbGV2ZWwgZnVuY3Rpb25zIGZvciBjaGFydCBtb2R1bGVzLlxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuQ29yZVxuICovXG52YXIgQ2hhcnRpc3QgPSB7XG4gIHZlcnNpb246ICcwLjkuNSdcbn07XG5cbihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBIZWxwcyB0byBzaW1wbGlmeSBmdW5jdGlvbmFsIHN0eWxlIGNvZGVcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHsqfSBuIFRoaXMgZXhhY3QgdmFsdWUgd2lsbCBiZSByZXR1cm5lZCBieSB0aGUgbm9vcCBmdW5jdGlvblxuICAgKiBAcmV0dXJuIHsqfSBUaGUgc2FtZSB2YWx1ZSB0aGF0IHdhcyBwcm92aWRlZCB0byB0aGUgbiBwYXJhbWV0ZXJcbiAgICovXG4gIENoYXJ0aXN0Lm5vb3AgPSBmdW5jdGlvbiAobikge1xuICAgIHJldHVybiBuO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYS16IGZyb20gYSBudW1iZXIgMCB0byAyNlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcn0gbiBBIG51bWJlciBmcm9tIDAgdG8gMjYgdGhhdCB3aWxsIHJlc3VsdCBpbiBhIGxldHRlciBhLXpcbiAgICogQHJldHVybiB7U3RyaW5nfSBBIGNoYXJhY3RlciBmcm9tIGEteiBiYXNlZCBvbiB0aGUgaW5wdXQgbnVtYmVyIG5cbiAgICovXG4gIENoYXJ0aXN0LmFscGhhTnVtZXJhdGUgPSBmdW5jdGlvbiAobikge1xuICAgIC8vIExpbWl0IHRvIGEtelxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDk3ICsgbiAlIDI2KTtcbiAgfTtcblxuICAvKipcbiAgICogU2ltcGxlIHJlY3Vyc2l2ZSBvYmplY3QgZXh0ZW5kXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgVGFyZ2V0IG9iamVjdCB3aGVyZSB0aGUgc291cmNlIHdpbGwgYmUgbWVyZ2VkIGludG9cbiAgICogQHBhcmFtIHtPYmplY3QuLi59IHNvdXJjZXMgVGhpcyBvYmplY3QgKG9iamVjdHMpIHdpbGwgYmUgbWVyZ2VkIGludG8gdGFyZ2V0IGFuZCB0aGVuIHRhcmdldCBpcyByZXR1cm5lZFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCB0aGF0IGhhcyB0aGUgc2FtZSByZWZlcmVuY2UgYXMgdGFyZ2V0IGJ1dCBpcyBleHRlbmRlZCBhbmQgbWVyZ2VkIHdpdGggdGhlIHByb3BlcnRpZXMgb2Ygc291cmNlXG4gICAqL1xuICBDaGFydGlzdC5leHRlbmQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHt9O1xuXG4gICAgdmFyIHNvdXJjZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc291cmNlW3Byb3BdID09PSAnb2JqZWN0JyAmJiBzb3VyY2VbcHJvcF0gIT09IG51bGwgJiYgIShzb3VyY2VbcHJvcF0gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBDaGFydGlzdC5leHRlbmQoe30sIHRhcmdldFtwcm9wXSwgc291cmNlW3Byb3BdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIGFsbCBvY2N1cnJlbmNlcyBvZiBzdWJTdHIgaW4gc3RyIHdpdGggbmV3U3ViU3RyIGFuZCByZXR1cm5zIGEgbmV3IHN0cmluZy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3ViU3RyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuZXdTdWJTdHJcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cbiAgQ2hhcnRpc3QucmVwbGFjZUFsbCA9IGZ1bmN0aW9uKHN0ciwgc3ViU3RyLCBuZXdTdWJTdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChzdWJTdHIsICdnJyksIG5ld1N1YlN0cik7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgbnVtYmVyIHRvIGEgc3RyaW5nIHdpdGggYSB1bml0LiBJZiBhIHN0cmluZyBpcyBwYXNzZWQgdGhlbiB0aGlzIHdpbGwgYmUgcmV0dXJuZWQgdW5tb2RpZmllZC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1bml0XG4gICAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyB0aGUgcGFzc2VkIG51bWJlciB2YWx1ZSB3aXRoIHVuaXQuXG4gICAqL1xuICBDaGFydGlzdC5lbnN1cmVVbml0ID0gZnVuY3Rpb24odmFsdWUsIHVuaXQpIHtcbiAgICBpZih0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlICsgdW5pdDtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgbnVtYmVyIG9yIHN0cmluZyB0byBhIHF1YW50aXR5IG9iamVjdC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBpbnB1dFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHZhbHVlIGFzIG51bWJlciBhbmQgdGhlIHVuaXQgYXMgc3RyaW5nLlxuICAgKi9cbiAgQ2hhcnRpc3QucXVhbnRpdHkgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIgbWF0Y2ggPSAoL14oXFxkKylcXHMqKC4qKSQvZykuZXhlYyhpbnB1dCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZSA6ICttYXRjaFsxXSxcbiAgICAgICAgdW5pdDogbWF0Y2hbMl0gfHwgdW5kZWZpbmVkXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4geyB2YWx1ZTogaW5wdXQgfTtcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBpcyBhIHdyYXBwZXIgYXJvdW5kIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgdGhhdCB3aWxsIHJldHVybiB0aGUgcXVlcnkgaWYgaXQncyBhbHJlYWR5IG9mIHR5cGUgTm9kZVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge1N0cmluZ3xOb2RlfSBxdWVyeSBUaGUgcXVlcnkgdG8gdXNlIGZvciBzZWxlY3RpbmcgYSBOb2RlIG9yIGEgRE9NIG5vZGUgdGhhdCB3aWxsIGJlIHJldHVybmVkIGRpcmVjdGx5XG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuICBDaGFydGlzdC5xdWVyeVNlbGVjdG9yID0gZnVuY3Rpb24ocXVlcnkpIHtcbiAgICByZXR1cm4gcXVlcnkgaW5zdGFuY2VvZiBOb2RlID8gcXVlcnkgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHF1ZXJ5KTtcbiAgfTtcblxuICAvKipcbiAgICogRnVuY3Rpb25hbCBzdHlsZSBoZWxwZXIgdG8gcHJvZHVjZSBhcnJheSB3aXRoIGdpdmVuIGxlbmd0aCBpbml0aWFsaXplZCB3aXRoIHVuZGVmaW5lZCB2YWx1ZXNcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIGxlbmd0aFxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIENoYXJ0aXN0LnRpbWVzID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgcmV0dXJuIEFycmF5LmFwcGx5KG51bGwsIG5ldyBBcnJheShsZW5ndGgpKTtcbiAgfTtcblxuICAvKipcbiAgICogU3VtIGhlbHBlciB0byBiZSB1c2VkIGluIHJlZHVjZSBmdW5jdGlvbnNcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHByZXZpb3VzXG4gICAqIEBwYXJhbSBjdXJyZW50XG4gICAqIEByZXR1cm4geyp9XG4gICAqL1xuICBDaGFydGlzdC5zdW0gPSBmdW5jdGlvbihwcmV2aW91cywgY3VycmVudCkge1xuICAgIHJldHVybiBwcmV2aW91cyArIChjdXJyZW50ID8gY3VycmVudCA6IDApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBNdWx0aXBseSBoZWxwZXIgdG8gYmUgdXNlZCBpbiBgQXJyYXkubWFwYCBmb3IgbXVsdGlwbHlpbmcgZWFjaCB2YWx1ZSBvZiBhbiBhcnJheSB3aXRoIGEgZmFjdG9yLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcn0gZmFjdG9yXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCBpbiBgQXJyYXkubWFwYCB0byBtdWx0aXBseSBlYWNoIHZhbHVlIGluIGFuIGFycmF5XG4gICAqL1xuICBDaGFydGlzdC5tYXBNdWx0aXBseSA9IGZ1bmN0aW9uKGZhY3Rvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihudW0pIHtcbiAgICAgIHJldHVybiBudW0gKiBmYWN0b3I7XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIGhlbHBlciB0byBiZSB1c2VkIGluIGBBcnJheS5tYXBgIGZvciBhZGRpbmcgYSBhZGRlbmQgdG8gZWFjaCB2YWx1ZSBvZiBhbiBhcnJheS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFkZGVuZFxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgaW4gYEFycmF5Lm1hcGAgdG8gYWRkIGEgYWRkZW5kIHRvIGVhY2ggdmFsdWUgaW4gYW4gYXJyYXlcbiAgICovXG4gIENoYXJ0aXN0Lm1hcEFkZCA9IGZ1bmN0aW9uKGFkZGVuZCkge1xuICAgIHJldHVybiBmdW5jdGlvbihudW0pIHtcbiAgICAgIHJldHVybiBudW0gKyBhZGRlbmQ7XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogTWFwIGZvciBtdWx0aSBkaW1lbnNpb25hbCBhcnJheXMgd2hlcmUgdGhlaXIgbmVzdGVkIGFycmF5cyB3aWxsIGJlIG1hcHBlZCBpbiBzZXJpYWwuIFRoZSBvdXRwdXQgYXJyYXkgd2lsbCBoYXZlIHRoZSBsZW5ndGggb2YgdGhlIGxhcmdlc3QgbmVzdGVkIGFycmF5LiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdmFyaWFibGUgYXJndW1lbnRzIHdoZXJlIGVhY2ggYXJndW1lbnQgaXMgdGhlIG5lc3RlZCBhcnJheSB2YWx1ZSAob3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBtb3JlIHZhbHVlcykuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSBhcnJcbiAgICogQHBhcmFtIGNiXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgQ2hhcnRpc3Quc2VyaWFsTWFwID0gZnVuY3Rpb24oYXJyLCBjYikge1xuICAgIHZhciByZXN1bHQgPSBbXSxcbiAgICAgICAgbGVuZ3RoID0gTWF0aC5tYXguYXBwbHkobnVsbCwgYXJyLm1hcChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIGUubGVuZ3RoO1xuICAgICAgICB9KSk7XG5cbiAgICBDaGFydGlzdC50aW1lcyhsZW5ndGgpLmZvckVhY2goZnVuY3Rpb24oZSwgaW5kZXgpIHtcbiAgICAgIHZhciBhcmdzID0gYXJyLm1hcChmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBlW2luZGV4XTtcbiAgICAgIH0pO1xuXG4gICAgICByZXN1bHRbaW5kZXhdID0gY2IuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIGhlbHBlciBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byByb3VuZCB2YWx1ZXMgd2l0aCBjZXJ0YWluIHByZWNpc2lvbiBsZXZlbCBhZnRlciBkZWNpbWFsLiBUaGlzIGlzIHVzZWQgdG8gcHJldmVudCByb3VuZGluZyBlcnJvcnMgbmVhciBmbG9hdCBwb2ludCBwcmVjaXNpb24gbGltaXQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSBUaGUgdmFsdWUgdGhhdCBzaG91bGQgYmUgcm91bmRlZCB3aXRoIHByZWNpc2lvblxuICAgKiBAcGFyYW0ge051bWJlcn0gW2RpZ2l0c10gVGhlIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZGVjaW1hbCB1c2VkIHRvIGRvIHRoZSByb3VuZGluZ1xuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSb3VuZGVkIHZhbHVlXG4gICAqL1xuICBDaGFydGlzdC5yb3VuZFdpdGhQcmVjaXNpb24gPSBmdW5jdGlvbih2YWx1ZSwgZGlnaXRzKSB7XG4gICAgdmFyIHByZWNpc2lvbiA9IE1hdGgucG93KDEwLCBkaWdpdHMgfHwgQ2hhcnRpc3QucHJlY2lzaW9uKTtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAqIHByZWNpc2lvbikgLyBwcmVjaXNpb247XG4gIH07XG5cbiAgLyoqXG4gICAqIFByZWNpc2lvbiBsZXZlbCB1c2VkIGludGVybmFsbHkgaW4gQ2hhcnRpc3QgZm9yIHJvdW5kaW5nLiBJZiB5b3UgcmVxdWlyZSBtb3JlIGRlY2ltYWwgcGxhY2VzIHlvdSBjYW4gaW5jcmVhc2UgdGhpcyBudW1iZXIuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqL1xuICBDaGFydGlzdC5wcmVjaXNpb24gPSA4O1xuXG4gIC8qKlxuICAgKiBBIG1hcCB3aXRoIGNoYXJhY3RlcnMgdG8gZXNjYXBlIGZvciBzdHJpbmdzIHRvIGJlIHNhZmVseSB1c2VkIGFzIGF0dHJpYnV0ZSB2YWx1ZXMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBDaGFydGlzdC5lc2NhcGluZ01hcCA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgJ1xcJyc6ICcmIzAzOTsnXG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gc2VyaWFsaXplcyBhcmJpdHJhcnkgZGF0YSB0byBhIHN0cmluZy4gSW4gY2FzZSBvZiBkYXRhIHRoYXQgY2FuJ3QgYmUgZWFzaWx5IGNvbnZlcnRlZCB0byBhIHN0cmluZywgdGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSBhIHdyYXBwZXIgb2JqZWN0IGFuZCBzZXJpYWxpemUgdGhlIGRhdGEgdXNpbmcgSlNPTi5zdHJpbmdpZnkuIFRoZSBvdXRjb21pbmcgc3RyaW5nIHdpbGwgYWx3YXlzIGJlIGVzY2FwZWQgdXNpbmcgQ2hhcnRpc3QuZXNjYXBpbmdNYXAuXG4gICAqIElmIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkIHRoZSBmdW5jdGlvbiB3aWxsIHJldHVybiBpbW1lZGlhdGVseSB3aXRoIG51bGwgb3IgdW5kZWZpbmVkLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcnxTdHJpbmd8T2JqZWN0fSBkYXRhXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG4gIENoYXJ0aXN0LnNlcmlhbGl6ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZihkYXRhID09PSBudWxsIHx8IGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJykge1xuICAgICAgZGF0YSA9ICcnK2RhdGE7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgZGF0YSA9IEpTT04uc3RyaW5naWZ5KHtkYXRhOiBkYXRhfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKENoYXJ0aXN0LmVzY2FwaW5nTWFwKS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBrZXkpIHtcbiAgICAgIHJldHVybiBDaGFydGlzdC5yZXBsYWNlQWxsKHJlc3VsdCwga2V5LCBDaGFydGlzdC5lc2NhcGluZ01hcFtrZXldKTtcbiAgICB9LCBkYXRhKTtcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBkZS1zZXJpYWxpemVzIGEgc3RyaW5nIHByZXZpb3VzbHkgc2VyaWFsaXplZCB3aXRoIENoYXJ0aXN0LnNlcmlhbGl6ZS4gVGhlIHN0cmluZyB3aWxsIGFsd2F5cyBiZSB1bmVzY2FwZWQgdXNpbmcgQ2hhcnRpc3QuZXNjYXBpbmdNYXAgYmVmb3JlIGl0J3MgcmV0dXJuZWQuIEJhc2VkIG9uIHRoZSBpbnB1dCB2YWx1ZSB0aGUgcmV0dXJuIHR5cGUgY2FuIGJlIE51bWJlciwgU3RyaW5nIG9yIE9iamVjdC4gSlNPTi5wYXJzZSBpcyB1c2VkIHdpdGggdHJ5IC8gY2F0Y2ggdG8gc2VlIGlmIHRoZSB1bmVzY2FwZWQgc3RyaW5nIGNhbiBiZSBwYXJzZWQgaW50byBhbiBPYmplY3QgYW5kIHRoaXMgT2JqZWN0IHdpbGwgYmUgcmV0dXJuZWQgb24gc3VjY2Vzcy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGFcbiAgICogQHJldHVybiB7U3RyaW5nfE51bWJlcnxPYmplY3R9XG4gICAqL1xuICBDaGFydGlzdC5kZXNlcmlhbGl6ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZih0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIGRhdGEgPSBPYmplY3Qua2V5cyhDaGFydGlzdC5lc2NhcGluZ01hcCkucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KSB7XG4gICAgICByZXR1cm4gQ2hhcnRpc3QucmVwbGFjZUFsbChyZXN1bHQsIENoYXJ0aXN0LmVzY2FwaW5nTWFwW2tleV0sIGtleSk7XG4gICAgfSwgZGF0YSk7XG5cbiAgICB0cnkge1xuICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICBkYXRhID0gZGF0YS5kYXRhICE9PSB1bmRlZmluZWQgPyBkYXRhLmRhdGEgOiBkYXRhO1xuICAgIH0gY2F0Y2goZSkge31cblxuICAgIHJldHVybiBkYXRhO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgb3IgcmVpbml0aWFsaXplIHRoZSBTVkcgZWxlbWVudCBmb3IgdGhlIGNoYXJ0XG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7Tm9kZX0gY29udGFpbmVyIFRoZSBjb250YWluaW5nIERPTSBOb2RlIG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB0byBwbGFudCB0aGUgU1ZHIGVsZW1lbnRcbiAgICogQHBhcmFtIHtTdHJpbmd9IHdpZHRoIFNldCB0aGUgd2lkdGggb2YgdGhlIFNWRyBlbGVtZW50LiBEZWZhdWx0IGlzIDEwMCVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGhlaWdodCBTZXQgdGhlIGhlaWdodCBvZiB0aGUgU1ZHIGVsZW1lbnQuIERlZmF1bHQgaXMgMTAwJVxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIFNwZWNpZnkgYSBjbGFzcyB0byBiZSBhZGRlZCB0byB0aGUgU1ZHIGVsZW1lbnRcbiAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY3JlYXRlZC9yZWluaXRpYWxpemVkIFNWRyBlbGVtZW50XG4gICAqL1xuICBDaGFydGlzdC5jcmVhdGVTdmcgPSBmdW5jdGlvbiAoY29udGFpbmVyLCB3aWR0aCwgaGVpZ2h0LCBjbGFzc05hbWUpIHtcbiAgICB2YXIgc3ZnO1xuXG4gICAgd2lkdGggPSB3aWR0aCB8fCAnMTAwJSc7XG4gICAgaGVpZ2h0ID0gaGVpZ2h0IHx8ICcxMDAlJztcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcHJldmlvdXMgU1ZHIGVsZW1lbnQgaW4gdGhlIGNvbnRhaW5lciB0aGF0IGNvbnRhaW5zIHRoZSBDaGFydGlzdCBYTUwgbmFtZXNwYWNlIGFuZCByZW1vdmUgaXRcbiAgICAvLyBTaW5jZSB0aGUgRE9NIEFQSSBkb2VzIG5vdCBzdXBwb3J0IG5hbWVzcGFjZXMgd2UgbmVlZCB0byBtYW51YWxseSBzZWFyY2ggdGhlIHJldHVybmVkIGxpc3QgaHR0cDovL3d3dy53My5vcmcvVFIvc2VsZWN0b3JzLWFwaS9cbiAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnc3ZnJykpLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJDaGFydGlzdFN2Z09iamVjdHMoc3ZnKSB7XG4gICAgICByZXR1cm4gc3ZnLmdldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zLycsIENoYXJ0aXN0LnhtbE5zLnByZWZpeCk7XG4gICAgfSkuZm9yRWFjaChmdW5jdGlvbiByZW1vdmVQcmV2aW91c0VsZW1lbnQoc3ZnKSB7XG4gICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoc3ZnKTtcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBzdmcgb2JqZWN0IHdpdGggd2lkdGggYW5kIGhlaWdodCBvciB1c2UgMTAwJSBhcyBkZWZhdWx0XG4gICAgc3ZnID0gbmV3IENoYXJ0aXN0LlN2Zygnc3ZnJykuYXR0cih7XG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH0pLmFkZENsYXNzKGNsYXNzTmFtZSkuYXR0cih7XG4gICAgICBzdHlsZTogJ3dpZHRoOiAnICsgd2lkdGggKyAnOyBoZWlnaHQ6ICcgKyBoZWlnaHQgKyAnOydcbiAgICB9KTtcblxuICAgIC8vIEFkZCB0aGUgRE9NIG5vZGUgdG8gb3VyIGNvbnRhaW5lclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzdmcuX25vZGUpO1xuXG4gICAgcmV0dXJuIHN2ZztcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBSZXZlcnNlcyB0aGUgc2VyaWVzLCBsYWJlbHMgYW5kIHNlcmllcyBkYXRhIGFycmF5cy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIGRhdGFcbiAgICovXG4gIENoYXJ0aXN0LnJldmVyc2VEYXRhID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGRhdGEubGFiZWxzLnJldmVyc2UoKTtcbiAgICBkYXRhLnNlcmllcy5yZXZlcnNlKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnNlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYodHlwZW9mKGRhdGEuc2VyaWVzW2ldKSA9PT0gJ29iamVjdCcgJiYgZGF0YS5zZXJpZXNbaV0uZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRhdGEuc2VyaWVzW2ldLmRhdGEucmV2ZXJzZSgpO1xuICAgICAgfSBlbHNlIGlmKGRhdGEuc2VyaWVzW2ldIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZGF0YS5zZXJpZXNbaV0ucmV2ZXJzZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ29udmVydCBkYXRhIHNlcmllcyBpbnRvIHBsYWluIGFycmF5XG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBzZXJpZXMgb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgdG8gYmUgdmlzdWFsaXplZCBpbiB0aGUgY2hhcnRcbiAgICogQHBhcmFtIHtCb29sZWFufSByZXZlcnNlIElmIHRydWUgdGhlIHdob2xlIGRhdGEgaXMgcmV2ZXJzZWQgYnkgdGhlIGdldERhdGFBcnJheSBjYWxsLiBUaGlzIHdpbGwgbW9kaWZ5IHRoZSBkYXRhIG9iamVjdCBwYXNzZWQgYXMgZmlyc3QgcGFyYW1ldGVyLiBUaGUgbGFiZWxzIGFzIHdlbGwgYXMgdGhlIHNlcmllcyBvcmRlciBpcyByZXZlcnNlZC4gVGhlIHdob2xlIHNlcmllcyBkYXRhIGFycmF5cyBhcmUgcmV2ZXJzZWQgdG9vLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG11bHRpIENyZWF0ZSBhIG11bHRpIGRpbWVuc2lvbmFsIGFycmF5IGZyb20gYSBzZXJpZXMgZGF0YSBhcnJheSB3aGVyZSBhIHZhbHVlIG9iamVjdCB3aXRoIGB4YCBhbmQgYHlgIHZhbHVlcyB3aWxsIGJlIGNyZWF0ZWQuXG4gICAqIEByZXR1cm4ge0FycmF5fSBBIHBsYWluIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgdG8gYmUgdmlzdWFsaXplZCBpbiB0aGUgY2hhcnRcbiAgICovXG4gIENoYXJ0aXN0LmdldERhdGFBcnJheSA9IGZ1bmN0aW9uIChkYXRhLCByZXZlcnNlLCBtdWx0aSkge1xuICAgIC8vIElmIHRoZSBkYXRhIHNob3VsZCBiZSByZXZlcnNlZCBidXQgaXNuJ3Qgd2UgbmVlZCB0byByZXZlcnNlIGl0XG4gICAgLy8gSWYgaXQncyByZXZlcnNlZCBidXQgaXQgc2hvdWxkbid0IHdlIG5lZWQgdG8gcmV2ZXJzZSBpdCBiYWNrXG4gICAgLy8gVGhhdCdzIHJlcXVpcmVkIHRvIGhhbmRsZSBkYXRhIHVwZGF0ZXMgY29ycmVjdGx5IGFuZCB0byByZWZsZWN0IHRoZSByZXNwb25zaXZlIGNvbmZpZ3VyYXRpb25zXG4gICAgaWYocmV2ZXJzZSAmJiAhZGF0YS5yZXZlcnNlZCB8fCAhcmV2ZXJzZSAmJiBkYXRhLnJldmVyc2VkKSB7XG4gICAgICBDaGFydGlzdC5yZXZlcnNlRGF0YShkYXRhKTtcbiAgICAgIGRhdGEucmV2ZXJzZWQgPSAhZGF0YS5yZXZlcnNlZDtcbiAgICB9XG5cbiAgICAvLyBSZWN1cnNpdmVseSB3YWxrcyB0aHJvdWdoIG5lc3RlZCBhcnJheXMgYW5kIGNvbnZlcnQgc3RyaW5nIHZhbHVlcyB0byBudW1iZXJzIGFuZCBvYmplY3RzIHdpdGggdmFsdWUgcHJvcGVydGllc1xuICAgIC8vIHRvIHZhbHVlcy4gQ2hlY2sgdGhlIHRlc3RzIGluIGRhdGEgY29yZSAtPiBkYXRhIG5vcm1hbGl6YXRpb24gZm9yIGEgZGV0YWlsZWQgc3BlY2lmaWNhdGlvbiBvZiBleHBlY3RlZCB2YWx1ZXNcbiAgICBmdW5jdGlvbiByZWN1cnNpdmVDb252ZXJ0KHZhbHVlKSB7XG4gICAgICBpZihDaGFydGlzdC5pc0ZhbHNleUJ1dFplcm8odmFsdWUpKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBob2xlIGluIGRhdGEgYW5kIHdlIHNob3VsZCByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYoKHZhbHVlLmRhdGEgfHwgdmFsdWUpIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuICh2YWx1ZS5kYXRhIHx8IHZhbHVlKS5tYXAocmVjdXJzaXZlQ29udmVydCk7XG4gICAgICB9IGVsc2UgaWYodmFsdWUuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJykpIHtcbiAgICAgICAgcmV0dXJuIHJlY3Vyc2l2ZUNvbnZlcnQodmFsdWUudmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYobXVsdGkpIHtcbiAgICAgICAgICB2YXIgbXVsdGlWYWx1ZSA9IHt9O1xuXG4gICAgICAgICAgLy8gU2luZ2xlIHNlcmllcyB2YWx1ZSBhcnJheXMgYXJlIGFzc3VtZWQgdG8gc3BlY2lmeSB0aGUgWS1BeGlzIHZhbHVlXG4gICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IFsxLCAyXSA9PiBbe3g6IHVuZGVmaW5lZCwgeTogMX0sIHt4OiB1bmRlZmluZWQsIHk6IDJ9XVxuICAgICAgICAgIC8vIElmIG11bHRpIGlzIGEgc3RyaW5nIHRoZW4gaXQncyBhc3N1bWVkIHRoYXQgaXQgc3BlY2lmaWVkIHdoaWNoIGRpbWVuc2lvbiBzaG91bGQgYmUgZmlsbGVkIGFzIGRlZmF1bHRcbiAgICAgICAgICBpZih0eXBlb2YgbXVsdGkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBtdWx0aVZhbHVlW211bHRpXSA9IENoYXJ0aXN0LmdldE51bWJlck9yVW5kZWZpbmVkKHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbXVsdGlWYWx1ZS55ID0gQ2hhcnRpc3QuZ2V0TnVtYmVyT3JVbmRlZmluZWQodmFsdWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG11bHRpVmFsdWUueCA9IHZhbHVlLmhhc093blByb3BlcnR5KCd4JykgPyBDaGFydGlzdC5nZXROdW1iZXJPclVuZGVmaW5lZCh2YWx1ZS54KSA6IG11bHRpVmFsdWUueDtcbiAgICAgICAgICBtdWx0aVZhbHVlLnkgPSB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgneScpID8gQ2hhcnRpc3QuZ2V0TnVtYmVyT3JVbmRlZmluZWQodmFsdWUueSkgOiBtdWx0aVZhbHVlLnk7XG5cbiAgICAgICAgICByZXR1cm4gbXVsdGlWYWx1ZTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBDaGFydGlzdC5nZXROdW1iZXJPclVuZGVmaW5lZCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YS5zZXJpZXMubWFwKHJlY3Vyc2l2ZUNvbnZlcnQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIG51bWJlciBpbnRvIGEgcGFkZGluZyBvYmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7T2JqZWN0fE51bWJlcn0gcGFkZGluZ1xuICAgKiBAcGFyYW0ge051bWJlcn0gW2ZhbGxiYWNrXSBUaGlzIHZhbHVlIGlzIHVzZWQgdG8gZmlsbCBtaXNzaW5nIHZhbHVlcyBpZiBhIGluY29tcGxldGUgcGFkZGluZyBvYmplY3Qgd2FzIHBhc3NlZFxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGEgcGFkZGluZyBvYmplY3QgY29udGFpbmluZyB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQgcHJvcGVydGllcyBmaWxsZWQgd2l0aCB0aGUgcGFkZGluZyBudW1iZXIgcGFzc2VkIGluIGFzIGFyZ3VtZW50LiBJZiB0aGUgYXJndW1lbnQgaXMgc29tZXRoaW5nIGVsc2UgdGhhbiBhIG51bWJlciAocHJlc3VtYWJseSBhbHJlYWR5IGEgY29ycmVjdCBwYWRkaW5nIG9iamVjdCkgdGhlbiB0aGlzIGFyZ3VtZW50IGlzIGRpcmVjdGx5IHJldHVybmVkLlxuICAgKi9cbiAgQ2hhcnRpc3Qubm9ybWFsaXplUGFkZGluZyA9IGZ1bmN0aW9uKHBhZGRpbmcsIGZhbGxiYWNrKSB7XG4gICAgZmFsbGJhY2sgPSBmYWxsYmFjayB8fCAwO1xuXG4gICAgcmV0dXJuIHR5cGVvZiBwYWRkaW5nID09PSAnbnVtYmVyJyA/IHtcbiAgICAgIHRvcDogcGFkZGluZyxcbiAgICAgIHJpZ2h0OiBwYWRkaW5nLFxuICAgICAgYm90dG9tOiBwYWRkaW5nLFxuICAgICAgbGVmdDogcGFkZGluZ1xuICAgIH0gOiB7XG4gICAgICB0b3A6IHR5cGVvZiBwYWRkaW5nLnRvcCA9PT0gJ251bWJlcicgPyBwYWRkaW5nLnRvcCA6IGZhbGxiYWNrLFxuICAgICAgcmlnaHQ6IHR5cGVvZiBwYWRkaW5nLnJpZ2h0ID09PSAnbnVtYmVyJyA/IHBhZGRpbmcucmlnaHQgOiBmYWxsYmFjayxcbiAgICAgIGJvdHRvbTogdHlwZW9mIHBhZGRpbmcuYm90dG9tID09PSAnbnVtYmVyJyA/IHBhZGRpbmcuYm90dG9tIDogZmFsbGJhY2ssXG4gICAgICBsZWZ0OiB0eXBlb2YgcGFkZGluZy5sZWZ0ID09PSAnbnVtYmVyJyA/IHBhZGRpbmcubGVmdCA6IGZhbGxiYWNrXG4gICAgfTtcbiAgfTtcblxuICBDaGFydGlzdC5nZXRNZXRhRGF0YSA9IGZ1bmN0aW9uKHNlcmllcywgaW5kZXgpIHtcbiAgICB2YXIgdmFsdWUgPSBzZXJpZXMuZGF0YSA/IHNlcmllcy5kYXRhW2luZGV4XSA6IHNlcmllc1tpbmRleF07XG4gICAgcmV0dXJuIHZhbHVlID8gQ2hhcnRpc3Quc2VyaWFsaXplKHZhbHVlLm1ldGEpIDogdW5kZWZpbmVkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIG9yZGVyIG9mIG1hZ25pdHVkZSBmb3IgdGhlIGNoYXJ0IHNjYWxlXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSBUaGUgdmFsdWUgUmFuZ2Ugb2YgdGhlIGNoYXJ0XG4gICAqIEByZXR1cm4ge051bWJlcn0gVGhlIG9yZGVyIG9mIG1hZ25pdHVkZVxuICAgKi9cbiAgQ2hhcnRpc3Qub3JkZXJPZk1hZ25pdHVkZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgubG9nKE1hdGguYWJzKHZhbHVlKSkgLyBNYXRoLkxOMTApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcm9qZWN0IGEgZGF0YSBsZW5ndGggaW50byBzY3JlZW4gY29vcmRpbmF0ZXMgKHBpeGVscylcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IGF4aXNMZW5ndGggVGhlIHN2ZyBlbGVtZW50IGZvciB0aGUgY2hhcnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCBTaW5nbGUgZGF0YSB2YWx1ZSBmcm9tIGEgc2VyaWVzIGFycmF5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBib3VuZHMgQWxsIHRoZSB2YWx1ZXMgdG8gc2V0IHRoZSBib3VuZHMgb2YgdGhlIGNoYXJ0XG4gICAqIEByZXR1cm4ge051bWJlcn0gVGhlIHByb2plY3RlZCBkYXRhIGxlbmd0aCBpbiBwaXhlbHNcbiAgICovXG4gIENoYXJ0aXN0LnByb2plY3RMZW5ndGggPSBmdW5jdGlvbiAoYXhpc0xlbmd0aCwgbGVuZ3RoLCBib3VuZHMpIHtcbiAgICByZXR1cm4gbGVuZ3RoIC8gYm91bmRzLnJhbmdlICogYXhpc0xlbmd0aDtcbiAgfTtcblxuICAvKipcbiAgICogR2V0IHRoZSBoZWlnaHQgb2YgdGhlIGFyZWEgaW4gdGhlIGNoYXJ0IGZvciB0aGUgZGF0YSBzZXJpZXNcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IHN2ZyBUaGUgc3ZnIGVsZW1lbnQgZm9yIHRoZSBjaGFydFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBUaGUgT2JqZWN0IHRoYXQgY29udGFpbnMgYWxsIHRoZSBvcHRpb25hbCB2YWx1ZXMgZm9yIHRoZSBjaGFydFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBoZWlnaHQgb2YgdGhlIGFyZWEgaW4gdGhlIGNoYXJ0IGZvciB0aGUgZGF0YSBzZXJpZXNcbiAgICovXG4gIENoYXJ0aXN0LmdldEF2YWlsYWJsZUhlaWdodCA9IGZ1bmN0aW9uIChzdmcsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoKENoYXJ0aXN0LnF1YW50aXR5KG9wdGlvbnMuaGVpZ2h0KS52YWx1ZSB8fCBzdmcuaGVpZ2h0KCkpIC0gKG9wdGlvbnMuY2hhcnRQYWRkaW5nLnRvcCArICBvcHRpb25zLmNoYXJ0UGFkZGluZy5ib3R0b20pIC0gb3B0aW9ucy5heGlzWC5vZmZzZXQsIDApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgaGlnaGVzdCBhbmQgbG93ZXN0IHZhbHVlIG9mIGRhdGEgYXJyYXkuIFRoaXMgQXJyYXkgY29udGFpbnMgdGhlIGRhdGEgdGhhdCB3aWxsIGJlIHZpc3VhbGl6ZWQgaW4gdGhlIGNoYXJ0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhIFRoZSBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIHRvIGJlIHZpc3VhbGl6ZWQgaW4gdGhlIGNoYXJ0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBPYmplY3QgdGhhdCBjb250YWlucyB0aGUgY2hhcnQgb3B0aW9uc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gZGltZW5zaW9uIEF4aXMgZGltZW5zaW9uICd4JyBvciAneScgdXNlZCB0byBhY2Nlc3MgdGhlIGNvcnJlY3QgdmFsdWUgYW5kIGhpZ2ggLyBsb3cgY29uZmlndXJhdGlvblxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBoaWdoZXN0IGFuZCBsb3dlc3QgdmFsdWUgdGhhdCB3aWxsIGJlIHZpc3VhbGl6ZWQgb24gdGhlIGNoYXJ0LlxuICAgKi9cbiAgQ2hhcnRpc3QuZ2V0SGlnaExvdyA9IGZ1bmN0aW9uIChkYXRhLCBvcHRpb25zLCBkaW1lbnNpb24pIHtcbiAgICAvLyBUT0RPOiBSZW1vdmUgd29ya2Fyb3VuZCBmb3IgZGVwcmVjYXRlZCBnbG9iYWwgaGlnaCAvIGxvdyBjb25maWcuIEF4aXMgaGlnaCAvIGxvdyBjb25maWd1cmF0aW9uIGlzIHByZWZlcnJlZFxuICAgIG9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMsIGRpbWVuc2lvbiA/IG9wdGlvbnNbJ2F4aXMnICsgZGltZW5zaW9uLnRvVXBwZXJDYXNlKCldIDoge30pO1xuXG4gICAgdmFyIGhpZ2hMb3cgPSB7XG4gICAgICAgIGhpZ2g6IG9wdGlvbnMuaGlnaCA9PT0gdW5kZWZpbmVkID8gLU51bWJlci5NQVhfVkFMVUUgOiArb3B0aW9ucy5oaWdoLFxuICAgICAgICBsb3c6IG9wdGlvbnMubG93ID09PSB1bmRlZmluZWQgPyBOdW1iZXIuTUFYX1ZBTFVFIDogK29wdGlvbnMubG93XG4gICAgICB9O1xuICAgIHZhciBmaW5kSGlnaCA9IG9wdGlvbnMuaGlnaCA9PT0gdW5kZWZpbmVkO1xuICAgIHZhciBmaW5kTG93ID0gb3B0aW9ucy5sb3cgPT09IHVuZGVmaW5lZDtcblxuICAgIC8vIEZ1bmN0aW9uIHRvIHJlY3Vyc2l2ZWx5IHdhbGsgdGhyb3VnaCBhcnJheXMgYW5kIGZpbmQgaGlnaGVzdCBhbmQgbG93ZXN0IG51bWJlclxuICAgIGZ1bmN0aW9uIHJlY3Vyc2l2ZUhpZ2hMb3coZGF0YSkge1xuICAgICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJlY3Vyc2l2ZUhpZ2hMb3coZGF0YVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGRpbWVuc2lvbiA/ICtkYXRhW2RpbWVuc2lvbl0gOiArZGF0YTtcblxuICAgICAgICBpZiAoZmluZEhpZ2ggJiYgdmFsdWUgPiBoaWdoTG93LmhpZ2gpIHtcbiAgICAgICAgICBoaWdoTG93LmhpZ2ggPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaW5kTG93ICYmIHZhbHVlIDwgaGlnaExvdy5sb3cpIHtcbiAgICAgICAgICBoaWdoTG93LmxvdyA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgdG8gZmluZCBoaWdoZXN0IGFuZCBsb3dlc3QgbnVtYmVyIHJlY3Vyc2l2ZWx5XG4gICAgaWYoZmluZEhpZ2ggfHwgZmluZExvdykge1xuICAgICAgcmVjdXJzaXZlSGlnaExvdyhkYXRhKTtcbiAgICB9XG5cbiAgICAvLyBPdmVycmlkZXMgb2YgaGlnaCAvIGxvdyBiYXNlZCBvbiByZWZlcmVuY2UgdmFsdWUsIGl0IHdpbGwgbWFrZSBzdXJlIHRoYXQgdGhlIGludmlzaWJsZSByZWZlcmVuY2UgdmFsdWUgaXNcbiAgICAvLyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBjaGFydC4gVGhpcyBpcyB1c2VmdWwgd2hlbiB0aGUgY2hhcnQgYWx3YXlzIG5lZWRzIHRvIGNvbnRhaW4gdGhlIHBvc2l0aW9uIG9mIHRoZVxuICAgIC8vIGludmlzaWJsZSByZWZlcmVuY2UgdmFsdWUgaW4gdGhlIHZpZXcgaS5lLiBmb3IgYmlwb2xhciBzY2FsZXMuXG4gICAgaWYgKG9wdGlvbnMucmVmZXJlbmNlVmFsdWUgfHwgb3B0aW9ucy5yZWZlcmVuY2VWYWx1ZSA9PT0gMCkge1xuICAgICAgaGlnaExvdy5oaWdoID0gTWF0aC5tYXgob3B0aW9ucy5yZWZlcmVuY2VWYWx1ZSwgaGlnaExvdy5oaWdoKTtcbiAgICAgIGhpZ2hMb3cubG93ID0gTWF0aC5taW4ob3B0aW9ucy5yZWZlcmVuY2VWYWx1ZSwgaGlnaExvdy5sb3cpO1xuICAgIH1cblxuICAgIC8vIElmIGhpZ2ggYW5kIGxvdyBhcmUgdGhlIHNhbWUgYmVjYXVzZSBvZiBtaXNjb25maWd1cmF0aW9uIG9yIGZsYXQgZGF0YSAob25seSB0aGUgc2FtZSB2YWx1ZSkgd2UgbmVlZFxuICAgIC8vIHRvIHNldCB0aGUgaGlnaCBvciBsb3cgdG8gMCBkZXBlbmRpbmcgb24gdGhlIHBvbGFyaXR5XG4gICAgaWYgKGhpZ2hMb3cuaGlnaCA8PSBoaWdoTG93Lmxvdykge1xuICAgICAgLy8gSWYgYm90aCB2YWx1ZXMgYXJlIDAgd2Ugc2V0IGhpZ2ggdG8gMVxuICAgICAgaWYgKGhpZ2hMb3cubG93ID09PSAwKSB7XG4gICAgICAgIGhpZ2hMb3cuaGlnaCA9IDE7XG4gICAgICB9IGVsc2UgaWYgKGhpZ2hMb3cubG93IDwgMCkge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIHRoZSBzYW1lIG5lZ2F0aXZlIHZhbHVlIGZvciB0aGUgYm91bmRzIHdlIHNldCBib3VuZHMuaGlnaCB0byAwXG4gICAgICAgIGhpZ2hMb3cuaGlnaCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIHRoZSBzYW1lIHBvc2l0aXZlIHZhbHVlIGZvciB0aGUgYm91bmRzIHdlIHNldCBib3VuZHMubG93IHRvIDBcbiAgICAgICAgaGlnaExvdy5sb3cgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBoaWdoTG93O1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHZhbHVlIGlzIGEgdmFsaWQgbnVtYmVyIG9yIHN0cmluZyB3aXRoIGEgbnVtYmVyLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICBDaGFydGlzdC5pc051bSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgaXNGaW5pdGUodmFsdWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgb24gYWxsIGZhbHNleSB2YWx1ZXMgZXhjZXB0IHRoZSBudW1lcmljIHZhbHVlIDAuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIENoYXJ0aXN0LmlzRmFsc2V5QnV0WmVybyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuICF2YWx1ZSAmJiB2YWx1ZSAhPT0gMDtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyBhIG51bWJlciBpZiB0aGUgcGFzc2VkIHBhcmFtZXRlciBpcyBhIHZhbGlkIG51bWJlciBvciB0aGUgZnVuY3Rpb24gd2lsbCByZXR1cm4gdW5kZWZpbmVkLiBPbiBhbGwgb3RoZXIgdmFsdWVzIHRoYW4gYSB2YWxpZCBudW1iZXIsIHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gdW5kZWZpbmVkLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBDaGFydGlzdC5nZXROdW1iZXJPclVuZGVmaW5lZCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGlzTmFOKCt2YWx1ZSkgPyB1bmRlZmluZWQgOiArdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHMgYSB2YWx1ZSBmcm9tIGEgZGltZW5zaW9uIGB2YWx1ZS54YCBvciBgdmFsdWUueWAgd2hpbGUgcmV0dXJuaW5nIHZhbHVlIGRpcmVjdGx5IGlmIGl0J3MgYSB2YWxpZCBudW1lcmljIHZhbHVlLiBJZiB0aGUgdmFsdWUgaXMgbm90IG51bWVyaWMgYW5kIGl0J3MgZmFsc2V5IHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gdW5kZWZpbmVkLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHBhcmFtIGRpbWVuc2lvblxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIENoYXJ0aXN0LmdldE11bHRpVmFsdWUgPSBmdW5jdGlvbih2YWx1ZSwgZGltZW5zaW9uKSB7XG4gICAgaWYoQ2hhcnRpc3QuaXNOdW0odmFsdWUpKSB7XG4gICAgICByZXR1cm4gK3ZhbHVlO1xuICAgIH0gZWxzZSBpZih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlW2RpbWVuc2lvbiB8fCAneSddIHx8IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUG9sbGFyZCBSaG8gQWxnb3JpdGhtIHRvIGZpbmQgc21hbGxlc3QgZmFjdG9yIG9mIGFuIGludGVnZXIgdmFsdWUuIFRoZXJlIGFyZSBtb3JlIGVmZmljaWVudCBhbGdvcml0aG1zIGZvciBmYWN0b3JpemF0aW9uLCBidXQgdGhpcyBvbmUgaXMgcXVpdGUgZWZmaWNpZW50IGFuZCBub3Qgc28gY29tcGxleC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG51bSBBbiBpbnRlZ2VyIG51bWJlciB3aGVyZSB0aGUgc21hbGxlc3QgZmFjdG9yIHNob3VsZCBiZSBzZWFyY2hlZCBmb3JcbiAgICogQHJldHVybnMge051bWJlcn0gVGhlIHNtYWxsZXN0IGludGVnZXIgZmFjdG9yIG9mIHRoZSBwYXJhbWV0ZXIgbnVtLlxuICAgKi9cbiAgQ2hhcnRpc3QucmhvID0gZnVuY3Rpb24obnVtKSB7XG4gICAgaWYobnVtID09PSAxKSB7XG4gICAgICByZXR1cm4gbnVtO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdjZChwLCBxKSB7XG4gICAgICBpZiAocCAlIHEgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZ2NkKHEsIHAgJSBxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmKHgpIHtcbiAgICAgIHJldHVybiB4ICogeCArIDE7XG4gICAgfVxuXG4gICAgdmFyIHgxID0gMiwgeDIgPSAyLCBkaXZpc29yO1xuICAgIGlmIChudW0gJSAyID09PSAwKSB7XG4gICAgICByZXR1cm4gMjtcbiAgICB9XG5cbiAgICBkbyB7XG4gICAgICB4MSA9IGYoeDEpICUgbnVtO1xuICAgICAgeDIgPSBmKGYoeDIpKSAlIG51bTtcbiAgICAgIGRpdmlzb3IgPSBnY2QoTWF0aC5hYnMoeDEgLSB4MiksIG51bSk7XG4gICAgfSB3aGlsZSAoZGl2aXNvciA9PT0gMSk7XG5cbiAgICByZXR1cm4gZGl2aXNvcjtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGFuZCByZXRyaWV2ZSBhbGwgdGhlIGJvdW5kcyBmb3IgdGhlIGNoYXJ0IGFuZCByZXR1cm4gdGhlbSBpbiBvbmUgYXJyYXlcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGF4aXNMZW5ndGggVGhlIGxlbmd0aCBvZiB0aGUgQXhpcyB1c2VkIGZvclxuICAgKiBAcGFyYW0ge09iamVjdH0gaGlnaExvdyBBbiBvYmplY3QgY29udGFpbmluZyBhIGhpZ2ggYW5kIGxvdyBwcm9wZXJ0eSBpbmRpY2F0aW5nIHRoZSB2YWx1ZSByYW5nZSBvZiB0aGUgY2hhcnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZU1pblNwYWNlIFRoZSBtaW5pbXVtIHByb2plY3RlZCBsZW5ndGggYSBzdGVwIHNob3VsZCByZXN1bHQgaW5cbiAgICogQHBhcmFtIHtCb29sZWFufSBvbmx5SW50ZWdlclxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEFsbCB0aGUgdmFsdWVzIHRvIHNldCB0aGUgYm91bmRzIG9mIHRoZSBjaGFydFxuICAgKi9cbiAgQ2hhcnRpc3QuZ2V0Qm91bmRzID0gZnVuY3Rpb24gKGF4aXNMZW5ndGgsIGhpZ2hMb3csIHNjYWxlTWluU3BhY2UsIG9ubHlJbnRlZ2VyKSB7XG4gICAgdmFyIGksXG4gICAgICBvcHRpbWl6YXRpb25Db3VudGVyID0gMCxcbiAgICAgIG5ld01pbixcbiAgICAgIG5ld01heCxcbiAgICAgIGJvdW5kcyA9IHtcbiAgICAgICAgaGlnaDogaGlnaExvdy5oaWdoLFxuICAgICAgICBsb3c6IGhpZ2hMb3cubG93XG4gICAgICB9O1xuXG4gICAgYm91bmRzLnZhbHVlUmFuZ2UgPSBib3VuZHMuaGlnaCAtIGJvdW5kcy5sb3c7XG4gICAgYm91bmRzLm9vbSA9IENoYXJ0aXN0Lm9yZGVyT2ZNYWduaXR1ZGUoYm91bmRzLnZhbHVlUmFuZ2UpO1xuICAgIGJvdW5kcy5zdGVwID0gTWF0aC5wb3coMTAsIGJvdW5kcy5vb20pO1xuICAgIGJvdW5kcy5taW4gPSBNYXRoLmZsb29yKGJvdW5kcy5sb3cgLyBib3VuZHMuc3RlcCkgKiBib3VuZHMuc3RlcDtcbiAgICBib3VuZHMubWF4ID0gTWF0aC5jZWlsKGJvdW5kcy5oaWdoIC8gYm91bmRzLnN0ZXApICogYm91bmRzLnN0ZXA7XG4gICAgYm91bmRzLnJhbmdlID0gYm91bmRzLm1heCAtIGJvdW5kcy5taW47XG4gICAgYm91bmRzLm51bWJlck9mU3RlcHMgPSBNYXRoLnJvdW5kKGJvdW5kcy5yYW5nZSAvIGJvdW5kcy5zdGVwKTtcblxuICAgIC8vIE9wdGltaXplIHNjYWxlIHN0ZXAgYnkgY2hlY2tpbmcgaWYgc3ViZGl2aXNpb24gaXMgcG9zc2libGUgYmFzZWQgb24gaG9yaXpvbnRhbEdyaWRNaW5TcGFjZVxuICAgIC8vIElmIHdlIGFyZSBhbHJlYWR5IGJlbG93IHRoZSBzY2FsZU1pblNwYWNlIHZhbHVlIHdlIHdpbGwgc2NhbGUgdXBcbiAgICB2YXIgbGVuZ3RoID0gQ2hhcnRpc3QucHJvamVjdExlbmd0aChheGlzTGVuZ3RoLCBib3VuZHMuc3RlcCwgYm91bmRzKTtcbiAgICB2YXIgc2NhbGVVcCA9IGxlbmd0aCA8IHNjYWxlTWluU3BhY2U7XG4gICAgdmFyIHNtYWxsZXN0RmFjdG9yID0gb25seUludGVnZXIgPyBDaGFydGlzdC5yaG8oYm91bmRzLnJhbmdlKSA6IDA7XG5cbiAgICAvLyBGaXJzdCBjaGVjayBpZiB3ZSBzaG91bGQgb25seSB1c2UgaW50ZWdlciBzdGVwcyBhbmQgaWYgc3RlcCAxIGlzIHN0aWxsIGxhcmdlciB0aGFuIHNjYWxlTWluU3BhY2Ugc28gd2UgY2FuIHVzZSAxXG4gICAgaWYob25seUludGVnZXIgJiYgQ2hhcnRpc3QucHJvamVjdExlbmd0aChheGlzTGVuZ3RoLCAxLCBib3VuZHMpID49IHNjYWxlTWluU3BhY2UpIHtcbiAgICAgIGJvdW5kcy5zdGVwID0gMTtcbiAgICB9IGVsc2UgaWYob25seUludGVnZXIgJiYgc21hbGxlc3RGYWN0b3IgPCBib3VuZHMuc3RlcCAmJiBDaGFydGlzdC5wcm9qZWN0TGVuZ3RoKGF4aXNMZW5ndGgsIHNtYWxsZXN0RmFjdG9yLCBib3VuZHMpID49IHNjYWxlTWluU3BhY2UpIHtcbiAgICAgIC8vIElmIHN0ZXAgMSB3YXMgdG9vIHNtYWxsLCB3ZSBjYW4gdHJ5IHRoZSBzbWFsbGVzdCBmYWN0b3Igb2YgcmFuZ2VcbiAgICAgIC8vIElmIHRoZSBzbWFsbGVzdCBmYWN0b3IgaXMgc21hbGxlciB0aGFuIHRoZSBjdXJyZW50IGJvdW5kcy5zdGVwIGFuZCB0aGUgcHJvamVjdGVkIGxlbmd0aCBvZiBzbWFsbGVzdCBmYWN0b3JcbiAgICAgIC8vIGlzIGxhcmdlciB0aGFuIHRoZSBzY2FsZU1pblNwYWNlIHdlIHNob3VsZCBnbyBmb3IgaXQuXG4gICAgICBib3VuZHMuc3RlcCA9IHNtYWxsZXN0RmFjdG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUcnlpbmcgdG8gZGl2aWRlIG9yIG11bHRpcGx5IGJ5IDIgYW5kIGZpbmQgdGhlIGJlc3Qgc3RlcCB2YWx1ZVxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgaWYgKHNjYWxlVXAgJiYgQ2hhcnRpc3QucHJvamVjdExlbmd0aChheGlzTGVuZ3RoLCBib3VuZHMuc3RlcCwgYm91bmRzKSA8PSBzY2FsZU1pblNwYWNlKSB7XG4gICAgICAgICAgYm91bmRzLnN0ZXAgKj0gMjtcbiAgICAgICAgfSBlbHNlIGlmICghc2NhbGVVcCAmJiBDaGFydGlzdC5wcm9qZWN0TGVuZ3RoKGF4aXNMZW5ndGgsIGJvdW5kcy5zdGVwIC8gMiwgYm91bmRzKSA+PSBzY2FsZU1pblNwYWNlKSB7XG4gICAgICAgICAgYm91bmRzLnN0ZXAgLz0gMjtcbiAgICAgICAgICBpZihvbmx5SW50ZWdlciAmJiBib3VuZHMuc3RlcCAlIDEgIT09IDApIHtcbiAgICAgICAgICAgIGJvdW5kcy5zdGVwICo9IDI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZihvcHRpbWl6YXRpb25Db3VudGVyKysgPiAxMDAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeGNlZWRlZCBtYXhpbXVtIG51bWJlciBvZiBpdGVyYXRpb25zIHdoaWxlIG9wdGltaXppbmcgc2NhbGUgc3RlcCEnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5hcnJvdyBtaW4gYW5kIG1heCBiYXNlZCBvbiBuZXcgc3RlcFxuICAgIG5ld01pbiA9IGJvdW5kcy5taW47XG4gICAgbmV3TWF4ID0gYm91bmRzLm1heDtcbiAgICB3aGlsZShuZXdNaW4gKyBib3VuZHMuc3RlcCA8PSBib3VuZHMubG93KSB7XG4gICAgICBuZXdNaW4gKz0gYm91bmRzLnN0ZXA7XG4gICAgfVxuICAgIHdoaWxlKG5ld01heCAtIGJvdW5kcy5zdGVwID49IGJvdW5kcy5oaWdoKSB7XG4gICAgICBuZXdNYXggLT0gYm91bmRzLnN0ZXA7XG4gICAgfVxuICAgIGJvdW5kcy5taW4gPSBuZXdNaW47XG4gICAgYm91bmRzLm1heCA9IG5ld01heDtcbiAgICBib3VuZHMucmFuZ2UgPSBib3VuZHMubWF4IC0gYm91bmRzLm1pbjtcblxuICAgIGJvdW5kcy52YWx1ZXMgPSBbXTtcbiAgICBmb3IgKGkgPSBib3VuZHMubWluOyBpIDw9IGJvdW5kcy5tYXg7IGkgKz0gYm91bmRzLnN0ZXApIHtcbiAgICAgIGJvdW5kcy52YWx1ZXMucHVzaChDaGFydGlzdC5yb3VuZFdpdGhQcmVjaXNpb24oaSkpO1xuICAgIH1cblxuICAgIHJldHVybiBib3VuZHM7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSBjYXJ0ZXNpYW4gY29vcmRpbmF0ZXMgb2YgcG9sYXIgY29vcmRpbmF0ZXNcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNlbnRlclggWC1heGlzIGNvb3JkaW5hdGVzIG9mIGNlbnRlciBwb2ludCBvZiBjaXJjbGUgc2VnbWVudFxuICAgKiBAcGFyYW0ge051bWJlcn0gY2VudGVyWSBYLWF4aXMgY29vcmRpbmF0ZXMgb2YgY2VudGVyIHBvaW50IG9mIGNpcmNsZSBzZWdtZW50XG4gICAqIEBwYXJhbSB7TnVtYmVyfSByYWRpdXMgUmFkaXVzIG9mIGNpcmNsZSBzZWdtZW50XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBhbmdsZUluRGVncmVlcyBBbmdsZSBvZiBjaXJjbGUgc2VnbWVudCBpbiBkZWdyZWVzXG4gICAqIEByZXR1cm4ge3t4Ok51bWJlciwgeTpOdW1iZXJ9fSBDb29yZGluYXRlcyBvZiBwb2ludCBvbiBjaXJjdW1mZXJlbmNlXG4gICAqL1xuICBDaGFydGlzdC5wb2xhclRvQ2FydGVzaWFuID0gZnVuY3Rpb24gKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgYW5nbGVJbkRlZ3JlZXMpIHtcbiAgICB2YXIgYW5nbGVJblJhZGlhbnMgPSAoYW5nbGVJbkRlZ3JlZXMgLSA5MCkgKiBNYXRoLlBJIC8gMTgwLjA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogY2VudGVyWCArIChyYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUluUmFkaWFucykpLFxuICAgICAgeTogY2VudGVyWSArIChyYWRpdXMgKiBNYXRoLnNpbihhbmdsZUluUmFkaWFucykpXG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBjaGFydCBkcmF3aW5nIHJlY3RhbmdsZSAoYXJlYSB3aGVyZSBjaGFydCBpcyBkcmF3bikgeDEseTEgPSBib3R0b20gbGVmdCAvIHgyLHkyID0gdG9wIHJpZ2h0XG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdmcgVGhlIHN2ZyBlbGVtZW50IGZvciB0aGUgY2hhcnRcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIE9iamVjdCB0aGF0IGNvbnRhaW5zIGFsbCB0aGUgb3B0aW9uYWwgdmFsdWVzIGZvciB0aGUgY2hhcnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtmYWxsYmFja1BhZGRpbmddIFRoZSBmYWxsYmFjayBwYWRkaW5nIGlmIHBhcnRpYWwgcGFkZGluZyBvYmplY3RzIGFyZSB1c2VkXG4gICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNoYXJ0IHJlY3RhbmdsZXMgY29vcmRpbmF0ZXMgaW5zaWRlIHRoZSBzdmcgZWxlbWVudCBwbHVzIHRoZSByZWN0YW5nbGVzIG1lYXN1cmVtZW50c1xuICAgKi9cbiAgQ2hhcnRpc3QuY3JlYXRlQ2hhcnRSZWN0ID0gZnVuY3Rpb24gKHN2Zywgb3B0aW9ucywgZmFsbGJhY2tQYWRkaW5nKSB7XG4gICAgdmFyIGhhc0F4aXMgPSAhIShvcHRpb25zLmF4aXNYIHx8IG9wdGlvbnMuYXhpc1kpO1xuICAgIHZhciB5QXhpc09mZnNldCA9IGhhc0F4aXMgPyBvcHRpb25zLmF4aXNZLm9mZnNldCA6IDA7XG4gICAgdmFyIHhBeGlzT2Zmc2V0ID0gaGFzQXhpcyA/IG9wdGlvbnMuYXhpc1gub2Zmc2V0IDogMDtcbiAgICAvLyBJZiB3aWR0aCBvciBoZWlnaHQgcmVzdWx0cyBpbiBpbnZhbGlkIHZhbHVlIChpbmNsdWRpbmcgMCkgd2UgZmFsbGJhY2sgdG8gdGhlIHVuaXRsZXNzIHNldHRpbmdzIG9yIGV2ZW4gMFxuICAgIHZhciB3aWR0aCA9IHN2Zy53aWR0aCgpIHx8IENoYXJ0aXN0LnF1YW50aXR5KG9wdGlvbnMud2lkdGgpLnZhbHVlIHx8IDA7XG4gICAgdmFyIGhlaWdodCA9IHN2Zy5oZWlnaHQoKSB8fCBDaGFydGlzdC5xdWFudGl0eShvcHRpb25zLmhlaWdodCkudmFsdWUgfHwgMDtcbiAgICB2YXIgbm9ybWFsaXplZFBhZGRpbmcgPSBDaGFydGlzdC5ub3JtYWxpemVQYWRkaW5nKG9wdGlvbnMuY2hhcnRQYWRkaW5nLCBmYWxsYmFja1BhZGRpbmcpO1xuXG4gICAgLy8gSWYgc2V0dGluZ3Mgd2VyZSB0byBzbWFsbCB0byBjb3BlIHdpdGggb2Zmc2V0IChsZWdhY3kpIGFuZCBwYWRkaW5nLCB3ZSdsbCBhZGp1c3RcbiAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCB5QXhpc09mZnNldCArIG5vcm1hbGl6ZWRQYWRkaW5nLmxlZnQgKyBub3JtYWxpemVkUGFkZGluZy5yaWdodCk7XG4gICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCB4QXhpc09mZnNldCArIG5vcm1hbGl6ZWRQYWRkaW5nLnRvcCArIG5vcm1hbGl6ZWRQYWRkaW5nLmJvdHRvbSk7XG5cbiAgICB2YXIgY2hhcnRSZWN0ID0ge1xuICAgICAgcGFkZGluZzogbm9ybWFsaXplZFBhZGRpbmcsXG4gICAgICB3aWR0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy54MiAtIHRoaXMueDE7XG4gICAgICB9LFxuICAgICAgaGVpZ2h0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnkxIC0gdGhpcy55MjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYoaGFzQXhpcykge1xuICAgICAgaWYgKG9wdGlvbnMuYXhpc1gucG9zaXRpb24gPT09ICdzdGFydCcpIHtcbiAgICAgICAgY2hhcnRSZWN0LnkyID0gbm9ybWFsaXplZFBhZGRpbmcudG9wICsgeEF4aXNPZmZzZXQ7XG4gICAgICAgIGNoYXJ0UmVjdC55MSA9IE1hdGgubWF4KGhlaWdodCAtIG5vcm1hbGl6ZWRQYWRkaW5nLmJvdHRvbSwgY2hhcnRSZWN0LnkyICsgMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFydFJlY3QueTIgPSBub3JtYWxpemVkUGFkZGluZy50b3A7XG4gICAgICAgIGNoYXJ0UmVjdC55MSA9IE1hdGgubWF4KGhlaWdodCAtIG5vcm1hbGl6ZWRQYWRkaW5nLmJvdHRvbSAtIHhBeGlzT2Zmc2V0LCBjaGFydFJlY3QueTIgKyAxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuYXhpc1kucG9zaXRpb24gPT09ICdzdGFydCcpIHtcbiAgICAgICAgY2hhcnRSZWN0LngxID0gbm9ybWFsaXplZFBhZGRpbmcubGVmdCArIHlBeGlzT2Zmc2V0O1xuICAgICAgICBjaGFydFJlY3QueDIgPSBNYXRoLm1heCh3aWR0aCAtIG5vcm1hbGl6ZWRQYWRkaW5nLnJpZ2h0LCBjaGFydFJlY3QueDEgKyAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYXJ0UmVjdC54MSA9IG5vcm1hbGl6ZWRQYWRkaW5nLmxlZnQ7XG4gICAgICAgIGNoYXJ0UmVjdC54MiA9IE1hdGgubWF4KHdpZHRoIC0gbm9ybWFsaXplZFBhZGRpbmcucmlnaHQgLSB5QXhpc09mZnNldCwgY2hhcnRSZWN0LngxICsgMSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoYXJ0UmVjdC54MSA9IG5vcm1hbGl6ZWRQYWRkaW5nLmxlZnQ7XG4gICAgICBjaGFydFJlY3QueDIgPSBNYXRoLm1heCh3aWR0aCAtIG5vcm1hbGl6ZWRQYWRkaW5nLnJpZ2h0LCBjaGFydFJlY3QueDEgKyAxKTtcbiAgICAgIGNoYXJ0UmVjdC55MiA9IG5vcm1hbGl6ZWRQYWRkaW5nLnRvcDtcbiAgICAgIGNoYXJ0UmVjdC55MSA9IE1hdGgubWF4KGhlaWdodCAtIG5vcm1hbGl6ZWRQYWRkaW5nLmJvdHRvbSwgY2hhcnRSZWN0LnkyICsgMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXJ0UmVjdDtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGdyaWQgbGluZSBiYXNlZCBvbiBhIHByb2plY3RlZCB2YWx1ZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHBvc2l0aW9uXG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcGFyYW0gYXhpc1xuICAgKiBAcGFyYW0gb2Zmc2V0XG4gICAqIEBwYXJhbSBsZW5ndGhcbiAgICogQHBhcmFtIGdyb3VwXG4gICAqIEBwYXJhbSBjbGFzc2VzXG4gICAqIEBwYXJhbSBldmVudEVtaXR0ZXJcbiAgICovXG4gIENoYXJ0aXN0LmNyZWF0ZUdyaWQgPSBmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgsIGF4aXMsIG9mZnNldCwgbGVuZ3RoLCBncm91cCwgY2xhc3NlcywgZXZlbnRFbWl0dGVyKSB7XG4gICAgdmFyIHBvc2l0aW9uYWxEYXRhID0ge307XG4gICAgcG9zaXRpb25hbERhdGFbYXhpcy51bml0cy5wb3MgKyAnMSddID0gcG9zaXRpb247XG4gICAgcG9zaXRpb25hbERhdGFbYXhpcy51bml0cy5wb3MgKyAnMiddID0gcG9zaXRpb247XG4gICAgcG9zaXRpb25hbERhdGFbYXhpcy5jb3VudGVyVW5pdHMucG9zICsgJzEnXSA9IG9mZnNldDtcbiAgICBwb3NpdGlvbmFsRGF0YVtheGlzLmNvdW50ZXJVbml0cy5wb3MgKyAnMiddID0gb2Zmc2V0ICsgbGVuZ3RoO1xuXG4gICAgdmFyIGdyaWRFbGVtZW50ID0gZ3JvdXAuZWxlbSgnbGluZScsIHBvc2l0aW9uYWxEYXRhLCBjbGFzc2VzLmpvaW4oJyAnKSk7XG5cbiAgICAvLyBFdmVudCBmb3IgZ3JpZCBkcmF3XG4gICAgZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLFxuICAgICAgQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgICAgdHlwZTogJ2dyaWQnLFxuICAgICAgICBheGlzOiBheGlzLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGdyb3VwOiBncm91cCxcbiAgICAgICAgZWxlbWVudDogZ3JpZEVsZW1lbnRcbiAgICAgIH0sIHBvc2l0aW9uYWxEYXRhKVxuICAgICk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBsYWJlbCBiYXNlZCBvbiBhIHByb2plY3RlZCB2YWx1ZSBhbmQgYW4gYXhpcy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHBvc2l0aW9uXG4gICAqIEBwYXJhbSBsZW5ndGhcbiAgICogQHBhcmFtIGluZGV4XG4gICAqIEBwYXJhbSBsYWJlbHNcbiAgICogQHBhcmFtIGF4aXNcbiAgICogQHBhcmFtIGF4aXNPZmZzZXRcbiAgICogQHBhcmFtIGxhYmVsT2Zmc2V0XG4gICAqIEBwYXJhbSBncm91cFxuICAgKiBAcGFyYW0gY2xhc3Nlc1xuICAgKiBAcGFyYW0gdXNlRm9yZWlnbk9iamVjdFxuICAgKiBAcGFyYW0gZXZlbnRFbWl0dGVyXG4gICAqL1xuICBDaGFydGlzdC5jcmVhdGVMYWJlbCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBsZW5ndGgsIGluZGV4LCBsYWJlbHMsIGF4aXMsIGF4aXNPZmZzZXQsIGxhYmVsT2Zmc2V0LCBncm91cCwgY2xhc3NlcywgdXNlRm9yZWlnbk9iamVjdCwgZXZlbnRFbWl0dGVyKSB7XG4gICAgdmFyIGxhYmVsRWxlbWVudDtcbiAgICB2YXIgcG9zaXRpb25hbERhdGEgPSB7fTtcblxuICAgIHBvc2l0aW9uYWxEYXRhW2F4aXMudW5pdHMucG9zXSA9IHBvc2l0aW9uICsgbGFiZWxPZmZzZXRbYXhpcy51bml0cy5wb3NdO1xuICAgIHBvc2l0aW9uYWxEYXRhW2F4aXMuY291bnRlclVuaXRzLnBvc10gPSBsYWJlbE9mZnNldFtheGlzLmNvdW50ZXJVbml0cy5wb3NdO1xuICAgIHBvc2l0aW9uYWxEYXRhW2F4aXMudW5pdHMubGVuXSA9IGxlbmd0aDtcbiAgICBwb3NpdGlvbmFsRGF0YVtheGlzLmNvdW50ZXJVbml0cy5sZW5dID0gYXhpc09mZnNldCAtIDEwO1xuXG4gICAgaWYodXNlRm9yZWlnbk9iamVjdCkge1xuICAgICAgLy8gV2UgbmVlZCB0byBzZXQgd2lkdGggYW5kIGhlaWdodCBleHBsaWNpdGx5IHRvIHB4IGFzIHNwYW4gd2lsbCBub3QgZXhwYW5kIHdpdGggd2lkdGggYW5kIGhlaWdodCBiZWluZ1xuICAgICAgLy8gMTAwJSBpbiBhbGwgYnJvd3NlcnNcbiAgICAgIHZhciBjb250ZW50ID0gJzxzcGFuIGNsYXNzPVwiJyArIGNsYXNzZXMuam9pbignICcpICsgJ1wiIHN0eWxlPVwiJyArXG4gICAgICAgIGF4aXMudW5pdHMubGVuICsgJzogJyArIE1hdGgucm91bmQocG9zaXRpb25hbERhdGFbYXhpcy51bml0cy5sZW5dKSArICdweDsgJyArXG4gICAgICAgIGF4aXMuY291bnRlclVuaXRzLmxlbiArICc6ICcgKyBNYXRoLnJvdW5kKHBvc2l0aW9uYWxEYXRhW2F4aXMuY291bnRlclVuaXRzLmxlbl0pICsgJ3B4XCI+JyArXG4gICAgICAgIGxhYmVsc1tpbmRleF0gKyAnPC9zcGFuPic7XG5cbiAgICAgIGxhYmVsRWxlbWVudCA9IGdyb3VwLmZvcmVpZ25PYmplY3QoY29udGVudCwgQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgICAgc3R5bGU6ICdvdmVyZmxvdzogdmlzaWJsZTsnXG4gICAgICB9LCBwb3NpdGlvbmFsRGF0YSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYWJlbEVsZW1lbnQgPSBncm91cC5lbGVtKCd0ZXh0JywgcG9zaXRpb25hbERhdGEsIGNsYXNzZXMuam9pbignICcpKS50ZXh0KGxhYmVsc1tpbmRleF0pO1xuICAgIH1cblxuICAgIGV2ZW50RW1pdHRlci5lbWl0KCdkcmF3JywgQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgIHR5cGU6ICdsYWJlbCcsXG4gICAgICBheGlzOiBheGlzLFxuICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgZ3JvdXA6IGdyb3VwLFxuICAgICAgZWxlbWVudDogbGFiZWxFbGVtZW50LFxuICAgICAgdGV4dDogbGFiZWxzW2luZGV4XVxuICAgIH0sIHBvc2l0aW9uYWxEYXRhKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhlbHBlciB0byByZWFkIHNlcmllcyBzcGVjaWZpYyBvcHRpb25zIGZyb20gb3B0aW9ucyBvYmplY3QuIEl0IGF1dG9tYXRpY2FsbHkgZmFsbHMgYmFjayB0byB0aGUgZ2xvYmFsIG9wdGlvbiBpZlxuICAgKiB0aGVyZSBpcyBubyBvcHRpb24gaW4gdGhlIHNlcmllcyBvcHRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gc2VyaWVzIFNlcmllcyBvYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgQ2hhcnRpc3Qgb3B0aW9ucyBvYmplY3RcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgb3B0aW9ucyBrZXkgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBvYnRhaW4gdGhlIG9wdGlvbnNcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBDaGFydGlzdC5nZXRTZXJpZXNPcHRpb24gPSBmdW5jdGlvbihzZXJpZXMsIG9wdGlvbnMsIGtleSkge1xuICAgIGlmKHNlcmllcy5uYW1lICYmIG9wdGlvbnMuc2VyaWVzICYmIG9wdGlvbnMuc2VyaWVzW3Nlcmllcy5uYW1lXSkge1xuICAgICAgdmFyIHNlcmllc09wdGlvbnMgPSBvcHRpb25zLnNlcmllc1tzZXJpZXMubmFtZV07XG4gICAgICByZXR1cm4gc2VyaWVzT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpID8gc2VyaWVzT3B0aW9uc1trZXldIDogb3B0aW9uc1trZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3B0aW9uc1trZXldO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUHJvdmlkZXMgb3B0aW9ucyBoYW5kbGluZyBmdW5jdGlvbmFsaXR5IHdpdGggY2FsbGJhY2sgZm9yIG9wdGlvbnMgY2hhbmdlcyB0cmlnZ2VyZWQgYnkgcmVzcG9uc2l2ZSBvcHRpb25zIGFuZCBtZWRpYSBxdWVyeSBtYXRjaGVzXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgc2V0IGJ5IHVzZXJcbiAgICogQHBhcmFtIHtBcnJheX0gcmVzcG9uc2l2ZU9wdGlvbnMgT3B0aW9uYWwgZnVuY3Rpb25zIHRvIGFkZCByZXNwb25zaXZlIGJlaGF2aW9yIHRvIGNoYXJ0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudEVtaXR0ZXIgVGhlIGV2ZW50IGVtaXR0ZXIgdGhhdCB3aWxsIGJlIHVzZWQgdG8gZW1pdCB0aGUgb3B0aW9ucyBjaGFuZ2VkIGV2ZW50c1xuICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjb25zb2xpZGF0ZWQgb3B0aW9ucyBvYmplY3QgZnJvbSB0aGUgZGVmYXVsdHMsIGJhc2UgYW5kIG1hdGNoaW5nIHJlc3BvbnNpdmUgb3B0aW9uc1xuICAgKi9cbiAgQ2hhcnRpc3Qub3B0aW9uc1Byb3ZpZGVyID0gZnVuY3Rpb24gKG9wdGlvbnMsIHJlc3BvbnNpdmVPcHRpb25zLCBldmVudEVtaXR0ZXIpIHtcbiAgICB2YXIgYmFzZU9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMpLFxuICAgICAgY3VycmVudE9wdGlvbnMsXG4gICAgICBtZWRpYVF1ZXJ5TGlzdGVuZXJzID0gW10sXG4gICAgICBpO1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlQ3VycmVudE9wdGlvbnMocHJldmVudENoYW5nZWRFdmVudCkge1xuICAgICAgdmFyIHByZXZpb3VzT3B0aW9ucyA9IGN1cnJlbnRPcHRpb25zO1xuICAgICAgY3VycmVudE9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIGJhc2VPcHRpb25zKTtcblxuICAgICAgaWYgKHJlc3BvbnNpdmVPcHRpb25zKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCByZXNwb25zaXZlT3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBtcWwgPSB3aW5kb3cubWF0Y2hNZWRpYShyZXNwb25zaXZlT3B0aW9uc1tpXVswXSk7XG4gICAgICAgICAgaWYgKG1xbC5tYXRjaGVzKSB7XG4gICAgICAgICAgICBjdXJyZW50T3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZChjdXJyZW50T3B0aW9ucywgcmVzcG9uc2l2ZU9wdGlvbnNbaV1bMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihldmVudEVtaXR0ZXIgJiYgIXByZXZlbnRDaGFuZ2VkRXZlbnQpIHtcbiAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoJ29wdGlvbnNDaGFuZ2VkJywge1xuICAgICAgICAgIHByZXZpb3VzT3B0aW9uczogcHJldmlvdXNPcHRpb25zLFxuICAgICAgICAgIGN1cnJlbnRPcHRpb25zOiBjdXJyZW50T3B0aW9uc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVNZWRpYVF1ZXJ5TGlzdGVuZXJzKCkge1xuICAgICAgbWVkaWFRdWVyeUxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKG1xbCkge1xuICAgICAgICBtcWwucmVtb3ZlTGlzdGVuZXIodXBkYXRlQ3VycmVudE9wdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCF3aW5kb3cubWF0Y2hNZWRpYSkge1xuICAgICAgdGhyb3cgJ3dpbmRvdy5tYXRjaE1lZGlhIG5vdCBmb3VuZCEgTWFrZSBzdXJlIHlvdVxcJ3JlIHVzaW5nIGEgcG9seWZpbGwuJztcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNpdmVPcHRpb25zKSB7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCByZXNwb25zaXZlT3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbXFsID0gd2luZG93Lm1hdGNoTWVkaWEocmVzcG9uc2l2ZU9wdGlvbnNbaV1bMF0pO1xuICAgICAgICBtcWwuYWRkTGlzdGVuZXIodXBkYXRlQ3VycmVudE9wdGlvbnMpO1xuICAgICAgICBtZWRpYVF1ZXJ5TGlzdGVuZXJzLnB1c2gobXFsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRXhlY3V0ZSBpbml0aWFsbHkgc28gd2UgZ2V0IHRoZSBjb3JyZWN0IG9wdGlvbnNcbiAgICB1cGRhdGVDdXJyZW50T3B0aW9ucyh0cnVlKTtcblxuICAgIHJldHVybiB7XG4gICAgICByZW1vdmVNZWRpYVF1ZXJ5TGlzdGVuZXJzOiByZW1vdmVNZWRpYVF1ZXJ5TGlzdGVuZXJzLFxuICAgICAgZ2V0Q3VycmVudE9wdGlvbnM6IGZ1bmN0aW9uIGdldEN1cnJlbnRPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBjdXJyZW50T3B0aW9ucyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogQ2hhcnRpc3QgcGF0aCBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9ucy5cbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LkludGVycG9sYXRpb25cbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIENoYXJ0aXN0LkludGVycG9sYXRpb24gPSB7fTtcblxuICAvKipcbiAgICogVGhpcyBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIGRvZXMgbm90IHNtb290aCB0aGUgcGF0aCBhbmQgdGhlIHJlc3VsdCBpcyBvbmx5IGNvbnRhaW5pbmcgbGluZXMgYW5kIG5vIGN1cnZlcy5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogdmFyIGNoYXJ0ID0gbmV3IENoYXJ0aXN0LkxpbmUoJy5jdC1jaGFydCcsIHtcbiAgICogICBsYWJlbHM6IFsxLCAyLCAzLCA0LCA1XSxcbiAgICogICBzZXJpZXM6IFtbMSwgMiwgOCwgMSwgN11dXG4gICAqIH0sIHtcbiAgICogICBsaW5lU21vb3RoOiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLm5vbmUoe1xuICAgKiAgICAgZmlsbEhvbGVzOiBmYWxzZVxuICAgKiAgIH0pXG4gICAqIH0pO1xuICAgKlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvblxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICovXG4gIENoYXJ0aXN0LkludGVycG9sYXRpb24ubm9uZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBmaWxsSG9sZXM6IGZhbHNlXG4gICAgfTtcbiAgICBvcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5vbmUocGF0aENvb3JkaW5hdGVzLCB2YWx1ZURhdGEpIHtcbiAgICAgIHZhciBwYXRoID0gbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKCk7XG4gICAgICB2YXIgaG9sZSA9IHRydWU7XG5cbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoQ29vcmRpbmF0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgdmFyIGN1cnJYID0gcGF0aENvb3JkaW5hdGVzW2ldO1xuICAgICAgICB2YXIgY3VyclkgPSBwYXRoQ29vcmRpbmF0ZXNbaSArIDFdO1xuICAgICAgICB2YXIgY3VyckRhdGEgPSB2YWx1ZURhdGFbaSAvIDJdO1xuXG4gICAgICAgIGlmKGN1cnJEYXRhLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgIGlmKGhvbGUpIHtcbiAgICAgICAgICAgIHBhdGgubW92ZShjdXJyWCwgY3VyclksIGZhbHNlLCBjdXJyRGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGgubGluZShjdXJyWCwgY3VyclksIGZhbHNlLCBjdXJyRGF0YSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaG9sZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYoIW9wdGlvbnMuZmlsbEhvbGVzKSB7XG4gICAgICAgICAgaG9sZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogU2ltcGxlIHNtb290aGluZyBjcmVhdGVzIGhvcml6b250YWwgaGFuZGxlcyB0aGF0IGFyZSBwb3NpdGlvbmVkIHdpdGggYSBmcmFjdGlvbiBvZiB0aGUgbGVuZ3RoIGJldHdlZW4gdHdvIGRhdGEgcG9pbnRzLiBZb3UgY2FuIHVzZSB0aGUgZGl2aXNvciBvcHRpb24gdG8gc3BlY2lmeSB0aGUgYW1vdW50IG9mIHNtb290aGluZy5cbiAgICpcbiAgICogU2ltcGxlIHNtb290aGluZyBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIGBDaGFydGlzdC5TbW9vdGhpbmcuY2FyZGluYWxgIGlmIHlvdSdkIGxpa2UgdG8gZ2V0IHJpZCBvZiB0aGUgYXJ0aWZhY3RzIGl0IHByb2R1Y2VzIHNvbWV0aW1lcy4gU2ltcGxlIHNtb290aGluZyBwcm9kdWNlcyBsZXNzIGZsb3dpbmcgbGluZXMgYnV0IGlzIGFjY3VyYXRlIGJ5IGhpdHRpbmcgdGhlIHBvaW50cyBhbmQgaXQgYWxzbyBkb2Vzbid0IHN3aW5nIGJlbG93IG9yIGFib3ZlIHRoZSBnaXZlbiBkYXRhIHBvaW50LlxuICAgKlxuICAgKiBBbGwgc21vb3RoaW5nIGZ1bmN0aW9ucyB3aXRoaW4gQ2hhcnRpc3QgYXJlIGZhY3RvcnkgZnVuY3Rpb25zIHRoYXQgYWNjZXB0IGFuIG9wdGlvbnMgcGFyYW1ldGVyLiBUaGUgc2ltcGxlIGludGVycG9sYXRpb24gZnVuY3Rpb24gYWNjZXB0cyBvbmUgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXIgYGRpdmlzb3JgLCBiZXR3ZWVuIDEgYW5kIOKIniwgd2hpY2ggY29udHJvbHMgdGhlIHNtb290aGluZyBjaGFyYWN0ZXJpc3RpY3MuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIHZhciBjaGFydCA9IG5ldyBDaGFydGlzdC5MaW5lKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNV0sXG4gICAqICAgc2VyaWVzOiBbWzEsIDIsIDgsIDEsIDddXVxuICAgKiB9LCB7XG4gICAqICAgbGluZVNtb290aDogQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5zaW1wbGUoe1xuICAgKiAgICAgZGl2aXNvcjogMixcbiAgICogICAgIGZpbGxIb2xlczogZmFsc2VcbiAgICogICB9KVxuICAgKiB9KTtcbiAgICpcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkludGVycG9sYXRpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgb2YgdGhlIHNpbXBsZSBpbnRlcnBvbGF0aW9uIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKi9cbiAgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5zaW1wbGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgZGl2aXNvcjogMixcbiAgICAgIGZpbGxIb2xlczogZmFsc2VcbiAgICB9O1xuICAgIG9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcblxuICAgIHZhciBkID0gMSAvIE1hdGgubWF4KDEsIG9wdGlvbnMuZGl2aXNvcik7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gc2ltcGxlKHBhdGhDb29yZGluYXRlcywgdmFsdWVEYXRhKSB7XG4gICAgICB2YXIgcGF0aCA9IG5ldyBDaGFydGlzdC5TdmcuUGF0aCgpO1xuICAgICAgdmFyIHByZXZYLCBwcmV2WSwgcHJldkRhdGE7XG5cbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoQ29vcmRpbmF0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgdmFyIGN1cnJYID0gcGF0aENvb3JkaW5hdGVzW2ldO1xuICAgICAgICB2YXIgY3VyclkgPSBwYXRoQ29vcmRpbmF0ZXNbaSArIDFdO1xuICAgICAgICB2YXIgbGVuZ3RoID0gKGN1cnJYIC0gcHJldlgpICogZDtcbiAgICAgICAgdmFyIGN1cnJEYXRhID0gdmFsdWVEYXRhW2kgLyAyXTtcblxuICAgICAgICBpZihjdXJyRGF0YS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICBpZihwcmV2RGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwYXRoLm1vdmUoY3VyclgsIGN1cnJZLCBmYWxzZSwgY3VyckRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoLmN1cnZlKFxuICAgICAgICAgICAgICBwcmV2WCArIGxlbmd0aCxcbiAgICAgICAgICAgICAgcHJldlksXG4gICAgICAgICAgICAgIGN1cnJYIC0gbGVuZ3RoLFxuICAgICAgICAgICAgICBjdXJyWSxcbiAgICAgICAgICAgICAgY3VyclgsXG4gICAgICAgICAgICAgIGN1cnJZLFxuICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgY3VyckRhdGFcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcHJldlggPSBjdXJyWDtcbiAgICAgICAgICBwcmV2WSA9IGN1cnJZO1xuICAgICAgICAgIHByZXZEYXRhID0gY3VyckRhdGE7XG4gICAgICAgIH0gZWxzZSBpZighb3B0aW9ucy5maWxsSG9sZXMpIHtcbiAgICAgICAgICBwcmV2WCA9IGN1cnJYID0gcHJldkRhdGEgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FyZGluYWwgLyBDYXRtdWxsLVJvbWUgc3BsaW5lIGludGVycG9sYXRpb24gaXMgdGhlIGRlZmF1bHQgc21vb3RoaW5nIGZ1bmN0aW9uIGluIENoYXJ0aXN0LiBJdCBwcm9kdWNlcyBuaWNlIHJlc3VsdHMgd2hlcmUgdGhlIHNwbGluZXMgd2lsbCBhbHdheXMgbWVldCB0aGUgcG9pbnRzLiBJdCBwcm9kdWNlcyBzb21lIGFydGlmYWN0cyB0aG91Z2ggd2hlbiBkYXRhIHZhbHVlcyBhcmUgaW5jcmVhc2VkIG9yIGRlY3JlYXNlZCByYXBpZGx5LiBUaGUgbGluZSBtYXkgbm90IGZvbGxvdyBhIHZlcnkgYWNjdXJhdGUgcGF0aCBhbmQgaWYgdGhlIGxpbmUgc2hvdWxkIGJlIGFjY3VyYXRlIHRoaXMgc21vb3RoaW5nIGZ1bmN0aW9uIGRvZXMgbm90IHByb2R1Y2UgdGhlIGJlc3QgcmVzdWx0cy5cbiAgICpcbiAgICogQ2FyZGluYWwgc3BsaW5lcyBjYW4gb25seSBiZSBjcmVhdGVkIGlmIHRoZXJlIGFyZSBtb3JlIHRoYW4gdHdvIGRhdGEgcG9pbnRzLiBJZiB0aGlzIGlzIG5vdCB0aGUgY2FzZSB0aGlzIHNtb290aGluZyB3aWxsIGZhbGxiYWNrIHRvIGBDaGFydGlzdC5TbW9vdGhpbmcubm9uZWAuXG4gICAqXG4gICAqIEFsbCBzbW9vdGhpbmcgZnVuY3Rpb25zIHdpdGhpbiBDaGFydGlzdCBhcmUgZmFjdG9yeSBmdW5jdGlvbnMgdGhhdCBhY2NlcHQgYW4gb3B0aW9ucyBwYXJhbWV0ZXIuIFRoZSBjYXJkaW5hbCBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIGFjY2VwdHMgb25lIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyIGB0ZW5zaW9uYCwgYmV0d2VlbiAwIGFuZCAxLCB3aGljaCBjb250cm9scyB0aGUgc21vb3RoaW5nIGludGVuc2l0eS5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogdmFyIGNoYXJ0ID0gbmV3IENoYXJ0aXN0LkxpbmUoJy5jdC1jaGFydCcsIHtcbiAgICogICBsYWJlbHM6IFsxLCAyLCAzLCA0LCA1XSxcbiAgICogICBzZXJpZXM6IFtbMSwgMiwgOCwgMSwgN11dXG4gICAqIH0sIHtcbiAgICogICBsaW5lU21vb3RoOiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLmNhcmRpbmFsKHtcbiAgICogICAgIHRlbnNpb246IDEsXG4gICAqICAgICBmaWxsSG9sZXM6IGZhbHNlXG4gICAqICAgfSlcbiAgICogfSk7XG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIG9mIHRoZSBjYXJkaW5hbCBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICovXG4gIENoYXJ0aXN0LkludGVycG9sYXRpb24uY2FyZGluYWwgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgdGVuc2lvbjogMSxcbiAgICAgIGZpbGxIb2xlczogZmFsc2VcbiAgICB9O1xuXG4gICAgb3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgdmFyIHQgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBvcHRpb25zLnRlbnNpb24pKSxcbiAgICAgIGMgPSAxIC0gdDtcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gd2lsbCBoZWxwIHVzIHRvIHNwbGl0IHBhdGhDb29yZGluYXRlcyBhbmQgdmFsdWVEYXRhIGludG8gc2VnbWVudHMgdGhhdCBhbHNvIGNvbnRhaW4gcGF0aENvb3JkaW5hdGVzXG4gICAgLy8gYW5kIHZhbHVlRGF0YS4gVGhpcyB3YXkgdGhlIGV4aXN0aW5nIGZ1bmN0aW9ucyBjYW4gYmUgcmV1c2VkIGFuZCB0aGUgc2VnbWVudCBwYXRocyBjYW4gYmUgam9pbmVkIGFmdGVyd2FyZHMuXG4gICAgLy8gVGhpcyBmdW5jdGlvbmFsaXR5IGlzIG5lY2Vzc2FyeSB0byB0cmVhdCBcImhvbGVzXCIgaW4gdGhlIGxpbmUgY2hhcnRzXG4gICAgZnVuY3Rpb24gc3BsaXRJbnRvU2VnbWVudHMocGF0aENvb3JkaW5hdGVzLCB2YWx1ZURhdGEpIHtcbiAgICAgIHZhciBzZWdtZW50cyA9IFtdO1xuICAgICAgdmFyIGhvbGUgPSB0cnVlO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcGF0aENvb3JkaW5hdGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIC8vIElmIHRoaXMgdmFsdWUgaXMgYSBcImhvbGVcIiB3ZSBzZXQgdGhlIGhvbGUgZmxhZ1xuICAgICAgICBpZih2YWx1ZURhdGFbaSAvIDJdLnZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZighb3B0aW9ucy5maWxsSG9sZXMpIHtcbiAgICAgICAgICAgIGhvbGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBpdCdzIGEgdmFsaWQgdmFsdWUgd2UgbmVlZCB0byBjaGVjayBpZiB3ZSdyZSBjb21pbmcgb3V0IG9mIGEgaG9sZSBhbmQgY3JlYXRlIGEgbmV3IGVtcHR5IHNlZ21lbnRcbiAgICAgICAgICBpZihob2xlKSB7XG4gICAgICAgICAgICBzZWdtZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgcGF0aENvb3JkaW5hdGVzOiBbXSxcbiAgICAgICAgICAgICAgdmFsdWVEYXRhOiBbXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBcyB3ZSBoYXZlIGEgdmFsaWQgdmFsdWUgbm93LCB3ZSBhcmUgbm90IGluIGEgXCJob2xlXCIgYW55bW9yZVxuICAgICAgICAgICAgaG9sZSA9IGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEFkZCB0byB0aGUgc2VnbWVudCBwYXRoQ29vcmRpbmF0ZXMgYW5kIHZhbHVlRGF0YVxuICAgICAgICAgIHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdLnBhdGhDb29yZGluYXRlcy5wdXNoKHBhdGhDb29yZGluYXRlc1tpXSwgcGF0aENvb3JkaW5hdGVzW2kgKyAxXSk7XG4gICAgICAgICAgc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0udmFsdWVEYXRhLnB1c2godmFsdWVEYXRhW2kgLyAyXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBjYXJkaW5hbChwYXRoQ29vcmRpbmF0ZXMsIHZhbHVlRGF0YSkge1xuICAgICAgLy8gRmlyc3Qgd2UgdHJ5IHRvIHNwbGl0IHRoZSBjb29yZGluYXRlcyBpbnRvIHNlZ21lbnRzXG4gICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSB0byB0cmVhdCBcImhvbGVzXCIgaW4gbGluZSBjaGFydHNcbiAgICAgIHZhciBzZWdtZW50cyA9IHNwbGl0SW50b1NlZ21lbnRzKHBhdGhDb29yZGluYXRlcywgdmFsdWVEYXRhKTtcblxuICAgICAgLy8gSWYgdGhlIHNwbGl0IHJlc3VsdGVkIGluIG1vcmUgdGhhdCBvbmUgc2VnbWVudCB3ZSBuZWVkIHRvIGludGVycG9sYXRlIGVhY2ggc2VnbWVudCBpbmRpdmlkdWFsbHkgYW5kIGpvaW4gdGhlbVxuICAgICAgLy8gYWZ0ZXJ3YXJkcyB0b2dldGhlciBpbnRvIGEgc2luZ2xlIHBhdGguXG4gICAgICBpZihzZWdtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHZhciBwYXRocyA9IFtdO1xuICAgICAgICAvLyBGb3IgZWFjaCBzZWdtZW50IHdlIHdpbGwgcmVjdXJzZSB0aGUgY2FyZGluYWwgZnVuY3Rpb25cbiAgICAgICAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbihzZWdtZW50KSB7XG4gICAgICAgICAgcGF0aHMucHVzaChjYXJkaW5hbChzZWdtZW50LnBhdGhDb29yZGluYXRlcywgc2VnbWVudC52YWx1ZURhdGEpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEpvaW4gdGhlIHNlZ21lbnQgcGF0aCBkYXRhIGludG8gYSBzaW5nbGUgcGF0aCBhbmQgcmV0dXJuXG4gICAgICAgIHJldHVybiBDaGFydGlzdC5TdmcuUGF0aC5qb2luKHBhdGhzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZXJlIHdhcyBvbmx5IG9uZSBzZWdtZW50IHdlIGNhbiBwcm9jZWVkIHJlZ3VsYXJseSBieSB1c2luZyBwYXRoQ29vcmRpbmF0ZXMgYW5kIHZhbHVlRGF0YSBmcm9tIHRoZSBmaXJzdFxuICAgICAgICAvLyBzZWdtZW50XG4gICAgICAgIHBhdGhDb29yZGluYXRlcyA9IHNlZ21lbnRzWzBdLnBhdGhDb29yZGluYXRlcztcbiAgICAgICAgdmFsdWVEYXRhID0gc2VnbWVudHNbMF0udmFsdWVEYXRhO1xuXG4gICAgICAgIC8vIElmIGxlc3MgdGhhbiB0d28gcG9pbnRzIHdlIG5lZWQgdG8gZmFsbGJhY2sgdG8gbm8gc21vb3RoaW5nXG4gICAgICAgIGlmKHBhdGhDb29yZGluYXRlcy5sZW5ndGggPD0gNCkge1xuICAgICAgICAgIHJldHVybiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLm5vbmUoKShwYXRoQ29vcmRpbmF0ZXMsIHZhbHVlRGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcGF0aCA9IG5ldyBDaGFydGlzdC5TdmcuUGF0aCgpLm1vdmUocGF0aENvb3JkaW5hdGVzWzBdLCBwYXRoQ29vcmRpbmF0ZXNbMV0sIGZhbHNlLCB2YWx1ZURhdGFbMF0pLFxuICAgICAgICAgIHo7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlMZW4gPSBwYXRoQ29vcmRpbmF0ZXMubGVuZ3RoOyBpTGVuIC0gMiAqICF6ID4gaTsgaSArPSAyKSB7XG4gICAgICAgICAgdmFyIHAgPSBbXG4gICAgICAgICAgICB7eDogK3BhdGhDb29yZGluYXRlc1tpIC0gMl0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbaSAtIDFdfSxcbiAgICAgICAgICAgIHt4OiArcGF0aENvb3JkaW5hdGVzW2ldLCB5OiArcGF0aENvb3JkaW5hdGVzW2kgKyAxXX0sXG4gICAgICAgICAgICB7eDogK3BhdGhDb29yZGluYXRlc1tpICsgMl0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbaSArIDNdfSxcbiAgICAgICAgICAgIHt4OiArcGF0aENvb3JkaW5hdGVzW2kgKyA0XSwgeTogK3BhdGhDb29yZGluYXRlc1tpICsgNV19XG4gICAgICAgICAgXTtcbiAgICAgICAgICBpZiAoeikge1xuICAgICAgICAgICAgaWYgKCFpKSB7XG4gICAgICAgICAgICAgIHBbMF0gPSB7eDogK3BhdGhDb29yZGluYXRlc1tpTGVuIC0gMl0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbaUxlbiAtIDFdfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaUxlbiAtIDQgPT09IGkpIHtcbiAgICAgICAgICAgICAgcFszXSA9IHt4OiArcGF0aENvb3JkaW5hdGVzWzBdLCB5OiArcGF0aENvb3JkaW5hdGVzWzFdfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaUxlbiAtIDIgPT09IGkpIHtcbiAgICAgICAgICAgICAgcFsyXSA9IHt4OiArcGF0aENvb3JkaW5hdGVzWzBdLCB5OiArcGF0aENvb3JkaW5hdGVzWzFdfTtcbiAgICAgICAgICAgICAgcFszXSA9IHt4OiArcGF0aENvb3JkaW5hdGVzWzJdLCB5OiArcGF0aENvb3JkaW5hdGVzWzNdfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlMZW4gLSA0ID09PSBpKSB7XG4gICAgICAgICAgICAgIHBbM10gPSBwWzJdO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaSkge1xuICAgICAgICAgICAgICBwWzBdID0ge3g6ICtwYXRoQ29vcmRpbmF0ZXNbaV0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbaSArIDFdfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwYXRoLmN1cnZlKFxuICAgICAgICAgICAgKHQgKiAoLXBbMF0ueCArIDYgKiBwWzFdLnggKyBwWzJdLngpIC8gNikgKyAoYyAqIHBbMl0ueCksXG4gICAgICAgICAgICAodCAqICgtcFswXS55ICsgNiAqIHBbMV0ueSArIHBbMl0ueSkgLyA2KSArIChjICogcFsyXS55KSxcbiAgICAgICAgICAgICh0ICogKHBbMV0ueCArIDYgKiBwWzJdLnggLSBwWzNdLngpIC8gNikgKyAoYyAqIHBbMl0ueCksXG4gICAgICAgICAgICAodCAqIChwWzFdLnkgKyA2ICogcFsyXS55IC0gcFszXS55KSAvIDYpICsgKGMgKiBwWzJdLnkpLFxuICAgICAgICAgICAgcFsyXS54LFxuICAgICAgICAgICAgcFsyXS55LFxuICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZURhdGFbKGkgKyAyKSAvIDJdXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIFN0ZXAgaW50ZXJwb2xhdGlvbiB3aWxsIGNhdXNlIHRoZSBsaW5lIGNoYXJ0IHRvIG1vdmUgaW4gc3RlcHMgcmF0aGVyIHRoYW4gZGlhZ29uYWwgb3Igc21vb3RoZWQgbGluZXMuIFRoaXMgaW50ZXJwb2xhdGlvbiB3aWxsIGNyZWF0ZSBhZGRpdGlvbmFsIHBvaW50cyB0aGF0IHdpbGwgYWxzbyBiZSBkcmF3biB3aGVuIHRoZSBgc2hvd1BvaW50YCBvcHRpb24gaXMgZW5hYmxlZC5cbiAgICpcbiAgICogQWxsIHNtb290aGluZyBmdW5jdGlvbnMgd2l0aGluIENoYXJ0aXN0IGFyZSBmYWN0b3J5IGZ1bmN0aW9ucyB0aGF0IGFjY2VwdCBhbiBvcHRpb25zIHBhcmFtZXRlci4gVGhlIHN0ZXAgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiBhY2NlcHRzIG9uZSBjb25maWd1cmF0aW9uIHBhcmFtZXRlciBgcG9zdHBvbmVgLCB0aGF0IGNhbiBiZSBgdHJ1ZWAgb3IgYGZhbHNlYC4gVGhlIGRlZmF1bHQgdmFsdWUgaXMgYHRydWVgIGFuZCB3aWxsIGNhdXNlIHRoZSBzdGVwIHRvIG9jY3VyIHdoZXJlIHRoZSB2YWx1ZSBhY3R1YWxseSBjaGFuZ2VzLiBJZiBhIGRpZmZlcmVudCBiZWhhdmlvdXIgaXMgbmVlZGVkIHdoZXJlIHRoZSBzdGVwIGlzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYW5kIGhhcHBlbnMgYmVmb3JlIHRoZSBhY3R1YWwgdmFsdWUsIHRoaXMgb3B0aW9uIGNhbiBiZSBzZXQgdG8gYGZhbHNlYC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogdmFyIGNoYXJ0ID0gbmV3IENoYXJ0aXN0LkxpbmUoJy5jdC1jaGFydCcsIHtcbiAgICogICBsYWJlbHM6IFsxLCAyLCAzLCA0LCA1XSxcbiAgICogICBzZXJpZXM6IFtbMSwgMiwgOCwgMSwgN11dXG4gICAqIH0sIHtcbiAgICogICBsaW5lU21vb3RoOiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLnN0ZXAoe1xuICAgKiAgICAgcG9zdHBvbmU6IHRydWUsXG4gICAqICAgICBmaWxsSG9sZXM6IGZhbHNlXG4gICAqICAgfSlcbiAgICogfSk7XG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAgICovXG4gIENoYXJ0aXN0LkludGVycG9sYXRpb24uc3RlcCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBwb3N0cG9uZTogdHJ1ZSxcbiAgICAgIGZpbGxIb2xlczogZmFsc2VcbiAgICB9O1xuXG4gICAgb3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHN0ZXAocGF0aENvb3JkaW5hdGVzLCB2YWx1ZURhdGEpIHtcbiAgICAgIHZhciBwYXRoID0gbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKCk7XG5cbiAgICAgIHZhciBwcmV2WCwgcHJldlksIHByZXZEYXRhO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhDb29yZGluYXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICB2YXIgY3VyclggPSBwYXRoQ29vcmRpbmF0ZXNbaV07XG4gICAgICAgIHZhciBjdXJyWSA9IHBhdGhDb29yZGluYXRlc1tpICsgMV07XG4gICAgICAgIHZhciBjdXJyRGF0YSA9IHZhbHVlRGF0YVtpIC8gMl07XG5cbiAgICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgcG9pbnQgaXMgYWxzbyBub3QgYSBob2xlIHdlIGNhbiBkcmF3IHRoZSBzdGVwIGxpbmVzXG4gICAgICAgIGlmKGN1cnJEYXRhLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZihwcmV2RGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwYXRoLm1vdmUoY3VyclgsIGN1cnJZLCBmYWxzZSwgY3VyckRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihvcHRpb25zLnBvc3Rwb25lKSB7XG4gICAgICAgICAgICAgIC8vIElmIHBvc3Rwb25lZCB3ZSBzaG91bGQgZHJhdyB0aGUgc3RlcCBsaW5lIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBwcmV2aW91cyB2YWx1ZVxuICAgICAgICAgICAgICBwYXRoLmxpbmUoY3VyclgsIHByZXZZLCBmYWxzZSwgcHJldkRhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gSWYgbm90IHBvc3Rwb25lZCB3ZSBzaG91bGQgZHJhdyB0aGUgc3RlcCBsaW5lIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBjdXJyZW50IHZhbHVlXG4gICAgICAgICAgICAgIHBhdGgubGluZShwcmV2WCwgY3VyclksIGZhbHNlLCBjdXJyRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBMaW5lIHRvIHRoZSBhY3R1YWwgcG9pbnQgKHRoaXMgc2hvdWxkIG9ubHkgYmUgYSBZLUF4aXMgbW92ZW1lbnRcbiAgICAgICAgICAgIHBhdGgubGluZShjdXJyWCwgY3VyclksIGZhbHNlLCBjdXJyRGF0YSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcHJldlggPSBjdXJyWDtcbiAgICAgICAgICBwcmV2WSA9IGN1cnJZO1xuICAgICAgICAgIHByZXZEYXRhID0gY3VyckRhdGE7XG4gICAgICAgIH0gZWxzZSBpZighb3B0aW9ucy5maWxsSG9sZXMpIHtcbiAgICAgICAgICBwcmV2WCA9IHByZXZZID0gcHJldkRhdGEgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfTtcbiAgfTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogQSB2ZXJ5IGJhc2ljIGV2ZW50IG1vZHVsZSB0aGF0IGhlbHBzIHRvIGdlbmVyYXRlIGFuZCBjYXRjaCBldmVudHMuXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5FdmVudFxuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIENoYXJ0aXN0LkV2ZW50RW1pdHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGFuZGxlcnMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbiBldmVudCBoYW5kbGVyIGZvciBhIHNwZWNpZmljIGV2ZW50XG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuRXZlbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIEEgZXZlbnQgaGFuZGxlciBmdW5jdGlvblxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFkZEV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlcikge1xuICAgICAgaGFuZGxlcnNbZXZlbnRdID0gaGFuZGxlcnNbZXZlbnRdIHx8IFtdO1xuICAgICAgaGFuZGxlcnNbZXZlbnRdLnB1c2goaGFuZGxlcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFuIGV2ZW50IGhhbmRsZXIgb2YgYSBzcGVjaWZpYyBldmVudCBuYW1lIG9yIHJlbW92ZSBhbGwgZXZlbnQgaGFuZGxlcnMgZm9yIGEgc3BlY2lmaWMgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuRXZlbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWUgd2hlcmUgYSBzcGVjaWZpYyBvciBhbGwgaGFuZGxlcnMgc2hvdWxkIGJlIHJlbW92ZWRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaGFuZGxlcl0gQW4gb3B0aW9uYWwgZXZlbnQgaGFuZGxlciBmdW5jdGlvbi4gSWYgc3BlY2lmaWVkIG9ubHkgdGhpcyBzcGVjaWZpYyBoYW5kbGVyIHdpbGwgYmUgcmVtb3ZlZCBhbmQgb3RoZXJ3aXNlIGFsbCBoYW5kbGVycyBhcmUgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZW1vdmVFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgIC8vIE9ubHkgZG8gc29tZXRoaW5nIGlmIHRoZXJlIGFyZSBldmVudCBoYW5kbGVycyB3aXRoIHRoaXMgbmFtZSBleGlzdGluZ1xuICAgICAgaWYoaGFuZGxlcnNbZXZlbnRdKSB7XG4gICAgICAgIC8vIElmIGhhbmRsZXIgaXMgc2V0IHdlIHdpbGwgbG9vayBmb3IgYSBzcGVjaWZpYyBoYW5kbGVyIGFuZCBvbmx5IHJlbW92ZSB0aGlzXG4gICAgICAgIGlmKGhhbmRsZXIpIHtcbiAgICAgICAgICBoYW5kbGVyc1tldmVudF0uc3BsaWNlKGhhbmRsZXJzW2V2ZW50XS5pbmRleE9mKGhhbmRsZXIpLCAxKTtcbiAgICAgICAgICBpZihoYW5kbGVyc1tldmVudF0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBkZWxldGUgaGFuZGxlcnNbZXZlbnRdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBubyBoYW5kbGVyIGlzIHNwZWNpZmllZCB3ZSByZW1vdmUgYWxsIGhhbmRsZXJzIGZvciB0aGlzIGV2ZW50XG4gICAgICAgICAgZGVsZXRlIGhhbmRsZXJzW2V2ZW50XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIGVtaXQgYW4gZXZlbnQuIEFsbCBoYW5kbGVycyB0aGF0IGFyZSBsaXN0ZW5pbmcgZm9yIHRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2l0aCB0aGUgZGF0YSBwYXJhbWV0ZXIuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuRXZlbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWUgdGhhdCBzaG91bGQgYmUgdHJpZ2dlcmVkXG4gICAgICogQHBhcmFtIHsqfSBkYXRhIEFyYml0cmFyeSBkYXRhIHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIgY2FsbGJhY2sgZnVuY3Rpb25zXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW1pdChldmVudCwgZGF0YSkge1xuICAgICAgLy8gT25seSBkbyBzb21ldGhpbmcgaWYgdGhlcmUgYXJlIGV2ZW50IGhhbmRsZXJzIHdpdGggdGhpcyBuYW1lIGV4aXN0aW5nXG4gICAgICBpZihoYW5kbGVyc1tldmVudF0pIHtcbiAgICAgICAgaGFuZGxlcnNbZXZlbnRdLmZvckVhY2goZnVuY3Rpb24oaGFuZGxlcikge1xuICAgICAgICAgIGhhbmRsZXIoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBFbWl0IGV2ZW50IHRvIHN0YXIgZXZlbnQgaGFuZGxlcnNcbiAgICAgIGlmKGhhbmRsZXJzWycqJ10pIHtcbiAgICAgICAgaGFuZGxlcnNbJyonXS5mb3JFYWNoKGZ1bmN0aW9uKHN0YXJIYW5kbGVyKSB7XG4gICAgICAgICAgc3RhckhhbmRsZXIoZXZlbnQsIGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgYWRkRXZlbnRIYW5kbGVyOiBhZGRFdmVudEhhbmRsZXIsXG4gICAgICByZW1vdmVFdmVudEhhbmRsZXI6IHJlbW92ZUV2ZW50SGFuZGxlcixcbiAgICAgIGVtaXQ6IGVtaXRcbiAgICB9O1xuICB9O1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBzb21lIGJhc2ljIHByb3RvdHlwZSBpbmhlcml0YW5jZSB1dGlsaXRpZXMuXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5DbGFzc1xuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gbGlzdFRvQXJyYXkobGlzdCkge1xuICAgIHZhciBhcnIgPSBbXTtcbiAgICBpZiAobGlzdC5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnIucHVzaChsaXN0W2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gZXh0ZW5kIGZyb20gY3VycmVudCBwcm90b3R5cGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5DbGFzc1xuICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllcyBUaGUgb2JqZWN0IHRoYXQgc2VydmVzIGFzIGRlZmluaXRpb24gZm9yIHRoZSBwcm90b3R5cGUgdGhhdCBnZXRzIGNyZWF0ZWQgZm9yIHRoZSBuZXcgY2xhc3MuIFRoaXMgb2JqZWN0IHNob3VsZCBhbHdheXMgY29udGFpbiBhIGNvbnN0cnVjdG9yIHByb3BlcnR5IHRoYXQgaXMgdGhlIGRlc2lyZWQgY29uc3RydWN0b3IgZm9yIHRoZSBuZXdseSBjcmVhdGVkIGNsYXNzLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW3N1cGVyUHJvdG9PdmVycmlkZV0gQnkgZGVmYXVsdCBleHRlbnMgd2lsbCB1c2UgdGhlIGN1cnJlbnQgY2xhc3MgcHJvdG90eXBlIG9yIENoYXJ0aXN0LmNsYXNzLiBXaXRoIHRoaXMgcGFyYW1ldGVyIHlvdSBjYW4gc3BlY2lmeSBhbnkgc3VwZXIgcHJvdG90eXBlIHRoYXQgd2lsbCBiZSB1c2VkLlxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQ29uc3RydWN0b3IgZnVuY3Rpb24gb2YgdGhlIG5ldyBjbGFzc1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB2YXIgRnJ1aXQgPSBDbGFzcy5leHRlbmQoe1xuICAgICAqIGNvbG9yOiB1bmRlZmluZWQsXG4gICAgICogICBzdWdhcjogdW5kZWZpbmVkLFxuICAgICAqXG4gICAgICogICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oY29sb3IsIHN1Z2FyKSB7XG4gICAgICogICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICAgKiAgICAgdGhpcy5zdWdhciA9IHN1Z2FyO1xuICAgICAqICAgfSxcbiAgICAgKlxuICAgICAqICAgZWF0OiBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgdGhpcy5zdWdhciA9IDA7XG4gICAgICogICAgIHJldHVybiB0aGlzO1xuICAgICAqICAgfVxuICAgICAqIH0pO1xuICAgKlxuICAgKiB2YXIgQmFuYW5hID0gRnJ1aXQuZXh0ZW5kKHtcbiAgICAgKiAgIGxlbmd0aDogdW5kZWZpbmVkLFxuICAgICAqXG4gICAgICogICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24obGVuZ3RoLCBzdWdhcikge1xuICAgICAqICAgICBCYW5hbmEuc3VwZXIuY29uc3RydWN0b3IuY2FsbCh0aGlzLCAnWWVsbG93Jywgc3VnYXIpO1xuICAgICAqICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgKiAgIH1cbiAgICAgKiB9KTtcbiAgICpcbiAgICogdmFyIGJhbmFuYSA9IG5ldyBCYW5hbmEoMjAsIDQwKTtcbiAgICogY29uc29sZS5sb2coJ2JhbmFuYSBpbnN0YW5jZW9mIEZydWl0JywgYmFuYW5hIGluc3RhbmNlb2YgRnJ1aXQpO1xuICAgKiBjb25zb2xlLmxvZygnRnJ1aXQgaXMgcHJvdG90eXBlIG9mIGJhbmFuYScsIEZydWl0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJhbmFuYSkpO1xuICAgKiBjb25zb2xlLmxvZygnYmFuYW5hcyBwcm90b3R5cGUgaXMgRnJ1aXQnLCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYmFuYW5hKSA9PT0gRnJ1aXQucHJvdG90eXBlKTtcbiAgICogY29uc29sZS5sb2coYmFuYW5hLnN1Z2FyKTtcbiAgICogY29uc29sZS5sb2coYmFuYW5hLmVhdCgpLnN1Z2FyKTtcbiAgICogY29uc29sZS5sb2coYmFuYW5hLmNvbG9yKTtcbiAgICovXG4gIGZ1bmN0aW9uIGV4dGVuZChwcm9wZXJ0aWVzLCBzdXBlclByb3RvT3ZlcnJpZGUpIHtcbiAgICB2YXIgc3VwZXJQcm90byA9IHN1cGVyUHJvdG9PdmVycmlkZSB8fCB0aGlzLnByb3RvdHlwZSB8fCBDaGFydGlzdC5DbGFzcztcbiAgICB2YXIgcHJvdG8gPSBPYmplY3QuY3JlYXRlKHN1cGVyUHJvdG8pO1xuXG4gICAgQ2hhcnRpc3QuQ2xhc3MuY2xvbmVEZWZpbml0aW9ucyhwcm90bywgcHJvcGVydGllcyk7XG5cbiAgICB2YXIgY29uc3RyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm4gPSBwcm90by5jb25zdHJ1Y3RvciB8fCBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgaW5zdGFuY2U7XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgbGlua2VkIHRvIHRoZSBDaGFydGlzdCBuYW1lc3BhY2UgdGhlIGNvbnN0cnVjdG9yIHdhcyBub3QgY2FsbGVkIHdpdGggbmV3XG4gICAgICAvLyBUbyBwcm92aWRlIGEgZmFsbGJhY2sgd2Ugd2lsbCBpbnN0YW50aWF0ZSBoZXJlIGFuZCByZXR1cm4gdGhlIGluc3RhbmNlXG4gICAgICBpbnN0YW5jZSA9IHRoaXMgPT09IENoYXJ0aXN0ID8gT2JqZWN0LmNyZWF0ZShwcm90bykgOiB0aGlzO1xuICAgICAgZm4uYXBwbHkoaW5zdGFuY2UsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkpO1xuXG4gICAgICAvLyBJZiB0aGlzIGNvbnN0cnVjdG9yIHdhcyBub3QgY2FsbGVkIHdpdGggbmV3IHdlIG5lZWQgdG8gcmV0dXJuIHRoZSBpbnN0YW5jZVxuICAgICAgLy8gVGhpcyB3aWxsIG5vdCBoYXJtIHdoZW4gdGhlIGNvbnN0cnVjdG9yIGhhcyBiZWVuIGNhbGxlZCB3aXRoIG5ldyBhcyB0aGUgcmV0dXJuZWQgdmFsdWUgaXMgaWdub3JlZFxuICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH07XG5cbiAgICBjb25zdHIucHJvdG90eXBlID0gcHJvdG87XG4gICAgY29uc3RyLnN1cGVyID0gc3VwZXJQcm90bztcbiAgICBjb25zdHIuZXh0ZW5kID0gdGhpcy5leHRlbmQ7XG5cbiAgICByZXR1cm4gY29uc3RyO1xuICB9XG5cbiAgLy8gVmFyaWFibGUgYXJndW1lbnQgbGlzdCBjbG9uZXMgYXJncyA+IDAgaW50byBhcmdzWzBdIGFuZCByZXRydW5zIG1vZGlmaWVkIGFyZ3NbMF1cbiAgZnVuY3Rpb24gY2xvbmVEZWZpbml0aW9ucygpIHtcbiAgICB2YXIgYXJncyA9IGxpc3RUb0FycmF5KGFyZ3VtZW50cyk7XG4gICAgdmFyIHRhcmdldCA9IGFyZ3NbMF07XG5cbiAgICBhcmdzLnNwbGljZSgxLCBhcmdzLmxlbmd0aCAtIDEpLmZvckVhY2goZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wTmFtZSkge1xuICAgICAgICAvLyBJZiB0aGlzIHByb3BlcnR5IGFscmVhZHkgZXhpc3QgaW4gdGFyZ2V0IHdlIGRlbGV0ZSBpdCBmaXJzdFxuICAgICAgICBkZWxldGUgdGFyZ2V0W3Byb3BOYW1lXTtcbiAgICAgICAgLy8gRGVmaW5lIHRoZSBwcm9wZXJ0eSB3aXRoIHRoZSBkZXNjcmlwdG9yIGZyb20gc291cmNlXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BOYW1lLFxuICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBwcm9wTmFtZSkpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgQ2hhcnRpc3QuQ2xhc3MgPSB7XG4gICAgZXh0ZW5kOiBleHRlbmQsXG4gICAgY2xvbmVEZWZpbml0aW9uczogY2xvbmVEZWZpbml0aW9uc1xuICB9O1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBCYXNlIGZvciBhbGwgY2hhcnQgdHlwZXMuIFRoZSBtZXRob2RzIGluIENoYXJ0aXN0LkJhc2UgYXJlIGluaGVyaXRlZCB0byBhbGwgY2hhcnQgdHlwZXMuXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5CYXNlXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBUT0RPOiBDdXJyZW50bHkgd2UgbmVlZCB0byByZS1kcmF3IHRoZSBjaGFydCBvbiB3aW5kb3cgcmVzaXplLiBUaGlzIGlzIHVzdWFsbHkgdmVyeSBiYWQgYW5kIHdpbGwgYWZmZWN0IHBlcmZvcm1hbmNlLlxuICAvLyBUaGlzIGlzIGRvbmUgYmVjYXVzZSB3ZSBjYW4ndCB3b3JrIHdpdGggcmVsYXRpdmUgY29vcmRpbmF0ZXMgd2hlbiBkcmF3aW5nIHRoZSBjaGFydCBiZWNhdXNlIFNWRyBQYXRoIGRvZXMgbm90XG4gIC8vIHdvcmsgd2l0aCByZWxhdGl2ZSBwb3NpdGlvbnMgeWV0LiBXZSBuZWVkIHRvIGNoZWNrIGlmIHdlIGNhbiBkbyBhIHZpZXdCb3ggaGFjayB0byBzd2l0Y2ggdG8gcGVyY2VudGFnZS5cbiAgLy8gU2VlIGh0dHA6Ly9tb3ppbGxhLjY1MDYubjcubmFiYmxlLmNvbS9TcGVjeWZpbmctcGF0aHMtd2l0aC1wZXJjZW50YWdlcy11bml0LXRkMjQ3NDc0Lmh0bWxcbiAgLy8gVXBkYXRlOiBjYW4gYmUgZG9uZSB1c2luZyB0aGUgYWJvdmUgbWV0aG9kIHRlc3RlZCBoZXJlOiBodHRwOi8vY29kZXBlbi5pby9naW9ua3Vuei9wZW4vS0R2TGpcbiAgLy8gVGhlIHByb2JsZW0gaXMgd2l0aCB0aGUgbGFiZWwgb2Zmc2V0cyB0aGF0IGNhbid0IGJlIGNvbnZlcnRlZCBpbnRvIHBlcmNlbnRhZ2UgYW5kIGFmZmVjdGluZyB0aGUgY2hhcnQgY29udGFpbmVyXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjaGFydCB3aGljaCBjdXJyZW50bHkgZG9lcyBhIGZ1bGwgcmVjb25zdHJ1Y3Rpb24gb2YgdGhlIFNWRyBET01cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IFtkYXRhXSBPcHRpb25hbCBkYXRhIHlvdSdkIGxpa2UgdG8gc2V0IGZvciB0aGUgY2hhcnQgYmVmb3JlIGl0IHdpbGwgdXBkYXRlLiBJZiBub3Qgc3BlY2lmaWVkIHRoZSB1cGRhdGUgbWV0aG9kIHdpbGwgdXNlIHRoZSBkYXRhIHRoYXQgaXMgYWxyZWFkeSBjb25maWd1cmVkIHdpdGggdGhlIGNoYXJ0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIG9wdGlvbnMgeW91J2QgbGlrZSB0byBhZGQgdG8gdGhlIHByZXZpb3VzIG9wdGlvbnMgZm9yIHRoZSBjaGFydCBiZWZvcmUgaXQgd2lsbCB1cGRhdGUuIElmIG5vdCBzcGVjaWZpZWQgdGhlIHVwZGF0ZSBtZXRob2Qgd2lsbCB1c2UgdGhlIG9wdGlvbnMgdGhhdCBoYXZlIGJlZW4gYWxyZWFkeSBjb25maWd1cmVkIHdpdGggdGhlIGNoYXJ0LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvdmVycmlkZV0gSWYgc2V0IHRvIHRydWUsIHRoZSBwYXNzZWQgb3B0aW9ucyB3aWxsIGJlIHVzZWQgdG8gZXh0ZW5kIHRoZSBvcHRpb25zIHRoYXQgaGF2ZSBiZWVuIGNvbmZpZ3VyZWQgYWxyZWFkeS4gT3RoZXJ3aXNlIHRoZSBjaGFydCBkZWZhdWx0IG9wdGlvbnMgd2lsbCBiZSB1c2VkIGFzIHRoZSBiYXNlXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5CYXNlXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGUoZGF0YSwgb3B0aW9ucywgb3ZlcnJpZGUpIHtcbiAgICBpZihkYXRhKSB7XG4gICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgLy8gRXZlbnQgZm9yIGRhdGEgdHJhbnNmb3JtYXRpb24gdGhhdCBhbGxvd3MgdG8gbWFuaXB1bGF0ZSB0aGUgZGF0YSBiZWZvcmUgaXQgZ2V0cyByZW5kZXJlZCBpbiB0aGUgY2hhcnRzXG4gICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdkYXRhJywge1xuICAgICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZihvcHRpb25zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIG92ZXJyaWRlID8gdGhpcy5vcHRpb25zIDogdGhpcy5kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAgIC8vIElmIGNoYXJ0aXN0IHdhcyBub3QgaW5pdGlhbGl6ZWQgeWV0LCB3ZSBqdXN0IHNldCB0aGUgb3B0aW9ucyBhbmQgbGVhdmUgdGhlIHJlc3QgdG8gdGhlIGluaXRpYWxpemF0aW9uXG4gICAgICAvLyBPdGhlcndpc2Ugd2UgcmUtY3JlYXRlIHRoZSBvcHRpb25zUHJvdmlkZXIgYXQgdGhpcyBwb2ludFxuICAgICAgaWYoIXRoaXMuaW5pdGlhbGl6ZVRpbWVvdXRJZCkge1xuICAgICAgICB0aGlzLm9wdGlvbnNQcm92aWRlci5yZW1vdmVNZWRpYVF1ZXJ5TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMub3B0aW9uc1Byb3ZpZGVyID0gQ2hhcnRpc3Qub3B0aW9uc1Byb3ZpZGVyKHRoaXMub3B0aW9ucywgdGhpcy5yZXNwb25zaXZlT3B0aW9ucywgdGhpcy5ldmVudEVtaXR0ZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9ubHkgcmUtY3JlYXRlZCB0aGUgY2hhcnQgaWYgaXQgaGFzIGJlZW4gaW5pdGlhbGl6ZWQgeWV0XG4gICAgaWYoIXRoaXMuaW5pdGlhbGl6ZVRpbWVvdXRJZCkge1xuICAgICAgdGhpcy5jcmVhdGVDaGFydCh0aGlzLm9wdGlvbnNQcm92aWRlci5nZXRDdXJyZW50T3B0aW9ucygpKTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYSByZWZlcmVuY2UgdG8gdGhlIGNoYXJ0IG9iamVjdCB0byBjaGFpbiB1cCBjYWxsc1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBjYWxsZWQgb24gdGhlIEFQSSBvYmplY3Qgb2YgZWFjaCBjaGFydCBhbmQgd2lsbCB1bi1yZWdpc3RlciBhbGwgZXZlbnQgbGlzdGVuZXJzIHRoYXQgd2VyZSBhZGRlZCB0byBvdGhlciBjb21wb25lbnRzLiBUaGlzIGN1cnJlbnRseSBpbmNsdWRlcyBhIHdpbmRvdy5yZXNpemUgbGlzdGVuZXIgYXMgd2VsbCBhcyBtZWRpYSBxdWVyeSBsaXN0ZW5lcnMgaWYgYW55IHJlc3BvbnNpdmUgb3B0aW9ucyBoYXZlIGJlZW4gcHJvdmlkZWQuIFVzZSB0aGlzIGZ1bmN0aW9uIGlmIHlvdSBuZWVkIHRvIGRlc3Ryb3kgYW5kIHJlY3JlYXRlIENoYXJ0aXN0IGNoYXJ0cyBkeW5hbWljYWxseS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkJhc2VcbiAgICovXG4gIGZ1bmN0aW9uIGRldGFjaCgpIHtcbiAgICAvLyBPbmx5IGRldGFjaCBpZiBpbml0aWFsaXphdGlvbiBhbHJlYWR5IG9jY3VycmVkIG9uIHRoaXMgY2hhcnQuIElmIHRoaXMgY2hhcnQgc3RpbGwgaGFzbid0IGluaXRpYWxpemVkICh0aGVyZWZvcmVcbiAgICAvLyB0aGUgaW5pdGlhbGl6YXRpb25UaW1lb3V0SWQgaXMgc3RpbGwgYSB2YWxpZCB0aW1lb3V0IHJlZmVyZW5jZSwgd2Ugd2lsbCBjbGVhciB0aGUgdGltZW91dFxuICAgIGlmKCF0aGlzLmluaXRpYWxpemVUaW1lb3V0SWQpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnJlc2l6ZUxpc3RlbmVyKTtcbiAgICAgIHRoaXMub3B0aW9uc1Byb3ZpZGVyLnJlbW92ZU1lZGlhUXVlcnlMaXN0ZW5lcnMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLmluaXRpYWxpemVUaW1lb3V0SWQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzLiBUaGUgaGFuZGxlciBjYWxsYmFja3MgYXJlIHN5bmNocm9ub3VzIGFuZCB3aWxsIHJ1biBpbiB0aGUgbWFpbiB0aHJlYWQgcmF0aGVyIHRoYW4gdGhlIGV2ZW50IGxvb3AuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5CYXNlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC4gQ2hlY2sgdGhlIGV4YW1wbGVzIGZvciBzdXBwb3J0ZWQgZXZlbnRzLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIFRoZSBoYW5kbGVyIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiBhbiBldmVudCB3aXRoIHRoZSBnaXZlbiBuYW1lIHdhcyBlbWl0dGVkLiBUaGlzIGZ1bmN0aW9uIHdpbGwgcmVjZWl2ZSBhIGRhdGEgYXJndW1lbnQgd2hpY2ggY29udGFpbnMgZXZlbnQgZGF0YS4gU2VlIHRoZSBleGFtcGxlIGZvciBtb3JlIGRldGFpbHMuXG4gICAqL1xuICBmdW5jdGlvbiBvbihldmVudCwgaGFuZGxlcikge1xuICAgIHRoaXMuZXZlbnRFbWl0dGVyLmFkZEV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gdW4tcmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnMuIElmIHRoZSBoYW5kbGVyIGZ1bmN0aW9uIHBhcmFtZXRlciBpcyBvbWl0dGVkIGFsbCBoYW5kbGVycyBmb3IgdGhlIGdpdmVuIGV2ZW50IHdpbGwgYmUgdW4tcmVnaXN0ZXJlZC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkJhc2VcbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50IGZvciB3aGljaCBhIGhhbmRsZXIgc2hvdWxkIGJlIHJlbW92ZWRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2hhbmRsZXJdIFRoZSBoYW5kbGVyIGZ1bmN0aW9uIHRoYXQgdGhhdCB3YXMgcHJldmlvdXNseSB1c2VkIHRvIHJlZ2lzdGVyIGEgbmV3IGV2ZW50IGhhbmRsZXIuIFRoaXMgaGFuZGxlciB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZXZlbnQgaGFuZGxlciBsaXN0LiBJZiB0aGlzIHBhcmFtZXRlciBpcyBvbWl0dGVkIHRoZW4gYWxsIGV2ZW50IGhhbmRsZXJzIGZvciB0aGUgZ2l2ZW4gZXZlbnQgYXJlIHJlbW92ZWQgZnJvbSB0aGUgbGlzdC5cbiAgICovXG4gIGZ1bmN0aW9uIG9mZihldmVudCwgaGFuZGxlcikge1xuICAgIHRoaXMuZXZlbnRFbWl0dGVyLnJlbW92ZUV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIC8vIEFkZCB3aW5kb3cgcmVzaXplIGxpc3RlbmVyIHRoYXQgcmUtY3JlYXRlcyB0aGUgY2hhcnRcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5yZXNpemVMaXN0ZW5lcik7XG5cbiAgICAvLyBPYnRhaW4gY3VycmVudCBvcHRpb25zIGJhc2VkIG9uIG1hdGNoaW5nIG1lZGlhIHF1ZXJpZXMgKGlmIHJlc3BvbnNpdmUgb3B0aW9ucyBhcmUgZ2l2ZW4pXG4gICAgLy8gVGhpcyB3aWxsIGFsc28gcmVnaXN0ZXIgYSBsaXN0ZW5lciB0aGF0IGlzIHJlLWNyZWF0aW5nIHRoZSBjaGFydCBiYXNlZCBvbiBtZWRpYSBjaGFuZ2VzXG4gICAgdGhpcy5vcHRpb25zUHJvdmlkZXIgPSBDaGFydGlzdC5vcHRpb25zUHJvdmlkZXIodGhpcy5vcHRpb25zLCB0aGlzLnJlc3BvbnNpdmVPcHRpb25zLCB0aGlzLmV2ZW50RW1pdHRlcik7XG4gICAgLy8gUmVnaXN0ZXIgb3B0aW9ucyBjaGFuZ2UgbGlzdGVuZXIgdGhhdCB3aWxsIHRyaWdnZXIgYSBjaGFydCB1cGRhdGVcbiAgICB0aGlzLmV2ZW50RW1pdHRlci5hZGRFdmVudEhhbmRsZXIoJ29wdGlvbnNDaGFuZ2VkJywgZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBCZWZvcmUgdGhlIGZpcnN0IGNoYXJ0IGNyZWF0aW9uIHdlIG5lZWQgdG8gcmVnaXN0ZXIgdXMgd2l0aCBhbGwgcGx1Z2lucyB0aGF0IGFyZSBjb25maWd1cmVkXG4gICAgLy8gSW5pdGlhbGl6ZSBhbGwgcmVsZXZhbnQgcGx1Z2lucyB3aXRoIG91ciBjaGFydCBvYmplY3QgYW5kIHRoZSBwbHVnaW4gb3B0aW9ucyBzcGVjaWZpZWQgaW4gdGhlIGNvbmZpZ1xuICAgIGlmKHRoaXMub3B0aW9ucy5wbHVnaW5zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uKHBsdWdpbikge1xuICAgICAgICBpZihwbHVnaW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgIHBsdWdpblswXSh0aGlzLCBwbHVnaW5bMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBsdWdpbih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvLyBFdmVudCBmb3IgZGF0YSB0cmFuc2Zvcm1hdGlvbiB0aGF0IGFsbG93cyB0byBtYW5pcHVsYXRlIHRoZSBkYXRhIGJlZm9yZSBpdCBnZXRzIHJlbmRlcmVkIGluIHRoZSBjaGFydHNcbiAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdkYXRhJywge1xuICAgICAgdHlwZTogJ2luaXRpYWwnLFxuICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGZpcnN0IGNoYXJ0XG4gICAgdGhpcy5jcmVhdGVDaGFydCh0aGlzLm9wdGlvbnNQcm92aWRlci5nZXRDdXJyZW50T3B0aW9ucygpKTtcblxuICAgIC8vIEFzIGNoYXJ0IGlzIGluaXRpYWxpemVkIGZyb20gdGhlIGV2ZW50IGxvb3Agbm93IHdlIGNhbiByZXNldCBvdXIgdGltZW91dCByZWZlcmVuY2VcbiAgICAvLyBUaGlzIGlzIGltcG9ydGFudCBpZiB0aGUgY2hhcnQgZ2V0cyBpbml0aWFsaXplZCBvbiB0aGUgc2FtZSBlbGVtZW50IHR3aWNlXG4gICAgdGhpcy5pbml0aWFsaXplVGltZW91dElkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yIG9mIGNoYXJ0IGJhc2UgY2xhc3MuXG4gICAqXG4gICAqIEBwYXJhbSBxdWVyeVxuICAgKiBAcGFyYW0gZGF0YVxuICAgKiBAcGFyYW0gZGVmYXVsdE9wdGlvbnNcbiAgICogQHBhcmFtIG9wdGlvbnNcbiAgICogQHBhcmFtIHJlc3BvbnNpdmVPcHRpb25zXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gQmFzZShxdWVyeSwgZGF0YSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIHJlc3BvbnNpdmVPcHRpb25zKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBDaGFydGlzdC5xdWVyeVNlbGVjdG9yKHF1ZXJ5KTtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuZGVmYXVsdE9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMucmVzcG9uc2l2ZU9wdGlvbnMgPSByZXNwb25zaXZlT3B0aW9ucztcbiAgICB0aGlzLmV2ZW50RW1pdHRlciA9IENoYXJ0aXN0LkV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuc3VwcG9ydHNGb3JlaWduT2JqZWN0ID0gQ2hhcnRpc3QuU3ZnLmlzU3VwcG9ydGVkKCdFeHRlbnNpYmlsaXR5Jyk7XG4gICAgdGhpcy5zdXBwb3J0c0FuaW1hdGlvbnMgPSBDaGFydGlzdC5TdmcuaXNTdXBwb3J0ZWQoJ0FuaW1hdGlvbkV2ZW50c0F0dHJpYnV0ZScpO1xuICAgIHRoaXMucmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbiByZXNpemVMaXN0ZW5lcigpe1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICBpZih0aGlzLmNvbnRhaW5lcikge1xuICAgICAgLy8gSWYgY2hhcnRpc3Qgd2FzIGFscmVhZHkgaW5pdGlhbGl6ZWQgaW4gdGhpcyBjb250YWluZXIgd2UgYXJlIGRldGFjaGluZyBhbGwgZXZlbnQgbGlzdGVuZXJzIGZpcnN0XG4gICAgICBpZih0aGlzLmNvbnRhaW5lci5fX2NoYXJ0aXN0X18pIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIuX19jaGFydGlzdF9fLmRldGFjaCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNvbnRhaW5lci5fX2NoYXJ0aXN0X18gPSB0aGlzO1xuICAgIH1cblxuICAgIC8vIFVzaW5nIGV2ZW50IGxvb3AgZm9yIGZpcnN0IGRyYXcgdG8gbWFrZSBpdCBwb3NzaWJsZSB0byByZWdpc3RlciBldmVudCBsaXN0ZW5lcnMgaW4gdGhlIHNhbWUgY2FsbCBzdGFjayB3aGVyZVxuICAgIC8vIHRoZSBjaGFydCB3YXMgY3JlYXRlZC5cbiAgICB0aGlzLmluaXRpYWxpemVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGluaXRpYWxpemUuYmluZCh0aGlzKSwgMCk7XG4gIH1cblxuICAvLyBDcmVhdGluZyB0aGUgY2hhcnQgYmFzZSBjbGFzc1xuICBDaGFydGlzdC5CYXNlID0gQ2hhcnRpc3QuQ2xhc3MuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogQmFzZSxcbiAgICBvcHRpb25zUHJvdmlkZXI6IHVuZGVmaW5lZCxcbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICBzdmc6IHVuZGVmaW5lZCxcbiAgICBldmVudEVtaXR0ZXI6IHVuZGVmaW5lZCxcbiAgICBjcmVhdGVDaGFydDogZnVuY3Rpb24oKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jhc2UgY2hhcnQgdHlwZSBjYW5cXCd0IGJlIGluc3RhbnRpYXRlZCEnKTtcbiAgICB9LFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIGRldGFjaDogZGV0YWNoLFxuICAgIG9uOiBvbixcbiAgICBvZmY6IG9mZixcbiAgICB2ZXJzaW9uOiBDaGFydGlzdC52ZXJzaW9uLFxuICAgIHN1cHBvcnRzRm9yZWlnbk9iamVjdDogZmFsc2VcbiAgfSk7XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIENoYXJ0aXN0IFNWRyBtb2R1bGUgZm9yIHNpbXBsZSBTVkcgRE9NIGFic3RyYWN0aW9uXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5TdmdcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBzdmdOcyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsXG4gICAgeG1sTnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC94bWxucy8nLFxuICAgIHhodG1sTnMgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCc7XG5cbiAgQ2hhcnRpc3QueG1sTnMgPSB7XG4gICAgcXVhbGlmaWVkTmFtZTogJ3htbG5zOmN0JyxcbiAgICBwcmVmaXg6ICdjdCcsXG4gICAgdXJpOiAnaHR0cDovL2dpb25rdW56LmdpdGh1Yi5jb20vY2hhcnRpc3QtanMvY3QnXG4gIH07XG5cbiAgLyoqXG4gICAqIENoYXJ0aXN0LlN2ZyBjcmVhdGVzIGEgbmV3IFNWRyBvYmplY3Qgd3JhcHBlciB3aXRoIGEgc3RhcnRpbmcgZWxlbWVudC4gWW91IGNhbiB1c2UgdGhlIHdyYXBwZXIgdG8gZmx1ZW50bHkgY3JlYXRlIHN1Yi1lbGVtZW50cyBhbmQgbW9kaWZ5IHRoZW0uXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIFNWRyBlbGVtZW50IHRvIGNyZWF0ZSBvciBhbiBTVkcgZG9tIGVsZW1lbnQgd2hpY2ggc2hvdWxkIGJlIHdyYXBwZWQgaW50byBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXMgQW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgYWRkZWQgYXMgYXR0cmlidXRlcyB0byB0aGUgU1ZHIGVsZW1lbnQgdGhhdCBpcyBjcmVhdGVkLiBBdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlcyB3aWxsIG5vdCBiZSBhZGRlZC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBUaGlzIGNsYXNzIG9yIGNsYXNzIGxpc3Qgd2lsbCBiZSBhZGRlZCB0byB0aGUgU1ZHIGVsZW1lbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmVudCBUaGUgcGFyZW50IFNWRyB3cmFwcGVyIG9iamVjdCB3aGVyZSB0aGlzIG5ld2x5IGNyZWF0ZWQgd3JhcHBlciBhbmQgaXQncyBlbGVtZW50IHdpbGwgYmUgYXR0YWNoZWQgdG8gYXMgY2hpbGRcbiAgICogQHBhcmFtIHtCb29sZWFufSBpbnNlcnRGaXJzdCBJZiB0aGlzIHBhcmFtIGlzIHNldCB0byB0cnVlIGluIGNvbmp1bmN0aW9uIHdpdGggYSBwYXJlbnQgZWxlbWVudCB0aGUgbmV3bHkgY3JlYXRlZCBlbGVtZW50IHdpbGwgYmUgYWRkZWQgYXMgZmlyc3QgY2hpbGQgZWxlbWVudCBpbiB0aGUgcGFyZW50IGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIFN2ZyhuYW1lLCBhdHRyaWJ1dGVzLCBjbGFzc05hbWUsIHBhcmVudCwgaW5zZXJ0Rmlyc3QpIHtcbiAgICAvLyBJZiBTdmcgaXMgZ2V0dGluZyBjYWxsZWQgd2l0aCBhbiBTVkcgZWxlbWVudCB3ZSBqdXN0IHJldHVybiB0aGUgd3JhcHBlclxuICAgIGlmKG5hbWUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICB0aGlzLl9ub2RlID0gbmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhzdmdOcywgbmFtZSk7XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgYW4gU1ZHIGVsZW1lbnQgY3JlYXRlZCB0aGVuIGN1c3RvbSBuYW1lc3BhY2VcbiAgICAgIGlmKG5hbWUgPT09ICdzdmcnKSB7XG4gICAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlTlMoeG1sTnMsIENoYXJ0aXN0LnhtbE5zLnF1YWxpZmllZE5hbWUsIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoYXR0cmlidXRlcykge1xuICAgICAgdGhpcy5hdHRyKGF0dHJpYnV0ZXMpO1xuICAgIH1cblxuICAgIGlmKGNsYXNzTmFtZSkge1xuICAgICAgdGhpcy5hZGRDbGFzcyhjbGFzc05hbWUpO1xuICAgIH1cblxuICAgIGlmKHBhcmVudCkge1xuICAgICAgaWYgKGluc2VydEZpcnN0ICYmIHBhcmVudC5fbm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIHBhcmVudC5fbm9kZS5pbnNlcnRCZWZvcmUodGhpcy5fbm9kZSwgcGFyZW50Ll9ub2RlLmZpcnN0Q2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyZW50Ll9ub2RlLmFwcGVuZENoaWxkKHRoaXMuX25vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYXR0cmlidXRlcyBvbiB0aGUgY3VycmVudCBTVkcgZWxlbWVudCBvZiB0aGUgd3JhcHBlciB5b3UncmUgY3VycmVudGx5IHdvcmtpbmcgb24uXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBhdHRyaWJ1dGVzIEFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgdGhhdCB3aWxsIGJlIGFkZGVkIGFzIGF0dHJpYnV0ZXMgdG8gdGhlIFNWRyBlbGVtZW50IHRoYXQgaXMgY3JlYXRlZC4gQXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZXMgd2lsbCBub3QgYmUgYWRkZWQuIElmIHRoaXMgcGFyYW1ldGVyIGlzIGEgU3RyaW5nIHRoZW4gdGhlIGZ1bmN0aW9uIGlzIHVzZWQgYXMgYSBnZXR0ZXIgYW5kIHdpbGwgcmV0dXJuIHRoZSBhdHRyaWJ1dGUgdmFsdWUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBucyBJZiBzcGVjaWZpZWQsIHRoZSBhdHRyaWJ1dGVzIHdpbGwgYmUgc2V0IGFzIG5hbWVzcGFjZSBhdHRyaWJ1dGVzIHdpdGggbnMgYXMgcHJlZml4LlxuICAgKiBAcmV0dXJuIHtPYmplY3R8U3RyaW5nfSBUaGUgY3VycmVudCB3cmFwcGVyIG9iamVjdCB3aWxsIGJlIHJldHVybmVkIHNvIGl0IGNhbiBiZSB1c2VkIGZvciBjaGFpbmluZyBvciB0aGUgYXR0cmlidXRlIHZhbHVlIGlmIHVzZWQgYXMgZ2V0dGVyIGZ1bmN0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gYXR0cihhdHRyaWJ1dGVzLCBucykge1xuICAgIGlmKHR5cGVvZiBhdHRyaWJ1dGVzID09PSAnc3RyaW5nJykge1xuICAgICAgaWYobnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vZGUuZ2V0QXR0cmlidXRlTlMobnMsIGF0dHJpYnV0ZXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vZGUuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAvLyBJZiB0aGUgYXR0cmlidXRlIHZhbHVlIGlzIHVuZGVmaW5lZCB3ZSBjYW4gc2tpcCB0aGlzIG9uZVxuICAgICAgaWYoYXR0cmlidXRlc1trZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZihucykge1xuICAgICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZU5TKG5zLCBbQ2hhcnRpc3QueG1sTnMucHJlZml4LCAnOicsIGtleV0uam9pbignJyksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBTVkcgZWxlbWVudCB3aG9zZSB3cmFwcGVyIG9iamVjdCB3aWxsIGJlIHNlbGVjdGVkIGZvciBmdXJ0aGVyIG9wZXJhdGlvbnMuIFRoaXMgd2F5IHlvdSBjYW4gYWxzbyBjcmVhdGUgbmVzdGVkIGdyb3VwcyBlYXNpbHkuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIFNWRyBlbGVtZW50IHRoYXQgc2hvdWxkIGJlIGNyZWF0ZWQgYXMgY2hpbGQgZWxlbWVudCBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGVsZW1lbnQgd3JhcHBlclxuICAgKiBAcGFyYW0ge09iamVjdH0gW2F0dHJpYnV0ZXNdIEFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgdGhhdCB3aWxsIGJlIGFkZGVkIGFzIGF0dHJpYnV0ZXMgdG8gdGhlIFNWRyBlbGVtZW50IHRoYXQgaXMgY3JlYXRlZC4gQXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZXMgd2lsbCBub3QgYmUgYWRkZWQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbY2xhc3NOYW1lXSBUaGlzIGNsYXNzIG9yIGNsYXNzIGxpc3Qgd2lsbCBiZSBhZGRlZCB0byB0aGUgU1ZHIGVsZW1lbnRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbaW5zZXJ0Rmlyc3RdIElmIHRoaXMgcGFyYW0gaXMgc2V0IHRvIHRydWUgaW4gY29uanVuY3Rpb24gd2l0aCBhIHBhcmVudCBlbGVtZW50IHRoZSBuZXdseSBjcmVhdGVkIGVsZW1lbnQgd2lsbCBiZSBhZGRlZCBhcyBmaXJzdCBjaGlsZCBlbGVtZW50IGluIHRoZSBwYXJlbnQgZWxlbWVudFxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFJldHVybnMgYSBDaGFydGlzdC5Tdmcgd3JhcHBlciBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBtb2RpZnkgdGhlIGNvbnRhaW5pbmcgU1ZHIGRhdGFcbiAgICovXG4gIGZ1bmN0aW9uIGVsZW0obmFtZSwgYXR0cmlidXRlcywgY2xhc3NOYW1lLCBpbnNlcnRGaXJzdCkge1xuICAgIHJldHVybiBuZXcgQ2hhcnRpc3QuU3ZnKG5hbWUsIGF0dHJpYnV0ZXMsIGNsYXNzTmFtZSwgdGhpcywgaW5zZXJ0Rmlyc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBhcmVudCBDaGFydGlzdC5TVkcgd3JhcHBlciBvYmplY3RcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFJldHVybnMgYSBDaGFydGlzdC5Tdmcgd3JhcHBlciBhcm91bmQgdGhlIHBhcmVudCBub2RlIG9mIHRoZSBjdXJyZW50IG5vZGUuIElmIHRoZSBwYXJlbnQgbm9kZSBpcyBub3QgZXhpc3Rpbmcgb3IgaXQncyBub3QgYW4gU1ZHIG5vZGUgdGhlbiB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIG51bGwuXG4gICAqL1xuICBmdW5jdGlvbiBwYXJlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vZGUucGFyZW50Tm9kZSBpbnN0YW5jZW9mIFNWR0VsZW1lbnQgPyBuZXcgQ2hhcnRpc3QuU3ZnKHRoaXMuX25vZGUucGFyZW50Tm9kZSkgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYSBDaGFydGlzdC5Tdmcgd3JhcHBlciBhcm91bmQgdGhlIHJvb3QgU1ZHIGVsZW1lbnQgb2YgdGhlIGN1cnJlbnQgdHJlZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSByb290IFNWRyBlbGVtZW50IHdyYXBwZWQgaW4gYSBDaGFydGlzdC5TdmcgZWxlbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gcm9vdCgpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGU7XG4gICAgd2hpbGUobm9kZS5ub2RlTmFtZSAhPT0gJ3N2ZycpIHtcbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQ2hhcnRpc3QuU3ZnKG5vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGhlIGZpcnN0IGNoaWxkIFNWRyBlbGVtZW50IG9mIHRoZSBjdXJyZW50IGVsZW1lbnQgdGhhdCBtYXRjaGVzIGEgQ1NTIHNlbGVjdG9yLiBUaGUgcmV0dXJuZWQgb2JqZWN0IGlzIGEgQ2hhcnRpc3QuU3ZnIHdyYXBwZXIuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIEEgQ1NTIHNlbGVjdG9yIHRoYXQgaXMgdXNlZCB0byBxdWVyeSBmb3IgY2hpbGQgU1ZHIGVsZW1lbnRzXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIFNWRyB3cmFwcGVyIGZvciB0aGUgZWxlbWVudCBmb3VuZCBvciBudWxsIGlmIG5vIGVsZW1lbnQgd2FzIGZvdW5kXG4gICAqL1xuICBmdW5jdGlvbiBxdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSB7XG4gICAgdmFyIGZvdW5kTm9kZSA9IHRoaXMuX25vZGUucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgcmV0dXJuIGZvdW5kTm9kZSA/IG5ldyBDaGFydGlzdC5TdmcoZm91bmROb2RlKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgYWxsIGNoaWxkIFNWRyBlbGVtZW50cyBvZiB0aGUgY3VycmVudCBlbGVtZW50IHRoYXQgbWF0Y2ggYSBDU1Mgc2VsZWN0b3IuIFRoZSByZXR1cm5lZCBvYmplY3QgaXMgYSBDaGFydGlzdC5TdmcuTGlzdCB3cmFwcGVyLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBBIENTUyBzZWxlY3RvciB0aGF0IGlzIHVzZWQgdG8gcXVlcnkgZm9yIGNoaWxkIFNWRyBlbGVtZW50c1xuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuTGlzdH0gVGhlIFNWRyB3cmFwcGVyIGxpc3QgZm9yIHRoZSBlbGVtZW50IGZvdW5kIG9yIG51bGwgaWYgbm8gZWxlbWVudCB3YXMgZm91bmRcbiAgICovXG4gIGZ1bmN0aW9uIHF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIHtcbiAgICB2YXIgZm91bmROb2RlcyA9IHRoaXMuX25vZGUucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgcmV0dXJuIGZvdW5kTm9kZXMubGVuZ3RoID8gbmV3IENoYXJ0aXN0LlN2Zy5MaXN0KGZvdW5kTm9kZXMpIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgZm9yZWlnbk9iamVjdCAoc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1NWRy9FbGVtZW50L2ZvcmVpZ25PYmplY3QpIHRoYXQgYWxsb3dzIHRvIGVtYmVkIEhUTUwgY29udGVudCBpbnRvIGEgU1ZHIGdyYXBoaWMuIFdpdGggdGhlIGhlbHAgb2YgZm9yZWlnbk9iamVjdHMgeW91IGNhbiBlbmFibGUgdGhlIHVzYWdlIG9mIHJlZ3VsYXIgSFRNTCBlbGVtZW50cyBpbnNpZGUgb2YgU1ZHIHdoZXJlIHRoZXkgYXJlIHN1YmplY3QgZm9yIFNWRyBwb3NpdGlvbmluZyBhbmQgdHJhbnNmb3JtYXRpb24gYnV0IHRoZSBCcm93c2VyIHdpbGwgdXNlIHRoZSBIVE1MIHJlbmRlcmluZyBjYXBhYmlsaXRpZXMgZm9yIHRoZSBjb250YWluaW5nIERPTS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge05vZGV8U3RyaW5nfSBjb250ZW50IFRoZSBET00gTm9kZSwgb3IgSFRNTCBzdHJpbmcgdGhhdCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIERPTSBOb2RlLCB0aGF0IGlzIHRoZW4gcGxhY2VkIGludG8gYW5kIHdyYXBwZWQgYnkgdGhlIGZvcmVpZ25PYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IFthdHRyaWJ1dGVzXSBBbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIHRoYXQgd2lsbCBiZSBhZGRlZCBhcyBhdHRyaWJ1dGVzIHRvIHRoZSBmb3JlaWduT2JqZWN0IGVsZW1lbnQgdGhhdCBpcyBjcmVhdGVkLiBBdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlcyB3aWxsIG5vdCBiZSBhZGRlZC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IFtjbGFzc05hbWVdIFRoaXMgY2xhc3Mgb3IgY2xhc3MgbGlzdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBTVkcgZWxlbWVudFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtpbnNlcnRGaXJzdF0gU3BlY2lmaWVzIGlmIHRoZSBmb3JlaWduT2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBhcyBmaXJzdCBjaGlsZFxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IE5ldyB3cmFwcGVyIG9iamVjdCB0aGF0IHdyYXBzIHRoZSBmb3JlaWduT2JqZWN0IGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIGZvcmVpZ25PYmplY3QoY29udGVudCwgYXR0cmlidXRlcywgY2xhc3NOYW1lLCBpbnNlcnRGaXJzdCkge1xuICAgIC8vIElmIGNvbnRlbnQgaXMgc3RyaW5nIHRoZW4gd2UgY29udmVydCBpdCB0byBET01cbiAgICAvLyBUT0RPOiBIYW5kbGUgY2FzZSB3aGVyZSBjb250ZW50IGlzIG5vdCBhIHN0cmluZyBub3IgYSBET00gTm9kZVxuICAgIGlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgICBjb250ZW50ID0gY29udGFpbmVyLmZpcnN0Q2hpbGQ7XG4gICAgfVxuXG4gICAgLy8gQWRkaW5nIG5hbWVzcGFjZSB0byBjb250ZW50IGVsZW1lbnRcbiAgICBjb250ZW50LnNldEF0dHJpYnV0ZSgneG1sbnMnLCB4aHRtbE5zKTtcblxuICAgIC8vIENyZWF0aW5nIHRoZSBmb3JlaWduT2JqZWN0IHdpdGhvdXQgcmVxdWlyZWQgZXh0ZW5zaW9uIGF0dHJpYnV0ZSAoYXMgZGVzY3JpYmVkIGhlcmVcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvZXh0ZW5kLmh0bWwjRm9yZWlnbk9iamVjdEVsZW1lbnQpXG4gICAgdmFyIGZuT2JqID0gdGhpcy5lbGVtKCdmb3JlaWduT2JqZWN0JywgYXR0cmlidXRlcywgY2xhc3NOYW1lLCBpbnNlcnRGaXJzdCk7XG5cbiAgICAvLyBBZGQgY29udGVudCB0byBmb3JlaWduT2JqZWN0RWxlbWVudFxuICAgIGZuT2JqLl9ub2RlLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXG4gICAgcmV0dXJuIGZuT2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGFkZHMgYSBuZXcgdGV4dCBlbGVtZW50IHRvIHRoZSBjdXJyZW50IENoYXJ0aXN0LlN2ZyB3cmFwcGVyLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0IFRoZSB0ZXh0IHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSB0ZXh0IGVsZW1lbnQgdGhhdCBpcyBjcmVhdGVkXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHNhbWUgd3JhcHBlciBvYmplY3QgdGhhdCB3YXMgdXNlZCB0byBhZGQgdGhlIG5ld2x5IGNyZWF0ZWQgZWxlbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gdGV4dCh0KSB7XG4gICAgdGhpcy5fbm9kZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0KSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2Qgd2lsbCBjbGVhciBhbGwgY2hpbGQgbm9kZXMgb2YgdGhlIGN1cnJlbnQgd3JhcHBlciBvYmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgc2FtZSB3cmFwcGVyIG9iamVjdCB0aGF0IGdvdCBlbXB0aWVkXG4gICAqL1xuICBmdW5jdGlvbiBlbXB0eSgpIHtcbiAgICB3aGlsZSAodGhpcy5fbm9kZS5maXJzdENoaWxkKSB7XG4gICAgICB0aGlzLl9ub2RlLnJlbW92ZUNoaWxkKHRoaXMuX25vZGUuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2Qgd2lsbCBjYXVzZSB0aGUgY3VycmVudCB3cmFwcGVyIHRvIHJlbW92ZSBpdHNlbGYgZnJvbSBpdHMgcGFyZW50IHdyYXBwZXIuIFVzZSB0aGlzIG1ldGhvZCBpZiB5b3UnZCBsaWtlIHRvIGdldCByaWQgb2YgYW4gZWxlbWVudCBpbiBhIGdpdmVuIERPTSBzdHJ1Y3R1cmUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgcGFyZW50IHdyYXBwZXIgb2JqZWN0IG9mIHRoZSBlbGVtZW50IHRoYXQgZ290IHJlbW92ZWRcbiAgICovXG4gIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICB0aGlzLl9ub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fbm9kZSk7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50KCk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2Qgd2lsbCByZXBsYWNlIHRoZSBlbGVtZW50IHdpdGggYSBuZXcgZWxlbWVudCB0aGF0IGNhbiBiZSBjcmVhdGVkIG91dHNpZGUgb2YgdGhlIGN1cnJlbnQgRE9NLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7Q2hhcnRpc3QuU3ZnfSBuZXdFbGVtZW50IFRoZSBuZXcgQ2hhcnRpc3QuU3ZnIG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBsYWNlIHRoZSBjdXJyZW50IHdyYXBwZXIgb2JqZWN0XG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHdyYXBwZXIgb2YgdGhlIG5ldyBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiByZXBsYWNlKG5ld0VsZW1lbnQpIHtcbiAgICB0aGlzLl9ub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld0VsZW1lbnQuX25vZGUsIHRoaXMuX25vZGUpO1xuICAgIHJldHVybiBuZXdFbGVtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgYXBwZW5kIGFuIGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgZWxlbWVudCBhcyBhIGNoaWxkLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7Q2hhcnRpc3QuU3ZnfSBlbGVtZW50IFRoZSBDaGFydGlzdC5TdmcgZWxlbWVudCB0aGF0IHNob3VsZCBiZSBhZGRlZCBhcyBhIGNoaWxkXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2luc2VydEZpcnN0XSBTcGVjaWZpZXMgaWYgdGhlIGVsZW1lbnQgc2hvdWxkIGJlIGluc2VydGVkIGFzIGZpcnN0IGNoaWxkXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHdyYXBwZXIgb2YgdGhlIGFwcGVuZGVkIG9iamVjdFxuICAgKi9cbiAgZnVuY3Rpb24gYXBwZW5kKGVsZW1lbnQsIGluc2VydEZpcnN0KSB7XG4gICAgaWYoaW5zZXJ0Rmlyc3QgJiYgdGhpcy5fbm9kZS5maXJzdENoaWxkKSB7XG4gICAgICB0aGlzLl9ub2RlLmluc2VydEJlZm9yZShlbGVtZW50Ll9ub2RlLCB0aGlzLl9ub2RlLmZpcnN0Q2hpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ub2RlLmFwcGVuZENoaWxkKGVsZW1lbnQuX25vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgY2xhc3MgbmFtZXMgdGhhdCBhcmUgYXR0YWNoZWQgdG8gdGhlIGN1cnJlbnQgd3JhcHBlciBlbGVtZW50LiBUaGlzIG1ldGhvZCBjYW4gbm90IGJlIGNoYWluZWQgZnVydGhlci5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcmV0dXJuIHtBcnJheX0gQSBsaXN0IG9mIGNsYXNzZXMgb3IgYW4gZW1wdHkgYXJyYXkgaWYgdGhlcmUgYXJlIG5vIGNsYXNzZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gY2xhc3NlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgPyB0aGlzLl9ub2RlLmdldEF0dHJpYnV0ZSgnY2xhc3MnKS50cmltKCkuc3BsaXQoL1xccysvKSA6IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgb25lIG9yIGEgc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2YgY2xhc3NlcyB0byB0aGUgY3VycmVudCBlbGVtZW50IGFuZCBlbnN1cmVzIHRoZSBjbGFzc2VzIGFyZSBvbmx5IGV4aXN0aW5nIG9uY2UuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzIEEgd2hpdGUgc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2YgY2xhc3MgbmFtZXNcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgd3JhcHBlciBvZiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiBhZGRDbGFzcyhuYW1lcykge1xuICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKCdjbGFzcycsXG4gICAgICB0aGlzLmNsYXNzZXModGhpcy5fbm9kZSlcbiAgICAgICAgLmNvbmNhdChuYW1lcy50cmltKCkuc3BsaXQoL1xccysvKSlcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbihlbGVtLCBwb3MsIHNlbGYpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5pbmRleE9mKGVsZW0pID09PSBwb3M7XG4gICAgICAgIH0pLmpvaW4oJyAnKVxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIG9uZSBvciBhIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzZXMgZnJvbSB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lcyBBIHdoaXRlIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzIG5hbWVzXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHdyYXBwZXIgb2YgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MobmFtZXMpIHtcbiAgICB2YXIgcmVtb3ZlZENsYXNzZXMgPSBuYW1lcy50cmltKCkuc3BsaXQoL1xccysvKTtcblxuICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKCdjbGFzcycsIHRoaXMuY2xhc3Nlcyh0aGlzLl9ub2RlKS5maWx0ZXIoZnVuY3Rpb24obmFtZSkge1xuICAgICAgcmV0dXJuIHJlbW92ZWRDbGFzc2VzLmluZGV4T2YobmFtZSkgPT09IC0xO1xuICAgIH0pLmpvaW4oJyAnKSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBjbGFzc2VzIGZyb20gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSB3cmFwcGVyIG9mIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIHJlbW92ZUFsbENsYXNzZXMoKSB7XG4gICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJycpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogXCJTYXZlXCIgd2F5IHRvIGdldCBwcm9wZXJ0eSB2YWx1ZSBmcm9tIHN2ZyBCb3VuZGluZ0JveC5cbiAgICogVGhpcyBpcyBhIHdvcmthcm91bmQuIEZpcmVmb3ggdGhyb3dzIGFuIE5TX0VSUk9SX0ZBSUxVUkUgZXJyb3IgaWYgZ2V0QkJveCgpIGlzIGNhbGxlZCBvbiBhbiBpbnZpc2libGUgbm9kZS5cbiAgICogU2VlIFtOU19FUlJPUl9GQUlMVVJFOiBDb21wb25lbnQgcmV0dXJuZWQgZmFpbHVyZSBjb2RlOiAweDgwMDA0MDA1XShodHRwOi8vanNmaWRkbGUubmV0L3N5bTN0cmkva1dXREsvKVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gbm9kZSBUaGUgc3ZnIG5vZGUgdG9cbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3AgVGhlIHByb3BlcnR5IHRvIGZldGNoIChleC46IGhlaWdodCwgd2lkdGgsIC4uLilcbiAgICogQHJldHVybnMge051bWJlcn0gVGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBiYm94IHByb3BlcnR5XG4gICAqL1xuICBmdW5jdGlvbiBnZXRCQm94UHJvcGVydHkobm9kZSwgcHJvcCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbm9kZS5nZXRCQm94KClbcHJvcF07XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGVsZW1lbnQgaGVpZ2h0IHdpdGggZmFsbGJhY2sgdG8gc3ZnIEJvdW5kaW5nQm94IG9yIHBhcmVudCBjb250YWluZXIgZGltZW5zaW9uczpcbiAgICogU2VlIFtidWd6aWxsYS5tb3ppbGxhLm9yZ10oaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NTMwOTg1KVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEByZXR1cm4ge051bWJlcn0gVGhlIGVsZW1lbnRzIGhlaWdodCBpbiBwaXhlbHNcbiAgICovXG4gIGZ1bmN0aW9uIGhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZS5jbGllbnRIZWlnaHQgfHwgTWF0aC5yb3VuZChnZXRCQm94UHJvcGVydHkodGhpcy5fbm9kZSwgJ2hlaWdodCcpKSB8fCB0aGlzLl9ub2RlLnBhcmVudE5vZGUuY2xpZW50SGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBlbGVtZW50IHdpZHRoIHdpdGggZmFsbGJhY2sgdG8gc3ZnIEJvdW5kaW5nQm94IG9yIHBhcmVudCBjb250YWluZXIgZGltZW5zaW9uczpcbiAgICogU2VlIFtidWd6aWxsYS5tb3ppbGxhLm9yZ10oaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NTMwOTg1KVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBlbGVtZW50cyB3aWR0aCBpbiBwaXhlbHNcbiAgICovXG4gIGZ1bmN0aW9uIHdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLl9ub2RlLmNsaWVudFdpZHRoIHx8IE1hdGgucm91bmQoZ2V0QkJveFByb3BlcnR5KHRoaXMuX25vZGUsICd3aWR0aCcpKSB8fCB0aGlzLl9ub2RlLnBhcmVudE5vZGUuY2xpZW50V2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGFuaW1hdGUgZnVuY3Rpb24gbGV0cyB5b3UgYW5pbWF0ZSB0aGUgY3VycmVudCBlbGVtZW50IHdpdGggU01JTCBhbmltYXRpb25zLiBZb3UgY2FuIGFkZCBhbmltYXRpb25zIGZvciBtdWx0aXBsZSBhdHRyaWJ1dGVzIGF0IHRoZSBzYW1lIHRpbWUgYnkgdXNpbmcgYW4gYW5pbWF0aW9uIGRlZmluaXRpb24gb2JqZWN0LiBUaGlzIG9iamVjdCBzaG91bGQgY29udGFpbiBTTUlMIGFuaW1hdGlvbiBhdHRyaWJ1dGVzLiBQbGVhc2UgcmVmZXIgdG8gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL2FuaW1hdGUuaHRtbCBmb3IgYSBkZXRhaWxlZCBzcGVjaWZpY2F0aW9uIGFib3V0IHRoZSBhdmFpbGFibGUgYW5pbWF0aW9uIGF0dHJpYnV0ZXMuIEFkZGl0aW9uYWxseSBhbiBlYXNpbmcgcHJvcGVydHkgY2FuIGJlIHBhc3NlZCBpbiB0aGUgYW5pbWF0aW9uIGRlZmluaXRpb24gb2JqZWN0LiBUaGlzIGNhbiBiZSBhIHN0cmluZyB3aXRoIGEgbmFtZSBvZiBhbiBlYXNpbmcgZnVuY3Rpb24gaW4gYENoYXJ0aXN0LlN2Zy5FYXNpbmdgIG9yIGFuIGFycmF5IHdpdGggZm91ciBudW1iZXJzIHNwZWNpZnlpbmcgYSBjdWJpYyBCw6l6aWVyIGN1cnZlLlxuICAgKiAqKkFuIGFuaW1hdGlvbnMgb2JqZWN0IGNvdWxkIGxvb2sgbGlrZSB0aGlzOioqXG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogZWxlbWVudC5hbmltYXRlKHtcbiAgICogICBvcGFjaXR5OiB7XG4gICAqICAgICBkdXI6IDEwMDAsXG4gICAqICAgICBmcm9tOiAwLFxuICAgKiAgICAgdG86IDFcbiAgICogICB9LFxuICAgKiAgIHgxOiB7XG4gICAqICAgICBkdXI6ICcxMDAwbXMnLFxuICAgKiAgICAgZnJvbTogMTAwLFxuICAgKiAgICAgdG86IDIwMCxcbiAgICogICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFydCdcbiAgICogICB9LFxuICAgKiAgIHkxOiB7XG4gICAqICAgICBkdXI6ICcycycsXG4gICAqICAgICBmcm9tOiAwLFxuICAgKiAgICAgdG86IDEwMFxuICAgKiAgIH1cbiAgICogfSk7XG4gICAqIGBgYFxuICAgKiAqKkF1dG9tYXRpYyB1bml0IGNvbnZlcnNpb24qKlxuICAgKiBGb3IgdGhlIGBkdXJgIGFuZCB0aGUgYGJlZ2luYCBhbmltYXRlIGF0dHJpYnV0ZSB5b3UgY2FuIGFsc28gb21pdCBhIHVuaXQgYnkgcGFzc2luZyBhIG51bWJlci4gVGhlIG51bWJlciB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgY29udmVydGVkIHRvIG1pbGxpIHNlY29uZHMuXG4gICAqICoqR3VpZGVkIG1vZGUqKlxuICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBvZiBTTUlMIGFuaW1hdGlvbnMgd2l0aCBvZmZzZXQgdXNpbmcgdGhlIGBiZWdpbmAgYXR0cmlidXRlIGlzIHRoYXQgdGhlIGF0dHJpYnV0ZSB3aWxsIGtlZXAgaXQncyBvcmlnaW5hbCB2YWx1ZSB1bnRpbCB0aGUgYW5pbWF0aW9uIHN0YXJ0cy4gTW9zdGx5IHRoaXMgYmVoYXZpb3IgaXMgbm90IGRlc2lyZWQgYXMgeW91J2QgbGlrZSB0byBoYXZlIHlvdXIgZWxlbWVudCBhdHRyaWJ1dGVzIGFscmVhZHkgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgYW5pbWF0aW9uIGBmcm9tYCB2YWx1ZSBldmVuIGJlZm9yZSB0aGUgYW5pbWF0aW9uIHN0YXJ0cy4gQWxzbyBpZiB5b3UgZG9uJ3Qgc3BlY2lmeSBgZmlsbD1cImZyZWV6ZVwiYCBvbiBhbiBhbmltYXRlIGVsZW1lbnQgb3IgaWYgeW91IGRlbGV0ZSB0aGUgYW5pbWF0aW9uIGFmdGVyIGl0J3MgZG9uZSAod2hpY2ggaXMgZG9uZSBpbiBndWlkZWQgbW9kZSkgdGhlIGF0dHJpYnV0ZSB3aWxsIHN3aXRjaCBiYWNrIHRvIHRoZSBpbml0aWFsIHZhbHVlLiBUaGlzIGJlaGF2aW9yIGlzIGFsc28gbm90IGRlc2lyZWQgd2hlbiBwZXJmb3JtaW5nIHNpbXBsZSBvbmUtdGltZSBhbmltYXRpb25zLiBGb3Igb25lLXRpbWUgYW5pbWF0aW9ucyB5b3UnZCB3YW50IHRvIHRyaWdnZXIgYW5pbWF0aW9ucyBpbW1lZGlhdGVseSBpbnN0ZWFkIG9mIHJlbGF0aXZlIHRvIHRoZSBkb2N1bWVudCBiZWdpbiB0aW1lLiBUaGF0J3Mgd2h5IGluIGd1aWRlZCBtb2RlIENoYXJ0aXN0LlN2ZyB3aWxsIGFsc28gdXNlIHRoZSBgYmVnaW5gIHByb3BlcnR5IHRvIHNjaGVkdWxlIGEgdGltZW91dCBhbmQgbWFudWFsbHkgc3RhcnQgdGhlIGFuaW1hdGlvbiBhZnRlciB0aGUgdGltZW91dC4gSWYgeW91J3JlIHVzaW5nIG11bHRpcGxlIFNNSUwgZGVmaW5pdGlvbiBvYmplY3RzIGZvciBhbiBhdHRyaWJ1dGUgKGluIGFuIGFycmF5KSwgZ3VpZGVkIG1vZGUgd2lsbCBiZSBkaXNhYmxlZCBmb3IgdGhpcyBhdHRyaWJ1dGUsIGV2ZW4gaWYgeW91IGV4cGxpY2l0bHkgZW5hYmxlZCBpdC5cbiAgICogSWYgZ3VpZGVkIG1vZGUgaXMgZW5hYmxlZCB0aGUgZm9sbG93aW5nIGJlaGF2aW9yIGlzIGFkZGVkOlxuICAgKiAtIEJlZm9yZSB0aGUgYW5pbWF0aW9uIHN0YXJ0cyAoZXZlbiB3aGVuIGRlbGF5ZWQgd2l0aCBgYmVnaW5gKSB0aGUgYW5pbWF0ZWQgYXR0cmlidXRlIHdpbGwgYmUgc2V0IGFscmVhZHkgdG8gdGhlIGBmcm9tYCB2YWx1ZSBvZiB0aGUgYW5pbWF0aW9uXG4gICAqIC0gYGJlZ2luYCBpcyBleHBsaWNpdGx5IHNldCB0byBgaW5kZWZpbml0ZWAgc28gaXQgY2FuIGJlIHN0YXJ0ZWQgbWFudWFsbHkgd2l0aG91dCByZWx5aW5nIG9uIGRvY3VtZW50IGJlZ2luIHRpbWUgKGNyZWF0aW9uKVxuICAgKiAtIFRoZSBhbmltYXRlIGVsZW1lbnQgd2lsbCBiZSBmb3JjZWQgdG8gdXNlIGBmaWxsPVwiZnJlZXplXCJgXG4gICAqIC0gVGhlIGFuaW1hdGlvbiB3aWxsIGJlIHRyaWdnZXJlZCB3aXRoIGBiZWdpbkVsZW1lbnQoKWAgaW4gYSB0aW1lb3V0IHdoZXJlIGBiZWdpbmAgb2YgdGhlIGRlZmluaXRpb24gb2JqZWN0IGlzIGludGVycHJldGVkIGluIG1pbGxpIHNlY29uZHMuIElmIG5vIGBiZWdpbmAgd2FzIHNwZWNpZmllZCB0aGUgdGltZW91dCBpcyB0cmlnZ2VyZWQgaW1tZWRpYXRlbHkuXG4gICAqIC0gQWZ0ZXIgdGhlIGFuaW1hdGlvbiB0aGUgZWxlbWVudCBhdHRyaWJ1dGUgdmFsdWUgd2lsbCBiZSBzZXQgdG8gdGhlIGB0b2AgdmFsdWUgb2YgdGhlIGFuaW1hdGlvblxuICAgKiAtIFRoZSBhbmltYXRlIGVsZW1lbnQgaXMgZGVsZXRlZCBmcm9tIHRoZSBET01cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge09iamVjdH0gYW5pbWF0aW9ucyBBbiBhbmltYXRpb25zIG9iamVjdCB3aGVyZSB0aGUgcHJvcGVydHkga2V5cyBhcmUgdGhlIGF0dHJpYnV0ZXMgeW91J2QgbGlrZSB0byBhbmltYXRlLiBUaGUgcHJvcGVydGllcyBzaG91bGQgYmUgb2JqZWN0cyBhZ2FpbiB0aGF0IGNvbnRhaW4gdGhlIFNNSUwgYW5pbWF0aW9uIGF0dHJpYnV0ZXMgKHVzdWFsbHkgYmVnaW4sIGR1ciwgZnJvbSwgYW5kIHRvKS4gVGhlIHByb3BlcnR5IGJlZ2luIGFuZCBkdXIgaXMgYXV0byBjb252ZXJ0ZWQgKHNlZSBBdXRvbWF0aWMgdW5pdCBjb252ZXJzaW9uKS4gWW91IGNhbiBhbHNvIHNjaGVkdWxlIG11bHRpcGxlIGFuaW1hdGlvbnMgZm9yIHRoZSBzYW1lIGF0dHJpYnV0ZSBieSBwYXNzaW5nIGFuIEFycmF5IG9mIFNNSUwgZGVmaW5pdGlvbiBvYmplY3RzLiBBdHRyaWJ1dGVzIHRoYXQgY29udGFpbiBhbiBhcnJheSBvZiBTTUlMIGRlZmluaXRpb24gb2JqZWN0cyB3aWxsIG5vdCBiZSBleGVjdXRlZCBpbiBndWlkZWQgbW9kZS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBndWlkZWQgU3BlY2lmeSBpZiBndWlkZWQgbW9kZSBzaG91bGQgYmUgYWN0aXZhdGVkIGZvciB0aGlzIGFuaW1hdGlvbiAoc2VlIEd1aWRlZCBtb2RlKS4gSWYgbm90IG90aGVyd2lzZSBzcGVjaWZpZWQsIGd1aWRlZCBtb2RlIHdpbGwgYmUgYWN0aXZhdGVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRFbWl0dGVyIElmIHNwZWNpZmllZCwgdGhpcyBldmVudCBlbWl0dGVyIHdpbGwgYmUgbm90aWZpZWQgd2hlbiBhbiBhbmltYXRpb24gc3RhcnRzIG9yIGVuZHMuXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIGN1cnJlbnQgZWxlbWVudCB3aGVyZSB0aGUgYW5pbWF0aW9uIHdhcyBhZGRlZFxuICAgKi9cbiAgZnVuY3Rpb24gYW5pbWF0ZShhbmltYXRpb25zLCBndWlkZWQsIGV2ZW50RW1pdHRlcikge1xuICAgIGlmKGd1aWRlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBndWlkZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKGFuaW1hdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gY3JlYXRlQW5pbWF0ZUZvckF0dHJpYnV0ZXMoYXR0cmlidXRlKSB7XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZUFuaW1hdGUoYW5pbWF0aW9uRGVmaW5pdGlvbiwgZ3VpZGVkKSB7XG4gICAgICAgIHZhciBhdHRyaWJ1dGVQcm9wZXJ0aWVzID0ge30sXG4gICAgICAgICAgYW5pbWF0ZSxcbiAgICAgICAgICB0aW1lb3V0LFxuICAgICAgICAgIGVhc2luZztcblxuICAgICAgICAvLyBDaGVjayBpZiBhbiBlYXNpbmcgaXMgc3BlY2lmaWVkIGluIHRoZSBkZWZpbml0aW9uIG9iamVjdCBhbmQgZGVsZXRlIGl0IGZyb20gdGhlIG9iamVjdCBhcyBpdCB3aWxsIG5vdFxuICAgICAgICAvLyBiZSBwYXJ0IG9mIHRoZSBhbmltYXRlIGVsZW1lbnQgYXR0cmlidXRlcy5cbiAgICAgICAgaWYoYW5pbWF0aW9uRGVmaW5pdGlvbi5lYXNpbmcpIHtcbiAgICAgICAgICAvLyBJZiBhbHJlYWR5IGFuIGVhc2luZyBCw6l6aWVyIGN1cnZlIGFycmF5IHdlIHRha2UgaXQgb3Igd2UgbG9va3VwIGEgZWFzaW5nIGFycmF5IGluIHRoZSBFYXNpbmcgb2JqZWN0XG4gICAgICAgICAgZWFzaW5nID0gYW5pbWF0aW9uRGVmaW5pdGlvbi5lYXNpbmcgaW5zdGFuY2VvZiBBcnJheSA/XG4gICAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmVhc2luZyA6XG4gICAgICAgICAgICBDaGFydGlzdC5TdmcuRWFzaW5nW2FuaW1hdGlvbkRlZmluaXRpb24uZWFzaW5nXTtcbiAgICAgICAgICBkZWxldGUgYW5pbWF0aW9uRGVmaW5pdGlvbi5lYXNpbmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBudW1lcmljIGR1ciBvciBiZWdpbiB3YXMgcHJvdmlkZWQgd2UgYXNzdW1lIG1pbGxpIHNlY29uZHNcbiAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5iZWdpbiA9IENoYXJ0aXN0LmVuc3VyZVVuaXQoYW5pbWF0aW9uRGVmaW5pdGlvbi5iZWdpbiwgJ21zJyk7XG4gICAgICAgIGFuaW1hdGlvbkRlZmluaXRpb24uZHVyID0gQ2hhcnRpc3QuZW5zdXJlVW5pdChhbmltYXRpb25EZWZpbml0aW9uLmR1ciwgJ21zJyk7XG5cbiAgICAgICAgaWYoZWFzaW5nKSB7XG4gICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5jYWxjTW9kZSA9ICdzcGxpbmUnO1xuICAgICAgICAgIGFuaW1hdGlvbkRlZmluaXRpb24ua2V5U3BsaW5lcyA9IGVhc2luZy5qb2luKCcgJyk7XG4gICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5rZXlUaW1lcyA9ICcwOzEnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkaW5nIFwiZmlsbDogZnJlZXplXCIgaWYgd2UgYXJlIGluIGd1aWRlZCBtb2RlIGFuZCBzZXQgaW5pdGlhbCBhdHRyaWJ1dGUgdmFsdWVzXG4gICAgICAgIGlmKGd1aWRlZCkge1xuICAgICAgICAgIGFuaW1hdGlvbkRlZmluaXRpb24uZmlsbCA9ICdmcmVlemUnO1xuICAgICAgICAgIC8vIEFuaW1hdGVkIHByb3BlcnR5IG9uIG91ciBlbGVtZW50IHNob3VsZCBhbHJlYWR5IGJlIHNldCB0byB0aGUgYW5pbWF0aW9uIGZyb20gdmFsdWUgaW4gZ3VpZGVkIG1vZGVcbiAgICAgICAgICBhdHRyaWJ1dGVQcm9wZXJ0aWVzW2F0dHJpYnV0ZV0gPSBhbmltYXRpb25EZWZpbml0aW9uLmZyb207XG4gICAgICAgICAgdGhpcy5hdHRyKGF0dHJpYnV0ZVByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgLy8gSW4gZ3VpZGVkIG1vZGUgd2UgYWxzbyBzZXQgYmVnaW4gdG8gaW5kZWZpbml0ZSBzbyB3ZSBjYW4gdHJpZ2dlciB0aGUgc3RhcnQgbWFudWFsbHkgYW5kIHB1dCB0aGUgYmVnaW5cbiAgICAgICAgICAvLyB3aGljaCBuZWVkcyB0byBiZSBpbiBtcyBhc2lkZVxuICAgICAgICAgIHRpbWVvdXQgPSBDaGFydGlzdC5xdWFudGl0eShhbmltYXRpb25EZWZpbml0aW9uLmJlZ2luIHx8IDApLnZhbHVlO1xuICAgICAgICAgIGFuaW1hdGlvbkRlZmluaXRpb24uYmVnaW4gPSAnaW5kZWZpbml0ZSc7XG4gICAgICAgIH1cblxuICAgICAgICBhbmltYXRlID0gdGhpcy5lbGVtKCdhbmltYXRlJywgQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgICAgICBhdHRyaWJ1dGVOYW1lOiBhdHRyaWJ1dGVcbiAgICAgICAgfSwgYW5pbWF0aW9uRGVmaW5pdGlvbikpO1xuXG4gICAgICAgIGlmKGd1aWRlZCkge1xuICAgICAgICAgIC8vIElmIGd1aWRlZCB3ZSB0YWtlIHRoZSB2YWx1ZSB0aGF0IHdhcyBwdXQgYXNpZGUgaW4gdGltZW91dCBhbmQgdHJpZ2dlciB0aGUgYW5pbWF0aW9uIG1hbnVhbGx5IHdpdGggYSB0aW1lb3V0XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIElmIGJlZ2luRWxlbWVudCBmYWlscyB3ZSBzZXQgdGhlIGFuaW1hdGVkIGF0dHJpYnV0ZSB0byB0aGUgZW5kIHBvc2l0aW9uIGFuZCByZW1vdmUgdGhlIGFuaW1hdGUgZWxlbWVudFxuICAgICAgICAgICAgLy8gVGhpcyBoYXBwZW5zIGlmIHRoZSBTTUlMIEVsZW1lbnRUaW1lQ29udHJvbCBpbnRlcmZhY2UgaXMgbm90IHN1cHBvcnRlZCBvciBhbnkgb3RoZXIgcHJvYmxlbXMgb2NjdXJlZCBpblxuICAgICAgICAgICAgLy8gdGhlIGJyb3dzZXIuIChDdXJyZW50bHkgRkYgMzQgZG9lcyBub3Qgc3VwcG9ydCBhbmltYXRlIGVsZW1lbnRzIGluIGZvcmVpZ25PYmplY3RzKVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgYW5pbWF0ZS5fbm9kZS5iZWdpbkVsZW1lbnQoKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICAgICAgICAgIC8vIFNldCBhbmltYXRlZCBhdHRyaWJ1dGUgdG8gY3VycmVudCBhbmltYXRlZCB2YWx1ZVxuICAgICAgICAgICAgICBhdHRyaWJ1dGVQcm9wZXJ0aWVzW2F0dHJpYnV0ZV0gPSBhbmltYXRpb25EZWZpbml0aW9uLnRvO1xuICAgICAgICAgICAgICB0aGlzLmF0dHIoYXR0cmlidXRlUHJvcGVydGllcyk7XG4gICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgYW5pbWF0ZSBlbGVtZW50IGFzIGl0J3Mgbm8gbG9uZ2VyIHJlcXVpcmVkXG4gICAgICAgICAgICAgIGFuaW1hdGUucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfS5iaW5kKHRoaXMpLCB0aW1lb3V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGV2ZW50RW1pdHRlcikge1xuICAgICAgICAgIGFuaW1hdGUuX25vZGUuYWRkRXZlbnRMaXN0ZW5lcignYmVnaW5FdmVudCcsIGZ1bmN0aW9uIGhhbmRsZUJlZ2luRXZlbnQoKSB7XG4gICAgICAgICAgICBldmVudEVtaXR0ZXIuZW1pdCgnYW5pbWF0aW9uQmVnaW4nLCB7XG4gICAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMsXG4gICAgICAgICAgICAgIGFuaW1hdGU6IGFuaW1hdGUuX25vZGUsXG4gICAgICAgICAgICAgIHBhcmFtczogYW5pbWF0aW9uRGVmaW5pdGlvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFuaW1hdGUuX25vZGUuYWRkRXZlbnRMaXN0ZW5lcignZW5kRXZlbnQnLCBmdW5jdGlvbiBoYW5kbGVFbmRFdmVudCgpIHtcbiAgICAgICAgICBpZihldmVudEVtaXR0ZXIpIHtcbiAgICAgICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KCdhbmltYXRpb25FbmQnLCB7XG4gICAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMsXG4gICAgICAgICAgICAgIGFuaW1hdGU6IGFuaW1hdGUuX25vZGUsXG4gICAgICAgICAgICAgIHBhcmFtczogYW5pbWF0aW9uRGVmaW5pdGlvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoZ3VpZGVkKSB7XG4gICAgICAgICAgICAvLyBTZXQgYW5pbWF0ZWQgYXR0cmlidXRlIHRvIGN1cnJlbnQgYW5pbWF0ZWQgdmFsdWVcbiAgICAgICAgICAgIGF0dHJpYnV0ZVByb3BlcnRpZXNbYXR0cmlidXRlXSA9IGFuaW1hdGlvbkRlZmluaXRpb24udG87XG4gICAgICAgICAgICB0aGlzLmF0dHIoYXR0cmlidXRlUHJvcGVydGllcyk7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGFuaW1hdGUgZWxlbWVudCBhcyBpdCdzIG5vIGxvbmdlciByZXF1aXJlZFxuICAgICAgICAgICAgYW5pbWF0ZS5yZW1vdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGN1cnJlbnQgYXR0cmlidXRlIGlzIGFuIGFycmF5IG9mIGRlZmluaXRpb24gb2JqZWN0cyB3ZSBjcmVhdGUgYW4gYW5pbWF0ZSBmb3IgZWFjaCBhbmQgZGlzYWJsZSBndWlkZWQgbW9kZVxuICAgICAgaWYoYW5pbWF0aW9uc1thdHRyaWJ1dGVdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgYW5pbWF0aW9uc1thdHRyaWJ1dGVdLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0aW9uRGVmaW5pdGlvbikge1xuICAgICAgICAgIGNyZWF0ZUFuaW1hdGUuYmluZCh0aGlzKShhbmltYXRpb25EZWZpbml0aW9uLCBmYWxzZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjcmVhdGVBbmltYXRlLmJpbmQodGhpcykoYW5pbWF0aW9uc1thdHRyaWJ1dGVdLCBndWlkZWQpO1xuICAgICAgfVxuXG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgQ2hhcnRpc3QuU3ZnID0gQ2hhcnRpc3QuQ2xhc3MuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogU3ZnLFxuICAgIGF0dHI6IGF0dHIsXG4gICAgZWxlbTogZWxlbSxcbiAgICBwYXJlbnQ6IHBhcmVudCxcbiAgICByb290OiByb290LFxuICAgIHF1ZXJ5U2VsZWN0b3I6IHF1ZXJ5U2VsZWN0b3IsXG4gICAgcXVlcnlTZWxlY3RvckFsbDogcXVlcnlTZWxlY3RvckFsbCxcbiAgICBmb3JlaWduT2JqZWN0OiBmb3JlaWduT2JqZWN0LFxuICAgIHRleHQ6IHRleHQsXG4gICAgZW1wdHk6IGVtcHR5LFxuICAgIHJlbW92ZTogcmVtb3ZlLFxuICAgIHJlcGxhY2U6IHJlcGxhY2UsXG4gICAgYXBwZW5kOiBhcHBlbmQsXG4gICAgY2xhc3NlczogY2xhc3NlcyxcbiAgICBhZGRDbGFzczogYWRkQ2xhc3MsXG4gICAgcmVtb3ZlQ2xhc3M6IHJlbW92ZUNsYXNzLFxuICAgIHJlbW92ZUFsbENsYXNzZXM6IHJlbW92ZUFsbENsYXNzZXMsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGFuaW1hdGU6IGFuaW1hdGVcbiAgfSk7XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGNoZWNrcyBmb3Igc3VwcG9ydCBvZiBhIGdpdmVuIFNWRyBmZWF0dXJlIGxpa2UgRXh0ZW5zaWJpbGl0eSwgU1ZHLWFuaW1hdGlvbiBvciB0aGUgbGlrZS4gQ2hlY2sgaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHMTEvZmVhdHVyZSBmb3IgYSBkZXRhaWxlZCBsaXN0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBmZWF0dXJlIFRoZSBTVkcgMS4xIGZlYXR1cmUgdGhhdCBzaG91bGQgYmUgY2hlY2tlZCBmb3Igc3VwcG9ydC5cbiAgICogQHJldHVybiB7Qm9vbGVhbn0gVHJ1ZSBvZiBmYWxzZSBpZiB0aGUgZmVhdHVyZSBpcyBzdXBwb3J0ZWQgb3Igbm90XG4gICAqL1xuICBDaGFydGlzdC5TdmcuaXNTdXBwb3J0ZWQgPSBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmhhc0ZlYXR1cmUoJ2h0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ZlYXR1cmUjJyArIGZlYXR1cmUsICcxLjEnKTtcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBPYmplY3QgY29udGFpbnMgc29tZSBzdGFuZGFyZCBlYXNpbmcgY3ViaWMgYmV6aWVyIGN1cnZlcy4gVGhlbiBjYW4gYmUgdXNlZCB3aXRoIHRoZWlyIG5hbWUgaW4gdGhlIGBDaGFydGlzdC5TdmcuYW5pbWF0ZWAuIFlvdSBjYW4gYWxzbyBleHRlbmQgdGhlIGxpc3QgYW5kIHVzZSB5b3VyIG93biBuYW1lIGluIHRoZSBgYW5pbWF0ZWAgZnVuY3Rpb24uIENsaWNrIHRoZSBzaG93IGNvZGUgYnV0dG9uIHRvIHNlZSB0aGUgYXZhaWxhYmxlIGJlemllciBmdW5jdGlvbnMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICovXG4gIHZhciBlYXNpbmdDdWJpY0JlemllcnMgPSB7XG4gICAgZWFzZUluU2luZTogWzAuNDcsIDAsIDAuNzQ1LCAwLjcxNV0sXG4gICAgZWFzZU91dFNpbmU6IFswLjM5LCAwLjU3NSwgMC41NjUsIDFdLFxuICAgIGVhc2VJbk91dFNpbmU6IFswLjQ0NSwgMC4wNSwgMC41NSwgMC45NV0sXG4gICAgZWFzZUluUXVhZDogWzAuNTUsIDAuMDg1LCAwLjY4LCAwLjUzXSxcbiAgICBlYXNlT3V0UXVhZDogWzAuMjUsIDAuNDYsIDAuNDUsIDAuOTRdLFxuICAgIGVhc2VJbk91dFF1YWQ6IFswLjQ1NSwgMC4wMywgMC41MTUsIDAuOTU1XSxcbiAgICBlYXNlSW5DdWJpYzogWzAuNTUsIDAuMDU1LCAwLjY3NSwgMC4xOV0sXG4gICAgZWFzZU91dEN1YmljOiBbMC4yMTUsIDAuNjEsIDAuMzU1LCAxXSxcbiAgICBlYXNlSW5PdXRDdWJpYzogWzAuNjQ1LCAwLjA0NSwgMC4zNTUsIDFdLFxuICAgIGVhc2VJblF1YXJ0OiBbMC44OTUsIDAuMDMsIDAuNjg1LCAwLjIyXSxcbiAgICBlYXNlT3V0UXVhcnQ6IFswLjE2NSwgMC44NCwgMC40NCwgMV0sXG4gICAgZWFzZUluT3V0UXVhcnQ6IFswLjc3LCAwLCAwLjE3NSwgMV0sXG4gICAgZWFzZUluUXVpbnQ6IFswLjc1NSwgMC4wNSwgMC44NTUsIDAuMDZdLFxuICAgIGVhc2VPdXRRdWludDogWzAuMjMsIDEsIDAuMzIsIDFdLFxuICAgIGVhc2VJbk91dFF1aW50OiBbMC44NiwgMCwgMC4wNywgMV0sXG4gICAgZWFzZUluRXhwbzogWzAuOTUsIDAuMDUsIDAuNzk1LCAwLjAzNV0sXG4gICAgZWFzZU91dEV4cG86IFswLjE5LCAxLCAwLjIyLCAxXSxcbiAgICBlYXNlSW5PdXRFeHBvOiBbMSwgMCwgMCwgMV0sXG4gICAgZWFzZUluQ2lyYzogWzAuNiwgMC4wNCwgMC45OCwgMC4zMzVdLFxuICAgIGVhc2VPdXRDaXJjOiBbMC4wNzUsIDAuODIsIDAuMTY1LCAxXSxcbiAgICBlYXNlSW5PdXRDaXJjOiBbMC43ODUsIDAuMTM1LCAwLjE1LCAwLjg2XSxcbiAgICBlYXNlSW5CYWNrOiBbMC42LCAtMC4yOCwgMC43MzUsIDAuMDQ1XSxcbiAgICBlYXNlT3V0QmFjazogWzAuMTc1LCAwLjg4NSwgMC4zMiwgMS4yNzVdLFxuICAgIGVhc2VJbk91dEJhY2s6IFswLjY4LCAtMC41NSwgMC4yNjUsIDEuNTVdXG4gIH07XG5cbiAgQ2hhcnRpc3QuU3ZnLkVhc2luZyA9IGVhc2luZ0N1YmljQmV6aWVycztcblxuICAvKipcbiAgICogVGhpcyBoZWxwZXIgY2xhc3MgaXMgdG8gd3JhcCBtdWx0aXBsZSBgQ2hhcnRpc3QuU3ZnYCBlbGVtZW50cyBpbnRvIGEgbGlzdCB3aGVyZSB5b3UgY2FuIGNhbGwgdGhlIGBDaGFydGlzdC5TdmdgIGZ1bmN0aW9ucyBvbiBhbGwgZWxlbWVudHMgaW4gdGhlIGxpc3Qgd2l0aCBvbmUgY2FsbC4gVGhpcyBpcyBoZWxwZnVsIHdoZW4geW91J2QgbGlrZSB0byBwZXJmb3JtIGNhbGxzIHdpdGggYENoYXJ0aXN0LlN2Z2Agb24gbXVsdGlwbGUgZWxlbWVudHMuXG4gICAqIEFuIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgaXMgYWxzbyByZXR1cm5lZCBieSBgQ2hhcnRpc3QuU3ZnLnF1ZXJ5U2VsZWN0b3JBbGxgLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7QXJyYXk8Tm9kZT58Tm9kZUxpc3R9IG5vZGVMaXN0IEFuIEFycmF5IG9mIFNWRyBET00gbm9kZXMgb3IgYSBTVkcgRE9NIE5vZGVMaXN0IChhcyByZXR1cm5lZCBieSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKVxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGZ1bmN0aW9uIFN2Z0xpc3Qobm9kZUxpc3QpIHtcbiAgICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgICB0aGlzLnN2Z0VsZW1lbnRzID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnN2Z0VsZW1lbnRzLnB1c2gobmV3IENoYXJ0aXN0LlN2Zyhub2RlTGlzdFtpXSkpO1xuICAgIH1cblxuICAgIC8vIEFkZCBkZWxlZ2F0aW9uIG1ldGhvZHMgZm9yIENoYXJ0aXN0LlN2Z1xuICAgIE9iamVjdC5rZXlzKENoYXJ0aXN0LlN2Zy5wcm90b3R5cGUpLmZpbHRlcihmdW5jdGlvbihwcm90b3R5cGVQcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIFsnY29uc3RydWN0b3InLFxuICAgICAgICAgICdwYXJlbnQnLFxuICAgICAgICAgICdxdWVyeVNlbGVjdG9yJyxcbiAgICAgICAgICAncXVlcnlTZWxlY3RvckFsbCcsXG4gICAgICAgICAgJ3JlcGxhY2UnLFxuICAgICAgICAgICdhcHBlbmQnLFxuICAgICAgICAgICdjbGFzc2VzJyxcbiAgICAgICAgICAnaGVpZ2h0JyxcbiAgICAgICAgICAnd2lkdGgnXS5pbmRleE9mKHByb3RvdHlwZVByb3BlcnR5KSA9PT0gLTE7XG4gICAgfSkuZm9yRWFjaChmdW5jdGlvbihwcm90b3R5cGVQcm9wZXJ0eSkge1xuICAgICAgbGlzdFtwcm90b3R5cGVQcm9wZXJ0eV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICBsaXN0LnN2Z0VsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgIENoYXJ0aXN0LlN2Zy5wcm90b3R5cGVbcHJvdG90eXBlUHJvcGVydHldLmFwcGx5KGVsZW1lbnQsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgQ2hhcnRpc3QuU3ZnLkxpc3QgPSBDaGFydGlzdC5DbGFzcy5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBTdmdMaXN0XG4gIH0pO1xufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogQ2hhcnRpc3QgU1ZHIHBhdGggbW9kdWxlIGZvciBTVkcgcGF0aCBkZXNjcmlwdGlvbiBjcmVhdGlvbiBhbmQgbW9kaWZpY2F0aW9uLlxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBDb250YWlucyB0aGUgZGVzY3JpcHRvcnMgb2Ygc3VwcG9ydGVkIGVsZW1lbnQgdHlwZXMgaW4gYSBTVkcgcGF0aC4gQ3VycmVudGx5IG9ubHkgbW92ZSwgbGluZSBhbmQgY3VydmUgYXJlIHN1cHBvcnRlZC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB2YXIgZWxlbWVudERlc2NyaXB0aW9ucyA9IHtcbiAgICBtOiBbJ3gnLCAneSddLFxuICAgIGw6IFsneCcsICd5J10sXG4gICAgYzogWyd4MScsICd5MScsICd4MicsICd5MicsICd4JywgJ3knXSxcbiAgICBhOiBbJ3J4JywgJ3J5JywgJ3hBcicsICdsQWYnLCAnc2YnLCAneCcsICd5J11cbiAgfTtcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zIGZvciBuZXdseSBjcmVhdGVkIFNWRyBwYXRoIG9iamVjdHMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIC8vIFRoZSBhY2N1cmFjeSBpbiBkaWdpdCBjb3VudCBhZnRlciB0aGUgZGVjaW1hbCBwb2ludC4gVGhpcyB3aWxsIGJlIHVzZWQgdG8gcm91bmQgbnVtYmVycyBpbiB0aGUgU1ZHIHBhdGguIElmIHRoaXMgb3B0aW9uIGlzIHNldCB0byBmYWxzZSB0aGVuIG5vIHJvdW5kaW5nIHdpbGwgYmUgcGVyZm9ybWVkLlxuICAgIGFjY3VyYWN5OiAzXG4gIH07XG5cbiAgZnVuY3Rpb24gZWxlbWVudChjb21tYW5kLCBwYXJhbXMsIHBhdGhFbGVtZW50cywgcG9zLCByZWxhdGl2ZSwgZGF0YSkge1xuICAgIHZhciBwYXRoRWxlbWVudCA9IENoYXJ0aXN0LmV4dGVuZCh7XG4gICAgICBjb21tYW5kOiByZWxhdGl2ZSA/IGNvbW1hbmQudG9Mb3dlckNhc2UoKSA6IGNvbW1hbmQudG9VcHBlckNhc2UoKVxuICAgIH0sIHBhcmFtcywgZGF0YSA/IHsgZGF0YTogZGF0YSB9IDoge30gKTtcblxuICAgIHBhdGhFbGVtZW50cy5zcGxpY2UocG9zLCAwLCBwYXRoRWxlbWVudCk7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JFYWNoUGFyYW0ocGF0aEVsZW1lbnRzLCBjYikge1xuICAgIHBhdGhFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBhdGhFbGVtZW50LCBwYXRoRWxlbWVudEluZGV4KSB7XG4gICAgICBlbGVtZW50RGVzY3JpcHRpb25zW3BhdGhFbGVtZW50LmNvbW1hbmQudG9Mb3dlckNhc2UoKV0uZm9yRWFjaChmdW5jdGlvbihwYXJhbU5hbWUsIHBhcmFtSW5kZXgpIHtcbiAgICAgICAgY2IocGF0aEVsZW1lbnQsIHBhcmFtTmFtZSwgcGF0aEVsZW1lbnRJbmRleCwgcGFyYW1JbmRleCwgcGF0aEVsZW1lbnRzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gY29uc3RydWN0IGEgbmV3IHBhdGggb2JqZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtCb29sZWFufSBjbG9zZSBJZiBzZXQgdG8gdHJ1ZSB0aGVuIHRoaXMgcGF0aCB3aWxsIGJlIGNsb3NlZCB3aGVuIHN0cmluZ2lmaWVkICh3aXRoIGEgWiBhdCB0aGUgZW5kKVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIG9iamVjdCB0aGF0IG92ZXJyaWRlcyB0aGUgZGVmYXVsdCBvYmplY3RzLiBTZWUgZGVmYXVsdCBvcHRpb25zIGZvciBtb3JlIGRldGFpbHMuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gU3ZnUGF0aChjbG9zZSwgb3B0aW9ucykge1xuICAgIHRoaXMucGF0aEVsZW1lbnRzID0gW107XG4gICAgdGhpcy5wb3MgPSAwO1xuICAgIHRoaXMuY2xvc2UgPSBjbG9zZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIG9yIHNldHMgdGhlIGN1cnJlbnQgcG9zaXRpb24gKGN1cnNvcikgaW5zaWRlIG9mIHRoZSBwYXRoLiBZb3UgY2FuIG1vdmUgYXJvdW5kIHRoZSBjdXJzb3IgZnJlZWx5IGJ1dCBsaW1pdGVkIHRvIDAgb3IgdGhlIGNvdW50IG9mIGV4aXN0aW5nIGVsZW1lbnRzLiBBbGwgbW9kaWZpY2F0aW9ucyB3aXRoIGVsZW1lbnQgZnVuY3Rpb25zIHdpbGwgaW5zZXJ0IG5ldyBlbGVtZW50cyBhdCB0aGUgcG9zaXRpb24gb2YgdGhpcyBjdXJzb3IuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge051bWJlcn0gW3Bvc10gSWYgYSBudW1iZXIgaXMgcGFzc2VkIHRoZW4gdGhlIGN1cnNvciBpcyBzZXQgdG8gdGhpcyBwb3NpdGlvbiBpbiB0aGUgcGF0aCBlbGVtZW50IGFycmF5LlxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aHxOdW1iZXJ9IElmIHRoZSBwb3NpdGlvbiBwYXJhbWV0ZXIgd2FzIHBhc3NlZCB0aGVuIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBiZSB0aGUgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy4gSWYgbm8gcG9zaXRpb24gcGFyYW1ldGVyIHdhcyBwYXNzZWQgdGhlbiB0aGUgY3VycmVudCBwb3NpdGlvbiBpcyByZXR1cm5lZC5cbiAgICovXG4gIGZ1bmN0aW9uIHBvc2l0aW9uKHBvcykge1xuICAgIGlmKHBvcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnBvcyA9IE1hdGgubWF4KDAsIE1hdGgubWluKHRoaXMucGF0aEVsZW1lbnRzLmxlbmd0aCwgcG9zKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucG9zO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGVsZW1lbnRzIGZyb20gdGhlIHBhdGggc3RhcnRpbmcgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHBhdGggZWxlbWVudHMgdGhhdCBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIHJlbW92ZShjb3VudCkge1xuICAgIHRoaXMucGF0aEVsZW1lbnRzLnNwbGljZSh0aGlzLnBvcywgY291bnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIGFkZCBhIG5ldyBtb3ZlIFNWRyBwYXRoIGVsZW1lbnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgeCBjb29yZGluYXRlIGZvciB0aGUgbW92ZSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge051bWJlcn0geSBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgbW92ZSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtyZWxhdGl2ZV0gSWYgc2V0IHRvIHRydWUgdGhlIG1vdmUgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCByZWxhdGl2ZSBjb29yZGluYXRlcyAobG93ZXJjYXNlIGxldHRlcilcbiAgICogQHBhcmFtIHsqfSBbZGF0YV0gQW55IGRhdGEgdGhhdCBzaG91bGQgYmUgc3RvcmVkIHdpdGggdGhlIGVsZW1lbnQgb2JqZWN0IHRoYXQgd2lsbCBiZSBhY2Nlc3NpYmxlIGluIHBhdGhFbGVtZW50XG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gbW92ZSh4LCB5LCByZWxhdGl2ZSwgZGF0YSkge1xuICAgIGVsZW1lbnQoJ00nLCB7XG4gICAgICB4OiAreCxcbiAgICAgIHk6ICt5XG4gICAgfSwgdGhpcy5wYXRoRWxlbWVudHMsIHRoaXMucG9zKyssIHJlbGF0aXZlLCBkYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBhZGQgYSBuZXcgbGluZSBTVkcgcGF0aCBlbGVtZW50LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIGxpbmUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIHkgY29vcmRpbmF0ZSBmb3IgdGhlIGxpbmUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBbcmVsYXRpdmVdIElmIHNldCB0byB0cnVlIHRoZSBsaW5lIGVsZW1lbnQgd2lsbCBiZSBjcmVhdGVkIHdpdGggcmVsYXRpdmUgY29vcmRpbmF0ZXMgKGxvd2VyY2FzZSBsZXR0ZXIpXG4gICAqIEBwYXJhbSB7Kn0gW2RhdGFdIEFueSBkYXRhIHRoYXQgc2hvdWxkIGJlIHN0b3JlZCB3aXRoIHRoZSBlbGVtZW50IG9iamVjdCB0aGF0IHdpbGwgYmUgYWNjZXNzaWJsZSBpbiBwYXRoRWxlbWVudFxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIGxpbmUoeCwgeSwgcmVsYXRpdmUsIGRhdGEpIHtcbiAgICBlbGVtZW50KCdMJywge1xuICAgICAgeDogK3gsXG4gICAgICB5OiAreVxuICAgIH0sIHRoaXMucGF0aEVsZW1lbnRzLCB0aGlzLnBvcysrLCByZWxhdGl2ZSwgZGF0YSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gYWRkIGEgbmV3IGN1cnZlIFNWRyBwYXRoIGVsZW1lbnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge051bWJlcn0geDEgVGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIGZpcnN0IGNvbnRyb2wgcG9pbnQgb2YgdGhlIGJlemllciBjdXJ2ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkxIFRoZSB5IGNvb3JkaW5hdGUgZm9yIHRoZSBmaXJzdCBjb250cm9sIHBvaW50IG9mIHRoZSBiZXppZXIgY3VydmUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4MiBUaGUgeCBjb29yZGluYXRlIGZvciB0aGUgc2Vjb25kIGNvbnRyb2wgcG9pbnQgb2YgdGhlIGJlemllciBjdXJ2ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkyIFRoZSB5IGNvb3JkaW5hdGUgZm9yIHRoZSBzZWNvbmQgY29udHJvbCBwb2ludCBvZiB0aGUgYmV6aWVyIGN1cnZlLlxuICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgeCBjb29yZGluYXRlIGZvciB0aGUgdGFyZ2V0IHBvaW50IG9mIHRoZSBjdXJ2ZSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge051bWJlcn0geSBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgdGFyZ2V0IHBvaW50IG9mIHRoZSBjdXJ2ZSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtyZWxhdGl2ZV0gSWYgc2V0IHRvIHRydWUgdGhlIGN1cnZlIGVsZW1lbnQgd2lsbCBiZSBjcmVhdGVkIHdpdGggcmVsYXRpdmUgY29vcmRpbmF0ZXMgKGxvd2VyY2FzZSBsZXR0ZXIpXG4gICAqIEBwYXJhbSB7Kn0gW2RhdGFdIEFueSBkYXRhIHRoYXQgc2hvdWxkIGJlIHN0b3JlZCB3aXRoIHRoZSBlbGVtZW50IG9iamVjdCB0aGF0IHdpbGwgYmUgYWNjZXNzaWJsZSBpbiBwYXRoRWxlbWVudFxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIGN1cnZlKHgxLCB5MSwgeDIsIHkyLCB4LCB5LCByZWxhdGl2ZSwgZGF0YSkge1xuICAgIGVsZW1lbnQoJ0MnLCB7XG4gICAgICB4MTogK3gxLFxuICAgICAgeTE6ICt5MSxcbiAgICAgIHgyOiAreDIsXG4gICAgICB5MjogK3kyLFxuICAgICAgeDogK3gsXG4gICAgICB5OiAreVxuICAgIH0sIHRoaXMucGF0aEVsZW1lbnRzLCB0aGlzLnBvcysrLCByZWxhdGl2ZSwgZGF0YSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gYWRkIGEgbmV3IG5vbi1iZXppZXIgY3VydmUgU1ZHIHBhdGggZWxlbWVudC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7TnVtYmVyfSByeCBUaGUgcmFkaXVzIHRvIGJlIHVzZWQgZm9yIHRoZSB4LWF4aXMgb2YgdGhlIGFyYy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHJ5IFRoZSByYWRpdXMgdG8gYmUgdXNlZCBmb3IgdGhlIHktYXhpcyBvZiB0aGUgYXJjLlxuICAgKiBAcGFyYW0ge051bWJlcn0geEFyIERlZmluZXMgdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBhcmNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxBZiBMYXJnZSBhcmMgZmxhZ1xuICAgKiBAcGFyYW0ge051bWJlcn0gc2YgU3dlZXAgZmxhZ1xuICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgeCBjb29yZGluYXRlIGZvciB0aGUgdGFyZ2V0IHBvaW50IG9mIHRoZSBjdXJ2ZSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge051bWJlcn0geSBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgdGFyZ2V0IHBvaW50IG9mIHRoZSBjdXJ2ZSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtyZWxhdGl2ZV0gSWYgc2V0IHRvIHRydWUgdGhlIGN1cnZlIGVsZW1lbnQgd2lsbCBiZSBjcmVhdGVkIHdpdGggcmVsYXRpdmUgY29vcmRpbmF0ZXMgKGxvd2VyY2FzZSBsZXR0ZXIpXG4gICAqIEBwYXJhbSB7Kn0gW2RhdGFdIEFueSBkYXRhIHRoYXQgc2hvdWxkIGJlIHN0b3JlZCB3aXRoIHRoZSBlbGVtZW50IG9iamVjdCB0aGF0IHdpbGwgYmUgYWNjZXNzaWJsZSBpbiBwYXRoRWxlbWVudFxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIGFyYyhyeCwgcnksIHhBciwgbEFmLCBzZiwgeCwgeSwgcmVsYXRpdmUsIGRhdGEpIHtcbiAgICBlbGVtZW50KCdBJywge1xuICAgICAgcng6ICtyeCxcbiAgICAgIHJ5OiArcnksXG4gICAgICB4QXI6ICt4QXIsXG4gICAgICBsQWY6ICtsQWYsXG4gICAgICBzZjogK3NmLFxuICAgICAgeDogK3gsXG4gICAgICB5OiAreVxuICAgIH0sIHRoaXMucGF0aEVsZW1lbnRzLCB0aGlzLnBvcysrLCByZWxhdGl2ZSwgZGF0YSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2VzIGFuIFNWRyBwYXRoIHNlZW4gaW4gdGhlIGQgYXR0cmlidXRlIG9mIHBhdGggZWxlbWVudHMsIGFuZCBpbnNlcnRzIHRoZSBwYXJzZWQgZWxlbWVudHMgaW50byB0aGUgZXhpc3RpbmcgcGF0aCBvYmplY3QgYXQgdGhlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uLiBBbnkgY2xvc2luZyBwYXRoIGluZGljYXRvcnMgKFogYXQgdGhlIGVuZCBvZiB0aGUgcGF0aCkgd2lsbCBiZSBpZ25vcmVkIGJ5IHRoZSBwYXJzZXIgYXMgdGhpcyBpcyBwcm92aWRlZCBieSB0aGUgY2xvc2Ugb3B0aW9uIGluIHRoZSBvcHRpb25zIG9mIHRoZSBwYXRoIG9iamVjdC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIEFueSBTVkcgcGF0aCB0aGF0IGNvbnRhaW5zIG1vdmUgKG0pLCBsaW5lIChsKSBvciBjdXJ2ZSAoYykgY29tcG9uZW50cy5cbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZShwYXRoKSB7XG4gICAgLy8gUGFyc2luZyB0aGUgU1ZHIHBhdGggc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIFtbJ00nLCAnMTAnLCAnMTAnXSwgWydMJywgJzEwMCcsICcxMDAnXV1cbiAgICB2YXIgY2h1bmtzID0gcGF0aC5yZXBsYWNlKC8oW0EtWmEtel0pKFswLTldKS9nLCAnJDEgJDInKVxuICAgICAgLnJlcGxhY2UoLyhbMC05XSkoW0EtWmEtel0pL2csICckMSAkMicpXG4gICAgICAuc3BsaXQoL1tcXHMsXSsvKVxuICAgICAgLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVsZW1lbnQpIHtcbiAgICAgICAgaWYoZWxlbWVudC5tYXRjaCgvW0EtWmEtel0vKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKFtdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0ucHVzaChlbGVtZW50KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtdKTtcblxuICAgIC8vIElmIHRoaXMgaXMgYSBjbG9zZWQgcGF0aCB3ZSByZW1vdmUgdGhlIFogYXQgdGhlIGVuZCBiZWNhdXNlIHRoaXMgaXMgZGV0ZXJtaW5lZCBieSB0aGUgY2xvc2Ugb3B0aW9uXG4gICAgaWYoY2h1bmtzW2NodW5rcy5sZW5ndGggLSAxXVswXS50b1VwcGVyQ2FzZSgpID09PSAnWicpIHtcbiAgICAgIGNodW5rcy5wb3AoKTtcbiAgICB9XG5cbiAgICAvLyBVc2luZyBzdmdQYXRoRWxlbWVudERlc2NyaXB0aW9ucyB0byBtYXAgcmF3IHBhdGggYXJyYXlzIGludG8gb2JqZWN0cyB0aGF0IGNvbnRhaW4gdGhlIGNvbW1hbmQgYW5kIHRoZSBwYXJhbWV0ZXJzXG4gICAgLy8gRm9yIGV4YW1wbGUge2NvbW1hbmQ6ICdNJywgeDogJzEwJywgeTogJzEwJ31cbiAgICB2YXIgZWxlbWVudHMgPSBjaHVua3MubWFwKGZ1bmN0aW9uKGNodW5rKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gY2h1bmsuc2hpZnQoKSxcbiAgICAgICAgICBkZXNjcmlwdGlvbiA9IGVsZW1lbnREZXNjcmlwdGlvbnNbY29tbWFuZC50b0xvd2VyQ2FzZSgpXTtcblxuICAgICAgICByZXR1cm4gQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgICAgICBjb21tYW5kOiBjb21tYW5kXG4gICAgICAgIH0sIGRlc2NyaXB0aW9uLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIHBhcmFtTmFtZSwgaW5kZXgpIHtcbiAgICAgICAgICByZXN1bHRbcGFyYW1OYW1lXSA9ICtjaHVua1tpbmRleF07XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSwge30pKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gUHJlcGFyaW5nIGEgc3BsaWNlIGNhbGwgd2l0aCB0aGUgZWxlbWVudHMgYXJyYXkgYXMgdmFyIGFyZyBwYXJhbXMgYW5kIGluc2VydCB0aGUgcGFyc2VkIGVsZW1lbnRzIGF0IHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgdmFyIHNwbGljZUFyZ3MgPSBbdGhpcy5wb3MsIDBdO1xuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHNwbGljZUFyZ3MsIGVsZW1lbnRzKTtcbiAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmFwcGx5KHRoaXMucGF0aEVsZW1lbnRzLCBzcGxpY2VBcmdzKTtcbiAgICAvLyBJbmNyZWFzZSB0aGUgaW50ZXJuYWwgcG9zaXRpb24gYnkgdGhlIGVsZW1lbnQgY291bnRcbiAgICB0aGlzLnBvcyArPSBlbGVtZW50cy5sZW5ndGg7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHJlbmRlcnMgdG8gY3VycmVudCBTVkcgcGF0aCBvYmplY3QgaW50byBhIGZpbmFsIFNWRyBzdHJpbmcgdGhhdCBjYW4gYmUgdXNlZCBpbiB0aGUgZCBhdHRyaWJ1dGUgb2YgU1ZHIHBhdGggZWxlbWVudHMuIEl0IHVzZXMgdGhlIGFjY3VyYWN5IG9wdGlvbiB0byByb3VuZCBiaWcgZGVjaW1hbHMuIElmIHRoZSBjbG9zZSBwYXJhbWV0ZXIgd2FzIHNldCBpbiB0aGUgY29uc3RydWN0b3Igb2YgdGhpcyBwYXRoIG9iamVjdCB0aGVuIGEgcGF0aCBjbG9zaW5nIFogd2lsbCBiZSBhcHBlbmRlZCB0byB0aGUgb3V0cHV0IHN0cmluZy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG4gIGZ1bmN0aW9uIHN0cmluZ2lmeSgpIHtcbiAgICB2YXIgYWNjdXJhY3lNdWx0aXBsaWVyID0gTWF0aC5wb3coMTAsIHRoaXMub3B0aW9ucy5hY2N1cmFjeSk7XG5cbiAgICByZXR1cm4gdGhpcy5wYXRoRWxlbWVudHMucmVkdWNlKGZ1bmN0aW9uKHBhdGgsIHBhdGhFbGVtZW50KSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSBlbGVtZW50RGVzY3JpcHRpb25zW3BhdGhFbGVtZW50LmNvbW1hbmQudG9Mb3dlckNhc2UoKV0ubWFwKGZ1bmN0aW9uKHBhcmFtTmFtZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYWNjdXJhY3kgP1xuICAgICAgICAgICAgKE1hdGgucm91bmQocGF0aEVsZW1lbnRbcGFyYW1OYW1lXSAqIGFjY3VyYWN5TXVsdGlwbGllcikgLyBhY2N1cmFjeU11bHRpcGxpZXIpIDpcbiAgICAgICAgICAgIHBhdGhFbGVtZW50W3BhcmFtTmFtZV07XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgcmV0dXJuIHBhdGggKyBwYXRoRWxlbWVudC5jb21tYW5kICsgcGFyYW1zLmpvaW4oJywnKTtcbiAgICAgIH0uYmluZCh0aGlzKSwgJycpICsgKHRoaXMuY2xvc2UgPyAnWicgOiAnJyk7XG4gIH1cblxuICAvKipcbiAgICogU2NhbGVzIGFsbCBlbGVtZW50cyBpbiB0aGUgY3VycmVudCBTVkcgcGF0aCBvYmplY3QuIFRoZXJlIGlzIGFuIGluZGl2aWR1YWwgcGFyYW1ldGVyIGZvciBlYWNoIGNvb3JkaW5hdGUuIFNjYWxpbmcgd2lsbCBhbHNvIGJlIGRvbmUgZm9yIGNvbnRyb2wgcG9pbnRzIG9mIGN1cnZlcywgYWZmZWN0aW5nIHRoZSBnaXZlbiBjb29yZGluYXRlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIG51bWJlciB3aGljaCB3aWxsIGJlIHVzZWQgdG8gc2NhbGUgdGhlIHgsIHgxIGFuZCB4MiBvZiBhbGwgcGF0aCBlbGVtZW50cy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIG51bWJlciB3aGljaCB3aWxsIGJlIHVzZWQgdG8gc2NhbGUgdGhlIHksIHkxIGFuZCB5MiBvZiBhbGwgcGF0aCBlbGVtZW50cy5cbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAqL1xuICBmdW5jdGlvbiBzY2FsZSh4LCB5KSB7XG4gICAgZm9yRWFjaFBhcmFtKHRoaXMucGF0aEVsZW1lbnRzLCBmdW5jdGlvbihwYXRoRWxlbWVudCwgcGFyYW1OYW1lKSB7XG4gICAgICBwYXRoRWxlbWVudFtwYXJhbU5hbWVdICo9IHBhcmFtTmFtZVswXSA9PT0gJ3gnID8geCA6IHk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlcyBhbGwgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgU1ZHIHBhdGggb2JqZWN0LiBUaGUgdHJhbnNsYXRpb24gaXMgcmVsYXRpdmUgYW5kIHRoZXJlIGlzIGFuIGluZGl2aWR1YWwgcGFyYW1ldGVyIGZvciBlYWNoIGNvb3JkaW5hdGUuIFRyYW5zbGF0aW9uIHdpbGwgYWxzbyBiZSBkb25lIGZvciBjb250cm9sIHBvaW50cyBvZiBjdXJ2ZXMsIGFmZmVjdGluZyB0aGUgZ2l2ZW4gY29vcmRpbmF0ZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSBudW1iZXIgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHRyYW5zbGF0ZSB0aGUgeCwgeDEgYW5kIHgyIG9mIGFsbCBwYXRoIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0ge051bWJlcn0geSBUaGUgbnVtYmVyIHdoaWNoIHdpbGwgYmUgdXNlZCB0byB0cmFuc2xhdGUgdGhlIHksIHkxIGFuZCB5MiBvZiBhbGwgcGF0aCBlbGVtZW50cy5cbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAqL1xuICBmdW5jdGlvbiB0cmFuc2xhdGUoeCwgeSkge1xuICAgIGZvckVhY2hQYXJhbSh0aGlzLnBhdGhFbGVtZW50cywgZnVuY3Rpb24ocGF0aEVsZW1lbnQsIHBhcmFtTmFtZSkge1xuICAgICAgcGF0aEVsZW1lbnRbcGFyYW1OYW1lXSArPSBwYXJhbU5hbWVbMF0gPT09ICd4JyA/IHggOiB5O1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBydW4gb3ZlciBhbGwgZXhpc3RpbmcgcGF0aCBlbGVtZW50cyBhbmQgdGhlbiBsb29wIG92ZXIgdGhlaXIgYXR0cmlidXRlcy4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGZvciBldmVyeSBwYXRoIGVsZW1lbnQgYXR0cmlidXRlIHRoYXQgZXhpc3RzIGluIHRoZSBjdXJyZW50IHBhdGguXG4gICAqIFRoZSBtZXRob2Qgc2lnbmF0dXJlIG9mIHRoZSBjYWxsYmFjayBmdW5jdGlvbiBsb29rcyBsaWtlIHRoaXM6XG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogZnVuY3Rpb24ocGF0aEVsZW1lbnQsIHBhcmFtTmFtZSwgcGF0aEVsZW1lbnRJbmRleCwgcGFyYW1JbmRleCwgcGF0aEVsZW1lbnRzKVxuICAgKiBgYGBcbiAgICogSWYgc29tZXRoaW5nIGVsc2UgdGhhbiB1bmRlZmluZWQgaXMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLCB0aGlzIHZhbHVlIHdpbGwgYmUgdXNlZCB0byByZXBsYWNlIHRoZSBvbGQgdmFsdWUuIFRoaXMgYWxsb3dzIHlvdSB0byBidWlsZCBjdXN0b20gdHJhbnNmb3JtYXRpb25zIG9mIHBhdGggb2JqZWN0cyB0aGF0IGNhbid0IGJlIGFjaGlldmVkIHVzaW5nIHRoZSBiYXNpYyB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbnMgc2NhbGUgYW5kIHRyYW5zbGF0ZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybUZuYyBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSB0cmFuc2Zvcm1hdGlvbi4gQ2hlY2sgdGhlIHNpZ25hdHVyZSBpbiB0aGUgZnVuY3Rpb24gZGVzY3JpcHRpb24uXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gdHJhbnNmb3JtKHRyYW5zZm9ybUZuYykge1xuICAgIGZvckVhY2hQYXJhbSh0aGlzLnBhdGhFbGVtZW50cywgZnVuY3Rpb24ocGF0aEVsZW1lbnQsIHBhcmFtTmFtZSwgcGF0aEVsZW1lbnRJbmRleCwgcGFyYW1JbmRleCwgcGF0aEVsZW1lbnRzKSB7XG4gICAgICB2YXIgdHJhbnNmb3JtZWQgPSB0cmFuc2Zvcm1GbmMocGF0aEVsZW1lbnQsIHBhcmFtTmFtZSwgcGF0aEVsZW1lbnRJbmRleCwgcGFyYW1JbmRleCwgcGF0aEVsZW1lbnRzKTtcbiAgICAgIGlmKHRyYW5zZm9ybWVkIHx8IHRyYW5zZm9ybWVkID09PSAwKSB7XG4gICAgICAgIHBhdGhFbGVtZW50W3BhcmFtTmFtZV0gPSB0cmFuc2Zvcm1lZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNsb25lcyBhIHdob2xlIHBhdGggb2JqZWN0IHdpdGggYWxsIGl0cyBwcm9wZXJ0aWVzLiBUaGlzIGlzIGEgZGVlcCBjbG9uZSBhbmQgcGF0aCBlbGVtZW50IG9iamVjdHMgd2lsbCBhbHNvIGJlIGNsb25lZC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2Nsb3NlXSBPcHRpb25hbCBvcHRpb24gdG8gc2V0IHRoZSBuZXcgY2xvbmVkIHBhdGggdG8gY2xvc2VkLiBJZiBub3Qgc3BlY2lmaWVkIG9yIGZhbHNlLCB0aGUgb3JpZ2luYWwgcGF0aCBjbG9zZSBvcHRpb24gd2lsbCBiZSB1c2VkLlxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH1cbiAgICovXG4gIGZ1bmN0aW9uIGNsb25lKGNsb3NlKSB7XG4gICAgdmFyIGMgPSBuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoY2xvc2UgfHwgdGhpcy5jbG9zZSk7XG4gICAgYy5wb3MgPSB0aGlzLnBvcztcbiAgICBjLnBhdGhFbGVtZW50cyA9IHRoaXMucGF0aEVsZW1lbnRzLnNsaWNlKCkubWFwKGZ1bmN0aW9uIGNsb25lRWxlbWVudHMocGF0aEVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBDaGFydGlzdC5leHRlbmQoe30sIHBhdGhFbGVtZW50KTtcbiAgICB9KTtcbiAgICBjLm9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIHRoaXMub3B0aW9ucyk7XG4gICAgcmV0dXJuIGM7XG4gIH1cblxuICAvKipcbiAgICogU3BsaXQgYSBTdmcuUGF0aCBvYmplY3QgYnkgYSBzcGVjaWZpYyBjb21tYW5kIGluIHRoZSBwYXRoIGNoYWluLiBUaGUgcGF0aCBjaGFpbiB3aWxsIGJlIHNwbGl0IGFuZCBhbiBhcnJheSBvZiBuZXdseSBjcmVhdGVkIHBhdGhzIG9iamVjdHMgd2lsbCBiZSByZXR1cm5lZC4gVGhpcyBpcyB1c2VmdWwgaWYgeW91J2QgbGlrZSB0byBzcGxpdCBhbiBTVkcgcGF0aCBieSBpdCdzIG1vdmUgY29tbWFuZHMsIGZvciBleGFtcGxlLCBpbiBvcmRlciB0byBpc29sYXRlIGNodW5rcyBvZiBkcmF3aW5ncy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb21tYW5kIFRoZSBjb21tYW5kIHlvdSdkIGxpa2UgdG8gdXNlIHRvIHNwbGl0IHRoZSBwYXRoXG4gICAqIEByZXR1cm4ge0FycmF5PENoYXJ0aXN0LlN2Zy5QYXRoPn1cbiAgICovXG4gIGZ1bmN0aW9uIHNwbGl0QnlDb21tYW5kKGNvbW1hbmQpIHtcbiAgICB2YXIgc3BsaXQgPSBbXG4gICAgICBuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoKVxuICAgIF07XG5cbiAgICB0aGlzLnBhdGhFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBhdGhFbGVtZW50KSB7XG4gICAgICBpZihwYXRoRWxlbWVudC5jb21tYW5kID09PSBjb21tYW5kLnRvVXBwZXJDYXNlKCkgJiYgc3BsaXRbc3BsaXQubGVuZ3RoIC0gMV0ucGF0aEVsZW1lbnRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBzcGxpdC5wdXNoKG5ldyBDaGFydGlzdC5TdmcuUGF0aCgpKTtcbiAgICAgIH1cblxuICAgICAgc3BsaXRbc3BsaXQubGVuZ3RoIC0gMV0ucGF0aEVsZW1lbnRzLnB1c2gocGF0aEVsZW1lbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNwbGl0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgc3RhdGljIGZ1bmN0aW9uIG9uIGBDaGFydGlzdC5TdmcuUGF0aGAgaXMgam9pbmluZyBtdWx0aXBsZSBwYXRocyB0b2dldGhlciBpbnRvIG9uZSBwYXRocy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7QXJyYXk8Q2hhcnRpc3QuU3ZnLlBhdGg+fSBwYXRocyBBIGxpc3Qgb2YgcGF0aHMgdG8gYmUgam9pbmVkIHRvZ2V0aGVyLiBUaGUgb3JkZXIgaXMgaW1wb3J0YW50LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNsb3NlIElmIHRoZSBuZXdseSBjcmVhdGVkIHBhdGggc2hvdWxkIGJlIGEgY2xvc2VkIHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgUGF0aCBvcHRpb25zIGZvciB0aGUgbmV3bHkgY3JlYXRlZCBwYXRoLlxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH1cbiAgICovXG5cbiAgZnVuY3Rpb24gam9pbihwYXRocywgY2xvc2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgam9pbmVkUGF0aCA9IG5ldyBDaGFydGlzdC5TdmcuUGF0aChjbG9zZSwgb3B0aW9ucyk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGF0aCA9IHBhdGhzW2ldO1xuICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHBhdGgucGF0aEVsZW1lbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGpvaW5lZFBhdGgucGF0aEVsZW1lbnRzLnB1c2gocGF0aC5wYXRoRWxlbWVudHNbal0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gam9pbmVkUGF0aDtcbiAgfVxuXG4gIENoYXJ0aXN0LlN2Zy5QYXRoID0gQ2hhcnRpc3QuQ2xhc3MuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogU3ZnUGF0aCxcbiAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgcmVtb3ZlOiByZW1vdmUsXG4gICAgbW92ZTogbW92ZSxcbiAgICBsaW5lOiBsaW5lLFxuICAgIGN1cnZlOiBjdXJ2ZSxcbiAgICBhcmM6IGFyYyxcbiAgICBzY2FsZTogc2NhbGUsXG4gICAgdHJhbnNsYXRlOiB0cmFuc2xhdGUsXG4gICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgcGFyc2U6IHBhcnNlLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5LFxuICAgIGNsb25lOiBjbG9uZSxcbiAgICBzcGxpdEJ5Q29tbWFuZDogc3BsaXRCeUNvbW1hbmRcbiAgfSk7XG5cbiAgQ2hhcnRpc3QuU3ZnLlBhdGguZWxlbWVudERlc2NyaXB0aW9ucyA9IGVsZW1lbnREZXNjcmlwdGlvbnM7XG4gIENoYXJ0aXN0LlN2Zy5QYXRoLmpvaW4gPSBqb2luO1xufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIGF4aXNVbml0cyA9IHtcbiAgICB4OiB7XG4gICAgICBwb3M6ICd4JyxcbiAgICAgIGxlbjogJ3dpZHRoJyxcbiAgICAgIGRpcjogJ2hvcml6b250YWwnLFxuICAgICAgcmVjdFN0YXJ0OiAneDEnLFxuICAgICAgcmVjdEVuZDogJ3gyJyxcbiAgICAgIHJlY3RPZmZzZXQ6ICd5MidcbiAgICB9LFxuICAgIHk6IHtcbiAgICAgIHBvczogJ3knLFxuICAgICAgbGVuOiAnaGVpZ2h0JyxcbiAgICAgIGRpcjogJ3ZlcnRpY2FsJyxcbiAgICAgIHJlY3RTdGFydDogJ3kyJyxcbiAgICAgIHJlY3RFbmQ6ICd5MScsXG4gICAgICByZWN0T2Zmc2V0OiAneDEnXG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIEF4aXModW5pdHMsIGNoYXJ0UmVjdCwgdGlja3MsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnVuaXRzID0gdW5pdHM7XG4gICAgdGhpcy5jb3VudGVyVW5pdHMgPSB1bml0cyA9PT0gYXhpc1VuaXRzLnggPyBheGlzVW5pdHMueSA6IGF4aXNVbml0cy54O1xuICAgIHRoaXMuY2hhcnRSZWN0ID0gY2hhcnRSZWN0O1xuICAgIHRoaXMuYXhpc0xlbmd0aCA9IGNoYXJ0UmVjdFt1bml0cy5yZWN0RW5kXSAtIGNoYXJ0UmVjdFt1bml0cy5yZWN0U3RhcnRdO1xuICAgIHRoaXMuZ3JpZE9mZnNldCA9IGNoYXJ0UmVjdFt1bml0cy5yZWN0T2Zmc2V0XTtcbiAgICB0aGlzLnRpY2tzID0gdGlja3M7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUdyaWRBbmRMYWJlbHMoZ3JpZEdyb3VwLCBsYWJlbEdyb3VwLCB1c2VGb3JlaWduT2JqZWN0LCBjaGFydE9wdGlvbnMsIGV2ZW50RW1pdHRlcikge1xuICAgIHZhciBheGlzT3B0aW9ucyA9IGNoYXJ0T3B0aW9uc1snYXhpcycgKyB0aGlzLnVuaXRzLnBvcy50b1VwcGVyQ2FzZSgpXTtcbiAgICB2YXIgcHJvamVjdGVkVmFsdWVzID0gdGhpcy50aWNrcy5tYXAodGhpcy5wcm9qZWN0VmFsdWUuYmluZCh0aGlzKSk7XG4gICAgdmFyIGxhYmVsVmFsdWVzID0gdGhpcy50aWNrcy5tYXAoYXhpc09wdGlvbnMubGFiZWxJbnRlcnBvbGF0aW9uRm5jKTtcblxuICAgIHByb2plY3RlZFZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHByb2plY3RlZFZhbHVlLCBpbmRleCkge1xuICAgICAgdmFyIGxhYmVsT2Zmc2V0ID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgICB9O1xuXG4gICAgICAvLyBUT0RPOiBGaW5kIGJldHRlciBzb2x1dGlvbiBmb3Igc29sdmluZyB0aGlzIHByb2JsZW1cbiAgICAgIC8vIENhbGN1bGF0ZSBob3cgbXVjaCBzcGFjZSB3ZSBoYXZlIGF2YWlsYWJsZSBmb3IgdGhlIGxhYmVsXG4gICAgICB2YXIgbGFiZWxMZW5ndGg7XG4gICAgICBpZihwcm9qZWN0ZWRWYWx1ZXNbaW5kZXggKyAxXSkge1xuICAgICAgICAvLyBJZiB3ZSBzdGlsbCBoYXZlIG9uZSBsYWJlbCBhaGVhZCwgd2UgY2FuIGNhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgdG8gdGhlIG5leHQgdGljayAvIGxhYmVsXG4gICAgICAgIGxhYmVsTGVuZ3RoID0gcHJvamVjdGVkVmFsdWVzW2luZGV4ICsgMV0gLSBwcm9qZWN0ZWRWYWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBsYWJlbCBhaGVhZCBhbmQgd2UgaGF2ZSBvbmx5IHR3byBsYWJlbHMgaW4gdG90YWwsIHdlIGp1c3QgdGFrZSB0aGUgcmVtYWluaW5nIGRpc3RhbmNlIHRvXG4gICAgICAgIC8vIG9uIHRoZSB3aG9sZSBheGlzIGxlbmd0aC4gV2UgbGltaXQgdGhhdCB0byBhIG1pbmltdW0gb2YgMzAgcGl4ZWwsIHNvIHRoYXQgbGFiZWxzIGNsb3NlIHRvIHRoZSBib3JkZXIgd2lsbFxuICAgICAgICAvLyBzdGlsbCBiZSB2aXNpYmxlIGluc2lkZSBvZiB0aGUgY2hhcnQgcGFkZGluZy5cbiAgICAgICAgbGFiZWxMZW5ndGggPSBNYXRoLm1heCh0aGlzLmF4aXNMZW5ndGggLSBwcm9qZWN0ZWRWYWx1ZSwgMzApO1xuICAgICAgfVxuXG4gICAgICAvLyBTa2lwIGdyaWQgbGluZXMgYW5kIGxhYmVscyB3aGVyZSBpbnRlcnBvbGF0ZWQgbGFiZWwgdmFsdWVzIGFyZSBmYWxzZXkgKGV4ZWNwdCBmb3IgMClcbiAgICAgIGlmKCFsYWJlbFZhbHVlc1tpbmRleF0gJiYgbGFiZWxWYWx1ZXNbaW5kZXhdICE9PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVHJhbnNmb3JtIHRvIGdsb2JhbCBjb29yZGluYXRlcyB1c2luZyB0aGUgY2hhcnRSZWN0XG4gICAgICAvLyBXZSBhbHNvIG5lZWQgdG8gc2V0IHRoZSBsYWJlbCBvZmZzZXQgZm9yIHRoZSBjcmVhdGVMYWJlbCBmdW5jdGlvblxuICAgICAgaWYodGhpcy51bml0cy5wb3MgPT09ICd4Jykge1xuICAgICAgICBwcm9qZWN0ZWRWYWx1ZSA9IHRoaXMuY2hhcnRSZWN0LngxICsgcHJvamVjdGVkVmFsdWU7XG4gICAgICAgIGxhYmVsT2Zmc2V0LnggPSBjaGFydE9wdGlvbnMuYXhpc1gubGFiZWxPZmZzZXQueDtcblxuICAgICAgICAvLyBJZiB0aGUgbGFiZWxzIHNob3VsZCBiZSBwb3NpdGlvbmVkIGluIHN0YXJ0IHBvc2l0aW9uICh0b3Agc2lkZSBmb3IgdmVydGljYWwgYXhpcykgd2UgbmVlZCB0byBzZXQgYVxuICAgICAgICAvLyBkaWZmZXJlbnQgb2Zmc2V0IGFzIGZvciBwb3NpdGlvbmVkIHdpdGggZW5kIChib3R0b20pXG4gICAgICAgIGlmKGNoYXJ0T3B0aW9ucy5heGlzWC5wb3NpdGlvbiA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICAgIGxhYmVsT2Zmc2V0LnkgPSB0aGlzLmNoYXJ0UmVjdC5wYWRkaW5nLnRvcCArIGNoYXJ0T3B0aW9ucy5heGlzWC5sYWJlbE9mZnNldC55ICsgKHVzZUZvcmVpZ25PYmplY3QgPyA1IDogMjApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxhYmVsT2Zmc2V0LnkgPSB0aGlzLmNoYXJ0UmVjdC55MSArIGNoYXJ0T3B0aW9ucy5heGlzWC5sYWJlbE9mZnNldC55ICsgKHVzZUZvcmVpZ25PYmplY3QgPyA1IDogMjApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9qZWN0ZWRWYWx1ZSA9IHRoaXMuY2hhcnRSZWN0LnkxIC0gcHJvamVjdGVkVmFsdWU7XG4gICAgICAgIGxhYmVsT2Zmc2V0LnkgPSBjaGFydE9wdGlvbnMuYXhpc1kubGFiZWxPZmZzZXQueSAtICh1c2VGb3JlaWduT2JqZWN0ID8gbGFiZWxMZW5ndGggOiAwKTtcblxuICAgICAgICAvLyBJZiB0aGUgbGFiZWxzIHNob3VsZCBiZSBwb3NpdGlvbmVkIGluIHN0YXJ0IHBvc2l0aW9uIChsZWZ0IHNpZGUgZm9yIGhvcml6b250YWwgYXhpcykgd2UgbmVlZCB0byBzZXQgYVxuICAgICAgICAvLyBkaWZmZXJlbnQgb2Zmc2V0IGFzIGZvciBwb3NpdGlvbmVkIHdpdGggZW5kIChyaWdodCBzaWRlKVxuICAgICAgICBpZihjaGFydE9wdGlvbnMuYXhpc1kucG9zaXRpb24gPT09ICdzdGFydCcpIHtcbiAgICAgICAgICBsYWJlbE9mZnNldC54ID0gdXNlRm9yZWlnbk9iamVjdCA/IHRoaXMuY2hhcnRSZWN0LnBhZGRpbmcubGVmdCArIGNoYXJ0T3B0aW9ucy5heGlzWS5sYWJlbE9mZnNldC54IDogdGhpcy5jaGFydFJlY3QueDEgLSAxMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsYWJlbE9mZnNldC54ID0gdGhpcy5jaGFydFJlY3QueDIgKyBjaGFydE9wdGlvbnMuYXhpc1kubGFiZWxPZmZzZXQueCArIDEwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGF4aXNPcHRpb25zLnNob3dHcmlkKSB7XG4gICAgICAgIENoYXJ0aXN0LmNyZWF0ZUdyaWQocHJvamVjdGVkVmFsdWUsIGluZGV4LCB0aGlzLCB0aGlzLmdyaWRPZmZzZXQsIHRoaXMuY2hhcnRSZWN0W3RoaXMuY291bnRlclVuaXRzLmxlbl0oKSwgZ3JpZEdyb3VwLCBbXG4gICAgICAgICAgY2hhcnRPcHRpb25zLmNsYXNzTmFtZXMuZ3JpZCxcbiAgICAgICAgICBjaGFydE9wdGlvbnMuY2xhc3NOYW1lc1t0aGlzLnVuaXRzLmRpcl1cbiAgICAgICAgXSwgZXZlbnRFbWl0dGVyKTtcbiAgICAgIH1cblxuICAgICAgaWYoYXhpc09wdGlvbnMuc2hvd0xhYmVsKSB7XG4gICAgICAgIENoYXJ0aXN0LmNyZWF0ZUxhYmVsKHByb2plY3RlZFZhbHVlLCBsYWJlbExlbmd0aCwgaW5kZXgsIGxhYmVsVmFsdWVzLCB0aGlzLCBheGlzT3B0aW9ucy5vZmZzZXQsIGxhYmVsT2Zmc2V0LCBsYWJlbEdyb3VwLCBbXG4gICAgICAgICAgY2hhcnRPcHRpb25zLmNsYXNzTmFtZXMubGFiZWwsXG4gICAgICAgICAgY2hhcnRPcHRpb25zLmNsYXNzTmFtZXNbdGhpcy51bml0cy5kaXJdLFxuICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jbGFzc05hbWVzW2F4aXNPcHRpb25zLnBvc2l0aW9uXVxuICAgICAgICBdLCB1c2VGb3JlaWduT2JqZWN0LCBldmVudEVtaXR0ZXIpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gIH1cblxuICBDaGFydGlzdC5BeGlzID0gQ2hhcnRpc3QuQ2xhc3MuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogQXhpcyxcbiAgICBjcmVhdGVHcmlkQW5kTGFiZWxzOiBjcmVhdGVHcmlkQW5kTGFiZWxzLFxuICAgIHByb2plY3RWYWx1ZTogZnVuY3Rpb24odmFsdWUsIGluZGV4LCBkYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jhc2UgYXhpcyBjYW5cXCd0IGJlIGluc3RhbnRpYXRlZCEnKTtcbiAgICB9XG4gIH0pO1xuXG4gIENoYXJ0aXN0LkF4aXMudW5pdHMgPSBheGlzVW5pdHM7XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIFRoZSBhdXRvIHNjYWxlIGF4aXMgdXNlcyBzdGFuZGFyZCBsaW5lYXIgc2NhbGUgcHJvamVjdGlvbiBvZiB2YWx1ZXMgYWxvbmcgYW4gYXhpcy4gSXQgdXNlcyBvcmRlciBvZiBtYWduaXR1ZGUgdG8gZmluZCBhIHNjYWxlIGF1dG9tYXRpY2FsbHkgYW5kIGV2YWx1YXRlcyB0aGUgYXZhaWxhYmxlIHNwYWNlIGluIG9yZGVyIHRvIGZpbmQgdGhlIHBlcmZlY3QgYW1vdW50IG9mIHRpY2tzIGZvciB5b3VyIGNoYXJ0LlxuICogKipPcHRpb25zKipcbiAqIFRoZSBmb2xsb3dpbmcgb3B0aW9ucyBhcmUgdXNlZCBieSB0aGlzIGF4aXMgaW4gYWRkaXRpb24gdG8gdGhlIGRlZmF1bHQgYXhpcyBvcHRpb25zIG91dGxpbmVkIGluIHRoZSBheGlzIGNvbmZpZ3VyYXRpb24gb2YgdGhlIGNoYXJ0IGRlZmF1bHQgc2V0dGluZ3MuXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgb3B0aW9ucyA9IHtcbiAqICAgLy8gSWYgaGlnaCBpcyBzcGVjaWZpZWQgdGhlbiB0aGUgYXhpcyB3aWxsIGRpc3BsYXkgdmFsdWVzIGV4cGxpY2l0bHkgdXAgdG8gdGhpcyB2YWx1ZSBhbmQgdGhlIGNvbXB1dGVkIG1heGltdW0gZnJvbSB0aGUgZGF0YSBpcyBpZ25vcmVkXG4gKiAgIGhpZ2g6IDEwMCxcbiAqICAgLy8gSWYgbG93IGlzIHNwZWNpZmllZCB0aGVuIHRoZSBheGlzIHdpbGwgZGlzcGxheSB2YWx1ZXMgZXhwbGljaXRseSBkb3duIHRvIHRoaXMgdmFsdWUgYW5kIHRoZSBjb21wdXRlZCBtaW5pbXVtIGZyb20gdGhlIGRhdGEgaXMgaWdub3JlZFxuICogICBsb3c6IDAsXG4gKiAgIC8vIFRoaXMgb3B0aW9uIHdpbGwgYmUgdXNlZCB3aGVuIGZpbmRpbmcgdGhlIHJpZ2h0IHNjYWxlIGRpdmlzaW9uIHNldHRpbmdzLiBUaGUgYW1vdW50IG9mIHRpY2tzIG9uIHRoZSBzY2FsZSB3aWxsIGJlIGRldGVybWluZWQgc28gdGhhdCBhcyBtYW55IHRpY2tzIGFzIHBvc3NpYmxlIHdpbGwgYmUgZGlzcGxheWVkLCB3aGlsZSBub3QgdmlvbGF0aW5nIHRoaXMgbWluaW11bSByZXF1aXJlZCBzcGFjZSAoaW4gcGl4ZWwpLlxuICogICBzY2FsZU1pblNwYWNlOiAyMCxcbiAqICAgLy8gQ2FuIGJlIHNldCB0byB0cnVlIG9yIGZhbHNlLiBJZiBzZXQgdG8gdHJ1ZSwgdGhlIHNjYWxlIHdpbGwgYmUgZ2VuZXJhdGVkIHdpdGggd2hvbGUgbnVtYmVycyBvbmx5LlxuICogICBvbmx5SW50ZWdlcjogdHJ1ZSxcbiAqICAgLy8gVGhlIHJlZmVyZW5jZSB2YWx1ZSBjYW4gYmUgdXNlZCB0byBtYWtlIHN1cmUgdGhhdCB0aGlzIHZhbHVlIHdpbGwgYWx3YXlzIGJlIG9uIHRoZSBjaGFydC4gVGhpcyBpcyBlc3BlY2lhbGx5IHVzZWZ1bCBvbiBiaXBvbGFyIGNoYXJ0cyB3aGVyZSB0aGUgYmlwb2xhciBjZW50ZXIgYWx3YXlzIG5lZWRzIHRvIGJlIHBhcnQgb2YgdGhlIGNoYXJ0LlxuICogICByZWZlcmVuY2VWYWx1ZTogNVxuICogfTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuQXV0b1NjYWxlQXhpc1xuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGZ1bmN0aW9uIEF1dG9TY2FsZUF4aXMoYXhpc1VuaXQsIGRhdGEsIGNoYXJ0UmVjdCwgb3B0aW9ucykge1xuICAgIC8vIFVzdWFsbHkgd2UgY2FsY3VsYXRlIGhpZ2hMb3cgYmFzZWQgb24gdGhlIGRhdGEgYnV0IHRoaXMgY2FuIGJlIG92ZXJyaWRlbiBieSBhIGhpZ2hMb3cgb2JqZWN0IGluIHRoZSBvcHRpb25zXG4gICAgdmFyIGhpZ2hMb3cgPSBvcHRpb25zLmhpZ2hMb3cgfHwgQ2hhcnRpc3QuZ2V0SGlnaExvdyhkYXRhLm5vcm1hbGl6ZWQsIG9wdGlvbnMsIGF4aXNVbml0LnBvcyk7XG4gICAgdGhpcy5ib3VuZHMgPSBDaGFydGlzdC5nZXRCb3VuZHMoY2hhcnRSZWN0W2F4aXNVbml0LnJlY3RFbmRdIC0gY2hhcnRSZWN0W2F4aXNVbml0LnJlY3RTdGFydF0sIGhpZ2hMb3csIG9wdGlvbnMuc2NhbGVNaW5TcGFjZSB8fCAyMCwgb3B0aW9ucy5vbmx5SW50ZWdlcik7XG4gICAgdGhpcy5yYW5nZSA9IHtcbiAgICAgIG1pbjogdGhpcy5ib3VuZHMubWluLFxuICAgICAgbWF4OiB0aGlzLmJvdW5kcy5tYXhcbiAgICB9O1xuXG4gICAgQ2hhcnRpc3QuQXV0b1NjYWxlQXhpcy5zdXBlci5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsXG4gICAgICBheGlzVW5pdCxcbiAgICAgIGNoYXJ0UmVjdCxcbiAgICAgIHRoaXMuYm91bmRzLnZhbHVlcyxcbiAgICAgIG9wdGlvbnMpO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvamVjdFZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuYXhpc0xlbmd0aCAqICgrQ2hhcnRpc3QuZ2V0TXVsdGlWYWx1ZSh2YWx1ZSwgdGhpcy51bml0cy5wb3MpIC0gdGhpcy5ib3VuZHMubWluKSAvIHRoaXMuYm91bmRzLnJhbmdlO1xuICB9XG5cbiAgQ2hhcnRpc3QuQXV0b1NjYWxlQXhpcyA9IENoYXJ0aXN0LkF4aXMuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogQXV0b1NjYWxlQXhpcyxcbiAgICBwcm9qZWN0VmFsdWU6IHByb2plY3RWYWx1ZVxuICB9KTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogVGhlIGZpeGVkIHNjYWxlIGF4aXMgdXNlcyBzdGFuZGFyZCBsaW5lYXIgcHJvamVjdGlvbiBvZiB2YWx1ZXMgYWxvbmcgYW4gYXhpcy4gSXQgbWFrZXMgdXNlIG9mIGEgZGl2aXNvciBvcHRpb24gdG8gZGl2aWRlIHRoZSByYW5nZSBwcm92aWRlZCBmcm9tIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHZhbHVlIG9yIHRoZSBvcHRpb25zIGhpZ2ggYW5kIGxvdyB0aGF0IHdpbGwgb3ZlcnJpZGUgdGhlIGNvbXB1dGVkIG1pbmltdW0gYW5kIG1heGltdW0uXG4gKiAqKk9wdGlvbnMqKlxuICogVGhlIGZvbGxvd2luZyBvcHRpb25zIGFyZSB1c2VkIGJ5IHRoaXMgYXhpcyBpbiBhZGRpdGlvbiB0byB0aGUgZGVmYXVsdCBheGlzIG9wdGlvbnMgb3V0bGluZWQgaW4gdGhlIGF4aXMgY29uZmlndXJhdGlvbiBvZiB0aGUgY2hhcnQgZGVmYXVsdCBzZXR0aW5ncy5cbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBvcHRpb25zID0ge1xuICogICAvLyBJZiBoaWdoIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBheGlzIHdpbGwgZGlzcGxheSB2YWx1ZXMgZXhwbGljaXRseSB1cCB0byB0aGlzIHZhbHVlIGFuZCB0aGUgY29tcHV0ZWQgbWF4aW11bSBmcm9tIHRoZSBkYXRhIGlzIGlnbm9yZWRcbiAqICAgaGlnaDogMTAwLFxuICogICAvLyBJZiBsb3cgaXMgc3BlY2lmaWVkIHRoZW4gdGhlIGF4aXMgd2lsbCBkaXNwbGF5IHZhbHVlcyBleHBsaWNpdGx5IGRvd24gdG8gdGhpcyB2YWx1ZSBhbmQgdGhlIGNvbXB1dGVkIG1pbmltdW0gZnJvbSB0aGUgZGF0YSBpcyBpZ25vcmVkXG4gKiAgIGxvdzogMCxcbiAqICAgLy8gSWYgc3BlY2lmaWVkIHRoZW4gdGhlIHZhbHVlIHJhbmdlIGRldGVybWluZWQgZnJvbSBtaW5pbXVtIHRvIG1heGltdW0gKG9yIGxvdyBhbmQgaGlnaCkgd2lsbCBiZSBkaXZpZGVkIGJ5IHRoaXMgbnVtYmVyIGFuZCB0aWNrcyB3aWxsIGJlIGdlbmVyYXRlZCBhdCB0aG9zZSBkaXZpc2lvbiBwb2ludHMuIFRoZSBkZWZhdWx0IGRpdmlzb3IgaXMgMS5cbiAqICAgZGl2aXNvcjogNCxcbiAqICAgLy8gSWYgdGlja3MgaXMgZXhwbGljaXRseSBzZXQsIHRoZW4gdGhlIGF4aXMgd2lsbCBub3QgY29tcHV0ZSB0aGUgdGlja3Mgd2l0aCB0aGUgZGl2aXNvciwgYnV0IGRpcmVjdGx5IHVzZSB0aGUgZGF0YSBpbiB0aWNrcyB0byBkZXRlcm1pbmUgYXQgd2hhdCBwb2ludHMgb24gdGhlIGF4aXMgYSB0aWNrIG5lZWQgdG8gYmUgZ2VuZXJhdGVkLlxuICogICB0aWNrczogWzEsIDEwLCAyMCwgMzBdXG4gKiB9O1xuICogYGBgXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5GaXhlZFNjYWxlQXhpc1xuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGZ1bmN0aW9uIEZpeGVkU2NhbGVBeGlzKGF4aXNVbml0LCBkYXRhLCBjaGFydFJlY3QsIG9wdGlvbnMpIHtcbiAgICB2YXIgaGlnaExvdyA9IG9wdGlvbnMuaGlnaExvdyB8fCBDaGFydGlzdC5nZXRIaWdoTG93KGRhdGEubm9ybWFsaXplZCwgb3B0aW9ucywgYXhpc1VuaXQucG9zKTtcbiAgICB0aGlzLmRpdmlzb3IgPSBvcHRpb25zLmRpdmlzb3IgfHwgMTtcbiAgICB0aGlzLnRpY2tzID0gb3B0aW9ucy50aWNrcyB8fCBDaGFydGlzdC50aW1lcyh0aGlzLmRpdmlzb3IpLm1hcChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBoaWdoTG93LmxvdyArIChoaWdoTG93LmhpZ2ggLSBoaWdoTG93LmxvdykgLyB0aGlzLmRpdmlzb3IgKiBpbmRleDtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMudGlja3Muc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYSAtIGI7XG4gICAgfSk7XG4gICAgdGhpcy5yYW5nZSA9IHtcbiAgICAgIG1pbjogaGlnaExvdy5sb3csXG4gICAgICBtYXg6IGhpZ2hMb3cuaGlnaFxuICAgIH07XG5cbiAgICBDaGFydGlzdC5GaXhlZFNjYWxlQXhpcy5zdXBlci5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsXG4gICAgICBheGlzVW5pdCxcbiAgICAgIGNoYXJ0UmVjdCxcbiAgICAgIHRoaXMudGlja3MsXG4gICAgICBvcHRpb25zKTtcblxuICAgIHRoaXMuc3RlcExlbmd0aCA9IHRoaXMuYXhpc0xlbmd0aCAvIHRoaXMuZGl2aXNvcjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb2plY3RWYWx1ZSh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmF4aXNMZW5ndGggKiAoK0NoYXJ0aXN0LmdldE11bHRpVmFsdWUodmFsdWUsIHRoaXMudW5pdHMucG9zKSAtIHRoaXMucmFuZ2UubWluKSAvICh0aGlzLnJhbmdlLm1heCAtIHRoaXMucmFuZ2UubWluKTtcbiAgfVxuXG4gIENoYXJ0aXN0LkZpeGVkU2NhbGVBeGlzID0gQ2hhcnRpc3QuQXhpcy5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBGaXhlZFNjYWxlQXhpcyxcbiAgICBwcm9qZWN0VmFsdWU6IHByb2plY3RWYWx1ZVxuICB9KTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogVGhlIHN0ZXAgYXhpcyBmb3Igc3RlcCBiYXNlZCBjaGFydHMgbGlrZSBiYXIgY2hhcnQgb3Igc3RlcCBiYXNlZCBsaW5lIGNoYXJ0cy4gSXQgdXNlcyBhIGZpeGVkIGFtb3VudCBvZiB0aWNrcyB0aGF0IHdpbGwgYmUgZXF1YWxseSBkaXN0cmlidXRlZCBhY3Jvc3MgdGhlIHdob2xlIGF4aXMgbGVuZ3RoLiBUaGUgcHJvamVjdGlvbiBpcyBkb25lIHVzaW5nIHRoZSBpbmRleCBvZiB0aGUgZGF0YSB2YWx1ZSByYXRoZXIgdGhhbiB0aGUgdmFsdWUgaXRzZWxmIGFuZCB0aGVyZWZvcmUgaXQncyBvbmx5IHVzZWZ1bCBmb3IgZGlzdHJpYnV0aW9uIHB1cnBvc2UuXG4gKiAqKk9wdGlvbnMqKlxuICogVGhlIGZvbGxvd2luZyBvcHRpb25zIGFyZSB1c2VkIGJ5IHRoaXMgYXhpcyBpbiBhZGRpdGlvbiB0byB0aGUgZGVmYXVsdCBheGlzIG9wdGlvbnMgb3V0bGluZWQgaW4gdGhlIGF4aXMgY29uZmlndXJhdGlvbiBvZiB0aGUgY2hhcnQgZGVmYXVsdCBzZXR0aW5ncy5cbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBvcHRpb25zID0ge1xuICogICAvLyBUaWNrcyB0byBiZSB1c2VkIHRvIGRpc3RyaWJ1dGUgYWNyb3NzIHRoZSBheGlzIGxlbmd0aC4gQXMgdGhpcyBheGlzIHR5cGUgcmVsaWVzIG9uIHRoZSBpbmRleCBvZiB0aGUgdmFsdWUgcmF0aGVyIHRoYW4gdGhlIHZhbHVlLCBhcmJpdHJhcnkgZGF0YSB0aGF0IGNhbiBiZSBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgY2FuIGJlIHVzZWQgYXMgdGlja3MuXG4gKiAgIHRpY2tzOiBbJ09uZScsICdUd28nLCAnVGhyZWUnXSxcbiAqICAgLy8gSWYgc2V0IHRvIHRydWUgdGhlIGZ1bGwgd2lkdGggd2lsbCBiZSB1c2VkIHRvIGRpc3RyaWJ1dGUgdGhlIHZhbHVlcyB3aGVyZSB0aGUgbGFzdCB2YWx1ZSB3aWxsIGJlIGF0IHRoZSBtYXhpbXVtIG9mIHRoZSBheGlzIGxlbmd0aC4gSWYgZmFsc2UgdGhlIHNwYWNlcyBiZXR3ZWVuIHRoZSB0aWNrcyB3aWxsIGJlIGV2ZW5seSBkaXN0cmlidXRlZCBpbnN0ZWFkLlxuICogICBzdHJldGNoOiB0cnVlXG4gKiB9O1xuICogYGBgXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5TdGVwQXhpc1xuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGZ1bmN0aW9uIFN0ZXBBeGlzKGF4aXNVbml0LCBkYXRhLCBjaGFydFJlY3QsIG9wdGlvbnMpIHtcbiAgICBDaGFydGlzdC5TdGVwQXhpcy5zdXBlci5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsXG4gICAgICBheGlzVW5pdCxcbiAgICAgIGNoYXJ0UmVjdCxcbiAgICAgIG9wdGlvbnMudGlja3MsXG4gICAgICBvcHRpb25zKTtcblxuICAgIHRoaXMuc3RlcExlbmd0aCA9IHRoaXMuYXhpc0xlbmd0aCAvIChvcHRpb25zLnRpY2tzLmxlbmd0aCAtIChvcHRpb25zLnN0cmV0Y2ggPyAxIDogMCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvamVjdFZhbHVlKHZhbHVlLCBpbmRleCkge1xuICAgIHJldHVybiB0aGlzLnN0ZXBMZW5ndGggKiBpbmRleDtcbiAgfVxuXG4gIENoYXJ0aXN0LlN0ZXBBeGlzID0gQ2hhcnRpc3QuQXhpcy5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBTdGVwQXhpcyxcbiAgICBwcm9qZWN0VmFsdWU6IHByb2plY3RWYWx1ZVxuICB9KTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogVGhlIENoYXJ0aXN0IGxpbmUgY2hhcnQgY2FuIGJlIHVzZWQgdG8gZHJhdyBMaW5lIG9yIFNjYXR0ZXIgY2hhcnRzLiBJZiB1c2VkIGluIHRoZSBicm93c2VyIHlvdSBjYW4gYWNjZXNzIHRoZSBnbG9iYWwgYENoYXJ0aXN0YCBuYW1lc3BhY2Ugd2hlcmUgeW91IGZpbmQgdGhlIGBMaW5lYCBmdW5jdGlvbiBhcyBhIG1haW4gZW50cnkgcG9pbnQuXG4gKlxuICogRm9yIGV4YW1wbGVzIG9uIGhvdyB0byB1c2UgdGhlIGxpbmUgY2hhcnQgcGxlYXNlIGNoZWNrIHRoZSBleGFtcGxlcyBvZiB0aGUgYENoYXJ0aXN0LkxpbmVgIG1ldGhvZC5cbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LkxpbmVcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3Qpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucyBpbiBsaW5lIGNoYXJ0cy4gRXhwYW5kIHRoZSBjb2RlIHZpZXcgdG8gc2VlIGEgZGV0YWlsZWQgbGlzdCBvZiBvcHRpb25zIHdpdGggY29tbWVudHMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5MaW5lXG4gICAqL1xuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgLy8gT3B0aW9ucyBmb3IgWC1BeGlzXG4gICAgYXhpc1g6IHtcbiAgICAgIC8vIFRoZSBvZmZzZXQgb2YgdGhlIGxhYmVscyB0byB0aGUgY2hhcnQgYXJlYVxuICAgICAgb2Zmc2V0OiAzMCxcbiAgICAgIC8vIFBvc2l0aW9uIHdoZXJlIGxhYmVscyBhcmUgcGxhY2VkLiBDYW4gYmUgc2V0IHRvIGBzdGFydGAgb3IgYGVuZGAgd2hlcmUgYHN0YXJ0YCBpcyBlcXVpdmFsZW50IHRvIGxlZnQgb3IgdG9wIG9uIHZlcnRpY2FsIGF4aXMgYW5kIGBlbmRgIGlzIGVxdWl2YWxlbnQgdG8gcmlnaHQgb3IgYm90dG9tIG9uIGhvcml6b250YWwgYXhpcy5cbiAgICAgIHBvc2l0aW9uOiAnZW5kJyxcbiAgICAgIC8vIEFsbG93cyB5b3UgdG8gY29ycmVjdCBsYWJlbCBwb3NpdGlvbmluZyBvbiB0aGlzIGF4aXMgYnkgcG9zaXRpdmUgb3IgbmVnYXRpdmUgeCBhbmQgeSBvZmZzZXQuXG4gICAgICBsYWJlbE9mZnNldDoge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAgLy8gSWYgbGFiZWxzIHNob3VsZCBiZSBzaG93biBvciBub3RcbiAgICAgIHNob3dMYWJlbDogdHJ1ZSxcbiAgICAgIC8vIElmIHRoZSBheGlzIGdyaWQgc2hvdWxkIGJlIGRyYXduIG9yIG5vdFxuICAgICAgc2hvd0dyaWQ6IHRydWUsXG4gICAgICAvLyBJbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIHlvdSB0byBpbnRlcmNlcHQgdGhlIHZhbHVlIGZyb20gdGhlIGF4aXMgbGFiZWxcbiAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogQ2hhcnRpc3Qubm9vcCxcbiAgICAgIC8vIFNldCB0aGUgYXhpcyB0eXBlIHRvIGJlIHVzZWQgdG8gcHJvamVjdCB2YWx1ZXMgb24gdGhpcyBheGlzLiBJZiBub3QgZGVmaW5lZCwgQ2hhcnRpc3QuU3RlcEF4aXMgd2lsbCBiZSB1c2VkIGZvciB0aGUgWC1BeGlzLCB3aGVyZSB0aGUgdGlja3Mgb3B0aW9uIHdpbGwgYmUgc2V0IHRvIHRoZSBsYWJlbHMgaW4gdGhlIGRhdGEgYW5kIHRoZSBzdHJldGNoIG9wdGlvbiB3aWxsIGJlIHNldCB0byB0aGUgZ2xvYmFsIGZ1bGxXaWR0aCBvcHRpb24uIFRoaXMgdHlwZSBjYW4gYmUgY2hhbmdlZCB0byBhbnkgYXhpcyBjb25zdHJ1Y3RvciBhdmFpbGFibGUgKGUuZy4gQ2hhcnRpc3QuRml4ZWRTY2FsZUF4aXMpLCB3aGVyZSBhbGwgYXhpcyBvcHRpb25zIHNob3VsZCBiZSBwcmVzZW50IGhlcmUuXG4gICAgICB0eXBlOiB1bmRlZmluZWRcbiAgICB9LFxuICAgIC8vIE9wdGlvbnMgZm9yIFktQXhpc1xuICAgIGF4aXNZOiB7XG4gICAgICAvLyBUaGUgb2Zmc2V0IG9mIHRoZSBsYWJlbHMgdG8gdGhlIGNoYXJ0IGFyZWFcbiAgICAgIG9mZnNldDogNDAsXG4gICAgICAvLyBQb3NpdGlvbiB3aGVyZSBsYWJlbHMgYXJlIHBsYWNlZC4gQ2FuIGJlIHNldCB0byBgc3RhcnRgIG9yIGBlbmRgIHdoZXJlIGBzdGFydGAgaXMgZXF1aXZhbGVudCB0byBsZWZ0IG9yIHRvcCBvbiB2ZXJ0aWNhbCBheGlzIGFuZCBgZW5kYCBpcyBlcXVpdmFsZW50IHRvIHJpZ2h0IG9yIGJvdHRvbSBvbiBob3Jpem9udGFsIGF4aXMuXG4gICAgICBwb3NpdGlvbjogJ3N0YXJ0JyxcbiAgICAgIC8vIEFsbG93cyB5b3UgdG8gY29ycmVjdCBsYWJlbCBwb3NpdGlvbmluZyBvbiB0aGlzIGF4aXMgYnkgcG9zaXRpdmUgb3IgbmVnYXRpdmUgeCBhbmQgeSBvZmZzZXQuXG4gICAgICBsYWJlbE9mZnNldDoge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAgLy8gSWYgbGFiZWxzIHNob3VsZCBiZSBzaG93biBvciBub3RcbiAgICAgIHNob3dMYWJlbDogdHJ1ZSxcbiAgICAgIC8vIElmIHRoZSBheGlzIGdyaWQgc2hvdWxkIGJlIGRyYXduIG9yIG5vdFxuICAgICAgc2hvd0dyaWQ6IHRydWUsXG4gICAgICAvLyBJbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIHlvdSB0byBpbnRlcmNlcHQgdGhlIHZhbHVlIGZyb20gdGhlIGF4aXMgbGFiZWxcbiAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogQ2hhcnRpc3Qubm9vcCxcbiAgICAgIC8vIFNldCB0aGUgYXhpcyB0eXBlIHRvIGJlIHVzZWQgdG8gcHJvamVjdCB2YWx1ZXMgb24gdGhpcyBheGlzLiBJZiBub3QgZGVmaW5lZCwgQ2hhcnRpc3QuQXV0b1NjYWxlQXhpcyB3aWxsIGJlIHVzZWQgZm9yIHRoZSBZLUF4aXMsIHdoZXJlIHRoZSBoaWdoIGFuZCBsb3cgb3B0aW9ucyB3aWxsIGJlIHNldCB0byB0aGUgZ2xvYmFsIGhpZ2ggYW5kIGxvdyBvcHRpb25zLiBUaGlzIHR5cGUgY2FuIGJlIGNoYW5nZWQgdG8gYW55IGF4aXMgY29uc3RydWN0b3IgYXZhaWxhYmxlIChlLmcuIENoYXJ0aXN0LkZpeGVkU2NhbGVBeGlzKSwgd2hlcmUgYWxsIGF4aXMgb3B0aW9ucyBzaG91bGQgYmUgcHJlc2VudCBoZXJlLlxuICAgICAgdHlwZTogdW5kZWZpbmVkLFxuICAgICAgLy8gVGhpcyB2YWx1ZSBzcGVjaWZpZXMgdGhlIG1pbmltdW0gaGVpZ2h0IGluIHBpeGVsIG9mIHRoZSBzY2FsZSBzdGVwc1xuICAgICAgc2NhbGVNaW5TcGFjZTogMjAsXG4gICAgICAvLyBVc2Ugb25seSBpbnRlZ2VyIHZhbHVlcyAod2hvbGUgbnVtYmVycykgZm9yIHRoZSBzY2FsZSBzdGVwc1xuICAgICAgb25seUludGVnZXI6IGZhbHNlXG4gICAgfSxcbiAgICAvLyBTcGVjaWZ5IGEgZml4ZWQgd2lkdGggZm9yIHRoZSBjaGFydCBhcyBhIHN0cmluZyAoaS5lLiAnMTAwcHgnIG9yICc1MCUnKVxuICAgIHdpZHRoOiB1bmRlZmluZWQsXG4gICAgLy8gU3BlY2lmeSBhIGZpeGVkIGhlaWdodCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgaGVpZ2h0OiB1bmRlZmluZWQsXG4gICAgLy8gSWYgdGhlIGxpbmUgc2hvdWxkIGJlIGRyYXduIG9yIG5vdFxuICAgIHNob3dMaW5lOiB0cnVlLFxuICAgIC8vIElmIGRvdHMgc2hvdWxkIGJlIGRyYXduIG9yIG5vdFxuICAgIHNob3dQb2ludDogdHJ1ZSxcbiAgICAvLyBJZiB0aGUgbGluZSBjaGFydCBzaG91bGQgZHJhdyBhbiBhcmVhXG4gICAgc2hvd0FyZWE6IGZhbHNlLFxuICAgIC8vIFRoZSBiYXNlIGZvciB0aGUgYXJlYSBjaGFydCB0aGF0IHdpbGwgYmUgdXNlZCB0byBjbG9zZSB0aGUgYXJlYSBzaGFwZSAoaXMgbm9ybWFsbHkgMClcbiAgICBhcmVhQmFzZTogMCxcbiAgICAvLyBTcGVjaWZ5IGlmIHRoZSBsaW5lcyBzaG91bGQgYmUgc21vb3RoZWQuIFRoaXMgdmFsdWUgY2FuIGJlIHRydWUgb3IgZmFsc2Ugd2hlcmUgdHJ1ZSB3aWxsIHJlc3VsdCBpbiBzbW9vdGhpbmcgdXNpbmcgdGhlIGRlZmF1bHQgc21vb3RoaW5nIGludGVycG9sYXRpb24gZnVuY3Rpb24gQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5jYXJkaW5hbCBhbmQgZmFsc2UgcmVzdWx0cyBpbiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLm5vbmUuIFlvdSBjYW4gYWxzbyBjaG9vc2Ugb3RoZXIgc21vb3RoaW5nIC8gaW50ZXJwb2xhdGlvbiBmdW5jdGlvbnMgYXZhaWxhYmxlIGluIHRoZSBDaGFydGlzdC5JbnRlcnBvbGF0aW9uIG1vZHVsZSwgb3Igd3JpdGUgeW91ciBvd24gaW50ZXJwb2xhdGlvbiBmdW5jdGlvbi4gQ2hlY2sgdGhlIGV4YW1wbGVzIGZvciBhIGJyaWVmIGRlc2NyaXB0aW9uLlxuICAgIGxpbmVTbW9vdGg6IHRydWUsXG4gICAgLy8gT3ZlcnJpZGluZyB0aGUgbmF0dXJhbCBsb3cgb2YgdGhlIGNoYXJ0IGFsbG93cyB5b3UgdG8gem9vbSBpbiBvciBsaW1pdCB0aGUgY2hhcnRzIGxvd2VzdCBkaXNwbGF5ZWQgdmFsdWVcbiAgICBsb3c6IHVuZGVmaW5lZCxcbiAgICAvLyBPdmVycmlkaW5nIHRoZSBuYXR1cmFsIGhpZ2ggb2YgdGhlIGNoYXJ0IGFsbG93cyB5b3UgdG8gem9vbSBpbiBvciBsaW1pdCB0aGUgY2hhcnRzIGhpZ2hlc3QgZGlzcGxheWVkIHZhbHVlXG4gICAgaGlnaDogdW5kZWZpbmVkLFxuICAgIC8vIFBhZGRpbmcgb2YgdGhlIGNoYXJ0IGRyYXdpbmcgYXJlYSB0byB0aGUgY29udGFpbmVyIGVsZW1lbnQgYW5kIGxhYmVscyBhcyBhIG51bWJlciBvciBwYWRkaW5nIG9iamVjdCB7dG9wOiA1LCByaWdodDogNSwgYm90dG9tOiA1LCBsZWZ0OiA1fVxuICAgIGNoYXJ0UGFkZGluZzoge1xuICAgICAgdG9wOiAxNSxcbiAgICAgIHJpZ2h0OiAxNSxcbiAgICAgIGJvdHRvbTogNSxcbiAgICAgIGxlZnQ6IDEwXG4gICAgfSxcbiAgICAvLyBXaGVuIHNldCB0byB0cnVlLCB0aGUgbGFzdCBncmlkIGxpbmUgb24gdGhlIHgtYXhpcyBpcyBub3QgZHJhd24gYW5kIHRoZSBjaGFydCBlbGVtZW50cyB3aWxsIGV4cGFuZCB0byB0aGUgZnVsbCBhdmFpbGFibGUgd2lkdGggb2YgdGhlIGNoYXJ0LiBGb3IgdGhlIGxhc3QgbGFiZWwgdG8gYmUgZHJhd24gY29ycmVjdGx5IHlvdSBtaWdodCBuZWVkIHRvIGFkZCBjaGFydCBwYWRkaW5nIG9yIG9mZnNldCB0aGUgbGFzdCBsYWJlbCB3aXRoIGEgZHJhdyBldmVudCBoYW5kbGVyLlxuICAgIGZ1bGxXaWR0aDogZmFsc2UsXG4gICAgLy8gSWYgdHJ1ZSB0aGUgd2hvbGUgZGF0YSBpcyByZXZlcnNlZCBpbmNsdWRpbmcgbGFiZWxzLCB0aGUgc2VyaWVzIG9yZGVyIGFzIHdlbGwgYXMgdGhlIHdob2xlIHNlcmllcyBkYXRhIGFycmF5cy5cbiAgICByZXZlcnNlRGF0YTogZmFsc2UsXG4gICAgLy8gT3ZlcnJpZGUgdGhlIGNsYXNzIG5hbWVzIHRoYXQgZ2V0IHVzZWQgdG8gZ2VuZXJhdGUgdGhlIFNWRyBzdHJ1Y3R1cmUgb2YgdGhlIGNoYXJ0XG4gICAgY2xhc3NOYW1lczoge1xuICAgICAgY2hhcnQ6ICdjdC1jaGFydC1saW5lJyxcbiAgICAgIGxhYmVsOiAnY3QtbGFiZWwnLFxuICAgICAgbGFiZWxHcm91cDogJ2N0LWxhYmVscycsXG4gICAgICBzZXJpZXM6ICdjdC1zZXJpZXMnLFxuICAgICAgbGluZTogJ2N0LWxpbmUnLFxuICAgICAgcG9pbnQ6ICdjdC1wb2ludCcsXG4gICAgICBhcmVhOiAnY3QtYXJlYScsXG4gICAgICBncmlkOiAnY3QtZ3JpZCcsXG4gICAgICBncmlkR3JvdXA6ICdjdC1ncmlkcycsXG4gICAgICB2ZXJ0aWNhbDogJ2N0LXZlcnRpY2FsJyxcbiAgICAgIGhvcml6b250YWw6ICdjdC1ob3Jpem9udGFsJyxcbiAgICAgIHN0YXJ0OiAnY3Qtc3RhcnQnLFxuICAgICAgZW5kOiAnY3QtZW5kJ1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBjaGFydFxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQ2hhcnQob3B0aW9ucykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgcmF3OiB0aGlzLmRhdGEsXG4gICAgICBub3JtYWxpemVkOiBDaGFydGlzdC5nZXREYXRhQXJyYXkodGhpcy5kYXRhLCBvcHRpb25zLnJldmVyc2VEYXRhLCB0cnVlKVxuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgbmV3IHN2ZyBvYmplY3RcbiAgICB0aGlzLnN2ZyA9IENoYXJ0aXN0LmNyZWF0ZVN2Zyh0aGlzLmNvbnRhaW5lciwgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQsIG9wdGlvbnMuY2xhc3NOYW1lcy5jaGFydCk7XG4gICAgLy8gQ3JlYXRlIGdyb3VwcyBmb3IgbGFiZWxzLCBncmlkIGFuZCBzZXJpZXNcbiAgICB2YXIgZ3JpZEdyb3VwID0gdGhpcy5zdmcuZWxlbSgnZycpLmFkZENsYXNzKG9wdGlvbnMuY2xhc3NOYW1lcy5ncmlkR3JvdXApO1xuICAgIHZhciBzZXJpZXNHcm91cCA9IHRoaXMuc3ZnLmVsZW0oJ2cnKTtcbiAgICB2YXIgbGFiZWxHcm91cCA9IHRoaXMuc3ZnLmVsZW0oJ2cnKS5hZGRDbGFzcyhvcHRpb25zLmNsYXNzTmFtZXMubGFiZWxHcm91cCk7XG5cbiAgICB2YXIgY2hhcnRSZWN0ID0gQ2hhcnRpc3QuY3JlYXRlQ2hhcnRSZWN0KHRoaXMuc3ZnLCBvcHRpb25zLCBkZWZhdWx0T3B0aW9ucy5wYWRkaW5nKTtcbiAgICB2YXIgYXhpc1gsIGF4aXNZO1xuXG4gICAgaWYob3B0aW9ucy5heGlzWC50eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGF4aXNYID0gbmV3IENoYXJ0aXN0LlN0ZXBBeGlzKENoYXJ0aXN0LkF4aXMudW5pdHMueCwgZGF0YSwgY2hhcnRSZWN0LCBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMuYXhpc1gsIHtcbiAgICAgICAgdGlja3M6IGRhdGEucmF3LmxhYmVscyxcbiAgICAgICAgc3RyZXRjaDogb3B0aW9ucy5mdWxsV2lkdGhcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXhpc1ggPSBvcHRpb25zLmF4aXNYLnR5cGUuY2FsbChDaGFydGlzdCwgQ2hhcnRpc3QuQXhpcy51bml0cy54LCBkYXRhLCBjaGFydFJlY3QsIG9wdGlvbnMuYXhpc1gpO1xuICAgIH1cblxuICAgIGlmKG9wdGlvbnMuYXhpc1kudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBheGlzWSA9IG5ldyBDaGFydGlzdC5BdXRvU2NhbGVBeGlzKENoYXJ0aXN0LkF4aXMudW5pdHMueSwgZGF0YSwgY2hhcnRSZWN0LCBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMuYXhpc1ksIHtcbiAgICAgICAgaGlnaDogQ2hhcnRpc3QuaXNOdW0ob3B0aW9ucy5oaWdoKSA/IG9wdGlvbnMuaGlnaCA6IG9wdGlvbnMuYXhpc1kuaGlnaCxcbiAgICAgICAgbG93OiBDaGFydGlzdC5pc051bShvcHRpb25zLmxvdykgPyBvcHRpb25zLmxvdyA6IG9wdGlvbnMuYXhpc1kubG93XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF4aXNZID0gb3B0aW9ucy5heGlzWS50eXBlLmNhbGwoQ2hhcnRpc3QsIENoYXJ0aXN0LkF4aXMudW5pdHMueSwgZGF0YSwgY2hhcnRSZWN0LCBvcHRpb25zLmF4aXNZKTtcbiAgICB9XG5cbiAgICBheGlzWC5jcmVhdGVHcmlkQW5kTGFiZWxzKGdyaWRHcm91cCwgbGFiZWxHcm91cCwgdGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QsIG9wdGlvbnMsIHRoaXMuZXZlbnRFbWl0dGVyKTtcbiAgICBheGlzWS5jcmVhdGVHcmlkQW5kTGFiZWxzKGdyaWRHcm91cCwgbGFiZWxHcm91cCwgdGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QsIG9wdGlvbnMsIHRoaXMuZXZlbnRFbWl0dGVyKTtcblxuICAgIC8vIERyYXcgdGhlIHNlcmllc1xuICAgIGRhdGEucmF3LnNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uKHNlcmllcywgc2VyaWVzSW5kZXgpIHtcbiAgICAgIHZhciBzZXJpZXNFbGVtZW50ID0gc2VyaWVzR3JvdXAuZWxlbSgnZycpO1xuXG4gICAgICAvLyBXcml0ZSBhdHRyaWJ1dGVzIHRvIHNlcmllcyBncm91cCBlbGVtZW50LiBJZiBzZXJpZXMgbmFtZSBvciBtZXRhIGlzIHVuZGVmaW5lZCB0aGUgYXR0cmlidXRlcyB3aWxsIG5vdCBiZSB3cml0dGVuXG4gICAgICBzZXJpZXNFbGVtZW50LmF0dHIoe1xuICAgICAgICAnc2VyaWVzLW5hbWUnOiBzZXJpZXMubmFtZSxcbiAgICAgICAgJ21ldGEnOiBDaGFydGlzdC5zZXJpYWxpemUoc2VyaWVzLm1ldGEpXG4gICAgICB9LCBDaGFydGlzdC54bWxOcy51cmkpO1xuXG4gICAgICAvLyBVc2Ugc2VyaWVzIGNsYXNzIGZyb20gc2VyaWVzIGRhdGEgb3IgaWYgbm90IHNldCBnZW5lcmF0ZSBvbmVcbiAgICAgIHNlcmllc0VsZW1lbnQuYWRkQ2xhc3MoW1xuICAgICAgICBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzLFxuICAgICAgICAoc2VyaWVzLmNsYXNzTmFtZSB8fCBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzICsgJy0nICsgQ2hhcnRpc3QuYWxwaGFOdW1lcmF0ZShzZXJpZXNJbmRleCkpXG4gICAgICBdLmpvaW4oJyAnKSk7XG5cbiAgICAgIHZhciBwYXRoQ29vcmRpbmF0ZXMgPSBbXSxcbiAgICAgICAgcGF0aERhdGEgPSBbXTtcblxuICAgICAgZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCB2YWx1ZUluZGV4KSB7XG4gICAgICAgIHZhciBwID0ge1xuICAgICAgICAgIHg6IGNoYXJ0UmVjdC54MSArIGF4aXNYLnByb2plY3RWYWx1ZSh2YWx1ZSwgdmFsdWVJbmRleCwgZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XSksXG4gICAgICAgICAgeTogY2hhcnRSZWN0LnkxIC0gYXhpc1kucHJvamVjdFZhbHVlKHZhbHVlLCB2YWx1ZUluZGV4LCBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdKVxuICAgICAgICB9O1xuICAgICAgICBwYXRoQ29vcmRpbmF0ZXMucHVzaChwLngsIHAueSk7XG4gICAgICAgIHBhdGhEYXRhLnB1c2goe1xuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICB2YWx1ZUluZGV4OiB2YWx1ZUluZGV4LFxuICAgICAgICAgIG1ldGE6IENoYXJ0aXN0LmdldE1ldGFEYXRhKHNlcmllcywgdmFsdWVJbmRleClcbiAgICAgICAgfSk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICB2YXIgc2VyaWVzT3B0aW9ucyA9IHtcbiAgICAgICAgbGluZVNtb290aDogQ2hhcnRpc3QuZ2V0U2VyaWVzT3B0aW9uKHNlcmllcywgb3B0aW9ucywgJ2xpbmVTbW9vdGgnKSxcbiAgICAgICAgc2hvd1BvaW50OiBDaGFydGlzdC5nZXRTZXJpZXNPcHRpb24oc2VyaWVzLCBvcHRpb25zLCAnc2hvd1BvaW50JyksXG4gICAgICAgIHNob3dMaW5lOiBDaGFydGlzdC5nZXRTZXJpZXNPcHRpb24oc2VyaWVzLCBvcHRpb25zLCAnc2hvd0xpbmUnKSxcbiAgICAgICAgc2hvd0FyZWE6IENoYXJ0aXN0LmdldFNlcmllc09wdGlvbihzZXJpZXMsIG9wdGlvbnMsICdzaG93QXJlYScpLFxuICAgICAgICBhcmVhQmFzZTogQ2hhcnRpc3QuZ2V0U2VyaWVzT3B0aW9uKHNlcmllcywgb3B0aW9ucywgJ2FyZWFCYXNlJylcbiAgICAgIH07XG5cbiAgICAgIHZhciBzbW9vdGhpbmcgPSB0eXBlb2Ygc2VyaWVzT3B0aW9ucy5saW5lU21vb3RoID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgc2VyaWVzT3B0aW9ucy5saW5lU21vb3RoIDogKHNlcmllc09wdGlvbnMubGluZVNtb290aCA/IENoYXJ0aXN0LkludGVycG9sYXRpb24uY2FyZGluYWwoKSA6IENoYXJ0aXN0LkludGVycG9sYXRpb24ubm9uZSgpKTtcbiAgICAgIC8vIEludGVycG9sYXRpbmcgcGF0aCB3aGVyZSBwYXRoRGF0YSB3aWxsIGJlIHVzZWQgdG8gYW5ub3RhdGUgZWFjaCBwYXRoIGVsZW1lbnQgc28gd2UgY2FuIHRyYWNlIGJhY2sgdGhlIG9yaWdpbmFsXG4gICAgICAvLyBpbmRleCwgdmFsdWUgYW5kIG1ldGEgZGF0YVxuICAgICAgdmFyIHBhdGggPSBzbW9vdGhpbmcocGF0aENvb3JkaW5hdGVzLCBwYXRoRGF0YSk7XG5cbiAgICAgIC8vIElmIHdlIHNob3VsZCBzaG93IHBvaW50cyB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGVtIG5vdyB0byBhdm9pZCBzZWNvbmRhcnkgbG9vcFxuICAgICAgLy8gUG9pbnRzIGFyZSBkcmF3biBmcm9tIHRoZSBwYXRoRWxlbWVudHMgcmV0dXJuZWQgYnkgdGhlIGludGVycG9sYXRpb24gZnVuY3Rpb25cbiAgICAgIC8vIFNtYWxsIG9mZnNldCBmb3IgRmlyZWZveCB0byByZW5kZXIgc3F1YXJlcyBjb3JyZWN0bHlcbiAgICAgIGlmIChzZXJpZXNPcHRpb25zLnNob3dQb2ludCkge1xuXG4gICAgICAgIHBhdGgucGF0aEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24ocGF0aEVsZW1lbnQpIHtcbiAgICAgICAgICB2YXIgcG9pbnQgPSBzZXJpZXNFbGVtZW50LmVsZW0oJ2xpbmUnLCB7XG4gICAgICAgICAgICB4MTogcGF0aEVsZW1lbnQueCxcbiAgICAgICAgICAgIHkxOiBwYXRoRWxlbWVudC55LFxuICAgICAgICAgICAgeDI6IHBhdGhFbGVtZW50LnggKyAwLjAxLFxuICAgICAgICAgICAgeTI6IHBhdGhFbGVtZW50LnlcbiAgICAgICAgICB9LCBvcHRpb25zLmNsYXNzTmFtZXMucG9pbnQpLmF0dHIoe1xuICAgICAgICAgICAgJ3ZhbHVlJzogW3BhdGhFbGVtZW50LmRhdGEudmFsdWUueCwgcGF0aEVsZW1lbnQuZGF0YS52YWx1ZS55XS5maWx0ZXIoZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgICB9KS5qb2luKCcsJyksXG4gICAgICAgICAgICAnbWV0YSc6IHBhdGhFbGVtZW50LmRhdGEubWV0YVxuICAgICAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG5cbiAgICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdkcmF3Jywge1xuICAgICAgICAgICAgdHlwZTogJ3BvaW50JyxcbiAgICAgICAgICAgIHZhbHVlOiBwYXRoRWxlbWVudC5kYXRhLnZhbHVlLFxuICAgICAgICAgICAgaW5kZXg6IHBhdGhFbGVtZW50LmRhdGEudmFsdWVJbmRleCxcbiAgICAgICAgICAgIG1ldGE6IHBhdGhFbGVtZW50LmRhdGEubWV0YSxcbiAgICAgICAgICAgIHNlcmllczogc2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzSW5kZXg6IHNlcmllc0luZGV4LFxuICAgICAgICAgICAgYXhpc1g6IGF4aXNYLFxuICAgICAgICAgICAgYXhpc1k6IGF4aXNZLFxuICAgICAgICAgICAgZ3JvdXA6IHNlcmllc0VsZW1lbnQsXG4gICAgICAgICAgICBlbGVtZW50OiBwb2ludCxcbiAgICAgICAgICAgIHg6IHBhdGhFbGVtZW50LngsXG4gICAgICAgICAgICB5OiBwYXRoRWxlbWVudC55XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICB9XG5cbiAgICAgIGlmKHNlcmllc09wdGlvbnMuc2hvd0xpbmUpIHtcbiAgICAgICAgdmFyIGxpbmUgPSBzZXJpZXNFbGVtZW50LmVsZW0oJ3BhdGgnLCB7XG4gICAgICAgICAgZDogcGF0aC5zdHJpbmdpZnkoKVxuICAgICAgICB9LCBvcHRpb25zLmNsYXNzTmFtZXMubGluZSwgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsIHtcbiAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgdmFsdWVzOiBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdLFxuICAgICAgICAgIHBhdGg6IHBhdGguY2xvbmUoKSxcbiAgICAgICAgICBjaGFydFJlY3Q6IGNoYXJ0UmVjdCxcbiAgICAgICAgICBpbmRleDogc2VyaWVzSW5kZXgsXG4gICAgICAgICAgc2VyaWVzOiBzZXJpZXMsXG4gICAgICAgICAgc2VyaWVzSW5kZXg6IHNlcmllc0luZGV4LFxuICAgICAgICAgIGF4aXNYOiBheGlzWCxcbiAgICAgICAgICBheGlzWTogYXhpc1ksXG4gICAgICAgICAgZ3JvdXA6IHNlcmllc0VsZW1lbnQsXG4gICAgICAgICAgZWxlbWVudDogbGluZVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQXJlYSBjdXJyZW50bHkgb25seSB3b3JrcyB3aXRoIGF4ZXMgdGhhdCBzdXBwb3J0IGEgcmFuZ2UhXG4gICAgICBpZihzZXJpZXNPcHRpb25zLnNob3dBcmVhICYmIGF4aXNZLnJhbmdlKSB7XG4gICAgICAgIC8vIElmIGFyZWFCYXNlIGlzIG91dHNpZGUgdGhlIGNoYXJ0IGFyZWEgKDwgbWluIG9yID4gbWF4KSB3ZSBuZWVkIHRvIHNldCBpdCByZXNwZWN0aXZlbHkgc28gdGhhdFxuICAgICAgICAvLyB0aGUgYXJlYSBpcyBub3QgZHJhd24gb3V0c2lkZSB0aGUgY2hhcnQgYXJlYS5cbiAgICAgICAgdmFyIGFyZWFCYXNlID0gTWF0aC5tYXgoTWF0aC5taW4oc2VyaWVzT3B0aW9ucy5hcmVhQmFzZSwgYXhpc1kucmFuZ2UubWF4KSwgYXhpc1kucmFuZ2UubWluKTtcblxuICAgICAgICAvLyBXZSBwcm9qZWN0IHRoZSBhcmVhQmFzZSB2YWx1ZSBpbnRvIHNjcmVlbiBjb29yZGluYXRlc1xuICAgICAgICB2YXIgYXJlYUJhc2VQcm9qZWN0ZWQgPSBjaGFydFJlY3QueTEgLSBheGlzWS5wcm9qZWN0VmFsdWUoYXJlYUJhc2UpO1xuXG4gICAgICAgIC8vIEluIG9yZGVyIHRvIGZvcm0gdGhlIGFyZWEgd2UnbGwgZmlyc3Qgc3BsaXQgdGhlIHBhdGggYnkgbW92ZSBjb21tYW5kcyBzbyB3ZSBjYW4gY2h1bmsgaXQgdXAgaW50byBzZWdtZW50c1xuICAgICAgICBwYXRoLnNwbGl0QnlDb21tYW5kKCdNJykuZmlsdGVyKGZ1bmN0aW9uIG9ubHlTb2xpZFNlZ21lbnRzKHBhdGhTZWdtZW50KSB7XG4gICAgICAgICAgLy8gV2UgZmlsdGVyIG9ubHkgXCJzb2xpZFwiIHNlZ21lbnRzIHRoYXQgY29udGFpbiBtb3JlIHRoYW4gb25lIHBvaW50LiBPdGhlcndpc2UgdGhlcmUncyBubyBuZWVkIGZvciBhbiBhcmVhXG4gICAgICAgICAgcmV0dXJuIHBhdGhTZWdtZW50LnBhdGhFbGVtZW50cy5sZW5ndGggPiAxO1xuICAgICAgICB9KS5tYXAoZnVuY3Rpb24gY29udmVydFRvQXJlYShzb2xpZFBhdGhTZWdtZW50cykge1xuICAgICAgICAgIC8vIFJlY2VpdmluZyB0aGUgZmlsdGVyZWQgc29saWQgcGF0aCBzZWdtZW50cyB3ZSBjYW4gbm93IGNvbnZlcnQgdGhvc2Ugc2VnbWVudHMgaW50byBmaWxsIGFyZWFzXG4gICAgICAgICAgdmFyIGZpcnN0RWxlbWVudCA9IHNvbGlkUGF0aFNlZ21lbnRzLnBhdGhFbGVtZW50c1swXTtcbiAgICAgICAgICB2YXIgbGFzdEVsZW1lbnQgPSBzb2xpZFBhdGhTZWdtZW50cy5wYXRoRWxlbWVudHNbc29saWRQYXRoU2VnbWVudHMucGF0aEVsZW1lbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgICAgLy8gQ2xvbmluZyB0aGUgc29saWQgcGF0aCBzZWdtZW50IHdpdGggY2xvc2luZyBvcHRpb24gYW5kIHJlbW92aW5nIHRoZSBmaXJzdCBtb3ZlIGNvbW1hbmQgZnJvbSB0aGUgY2xvbmVcbiAgICAgICAgICAvLyBXZSB0aGVuIGluc2VydCBhIG5ldyBtb3ZlIHRoYXQgc2hvdWxkIHN0YXJ0IGF0IHRoZSBhcmVhIGJhc2UgYW5kIGRyYXcgYSBzdHJhaWdodCBsaW5lIHVwIG9yIGRvd25cbiAgICAgICAgICAvLyBhdCB0aGUgZW5kIG9mIHRoZSBwYXRoIHdlIGFkZCBhbiBhZGRpdGlvbmFsIHN0cmFpZ2h0IGxpbmUgdG8gdGhlIHByb2plY3RlZCBhcmVhIGJhc2UgdmFsdWVcbiAgICAgICAgICAvLyBBcyB0aGUgY2xvc2luZyBvcHRpb24gaXMgc2V0IG91ciBwYXRoIHdpbGwgYmUgYXV0b21hdGljYWxseSBjbG9zZWRcbiAgICAgICAgICByZXR1cm4gc29saWRQYXRoU2VnbWVudHMuY2xvbmUodHJ1ZSlcbiAgICAgICAgICAgIC5wb3NpdGlvbigwKVxuICAgICAgICAgICAgLnJlbW92ZSgxKVxuICAgICAgICAgICAgLm1vdmUoZmlyc3RFbGVtZW50LngsIGFyZWFCYXNlUHJvamVjdGVkKVxuICAgICAgICAgICAgLmxpbmUoZmlyc3RFbGVtZW50LngsIGZpcnN0RWxlbWVudC55KVxuICAgICAgICAgICAgLnBvc2l0aW9uKHNvbGlkUGF0aFNlZ21lbnRzLnBhdGhFbGVtZW50cy5sZW5ndGggKyAxKVxuICAgICAgICAgICAgLmxpbmUobGFzdEVsZW1lbnQueCwgYXJlYUJhc2VQcm9qZWN0ZWQpO1xuXG4gICAgICAgIH0pLmZvckVhY2goZnVuY3Rpb24gY3JlYXRlQXJlYShhcmVhUGF0aCkge1xuICAgICAgICAgIC8vIEZvciBlYWNoIG9mIG91ciBuZXdseSBjcmVhdGVkIGFyZWEgcGF0aHMsIHdlJ2xsIG5vdyBjcmVhdGUgcGF0aCBlbGVtZW50cyBieSBzdHJpbmdpZnlpbmcgb3VyIHBhdGggb2JqZWN0c1xuICAgICAgICAgIC8vIGFuZCBhZGRpbmcgdGhlIGNyZWF0ZWQgRE9NIGVsZW1lbnRzIHRvIHRoZSBjb3JyZWN0IHNlcmllcyBncm91cFxuICAgICAgICAgIHZhciBhcmVhID0gc2VyaWVzRWxlbWVudC5lbGVtKCdwYXRoJywge1xuICAgICAgICAgICAgZDogYXJlYVBhdGguc3RyaW5naWZ5KClcbiAgICAgICAgICB9LCBvcHRpb25zLmNsYXNzTmFtZXMuYXJlYSwgdHJ1ZSkuYXR0cih7XG4gICAgICAgICAgICAndmFsdWVzJzogZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XVxuICAgICAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG5cbiAgICAgICAgICAvLyBFbWl0IGFuIGV2ZW50IGZvciBlYWNoIGFyZWEgdGhhdCB3YXMgZHJhd25cbiAgICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdkcmF3Jywge1xuICAgICAgICAgICAgdHlwZTogJ2FyZWEnLFxuICAgICAgICAgICAgdmFsdWVzOiBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdLFxuICAgICAgICAgICAgcGF0aDogYXJlYVBhdGguY2xvbmUoKSxcbiAgICAgICAgICAgIHNlcmllczogc2VyaWVzLFxuICAgICAgICAgICAgc2VyaWVzSW5kZXg6IHNlcmllc0luZGV4LFxuICAgICAgICAgICAgYXhpc1g6IGF4aXNYLFxuICAgICAgICAgICAgYXhpc1k6IGF4aXNZLFxuICAgICAgICAgICAgY2hhcnRSZWN0OiBjaGFydFJlY3QsXG4gICAgICAgICAgICBpbmRleDogc2VyaWVzSW5kZXgsXG4gICAgICAgICAgICBncm91cDogc2VyaWVzRWxlbWVudCxcbiAgICAgICAgICAgIGVsZW1lbnQ6IGFyZWFcbiAgICAgICAgICB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnY3JlYXRlZCcsIHtcbiAgICAgIGJvdW5kczogYXhpc1kuYm91bmRzLFxuICAgICAgY2hhcnRSZWN0OiBjaGFydFJlY3QsXG4gICAgICBheGlzWDogYXhpc1gsXG4gICAgICBheGlzWTogYXhpc1ksXG4gICAgICBzdmc6IHRoaXMuc3ZnLFxuICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgbGluZSBjaGFydC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkxpbmVcbiAgICogQHBhcmFtIHtTdHJpbmd8Tm9kZX0gcXVlcnkgQSBzZWxlY3RvciBxdWVyeSBzdHJpbmcgb3IgZGlyZWN0bHkgYSBET00gZWxlbWVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YSBvYmplY3QgdGhhdCBuZWVkcyB0byBjb25zaXN0IG9mIGEgbGFiZWxzIGFuZCBhIHNlcmllcyBhcnJheVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdCB3aXRoIG9wdGlvbnMgdGhhdCBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zLiBDaGVjayB0aGUgZXhhbXBsZXMgZm9yIGEgZGV0YWlsZWQgbGlzdC5cbiAgICogQHBhcmFtIHtBcnJheX0gW3Jlc3BvbnNpdmVPcHRpb25zXSBTcGVjaWZ5IGFuIGFycmF5IG9mIHJlc3BvbnNpdmUgb3B0aW9uIGFycmF5cyB3aGljaCBhcmUgYSBtZWRpYSBxdWVyeSBhbmQgb3B0aW9ucyBvYmplY3QgcGFpciA9PiBbW21lZGlhUXVlcnlTdHJpbmcsIG9wdGlvbnNPYmplY3RdLFttb3JlLi4uXV1cbiAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3Qgd2hpY2ggZXhwb3NlcyB0aGUgQVBJIGZvciB0aGUgY3JlYXRlZCBjaGFydFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBDcmVhdGUgYSBzaW1wbGUgbGluZSBjaGFydFxuICAgKiB2YXIgZGF0YSA9IHtcbiAgICogICAvLyBBIGxhYmVscyBhcnJheSB0aGF0IGNhbiBjb250YWluIGFueSBzb3J0IG9mIHZhbHVlc1xuICAgKiAgIGxhYmVsczogWydNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJ10sXG4gICAqICAgLy8gT3VyIHNlcmllcyBhcnJheSB0aGF0IGNvbnRhaW5zIHNlcmllcyBvYmplY3RzIG9yIGluIHRoaXMgY2FzZSBzZXJpZXMgZGF0YSBhcnJheXNcbiAgICogICBzZXJpZXM6IFtcbiAgICogICAgIFs1LCAyLCA0LCAyLCAwXVxuICAgKiAgIF1cbiAgICogfTtcbiAgICpcbiAgICogLy8gQXMgb3B0aW9ucyB3ZSBjdXJyZW50bHkgb25seSBzZXQgYSBzdGF0aWMgc2l6ZSBvZiAzMDB4MjAwIHB4XG4gICAqIHZhciBvcHRpb25zID0ge1xuICAgKiAgIHdpZHRoOiAnMzAwcHgnLFxuICAgKiAgIGhlaWdodDogJzIwMHB4J1xuICAgKiB9O1xuICAgKlxuICAgKiAvLyBJbiB0aGUgZ2xvYmFsIG5hbWUgc3BhY2UgQ2hhcnRpc3Qgd2UgY2FsbCB0aGUgTGluZSBmdW5jdGlvbiB0byBpbml0aWFsaXplIGEgbGluZSBjaGFydC4gQXMgYSBmaXJzdCBwYXJhbWV0ZXIgd2UgcGFzcyBpbiBhIHNlbGVjdG9yIHdoZXJlIHdlIHdvdWxkIGxpa2UgdG8gZ2V0IG91ciBjaGFydCBjcmVhdGVkLiBTZWNvbmQgcGFyYW1ldGVyIGlzIHRoZSBhY3R1YWwgZGF0YSBvYmplY3QgYW5kIGFzIGEgdGhpcmQgcGFyYW1ldGVyIHdlIHBhc3MgaW4gb3VyIG9wdGlvbnNcbiAgICogbmV3IENoYXJ0aXN0LkxpbmUoJy5jdC1jaGFydCcsIGRhdGEsIG9wdGlvbnMpO1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBVc2Ugc3BlY2lmaWMgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiB3aXRoIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbiBtb2R1bGVcbiAgICpcbiAgICogdmFyIGNoYXJ0ID0gbmV3IENoYXJ0aXN0LkxpbmUoJy5jdC1jaGFydCcsIHtcbiAgICogICBsYWJlbHM6IFsxLCAyLCAzLCA0LCA1XSxcbiAgICogICBzZXJpZXM6IFtcbiAgICogICAgIFsxLCAxLCA4LCAxLCA3XVxuICAgKiAgIF1cbiAgICogfSwge1xuICAgKiAgIGxpbmVTbW9vdGg6IENoYXJ0aXN0LkludGVycG9sYXRpb24uY2FyZGluYWwoe1xuICAgKiAgICAgdGVuc2lvbjogMC4yXG4gICAqICAgfSlcbiAgICogfSk7XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIENyZWF0ZSBhIGxpbmUgY2hhcnQgd2l0aCByZXNwb25zaXZlIG9wdGlvbnNcbiAgICpcbiAgICogdmFyIGRhdGEgPSB7XG4gICAqICAgLy8gQSBsYWJlbHMgYXJyYXkgdGhhdCBjYW4gY29udGFpbiBhbnkgc29ydCBvZiB2YWx1ZXNcbiAgICogICBsYWJlbHM6IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheSddLFxuICAgKiAgIC8vIE91ciBzZXJpZXMgYXJyYXkgdGhhdCBjb250YWlucyBzZXJpZXMgb2JqZWN0cyBvciBpbiB0aGlzIGNhc2Ugc2VyaWVzIGRhdGEgYXJyYXlzXG4gICAqICAgc2VyaWVzOiBbXG4gICAqICAgICBbNSwgMiwgNCwgMiwgMF1cbiAgICogICBdXG4gICAqIH07XG4gICAqXG4gICAqIC8vIEluIGFkaXRpb24gdG8gdGhlIHJlZ3VsYXIgb3B0aW9ucyB3ZSBzcGVjaWZ5IHJlc3BvbnNpdmUgb3B0aW9uIG92ZXJyaWRlcyB0aGF0IHdpbGwgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgY29uZmlndXRhdGlvbiBiYXNlZCBvbiB0aGUgbWF0Y2hpbmcgbWVkaWEgcXVlcmllcy5cbiAgICogdmFyIHJlc3BvbnNpdmVPcHRpb25zID0gW1xuICAgKiAgIFsnc2NyZWVuIGFuZCAobWluLXdpZHRoOiA2NDFweCkgYW5kIChtYXgtd2lkdGg6IDEwMjRweCknLCB7XG4gICAqICAgICBzaG93UG9pbnQ6IGZhbHNlLFxuICAgKiAgICAgYXhpc1g6IHtcbiAgICogICAgICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgKiAgICAgICAgIC8vIFdpbGwgcmV0dXJuIE1vbiwgVHVlLCBXZWQgZXRjLiBvbiBtZWRpdW0gc2NyZWVuc1xuICAgKiAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZSgwLCAzKTtcbiAgICogICAgICAgfVxuICAgKiAgICAgfVxuICAgKiAgIH1dLFxuICAgKiAgIFsnc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA2NDBweCknLCB7XG4gICAqICAgICBzaG93TGluZTogZmFsc2UsXG4gICAqICAgICBheGlzWDoge1xuICAgKiAgICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAqICAgICAgICAgLy8gV2lsbCByZXR1cm4gTSwgVCwgVyBldGMuIG9uIHNtYWxsIHNjcmVlbnNcbiAgICogICAgICAgICByZXR1cm4gdmFsdWVbMF07XG4gICAqICAgICAgIH1cbiAgICogICAgIH1cbiAgICogICB9XVxuICAgKiBdO1xuICAgKlxuICAgKiBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0JywgZGF0YSwgbnVsbCwgcmVzcG9uc2l2ZU9wdGlvbnMpO1xuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gTGluZShxdWVyeSwgZGF0YSwgb3B0aW9ucywgcmVzcG9uc2l2ZU9wdGlvbnMpIHtcbiAgICBDaGFydGlzdC5MaW5lLnN1cGVyLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxcbiAgICAgIHF1ZXJ5LFxuICAgICAgZGF0YSxcbiAgICAgIGRlZmF1bHRPcHRpb25zLFxuICAgICAgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyksXG4gICAgICByZXNwb25zaXZlT3B0aW9ucyk7XG4gIH1cblxuICAvLyBDcmVhdGluZyBsaW5lIGNoYXJ0IHR5cGUgaW4gQ2hhcnRpc3QgbmFtZXNwYWNlXG4gIENoYXJ0aXN0LkxpbmUgPSBDaGFydGlzdC5CYXNlLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IExpbmUsXG4gICAgY3JlYXRlQ2hhcnQ6IGNyZWF0ZUNoYXJ0XG4gIH0pO1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBUaGUgYmFyIGNoYXJ0IG1vZHVsZSBvZiBDaGFydGlzdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGRyYXcgdW5pcG9sYXIgb3IgYmlwb2xhciBiYXIgYW5kIGdyb3VwZWQgYmFyIGNoYXJ0cy5cbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LkJhclxuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCl7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zIGluIGJhciBjaGFydHMuIEV4cGFuZCB0aGUgY29kZSB2aWV3IHRvIHNlZSBhIGRldGFpbGVkIGxpc3Qgb2Ygb3B0aW9ucyB3aXRoIGNvbW1lbnRzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQmFyXG4gICAqL1xuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgLy8gT3B0aW9ucyBmb3IgWC1BeGlzXG4gICAgYXhpc1g6IHtcbiAgICAgIC8vIFRoZSBvZmZzZXQgb2YgdGhlIGNoYXJ0IGRyYXdpbmcgYXJlYSB0byB0aGUgYm9yZGVyIG9mIHRoZSBjb250YWluZXJcbiAgICAgIG9mZnNldDogMzAsXG4gICAgICAvLyBQb3NpdGlvbiB3aGVyZSBsYWJlbHMgYXJlIHBsYWNlZC4gQ2FuIGJlIHNldCB0byBgc3RhcnRgIG9yIGBlbmRgIHdoZXJlIGBzdGFydGAgaXMgZXF1aXZhbGVudCB0byBsZWZ0IG9yIHRvcCBvbiB2ZXJ0aWNhbCBheGlzIGFuZCBgZW5kYCBpcyBlcXVpdmFsZW50IHRvIHJpZ2h0IG9yIGJvdHRvbSBvbiBob3Jpem9udGFsIGF4aXMuXG4gICAgICBwb3NpdGlvbjogJ2VuZCcsXG4gICAgICAvLyBBbGxvd3MgeW91IHRvIGNvcnJlY3QgbGFiZWwgcG9zaXRpb25pbmcgb24gdGhpcyBheGlzIGJ5IHBvc2l0aXZlIG9yIG5lZ2F0aXZlIHggYW5kIHkgb2Zmc2V0LlxuICAgICAgbGFiZWxPZmZzZXQ6IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIC8vIElmIGxhYmVscyBzaG91bGQgYmUgc2hvd24gb3Igbm90XG4gICAgICBzaG93TGFiZWw6IHRydWUsXG4gICAgICAvLyBJZiB0aGUgYXhpcyBncmlkIHNob3VsZCBiZSBkcmF3biBvciBub3RcbiAgICAgIHNob3dHcmlkOiB0cnVlLFxuICAgICAgLy8gSW50ZXJwb2xhdGlvbiBmdW5jdGlvbiB0aGF0IGFsbG93cyB5b3UgdG8gaW50ZXJjZXB0IHRoZSB2YWx1ZSBmcm9tIHRoZSBheGlzIGxhYmVsXG4gICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IENoYXJ0aXN0Lm5vb3AsXG4gICAgICAvLyBUaGlzIHZhbHVlIHNwZWNpZmllcyB0aGUgbWluaW11bSB3aWR0aCBpbiBwaXhlbCBvZiB0aGUgc2NhbGUgc3RlcHNcbiAgICAgIHNjYWxlTWluU3BhY2U6IDMwLFxuICAgICAgLy8gVXNlIG9ubHkgaW50ZWdlciB2YWx1ZXMgKHdob2xlIG51bWJlcnMpIGZvciB0aGUgc2NhbGUgc3RlcHNcbiAgICAgIG9ubHlJbnRlZ2VyOiBmYWxzZVxuICAgIH0sXG4gICAgLy8gT3B0aW9ucyBmb3IgWS1BeGlzXG4gICAgYXhpc1k6IHtcbiAgICAgIC8vIFRoZSBvZmZzZXQgb2YgdGhlIGNoYXJ0IGRyYXdpbmcgYXJlYSB0byB0aGUgYm9yZGVyIG9mIHRoZSBjb250YWluZXJcbiAgICAgIG9mZnNldDogNDAsXG4gICAgICAvLyBQb3NpdGlvbiB3aGVyZSBsYWJlbHMgYXJlIHBsYWNlZC4gQ2FuIGJlIHNldCB0byBgc3RhcnRgIG9yIGBlbmRgIHdoZXJlIGBzdGFydGAgaXMgZXF1aXZhbGVudCB0byBsZWZ0IG9yIHRvcCBvbiB2ZXJ0aWNhbCBheGlzIGFuZCBgZW5kYCBpcyBlcXVpdmFsZW50IHRvIHJpZ2h0IG9yIGJvdHRvbSBvbiBob3Jpem9udGFsIGF4aXMuXG4gICAgICBwb3NpdGlvbjogJ3N0YXJ0JyxcbiAgICAgIC8vIEFsbG93cyB5b3UgdG8gY29ycmVjdCBsYWJlbCBwb3NpdGlvbmluZyBvbiB0aGlzIGF4aXMgYnkgcG9zaXRpdmUgb3IgbmVnYXRpdmUgeCBhbmQgeSBvZmZzZXQuXG4gICAgICBsYWJlbE9mZnNldDoge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAgLy8gSWYgbGFiZWxzIHNob3VsZCBiZSBzaG93biBvciBub3RcbiAgICAgIHNob3dMYWJlbDogdHJ1ZSxcbiAgICAgIC8vIElmIHRoZSBheGlzIGdyaWQgc2hvdWxkIGJlIGRyYXduIG9yIG5vdFxuICAgICAgc2hvd0dyaWQ6IHRydWUsXG4gICAgICAvLyBJbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIHlvdSB0byBpbnRlcmNlcHQgdGhlIHZhbHVlIGZyb20gdGhlIGF4aXMgbGFiZWxcbiAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogQ2hhcnRpc3Qubm9vcCxcbiAgICAgIC8vIFRoaXMgdmFsdWUgc3BlY2lmaWVzIHRoZSBtaW5pbXVtIGhlaWdodCBpbiBwaXhlbCBvZiB0aGUgc2NhbGUgc3RlcHNcbiAgICAgIHNjYWxlTWluU3BhY2U6IDIwLFxuICAgICAgLy8gVXNlIG9ubHkgaW50ZWdlciB2YWx1ZXMgKHdob2xlIG51bWJlcnMpIGZvciB0aGUgc2NhbGUgc3RlcHNcbiAgICAgIG9ubHlJbnRlZ2VyOiBmYWxzZVxuICAgIH0sXG4gICAgLy8gU3BlY2lmeSBhIGZpeGVkIHdpZHRoIGZvciB0aGUgY2hhcnQgYXMgYSBzdHJpbmcgKGkuZS4gJzEwMHB4JyBvciAnNTAlJylcbiAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgIC8vIFNwZWNpZnkgYSBmaXhlZCBoZWlnaHQgZm9yIHRoZSBjaGFydCBhcyBhIHN0cmluZyAoaS5lLiAnMTAwcHgnIG9yICc1MCUnKVxuICAgIGhlaWdodDogdW5kZWZpbmVkLFxuICAgIC8vIE92ZXJyaWRpbmcgdGhlIG5hdHVyYWwgaGlnaCBvZiB0aGUgY2hhcnQgYWxsb3dzIHlvdSB0byB6b29tIGluIG9yIGxpbWl0IHRoZSBjaGFydHMgaGlnaGVzdCBkaXNwbGF5ZWQgdmFsdWVcbiAgICBoaWdoOiB1bmRlZmluZWQsXG4gICAgLy8gT3ZlcnJpZGluZyB0aGUgbmF0dXJhbCBsb3cgb2YgdGhlIGNoYXJ0IGFsbG93cyB5b3UgdG8gem9vbSBpbiBvciBsaW1pdCB0aGUgY2hhcnRzIGxvd2VzdCBkaXNwbGF5ZWQgdmFsdWVcbiAgICBsb3c6IHVuZGVmaW5lZCxcbiAgICAvLyBVc2Ugb25seSBpbnRlZ2VyIHZhbHVlcyAod2hvbGUgbnVtYmVycykgZm9yIHRoZSBzY2FsZSBzdGVwc1xuICAgIG9ubHlJbnRlZ2VyOiBmYWxzZSxcbiAgICAvLyBQYWRkaW5nIG9mIHRoZSBjaGFydCBkcmF3aW5nIGFyZWEgdG8gdGhlIGNvbnRhaW5lciBlbGVtZW50IGFuZCBsYWJlbHMgYXMgYSBudW1iZXIgb3IgcGFkZGluZyBvYmplY3Qge3RvcDogNSwgcmlnaHQ6IDUsIGJvdHRvbTogNSwgbGVmdDogNX1cbiAgICBjaGFydFBhZGRpbmc6IHtcbiAgICAgIHRvcDogMTUsXG4gICAgICByaWdodDogMTUsXG4gICAgICBib3R0b206IDUsXG4gICAgICBsZWZ0OiAxMFxuICAgIH0sXG4gICAgLy8gU3BlY2lmeSB0aGUgZGlzdGFuY2UgaW4gcGl4ZWwgb2YgYmFycyBpbiBhIGdyb3VwXG4gICAgc2VyaWVzQmFyRGlzdGFuY2U6IDE1LFxuICAgIC8vIElmIHNldCB0byB0cnVlIHRoaXMgcHJvcGVydHkgd2lsbCBjYXVzZSB0aGUgc2VyaWVzIGJhcnMgdG8gYmUgc3RhY2tlZC4gQ2hlY2sgdGhlIGBzdGFja01vZGVgIG9wdGlvbiBmb3IgZnVydGhlciBzdGFja2luZyBvcHRpb25zLlxuICAgIHN0YWNrQmFyczogZmFsc2UsXG4gICAgLy8gSWYgc2V0IHRvICdvdmVybGFwJyB0aGlzIHByb3BlcnR5IHdpbGwgZm9yY2UgdGhlIHN0YWNrZWQgYmFycyB0byBkcmF3IGZyb20gdGhlIHplcm8gbGluZS5cbiAgICAvLyBJZiBzZXQgdG8gJ2FjY3VtdWxhdGUnIHRoaXMgcHJvcGVydHkgd2lsbCBmb3JtIGEgdG90YWwgZm9yIGVhY2ggc2VyaWVzIHBvaW50LiBUaGlzIHdpbGwgYWxzbyBpbmZsdWVuY2UgdGhlIHktYXhpcyBhbmQgdGhlIG92ZXJhbGwgYm91bmRzIG9mIHRoZSBjaGFydC4gSW4gc3RhY2tlZCBtb2RlIHRoZSBzZXJpZXNCYXJEaXN0YW5jZSBwcm9wZXJ0eSB3aWxsIGhhdmUgbm8gZWZmZWN0LlxuICAgIHN0YWNrTW9kZTogJ2FjY3VtdWxhdGUnLFxuICAgIC8vIEludmVydHMgdGhlIGF4ZXMgb2YgdGhlIGJhciBjaGFydCBpbiBvcmRlciB0byBkcmF3IGEgaG9yaXpvbnRhbCBiYXIgY2hhcnQuIEJlIGF3YXJlIHRoYXQgeW91IGFsc28gbmVlZCB0byBpbnZlcnQgeW91ciBheGlzIHNldHRpbmdzIGFzIHRoZSBZIEF4aXMgd2lsbCBub3cgZGlzcGxheSB0aGUgbGFiZWxzIGFuZCB0aGUgWCBBeGlzIHRoZSB2YWx1ZXMuXG4gICAgaG9yaXpvbnRhbEJhcnM6IGZhbHNlLFxuICAgIC8vIElmIHNldCB0byB0cnVlIHRoZW4gZWFjaCBiYXIgd2lsbCByZXByZXNlbnQgYSBzZXJpZXMgYW5kIHRoZSBkYXRhIGFycmF5IGlzIGV4cGVjdGVkIHRvIGJlIGEgb25lIGRpbWVuc2lvbmFsIGFycmF5IG9mIGRhdGEgdmFsdWVzIHJhdGhlciB0aGFuIGEgc2VyaWVzIGFycmF5IG9mIHNlcmllcy4gVGhpcyBpcyB1c2VmdWwgaWYgdGhlIGJhciBjaGFydCBzaG91bGQgcmVwcmVzZW50IGEgcHJvZmlsZSByYXRoZXIgdGhhbiBzb21lIGRhdGEgb3ZlciB0aW1lLlxuICAgIGRpc3RyaWJ1dGVTZXJpZXM6IGZhbHNlLFxuICAgIC8vIElmIHRydWUgdGhlIHdob2xlIGRhdGEgaXMgcmV2ZXJzZWQgaW5jbHVkaW5nIGxhYmVscywgdGhlIHNlcmllcyBvcmRlciBhcyB3ZWxsIGFzIHRoZSB3aG9sZSBzZXJpZXMgZGF0YSBhcnJheXMuXG4gICAgcmV2ZXJzZURhdGE6IGZhbHNlLFxuICAgIC8vIE92ZXJyaWRlIHRoZSBjbGFzcyBuYW1lcyB0aGF0IGdldCB1c2VkIHRvIGdlbmVyYXRlIHRoZSBTVkcgc3RydWN0dXJlIG9mIHRoZSBjaGFydFxuICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgIGNoYXJ0OiAnY3QtY2hhcnQtYmFyJyxcbiAgICAgIGhvcml6b250YWxCYXJzOiAnY3QtaG9yaXpvbnRhbC1iYXJzJyxcbiAgICAgIGxhYmVsOiAnY3QtbGFiZWwnLFxuICAgICAgbGFiZWxHcm91cDogJ2N0LWxhYmVscycsXG4gICAgICBzZXJpZXM6ICdjdC1zZXJpZXMnLFxuICAgICAgYmFyOiAnY3QtYmFyJyxcbiAgICAgIGdyaWQ6ICdjdC1ncmlkJyxcbiAgICAgIGdyaWRHcm91cDogJ2N0LWdyaWRzJyxcbiAgICAgIHZlcnRpY2FsOiAnY3QtdmVydGljYWwnLFxuICAgICAgaG9yaXpvbnRhbDogJ2N0LWhvcml6b250YWwnLFxuICAgICAgc3RhcnQ6ICdjdC1zdGFydCcsXG4gICAgICBlbmQ6ICdjdC1lbmQnXG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNoYXJ0XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVDaGFydChvcHRpb25zKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICByYXc6IHRoaXMuZGF0YSxcbiAgICAgIG5vcm1hbGl6ZWQ6IG9wdGlvbnMuZGlzdHJpYnV0ZVNlcmllcyA/IENoYXJ0aXN0LmdldERhdGFBcnJheSh0aGlzLmRhdGEsIG9wdGlvbnMucmV2ZXJzZURhdGEsIG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMgPyAneCcgOiAneScpLm1hcChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gW3ZhbHVlXTtcbiAgICAgIH0pIDogQ2hhcnRpc3QuZ2V0RGF0YUFycmF5KHRoaXMuZGF0YSwgb3B0aW9ucy5yZXZlcnNlRGF0YSwgb3B0aW9ucy5ob3Jpem9udGFsQmFycyA/ICd4JyA6ICd5JylcbiAgICB9O1xuXG4gICAgdmFyIGhpZ2hMb3c7XG5cbiAgICAvLyBDcmVhdGUgbmV3IHN2ZyBlbGVtZW50XG4gICAgdGhpcy5zdmcgPSBDaGFydGlzdC5jcmVhdGVTdmcoXG4gICAgICB0aGlzLmNvbnRhaW5lcixcbiAgICAgIG9wdGlvbnMud2lkdGgsXG4gICAgICBvcHRpb25zLmhlaWdodCxcbiAgICAgIG9wdGlvbnMuY2xhc3NOYW1lcy5jaGFydCArIChvcHRpb25zLmhvcml6b250YWxCYXJzID8gJyAnICsgb3B0aW9ucy5jbGFzc05hbWVzLmhvcml6b250YWxCYXJzIDogJycpXG4gICAgKTtcblxuICAgIC8vIERyYXdpbmcgZ3JvdXBzIGluIGNvcnJlY3Qgb3JkZXJcbiAgICB2YXIgZ3JpZEdyb3VwID0gdGhpcy5zdmcuZWxlbSgnZycpLmFkZENsYXNzKG9wdGlvbnMuY2xhc3NOYW1lcy5ncmlkR3JvdXApO1xuICAgIHZhciBzZXJpZXNHcm91cCA9IHRoaXMuc3ZnLmVsZW0oJ2cnKTtcbiAgICB2YXIgbGFiZWxHcm91cCA9IHRoaXMuc3ZnLmVsZW0oJ2cnKS5hZGRDbGFzcyhvcHRpb25zLmNsYXNzTmFtZXMubGFiZWxHcm91cCk7XG5cbiAgICBpZihvcHRpb25zLnN0YWNrQmFycykge1xuICAgICAgLy8gSWYgc3RhY2tlZCBiYXJzIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHRoZSBoaWdoIGxvdyBmcm9tIHN0YWNrZWQgdmFsdWVzIGZyb20gZWFjaCBzZXJpZXNcbiAgICAgIHZhciBzZXJpYWxTdW1zID0gQ2hhcnRpc3Quc2VyaWFsTWFwKGRhdGEubm9ybWFsaXplZCwgZnVuY3Rpb24gc2VyaWFsU3VtcygpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykubWFwKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3Vycikge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBwcmV2LnggKyBjdXJyLnggfHwgMCxcbiAgICAgICAgICAgIHk6IHByZXYueSArIGN1cnIueSB8fCAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfSwge3g6IDAsIHk6IDB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBoaWdoTG93ID0gQ2hhcnRpc3QuZ2V0SGlnaExvdyhbc2VyaWFsU3Vtc10sIENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucywge1xuICAgICAgICByZWZlcmVuY2VWYWx1ZTogMFxuICAgICAgfSksIG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMgPyAneCcgOiAneScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaWdoTG93ID0gQ2hhcnRpc3QuZ2V0SGlnaExvdyhkYXRhLm5vcm1hbGl6ZWQsIENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucywge1xuICAgICAgICByZWZlcmVuY2VWYWx1ZTogMFxuICAgICAgfSksIG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMgPyAneCcgOiAneScpO1xuICAgIH1cbiAgICAvLyBPdmVycmlkZXMgb2YgaGlnaCAvIGxvdyBmcm9tIHNldHRpbmdzXG4gICAgaGlnaExvdy5oaWdoID0gK29wdGlvbnMuaGlnaCB8fCAob3B0aW9ucy5oaWdoID09PSAwID8gMCA6IGhpZ2hMb3cuaGlnaCk7XG4gICAgaGlnaExvdy5sb3cgPSArb3B0aW9ucy5sb3cgfHwgKG9wdGlvbnMubG93ID09PSAwID8gMCA6IGhpZ2hMb3cubG93KTtcblxuICAgIHZhciBjaGFydFJlY3QgPSBDaGFydGlzdC5jcmVhdGVDaGFydFJlY3QodGhpcy5zdmcsIG9wdGlvbnMsIGRlZmF1bHRPcHRpb25zLnBhZGRpbmcpO1xuXG4gICAgdmFyIHZhbHVlQXhpcyxcbiAgICAgIGxhYmVsQXhpc1RpY2tzLFxuICAgICAgbGFiZWxBeGlzLFxuICAgICAgYXhpc1gsXG4gICAgICBheGlzWTtcblxuICAgIC8vIFdlIG5lZWQgdG8gc2V0IHN0ZXAgY291bnQgYmFzZWQgb24gc29tZSBvcHRpb25zIGNvbWJpbmF0aW9uc1xuICAgIGlmKG9wdGlvbnMuZGlzdHJpYnV0ZVNlcmllcyAmJiBvcHRpb25zLnN0YWNrQmFycykge1xuICAgICAgLy8gSWYgZGlzdHJpYnV0ZWQgc2VyaWVzIGFyZSBlbmFibGVkIGFuZCBiYXJzIG5lZWQgdG8gYmUgc3RhY2tlZCwgd2UnbGwgb25seSBoYXZlIG9uZSBiYXIgYW5kIHRoZXJlZm9yZSBzaG91bGRcbiAgICAgIC8vIHVzZSBvbmx5IHRoZSBmaXJzdCBsYWJlbCBmb3IgdGhlIHN0ZXAgYXhpc1xuICAgICAgbGFiZWxBeGlzVGlja3MgPSBkYXRhLnJhdy5sYWJlbHMuc2xpY2UoMCwgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIGRpc3RyaWJ1dGVkIHNlcmllcyBhcmUgZW5hYmxlZCBidXQgc3RhY2tlZCBiYXJzIGFyZW4ndCwgd2Ugc2hvdWxkIHVzZSB0aGUgc2VyaWVzIGxhYmVsc1xuICAgICAgLy8gSWYgd2UgYXJlIGRyYXdpbmcgYSByZWd1bGFyIGJhciBjaGFydCB3aXRoIHR3byBkaW1lbnNpb25hbCBzZXJpZXMgZGF0YSwgd2UganVzdCB1c2UgdGhlIGxhYmVscyBhcnJheVxuICAgICAgLy8gYXMgdGhlIGJhcnMgYXJlIG5vcm1hbGl6ZWRcbiAgICAgIGxhYmVsQXhpc1RpY2tzID0gZGF0YS5yYXcubGFiZWxzO1xuICAgIH1cblxuICAgIC8vIFNldCBsYWJlbEF4aXMgYW5kIHZhbHVlQXhpcyBiYXNlZCBvbiB0aGUgaG9yaXpvbnRhbEJhcnMgc2V0dGluZy4gVGhpcyBzZXR0aW5nIHdpbGwgZmxpcCB0aGUgYXhlcyBpZiBuZWNlc3NhcnkuXG4gICAgaWYob3B0aW9ucy5ob3Jpem9udGFsQmFycykge1xuICAgICAgaWYob3B0aW9ucy5heGlzWC50eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFsdWVBeGlzID0gYXhpc1ggPSBuZXcgQ2hhcnRpc3QuQXV0b1NjYWxlQXhpcyhDaGFydGlzdC5BeGlzLnVuaXRzLngsIGRhdGEsIGNoYXJ0UmVjdCwgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zLmF4aXNYLCB7XG4gICAgICAgICAgaGlnaExvdzogaGlnaExvdyxcbiAgICAgICAgICByZWZlcmVuY2VWYWx1ZTogMFxuICAgICAgICB9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZUF4aXMgPSBheGlzWCA9IG9wdGlvbnMuYXhpc1gudHlwZS5jYWxsKENoYXJ0aXN0LCBDaGFydGlzdC5BeGlzLnVuaXRzLngsIGRhdGEsIGNoYXJ0UmVjdCwgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zLmF4aXNYLCB7XG4gICAgICAgICAgaGlnaExvdzogaGlnaExvdyxcbiAgICAgICAgICByZWZlcmVuY2VWYWx1ZTogMFxuICAgICAgICB9KSk7XG4gICAgICB9XG5cbiAgICAgIGlmKG9wdGlvbnMuYXhpc1kudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxhYmVsQXhpcyA9IGF4aXNZID0gbmV3IENoYXJ0aXN0LlN0ZXBBeGlzKENoYXJ0aXN0LkF4aXMudW5pdHMueSwgZGF0YSwgY2hhcnRSZWN0LCB7XG4gICAgICAgICAgdGlja3M6IGxhYmVsQXhpc1RpY2tzXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFiZWxBeGlzID0gYXhpc1kgPSBvcHRpb25zLmF4aXNZLnR5cGUuY2FsbChDaGFydGlzdCwgQ2hhcnRpc3QuQXhpcy51bml0cy55LCBkYXRhLCBjaGFydFJlY3QsIG9wdGlvbnMuYXhpc1kpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZihvcHRpb25zLmF4aXNYLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsYWJlbEF4aXMgPSBheGlzWCA9IG5ldyBDaGFydGlzdC5TdGVwQXhpcyhDaGFydGlzdC5BeGlzLnVuaXRzLngsIGRhdGEsIGNoYXJ0UmVjdCwge1xuICAgICAgICAgIHRpY2tzOiBsYWJlbEF4aXNUaWNrc1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhYmVsQXhpcyA9IGF4aXNYID0gb3B0aW9ucy5heGlzWC50eXBlLmNhbGwoQ2hhcnRpc3QsIENoYXJ0aXN0LkF4aXMudW5pdHMueCwgZGF0YSwgY2hhcnRSZWN0LCBvcHRpb25zLmF4aXNYKTtcbiAgICAgIH1cblxuICAgICAgaWYob3B0aW9ucy5heGlzWS50eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFsdWVBeGlzID0gYXhpc1kgPSBuZXcgQ2hhcnRpc3QuQXV0b1NjYWxlQXhpcyhDaGFydGlzdC5BeGlzLnVuaXRzLnksIGRhdGEsIGNoYXJ0UmVjdCwgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zLmF4aXNZLCB7XG4gICAgICAgICAgaGlnaExvdzogaGlnaExvdyxcbiAgICAgICAgICByZWZlcmVuY2VWYWx1ZTogMFxuICAgICAgICB9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZUF4aXMgPSBheGlzWSA9IG9wdGlvbnMuYXhpc1kudHlwZS5jYWxsKENoYXJ0aXN0LCBDaGFydGlzdC5BeGlzLnVuaXRzLnksIGRhdGEsIGNoYXJ0UmVjdCwgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zLmF4aXNZLCB7XG4gICAgICAgICAgaGlnaExvdzogaGlnaExvdyxcbiAgICAgICAgICByZWZlcmVuY2VWYWx1ZTogMFxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUHJvamVjdGVkIDAgcG9pbnRcbiAgICB2YXIgemVyb1BvaW50ID0gb3B0aW9ucy5ob3Jpem9udGFsQmFycyA/IChjaGFydFJlY3QueDEgKyB2YWx1ZUF4aXMucHJvamVjdFZhbHVlKDApKSA6IChjaGFydFJlY3QueTEgLSB2YWx1ZUF4aXMucHJvamVjdFZhbHVlKDApKTtcbiAgICAvLyBVc2VkIHRvIHRyYWNrIHRoZSBzY3JlZW4gY29vcmRpbmF0ZXMgb2Ygc3RhY2tlZCBiYXJzXG4gICAgdmFyIHN0YWNrZWRCYXJWYWx1ZXMgPSBbXTtcblxuICAgIGxhYmVsQXhpcy5jcmVhdGVHcmlkQW5kTGFiZWxzKGdyaWRHcm91cCwgbGFiZWxHcm91cCwgdGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QsIG9wdGlvbnMsIHRoaXMuZXZlbnRFbWl0dGVyKTtcbiAgICB2YWx1ZUF4aXMuY3JlYXRlR3JpZEFuZExhYmVscyhncmlkR3JvdXAsIGxhYmVsR3JvdXAsIHRoaXMuc3VwcG9ydHNGb3JlaWduT2JqZWN0LCBvcHRpb25zLCB0aGlzLmV2ZW50RW1pdHRlcik7XG5cbiAgICAvLyBEcmF3IHRoZSBzZXJpZXNcbiAgICBkYXRhLnJhdy5zZXJpZXMuZm9yRWFjaChmdW5jdGlvbihzZXJpZXMsIHNlcmllc0luZGV4KSB7XG4gICAgICAvLyBDYWxjdWxhdGluZyBiaS1wb2xhciB2YWx1ZSBvZiBpbmRleCBmb3Igc2VyaWVzT2Zmc2V0LiBGb3IgaSA9IDAuLjQgYmlQb2wgd2lsbCBiZSAtMS41LCAtMC41LCAwLjUsIDEuNSBldGMuXG4gICAgICB2YXIgYmlQb2wgPSBzZXJpZXNJbmRleCAtIChkYXRhLnJhdy5zZXJpZXMubGVuZ3RoIC0gMSkgLyAyO1xuICAgICAgLy8gSGFsZiBvZiB0aGUgcGVyaW9kIHdpZHRoIGJldHdlZW4gdmVydGljYWwgZ3JpZCBsaW5lcyB1c2VkIHRvIHBvc2l0aW9uIGJhcnNcbiAgICAgIHZhciBwZXJpb2RIYWxmTGVuZ3RoO1xuICAgICAgLy8gQ3VycmVudCBzZXJpZXMgU1ZHIGVsZW1lbnRcbiAgICAgIHZhciBzZXJpZXNFbGVtZW50O1xuXG4gICAgICAvLyBXZSBuZWVkIHRvIHNldCBwZXJpb2RIYWxmTGVuZ3RoIGJhc2VkIG9uIHNvbWUgb3B0aW9ucyBjb21iaW5hdGlvbnNcbiAgICAgIGlmKG9wdGlvbnMuZGlzdHJpYnV0ZVNlcmllcyAmJiAhb3B0aW9ucy5zdGFja0JhcnMpIHtcbiAgICAgICAgLy8gSWYgZGlzdHJpYnV0ZWQgc2VyaWVzIGFyZSBlbmFibGVkIGJ1dCBzdGFja2VkIGJhcnMgYXJlbid0LCB3ZSBuZWVkIHRvIHVzZSB0aGUgbGVuZ3RoIG9mIHRoZSBub3JtYWl6ZWREYXRhIGFycmF5XG4gICAgICAgIC8vIHdoaWNoIGlzIHRoZSBzZXJpZXMgY291bnQgYW5kIGRpdmlkZSBieSAyXG4gICAgICAgIHBlcmlvZEhhbGZMZW5ndGggPSBsYWJlbEF4aXMuYXhpc0xlbmd0aCAvIGRhdGEubm9ybWFsaXplZC5sZW5ndGggLyAyO1xuICAgICAgfSBlbHNlIGlmKG9wdGlvbnMuZGlzdHJpYnV0ZVNlcmllcyAmJiBvcHRpb25zLnN0YWNrQmFycykge1xuICAgICAgICAvLyBJZiBkaXN0cmlidXRlZCBzZXJpZXMgYW5kIHN0YWNrZWQgYmFycyBhcmUgZW5hYmxlZCB3ZSdsbCBvbmx5IGdldCBvbmUgYmFyIHNvIHdlIHNob3VsZCBqdXN0IGRpdmlkZSB0aGUgYXhpc1xuICAgICAgICAvLyBsZW5ndGggYnkgMlxuICAgICAgICBwZXJpb2RIYWxmTGVuZ3RoID0gbGFiZWxBeGlzLmF4aXNMZW5ndGggLyAyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gT24gcmVndWxhciBiYXIgY2hhcnRzIHdlIHNob3VsZCBqdXN0IHVzZSB0aGUgc2VyaWVzIGxlbmd0aFxuICAgICAgICBwZXJpb2RIYWxmTGVuZ3RoID0gbGFiZWxBeGlzLmF4aXNMZW5ndGggLyBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdLmxlbmd0aCAvIDI7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZGluZyB0aGUgc2VyaWVzIGdyb3VwIHRvIHRoZSBzZXJpZXMgZWxlbWVudFxuICAgICAgc2VyaWVzRWxlbWVudCA9IHNlcmllc0dyb3VwLmVsZW0oJ2cnKTtcblxuICAgICAgLy8gV3JpdGUgYXR0cmlidXRlcyB0byBzZXJpZXMgZ3JvdXAgZWxlbWVudC4gSWYgc2VyaWVzIG5hbWUgb3IgbWV0YSBpcyB1bmRlZmluZWQgdGhlIGF0dHJpYnV0ZXMgd2lsbCBub3QgYmUgd3JpdHRlblxuICAgICAgc2VyaWVzRWxlbWVudC5hdHRyKHtcbiAgICAgICAgJ3Nlcmllcy1uYW1lJzogc2VyaWVzLm5hbWUsXG4gICAgICAgICdtZXRhJzogQ2hhcnRpc3Quc2VyaWFsaXplKHNlcmllcy5tZXRhKVxuICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgLy8gVXNlIHNlcmllcyBjbGFzcyBmcm9tIHNlcmllcyBkYXRhIG9yIGlmIG5vdCBzZXQgZ2VuZXJhdGUgb25lXG4gICAgICBzZXJpZXNFbGVtZW50LmFkZENsYXNzKFtcbiAgICAgICAgb3B0aW9ucy5jbGFzc05hbWVzLnNlcmllcyxcbiAgICAgICAgKHNlcmllcy5jbGFzc05hbWUgfHwgb3B0aW9ucy5jbGFzc05hbWVzLnNlcmllcyArICctJyArIENoYXJ0aXN0LmFscGhhTnVtZXJhdGUoc2VyaWVzSW5kZXgpKVxuICAgICAgXS5qb2luKCcgJykpO1xuXG4gICAgICBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIHZhbHVlSW5kZXgpIHtcbiAgICAgICAgdmFyIHByb2plY3RlZCxcbiAgICAgICAgICBiYXIsXG4gICAgICAgICAgcHJldmlvdXNTdGFjayxcbiAgICAgICAgICBsYWJlbEF4aXNWYWx1ZUluZGV4O1xuXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gc2V0IGxhYmVsQXhpc1ZhbHVlSW5kZXggYmFzZWQgb24gc29tZSBvcHRpb25zIGNvbWJpbmF0aW9uc1xuICAgICAgICBpZihvcHRpb25zLmRpc3RyaWJ1dGVTZXJpZXMgJiYgIW9wdGlvbnMuc3RhY2tCYXJzKSB7XG4gICAgICAgICAgLy8gSWYgZGlzdHJpYnV0ZWQgc2VyaWVzIGFyZSBlbmFibGVkIGJ1dCBzdGFja2VkIGJhcnMgYXJlbid0LCB3ZSBjYW4gdXNlIHRoZSBzZXJpZXNJbmRleCBmb3IgbGF0ZXIgcHJvamVjdGlvblxuICAgICAgICAgIC8vIG9uIHRoZSBzdGVwIGF4aXMgZm9yIGxhYmVsIHBvc2l0aW9uaW5nXG4gICAgICAgICAgbGFiZWxBeGlzVmFsdWVJbmRleCA9IHNlcmllc0luZGV4O1xuICAgICAgICB9IGVsc2UgaWYob3B0aW9ucy5kaXN0cmlidXRlU2VyaWVzICYmIG9wdGlvbnMuc3RhY2tCYXJzKSB7XG4gICAgICAgICAgLy8gSWYgZGlzdHJpYnV0ZWQgc2VyaWVzIGFuZCBzdGFja2VkIGJhcnMgYXJlIGVuYWJsZWQsIHdlIHdpbGwgb25seSBnZXQgb25lIGJhciBhbmQgdGhlcmVmb3JlIGFsd2F5cyB1c2VcbiAgICAgICAgICAvLyAwIGZvciBwcm9qZWN0aW9uIG9uIHRoZSBsYWJlbCBzdGVwIGF4aXNcbiAgICAgICAgICBsYWJlbEF4aXNWYWx1ZUluZGV4ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPbiByZWd1bGFyIGJhciBjaGFydHMgd2UganVzdCB1c2UgdGhlIHZhbHVlIGluZGV4IHRvIHByb2plY3Qgb24gdGhlIGxhYmVsIHN0ZXAgYXhpc1xuICAgICAgICAgIGxhYmVsQXhpc1ZhbHVlSW5kZXggPSB2YWx1ZUluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgbmVlZCB0byB0cmFuc2Zvcm0gY29vcmRpbmF0ZXMgZGlmZmVyZW50bHkgYmFzZWQgb24gdGhlIGNoYXJ0IGxheW91dFxuICAgICAgICBpZihvcHRpb25zLmhvcml6b250YWxCYXJzKSB7XG4gICAgICAgICAgcHJvamVjdGVkID0ge1xuICAgICAgICAgICAgeDogY2hhcnRSZWN0LngxICsgdmFsdWVBeGlzLnByb2plY3RWYWx1ZSh2YWx1ZSAmJiB2YWx1ZS54ID8gdmFsdWUueCA6IDAsIHZhbHVlSW5kZXgsIGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0pLFxuICAgICAgICAgICAgeTogY2hhcnRSZWN0LnkxIC0gbGFiZWxBeGlzLnByb2plY3RWYWx1ZSh2YWx1ZSAmJiB2YWx1ZS55ID8gdmFsdWUueSA6IDAsIGxhYmVsQXhpc1ZhbHVlSW5kZXgsIGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0pXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm9qZWN0ZWQgPSB7XG4gICAgICAgICAgICB4OiBjaGFydFJlY3QueDEgKyBsYWJlbEF4aXMucHJvamVjdFZhbHVlKHZhbHVlICYmIHZhbHVlLnggPyB2YWx1ZS54IDogMCwgbGFiZWxBeGlzVmFsdWVJbmRleCwgZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XSksXG4gICAgICAgICAgICB5OiBjaGFydFJlY3QueTEgLSB2YWx1ZUF4aXMucHJvamVjdFZhbHVlKHZhbHVlICYmIHZhbHVlLnkgPyB2YWx1ZS55IDogMCwgdmFsdWVJbmRleCwgZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgbGFiZWwgYXhpcyBpcyBhIHN0ZXAgYmFzZWQgYXhpcyB3ZSB3aWxsIG9mZnNldCB0aGUgYmFyIGludG8gdGhlIG1pZGRsZSBvZiBiZXR3ZWVuIHR3byBzdGVwcyB1c2luZ1xuICAgICAgICAvLyB0aGUgcGVyaW9kSGFsZkxlbmd0aCB2YWx1ZS4gQWxzbyB3ZSBkbyBhcnJhbmdlIHRoZSBkaWZmZXJlbnQgc2VyaWVzIHNvIHRoYXQgdGhleSBhbGlnbiB1cCB0byBlYWNoIG90aGVyIHVzaW5nXG4gICAgICAgIC8vIHRoZSBzZXJpZXNCYXJEaXN0YW5jZS4gSWYgd2UgZG9uJ3QgaGF2ZSBhIHN0ZXAgYXhpcywgdGhlIGJhciBwb3NpdGlvbnMgY2FuIGJlIGNob3NlbiBmcmVlbHkgc28gd2Ugc2hvdWxkIG5vdFxuICAgICAgICAvLyBhZGQgYW55IGF1dG9tYXRlZCBwb3NpdGlvbmluZy5cbiAgICAgICAgaWYobGFiZWxBeGlzIGluc3RhbmNlb2YgQ2hhcnRpc3QuU3RlcEF4aXMpIHtcbiAgICAgICAgICAvLyBPZmZzZXQgdG8gY2VudGVyIGJhciBiZXR3ZWVuIGdyaWQgbGluZXMsIGJ1dCBvbmx5IGlmIHRoZSBzdGVwIGF4aXMgaXMgbm90IHN0cmV0Y2hlZFxuICAgICAgICAgIGlmKCFsYWJlbEF4aXMub3B0aW9ucy5zdHJldGNoKSB7XG4gICAgICAgICAgICBwcm9qZWN0ZWRbbGFiZWxBeGlzLnVuaXRzLnBvc10gKz0gcGVyaW9kSGFsZkxlbmd0aCAqIChvcHRpb25zLmhvcml6b250YWxCYXJzID8gLTEgOiAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVXNpbmcgYmktcG9sYXIgb2Zmc2V0IGZvciBtdWx0aXBsZSBzZXJpZXMgaWYgbm8gc3RhY2tlZCBiYXJzIG9yIHNlcmllcyBkaXN0cmlidXRpb24gaXMgdXNlZFxuICAgICAgICAgIHByb2plY3RlZFtsYWJlbEF4aXMudW5pdHMucG9zXSArPSAob3B0aW9ucy5zdGFja0JhcnMgfHwgb3B0aW9ucy5kaXN0cmlidXRlU2VyaWVzKSA/IDAgOiBiaVBvbCAqIG9wdGlvbnMuc2VyaWVzQmFyRGlzdGFuY2UgKiAob3B0aW9ucy5ob3Jpem9udGFsQmFycyA/IC0xIDogMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnRlciB2YWx1ZSBpbiBzdGFja2VkIGJhciB2YWx1ZXMgdXNlZCB0byByZW1lbWJlciBwcmV2aW91cyBzY3JlZW4gdmFsdWUgZm9yIHN0YWNraW5nIHVwIGJhcnNcbiAgICAgICAgcHJldmlvdXNTdGFjayA9IHN0YWNrZWRCYXJWYWx1ZXNbdmFsdWVJbmRleF0gfHwgemVyb1BvaW50O1xuICAgICAgICBzdGFja2VkQmFyVmFsdWVzW3ZhbHVlSW5kZXhdID0gcHJldmlvdXNTdGFjayAtICh6ZXJvUG9pbnQgLSBwcm9qZWN0ZWRbbGFiZWxBeGlzLmNvdW50ZXJVbml0cy5wb3NdKTtcblxuICAgICAgICAvLyBTa2lwIGlmIHZhbHVlIGlzIHVuZGVmaW5lZFxuICAgICAgICBpZih2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IHt9O1xuICAgICAgICBwb3NpdGlvbnNbbGFiZWxBeGlzLnVuaXRzLnBvcyArICcxJ10gPSBwcm9qZWN0ZWRbbGFiZWxBeGlzLnVuaXRzLnBvc107XG4gICAgICAgIHBvc2l0aW9uc1tsYWJlbEF4aXMudW5pdHMucG9zICsgJzInXSA9IHByb2plY3RlZFtsYWJlbEF4aXMudW5pdHMucG9zXTtcblxuICAgICAgICBpZihvcHRpb25zLnN0YWNrQmFycyAmJiAob3B0aW9ucy5zdGFja01vZGUgPT09ICdhY2N1bXVsYXRlJyB8fCAhb3B0aW9ucy5zdGFja01vZGUpKSB7XG4gICAgICAgICAgLy8gU3RhY2sgbW9kZTogYWNjdW11bGF0ZSAoZGVmYXVsdClcbiAgICAgICAgICAvLyBJZiBiYXJzIGFyZSBzdGFja2VkIHdlIHVzZSB0aGUgc3RhY2tlZEJhclZhbHVlcyByZWZlcmVuY2UgYW5kIG90aGVyd2lzZSBiYXNlIGFsbCBiYXJzIG9mZiB0aGUgemVybyBsaW5lXG4gICAgICAgICAgLy8gV2Ugd2FudCBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSwgc28gdGhlIGV4cGVjdGVkIGZhbGxiYWNrIHdpdGhvdXQgdGhlICdzdGFja01vZGUnIG9wdGlvblxuICAgICAgICAgIC8vIHRvIGJlIHRoZSBvcmlnaW5hbCBiZWhhdmlvdXIgKGFjY3VtdWxhdGUpXG4gICAgICAgICAgcG9zaXRpb25zW2xhYmVsQXhpcy5jb3VudGVyVW5pdHMucG9zICsgJzEnXSA9IHByZXZpb3VzU3RhY2s7XG4gICAgICAgICAgcG9zaXRpb25zW2xhYmVsQXhpcy5jb3VudGVyVW5pdHMucG9zICsgJzInXSA9IHN0YWNrZWRCYXJWYWx1ZXNbdmFsdWVJbmRleF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRHJhdyBmcm9tIHRoZSB6ZXJvIGxpbmUgbm9ybWFsbHlcbiAgICAgICAgICAvLyBUaGlzIGlzIGFsc28gdGhlIHNhbWUgY29kZSBmb3IgU3RhY2sgbW9kZTogb3ZlcmxhcFxuICAgICAgICAgIHBvc2l0aW9uc1tsYWJlbEF4aXMuY291bnRlclVuaXRzLnBvcyArICcxJ10gPSB6ZXJvUG9pbnQ7XG4gICAgICAgICAgcG9zaXRpb25zW2xhYmVsQXhpcy5jb3VudGVyVW5pdHMucG9zICsgJzInXSA9IHByb2plY3RlZFtsYWJlbEF4aXMuY291bnRlclVuaXRzLnBvc107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMaW1pdCB4IGFuZCB5IHNvIHRoYXQgdGhleSBhcmUgd2l0aGluIHRoZSBjaGFydCByZWN0XG4gICAgICAgIHBvc2l0aW9ucy54MSA9IE1hdGgubWluKE1hdGgubWF4KHBvc2l0aW9ucy54MSwgY2hhcnRSZWN0LngxKSwgY2hhcnRSZWN0LngyKTtcbiAgICAgICAgcG9zaXRpb25zLngyID0gTWF0aC5taW4oTWF0aC5tYXgocG9zaXRpb25zLngyLCBjaGFydFJlY3QueDEpLCBjaGFydFJlY3QueDIpO1xuICAgICAgICBwb3NpdGlvbnMueTEgPSBNYXRoLm1pbihNYXRoLm1heChwb3NpdGlvbnMueTEsIGNoYXJ0UmVjdC55MiksIGNoYXJ0UmVjdC55MSk7XG4gICAgICAgIHBvc2l0aW9ucy55MiA9IE1hdGgubWluKE1hdGgubWF4KHBvc2l0aW9ucy55MiwgY2hhcnRSZWN0LnkyKSwgY2hhcnRSZWN0LnkxKTtcblxuICAgICAgICAvLyBDcmVhdGUgYmFyIGVsZW1lbnRcbiAgICAgICAgYmFyID0gc2VyaWVzRWxlbWVudC5lbGVtKCdsaW5lJywgcG9zaXRpb25zLCBvcHRpb25zLmNsYXNzTmFtZXMuYmFyKS5hdHRyKHtcbiAgICAgICAgICAndmFsdWUnOiBbdmFsdWUueCwgdmFsdWUueV0uZmlsdGVyKGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgIH0pLmpvaW4oJywnKSxcbiAgICAgICAgICAnbWV0YSc6IENoYXJ0aXN0LmdldE1ldGFEYXRhKHNlcmllcywgdmFsdWVJbmRleClcbiAgICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdkcmF3JywgQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgICAgICB0eXBlOiAnYmFyJyxcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgaW5kZXg6IHZhbHVlSW5kZXgsXG4gICAgICAgICAgbWV0YTogQ2hhcnRpc3QuZ2V0TWV0YURhdGEoc2VyaWVzLCB2YWx1ZUluZGV4KSxcbiAgICAgICAgICBzZXJpZXM6IHNlcmllcyxcbiAgICAgICAgICBzZXJpZXNJbmRleDogc2VyaWVzSW5kZXgsXG4gICAgICAgICAgYXhpc1g6IGF4aXNYLFxuICAgICAgICAgIGF4aXNZOiBheGlzWSxcbiAgICAgICAgICBjaGFydFJlY3Q6IGNoYXJ0UmVjdCxcbiAgICAgICAgICBncm91cDogc2VyaWVzRWxlbWVudCxcbiAgICAgICAgICBlbGVtZW50OiBiYXJcbiAgICAgICAgfSwgcG9zaXRpb25zKSk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdjcmVhdGVkJywge1xuICAgICAgYm91bmRzOiB2YWx1ZUF4aXMuYm91bmRzLFxuICAgICAgY2hhcnRSZWN0OiBjaGFydFJlY3QsXG4gICAgICBheGlzWDogYXhpc1gsXG4gICAgICBheGlzWTogYXhpc1ksXG4gICAgICBzdmc6IHRoaXMuc3ZnLFxuICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgYmFyIGNoYXJ0IGFuZCByZXR1cm5zIEFQSSBvYmplY3QgdGhhdCB5b3UgY2FuIHVzZSBmb3IgbGF0ZXIgY2hhbmdlcy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkJhclxuICAgKiBAcGFyYW0ge1N0cmluZ3xOb2RlfSBxdWVyeSBBIHNlbGVjdG9yIHF1ZXJ5IHN0cmluZyBvciBkaXJlY3RseSBhIERPTSBlbGVtZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBkYXRhIG9iamVjdCB0aGF0IG5lZWRzIHRvIGNvbnNpc3Qgb2YgYSBsYWJlbHMgYW5kIGEgc2VyaWVzIGFycmF5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0IHdpdGggb3B0aW9ucyB0aGF0IG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMuIENoZWNrIHRoZSBleGFtcGxlcyBmb3IgYSBkZXRhaWxlZCBsaXN0LlxuICAgKiBAcGFyYW0ge0FycmF5fSBbcmVzcG9uc2l2ZU9wdGlvbnNdIFNwZWNpZnkgYW4gYXJyYXkgb2YgcmVzcG9uc2l2ZSBvcHRpb24gYXJyYXlzIHdoaWNoIGFyZSBhIG1lZGlhIHF1ZXJ5IGFuZCBvcHRpb25zIG9iamVjdCBwYWlyID0+IFtbbWVkaWFRdWVyeVN0cmluZywgb3B0aW9uc09iamVjdF0sW21vcmUuLi5dXVxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCB3aGljaCBleHBvc2VzIHRoZSBBUEkgZm9yIHRoZSBjcmVhdGVkIGNoYXJ0XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIENyZWF0ZSBhIHNpbXBsZSBiYXIgY2hhcnRcbiAgICogdmFyIGRhdGEgPSB7XG4gICAqICAgbGFiZWxzOiBbJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknXSxcbiAgICogICBzZXJpZXM6IFtcbiAgICogICAgIFs1LCAyLCA0LCAyLCAwXVxuICAgKiAgIF1cbiAgICogfTtcbiAgICpcbiAgICogLy8gSW4gdGhlIGdsb2JhbCBuYW1lIHNwYWNlIENoYXJ0aXN0IHdlIGNhbGwgdGhlIEJhciBmdW5jdGlvbiB0byBpbml0aWFsaXplIGEgYmFyIGNoYXJ0LiBBcyBhIGZpcnN0IHBhcmFtZXRlciB3ZSBwYXNzIGluIGEgc2VsZWN0b3Igd2hlcmUgd2Ugd291bGQgbGlrZSB0byBnZXQgb3VyIGNoYXJ0IGNyZWF0ZWQgYW5kIGFzIGEgc2Vjb25kIHBhcmFtZXRlciB3ZSBwYXNzIG91ciBkYXRhIG9iamVjdC5cbiAgICogbmV3IENoYXJ0aXN0LkJhcignLmN0LWNoYXJ0JywgZGF0YSk7XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFRoaXMgZXhhbXBsZSBjcmVhdGVzIGEgYmlwb2xhciBncm91cGVkIGJhciBjaGFydCB3aGVyZSB0aGUgYm91bmRhcmllcyBhcmUgbGltaXR0ZWQgdG8gLTEwIGFuZCAxMFxuICAgKiBuZXcgQ2hhcnRpc3QuQmFyKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNSwgNiwgN10sXG4gICAqICAgc2VyaWVzOiBbXG4gICAqICAgICBbMSwgMywgMiwgLTUsIC0zLCAxLCAtNl0sXG4gICAqICAgICBbLTUsIC0yLCAtNCwgLTEsIDIsIC0zLCAxXVxuICAgKiAgIF1cbiAgICogfSwge1xuICAgKiAgIHNlcmllc0JhckRpc3RhbmNlOiAxMixcbiAgICogICBsb3c6IC0xMCxcbiAgICogICBoaWdoOiAxMFxuICAgKiB9KTtcbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIEJhcihxdWVyeSwgZGF0YSwgb3B0aW9ucywgcmVzcG9uc2l2ZU9wdGlvbnMpIHtcbiAgICBDaGFydGlzdC5CYXIuc3VwZXIuY29uc3RydWN0b3IuY2FsbCh0aGlzLFxuICAgICAgcXVlcnksXG4gICAgICBkYXRhLFxuICAgICAgZGVmYXVsdE9wdGlvbnMsXG4gICAgICBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKSxcbiAgICAgIHJlc3BvbnNpdmVPcHRpb25zKTtcbiAgfVxuXG4gIC8vIENyZWF0aW5nIGJhciBjaGFydCB0eXBlIGluIENoYXJ0aXN0IG5hbWVzcGFjZVxuICBDaGFydGlzdC5CYXIgPSBDaGFydGlzdC5CYXNlLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IEJhcixcbiAgICBjcmVhdGVDaGFydDogY3JlYXRlQ2hhcnRcbiAgfSk7XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIFRoZSBwaWUgY2hhcnQgbW9kdWxlIG9mIENoYXJ0aXN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gZHJhdyBwaWUsIGRvbnV0IG9yIGdhdWdlIGNoYXJ0c1xuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuUGllXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zIGluIGxpbmUgY2hhcnRzLiBFeHBhbmQgdGhlIGNvZGUgdmlldyB0byBzZWUgYSBkZXRhaWxlZCBsaXN0IG9mIG9wdGlvbnMgd2l0aCBjb21tZW50cy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlBpZVxuICAgKi9cbiAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIC8vIFNwZWNpZnkgYSBmaXhlZCB3aWR0aCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgd2lkdGg6IHVuZGVmaW5lZCxcbiAgICAvLyBTcGVjaWZ5IGEgZml4ZWQgaGVpZ2h0IGZvciB0aGUgY2hhcnQgYXMgYSBzdHJpbmcgKGkuZS4gJzEwMHB4JyBvciAnNTAlJylcbiAgICBoZWlnaHQ6IHVuZGVmaW5lZCxcbiAgICAvLyBQYWRkaW5nIG9mIHRoZSBjaGFydCBkcmF3aW5nIGFyZWEgdG8gdGhlIGNvbnRhaW5lciBlbGVtZW50IGFuZCBsYWJlbHMgYXMgYSBudW1iZXIgb3IgcGFkZGluZyBvYmplY3Qge3RvcDogNSwgcmlnaHQ6IDUsIGJvdHRvbTogNSwgbGVmdDogNX1cbiAgICBjaGFydFBhZGRpbmc6IDUsXG4gICAgLy8gT3ZlcnJpZGUgdGhlIGNsYXNzIG5hbWVzIHRoYXQgYXJlIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIFNWRyBzdHJ1Y3R1cmUgb2YgdGhlIGNoYXJ0XG4gICAgY2xhc3NOYW1lczoge1xuICAgICAgY2hhcnRQaWU6ICdjdC1jaGFydC1waWUnLFxuICAgICAgY2hhcnREb251dDogJ2N0LWNoYXJ0LWRvbnV0JyxcbiAgICAgIHNlcmllczogJ2N0LXNlcmllcycsXG4gICAgICBzbGljZVBpZTogJ2N0LXNsaWNlLXBpZScsXG4gICAgICBzbGljZURvbnV0OiAnY3Qtc2xpY2UtZG9udXQnLFxuICAgICAgbGFiZWw6ICdjdC1sYWJlbCdcbiAgICB9LFxuICAgIC8vIFRoZSBzdGFydCBhbmdsZSBvZiB0aGUgcGllIGNoYXJ0IGluIGRlZ3JlZXMgd2hlcmUgMCBwb2ludHMgbm9ydGguIEEgaGlnaGVyIHZhbHVlIG9mZnNldHMgdGhlIHN0YXJ0IGFuZ2xlIGNsb2Nrd2lzZS5cbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIC8vIEFuIG9wdGlvbmFsIHRvdGFsIHlvdSBjYW4gc3BlY2lmeS4gQnkgc3BlY2lmeWluZyBhIHRvdGFsIHZhbHVlLCB0aGUgc3VtIG9mIHRoZSB2YWx1ZXMgaW4gdGhlIHNlcmllcyBtdXN0IGJlIHRoaXMgdG90YWwgaW4gb3JkZXIgdG8gZHJhdyBhIGZ1bGwgcGllLiBZb3UgY2FuIHVzZSB0aGlzIHBhcmFtZXRlciB0byBkcmF3IG9ubHkgcGFydHMgb2YgYSBwaWUgb3IgZ2F1Z2UgY2hhcnRzLlxuICAgIHRvdGFsOiB1bmRlZmluZWQsXG4gICAgLy8gSWYgc3BlY2lmaWVkIHRoZSBkb251dCBDU1MgY2xhc3NlcyB3aWxsIGJlIHVzZWQgYW5kIHN0cm9rZXMgd2lsbCBiZSBkcmF3biBpbnN0ZWFkIG9mIHBpZSBzbGljZXMuXG4gICAgZG9udXQ6IGZhbHNlLFxuICAgIC8vIFNwZWNpZnkgdGhlIGRvbnV0IHN0cm9rZSB3aWR0aCwgY3VycmVudGx5IGRvbmUgaW4gamF2YXNjcmlwdCBmb3IgY29udmVuaWVuY2UuIE1heSBtb3ZlIHRvIENTUyBzdHlsZXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAvLyBUaGlzIG9wdGlvbiBjYW4gYmUgc2V0IGFzIG51bWJlciBvciBzdHJpbmcgdG8gc3BlY2lmeSBhIHJlbGF0aXZlIHdpZHRoIChpLmUuIDEwMCBvciAnMzAlJykuXG4gICAgZG9udXRXaWR0aDogNjAsXG4gICAgLy8gSWYgYSBsYWJlbCBzaG91bGQgYmUgc2hvd24gb3Igbm90XG4gICAgc2hvd0xhYmVsOiB0cnVlLFxuICAgIC8vIExhYmVsIHBvc2l0aW9uIG9mZnNldCBmcm9tIHRoZSBzdGFuZGFyZCBwb3NpdGlvbiB3aGljaCBpcyBoYWxmIGRpc3RhbmNlIG9mIHRoZSByYWRpdXMuIFRoaXMgdmFsdWUgY2FuIGJlIGVpdGhlciBwb3NpdGl2ZSBvciBuZWdhdGl2ZS4gUG9zaXRpdmUgdmFsdWVzIHdpbGwgcG9zaXRpb24gdGhlIGxhYmVsIGF3YXkgZnJvbSB0aGUgY2VudGVyLlxuICAgIGxhYmVsT2Zmc2V0OiAwLFxuICAgIC8vIFRoaXMgb3B0aW9uIGNhbiBiZSBzZXQgdG8gJ2luc2lkZScsICdvdXRzaWRlJyBvciAnY2VudGVyJy4gUG9zaXRpb25lZCB3aXRoICdpbnNpZGUnIHRoZSBsYWJlbHMgd2lsbCBiZSBwbGFjZWQgb24gaGFsZiB0aGUgZGlzdGFuY2Ugb2YgdGhlIHJhZGl1cyB0byB0aGUgYm9yZGVyIG9mIHRoZSBQaWUgYnkgcmVzcGVjdGluZyB0aGUgJ2xhYmVsT2Zmc2V0Jy4gVGhlICdvdXRzaWRlJyBvcHRpb24gd2lsbCBwbGFjZSB0aGUgbGFiZWxzIGF0IHRoZSBib3JkZXIgb2YgdGhlIHBpZSBhbmQgJ2NlbnRlcicgd2lsbCBwbGFjZSB0aGUgbGFiZWxzIGluIHRoZSBhYnNvbHV0ZSBjZW50ZXIgcG9pbnQgb2YgdGhlIGNoYXJ0LiBUaGUgJ2NlbnRlcicgb3B0aW9uIG9ubHkgbWFrZXMgc2Vuc2UgaW4gY29uanVuY3Rpb24gd2l0aCB0aGUgJ2xhYmVsT2Zmc2V0JyBvcHRpb24uXG4gICAgbGFiZWxQb3NpdGlvbjogJ2luc2lkZScsXG4gICAgLy8gQW4gaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiBmb3IgdGhlIGxhYmVsIHZhbHVlXG4gICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBDaGFydGlzdC5ub29wLFxuICAgIC8vIExhYmVsIGRpcmVjdGlvbiBjYW4gYmUgJ25ldXRyYWwnLCAnZXhwbG9kZScgb3IgJ2ltcGxvZGUnLiBUaGUgbGFiZWxzIGFuY2hvciB3aWxsIGJlIHBvc2l0aW9uZWQgYmFzZWQgb24gdGhvc2Ugc2V0dGluZ3MgYXMgd2VsbCBhcyB0aGUgZmFjdCBpZiB0aGUgbGFiZWxzIGFyZSBvbiB0aGUgcmlnaHQgb3IgbGVmdCBzaWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGNoYXJ0LiBVc3VhbGx5IGV4cGxvZGUgaXMgdXNlZnVsIHdoZW4gbGFiZWxzIGFyZSBwb3NpdGlvbmVkIGZhciBhd2F5IGZyb20gdGhlIGNlbnRlci5cbiAgICBsYWJlbERpcmVjdGlvbjogJ25ldXRyYWwnLFxuICAgIC8vIElmIHRydWUgdGhlIHdob2xlIGRhdGEgaXMgcmV2ZXJzZWQgaW5jbHVkaW5nIGxhYmVscywgdGhlIHNlcmllcyBvcmRlciBhcyB3ZWxsIGFzIHRoZSB3aG9sZSBzZXJpZXMgZGF0YSBhcnJheXMuXG4gICAgcmV2ZXJzZURhdGE6IGZhbHNlXG4gIH07XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgU1ZHIGFuY2hvciBwb3NpdGlvbiBiYXNlZCBvbiBkaXJlY3Rpb24gYW5kIGNlbnRlciBwYXJhbWV0ZXJcbiAgICpcbiAgICogQHBhcmFtIGNlbnRlclxuICAgKiBAcGFyYW0gbGFiZWxcbiAgICogQHBhcmFtIGRpcmVjdGlvblxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBkZXRlcm1pbmVBbmNob3JQb3NpdGlvbihjZW50ZXIsIGxhYmVsLCBkaXJlY3Rpb24pIHtcbiAgICB2YXIgdG9UaGVSaWdodCA9IGxhYmVsLnggPiBjZW50ZXIueDtcblxuICAgIGlmKHRvVGhlUmlnaHQgJiYgZGlyZWN0aW9uID09PSAnZXhwbG9kZScgfHxcbiAgICAgICF0b1RoZVJpZ2h0ICYmIGRpcmVjdGlvbiA9PT0gJ2ltcGxvZGUnKSB7XG4gICAgICByZXR1cm4gJ3N0YXJ0JztcbiAgICB9IGVsc2UgaWYodG9UaGVSaWdodCAmJiBkaXJlY3Rpb24gPT09ICdpbXBsb2RlJyB8fFxuICAgICAgIXRvVGhlUmlnaHQgJiYgZGlyZWN0aW9uID09PSAnZXhwbG9kZScpIHtcbiAgICAgIHJldHVybiAnZW5kJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdtaWRkbGUnO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBwaWUgY2hhcnRcbiAgICpcbiAgICogQHBhcmFtIG9wdGlvbnNcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUNoYXJ0KG9wdGlvbnMpIHtcbiAgICB2YXIgc2VyaWVzR3JvdXBzID0gW10sXG4gICAgICBsYWJlbHNHcm91cCxcbiAgICAgIGNoYXJ0UmVjdCxcbiAgICAgIHJhZGl1cyxcbiAgICAgIGxhYmVsUmFkaXVzLFxuICAgICAgdG90YWxEYXRhU3VtLFxuICAgICAgc3RhcnRBbmdsZSA9IG9wdGlvbnMuc3RhcnRBbmdsZSxcbiAgICAgIGRhdGFBcnJheSA9IENoYXJ0aXN0LmdldERhdGFBcnJheSh0aGlzLmRhdGEsIG9wdGlvbnMucmV2ZXJzZURhdGEpO1xuXG4gICAgLy8gQ3JlYXRlIFNWRy5qcyBkcmF3XG4gICAgdGhpcy5zdmcgPSBDaGFydGlzdC5jcmVhdGVTdmcodGhpcy5jb250YWluZXIsIG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0LG9wdGlvbnMuZG9udXQgPyBvcHRpb25zLmNsYXNzTmFtZXMuY2hhcnREb251dCA6IG9wdGlvbnMuY2xhc3NOYW1lcy5jaGFydFBpZSk7XG4gICAgLy8gQ2FsY3VsYXRlIGNoYXJ0aW5nIHJlY3RcbiAgICBjaGFydFJlY3QgPSBDaGFydGlzdC5jcmVhdGVDaGFydFJlY3QodGhpcy5zdmcsIG9wdGlvbnMsIGRlZmF1bHRPcHRpb25zLnBhZGRpbmcpO1xuICAgIC8vIEdldCBiaWdnZXN0IGNpcmNsZSByYWRpdXMgcG9zc2libGUgd2l0aGluIGNoYXJ0UmVjdFxuICAgIHJhZGl1cyA9IE1hdGgubWluKGNoYXJ0UmVjdC53aWR0aCgpIC8gMiwgY2hhcnRSZWN0LmhlaWdodCgpIC8gMik7XG4gICAgLy8gQ2FsY3VsYXRlIHRvdGFsIG9mIGFsbCBzZXJpZXMgdG8gZ2V0IHJlZmVyZW5jZSB2YWx1ZSBvciB1c2UgdG90YWwgcmVmZXJlbmNlIGZyb20gb3B0aW9uYWwgb3B0aW9uc1xuICAgIHRvdGFsRGF0YVN1bSA9IG9wdGlvbnMudG90YWwgfHwgZGF0YUFycmF5LnJlZHVjZShmdW5jdGlvbihwcmV2aW91c1ZhbHVlLCBjdXJyZW50VmFsdWUpIHtcbiAgICAgIHJldHVybiBwcmV2aW91c1ZhbHVlICsgY3VycmVudFZhbHVlO1xuICAgIH0sIDApO1xuXG4gICAgdmFyIGRvbnV0V2lkdGggPSBDaGFydGlzdC5xdWFudGl0eShvcHRpb25zLmRvbnV0V2lkdGgpO1xuICAgIGlmIChkb251dFdpZHRoLnVuaXQgPT09ICclJykge1xuICAgICAgZG9udXRXaWR0aC52YWx1ZSAqPSByYWRpdXMgLyAxMDA7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhpcyBpcyBhIGRvbnV0IGNoYXJ0IHdlIG5lZWQgdG8gYWRqdXN0IG91ciByYWRpdXMgdG8gZW5hYmxlIHN0cm9rZXMgdG8gYmUgZHJhd24gaW5zaWRlXG4gICAgLy8gVW5mb3J0dW5hdGVseSB0aGlzIGlzIG5vdCBwb3NzaWJsZSB3aXRoIHRoZSBjdXJyZW50IFNWRyBTcGVjXG4gICAgLy8gU2VlIHRoaXMgcHJvcG9zYWwgZm9yIG1vcmUgZGV0YWlsczogaHR0cDovL2xpc3RzLnczLm9yZy9BcmNoaXZlcy9QdWJsaWMvd3d3LXN2Zy8yMDAzT2N0LzAwMDAuaHRtbFxuICAgIHJhZGl1cyAtPSBvcHRpb25zLmRvbnV0ID8gZG9udXRXaWR0aC52YWx1ZSAvIDIgIDogMDtcblxuICAgIC8vIElmIGxhYmVsUG9zaXRpb24gaXMgc2V0IHRvIGBvdXRzaWRlYCBvciBhIGRvbnV0IGNoYXJ0IGlzIGRyYXduIHRoZW4gdGhlIGxhYmVsIHBvc2l0aW9uIGlzIGF0IHRoZSByYWRpdXMsXG4gICAgLy8gaWYgcmVndWxhciBwaWUgY2hhcnQgaXQncyBoYWxmIG9mIHRoZSByYWRpdXNcbiAgICBpZihvcHRpb25zLmxhYmVsUG9zaXRpb24gPT09ICdvdXRzaWRlJyB8fCBvcHRpb25zLmRvbnV0KSB7XG4gICAgICBsYWJlbFJhZGl1cyA9IHJhZGl1cztcbiAgICB9IGVsc2UgaWYob3B0aW9ucy5sYWJlbFBvc2l0aW9uID09PSAnY2VudGVyJykge1xuICAgICAgLy8gSWYgbGFiZWxQb3NpdGlvbiBpcyBjZW50ZXIgd2Ugc3RhcnQgd2l0aCAwIGFuZCB3aWxsIGxhdGVyIHdhaXQgZm9yIHRoZSBsYWJlbE9mZnNldFxuICAgICAgbGFiZWxSYWRpdXMgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWZhdWx0IG9wdGlvbiBpcyAnaW5zaWRlJyB3aGVyZSB3ZSB1c2UgaGFsZiB0aGUgcmFkaXVzIHNvIHRoZSBsYWJlbCB3aWxsIGJlIHBsYWNlZCBpbiB0aGUgY2VudGVyIG9mIHRoZSBwaWVcbiAgICAgIC8vIHNsaWNlXG4gICAgICBsYWJlbFJhZGl1cyA9IHJhZGl1cyAvIDI7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgb2Zmc2V0IHRvIHRoZSBsYWJlbFJhZGl1cyB3aGVyZSBhIG5lZ2F0aXZlIG9mZnNldCBtZWFucyBjbG9zZWQgdG8gdGhlIGNlbnRlciBvZiB0aGUgY2hhcnRcbiAgICBsYWJlbFJhZGl1cyArPSBvcHRpb25zLmxhYmVsT2Zmc2V0O1xuXG4gICAgLy8gQ2FsY3VsYXRlIGVuZCBhbmdsZSBiYXNlZCBvbiB0b3RhbCBzdW0gYW5kIGN1cnJlbnQgZGF0YSB2YWx1ZSBhbmQgb2Zmc2V0IHdpdGggcGFkZGluZ1xuICAgIHZhciBjZW50ZXIgPSB7XG4gICAgICB4OiBjaGFydFJlY3QueDEgKyBjaGFydFJlY3Qud2lkdGgoKSAvIDIsXG4gICAgICB5OiBjaGFydFJlY3QueTIgKyBjaGFydFJlY3QuaGVpZ2h0KCkgLyAyXG4gICAgfTtcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIG9ubHkgb25lIG5vbi16ZXJvIHZhbHVlIGluIHRoZSBzZXJpZXMgYXJyYXkuXG4gICAgdmFyIGhhc1NpbmdsZVZhbEluU2VyaWVzID0gdGhpcy5kYXRhLnNlcmllcy5maWx0ZXIoZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdmFsLmhhc093blByb3BlcnR5KCd2YWx1ZScpID8gdmFsLnZhbHVlICE9PSAwIDogdmFsICE9PSAwO1xuICAgIH0pLmxlbmd0aCA9PT0gMTtcblxuICAgIC8vaWYgd2UgbmVlZCB0byBzaG93IGxhYmVscyB3ZSBjcmVhdGUgdGhlIGxhYmVsIGdyb3VwIG5vd1xuICAgIGlmKG9wdGlvbnMuc2hvd0xhYmVsKSB7XG4gICAgICBsYWJlbHNHcm91cCA9IHRoaXMuc3ZnLmVsZW0oJ2cnLCBudWxsLCBudWxsLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBEcmF3IHRoZSBzZXJpZXNcbiAgICAvLyBpbml0aWFsaXplIHNlcmllcyBncm91cHNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5zZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzZXJpZXMgPSB0aGlzLmRhdGEuc2VyaWVzW2ldO1xuICAgICAgc2VyaWVzR3JvdXBzW2ldID0gdGhpcy5zdmcuZWxlbSgnZycsIG51bGwsIG51bGwsIHRydWUpO1xuXG4gICAgICAvLyBJZiB0aGUgc2VyaWVzIGlzIGFuIG9iamVjdCBhbmQgY29udGFpbnMgYSBuYW1lIG9yIG1ldGEgZGF0YSB3ZSBhZGQgYSBjdXN0b20gYXR0cmlidXRlXG4gICAgICBzZXJpZXNHcm91cHNbaV0uYXR0cih7XG4gICAgICAgICdzZXJpZXMtbmFtZSc6IHNlcmllcy5uYW1lXG4gICAgICB9LCBDaGFydGlzdC54bWxOcy51cmkpO1xuXG4gICAgICAvLyBVc2Ugc2VyaWVzIGNsYXNzIGZyb20gc2VyaWVzIGRhdGEgb3IgaWYgbm90IHNldCBnZW5lcmF0ZSBvbmVcbiAgICAgIHNlcmllc0dyb3Vwc1tpXS5hZGRDbGFzcyhbXG4gICAgICAgIG9wdGlvbnMuY2xhc3NOYW1lcy5zZXJpZXMsXG4gICAgICAgIChzZXJpZXMuY2xhc3NOYW1lIHx8IG9wdGlvbnMuY2xhc3NOYW1lcy5zZXJpZXMgKyAnLScgKyBDaGFydGlzdC5hbHBoYU51bWVyYXRlKGkpKVxuICAgICAgXS5qb2luKCcgJykpO1xuXG4gICAgICB2YXIgZW5kQW5nbGUgPSBzdGFydEFuZ2xlICsgZGF0YUFycmF5W2ldIC8gdG90YWxEYXRhU3VtICogMzYwO1xuICAgICAgLy8gSWYgd2UgbmVlZCB0byBkcmF3IHRoZSBhcmMgZm9yIGFsbCAzNjAgZGVncmVlcyB3ZSBuZWVkIHRvIGFkZCBhIGhhY2sgd2hlcmUgd2UgY2xvc2UgdGhlIGNpcmNsZVxuICAgICAgLy8gd2l0aCBaIGFuZCB1c2UgMzU5Ljk5IGRlZ3JlZXNcbiAgICAgIGlmKGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSA9PT0gMzYwKSB7XG4gICAgICAgIGVuZEFuZ2xlIC09IDAuMDE7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdGFydCA9IENoYXJ0aXN0LnBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyLngsIGNlbnRlci55LCByYWRpdXMsIHN0YXJ0QW5nbGUgLSAoaSA9PT0gMCB8fCBoYXNTaW5nbGVWYWxJblNlcmllcyA/IDAgOiAwLjIpKSxcbiAgICAgICAgZW5kID0gQ2hhcnRpc3QucG9sYXJUb0NhcnRlc2lhbihjZW50ZXIueCwgY2VudGVyLnksIHJhZGl1cywgZW5kQW5nbGUpO1xuXG4gICAgICAvLyBDcmVhdGUgYSBuZXcgcGF0aCBlbGVtZW50IGZvciB0aGUgcGllIGNoYXJ0LiBJZiB0aGlzIGlzbid0IGEgZG9udXQgY2hhcnQgd2Ugc2hvdWxkIGNsb3NlIHRoZSBwYXRoIGZvciBhIGNvcnJlY3Qgc3Ryb2tlXG4gICAgICB2YXIgcGF0aCA9IG5ldyBDaGFydGlzdC5TdmcuUGF0aCghb3B0aW9ucy5kb251dClcbiAgICAgICAgLm1vdmUoZW5kLngsIGVuZC55KVxuICAgICAgICAuYXJjKHJhZGl1cywgcmFkaXVzLCAwLCBlbmRBbmdsZSAtIHN0YXJ0QW5nbGUgPiAxODAsIDAsIHN0YXJ0LngsIHN0YXJ0LnkpO1xuXG4gICAgICAvLyBJZiByZWd1bGFyIHBpZSBjaGFydCAobm8gZG9udXQpIHdlIGFkZCBhIGxpbmUgdG8gdGhlIGNlbnRlciBvZiB0aGUgY2lyY2xlIGZvciBjb21wbGV0aW5nIHRoZSBwaWVcbiAgICAgIGlmKCFvcHRpb25zLmRvbnV0KSB7XG4gICAgICAgIHBhdGgubGluZShjZW50ZXIueCwgY2VudGVyLnkpO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgdGhlIFNWRyBwYXRoXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgZG9udXQgY2hhcnQgd2UgYWRkIHRoZSBkb251dCBjbGFzcywgb3RoZXJ3aXNlIGp1c3QgYSByZWd1bGFyIHNsaWNlXG4gICAgICB2YXIgcGF0aEVsZW1lbnQgPSBzZXJpZXNHcm91cHNbaV0uZWxlbSgncGF0aCcsIHtcbiAgICAgICAgZDogcGF0aC5zdHJpbmdpZnkoKVxuICAgICAgfSwgb3B0aW9ucy5kb251dCA/IG9wdGlvbnMuY2xhc3NOYW1lcy5zbGljZURvbnV0IDogb3B0aW9ucy5jbGFzc05hbWVzLnNsaWNlUGllKTtcblxuICAgICAgLy8gQWRkaW5nIHRoZSBwaWUgc2VyaWVzIHZhbHVlIHRvIHRoZSBwYXRoXG4gICAgICBwYXRoRWxlbWVudC5hdHRyKHtcbiAgICAgICAgJ3ZhbHVlJzogZGF0YUFycmF5W2ldLFxuICAgICAgICAnbWV0YSc6IENoYXJ0aXN0LnNlcmlhbGl6ZShzZXJpZXMubWV0YSlcbiAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgYSBkb251dCwgd2UgYWRkIHRoZSBzdHJva2Utd2lkdGggYXMgc3R5bGUgYXR0cmlidXRlXG4gICAgICBpZihvcHRpb25zLmRvbnV0KSB7XG4gICAgICAgIHBhdGhFbGVtZW50LmF0dHIoe1xuICAgICAgICAgICdzdHlsZSc6ICdzdHJva2Utd2lkdGg6ICcgKyBkb251dFdpZHRoLnZhbHVlICsgJ3B4J1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gRmlyZSBvZmYgZHJhdyBldmVudFxuICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsIHtcbiAgICAgICAgdHlwZTogJ3NsaWNlJyxcbiAgICAgICAgdmFsdWU6IGRhdGFBcnJheVtpXSxcbiAgICAgICAgdG90YWxEYXRhU3VtOiB0b3RhbERhdGFTdW0sXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBtZXRhOiBzZXJpZXMubWV0YSxcbiAgICAgICAgc2VyaWVzOiBzZXJpZXMsXG4gICAgICAgIGdyb3VwOiBzZXJpZXNHcm91cHNbaV0sXG4gICAgICAgIGVsZW1lbnQ6IHBhdGhFbGVtZW50LFxuICAgICAgICBwYXRoOiBwYXRoLmNsb25lKCksXG4gICAgICAgIGNlbnRlcjogY2VudGVyLFxuICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgc3RhcnRBbmdsZTogc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGU6IGVuZEFuZ2xlXG4gICAgICB9KTtcblxuICAgICAgLy8gSWYgd2UgbmVlZCB0byBzaG93IGxhYmVscyB3ZSBuZWVkIHRvIGFkZCB0aGUgbGFiZWwgZm9yIHRoaXMgc2xpY2Ugbm93XG4gICAgICBpZihvcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAvLyBQb3NpdGlvbiBhdCB0aGUgbGFiZWxSYWRpdXMgZGlzdGFuY2UgZnJvbSBjZW50ZXIgYW5kIGJldHdlZW4gc3RhcnQgYW5kIGVuZCBhbmdsZVxuICAgICAgICB2YXIgbGFiZWxQb3NpdGlvbiA9IENoYXJ0aXN0LnBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyLngsIGNlbnRlci55LCBsYWJlbFJhZGl1cywgc3RhcnRBbmdsZSArIChlbmRBbmdsZSAtIHN0YXJ0QW5nbGUpIC8gMiksXG4gICAgICAgICAgaW50ZXJwb2xhdGVkVmFsdWUgPSBvcHRpb25zLmxhYmVsSW50ZXJwb2xhdGlvbkZuYyh0aGlzLmRhdGEubGFiZWxzID8gdGhpcy5kYXRhLmxhYmVsc1tpXSA6IGRhdGFBcnJheVtpXSwgaSk7XG5cbiAgICAgICAgaWYoaW50ZXJwb2xhdGVkVmFsdWUgfHwgaW50ZXJwb2xhdGVkVmFsdWUgPT09IDApIHtcbiAgICAgICAgICB2YXIgbGFiZWxFbGVtZW50ID0gbGFiZWxzR3JvdXAuZWxlbSgndGV4dCcsIHtcbiAgICAgICAgICAgIGR4OiBsYWJlbFBvc2l0aW9uLngsXG4gICAgICAgICAgICBkeTogbGFiZWxQb3NpdGlvbi55LFxuICAgICAgICAgICAgJ3RleHQtYW5jaG9yJzogZGV0ZXJtaW5lQW5jaG9yUG9zaXRpb24oY2VudGVyLCBsYWJlbFBvc2l0aW9uLCBvcHRpb25zLmxhYmVsRGlyZWN0aW9uKVxuICAgICAgICAgIH0sIG9wdGlvbnMuY2xhc3NOYW1lcy5sYWJlbCkudGV4dCgnJyArIGludGVycG9sYXRlZFZhbHVlKTtcblxuICAgICAgICAgIC8vIEZpcmUgb2ZmIGRyYXcgZXZlbnRcbiAgICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdkcmF3Jywge1xuICAgICAgICAgICAgdHlwZTogJ2xhYmVsJyxcbiAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgZ3JvdXA6IGxhYmVsc0dyb3VwLFxuICAgICAgICAgICAgZWxlbWVudDogbGFiZWxFbGVtZW50LFxuICAgICAgICAgICAgdGV4dDogJycgKyBpbnRlcnBvbGF0ZWRWYWx1ZSxcbiAgICAgICAgICAgIHg6IGxhYmVsUG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6IGxhYmVsUG9zaXRpb24ueVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCBuZXh0IHN0YXJ0QW5nbGUgdG8gY3VycmVudCBlbmRBbmdsZS4gVXNlIHNsaWdodCBvZmZzZXQgc28gdGhlcmUgYXJlIG5vIHRyYW5zcGFyZW50IGhhaXJsaW5lIGlzc3Vlc1xuICAgICAgLy8gKGV4Y2VwdCBmb3IgbGFzdCBzbGljZSlcbiAgICAgIHN0YXJ0QW5nbGUgPSBlbmRBbmdsZTtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdjcmVhdGVkJywge1xuICAgICAgY2hhcnRSZWN0OiBjaGFydFJlY3QsXG4gICAgICBzdmc6IHRoaXMuc3ZnLFxuICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgcGllIGNoYXJ0IGFuZCByZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZHJhdyB0aGUgY2hhcnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5QaWVcbiAgICogQHBhcmFtIHtTdHJpbmd8Tm9kZX0gcXVlcnkgQSBzZWxlY3RvciBxdWVyeSBzdHJpbmcgb3IgZGlyZWN0bHkgYSBET00gZWxlbWVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YSBvYmplY3QgaW4gdGhlIHBpZSBjaGFydCBuZWVkcyB0byBoYXZlIGEgc2VyaWVzIHByb3BlcnR5IHdpdGggYSBvbmUgZGltZW5zaW9uYWwgZGF0YSBhcnJheS4gVGhlIHZhbHVlcyB3aWxsIGJlIG5vcm1hbGl6ZWQgYWdhaW5zdCBlYWNoIG90aGVyIGFuZCBkb24ndCBuZWNlc3NhcmlseSBuZWVkIHRvIGJlIGluIHBlcmNlbnRhZ2UuIFRoZSBzZXJpZXMgcHJvcGVydHkgY2FuIGFsc28gYmUgYW4gYXJyYXkgb2YgdmFsdWUgb2JqZWN0cyB0aGF0IGNvbnRhaW4gYSB2YWx1ZSBwcm9wZXJ0eSBhbmQgYSBjbGFzc05hbWUgcHJvcGVydHkgdG8gb3ZlcnJpZGUgdGhlIENTUyBjbGFzcyBuYW1lIGZvciB0aGUgc2VyaWVzIGdyb3VwLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdCB3aXRoIG9wdGlvbnMgdGhhdCBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zLiBDaGVjayB0aGUgZXhhbXBsZXMgZm9yIGEgZGV0YWlsZWQgbGlzdC5cbiAgICogQHBhcmFtIHtBcnJheX0gW3Jlc3BvbnNpdmVPcHRpb25zXSBTcGVjaWZ5IGFuIGFycmF5IG9mIHJlc3BvbnNpdmUgb3B0aW9uIGFycmF5cyB3aGljaCBhcmUgYSBtZWRpYSBxdWVyeSBhbmQgb3B0aW9ucyBvYmplY3QgcGFpciA9PiBbW21lZGlhUXVlcnlTdHJpbmcsIG9wdGlvbnNPYmplY3RdLFttb3JlLi4uXV1cbiAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3Qgd2l0aCBhIHZlcnNpb24gYW5kIGFuIHVwZGF0ZSBtZXRob2QgdG8gbWFudWFsbHkgcmVkcmF3IHRoZSBjaGFydFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBTaW1wbGUgcGllIGNoYXJ0IGV4YW1wbGUgd2l0aCBmb3VyIHNlcmllc1xuICAgKiBuZXcgQ2hhcnRpc3QuUGllKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgc2VyaWVzOiBbMTAsIDIsIDQsIDNdXG4gICAqIH0pO1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBEcmF3aW5nIGEgZG9udXQgY2hhcnRcbiAgICogbmV3IENoYXJ0aXN0LlBpZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIHNlcmllczogWzEwLCAyLCA0LCAzXVxuICAgKiB9LCB7XG4gICAqICAgZG9udXQ6IHRydWVcbiAgICogfSk7XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFVzaW5nIGRvbnV0LCBzdGFydEFuZ2xlIGFuZCB0b3RhbCB0byBkcmF3IGEgZ2F1Z2UgY2hhcnRcbiAgICogbmV3IENoYXJ0aXN0LlBpZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIHNlcmllczogWzIwLCAxMCwgMzAsIDQwXVxuICAgKiB9LCB7XG4gICAqICAgZG9udXQ6IHRydWUsXG4gICAqICAgZG9udXRXaWR0aDogMjAsXG4gICAqICAgc3RhcnRBbmdsZTogMjcwLFxuICAgKiAgIHRvdGFsOiAyMDBcbiAgICogfSk7XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIERyYXdpbmcgYSBwaWUgY2hhcnQgd2l0aCBwYWRkaW5nIGFuZCBsYWJlbHMgdGhhdCBhcmUgb3V0c2lkZSB0aGUgcGllXG4gICAqIG5ldyBDaGFydGlzdC5QaWUoJy5jdC1jaGFydCcsIHtcbiAgICogICBzZXJpZXM6IFsyMCwgMTAsIDMwLCA0MF1cbiAgICogfSwge1xuICAgKiAgIGNoYXJ0UGFkZGluZzogMzAsXG4gICAqICAgbGFiZWxPZmZzZXQ6IDUwLFxuICAgKiAgIGxhYmVsRGlyZWN0aW9uOiAnZXhwbG9kZSdcbiAgICogfSk7XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIE92ZXJyaWRpbmcgdGhlIGNsYXNzIG5hbWVzIGZvciBpbmRpdmlkdWFsIHNlcmllcyBhcyB3ZWxsIGFzIGEgbmFtZSBhbmQgbWV0YSBkYXRhLlxuICAgKiAvLyBUaGUgbmFtZSB3aWxsIGJlIHdyaXR0ZW4gYXMgY3Q6c2VyaWVzLW5hbWUgYXR0cmlidXRlIGFuZCB0aGUgbWV0YSBkYXRhIHdpbGwgYmUgc2VyaWFsaXplZCBhbmQgd3JpdHRlblxuICAgKiAvLyB0byBhIGN0Om1ldGEgYXR0cmlidXRlLlxuICAgKiBuZXcgQ2hhcnRpc3QuUGllKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgc2VyaWVzOiBbe1xuICAgKiAgICAgdmFsdWU6IDIwLFxuICAgKiAgICAgbmFtZTogJ1NlcmllcyAxJyxcbiAgICogICAgIGNsYXNzTmFtZTogJ215LWN1c3RvbS1jbGFzcy1vbmUnLFxuICAgKiAgICAgbWV0YTogJ01ldGEgT25lJ1xuICAgKiAgIH0sIHtcbiAgICogICAgIHZhbHVlOiAxMCxcbiAgICogICAgIG5hbWU6ICdTZXJpZXMgMicsXG4gICAqICAgICBjbGFzc05hbWU6ICdteS1jdXN0b20tY2xhc3MtdHdvJyxcbiAgICogICAgIG1ldGE6ICdNZXRhIFR3bydcbiAgICogICB9LCB7XG4gICAqICAgICB2YWx1ZTogNzAsXG4gICAqICAgICBuYW1lOiAnU2VyaWVzIDMnLFxuICAgKiAgICAgY2xhc3NOYW1lOiAnbXktY3VzdG9tLWNsYXNzLXRocmVlJyxcbiAgICogICAgIG1ldGE6ICdNZXRhIFRocmVlJ1xuICAgKiAgIH1dXG4gICAqIH0pO1xuICAgKi9cbiAgZnVuY3Rpb24gUGllKHF1ZXJ5LCBkYXRhLCBvcHRpb25zLCByZXNwb25zaXZlT3B0aW9ucykge1xuICAgIENoYXJ0aXN0LlBpZS5zdXBlci5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsXG4gICAgICBxdWVyeSxcbiAgICAgIGRhdGEsXG4gICAgICBkZWZhdWx0T3B0aW9ucyxcbiAgICAgIENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLFxuICAgICAgcmVzcG9uc2l2ZU9wdGlvbnMpO1xuICB9XG5cbiAgLy8gQ3JlYXRpbmcgcGllIGNoYXJ0IHR5cGUgaW4gQ2hhcnRpc3QgbmFtZXNwYWNlXG4gIENoYXJ0aXN0LlBpZSA9IENoYXJ0aXN0LkJhc2UuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogUGllLFxuICAgIGNyZWF0ZUNoYXJ0OiBjcmVhdGVDaGFydCxcbiAgICBkZXRlcm1pbmVBbmNob3JQb3NpdGlvbjogZGV0ZXJtaW5lQW5jaG9yUG9zaXRpb25cbiAgfSk7XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcblxucmV0dXJuIENoYXJ0aXN0O1xuXG59KSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB0aWNreSA9IHJlcXVpcmUoJ3RpY2t5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVib3VuY2UgKGZuLCBhcmdzLCBjdHgpIHtcbiAgaWYgKCFmbikgeyByZXR1cm47IH1cbiAgdGlja3koZnVuY3Rpb24gcnVuICgpIHtcbiAgICBmbi5hcHBseShjdHggfHwgbnVsbCwgYXJncyB8fCBbXSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGF0b2EgPSByZXF1aXJlKCdhdG9hJyk7XG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCcuL2RlYm91bmNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW1pdHRlciAodGhpbmcsIG9wdGlvbnMpIHtcbiAgdmFyIG9wdHMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgZXZ0ID0ge307XG4gIGlmICh0aGluZyA9PT0gdW5kZWZpbmVkKSB7IHRoaW5nID0ge307IH1cbiAgdGhpbmcub24gPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICBpZiAoIWV2dFt0eXBlXSkge1xuICAgICAgZXZ0W3R5cGVdID0gW2ZuXTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZ0W3R5cGVdLnB1c2goZm4pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpbmc7XG4gIH07XG4gIHRoaW5nLm9uY2UgPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICBmbi5fb25jZSA9IHRydWU7IC8vIHRoaW5nLm9mZihmbikgc3RpbGwgd29ya3MhXG4gICAgdGhpbmcub24odHlwZSwgZm4pO1xuICAgIHJldHVybiB0aGluZztcbiAgfTtcbiAgdGhpbmcub2ZmID0gZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmIChjID09PSAxKSB7XG4gICAgICBkZWxldGUgZXZ0W3R5cGVdO1xuICAgIH0gZWxzZSBpZiAoYyA9PT0gMCkge1xuICAgICAgZXZ0ID0ge307XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBldCA9IGV2dFt0eXBlXTtcbiAgICAgIGlmICghZXQpIHsgcmV0dXJuIHRoaW5nOyB9XG4gICAgICBldC5zcGxpY2UoZXQuaW5kZXhPZihmbiksIDEpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpbmc7XG4gIH07XG4gIHRoaW5nLmVtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBhdG9hKGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaW5nLmVtaXR0ZXJTbmFwc2hvdChhcmdzLnNoaWZ0KCkpLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9O1xuICB0aGluZy5lbWl0dGVyU25hcHNob3QgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgIHZhciBldCA9IChldnRbdHlwZV0gfHwgW10pLnNsaWNlKDApO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IGF0b2EoYXJndW1lbnRzKTtcbiAgICAgIHZhciBjdHggPSB0aGlzIHx8IHRoaW5nO1xuICAgICAgaWYgKHR5cGUgPT09ICdlcnJvcicgJiYgb3B0cy50aHJvd3MgIT09IGZhbHNlICYmICFldC5sZW5ndGgpIHsgdGhyb3cgYXJncy5sZW5ndGggPT09IDEgPyBhcmdzWzBdIDogYXJnczsgfVxuICAgICAgZXQuZm9yRWFjaChmdW5jdGlvbiBlbWl0dGVyIChsaXN0ZW4pIHtcbiAgICAgICAgaWYgKG9wdHMuYXN5bmMpIHsgZGVib3VuY2UobGlzdGVuLCBhcmdzLCBjdHgpOyB9IGVsc2UgeyBsaXN0ZW4uYXBwbHkoY3R4LCBhcmdzKTsgfVxuICAgICAgICBpZiAobGlzdGVuLl9vbmNlKSB7IHRoaW5nLm9mZih0eXBlLCBsaXN0ZW4pOyB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGluZztcbiAgICB9O1xuICB9O1xuICByZXR1cm4gdGhpbmc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3VzdG9tRXZlbnQgPSByZXF1aXJlKCdjdXN0b20tZXZlbnQnKTtcbnZhciBldmVudG1hcCA9IHJlcXVpcmUoJy4vZXZlbnRtYXAnKTtcbnZhciBkb2MgPSBnbG9iYWwuZG9jdW1lbnQ7XG52YXIgYWRkRXZlbnQgPSBhZGRFdmVudEVhc3k7XG52YXIgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEVhc3k7XG52YXIgaGFyZENhY2hlID0gW107XG5cbmlmICghZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgYWRkRXZlbnQgPSBhZGRFdmVudEhhcmQ7XG4gIHJlbW92ZUV2ZW50ID0gcmVtb3ZlRXZlbnRIYXJkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGRFdmVudCxcbiAgcmVtb3ZlOiByZW1vdmVFdmVudCxcbiAgZmFicmljYXRlOiBmYWJyaWNhdGVFdmVudFxufTtcblxuZnVuY3Rpb24gYWRkRXZlbnRFYXN5IChlbCwgdHlwZSwgZm4sIGNhcHR1cmluZykge1xuICByZXR1cm4gZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyaW5nKTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRIYXJkIChlbCwgdHlwZSwgZm4pIHtcbiAgcmV0dXJuIGVsLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCB3cmFwKGVsLCB0eXBlLCBmbikpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEVhc3kgKGVsLCB0eXBlLCBmbiwgY2FwdHVyaW5nKSB7XG4gIHJldHVybiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJpbmcpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEhhcmQgKGVsLCB0eXBlLCBmbikge1xuICB2YXIgbGlzdGVuZXIgPSB1bndyYXAoZWwsIHR5cGUsIGZuKTtcbiAgaWYgKGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIGVsLmRldGFjaEV2ZW50KCdvbicgKyB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmFicmljYXRlRXZlbnQgKGVsLCB0eXBlLCBtb2RlbCkge1xuICB2YXIgZSA9IGV2ZW50bWFwLmluZGV4T2YodHlwZSkgPT09IC0xID8gbWFrZUN1c3RvbUV2ZW50KCkgOiBtYWtlQ2xhc3NpY0V2ZW50KCk7XG4gIGlmIChlbC5kaXNwYXRjaEV2ZW50KSB7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5maXJlRXZlbnQoJ29uJyArIHR5cGUsIGUpO1xuICB9XG4gIGZ1bmN0aW9uIG1ha2VDbGFzc2ljRXZlbnQgKCkge1xuICAgIHZhciBlO1xuICAgIGlmIChkb2MuY3JlYXRlRXZlbnQpIHtcbiAgICAgIGUgPSBkb2MuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICBlLmluaXRFdmVudCh0eXBlLCB0cnVlLCB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKGRvYy5jcmVhdGVFdmVudE9iamVjdCkge1xuICAgICAgZSA9IGRvYy5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgIH1cbiAgICByZXR1cm4gZTtcbiAgfVxuICBmdW5jdGlvbiBtYWtlQ3VzdG9tRXZlbnQgKCkge1xuICAgIHJldHVybiBuZXcgY3VzdG9tRXZlbnQodHlwZSwgeyBkZXRhaWw6IG1vZGVsIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBwZXJGYWN0b3J5IChlbCwgdHlwZSwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXBwZXIgKG9yaWdpbmFsRXZlbnQpIHtcbiAgICB2YXIgZSA9IG9yaWdpbmFsRXZlbnQgfHwgZ2xvYmFsLmV2ZW50O1xuICAgIGUudGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGUucHJldmVudERlZmF1bHQgPSBlLnByZXZlbnREZWZhdWx0IHx8IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0ICgpIHsgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9O1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uID0gZS5zdG9wUHJvcGFnYXRpb24gfHwgZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uICgpIHsgZS5jYW5jZWxCdWJibGUgPSB0cnVlOyB9O1xuICAgIGUud2hpY2ggPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBmbi5jYWxsKGVsLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gd3JhcCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciB3cmFwcGVyID0gdW53cmFwKGVsLCB0eXBlLCBmbikgfHwgd3JhcHBlckZhY3RvcnkoZWwsIHR5cGUsIGZuKTtcbiAgaGFyZENhY2hlLnB1c2goe1xuICAgIHdyYXBwZXI6IHdyYXBwZXIsXG4gICAgZWxlbWVudDogZWwsXG4gICAgdHlwZTogdHlwZSxcbiAgICBmbjogZm5cbiAgfSk7XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiB1bndyYXAgKGVsLCB0eXBlLCBmbikge1xuICB2YXIgaSA9IGZpbmQoZWwsIHR5cGUsIGZuKTtcbiAgaWYgKGkpIHtcbiAgICB2YXIgd3JhcHBlciA9IGhhcmRDYWNoZVtpXS53cmFwcGVyO1xuICAgIGhhcmRDYWNoZS5zcGxpY2UoaSwgMSk7IC8vIGZyZWUgdXAgYSB0YWQgb2YgbWVtb3J5XG4gICAgcmV0dXJuIHdyYXBwZXI7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBpLCBpdGVtO1xuICBmb3IgKGkgPSAwOyBpIDwgaGFyZENhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgaXRlbSA9IGhhcmRDYWNoZVtpXTtcbiAgICBpZiAoaXRlbS5lbGVtZW50ID09PSBlbCAmJiBpdGVtLnR5cGUgPT09IHR5cGUgJiYgaXRlbS5mbiA9PT0gZm4pIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXZlbnRtYXAgPSBbXTtcbnZhciBldmVudG5hbWUgPSAnJztcbnZhciByb24gPSAvXm9uLztcblxuZm9yIChldmVudG5hbWUgaW4gZ2xvYmFsKSB7XG4gIGlmIChyb24udGVzdChldmVudG5hbWUpKSB7XG4gICAgZXZlbnRtYXAucHVzaChldmVudG5hbWUuc2xpY2UoMikpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXZlbnRtYXA7XG4iLCJcbnZhciBOYXRpdmVDdXN0b21FdmVudCA9IGdsb2JhbC5DdXN0b21FdmVudDtcblxuZnVuY3Rpb24gdXNlTmF0aXZlICgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgcCA9IG5ldyBOYXRpdmVDdXN0b21FdmVudCgnY2F0JywgeyBkZXRhaWw6IHsgZm9vOiAnYmFyJyB9IH0pO1xuICAgIHJldHVybiAgJ2NhdCcgPT09IHAudHlwZSAmJiAnYmFyJyA9PT0gcC5kZXRhaWwuZm9vO1xuICB9IGNhdGNoIChlKSB7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENyb3NzLWJyb3dzZXIgYEN1c3RvbUV2ZW50YCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQuQ3VzdG9tRXZlbnRcbiAqXG4gKiBAcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB1c2VOYXRpdmUoKSA/IE5hdGl2ZUN1c3RvbUV2ZW50IDpcblxuLy8gSUUgPj0gOVxuJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID8gZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKHR5cGUsIHBhcmFtcykge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICBpZiAocGFyYW1zKSB7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgfSBlbHNlIHtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIHZvaWQgMCk7XG4gIH1cbiAgcmV0dXJuIGU7XG59IDpcblxuLy8gSUUgPD0gOFxuZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKHR5cGUsIHBhcmFtcykge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gIGUudHlwZSA9IHR5cGU7XG4gIGlmIChwYXJhbXMpIHtcbiAgICBlLmJ1YmJsZXMgPSBCb29sZWFuKHBhcmFtcy5idWJibGVzKTtcbiAgICBlLmNhbmNlbGFibGUgPSBCb29sZWFuKHBhcmFtcy5jYW5jZWxhYmxlKTtcbiAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gIH0gZWxzZSB7XG4gICAgZS5idWJibGVzID0gZmFsc2U7XG4gICAgZS5jYW5jZWxhYmxlID0gZmFsc2U7XG4gICAgZS5kZXRhaWwgPSB2b2lkIDA7XG4gIH1cbiAgcmV0dXJuIGU7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjYWNoZSA9IHt9O1xudmFyIHN0YXJ0ID0gJyg/Ol58XFxcXHMpJztcbnZhciBlbmQgPSAnKD86XFxcXHN8JCknO1xuXG5mdW5jdGlvbiBsb29rdXBDbGFzcyAoY2xhc3NOYW1lKSB7XG4gIHZhciBjYWNoZWQgPSBjYWNoZVtjbGFzc05hbWVdO1xuICBpZiAoY2FjaGVkKSB7XG4gICAgY2FjaGVkLmxhc3RJbmRleCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgY2FjaGVbY2xhc3NOYW1lXSA9IGNhY2hlZCA9IG5ldyBSZWdFeHAoc3RhcnQgKyBjbGFzc05hbWUgKyBlbmQsICdnJyk7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZDtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3MgKGVsLCBjbGFzc05hbWUpIHtcbiAgdmFyIGN1cnJlbnQgPSBlbC5jbGFzc05hbWU7XG4gIGlmICghY3VycmVudC5sZW5ndGgpIHtcbiAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIH0gZWxzZSBpZiAoIWxvb2t1cENsYXNzKGNsYXNzTmFtZSkudGVzdChjdXJyZW50KSkge1xuICAgIGVsLmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gcm1DbGFzcyAoZWwsIGNsYXNzTmFtZSkge1xuICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShsb29rdXBDbGFzcyhjbGFzc05hbWUpLCAnICcpLnRyaW0oKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZDogYWRkQ2xhc3MsXG4gIHJtOiBybUNsYXNzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW1pdHRlciA9IHJlcXVpcmUoJ2NvbnRyYS9lbWl0dGVyJyk7XG52YXIgY3Jvc3N2ZW50ID0gcmVxdWlyZSgnY3Jvc3N2ZW50Jyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJy4vY2xhc3NlcycpO1xudmFyIGRvYyA9IGRvY3VtZW50O1xudmFyIGRvY3VtZW50RWxlbWVudCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG5cbmZ1bmN0aW9uIGRyYWd1bGEgKGluaXRpYWxDb250YWluZXJzLCBvcHRpb25zKSB7XG4gIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICBpZiAobGVuID09PSAxICYmIEFycmF5LmlzQXJyYXkoaW5pdGlhbENvbnRhaW5lcnMpID09PSBmYWxzZSkge1xuICAgIG9wdGlvbnMgPSBpbml0aWFsQ29udGFpbmVycztcbiAgICBpbml0aWFsQ29udGFpbmVycyA9IFtdO1xuICB9XG4gIHZhciBfbWlycm9yOyAvLyBtaXJyb3IgaW1hZ2VcbiAgdmFyIF9zb3VyY2U7IC8vIHNvdXJjZSBjb250YWluZXJcbiAgdmFyIF9pdGVtOyAvLyBpdGVtIGJlaW5nIGRyYWdnZWRcbiAgdmFyIF9vZmZzZXRYOyAvLyByZWZlcmVuY2UgeFxuICB2YXIgX29mZnNldFk7IC8vIHJlZmVyZW5jZSB5XG4gIHZhciBfbW92ZVg7IC8vIHJlZmVyZW5jZSBtb3ZlIHhcbiAgdmFyIF9tb3ZlWTsgLy8gcmVmZXJlbmNlIG1vdmUgeVxuICB2YXIgX2luaXRpYWxTaWJsaW5nOyAvLyByZWZlcmVuY2Ugc2libGluZyB3aGVuIGdyYWJiZWRcbiAgdmFyIF9jdXJyZW50U2libGluZzsgLy8gcmVmZXJlbmNlIHNpYmxpbmcgbm93XG4gIHZhciBfY29weTsgLy8gaXRlbSB1c2VkIGZvciBjb3B5aW5nXG4gIHZhciBfcmVuZGVyVGltZXI7IC8vIHRpbWVyIGZvciBzZXRUaW1lb3V0IHJlbmRlck1pcnJvckltYWdlXG4gIHZhciBfbGFzdERyb3BUYXJnZXQgPSBudWxsOyAvLyBsYXN0IGNvbnRhaW5lciBpdGVtIHdhcyBvdmVyXG4gIHZhciBfZ3JhYmJlZDsgLy8gaG9sZHMgbW91c2Vkb3duIGNvbnRleHQgdW50aWwgZmlyc3QgbW91c2Vtb3ZlXG5cbiAgdmFyIG8gPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoby5tb3ZlcyA9PT0gdm9pZCAwKSB7IG8ubW92ZXMgPSBhbHdheXM7IH1cbiAgaWYgKG8uYWNjZXB0cyA9PT0gdm9pZCAwKSB7IG8uYWNjZXB0cyA9IGFsd2F5czsgfVxuICBpZiAoby5pbnZhbGlkID09PSB2b2lkIDApIHsgby5pbnZhbGlkID0gaW52YWxpZFRhcmdldDsgfVxuICBpZiAoby5jb250YWluZXJzID09PSB2b2lkIDApIHsgby5jb250YWluZXJzID0gaW5pdGlhbENvbnRhaW5lcnMgfHwgW107IH1cbiAgaWYgKG8uaXNDb250YWluZXIgPT09IHZvaWQgMCkgeyBvLmlzQ29udGFpbmVyID0gbmV2ZXI7IH1cbiAgaWYgKG8uY29weSA9PT0gdm9pZCAwKSB7IG8uY29weSA9IGZhbHNlOyB9XG4gIGlmIChvLmNvcHlTb3J0U291cmNlID09PSB2b2lkIDApIHsgby5jb3B5U29ydFNvdXJjZSA9IGZhbHNlOyB9XG4gIGlmIChvLnJldmVydE9uU3BpbGwgPT09IHZvaWQgMCkgeyBvLnJldmVydE9uU3BpbGwgPSBmYWxzZTsgfVxuICBpZiAoby5yZW1vdmVPblNwaWxsID09PSB2b2lkIDApIHsgby5yZW1vdmVPblNwaWxsID0gZmFsc2U7IH1cbiAgaWYgKG8uZGlyZWN0aW9uID09PSB2b2lkIDApIHsgby5kaXJlY3Rpb24gPSAndmVydGljYWwnOyB9XG4gIGlmIChvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbiA9PT0gdm9pZCAwKSB7IG8uaWdub3JlSW5wdXRUZXh0U2VsZWN0aW9uID0gdHJ1ZTsgfVxuICBpZiAoby5taXJyb3JDb250YWluZXIgPT09IHZvaWQgMCkgeyBvLm1pcnJvckNvbnRhaW5lciA9IGRvYy5ib2R5OyB9XG5cbiAgdmFyIGRyYWtlID0gZW1pdHRlcih7XG4gICAgY29udGFpbmVyczogby5jb250YWluZXJzLFxuICAgIHN0YXJ0OiBtYW51YWxTdGFydCxcbiAgICBlbmQ6IGVuZCxcbiAgICBjYW5jZWw6IGNhbmNlbCxcbiAgICByZW1vdmU6IHJlbW92ZSxcbiAgICBkZXN0cm95OiBkZXN0cm95LFxuICAgIGRyYWdnaW5nOiBmYWxzZVxuICB9KTtcblxuICBpZiAoby5yZW1vdmVPblNwaWxsID09PSB0cnVlKSB7XG4gICAgZHJha2Uub24oJ292ZXInLCBzcGlsbE92ZXIpLm9uKCdvdXQnLCBzcGlsbE91dCk7XG4gIH1cblxuICBldmVudHMoKTtcblxuICByZXR1cm4gZHJha2U7XG5cbiAgZnVuY3Rpb24gaXNDb250YWluZXIgKGVsKSB7XG4gICAgcmV0dXJuIGRyYWtlLmNvbnRhaW5lcnMuaW5kZXhPZihlbCkgIT09IC0xIHx8IG8uaXNDb250YWluZXIoZWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsIG9wLCAnbW91c2Vkb3duJywgZ3JhYik7XG4gICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgb3AsICdtb3VzZXVwJywgcmVsZWFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBldmVudHVhbE1vdmVtZW50cyAocmVtb3ZlKSB7XG4gICAgdmFyIG9wID0gcmVtb3ZlID8gJ3JlbW92ZScgOiAnYWRkJztcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCBvcCwgJ21vdXNlbW92ZScsIHN0YXJ0QmVjYXVzZU1vdXNlTW92ZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZW1lbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIGNyb3NzdmVudFtvcF0oZG9jdW1lbnRFbGVtZW50LCAnc2VsZWN0c3RhcnQnLCBwcmV2ZW50R3JhYmJlZCk7IC8vIElFOFxuICAgIGNyb3NzdmVudFtvcF0oZG9jdW1lbnRFbGVtZW50LCAnY2xpY2snLCBwcmV2ZW50R3JhYmJlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgICBldmVudHModHJ1ZSk7XG4gICAgcmVsZWFzZSh7fSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcmV2ZW50R3JhYmJlZCAoZSkge1xuICAgIGlmIChfZ3JhYmJlZCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdyYWIgKGUpIHtcbiAgICBfbW92ZVggPSBlLmNsaWVudFg7XG4gICAgX21vdmVZID0gZS5jbGllbnRZO1xuXG4gICAgdmFyIGlnbm9yZSA9IHdoaWNoTW91c2VCdXR0b24oZSkgIT09IDEgfHwgZS5tZXRhS2V5IHx8IGUuY3RybEtleTtcbiAgICBpZiAoaWdub3JlKSB7XG4gICAgICByZXR1cm47IC8vIHdlIG9ubHkgY2FyZSBhYm91dCBob25lc3QtdG8tZ29kIGxlZnQgY2xpY2tzIGFuZCB0b3VjaCBldmVudHNcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBlLnRhcmdldDtcbiAgICB2YXIgY29udGV4dCA9IGNhblN0YXJ0KGl0ZW0pO1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBfZ3JhYmJlZCA9IGNvbnRleHQ7XG4gICAgZXZlbnR1YWxNb3ZlbWVudHMoKTtcbiAgICBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJykge1xuICAgICAgaWYgKGlzSW5wdXQoaXRlbSkpIHsgLy8gc2VlIGFsc286IGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8yMDhcbiAgICAgICAgaXRlbS5mb2N1cygpOyAvLyBmaXhlcyBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMTc2XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIGZpeGVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8xNTVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydEJlY2F1c2VNb3VzZU1vdmVkIChlKSB7XG4gICAgaWYgKCFfZ3JhYmJlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAod2hpY2hNb3VzZUJ1dHRvbihlKSA9PT0gMCkge1xuICAgICAgcmVsZWFzZSh7fSk7XG4gICAgICByZXR1cm47IC8vIHdoZW4gdGV4dCBpcyBzZWxlY3RlZCBvbiBhbiBpbnB1dCBhbmQgdGhlbiBkcmFnZ2VkLCBtb3VzZXVwIGRvZXNuJ3QgZmlyZS4gdGhpcyBpcyBvdXIgb25seSBob3BlXG4gICAgfVxuICAgIC8vIHRydXRoeSBjaGVjayBmaXhlcyAjMjM5LCBlcXVhbGl0eSBmaXhlcyAjMjA3XG4gICAgaWYgKGUuY2xpZW50WCAhPT0gdm9pZCAwICYmIGUuY2xpZW50WCA9PT0gX21vdmVYICYmIGUuY2xpZW50WSAhPT0gdm9pZCAwICYmIGUuY2xpZW50WSA9PT0gX21vdmVZKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbikge1xuICAgICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgICAgdmFyIGNsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpO1xuICAgICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBkb2MuZWxlbWVudEZyb21Qb2ludChjbGllbnRYLCBjbGllbnRZKTtcbiAgICAgIGlmIChpc0lucHV0KGVsZW1lbnRCZWhpbmRDdXJzb3IpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZ3JhYmJlZCA9IF9ncmFiYmVkOyAvLyBjYWxsIHRvIGVuZCgpIHVuc2V0cyBfZ3JhYmJlZFxuICAgIGV2ZW50dWFsTW92ZW1lbnRzKHRydWUpO1xuICAgIG1vdmVtZW50cygpO1xuICAgIGVuZCgpO1xuICAgIHN0YXJ0KGdyYWJiZWQpO1xuXG4gICAgdmFyIG9mZnNldCA9IGdldE9mZnNldChfaXRlbSk7XG4gICAgX29mZnNldFggPSBnZXRDb29yZCgncGFnZVgnLCBlKSAtIG9mZnNldC5sZWZ0O1xuICAgIF9vZmZzZXRZID0gZ2V0Q29vcmQoJ3BhZ2VZJywgZSkgLSBvZmZzZXQudG9wO1xuXG4gICAgY2xhc3Nlcy5hZGQoX2NvcHkgfHwgX2l0ZW0sICdndS10cmFuc2l0Jyk7XG4gICAgcmVuZGVyTWlycm9ySW1hZ2UoKTtcbiAgICBkcmFnKGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuU3RhcnQgKGl0ZW0pIHtcbiAgICBpZiAoZHJha2UuZHJhZ2dpbmcgJiYgX21pcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXNDb250YWluZXIoaXRlbSkpIHtcbiAgICAgIHJldHVybjsgLy8gZG9uJ3QgZHJhZyBjb250YWluZXIgaXRzZWxmXG4gICAgfVxuICAgIHZhciBoYW5kbGUgPSBpdGVtO1xuICAgIHdoaWxlIChnZXRQYXJlbnQoaXRlbSkgJiYgaXNDb250YWluZXIoZ2V0UGFyZW50KGl0ZW0pKSA9PT0gZmFsc2UpIHtcbiAgICAgIGlmIChvLmludmFsaWQoaXRlbSwgaGFuZGxlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpdGVtID0gZ2V0UGFyZW50KGl0ZW0pOyAvLyBkcmFnIHRhcmdldCBzaG91bGQgYmUgYSB0b3AgZWxlbWVudFxuICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHNvdXJjZSA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAoIXNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoby5pbnZhbGlkKGl0ZW0sIGhhbmRsZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbW92YWJsZSA9IG8ubW92ZXMoaXRlbSwgc291cmNlLCBoYW5kbGUsIG5leHRFbChpdGVtKSk7XG4gICAgaWYgKCFtb3ZhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICBzb3VyY2U6IHNvdXJjZVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBtYW51YWxTdGFydCAoaXRlbSkge1xuICAgIHZhciBjb250ZXh0ID0gY2FuU3RhcnQoaXRlbSk7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHN0YXJ0KGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0IChjb250ZXh0KSB7XG4gICAgaWYgKGlzQ29weShjb250ZXh0Lml0ZW0sIGNvbnRleHQuc291cmNlKSkge1xuICAgICAgX2NvcHkgPSBjb250ZXh0Lml0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgICAgZHJha2UuZW1pdCgnY2xvbmVkJywgX2NvcHksIGNvbnRleHQuaXRlbSwgJ2NvcHknKTtcbiAgICB9XG5cbiAgICBfc291cmNlID0gY29udGV4dC5zb3VyY2U7XG4gICAgX2l0ZW0gPSBjb250ZXh0Lml0ZW07XG4gICAgX2luaXRpYWxTaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nID0gbmV4dEVsKGNvbnRleHQuaXRlbSk7XG5cbiAgICBkcmFrZS5kcmFnZ2luZyA9IHRydWU7XG4gICAgZHJha2UuZW1pdCgnZHJhZycsIF9pdGVtLCBfc291cmNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludmFsaWRUYXJnZXQgKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZCAoKSB7XG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIGRyb3AoaXRlbSwgZ2V0UGFyZW50KGl0ZW0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZ3JhYiAoKSB7XG4gICAgX2dyYWJiZWQgPSBmYWxzZTtcbiAgICBldmVudHVhbE1vdmVtZW50cyh0cnVlKTtcbiAgICBtb3ZlbWVudHModHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWxlYXNlIChlKSB7XG4gICAgdW5ncmFiKCk7XG5cbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgIHZhciBjbGllbnRZID0gZ2V0Q29vcmQoJ2NsaWVudFknLCBlKTtcbiAgICB2YXIgZWxlbWVudEJlaGluZEN1cnNvciA9IGdldEVsZW1lbnRCZWhpbmRQb2ludChfbWlycm9yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB2YXIgZHJvcFRhcmdldCA9IGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIGlmIChkcm9wVGFyZ2V0ICYmICgoX2NvcHkgJiYgby5jb3B5U29ydFNvdXJjZSkgfHwgKCFfY29weSB8fCBkcm9wVGFyZ2V0ICE9PSBfc291cmNlKSkpIHtcbiAgICAgIGRyb3AoaXRlbSwgZHJvcFRhcmdldCk7XG4gICAgfSBlbHNlIGlmIChvLnJlbW92ZU9uU3BpbGwpIHtcbiAgICAgIHJlbW92ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkcm9wIChpdGVtLCB0YXJnZXQpIHtcbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChfY29weSAmJiBvLmNvcHlTb3J0U291cmNlICYmIHRhcmdldCA9PT0gX3NvdXJjZSkge1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKF9pdGVtKTtcbiAgICB9XG4gICAgaWYgKGlzSW5pdGlhbFBsYWNlbWVudCh0YXJnZXQpKSB7XG4gICAgICBkcmFrZS5lbWl0KCdjYW5jZWwnLCBpdGVtLCBfc291cmNlLCBfc291cmNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJha2UuZW1pdCgnZHJvcCcsIGl0ZW0sIHRhcmdldCwgX3NvdXJjZSwgX2N1cnJlbnRTaWJsaW5nKTtcbiAgICB9XG4gICAgY2xlYW51cCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlICgpIHtcbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgfVxuICAgIGRyYWtlLmVtaXQoX2NvcHkgPyAnY2FuY2VsJyA6ICdyZW1vdmUnLCBpdGVtLCBwYXJlbnQsIF9zb3VyY2UpO1xuICAgIGNsZWFudXAoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCAocmV2ZXJ0KSB7XG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcmV2ZXJ0cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwID8gcmV2ZXJ0IDogby5yZXZlcnRPblNwaWxsO1xuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAocGFyZW50ID09PSBfc291cmNlICYmIF9jb3B5KSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoX2NvcHkpO1xuICAgIH1cbiAgICB2YXIgaW5pdGlhbCA9IGlzSW5pdGlhbFBsYWNlbWVudChwYXJlbnQpO1xuICAgIGlmIChpbml0aWFsID09PSBmYWxzZSAmJiAhX2NvcHkgJiYgcmV2ZXJ0cykge1xuICAgICAgX3NvdXJjZS5pbnNlcnRCZWZvcmUoaXRlbSwgX2luaXRpYWxTaWJsaW5nKTtcbiAgICB9XG4gICAgaWYgKGluaXRpYWwgfHwgcmV2ZXJ0cykge1xuICAgICAgZHJha2UuZW1pdCgnY2FuY2VsJywgaXRlbSwgX3NvdXJjZSwgX3NvdXJjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRyYWtlLmVtaXQoJ2Ryb3AnLCBpdGVtLCBwYXJlbnQsIF9zb3VyY2UsIF9jdXJyZW50U2libGluZyk7XG4gICAgfVxuICAgIGNsZWFudXAoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFudXAgKCkge1xuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdW5ncmFiKCk7XG4gICAgcmVtb3ZlTWlycm9ySW1hZ2UoKTtcbiAgICBpZiAoaXRlbSkge1xuICAgICAgY2xhc3Nlcy5ybShpdGVtLCAnZ3UtdHJhbnNpdCcpO1xuICAgIH1cbiAgICBpZiAoX3JlbmRlclRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQoX3JlbmRlclRpbWVyKTtcbiAgICB9XG4gICAgZHJha2UuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBpZiAoX2xhc3REcm9wVGFyZ2V0KSB7XG4gICAgICBkcmFrZS5lbWl0KCdvdXQnLCBpdGVtLCBfbGFzdERyb3BUYXJnZXQsIF9zb3VyY2UpO1xuICAgIH1cbiAgICBkcmFrZS5lbWl0KCdkcmFnZW5kJywgaXRlbSk7XG4gICAgX3NvdXJjZSA9IF9pdGVtID0gX2NvcHkgPSBfaW5pdGlhbFNpYmxpbmcgPSBfY3VycmVudFNpYmxpbmcgPSBfcmVuZGVyVGltZXIgPSBfbGFzdERyb3BUYXJnZXQgPSBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNJbml0aWFsUGxhY2VtZW50ICh0YXJnZXQsIHMpIHtcbiAgICB2YXIgc2libGluZztcbiAgICBpZiAocyAhPT0gdm9pZCAwKSB7XG4gICAgICBzaWJsaW5nID0gcztcbiAgICB9IGVsc2UgaWYgKF9taXJyb3IpIHtcbiAgICAgIHNpYmxpbmcgPSBfY3VycmVudFNpYmxpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNpYmxpbmcgPSBuZXh0RWwoX2NvcHkgfHwgX2l0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0ID09PSBfc291cmNlICYmIHNpYmxpbmcgPT09IF9pbml0aWFsU2libGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmREcm9wVGFyZ2V0IChlbGVtZW50QmVoaW5kQ3Vyc29yLCBjbGllbnRYLCBjbGllbnRZKSB7XG4gICAgdmFyIHRhcmdldCA9IGVsZW1lbnRCZWhpbmRDdXJzb3I7XG4gICAgd2hpbGUgKHRhcmdldCAmJiAhYWNjZXB0ZWQoKSkge1xuICAgICAgdGFyZ2V0ID0gZ2V0UGFyZW50KHRhcmdldCk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG5cbiAgICBmdW5jdGlvbiBhY2NlcHRlZCAoKSB7XG4gICAgICB2YXIgZHJvcHBhYmxlID0gaXNDb250YWluZXIodGFyZ2V0KTtcbiAgICAgIGlmIChkcm9wcGFibGUgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGltbWVkaWF0ZSA9IGdldEltbWVkaWF0ZUNoaWxkKHRhcmdldCwgZWxlbWVudEJlaGluZEN1cnNvcik7XG4gICAgICB2YXIgcmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlKHRhcmdldCwgaW1tZWRpYXRlLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICAgIHZhciBpbml0aWFsID0gaXNJbml0aWFsUGxhY2VtZW50KHRhcmdldCwgcmVmZXJlbmNlKTtcbiAgICAgIGlmIChpbml0aWFsKSB7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBzaG91bGQgYWx3YXlzIGJlIGFibGUgdG8gZHJvcCBpdCByaWdodCBiYWNrIHdoZXJlIGl0IHdhc1xuICAgICAgfVxuICAgICAgcmV0dXJuIG8uYWNjZXB0cyhfaXRlbSwgdGFyZ2V0LCBfc291cmNlLCByZWZlcmVuY2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYWcgKGUpIHtcbiAgICBpZiAoIV9taXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgIHZhciBjbGllbnRZID0gZ2V0Q29vcmQoJ2NsaWVudFknLCBlKTtcbiAgICB2YXIgeCA9IGNsaWVudFggLSBfb2Zmc2V0WDtcbiAgICB2YXIgeSA9IGNsaWVudFkgLSBfb2Zmc2V0WTtcblxuICAgIF9taXJyb3Iuc3R5bGUubGVmdCA9IHggKyAncHgnO1xuICAgIF9taXJyb3Iuc3R5bGUudG9wID0geSArICdweCc7XG5cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHZhciBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZ2V0RWxlbWVudEJlaGluZFBvaW50KF9taXJyb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIHZhciBkcm9wVGFyZ2V0ID0gZmluZERyb3BUYXJnZXQoZWxlbWVudEJlaGluZEN1cnNvciwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgdmFyIGNoYW5nZWQgPSBkcm9wVGFyZ2V0ICE9PSBudWxsICYmIGRyb3BUYXJnZXQgIT09IF9sYXN0RHJvcFRhcmdldDtcbiAgICBpZiAoY2hhbmdlZCB8fCBkcm9wVGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICBvdXQoKTtcbiAgICAgIF9sYXN0RHJvcFRhcmdldCA9IGRyb3BUYXJnZXQ7XG4gICAgICBvdmVyKCk7XG4gICAgfVxuICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgaWYgKGRyb3BUYXJnZXQgPT09IF9zb3VyY2UgJiYgX2NvcHkgJiYgIW8uY29weVNvcnRTb3VyY2UpIHtcbiAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcmVmZXJlbmNlO1xuICAgIHZhciBpbW1lZGlhdGUgPSBnZXRJbW1lZGlhdGVDaGlsZChkcm9wVGFyZ2V0LCBlbGVtZW50QmVoaW5kQ3Vyc29yKTtcbiAgICBpZiAoaW1tZWRpYXRlICE9PSBudWxsKSB7XG4gICAgICByZWZlcmVuY2UgPSBnZXRSZWZlcmVuY2UoZHJvcFRhcmdldCwgaW1tZWRpYXRlLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB9IGVsc2UgaWYgKG8ucmV2ZXJ0T25TcGlsbCA9PT0gdHJ1ZSAmJiAhX2NvcHkpIHtcbiAgICAgIHJlZmVyZW5jZSA9IF9pbml0aWFsU2libGluZztcbiAgICAgIGRyb3BUYXJnZXQgPSBfc291cmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoX2NvcHkgJiYgcGFyZW50KSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgcmVmZXJlbmNlID09PSBudWxsIHx8XG4gICAgICByZWZlcmVuY2UgIT09IGl0ZW0gJiZcbiAgICAgIHJlZmVyZW5jZSAhPT0gbmV4dEVsKGl0ZW0pICYmXG4gICAgICByZWZlcmVuY2UgIT09IF9jdXJyZW50U2libGluZ1xuICAgICkge1xuICAgICAgX2N1cnJlbnRTaWJsaW5nID0gcmVmZXJlbmNlO1xuICAgICAgZHJvcFRhcmdldC5pbnNlcnRCZWZvcmUoaXRlbSwgcmVmZXJlbmNlKTtcbiAgICAgIGRyYWtlLmVtaXQoJ3NoYWRvdycsIGl0ZW0sIGRyb3BUYXJnZXQsIF9zb3VyY2UpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBtb3ZlZCAodHlwZSkgeyBkcmFrZS5lbWl0KHR5cGUsIGl0ZW0sIF9sYXN0RHJvcFRhcmdldCwgX3NvdXJjZSk7IH1cbiAgICBmdW5jdGlvbiBvdmVyICgpIHsgaWYgKGNoYW5nZWQpIHsgbW92ZWQoJ292ZXInKTsgfSB9XG4gICAgZnVuY3Rpb24gb3V0ICgpIHsgaWYgKF9sYXN0RHJvcFRhcmdldCkgeyBtb3ZlZCgnb3V0Jyk7IH0gfVxuICB9XG5cbiAgZnVuY3Rpb24gc3BpbGxPdmVyIChlbCkge1xuICAgIGNsYXNzZXMucm0oZWwsICdndS1oaWRlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzcGlsbE91dCAoZWwpIHtcbiAgICBpZiAoZHJha2UuZHJhZ2dpbmcpIHsgY2xhc3Nlcy5hZGQoZWwsICdndS1oaWRlJyk7IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlck1pcnJvckltYWdlICgpIHtcbiAgICBpZiAoX21pcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcmVjdCA9IF9pdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIF9taXJyb3IgPSBfaXRlbS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgX21pcnJvci5zdHlsZS53aWR0aCA9IGdldFJlY3RXaWR0aChyZWN0KSArICdweCc7XG4gICAgX21pcnJvci5zdHlsZS5oZWlnaHQgPSBnZXRSZWN0SGVpZ2h0KHJlY3QpICsgJ3B4JztcbiAgICBjbGFzc2VzLnJtKF9taXJyb3IsICdndS10cmFuc2l0Jyk7XG4gICAgY2xhc3Nlcy5hZGQoX21pcnJvciwgJ2d1LW1pcnJvcicpO1xuICAgIG8ubWlycm9yQ29udGFpbmVyLmFwcGVuZENoaWxkKF9taXJyb3IpO1xuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsICdhZGQnLCAnbW91c2Vtb3ZlJywgZHJhZyk7XG4gICAgY2xhc3Nlcy5hZGQoby5taXJyb3JDb250YWluZXIsICdndS11bnNlbGVjdGFibGUnKTtcbiAgICBkcmFrZS5lbWl0KCdjbG9uZWQnLCBfbWlycm9yLCBfaXRlbSwgJ21pcnJvcicpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlTWlycm9ySW1hZ2UgKCkge1xuICAgIGlmIChfbWlycm9yKSB7XG4gICAgICBjbGFzc2VzLnJtKG8ubWlycm9yQ29udGFpbmVyLCAnZ3UtdW5zZWxlY3RhYmxlJyk7XG4gICAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCAncmVtb3ZlJywgJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgICAgZ2V0UGFyZW50KF9taXJyb3IpLnJlbW92ZUNoaWxkKF9taXJyb3IpO1xuICAgICAgX21pcnJvciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SW1tZWRpYXRlQ2hpbGQgKGRyb3BUYXJnZXQsIHRhcmdldCkge1xuICAgIHZhciBpbW1lZGlhdGUgPSB0YXJnZXQ7XG4gICAgd2hpbGUgKGltbWVkaWF0ZSAhPT0gZHJvcFRhcmdldCAmJiBnZXRQYXJlbnQoaW1tZWRpYXRlKSAhPT0gZHJvcFRhcmdldCkge1xuICAgICAgaW1tZWRpYXRlID0gZ2V0UGFyZW50KGltbWVkaWF0ZSk7XG4gICAgfVxuICAgIGlmIChpbW1lZGlhdGUgPT09IGRvY3VtZW50RWxlbWVudCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBpbW1lZGlhdGU7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRSZWZlcmVuY2UgKGRyb3BUYXJnZXQsIHRhcmdldCwgeCwgeSkge1xuICAgIHZhciBob3Jpem9udGFsID0gby5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJztcbiAgICB2YXIgcmVmZXJlbmNlID0gdGFyZ2V0ICE9PSBkcm9wVGFyZ2V0ID8gaW5zaWRlKCkgOiBvdXRzaWRlKCk7XG4gICAgcmV0dXJuIHJlZmVyZW5jZTtcblxuICAgIGZ1bmN0aW9uIG91dHNpZGUgKCkgeyAvLyBzbG93ZXIsIGJ1dCBhYmxlIHRvIGZpZ3VyZSBvdXQgYW55IHBvc2l0aW9uXG4gICAgICB2YXIgbGVuID0gZHJvcFRhcmdldC5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICB2YXIgaTtcbiAgICAgIHZhciBlbDtcbiAgICAgIHZhciByZWN0O1xuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGVsID0gZHJvcFRhcmdldC5jaGlsZHJlbltpXTtcbiAgICAgICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBpZiAoaG9yaXpvbnRhbCAmJiByZWN0LmxlZnQgPiB4KSB7IHJldHVybiBlbDsgfVxuICAgICAgICBpZiAoIWhvcml6b250YWwgJiYgcmVjdC50b3AgPiB5KSB7IHJldHVybiBlbDsgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zaWRlICgpIHsgLy8gZmFzdGVyLCBidXQgb25seSBhdmFpbGFibGUgaWYgZHJvcHBlZCBpbnNpZGUgYSBjaGlsZCBlbGVtZW50XG4gICAgICB2YXIgcmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGlmIChob3Jpem9udGFsKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHggPiByZWN0LmxlZnQgKyBnZXRSZWN0V2lkdGgocmVjdCkgLyAyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKHkgPiByZWN0LnRvcCArIGdldFJlY3RIZWlnaHQocmVjdCkgLyAyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlIChhZnRlcikge1xuICAgICAgcmV0dXJuIGFmdGVyID8gbmV4dEVsKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNDb3B5IChpdGVtLCBjb250YWluZXIpIHtcbiAgICByZXR1cm4gdHlwZW9mIG8uY29weSA9PT0gJ2Jvb2xlYW4nID8gby5jb3B5IDogby5jb3B5KGl0ZW0sIGNvbnRhaW5lcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gdG91Y2h5IChlbCwgb3AsIHR5cGUsIGZuKSB7XG4gIHZhciB0b3VjaCA9IHtcbiAgICBtb3VzZXVwOiAndG91Y2hlbmQnLFxuICAgIG1vdXNlZG93bjogJ3RvdWNoc3RhcnQnLFxuICAgIG1vdXNlbW92ZTogJ3RvdWNobW92ZSdcbiAgfTtcbiAgdmFyIHBvaW50ZXJzID0ge1xuICAgIG1vdXNldXA6ICdwb2ludGVydXAnLFxuICAgIG1vdXNlZG93bjogJ3BvaW50ZXJkb3duJyxcbiAgICBtb3VzZW1vdmU6ICdwb2ludGVybW92ZSdcbiAgfTtcbiAgdmFyIG1pY3Jvc29mdCA9IHtcbiAgICBtb3VzZXVwOiAnTVNQb2ludGVyVXAnLFxuICAgIG1vdXNlZG93bjogJ01TUG9pbnRlckRvd24nLFxuICAgIG1vdXNlbW92ZTogJ01TUG9pbnRlck1vdmUnXG4gIH07XG4gIGlmIChnbG9iYWwubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkKSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgcG9pbnRlcnNbdHlwZV0sIGZuKTtcbiAgfSBlbHNlIGlmIChnbG9iYWwubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQpIHtcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCBtaWNyb3NvZnRbdHlwZV0sIGZuKTtcbiAgfSBlbHNlIHtcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCB0b3VjaFt0eXBlXSwgZm4pO1xuICAgIGNyb3NzdmVudFtvcF0oZWwsIHR5cGUsIGZuKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3aGljaE1vdXNlQnV0dG9uIChlKSB7XG4gIGlmIChlLnRvdWNoZXMgIT09IHZvaWQgMCkgeyByZXR1cm4gZS50b3VjaGVzLmxlbmd0aDsgfVxuICBpZiAoZS5idXR0b25zICE9PSB2b2lkIDApIHsgcmV0dXJuIGUuYnV0dG9uczsgfVxuICBpZiAoZS53aGljaCAhPT0gdm9pZCAwKSB7IHJldHVybiBlLndoaWNoOyB9XG4gIHZhciBidXR0b24gPSBlLmJ1dHRvbjtcbiAgaWYgKGJ1dHRvbiAhPT0gdm9pZCAwKSB7IC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iLzk5ZThmZjFiYWE3YWUzNDFlOTRiYjg5YzNlODQ1NzBjN2MzYWQ5ZWEvc3JjL2V2ZW50LmpzI0w1NzMtTDU3NVxuICAgIHJldHVybiBidXR0b24gJiAxID8gMSA6IGJ1dHRvbiAmIDIgPyAzIDogKGJ1dHRvbiAmIDQgPyAyIDogMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0T2Zmc2V0IChlbCkge1xuICB2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIGxlZnQ6IHJlY3QubGVmdCArIGdldFNjcm9sbCgnc2Nyb2xsTGVmdCcsICdwYWdlWE9mZnNldCcpLFxuICAgIHRvcDogcmVjdC50b3AgKyBnZXRTY3JvbGwoJ3Njcm9sbFRvcCcsICdwYWdlWU9mZnNldCcpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbCAoc2Nyb2xsUHJvcCwgb2Zmc2V0UHJvcCkge1xuICBpZiAodHlwZW9mIGdsb2JhbFtvZmZzZXRQcm9wXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZ2xvYmFsW29mZnNldFByb3BdO1xuICB9XG4gIGlmIChkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50RWxlbWVudFtzY3JvbGxQcm9wXTtcbiAgfVxuICByZXR1cm4gZG9jLmJvZHlbc2Nyb2xsUHJvcF07XG59XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRCZWhpbmRQb2ludCAocG9pbnQsIHgsIHkpIHtcbiAgdmFyIHAgPSBwb2ludCB8fCB7fTtcbiAgdmFyIHN0YXRlID0gcC5jbGFzc05hbWU7XG4gIHZhciBlbDtcbiAgcC5jbGFzc05hbWUgKz0gJyBndS1oaWRlJztcbiAgZWwgPSBkb2MuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgcC5jbGFzc05hbWUgPSBzdGF0ZTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiBuZXZlciAoKSB7IHJldHVybiBmYWxzZTsgfVxuZnVuY3Rpb24gYWx3YXlzICgpIHsgcmV0dXJuIHRydWU7IH1cbmZ1bmN0aW9uIGdldFJlY3RXaWR0aCAocmVjdCkgeyByZXR1cm4gcmVjdC53aWR0aCB8fCAocmVjdC5yaWdodCAtIHJlY3QubGVmdCk7IH1cbmZ1bmN0aW9uIGdldFJlY3RIZWlnaHQgKHJlY3QpIHsgcmV0dXJuIHJlY3QuaGVpZ2h0IHx8IChyZWN0LmJvdHRvbSAtIHJlY3QudG9wKTsgfVxuZnVuY3Rpb24gZ2V0UGFyZW50IChlbCkgeyByZXR1cm4gZWwucGFyZW50Tm9kZSA9PT0gZG9jID8gbnVsbCA6IGVsLnBhcmVudE5vZGU7IH1cbmZ1bmN0aW9uIGlzSW5wdXQgKGVsKSB7IHJldHVybiBlbC50YWdOYW1lID09PSAnSU5QVVQnIHx8IGVsLnRhZ05hbWUgPT09ICdURVhUQVJFQScgfHwgZWwudGFnTmFtZSA9PT0gJ1NFTEVDVCcgfHwgaXNFZGl0YWJsZShlbCk7IH1cbmZ1bmN0aW9uIGlzRWRpdGFibGUgKGVsKSB7XG4gIGlmICghZWwpIHsgcmV0dXJuIGZhbHNlOyB9IC8vIG5vIHBhcmVudHMgd2VyZSBlZGl0YWJsZVxuICBpZiAoZWwuY29udGVudEVkaXRhYmxlID09PSAnZmFsc2UnKSB7IHJldHVybiBmYWxzZTsgfSAvLyBzdG9wIHRoZSBsb29rdXBcbiAgaWYgKGVsLmNvbnRlbnRFZGl0YWJsZSA9PT0gJ3RydWUnKSB7IHJldHVybiB0cnVlOyB9IC8vIGZvdW5kIGEgY29udGVudEVkaXRhYmxlIGVsZW1lbnQgaW4gdGhlIGNoYWluXG4gIHJldHVybiBpc0VkaXRhYmxlKGdldFBhcmVudChlbCkpOyAvLyBjb250ZW50RWRpdGFibGUgaXMgc2V0IHRvICdpbmhlcml0J1xufVxuXG5mdW5jdGlvbiBuZXh0RWwgKGVsKSB7XG4gIHJldHVybiBlbC5uZXh0RWxlbWVudFNpYmxpbmcgfHwgbWFudWFsbHkoKTtcbiAgZnVuY3Rpb24gbWFudWFsbHkgKCkge1xuICAgIHZhciBzaWJsaW5nID0gZWw7XG4gICAgZG8ge1xuICAgICAgc2libGluZyA9IHNpYmxpbmcubmV4dFNpYmxpbmc7XG4gICAgfSB3aGlsZSAoc2libGluZyAmJiBzaWJsaW5nLm5vZGVUeXBlICE9PSAxKTtcbiAgICByZXR1cm4gc2libGluZztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRFdmVudEhvc3QgKGUpIHtcbiAgLy8gb24gdG91Y2hlbmQgZXZlbnQsIHdlIGhhdmUgdG8gdXNlIGBlLmNoYW5nZWRUb3VjaGVzYFxuICAvLyBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83MTkyNTYzL3RvdWNoZW5kLWV2ZW50LXByb3BlcnRpZXNcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8zNFxuICBpZiAoZS50YXJnZXRUb3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZS50YXJnZXRUb3VjaGVzWzBdO1xuICB9XG4gIGlmIChlLmNoYW5nZWRUb3VjaGVzICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNbMF07XG4gIH1cbiAgcmV0dXJuIGU7XG59XG5cbmZ1bmN0aW9uIGdldENvb3JkIChjb29yZCwgZSkge1xuICB2YXIgaG9zdCA9IGdldEV2ZW50SG9zdChlKTtcbiAgdmFyIG1pc3NNYXAgPSB7XG4gICAgcGFnZVg6ICdjbGllbnRYJywgLy8gSUU4XG4gICAgcGFnZVk6ICdjbGllbnRZJyAvLyBJRThcbiAgfTtcbiAgaWYgKGNvb3JkIGluIG1pc3NNYXAgJiYgIShjb29yZCBpbiBob3N0KSAmJiBtaXNzTWFwW2Nvb3JkXSBpbiBob3N0KSB7XG4gICAgY29vcmQgPSBtaXNzTWFwW2Nvb3JkXTtcbiAgfVxuICByZXR1cm4gaG9zdFtjb29yZF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZHJhZ3VsYTtcbiIsIi8qXG4gKiBub3RpZS5qcyAtIEEgY2xlYW4gYW5kIHNpbXBsZSBub3RpZmljYXRpb24gcGx1Z2luIChhbGVydC9ncm93bCBzdHlsZSkgZm9yIGphdmFzY3JpcHQsIHdpdGggbm8gZGVwZW5kZW5jaWVzLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNSBKYXJlZCBSZWljaFxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogUHJvamVjdCBob21lOlxuICogaHR0cHM6Ly9qYXJlZHJlaWNoLmNvbS9wcm9qZWN0cy9ub3RpZS5qc1xuICpcbiAqIFZlcnNpb246ICAyLjEuMFxuICpcbiovXG5cbnZhciBub3RpZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAvLyBTRVRUSU5HU1xuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIFxuICAgIC8vIEdlbmVyYWxcbiAgICB2YXIgc2hhZG93ID0gdHJ1ZTtcbiAgICB2YXIgZm9udF9zaXplX3NtYWxsID0gJzE4cHgnO1xuICAgIHZhciBmb250X3NpemVfYmlnID0gJzI0cHgnO1xuICAgIHZhciBmb250X2NoYW5nZV9zY3JlZW5fd2lkdGggPSA2MDA7XG4gICAgdmFyIGFuaW1hdGlvbl9kZWxheSA9IDAuMztcbiAgICB2YXIgYmFja2dyb3VuZF9jbGlja19kaXNtaXNzID0gdHJ1ZTtcbiAgICBcbiAgICAvLyBub3RpZS5hbGVydCBjb2xvcnNcbiAgICB2YXIgYWxlcnRfY29sb3Jfc3VjY2Vzc19iYWNrZ3JvdW5kID0gJyM1N0JGNTcnO1xuICAgIHZhciBhbGVydF9jb2xvcl93YXJuaW5nX2JhY2tncm91bmQgPSAnI0UzQjc3MSc7XG4gICAgdmFyIGFsZXJ0X2NvbG9yX2Vycm9yX2JhY2tncm91bmQgPSAnI0UxNzE1Qic7XG4gICAgdmFyIGFsZXJ0X2NvbG9yX2luZm9fYmFja2dyb3VuZCA9ICcjNEQ4MkQ2JztcbiAgICB2YXIgYWxlcnRfY29sb3JfdGV4dCA9ICcjRkZGJztcblxuICAgIC8vIG5vdGllLmNvbmZpcm0gY29sb3JzXG4gICAgdmFyIGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX2JhY2tncm91bmQgPSAnIzREODJENic7XG4gICAgdmFyIGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX3llc19iYWNrZ3JvdW5kID0gJyM1N0JGNTcnO1xuICAgIHZhciBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl9ub19iYWNrZ3JvdW5kID0gJyNFMTcxNUInO1xuICAgIHZhciBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl90ZXh0ID0gJyNGRkYnO1xuICAgIHZhciBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl95ZXNfdGV4dCA9ICcjRkZGJztcbiAgICB2YXIgY29uZmlybV9hbmRfaW5wdXRfY29sb3Jfbm9fdGV4dCA9ICcjRkZGJztcbiAgICBcbiAgICAvLyBJRCdzIGZvciB1c2Ugd2l0aGluIHlvdXIgb3duIC5jc3MgZmlsZSAoT1BUSU9OQUwpXG4gICAgLy8gKEJlIHN1cmUgdG8gdXNlICFpbXBvcnRhbnQgdG8gb3ZlcnJpZGUgdGhlIGphdmFzY3JpcHQpXG4gICAgLy8gRXhhbXBsZTogI25vdGllLWFsZXJ0LWlubmVyIHsgcGFkZGluZzogMzBweCAhaW1wb3J0YW50OyB9XG4gICAgdmFyIGFsZXJ0X291dGVyX2lkID0gJ25vdGllLWFsZXJ0LW91dGVyJztcbiAgICB2YXIgYWxlcnRfaW5uZXJfaWQgPSAnbm90aWUtYWxlcnQtaW5uZXInO1xuICAgIHZhciBhbGVydF90ZXh0X2lkID0gJ25vdGllLWFsZXJ0LXRleHQnO1xuICAgIHZhciBjb25maXJtX291dGVyX2lkID0gJ25vdGllLWNvbmZpcm0tb3V0ZXInO1xuICAgIHZhciBjb25maXJtX2lubmVyX2lkID0gJ25vdGllLWNvbmZpcm0taW5uZXInO1xuICAgIHZhciBjb25maXJtX2JhY2tncm91bmRfaWQgPSAnbm90aWUtY29uZmlybS1iYWNrZ3JvdW5kJztcbiAgICB2YXIgY29uZmlybV95ZXNfaWQgPSAnbm90aWUtY29uZmlybS15ZXMnO1xuICAgIHZhciBjb25maXJtX25vX2lkID0gJ25vdGllLWNvbmZpcm0tbm8nO1xuICAgIHZhciBjb25maXJtX3RleHRfaWQgPSAnbm90aWUtY29uZmlybS10ZXh0JztcbiAgICB2YXIgY29uZmlybV95ZXNfdGV4dF9pZCA9ICdub3RpZS1jb25maXJtLXllcy10ZXh0JztcbiAgICB2YXIgY29uZmlybV9ub190ZXh0X2lkID0gJ25vdGllLWNvbmZpcm0tbm8tdGV4dCc7XG4gICAgdmFyIGlucHV0X291dGVyX2lkID0gJ25vdGllLWlucHV0LW91dGVyJztcbiAgICB2YXIgaW5wdXRfaW5uZXJfaWQgPSAnbm90aWUtaW5wdXQtaW5uZXInO1xuICAgIHZhciBpbnB1dF9iYWNrZ3JvdW5kX2lkID0gJ25vdGllLWlucHV0LWJhY2tncm91bmQnO1xuICAgIHZhciBpbnB1dF9kaXZfaWQgPSAnbm90aWUtaW5wdXQtZGl2JztcbiAgICB2YXIgaW5wdXRfZmllbGRfaWQgPSAnbm90aWUtaW5wdXQtZmllbGQnO1xuICAgIHZhciBpbnB1dF95ZXNfaWQgPSAnbm90aWUtaW5wdXQteWVzJztcbiAgICB2YXIgaW5wdXRfbm9faWQgPSAnbm90aWUtaW5wdXQtbm8nO1xuICAgIHZhciBpbnB1dF90ZXh0X2lkID0gJ25vdGllLWlucHV0LXRleHQnO1xuICAgIHZhciBpbnB1dF95ZXNfdGV4dF9pZCA9ICdub3RpZS1pbnB1dC15ZXMtdGV4dCc7XG4gICAgdmFyIGlucHV0X25vX3RleHRfaWQgPSAnbm90aWUtaW5wdXQtbm8tdGV4dCc7XG4gICAgXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgLy8gSEVMUEVSU1xuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIFxuICAgIC8vIEZ1bmN0aW9uIGZvciByZXNpemUgbGlzdGVuZXJzIGZvciBmb250LXNpemVcbiAgICB2YXIgcmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbiByZXNpemVMaXN0ZW5lcihlbGUpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IGZvbnRfY2hhbmdlX3NjcmVlbl93aWR0aCkgeyBlbGUuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfc21hbGw7IH1cbiAgICAgICAgZWxzZSB7IGVsZS5zdHlsZS5mb250U2l6ZSA9IGZvbnRfc2l6ZV9iaWc7IH1cbiAgICB9O1xuICAgIFxuICAgIFxuICAgIC8vIERlYm91bmNlIGZ1bmN0aW9uIChjcmVkaXQgdG8gVW5kZXJzY29yZS5qcylcbiAgICB2YXIgZGVib3VuY2VfdGltZSA9IDUwMDtcbiAgICB2YXIgZGVib3VuY2UgPSBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICAgICAgdmFyIHRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgICAgICAgaWYgKGNhbGxOb3cpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciBlbnRlciBhbmQgZXNjYXBlIGtleXNcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBlbnRlcl9jbGlja2VkID0gKGV2ZW50LndoaWNoID09IDEzIHx8IGV2ZW50LmtleUNvZGUgPT0gMTMpO1xuICAgICAgICB2YXIgZXNjYXBlX2NsaWNrZWQgPSAoZXZlbnQud2hpY2ggPT0gMjcgfHwgZXZlbnQua2V5Q29kZSA9PSAyNyk7XG4gICAgICAgIGlmIChhbGVydF9pc19zaG93aW5nKSB7XG4gICAgICAgICAgICBpZiAoZW50ZXJfY2xpY2tlZCB8fCBlc2NhcGVfY2xpY2tlZCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChhbGVydF90aW1lb3V0XzEpO1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChhbGVydF90aW1lb3V0XzIpO1xuICAgICAgICAgICAgICAgIGFsZXJ0X2hpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjb25maXJtX2lzX3Nob3dpbmcpIHtcbiAgICAgICAgICAgIGlmIChlbnRlcl9jbGlja2VkKSB7XG4gICAgICAgICAgICAgICAgY29uZmlybV95ZXMuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGVzY2FwZV9jbGlja2VkKSB7XG4gICAgICAgICAgICAgICAgY29uZmlybV9uby5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlucHV0X2lzX3Nob3dpbmcpIHtcbiAgICAgICAgICAgIGlmIChlbnRlcl9jbGlja2VkKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRfeWVzLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlc2NhcGVfY2xpY2tlZCkge1xuICAgICAgICAgICAgICAgIGlucHV0X25vLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICAvLyBhZGRFdmVudExpc3RlbmVyIHBvbHlmaWxsLCBmaXhlcyBhIHN0eWxlLmhlaWdodCBpc3N1ZSBmb3IgSUU4XG4gICAgaWYgKHR5cGVvZiBFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gV2luZG93LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBlID0gJ29uJyArIGU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2hFdmVudChlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICAvLyBTY3JvbGwgZGlzYWJsZSBhbmQgZW5hYmxlIGZvciBub3RpZS5jb25maXJtIGFuZCBub3RpZS5pbnB1dFxuICAgIHZhciBvcmlnaW5hbF9ib2R5X2hlaWdodCwgb3JpZ2luYWxfYm9keV9vdmVyZmxvdztcbiAgICBmdW5jdGlvbiBzY3JvbGxfZGlzYWJsZSgpIHtcbiAgICAgICAgb3JpZ2luYWxfYm9keV9oZWlnaHQgPSBkb2N1bWVudC5ib2R5LnN0eWxlLmhlaWdodDtcbiAgICAgICAgb3JpZ2luYWxfYm9keV9vdmVyZmxvdyA9IGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3c7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNjcm9sbF9lbmFibGUoKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuaGVpZ2h0ID0gb3JpZ2luYWxfYm9keV9oZWlnaHQ7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSBvcmlnaW5hbF9ib2R5X292ZXJmbG93O1xuICAgIH1cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICBcbiAgICBcbiAgICBcbiAgICAvLyBOT1RJRS5BTEVSVFxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgLy8gbm90aWUgZWxlbWVudHMgYW5kIHN0eWxpbmdcbiAgICB2YXIgYWxlcnRfb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhbGVydF9vdXRlci5pZCA9IGFsZXJ0X291dGVyX2lkO1xuICAgIGFsZXJ0X291dGVyLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICBhbGVydF9vdXRlci5zdHlsZS50b3AgPSAnMCc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUubGVmdCA9ICcwJztcbiAgICBhbGVydF9vdXRlci5zdHlsZS56SW5kZXggPSAnOTk5OTk5OTk5JztcbiAgICBhbGVydF9vdXRlci5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBhbGVydF9vdXRlci5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICBhbGVydF9vdXRlci5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUuTW96VHJhbnNpdGlvbiA9ICcnO1xuICAgIGFsZXJ0X291dGVyLnN0eWxlLldlYmtpdFRyYW5zaXRpb24gPSAnJztcbiAgICBhbGVydF9vdXRlci5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgIFxuICAgIC8vIEhpZGUgYWxlcnQgb24gY2xpY2tcbiAgICBhbGVydF9vdXRlci5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChhbGVydF90aW1lb3V0XzEpO1xuICAgICAgICBjbGVhclRpbWVvdXQoYWxlcnRfdGltZW91dF8yKTtcbiAgICAgICAgYWxlcnRfaGlkZSgpO1xuICAgIH07XG4gICAgXG4gICAgdmFyIGFsZXJ0X2lubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYWxlcnRfaW5uZXIuaWQgPSBhbGVydF9pbm5lcl9pZDtcbiAgICBhbGVydF9pbm5lci5zdHlsZS5wYWRkaW5nID0gJzIwcHgnO1xuICAgIGFsZXJ0X2lubmVyLnN0eWxlLmRpc3BsYXkgPSAndGFibGUtY2VsbCc7XG4gICAgYWxlcnRfaW5uZXIuc3R5bGUudmVydGljYWxBbGlnbiA9ICdtaWRkbGUnO1xuICAgIGFsZXJ0X291dGVyLmFwcGVuZENoaWxkKGFsZXJ0X2lubmVyKTtcbiAgICBcbiAgICAvLyBJbml0aWFsaXplIG5vdGllIHRleHRcbiAgICB2YXIgYWxlcnRfdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBhbGVydF90ZXh0LmlkID0gYWxlcnRfdGV4dF9pZDtcbiAgICBhbGVydF90ZXh0LnN0eWxlLmNvbG9yID0gYWxlcnRfY29sb3JfdGV4dDtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gZm9udF9jaGFuZ2Vfc2NyZWVuX3dpZHRoKSB7IGFsZXJ0X3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfc21hbGw7IH1cbiAgICBlbHNlIHsgYWxlcnRfdGV4dC5zdHlsZS5mb250U2l6ZSA9IGZvbnRfc2l6ZV9iaWc7IH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UocmVzaXplTGlzdGVuZXIuYmluZChudWxsLCBhbGVydF90ZXh0KSwgZGVib3VuY2VfdGltZSksIHRydWUpO1xuICAgIGFsZXJ0X2lubmVyLmFwcGVuZENoaWxkKGFsZXJ0X3RleHQpO1xuXG4gICAgLy8gQXR0YWNoIG5vdGllIHRvIHRoZSBib2R5IGVsZW1lbnRcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFsZXJ0X291dGVyKTtcblxuICAgIC8vIERlY2xhcmUgdmFyaWFibGVzXG4gICAgdmFyIGhlaWdodCA9IDA7XG4gICAgdmFyIGFsZXJ0X2lzX3Nob3dpbmcgPSBmYWxzZTtcbiAgICB2YXIgYWxlcnRfdGltZW91dF8xO1xuICAgIHZhciBhbGVydF90aW1lb3V0XzI7XG4gICAgdmFyIHdhc19jbGlja2VkX2NvdW50ZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gYWxlcnQodHlwZSwgbWVzc2FnZSwgc2Vjb25kcykge1xuICAgICAgICBcbiAgICAgICAgLy8gQmx1ciBhY3RpdmUgZWxlbWVudCBmb3IgdXNlIG9mIGVudGVyIGtleSwgZm9jdXMgaW5wdXRcbiAgICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG5cbiAgICAgICAgd2FzX2NsaWNrZWRfY291bnRlcisrO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3YXNfY2xpY2tlZF9jb3VudGVyLS07XG4gICAgICAgIH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwICsgMTApKTtcblxuICAgICAgICBpZiAod2FzX2NsaWNrZWRfY291bnRlciA9PSAxKSB7XG5cbiAgICAgICAgICAgIGlmIChhbGVydF9pc19zaG93aW5nKSB7XG5cbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoYWxlcnRfdGltZW91dF8xKTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoYWxlcnRfdGltZW91dF8yKTtcblxuICAgICAgICAgICAgICAgIGFsZXJ0X2hpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0X3Nob3codHlwZSwgbWVzc2FnZSwgc2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsZXJ0X3Nob3codHlwZSwgbWVzc2FnZSwgc2Vjb25kcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWxlcnRfc2hvdyh0eXBlLCBtZXNzYWdlLCBzZWNvbmRzKSB7XG5cbiAgICAgICAgYWxlcnRfaXNfc2hvd2luZyA9IHRydWU7XG5cbiAgICAgICAgdmFyIGR1cmF0aW9uID0gMDtcbiAgICAgICAgaWYgKHR5cGVvZiBzZWNvbmRzID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAzMDAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNlY29uZHMgPCAxKSB7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IDEwMDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IHNlY29uZHMgKiAxMDAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IG5vdGllIHR5cGUgKGJhY2tncm91bmQgY29sb3IpXG4gICAgICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgYWxlcnRfb3V0ZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYWxlcnRfY29sb3Jfc3VjY2Vzc19iYWNrZ3JvdW5kO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFsZXJ0X2NvbG9yX3dhcm5pbmdfYmFja2dyb3VuZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBhbGVydF9vdXRlci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhbGVydF9jb2xvcl9lcnJvcl9iYWNrZ3JvdW5kO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFsZXJ0X2NvbG9yX2luZm9fYmFja2dyb3VuZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBub3RpZSB0ZXh0XG4gICAgICAgIGFsZXJ0X3RleHQuaW5uZXJIVE1MID0gbWVzc2FnZTtcblxuICAgICAgICAvLyBHZXQgbm90aWUncyBoZWlnaHRcbiAgICAgICAgYWxlcnRfb3V0ZXIuc3R5bGUudG9wID0gJy0xMDAwMHB4JztcbiAgICAgICAgYWxlcnRfb3V0ZXIuc3R5bGUuZGlzcGxheSA9ICd0YWJsZSc7XG4gICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLnRvcCA9ICctJyArIGFsZXJ0X291dGVyLm9mZnNldEhlaWdodCAtIDUgKyAncHgnO1xuXG4gICAgICAgIGFsZXJ0X3RpbWVvdXRfMSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGlmIChzaGFkb3cpIHsgYWxlcnRfb3V0ZXIuc3R5bGUuYm94U2hhZG93ID0gJzBweCAwcHggMTBweCAwcHggcmdiYSgwLDAsMCwwLjUpJzsgfVxuICAgICAgICAgICAgYWxlcnRfb3V0ZXIuc3R5bGUuTW96VHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuICAgICAgICAgICAgYWxlcnRfb3V0ZXIuc3R5bGUuV2Via2l0VHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuICAgICAgICAgICAgYWxlcnRfb3V0ZXIuc3R5bGUudHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuXG4gICAgICAgICAgICBhbGVydF9vdXRlci5zdHlsZS50b3AgPSAwO1xuXG4gICAgICAgICAgICBhbGVydF90aW1lb3V0XzIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgYWxlcnRfaGlkZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aGluZ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9LCBkdXJhdGlvbik7XG5cbiAgICAgICAgfSwgMjApO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWxlcnRfaGlkZShjYWxsYmFjaykge1xuXG4gICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLnRvcCA9ICctJyArIGFsZXJ0X291dGVyLm9mZnNldEhlaWdodCAtIDUgKyAncHgnO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGlmIChzaGFkb3cpIHsgYWxlcnRfb3V0ZXIuc3R5bGUuYm94U2hhZG93ID0gJyc7IH1cbiAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLk1velRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLldlYmtpdFRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYWxlcnRfb3V0ZXIuc3R5bGUudG9wID0gJy0xMDAwMHB4JztcblxuICAgICAgICAgICAgYWxlcnRfaXNfc2hvd2luZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHsgY2FsbGJhY2soKTsgfVxuXG4gICAgICAgIH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwICsgMTApKTtcblxuICAgIH1cblxuXG5cbiAgICAvLyBOT1RJRS5DT05GSVJNXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAvLyBjb25maXJtIGVsZW1lbnRzIGFuZCBzdHlsaW5nXG4gICAgdmFyIGNvbmZpcm1fb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25maXJtX291dGVyLmlkID0gY29uZmlybV9vdXRlcl9pZDtcbiAgICBjb25maXJtX291dGVyLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICBjb25maXJtX291dGVyLnN0eWxlLnRvcCA9ICcwJztcbiAgICBjb25maXJtX291dGVyLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgY29uZmlybV9vdXRlci5zdHlsZS56SW5kZXggPSAnOTk5OTk5OTk4JztcbiAgICBjb25maXJtX291dGVyLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcbiAgICBjb25maXJtX291dGVyLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBjb25maXJtX291dGVyLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUuTW96VHJhbnNpdGlvbiA9ICcnO1xuICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUuV2Via2l0VHJhbnNpdGlvbiA9ICcnO1xuICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xuXG4gICAgdmFyIGNvbmZpcm1fYmFja2dyb3VuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5pZCA9IGNvbmZpcm1fYmFja2dyb3VuZF9pZDtcbiAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS50b3AgPSAnMCc7XG4gICAgY29uZmlybV9iYWNrZ3JvdW5kLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgY29uZmlybV9iYWNrZ3JvdW5kLnN0eWxlLnpJbmRleCA9ICc5OTk5OTk5OTcnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG4gICAgY29uZmlybV9iYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS5Nb3pUcmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG4gICAgY29uZmlybV9iYWNrZ3JvdW5kLnN0eWxlLldlYmtpdFRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcbiAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUudHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICAgIFxuICAgIC8vIEhpZGUgbm90aWUuY29uZmlybSBvbiBiYWNrZ3JvdW5kIGNsaWNrXG4gICAgY29uZmlybV9iYWNrZ3JvdW5kLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGJhY2tncm91bmRfY2xpY2tfZGlzbWlzcykge1xuICAgICAgICAgICAgY29uZmlybV9oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNvbmZpcm1faW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25maXJtX2lubmVyLmlkID0gY29uZmlybV9pbm5lcl9pZDtcbiAgICBjb25maXJtX2lubmVyLnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcbiAgICBjb25maXJtX2lubmVyLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGNvbmZpcm1faW5uZXIuc3R5bGUucGFkZGluZyA9ICcyMHB4JztcbiAgICBjb25maXJtX2lubmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGNvbmZpcm1faW5uZXIuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIGNvbmZpcm1faW5uZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3JfYmFja2dyb3VuZDtcbiAgICBjb25maXJtX291dGVyLmFwcGVuZENoaWxkKGNvbmZpcm1faW5uZXIpO1xuXG4gICAgdmFyIGNvbmZpcm1feWVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uZmlybV95ZXMuaWQgPSBjb25maXJtX3llc19pZDtcbiAgICBjb25maXJtX3llcy5zdHlsZS5jc3NGbG9hdCA9ICdsZWZ0JztcbiAgICBjb25maXJtX3llcy5zdHlsZS5oZWlnaHQgPSAnNTBweCc7XG4gICAgY29uZmlybV95ZXMuc3R5bGUubGluZUhlaWdodCA9ICc1MHB4JztcbiAgICBjb25maXJtX3llcy5zdHlsZS53aWR0aCA9ICc1MCUnO1xuICAgIGNvbmZpcm1feWVzLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICBjb25maXJtX3llcy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl95ZXNfYmFja2dyb3VuZDtcbiAgICBjb25maXJtX291dGVyLmFwcGVuZENoaWxkKGNvbmZpcm1feWVzKTtcblxuICAgIHZhciBjb25maXJtX25vID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uZmlybV9uby5pZCA9IGNvbmZpcm1fbm9faWQ7XG4gICAgY29uZmlybV9uby5zdHlsZS5jc3NGbG9hdCA9ICdyaWdodCc7XG4gICAgY29uZmlybV9uby5zdHlsZS5oZWlnaHQgPSAnNTBweCc7XG4gICAgY29uZmlybV9uby5zdHlsZS5saW5lSGVpZ2h0ID0gJzUwcHgnO1xuICAgIGNvbmZpcm1fbm8uc3R5bGUud2lkdGggPSAnNTAlJztcbiAgICBjb25maXJtX25vLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICBjb25maXJtX25vLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX25vX2JhY2tncm91bmQ7XG4gICAgY29uZmlybV9uby5vbmNsaWNrID0gZnVuY3Rpb24oKSB7IGNvbmZpcm1faGlkZSgpOyB9XG4gICAgY29uZmlybV9vdXRlci5hcHBlbmRDaGlsZChjb25maXJtX25vKTtcblxuICAgIC8vIEluaXRpYWxpemUgY29uZmlybSB0ZXh0XG4gICAgdmFyIGNvbmZpcm1fdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBjb25maXJtX3RleHQuaWQgPSBjb25maXJtX3RleHRfaWQ7XG4gICAgY29uZmlybV90ZXh0LnN0eWxlLmNvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3JfdGV4dDtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gZm9udF9jaGFuZ2Vfc2NyZWVuX3dpZHRoKSB7IGNvbmZpcm1fdGV4dC5zdHlsZS5mb250U2l6ZSA9IGZvbnRfc2l6ZV9zbWFsbDsgfVxuICAgIGVsc2UgeyBjb25maXJtX3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfYmlnOyB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKHJlc2l6ZUxpc3RlbmVyLmJpbmQobnVsbCwgY29uZmlybV90ZXh0KSwgZGVib3VuY2VfdGltZSksIHRydWUpO1xuICAgIGNvbmZpcm1faW5uZXIuYXBwZW5kQ2hpbGQoY29uZmlybV90ZXh0KTtcblxuICAgIHZhciBjb25maXJtX3llc190ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGNvbmZpcm1feWVzX3RleHQuaWQgPSBjb25maXJtX3llc190ZXh0X2lkO1xuICAgIGNvbmZpcm1feWVzX3RleHQuc3R5bGUuY29sb3IgPSBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl95ZXNfdGV4dDtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gZm9udF9jaGFuZ2Vfc2NyZWVuX3dpZHRoKSB7IGNvbmZpcm1feWVzX3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfc21hbGw7IH1cbiAgICBlbHNlIHsgY29uZmlybV95ZXNfdGV4dC5zdHlsZS5mb250U2l6ZSA9IGZvbnRfc2l6ZV9iaWc7IH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UocmVzaXplTGlzdGVuZXIuYmluZChudWxsLCBjb25maXJtX3llc190ZXh0KSwgZGVib3VuY2VfdGltZSksIHRydWUpO1xuICAgIGNvbmZpcm1feWVzLmFwcGVuZENoaWxkKGNvbmZpcm1feWVzX3RleHQpO1xuXG4gICAgdmFyIGNvbmZpcm1fbm9fdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBjb25maXJtX25vX3RleHQuaWQgPSBjb25maXJtX25vX3RleHRfaWQ7XG4gICAgY29uZmlybV9ub190ZXh0LnN0eWxlLmNvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3Jfbm9fdGV4dDtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gZm9udF9jaGFuZ2Vfc2NyZWVuX3dpZHRoKSB7IGNvbmZpcm1fbm9fdGV4dC5zdHlsZS5mb250U2l6ZSA9IGZvbnRfc2l6ZV9zbWFsbDsgfVxuICAgIGVsc2UgeyBjb25maXJtX25vX3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfYmlnOyB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKHJlc2l6ZUxpc3RlbmVyLmJpbmQobnVsbCwgY29uZmlybV9ub190ZXh0KSwgZGVib3VuY2VfdGltZSksIHRydWUpO1xuICAgIGNvbmZpcm1fbm8uYXBwZW5kQ2hpbGQoY29uZmlybV9ub190ZXh0KTtcblxuICAgIC8vIEF0dGFjaCBjb25maXJtIGVsZW1lbnRzIHRvIHRoZSBib2R5IGVsZW1lbnRcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbmZpcm1fb3V0ZXIpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29uZmlybV9iYWNrZ3JvdW5kKTtcblxuICAgIC8vIERlY2xhcmUgdmFyaWFibGVzXG4gICAgdmFyIGNvbmZpcm1faGVpZ2h0ID0gMDtcbiAgICB2YXIgY29uZmlybV9pc19zaG93aW5nID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBjb25maXJtKHRpdGxlLCB5ZXNfdGV4dCwgbm9fdGV4dCwgeWVzX2NhbGxiYWNrKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBCbHVyIGFjdGl2ZSBlbGVtZW50IGZvciB1c2Ugb2YgZW50ZXIga2V5XG4gICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGFsZXJ0X2lzX3Nob3dpbmcpIHtcbiAgICAgICAgICAgIC8vIEhpZGUgbm90aWUuYWxlcnRcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChhbGVydF90aW1lb3V0XzEpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGFsZXJ0X3RpbWVvdXRfMik7XG4gICAgICAgICAgICBhbGVydF9oaWRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbmZpcm1fc2hvdyh0aXRsZSwgeWVzX3RleHQsIG5vX3RleHQsIHllc19jYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpcm1fc2hvdyh0aXRsZSwgeWVzX3RleHQsIG5vX3RleHQsIHllc19jYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgXG5cbiAgICB9XG4gICAgZnVuY3Rpb24gY29uZmlybV9zaG93KHRpdGxlLCB5ZXNfdGV4dCwgbm9fdGV4dCwgeWVzX2NhbGxiYWNrKSB7XG5cbiAgICAgICAgc2Nyb2xsX2Rpc2FibGUoKTtcblxuICAgICAgICAvLyBZZXMgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgY29uZmlybV95ZXMub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uZmlybV9oaWRlKCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHllc19jYWxsYmFjaygpO1xuICAgICAgICAgICAgfSwgKGFuaW1hdGlvbl9kZWxheSAqIDEwMDAgKyAxMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY29uZmlybV9zaG93X2lubmVyKCkge1xuXG4gICAgICAgICAgICAvLyBTZXQgY29uZmlybSB0ZXh0XG4gICAgICAgICAgICBjb25maXJtX3RleHQuaW5uZXJIVE1MID0gdGl0bGU7XG4gICAgICAgICAgICBjb25maXJtX3llc190ZXh0LmlubmVySFRNTCA9IHllc190ZXh0O1xuICAgICAgICAgICAgY29uZmlybV9ub190ZXh0LmlubmVySFRNTCA9IG5vX3RleHQ7XG5cbiAgICAgICAgICAgIC8vIEdldCBjb25maXJtJ3MgaGVpZ2h0XG4gICAgICAgICAgICBjb25maXJtX291dGVyLnN0eWxlLnRvcCA9ICctMTAwMDBweCc7XG4gICAgICAgICAgICBjb25maXJtX291dGVyLnN0eWxlLmRpc3BsYXkgPSAndGFibGUnO1xuICAgICAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS50b3AgPSAnLScgKyBjb25maXJtX291dGVyLm9mZnNldEhlaWdodCAtIDUgKyAncHgnO1xuICAgICAgICAgICAgY29uZmlybV9iYWNrZ3JvdW5kLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKHNoYWRvdykgeyBjb25maXJtX291dGVyLnN0eWxlLmJveFNoYWRvdyA9ICcwcHggMHB4IDEwcHggMHB4IHJnYmEoMCwwLDAsMC41KSc7IH1cbiAgICAgICAgICAgICAgICBjb25maXJtX291dGVyLnN0eWxlLk1velRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcbiAgICAgICAgICAgICAgICBjb25maXJtX291dGVyLnN0eWxlLldlYmtpdFRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcbiAgICAgICAgICAgICAgICBjb25maXJtX291dGVyLnN0eWxlLnRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcblxuICAgICAgICAgICAgICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUudG9wID0gMDtcbiAgICAgICAgICAgICAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUub3BhY2l0eSA9ICcwLjc1JztcblxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpcm1faXNfc2hvd2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSwgKGFuaW1hdGlvbl9kZWxheSAqIDEwMDAgKyAxMCkpO1xuXG4gICAgICAgICAgICB9LCAyMCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maXJtX2lzX3Nob3dpbmcpIHtcbiAgICAgICAgICAgIGNvbmZpcm1faGlkZSgpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb25maXJtX3Nob3dfaW5uZXIoKTtcbiAgICAgICAgICAgIH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwICsgMTApKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpcm1fc2hvd19pbm5lcigpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maXJtX2hpZGUoKSB7XG5cbiAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS50b3AgPSAnLScgKyBjb25maXJtX291dGVyLm9mZnNldEhlaWdodCAtIDUgKyAncHgnO1xuICAgICAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUub3BhY2l0eSA9ICcwJztcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZiAoc2hhZG93KSB7IGNvbmZpcm1fb3V0ZXIuc3R5bGUuYm94U2hhZG93ID0gJyc7IH1cbiAgICAgICAgICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUuTW96VHJhbnNpdGlvbiA9ICcnO1xuICAgICAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS5XZWJraXRUcmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICBjb25maXJtX291dGVyLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25maXJtX291dGVyLnN0eWxlLnRvcCA9ICctMTAwMDBweCc7XG5cbiAgICAgICAgICAgIHNjcm9sbF9lbmFibGUoKTtcblxuICAgICAgICAgICAgY29uZmlybV9pc19zaG93aW5nID0gZmFsc2U7XG5cbiAgICAgICAgfSwgKGFuaW1hdGlvbl9kZWxheSAqIDEwMDAgKyAxMCkpO1xuXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIC8vIE5PVElFLklOUFVUXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAvLyBpbnB1dCBlbGVtZW50cyBhbmQgc3R5bGluZ1xuICAgIHZhciBpbnB1dF9vdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlucHV0X291dGVyLmlkID0gaW5wdXRfb3V0ZXJfaWQ7XG4gICAgaW5wdXRfb3V0ZXIuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIGlucHV0X291dGVyLnN0eWxlLnRvcCA9ICcwJztcbiAgICBpbnB1dF9vdXRlci5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgIGlucHV0X291dGVyLnN0eWxlLnpJbmRleCA9ICc5OTk5OTk5OTgnO1xuICAgIGlucHV0X291dGVyLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcbiAgICBpbnB1dF9vdXRlci5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBpbnB1dF9vdXRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGlucHV0X291dGVyLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIGlucHV0X291dGVyLnN0eWxlLk1velRyYW5zaXRpb24gPSAnJztcbiAgICBpbnB1dF9vdXRlci5zdHlsZS5XZWJraXRUcmFuc2l0aW9uID0gJyc7XG4gICAgaW5wdXRfb3V0ZXIuc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xuXG4gICAgdmFyIGlucHV0X2JhY2tncm91bmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbnB1dF9iYWNrZ3JvdW5kLmlkID0gaW5wdXRfYmFja2dyb3VuZF9pZDtcbiAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLnRvcCA9ICcwJztcbiAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS56SW5kZXggPSAnOTk5OTk5OTk3JztcbiAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGlucHV0X2JhY2tncm91bmQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd3aGl0ZSc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS5Nb3pUcmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS5XZWJraXRUcmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS50cmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICAgIFxuICAgIC8vIEhpZGUgbm90aWUuaW5wdXQgb24gYmFja2dyb3VuZCBjbGlja1xuICAgIGlucHV0X2JhY2tncm91bmQub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoYmFja2dyb3VuZF9jbGlja19kaXNtaXNzKSB7XG4gICAgICAgICAgICBpbnB1dF9oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGlucHV0X2lubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaW5wdXRfaW5uZXIuaWQgPSBpbnB1dF9pbm5lcl9pZDtcbiAgICBpbnB1dF9pbm5lci5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG4gICAgaW5wdXRfaW5uZXIuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgaW5wdXRfaW5uZXIuc3R5bGUucGFkZGluZyA9ICcyMHB4JztcbiAgICBpbnB1dF9pbm5lci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBpbnB1dF9pbm5lci5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgaW5wdXRfaW5uZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3JfYmFja2dyb3VuZDtcbiAgICBpbnB1dF9vdXRlci5hcHBlbmRDaGlsZChpbnB1dF9pbm5lcik7XG4gICAgXG4gICAgdmFyIGlucHV0X2RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlucHV0X2Rpdi5pZCA9IGlucHV0X2Rpdl9pZDtcbiAgICBpbnB1dF9kaXYuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuICAgIGlucHV0X2Rpdi5zdHlsZS5oZWlnaHQgPSAnNTVweCc7XG4gICAgaW5wdXRfZGl2LnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGlucHV0X2Rpdi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBpbnB1dF9kaXYuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIGlucHV0X2Rpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI0ZGRic7XG4gICAgaW5wdXRfb3V0ZXIuYXBwZW5kQ2hpbGQoaW5wdXRfZGl2KTtcbiAgICBcbiAgICB2YXIgaW5wdXRfZmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGlucHV0X2ZpZWxkLmlkID0gaW5wdXRfZmllbGRfaWQ7ICAgIFxuICAgIGlucHV0X2ZpZWxkLnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xuICAgIGlucHV0X2ZpZWxkLnNldEF0dHJpYnV0ZSgnYXV0b2NvcnJlY3QnLCAnb2ZmJyk7XG4gICAgaW5wdXRfZmllbGQuc2V0QXR0cmlidXRlKCdhdXRvY2FwaXRhbGl6ZScsICdvZmYnKTtcbiAgICBpbnB1dF9maWVsZC5zZXRBdHRyaWJ1dGUoJ3NwZWxsY2hlY2snLCAnZmFsc2UnKTtcbiAgICBpbnB1dF9maWVsZC5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG4gICAgaW5wdXRfZmllbGQuc3R5bGUuaGVpZ2h0ID0gJzU1cHgnO1xuICAgIGlucHV0X2ZpZWxkLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGlucHV0X2ZpZWxkLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIGlucHV0X2ZpZWxkLnN0eWxlLnRleHRJbmRlbnQgPSAnMTBweCc7XG4gICAgaW5wdXRfZmllbGQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gJzEwcHgnO1xuICAgIGlucHV0X2ZpZWxkLnN0eWxlLm91dGxpbmUgPSAnMCc7XG4gICAgaW5wdXRfZmllbGQuc3R5bGUuYm9yZGVyID0gJzAnO1xuICAgIGlucHV0X2ZpZWxkLnN0eWxlLmZvbnRGYW1pbHkgPSAnaW5oZXJpdCc7XG4gICAgaW5wdXRfZmllbGQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfYmlnO1xuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSBmb250X2NoYW5nZV9zY3JlZW5fd2lkdGgpIHsgaW5wdXRfZmllbGQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfc21hbGw7IH1cbiAgICBlbHNlIHsgaW5wdXRfZmllbGQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfYmlnOyB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKHJlc2l6ZUxpc3RlbmVyLmJpbmQobnVsbCwgaW5wdXRfZmllbGQpLCBkZWJvdW5jZV90aW1lKSwgdHJ1ZSk7XG4gICAgaW5wdXRfZGl2LmFwcGVuZENoaWxkKGlucHV0X2ZpZWxkKTtcblxuICAgIHZhciBpbnB1dF95ZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbnB1dF95ZXMuaWQgPSBpbnB1dF95ZXNfaWQ7XG4gICAgaW5wdXRfeWVzLnN0eWxlLmNzc0Zsb2F0ID0gJ2xlZnQnO1xuICAgIGlucHV0X3llcy5zdHlsZS5oZWlnaHQgPSAnNTBweCc7XG4gICAgaW5wdXRfeWVzLnN0eWxlLmxpbmVIZWlnaHQgPSAnNTBweCc7XG4gICAgaW5wdXRfeWVzLnN0eWxlLndpZHRoID0gJzUwJSc7XG4gICAgaW5wdXRfeWVzLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICBpbnB1dF95ZXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3JfeWVzX2JhY2tncm91bmQ7XG4gICAgaW5wdXRfb3V0ZXIuYXBwZW5kQ2hpbGQoaW5wdXRfeWVzKTtcblxuICAgIHZhciBpbnB1dF9ubyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlucHV0X25vLmlkID0gaW5wdXRfbm9faWQ7XG4gICAgaW5wdXRfbm8uc3R5bGUuY3NzRmxvYXQgPSAncmlnaHQnO1xuICAgIGlucHV0X25vLnN0eWxlLmhlaWdodCA9ICc1MHB4JztcbiAgICBpbnB1dF9uby5zdHlsZS5saW5lSGVpZ2h0ID0gJzUwcHgnO1xuICAgIGlucHV0X25vLnN0eWxlLndpZHRoID0gJzUwJSc7XG4gICAgaW5wdXRfbm8uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgIGlucHV0X25vLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX25vX2JhY2tncm91bmQ7XG4gICAgaW5wdXRfbm8ub25jbGljayA9IGZ1bmN0aW9uKCkgeyBpbnB1dF9oaWRlKCk7IH1cbiAgICBpbnB1dF9vdXRlci5hcHBlbmRDaGlsZChpbnB1dF9ubyk7XG5cbiAgICAvLyBJbml0aWFsaXplIGlucHV0IHRleHRcbiAgICB2YXIgaW5wdXRfdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBpbnB1dF90ZXh0LmlkID0gaW5wdXRfdGV4dF9pZDtcbiAgICBpbnB1dF90ZXh0LnN0eWxlLmNvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3JfdGV4dDtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gZm9udF9jaGFuZ2Vfc2NyZWVuX3dpZHRoKSB7IGlucHV0X3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfc21hbGw7IH1cbiAgICBlbHNlIHsgaW5wdXRfdGV4dC5zdHlsZS5mb250U2l6ZSA9IGZvbnRfc2l6ZV9iaWc7IH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UocmVzaXplTGlzdGVuZXIuYmluZChudWxsLCBpbnB1dF90ZXh0KSwgZGVib3VuY2VfdGltZSksIHRydWUpO1xuICAgIGlucHV0X2lubmVyLmFwcGVuZENoaWxkKGlucHV0X3RleHQpO1xuXG4gICAgdmFyIGlucHV0X3llc190ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGlucHV0X3llc190ZXh0LmlkID0gaW5wdXRfeWVzX3RleHRfaWQ7XG4gICAgaW5wdXRfeWVzX3RleHQuc3R5bGUuY29sb3IgPSBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl95ZXNfdGV4dDtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gZm9udF9jaGFuZ2Vfc2NyZWVuX3dpZHRoKSB7IGlucHV0X3llc190ZXh0LnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX3NtYWxsOyB9XG4gICAgZWxzZSB7IGlucHV0X3llc190ZXh0LnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX2JpZzsgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZShyZXNpemVMaXN0ZW5lci5iaW5kKG51bGwsIGlucHV0X3llc190ZXh0KSwgZGVib3VuY2VfdGltZSksIHRydWUpO1xuICAgIGlucHV0X3llcy5hcHBlbmRDaGlsZChpbnB1dF95ZXNfdGV4dCk7XG5cbiAgICB2YXIgaW5wdXRfbm9fdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBpbnB1dF9ub190ZXh0LmlkID0gaW5wdXRfbm9fdGV4dF9pZDtcbiAgICBpbnB1dF9ub190ZXh0LnN0eWxlLmNvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3Jfbm9fdGV4dDtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gZm9udF9jaGFuZ2Vfc2NyZWVuX3dpZHRoKSB7IGlucHV0X25vX3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfc21hbGw7IH1cbiAgICBlbHNlIHsgaW5wdXRfbm9fdGV4dC5zdHlsZS5mb250U2l6ZSA9IGZvbnRfc2l6ZV9iaWc7IH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UocmVzaXplTGlzdGVuZXIuYmluZChudWxsLCBpbnB1dF9ub190ZXh0KSwgZGVib3VuY2VfdGltZSksIHRydWUpO1xuICAgIGlucHV0X25vLmFwcGVuZENoaWxkKGlucHV0X25vX3RleHQpO1xuXG4gICAgLy8gQXR0YWNoIGlucHV0IGVsZW1lbnRzIHRvIHRoZSBib2R5IGVsZW1lbnRcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlucHV0X291dGVyKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlucHV0X2JhY2tncm91bmQpO1xuXG4gICAgLy8gRGVjbGFyZSB2YXJpYWJsZXNcbiAgICB2YXIgaW5wdXRfaGVpZ2h0ID0gMDtcbiAgICB2YXIgaW5wdXRfaXNfc2hvd2luZyA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gaW5wdXQodGl0bGUsIHN1Ym1pdF90ZXh0LCBjYW5jZWxfdGV4dCwgdHlwZSwgcGxhY2Vob2xkZXIsIHN1Ym1pdF9jYWxsYmFjaywgcHJlZmlsbGVkX3ZhbHVlX29wdGlvbmFsKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBCbHVyIGFjdGl2ZSBlbGVtZW50IGZvciB1c2Ugb2YgZW50ZXIga2V5LCBmb2N1cyBpbnB1dFxuICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgaW5wdXRfZmllbGQuZm9jdXMoKTsgfSwgKGFuaW1hdGlvbl9kZWxheSAqIDEwMDApKTtcbiAgICAgICAgXG4gICAgICAgIGlucHV0X2ZpZWxkLnNldEF0dHJpYnV0ZSgndHlwZScsIHR5cGUpO1xuICAgICAgICBpbnB1dF9maWVsZC5zZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJywgcGxhY2Vob2xkZXIpO1xuICAgICAgICBpbnB1dF9maWVsZC52YWx1ZSA9ICcnO1xuICAgICAgICBpZiAodHlwZW9mIHByZWZpbGxlZF92YWx1ZV9vcHRpb25hbCAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJlZmlsbGVkX3ZhbHVlX29wdGlvbmFsLmxlbmd0aCA+IDApIHsgaW5wdXRfZmllbGQudmFsdWUgPSBwcmVmaWxsZWRfdmFsdWVfb3B0aW9uYWwgfVxuICAgICAgICBcbiAgICAgICAgaWYgKGFsZXJ0X2lzX3Nob3dpbmcpIHtcbiAgICAgICAgICAgIC8vIEhpZGUgbm90aWUuYWxlcnRcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChhbGVydF90aW1lb3V0XzEpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGFsZXJ0X3RpbWVvdXRfMik7XG4gICAgICAgICAgICBhbGVydF9oaWRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlucHV0X3Nob3codGl0bGUsIHN1Ym1pdF90ZXh0LCBjYW5jZWxfdGV4dCwgc3VibWl0X2NhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW5wdXRfc2hvdyh0aXRsZSwgc3VibWl0X3RleHQsIGNhbmNlbF90ZXh0LCBzdWJtaXRfY2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgZnVuY3Rpb24gaW5wdXRfc2hvdyh0aXRsZSwgc3VibWl0X3RleHQsIGNhbmNlbF90ZXh0LCBzdWJtaXRfY2FsbGJhY2spIHtcblxuICAgICAgICBzY3JvbGxfZGlzYWJsZSgpO1xuXG4gICAgICAgIC8vIFllcyBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICBpbnB1dF95ZXMub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5wdXRfaGlkZSgpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzdWJtaXRfY2FsbGJhY2soaW5wdXRfZmllbGQudmFsdWUpO1xuICAgICAgICAgICAgfSwgKGFuaW1hdGlvbl9kZWxheSAqIDEwMDAgKyAxMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaW5wdXRfc2hvd19pbm5lcigpIHtcblxuICAgICAgICAgICAgLy8gU2V0IGlucHV0IHRleHRcbiAgICAgICAgICAgIGlucHV0X3RleHQuaW5uZXJIVE1MID0gdGl0bGU7XG4gICAgICAgICAgICBpbnB1dF95ZXNfdGV4dC5pbm5lckhUTUwgPSBzdWJtaXRfdGV4dDtcbiAgICAgICAgICAgIGlucHV0X25vX3RleHQuaW5uZXJIVE1MID0gY2FuY2VsX3RleHQ7XG5cbiAgICAgICAgICAgIC8vIEdldCBpbnB1dCdzIGhlaWdodFxuICAgICAgICAgICAgaW5wdXRfb3V0ZXIuc3R5bGUudG9wID0gJy0xMDAwMHB4JztcbiAgICAgICAgICAgIGlucHV0X291dGVyLnN0eWxlLmRpc3BsYXkgPSAndGFibGUnO1xuICAgICAgICAgICAgaW5wdXRfb3V0ZXIuc3R5bGUudG9wID0gJy0nICsgaW5wdXRfb3V0ZXIub2Zmc2V0SGVpZ2h0IC0gNSArICdweCc7XG4gICAgICAgICAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKHNoYWRvdykgeyBpbnB1dF9vdXRlci5zdHlsZS5ib3hTaGFkb3cgPSAnMHB4IDBweCAxMHB4IDBweCByZ2JhKDAsMCwwLDAuNSknOyB9XG4gICAgICAgICAgICAgICAgaW5wdXRfb3V0ZXIuc3R5bGUuTW96VHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuICAgICAgICAgICAgICAgIGlucHV0X291dGVyLnN0eWxlLldlYmtpdFRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcbiAgICAgICAgICAgICAgICBpbnB1dF9vdXRlci5zdHlsZS50cmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG5cbiAgICAgICAgICAgICAgICBpbnB1dF9vdXRlci5zdHlsZS50b3AgPSAwO1xuICAgICAgICAgICAgICAgIGlucHV0X2JhY2tncm91bmQuc3R5bGUub3BhY2l0eSA9ICcwLjc1JztcblxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0X2lzX3Nob3dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwICsgMTApKTtcblxuICAgICAgICAgICAgfSwgMjApO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5wdXRfaXNfc2hvd2luZykge1xuICAgICAgICAgICAgaW5wdXRfaGlkZSgpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpbnB1dF9zaG93X2lubmVyKCk7XG4gICAgICAgICAgICB9LCAoYW5pbWF0aW9uX2RlbGF5ICogMTAwMCArIDEwKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpbnB1dF9zaG93X2lubmVyKCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlucHV0X2hpZGUoKSB7XG5cbiAgICAgICAgaW5wdXRfb3V0ZXIuc3R5bGUudG9wID0gJy0nICsgaW5wdXRfb3V0ZXIub2Zmc2V0SGVpZ2h0IC0gNSArICdweCc7XG4gICAgICAgIGlucHV0X2JhY2tncm91bmQuc3R5bGUub3BhY2l0eSA9ICcwJztcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZiAoc2hhZG93KSB7IGlucHV0X291dGVyLnN0eWxlLmJveFNoYWRvdyA9ICcnOyB9XG4gICAgICAgICAgICBpbnB1dF9vdXRlci5zdHlsZS5Nb3pUcmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICBpbnB1dF9vdXRlci5zdHlsZS5XZWJraXRUcmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICBpbnB1dF9vdXRlci5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlucHV0X291dGVyLnN0eWxlLnRvcCA9ICctMTAwMDBweCc7XG5cbiAgICAgICAgICAgIHNjcm9sbF9lbmFibGUoKTtcblxuICAgICAgICAgICAgaW5wdXRfaXNfc2hvd2luZyA9IGZhbHNlO1xuXG4gICAgICAgIH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwICsgMTApKTtcblxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgICBhbGVydDogYWxlcnQsXG4gICAgICAgIGNvbmZpcm06IGNvbmZpcm0sXG4gICAgICAgIGlucHV0OiBpbnB1dFxuICAgIH07XG5cbn0oKTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gbm90aWU7XG59IiwiLyohIG5vdWlzbGlkZXIgLSA4LjIuMSAtIDIwMTUtMTItMDIgMjE6NDM6MTQgKi9cclxuXHJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xyXG5cclxuICAgIGlmICggdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xyXG5cclxuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXHJcbiAgICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKCB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgKSB7XHJcblxyXG4gICAgICAgIC8vIE5vZGUvQ29tbW9uSlNcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcclxuICAgICAgICB3aW5kb3cubm9VaVNsaWRlciA9IGZhY3RvcnkoKTtcclxuICAgIH1cclxuXHJcbn0oZnVuY3Rpb24oICl7XHJcblxyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblxyXG5cdC8vIFJlbW92ZXMgZHVwbGljYXRlcyBmcm9tIGFuIGFycmF5LlxyXG5cdGZ1bmN0aW9uIHVuaXF1ZShhcnJheSkge1xyXG5cdFx0cmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbihhKXtcclxuXHRcdFx0cmV0dXJuICF0aGlzW2FdID8gdGhpc1thXSA9IHRydWUgOiBmYWxzZTtcclxuXHRcdH0sIHt9KTtcclxuXHR9XHJcblxyXG5cdC8vIFJvdW5kIGEgdmFsdWUgdG8gdGhlIGNsb3Nlc3QgJ3RvJy5cclxuXHRmdW5jdGlvbiBjbG9zZXN0ICggdmFsdWUsIHRvICkge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQodmFsdWUgLyB0bykgKiB0bztcclxuXHR9XHJcblxyXG5cdC8vIEN1cnJlbnQgcG9zaXRpb24gb2YgYW4gZWxlbWVudCByZWxhdGl2ZSB0byB0aGUgZG9jdW1lbnQuXHJcblx0ZnVuY3Rpb24gb2Zmc2V0ICggZWxlbSApIHtcclxuXHJcblx0dmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxyXG5cdFx0ZG9jID0gZWxlbS5vd25lckRvY3VtZW50LFxyXG5cdFx0ZG9jRWxlbSA9IGRvYy5kb2N1bWVudEVsZW1lbnQsXHJcblx0XHRwYWdlT2Zmc2V0ID0gZ2V0UGFnZU9mZnNldCgpO1xyXG5cclxuXHRcdC8vIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBjb250YWlucyBsZWZ0IHNjcm9sbCBpbiBDaHJvbWUgb24gQW5kcm9pZC5cclxuXHRcdC8vIEkgaGF2ZW4ndCBmb3VuZCBhIGZlYXR1cmUgZGV0ZWN0aW9uIHRoYXQgcHJvdmVzIHRoaXMuIFdvcnN0IGNhc2VcclxuXHRcdC8vIHNjZW5hcmlvIG9uIG1pcy1tYXRjaDogdGhlICd0YXAnIGZlYXR1cmUgb24gaG9yaXpvbnRhbCBzbGlkZXJzIGJyZWFrcy5cclxuXHRcdGlmICggL3dlYmtpdC4qQ2hyb21lLipNb2JpbGUvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICkge1xyXG5cdFx0XHRwYWdlT2Zmc2V0LnggPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHRvcDogcmVjdC50b3AgKyBwYWdlT2Zmc2V0LnkgLSBkb2NFbGVtLmNsaWVudFRvcCxcclxuXHRcdFx0bGVmdDogcmVjdC5sZWZ0ICsgcGFnZU9mZnNldC54IC0gZG9jRWxlbS5jbGllbnRMZWZ0XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Ly8gQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBudW1lcmljYWwuXHJcblx0ZnVuY3Rpb24gaXNOdW1lcmljICggYSApIHtcclxuXHRcdHJldHVybiB0eXBlb2YgYSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKCBhICkgJiYgaXNGaW5pdGUoIGEgKTtcclxuXHR9XHJcblxyXG5cdC8vIFJvdW5kcyBhIG51bWJlciB0byA3IHN1cHBvcnRlZCBkZWNpbWFscy5cclxuXHRmdW5jdGlvbiBhY2N1cmF0ZU51bWJlciggbnVtYmVyICkge1xyXG5cdFx0dmFyIHAgPSBNYXRoLnBvdygxMCwgNyk7XHJcblx0XHRyZXR1cm4gTnVtYmVyKChNYXRoLnJvdW5kKG51bWJlcipwKS9wKS50b0ZpeGVkKDcpKTtcclxuXHR9XHJcblxyXG5cdC8vIFNldHMgYSBjbGFzcyBhbmQgcmVtb3ZlcyBpdCBhZnRlciBbZHVyYXRpb25dIG1zLlxyXG5cdGZ1bmN0aW9uIGFkZENsYXNzRm9yICggZWxlbWVudCwgY2xhc3NOYW1lLCBkdXJhdGlvbiApIHtcclxuXHRcdGFkZENsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XHJcblx0XHR9LCBkdXJhdGlvbik7XHJcblx0fVxyXG5cclxuXHQvLyBMaW1pdHMgYSB2YWx1ZSB0byAwIC0gMTAwXHJcblx0ZnVuY3Rpb24gbGltaXQgKCBhICkge1xyXG5cdFx0cmV0dXJuIE1hdGgubWF4KE1hdGgubWluKGEsIDEwMCksIDApO1xyXG5cdH1cclxuXHJcblx0Ly8gV3JhcHMgYSB2YXJpYWJsZSBhcyBhbiBhcnJheSwgaWYgaXQgaXNuJ3Qgb25lIHlldC5cclxuXHRmdW5jdGlvbiBhc0FycmF5ICggYSApIHtcclxuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGEpID8gYSA6IFthXTtcclxuXHR9XHJcblxyXG5cdC8vIENvdW50cyBkZWNpbWFsc1xyXG5cdGZ1bmN0aW9uIGNvdW50RGVjaW1hbHMgKCBudW1TdHIgKSB7XHJcblx0XHR2YXIgcGllY2VzID0gbnVtU3RyLnNwbGl0KFwiLlwiKTtcclxuXHRcdHJldHVybiBwaWVjZXMubGVuZ3RoID4gMSA/IHBpZWNlc1sxXS5sZW5ndGggOiAwO1xyXG5cdH1cclxuXHJcblx0Ly8gaHR0cDovL3lvdW1pZ2h0bm90bmVlZGpxdWVyeS5jb20vI2FkZF9jbGFzc1xyXG5cdGZ1bmN0aW9uIGFkZENsYXNzICggZWwsIGNsYXNzTmFtZSApIHtcclxuXHRcdGlmICggZWwuY2xhc3NMaXN0ICkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gaHR0cDovL3lvdW1pZ2h0bm90bmVlZGpxdWVyeS5jb20vI3JlbW92ZV9jbGFzc1xyXG5cdGZ1bmN0aW9uIHJlbW92ZUNsYXNzICggZWwsIGNsYXNzTmFtZSApIHtcclxuXHRcdGlmICggZWwuY2xhc3NMaXN0ICkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoXnxcXFxcYiknICsgY2xhc3NOYW1lLnNwbGl0KCcgJykuam9pbignfCcpICsgJyhcXFxcYnwkKScsICdnaScpLCAnICcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gaHR0cDovL3lvdW1pZ2h0bm90bmVlZGpxdWVyeS5jb20vI2hhc19jbGFzc1xyXG5cdGZ1bmN0aW9uIGhhc0NsYXNzICggZWwsIGNsYXNzTmFtZSApIHtcclxuXHRcdGlmICggZWwuY2xhc3NMaXN0ICkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG5ldyBSZWdFeHAoJyhefCApJyArIGNsYXNzTmFtZSArICcoIHwkKScsICdnaScpLnRlc3QoZWwuY2xhc3NOYW1lKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XaW5kb3cvc2Nyb2xsWSNOb3Rlc1xyXG5cdGZ1bmN0aW9uIGdldFBhZ2VPZmZzZXQgKCApIHtcclxuXHJcblx0XHR2YXIgc3VwcG9ydFBhZ2VPZmZzZXQgPSB3aW5kb3cucGFnZVhPZmZzZXQgIT09IHVuZGVmaW5lZCxcclxuXHRcdFx0aXNDU1MxQ29tcGF0ID0gKChkb2N1bWVudC5jb21wYXRNb2RlIHx8IFwiXCIpID09PSBcIkNTUzFDb21wYXRcIiksXHJcblx0XHRcdHggPSBzdXBwb3J0UGFnZU9mZnNldCA/IHdpbmRvdy5wYWdlWE9mZnNldCA6IGlzQ1NTMUNvbXBhdCA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IDogZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0LFxyXG5cdFx0XHR5ID0gc3VwcG9ydFBhZ2VPZmZzZXQgPyB3aW5kb3cucGFnZVlPZmZzZXQgOiBpc0NTUzFDb21wYXQgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDogZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdC8vIFNob3J0aGFuZCBmb3Igc3RvcFByb3BhZ2F0aW9uIHNvIHdlIGRvbid0IGhhdmUgdG8gY3JlYXRlIGEgZHluYW1pYyBtZXRob2RcclxuXHRmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCBlICkge1xyXG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHR9XHJcblxyXG5cdC8vIHRvZG9cclxuXHRmdW5jdGlvbiBhZGRDc3NQcmVmaXgoY3NzUHJlZml4KSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oY2xhc3NOYW1lKSB7XHJcblx0XHRcdHJldHVybiBjc3NQcmVmaXggKyBjbGFzc05hbWU7XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblxyXG5cdHZhclxyXG5cdC8vIERldGVybWluZSB0aGUgZXZlbnRzIHRvIGJpbmQuIElFMTEgaW1wbGVtZW50cyBwb2ludGVyRXZlbnRzIHdpdGhvdXRcclxuXHQvLyBhIHByZWZpeCwgd2hpY2ggYnJlYWtzIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgSUUxMCBpbXBsZW1lbnRhdGlvbi5cclxuXHQvKiogQGNvbnN0ICovXHJcblx0YWN0aW9ucyA9IHdpbmRvdy5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgPyB7XHJcblx0XHRzdGFydDogJ3BvaW50ZXJkb3duJyxcclxuXHRcdG1vdmU6ICdwb2ludGVybW92ZScsXHJcblx0XHRlbmQ6ICdwb2ludGVydXAnXHJcblx0fSA6IHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCA/IHtcclxuXHRcdHN0YXJ0OiAnTVNQb2ludGVyRG93bicsXHJcblx0XHRtb3ZlOiAnTVNQb2ludGVyTW92ZScsXHJcblx0XHRlbmQ6ICdNU1BvaW50ZXJVcCdcclxuXHR9IDoge1xyXG5cdFx0c3RhcnQ6ICdtb3VzZWRvd24gdG91Y2hzdGFydCcsXHJcblx0XHRtb3ZlOiAnbW91c2Vtb3ZlIHRvdWNobW92ZScsXHJcblx0XHRlbmQ6ICdtb3VzZXVwIHRvdWNoZW5kJ1xyXG5cdH0sXHJcblx0ZGVmYXVsdENzc1ByZWZpeCA9ICdub1VpLSc7XHJcblxyXG5cclxuLy8gVmFsdWUgY2FsY3VsYXRpb25cclxuXHJcblx0Ly8gRGV0ZXJtaW5lIHRoZSBzaXplIG9mIGEgc3ViLXJhbmdlIGluIHJlbGF0aW9uIHRvIGEgZnVsbCByYW5nZS5cclxuXHRmdW5jdGlvbiBzdWJSYW5nZVJhdGlvICggcGEsIHBiICkge1xyXG5cdFx0cmV0dXJuICgxMDAgLyAocGIgLSBwYSkpO1xyXG5cdH1cclxuXHJcblx0Ly8gKHBlcmNlbnRhZ2UpIEhvdyBtYW55IHBlcmNlbnQgaXMgdGhpcyB2YWx1ZSBvZiB0aGlzIHJhbmdlP1xyXG5cdGZ1bmN0aW9uIGZyb21QZXJjZW50YWdlICggcmFuZ2UsIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuICh2YWx1ZSAqIDEwMCkgLyAoIHJhbmdlWzFdIC0gcmFuZ2VbMF0gKTtcclxuXHR9XHJcblxyXG5cdC8vIChwZXJjZW50YWdlKSBXaGVyZSBpcyB0aGlzIHZhbHVlIG9uIHRoaXMgcmFuZ2U/XHJcblx0ZnVuY3Rpb24gdG9QZXJjZW50YWdlICggcmFuZ2UsIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuIGZyb21QZXJjZW50YWdlKCByYW5nZSwgcmFuZ2VbMF0gPCAwID9cclxuXHRcdFx0dmFsdWUgKyBNYXRoLmFicyhyYW5nZVswXSkgOlxyXG5cdFx0XHRcdHZhbHVlIC0gcmFuZ2VbMF0gKTtcclxuXHR9XHJcblxyXG5cdC8vICh2YWx1ZSkgSG93IG11Y2ggaXMgdGhpcyBwZXJjZW50YWdlIG9uIHRoaXMgcmFuZ2U/XHJcblx0ZnVuY3Rpb24gaXNQZXJjZW50YWdlICggcmFuZ2UsIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuICgodmFsdWUgKiAoIHJhbmdlWzFdIC0gcmFuZ2VbMF0gKSkgLyAxMDApICsgcmFuZ2VbMF07XHJcblx0fVxyXG5cclxuXHJcbi8vIFJhbmdlIGNvbnZlcnNpb25cclxuXHJcblx0ZnVuY3Rpb24gZ2V0SiAoIHZhbHVlLCBhcnIgKSB7XHJcblxyXG5cdFx0dmFyIGogPSAxO1xyXG5cclxuXHRcdHdoaWxlICggdmFsdWUgPj0gYXJyW2pdICl7XHJcblx0XHRcdGogKz0gMTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gajtcclxuXHR9XHJcblxyXG5cdC8vIChwZXJjZW50YWdlKSBJbnB1dCBhIHZhbHVlLCBmaW5kIHdoZXJlLCBvbiBhIHNjYWxlIG9mIDAtMTAwLCBpdCBhcHBsaWVzLlxyXG5cdGZ1bmN0aW9uIHRvU3RlcHBpbmcgKCB4VmFsLCB4UGN0LCB2YWx1ZSApIHtcclxuXHJcblx0XHRpZiAoIHZhbHVlID49IHhWYWwuc2xpY2UoLTEpWzBdICl7XHJcblx0XHRcdHJldHVybiAxMDA7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGogPSBnZXRKKCB2YWx1ZSwgeFZhbCApLCB2YSwgdmIsIHBhLCBwYjtcclxuXHJcblx0XHR2YSA9IHhWYWxbai0xXTtcclxuXHRcdHZiID0geFZhbFtqXTtcclxuXHRcdHBhID0geFBjdFtqLTFdO1xyXG5cdFx0cGIgPSB4UGN0W2pdO1xyXG5cclxuXHRcdHJldHVybiBwYSArICh0b1BlcmNlbnRhZ2UoW3ZhLCB2Yl0sIHZhbHVlKSAvIHN1YlJhbmdlUmF0aW8gKHBhLCBwYikpO1xyXG5cdH1cclxuXHJcblx0Ly8gKHZhbHVlKSBJbnB1dCBhIHBlcmNlbnRhZ2UsIGZpbmQgd2hlcmUgaXQgaXMgb24gdGhlIHNwZWNpZmllZCByYW5nZS5cclxuXHRmdW5jdGlvbiBmcm9tU3RlcHBpbmcgKCB4VmFsLCB4UGN0LCB2YWx1ZSApIHtcclxuXHJcblx0XHQvLyBUaGVyZSBpcyBubyByYW5nZSBncm91cCB0aGF0IGZpdHMgMTAwXHJcblx0XHRpZiAoIHZhbHVlID49IDEwMCApe1xyXG5cdFx0XHRyZXR1cm4geFZhbC5zbGljZSgtMSlbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGogPSBnZXRKKCB2YWx1ZSwgeFBjdCApLCB2YSwgdmIsIHBhLCBwYjtcclxuXHJcblx0XHR2YSA9IHhWYWxbai0xXTtcclxuXHRcdHZiID0geFZhbFtqXTtcclxuXHRcdHBhID0geFBjdFtqLTFdO1xyXG5cdFx0cGIgPSB4UGN0W2pdO1xyXG5cclxuXHRcdHJldHVybiBpc1BlcmNlbnRhZ2UoW3ZhLCB2Yl0sICh2YWx1ZSAtIHBhKSAqIHN1YlJhbmdlUmF0aW8gKHBhLCBwYikpO1xyXG5cdH1cclxuXHJcblx0Ly8gKHBlcmNlbnRhZ2UpIEdldCB0aGUgc3RlcCB0aGF0IGFwcGxpZXMgYXQgYSBjZXJ0YWluIHZhbHVlLlxyXG5cdGZ1bmN0aW9uIGdldFN0ZXAgKCB4UGN0LCB4U3RlcHMsIHNuYXAsIHZhbHVlICkge1xyXG5cclxuXHRcdGlmICggdmFsdWUgPT09IDEwMCApIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBqID0gZ2V0SiggdmFsdWUsIHhQY3QgKSwgYSwgYjtcclxuXHJcblx0XHQvLyBJZiAnc25hcCcgaXMgc2V0LCBzdGVwcyBhcmUgdXNlZCBhcyBmaXhlZCBwb2ludHMgb24gdGhlIHNsaWRlci5cclxuXHRcdGlmICggc25hcCApIHtcclxuXHJcblx0XHRcdGEgPSB4UGN0W2otMV07XHJcblx0XHRcdGIgPSB4UGN0W2pdO1xyXG5cclxuXHRcdFx0Ly8gRmluZCB0aGUgY2xvc2VzdCBwb3NpdGlvbiwgYSBvciBiLlxyXG5cdFx0XHRpZiAoKHZhbHVlIC0gYSkgPiAoKGItYSkvMikpe1xyXG5cdFx0XHRcdHJldHVybiBiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoICF4U3RlcHNbai0xXSApe1xyXG5cdFx0XHRyZXR1cm4gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHhQY3Rbai0xXSArIGNsb3Nlc3QoXHJcblx0XHRcdHZhbHVlIC0geFBjdFtqLTFdLFxyXG5cdFx0XHR4U3RlcHNbai0xXVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cclxuLy8gRW50cnkgcGFyc2luZ1xyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVFbnRyeVBvaW50ICggaW5kZXgsIHZhbHVlLCB0aGF0ICkge1xyXG5cclxuXHRcdHZhciBwZXJjZW50YWdlO1xyXG5cclxuXHRcdC8vIFdyYXAgbnVtZXJpY2FsIGlucHV0IGluIGFuIGFycmF5LlxyXG5cdFx0aWYgKCB0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIgKSB7XHJcblx0XHRcdHZhbHVlID0gW3ZhbHVlXTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBSZWplY3QgYW55IGludmFsaWQgaW5wdXQsIGJ5IHRlc3Rpbmcgd2hldGhlciB2YWx1ZSBpcyBhbiBhcnJheS5cclxuXHRcdGlmICggT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCB2YWx1ZSApICE9PSAnW29iamVjdCBBcnJheV0nICl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdyYW5nZScgY29udGFpbnMgaW52YWxpZCB2YWx1ZS5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ292ZXJ0IG1pbi9tYXggc3ludGF4IHRvIDAgYW5kIDEwMC5cclxuXHRcdGlmICggaW5kZXggPT09ICdtaW4nICkge1xyXG5cdFx0XHRwZXJjZW50YWdlID0gMDtcclxuXHRcdH0gZWxzZSBpZiAoIGluZGV4ID09PSAnbWF4JyApIHtcclxuXHRcdFx0cGVyY2VudGFnZSA9IDEwMDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHBlcmNlbnRhZ2UgPSBwYXJzZUZsb2F0KCBpbmRleCApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENoZWNrIGZvciBjb3JyZWN0IGlucHV0LlxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKCBwZXJjZW50YWdlICkgfHwgIWlzTnVtZXJpYyggdmFsdWVbMF0gKSApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ3JhbmdlJyB2YWx1ZSBpc24ndCBudW1lcmljLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTdG9yZSB2YWx1ZXMuXHJcblx0XHR0aGF0LnhQY3QucHVzaCggcGVyY2VudGFnZSApO1xyXG5cdFx0dGhhdC54VmFsLnB1c2goIHZhbHVlWzBdICk7XHJcblxyXG5cdFx0Ly8gTmFOIHdpbGwgZXZhbHVhdGUgdG8gZmFsc2UgdG9vLCBidXQgdG8ga2VlcFxyXG5cdFx0Ly8gbG9nZ2luZyBjbGVhciwgc2V0IHN0ZXAgZXhwbGljaXRseS4gTWFrZSBzdXJlXHJcblx0XHQvLyBub3QgdG8gb3ZlcnJpZGUgdGhlICdzdGVwJyBzZXR0aW5nIHdpdGggZmFsc2UuXHJcblx0XHRpZiAoICFwZXJjZW50YWdlICkge1xyXG5cdFx0XHRpZiAoICFpc05hTiggdmFsdWVbMV0gKSApIHtcclxuXHRcdFx0XHR0aGF0LnhTdGVwc1swXSA9IHZhbHVlWzFdO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGF0LnhTdGVwcy5wdXNoKCBpc05hTih2YWx1ZVsxXSkgPyBmYWxzZSA6IHZhbHVlWzFdICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVTdGVwUG9pbnQgKCBpLCBuLCB0aGF0ICkge1xyXG5cclxuXHRcdC8vIElnbm9yZSAnZmFsc2UnIHN0ZXBwaW5nLlxyXG5cdFx0aWYgKCAhbiApIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmFjdG9yIHRvIHJhbmdlIHJhdGlvXHJcblx0XHR0aGF0LnhTdGVwc1tpXSA9IGZyb21QZXJjZW50YWdlKFtcclxuXHRcdFx0IHRoYXQueFZhbFtpXVxyXG5cdFx0XHQsdGhhdC54VmFsW2krMV1cclxuXHRcdF0sIG4pIC8gc3ViUmFuZ2VSYXRpbyAoXHJcblx0XHRcdHRoYXQueFBjdFtpXSxcclxuXHRcdFx0dGhhdC54UGN0W2krMV0gKTtcclxuXHR9XHJcblxyXG5cclxuLy8gSW50ZXJmYWNlXHJcblxyXG5cdC8vIFRoZSBpbnRlcmZhY2UgdG8gU3BlY3RydW0gaGFuZGxlcyBhbGwgZGlyZWN0aW9uLWJhc2VkXHJcblx0Ly8gY29udmVyc2lvbnMsIHNvIHRoZSBhYm92ZSB2YWx1ZXMgYXJlIHVuYXdhcmUuXHJcblxyXG5cdGZ1bmN0aW9uIFNwZWN0cnVtICggZW50cnksIHNuYXAsIGRpcmVjdGlvbiwgc2luZ2xlU3RlcCApIHtcclxuXHJcblx0XHR0aGlzLnhQY3QgPSBbXTtcclxuXHRcdHRoaXMueFZhbCA9IFtdO1xyXG5cdFx0dGhpcy54U3RlcHMgPSBbIHNpbmdsZVN0ZXAgfHwgZmFsc2UgXTtcclxuXHRcdHRoaXMueE51bVN0ZXBzID0gWyBmYWxzZSBdO1xyXG5cclxuXHRcdHRoaXMuc25hcCA9IHNuYXA7XHJcblx0XHR0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuXHJcblx0XHR2YXIgaW5kZXgsIG9yZGVyZWQgPSBbIC8qIFswLCAnbWluJ10sIFsxLCAnNTAlJ10sIFsyLCAnbWF4J10gKi8gXTtcclxuXHJcblx0XHQvLyBNYXAgdGhlIG9iamVjdCBrZXlzIHRvIGFuIGFycmF5LlxyXG5cdFx0Zm9yICggaW5kZXggaW4gZW50cnkgKSB7XHJcblx0XHRcdGlmICggZW50cnkuaGFzT3duUHJvcGVydHkoaW5kZXgpICkge1xyXG5cdFx0XHRcdG9yZGVyZWQucHVzaChbZW50cnlbaW5kZXhdLCBpbmRleF0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU29ydCBhbGwgZW50cmllcyBieSB2YWx1ZSAobnVtZXJpYyBzb3J0KS5cclxuXHRcdGlmICggb3JkZXJlZC5sZW5ndGggJiYgdHlwZW9mIG9yZGVyZWRbMF1bMF0gPT09IFwib2JqZWN0XCIgKSB7XHJcblx0XHRcdG9yZGVyZWQuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhWzBdWzBdIC0gYlswXVswXTsgfSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvcmRlcmVkLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYVswXSAtIGJbMF07IH0pO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvLyBDb252ZXJ0IGFsbCBlbnRyaWVzIHRvIHN1YnJhbmdlcy5cclxuXHRcdGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBvcmRlcmVkLmxlbmd0aDsgaW5kZXgrKyApIHtcclxuXHRcdFx0aGFuZGxlRW50cnlQb2ludChvcmRlcmVkW2luZGV4XVsxXSwgb3JkZXJlZFtpbmRleF1bMF0sIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFN0b3JlIHRoZSBhY3R1YWwgc3RlcCB2YWx1ZXMuXHJcblx0XHQvLyB4U3RlcHMgaXMgc29ydGVkIGluIHRoZSBzYW1lIG9yZGVyIGFzIHhQY3QgYW5kIHhWYWwuXHJcblx0XHR0aGlzLnhOdW1TdGVwcyA9IHRoaXMueFN0ZXBzLnNsaWNlKDApO1xyXG5cclxuXHRcdC8vIENvbnZlcnQgYWxsIG51bWVyaWMgc3RlcHMgdG8gdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIHN1YnJhbmdlIHRoZXkgcmVwcmVzZW50LlxyXG5cdFx0Zm9yICggaW5kZXggPSAwOyBpbmRleCA8IHRoaXMueE51bVN0ZXBzLmxlbmd0aDsgaW5kZXgrKyApIHtcclxuXHRcdFx0aGFuZGxlU3RlcFBvaW50KGluZGV4LCB0aGlzLnhOdW1TdGVwc1tpbmRleF0sIHRoaXMpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLmdldE1hcmdpbiA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblx0XHRyZXR1cm4gdGhpcy54UGN0Lmxlbmd0aCA9PT0gMiA/IGZyb21QZXJjZW50YWdlKHRoaXMueFZhbCwgdmFsdWUpIDogZmFsc2U7XHJcblx0fTtcclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLnRvU3RlcHBpbmcgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xyXG5cclxuXHRcdHZhbHVlID0gdG9TdGVwcGluZyggdGhpcy54VmFsLCB0aGlzLnhQY3QsIHZhbHVlICk7XHJcblxyXG5cdFx0Ly8gSW52ZXJ0IHRoZSB2YWx1ZSBpZiB0aGlzIGlzIGEgcmlnaHQtdG8tbGVmdCBzbGlkZXIuXHJcblx0XHRpZiAoIHRoaXMuZGlyZWN0aW9uICkge1xyXG5cdFx0XHR2YWx1ZSA9IDEwMCAtIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9O1xyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuZnJvbVN0ZXBwaW5nID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHQvLyBJbnZlcnQgdGhlIHZhbHVlIGlmIHRoaXMgaXMgYSByaWdodC10by1sZWZ0IHNsaWRlci5cclxuXHRcdGlmICggdGhpcy5kaXJlY3Rpb24gKSB7XHJcblx0XHRcdHZhbHVlID0gMTAwIC0gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFjY3VyYXRlTnVtYmVyKGZyb21TdGVwcGluZyggdGhpcy54VmFsLCB0aGlzLnhQY3QsIHZhbHVlICkpO1xyXG5cdH07XHJcblxyXG5cdFNwZWN0cnVtLnByb3RvdHlwZS5nZXRTdGVwID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHQvLyBGaW5kIHRoZSBwcm9wZXIgc3RlcCBmb3IgcnRsIHNsaWRlcnMgYnkgc2VhcmNoIGluIGludmVyc2UgZGlyZWN0aW9uLlxyXG5cdFx0Ly8gRml4ZXMgaXNzdWUgIzI2Mi5cclxuXHRcdGlmICggdGhpcy5kaXJlY3Rpb24gKSB7XHJcblx0XHRcdHZhbHVlID0gMTAwIC0gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFsdWUgPSBnZXRTdGVwKHRoaXMueFBjdCwgdGhpcy54U3RlcHMsIHRoaXMuc25hcCwgdmFsdWUgKTtcclxuXHJcblx0XHRpZiAoIHRoaXMuZGlyZWN0aW9uICkge1xyXG5cdFx0XHR2YWx1ZSA9IDEwMCAtIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9O1xyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuZ2V0QXBwbGljYWJsZVN0ZXAgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xyXG5cclxuXHRcdC8vIElmIHRoZSB2YWx1ZSBpcyAxMDAlLCByZXR1cm4gdGhlIG5lZ2F0aXZlIHN0ZXAgdHdpY2UuXHJcblx0XHR2YXIgaiA9IGdldEoodmFsdWUsIHRoaXMueFBjdCksIG9mZnNldCA9IHZhbHVlID09PSAxMDAgPyAyIDogMTtcclxuXHRcdHJldHVybiBbdGhpcy54TnVtU3RlcHNbai0yXSwgdGhpcy54VmFsW2otb2Zmc2V0XSwgdGhpcy54TnVtU3RlcHNbai1vZmZzZXRdXTtcclxuXHR9O1xyXG5cclxuXHQvLyBPdXRzaWRlIHRlc3RpbmdcclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRTdGVwKHRoaXMudG9TdGVwcGluZyh2YWx1ZSkpO1xyXG5cdH07XHJcblxyXG4vKlx0RXZlcnkgaW5wdXQgb3B0aW9uIGlzIHRlc3RlZCBhbmQgcGFyc2VkLiBUaGlzJ2xsIHByZXZlbnRcclxuXHRlbmRsZXNzIHZhbGlkYXRpb24gaW4gaW50ZXJuYWwgbWV0aG9kcy4gVGhlc2UgdGVzdHMgYXJlXHJcblx0c3RydWN0dXJlZCB3aXRoIGFuIGl0ZW0gZm9yIGV2ZXJ5IG9wdGlvbiBhdmFpbGFibGUuIEFuXHJcblx0b3B0aW9uIGNhbiBiZSBtYXJrZWQgYXMgcmVxdWlyZWQgYnkgc2V0dGluZyB0aGUgJ3InIGZsYWcuXHJcblx0VGhlIHRlc3RpbmcgZnVuY3Rpb24gaXMgcHJvdmlkZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6XHJcblx0XHQtIFRoZSBwcm92aWRlZCB2YWx1ZSBmb3IgdGhlIG9wdGlvbjtcclxuXHRcdC0gQSByZWZlcmVuY2UgdG8gdGhlIG9wdGlvbnMgb2JqZWN0O1xyXG5cdFx0LSBUaGUgbmFtZSBmb3IgdGhlIG9wdGlvbjtcclxuXHJcblx0VGhlIHRlc3RpbmcgZnVuY3Rpb24gcmV0dXJucyBmYWxzZSB3aGVuIGFuIGVycm9yIGlzIGRldGVjdGVkLFxyXG5cdG9yIHRydWUgd2hlbiBldmVyeXRoaW5nIGlzIE9LLiBJdCBjYW4gYWxzbyBtb2RpZnkgdGhlIG9wdGlvblxyXG5cdG9iamVjdCwgdG8gbWFrZSBzdXJlIGFsbCB2YWx1ZXMgY2FuIGJlIGNvcnJlY3RseSBsb29wZWQgZWxzZXdoZXJlLiAqL1xyXG5cclxuXHR2YXIgZGVmYXVsdEZvcm1hdHRlciA9IHsgJ3RvJzogZnVuY3Rpb24oIHZhbHVlICl7XHJcblx0XHRyZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZS50b0ZpeGVkKDIpO1xyXG5cdH0sICdmcm9tJzogTnVtYmVyIH07XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RTdGVwICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoICFpc051bWVyaWMoIGVudHJ5ICkgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdzdGVwJyBpcyBub3QgbnVtZXJpYy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIHN0ZXAgb3B0aW9uIGNhbiBzdGlsbCBiZSB1c2VkIHRvIHNldCBzdGVwcGluZ1xyXG5cdFx0Ly8gZm9yIGxpbmVhciBzbGlkZXJzLiBPdmVyd3JpdHRlbiBpZiBzZXQgaW4gJ3JhbmdlJy5cclxuXHRcdHBhcnNlZC5zaW5nbGVTdGVwID0gZW50cnk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0UmFuZ2UgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIEZpbHRlciBpbmNvcnJlY3QgaW5wdXQuXHJcblx0XHRpZiAoIHR5cGVvZiBlbnRyeSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShlbnRyeSkgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdyYW5nZScgaXMgbm90IGFuIG9iamVjdC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ2F0Y2ggbWlzc2luZyBzdGFydCBvciBlbmQuXHJcblx0XHRpZiAoIGVudHJ5Lm1pbiA9PT0gdW5kZWZpbmVkIHx8IGVudHJ5Lm1heCA9PT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiBNaXNzaW5nICdtaW4nIG9yICdtYXgnIGluICdyYW5nZScuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENhdGNoIGVxdWFsIHN0YXJ0IG9yIGVuZC5cclxuXHRcdGlmICggZW50cnkubWluID09PSBlbnRyeS5tYXggKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdyYW5nZScgJ21pbicgYW5kICdtYXgnIGNhbm5vdCBiZSBlcXVhbC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cGFyc2VkLnNwZWN0cnVtID0gbmV3IFNwZWN0cnVtKGVudHJ5LCBwYXJzZWQuc25hcCwgcGFyc2VkLmRpciwgcGFyc2VkLnNpbmdsZVN0ZXApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdFN0YXJ0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRlbnRyeSA9IGFzQXJyYXkoZW50cnkpO1xyXG5cclxuXHRcdC8vIFZhbGlkYXRlIGlucHV0LiBWYWx1ZXMgYXJlbid0IHRlc3RlZCwgYXMgdGhlIHB1YmxpYyAudmFsIG1ldGhvZFxyXG5cdFx0Ly8gd2lsbCBhbHdheXMgcHJvdmlkZSBhIHZhbGlkIGxvY2F0aW9uLlxyXG5cdFx0aWYgKCAhQXJyYXkuaXNBcnJheSggZW50cnkgKSB8fCAhZW50cnkubGVuZ3RoIHx8IGVudHJ5Lmxlbmd0aCA+IDIgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdzdGFydCcgb3B0aW9uIGlzIGluY29ycmVjdC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3RvcmUgdGhlIG51bWJlciBvZiBoYW5kbGVzLlxyXG5cdFx0cGFyc2VkLmhhbmRsZXMgPSBlbnRyeS5sZW5ndGg7XHJcblxyXG5cdFx0Ly8gV2hlbiB0aGUgc2xpZGVyIGlzIGluaXRpYWxpemVkLCB0aGUgLnZhbCBtZXRob2Qgd2lsbFxyXG5cdFx0Ly8gYmUgY2FsbGVkIHdpdGggdGhlIHN0YXJ0IG9wdGlvbnMuXHJcblx0XHRwYXJzZWQuc3RhcnQgPSBlbnRyeTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RTbmFwICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBFbmZvcmNlIDEwMCUgc3RlcHBpbmcgd2l0aGluIHN1YnJhbmdlcy5cclxuXHRcdHBhcnNlZC5zbmFwID0gZW50cnk7XHJcblxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdib29sZWFuJyApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnc25hcCcgb3B0aW9uIG11c3QgYmUgYSBib29sZWFuLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RBbmltYXRlICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBFbmZvcmNlIDEwMCUgc3RlcHBpbmcgd2l0aGluIHN1YnJhbmdlcy5cclxuXHRcdHBhcnNlZC5hbmltYXRlID0gZW50cnk7XHJcblxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdib29sZWFuJyApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnYW5pbWF0ZScgb3B0aW9uIG11c3QgYmUgYSBib29sZWFuLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RDb25uZWN0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoIGVudHJ5ID09PSAnbG93ZXInICYmIHBhcnNlZC5oYW5kbGVzID09PSAxICkge1xyXG5cdFx0XHRwYXJzZWQuY29ubmVjdCA9IDE7XHJcblx0XHR9IGVsc2UgaWYgKCBlbnRyeSA9PT0gJ3VwcGVyJyAmJiBwYXJzZWQuaGFuZGxlcyA9PT0gMSApIHtcclxuXHRcdFx0cGFyc2VkLmNvbm5lY3QgPSAyO1xyXG5cdFx0fSBlbHNlIGlmICggZW50cnkgPT09IHRydWUgJiYgcGFyc2VkLmhhbmRsZXMgPT09IDIgKSB7XHJcblx0XHRcdHBhcnNlZC5jb25uZWN0ID0gMztcclxuXHRcdH0gZWxzZSBpZiAoIGVudHJ5ID09PSBmYWxzZSApIHtcclxuXHRcdFx0cGFyc2VkLmNvbm5lY3QgPSAwO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ2Nvbm5lY3QnIG9wdGlvbiBkb2Vzbid0IG1hdGNoIGhhbmRsZSBjb3VudC5cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0T3JpZW50YXRpb24gKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIFNldCBvcmllbnRhdGlvbiB0byBhbiBhIG51bWVyaWNhbCB2YWx1ZSBmb3IgZWFzeVxyXG5cdFx0Ly8gYXJyYXkgc2VsZWN0aW9uLlxyXG5cdFx0c3dpdGNoICggZW50cnkgKXtcclxuXHRcdCAgY2FzZSAnaG9yaXpvbnRhbCc6XHJcblx0XHRcdHBhcnNlZC5vcnQgPSAwO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdCAgY2FzZSAndmVydGljYWwnOlxyXG5cdFx0XHRwYXJzZWQub3J0ID0gMTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHQgIGRlZmF1bHQ6XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdvcmllbnRhdGlvbicgb3B0aW9uIGlzIGludmFsaWQuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdE1hcmdpbiAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKGVudHJ5KSApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnbWFyZ2luJyBvcHRpb24gbXVzdCBiZSBudW1lcmljLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQubWFyZ2luID0gcGFyc2VkLnNwZWN0cnVtLmdldE1hcmdpbihlbnRyeSk7XHJcblxyXG5cdFx0aWYgKCAhcGFyc2VkLm1hcmdpbiApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ21hcmdpbicgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIG9uIGxpbmVhciBzbGlkZXJzLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RMaW1pdCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKGVudHJ5KSApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnbGltaXQnIG9wdGlvbiBtdXN0IGJlIG51bWVyaWMuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5saW1pdCA9IHBhcnNlZC5zcGVjdHJ1bS5nZXRNYXJnaW4oZW50cnkpO1xyXG5cclxuXHRcdGlmICggIXBhcnNlZC5saW1pdCApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ2xpbWl0JyBvcHRpb24gaXMgb25seSBzdXBwb3J0ZWQgb24gbGluZWFyIHNsaWRlcnMuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdERpcmVjdGlvbiAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0Ly8gU2V0IGRpcmVjdGlvbiBhcyBhIG51bWVyaWNhbCB2YWx1ZSBmb3IgZWFzeSBwYXJzaW5nLlxyXG5cdFx0Ly8gSW52ZXJ0IGNvbm5lY3Rpb24gZm9yIFJUTCBzbGlkZXJzLCBzbyB0aGF0IHRoZSBwcm9wZXJcclxuXHRcdC8vIGhhbmRsZXMgZ2V0IHRoZSBjb25uZWN0L2JhY2tncm91bmQgY2xhc3Nlcy5cclxuXHRcdHN3aXRjaCAoIGVudHJ5ICkge1xyXG5cdFx0ICBjYXNlICdsdHInOlxyXG5cdFx0XHRwYXJzZWQuZGlyID0gMDtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHQgIGNhc2UgJ3J0bCc6XHJcblx0XHRcdHBhcnNlZC5kaXIgPSAxO1xyXG5cdFx0XHRwYXJzZWQuY29ubmVjdCA9IFswLDIsMSwzXVtwYXJzZWQuY29ubmVjdF07XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0ICBkZWZhdWx0OlxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnZGlyZWN0aW9uJyBvcHRpb24gd2FzIG5vdCByZWNvZ25pemVkLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RCZWhhdmlvdXIgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGUgaW5wdXQgaXMgYSBzdHJpbmcuXHJcblx0XHRpZiAoIHR5cGVvZiBlbnRyeSAhPT0gJ3N0cmluZycgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdiZWhhdmlvdXInIG11c3QgYmUgYSBzdHJpbmcgY29udGFpbmluZyBvcHRpb25zLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDaGVjayBpZiB0aGUgc3RyaW5nIGNvbnRhaW5zIGFueSBrZXl3b3Jkcy5cclxuXHRcdC8vIE5vbmUgYXJlIHJlcXVpcmVkLlxyXG5cdFx0dmFyIHRhcCA9IGVudHJ5LmluZGV4T2YoJ3RhcCcpID49IDAsXHJcblx0XHRcdGRyYWcgPSBlbnRyeS5pbmRleE9mKCdkcmFnJykgPj0gMCxcclxuXHRcdFx0Zml4ZWQgPSBlbnRyeS5pbmRleE9mKCdmaXhlZCcpID49IDAsXHJcblx0XHRcdHNuYXAgPSBlbnRyeS5pbmRleE9mKCdzbmFwJykgPj0gMCxcclxuXHRcdFx0aG92ZXIgPSBlbnRyeS5pbmRleE9mKCdob3ZlcicpID49IDA7XHJcblxyXG5cdFx0Ly8gRml4ICM0NzJcclxuXHRcdGlmICggZHJhZyAmJiAhcGFyc2VkLmNvbm5lY3QgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdkcmFnJyBiZWhhdmlvdXIgbXVzdCBiZSB1c2VkIHdpdGggJ2Nvbm5lY3QnOiB0cnVlLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQuZXZlbnRzID0ge1xyXG5cdFx0XHR0YXA6IHRhcCB8fCBzbmFwLFxyXG5cdFx0XHRkcmFnOiBkcmFnLFxyXG5cdFx0XHRmaXhlZDogZml4ZWQsXHJcblx0XHRcdHNuYXA6IHNuYXAsXHJcblx0XHRcdGhvdmVyOiBob3ZlclxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RUb29sdGlwcyAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0dmFyIGk7XHJcblxyXG5cdFx0aWYgKCBlbnRyeSA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSBpZiAoIGVudHJ5ID09PSB0cnVlICkge1xyXG5cclxuXHRcdFx0cGFyc2VkLnRvb2x0aXBzID0gW107XHJcblxyXG5cdFx0XHRmb3IgKCBpID0gMDsgaSA8IHBhcnNlZC5oYW5kbGVzOyBpKysgKSB7XHJcblx0XHRcdFx0cGFyc2VkLnRvb2x0aXBzLnB1c2godHJ1ZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0cGFyc2VkLnRvb2x0aXBzID0gYXNBcnJheShlbnRyeSk7XHJcblxyXG5cdFx0XHRpZiAoIHBhcnNlZC50b29sdGlwcy5sZW5ndGggIT09IHBhcnNlZC5oYW5kbGVzICkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6IG11c3QgcGFzcyBhIGZvcm1hdHRlciBmb3IgYWxsIGhhbmRsZXMuXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwYXJzZWQudG9vbHRpcHMuZm9yRWFjaChmdW5jdGlvbihmb3JtYXR0ZXIpe1xyXG5cdFx0XHRcdGlmICggdHlwZW9mIGZvcm1hdHRlciAhPT0gJ2Jvb2xlYW4nICYmICh0eXBlb2YgZm9ybWF0dGVyICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgZm9ybWF0dGVyLnRvICE9PSAnZnVuY3Rpb24nKSApIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICd0b29sdGlwcycgbXVzdCBiZSBwYXNzZWQgYSBmb3JtYXR0ZXIgb3IgJ2ZhbHNlJy5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RGb3JtYXQgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdHBhcnNlZC5mb3JtYXQgPSBlbnRyeTtcclxuXHJcblx0XHQvLyBBbnkgb2JqZWN0IHdpdGggYSB0byBhbmQgZnJvbSBtZXRob2QgaXMgc3VwcG9ydGVkLlxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkudG8gPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVudHJ5LmZyb20gPT09ICdmdW5jdGlvbicgKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRocm93IG5ldyBFcnJvciggXCJub1VpU2xpZGVyOiAnZm9ybWF0JyByZXF1aXJlcyAndG8nIGFuZCAnZnJvbScgbWV0aG9kcy5cIik7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0Q3NzUHJlZml4ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoIGVudHJ5ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVudHJ5ICE9PSAnc3RyaW5nJyApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIm5vVWlTbGlkZXI6ICdjc3NQcmVmaXgnIG11c3QgYmUgYSBzdHJpbmcuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5jc3NQcmVmaXggPSBlbnRyeTtcclxuXHR9XHJcblxyXG5cdC8vIFRlc3QgYWxsIGRldmVsb3BlciBzZXR0aW5ncyBhbmQgcGFyc2UgdG8gYXNzdW1wdGlvbi1zYWZlIHZhbHVlcy5cclxuXHRmdW5jdGlvbiB0ZXN0T3B0aW9ucyAoIG9wdGlvbnMgKSB7XHJcblxyXG5cdFx0Ly8gVG8gcHJvdmUgYSBmaXggZm9yICM1MzcsIGZyZWV6ZSBvcHRpb25zIGhlcmUuXHJcblx0XHQvLyBJZiB0aGUgb2JqZWN0IGlzIG1vZGlmaWVkLCBhbiBlcnJvciB3aWxsIGJlIHRocm93bi5cclxuXHRcdC8vIE9iamVjdC5mcmVlemUob3B0aW9ucyk7XHJcblxyXG5cdFx0dmFyIHBhcnNlZCA9IHtcclxuXHRcdFx0bWFyZ2luOiAwLFxyXG5cdFx0XHRsaW1pdDogMCxcclxuXHRcdFx0YW5pbWF0ZTogdHJ1ZSxcclxuXHRcdFx0Zm9ybWF0OiBkZWZhdWx0Rm9ybWF0dGVyXHJcblx0XHR9LCB0ZXN0cztcclxuXHJcblx0XHQvLyBUZXN0cyBhcmUgZXhlY3V0ZWQgaW4gdGhlIG9yZGVyIHRoZXkgYXJlIHByZXNlbnRlZCBoZXJlLlxyXG5cdFx0dGVzdHMgPSB7XHJcblx0XHRcdCdzdGVwJzogeyByOiBmYWxzZSwgdDogdGVzdFN0ZXAgfSxcclxuXHRcdFx0J3N0YXJ0JzogeyByOiB0cnVlLCB0OiB0ZXN0U3RhcnQgfSxcclxuXHRcdFx0J2Nvbm5lY3QnOiB7IHI6IHRydWUsIHQ6IHRlc3RDb25uZWN0IH0sXHJcblx0XHRcdCdkaXJlY3Rpb24nOiB7IHI6IHRydWUsIHQ6IHRlc3REaXJlY3Rpb24gfSxcclxuXHRcdFx0J3NuYXAnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0U25hcCB9LFxyXG5cdFx0XHQnYW5pbWF0ZSc6IHsgcjogZmFsc2UsIHQ6IHRlc3RBbmltYXRlIH0sXHJcblx0XHRcdCdyYW5nZSc6IHsgcjogdHJ1ZSwgdDogdGVzdFJhbmdlIH0sXHJcblx0XHRcdCdvcmllbnRhdGlvbic6IHsgcjogZmFsc2UsIHQ6IHRlc3RPcmllbnRhdGlvbiB9LFxyXG5cdFx0XHQnbWFyZ2luJzogeyByOiBmYWxzZSwgdDogdGVzdE1hcmdpbiB9LFxyXG5cdFx0XHQnbGltaXQnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0TGltaXQgfSxcclxuXHRcdFx0J2JlaGF2aW91cic6IHsgcjogdHJ1ZSwgdDogdGVzdEJlaGF2aW91ciB9LFxyXG5cdFx0XHQnZm9ybWF0JzogeyByOiBmYWxzZSwgdDogdGVzdEZvcm1hdCB9LFxyXG5cdFx0XHQndG9vbHRpcHMnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0VG9vbHRpcHMgfSxcclxuXHRcdFx0J2Nzc1ByZWZpeCc6IHsgcjogZmFsc2UsIHQ6IHRlc3RDc3NQcmVmaXggfVxyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgZGVmYXVsdHMgPSB7XHJcblx0XHRcdCdjb25uZWN0JzogZmFsc2UsXHJcblx0XHRcdCdkaXJlY3Rpb24nOiAnbHRyJyxcclxuXHRcdFx0J2JlaGF2aW91cic6ICd0YXAnLFxyXG5cdFx0XHQnb3JpZW50YXRpb24nOiAnaG9yaXpvbnRhbCdcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gUnVuIGFsbCBvcHRpb25zIHRocm91Z2ggYSB0ZXN0aW5nIG1lY2hhbmlzbSB0byBlbnN1cmUgY29ycmVjdFxyXG5cdFx0Ly8gaW5wdXQuIEl0IHNob3VsZCBiZSBub3RlZCB0aGF0IG9wdGlvbnMgbWlnaHQgZ2V0IG1vZGlmaWVkIHRvXHJcblx0XHQvLyBiZSBoYW5kbGVkIHByb3Blcmx5LiBFLmcuIHdyYXBwaW5nIGludGVnZXJzIGluIGFycmF5cy5cclxuXHRcdE9iamVjdC5rZXlzKHRlc3RzKS5mb3JFYWNoKGZ1bmN0aW9uKCBuYW1lICl7XHJcblxyXG5cdFx0XHQvLyBJZiB0aGUgb3B0aW9uIGlzbid0IHNldCwgYnV0IGl0IGlzIHJlcXVpcmVkLCB0aHJvdyBhbiBlcnJvci5cclxuXHRcdFx0aWYgKCBvcHRpb25zW25hbWVdID09PSB1bmRlZmluZWQgJiYgZGVmYXVsdHNbbmFtZV0gPT09IHVuZGVmaW5lZCApIHtcclxuXHJcblx0XHRcdFx0aWYgKCB0ZXN0c1tuYW1lXS5yICkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ1wiICsgbmFtZSArIFwiJyBpcyByZXF1aXJlZC5cIik7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGVzdHNbbmFtZV0udCggcGFyc2VkLCBvcHRpb25zW25hbWVdID09PSB1bmRlZmluZWQgPyBkZWZhdWx0c1tuYW1lXSA6IG9wdGlvbnNbbmFtZV0gKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEZvcndhcmQgcGlwcyBvcHRpb25zXHJcblx0XHRwYXJzZWQucGlwcyA9IG9wdGlvbnMucGlwcztcclxuXHJcblx0XHQvLyBQcmUtZGVmaW5lIHRoZSBzdHlsZXMuXHJcblx0XHRwYXJzZWQuc3R5bGUgPSBwYXJzZWQub3J0ID8gJ3RvcCcgOiAnbGVmdCc7XHJcblxyXG5cdFx0cmV0dXJuIHBhcnNlZDtcclxuXHR9XHJcblxyXG5cclxuZnVuY3Rpb24gY2xvc3VyZSAoIHRhcmdldCwgb3B0aW9ucyApe1xyXG5cclxuXHQvLyBBbGwgdmFyaWFibGVzIGxvY2FsIHRvICdjbG9zdXJlJyBhcmUgcHJlZml4ZWQgd2l0aCAnc2NvcGVfJ1xyXG5cdHZhciBzY29wZV9UYXJnZXQgPSB0YXJnZXQsXHJcblx0XHRzY29wZV9Mb2NhdGlvbnMgPSBbLTEsIC0xXSxcclxuXHRcdHNjb3BlX0Jhc2UsXHJcblx0XHRzY29wZV9IYW5kbGVzLFxyXG5cdFx0c2NvcGVfU3BlY3RydW0gPSBvcHRpb25zLnNwZWN0cnVtLFxyXG5cdFx0c2NvcGVfVmFsdWVzID0gW10sXHJcblx0XHRzY29wZV9FdmVudHMgPSB7fSxcclxuXHRcdHNjb3BlX1NlbGY7XHJcblxyXG4gIHZhciBjc3NDbGFzc2VzID0gW1xyXG4gICAgLyogIDAgKi8gICd0YXJnZXQnXHJcbiAgICAvKiAgMSAqLyAsJ2Jhc2UnXHJcbiAgICAvKiAgMiAqLyAsJ29yaWdpbidcclxuICAgIC8qICAzICovICwnaGFuZGxlJ1xyXG4gICAgLyogIDQgKi8gLCdob3Jpem9udGFsJ1xyXG4gICAgLyogIDUgKi8gLCd2ZXJ0aWNhbCdcclxuICAgIC8qICA2ICovICwnYmFja2dyb3VuZCdcclxuICAgIC8qICA3ICovICwnY29ubmVjdCdcclxuICAgIC8qICA4ICovICwnbHRyJ1xyXG4gICAgLyogIDkgKi8gLCdydGwnXHJcbiAgICAvKiAxMCAqLyAsJ2RyYWdnYWJsZSdcclxuICAgIC8qIDExICovICwnJ1xyXG4gICAgLyogMTIgKi8gLCdzdGF0ZS1kcmFnJ1xyXG4gICAgLyogMTMgKi8gLCcnXHJcbiAgICAvKiAxNCAqLyAsJ3N0YXRlLXRhcCdcclxuICAgIC8qIDE1ICovICwnYWN0aXZlJ1xyXG4gICAgLyogMTYgKi8gLCcnXHJcbiAgICAvKiAxNyAqLyAsJ3N0YWNraW5nJ1xyXG4gICAgLyogMTggKi8gLCd0b29sdGlwJ1xyXG4gICAgLyogMTkgKi8gLCcnXHJcbiAgICAvKiAyMCAqLyAsJ3BpcHMnXHJcbiAgICAvKiAyMSAqLyAsJ21hcmtlcidcclxuICAgIC8qIDIyICovICwndmFsdWUnXHJcbiAgXS5tYXAoYWRkQ3NzUHJlZml4KG9wdGlvbnMuY3NzUHJlZml4IHx8IGRlZmF1bHRDc3NQcmVmaXgpKTtcclxuXHJcblxyXG5cdC8vIERlbGltaXQgcHJvcG9zZWQgdmFsdWVzIGZvciBoYW5kbGUgcG9zaXRpb25zLlxyXG5cdGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAoIGEsIGIsIGRlbGltaXQgKSB7XHJcblxyXG5cdFx0Ly8gQWRkIG1vdmVtZW50IHRvIGN1cnJlbnQgcG9zaXRpb24uXHJcblx0XHR2YXIgYyA9IGEgKyBiWzBdLCBkID0gYSArIGJbMV07XHJcblxyXG5cdFx0Ly8gT25seSBhbHRlciB0aGUgb3RoZXIgcG9zaXRpb24gb24gZHJhZyxcclxuXHRcdC8vIG5vdCBvbiBzdGFuZGFyZCBzbGlkaW5nLlxyXG5cdFx0aWYgKCBkZWxpbWl0ICkge1xyXG5cdFx0XHRpZiAoIGMgPCAwICkge1xyXG5cdFx0XHRcdGQgKz0gTWF0aC5hYnMoYyk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCBkID4gMTAwICkge1xyXG5cdFx0XHRcdGMgLT0gKCBkIC0gMTAwICk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIExpbWl0IHZhbHVlcyB0byAwIGFuZCAxMDAuXHJcblx0XHRcdHJldHVybiBbbGltaXQoYyksIGxpbWl0KGQpXTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gW2MsZF07XHJcblx0fVxyXG5cclxuXHQvLyBQcm92aWRlIGEgY2xlYW4gZXZlbnQgd2l0aCBzdGFuZGFyZGl6ZWQgb2Zmc2V0IHZhbHVlcy5cclxuXHRmdW5jdGlvbiBmaXhFdmVudCAoIGUsIHBhZ2VPZmZzZXQgKSB7XHJcblxyXG5cdFx0Ly8gUHJldmVudCBzY3JvbGxpbmcgYW5kIHBhbm5pbmcgb24gdG91Y2ggZXZlbnRzLCB3aGlsZVxyXG5cdFx0Ly8gYXR0ZW1wdGluZyB0byBzbGlkZS4gVGhlIHRhcCBldmVudCBhbHNvIGRlcGVuZHMgb24gdGhpcy5cclxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHQvLyBGaWx0ZXIgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSB0eXBlLCB3aGljaCBjYW4gYmVcclxuXHRcdC8vIHRvdWNoLCBtb3VzZSBvciBwb2ludGVyLiBPZmZzZXQgY2hhbmdlcyBuZWVkIHRvIGJlXHJcblx0XHQvLyBtYWRlIG9uIGFuIGV2ZW50IHNwZWNpZmljIGJhc2lzLlxyXG5cdFx0dmFyIHRvdWNoID0gZS50eXBlLmluZGV4T2YoJ3RvdWNoJykgPT09IDAsXHJcblx0XHRcdG1vdXNlID0gZS50eXBlLmluZGV4T2YoJ21vdXNlJykgPT09IDAsXHJcblx0XHRcdHBvaW50ZXIgPSBlLnR5cGUuaW5kZXhPZigncG9pbnRlcicpID09PSAwLFxyXG5cdFx0XHR4LHksIGV2ZW50ID0gZTtcclxuXHJcblx0XHQvLyBJRTEwIGltcGxlbWVudGVkIHBvaW50ZXIgZXZlbnRzIHdpdGggYSBwcmVmaXg7XHJcblx0XHRpZiAoIGUudHlwZS5pbmRleE9mKCdNU1BvaW50ZXInKSA9PT0gMCApIHtcclxuXHRcdFx0cG9pbnRlciA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCB0b3VjaCApIHtcclxuXHRcdFx0Ly8gbm9VaVNsaWRlciBzdXBwb3J0cyBvbmUgbW92ZW1lbnQgYXQgYSB0aW1lLFxyXG5cdFx0XHQvLyBzbyB3ZSBjYW4gc2VsZWN0IHRoZSBmaXJzdCAnY2hhbmdlZFRvdWNoJy5cclxuXHRcdFx0eCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XHJcblx0XHRcdHkgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhZ2VPZmZzZXQgPSBwYWdlT2Zmc2V0IHx8IGdldFBhZ2VPZmZzZXQoKTtcclxuXHJcblx0XHRpZiAoIG1vdXNlIHx8IHBvaW50ZXIgKSB7XHJcblx0XHRcdHggPSBlLmNsaWVudFggKyBwYWdlT2Zmc2V0Lng7XHJcblx0XHRcdHkgPSBlLmNsaWVudFkgKyBwYWdlT2Zmc2V0Lnk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZXZlbnQucGFnZU9mZnNldCA9IHBhZ2VPZmZzZXQ7XHJcblx0XHRldmVudC5wb2ludHMgPSBbeCwgeV07XHJcblx0XHRldmVudC5jdXJzb3IgPSBtb3VzZSB8fCBwb2ludGVyOyAvLyBGaXggIzQzNVxyXG5cclxuXHRcdHJldHVybiBldmVudDtcclxuXHR9XHJcblxyXG5cdC8vIEFwcGVuZCBhIGhhbmRsZSB0byB0aGUgYmFzZS5cclxuXHRmdW5jdGlvbiBhZGRIYW5kbGUgKCBkaXJlY3Rpb24sIGluZGV4ICkge1xyXG5cclxuXHRcdHZhciBvcmlnaW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuXHRcdFx0aGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHRcdGFkZGl0aW9ucyA9IFsgJy1sb3dlcicsICctdXBwZXInIF07XHJcblxyXG5cdFx0aWYgKCBkaXJlY3Rpb24gKSB7XHJcblx0XHRcdGFkZGl0aW9ucy5yZXZlcnNlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0YWRkQ2xhc3MoaGFuZGxlLCBjc3NDbGFzc2VzWzNdKTtcclxuXHRcdGFkZENsYXNzKGhhbmRsZSwgY3NzQ2xhc3Nlc1szXSArIGFkZGl0aW9uc1tpbmRleF0pO1xyXG5cclxuXHRcdGFkZENsYXNzKG9yaWdpbiwgY3NzQ2xhc3Nlc1syXSk7XHJcblx0XHRvcmlnaW4uYXBwZW5kQ2hpbGQoaGFuZGxlKTtcclxuXHJcblx0XHRyZXR1cm4gb3JpZ2luO1xyXG5cdH1cclxuXHJcblx0Ly8gQWRkIHRoZSBwcm9wZXIgY29ubmVjdGlvbiBjbGFzc2VzLlxyXG5cdGZ1bmN0aW9uIGFkZENvbm5lY3Rpb24gKCBjb25uZWN0LCB0YXJnZXQsIGhhbmRsZXMgKSB7XHJcblxyXG5cdFx0Ly8gQXBwbHkgdGhlIHJlcXVpcmVkIGNvbm5lY3Rpb24gY2xhc3NlcyB0byB0aGUgZWxlbWVudHNcclxuXHRcdC8vIHRoYXQgbmVlZCB0aGVtLiBTb21lIGNsYXNzZXMgYXJlIG1hZGUgdXAgZm9yIHNldmVyYWxcclxuXHRcdC8vIHNlZ21lbnRzIGxpc3RlZCBpbiB0aGUgY2xhc3MgbGlzdCwgdG8gYWxsb3cgZWFzeVxyXG5cdFx0Ly8gcmVuYW1pbmcgYW5kIHByb3ZpZGUgYSBtaW5vciBjb21wcmVzc2lvbiBiZW5lZml0LlxyXG5cdFx0c3dpdGNoICggY29ubmVjdCApIHtcclxuXHRcdFx0Y2FzZSAxOlx0YWRkQ2xhc3ModGFyZ2V0LCBjc3NDbGFzc2VzWzddKTtcclxuXHRcdFx0XHRcdGFkZENsYXNzKGhhbmRsZXNbMF0sIGNzc0NsYXNzZXNbNl0pO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgMzogYWRkQ2xhc3MoaGFuZGxlc1sxXSwgY3NzQ2xhc3Nlc1s2XSk7XHJcblx0XHRcdFx0XHQvKiBmYWxscyB0aHJvdWdoICovXHJcblx0XHRcdGNhc2UgMjogYWRkQ2xhc3MoaGFuZGxlc1swXSwgY3NzQ2xhc3Nlc1s3XSk7XHJcblx0XHRcdFx0XHQvKiBmYWxscyB0aHJvdWdoICovXHJcblx0XHRcdGNhc2UgMDogYWRkQ2xhc3ModGFyZ2V0LCBjc3NDbGFzc2VzWzZdKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gQWRkIGhhbmRsZXMgdG8gdGhlIHNsaWRlciBiYXNlLlxyXG5cdGZ1bmN0aW9uIGFkZEhhbmRsZXMgKCBuckhhbmRsZXMsIGRpcmVjdGlvbiwgYmFzZSApIHtcclxuXHJcblx0XHR2YXIgaW5kZXgsIGhhbmRsZXMgPSBbXTtcclxuXHJcblx0XHQvLyBBcHBlbmQgaGFuZGxlcy5cclxuXHRcdGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBuckhhbmRsZXM7IGluZGV4ICs9IDEgKSB7XHJcblxyXG5cdFx0XHQvLyBLZWVwIGEgbGlzdCBvZiBhbGwgYWRkZWQgaGFuZGxlcy5cclxuXHRcdFx0aGFuZGxlcy5wdXNoKCBiYXNlLmFwcGVuZENoaWxkKGFkZEhhbmRsZSggZGlyZWN0aW9uLCBpbmRleCApKSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBoYW5kbGVzO1xyXG5cdH1cclxuXHJcblx0Ly8gSW5pdGlhbGl6ZSBhIHNpbmdsZSBzbGlkZXIuXHJcblx0ZnVuY3Rpb24gYWRkU2xpZGVyICggZGlyZWN0aW9uLCBvcmllbnRhdGlvbiwgdGFyZ2V0ICkge1xyXG5cclxuXHRcdC8vIEFwcGx5IGNsYXNzZXMgYW5kIGRhdGEgdG8gdGhlIHRhcmdldC5cclxuXHRcdGFkZENsYXNzKHRhcmdldCwgY3NzQ2xhc3Nlc1swXSk7XHJcblx0XHRhZGRDbGFzcyh0YXJnZXQsIGNzc0NsYXNzZXNbOCArIGRpcmVjdGlvbl0pO1xyXG5cdFx0YWRkQ2xhc3ModGFyZ2V0LCBjc3NDbGFzc2VzWzQgKyBvcmllbnRhdGlvbl0pO1xyXG5cclxuXHRcdHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdGFkZENsYXNzKGRpdiwgY3NzQ2xhc3Nlc1sxXSk7XHJcblx0XHR0YXJnZXQuYXBwZW5kQ2hpbGQoZGl2KTtcclxuXHRcdHJldHVybiBkaXY7XHJcblx0fVxyXG5cclxuXHJcblx0ZnVuY3Rpb24gYWRkVG9vbHRpcCAoIGhhbmRsZSwgaW5kZXggKSB7XHJcblxyXG5cdFx0aWYgKCAhb3B0aW9ucy50b29sdGlwc1tpbmRleF0gKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0ZWxlbWVudC5jbGFzc05hbWUgPSBjc3NDbGFzc2VzWzE4XTtcclxuXHRcdHJldHVybiBoYW5kbGUuZmlyc3RDaGlsZC5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuXHR9XHJcblxyXG5cdC8vIFRoZSB0b29sdGlwcyBvcHRpb24gaXMgYSBzaG9ydGhhbmQgZm9yIHVzaW5nIHRoZSAndXBkYXRlJyBldmVudC5cclxuXHRmdW5jdGlvbiB0b29sdGlwcyAoICkge1xyXG5cclxuXHRcdGlmICggb3B0aW9ucy5kaXIgKSB7XHJcblx0XHRcdG9wdGlvbnMudG9vbHRpcHMucmV2ZXJzZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRvb2x0aXBzIGFyZSBhZGRlZCB3aXRoIG9wdGlvbnMudG9vbHRpcHMgaW4gb3JpZ2luYWwgb3JkZXIuXHJcblx0XHR2YXIgdGlwcyA9IHNjb3BlX0hhbmRsZXMubWFwKGFkZFRvb2x0aXApO1xyXG5cclxuXHRcdGlmICggb3B0aW9ucy5kaXIgKSB7XHJcblx0XHRcdHRpcHMucmV2ZXJzZSgpO1xyXG5cdFx0XHRvcHRpb25zLnRvb2x0aXBzLnJldmVyc2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHRiaW5kRXZlbnQoJ3VwZGF0ZScsIGZ1bmN0aW9uKGYsIG8sIHIpIHtcclxuXHRcdFx0aWYgKCB0aXBzW29dICkge1xyXG5cdFx0XHRcdHRpcHNbb10uaW5uZXJIVE1MID0gb3B0aW9ucy50b29sdGlwc1tvXSA9PT0gdHJ1ZSA/IGZbb10gOiBvcHRpb25zLnRvb2x0aXBzW29dLnRvKHJbb10pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiBnZXRHcm91cCAoIG1vZGUsIHZhbHVlcywgc3RlcHBlZCApIHtcclxuXHJcblx0XHQvLyBVc2UgdGhlIHJhbmdlLlxyXG5cdFx0aWYgKCBtb2RlID09PSAncmFuZ2UnIHx8IG1vZGUgPT09ICdzdGVwcycgKSB7XHJcblx0XHRcdHJldHVybiBzY29wZV9TcGVjdHJ1bS54VmFsO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggbW9kZSA9PT0gJ2NvdW50JyApIHtcclxuXHJcblx0XHRcdC8vIERpdmlkZSAwIC0gMTAwIGluICdjb3VudCcgcGFydHMuXHJcblx0XHRcdHZhciBzcHJlYWQgPSAoIDEwMCAvICh2YWx1ZXMtMSkgKSwgdiwgaSA9IDA7XHJcblx0XHRcdHZhbHVlcyA9IFtdO1xyXG5cclxuXHRcdFx0Ly8gTGlzdCB0aGVzZSBwYXJ0cyBhbmQgaGF2ZSB0aGVtIGhhbmRsZWQgYXMgJ3Bvc2l0aW9ucycuXHJcblx0XHRcdHdoaWxlICgodj1pKysqc3ByZWFkKSA8PSAxMDAgKSB7XHJcblx0XHRcdFx0dmFsdWVzLnB1c2godik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1vZGUgPSAncG9zaXRpb25zJztcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIG1vZGUgPT09ICdwb3NpdGlvbnMnICkge1xyXG5cclxuXHRcdFx0Ly8gTWFwIGFsbCBwZXJjZW50YWdlcyB0byBvbi1yYW5nZSB2YWx1ZXMuXHJcblx0XHRcdHJldHVybiB2YWx1ZXMubWFwKGZ1bmN0aW9uKCB2YWx1ZSApe1xyXG5cdFx0XHRcdHJldHVybiBzY29wZV9TcGVjdHJ1bS5mcm9tU3RlcHBpbmcoIHN0ZXBwZWQgPyBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCB2YWx1ZSApIDogdmFsdWUgKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBtb2RlID09PSAndmFsdWVzJyApIHtcclxuXHJcblx0XHRcdC8vIElmIHRoZSB2YWx1ZSBtdXN0IGJlIHN0ZXBwZWQsIGl0IG5lZWRzIHRvIGJlIGNvbnZlcnRlZCB0byBhIHBlcmNlbnRhZ2UgZmlyc3QuXHJcblx0XHRcdGlmICggc3RlcHBlZCApIHtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlcy5tYXAoZnVuY3Rpb24oIHZhbHVlICl7XHJcblxyXG5cdFx0XHRcdFx0Ly8gQ29udmVydCB0byBwZXJjZW50YWdlLCBhcHBseSBzdGVwLCByZXR1cm4gdG8gdmFsdWUuXHJcblx0XHRcdFx0XHRyZXR1cm4gc2NvcGVfU3BlY3RydW0uZnJvbVN0ZXBwaW5nKCBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCBzY29wZV9TcGVjdHJ1bS50b1N0ZXBwaW5nKCB2YWx1ZSApICkgKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIE90aGVyd2lzZSwgd2UgY2FuIHNpbXBseSB1c2UgdGhlIHZhbHVlcy5cclxuXHRcdFx0cmV0dXJuIHZhbHVlcztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdlbmVyYXRlU3ByZWFkICggZGVuc2l0eSwgbW9kZSwgZ3JvdXAgKSB7XHJcblxyXG5cdFx0ZnVuY3Rpb24gc2FmZUluY3JlbWVudCh2YWx1ZSwgaW5jcmVtZW50KSB7XHJcblx0XHRcdC8vIEF2b2lkIGZsb2F0aW5nIHBvaW50IHZhcmlhbmNlIGJ5IGRyb3BwaW5nIHRoZSBzbWFsbGVzdCBkZWNpbWFsIHBsYWNlcy5cclxuXHRcdFx0cmV0dXJuICh2YWx1ZSArIGluY3JlbWVudCkudG9GaXhlZCg3KSAvIDE7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG9yaWdpbmFsU3BlY3RydW1EaXJlY3Rpb24gPSBzY29wZV9TcGVjdHJ1bS5kaXJlY3Rpb24sXHJcblx0XHRcdGluZGV4ZXMgPSB7fSxcclxuXHRcdFx0Zmlyc3RJblJhbmdlID0gc2NvcGVfU3BlY3RydW0ueFZhbFswXSxcclxuXHRcdFx0bGFzdEluUmFuZ2UgPSBzY29wZV9TcGVjdHJ1bS54VmFsW3Njb3BlX1NwZWN0cnVtLnhWYWwubGVuZ3RoLTFdLFxyXG5cdFx0XHRpZ25vcmVGaXJzdCA9IGZhbHNlLFxyXG5cdFx0XHRpZ25vcmVMYXN0ID0gZmFsc2UsXHJcblx0XHRcdHByZXZQY3QgPSAwO1xyXG5cclxuXHRcdC8vIFRoaXMgZnVuY3Rpb24gbG9vcHMgdGhlIHNwZWN0cnVtIGluIGFuIGx0ciBsaW5lYXIgZmFzaGlvbixcclxuXHRcdC8vIHdoaWxlIHRoZSB0b1N0ZXBwaW5nIG1ldGhvZCBpcyBkaXJlY3Rpb24gYXdhcmUuIFRyaWNrIGl0IGludG9cclxuXHRcdC8vIGJlbGlldmluZyBpdCBpcyBsdHIuXHJcblx0XHRzY29wZV9TcGVjdHJ1bS5kaXJlY3Rpb24gPSAwO1xyXG5cclxuXHRcdC8vIENyZWF0ZSBhIGNvcHkgb2YgdGhlIGdyb3VwLCBzb3J0IGl0IGFuZCBmaWx0ZXIgYXdheSBhbGwgZHVwbGljYXRlcy5cclxuXHRcdGdyb3VwID0gdW5pcXVlKGdyb3VwLnNsaWNlKCkuc29ydChmdW5jdGlvbihhLCBiKXsgcmV0dXJuIGEgLSBiOyB9KSk7XHJcblxyXG5cdFx0Ly8gTWFrZSBzdXJlIHRoZSByYW5nZSBzdGFydHMgd2l0aCB0aGUgZmlyc3QgZWxlbWVudC5cclxuXHRcdGlmICggZ3JvdXBbMF0gIT09IGZpcnN0SW5SYW5nZSApIHtcclxuXHRcdFx0Z3JvdXAudW5zaGlmdChmaXJzdEluUmFuZ2UpO1xyXG5cdFx0XHRpZ25vcmVGaXJzdCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTGlrZXdpc2UgZm9yIHRoZSBsYXN0IG9uZS5cclxuXHRcdGlmICggZ3JvdXBbZ3JvdXAubGVuZ3RoIC0gMV0gIT09IGxhc3RJblJhbmdlICkge1xyXG5cdFx0XHRncm91cC5wdXNoKGxhc3RJblJhbmdlKTtcclxuXHRcdFx0aWdub3JlTGFzdCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Z3JvdXAuZm9yRWFjaChmdW5jdGlvbiAoIGN1cnJlbnQsIGluZGV4ICkge1xyXG5cclxuXHRcdFx0Ly8gR2V0IHRoZSBjdXJyZW50IHN0ZXAgYW5kIHRoZSBsb3dlciArIHVwcGVyIHBvc2l0aW9ucy5cclxuXHRcdFx0dmFyIHN0ZXAsIGksIHEsXHJcblx0XHRcdFx0bG93ID0gY3VycmVudCxcclxuXHRcdFx0XHRoaWdoID0gZ3JvdXBbaW5kZXgrMV0sXHJcblx0XHRcdFx0bmV3UGN0LCBwY3REaWZmZXJlbmNlLCBwY3RQb3MsIHR5cGUsXHJcblx0XHRcdFx0c3RlcHMsIHJlYWxTdGVwcywgc3RlcHNpemU7XHJcblxyXG5cdFx0XHQvLyBXaGVuIHVzaW5nICdzdGVwcycgbW9kZSwgdXNlIHRoZSBwcm92aWRlZCBzdGVwcy5cclxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCB3ZSdsbCBzdGVwIG9uIHRvIHRoZSBuZXh0IHN1YnJhbmdlLlxyXG5cdFx0XHRpZiAoIG1vZGUgPT09ICdzdGVwcycgKSB7XHJcblx0XHRcdFx0c3RlcCA9IHNjb3BlX1NwZWN0cnVtLnhOdW1TdGVwc1sgaW5kZXggXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gRGVmYXVsdCB0byBhICdmdWxsJyBzdGVwLlxyXG5cdFx0XHRpZiAoICFzdGVwICkge1xyXG5cdFx0XHRcdHN0ZXAgPSBoaWdoLWxvdztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gTG93IGNhbiBiZSAwLCBzbyB0ZXN0IGZvciBmYWxzZS4gSWYgaGlnaCBpcyB1bmRlZmluZWQsXHJcblx0XHRcdC8vIHdlIGFyZSBhdCB0aGUgbGFzdCBzdWJyYW5nZS4gSW5kZXggMCBpcyBhbHJlYWR5IGhhbmRsZWQuXHJcblx0XHRcdGlmICggbG93ID09PSBmYWxzZSB8fCBoaWdoID09PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBGaW5kIGFsbCBzdGVwcyBpbiB0aGUgc3VicmFuZ2UuXHJcblx0XHRcdGZvciAoIGkgPSBsb3c7IGkgPD0gaGlnaDsgaSA9IHNhZmVJbmNyZW1lbnQoaSwgc3RlcCkgKSB7XHJcblxyXG5cdFx0XHRcdC8vIEdldCB0aGUgcGVyY2VudGFnZSB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgc3RlcCxcclxuXHRcdFx0XHQvLyBjYWxjdWxhdGUgdGhlIHNpemUgZm9yIHRoZSBzdWJyYW5nZS5cclxuXHRcdFx0XHRuZXdQY3QgPSBzY29wZV9TcGVjdHJ1bS50b1N0ZXBwaW5nKCBpICk7XHJcblx0XHRcdFx0cGN0RGlmZmVyZW5jZSA9IG5ld1BjdCAtIHByZXZQY3Q7XHJcblxyXG5cdFx0XHRcdHN0ZXBzID0gcGN0RGlmZmVyZW5jZSAvIGRlbnNpdHk7XHJcblx0XHRcdFx0cmVhbFN0ZXBzID0gTWF0aC5yb3VuZChzdGVwcyk7XHJcblxyXG5cdFx0XHRcdC8vIFRoaXMgcmF0aW8gcmVwcmVzZW50cyB0aGUgYW1tb3VudCBvZiBwZXJjZW50YWdlLXNwYWNlIGEgcG9pbnQgaW5kaWNhdGVzLlxyXG5cdFx0XHRcdC8vIEZvciBhIGRlbnNpdHkgMSB0aGUgcG9pbnRzL3BlcmNlbnRhZ2UgPSAxLiBGb3IgZGVuc2l0eSAyLCB0aGF0IHBlcmNlbnRhZ2UgbmVlZHMgdG8gYmUgcmUtZGV2aWRlZC5cclxuXHRcdFx0XHQvLyBSb3VuZCB0aGUgcGVyY2VudGFnZSBvZmZzZXQgdG8gYW4gZXZlbiBudW1iZXIsIHRoZW4gZGl2aWRlIGJ5IHR3b1xyXG5cdFx0XHRcdC8vIHRvIHNwcmVhZCB0aGUgb2Zmc2V0IG9uIGJvdGggc2lkZXMgb2YgdGhlIHJhbmdlLlxyXG5cdFx0XHRcdHN0ZXBzaXplID0gcGN0RGlmZmVyZW5jZS9yZWFsU3RlcHM7XHJcblxyXG5cdFx0XHRcdC8vIERpdmlkZSBhbGwgcG9pbnRzIGV2ZW5seSwgYWRkaW5nIHRoZSBjb3JyZWN0IG51bWJlciB0byB0aGlzIHN1YnJhbmdlLlxyXG5cdFx0XHRcdC8vIFJ1biB1cCB0byA8PSBzbyB0aGF0IDEwMCUgZ2V0cyBhIHBvaW50LCBldmVudCBpZiBpZ25vcmVMYXN0IGlzIHNldC5cclxuXHRcdFx0XHRmb3IgKCBxID0gMTsgcSA8PSByZWFsU3RlcHM7IHEgKz0gMSApIHtcclxuXHJcblx0XHRcdFx0XHQvLyBUaGUgcmF0aW8gYmV0d2VlbiB0aGUgcm91bmRlZCB2YWx1ZSBhbmQgdGhlIGFjdHVhbCBzaXplIG1pZ2h0IGJlIH4xJSBvZmYuXHJcblx0XHRcdFx0XHQvLyBDb3JyZWN0IHRoZSBwZXJjZW50YWdlIG9mZnNldCBieSB0aGUgbnVtYmVyIG9mIHBvaW50c1xyXG5cdFx0XHRcdFx0Ly8gcGVyIHN1YnJhbmdlLiBkZW5zaXR5ID0gMSB3aWxsIHJlc3VsdCBpbiAxMDAgcG9pbnRzIG9uIHRoZVxyXG5cdFx0XHRcdFx0Ly8gZnVsbCByYW5nZSwgMiBmb3IgNTAsIDQgZm9yIDI1LCBldGMuXHJcblx0XHRcdFx0XHRwY3RQb3MgPSBwcmV2UGN0ICsgKCBxICogc3RlcHNpemUgKTtcclxuXHRcdFx0XHRcdGluZGV4ZXNbcGN0UG9zLnRvRml4ZWQoNSldID0gWyd4JywgMF07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBEZXRlcm1pbmUgdGhlIHBvaW50IHR5cGUuXHJcblx0XHRcdFx0dHlwZSA9IChncm91cC5pbmRleE9mKGkpID4gLTEpID8gMSA6ICggbW9kZSA9PT0gJ3N0ZXBzJyA/IDIgOiAwICk7XHJcblxyXG5cdFx0XHRcdC8vIEVuZm9yY2UgdGhlICdpZ25vcmVGaXJzdCcgb3B0aW9uIGJ5IG92ZXJ3cml0aW5nIHRoZSB0eXBlIGZvciAwLlxyXG5cdFx0XHRcdGlmICggIWluZGV4ICYmIGlnbm9yZUZpcnN0ICkge1xyXG5cdFx0XHRcdFx0dHlwZSA9IDA7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoICEoaSA9PT0gaGlnaCAmJiBpZ25vcmVMYXN0KSkge1xyXG5cdFx0XHRcdFx0Ly8gTWFyayB0aGUgJ3R5cGUnIG9mIHRoaXMgcG9pbnQuIDAgPSBwbGFpbiwgMSA9IHJlYWwgdmFsdWUsIDIgPSBzdGVwIHZhbHVlLlxyXG5cdFx0XHRcdFx0aW5kZXhlc1tuZXdQY3QudG9GaXhlZCg1KV0gPSBbaSwgdHlwZV07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHBlcmNlbnRhZ2UgY291bnQuXHJcblx0XHRcdFx0cHJldlBjdCA9IG5ld1BjdDtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gUmVzZXQgdGhlIHNwZWN0cnVtLlxyXG5cdFx0c2NvcGVfU3BlY3RydW0uZGlyZWN0aW9uID0gb3JpZ2luYWxTcGVjdHJ1bURpcmVjdGlvbjtcclxuXHJcblx0XHRyZXR1cm4gaW5kZXhlcztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGFkZE1hcmtpbmcgKCBzcHJlYWQsIGZpbHRlckZ1bmMsIGZvcm1hdHRlciApIHtcclxuXHJcblx0XHR2YXIgc3R5bGUgPSBbJ2hvcml6b250YWwnLCAndmVydGljYWwnXVtvcHRpb25zLm9ydF0sXHJcblx0XHRcdGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHRhZGRDbGFzcyhlbGVtZW50LCBjc3NDbGFzc2VzWzIwXSk7XHJcblx0XHRhZGRDbGFzcyhlbGVtZW50LCBjc3NDbGFzc2VzWzIwXSArICctJyArIHN0eWxlKTtcclxuXHJcblx0XHRmdW5jdGlvbiBnZXRTaXplKCB0eXBlICl7XHJcblx0XHRcdHJldHVybiBbICctbm9ybWFsJywgJy1sYXJnZScsICctc3ViJyBdW3R5cGVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGdldFRhZ3MoIG9mZnNldCwgc291cmNlLCB2YWx1ZXMgKSB7XHJcblx0XHRcdHJldHVybiAnY2xhc3M9XCInICsgc291cmNlICsgJyAnICtcclxuXHRcdFx0XHRzb3VyY2UgKyAnLScgKyBzdHlsZSArICcgJyArXHJcblx0XHRcdFx0c291cmNlICsgZ2V0U2l6ZSh2YWx1ZXNbMV0pICtcclxuXHRcdFx0XHQnXCIgc3R5bGU9XCInICsgb3B0aW9ucy5zdHlsZSArICc6ICcgKyBvZmZzZXQgKyAnJVwiJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBhZGRTcHJlYWQgKCBvZmZzZXQsIHZhbHVlcyApe1xyXG5cclxuXHRcdFx0aWYgKCBzY29wZV9TcGVjdHJ1bS5kaXJlY3Rpb24gKSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gMTAwIC0gb2Zmc2V0O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBBcHBseSB0aGUgZmlsdGVyIGZ1bmN0aW9uLCBpZiBpdCBpcyBzZXQuXHJcblx0XHRcdHZhbHVlc1sxXSA9ICh2YWx1ZXNbMV0gJiYgZmlsdGVyRnVuYykgPyBmaWx0ZXJGdW5jKHZhbHVlc1swXSwgdmFsdWVzWzFdKSA6IHZhbHVlc1sxXTtcclxuXHJcblx0XHRcdC8vIEFkZCBhIG1hcmtlciBmb3IgZXZlcnkgcG9pbnRcclxuXHRcdFx0ZWxlbWVudC5pbm5lckhUTUwgKz0gJzxkaXYgJyArIGdldFRhZ3Mob2Zmc2V0LCBjc3NDbGFzc2VzWzIxXSwgdmFsdWVzKSArICc+PC9kaXY+JztcclxuXHJcblx0XHRcdC8vIFZhbHVlcyBhcmUgb25seSBhcHBlbmRlZCBmb3IgcG9pbnRzIG1hcmtlZCAnMScgb3IgJzInLlxyXG5cdFx0XHRpZiAoIHZhbHVlc1sxXSApIHtcclxuXHRcdFx0XHRlbGVtZW50LmlubmVySFRNTCArPSAnPGRpdiAnK2dldFRhZ3Mob2Zmc2V0LCBjc3NDbGFzc2VzWzIyXSwgdmFsdWVzKSsnPicgKyBmb3JtYXR0ZXIudG8odmFsdWVzWzBdKSArICc8L2Rpdj4nO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQXBwZW5kIGFsbCBwb2ludHMuXHJcblx0XHRPYmplY3Qua2V5cyhzcHJlYWQpLmZvckVhY2goZnVuY3Rpb24oYSl7XHJcblx0XHRcdGFkZFNwcmVhZChhLCBzcHJlYWRbYV0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGVsZW1lbnQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwaXBzICggZ3JpZCApIHtcclxuXHJcblx0dmFyIG1vZGUgPSBncmlkLm1vZGUsXHJcblx0XHRkZW5zaXR5ID0gZ3JpZC5kZW5zaXR5IHx8IDEsXHJcblx0XHRmaWx0ZXIgPSBncmlkLmZpbHRlciB8fCBmYWxzZSxcclxuXHRcdHZhbHVlcyA9IGdyaWQudmFsdWVzIHx8IGZhbHNlLFxyXG5cdFx0c3RlcHBlZCA9IGdyaWQuc3RlcHBlZCB8fCBmYWxzZSxcclxuXHRcdGdyb3VwID0gZ2V0R3JvdXAoIG1vZGUsIHZhbHVlcywgc3RlcHBlZCApLFxyXG5cdFx0c3ByZWFkID0gZ2VuZXJhdGVTcHJlYWQoIGRlbnNpdHksIG1vZGUsIGdyb3VwICksXHJcblx0XHRmb3JtYXQgPSBncmlkLmZvcm1hdCB8fCB7XHJcblx0XHRcdHRvOiBNYXRoLnJvdW5kXHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBzY29wZV9UYXJnZXQuYXBwZW5kQ2hpbGQoYWRkTWFya2luZyhcclxuXHRcdFx0c3ByZWFkLFxyXG5cdFx0XHRmaWx0ZXIsXHJcblx0XHRcdGZvcm1hdFxyXG5cdFx0KSk7XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gU2hvcnRoYW5kIGZvciBiYXNlIGRpbWVuc2lvbnMuXHJcblx0ZnVuY3Rpb24gYmFzZVNpemUgKCApIHtcclxuXHRcdHJldHVybiBzY29wZV9CYXNlWydvZmZzZXQnICsgWydXaWR0aCcsICdIZWlnaHQnXVtvcHRpb25zLm9ydF1dO1xyXG5cdH1cclxuXHJcblx0Ly8gRXh0ZXJuYWwgZXZlbnQgaGFuZGxpbmdcclxuXHRmdW5jdGlvbiBmaXJlRXZlbnQgKCBldmVudCwgaGFuZGxlTnVtYmVyLCB0YXAgKSB7XHJcblxyXG5cdFx0aWYgKCBoYW5kbGVOdW1iZXIgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmhhbmRsZXMgIT09IDEgKSB7XHJcblx0XHRcdGhhbmRsZU51bWJlciA9IE1hdGguYWJzKGhhbmRsZU51bWJlciAtIG9wdGlvbnMuZGlyKTtcclxuXHRcdH1cclxuXHJcblx0XHRPYmplY3Qua2V5cyhzY29wZV9FdmVudHMpLmZvckVhY2goZnVuY3Rpb24oIHRhcmdldEV2ZW50ICkge1xyXG5cclxuXHRcdFx0dmFyIGV2ZW50VHlwZSA9IHRhcmdldEV2ZW50LnNwbGl0KCcuJylbMF07XHJcblxyXG5cdFx0XHRpZiAoIGV2ZW50ID09PSBldmVudFR5cGUgKSB7XHJcblx0XHRcdFx0c2NvcGVfRXZlbnRzW3RhcmdldEV2ZW50XS5mb3JFYWNoKGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcclxuXHRcdFx0XHRcdC8vIC5yZXZlcnNlIGlzIGluIHBsYWNlXHJcblx0XHRcdFx0XHQvLyBSZXR1cm4gdmFsdWVzIGFzIGFycmF5LCBzbyBhcmdfMVthcmdfMl0gaXMgYWx3YXlzIHZhbGlkLlxyXG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChzY29wZV9TZWxmLCBhc0FycmF5KHZhbHVlR2V0KCkpLCBoYW5kbGVOdW1iZXIsIGFzQXJyYXkoaW5TbGlkZXJPcmRlcihBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChzY29wZV9WYWx1ZXMpKSksIHRhcCB8fCBmYWxzZSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gUmV0dXJucyB0aGUgaW5wdXQgYXJyYXksIHJlc3BlY3RpbmcgdGhlIHNsaWRlciBkaXJlY3Rpb24gY29uZmlndXJhdGlvbi5cclxuXHRmdW5jdGlvbiBpblNsaWRlck9yZGVyICggdmFsdWVzICkge1xyXG5cclxuXHRcdC8vIElmIG9ubHkgb25lIGhhbmRsZSBpcyB1c2VkLCByZXR1cm4gYSBzaW5nbGUgdmFsdWUuXHJcblx0XHRpZiAoIHZhbHVlcy5sZW5ndGggPT09IDEgKXtcclxuXHRcdFx0cmV0dXJuIHZhbHVlc1swXTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIG9wdGlvbnMuZGlyICkge1xyXG5cdFx0XHRyZXR1cm4gdmFsdWVzLnJldmVyc2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdmFsdWVzO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIEhhbmRsZXIgZm9yIGF0dGFjaGluZyBldmVudHMgdHJvdWdoIGEgcHJveHkuXHJcblx0ZnVuY3Rpb24gYXR0YWNoICggZXZlbnRzLCBlbGVtZW50LCBjYWxsYmFjaywgZGF0YSApIHtcclxuXHJcblx0XHQvLyBUaGlzIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIHRvICdmaWx0ZXInIGV2ZW50cyB0byB0aGUgc2xpZGVyLlxyXG5cdFx0Ly8gZWxlbWVudCBpcyBhIG5vZGUsIG5vdCBhIG5vZGVMaXN0XHJcblxyXG5cdFx0dmFyIG1ldGhvZCA9IGZ1bmN0aW9uICggZSApe1xyXG5cclxuXHRcdFx0aWYgKCBzY29wZV9UYXJnZXQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpICkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gU3RvcCBpZiBhbiBhY3RpdmUgJ3RhcCcgdHJhbnNpdGlvbiBpcyB0YWtpbmcgcGxhY2UuXHJcblx0XHRcdGlmICggaGFzQ2xhc3Moc2NvcGVfVGFyZ2V0LCBjc3NDbGFzc2VzWzE0XSkgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRlID0gZml4RXZlbnQoZSwgZGF0YS5wYWdlT2Zmc2V0KTtcclxuXHJcblx0XHRcdC8vIElnbm9yZSByaWdodCBvciBtaWRkbGUgY2xpY2tzIG9uIHN0YXJ0ICM0NTRcclxuXHRcdFx0aWYgKCBldmVudHMgPT09IGFjdGlvbnMuc3RhcnQgJiYgZS5idXR0b25zICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b25zID4gMSApIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIElnbm9yZSByaWdodCBvciBtaWRkbGUgY2xpY2tzIG9uIHN0YXJ0ICM0NTRcclxuXHRcdFx0aWYgKCBkYXRhLmhvdmVyICYmIGUuYnV0dG9ucyApIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGUuY2FsY1BvaW50ID0gZS5wb2ludHNbIG9wdGlvbnMub3J0IF07XHJcblxyXG5cdFx0XHQvLyBDYWxsIHRoZSBldmVudCBoYW5kbGVyIHdpdGggdGhlIGV2ZW50IFsgYW5kIGFkZGl0aW9uYWwgZGF0YSBdLlxyXG5cdFx0XHRjYWxsYmFjayAoIGUsIGRhdGEgKTtcclxuXHJcblx0XHR9LCBtZXRob2RzID0gW107XHJcblxyXG5cdFx0Ly8gQmluZCBhIGNsb3N1cmUgb24gdGhlIHRhcmdldCBmb3IgZXZlcnkgZXZlbnQgdHlwZS5cclxuXHRcdGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24oIGV2ZW50TmFtZSApe1xyXG5cdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBtZXRob2QsIGZhbHNlKTtcclxuXHRcdFx0bWV0aG9kcy5wdXNoKFtldmVudE5hbWUsIG1ldGhvZF0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIG1ldGhvZHM7XHJcblx0fVxyXG5cclxuXHQvLyBIYW5kbGUgbW92ZW1lbnQgb24gZG9jdW1lbnQgZm9yIGhhbmRsZSBhbmQgcmFuZ2UgZHJhZy5cclxuXHRmdW5jdGlvbiBtb3ZlICggZXZlbnQsIGRhdGEgKSB7XHJcblxyXG5cdFx0Ly8gRml4ICM0OThcclxuXHRcdC8vIENoZWNrIHZhbHVlIG9mIC5idXR0b25zIGluICdzdGFydCcgdG8gd29yayBhcm91bmQgYSBidWcgaW4gSUUxMCBtb2JpbGUgKGRhdGEuYnV0dG9uc1Byb3BlcnR5KS5cclxuXHRcdC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvOTI3MDA1L21vYmlsZS1pZTEwLXdpbmRvd3MtcGhvbmUtYnV0dG9ucy1wcm9wZXJ0eS1vZi1wb2ludGVybW92ZS1ldmVudC1hbHdheXMtemVyb1xyXG5cdFx0Ly8gSUU5IGhhcyAuYnV0dG9ucyBhbmQgLndoaWNoIHplcm8gb24gbW91c2Vtb3ZlLlxyXG5cdFx0Ly8gRmlyZWZveCBicmVha3MgdGhlIHNwZWMgTUROIGRlZmluZXMuXHJcblx0XHRpZiAoIG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoXCJNU0lFIDlcIikgPT09IC0xICYmIGV2ZW50LmJ1dHRvbnMgPT09IDAgJiYgZGF0YS5idXR0b25zUHJvcGVydHkgIT09IDAgKSB7XHJcblx0XHRcdHJldHVybiBlbmQoZXZlbnQsIGRhdGEpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBoYW5kbGVzID0gZGF0YS5oYW5kbGVzIHx8IHNjb3BlX0hhbmRsZXMsIHBvc2l0aW9ucywgc3RhdGUgPSBmYWxzZSxcclxuXHRcdFx0cHJvcG9zYWwgPSAoKGV2ZW50LmNhbGNQb2ludCAtIGRhdGEuc3RhcnQpICogMTAwKSAvIGRhdGEuYmFzZVNpemUsXHJcblx0XHRcdGhhbmRsZU51bWJlciA9IGhhbmRsZXNbMF0gPT09IHNjb3BlX0hhbmRsZXNbMF0gPyAwIDogMSwgaTtcclxuXHJcblx0XHQvLyBDYWxjdWxhdGUgcmVsYXRpdmUgcG9zaXRpb25zIGZvciB0aGUgaGFuZGxlcy5cclxuXHRcdHBvc2l0aW9ucyA9IGdldFBvc2l0aW9ucyggcHJvcG9zYWwsIGRhdGEucG9zaXRpb25zLCBoYW5kbGVzLmxlbmd0aCA+IDEpO1xyXG5cclxuXHRcdHN0YXRlID0gc2V0SGFuZGxlICggaGFuZGxlc1swXSwgcG9zaXRpb25zW2hhbmRsZU51bWJlcl0sIGhhbmRsZXMubGVuZ3RoID09PSAxICk7XHJcblxyXG5cdFx0aWYgKCBoYW5kbGVzLmxlbmd0aCA+IDEgKSB7XHJcblxyXG5cdFx0XHRzdGF0ZSA9IHNldEhhbmRsZSAoIGhhbmRsZXNbMV0sIHBvc2l0aW9uc1toYW5kbGVOdW1iZXI/MDoxXSwgZmFsc2UgKSB8fCBzdGF0ZTtcclxuXHJcblx0XHRcdGlmICggc3RhdGUgKSB7XHJcblx0XHRcdFx0Ly8gZmlyZSBmb3IgYm90aCBoYW5kbGVzXHJcblx0XHRcdFx0Zm9yICggaSA9IDA7IGkgPCBkYXRhLmhhbmRsZXMubGVuZ3RoOyBpKysgKSB7XHJcblx0XHRcdFx0XHRmaXJlRXZlbnQoJ3NsaWRlJywgaSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKCBzdGF0ZSApIHtcclxuXHRcdFx0Ly8gRmlyZSBmb3IgYSBzaW5nbGUgaGFuZGxlXHJcblx0XHRcdGZpcmVFdmVudCgnc2xpZGUnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVW5iaW5kIG1vdmUgZXZlbnRzIG9uIGRvY3VtZW50LCBjYWxsIGNhbGxiYWNrcy5cclxuXHRmdW5jdGlvbiBlbmQgKCBldmVudCwgZGF0YSApIHtcclxuXHJcblx0XHQvLyBUaGUgaGFuZGxlIGlzIG5vIGxvbmdlciBhY3RpdmUsIHNvIHJlbW92ZSB0aGUgY2xhc3MuXHJcblx0XHR2YXIgYWN0aXZlID0gc2NvcGVfQmFzZS5xdWVyeVNlbGVjdG9yKCAnLicgKyBjc3NDbGFzc2VzWzE1XSApLFxyXG5cdFx0XHRoYW5kbGVOdW1iZXIgPSBkYXRhLmhhbmRsZXNbMF0gPT09IHNjb3BlX0hhbmRsZXNbMF0gPyAwIDogMTtcclxuXHJcblx0XHRpZiAoIGFjdGl2ZSAhPT0gbnVsbCApIHtcclxuXHRcdFx0cmVtb3ZlQ2xhc3MoYWN0aXZlLCBjc3NDbGFzc2VzWzE1XSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUmVtb3ZlIGN1cnNvciBzdHlsZXMgYW5kIHRleHQtc2VsZWN0aW9uIGV2ZW50cyBib3VuZCB0byB0aGUgYm9keS5cclxuXHRcdGlmICggZXZlbnQuY3Vyc29yICkge1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICcnO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgZG9jdW1lbnQuYm9keS5ub1VpTGlzdGVuZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG5cclxuXHRcdC8vIFVuYmluZCB0aGUgbW92ZSBhbmQgZW5kIGV2ZW50cywgd2hpY2ggYXJlIGFkZGVkIG9uICdzdGFydCcuXHJcblx0XHRkLm5vVWlMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiggYyApIHtcclxuXHRcdFx0ZC5yZW1vdmVFdmVudExpc3RlbmVyKGNbMF0sIGNbMV0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gUmVtb3ZlIGRyYWdnaW5nIGNsYXNzLlxyXG5cdFx0cmVtb3ZlQ2xhc3Moc2NvcGVfVGFyZ2V0LCBjc3NDbGFzc2VzWzEyXSk7XHJcblxyXG5cdFx0Ly8gRmlyZSB0aGUgY2hhbmdlIGFuZCBzZXQgZXZlbnRzLlxyXG5cdFx0ZmlyZUV2ZW50KCdzZXQnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0ZmlyZUV2ZW50KCdjaGFuZ2UnLCBoYW5kbGVOdW1iZXIpO1xyXG5cclxuXHRcdC8vIElmIHRoaXMgaXMgYSBzdGFuZGFyZCBoYW5kbGUgbW92ZW1lbnQsIGZpcmUgdGhlIGVuZCBldmVudC5cclxuXHRcdGlmICggZGF0YS5oYW5kbGVOdW1iZXIgIT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0ZmlyZUV2ZW50KCdlbmQnLCBkYXRhLmhhbmRsZU51bWJlcik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBGaXJlICdlbmQnIHdoZW4gYSBtb3VzZSBvciBwZW4gbGVhdmVzIHRoZSBkb2N1bWVudC5cclxuXHRmdW5jdGlvbiBkb2N1bWVudExlYXZlICggZXZlbnQsIGRhdGEgKSB7XHJcblx0XHRpZiAoIGV2ZW50LnR5cGUgPT09IFwibW91c2VvdXRcIiAmJiBldmVudC50YXJnZXQubm9kZU5hbWUgPT09IFwiSFRNTFwiICYmIGV2ZW50LnJlbGF0ZWRUYXJnZXQgPT09IG51bGwgKXtcclxuXHRcdFx0ZW5kICggZXZlbnQsIGRhdGEgKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIEJpbmQgbW92ZSBldmVudHMgb24gZG9jdW1lbnQuXHJcblx0ZnVuY3Rpb24gc3RhcnQgKCBldmVudCwgZGF0YSApIHtcclxuXHJcblx0XHR2YXIgZCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuXHJcblx0XHQvLyBNYXJrIHRoZSBoYW5kbGUgYXMgJ2FjdGl2ZScgc28gaXQgY2FuIGJlIHN0eWxlZC5cclxuXHRcdGlmICggZGF0YS5oYW5kbGVzLmxlbmd0aCA9PT0gMSApIHtcclxuXHRcdFx0YWRkQ2xhc3MoZGF0YS5oYW5kbGVzWzBdLmNoaWxkcmVuWzBdLCBjc3NDbGFzc2VzWzE1XSk7XHJcblxyXG5cdFx0XHQvLyBTdXBwb3J0ICdkaXNhYmxlZCcgaGFuZGxlc1xyXG5cdFx0XHRpZiAoIGRhdGEuaGFuZGxlc1swXS5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRml4ICM1NTEsIHdoZXJlIGEgaGFuZGxlIGdldHMgc2VsZWN0ZWQgaW5zdGVhZCBvZiBkcmFnZ2VkLlxyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHQvLyBBIGRyYWcgc2hvdWxkIG5ldmVyIHByb3BhZ2F0ZSB1cCB0byB0aGUgJ3RhcCcgZXZlbnQuXHJcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcblx0XHQvLyBBdHRhY2ggdGhlIG1vdmUgYW5kIGVuZCBldmVudHMuXHJcblx0XHR2YXIgbW92ZUV2ZW50ID0gYXR0YWNoKGFjdGlvbnMubW92ZSwgZCwgbW92ZSwge1xyXG5cdFx0XHRzdGFydDogZXZlbnQuY2FsY1BvaW50LFxyXG5cdFx0XHRiYXNlU2l6ZTogYmFzZVNpemUoKSxcclxuXHRcdFx0cGFnZU9mZnNldDogZXZlbnQucGFnZU9mZnNldCxcclxuXHRcdFx0aGFuZGxlczogZGF0YS5oYW5kbGVzLFxyXG5cdFx0XHRoYW5kbGVOdW1iZXI6IGRhdGEuaGFuZGxlTnVtYmVyLFxyXG5cdFx0XHRidXR0b25zUHJvcGVydHk6IGV2ZW50LmJ1dHRvbnMsXHJcblx0XHRcdHBvc2l0aW9uczogW1xyXG5cdFx0XHRcdHNjb3BlX0xvY2F0aW9uc1swXSxcclxuXHRcdFx0XHRzY29wZV9Mb2NhdGlvbnNbc2NvcGVfSGFuZGxlcy5sZW5ndGggLSAxXVxyXG5cdFx0XHRdXHJcblx0XHR9KSwgZW5kRXZlbnQgPSBhdHRhY2goYWN0aW9ucy5lbmQsIGQsIGVuZCwge1xyXG5cdFx0XHRoYW5kbGVzOiBkYXRhLmhhbmRsZXMsXHJcblx0XHRcdGhhbmRsZU51bWJlcjogZGF0YS5oYW5kbGVOdW1iZXJcclxuXHRcdH0pO1xyXG5cclxuXHRcdHZhciBvdXRFdmVudCA9IGF0dGFjaChcIm1vdXNlb3V0XCIsIGQsIGRvY3VtZW50TGVhdmUsIHtcclxuXHRcdFx0aGFuZGxlczogZGF0YS5oYW5kbGVzLFxyXG5cdFx0XHRoYW5kbGVOdW1iZXI6IGRhdGEuaGFuZGxlTnVtYmVyXHJcblx0XHR9KTtcclxuXHJcblx0XHRkLm5vVWlMaXN0ZW5lcnMgPSBtb3ZlRXZlbnQuY29uY2F0KGVuZEV2ZW50LCBvdXRFdmVudCk7XHJcblxyXG5cdFx0Ly8gVGV4dCBzZWxlY3Rpb24gaXNuJ3QgYW4gaXNzdWUgb24gdG91Y2ggZGV2aWNlcyxcclxuXHRcdC8vIHNvIGFkZGluZyBjdXJzb3Igc3R5bGVzIGNhbiBiZSBza2lwcGVkLlxyXG5cdFx0aWYgKCBldmVudC5jdXJzb3IgKSB7XHJcblxyXG5cdFx0XHQvLyBQcmV2ZW50IHRoZSAnSScgY3Vyc29yIGFuZCBleHRlbmQgdGhlIHJhbmdlLWRyYWcgY3Vyc29yLlxyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KS5jdXJzb3I7XHJcblxyXG5cdFx0XHQvLyBNYXJrIHRoZSB0YXJnZXQgd2l0aCBhIGRyYWdnaW5nIHN0YXRlLlxyXG5cdFx0XHRpZiAoIHNjb3BlX0hhbmRsZXMubGVuZ3RoID4gMSApIHtcclxuXHRcdFx0XHRhZGRDbGFzcyhzY29wZV9UYXJnZXQsIGNzc0NsYXNzZXNbMTJdKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIGYgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGRvY3VtZW50LmJvZHkubm9VaUxpc3RlbmVyID0gZjtcclxuXHJcblx0XHRcdC8vIFByZXZlbnQgdGV4dCBzZWxlY3Rpb24gd2hlbiBkcmFnZ2luZyB0aGUgaGFuZGxlcy5cclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIGYsIGZhbHNlKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIGRhdGEuaGFuZGxlTnVtYmVyICE9PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdGZpcmVFdmVudCgnc3RhcnQnLCBkYXRhLmhhbmRsZU51bWJlcik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBNb3ZlIGNsb3Nlc3QgaGFuZGxlIHRvIHRhcHBlZCBsb2NhdGlvbi5cclxuXHRmdW5jdGlvbiB0YXAgKCBldmVudCApIHtcclxuXHJcblx0XHR2YXIgbG9jYXRpb24gPSBldmVudC5jYWxjUG9pbnQsIHRvdGFsID0gMCwgaGFuZGxlTnVtYmVyLCB0bztcclxuXHJcblx0XHQvLyBUaGUgdGFwIGV2ZW50IHNob3VsZG4ndCBwcm9wYWdhdGUgdXAgYW5kIGNhdXNlICdlZGdlJyB0byBydW4uXHJcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcblx0XHQvLyBBZGQgdXAgdGhlIGhhbmRsZSBvZmZzZXRzLlxyXG5cdFx0c2NvcGVfSGFuZGxlcy5mb3JFYWNoKGZ1bmN0aW9uKGEpe1xyXG5cdFx0XHR0b3RhbCArPSBvZmZzZXQoYSlbIG9wdGlvbnMuc3R5bGUgXTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEZpbmQgdGhlIGhhbmRsZSBjbG9zZXN0IHRvIHRoZSB0YXBwZWQgcG9zaXRpb24uXHJcblx0XHRoYW5kbGVOdW1iZXIgPSAoIGxvY2F0aW9uIDwgdG90YWwvMiB8fCBzY29wZV9IYW5kbGVzLmxlbmd0aCA9PT0gMSApID8gMCA6IDE7XHJcblxyXG5cdFx0bG9jYXRpb24gLT0gb2Zmc2V0KHNjb3BlX0Jhc2UpWyBvcHRpb25zLnN0eWxlIF07XHJcblxyXG5cdFx0Ly8gQ2FsY3VsYXRlIHRoZSBuZXcgcG9zaXRpb24uXHJcblx0XHR0byA9ICggbG9jYXRpb24gKiAxMDAgKSAvIGJhc2VTaXplKCk7XHJcblxyXG5cdFx0aWYgKCAhb3B0aW9ucy5ldmVudHMuc25hcCApIHtcclxuXHRcdFx0Ly8gRmxhZyB0aGUgc2xpZGVyIGFzIGl0IGlzIG5vdyBpbiBhIHRyYW5zaXRpb25hbCBzdGF0ZS5cclxuXHRcdFx0Ly8gVHJhbnNpdGlvbiB0YWtlcyAzMDAgbXMsIHNvIHJlLWVuYWJsZSB0aGUgc2xpZGVyIGFmdGVyd2FyZHMuXHJcblx0XHRcdGFkZENsYXNzRm9yKCBzY29wZV9UYXJnZXQsIGNzc0NsYXNzZXNbMTRdLCAzMDAgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTdXBwb3J0ICdkaXNhYmxlZCcgaGFuZGxlc1xyXG5cdFx0aWYgKCBzY29wZV9IYW5kbGVzW2hhbmRsZU51bWJlcl0uaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpICkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmluZCB0aGUgY2xvc2VzdCBoYW5kbGUgYW5kIGNhbGN1bGF0ZSB0aGUgdGFwcGVkIHBvaW50LlxyXG5cdFx0Ly8gVGhlIHNldCBoYW5kbGUgdG8gdGhlIG5ldyBwb3NpdGlvbi5cclxuXHRcdHNldEhhbmRsZSggc2NvcGVfSGFuZGxlc1toYW5kbGVOdW1iZXJdLCB0byApO1xyXG5cclxuXHRcdGZpcmVFdmVudCgnc2xpZGUnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cdFx0ZmlyZUV2ZW50KCdzZXQnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cdFx0ZmlyZUV2ZW50KCdjaGFuZ2UnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cclxuXHRcdGlmICggb3B0aW9ucy5ldmVudHMuc25hcCApIHtcclxuXHRcdFx0c3RhcnQoZXZlbnQsIHsgaGFuZGxlczogW3Njb3BlX0hhbmRsZXNbaGFuZGxlTnVtYmVyXV0gfSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBGaXJlcyBhICdob3ZlcicgZXZlbnQgZm9yIGEgaG92ZXJlZCBtb3VzZS9wZW4gcG9zaXRpb24uXHJcblx0ZnVuY3Rpb24gaG92ZXIgKCBldmVudCApIHtcclxuXHJcblx0XHR2YXIgbG9jYXRpb24gPSBldmVudC5jYWxjUG9pbnQgLSBvZmZzZXQoc2NvcGVfQmFzZSlbIG9wdGlvbnMuc3R5bGUgXSxcclxuXHRcdFx0dG8gPSBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCggbG9jYXRpb24gKiAxMDAgKSAvIGJhc2VTaXplKCkpLFxyXG5cdFx0XHR2YWx1ZSA9IHNjb3BlX1NwZWN0cnVtLmZyb21TdGVwcGluZyggdG8gKTtcclxuXHJcblx0XHRPYmplY3Qua2V5cyhzY29wZV9FdmVudHMpLmZvckVhY2goZnVuY3Rpb24oIHRhcmdldEV2ZW50ICkge1xyXG5cdFx0XHRpZiAoICdob3ZlcicgPT09IHRhcmdldEV2ZW50LnNwbGl0KCcuJylbMF0gKSB7XHJcblx0XHRcdFx0c2NvcGVfRXZlbnRzW3RhcmdldEV2ZW50XS5mb3JFYWNoKGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcclxuXHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoIHNjb3BlX1NlbGYsIHZhbHVlICk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gQXR0YWNoIGV2ZW50cyB0byBzZXZlcmFsIHNsaWRlciBwYXJ0cy5cclxuXHRmdW5jdGlvbiBldmVudHMgKCBiZWhhdmlvdXIgKSB7XHJcblxyXG5cdFx0dmFyIGksIGRyYWc7XHJcblxyXG5cdFx0Ly8gQXR0YWNoIHRoZSBzdGFuZGFyZCBkcmFnIGV2ZW50IHRvIHRoZSBoYW5kbGVzLlxyXG5cdFx0aWYgKCAhYmVoYXZpb3VyLmZpeGVkICkge1xyXG5cclxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBzY29wZV9IYW5kbGVzLmxlbmd0aDsgaSArPSAxICkge1xyXG5cclxuXHRcdFx0XHQvLyBUaGVzZSBldmVudHMgYXJlIG9ubHkgYm91bmQgdG8gdGhlIHZpc3VhbCBoYW5kbGVcclxuXHRcdFx0XHQvLyBlbGVtZW50LCBub3QgdGhlICdyZWFsJyBvcmlnaW4gZWxlbWVudC5cclxuXHRcdFx0XHRhdHRhY2ggKCBhY3Rpb25zLnN0YXJ0LCBzY29wZV9IYW5kbGVzW2ldLmNoaWxkcmVuWzBdLCBzdGFydCwge1xyXG5cdFx0XHRcdFx0aGFuZGxlczogWyBzY29wZV9IYW5kbGVzW2ldIF0sXHJcblx0XHRcdFx0XHRoYW5kbGVOdW1iZXI6IGlcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEF0dGFjaCB0aGUgdGFwIGV2ZW50IHRvIHRoZSBzbGlkZXIgYmFzZS5cclxuXHRcdGlmICggYmVoYXZpb3VyLnRhcCApIHtcclxuXHJcblx0XHRcdGF0dGFjaCAoIGFjdGlvbnMuc3RhcnQsIHNjb3BlX0Jhc2UsIHRhcCwge1xyXG5cdFx0XHRcdGhhbmRsZXM6IHNjb3BlX0hhbmRsZXNcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmlyZSBob3ZlciBldmVudHNcclxuXHRcdGlmICggYmVoYXZpb3VyLmhvdmVyICkge1xyXG5cdFx0XHRhdHRhY2ggKCBhY3Rpb25zLm1vdmUsIHNjb3BlX0Jhc2UsIGhvdmVyLCB7IGhvdmVyOiB0cnVlIH0gKTtcclxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBzY29wZV9IYW5kbGVzLmxlbmd0aDsgaSArPSAxICkge1xyXG5cdFx0XHRcdFsnbW91c2Vtb3ZlIE1TUG9pbnRlck1vdmUgcG9pbnRlcm1vdmUnXS5mb3JFYWNoKGZ1bmN0aW9uKCBldmVudE5hbWUgKXtcclxuXHRcdFx0XHRcdHNjb3BlX0hhbmRsZXNbaV0uY2hpbGRyZW5bMF0uYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHN0b3BQcm9wYWdhdGlvbiwgZmFsc2UpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTWFrZSB0aGUgcmFuZ2UgZHJhZ2dhYmxlLlxyXG5cdFx0aWYgKCBiZWhhdmlvdXIuZHJhZyApe1xyXG5cclxuXHRcdFx0ZHJhZyA9IFtzY29wZV9CYXNlLnF1ZXJ5U2VsZWN0b3IoICcuJyArIGNzc0NsYXNzZXNbN10gKV07XHJcblx0XHRcdGFkZENsYXNzKGRyYWdbMF0sIGNzc0NsYXNzZXNbMTBdKTtcclxuXHJcblx0XHRcdC8vIFdoZW4gdGhlIHJhbmdlIGlzIGZpeGVkLCB0aGUgZW50aXJlIHJhbmdlIGNhblxyXG5cdFx0XHQvLyBiZSBkcmFnZ2VkIGJ5IHRoZSBoYW5kbGVzLiBUaGUgaGFuZGxlIGluIHRoZSBmaXJzdFxyXG5cdFx0XHQvLyBvcmlnaW4gd2lsbCBwcm9wYWdhdGUgdGhlIHN0YXJ0IGV2ZW50IHVwd2FyZCxcclxuXHRcdFx0Ly8gYnV0IGl0IG5lZWRzIHRvIGJlIGJvdW5kIG1hbnVhbGx5IG9uIHRoZSBvdGhlci5cclxuXHRcdFx0aWYgKCBiZWhhdmlvdXIuZml4ZWQgKSB7XHJcblx0XHRcdFx0ZHJhZy5wdXNoKHNjb3BlX0hhbmRsZXNbKGRyYWdbMF0gPT09IHNjb3BlX0hhbmRsZXNbMF0gPyAxIDogMCldLmNoaWxkcmVuWzBdKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZHJhZy5mb3JFYWNoKGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0XHRcdGF0dGFjaCAoIGFjdGlvbnMuc3RhcnQsIGVsZW1lbnQsIHN0YXJ0LCB7XHJcblx0XHRcdFx0XHRoYW5kbGVzOiBzY29wZV9IYW5kbGVzXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG5cdC8vIFRlc3Qgc3VnZ2VzdGVkIHZhbHVlcyBhbmQgYXBwbHkgbWFyZ2luLCBzdGVwLlxyXG5cdGZ1bmN0aW9uIHNldEhhbmRsZSAoIGhhbmRsZSwgdG8sIG5vTGltaXRPcHRpb24gKSB7XHJcblxyXG5cdFx0dmFyIHRyaWdnZXIgPSBoYW5kbGUgIT09IHNjb3BlX0hhbmRsZXNbMF0gPyAxIDogMCxcclxuXHRcdFx0bG93ZXJNYXJnaW4gPSBzY29wZV9Mb2NhdGlvbnNbMF0gKyBvcHRpb25zLm1hcmdpbixcclxuXHRcdFx0dXBwZXJNYXJnaW4gPSBzY29wZV9Mb2NhdGlvbnNbMV0gLSBvcHRpb25zLm1hcmdpbixcclxuXHRcdFx0bG93ZXJMaW1pdCA9IHNjb3BlX0xvY2F0aW9uc1swXSArIG9wdGlvbnMubGltaXQsXHJcblx0XHRcdHVwcGVyTGltaXQgPSBzY29wZV9Mb2NhdGlvbnNbMV0gLSBvcHRpb25zLmxpbWl0O1xyXG5cclxuXHRcdC8vIEZvciBzbGlkZXJzIHdpdGggbXVsdGlwbGUgaGFuZGxlcyxcclxuXHRcdC8vIGxpbWl0IG1vdmVtZW50IHRvIHRoZSBvdGhlciBoYW5kbGUuXHJcblx0XHQvLyBBcHBseSB0aGUgbWFyZ2luIG9wdGlvbiBieSBhZGRpbmcgaXQgdG8gdGhlIGhhbmRsZSBwb3NpdGlvbnMuXHJcblx0XHRpZiAoIHNjb3BlX0hhbmRsZXMubGVuZ3RoID4gMSApIHtcclxuXHRcdFx0dG8gPSB0cmlnZ2VyID8gTWF0aC5tYXgoIHRvLCBsb3dlck1hcmdpbiApIDogTWF0aC5taW4oIHRvLCB1cHBlck1hcmdpbiApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSBsaW1pdCBvcHRpb24gaGFzIHRoZSBvcHBvc2l0ZSBlZmZlY3QsIGxpbWl0aW5nIGhhbmRsZXMgdG8gYVxyXG5cdFx0Ly8gbWF4aW11bSBkaXN0YW5jZSBmcm9tIGFub3RoZXIuIExpbWl0IG11c3QgYmUgPiAwLCBhcyBvdGhlcndpc2VcclxuXHRcdC8vIGhhbmRsZXMgd291bGQgYmUgdW5tb3ZlYWJsZS4gJ25vTGltaXRPcHRpb24nIGlzIHNldCB0byAnZmFsc2UnXHJcblx0XHQvLyBmb3IgdGhlIC52YWwoKSBtZXRob2QsIGV4Y2VwdCBmb3IgcGFzcyA0LzQuXHJcblx0XHRpZiAoIG5vTGltaXRPcHRpb24gIT09IGZhbHNlICYmIG9wdGlvbnMubGltaXQgJiYgc2NvcGVfSGFuZGxlcy5sZW5ndGggPiAxICkge1xyXG5cdFx0XHR0byA9IHRyaWdnZXIgPyBNYXRoLm1pbiAoIHRvLCBsb3dlckxpbWl0ICkgOiBNYXRoLm1heCggdG8sIHVwcGVyTGltaXQgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBIYW5kbGUgdGhlIHN0ZXAgb3B0aW9uLlxyXG5cdFx0dG8gPSBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCB0byApO1xyXG5cclxuXHRcdC8vIExpbWl0IHRvIDAvMTAwIGZvciAudmFsIGlucHV0LCB0cmltIGFueXRoaW5nIGJleW9uZCA3IGRpZ2l0cywgYXNcclxuXHRcdC8vIEphdmFTY3JpcHQgaGFzIHNvbWUgaXNzdWVzIGluIGl0cyBmbG9hdGluZyBwb2ludCBpbXBsZW1lbnRhdGlvbi5cclxuXHRcdHRvID0gbGltaXQocGFyc2VGbG9hdCh0by50b0ZpeGVkKDcpKSk7XHJcblxyXG5cdFx0Ly8gUmV0dXJuIGZhbHNlIGlmIGhhbmRsZSBjYW4ndCBtb3ZlXHJcblx0XHRpZiAoIHRvID09PSBzY29wZV9Mb2NhdGlvbnNbdHJpZ2dlcl0gKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTZXQgdGhlIGhhbmRsZSB0byB0aGUgbmV3IHBvc2l0aW9uLlxyXG5cdFx0Ly8gVXNlIHJlcXVlc3RBbmltYXRpb25GcmFtZSBmb3IgZWZmaWNpZW50IHBhaW50aW5nLlxyXG5cdFx0Ly8gTm8gc2lnbmlmaWNhbnQgZWZmZWN0IGluIENocm9tZSwgRWRnZSBzZWVzIGRyYW1hdGljXHJcblx0XHQvLyBwZXJmb3JtYWNlIGltcHJvdmVtZW50cy5cclxuXHRcdGlmICggd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSApIHtcclxuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGhhbmRsZS5zdHlsZVtvcHRpb25zLnN0eWxlXSA9IHRvICsgJyUnO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGhhbmRsZS5zdHlsZVtvcHRpb25zLnN0eWxlXSA9IHRvICsgJyUnO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZvcmNlIHByb3BlciBoYW5kbGUgc3RhY2tpbmdcclxuXHRcdGlmICggIWhhbmRsZS5wcmV2aW91c1NpYmxpbmcgKSB7XHJcblx0XHRcdHJlbW92ZUNsYXNzKGhhbmRsZSwgY3NzQ2xhc3Nlc1sxN10pO1xyXG5cdFx0XHRpZiAoIHRvID4gNTAgKSB7XHJcblx0XHRcdFx0YWRkQ2xhc3MoaGFuZGxlLCBjc3NDbGFzc2VzWzE3XSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBVcGRhdGUgbG9jYXRpb25zLlxyXG5cdFx0c2NvcGVfTG9jYXRpb25zW3RyaWdnZXJdID0gdG87XHJcblxyXG5cdFx0Ly8gQ29udmVydCB0aGUgdmFsdWUgdG8gdGhlIHNsaWRlciBzdGVwcGluZy9yYW5nZS5cclxuXHRcdHNjb3BlX1ZhbHVlc1t0cmlnZ2VyXSA9IHNjb3BlX1NwZWN0cnVtLmZyb21TdGVwcGluZyggdG8gKTtcclxuXHJcblx0XHRmaXJlRXZlbnQoJ3VwZGF0ZScsIHRyaWdnZXIpO1xyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0Ly8gTG9vcCB2YWx1ZXMgZnJvbSB2YWx1ZSBtZXRob2QgYW5kIGFwcGx5IHRoZW0uXHJcblx0ZnVuY3Rpb24gc2V0VmFsdWVzICggY291bnQsIHZhbHVlcyApIHtcclxuXHJcblx0XHR2YXIgaSwgdHJpZ2dlciwgdG87XHJcblxyXG5cdFx0Ly8gV2l0aCB0aGUgbGltaXQgb3B0aW9uLCB3ZSdsbCBuZWVkIGFub3RoZXIgbGltaXRpbmcgcGFzcy5cclxuXHRcdGlmICggb3B0aW9ucy5saW1pdCApIHtcclxuXHRcdFx0Y291bnQgKz0gMTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaGFuZGxlcyB0byBiZSBzZXQgcnVuIHRoZSBzZXR0aW5nXHJcblx0XHQvLyBtZWNoYW5pc20gdHdpY2UgZm9yIHRoZSBmaXJzdCBoYW5kbGUsIHRvIG1ha2Ugc3VyZSBpdFxyXG5cdFx0Ly8gY2FuIGJlIGJvdW5jZWQgb2YgdGhlIHNlY29uZCBvbmUgcHJvcGVybHkuXHJcblx0XHRmb3IgKCBpID0gMDsgaSA8IGNvdW50OyBpICs9IDEgKSB7XHJcblxyXG5cdFx0XHR0cmlnZ2VyID0gaSUyO1xyXG5cclxuXHRcdFx0Ly8gR2V0IHRoZSBjdXJyZW50IGFyZ3VtZW50IGZyb20gdGhlIGFycmF5LlxyXG5cdFx0XHR0byA9IHZhbHVlc1t0cmlnZ2VyXTtcclxuXHJcblx0XHRcdC8vIFNldHRpbmcgd2l0aCBudWxsIGluZGljYXRlcyBhbiAnaWdub3JlJy5cclxuXHRcdFx0Ly8gSW5wdXR0aW5nICdmYWxzZScgaXMgaW52YWxpZC5cclxuXHRcdFx0aWYgKCB0byAhPT0gbnVsbCAmJiB0byAhPT0gZmFsc2UgKSB7XHJcblxyXG5cdFx0XHRcdC8vIElmIGEgZm9ybWF0dGVkIG51bWJlciB3YXMgcGFzc2VkLCBhdHRlbXQgdG8gZGVjb2RlIGl0LlxyXG5cdFx0XHRcdGlmICggdHlwZW9mIHRvID09PSAnbnVtYmVyJyApIHtcclxuXHRcdFx0XHRcdHRvID0gU3RyaW5nKHRvKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRvID0gb3B0aW9ucy5mb3JtYXQuZnJvbSggdG8gKTtcclxuXHJcblx0XHRcdFx0Ly8gUmVxdWVzdCBhbiB1cGRhdGUgZm9yIGFsbCBsaW5rcyBpZiB0aGUgdmFsdWUgd2FzIGludmFsaWQuXHJcblx0XHRcdFx0Ly8gRG8gc28gdG9vIGlmIHNldHRpbmcgdGhlIGhhbmRsZSBmYWlscy5cclxuXHRcdFx0XHRpZiAoIHRvID09PSBmYWxzZSB8fCBpc05hTih0bykgfHwgc2V0SGFuZGxlKCBzY29wZV9IYW5kbGVzW3RyaWdnZXJdLCBzY29wZV9TcGVjdHJ1bS50b1N0ZXBwaW5nKCB0byApLCBpID09PSAoMyAtIG9wdGlvbnMuZGlyKSApID09PSBmYWxzZSApIHtcclxuXHRcdFx0XHRcdGZpcmVFdmVudCgndXBkYXRlJywgdHJpZ2dlcik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBTZXQgdGhlIHNsaWRlciB2YWx1ZS5cclxuXHRmdW5jdGlvbiB2YWx1ZVNldCAoIGlucHV0ICkge1xyXG5cclxuXHRcdHZhciBjb3VudCwgdmFsdWVzID0gYXNBcnJheSggaW5wdXQgKSwgaTtcclxuXHJcblx0XHQvLyBUaGUgUlRMIHNldHRpbmdzIGlzIGltcGxlbWVudGVkIGJ5IHJldmVyc2luZyB0aGUgZnJvbnQtZW5kLFxyXG5cdFx0Ly8gaW50ZXJuYWwgbWVjaGFuaXNtcyBhcmUgdGhlIHNhbWUuXHJcblx0XHRpZiAoIG9wdGlvbnMuZGlyICYmIG9wdGlvbnMuaGFuZGxlcyA+IDEgKSB7XHJcblx0XHRcdHZhbHVlcy5yZXZlcnNlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQW5pbWF0aW9uIGlzIG9wdGlvbmFsLlxyXG5cdFx0Ly8gTWFrZSBzdXJlIHRoZSBpbml0aWFsIHZhbHVlcyB3aGVyZSBzZXQgYmVmb3JlIHVzaW5nIGFuaW1hdGVkIHBsYWNlbWVudC5cclxuXHRcdGlmICggb3B0aW9ucy5hbmltYXRlICYmIHNjb3BlX0xvY2F0aW9uc1swXSAhPT0gLTEgKSB7XHJcblx0XHRcdGFkZENsYXNzRm9yKCBzY29wZV9UYXJnZXQsIGNzc0NsYXNzZXNbMTRdLCAzMDAgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBEZXRlcm1pbmUgaG93IG9mdGVuIHRvIHNldCB0aGUgaGFuZGxlcy5cclxuXHRcdGNvdW50ID0gc2NvcGVfSGFuZGxlcy5sZW5ndGggPiAxID8gMyA6IDE7XHJcblxyXG5cdFx0aWYgKCB2YWx1ZXMubGVuZ3RoID09PSAxICkge1xyXG5cdFx0XHRjb3VudCA9IDE7XHJcblx0XHR9XHJcblxyXG5cdFx0c2V0VmFsdWVzICggY291bnQsIHZhbHVlcyApO1xyXG5cclxuXHRcdC8vIEZpcmUgdGhlICdzZXQnIGV2ZW50IGZvciBib3RoIGhhbmRsZXMuXHJcblx0XHRmb3IgKCBpID0gMDsgaSA8IHNjb3BlX0hhbmRsZXMubGVuZ3RoOyBpKysgKSB7XHJcblx0XHRcdGZpcmVFdmVudCgnc2V0JywgaSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBHZXQgdGhlIHNsaWRlciB2YWx1ZS5cclxuXHRmdW5jdGlvbiB2YWx1ZUdldCAoICkge1xyXG5cclxuXHRcdHZhciBpLCByZXRvdXIgPSBbXTtcclxuXHJcblx0XHQvLyBHZXQgdGhlIHZhbHVlIGZyb20gYWxsIGhhbmRsZXMuXHJcblx0XHRmb3IgKCBpID0gMDsgaSA8IG9wdGlvbnMuaGFuZGxlczsgaSArPSAxICl7XHJcblx0XHRcdHJldG91cltpXSA9IG9wdGlvbnMuZm9ybWF0LnRvKCBzY29wZV9WYWx1ZXNbaV0gKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaW5TbGlkZXJPcmRlciggcmV0b3VyICk7XHJcblx0fVxyXG5cclxuXHQvLyBSZW1vdmVzIGNsYXNzZXMgZnJvbSB0aGUgcm9vdCBhbmQgZW1wdGllcyBpdC5cclxuXHRmdW5jdGlvbiBkZXN0cm95ICggKSB7XHJcblx0XHRjc3NDbGFzc2VzLmZvckVhY2goZnVuY3Rpb24oY2xzKXtcclxuXHRcdFx0aWYgKCAhY2xzICkgeyByZXR1cm47IH0gLy8gSWdub3JlIGVtcHR5IGNsYXNzZXNcclxuXHRcdFx0cmVtb3ZlQ2xhc3Moc2NvcGVfVGFyZ2V0LCBjbHMpO1xyXG5cdFx0fSk7XHJcblx0XHRzY29wZV9UYXJnZXQuaW5uZXJIVE1MID0gJyc7XHJcblx0XHRkZWxldGUgc2NvcGVfVGFyZ2V0Lm5vVWlTbGlkZXI7XHJcblx0fVxyXG5cclxuXHQvLyBHZXQgdGhlIGN1cnJlbnQgc3RlcCBzaXplIGZvciB0aGUgc2xpZGVyLlxyXG5cdGZ1bmN0aW9uIGdldEN1cnJlbnRTdGVwICggKSB7XHJcblxyXG5cdFx0Ly8gQ2hlY2sgYWxsIGxvY2F0aW9ucywgbWFwIHRoZW0gdG8gdGhlaXIgc3RlcHBpbmcgcG9pbnQuXHJcblx0XHQvLyBHZXQgdGhlIHN0ZXAgcG9pbnQsIHRoZW4gZmluZCBpdCBpbiB0aGUgaW5wdXQgbGlzdC5cclxuXHRcdHZhciByZXRvdXIgPSBzY29wZV9Mb2NhdGlvbnMubWFwKGZ1bmN0aW9uKCBsb2NhdGlvbiwgaW5kZXggKXtcclxuXHJcblx0XHRcdHZhciBzdGVwID0gc2NvcGVfU3BlY3RydW0uZ2V0QXBwbGljYWJsZVN0ZXAoIGxvY2F0aW9uICksXHJcblxyXG5cdFx0XHRcdC8vIEFzIHBlciAjMzkxLCB0aGUgY29tcGFyaXNvbiBmb3IgdGhlIGRlY3JlbWVudCBzdGVwIGNhbiBoYXZlIHNvbWUgcm91bmRpbmcgaXNzdWVzLlxyXG5cdFx0XHRcdC8vIFJvdW5kIHRoZSB2YWx1ZSB0byB0aGUgcHJlY2lzaW9uIHVzZWQgaW4gdGhlIHN0ZXAuXHJcblx0XHRcdFx0c3RlcERlY2ltYWxzID0gY291bnREZWNpbWFscyhTdHJpbmcoc3RlcFsyXSkpLFxyXG5cclxuXHRcdFx0XHQvLyBHZXQgdGhlIGN1cnJlbnQgbnVtZXJpYyB2YWx1ZVxyXG5cdFx0XHRcdHZhbHVlID0gc2NvcGVfVmFsdWVzW2luZGV4XSxcclxuXHJcblx0XHRcdFx0Ly8gVG8gbW92ZSB0aGUgc2xpZGVyICdvbmUgc3RlcCB1cCcsIHRoZSBjdXJyZW50IHN0ZXAgdmFsdWUgbmVlZHMgdG8gYmUgYWRkZWQuXHJcblx0XHRcdFx0Ly8gVXNlIG51bGwgaWYgd2UgYXJlIGF0IHRoZSBtYXhpbXVtIHNsaWRlciB2YWx1ZS5cclxuXHRcdFx0XHRpbmNyZW1lbnQgPSBsb2NhdGlvbiA9PT0gMTAwID8gbnVsbCA6IHN0ZXBbMl0sXHJcblxyXG5cdFx0XHRcdC8vIEdvaW5nICdvbmUgc3RlcCBkb3duJyBtaWdodCBwdXQgdGhlIHNsaWRlciBpbiBhIGRpZmZlcmVudCBzdWItcmFuZ2UsIHNvIHdlXHJcblx0XHRcdFx0Ly8gbmVlZCB0byBzd2l0Y2ggYmV0d2VlbiB0aGUgY3VycmVudCBvciB0aGUgcHJldmlvdXMgc3RlcC5cclxuXHRcdFx0XHRwcmV2ID0gTnVtYmVyKCh2YWx1ZSAtIHN0ZXBbMl0pLnRvRml4ZWQoc3RlcERlY2ltYWxzKSksXHJcblxyXG5cdFx0XHRcdC8vIElmIHRoZSB2YWx1ZSBmaXRzIHRoZSBzdGVwLCByZXR1cm4gdGhlIGN1cnJlbnQgc3RlcCB2YWx1ZS4gT3RoZXJ3aXNlLCB1c2UgdGhlXHJcblx0XHRcdFx0Ly8gcHJldmlvdXMgc3RlcC4gUmV0dXJuIG51bGwgaWYgdGhlIHNsaWRlciBpcyBhdCBpdHMgbWluaW11bSB2YWx1ZS5cclxuXHRcdFx0XHRkZWNyZW1lbnQgPSBsb2NhdGlvbiA9PT0gMCA/IG51bGwgOiAocHJldiA+PSBzdGVwWzFdKSA/IHN0ZXBbMl0gOiAoc3RlcFswXSB8fCBmYWxzZSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gW2RlY3JlbWVudCwgaW5jcmVtZW50XTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFJldHVybiB2YWx1ZXMgaW4gdGhlIHByb3BlciBvcmRlci5cclxuXHRcdHJldHVybiBpblNsaWRlck9yZGVyKCByZXRvdXIgKTtcclxuXHR9XHJcblxyXG5cdC8vIEF0dGFjaCBhbiBldmVudCB0byB0aGlzIHNsaWRlciwgcG9zc2libHkgaW5jbHVkaW5nIGEgbmFtZXNwYWNlXHJcblx0ZnVuY3Rpb24gYmluZEV2ZW50ICggbmFtZXNwYWNlZEV2ZW50LCBjYWxsYmFjayApIHtcclxuXHRcdHNjb3BlX0V2ZW50c1tuYW1lc3BhY2VkRXZlbnRdID0gc2NvcGVfRXZlbnRzW25hbWVzcGFjZWRFdmVudF0gfHwgW107XHJcblx0XHRzY29wZV9FdmVudHNbbmFtZXNwYWNlZEV2ZW50XS5wdXNoKGNhbGxiYWNrKTtcclxuXHJcblx0XHQvLyBJZiB0aGUgZXZlbnQgYm91bmQgaXMgJ3VwZGF0ZSwnIGZpcmUgaXQgaW1tZWRpYXRlbHkgZm9yIGFsbCBoYW5kbGVzLlxyXG5cdFx0aWYgKCBuYW1lc3BhY2VkRXZlbnQuc3BsaXQoJy4nKVswXSA9PT0gJ3VwZGF0ZScgKSB7XHJcblx0XHRcdHNjb3BlX0hhbmRsZXMuZm9yRWFjaChmdW5jdGlvbihhLCBpbmRleCl7XHJcblx0XHRcdFx0ZmlyZUV2ZW50KCd1cGRhdGUnLCBpbmRleCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVW5kbyBhdHRhY2htZW50IG9mIGV2ZW50XHJcblx0ZnVuY3Rpb24gcmVtb3ZlRXZlbnQgKCBuYW1lc3BhY2VkRXZlbnQgKSB7XHJcblxyXG5cdFx0dmFyIGV2ZW50ID0gbmFtZXNwYWNlZEV2ZW50LnNwbGl0KCcuJylbMF0sXHJcblx0XHRcdG5hbWVzcGFjZSA9IG5hbWVzcGFjZWRFdmVudC5zdWJzdHJpbmcoZXZlbnQubGVuZ3RoKTtcclxuXHJcblx0XHRPYmplY3Qua2V5cyhzY29wZV9FdmVudHMpLmZvckVhY2goZnVuY3Rpb24oIGJpbmQgKXtcclxuXHJcblx0XHRcdHZhciB0RXZlbnQgPSBiaW5kLnNwbGl0KCcuJylbMF0sXHJcblx0XHRcdFx0dE5hbWVzcGFjZSA9IGJpbmQuc3Vic3RyaW5nKHRFdmVudC5sZW5ndGgpO1xyXG5cclxuXHRcdFx0aWYgKCAoIWV2ZW50IHx8IGV2ZW50ID09PSB0RXZlbnQpICYmICghbmFtZXNwYWNlIHx8IG5hbWVzcGFjZSA9PT0gdE5hbWVzcGFjZSkgKSB7XHJcblx0XHRcdFx0ZGVsZXRlIHNjb3BlX0V2ZW50c1tiaW5kXTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyBVcGRhdGVhYmxlOiBtYXJnaW4sIGxpbWl0LCBzdGVwLCByYW5nZSwgYW5pbWF0ZSwgc25hcFxyXG5cdGZ1bmN0aW9uIHVwZGF0ZU9wdGlvbnMgKCBvcHRpb25zVG9VcGRhdGUgKSB7XHJcblxyXG5cdFx0dmFyIHYgPSB2YWx1ZUdldCgpLCBpLCBuZXdPcHRpb25zID0gdGVzdE9wdGlvbnMoe1xyXG5cdFx0XHRzdGFydDogWzAsIDBdLFxyXG5cdFx0XHRtYXJnaW46IG9wdGlvbnNUb1VwZGF0ZS5tYXJnaW4sXHJcblx0XHRcdGxpbWl0OiBvcHRpb25zVG9VcGRhdGUubGltaXQsXHJcblx0XHRcdHN0ZXA6IG9wdGlvbnNUb1VwZGF0ZS5zdGVwLFxyXG5cdFx0XHRyYW5nZTogb3B0aW9uc1RvVXBkYXRlLnJhbmdlLFxyXG5cdFx0XHRhbmltYXRlOiBvcHRpb25zVG9VcGRhdGUuYW5pbWF0ZSxcclxuXHRcdFx0c25hcDogb3B0aW9uc1RvVXBkYXRlLnNuYXAgPT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuc25hcCA6IG9wdGlvbnNUb1VwZGF0ZS5zbmFwXHJcblx0XHR9KTtcclxuXHJcblx0XHRbJ21hcmdpbicsICdsaW1pdCcsICdzdGVwJywgJ3JhbmdlJywgJ2FuaW1hdGUnXS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpe1xyXG5cdFx0XHRpZiAoIG9wdGlvbnNUb1VwZGF0ZVtuYW1lXSAhPT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdG9wdGlvbnNbbmFtZV0gPSBvcHRpb25zVG9VcGRhdGVbbmFtZV07XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHNjb3BlX1NwZWN0cnVtID0gbmV3T3B0aW9ucy5zcGVjdHJ1bTtcclxuXHJcblx0XHQvLyBJbnZhbGlkYXRlIHRoZSBjdXJyZW50IHBvc2l0aW9uaW5nIHNvIHZhbHVlU2V0IGZvcmNlcyBhbiB1cGRhdGUuXHJcblx0XHRzY29wZV9Mb2NhdGlvbnMgPSBbLTEsIC0xXTtcclxuXHRcdHZhbHVlU2V0KHYpO1xyXG5cclxuXHRcdGZvciAoIGkgPSAwOyBpIDwgc2NvcGVfSGFuZGxlcy5sZW5ndGg7IGkrKyApIHtcclxuXHRcdFx0ZmlyZUV2ZW50KCd1cGRhdGUnLCBpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHQvLyBUaHJvdyBhbiBlcnJvciBpZiB0aGUgc2xpZGVyIHdhcyBhbHJlYWR5IGluaXRpYWxpemVkLlxyXG5cdGlmICggc2NvcGVfVGFyZ2V0Lm5vVWlTbGlkZXIgKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1NsaWRlciB3YXMgYWxyZWFkeSBpbml0aWFsaXplZC4nKTtcclxuXHR9XHJcblxyXG5cdC8vIENyZWF0ZSB0aGUgYmFzZSBlbGVtZW50LCBpbml0aWFsaXNlIEhUTUwgYW5kIHNldCBjbGFzc2VzLlxyXG5cdC8vIEFkZCBoYW5kbGVzIGFuZCBsaW5rcy5cclxuXHRzY29wZV9CYXNlID0gYWRkU2xpZGVyKCBvcHRpb25zLmRpciwgb3B0aW9ucy5vcnQsIHNjb3BlX1RhcmdldCApO1xyXG5cdHNjb3BlX0hhbmRsZXMgPSBhZGRIYW5kbGVzKCBvcHRpb25zLmhhbmRsZXMsIG9wdGlvbnMuZGlyLCBzY29wZV9CYXNlICk7XHJcblxyXG5cdC8vIFNldCB0aGUgY29ubmVjdCBjbGFzc2VzLlxyXG5cdGFkZENvbm5lY3Rpb24gKCBvcHRpb25zLmNvbm5lY3QsIHNjb3BlX1RhcmdldCwgc2NvcGVfSGFuZGxlcyApO1xyXG5cclxuXHRpZiAoIG9wdGlvbnMucGlwcyApIHtcclxuXHRcdHBpcHMob3B0aW9ucy5waXBzKTtcclxuXHR9XHJcblxyXG5cdGlmICggb3B0aW9ucy50b29sdGlwcyApIHtcclxuXHRcdHRvb2x0aXBzKCk7XHJcblx0fVxyXG5cclxuXHRzY29wZV9TZWxmID0ge1xyXG5cdFx0ZGVzdHJveTogZGVzdHJveSxcclxuXHRcdHN0ZXBzOiBnZXRDdXJyZW50U3RlcCxcclxuXHRcdG9uOiBiaW5kRXZlbnQsXHJcblx0XHRvZmY6IHJlbW92ZUV2ZW50LFxyXG5cdFx0Z2V0OiB2YWx1ZUdldCxcclxuXHRcdHNldDogdmFsdWVTZXQsXHJcblx0XHR1cGRhdGVPcHRpb25zOiB1cGRhdGVPcHRpb25zXHJcblx0fTtcclxuXHJcblx0Ly8gQXR0YWNoIHVzZXIgZXZlbnRzLlxyXG5cdGV2ZW50cyggb3B0aW9ucy5ldmVudHMgKTtcclxuXHJcblx0cmV0dXJuIHNjb3BlX1NlbGY7XHJcblxyXG59XHJcblxyXG5cclxuXHQvLyBSdW4gdGhlIHN0YW5kYXJkIGluaXRpYWxpemVyXHJcblx0ZnVuY3Rpb24gaW5pdGlhbGl6ZSAoIHRhcmdldCwgb3JpZ2luYWxPcHRpb25zICkge1xyXG5cclxuXHRcdGlmICggIXRhcmdldC5ub2RlTmFtZSApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdub1VpU2xpZGVyLmNyZWF0ZSByZXF1aXJlcyBhIHNpbmdsZSBlbGVtZW50LicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRlc3QgdGhlIG9wdGlvbnMgYW5kIGNyZWF0ZSB0aGUgc2xpZGVyIGVudmlyb25tZW50O1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB0ZXN0T3B0aW9ucyggb3JpZ2luYWxPcHRpb25zLCB0YXJnZXQgKSxcclxuXHRcdFx0c2xpZGVyID0gY2xvc3VyZSggdGFyZ2V0LCBvcHRpb25zICk7XHJcblxyXG5cdFx0Ly8gVXNlIHRoZSBwdWJsaWMgdmFsdWUgbWV0aG9kIHRvIHNldCB0aGUgc3RhcnQgdmFsdWVzLlxyXG5cdFx0c2xpZGVyLnNldChvcHRpb25zLnN0YXJ0KTtcclxuXHJcblx0XHR0YXJnZXQubm9VaVNsaWRlciA9IHNsaWRlcjtcclxuXHRcdHJldHVybiBzbGlkZXI7XHJcblx0fVxyXG5cclxuXHQvLyBVc2UgYW4gb2JqZWN0IGluc3RlYWQgb2YgYSBmdW5jdGlvbiBmb3IgZnV0dXJlIGV4cGFuc2liaWxpdHk7XHJcblx0cmV0dXJuIHtcclxuXHRcdGNyZWF0ZTogaW5pdGlhbGl6ZVxyXG5cdH07XHJcblxyXG59KSk7IiwiLypcbkNvcHlyaWdodCAoYykgMjAxMCwyMDExLDIwMTIsMjAxMywyMDE0IE1vcmdhbiBSb2RlcmljayBodHRwOi8vcm9kZXJpY2suZGtcbkxpY2Vuc2U6IE1JVCAtIGh0dHA6Ly9tcmducmRyY2subWl0LWxpY2Vuc2Uub3JnXG5cbmh0dHBzOi8vZ2l0aHViLmNvbS9tcm9kZXJpY2svUHViU3ViSlNcbiovXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3Rvcnkpe1xuXHQndXNlIHN0cmljdCc7XG5cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKXtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpe1xuICAgICAgICAvLyBDb21tb25KU1xuICAgICAgICBmYWN0b3J5KGV4cG9ydHMpO1xuXG4gICAgfVxuXG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgdmFyIFB1YlN1YiA9IHt9O1xuICAgIHJvb3QuUHViU3ViID0gUHViU3ViO1xuICAgIGZhY3RvcnkoUHViU3ViKTtcbiAgICBcbn0oKCB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cgKSB8fCB0aGlzLCBmdW5jdGlvbiAoUHViU3ViKXtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBtZXNzYWdlcyA9IHt9LFxuXHRcdGxhc3RVaWQgPSAtMTtcblxuXHRmdW5jdGlvbiBoYXNLZXlzKG9iail7XG5cdFx0dmFyIGtleTtcblxuXHRcdGZvciAoa2V5IGluIG9iail7XG5cdFx0XHRpZiAoIG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpICl7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICpcdFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHRocm93cyB0aGUgcGFzc2VkIGV4Y2VwdGlvbiwgZm9yIHVzZSBhcyBhcmd1bWVudCBmb3Igc2V0VGltZW91dFxuXHQgKlx0QHBhcmFtIHsgT2JqZWN0IH0gZXggQW4gRXJyb3Igb2JqZWN0XG5cdCAqL1xuXHRmdW5jdGlvbiB0aHJvd0V4Y2VwdGlvbiggZXggKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24gcmVUaHJvd0V4Y2VwdGlvbigpe1xuXHRcdFx0dGhyb3cgZXg7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNhbGxTdWJzY3JpYmVyV2l0aERlbGF5ZWRFeGNlcHRpb25zKCBzdWJzY3JpYmVyLCBtZXNzYWdlLCBkYXRhICl7XG5cdFx0dHJ5IHtcblx0XHRcdHN1YnNjcmliZXIoIG1lc3NhZ2UsIGRhdGEgKTtcblx0XHR9IGNhdGNoKCBleCApe1xuXHRcdFx0c2V0VGltZW91dCggdGhyb3dFeGNlcHRpb24oIGV4ICksIDApO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGNhbGxTdWJzY3JpYmVyV2l0aEltbWVkaWF0ZUV4Y2VwdGlvbnMoIHN1YnNjcmliZXIsIG1lc3NhZ2UsIGRhdGEgKXtcblx0XHRzdWJzY3JpYmVyKCBtZXNzYWdlLCBkYXRhICk7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWxpdmVyTWVzc2FnZSggb3JpZ2luYWxNZXNzYWdlLCBtYXRjaGVkTWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyApe1xuXHRcdHZhciBzdWJzY3JpYmVycyA9IG1lc3NhZ2VzW21hdGNoZWRNZXNzYWdlXSxcblx0XHRcdGNhbGxTdWJzY3JpYmVyID0gaW1tZWRpYXRlRXhjZXB0aW9ucyA/IGNhbGxTdWJzY3JpYmVyV2l0aEltbWVkaWF0ZUV4Y2VwdGlvbnMgOiBjYWxsU3Vic2NyaWJlcldpdGhEZWxheWVkRXhjZXB0aW9ucyxcblx0XHRcdHM7XG5cblx0XHRpZiAoICFtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eSggbWF0Y2hlZE1lc3NhZ2UgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKHMgaW4gc3Vic2NyaWJlcnMpe1xuXHRcdFx0aWYgKCBzdWJzY3JpYmVycy5oYXNPd25Qcm9wZXJ0eShzKSl7XG5cdFx0XHRcdGNhbGxTdWJzY3JpYmVyKCBzdWJzY3JpYmVyc1tzXSwgb3JpZ2luYWxNZXNzYWdlLCBkYXRhICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlRGVsaXZlcnlGdW5jdGlvbiggbWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyApe1xuXHRcdHJldHVybiBmdW5jdGlvbiBkZWxpdmVyTmFtZXNwYWNlZCgpe1xuXHRcdFx0dmFyIHRvcGljID0gU3RyaW5nKCBtZXNzYWdlICksXG5cdFx0XHRcdHBvc2l0aW9uID0gdG9waWMubGFzdEluZGV4T2YoICcuJyApO1xuXG5cdFx0XHQvLyBkZWxpdmVyIHRoZSBtZXNzYWdlIGFzIGl0IGlzIG5vd1xuXHRcdFx0ZGVsaXZlck1lc3NhZ2UobWVzc2FnZSwgbWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyk7XG5cblx0XHRcdC8vIHRyaW0gdGhlIGhpZXJhcmNoeSBhbmQgZGVsaXZlciBtZXNzYWdlIHRvIGVhY2ggbGV2ZWxcblx0XHRcdHdoaWxlKCBwb3NpdGlvbiAhPT0gLTEgKXtcblx0XHRcdFx0dG9waWMgPSB0b3BpYy5zdWJzdHIoIDAsIHBvc2l0aW9uICk7XG5cdFx0XHRcdHBvc2l0aW9uID0gdG9waWMubGFzdEluZGV4T2YoJy4nKTtcblx0XHRcdFx0ZGVsaXZlck1lc3NhZ2UoIG1lc3NhZ2UsIHRvcGljLCBkYXRhLCBpbW1lZGlhdGVFeGNlcHRpb25zICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIG1lc3NhZ2VIYXNTdWJzY3JpYmVycyggbWVzc2FnZSApe1xuXHRcdHZhciB0b3BpYyA9IFN0cmluZyggbWVzc2FnZSApLFxuXHRcdFx0Zm91bmQgPSBCb29sZWFuKG1lc3NhZ2VzLmhhc093blByb3BlcnR5KCB0b3BpYyApICYmIGhhc0tleXMobWVzc2FnZXNbdG9waWNdKSksXG5cdFx0XHRwb3NpdGlvbiA9IHRvcGljLmxhc3RJbmRleE9mKCAnLicgKTtcblxuXHRcdHdoaWxlICggIWZvdW5kICYmIHBvc2l0aW9uICE9PSAtMSApe1xuXHRcdFx0dG9waWMgPSB0b3BpYy5zdWJzdHIoIDAsIHBvc2l0aW9uICk7XG5cdFx0XHRwb3NpdGlvbiA9IHRvcGljLmxhc3RJbmRleE9mKCAnLicgKTtcblx0XHRcdGZvdW5kID0gQm9vbGVhbihtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eSggdG9waWMgKSAmJiBoYXNLZXlzKG1lc3NhZ2VzW3RvcGljXSkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmb3VuZDtcblx0fVxuXG5cdGZ1bmN0aW9uIHB1Ymxpc2goIG1lc3NhZ2UsIGRhdGEsIHN5bmMsIGltbWVkaWF0ZUV4Y2VwdGlvbnMgKXtcblx0XHR2YXIgZGVsaXZlciA9IGNyZWF0ZURlbGl2ZXJ5RnVuY3Rpb24oIG1lc3NhZ2UsIGRhdGEsIGltbWVkaWF0ZUV4Y2VwdGlvbnMgKSxcblx0XHRcdGhhc1N1YnNjcmliZXJzID0gbWVzc2FnZUhhc1N1YnNjcmliZXJzKCBtZXNzYWdlICk7XG5cblx0XHRpZiAoICFoYXNTdWJzY3JpYmVycyApe1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICggc3luYyA9PT0gdHJ1ZSApe1xuXHRcdFx0ZGVsaXZlcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZXRUaW1lb3V0KCBkZWxpdmVyLCAwICk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqXHRQdWJTdWIucHVibGlzaCggbWVzc2FnZVssIGRhdGFdICkgLT4gQm9vbGVhblxuXHQgKlx0LSBtZXNzYWdlIChTdHJpbmcpOiBUaGUgbWVzc2FnZSB0byBwdWJsaXNoXG5cdCAqXHQtIGRhdGE6IFRoZSBkYXRhIHRvIHBhc3MgdG8gc3Vic2NyaWJlcnNcblx0ICpcdFB1Ymxpc2hlcyB0aGUgdGhlIG1lc3NhZ2UsIHBhc3NpbmcgdGhlIGRhdGEgdG8gaXQncyBzdWJzY3JpYmVyc1xuXHQqKi9cblx0UHViU3ViLnB1Ymxpc2ggPSBmdW5jdGlvbiggbWVzc2FnZSwgZGF0YSApe1xuXHRcdHJldHVybiBwdWJsaXNoKCBtZXNzYWdlLCBkYXRhLCBmYWxzZSwgUHViU3ViLmltbWVkaWF0ZUV4Y2VwdGlvbnMgKTtcblx0fTtcblxuXHQvKipcblx0ICpcdFB1YlN1Yi5wdWJsaXNoU3luYyggbWVzc2FnZVssIGRhdGFdICkgLT4gQm9vbGVhblxuXHQgKlx0LSBtZXNzYWdlIChTdHJpbmcpOiBUaGUgbWVzc2FnZSB0byBwdWJsaXNoXG5cdCAqXHQtIGRhdGE6IFRoZSBkYXRhIHRvIHBhc3MgdG8gc3Vic2NyaWJlcnNcblx0ICpcdFB1Ymxpc2hlcyB0aGUgdGhlIG1lc3NhZ2Ugc3luY2hyb25vdXNseSwgcGFzc2luZyB0aGUgZGF0YSB0byBpdCdzIHN1YnNjcmliZXJzXG5cdCoqL1xuXHRQdWJTdWIucHVibGlzaFN5bmMgPSBmdW5jdGlvbiggbWVzc2FnZSwgZGF0YSApe1xuXHRcdHJldHVybiBwdWJsaXNoKCBtZXNzYWdlLCBkYXRhLCB0cnVlLCBQdWJTdWIuaW1tZWRpYXRlRXhjZXB0aW9ucyApO1xuXHR9O1xuXG5cdC8qKlxuXHQgKlx0UHViU3ViLnN1YnNjcmliZSggbWVzc2FnZSwgZnVuYyApIC0+IFN0cmluZ1xuXHQgKlx0LSBtZXNzYWdlIChTdHJpbmcpOiBUaGUgbWVzc2FnZSB0byBzdWJzY3JpYmUgdG9cblx0ICpcdC0gZnVuYyAoRnVuY3Rpb24pOiBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgbmV3IG1lc3NhZ2UgaXMgcHVibGlzaGVkXG5cdCAqXHRTdWJzY3JpYmVzIHRoZSBwYXNzZWQgZnVuY3Rpb24gdG8gdGhlIHBhc3NlZCBtZXNzYWdlLiBFdmVyeSByZXR1cm5lZCB0b2tlbiBpcyB1bmlxdWUgYW5kIHNob3VsZCBiZSBzdG9yZWQgaWZcblx0ICpcdHlvdSBuZWVkIHRvIHVuc3Vic2NyaWJlXG5cdCoqL1xuXHRQdWJTdWIuc3Vic2NyaWJlID0gZnVuY3Rpb24oIG1lc3NhZ2UsIGZ1bmMgKXtcblx0XHRpZiAoIHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKXtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBtZXNzYWdlIGlzIG5vdCByZWdpc3RlcmVkIHlldFxuXHRcdGlmICggIW1lc3NhZ2VzLmhhc093blByb3BlcnR5KCBtZXNzYWdlICkgKXtcblx0XHRcdG1lc3NhZ2VzW21lc3NhZ2VdID0ge307XG5cdFx0fVxuXG5cdFx0Ly8gZm9yY2luZyB0b2tlbiBhcyBTdHJpbmcsIHRvIGFsbG93IGZvciBmdXR1cmUgZXhwYW5zaW9ucyB3aXRob3V0IGJyZWFraW5nIHVzYWdlXG5cdFx0Ly8gYW5kIGFsbG93IGZvciBlYXN5IHVzZSBhcyBrZXkgbmFtZXMgZm9yIHRoZSAnbWVzc2FnZXMnIG9iamVjdFxuXHRcdHZhciB0b2tlbiA9ICd1aWRfJyArIFN0cmluZygrK2xhc3RVaWQpO1xuXHRcdG1lc3NhZ2VzW21lc3NhZ2VdW3Rva2VuXSA9IGZ1bmM7XG5cblx0XHQvLyByZXR1cm4gdG9rZW4gZm9yIHVuc3Vic2NyaWJpbmdcblx0XHRyZXR1cm4gdG9rZW47XG5cdH07XG5cblx0LyogUHVibGljOiBDbGVhcnMgYWxsIHN1YnNjcmlwdGlvbnNcblx0ICovXG5cdFB1YlN1Yi5jbGVhckFsbFN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbiBjbGVhckFsbFN1YnNjcmlwdGlvbnMoKXtcblx0XHRtZXNzYWdlcyA9IHt9O1xuXHR9O1xuXG5cdC8qUHVibGljOiBDbGVhciBzdWJzY3JpcHRpb25zIGJ5IHRoZSB0b3BpY1xuXHQqL1xuXHRQdWJTdWIuY2xlYXJTdWJzY3JpcHRpb25zID0gZnVuY3Rpb24gY2xlYXJTdWJzY3JpcHRpb25zKHRvcGljKXtcblx0XHR2YXIgbTsgXG5cdFx0Zm9yIChtIGluIG1lc3NhZ2VzKXtcblx0XHRcdGlmIChtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eShtKSAmJiBtLmluZGV4T2YodG9waWMpID09PSAwKXtcblx0XHRcdFx0ZGVsZXRlIG1lc3NhZ2VzW21dO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvKiBQdWJsaWM6IHJlbW92ZXMgc3Vic2NyaXB0aW9ucy5cblx0ICogV2hlbiBwYXNzZWQgYSB0b2tlbiwgcmVtb3ZlcyBhIHNwZWNpZmljIHN1YnNjcmlwdGlvbi5cblx0ICogV2hlbiBwYXNzZWQgYSBmdW5jdGlvbiwgcmVtb3ZlcyBhbGwgc3Vic2NyaXB0aW9ucyBmb3IgdGhhdCBmdW5jdGlvblxuXHQgKiBXaGVuIHBhc3NlZCBhIHRvcGljLCByZW1vdmVzIGFsbCBzdWJzY3JpcHRpb25zIGZvciB0aGF0IHRvcGljIChoaWVyYXJjaHkpXG5cdCAqXG5cdCAqIHZhbHVlIC0gQSB0b2tlbiwgZnVuY3Rpb24gb3IgdG9waWMgdG8gdW5zdWJzY3JpYmUuXG5cdCAqXG5cdCAqIEV4YW1wbGVzXG5cdCAqXG5cdCAqXHRcdC8vIEV4YW1wbGUgMSAtIHVuc3Vic2NyaWJpbmcgd2l0aCBhIHRva2VuXG5cdCAqXHRcdHZhciB0b2tlbiA9IFB1YlN1Yi5zdWJzY3JpYmUoJ215dG9waWMnLCBteUZ1bmMpO1xuXHQgKlx0XHRQdWJTdWIudW5zdWJzY3JpYmUodG9rZW4pO1xuXHQgKlxuXHQgKlx0XHQvLyBFeGFtcGxlIDIgLSB1bnN1YnNjcmliaW5nIHdpdGggYSBmdW5jdGlvblxuXHQgKlx0XHRQdWJTdWIudW5zdWJzY3JpYmUobXlGdW5jKTtcblx0ICpcblx0ICpcdFx0Ly8gRXhhbXBsZSAzIC0gdW5zdWJzY3JpYmluZyBhIHRvcGljXG5cdCAqXHRcdFB1YlN1Yi51bnN1YnNjcmliZSgnbXl0b3BpYycpO1xuXHQgKi9cblx0UHViU3ViLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24odmFsdWUpe1xuXHRcdHZhciBpc1RvcGljICAgID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eSh2YWx1ZSksXG5cdFx0XHRpc1Rva2VuICAgID0gIWlzVG9waWMgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcblx0XHRcdGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicsXG5cdFx0XHRyZXN1bHQgPSBmYWxzZSxcblx0XHRcdG0sIG1lc3NhZ2UsIHQ7XG5cblx0XHRpZiAoaXNUb3BpYyl7XG5cdFx0XHRkZWxldGUgbWVzc2FnZXNbdmFsdWVdO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZvciAoIG0gaW4gbWVzc2FnZXMgKXtcblx0XHRcdGlmICggbWVzc2FnZXMuaGFzT3duUHJvcGVydHkoIG0gKSApe1xuXHRcdFx0XHRtZXNzYWdlID0gbWVzc2FnZXNbbV07XG5cblx0XHRcdFx0aWYgKCBpc1Rva2VuICYmIG1lc3NhZ2VbdmFsdWVdICl7XG5cdFx0XHRcdFx0ZGVsZXRlIG1lc3NhZ2VbdmFsdWVdO1xuXHRcdFx0XHRcdHJlc3VsdCA9IHZhbHVlO1xuXHRcdFx0XHRcdC8vIHRva2VucyBhcmUgdW5pcXVlLCBzbyB3ZSBjYW4ganVzdCBzdG9wIGhlcmVcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChpc0Z1bmN0aW9uKSB7XG5cdFx0XHRcdFx0Zm9yICggdCBpbiBtZXNzYWdlICl7XG5cdFx0XHRcdFx0XHRpZiAobWVzc2FnZS5oYXNPd25Qcm9wZXJ0eSh0KSAmJiBtZXNzYWdlW3RdID09PSB2YWx1ZSl7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBtZXNzYWdlW3RdO1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG59KSk7XG4iLCJ2YXIgc2kgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nLCB0aWNrO1xuaWYgKHNpKSB7XG4gIHRpY2sgPSBmdW5jdGlvbiAoZm4pIHsgc2V0SW1tZWRpYXRlKGZuKTsgfTtcbn0gZWxzZSB7XG4gIHRpY2sgPSBmdW5jdGlvbiAoZm4pIHsgc2V0VGltZW91dChmbiwgMCk7IH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGljazsiXX0=
