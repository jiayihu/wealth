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
		var error = {};
		error.name = name;
		error.msg = msg;
		if(data) {
			error.data = data;
		}
		console.error(error.msg);
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
 	    if(configMap.hasOwnProperty(key)) {
 	      if(inputMap[key] instanceof Object) {
 	        window.setConfigMap(inputMap[key], configMap[key]);
 	      } else {
 	        configMap[key] = inputMap[key];
 	      }
 	    } else {
				window.makeError('Wrong inputMap', 'Property "' + key + '" is not available in configMap');
			}
 	  }
 	};

	// Allow for looping on nodes by chaining and using forEach on both Nodelists and HTMLCollections
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
	HTMLCollection.prototype.forEach = Array.prototype.forEach;
})(window);
