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
