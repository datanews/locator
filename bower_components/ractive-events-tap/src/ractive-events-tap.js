const DISTANCE_THRESHOLD = 5; // maximum pixels pointer can move before cancel
const TIME_THRESHOLD = 400;   // maximum milliseconds between down and up before cancel

export default function tap ( node, callback ) {
	return new TapHandler( node, callback );
}

function TapHandler ( node, callback ) {
	this.node = node;
	this.callback = callback;

	this.preventMousedownEvents = false;

	this.bind( node );
}

TapHandler.prototype = {
	bind ( node ) {
		// listen for mouse/pointer events...
		if ( window.navigator.pointerEnabled ) {
			node.addEventListener( 'pointerdown', handleMousedown, false );
		} else if ( window.navigator.msPointerEnabled ) {
			node.addEventListener( 'MSPointerDown', handleMousedown, false );
		} else {
			node.addEventListener( 'mousedown', handleMousedown, false );
		}

		// ...and touch events
		node.addEventListener( 'touchstart', handleTouchstart, false );

		// native buttons, and <input type='button'> elements, should fire a tap event
		// when the space key is pressed
		if ( node.tagName === 'BUTTON' || node.type === 'button' ) {
			node.addEventListener( 'focus', handleFocus, false );
		}

		node.__tap_handler__ = this;
	},

	fire ( event, x, y ) {
		this.callback({
			node: this.node,
			original: event,
			x,
			y
		});
	},

	mousedown ( event ) {
		if ( this.preventMousedownEvents ) {
			return;
		}

		if ( event.which !== undefined && event.which !== 1 ) {
			return;
		}

		const x = event.clientX;
		const y = event.clientY;

		// This will be null for mouse events.
		const pointerId = event.pointerId;

		const handleMouseup = event => {
			if ( event.pointerId != pointerId ) {
				return;
			}

			this.fire( event, x, y );
			cancel();
		};

		const handleMousemove = event => {
			if ( event.pointerId != pointerId ) {
				return;
			}

			if ( ( Math.abs( event.clientX - x ) >= DISTANCE_THRESHOLD ) || ( Math.abs( event.clientY - y ) >= DISTANCE_THRESHOLD ) ) {
				cancel();
			}
		};

		const cancel = () => {
			this.node.removeEventListener( 'MSPointerUp', handleMouseup, false );
			document.removeEventListener( 'MSPointerMove', handleMousemove, false );
			document.removeEventListener( 'MSPointerCancel', cancel, false );
			this.node.removeEventListener( 'pointerup', handleMouseup, false );
			document.removeEventListener( 'pointermove', handleMousemove, false );
			document.removeEventListener( 'pointercancel', cancel, false );
			this.node.removeEventListener( 'click', handleMouseup, false );
			document.removeEventListener( 'mousemove', handleMousemove, false );
		};

		if ( window.navigator.pointerEnabled ) {
			this.node.addEventListener( 'pointerup', handleMouseup, false );
			document.addEventListener( 'pointermove', handleMousemove, false );
			document.addEventListener( 'pointercancel', cancel, false );
		} else if ( window.navigator.msPointerEnabled ) {
			this.node.addEventListener( 'MSPointerUp', handleMouseup, false );
			document.addEventListener( 'MSPointerMove', handleMousemove, false );
			document.addEventListener( 'MSPointerCancel', cancel, false );
		} else {
			this.node.addEventListener( 'click', handleMouseup, false );
			document.addEventListener( 'mousemove', handleMousemove, false );
		}

		setTimeout( cancel, TIME_THRESHOLD );
	},

	touchdown () {
		const touch = event.touches[0];

		const x = touch.clientX;
		const y = touch.clientY;

		const finger = touch.identifier;

		const handleTouchup = event => {
			const touch = event.changedTouches[0];

			if ( touch.identifier !== finger ) {
				cancel();
				return;
			}

			event.preventDefault(); // prevent compatibility mouse event

			// for the benefit of mobile Firefox and old Android browsers, we need this absurd hack.
			this.preventMousedownEvents = true;
			clearTimeout( this.preventMousedownTimeout );

			this.preventMousedownTimeout = setTimeout( () => {
				this.preventMousedownEvents = false;
			}, 400 );

			this.fire( event, x, y );
			cancel();
		};

		const handleTouchmove = event => {
			if ( event.touches.length !== 1 || event.touches[0].identifier !== finger ) {
				cancel();
			}

			const touch = event.touches[0];
			if ( ( Math.abs( touch.clientX - x ) >= DISTANCE_THRESHOLD ) || ( Math.abs( touch.clientY - y ) >= DISTANCE_THRESHOLD ) ) {
				cancel();
			}
		};

		const cancel = () => {
			this.node.removeEventListener( 'touchend', handleTouchup, false );
			window.removeEventListener( 'touchmove', handleTouchmove, false );
			window.removeEventListener( 'touchcancel', cancel, false );
		};

		this.node.addEventListener( 'touchend', handleTouchup, false );
		window.addEventListener( 'touchmove', handleTouchmove, false );
		window.addEventListener( 'touchcancel', cancel, false );

		setTimeout( cancel, TIME_THRESHOLD );
	},

	teardown () {
		const node = this.node;

		node.removeEventListener( 'pointerdown',   handleMousedown, false );
		node.removeEventListener( 'MSPointerDown', handleMousedown, false );
		node.removeEventListener( 'mousedown',     handleMousedown, false );
		node.removeEventListener( 'touchstart',    handleTouchstart, false );
		node.removeEventListener( 'focus',         handleFocus, false );
	}
};

function handleMousedown ( event ) {
	this.__tap_handler__.mousedown( event );
}

function handleTouchstart ( event ) {
	this.__tap_handler__.touchdown( event );
}

function handleFocus () {
	this.addEventListener( 'keydown', handleKeydown, false );
	this.addEventListener( 'blur', handleBlur, false );
}

function handleBlur () {
	this.removeEventListener( 'keydown', handleKeydown, false );
	this.removeEventListener( 'blur', handleBlur, false );
}

function handleKeydown ( event ) {
	if ( event.which === 32 ) { // space key
		this.__tap_handler__.fire();
	}
}
