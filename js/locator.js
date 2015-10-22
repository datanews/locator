/* globals L:false, leafletImage:false, html2canvas:false */

/**
 * Main JS for locator
 */

(function() {
  "use strict";

  // Basic map
  var map = L.map("locator-map", {
    attributionControl: false
  }).setView([40.74844, -73.98566], 17);
  L.tileLayer("http://a.tiles.mapbox.com/v3/jkeefe.np44bm6o/{z}/{x}/{y}.png").addTo(map);

  // Canvas overlay
  function drawingOnCanvas(canvasOverlay, params) {
    var point = [40.74844, -73.98566];
    var ctx = params.canvas.getContext("2d");
    var placement;
    var background = "rgba(0, 0, 0, 0.9)";
    var foreground = "rgba(255, 255, 255, 0.9)";
    var fontSize = 15;
    var font = fontSize + "px Times New Roman";
    ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

    if (params.bounds.contains(point)) {
      placement = canvasOverlay._map.latLngToContainerPoint(point);

      ctx.beginPath();
      ctx.fillStyle = background;
      ctx.strokeStyle = background;
      ctx.fillRect(
        placement.x - 5,
        placement.y - 5,
        10, 10);
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(placement.x, placement.y);
      ctx.lineTo(placement.x, placement.y - 20);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.font = font;
      ctx.fillStyle = foreground;
      ctx.textAlign = "center";
      var textM = ctx.measureText("Empire State Building");
      ctx.fillText("Empire State Building", placement.x, placement.y - 30);
      ctx.closePath();

      ctx.beginPath();
      ctx.fillStyle = background;
      ctx.fillRect(
        placement.x - textM.width / 2 - 10,
        placement.y - 30 - fontSize - 5,
        textM.width + 20, fontSize + 15);
      ctx.closePath();

      ctx.beginPath();
      ctx.font = font;
      ctx.fillStyle = foreground;
      ctx.textAlign = "center";
      ctx.fillText("Empire State Building", placement.x, placement.y - 30);
      ctx.closePath();
    }
  }

  L.canvasOverlay()
    .drawing(drawingOnCanvas)
    .addTo(map);

  // MiniMap
  var minimapLayer = new L.TileLayer("http://a.tiles.mapbox.com/v3/jkeefe.np44bm6o/{z}/{x}/{y}.png");
  var miniMap = new L.Control.MiniMap(minimapLayer, {
    width: 100,
    height: 100,
    zoomLevelOffset: -6,
    aimingRectOptions: {
      fill: false,
      stroke: true,
      color: "#000000",
      opacity: 0.9,
      weight: 2
    }
  });
  map.addControl(miniMap);

  // Generate image
  document.querySelector(".generate-image").onclick = function(e) {
    e.preventDefault();

    // Hide parts not to render
    document.querySelector("#locator-map .leaflet-control-zoom").style.display = "none";
    document.querySelector("#locator-map .leaflet-control-minimap").style.display = "none";
    html2canvas(document.querySelector("#locator-map"), {
      useCORS: true,
      onrendered: function(mapCanvas) {
        document.body.appendChild(mapCanvas);

        // Minimap
        document.querySelector("#locator-map .leaflet-control-zoom").style.display = "block";
        document.querySelector("#locator-map .leaflet-control-minimap").style.display = "block";
        html2canvas(document.querySelector("#locator-map .leaflet-control-minimap"), {
          useCORS: true,
          onrendered: function(miniCanvas) {

            // Add mini to map
            var mapCtx = mapCanvas.getContext("2d");

            //var miniCtx = miniCanvas.getContext("2d");

            mapCtx.shadowColor = "rgba(0, 0, 0, 0.65)";
            mapCtx.shadowBlur = 5;
            mapCtx.shadowOffsetX = 1;
            mapCtx.shadowOffsetY = 1;
            mapCtx.drawImage(miniCanvas, mapCtx.canvas.width - 100 - 10, mapCtx.canvas.height - 100 - 10, 100, 100);
          }
        });
      }
    });

    // Download
    /*
    var download = document.querySelector(".download-link");
    download.href = canvas.toDataURL();
    download.download = "example.png";
    download.className = download.className + " ready";
    */
  };

  // TODO: Implement a canvas interface drawing control
})();
