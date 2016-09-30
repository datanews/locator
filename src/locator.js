/**
 * Main locator file
 */
"use strict";

// Dependencies
var L = require("leaflet");
L.BingLayer = require("../libs/leaflet-plugins.bing.js").BingLayer;

var html2canvas = require("../libs/html2canvas.js");
var _ = require("lodash");
var Ractive = require("ractive");

// Additions
var rTap = require("ractive-events-tap");
require("../libs/ractive-transitions-slide.js");
require("leaflet-draw");
require("leaflet-minimap");

// Parts
var utils = require("./js/utils.js");
var dom = require("./js/dom.js");
var geocode = require("./js/geocode.js");

// Main contructor
var Locator = function(options) {
  this.options = _.extend({
    // Template
    template: "REPLACE-DEFAULT-TEMPLATE",

    // Text
    title: "Locator demo",
    footer: "Made by the <a href=\"//datanews.tumblr.com/\" target=\"_blank\">WNYC DataNews</a> team.  Locator only works in <a href=\"//google.com/chrome\" target=\"_blank\">Google Chrome</a> at the moment.  See how to <a href=\"//github.com/datanews/locator/\" target=\"_blank\">deploy Locator</a> for yourself or your organization.",

    // Main map
    tilesets: {
      "CartoDB Positron": {
        url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        attribution: "&copy; <a target=\"_blank\" href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a target=\"_blank\" href=\"http://cartodb.com/attributions\">CartoDB</a>"
      },
      "CartoDB Positron Dark": {
        url: "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        attribution: "&copy; <a target=\"_blank\" href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a target=\"_blank\" href=\"http://cartodb.com/attributions\">CartoDB</a>"
      },
      "Stamen Toner": {
        url: "http://tile.stamen.com/toner/{z}/{x}/{y}.png",
        attribution: "Map tiles by <a target=\"_blank\" href=\"http://stamen.com\">Stamen Design</a>, under <a  target=\"_blank\" href=\"http://creativecommons.org/licenses/by/3.0\">CC BY 3.0</a>. Data by <a  target=\"_blank\" href=\"http://openstreetmap.org\">OpenStreetMap</a>, under <a target=\"_blank\" href=\"http://www.openstreetmap.org/copyright\">ODbL</a>"
      },
      "Mapbox Streets (via WNYC)": {
        url: "https://api.mapbox.com/v4/jkeefe.np44bm6o/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamtlZWZlIiwiYSI6ImVCXzdvUGsifQ.5tFwEhRfLmH36EUxuvUQLA",
        attribution: "&copy; <a target='_blank' href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
      },
      "Mapbox Run, Bike, Hike (via WNYC)": {
        url: "https://api.mapbox.com/v4/jkeefe.oee1c53c/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamtlZWZlIiwiYSI6ImVCXzdvUGsifQ.5tFwEhRfLmH36EUxuvUQLA",
        attribution: "&copy; <a target='_blank' href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
      },
      "Mapbox Satellite (via WNYC)": {
        url: "https://api.mapbox.com/v4/jkeefe.oee0fah0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamtlZWZlIiwiYSI6ImVCXzdvUGsifQ.5tFwEhRfLmH36EUxuvUQLA",
        attribution: "&copy; <a target='_blank' href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>; &copy; <a target='_blank' href='https://www.digitalglobe.com/'>DigitalGlobe</a>"
      },
      "Bing Maps Ariel (via WNYC)": {
        type: "BingLayer",
        // Don't steal, OK
        key: "Aj4s_S9wMF1L8vcqCP7_ZWxtllCsUhD-LB8LY4KIOrkzHuMguY8NoZ_Gk4_lf4oD",
        options: {
          type: "Aerial",
        },
        attribution: "&copy; Bing",
        preview: "https://ecn.t2.tiles.virtualearth.net/tiles/a0320101103.jpeg?g=5306"
      },
      "Bing Maps Aerial w/ Labels (via WNYC)": {
        type: "BingLayer",
        key: "Aj4s_S9wMF1L8vcqCP7_ZWxtllCsUhD-LB8LY4KIOrkzHuMguY8NoZ_Gk4_lf4oD",
        options: {
          type: "AerialWithLabels",
        },
        attribution: "&copy; Bing",
        preview: "https://ecn.t2.tiles.virtualearth.net/tiles/h0320101103.jpeg?g=5306&mkt="
      },

      // Example of just url
      //"Stamen Toner": "http://tile.stamen.com/toner/{z}/{x}/{y}.png"
    },
    tileset: "CartoDB Positron",
    zoom: 17,
    minZoom: 1,
    maxZoom: 20,
    lat: 40.74844,
    lng: -73.98566,

    // Attribution (or source) that goes on top of map
    embedAttribution: false,
    overrideAttribution: undefined,

    // Mini map
    mini: true,
    miniControl: true,
    miniWidth: "15w",
    miniHeight: "15w",
    miniZoomOffset: -6,
    miniExtentStyles: {
      fill: false,
      stroke: true,
      color: "#000000",
      opacity: 0.9,
      weight: 1.5
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
    miniAimingMinWidth: 8,
    miniAimingMinHeight: 6,

    // Markers
    markers: [{
      text: "Empire State Building",
      lat: 40.74844,
      lng: -73.98566
    }],

    // Marker defaults
    markerDefaults: {
      text: "",
      background: "rgba(0, 0, 0, 0.9)",
      foreground: "rgba(255, 255, 255, 0.9)",
      radius: 5,
      fontSize: 16,
      font: "\"Open Sans\", Helvetica, Arial, sans-serif",
      labelDistance: 20,
      labelWidth: 3,
      padding: 10
    },

    // Marker option sets
    markerBackgrounds: [
      "rgba(0, 0, 0, 0.9)",
      "rgba(255, 255, 255, 0.9)",
      "rgba(88, 88, 88, 0.9)",
      "rgba(200, 200, 200, 0.9)",
      "rgba(51, 102, 255, 0.9)",
      "rgba(255, 51, 204, 0.9)",
      "rgba(0, 245, 61, 0.9)",
      "rgba(245, 0, 61, 0.9)",
      "rgba(184, 0, 245, 0.9)"
    ],
    markerForegrounds: [
      "rgba(0, 0, 0, 0.9)",
      "rgba(255, 255, 255, 0.9)"
    ],

    // Draggable marker.  For URI, See src/images and generated at
    // http://dopiaza.org/tools/datauri/index.php
    draggableMarker: L.icon({
      iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwLFSU1meAbBQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAACOUlEQVR42u3bP0sjQRjH8W8S/wYVFEFR1LOxMaSxsrKQlPcaBH1bCvcSvMrCQhAsbE5FwcZ/hVUQQcQ7CLheMSPYqjOzzyS/DyzpdnZ/u5k8s/sERERERERERERERERERERERERERERExJCKkeOoA7PAFDANjABjQD/QAZ791vbbPfDS6wH2AfPAug/rsx6AI+AWeO2lAKtAA2gF3Oc+cAEU3R7gOLAZad9vwC/gsVsDbAHNBONcA7vdFuAGMJnwYj0B2ykGqiUYYwuYSDxVDPl59iT3ADdKCO/dIPADOM81wBawWHKZNuqDvItZUsT6tW1iwwowl1OA1Yilylf9zCnAhsEl6zCwlkOAfYFXGCE1cwhwHrsGYoQYOsB1bFu1HGCdrz1VSaluOcBZ7KsCC1YDnCIPy1YDnM4kwCWrAY7Qg0IGONaD5xx0Z/2ZBFixGmAnkwDfrAb4nEmAhQLs0juwnUmAVwrwey6tBnifyfx3YzXAF1y7hWV/TReVuF4Vy46tB3hrOLwOcGo9wFdco49FZ+bXhd5F6ForgH/AYS4BFrguKUv2Yu041ov1R1yXlAV/Ys7N1YgHvovrkipTGziIOUAtwdVv4PpTypj3dmIPkqK97QTXJTWa+M7bSTFQLdEJnfu7cCbRnPc71ZVK3SM9h2v0GY70ld1LXcyX9TeHNVybxUCgFcZZrDrPaoDvmrh2i/onK4LCPxg4jrE8yynAjxZwL72XPpRYFb+qKfznFe553g0iAvwHgeJXccwK1poAAAAASUVORK5CYII=",
      iconSize:     [80, 80],
      iconAnchor:   [40, 55],
      popupAnchor:  [-75, 0]
    }),

    // Drawing
    drawing: true,
    drawingStyles: {
      fill: false,
      stroke: true,
      color: "#00B8F5",
      opacity: 0.9,
      weight: 5,
      fillOpacity: 0.3
    },
    geojson: false,
    drawingStrokes: [
      "#00B8F5",
      "#F5003D",
      "#F500B8",
      "#F5B800",
      "#00F53D",
      "#FFFFFF",
      "#000000"
    ],
    drawingFills: [
      "#00B8F5",
      "#F5003D",
      "#F500B8",
      "#F5B800",
      "#00F53D",
      "#FFFFFF",
      "#000000"
    ],

    // Dimensions
    widths: {
      Small: 400,
      Medium: 600,
      Large: 800,
    },
    width: "Medium",
    ratios: {
      "1:1": 1 / 1,
      "4:3": 4 / 3,
      "16:9": 16 / 9
    },
    ratio: "4:3",

    // Interface
    controlsOpen: true,
    centerToMarker: true,
    markerToCenter: true,

    // Basic defalt geocoder with Google
    geocoder: geocode.google,

    // Super class is just a top level class that goes in the markup
    // that is helpful for dynamic options and preDraw and styling
    superClass: undefined,

    // Use this hook to change options with each re-draw
    /*
    preDraw: function(options) {
      // Update marker color on darker tileset
      if (options.tileset === "Stamen Toner") {
        options.markerDefaults.background = "rgba(51, 102, 255, 1)";
      }
      else {
        options.markerDefaults.background = "rgba(0, 0, 0, 0.9)";
      }
    }
    */
  }, options);

  // Generate a unique id
  this.id = _.uniqueId("locator-");

  // Make some options that won't change more accessible
  this.el = this.options.el;

  // Update the options initially
  this.updateOptions();

  // We may want to reset
  this.originalOptions = utils.clone(this.options);

  // Attempt to load saved options
  this.options = this.load(this.options);

  // Set up history and set intial state
  this.history = [];
  this.historyIndex = 0;
  this.save(true);

  // Throttle some functions
  this.throttledDrawMaps = _.throttle(_.bind(this.drawMaps, this), 500);
  if (_.isFunction(this.options.geocoder)) {
    this.throttledGeocoder = _.throttle(_.bind(this.options.geocoder, this), 500);
  }

  // Go
  this.drawInterface();
};

// Add methods and properties
_.extend(Locator.prototype, {
  // Make interface
  drawInterface: function() {
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
      },
      events: {
        tap: rTap
      }
    });

    // Handle general config updates
    this.interface.observe("options", _.bind(function() {
      if (this.ignoreObservers) {
        return;
      }

      // Alter options
      this.updateOptions();

      // Maybe some options changed a long the way
      this.interface.update();

      // Save.  Ignore history in cases of undo/redo actions
      this.save(!this.ignoreHistory);
      this.ignoreHistory = false;

      // Then redraw
      this.throttledDrawMaps();
    }, this), { init: false });

    // Handle geocoding
    this.interface.observe("geocodeInput", _.bind(function(input) {
      if (_.isFunction(this.throttledGeocoder)) {
        this.throttledGeocoder(input, _.bind(function(lat, lng) {
          if (lat && lng) {
            this.set("options.lat", lat);
            this.set("options.lng", lng);
          }
        }, this));
      }
    }, this), { init: false });

    // Undo options
    this.interface.on("undo", _.bind(function() {
      this.ignoreHistory = true;
      this.undo();
      this.set("options", this.options);
    }, this));

    // Redo options
    this.interface.on("redo", _.bind(function() {
      this.ignoreHistory = true;
      this.redo();
      this.set("options", this.options);
    }, this));

    // Generate image
    this.interface.on("generate", _.bind(this.generate, this));

    // Reset options
    this.interface.on("resetOptions", _.bind(function() {
      this.reset();
      this.set("options", this.options);
    }, this));

    // General toggle event functions
    this.interface.on("toggle", _.bind(function(e, property) {
      this.set(property, !this.get(property));
    }, this));

    // General set event functions
    this.interface.on("set", _.bind(function(e, property, value) {
      this.set(property, value);
    }, this));

    // Update marker property
    this.interface.on("setMarker", _.bind(function(e, markerIndex, property, value) {
      var marker = this.get("options.markers." + markerIndex);
      if (marker) {
        this.set("options.markers." + markerIndex + "." + property, value);
      }
    }, this));

    // Update drawing styles
    this.interface.on("setDrawing", _.bind(function(e, property, value) {
      this.set("options.drawingStyles." + property, value);
    }, this));

    // Move marker to center of map
    this.interface.on("marker-to-center", _.bind(function(e, markerIndex) {
      var center = this.map.getCenter();
      var change = {};
      change["options.markers." + markerIndex + ".lat"] = center.lat;
      change["options.markers." + markerIndex + ".lng"] = center.lng;
      this.set(change);
    }, this));

    // Center map around marker
    this.interface.on("center-to-marker", _.bind(function(e, markerIndex) {
      var marker = this.get("options.markers." + markerIndex);
      if (marker) {
        this.set({
          "options.lat": marker.lat,
          "options.lng": marker.lng
        });
      }
    }, this));

    // Remove marker
    this.interface.on("remove-marker", _.bind(function(e, markerIndex) {
      this.options.markers.splice(markerIndex, 1);
    }, this));

    // Add marker
    this.interface.on("add-marker", _.bind(function() {
      var center = this.map.getCenter();
      var marker = {
        lat: center.lat,
        lng: center.lng
      };
      this.get("options.markers").push(this.updateMarker(marker));
    }, this));

    // Initialize map parts
    this.drawMaps();
  },

  // Wrappers to ractive set
  set: function(key, value) {
    if (this.interface) {
      this.interface.set(key, value);
    }
  },

  // Wrappers to ractive get
  get: function(key) {
    if (this.interface) {
      return this.interface.get(key);
    }

    return undefined;
  },

  // Draw map parts
  drawMaps: function() {
    this.drawMap();
    this.drawGeoJSON();
    this.drawMarkers();
    this.drawMinimap();
    this.drawDrawingLayer();

    // Some style fixes
    this.fixMapVerticalAlign();
  },

  // Update options
  updateOptions: function() {
    var options = this.options;

    // Allow for any custom changes
    options = this.alterOptions("preDraw", this.options);

    // Update markers with defaults
    _.each(options.markers, _.bind(function(m, mi) {
      options.markers[mi] = this.updateMarker(options.markers[mi]);
    }, this));

    // Tilesets can be just a URL, or an object with a URL and
    // preview
    options.tilesets = this.parseTilesets(options.tilesets);

    // Create an "invisible" drawing style since we render
    // it separately
    options.drawingStylesInvisible = _.clone(options.drawingStyles);
    options.drawingStylesInvisible.opacity = 0;
    options.drawingStylesInvisible.fillOpacity = 0;

    return options;
  },

  // Alter options with custom function
  alterOptions: function(property, options) {
    if (_.isFunction(this.options[property])) {
      return _.bind(this.options[property], this)(options);
    }

    return options;
  },

  // Make main map
  drawMap: function(recenter) {
    recenter = _.isUndefined(recenter) ? true : recenter;
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

    // Determine size of map.  Use options if available, or check for
    // number, or use size of container
    width = _.size(this.options.widths) ?
      this.options.widths[this.options.width] :
      _.isNumber(this.options.width) ? this.options.width :
      mapEl.getBoundingClientRect().width;

    height = _.size(this.options.ratios) ?
      width / this.options.ratios[this.options.ratio] :
      _.isNumber(this.options.ratio) ? width / this.options.ratio :
      mapEl.getBoundingClientRect().height;

    mapEl.style.width = width + "px";
    mapEl.style.height = height + "px";

    // Make map and set view
    this.map = new L.Map(mapEl.id, {
      minZoom: this.options.minZoom,
      maxZoom: this.options.maxZoom,
      attributionControl: false,
      trackResize: false
    });
    this.map.setView([view[0], view[1]], view[2]);

    // Tile layer
    this.mapLayer = this.makeTileLayer(this.options.tilesets[this.options.tileset], -100);
    this.map.addLayer(this.mapLayer);

    // React to map view change except when drawing
    this.map.on("moveend", _.bind(function() {
      var center = this.map.getCenter();
      if (this.isDrawing) {
        return;
      }

      this.set({
        "options.lat": center.lat,
        "options.lng": center.lng,
        "options.zoom": this.map.getZoom()
      });
    }, this));
  },

  // Get geojson from draw layer
  getGeoJSON: function() {
    var features = [];
    this.drawLayer.eachLayer(function(l) {
      if (l && l.toGeoJSON) {
        features.push(l.toGeoJSON());
      }
    });

    this.options.geojson = {
      type: "FeatureCollection",
      features: features
    };

    // Redraw
    if (this.geojsonCanvasLayer) {
      this.interface.update();
    }

    return this.options.geojson;
  },

  // Set geojson to draw layer
  setGeoJSON: function() {
    if (this.drawLayer && this.options.geojson) {
      this.drawLayer.clearLayers();

      // Add geojson layers then add to editing layer group
      L.geoJson(this.options.geojson, {
        style: _.clone(this.options.drawingStylesInvisible)
      }).eachLayer(_.bind(function(l) {
        l.addTo(this.drawLayer);
      }, this));
    }
  },

  // Draw editing layer
  drawDrawingLayer: function() {
    // Draw layer
    if (this.options.drawing) {
      this.drawLayer = new L.FeatureGroup();
      this.map.addLayer(this.drawLayer);

      // Initialise the draw control
      this.mapDraw = new L.Control.Draw({
        draw: {
          marker: false,

          // Not sure how to render a circle yet
          circle: false,

          polyline: {
            metric: (navigator.language !== "en-us" && navigator.language !== "en-US"),
            shapeOptions: _.clone(this.options.drawingStyles)
          },
          polygon: {
            metric: (navigator.language !== "en-us" && navigator.language !== "en-US"),
            shapeOptions: _.clone(this.options.drawingStyles)
          },
          rectangle: {
            metric: (navigator.language !== "en-us" && navigator.language !== "en-US"),
            shapeOptions: _.clone(this.options.drawingStyles)
          }
        },
        edit: {
          featureGroup: this.drawLayer,
          edit: {
            selectedPathOptions: _.clone(this.options.drawingStyles)
          }
        }
      });
      this.map.addControl(this.mapDraw);

      // Add any existing geojson
      this.setGeoJSON();

      // Hook up draw events
      this.map.on("draw:created", _.bind(function(e) {
        e.layer.setStyle(_.clone(this.options.drawingStylesInvisible));
        this.drawLayer.addLayer(e.layer);
        this.getGeoJSON();
      }, this));

      this.map.on("draw:edited", _.bind(this.getGeoJSON, this));
      this.map.on("draw:deleted", _.bind(this.getGeoJSON, this));

      // Mark as editing so we don't redraw
      this.map.on("draw:drawstart", _.bind(function() {
        this.isDrawing = true;
      }, this));

      this.map.on("draw:drawstop", _.bind(function() {
        this.isDrawing = false;
      }, this));

      this.map.on("draw:editstart", _.bind(function() {
        this.isDrawing = true;
      }, this));

      this.map.on("draw:editstop", _.bind(function() {
        this.isDrawing = false;
      }, this));

      this.map.on("draw:deletestart", _.bind(function() {
        this.isDrawing = true;
      }, this));

      this.map.on("draw:deletestop", _.bind(function() {
        this.isDrawing = false;
      }, this));

      // TODO: When deleting, the canvas rendering is there even after you
      // delete it, and doesn't show until you hit save.
    }
  },

  // Draw geojson layer.  Take geojson created from draw layer and render it as
  // canvas layer
  drawGeoJSON: function() {
    this.geojsonCanvasLayer = L.tileLayer.canvas();
    if (!this.options.geojson) {
      return this.geojsonCanvasLayer;
    }

    this.geojsonCanvasLayer.drawTile = _.bind(this.drawGeoJSONTile, this);
    this.map.addLayer(this.geojsonCanvasLayer);
  },

  // Draw minimap
  drawMinimap: function() {
    var miniEl;

    // Don't worry if not on
    if (!this.options.mini) {
      return;
    }

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
    this.minimapLayer = this.makeTileLayer(this.options.tilesets[this.options.tileset]);

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

  // Make tile layer
  makeTileLayer: function(tileset, zIndex) {
    var options = tileset.options ? _.clone(tileset.options) : {};
    options = zIndex ? _.extend(options, { zIndex: zIndex }) : options;
    var mapLayer;

    if (tileset.type === "BingLayer") {
      mapLayer = new L.BingLayer(tileset.key, options);
    }
    else {
      mapLayer = new L.TileLayer(tileset.url, options);
    }

    return mapLayer;
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
        var width = this.options.miniAimingMinWidth ?
          Math.max(this.options.miniAimingMinWidth, se.x - nw.x) :
          se.x - nw.x;
        var height = this.options.miniAimingMinHeight ?
          Math.max(this.options.miniAimingMinHeight, se.y - nw.y) :
          se.y - nw.y;
        var adjustX = this.options.miniAimingMinWidth && width > se.x - nw.x ?
          ((se.x - nw.x) - width) / 2 : 0;
        var adjustY = this.options.miniAimingMinHeight && height > se.y - nw.y ?
          ((se.y - nw.y) - height) / 2 : 0;

        // Draw box
        ctx.beginPath();
        ctx.rect(nw.x - dim.nwPoint.x + adjustX, nw.y - dim.nwPoint.y + adjustY, width, height);
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

  // Update marker with default values
  updateMarker: function(marker) {
    return _.extend(_.clone(this.options.markerDefaults), marker);
  },

  // Set up marker canvase layer and draw all markers
  drawMarkers: function() {
    // Remove existing layer if there
    if (this.markerCanvas && this.map && this.markerCanvas._map) {
      this.map.removeLayer(this.markerCanvas);
    }

    // Set up canvas layer
    this.markerCanvas = L.tileLayer.canvas();
    this.markerCanvas.drawTile = _.bind(this.drawMarkerTile, this);
    this.markerCanvas.addTo(this.map);

    // Make draggable marker
    _.each(this.options.markers, _.bind(function(m, mi) {
      this.draggableMarker(this.options.markers[mi], mi);
    }, this));
  },

  // Make marker draggable via an invisble marker
  draggableMarker: function(marker, markerIndex) {
    this.draggableMarkers = this.draggableMarkers || {};
    var draggable = this.draggableMarkers[markerIndex];

    // Remove first
    if (draggable && this.map && draggable._map) {
      draggable.clearAllEventListeners();
      this.map.removeLayer(draggable);
    }

    // Create marker
    this.draggableMarkers[markerIndex] = draggable = L.marker(L.latLng(marker.lat, marker.lng), {
      icon: this.options.draggableMarker,
      draggable: true,
      opacity: 0,
      title: "Drag marker here"
    }).addTo(this.map);

    // Hover over
    draggable.on("mouseover", function(e) {
      if (!draggable.isDragging) {
        e.target.setOpacity(0.3);
      }
    });

    // Hover out
    draggable.on("mouseout", function(e) {
      if (!draggable.isDragging) {
        e.target.setOpacity(0);
      }
    });

    // Start dragging
    draggable.on("dragstart", function(e) {
      draggable.isDragging = true;
      e.target.setOpacity(1);
    });

    // Start dragging
    draggable.on("dragend", _.bind(function(e) {
      draggable.isDragging = false;
      e.target.setOpacity(0);

      // Set lat, lng
      var l = e.target.getLatLng();
      marker.lat = l.lat;
      marker.lng = l.lng;
      this.interface.update("options.markers");
    }, this));
  },

  // Marker canvas layer tile draw function
  drawMarkerTile: function(canvas, tilePoint, zoom) {
    var ctx = canvas.getContext("2d");

    // Clear out tile
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each marker
    _.each(this.options.markers, _.bind(function(m) {
      this.drawMarker(m, canvas, tilePoint, zoom);
    }, this));
  },

  // Marker layer draw handler
  drawMarker: function(marker, canvas, tilePoint, zoom) {
    var ctx = canvas.getContext("2d");
    var placement;
    var textWidth;
    var labelWidth;

    // Handle line breaks in text
    var text = marker.text.split("<br>");
    text = _.map(text, function(t) {
      return t.trim();
    });

    // Determine lines values
    var lines = text.length;
    var lineHeight = 1.25;
    var labelHeight = ((marker.fontSize * lineHeight) * lines) + (marker.padding * 2);

    // Get some dimensions
    var dim = {};
    dim.nwPoint = tilePoint.multiplyBy(256);
    dim.sePoint = dim.nwPoint.add(new L.Point(256, 256));
    dim.nwCoord = this.map.unproject(dim.nwPoint, zoom, true);
    dim.seCoord = this.map.unproject(dim.sePoint, zoom, true);
    dim.bCoord = L.latLngBounds([[dim.nwCoord.lat, dim.seCoord.lng],
      [dim.seCoord.lat, dim.nwCoord.lng]]);
    dim.bPoint = [dim.nwPoint, dim.sePoint];
    dim.locCoord = L.latLng(marker.lat, marker.lng);
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
      ctx.translate(placement.x - marker.radius, placement.y - marker.radius);
      ctx.fillStyle = marker.background;
      ctx.fillRect(0, 0,
        marker.radius * 2,
        marker.radius * 2
      );
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.closePath();

      // Label connection line
      ctx.beginPath();
      ctx.translate(placement.x - (marker.labelWidth / 2),
        placement.y - marker.radius - marker.labelDistance);
      ctx.fillStyle = marker.background;
      ctx.fillRect(0, 0,
        marker.labelWidth,
        marker.labelDistance
      );
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.closePath();

      // Determine width of text
      ctx.beginPath();
      ctx.font = marker.fontSize + "px " + marker.font;
      ctx.fillStyle = marker.foreground;
      ctx.textAlign = "center";

      // Get the width of the longest text
      textWidth = _.max(text, function(t) {
        return ctx.measureText(t).width;
      });

      textWidth = ctx.measureText(textWidth).width;
      labelWidth = textWidth + marker.padding * 2;
      ctx.closePath();

      // Make label rectangle
      ctx.beginPath();
      ctx.translate(placement.x - (labelWidth / 2),
        placement.y - marker.radius - marker.labelDistance - labelHeight);
      ctx.fillStyle = marker.background;
      ctx.fillRect(0, 0, labelWidth, labelHeight);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.closePath();

      // Add label(s)
      _.each(text, _.bind(function(t, ti) {
        // There's a tad extra space at bottom of text
        var offset = 1;

        ctx.beginPath();
        ctx.translate(placement.x,
          placement.y - marker.radius - marker.labelDistance -
          labelHeight + marker.padding + offset +
          ((marker.fontSize * lineHeight) * (ti)));

        ctx.font = marker.fontSize + "px " + marker.font;
        ctx.fillStyle = marker.foreground;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(t, 0, 0);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.closePath();
      }, this));
    }
  },

  drawGeoJSONTile: function(canvas, tilePoint, zoom) {
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
      // Draw features
      _.each(this.options.geojson.features, _.bind(function(f) {
        var styles = _.clone(this.options.drawingStyles);

        // Determine type
        if (f.geometry.type === "Polygon") {
          // Go through each part.  Not sure if this is best way, and if
          // canvas polygon could handle inner ring stuff
          ctx.beginPath();

          _.each(f.geometry.coordinates, _.bind(function(a) {
            // Go through each point
            _.each(a, _.bind(function(b, bi) {
              var p = this.map.project([b[1], b[0]], zoom, true);

              if (bi === 0) {
                ctx.moveTo(p.x - dim.nwPoint.x, p.y - dim.nwPoint.y);
              }
              else {
                ctx.lineTo(p.x - dim.nwPoint.x, p.y - dim.nwPoint.y);
              }
            }, this));

            // Close and style
            ctx.closePath();
            ctx = this.leafletStylesToCanvas(styles, ctx);
          }, this));
        }
        else if (f.geometry.type === "LineString") {
          styles.fill = false;
          ctx.beginPath();

          _.each(f.geometry.coordinates, _.bind(function(a, ai) {
            var p = this.map.project([a[1], a[0]], zoom, true);

            if (ai === 0) {
              ctx.moveTo(p.x - dim.nwPoint.x, p.y - dim.nwPoint.y);
            }
            else {
              ctx.lineTo(p.x - dim.nwPoint.x, p.y - dim.nwPoint.y);
            }

            // Style
            ctx = this.leafletStylesToCanvas(styles, ctx);
          }, this));
        }
      }, this));
    }
  },

  // Generate image
  generate: function() {
    // Hide parts not to render
    this.getEl(".locator-map .leaflet-control-zoom").style.display = "none";

    if (this.options.mini) {
      this.getEl(".locator-map .leaflet-control-minimap").style.display = "none";
    }

    if (this.options.drawing) {
      this.getEl(".locator-map .leaflet-draw").style.display = "none";
    }

    // Turn main map into canvas
    _.delay(_.bind(function() {
      html2canvas(this.getEl(".locator-map"), {
        useCORS: true,
        onrendered: _.bind(function(mapCanvas) {
          // Re-display parts
          this.getEl(".locator-map .leaflet-control-zoom").style.display = "block";

          if (this.options.mini) {
            this.getEl(".locator-map .leaflet-control-minimap").style.display = "block";
          }

          if (this.options.drawing) {
            this.getEl(".locator-map .leaflet-draw").style.display = "block";
          }

          // Make mini map if needed
          if (!this.options.mini) {
            this.preview(mapCanvas.getContext("2d"));
            this.export(mapCanvas.getContext("2d"));
            return;
          }

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
    }, this), 300);
  },

  // Draw minimap as canvas
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

    // Uncomment for some more debugging
    //this.getEl(".preview").style.display = "block";
  },

  // Export/download.
  export: function(mapCtx) {
    var name = (this.options.markers && this.options.markers[0]) ?
      this.options.markers[0].text : "";
    var download = this.getEl(".download-link");
    download.href = mapCtx.canvas.toDataURL();
    download.download = utils.makeID(name) + ".png";
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
  },

  // Leaflet path styles to canvas context
  // Borrowed from:
  // https://github.com/Leaflet/Leaflet/blob/2a5857d172f0fa982c6c54fa5511e9b29ae13ec7/src/layer/vector/Canvas.js#L175
  leafletStylesToCanvas: function(styles, context) {
    if (styles.fill) {
      context.globalAlpha = _.isUndefined(styles.fillOpacity) ? 1 : styles.fillOpacity;
      context.fillStyle = styles.fillColor || styles.color;
      context.fill(styles.fillRule || "evenodd");
    }

    if (styles.stroke && styles.weight !== 0) {
      context.globalAlpha = _.isUndefined(styles.opacity) ? 1 : styles.opacity;
      context.strokeStyle = styles.color;
      context.lineCap = styles.lineCap || "round";
      context.lineJoin = styles.lineJoin || "round";
      context.lineWidth = styles.weight;
      context.stroke();
    }

    return context;
  },

  // Save
  save: function(history) {
    var options = utils.clone(this.options);

    // Remove some parts
    delete options.draggableMarker;
    delete options.template;
    _.each(options, function(o, oi) {
      if (_.isFunction(o)) {
        delete options[oi];
      }
    });

    // Save to browser in case of refresh
    window.localStorage.setItem("options", JSON.stringify(options));

    // Save to history
    if (history) {
      if (this.historyIndex >= 0 && this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      this.history.push(utils.clone(options));
      this.historyIndex = this.history.length - 1;
      this.canDo();
    }
  },

  // Load
  load: function(options) {
    var savedOptions = window.localStorage.getItem("options");
    if (savedOptions) {
      savedOptions = JSON.parse(savedOptions);
      return _.extend(options, savedOptions);
    }
    else {
      return options;
    }
  },

  // Reset all options
  reset: function() {
    this.options = _.extend(this.options, utils.clone(this.originalOptions));
  },

  // Undo
  undo: function() {
    if (this.historyIndex > 0) {
      this.historyIndex = this.historyIndex - 1;
      this.options = _.extend(this.options, utils.clone(this.history[this.historyIndex]));
    }

    this.canDo();
  },

  // Redo
  redo: function() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex = this.historyIndex + 1;
      this.options = _.extend(this.options, utils.clone(this.history[this.historyIndex]));
    }

    this.canDo();
  },

  // Determine if can undo/redo
  canDo: function() {
    this.set({
      canUndo: this.historyIndex > 0,
      canRedo: (this.historyIndex < this.history.length - 1)
    });
  },

  // Standarize tileset options
  parseTilesets: function(tilesets) {
    _.each(tilesets, function(t, ti) {
      // Make into object
      if (_.isString(t)) {
        tilesets[ti] = {
          url: t
        };
      }

      // Check for preview
      if (!tilesets[ti].preview && tilesets[ti].url) {
        tilesets[ti].preview = tilesets[ti].url.replace("{s}", "a")
          .replace("{x}", "301")
          .replace("{y}", "385")
          .replace("{z}", "10");
      }
    });

    return tilesets;
  },

  // Some hackery to fix the map vertical alignment
  fixMapVerticalAlign: function() {
    var display = this.getEl(".locator-display");

    if (dom.isOverflowed(display, "y")) {
      display.classList.add("overflowed-y");
    }
    else {
      display.classList.remove("overflowed-y");
    }
  }
});

// Export
module.exports = Locator;
