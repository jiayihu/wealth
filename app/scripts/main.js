'use strict';

/**
 * Including JS Partials
 */

(function (window) {
	'use strict';

	/**
	 * 	JQUERY FUNCTIONS
	 */

	// Get element(s) by CSS selector:
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	// addEventListener wrapper:
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	// Attach a handler to event for all elements that match the selector,
	// now or in the future, based on a root element
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target;
			var potentialElements = window.qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};

	// Find the element's parent with the given tag name:
	// $parent(qs('a'), 'div');
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	/**
	 * [function description]
	 * @param  {Function} callback Callback
	 */
	window.$ready = function(callback) {
		if(document.readyState !== 'loading') {
			callback();
		} else {
			document.addEventListener('DOMContentLoaded', callback);
		}
	};

	/**
	 * 	NO JQUERY FUNCTIONS
	 */

	/**
	 * Throws a new Error
	 */
	window.makeError = function(name, msg, data) {
		var error = new Error();
		error.name = name;
		error.msg = msg;
		if(data) {
			error.data = data;
		}
		return error;
	};

	/**
	 * Create a slider using noUiSlider
	 * @param  {DOM Node} element HTML Node of the slider
	 * @param  {object} options Slider options
	 */
	window.createSlider = function(element, options) {
		if(typeof noUiSlider === 'undefined') {
			window.makeError('Nouislider', 'nouislider object is not declared.');
		}
		noUiSlider.create(element, options);
		element.handle = element.getElementsByClassName('noUi-handle')[0];
		element.tooltip = document.createElement('div');
		element.handle.appendChild(element.tooltip);

		element.tooltip.classList.add('slider-tooltip');
		element.tooltip.innerHTML = '<span></span>';
		element.tooltip = element.tooltip.firstElementChild;
	};

	/**
	 * Set the configMap of the module - It goes deep in the object
	 */
	 window.setConfigMap = function(inputMap, configMap) {
 	  var key;

 	  for(key in inputMap) {
 	    if(inputMap.hasOwnProperty(key)) {
 	      if(inputMap[key] instanceof Object) {
 	        window.setConfigMap(inputMap[key], configMap[key]);
 	      } else {
 	        configMap[key] = inputMap[key];
 	      }
 	    }
 	  }
 	};

	// Allow for looping on nodes by chaining and using forEach on both Nodelists and HTMLCollections
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
	HTMLCollection.prototype.forEach = Array.prototype.forEach;
})(window);


