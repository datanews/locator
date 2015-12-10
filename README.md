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

* `git checkout gh-pages && git merge master && bower install && git add bower_components -f && git add -u bower_components && git commit -m "Adding bower dependencies for project page" && git push origin gh-pages && git checkout master && bower install`
* If you are not updating the Bower dependencies: `git checkout gh-pages && git merge master && git push origin gh-pages && git checkout master && bower install`

## Notes

* http://bl.ocks.org/sumbera/11114288
