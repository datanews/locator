/**
 * Geocoding functions
 */
"use strict";

// Dependencies
var _ = require("lodash");

// Simple google geocoder
function google(address, done) {
  var httpRequest = new XMLHttpRequest();
  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(address);
  var once = _.once(done);

  httpRequest.onreadystatechange = function() {
    var data;

    if (httpRequest.status === 200 && httpRequest.responseText) {
      data = JSON.parse(httpRequest.responseText);

      if (data && data.results && data.results.length) {
        once(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
      }
    }
  };

  httpRequest.open("GET", url);
  httpRequest.send();
}

// Exports
module.exports = {
  google: google
};