(function (window) {
	'use strict';

  var defaultModel = {
    aboutAge: 20,
    aboutSituation: 'married',
    aboutLiving: 'rent',
    aboutIncome: 60000,
    aboutBasicRate: 45,
    aboutDiscretionaryRate: 25,
    aboutSavingsRate: 30,
    //aboutStage: 'home',
    basicNeeds: 27000,
    discretionaryExpenses: 15000,
    savings: 18000,
    pickedGoals: [],
    savedActions: []
  };

	/**
	 * Creates a new Model instance which saves data on local storage.
	 * @param {string} name The name of the localstorage
	 */
	var Model = function(name) {
    this._dbName = name;

    if(typeof Storage === undefined) {
      window.makeError('localStorage support', 'Error: localStorage is not supported.');
      return;
    }

		if(!localStorage[name]) {
			var data = {
				user: defaultModel
			};

			localStorage[name] = JSON.stringify(data);
		}
	};

  /**
   * Returns the value of the property in the model.
   * @param  {string} property The name of the property
   */
  Model.prototype.read = function(property) {
    var data = JSON.parse(localStorage[this._dbName]);
    var user = data.user;

    if(typeof property === 'undefined') {
			return user;
		}

		return user[property];
  };

	/**
	 * Updates model by giving it the property name and its value.
	 * @param  {string} property   The name of the property to update
	 * @param  {object} updateData The new value of the property
	 */
	Model.prototype.update = function (property, updateData) {
	   var data = JSON.parse(localStorage[this._dbName]);
     var user = data.user;

     user[property] = updateData;

     localStorage[this._dbName] = JSON.stringify(data);
	};

	/**
	 * Update basic needs, discretionary and savings actual values based on rates
	 */
	Model.prototype.updateMoneyValues = function() {
		var data = JSON.parse(localStorage[this._dbName]);
    var user = data.user;

		user.basicNeeds = user.aboutIncome * user.aboutBasicRate * 0.01;
		user.discretionaryExpenses = user.aboutIncome * user.aboutDiscretionaryRate * 0.01;
		user.savings = user.aboutIncome * user.aboutSavingsRate * 0.01;

		localStorage[this._dbName] = JSON.stringify(data);
	};

	/**
	 * Update the array of picked goals adding or removing the goal
	 * @param  {object} goal The goal to remove or add to the list
	 */
	Model.prototype.toggleGoal = function(goal) {
		var data = JSON.parse(localStorage[this._dbName]);
		var goals = data.user.pickedGoals;

		var i = 0, alreadyPicked = false;
		for(i = 0; i < goals.length && !alreadyPicked; i++) {
			if(goals[i].name === goal.name) {
				goals.splice(i, 1);
				alreadyPicked = true;
			}
		}

		if(!alreadyPicked) {
			goals.push(goal);
		}

		localStorage[this._dbName] = JSON.stringify(data);
	};

	/**
	 * Update the array of saved adding or removing the goal
	 * @param  {object} action The action to remove or add to the list
	 */
	Model.prototype.toggleActions = function(action) {
		var data = JSON.parse(localStorage[this._dbName]);
		var actions = data.user.savedActions;

		var i = 0, alreadySaved = false;
		for(i = 0; i < actions.length && !alreadySaved; i++) {
			if(actions[i].id === action.id) {
				actions.splice(i, 1);
				alreadySaved = true;
			}
		}

		if(!alreadySaved) {
			actions.push(action);
		}

		localStorage[this._dbName] = JSON.stringify(data);
	};

	/**
	 * [remove description]
	 * @param  {string} property The name of the property to be removed from model.
	 */
	Model.prototype.remove = function (property) {
    var data = JSON.parse(localStorage[this._dbName]);
    var user = data.user;

    delete user[property];

    localStorage[this._dbName] = JSON.stringify(data);
	};

	/**
	 * WARNING: Will remove ALL data from storage.
	 */
	Model.prototype.reset = function () {
		localStorage[this._dbName] = JSON.stringify({ user: defaultModel });
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);


/* Templates */
var app = window.app || {};

app.views = {};


app.views.about = (function(window) {
  var configMap = {
    ageSlider: 'about__age__slider',
    incomeSlider: 'about__income__slider',
    ageOptions: {
      start: 35,
      step: 1,
      range: {'min': 18, 'max': 65},
      pips: {mode: 'values', values: [20, 30, 40, 50, 60, 65], density: 5},
      format: wNumb({decimals: 1, thousand: '.'})
    },
    incomeOptions: {
      start: 60000,
      step: 1000,
      range: {'min': 18000, 'max': 200000},
      format: wNumb({decimals: 1, thousand: '.'})
    },
    optionLists: 'about__select'
  };

  var ageSlider, incomeSlider,
      situation, living;

  /**
   * DOM FUNCTIONS
   */

  var createSliders = function() {
    window.createSlider(ageSlider, configMap.ageOptions);
    window.createSlider(incomeSlider, configMap.incomeOptions);
  };

  var onSliderUpdate = function(slider, values) {
    var tooltip = slider.getElementsByTagName('span')[0];
    if(slider.classList.contains(configMap.incomeSlider)) {
      tooltip.innerHTML = '$' + values[0];
    } else {
      tooltip.innerHTML = values[0];
    }
  };

  /**
   * EVENT HANDLERS
   */

  var sliderDOMEvents = function() {
    ageSlider.noUiSlider.on('update', function(values) {
      onSliderUpdate(ageSlider, values);
    });
    incomeSlider.noUiSlider.on('update', function(values) {
      onSliderUpdate(incomeSlider, values);
    });
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var bind = function(event, handler) {
    if(event === 'ageChanged') {
      ageSlider.noUiSlider.on('change', function(values) {
        handler( parseInt(values[0]) );
      });
    } else if(event === 'incomeChanged') {
      incomeSlider.noUiSlider.on('change', function(values) {
        handler( parseInt(values[0].replace('.', '')) );
      });
    } else if(event === 'situationChanged') {
      situation.addEventListener('change', function(event){
        handler(event.target.value);
      });
    } else if(event === 'livingChanged') {
      living.addEventListener('change', function(event){
        handler(event.target.value);
      });
    }
  };

  var configModule = function(inputMap) {
    window.setConfigMap(inputMap, configMap);
  };

  var init = function(container) {
    //DOM elements
    ageSlider = container.getElementsByClassName(configMap.ageSlider)[0];
    incomeSlider = container.getElementsByClassName(configMap.incomeSlider)[0];
    situation = container.getElementsByClassName('about__select')[0];
    living = container.getElementsByClassName('about__select')[1];

    createSliders();
    sliderDOMEvents();
  };

  return {
    bind: bind,
    configModule: configModule,
    init: init
  };

})(window);

app.views.you = (function(window) {
  var configMap = {
    income: 60000,
    needsSlider: 'about__savings__slider--needs',
    expensesSlider: 'about__savings__slider--expenses',
    //Slider options
    needsOptions: {
      start: 45,
      step: 1,
      range: {'min': 1, 'max': 60},
      format: wNumb({decimals: 0})
    },
    expensesOptions: {
      start: 25,
      step: 1,
      range: {'min': 1, 'max': 40},
      format: wNumb({decimals: 0})
    },
    //Doughnut options
    doughnutClass: 'about__savings__circle',
    doughnutData: {
        series: [{value: 45, name: 'Basic Needs'}, {value: 25,name: 'Discretionary'}]
    },
    doughnutOptions: {
        donut: true,
        donutWidth: 20,
        chartPadding: 10,
        labelOffset: 50,
        width: '220px',
        height: '220px'
      },
    doughnutResponsiveOptions: [
        ['screen and (max-width: 480px)', {
          width: '170px',
          height: '170px'
        }]
      ]
  };

  var $pieChart, needsSlider, expensesSlider,
      income;

  /**
   * DOM FUNCTIONS
   */

  var animateDoughnut = function($pieChart) {
    $pieChart.on('draw', function(data) {
      if(data.type === 'slice') {
        var pathLength = data.element._node.getTotalLength();
        data.element.attr({
          'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
        });
        var animationDefinition = {
          'stroke-dashoffset': {
            id: 'anim' + data.index,
            dur: 1000,
            from: -pathLength + 'px',
            to:  '0px',
            easing: Chartist.Svg.Easing.easeOutQuint,
            fill: 'freeze'
          }
        };

        if(data.index !== 0) {
          animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
        }

        data.element.attr({
          'stroke-dashoffset': -pathLength + 'px'
        });
        data.element.animate(animationDefinition, false);
      }
    });
  };

  var createDoughnutTooltip = function() {
    var $chart = $('.' + configMap.doughnutClass),
      $toolTip = $chart
        .append('<div class="pie-tooltip"></div>')
        .find('.pie-tooltip')
        .hide(),
      moneyFormat = wNumb({
        thousand: '.',
        prefix: '$ '
      });

    var isTooltipShown = false;

    $chart.on('mouseenter', '.ct-slice-donut', function() {
      var $slice = $(this),
        value = $slice.attr('ct:value'),
        seriesName = $slice.parent().attr('ct:series-name');
      $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
      moneyFormat.to(parseInt(value)/100 * configMap.income ) ).show();
    });

    //For mobiles
    $chart.on('click', '.ct-slice-donut', function() {
      if(!isTooltipShown) {
        var $slice = $(this),
          value = $slice.attr('ct:value'),
          seriesName = $slice.parent().attr('ct:series-name');
        $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
        moneyFormat.to(parseInt(value)/100 * configMap.income ) ).show();
        isTooltipShown = true;
      } else {
        $toolTip.hide();
        isTooltipShown = false;
      }
    });

    $chart.on('mouseleave', '.ct-slice-donut', function() {
      $toolTip.hide();
    });

    $chart.on('mousemove', function(event) {
      $toolTip.css({
        left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
        top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 30
      });
    });
  };

  var createChart = function(htmlNode) {
    configMap.doughnutData.series[2] = {
      value: 100 - configMap.doughnutData.series[0].value - configMap.doughnutData.series[1].value,
      name: 'Savings'
    };

    $pieChart = new Chartist.Pie(htmlNode,
    configMap.doughnutData,
    configMap.doughnutOptions,
    configMap.doughnutResponsiveOptions);

    animateDoughnut($pieChart);
    createDoughnutTooltip();

  };

  /**
   * EVENT HANDLERS
   */

  var showSliderTooltip = function(slider, values) {
    var tooltip = slider.getElementsByTagName('span')[0];
    tooltip.innerHTML = values[0] + '%';
  };


  /**
   * Update the view of the Doughnut when sliders value change
   * @param {string} slider The name of the slider which changed
   */
  var updateDOMDoughnut = function(slider, values) {
    if(slider === 'needsSlider') {
      configMap.doughnutData.series[0].value = parseInt(values[0]);
    } else {
      configMap.doughnutData.series[1].value = parseInt(values[0]);
    }
    configMap.doughnutData.series[2].value = 100 - configMap.doughnutData.series[0].value - configMap.doughnutData.series[1].value;
    $pieChart.update();
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var bind = function(event, handler) {
    if(event === 'basicNeedsChanged') {
      needsSlider.noUiSlider.on('change', function(values){
        updateDOMDoughnut('needsSlider', values);
        handler(configMap.doughnutData.series[0].value, configMap.doughnutData.series[2].value);
      });
    } else if(event === 'expensesChanged') {
      expensesSlider.noUiSlider.on('change', function(values){
        updateDOMDoughnut('expensesSlider', values);
        handler(configMap.doughnutData.series[1].value, configMap.doughnutData.series[2].value);
      });
    }
  };

  var configModule = function(inputMap) {
    window.setConfigMap(inputMap, configMap);
  };

  var init = function(container) {
    needsSlider = container.getElementsByClassName(configMap.needsSlider)[0];
    expensesSlider = container.getElementsByClassName(configMap.expensesSlider)[0];

    //Create sliders
    window.createSlider(needsSlider, configMap.needsOptions);
    needsSlider.noUiSlider.on('update', function(values) {
      showSliderTooltip(needsSlider, values);
    });

    window.createSlider(expensesSlider, configMap.expensesOptions);
    expensesSlider.noUiSlider.on('update', function(values) {
      showSliderTooltip(expensesSlider, values);
    });

    //Init Doughnut Chart
    var doughnutHtml = container.getElementsByClassName(configMap.doughnutClass)[0];
    createChart(doughnutHtml);
  };

  return {
    bind: bind,
    configModule: configModule,
    init: init
  };

})(window);

app.views.pyramid = (function() {
  var configMap = {
    savingsId: '#pyramid-savings',
    basicId: '#pyramid-basic',
    discretiotionaryId: '#pyramid-discretionary',
    incomeId: '#pyramid-income',
    basic: 0,
    savings: 0,
    discretionary: 0,
    income: 0
  };

  var savingsText, basicText, discretionaryText, incomeText;

  /**
   * DOM FUNCTIONS
   */

  var updateLabels = function() {
    var moneyFormat = wNumb({
      thousand: '.',
      prefix: '$ '
    });

    savingsText.textContent = ' ' + moneyFormat.to( wealthApp.model.read('savings') ) + '/yr';
    basicText.textContent = moneyFormat.to( wealthApp.model.read('basicNeeds') ) + '/yr';
    discretionaryText.textContent = moneyFormat.to( wealthApp.model.read('discretionaryExpenses') ) + '/yr';
    incomeText.textContent = moneyFormat.to( wealthApp.model.read('aboutIncome') ) + '/yr';
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var configModule = function(inputMap) {
    window.setConfigMap(inputMap, configMap);
  };

  var init = function(container) {
    savingsText = container.querySelector(configMap.savingsId);
    basicText = container.querySelector(configMap.basicId);
    discretionaryText = container.querySelector(configMap.discretiotionaryId);
    incomeText = container.querySelector(configMap.incomeId);

    updateLabels();
  };

  return {
    configModule: configModule,
    init: init,
    updateLabels: updateLabels
  };

})();

app.views.scenarios = (function(window) {
  var configMap = {
    //Sliders options
    savingRateSlider: 'option__slider--saving',
    incomeRateSlider: 'option__slider--income',
    savingRateOptions: {
      start: 40,
      step: 1,
      range: {'min': 1, 'max': 100},
      format: wNumb({ decimals: 0})
    },
    incomeOptions: {
      start: 60000,
      step: 1000,
      range: {'min': 18000, 'max': 200000},
      format: wNumb({decimals: 1, thousand: '.'})
    },
    //Line chart options
    chartClass: '.scenario__chart',
    chartData: {
      labels: [18, 25, 35, 45, 55, 65],
      series: []
    },
    chartOptions: {
      showArea: true,
      width: '410px',
      height: '250px',
      plugins: [
        Chartist.plugins.ctAxisTitle({
          axisX: {
            axisTitle: 'Age',
            axisClass: 'ct-axis-age',
            offset: {x: 0, y: 35},
            textAnchor: 'middle'
          },
          axisY: {
            axisTitle: 'Savings ($)',
            axisClass: 'ct-axis-savings',
            offset: {x: 0, y: 20},
            textAnchor: 'middle'
          }
        })
      ]
    }
  };

  var savingRateSlider, incomeRateSlider,
      lineChart;

  /**
   * DOM FUNCTIONS
   */

   var createLineChart = function(htmlNode, data, options) {
     lineChart = new Chartist.Line(htmlNode, data, options);
   };

   /**
    * EVENT HANDLERS
    */

  var sliderEventHandler = function(slider, values) {
    var tooltip = slider.getElementsByTagName('span')[0];
    if(slider.classList.contains(configMap.savingRateSlider)) {
      tooltip.innerHTML = values[0] + '%';
    } else {
      tooltip.innerHTML = '$' + values[0];
    }
  };

  var updateLineChart = function() {
    savingRateSlider.noUiSlider.on('change', function( values ){
      var savings = wealthApp.model.read('aboutIncome');
      for(var i=0; i < configMap.chartData.series[0].length; i++) {
        configMap.chartData.series[0][i] = parseInt(values[0]) * 0.01 * savings * (configMap.chartData.labels[i] - 18);
      }
      lineChart.update(configMap.chartData);
    });
    incomeRateSlider.noUiSlider.on('change', function( values ){
      var savingRate =savingRateSlider.noUiSlider.get();
      for(var i=0; i < configMap.chartData.series[0].length; i++) {
        configMap.chartData.series[0][i] = savingRate * 0.01 * parseInt(values[0].replace('.', '')) * (configMap.chartData.labels[i] - 18);
      }
      lineChart.update(configMap.chartData);
    });
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var calculateSeries = function() {
    var savings = wealthApp.model.read('savings');
    configMap.chartData.series[0] = [savings * 1, savings * 7, savings * 17, savings * 27, savings * 37, savings * 47];
    return configMap.chartData.series[0];
  };

  var configModule = function(inputMap) {
    window.setConfigMap(inputMap, configMap);
  };

  var init = function(container) {
    configMap.savingRateOptions.start = wealthApp.model.read('aboutSavingsRate');
    configMap.incomeOptions.start = wealthApp.model.read('aboutIncome');

    savingRateSlider = container.getElementsByClassName(configMap.savingRateSlider)[0];
    incomeRateSlider = container.getElementsByClassName(configMap.incomeRateSlider)[0];

    //Sliders
    window.createSlider(savingRateSlider, configMap.savingRateOptions);
    savingRateSlider.noUiSlider.on('update', function(values) {
      sliderEventHandler(savingRateSlider, values);
    });

    window.createSlider(incomeRateSlider, configMap.incomeOptions);
    incomeRateSlider.noUiSlider.on('update', function(values) {
      sliderEventHandler(incomeRateSlider, values);
    });

    //Line Chart
    calculateSeries();
    createLineChart(configMap.chartClass, configMap.chartData, configMap.chartOptions);
    updateLineChart();
  };

  return {
    calculateSeries: calculateSeries,
    configModule: configModule,
    init: init
  };

})(window);

app.views.goal = (function() {
  var configMap = {
    tooltipsClass: '.goal__details > span',
    addButtonsClass: 'add-goal',
    deleteButtonsClass: 'delete-goal',
    pickedGoalsClass: 'picked-goals',
    datepickerClass: '.goal__date__picker'
  };

  var container;

  /**
   * DOM FUNCTIONS
   */

  var displayPickedGoal = function() {
    var picked = this.dataset.picked;
    var pickedGoal = container.getElementsByClassName('picked--' + picked)[0];
    pickedGoal.classList.add('picked--show');
    container.getElementsByClassName('goal--' + picked)[0].classList.add('goal--hide');
    var date = pickedGoal.querySelector(configMap.datepickerClass).value;
    wealthApp.model.toggleGoal({
      name: picked,
      date: date
    });
  };

  var hidePickedGoal = function() {
    var goal = this.dataset.goal;
    var removedGoal = container.getElementsByClassName('picked--' + goal)[0];
    removedGoal.classList.remove('picked--show');
    container.getElementsByClassName('goal--' + goal)[0].classList.remove('goal--hide');
    wealthApp.model.toggleGoal({
      name: goal
    });
  };

  /**
   * PUBLIC FUNCTIONS
   */

  var init = function(initContainer) {
    container = initContainer;
    //Create tooltips
    $(configMap.tooltipsClass).tooltip();

    //Buttons to add and delete goals
    var addButtons = container.getElementsByClassName(configMap.addButtonsClass);
    Array.prototype.forEach.call(addButtons, function(element) {
      element.addEventListener('click', displayPickedGoal);
    });

    var deleteButtons = container.getElementsByClassName(configMap.deleteButtonsClass);
    Array.prototype.forEach.call(deleteButtons, function(element) {
      element.addEventListener('click', hidePickedGoal);
    });

    //Implement drag & drop picked goals
    var pickedContainer = container.getElementsByClassName(configMap.pickedGoalsClass)[0];
    dragula([pickedContainer]);

    //Datepicker
    $(configMap.datepickerClass).datepicker({
      autoclose: true,
      format: 'M d yyyy'
    });
  };

  return {
    init: init
  };

})();

app.views.retirement = (function() {
  var configMap = {
    jsonUrl: 'scripts/model/actions.json'
  };

  /**
   * DOM FUNCTIONS
   */

   var createActions = function(data) {
     var docFragment = document.createDocumentFragment(),
     row;

     data.actions.forEach(function(element, index) {
       row = document.createElement('tr');
       row.innerHTML = '<td><i class="zmdi zmdi-check-circle" data-action="' + index + '"></i></td>' +
         '<td>' + element.todo + '</td>' +
         '<td>' + element.todonot + '</td>' +
         '<td><i class="zmdi zmdi-info-outline" data-toggle="tooltip" data-placement="left" title="' + element.why + '"></i></td>';
         docFragment.appendChild(row);
     });
     return docFragment;
   };

   /**
    * EVENT HANDLERS
    */

  /**
   * PUBLIC FUNCTIONS
   */

  var init = function(container) {
    var request = new XMLHttpRequest();
    request.open('GET', configMap.jsonUrl, true);
    request.onload = function() {
      if(request.status >=200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        var tbody = container.getElementsByTagName('tbody')[0];
        tbody.appendChild(createActions(data));
        var checks = container.getElementsByClassName('zmdi-check-circle');
        checks.forEach(function(element) {
          element.addEventListener('click', function() {
            this.classList.toggle('saved');
            wealthApp.model.toggleActions(data.actions[parseInt(this.dataset.action)]);
          });
        });
        //Tooltips
        $('.retirement-wrapper .zmdi-info-outline').tooltip();
      } else {
        console.log('Error with the connection.');
      }
    };
    request.onerror = function() {
      console.log('Error with the connection.');
    };
    request.send();
  };

  return {
    init: init
  };

})();

app.views.plan = (function() {
  var configMap = {
    actionTitleClasses: 'action__title',
    popoverClasses: '.plan-wrapper .zmdi-info-outline',
    datepickerClasses: '.plan-wrapper .zmdi-calendar-alt'
  };

  /**
   * DOM FUNCTIONS
   */

  var printPlan = function() {
    var printPage = document.createElement('div'),
      html = '<h1 class="text-center">Your Action Plan</h1>';

    printPage.classList.add('print-page');

    var planActions = [
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      },
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      },
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      },
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      },
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      }
    ];

    var tHead = '<table class="table"><thead><tr><th>Title</th><th>type</th><th>Date</th><th>Details</th></tr></thead>',
      tBody = '<tbody>';

      for(var i = 0; i < planActions.length; i++) {
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

  /**
   * PUBLIC FUNCTIONS
   */

  var init = function(container) {

    //Popover
    $(configMap.popoverClasses).popover({
      placement: 'left'
    });

    //Datepickers
    $(configMap.datepickerClasses)
      .datepicker({
        autoclose: true,
        format: 'M d yyyy'
      })
      .on('changeDate', function(event) {
        this.dataset.date = event.format();
      });

    var printButton = container.getElementsByClassName('print')[0];
    printButton.addEventListener('click', printPlan);

    var actionTitles = container.getElementsByClassName(configMap.actionTitleClasses);
    actionTitles.forEach(function(element) {
      element.addEventListener('click', function() {
        this.firstElementChild.classList.toggle('rotate');
      });
    });
  };

  return {
    init: init
  };

})();


/* Components */
(function() {
  var setActive = function(newActive, className) {
    var oldActive = document.getElementsByClassName(className)[0];
    oldActive.classList.remove(className);
    newActive.classList.add(className);
  };

  var onNavClick = function(e) {
    var nodeName = e.target.nodeName,
      nextStep, nextStepElement, clickedLink;
    if (nodeName === 'SPAN') {
      nextStep = e.target.dataset.template;
      clickedLink = e.target.parentNode;
    } else if (nodeName === 'LI') {
      nextStep = e.target.firstElementChild.dataset.template;
      clickedLink = e.target;
    }
    // if(!clickedLink.classList.contains('disabled')) {
      setActive(clickedLink, 'active');
      nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];
      setActive(nextStepElement, 'show');
    // }
  };

  var nav = document.querySelector('.nav');
  nav.addEventListener('click', onNavClick);
})();

