# Locator

Map locator image generator (needs better name)

## Build

Build is managed with [Gulp](http://gulpjs.com/).

1. Install dependencies with `npm install gulp -g && npm install`.
1. `gulp`: This command will do the default build which combines, lints, etc files from the `src` directory into the `dist` directory.
1. `gulp server`: This starts a webserver for development and watches for changes in the code.

## Project page

The main project page is hosted on Github Pages through this repository.

We want to include the Bower dependencies in this branch, so this is a helpful command to make that all happen at once (assuming master is up to date).

* `git checkout gh-pages && git merge master && bower install && bower prune && git add bower_components -f && git add -u bower_components && git commit -m "Updating bower dependencies for project page" && git push origin gh-pages && git checkout master && bower install`
* If you are not updating the Bower dependencies: `git checkout gh-pages && git merge master && git push origin gh-pages && git checkout master && bower install`

## Notes

* https://github.com/datadesk/print-map-maker
* http://bl.ocks.org/sumbera/11114288

## Hacks

This project is pushing the limits of browsers and the consistency of their rendering and APIs.  This means we have to hack some libraries to make work; these are stored in `libs`;

* [html2canvas](https://github.com/niklasvh/html2canvas) has been altered to Make the canvas dimensions integers which alleviates some blurring issues.  In function: `Util.Bounds`
    * [Relevant issue](https://github.com/niklasvh/html2canvas/issues/576).
    * No pull request was created because it is unsure if this is actually the best way to fix this issue.
