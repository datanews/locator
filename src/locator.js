/* globals L:false, html2canvas:false, _:false, Ractive:false */

/**
 * Locator
 */

(function() {
  "use strict";

  // Main contructor
  var Locator = function(options) {
    this.options = _.extend({}, {
      // Template
      template: "REPLACE-DEFAULT-TEMPLATE",

      // Main map
      tilesets: {
        "Mapbox Streets": "http://a.tiles.mapbox.com/v3/jkeefe.np44bm6o/{z}/{x}/{y}.png",
        "Stamen Toner": "http://tile.stamen.com/toner/{z}/{x}/{y}.png"
      },
      tileset: "Mapbox Streets",
      zoom: 17,
      lat: 40.74844,
      lng: -73.98566,
      minZoom: 1,
      maxZoom: 18,

      // Mini map
      miniWidth: "15w",
      miniHeight: "15w",
      miniZoomOffset: -6,
      miniExtentStyles: {
        fill: false,
        stroke: true,
        color: "#000000",
        opacity: 0.9,
        weight: 4
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

      // Dimensions
      widths: {
        "400px": 400,
        "600px": 600,
        "800px": 800,
      },
      width: "600px",
      ratios: {
        "1:1": 1 / 1,
        "4:3": 4 / 3,
        "16:9": 16 / 9
      },
      ratio: "4:3",

      // Interface
      controlsOpen: true,

      // Basic defalt geocoder with Google
      geocoder: this.defaultGeocoder
    }, options);

    // Generate a unique id
    this.id = _.uniqueId("locator-");

    // Make some options that won't change more accessible
    this.el = this.options.el;

    // Build interface
    this.drawInterface();
  };

  // Add methods and properties
  _.extend(Locator.prototype, {
    // Make interface
    drawInterface: function() {
      // Place holder to work around object reference changes
      var oldReference = _.clone(this.options);

      // Certain properties should not re-generate map but may be updated.
      var noGenerate = {
        controlsOpen: this.options.controlsOpen
      };

      // Create ractive object
      this.interface = new Ractive({
        el: this.options.el,
        template: this.options.template,
        data: {
          options: this.options,
          noGenerate: noGenerate,
          isGeocoding: false,
          geocodeInput: "",
          _: _
        }
      });

      // Match up events
      this.interface.on("generate", _.bind(this.generate, this));

      // Throttle some functions
      this.throttledDrawMaps = _.throttle(_.bind(this.drawMaps, this), 1500);
      if (_.isFunction(this.options.geocoder)) {
        this.throttledGeocoder = _.throttle(_.bind(this.options.geocoder, this), 1500);
      }

      // Handle general config updates
      this.interface.observe("options", _.bind(function(options) {
        var recenter = (options.lat !== oldReference.lat ||
          options.lng !== oldReference.lng);

        // The reference to options is maintained
        this.throttledDrawMaps(recenter);

        // Update past reference
        oldReference = _.clone(options);
      }, this), { init: false });

      // Handle geocoding
      this.interface.observe("geocodeInput", _.bind(function(input) {
        if (_.isFunction(this.throttledGeocoder)) {
          this.throttledGeocoder(input, _.bind(function(lat, lng) {
            this.options.lat = lat;
            this.options.lng = lng;
            this.throttledDrawMaps(true);
          }, this));
        }
      }, this), { init: false });

      // General toggle event functions
      this.interface.on("toggle", function(e, property) {
        this.set(property, !this.get(property));
      });

      // Initialize map parts
      this.drawMaps();
    },

    // Draw map parts
    drawMaps: function(recenter) {
      this.drawMap(recenter);
      this.drawMarker();
      this.drawMinimap();
    },

    // Make main map
    drawMap: function(recenter) {
      recenter = recenter || false;
      var mapEl = this.getEl(".locator-map");
      var width;
      var height;
      var view;

      // Generate an id for the map
      mapEl.id = this.id + "-map";

      // Kill map if existings, but get the current view if we are
      // not recentering
      view = [this.options.lat, this.options.lng, this.options.zoom];
      if (this.map && !recenter) {
        view[0] = this.map.getCenter().lat;
        view[1] = this.map.getCenter().lng;
        view[2] = this.map.getZoom();
        this.map.remove();
      }
      else if (this.map) {
        this.map.remove();
      }

      // Determine size of map.  Use options if available.
      width = _.size(this.options.widths) ?
        this.options.widths[this.options.width] :
        mapEl.getBoundingClientRect().width;
      height = _.size(this.options.ratios) ?
        width / this.options.ratios[this.options.ratio] :
        mapEl.getBoundingClientRect().height;
      mapEl.style.width = width + "px";
      mapEl.style.height = height + "px";

      // Make map and set view
      this.map = new L.Map(mapEl.id, {
        minZoom: this.options.minZoom,
        maxZoom: this.options.maxZoom,
        attributionControl: false
      });
      this.map.setView([view[0], view[1]], view[2]);

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

        // Don't show original rectangle (see below)
        aimingRectOptions: {
          fill: false,
          stroke: false
        }
      });

      // Add control
      this.map.addControl(this.miniMap);

      // We have to manually create a canvas layer, since using the L.preferCanvas
      // method really screws things up, and Leaflet 1.0.0 which has better
      // support for the canvas preference does not work with Leaflet Minimap
      this.miniMap._miniMap.addLayer(this.drawMiniCanvasLayer(this.options.miniExtentStyles));

      // Manually style due to canvas2html limitations that require
      // us to manually make box
      miniEl = this.getEl(".locator-map .leaflet-control-minimap");
      _.each(this.miniStylesToCSS(this.options.miniStyles), function(def, prop) {
        miniEl.style[prop] = def;
      });
    },

    // Minimap custom canvas layer
    drawMiniCanvasLayer: function(styles) {
      this.miniCanvasLayer = L.tileLayer.canvas();
      this.miniCanvasLayer.drawTile = _.bind(function(canvas, tilePoint, zoom) {
        var ctx = canvas.getContext("2d");

        // Clear out tile
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get some dimensions
        var dim = {};
        dim.nwPoint = tilePoint.multiplyBy(256);
        dim.sePoint = dim.nwPoint.add(new L.Point(256, 256));
        dim.nwCoord = this.map.unproject(dim.nwPoint, zoom, true);
        dim.seCoord = this.map.unproject(dim.sePoint, zoom, true);
        dim.bCoord = L.latLngBounds([[dim.nwCoord.lat, dim.seCoord.lng],
          [dim.seCoord.lat, dim.nwCoord.lng]]);
        dim.bPoint = [dim.nwPoint, dim.sePoint];

        // TODO: Use a buffer or some calculation so that we only draw into tiles
        // that the marker spills into.
        // bCoord.contains(bCoord)
        if (true) {
          var bounds = this.map.getBounds();
          var nw = this.map.project(bounds.getNorthWest(), zoom, true);
          var se = this.map.project(bounds.getSouthEast(), zoom, true);

          // Draw box
          ctx.beginPath();
          ctx.rect(nw.x - dim.nwPoint.x, nw.y - dim.nwPoint.y, se.x - nw.x, se.y - nw.y);
          ctx = this.leafletStylesToCanvas(styles, ctx);
          ctx.closePath();
        }
      }, this);

      // Track the movements of the main map
      this.map.on("moveend", _.bind(function() {
        this.miniCanvasLayer.redraw();
      }, this));

      return this.miniCanvasLayer;
    },

    // Draw marker layer
    drawMarker: function() {
      // Remove existing layer if there
      if (this.markerCanvas && this.map) {
        this.map.removeLayer(this.markerCanvas);
      }

      // Set up canvas layer
      this.markerCanvas = L.tileLayer.canvas();
      this.markerCanvas.drawTile = _.bind(this.drawMarkerTile, this);
      this.markerCanvas.addTo(this.map);

      // Make marker draggable via an invisble marker, remove first
      if (this.draggableMarker && this.map) {
        this.map.removeLayer(this.draggableMarker);
      }

      this.draggableMarker = L.marker(L.latLng(this.options.lat, this.options.lng), {
        radius: 10,
        draggable: true,
        opacity: 0,
        title: "Drag marker here"
      }).addTo(this.map);

      // Start dragging
      this.draggableMarker.on("dragstart", function(e) {
        e.target.setOpacity(1);
      });

      // Start dragging
      this.draggableMarker.on("dragend", _.bind(function(e) {
        e.target.setOpacity(0);

        // Set lat, lng
        var l = e.target.getLatLng();
        this.options.lat = l.lat;
        this.options.lng = l.lng;
        this.drawMarker();
      }, this));
    },

    // Marker layer draw handler
    drawMarkerTile: function(canvas, tilePoint, zoom) {
      var ctx = canvas.getContext("2d");
      var labelHeight = (this.options.markerFontSize * 0.75) + (this.options.markerPadding * 2);
      var placement;
      var textWidth;
      var labelWidth;

      // Clear out tile
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get some dimensions
      var dim = {};
      dim.nwPoint = tilePoint.multiplyBy(256);
      dim.sePoint = dim.nwPoint.add(new L.Point(256, 256));
      dim.nwCoord = this.map.unproject(dim.nwPoint, zoom, true);
      dim.seCoord = this.map.unproject(dim.sePoint, zoom, true);
      dim.bCoord = L.latLngBounds([[dim.nwCoord.lat, dim.seCoord.lng],
        [dim.seCoord.lat, dim.nwCoord.lng]]);
      dim.bPoint = [dim.nwPoint, dim.sePoint];
      dim.locCoord = L.latLng(this.options.lat, this.options.lng);
      dim.locPoint = this.map.project(dim.locCoord, zoom, true);

      // TODO: Use a buffer or some calculation so that we only draw into tiles
      // that the marker spills into.
      // bCoord.contains(bCoord)
      if (true) {
        // Determine placement in tile
        placement = {
          x: dim.locPoint.x - dim.nwPoint.x,
          y: dim.locPoint.y - dim.nwPoint.y
        };

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

      //download.click();
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
    },

    // Leaflet path styles to canvas context
    // Borrowed from:
    // https://github.com/Leaflet/Leaflet/blob/2a5857d172f0fa982c6c54fa5511e9b29ae13ec7/src/layer/vector/Canvas.js#L175
    leafletStylesToCanvas: function(styles, context) {
      if (styles.fill) {
        context.globalAlpha = styles.fillOpacity || 1;
        context.fillStyle = styles.fillColor || styles.color;
        context.fill(styles.fillRule || "evenodd");
      }

      if (styles.stroke && styles.weight !== 0) {
        context.globalAlpha = styles.opacity || 1;
        context.strokeStyle = styles.color;
        context.lineCap = styles.lineCap;
        context.lineJoin = styles.lineJoin;
        context.stroke();
      }

      return context;
    },

    // A vrey crude geocoder that uses Google goeocoding
    defaultGeocoder: function(address, done) {
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
  });

  // Add to window
  window.Locator = Locator;
})();