(function() {

  var toggle = document.querySelector('.c-hamburger');
  toggleHandler(toggle);

  function toggleHandler(toggle) {
    toggle.addEventListener( 'click', function(e) {
      e.preventDefault();
      if(this.classList.contains('is-active')) {
        document.body.classList.remove('menu-open');
        this.classList.remove('is-active');
      } else {
        document.body.classList.add('menu-open');
        this.classList.add('is-active');
      }
    });
  }

})();

(function() {
  var app = {
    config: {
      navClass: '.nav ul'
    },

    init: function() {
      var continueButtons = document.getElementsByClassName('continue');
      Array.prototype.forEach.call(continueButtons, function(element) {
        element.addEventListener('click', app.onContinueClick);
      });
    },

    onContinueClick: function() {
      var nextStep = this.dataset.template,
        nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];

      app.setActive(nextStepElement, 'show');
      var newActiveNavLink = document.getElementsByClassName('active')[0].nextElementSibling;
      //Check if it is the last nav link
      if(newActiveNavLink) {
        //Active the navigation item
        if(newActiveNavLink.classList.contains('disabled')) {
          newActiveNavLink.classList.remove('disabled');
        }
        app.setActive(newActiveNavLink, 'active');
      }
    },

    setActive: function(newActive, className) {
      var oldActive = document.getElementsByClassName(className)[0];
      oldActive.classList.remove(className);
      newActive.classList.add(className);
    }
  };

  app.init();
})();


