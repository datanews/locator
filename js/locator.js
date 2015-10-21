/* globals L:false, leafletImage:false */

/**
 * Main JS for locator
 */

(function() {
  "use strict";

  // Basic map
  var map = L.map("locator-map", {
    attributionControl: false
  }).setView([40.72840, -73.99358], 13);
  L.tileLayer("http://a.tiles.mapbox.com/v3/jkeefe.46dc0891,jkeefe.pdfb6gvi/{z}/{x}/{y}.png").addTo(map);

  // Canvas overlay
  function drawingOnCanvas(canvasOverlay, params) {
    var point = [40.72840, -73.99358];
    var ctx = params.canvas.getContext("2d");
    var placement;
    ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);
    ctx.fillStyle = "rgba(255, 0, 0, 1)";

    if (params.bounds.contains(point)) {
      placement = canvasOverlay._map.latLngToContainerPoint(point);
      ctx.beginPath();
      ctx.arc(placement.x, placement.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  L.canvasOverlay()
    .drawing(drawingOnCanvas)
    .addTo(map);

  // Download
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
