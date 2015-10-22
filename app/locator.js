/* globals L:false, html2canvas:false, _:false, Ractive:false */

/**
 * Locator
 */

(function() {
  "use strict";

  // Main contructor
  var Locator = function(options) {
    this.options = _.extend({}, {
      // Main map
      tileOptions: {
        "Mapbox Streets": "http://a.tiles.mapbox.com/v3/jkeefe.np44bm6o/{z}/{x}/{y}.png",
        "Stamen Toner": "http://tile.stamen.com/toner/{z}/{x}/{y}.png"
      },
      tiles: "Mapbox Streets",
      zoom: 17,
      lat: 40.74844,
      lng: -73.98566,

      // Mini map
      miniWidth: 100,
      miniHeight: 100,
      miniZoomOffset: -6,
      miniExtentStyles: {
        fill: false,
        stroke: true,
        color: "#000000",
        opacity: 0.9,
        weight: 2
      },

      // Marker
      markerText: "Empire State Building",
      markerBackground: "rgba(0, 0, 0, 0.9)",
      markerForeground: "rgba(255, 255, 255, 0.9)",
      markerRadius: 5,
      markerFontSize: 16,
      markerFont: "\"Open Sans\", Helvetica, Arial, sans-serif",
      markerLabelDistance: 20,
      markerLabelWidth: 3,
      markerPadding: 10
    }, options);

    // Generate a unique id
    this.id = _.uniqueId("locator-");

    // Make some options that won't change more accessible
    this.el = this.options.el;

    // Get template
    this.getTemplate(_.bind(function() {
      this.drawInterface();
    }, this));
  };

  // Add methods and properties
  _.extend(Locator.prototype, {
    // Get template.  For now, this just pulls in HTML, but should be
    // embedded into build
    getTemplate: function(done) {
      var _this = this;
      var httpRequest = new XMLHttpRequest();
      var once = _.once(done);

      httpRequest.onreadystatechange = function() {
        if (httpRequest.status === 200 && httpRequest.responseText) {
          _this.template = httpRequest.responseText;
          once();
        }
      };

      httpRequest.open("GET", "./app/locator.html.tpl");
      httpRequest.send();
    },

    // Make interface
    drawInterface: function() {
      this.interface = new Ractive({
        el: this.options.el,
        template: this.template,
        data: {
          options: this.options
        }
      });

      // Match up events
      this.interface.on("generate", _.bind(this.generate, this));

      // Make throttled map draw
      this.throttledDrawMaps = _.throttle(_.bind(this.drawMaps, this), 1500);

      // Handle config updates
      this.interface.observe("options", _.bind(function() {
        // The reference to options is maintained
        this.throttledDrawMaps();
      }, this), { init: false });

      // Initialize map parts
      this.drawMaps();
    },

    // Draw map parts
    drawMaps: function() {
      this.drawMap();
      this.drawMarker();
      this.drawMinimap();
    },

    // Make main map
    drawMap: function() {
      // Generate an id for the map
      var mapEl = this.getEl(".locator-map");
      mapEl.id = this.id + "-map";

      // Kill map if existings
      if (this.map) {
        this.map.remove();
      }

      // Make map and set view
      this.map = L.map(mapEl.id, {
        attributionControl: false
      }).setView([this.options.lat, this.options.lng], this.options.zoom);

      // Tile layer
      this.mapLayer = new L.TileLayer(this.options.tileOptions[this.options.tiles]);
      this.map.addLayer(this.mapLayer);
    },

    // Draw minimap
    drawMinimap: function() {
      this.minimapLayer = new L.TileLayer(this.options.tileOptions[this.options.tiles]);
      this.miniMap = new L.Control.MiniMap(this.minimapLayer, {
        width: this.options.miniWidth,
        height: this.options.miniWidth,
        zoomLevelOffset: this.options.miniZoomOffset,
        aimingRectOptions: this.options.miniExtentStyles
      });

      this.map.addControl(this.miniMap);
    },

    // Draw marker layer
    drawMarker: function() {
      L.canvasOverlay()
        .drawing(_.bind(this.drawMarkerTile, this))
        .addTo(this.map);
    },

    // Marker layer draw handler
    drawMarkerTile: function(canvasOverlay, params) {
      var point = [this.options.lat, this.options.lng];
      var ctx = params.canvas.getContext("2d");
      var labelHeight = (this.options.markerFontSize * 0.75) + (this.options.markerPadding * 2);
      var placement;
      var textWidth;
      var labelWidth;

      // Clear out tile
      ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

      // Only draw if marker is in tile
      if (params.bounds.contains(point)) {
        // Determine placement in tile
        placement = canvasOverlay._map.latLngToContainerPoint(point);

        // Draw point on location
        ctx.beginPath();
        ctx.fillStyle = this.options.markerBackground;
        ctx.fillRect(
          placement.x - this.options.markerRadius,
          placement.y - this.options.markerRadius,
          this.options.markerRadius * 2,
          this.options.markerRadius * 2
        );
        ctx.closePath();

        // Label connection line
        ctx.beginPath();
        ctx.fillStyle = this.options.markerBackground;
        ctx.fillRect(
          placement.x - (this.options.markerLabelWidth / 2),
          placement.y - this.options.markerRadius - this.options.markerLabelDistance,
          this.options.markerLabelWidth,
          this.options.markerLabelDistance
        );
        ctx.closePath();

        // Determine width of text
        ctx.beginPath();
        ctx.font = this.options.markerFontSize + "px " + this.options.markerFont;
        ctx.fillStyle = this.options.markerForeground;
        ctx.textAlign = "center";
        textWidth = ctx.measureText(this.options.markerText).width;
        labelWidth = textWidth + this.options.markerPadding * 2;
        ctx.closePath();

        // Make label rectangle
        ctx.beginPath();
        ctx.fillStyle = this.options.markerBackground;
        ctx.fillRect(
          placement.x - (labelWidth / 2),
          placement.y - this.options.markerRadius - this.options.markerLabelDistance - labelHeight,
          labelWidth, labelHeight);
        ctx.closePath();

        // Add label
        ctx.beginPath();
        ctx.font = this.options.markerFontSize + "px " + this.options.markerFont;
        ctx.fillStyle = this.options.markerForeground;
        ctx.textAlign = "center";
        ctx.fillText(this.options.markerText,
          placement.x,
          placement.y - this.options.markerRadius - this.options.markerLabelDistance - this.options.markerPadding);
        ctx.closePath();
      }
    },

    // Generate image
    generate: function() {
      // Hide parts not to render
      this.getEl(".locator-map .leaflet-control-zoom").style.display = "none";
      this.getEl(".locator-map .leaflet-control-minimap").style.display = "none";

      // Turn main map into canvas
      html2canvas(this.getEl(".locator-map"), {
        useCORS: true,
        onrendered: _.bind(function(mapCanvas) {
          // Re-display parts
          this.getEl(".locator-map .leaflet-control-zoom").style.display = "block";
          this.getEl(".locator-map .leaflet-control-minimap").style.display = "block";

          // Make mini map
          html2canvas(this.getEl(".locator-map .leaflet-control-minimap"), {
            useCORS: true,
            onrendered: _.bind(function(miniCanvas) {
              var mapCtx = mapCanvas.getContext("2d");

              mapCtx.shadowColor = "rgba(0, 0, 0, 0.65)";
              mapCtx.shadowBlur = 5;
              mapCtx.shadowOffsetX = 1;
              mapCtx.shadowOffsetY = 1;
              mapCtx.drawImage(miniCanvas, mapCtx.canvas.width - 100 - 10, mapCtx.canvas.height - 100 - 10, 100, 100);

              document.body.appendChild(mapCtx.canvas);
            }, this)
          });
        }, this)
      });
    },

    // Export/download
    export: function() {
      console.log("EXPORT");

      /*
      var download = document.querySelector(".download-link");
      download.href = canvas.toDataURL();
      download.download = "example.png";
      download.className = download.className + " ready";
      */
    },

    // Get element from query selector relative to locator
    getEl: function(element) {
      return document.querySelector(this.el + " " + element);
    }
  });

  // Add to window
  window.Locator = Locator;
})();