var app = window.app || {};

app.shell = (function(window) {
  /**
   * VIEWS CONTROLLERS
   */

  var aboutController = function() {
    app.views.about.bind('ageChanged', function(value) {
      wealthApp.model.update('aboutAge', value);
    });
    app.views.about.bind('incomeChanged', function(value) {
      wealthApp.model.update('aboutIncome', value);
      wealthApp.model.updateMoneyValues();
    });
    app.views.about.bind('situationChanged', function(value) {
      wealthApp.model.update('aboutSituation', value);
    });
    app.views.about.bind('livingChanged', function(value) {
      wealthApp.model.update('aboutLiving', value);
    });
  };

  var youController = function() {
    app.views.you.bind('basicNeedsChanged', function(basicRate, savingRate) {
      wealthApp.model.update('aboutBasicRate', basicRate);
      wealthApp.model.update('aboutSavingsRate', savingRate);
      wealthApp.model.updateMoneyValues();
    });
    app.views.you.bind('expensesChanged', function(expensesRate, savingRate) {
      wealthApp.model.update('aboutDiscretionaryRate', expensesRate);
      wealthApp.model.update('aboutSavingsRate', savingRate);
      wealthApp.model.updateMoneyValues();
    });
  };

  // var pyramidController = function() {
  //
  // };

  var init = function() {
    var data = wealthApp.model.read();
    //Screen #2
    var aboutContainer = document.getElementsByClassName('about-wrapper')[0];
    app.views.about.configModule({
      ageOptions: {
        start: data.aboutAge
      },
      incomeOptions: {
        start: data.aboutIncome
      }
    });
    app.views.about.init(aboutContainer);
    aboutController();

    //Screen #3
    var youContainer = document.getElementsByClassName('you-wrapper')[0];
    app.views.you.configModule({
      income: data.aboutIncome
    });
    app.views.you.init(youContainer);
    youController();

    //Screen #5
    var pyramidContainer = document.getElementsByClassName('pyramid-wrapper')[0];
    app.views.pyramid.configModule({
      basic: data.basicNeeds,
      savings: data.savings,
      discretionary: data.discretionaryExpenses,
      income: data.aboutIncome
    });
    app.views.pyramid.init(pyramidContainer);

    //Screen #6
    var scenariosContainer = document.getElementsByClassName('scenarios-wrapper')[0];
    app.views.scenarios.init(scenariosContainer);

    //Screen #7
    var goalContainer = document.getElementsByClassName('goal-wrapper')[0];
    app.views.goal.init(goalContainer);

    //Screen #8
    var retirementContainer = document.getElementsByClassName('retirement-wrapper')[0];
    app.views.retirement.init(retirementContainer);

    //Screen #9
    var planContainer = document.getElementsByClassName('plan-wrapper')[0];
    app.views.plan.init(planContainer);
  };

  return {
    init: init
  };

})(window);

(function() {

  var init = function(window) {
    var WealthApp = function(name) {
      this.model = new app.Model(name);
    };

    window.wealthApp = new WealthApp('wealth');

    app.shell.init();
  };

  // Export to window
	window.app = window.app || {};
	window.app.init = init;

})();

app.init(window);

