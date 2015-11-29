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
