/**
 * General utility functions.
 */
"use strict";

// Dependencies
var _ = require("lodash");

// Deep clone
// http://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript
function clone(item) {
  function cloner(value) {
    if (_.isElement(value)) {
      return value.cloneNode(true);
    }
    else if (_.isDate(value)) {
      return new Date(value);
    }
    else {
      return _.cloneDeep(value);
    }
  }

  return _.cloneDeepWith(item, cloner);
}

// Create a slug/id
function makeID(input) {
  input = input ? input.toString() : "";
  input = input.toLowerCase().trim().replace(/\W+/g, "-");
  input = input ? input : "locator";
  return _.uniqueId(input + "-");
}

module.exports = {
  clone: clone,
  makeID: makeID
};
