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
      tilesets: {
        "Mapbox Streets": "http://a.tiles.mapbox.com/v3/jkeefe.np44bm6o/{z}/{x}/{y}.png",
        "Stamen Toner": "http://tile.stamen.com/toner/{z}/{x}/{y}.png"
      },
      tileset: "Mapbox Streets",
      zoom: 17,
      lat: 40.74844,
      lng: -73.98566,

      // Mini map
      miniWidth: "15w",
      miniHeight: "15w",
      miniZoomOffset: -6,
      miniExtentStyles: {
        fill: false,
        stroke: true,
        color: "#000000",
        opacity: 0.9,
        weight: 2
      },
      miniStyles: {
        backgroundColor: "#FFFFFF",
        padding: 3,
        shadow: true,
        shadowColor: "rgba(0, 0, 0, 0.65)",
        shadowBlur: 5,
        shadowOffsetX: 1,
        shadowOffsetY: 1
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
      markerPadding: 10,

      // Interface
      ratios: {
        "1:1": 1 / 1,
        "4:3": 4 / 3,
        "16:9": 16 / 9
      },
      ratio: "4:3"
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

      // Determine size of map
      var width = mapEl.getBoundingClientRect().width;
      var height = width / this.options.ratios[this.options.ratio];
      mapEl.style.width = width + "px";
      mapEl.style.height = height + "px";

      // Make map and set view
      this.map = L.map(mapEl.id, {
        attributionControl: false
      }).setView([this.options.lat, this.options.lng], this.options.zoom);

      // Tile layer
      this.mapLayer = new L.TileLayer(this.options.tilesets[this.options.tileset]);
      this.map.addLayer(this.mapLayer);
    },

    // Draw minimap
    drawMinimap: function() {
      var miniEl;

      // Determine height and width.  The value can be a number which
      // we use as pixels, or it can be an percentage of height or width
      var w = this.getEl(".locator-map").getBoundingClientRect().width;
      var h = this.getEl(".locator-map").getBoundingClientRect().height;
      var mW = (_.isNumber(this.options.miniWidth)) ? this.options.miniWidth :
        (this.options.miniWidth.indexOf("w") !== -1) ?
        +this.options.miniWidth.replace("w", "") / 100 * w :
        +this.options.miniWidth.replace("h", "") / 100 * h;
      var mH = (_.isNumber(this.options.miniHeight)) ? this.options.miniHeight :
        (this.options.miniHeight.indexOf("w") !== -1) ?
        +this.options.miniHeight.replace("w", "") / 100 * w :
        +this.options.miniHeight.replace("h", "") / 100 * h;

      // Create layer for minimap
      this.minimapLayer = new L.TileLayer(this.options.tilesets[this.options.tileset]);

      // Create control
      this.miniMap = new L.Control.MiniMap(this.minimapLayer, {
        width: mW,
        height: mH,
        zoomLevelOffset: this.options.miniZoomOffset,
        aimingRectOptions: this.options.miniExtentStyles
      });

      // Add control
      this.map.addControl(this.miniMap);

      // Manually style due to canvas2html limitations that require
      // us to manually make box
      miniEl = this.getEl(".locator-map .leaflet-control-minimap");
      _.each(this.miniStylesToCSS(this.options.miniStyles), function(def, prop) {
        miniEl.style[prop] = def;
      });
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
              var mapCtx = this.drawCanvasMiniMap(mapCanvas, miniCanvas);

              // Preview and export
              this.preview(mapCtx);
              this.export(mapCtx);
            }, this)
          });
        }, this)
      });
    },

    // Draw minimap
    drawCanvasMiniMap: function(mapCanvas, miniCanvas) {
      // Create context
      var mapCtx = mapCanvas.getContext("2d");
      var miniEl = this.getEl(".locator-map .leaflet-control-minimap");
      var w = miniEl.getBoundingClientRect().width;
      var h = miniEl.getBoundingClientRect().height;
      var styles = this.options.miniStyles;

      // TODO: Determine how far away the minimap is from the edge
      var fromRight = 10;
      var fromBottom = 10;

      // Make back drop
      mapCtx.beginPath();
      mapCtx.fillStyle = styles.backgroundColor;

      if (styles.shadow) {
        mapCtx.shadowColor = styles.shadowColor;
        mapCtx.shadowBlur = styles.shadowBlur;
        mapCtx.shadowOffsetX = styles.shadowOffsetX;
        mapCtx.shadowOffsetY = styles.shadowOffsetY;
      }

      mapCtx.fillRect(
        mapCtx.canvas.width - fromRight - w - (styles.padding * 2),
        mapCtx.canvas.height - fromBottom - h - (styles.padding * 2),
        w + (styles.padding * 2),
        h + (styles.padding * 2));
      mapCtx.closePath();

      // Make map
      mapCtx.beginPath();
      mapCtx.shadowColor = 0;
      mapCtx.shadowBlur = 0;
      mapCtx.shadowOffsetX = 0;
      mapCtx.shadowOffsetY = 0;
      mapCtx.drawImage(miniCanvas,
        mapCtx.canvas.width - fromRight - w - styles.padding,
        mapCtx.canvas.height - fromBottom - h - styles.padding,
        w,
        h);
      mapCtx.closePath();

      return mapCtx;
    },

    // Preview
    preview: function(mapCtx) {
      this.getEl(".preview img").src = mapCtx.canvas.toDataURL();
      this.getEl(".preview").style.display = "block";
    },

    // Export/download.  TODO: use marker text for name
    export: function(mapCtx) {
      var download = this.getEl(".download-link");
      download.href = mapCtx.canvas.toDataURL();
      download.download = _.uniqueId("locator_image-") + ".png";
      download.click();
    },

    // Get element from query selector relative to locator
    getEl: function(element) {
      return document.querySelector(this.el + " " + element);
    },

    // Turn mini styles to CSS
    miniStylesToCSS: function(options) {
      var props = {
        "background-color": options.backgroundColor,
        border: options.padding + "px solid " + options.backgroundColor
      };

      if (options.shadow) {
        props["box-shadow"] = options.shadowOffsetX + "px " +
          options.shadowOffsetY + "px " +
          options.shadowBlur + "px " +
          options.shadowColor;
      }

      return props;
    }
  });

  // Add to window
  window.Locator = Locator;
})();
