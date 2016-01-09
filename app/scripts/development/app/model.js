(function (window) {
	'use strict';

  var defaultModel = {
    aboutAge: 35,
    aboutSituation: 'married',
    aboutLiving: 'own',
    aboutIncome: 60000,
    aboutBasicRate: 45,
    aboutDiscretionaryRate: 25,
    aboutSavingsRate: 30,
		annualSavings: 18000,
		currentSavings: 1000,
    //aboutStage: 'home',
    basicNeeds: 27000,
		lastUserStep: 1,
    discretionaryExpenses: 15000,
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
	Model.prototype.update = function (property, updateData, callback) {
	   var data = JSON.parse(localStorage[this._dbName]);
     var user = data.user;

     user[property] = updateData;

     localStorage[this._dbName] = JSON.stringify(data);

		 callback = callback || function() {};
		 callback(updateData);
	};

	/**
	 * Update basic needs, discretionary and annual savings actual values based on rates
	 */
	Model.prototype.updateMoneyValues = function(callback) {
		var data = JSON.parse(localStorage[this._dbName]);
    var user = data.user;

		user.basicNeeds = user.aboutIncome * user.aboutBasicRate * 0.01;
		user.discretionaryExpenses = user.aboutIncome * user.aboutDiscretionaryRate * 0.01;
		user.annualSavings = user.aboutIncome * user.aboutSavingsRate * 0.01;

		localStorage[this._dbName] = JSON.stringify(data);

		callback = callback || function() {};

		callback({
			basicNeeds: user.basicNeeds,
			discretionaryExpenses: user.discretionaryExpenses,
			annualSavings: user.annualSaving
		});
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
