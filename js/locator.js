/* globals L:false, leafletImage:false */

/**
 * Main JS for locator
 */

(function() {
  "use strict";

  var map = L.map("locator-map").setView([51.505, -0.09], 13);
  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
  }).addTo(map);

  var download = document.querySelector(".download-link");
  document.querySelector(".generate-image").onclick = function(e) {
    e.preventDefault();

    leafletImage(map, function(error, canvas) {
      if (error) {
        throw new Error(error);
      }

      download.href = canvas.toDataURL();
      download.download = "example.png";
      download.className = download.className + " ready";
    });
  };
})();
