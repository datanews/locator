# Locator

A customizable, in-browser [locator map](https://en.wikipedia.org/wiki/Locator_map) creator.

Checkout the [demo](//datanews.github.com/locator/).

Locator is meant to be deployed and customized by your organization so that your staff (i.e. reports, editors, publishers) or who ever you want can create maps that are appropriate for your organization.  The options are designed so that you can make Locator fit the design needs of your organization and have control of what parts your users interface with.

Locator only works in [Google Chrome](https://www.google.com/chrome/) at the moment.  Also, given the goal of Locator, it does not work well on small screens.

![Locator example 1](https://datanews.github.io/locator/examples/example-01.png)
![Locator example 2](https://datanews.github.io/locator/examples/example-02.png)
![Locator example 3](https://datanews.github.io/locator/examples/example-03.png)

## Deploy

Locator is a browser application.  Include the JS, CSS, and dependencies found in the `dist`.  The `bundled` versions include dependencies.

```html
<!doctype html>
<html class="no-js" lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Your Locator</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="dist/locator.bundled.min.css">
  </head>
  <body>
    <div class="locator-container"></div>

    <script src="dist/locator.bundled.min.js"></script>

    <script type="text/javascript">
      // Create locator here
      var l = new window.Locator({
        el: ".locator-container",
        title: "Locator for You",
        footer: "If you need help please contact the team@your-org.com.",
        // More options ...
      });
    </script>
  </body>
</html>
```

## Options

Locator comes with many options, though all have sane defaults and aren't necessary besides `el`.

*Locator keeps a history of the options; this allows for undo and redo actions, but if you are are updating options in the code, you may not see any updates until you hit the* **Reset** *button in the top right*

* `el`: CSS selector to element where Locator will render on the page.
* `title`: The title used in the top of the controls section.  Can use HTML.
* `footer`: Content of footer in the controls section.  Can use HTML.

### Map

* `widths`: An object defining the width options which are pixel number values.  Having 1 value here will remove the option from the interface.
* `width`: The key of the `widths` object to use by default.
* `ratios`: The width to height ratio options as numbers.  Having 1 value here will remove the option from the interface.
* `ratio`: The key of the `ratios` object to use by default.
* `tilesets`: A object describing the available tilesets.  A tileset can be a string that is a URL template, or an object like the following:  
```js
"CartoDB Positron": {
  url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  attribution: "&copy; <a target=\"_blank\" href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a target=\"_blank\" href=\"http://cartodb.com/attributions\">CartoDB</a>"
}
```   
If this option only has 1 value, then the control to choose the tileset will not show up.
* `tileset`: The default tileset to use; a key value from `tilesets`.
* `zoom`: Zoom level of the map.
* `minZoom`: Integer minimum level of zoom for the map.
* `maxZoom`: Integer maximum level of zoom for the map.
* `lat`: Center latitude of the map.
* `lng`: Center longitude of the map.

### Attribution

* `embedAttribution`: Boolean of whether the attribution from the `tileset` will overlay on the map and be included in the exported image.
* `overrideAttribution`: Text to override the attribution for the map.

### Markers

* `markers`: Array of objects to describe markers.  Each object should contain a `text`, `lat`, and `lng` property.
* `markerDefaults`: The default style for markers.  The options and defaults are:  
```js
{
  text: "",
  background: "rgba(0, 0, 0, 0.9)",
  foreground: "rgba(255, 255, 255, 0.9)",
  radius: 5,
  fontSize: 16,
  font: "'Open Sans', Helvetica, Arial, sans-serif",
  labelDistance: 20,
  labelWidth: 3,
  padding: 10
}
```
* `markerBackgrounds`: Array of colors for the user to choose from for each marker.  Having 1 or none will remove the option from the interface.
* `markerForegrounds`: Array of colors for the user to choose from for each marker.  Having 1 or none will remove the option from the interface.
* `draggableMarker`: A [Leafet Icon](http://leafletjs.com/reference.html#icon) to be used as the draggable part of the marker.

### Drawing

* `drawing`: Boolean to enable or disable the ability to draw shapes on the map.
* `drawingStyles`: The style for the shapes.  See *Path options* below.
* `geojson`: Default GeoJSON to include on the map.
* `drawingStrokes`: Array of colors for the user to choose from for the stroke color for shapes.  Having 1 or none will remove the option from the interface.
* `drawingFills`: Array of colors for the user to choose from for the fill color for shapes.  Having 1 or none will remove the option from the interface.

### Mini-map

* `mini`: Boolean to enable or disable the mini-map.
* `miniControl`: Boolean to enable or disable the mini-map interface control, as well as the zoom offset control.
* `miniWidth`: Width as a number of pixels or as a percent of the width of the full map such as `"15w"`.
* `miniHeight`: Height as a number of pixels or as a percent of the width of the full map such as `"15w"`.
* `miniZoomOffset`: An integer that defines the difference in zoom levels from the large map to the mini-map.  The default is `-6`.
* `miniExtentStyles`: Object to describe the stylings for the mini-map square.  See *Path options* below.
* `miniStyles`: An object that describes how the mini-map is displayed on the map.  The options and defaults are:  
```js
{
  backgroundColor: "#FFFFFF",
  padding: 3,
  shadow: true,
  shadowColor: "rgba(0, 0, 0, 0.65)",
  shadowBlur: 5,
  shadowOffsetX: 1,
  shadowOffsetY: 1
}
```
* `miniAimingMinWidth`: Minimum width in pixels for the aiming rectangle in the mini-map.  Default is `8`.
* `miniAimingMinHeight`: Minimum height in pixels for the aiming rectangle in the mini-map.  Default is `6`.

### Interface

* `controlsOpen`: Boolean on whether the controls are open by default.
* `centerToMarker`: Boolean to allow each marker to have the action to center the map on the marker.
* `markerToCenter`: Boolean to allow each marker to have the action to move the marker to the center of the map.

### Other

* `template`: This is the HTML template used for Locator.  If you need to change the HTML of Locator, this is the place to do it.  Make sure there are not options or CSS to accomplish your change first.
* `superClass`: CSS class to add to the top level container of the Locator template.
* `geocoder`: Function that handles the geocoding.  Defaults to using Google's geocoding service.  It should be in the form:  
```js
geocoder: function(address, done) {
  var a = yourGeoCoderThing(address);
  done(a.lat, a.lng);
}
```  
Set to false to not use a geocoder and simply have a latitude and longitude input.
`preDraw`: A hook function that happens right before the map is re-rendered which occurs when options get updated.  This gets passed the current options object.  For instance:  
```js
preDraw: function(options) {
  if (options.tileset === "Stamen Toner") {
    options.embedAttribution = true;
  }
}
```

### Path options

The path options are based from the [Leaflet Path Options](http://leafletjs.com/reference.html#path-options) except that Locator translates these to canvas operations for rendering into an image.  This means not all properties are supported.  These are probably all you need:

* `fill`: Boolean on whether to fill.
* `stroke`: Boolean on whether to stroke.
* `color`: Stroke color.
* `weight`: Stroke width.
* `opacity`: Stroke opacity.
* `fillColor`: Fill color.
* `fillOpacity`: Fill opacity.

## Troubleshooting and common issues

Locator only works in [Google Chrome](https://www.google.com/chrome/) at the moment.

If you are having any problems, please feel free to create an issue in the issue queue.

Do keep in mind that Locator is pushing some limits of the browser and the dependencies it uses, so it may have some bugs.

## Development

1. Make sure you have [Node](https://nodejs.org/en/) and [git](https://git-scm.com/) installed.
1. Get code: `git clone https://github.com/datanews/locator.git && cd locator`
1. Install dependencies: `npm install`
1. Make a new branch for your work similar to: `git checkout -b bugfix-fixing-this-bug`
1. Code it up.
1. See *Build* below.

## Build

Build is managed with [Gulp](http://gulpjs.com/).

1. Install dependencies with `npm install gulp -g && npm install`.
1. `gulp`: This command will do the default build which combines, lints, etc files from the `src` directory into the `dist` directory.  The `bundled` version can take a moment since it is including dependencies.
1. `gulp server`: This starts a webserver for development and watches for changes in the code.

## Project page

The main project page is hosted on Github Pages through this repository.  A one-liner to push what is in master up to `gh-pages`:

    git checkout gh-pages && git merge master && git push origin gh-pages && git checkout master && bower install

## Releases

To create a new version/release, follow these steps.

1. Update `package.json`.
2. Generate the Changelog with [Github Changelog Generator](https://github.com/skywinder/github-changelog-generator): `github_changelog_generator --future-release X.X.X`
3. Commit: `git add . && git commit -m "Version X.X.X"`
4. Tag: `git tag X.X.X`
5. Push: `git push origin master --tags`
6. Make [Github release](https://github.com/datanews/locator/releases/new) with a title named after a [cartographer](https://en.wikipedia.org/wiki/List_of_cartographers).

## Hacks

This project is pushing the limits of browsers and the consistency of their rendering and APIs.  This means we have to hack some libraries to make work; these are stored in `libs`;

* [html2canvas](https://github.com/niklasvh/html2canvas) has been altered to Make the canvas dimensions integers which alleviates some blurring issues.  In function: `Util.Bounds`
    * [Relevant issue](https://github.com/niklasvh/html2canvas/issues/576).
    * No pull request was created because it is unsure if this is actually the best way to fix this issue.
* [Ractive slide transition](https://ractivejs.github.io/ractive-transitions-slide/) is not in NPM so included here from [this file](https://ractivejs.github.io/ractive-transitions-slide/ractive-transitions-slide.js).
