/**
 * DOM utilities.
 */
"use strict";

// Dependencies
//var _ = require("lodash");

// Determine if element is overflowed with content
function isOverflowed(element, direction) {
  return (!direction) ?
    (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) :
    (direction === "y") ? (element.scrollHeight > element.clientHeight) :
    (direction === "x") ? (element.scrollWidth > element.clientWidth) : false;
}

// Exports
module.exports = {
  isOverflowed: isOverflowed
};
