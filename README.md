# Locator

Map locator image generator (needs better name)

## Project page

The main project page is hosted on Github Pages through this repository.

We want to include the Bower dependencies in this branch, so this is a helpful command to make that all happen at once (assuming master is up to date).

* `git checkout gh-pages && git merge master && bower install && git add -u bower_components -f && git commit -m "Adding bower dependencies for project page" && git push origin gh-pages && git checkout master && bower install`
* If you are not updating the Bower dependencies: `git checkout gh-pages && git merge master && git push origin gh-pages && git checkout master && bower install`

## Notes

* http://bl.ocks.org/sumbera/11114288
