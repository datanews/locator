# ractive-events-tap

*Find more Ractive.js plugins at [ractivejs.org](http://docs.ractivejs.org/latest/plugins)*

Tap/fastclick event plugin for [Ractive.js](http://ractivejs.org) - eliminates the 300ms delay on touch-enabled devices, and normalises across mouse, touch and pointer events.

Pressing the spacebar while an element is focused, which would normally dispatch a `click` event, is also equivalent to 'tapping' it.

```html
<button on-tap='activate()'>
  tap me!
</button>
```


## Installation

Install from npm...

```bash
npm install ractive-events-tap
```

...or download it and add it as a script tag to your page:

```html
<script src='ractive.js'></script> <!-- must go first! -->
<script src='ractive-events-tap.js'></script>
```


## Use as a module...

**Note: previous versions of this plugin would 'self-register'. If you are using a module system such as Browserify, Webpack or RequireJS, that's no longer the case - you must explicitly register the plugin.**


### CommonJS

```js
var Ractive = require( 'ractive' );

// To use the tap event with a specific instance
var ractive = new Ractive({
  el: 'body',
  template: myTemplate,
  events: {
    tap: require( 'ractive-events-tap' )
  }
});

// To use it with components
MyTappableComponent = Ractive.extend({
  template: componentTemplate,
  events: {
    tap: require( 'ractive-events-tap' )
  }
});

// To make it globally available to *all* instances
Ractive.events.tap = require( 'ractive-events-tap' );
```


### AMD

```js
define([ 'ractive', 'ractive-events-tap' ], function ( Ractive, tap ) {
  var ractive = new Ractive({
    el: 'body',
    template: myTemplate,
    events: {
      tap: tap
    }
  });
});
```


### ES6

```js
import Ractive from 'ractive';

var ractive = new Ractive({
  el: 'body',
  template: myTemplate,
  events: { tap }
});
```


## Use as a `<script>` tag

If you include ractive-events-tap as a script tag, it will 'self-register' with the global `Ractive` object, and all Ractive instances will be able to use it.



## License

MIT
