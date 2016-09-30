/**
 * locator - In browser locator map generator
 * @version v0.0.2
 * @link https://github.com/datanews/locator#readme
 * @license MIT
 * @notes External libraries may be bundled here and their respective, original license applies.
 */
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.Locator=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"html2canvas":[function(_dereq_,module,exports){
module.exports=_dereq_('UzntfK');
},{}],"UzntfK":[function(_dereq_,module,exports){
(function (global){
(function browserifyShim(module, exports, define, browserify_shim__define__module__export__) {
/*
  html2canvas 0.4.1 <http://html2canvas.hertzen.com>
  Copyright (c) 2013 Niklas von Hertzen

  Released under MIT License
*/

(function(window, document, undefined){

"use strict";

var _html2canvas = {},
previousElement,
computedCSS,
html2canvas;

_html2canvas.Util = {};

_html2canvas.Util.log = function(a) {
  if (_html2canvas.logging && window.console && window.console.log) {
    window.console.log(a);
  }
};

_html2canvas.Util.trimText = (function(isNative){
  return function(input) {
    return isNative ? isNative.apply(input) : ((input || '') + '').replace( /^\s+|\s+$/g , '' );
  };
})(String.prototype.trim);

_html2canvas.Util.asFloat = function(v) {
  return parseFloat(v);
};

(function() {
  // TODO: support all possible length values
  var TEXT_SHADOW_PROPERTY = /((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g;
  var TEXT_SHADOW_VALUES = /(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g;
  _html2canvas.Util.parseTextShadows = function (value) {
    if (!value || value === 'none') {
      return [];
    }

    // find multiple shadow declarations
    var shadows = value.match(TEXT_SHADOW_PROPERTY),
      results = [];
    for (var i = 0; shadows && (i < shadows.length); i++) {
      var s = shadows[i].match(TEXT_SHADOW_VALUES);
      results.push({
        color: s[0],
        offsetX: s[1] ? s[1].replace('px', '') : 0,
        offsetY: s[2] ? s[2].replace('px', '') : 0,
        blur: s[3] ? s[3].replace('px', '') : 0
      });
    }
    return results;
  };
})();


_html2canvas.Util.parseBackgroundImage = function (value) {
    var whitespace = ' \r\n\t',
        method, definition, prefix, prefix_i, block, results = [],
        c, mode = 0, numParen = 0, quote, args;

    var appendResult = function(){
        if(method) {
            if(definition.substr( 0, 1 ) === '"') {
                definition = definition.substr( 1, definition.length - 2 );
            }
            if(definition) {
                args.push(definition);
            }
            if(method.substr( 0, 1 ) === '-' &&
                    (prefix_i = method.indexOf( '-', 1 ) + 1) > 0) {
                prefix = method.substr( 0, prefix_i);
                method = method.substr( prefix_i );
            }
            results.push({
                prefix: prefix,
                method: method.toLowerCase(),
                value: block,
                args: args
            });
        }
        args = []; //for some odd reason, setting .length = 0 didn't work in safari
        method =
            prefix =
            definition =
            block = '';
    };

    appendResult();
    for(var i = 0, ii = value.length; i<ii; i++) {
        c = value[i];
        if(mode === 0 && whitespace.indexOf( c ) > -1){
            continue;
        }
        switch(c) {
            case '"':
                if(!quote) {
                    quote = c;
                }
                else if(quote === c) {
                    quote = null;
                }
                break;

            case '(':
                if(quote) { break; }
                else if(mode === 0) {
                    mode = 1;
                    block += c;
                    continue;
                } else {
                    numParen++;
                }
                break;

            case ')':
                if(quote) { break; }
                else if(mode === 1) {
                    if(numParen === 0) {
                        mode = 0;
                        block += c;
                        appendResult();
                        continue;
                    } else {
                        numParen--;
                    }
                }
                break;

            case ',':
                if(quote) { break; }
                else if(mode === 0) {
                    appendResult();
                    continue;
                }
                else if (mode === 1) {
                    if(numParen === 0 && !method.match(/^url$/i)) {
                        args.push(definition);
                        definition = '';
                        block += c;
                        continue;
                    }
                }
                break;
        }

        block += c;
        if(mode === 0) { method += c; }
        else { definition += c; }
    }
    appendResult();

    return results;
};

_html2canvas.Util.Bounds = function (element) {
  var clientRect, bounds = {};

  if (element.getBoundingClientRect){
    clientRect = element.getBoundingClientRect();

    // TODO add scroll position to bounds, so no scrolling of window necessary

    // HACK: Flooring
    bounds.top = Math.floor(clientRect.top);
    bounds.bottom = Math.floor(clientRect.bottom || (clientRect.top + clientRect.height));
    bounds.left = Math.floor(clientRect.left);

    bounds.width = Math.floor(element.offsetWidth);
    bounds.height = Math.floor(element.offsetHeight);
  }

  return bounds;
};

// TODO ideally, we'd want everything to go through this function instead of Util.Bounds,
// but would require further work to calculate the correct positions for elements with offsetParents
_html2canvas.Util.OffsetBounds = function (element) {
  var parent = element.offsetParent ? _html2canvas.Util.OffsetBounds(element.offsetParent) : {top: 0, left: 0};

  return {
    top: element.offsetTop + parent.top,
    bottom: element.offsetTop + element.offsetHeight + parent.top,
    left: element.offsetLeft + parent.left,
    width: element.offsetWidth,
    height: element.offsetHeight
  };
};

function toPX(element, attribute, value ) {
    var rsLeft = element.runtimeStyle && element.runtimeStyle[attribute],
        left,
        style = element.style;

    // Check if we are not dealing with pixels, (Opera has issues with this)
    // Ported from jQuery css.js
    // From the awesome hack by Dean Edwards
    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

    // If we're not dealing with a regular pixel number
    // but a number that has a weird ending, we need to convert it to pixels

    if ( !/^-?[0-9]+\.?[0-9]*(?:px)?$/i.test( value ) && /^-?\d/.test(value) ) {
        // Remember the original values
        left = style.left;

        // Put in the new values to get a computed value out
        if (rsLeft) {
            element.runtimeStyle.left = element.currentStyle.left;
        }
        style.left = attribute === "fontSize" ? "1em" : (value || 0);
        value = style.pixelLeft + "px";

        // Revert the changed values
        style.left = left;
        if (rsLeft) {
            element.runtimeStyle.left = rsLeft;
        }
    }

    if (!/^(thin|medium|thick)$/i.test(value)) {
        return Math.round(parseFloat(value)) + "px";
    }

    return value;
}

function asInt(val) {
    return parseInt(val, 10);
}

function parseBackgroundSizePosition(value, element, attribute, index) {
    value = (value || '').split(',');
    value = value[index || 0] || value[0] || 'auto';
    value = _html2canvas.Util.trimText(value).split(' ');

    if(attribute === 'backgroundSize' && (!value[0] || value[0].match(/cover|contain|auto/))) {
        //these values will be handled in the parent function
    } else {
        value[0] = (value[0].indexOf( "%" ) === -1) ? toPX(element, attribute + "X", value[0]) : value[0];
        if(value[1] === undefined) {
            if(attribute === 'backgroundSize') {
                value[1] = 'auto';
                return value;
            } else {
                // IE 9 doesn't return double digit always
                value[1] = value[0];
            }
        }
        value[1] = (value[1].indexOf("%") === -1) ? toPX(element, attribute + "Y", value[1]) : value[1];
    }
    return value;
}

_html2canvas.Util.getCSS = function (element, attribute, index) {
    if (previousElement !== element) {
      computedCSS = document.defaultView.getComputedStyle(element, null);
    }

    var value = computedCSS[attribute];

    if (/^background(Size|Position)$/.test(attribute)) {
        return parseBackgroundSizePosition(value, element, attribute, index);
    } else if (/border(Top|Bottom)(Left|Right)Radius/.test(attribute)) {
      var arr = value.split(" ");
      if (arr.length <= 1) {
          arr[1] = arr[0];
      }
      return arr.map(asInt);
    }

  return value;
};

_html2canvas.Util.resizeBounds = function( current_width, current_height, target_width, target_height, stretch_mode ){
  var target_ratio = target_width / target_height,
    current_ratio = current_width / current_height,
    output_width, output_height;

  if(!stretch_mode || stretch_mode === 'auto') {
    output_width = target_width;
    output_height = target_height;
  } else if(target_ratio < current_ratio ^ stretch_mode === 'contain') {
    output_height = target_height;
    output_width = target_height * current_ratio;
  } else {
    output_width = target_width;
    output_height = target_width / current_ratio;
  }

  return {
    width: output_width,
    height: output_height
  };
};

function backgroundBoundsFactory( prop, el, bounds, image, imageIndex, backgroundSize ) {
    var bgposition =  _html2canvas.Util.getCSS( el, prop, imageIndex ) ,
    topPos,
    left,
    percentage,
    val;

    if (bgposition.length === 1){
      val = bgposition[0];

      bgposition = [];

      bgposition[0] = val;
      bgposition[1] = val;
    }

    if (bgposition[0].toString().indexOf("%") !== -1){
      percentage = (parseFloat(bgposition[0])/100);
      left = bounds.width * percentage;
      if(prop !== 'backgroundSize') {
        left -= (backgroundSize || image).width*percentage;
      }
    } else {
      if(prop === 'backgroundSize') {
        if(bgposition[0] === 'auto') {
          left = image.width;
        } else {
          if (/contain|cover/.test(bgposition[0])) {
            var resized = _html2canvas.Util.resizeBounds(image.width, image.height, bounds.width, bounds.height, bgposition[0]);
            left = resized.width;
            topPos = resized.height;
          } else {
            left = parseInt(bgposition[0], 10);
          }
        }
      } else {
        left = parseInt( bgposition[0], 10);
      }
    }


    if(bgposition[1] === 'auto') {
      topPos = left / image.width * image.height;
    } else if (bgposition[1].toString().indexOf("%") !== -1){
      percentage = (parseFloat(bgposition[1])/100);
      topPos =  bounds.height * percentage;
      if(prop !== 'backgroundSize') {
        topPos -= (backgroundSize || image).height * percentage;
      }

    } else {
      topPos = parseInt(bgposition[1],10);
    }

    return [left, topPos];
}

_html2canvas.Util.BackgroundPosition = function( el, bounds, image, imageIndex, backgroundSize ) {
    var result = backgroundBoundsFactory( 'backgroundPosition', el, bounds, image, imageIndex, backgroundSize );
    return { left: result[0], top: result[1] };
};

_html2canvas.Util.BackgroundSize = function( el, bounds, image, imageIndex ) {
    var result = backgroundBoundsFactory( 'backgroundSize', el, bounds, image, imageIndex );
    return { width: result[0], height: result[1] };
};

_html2canvas.Util.Extend = function (options, defaults) {
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      defaults[key] = options[key];
    }
  }
  return defaults;
};


/*
 * Derived from jQuery.contents()
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
_html2canvas.Util.Children = function( elem ) {
  var children;
  try {
    children = (elem.nodeName && elem.nodeName.toUpperCase() === "IFRAME") ? elem.contentDocument || elem.contentWindow.document : (function(array) {
      var ret = [];
      if (array !== null) {
        (function(first, second ) {
          var i = first.length,
          j = 0;

          if (typeof second.length === "number") {
            for (var l = second.length; j < l; j++) {
              first[i++] = second[j];
            }
          } else {
            while (second[j] !== undefined) {
              first[i++] = second[j++];
            }
          }

          first.length = i;

          return first;
        })(ret, array);
      }
      return ret;
    })(elem.childNodes);

  } catch (ex) {
    _html2canvas.Util.log("html2canvas.Util.Children failed with exception: " + ex.message);
    children = [];
  }
  return children;
};

_html2canvas.Util.isTransparent = function(backgroundColor) {
  return (backgroundColor === "transparent" || backgroundColor === "rgba(0, 0, 0, 0)");
};
_html2canvas.Util.Font = (function () {

  var fontData = {};

  return function(font, fontSize, doc) {
    if (fontData[font + "-" + fontSize] !== undefined) {
      return fontData[font + "-" + fontSize];
    }

    var container = doc.createElement('div'),
    img = doc.createElement('img'),
    span = doc.createElement('span'),
    sampleText = 'Hidden Text',
    baseline,
    middle,
    metricsObj;

    container.style.visibility = "hidden";
    container.style.fontFamily = font;
    container.style.fontSize = fontSize;
    container.style.margin = 0;
    container.style.padding = 0;

    doc.body.appendChild(container);

    // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever (handtinywhite.gif)
    img.src = "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=";
    img.width = 1;
    img.height = 1;

    img.style.margin = 0;
    img.style.padding = 0;
    img.style.verticalAlign = "baseline";

    span.style.fontFamily = font;
    span.style.fontSize = fontSize;
    span.style.margin = 0;
    span.style.padding = 0;

    span.appendChild(doc.createTextNode(sampleText));
    container.appendChild(span);
    container.appendChild(img);
    baseline = (img.offsetTop - span.offsetTop) + 1;

    container.removeChild(span);
    container.appendChild(doc.createTextNode(sampleText));

    container.style.lineHeight = "normal";
    img.style.verticalAlign = "super";

    middle = (img.offsetTop-container.offsetTop) + 1;
    metricsObj = {
      baseline: baseline,
      lineWidth: 1,
      middle: middle
    };

    fontData[font + "-" + fontSize] = metricsObj;

    doc.body.removeChild(container);

    return metricsObj;
  };
})();

(function(){
  var Util = _html2canvas.Util,
    Generate = {};

  _html2canvas.Generate = Generate;

  var reGradients = [
  /^(-webkit-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
  /^(-o-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
  /^(-webkit-gradient)\((linear|radial),\s((?:\d{1,3}%?)\s(?:\d{1,3}%?),\s(?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)\-]+)\)$/,
  /^(-moz-linear-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)]+)\)$/,
  /^(-webkit-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z\-]+)([\w\d\.\s,%\(\)]+)\)$/,
  /^(-moz-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s?([a-z\-]*)([\w\d\.\s,%\(\)]+)\)$/,
  /^(-o-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z\-]+)([\w\d\.\s,%\(\)]+)\)$/
  ];

  /*
 * TODO: Add IE10 vendor prefix (-ms) support
 * TODO: Add W3C gradient (linear-gradient) support
 * TODO: Add old Webkit -webkit-gradient(radial, ...) support
 * TODO: Maybe some RegExp optimizations are possible ;o)
 */
  Generate.parseGradient = function(css, bounds) {
    var gradient, i, len = reGradients.length, m1, stop, m2, m2Len, step, m3, tl,tr,br,bl;

    for(i = 0; i < len; i+=1){
      m1 = css.match(reGradients[i]);
      if(m1) {
        break;
      }
    }

    if(m1) {
      switch(m1[1]) {
        case '-webkit-linear-gradient':
        case '-o-linear-gradient':

          gradient = {
            type: 'linear',
            x0: null,
            y0: null,
            x1: null,
            y1: null,
            colorStops: []
          };

          // get coordinates
          m2 = m1[2].match(/\w+/g);
          if(m2){
            m2Len = m2.length;
            for(i = 0; i < m2Len; i+=1){
              switch(m2[i]) {
                case 'top':
                  gradient.y0 = 0;
                  gradient.y1 = bounds.height;
                  break;

                case 'right':
                  gradient.x0 = bounds.width;
                  gradient.x1 = 0;
                  break;

                case 'bottom':
                  gradient.y0 = bounds.height;
                  gradient.y1 = 0;
                  break;

                case 'left':
                  gradient.x0 = 0;
                  gradient.x1 = bounds.width;
                  break;
              }
            }
          }
          if(gradient.x0 === null && gradient.x1 === null){ // center
            gradient.x0 = gradient.x1 = bounds.width / 2;
          }
          if(gradient.y0 === null && gradient.y1 === null){ // center
            gradient.y0 = gradient.y1 = bounds.height / 2;
          }

          // get colors and stops
          m2 = m1[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g);
          if(m2){
            m2Len = m2.length;
            step = 1 / Math.max(m2Len - 1, 1);
            for(i = 0; i < m2Len; i+=1){
              m3 = m2[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/);
              if(m3[2]){
                stop = parseFloat(m3[2]);
                if(m3[3] === '%'){
                  stop /= 100;
                } else { // px - stupid opera
                  stop /= bounds.width;
                }
              } else {
                stop = i * step;
              }
              gradient.colorStops.push({
                color: m3[1],
                stop: stop
              });
            }
          }
          break;

        case '-webkit-gradient':

          gradient = {
            type: m1[2] === 'radial' ? 'circle' : m1[2], // TODO: Add radial gradient support for older mozilla definitions
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 0,
            colorStops: []
          };

          // get coordinates
          m2 = m1[3].match(/(\d{1,3})%?\s(\d{1,3})%?,\s(\d{1,3})%?\s(\d{1,3})%?/);
          if(m2){
            gradient.x0 = (m2[1] * bounds.width) / 100;
            gradient.y0 = (m2[2] * bounds.height) / 100;
            gradient.x1 = (m2[3] * bounds.width) / 100;
            gradient.y1 = (m2[4] * bounds.height) / 100;
          }

          // get colors and stops
          m2 = m1[4].match(/((?:from|to|color-stop)\((?:[0-9\.]+,\s)?(?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)\))+/g);
          if(m2){
            m2Len = m2.length;
            for(i = 0; i < m2Len; i+=1){
              m3 = m2[i].match(/(from|to|color-stop)\(([0-9\.]+)?(?:,\s)?((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\)/);
              stop = parseFloat(m3[2]);
              if(m3[1] === 'from') {
                stop = 0.0;
              }
              if(m3[1] === 'to') {
                stop = 1.0;
              }
              gradient.colorStops.push({
                color: m3[3],
                stop: stop
              });
            }
          }
          break;

        case '-moz-linear-gradient':

          gradient = {
            type: 'linear',
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 0,
            colorStops: []
          };

          // get coordinates
          m2 = m1[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);

          // m2[1] == 0%   -> left
          // m2[1] == 50%  -> center
          // m2[1] == 100% -> right

          // m2[2] == 0%   -> top
          // m2[2] == 50%  -> center
          // m2[2] == 100% -> bottom

          if(m2){
            gradient.x0 = (m2[1] * bounds.width) / 100;
            gradient.y0 = (m2[2] * bounds.height) / 100;
            gradient.x1 = bounds.width - gradient.x0;
            gradient.y1 = bounds.height - gradient.y0;
          }

          // get colors and stops
          m2 = m1[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}%)?)+/g);
          if(m2){
            m2Len = m2.length;
            step = 1 / Math.max(m2Len - 1, 1);
            for(i = 0; i < m2Len; i+=1){
              m3 = m2[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/);
              if(m3[2]){
                stop = parseFloat(m3[2]);
                if(m3[3]){ // percentage
                  stop /= 100;
                }
              } else {
                stop = i * step;
              }
              gradient.colorStops.push({
                color: m3[1],
                stop: stop
              });
            }
          }
          break;

        case '-webkit-radial-gradient':
        case '-moz-radial-gradient':
        case '-o-radial-gradient':

          gradient = {
            type: 'circle',
            x0: 0,
            y0: 0,
            x1: bounds.width,
            y1: bounds.height,
            cx: 0,
            cy: 0,
            rx: 0,
            ry: 0,
            colorStops: []
          };

          // center
          m2 = m1[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);
          if(m2){
            gradient.cx = (m2[1] * bounds.width) / 100;
            gradient.cy = (m2[2] * bounds.height) / 100;
          }

          // size
          m2 = m1[3].match(/\w+/);
          m3 = m1[4].match(/[a-z\-]*/);
          if(m2 && m3){
            switch(m3[0]){
              case 'farthest-corner':
              case 'cover': // is equivalent to farthest-corner
              case '': // mozilla removes "cover" from definition :(
                tl = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.cy, 2));
                tr = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                br = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                bl = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.cy, 2));
                gradient.rx = gradient.ry = Math.max(tl, tr, br, bl);
                break;
              case 'closest-corner':
                tl = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.cy, 2));
                tr = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                br = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                bl = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.cy, 2));
                gradient.rx = gradient.ry = Math.min(tl, tr, br, bl);
                break;
              case 'farthest-side':
                if(m2[0] === 'circle'){
                  gradient.rx = gradient.ry = Math.max(
                    gradient.cx,
                    gradient.cy,
                    gradient.x1 - gradient.cx,
                    gradient.y1 - gradient.cy
                    );
                } else { // ellipse

                  gradient.type = m2[0];

                  gradient.rx = Math.max(
                    gradient.cx,
                    gradient.x1 - gradient.cx
                    );
                  gradient.ry = Math.max(
                    gradient.cy,
                    gradient.y1 - gradient.cy
                    );
                }
                break;
              case 'closest-side':
              case 'contain': // is equivalent to closest-side
                if(m2[0] === 'circle'){
                  gradient.rx = gradient.ry = Math.min(
                    gradient.cx,
                    gradient.cy,
                    gradient.x1 - gradient.cx,
                    gradient.y1 - gradient.cy
                    );
                } else { // ellipse

                  gradient.type = m2[0];

                  gradient.rx = Math.min(
                    gradient.cx,
                    gradient.x1 - gradient.cx
                    );
                  gradient.ry = Math.min(
                    gradient.cy,
                    gradient.y1 - gradient.cy
                    );
                }
                break;

            // TODO: add support for "30px 40px" sizes (webkit only)
            }
          }

          // color stops
          m2 = m1[5].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g);
          if(m2){
            m2Len = m2.length;
            step = 1 / Math.max(m2Len - 1, 1);
            for(i = 0; i < m2Len; i+=1){
              m3 = m2[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/);
              if(m3[2]){
                stop = parseFloat(m3[2]);
                if(m3[3] === '%'){
                  stop /= 100;
                } else { // px - stupid opera
                  stop /= bounds.width;
                }
              } else {
                stop = i * step;
              }
              gradient.colorStops.push({
                color: m3[1],
                stop: stop
              });
            }
          }
          break;
      }
    }

    return gradient;
  };

  function addScrollStops(grad) {
    return function(colorStop) {
      try {
        grad.addColorStop(colorStop.stop, colorStop.color);
      }
      catch(e) {
        Util.log(['failed to add color stop: ', e, '; tried to add: ', colorStop]);
      }
    };
  }

  Generate.Gradient = function(src, bounds) {
    if(bounds.width === 0 || bounds.height === 0) {
      return;
    }

    var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    gradient, grad;

    canvas.width = bounds.width;
    canvas.height = bounds.height;

    // TODO: add support for multi defined background gradients
    gradient = _html2canvas.Generate.parseGradient(src, bounds);

    if(gradient) {
      switch(gradient.type) {
        case 'linear':
          grad = ctx.createLinearGradient(gradient.x0, gradient.y0, gradient.x1, gradient.y1);
          gradient.colorStops.forEach(addScrollStops(grad));
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, bounds.width, bounds.height);
          break;

        case 'circle':
          grad = ctx.createRadialGradient(gradient.cx, gradient.cy, 0, gradient.cx, gradient.cy, gradient.rx);
          gradient.colorStops.forEach(addScrollStops(grad));
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, bounds.width, bounds.height);
          break;

        case 'ellipse':
          var canvasRadial = document.createElement('canvas'),
            ctxRadial = canvasRadial.getContext('2d'),
            ri = Math.max(gradient.rx, gradient.ry),
            di = ri * 2;

          canvasRadial.width = canvasRadial.height = di;

          grad = ctxRadial.createRadialGradient(gradient.rx, gradient.ry, 0, gradient.rx, gradient.ry, ri);
          gradient.colorStops.forEach(addScrollStops(grad));

          ctxRadial.fillStyle = grad;
          ctxRadial.fillRect(0, 0, di, di);

          ctx.fillStyle = gradient.colorStops[gradient.colorStops.length - 1].color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(canvasRadial, gradient.cx - gradient.rx, gradient.cy - gradient.ry, 2 * gradient.rx, 2 * gradient.ry);
          break;
      }
    }

    return canvas;
  };

  Generate.ListAlpha = function(number) {
    var tmp = "",
    modulus;

    do {
      modulus = number % 26;
      tmp = String.fromCharCode((modulus) + 64) + tmp;
      number = number / 26;
    }while((number*26) > 26);

    return tmp;
  };

  Generate.ListRoman = function(number) {
    var romanArray = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"],
    decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
    roman = "",
    v,
    len = romanArray.length;

    if (number <= 0 || number >= 4000) {
      return number;
    }

    for (v=0; v < len; v+=1) {
      while (number >= decimal[v]) {
        number -= decimal[v];
        roman += romanArray[v];
      }
    }

    return roman;
  };
})();
function h2cRenderContext(width, height) {
  var storage = [];
  return {
    storage: storage,
    width: width,
    height: height,
    clip: function() {
      storage.push({
        type: "function",
        name: "clip",
        'arguments': arguments
      });
    },
    translate: function() {
      storage.push({
        type: "function",
        name: "translate",
        'arguments': arguments
      });
    },
    fill: function() {
      storage.push({
        type: "function",
        name: "fill",
        'arguments': arguments
      });
    },
    save: function() {
      storage.push({
        type: "function",
        name: "save",
        'arguments': arguments
      });
    },
    restore: function() {
      storage.push({
        type: "function",
        name: "restore",
        'arguments': arguments
      });
    },
    fillRect: function () {
      storage.push({
        type: "function",
        name: "fillRect",
        'arguments': arguments
      });
    },
    createPattern: function() {
      storage.push({
        type: "function",
        name: "createPattern",
        'arguments': arguments
      });
    },
    drawShape: function() {

      var shape = [];

      storage.push({
        type: "function",
        name: "drawShape",
        'arguments': shape
      });

      return {
        moveTo: function() {
          shape.push({
            name: "moveTo",
            'arguments': arguments
          });
        },
        lineTo: function() {
          shape.push({
            name: "lineTo",
            'arguments': arguments
          });
        },
        arcTo: function() {
          shape.push({
            name: "arcTo",
            'arguments': arguments
          });
        },
        bezierCurveTo: function() {
          shape.push({
            name: "bezierCurveTo",
            'arguments': arguments
          });
        },
        quadraticCurveTo: function() {
          shape.push({
            name: "quadraticCurveTo",
            'arguments': arguments
          });
        }
      };

    },
    drawImage: function () {
      storage.push({
        type: "function",
        name: "drawImage",
        'arguments': arguments
      });
    },
    fillText: function () {
      storage.push({
        type: "function",
        name: "fillText",
        'arguments': arguments
      });
    },
    setVariable: function (variable, value) {
      storage.push({
        type: "variable",
        name: variable,
        'arguments': value
      });
      return value;
    }
  };
}
_html2canvas.Parse = function (images, options) {
  window.scroll(0,0);

  var element = (( options.elements === undefined ) ? document.body : options.elements[0]), // select body by default
  numDraws = 0,
  doc = element.ownerDocument,
  Util = _html2canvas.Util,
  support = Util.Support(options, doc),
  ignoreElementsRegExp = new RegExp("(" + options.ignoreElements + ")"),
  body = doc.body,
  getCSS = Util.getCSS,
  pseudoHide = "___html2canvas___pseudoelement",
  hidePseudoElements = doc.createElement('style');

  hidePseudoElements.innerHTML = '.' + pseudoHide + '-before:before { content: "" !important; display: none !important; }' +
  '.' + pseudoHide + '-after:after { content: "" !important; display: none !important; }';

  body.appendChild(hidePseudoElements);

  images = images || {};

  function documentWidth () {
    return Math.max(
      Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth),
      Math.max(doc.body.offsetWidth, doc.documentElement.offsetWidth),
      Math.max(doc.body.clientWidth, doc.documentElement.clientWidth)
      );
  }

  function documentHeight () {
    return Math.max(
      Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight),
      Math.max(doc.body.offsetHeight, doc.documentElement.offsetHeight),
      Math.max(doc.body.clientHeight, doc.documentElement.clientHeight)
      );
  }

  function getCSSInt(element, attribute) {
    var val = parseInt(getCSS(element, attribute), 10);
    return (isNaN(val)) ? 0 : val; // borders in old IE are throwing 'medium' for demo.html
  }

  function renderRect (ctx, x, y, w, h, bgcolor) {
    if (bgcolor !== "transparent"){
      ctx.setVariable("fillStyle", bgcolor);
      ctx.fillRect(x, y, w, h);
      numDraws+=1;
    }
  }

  function capitalize(m, p1, p2) {
    if (m.length > 0) {
      return p1 + p2.toUpperCase();
    }
  }

  function textTransform (text, transform) {
    switch(transform){
      case "lowercase":
        return text.toLowerCase();
      case "capitalize":
        return text.replace( /(^|\s|:|-|\(|\))([a-z])/g, capitalize);
      case "uppercase":
        return text.toUpperCase();
      default:
        return text;
    }
  }

  function noLetterSpacing(letter_spacing) {
    return (/^(normal|none|0px)$/.test(letter_spacing));
  }

  function drawText(currentText, x, y, ctx){
    if (currentText !== null && Util.trimText(currentText).length > 0) {
      ctx.fillText(currentText, x, y);
      numDraws+=1;
    }
  }

  function setTextVariables(ctx, el, text_decoration, color) {
    var align = false,
    bold = getCSS(el, "fontWeight"),
    family = getCSS(el, "fontFamily"),
    size = getCSS(el, "fontSize"),
    shadows = Util.parseTextShadows(getCSS(el, "textShadow"));

    switch(parseInt(bold, 10)){
      case 401:
        bold = "bold";
        break;
      case 400:
        bold = "normal";
        break;
    }

    ctx.setVariable("fillStyle", color);
    ctx.setVariable("font", [getCSS(el, "fontStyle"), getCSS(el, "fontVariant"), bold, size, family].join(" "));
    ctx.setVariable("textAlign", (align) ? "right" : "left");

    if (shadows.length) {
      // TODO: support multiple text shadows
      // apply the first text shadow
      ctx.setVariable("shadowColor", shadows[0].color);
      ctx.setVariable("shadowOffsetX", shadows[0].offsetX);
      ctx.setVariable("shadowOffsetY", shadows[0].offsetY);
      ctx.setVariable("shadowBlur", shadows[0].blur);
    }

    if (text_decoration !== "none"){
      return Util.Font(family, size, doc);
    }
  }

  function renderTextDecoration(ctx, text_decoration, bounds, metrics, color) {
    switch(text_decoration) {
      case "underline":
        // Draws a line at the baseline of the font
        // TODO As some browsers display the line as more than 1px if the font-size is big, need to take that into account both in position and size
        renderRect(ctx, bounds.left, Math.round(bounds.top + metrics.baseline + metrics.lineWidth), bounds.width, 1, color);
        break;
      case "overline":
        renderRect(ctx, bounds.left, Math.round(bounds.top), bounds.width, 1, color);
        break;
      case "line-through":
        // TODO try and find exact position for line-through
        renderRect(ctx, bounds.left, Math.ceil(bounds.top + metrics.middle + metrics.lineWidth), bounds.width, 1, color);
        break;
    }
  }

  function getTextBounds(state, text, textDecoration, isLast, transform) {
    var bounds;
    if (support.rangeBounds && !transform) {
      if (textDecoration !== "none" || Util.trimText(text).length !== 0) {
        bounds = textRangeBounds(text, state.node, state.textOffset);
      }
      state.textOffset += text.length;
    } else if (state.node && typeof state.node.nodeValue === "string" ){
      var newTextNode = (isLast) ? state.node.splitText(text.length) : null;
      bounds = textWrapperBounds(state.node, transform);
      state.node = newTextNode;
    }
    return bounds;
  }

  function textRangeBounds(text, textNode, textOffset) {
    var range = doc.createRange();
    range.setStart(textNode, textOffset);
    range.setEnd(textNode, textOffset + text.length);
    return range.getBoundingClientRect();
  }

  function textWrapperBounds(oldTextNode, transform) {
    var parent = oldTextNode.parentNode,
    wrapElement = doc.createElement('wrapper'),
    backupText = oldTextNode.cloneNode(true);

    wrapElement.appendChild(oldTextNode.cloneNode(true));
    parent.replaceChild(wrapElement, oldTextNode);

    var bounds = transform ? Util.OffsetBounds(wrapElement) : Util.Bounds(wrapElement);
    parent.replaceChild(backupText, wrapElement);
    return bounds;
  }

  function renderText(el, textNode, stack) {
    var ctx = stack.ctx,
    color = getCSS(el, "color"),
    textDecoration = getCSS(el, "textDecoration"),
    textAlign = getCSS(el, "textAlign"),
    metrics,
    textList,
    state = {
      node: textNode,
      textOffset: 0
    };

    if (Util.trimText(textNode.nodeValue).length > 0) {
      textNode.nodeValue = textTransform(textNode.nodeValue, getCSS(el, "textTransform"));
      textAlign = textAlign.replace(["-webkit-auto"],["auto"]);

      textList = (!options.letterRendering && /^(left|right|justify|auto)$/.test(textAlign) && noLetterSpacing(getCSS(el, "letterSpacing"))) ?
      textNode.nodeValue.split(/(\b| )/)
      : textNode.nodeValue.split("");

      metrics = setTextVariables(ctx, el, textDecoration, color);

      if (options.chinese) {
        textList.forEach(function(word, index) {
          if (/.*[\u4E00-\u9FA5].*$/.test(word)) {
            word = word.split("");
            word.unshift(index, 1);
            textList.splice.apply(textList, word);
          }
        });
      }

      textList.forEach(function(text, index) {
        var bounds = getTextBounds(state, text, textDecoration, (index < textList.length - 1), stack.transform.matrix);
        if (bounds) {
          drawText(text, bounds.left, bounds.bottom, ctx);
          renderTextDecoration(ctx, textDecoration, bounds, metrics, color);
        }
      });
    }
  }

  function listPosition (element, val) {
    var boundElement = doc.createElement( "boundelement" ),
    originalType,
    bounds;

    boundElement.style.display = "inline";

    originalType = element.style.listStyleType;
    element.style.listStyleType = "none";

    boundElement.appendChild(doc.createTextNode(val));

    element.insertBefore(boundElement, element.firstChild);

    bounds = Util.Bounds(boundElement);
    element.removeChild(boundElement);
    element.style.listStyleType = originalType;
    return bounds;
  }

  function elementIndex(el) {
    var i = -1,
    count = 1,
    childs = el.parentNode.childNodes;

    if (el.parentNode) {
      while(childs[++i] !== el) {
        if (childs[i].nodeType === 1) {
          count++;
        }
      }
      return count;
    } else {
      return -1;
    }
  }

  function listItemText(element, type) {
    var currentIndex = elementIndex(element), text;
    switch(type){
      case "decimal":
        text = currentIndex;
        break;
      case "decimal-leading-zero":
        text = (currentIndex.toString().length === 1) ? currentIndex = "0" + currentIndex.toString() : currentIndex.toString();
        break;
      case "upper-roman":
        text = _html2canvas.Generate.ListRoman( currentIndex );
        break;
      case "lower-roman":
        text = _html2canvas.Generate.ListRoman( currentIndex ).toLowerCase();
        break;
      case "lower-alpha":
        text = _html2canvas.Generate.ListAlpha( currentIndex ).toLowerCase();
        break;
      case "upper-alpha":
        text = _html2canvas.Generate.ListAlpha( currentIndex );
        break;
    }

    return text + ". ";
  }

  function renderListItem(element, stack, elBounds) {
    var x,
    text,
    ctx = stack.ctx,
    type = getCSS(element, "listStyleType"),
    listBounds;

    if (/^(decimal|decimal-leading-zero|upper-alpha|upper-latin|upper-roman|lower-alpha|lower-greek|lower-latin|lower-roman)$/i.test(type)) {
      text = listItemText(element, type);
      listBounds = listPosition(element, text);
      setTextVariables(ctx, element, "none", getCSS(element, "color"));

      if (getCSS(element, "listStylePosition") === "inside") {
        ctx.setVariable("textAlign", "left");
        x = elBounds.left;
      } else {
        return;
      }

      drawText(text, x, listBounds.bottom, ctx);
    }
  }

  function loadImage (src){
    var img = images[src];
    return (img && img.succeeded === true) ? img.img : false;
  }

  function clipBounds(src, dst){
    var x = Math.max(src.left, dst.left),
    y = Math.max(src.top, dst.top),
    x2 = Math.min((src.left + src.width), (dst.left + dst.width)),
    y2 = Math.min((src.top + src.height), (dst.top + dst.height));

    return {
      left:x,
      top:y,
      width:x2-x,
      height:y2-y
    };
  }

  function setZ(element, stack, parentStack){
    var newContext,
    isPositioned = stack.cssPosition !== 'static',
    zIndex = isPositioned ? getCSS(element, 'zIndex') : 'auto',
    opacity = getCSS(element, 'opacity'),
    isFloated = getCSS(element, 'cssFloat') !== 'none';

    // https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context
    // When a new stacking context should be created:
    // the root element (HTML),
    // positioned (absolutely or relatively) with a z-index value other than "auto",
    // elements with an opacity value less than 1. (See the specification for opacity),
    // on mobile WebKit and Chrome 22+, position: fixed always creates a new stacking context, even when z-index is "auto" (See this post)

    stack.zIndex = newContext = h2czContext(zIndex);
    newContext.isPositioned = isPositioned;
    newContext.isFloated = isFloated;
    newContext.opacity = opacity;
    newContext.ownStacking = (zIndex !== 'auto' || opacity < 1);

    if (parentStack) {
      parentStack.zIndex.children.push(stack);
    }
  }

  function renderImage(ctx, element, image, bounds, borders) {

    var paddingLeft = getCSSInt(element, 'paddingLeft'),
    paddingTop = getCSSInt(element, 'paddingTop'),
    paddingRight = getCSSInt(element, 'paddingRight'),
    paddingBottom = getCSSInt(element, 'paddingBottom');

    drawImage(
      ctx,
      image,
      0, //sx
      0, //sy
      image.width, //sw
      image.height, //sh
      bounds.left + paddingLeft + borders[3].width, //dx
      bounds.top + paddingTop + borders[0].width, // dy
      bounds.width - (borders[1].width + borders[3].width + paddingLeft + paddingRight), //dw
      bounds.height - (borders[0].width + borders[2].width + paddingTop + paddingBottom) //dh
      );
  }

  function getBorderData(element) {
    return ["Top", "Right", "Bottom", "Left"].map(function(side) {
      return {
        width: getCSSInt(element, 'border' + side + 'Width'),
        color: getCSS(element, 'border' + side + 'Color')
      };
    });
  }

  function getBorderRadiusData(element) {
    return ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map(function(side) {
      return getCSS(element, 'border' + side + 'Radius');
    });
  }

  var getCurvePoints = (function(kappa) {

    return function(x, y, r1, r2) {
      var ox = (r1) * kappa, // control point offset horizontal
      oy = (r2) * kappa, // control point offset vertical
      xm = x + r1, // x-middle
      ym = y + r2; // y-middle
      return {
        topLeft: bezierCurve({
          x:x,
          y:ym
        }, {
          x:x,
          y:ym - oy
        }, {
          x:xm - ox,
          y:y
        }, {
          x:xm,
          y:y
        }),
        topRight: bezierCurve({
          x:x,
          y:y
        }, {
          x:x + ox,
          y:y
        }, {
          x:xm,
          y:ym - oy
        }, {
          x:xm,
          y:ym
        }),
        bottomRight: bezierCurve({
          x:xm,
          y:y
        }, {
          x:xm,
          y:y + oy
        }, {
          x:x + ox,
          y:ym
        }, {
          x:x,
          y:ym
        }),
        bottomLeft: bezierCurve({
          x:xm,
          y:ym
        }, {
          x:xm - ox,
          y:ym
        }, {
          x:x,
          y:y + oy
        }, {
          x:x,
          y:y
        })
      };
    };
  })(4 * ((Math.sqrt(2) - 1) / 3));

  function bezierCurve(start, startControl, endControl, end) {

    var lerp = function (a, b, t) {
      return {
        x:a.x + (b.x - a.x) * t,
        y:a.y + (b.y - a.y) * t
      };
    };

    return {
      start: start,
      startControl: startControl,
      endControl: endControl,
      end: end,
      subdivide: function(t) {
        var ab = lerp(start, startControl, t),
        bc = lerp(startControl, endControl, t),
        cd = lerp(endControl, end, t),
        abbc = lerp(ab, bc, t),
        bccd = lerp(bc, cd, t),
        dest = lerp(abbc, bccd, t);
        return [bezierCurve(start, ab, abbc, dest), bezierCurve(dest, bccd, cd, end)];
      },
      curveTo: function(borderArgs) {
        borderArgs.push(["bezierCurve", startControl.x, startControl.y, endControl.x, endControl.y, end.x, end.y]);
      },
      curveToReversed: function(borderArgs) {
        borderArgs.push(["bezierCurve", endControl.x, endControl.y, startControl.x, startControl.y, start.x, start.y]);
      }
    };
  }

  function parseCorner(borderArgs, radius1, radius2, corner1, corner2, x, y) {
    if (radius1[0] > 0 || radius1[1] > 0) {
      borderArgs.push(["line", corner1[0].start.x, corner1[0].start.y]);
      corner1[0].curveTo(borderArgs);
      corner1[1].curveTo(borderArgs);
    } else {
      borderArgs.push(["line", x, y]);
    }

    if (radius2[0] > 0 || radius2[1] > 0) {
      borderArgs.push(["line", corner2[0].start.x, corner2[0].start.y]);
    }
  }

  function drawSide(borderData, radius1, radius2, outer1, inner1, outer2, inner2) {
    var borderArgs = [];

    if (radius1[0] > 0 || radius1[1] > 0) {
      borderArgs.push(["line", outer1[1].start.x, outer1[1].start.y]);
      outer1[1].curveTo(borderArgs);
    } else {
      borderArgs.push([ "line", borderData.c1[0], borderData.c1[1]]);
    }

    if (radius2[0] > 0 || radius2[1] > 0) {
      borderArgs.push(["line", outer2[0].start.x, outer2[0].start.y]);
      outer2[0].curveTo(borderArgs);
      borderArgs.push(["line", inner2[0].end.x, inner2[0].end.y]);
      inner2[0].curveToReversed(borderArgs);
    } else {
      borderArgs.push([ "line", borderData.c2[0], borderData.c2[1]]);
      borderArgs.push([ "line", borderData.c3[0], borderData.c3[1]]);
    }

    if (radius1[0] > 0 || radius1[1] > 0) {
      borderArgs.push(["line", inner1[1].end.x, inner1[1].end.y]);
      inner1[1].curveToReversed(borderArgs);
    } else {
      borderArgs.push([ "line", borderData.c4[0], borderData.c4[1]]);
    }

    return borderArgs;
  }

  function calculateCurvePoints(bounds, borderRadius, borders) {

    var x = bounds.left,
    y = bounds.top,
    width = bounds.width,
    height = bounds.height,

    tlh = borderRadius[0][0],
    tlv = borderRadius[0][1],
    trh = borderRadius[1][0],
    trv = borderRadius[1][1],
    brh = borderRadius[2][0],
    brv = borderRadius[2][1],
    blh = borderRadius[3][0],
    blv = borderRadius[3][1],

    topWidth = width - trh,
    rightHeight = height - brv,
    bottomWidth = width - brh,
    leftHeight = height - blv;

    return {
      topLeftOuter: getCurvePoints(
        x,
        y,
        tlh,
        tlv
        ).topLeft.subdivide(0.5),

      topLeftInner: getCurvePoints(
        x + borders[3].width,
        y + borders[0].width,
        Math.max(0, tlh - borders[3].width),
        Math.max(0, tlv - borders[0].width)
        ).topLeft.subdivide(0.5),

      topRightOuter: getCurvePoints(
        x + topWidth,
        y,
        trh,
        trv
        ).topRight.subdivide(0.5),

      topRightInner: getCurvePoints(
        x + Math.min(topWidth, width + borders[3].width),
        y + borders[0].width,
        (topWidth > width + borders[3].width) ? 0 :trh - borders[3].width,
        trv - borders[0].width
        ).topRight.subdivide(0.5),

      bottomRightOuter: getCurvePoints(
        x + bottomWidth,
        y + rightHeight,
        brh,
        brv
        ).bottomRight.subdivide(0.5),

      bottomRightInner: getCurvePoints(
        x + Math.min(bottomWidth, width + borders[3].width),
        y + Math.min(rightHeight, height + borders[0].width),
        Math.max(0, brh - borders[1].width),
        Math.max(0, brv - borders[2].width)
        ).bottomRight.subdivide(0.5),

      bottomLeftOuter: getCurvePoints(
        x,
        y + leftHeight,
        blh,
        blv
        ).bottomLeft.subdivide(0.5),

      bottomLeftInner: getCurvePoints(
        x + borders[3].width,
        y + leftHeight,
        Math.max(0, blh - borders[3].width),
        Math.max(0, blv - borders[2].width)
        ).bottomLeft.subdivide(0.5)
    };
  }

  function getBorderClip(element, borderPoints, borders, radius, bounds) {
    var backgroundClip = getCSS(element, 'backgroundClip'),
    borderArgs = [];

    switch(backgroundClip) {
      case "content-box":
      case "padding-box":
        parseCorner(borderArgs, radius[0], radius[1], borderPoints.topLeftInner, borderPoints.topRightInner, bounds.left + borders[3].width, bounds.top + borders[0].width);
        parseCorner(borderArgs, radius[1], radius[2], borderPoints.topRightInner, borderPoints.bottomRightInner, bounds.left + bounds.width - borders[1].width, bounds.top + borders[0].width);
        parseCorner(borderArgs, radius[2], radius[3], borderPoints.bottomRightInner, borderPoints.bottomLeftInner, bounds.left + bounds.width - borders[1].width, bounds.top + bounds.height - borders[2].width);
        parseCorner(borderArgs, radius[3], radius[0], borderPoints.bottomLeftInner, borderPoints.topLeftInner, bounds.left + borders[3].width, bounds.top + bounds.height - borders[2].width);
        break;

      default:
        parseCorner(borderArgs, radius[0], radius[1], borderPoints.topLeftOuter, borderPoints.topRightOuter, bounds.left, bounds.top);
        parseCorner(borderArgs, radius[1], radius[2], borderPoints.topRightOuter, borderPoints.bottomRightOuter, bounds.left + bounds.width, bounds.top);
        parseCorner(borderArgs, radius[2], radius[3], borderPoints.bottomRightOuter, borderPoints.bottomLeftOuter, bounds.left + bounds.width, bounds.top + bounds.height);
        parseCorner(borderArgs, radius[3], radius[0], borderPoints.bottomLeftOuter, borderPoints.topLeftOuter, bounds.left, bounds.top + bounds.height);
        break;
    }

    return borderArgs;
  }

  function parseBorders(element, bounds, borders){
    var x = bounds.left,
    y = bounds.top,
    width = bounds.width,
    height = bounds.height,
    borderSide,
    bx,
    by,
    bw,
    bh,
    borderArgs,
    // http://www.w3.org/TR/css3-background/#the-border-radius
    borderRadius = getBorderRadiusData(element),
    borderPoints = calculateCurvePoints(bounds, borderRadius, borders),
    borderData = {
      clip: getBorderClip(element, borderPoints, borders, borderRadius, bounds),
      borders: []
    };

    for (borderSide = 0; borderSide < 4; borderSide++) {

      if (borders[borderSide].width > 0) {
        bx = x;
        by = y;
        bw = width;
        bh = height - (borders[2].width);

        switch(borderSide) {
          case 0:
            // top border
            bh = borders[0].width;

            borderArgs = drawSide({
              c1: [bx, by],
              c2: [bx + bw, by],
              c3: [bx + bw - borders[1].width, by + bh],
              c4: [bx + borders[3].width, by + bh]
            }, borderRadius[0], borderRadius[1],
            borderPoints.topLeftOuter, borderPoints.topLeftInner, borderPoints.topRightOuter, borderPoints.topRightInner);
            break;
          case 1:
            // right border
            bx = x + width - (borders[1].width);
            bw = borders[1].width;

            borderArgs = drawSide({
              c1: [bx + bw, by],
              c2: [bx + bw, by + bh + borders[2].width],
              c3: [bx, by + bh],
              c4: [bx, by + borders[0].width]
            }, borderRadius[1], borderRadius[2],
            borderPoints.topRightOuter, borderPoints.topRightInner, borderPoints.bottomRightOuter, borderPoints.bottomRightInner);
            break;
          case 2:
            // bottom border
            by = (by + height) - (borders[2].width);
            bh = borders[2].width;

            borderArgs = drawSide({
              c1: [bx + bw, by + bh],
              c2: [bx, by + bh],
              c3: [bx + borders[3].width, by],
              c4: [bx + bw - borders[3].width, by]
            }, borderRadius[2], borderRadius[3],
            borderPoints.bottomRightOuter, borderPoints.bottomRightInner, borderPoints.bottomLeftOuter, borderPoints.bottomLeftInner);
            break;
          case 3:
            // left border
            bw = borders[3].width;

            borderArgs = drawSide({
              c1: [bx, by + bh + borders[2].width],
              c2: [bx, by],
              c3: [bx + bw, by + borders[0].width],
              c4: [bx + bw, by + bh]
            }, borderRadius[3], borderRadius[0],
            borderPoints.bottomLeftOuter, borderPoints.bottomLeftInner, borderPoints.topLeftOuter, borderPoints.topLeftInner);
            break;
        }

        borderData.borders.push({
          args: borderArgs,
          color: borders[borderSide].color
        });

      }
    }

    return borderData;
  }

  function createShape(ctx, args) {
    var shape = ctx.drawShape();
    args.forEach(function(border, index) {
      shape[(index === 0) ? "moveTo" : border[0] + "To" ].apply(null, border.slice(1));
    });
    return shape;
  }

  function renderBorders(ctx, borderArgs, color) {
    if (color !== "transparent") {
      ctx.setVariable( "fillStyle", color);
      createShape(ctx, borderArgs);
      ctx.fill();
      numDraws+=1;
    }
  }

  function renderFormValue (el, bounds, stack){

    var valueWrap = doc.createElement('valuewrap'),
    cssPropertyArray = ['lineHeight','textAlign','fontFamily','color','fontSize','paddingLeft','paddingTop','width','height','border','borderLeftWidth','borderTopWidth'],
    textValue,
    textNode;

    cssPropertyArray.forEach(function(property) {
      try {
        valueWrap.style[property] = getCSS(el, property);
      } catch(e) {
        // Older IE has issues with "border"
        Util.log("html2canvas: Parse: Exception caught in renderFormValue: " + e.message);
      }
    });

    valueWrap.style.borderColor = "black";
    valueWrap.style.borderStyle = "solid";
    valueWrap.style.display = "block";
    valueWrap.style.position = "absolute";

    if (/^(submit|reset|button|text|password)$/.test(el.type) || el.nodeName === "SELECT"){
      valueWrap.style.lineHeight = getCSS(el, "height");
    }

    valueWrap.style.top = bounds.top + "px";
    valueWrap.style.left = bounds.left + "px";

    textValue = (el.nodeName === "SELECT") ? (el.options[el.selectedIndex] || 0).text : el.value;
    if(!textValue) {
      textValue = el.placeholder;
    }

    textNode = doc.createTextNode(textValue);

    valueWrap.appendChild(textNode);
    body.appendChild(valueWrap);

    renderText(el, textNode, stack);
    body.removeChild(valueWrap);
  }

  function drawImage (ctx) {
    ctx.drawImage.apply(ctx, Array.prototype.slice.call(arguments, 1));
    numDraws+=1;
  }

  function getPseudoElement(el, which) {
    var elStyle = window.getComputedStyle(el, which);
    if(!elStyle || !elStyle.content || elStyle.content === "none" || elStyle.content === "-moz-alt-content" || elStyle.display === "none") {
      return;
    }
    var content = elStyle.content + '',
    first = content.substr( 0, 1 );
    //strips quotes
    if(first === content.substr( content.length - 1 ) && first.match(/'|"/)) {
      content = content.substr( 1, content.length - 2 );
    }

    var isImage = content.substr( 0, 3 ) === 'url',
    elps = document.createElement( isImage ? 'img' : 'span' );

    elps.className = pseudoHide + "-before " + pseudoHide + "-after";

    Object.keys(elStyle).filter(indexedProperty).forEach(function(prop) {
      // Prevent assigning of read only CSS Rules, ex. length, parentRule
      try {
        elps.style[prop] = elStyle[prop];
      } catch (e) {
        Util.log(['Tried to assign readonly property ', prop, 'Error:', e]);
      }
    });

    if(isImage) {
      elps.src = Util.parseBackgroundImage(content)[0].args[0];
    } else {
      elps.innerHTML = content;
    }
    return elps;
  }

  function indexedProperty(property) {
    return (isNaN(window.parseInt(property, 10)));
  }

  function injectPseudoElements(el, stack) {
    var before = getPseudoElement(el, ':before'),
    after = getPseudoElement(el, ':after');
    if(!before && !after) {
      return;
    }

    if(before) {
      el.className += " " + pseudoHide + "-before";
      el.parentNode.insertBefore(before, el);
      parseElement(before, stack, true);
      el.parentNode.removeChild(before);
      el.className = el.className.replace(pseudoHide + "-before", "").trim();
    }

    if (after) {
      el.className += " " + pseudoHide + "-after";
      el.appendChild(after);
      parseElement(after, stack, true);
      el.removeChild(after);
      el.className = el.className.replace(pseudoHide + "-after", "").trim();
    }

  }

  function renderBackgroundRepeat(ctx, image, backgroundPosition, bounds) {
    var offsetX = Math.round(bounds.left + backgroundPosition.left),
    offsetY = Math.round(bounds.top + backgroundPosition.top);

    ctx.createPattern(image);
    ctx.translate(offsetX, offsetY);
    ctx.fill();
    ctx.translate(-offsetX, -offsetY);
  }

  function backgroundRepeatShape(ctx, image, backgroundPosition, bounds, left, top, width, height) {
    var args = [];
    args.push(["line", Math.round(left), Math.round(top)]);
    args.push(["line", Math.round(left + width), Math.round(top)]);
    args.push(["line", Math.round(left + width), Math.round(height + top)]);
    args.push(["line", Math.round(left), Math.round(height + top)]);
    createShape(ctx, args);
    ctx.save();
    ctx.clip();
    renderBackgroundRepeat(ctx, image, backgroundPosition, bounds);
    ctx.restore();
  }

  function renderBackgroundColor(ctx, backgroundBounds, bgcolor) {
    renderRect(
      ctx,
      backgroundBounds.left,
      backgroundBounds.top,
      backgroundBounds.width,
      backgroundBounds.height,
      bgcolor
      );
  }

  function renderBackgroundRepeating(el, bounds, ctx, image, imageIndex) {
    var backgroundSize = Util.BackgroundSize(el, bounds, image, imageIndex),
    backgroundPosition = Util.BackgroundPosition(el, bounds, image, imageIndex, backgroundSize),
    backgroundRepeat = getCSS(el, "backgroundRepeat").split(",").map(Util.trimText);

    image = resizeImage(image, backgroundSize);

    backgroundRepeat = backgroundRepeat[imageIndex] || backgroundRepeat[0];

    switch (backgroundRepeat) {
      case "repeat-x":
        backgroundRepeatShape(ctx, image, backgroundPosition, bounds,
          bounds.left, bounds.top + backgroundPosition.top, 99999, image.height);
        break;

      case "repeat-y":
        backgroundRepeatShape(ctx, image, backgroundPosition, bounds,
          bounds.left + backgroundPosition.left, bounds.top, image.width, 99999);
        break;

      case "no-repeat":
        backgroundRepeatShape(ctx, image, backgroundPosition, bounds,
          bounds.left + backgroundPosition.left, bounds.top + backgroundPosition.top, image.width, image.height);
        break;

      default:
        renderBackgroundRepeat(ctx, image, backgroundPosition, {
          top: bounds.top,
          left: bounds.left,
          width: image.width,
          height: image.height
        });
        break;
    }
  }

  function renderBackgroundImage(element, bounds, ctx) {
    var backgroundImage = getCSS(element, "backgroundImage"),
    backgroundImages = Util.parseBackgroundImage(backgroundImage),
    image,
    imageIndex = backgroundImages.length;

    while(imageIndex--) {
      backgroundImage = backgroundImages[imageIndex];

      if (!backgroundImage.args || backgroundImage.args.length === 0) {
        continue;
      }

      var key = backgroundImage.method === 'url' ?
      backgroundImage.args[0] :
      backgroundImage.value;

      image = loadImage(key);

      // TODO add support for background-origin
      if (image) {
        renderBackgroundRepeating(element, bounds, ctx, image, imageIndex);
      } else {
        Util.log("html2canvas: Error loading background:", backgroundImage);
      }
    }
  }

  function resizeImage(image, bounds) {
    if(image.width === bounds.width && image.height === bounds.height) {
      return image;
    }

    var ctx, canvas = doc.createElement('canvas');
    canvas.width = bounds.width;
    canvas.height = bounds.height;
    ctx = canvas.getContext("2d");
    drawImage(ctx, image, 0, 0, image.width, image.height, 0, 0, bounds.width, bounds.height );
    return canvas;
  }

  function setOpacity(ctx, element, parentStack) {
    return ctx.setVariable("globalAlpha", getCSS(element, "opacity") * ((parentStack) ? parentStack.opacity : 1));
  }

  function removePx(str) {
    return str.replace("px", "");
  }

  var transformRegExp = /(matrix)\((.+)\)/;

  function getTransform(element, parentStack) {
    var transform = getCSS(element, "transform") || getCSS(element, "-webkit-transform") || getCSS(element, "-moz-transform") || getCSS(element, "-ms-transform") || getCSS(element, "-o-transform");
    var transformOrigin = getCSS(element, "transform-origin") || getCSS(element, "-webkit-transform-origin") || getCSS(element, "-moz-transform-origin") || getCSS(element, "-ms-transform-origin") || getCSS(element, "-o-transform-origin") || "0px 0px";

    transformOrigin = transformOrigin.split(" ").map(removePx).map(Util.asFloat);

    var matrix;
    if (transform && transform !== "none") {
      var match = transform.match(transformRegExp);
      if (match) {
        switch(match[1]) {
          case "matrix":
            matrix = match[2].split(",").map(Util.trimText).map(Util.asFloat);
            break;
        }
      }
    }

    return {
      origin: transformOrigin,
      matrix: matrix
    };
  }

  function createStack(element, parentStack, bounds, transform) {
    var ctx = h2cRenderContext((!parentStack) ? documentWidth() : bounds.width , (!parentStack) ? documentHeight() : bounds.height),
    stack = {
      ctx: ctx,
      opacity: setOpacity(ctx, element, parentStack),
      cssPosition: getCSS(element, "position"),
      borders: getBorderData(element),
      transform: transform,
      clip: (parentStack && parentStack.clip) ? Util.Extend( {}, parentStack.clip ) : null
    };

    setZ(element, stack, parentStack);

    // TODO correct overflow for absolute content residing under a static position
    if (options.useOverflow === true && /(hidden|scroll|auto)/.test(getCSS(element, "overflow")) === true && /(BODY)/i.test(element.nodeName) === false){
      stack.clip = (stack.clip) ? clipBounds(stack.clip, bounds) : bounds;
    }

    return stack;
  }

  function getBackgroundBounds(borders, bounds, clip) {
    var backgroundBounds = {
      left: bounds.left + borders[3].width,
      top: bounds.top + borders[0].width,
      width: bounds.width - (borders[1].width + borders[3].width),
      height: bounds.height - (borders[0].width + borders[2].width)
    };

    if (clip) {
      backgroundBounds = clipBounds(backgroundBounds, clip);
    }

    return backgroundBounds;
  }

  function getBounds(element, transform) {
    var bounds = (transform.matrix) ? Util.OffsetBounds(element) : Util.Bounds(element);
    transform.origin[0] += bounds.left;
    transform.origin[1] += bounds.top;
    return bounds;
  }

  function renderElement(element, parentStack, pseudoElement, ignoreBackground) {
    var transform = getTransform(element, parentStack),
    bounds = getBounds(element, transform),
    image,
    stack = createStack(element, parentStack, bounds, transform),
    borders = stack.borders,
    ctx = stack.ctx,
    backgroundBounds = getBackgroundBounds(borders, bounds, stack.clip),
    borderData = parseBorders(element, bounds, borders),
    backgroundColor = (ignoreElementsRegExp.test(element.nodeName)) ? "#efefef" : getCSS(element, "backgroundColor");


    createShape(ctx, borderData.clip);

    ctx.save();
    ctx.clip();

    if (backgroundBounds.height > 0 && backgroundBounds.width > 0 && !ignoreBackground) {
      renderBackgroundColor(ctx, bounds, backgroundColor);
      renderBackgroundImage(element, backgroundBounds, ctx);
    } else if (ignoreBackground) {
      stack.backgroundColor =  backgroundColor;
    }

    ctx.restore();

    borderData.borders.forEach(function(border) {
      renderBorders(ctx, border.args, border.color);
    });

    if (!pseudoElement) {
      injectPseudoElements(element, stack);
    }

    switch(element.nodeName){
      case "IMG":
        if ((image = loadImage(element.getAttribute('src')))) {
          renderImage(ctx, element, image, bounds, borders);
        } else {
          Util.log("html2canvas: Error loading <img>:" + element.getAttribute('src'));
        }
        break;
      case "INPUT":
        // TODO add all relevant type's, i.e. HTML5 new stuff
        // todo add support for placeholder attribute for browsers which support it
        if (/^(text|url|email|submit|button|reset)$/.test(element.type) && (element.value || element.placeholder || "").length > 0){
          renderFormValue(element, bounds, stack);
        }
        break;
      case "TEXTAREA":
        if ((element.value || element.placeholder || "").length > 0){
          renderFormValue(element, bounds, stack);
        }
        break;
      case "SELECT":
        if ((element.options||element.placeholder || "").length > 0){
          renderFormValue(element, bounds, stack);
        }
        break;
      case "LI":
        renderListItem(element, stack, backgroundBounds);
        break;
      case "CANVAS":
        renderImage(ctx, element, element, bounds, borders);
        break;
    }

    return stack;
  }

  function isElementVisible(element) {
    return (getCSS(element, 'display') !== "none" && getCSS(element, 'visibility') !== "hidden" && !element.hasAttribute("data-html2canvas-ignore"));
  }

  function parseElement (element, stack, pseudoElement) {
    if (isElementVisible(element)) {
      stack = renderElement(element, stack, pseudoElement, false) || stack;
      if (!ignoreElementsRegExp.test(element.nodeName)) {
        parseChildren(element, stack, pseudoElement);
      }
    }
  }

  function parseChildren(element, stack, pseudoElement) {
    Util.Children(element).forEach(function(node) {
      if (node.nodeType === node.ELEMENT_NODE) {
        parseElement(node, stack, pseudoElement);
      } else if (node.nodeType === node.TEXT_NODE) {
        renderText(element, node, stack);
      }
    });
  }

  function init() {
    var background = getCSS(document.documentElement, "backgroundColor"),
      transparentBackground = (Util.isTransparent(background) && element === document.body),
      stack = renderElement(element, null, false, transparentBackground);
    parseChildren(element, stack);

    if (transparentBackground) {
      background = stack.backgroundColor;
    }

    body.removeChild(hidePseudoElements);
    return {
      backgroundColor: background,
      stack: stack
    };
  }

  return init();
};

function h2czContext(zindex) {
  return {
    zindex: zindex,
    children: []
  };
}

_html2canvas.Preload = function( options ) {

  var images = {
    numLoaded: 0,   // also failed are counted here
    numFailed: 0,
    numTotal: 0,
    cleanupDone: false
  },
  pageOrigin,
  Util = _html2canvas.Util,
  methods,
  i,
  count = 0,
  element = options.elements[0] || document.body,
  doc = element.ownerDocument,
  domImages = element.getElementsByTagName('img'), // Fetch images of the present element only
  imgLen = domImages.length,
  link = doc.createElement("a"),
  supportCORS = (function( img ){
    return (img.crossOrigin !== undefined);
  })(new Image()),
  timeoutTimer;

  link.href = window.location.href;
  pageOrigin  = link.protocol + link.host;

  function isSameOrigin(url){
    link.href = url;
    link.href = link.href; // YES, BELIEVE IT OR NOT, that is required for IE9 - http://jsfiddle.net/niklasvh/2e48b/
    var origin = link.protocol + link.host;
    return (origin === pageOrigin);
  }

  function start(){
    Util.log("html2canvas: start: images: " + images.numLoaded + " / " + images.numTotal + " (failed: " + images.numFailed + ")");
    if (!images.firstRun && images.numLoaded >= images.numTotal){
      Util.log("Finished loading images: # " + images.numTotal + " (failed: " + images.numFailed + ")");

      if (typeof options.complete === "function"){
        options.complete(images);
      }

    }
  }

  // TODO modify proxy to serve images with CORS enabled, where available
  function proxyGetImage(url, img, imageObj){
    var callback_name,
    scriptUrl = options.proxy,
    script;

    link.href = url;
    url = link.href; // work around for pages with base href="" set - WARNING: this may change the url

    callback_name = 'html2canvas_' + (count++);
    imageObj.callbackname = callback_name;

    if (scriptUrl.indexOf("?") > -1) {
      scriptUrl += "&";
    } else {
      scriptUrl += "?";
    }
    scriptUrl += 'url=' + encodeURIComponent(url) + '&callback=' + callback_name;
    script = doc.createElement("script");

    window[callback_name] = function(a){
      if (a.substring(0,6) === "error:"){
        imageObj.succeeded = false;
        images.numLoaded++;
        images.numFailed++;
        start();
      } else {
        setImageLoadHandlers(img, imageObj);
        img.src = a;
      }
      window[callback_name] = undefined; // to work with IE<9  // NOTE: that the undefined callback property-name still exists on the window object (for IE<9)
      try {
        delete window[callback_name];  // for all browser that support this
      } catch(ex) {}
      script.parentNode.removeChild(script);
      script = null;
      delete imageObj.script;
      delete imageObj.callbackname;
    };

    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", scriptUrl);
    imageObj.script = script;
    window.document.body.appendChild(script);

  }

  function loadPseudoElement(element, type) {
    var style = window.getComputedStyle(element, type),
    content = style.content;
    if (content.substr(0, 3) === 'url') {
      methods.loadImage(_html2canvas.Util.parseBackgroundImage(content)[0].args[0]);
    }
    loadBackgroundImages(style.backgroundImage, element);
  }

  function loadPseudoElementImages(element) {
    loadPseudoElement(element, ":before");
    loadPseudoElement(element, ":after");
  }

  function loadGradientImage(backgroundImage, bounds) {
    var img = _html2canvas.Generate.Gradient(backgroundImage, bounds);

    if (img !== undefined){
      images[backgroundImage] = {
        img: img,
        succeeded: true
      };
      images.numTotal++;
      images.numLoaded++;
      start();
    }
  }

  function invalidBackgrounds(background_image) {
    return (background_image && background_image.method && background_image.args && background_image.args.length > 0 );
  }

  function loadBackgroundImages(background_image, el) {
    var bounds;

    _html2canvas.Util.parseBackgroundImage(background_image).filter(invalidBackgrounds).forEach(function(background_image) {
      if (background_image.method === 'url') {
        methods.loadImage(background_image.args[0]);
      } else if(background_image.method.match(/\-?gradient$/)) {
        if(bounds === undefined) {
          bounds = _html2canvas.Util.Bounds(el);
        }
        loadGradientImage(background_image.value, bounds);
      }
    });
  }

  function getImages (el) {
    var elNodeType = false;

    // Firefox fails with permission denied on pages with iframes
    try {
      Util.Children(el).forEach(getImages);
    }
    catch( e ) {}

    try {
      elNodeType = el.nodeType;
    } catch (ex) {
      elNodeType = false;
      Util.log("html2canvas: failed to access some element's nodeType - Exception: " + ex.message);
    }

    if (elNodeType === 1 || elNodeType === undefined) {
      loadPseudoElementImages(el);
      try {
        loadBackgroundImages(Util.getCSS(el, 'backgroundImage'), el);
      } catch(e) {
        Util.log("html2canvas: failed to get background-image - Exception: " + e.message);
      }
      loadBackgroundImages(el);
    }
  }

  function setImageLoadHandlers(img, imageObj) {
    img.onload = function() {
      if ( imageObj.timer !== undefined ) {
        // CORS succeeded
        window.clearTimeout( imageObj.timer );
      }

      images.numLoaded++;
      imageObj.succeeded = true;
      img.onerror = img.onload = null;
      start();
    };
    img.onerror = function() {
      if (img.crossOrigin === "anonymous") {
        // CORS failed
        window.clearTimeout( imageObj.timer );

        // let's try with proxy instead
        if ( options.proxy ) {
          var src = img.src;
          img = new Image();
          imageObj.img = img;
          img.src = src;

          proxyGetImage( img.src, img, imageObj );
          return;
        }
      }

      images.numLoaded++;
      images.numFailed++;
      imageObj.succeeded = false;
      img.onerror = img.onload = null;
      start();
    };
  }

  methods = {
    loadImage: function( src ) {
      var img, imageObj;
      if ( src && images[src] === undefined ) {
        img = new Image();
        if ( src.match(/data:image\/.*;base64,/i) ) {
          img.src = src.replace(/url\(['"]{0,}|['"]{0,}\)$/ig, '');
          imageObj = images[src] = {
            img: img
          };
          images.numTotal++;
          setImageLoadHandlers(img, imageObj);
        } else if ( isSameOrigin( src ) || options.allowTaint ===  true ) {
          imageObj = images[src] = {
            img: img
          };
          images.numTotal++;
          setImageLoadHandlers(img, imageObj);
          img.src = src;
        } else if ( supportCORS && !options.allowTaint && options.useCORS ) {
          // attempt to load with CORS

          img.crossOrigin = "anonymous";
          imageObj = images[src] = {
            img: img
          };
          images.numTotal++;
          setImageLoadHandlers(img, imageObj);
          img.src = src;
        } else if ( options.proxy ) {
          imageObj = images[src] = {
            img: img
          };
          images.numTotal++;
          proxyGetImage( src, img, imageObj );
        }
      }

    },
    cleanupDOM: function(cause) {
      var img, src;
      if (!images.cleanupDone) {
        if (cause && typeof cause === "string") {
          Util.log("html2canvas: Cleanup because: " + cause);
        } else {
          Util.log("html2canvas: Cleanup after timeout: " + options.timeout + " ms.");
        }

        for (src in images) {
          if (images.hasOwnProperty(src)) {
            img = images[src];
            if (typeof img === "object" && img.callbackname && img.succeeded === undefined) {
              // cancel proxy image request
              window[img.callbackname] = undefined; // to work with IE<9  // NOTE: that the undefined callback property-name still exists on the window object (for IE<9)
              try {
                delete window[img.callbackname];  // for all browser that support this
              } catch(ex) {}
              if (img.script && img.script.parentNode) {
                img.script.setAttribute("src", "about:blank");  // try to cancel running request
                img.script.parentNode.removeChild(img.script);
              }
              images.numLoaded++;
              images.numFailed++;
              Util.log("html2canvas: Cleaned up failed img: '" + src + "' Steps: " + images.numLoaded + " / " + images.numTotal);
            }
          }
        }

        // cancel any pending requests
        if(window.stop !== undefined) {
          window.stop();
        } else if(document.execCommand !== undefined) {
          document.execCommand("Stop", false);
        }
        if (document.close !== undefined) {
          document.close();
        }
        images.cleanupDone = true;
        if (!(cause && typeof cause === "string")) {
          start();
        }
      }
    },

    renderingDone: function() {
      if (timeoutTimer) {
        window.clearTimeout(timeoutTimer);
      }
    }
  };

  if (options.timeout > 0) {
    timeoutTimer = window.setTimeout(methods.cleanupDOM, options.timeout);
  }

  Util.log('html2canvas: Preload starts: finding background-images');
  images.firstRun = true;

  getImages(element);

  Util.log('html2canvas: Preload: Finding images');
  // load <img> images
  for (i = 0; i < imgLen; i+=1){
    methods.loadImage( domImages[i].getAttribute( "src" ) );
  }

  images.firstRun = false;
  Util.log('html2canvas: Preload: Done.');
  if (images.numTotal === images.numLoaded) {
    start();
  }

  return methods;
};

_html2canvas.Renderer = function(parseQueue, options){

  // http://www.w3.org/TR/CSS21/zindex.html
  function createRenderQueue(parseQueue) {
    var queue = [],
    rootContext;

    rootContext = (function buildStackingContext(rootNode) {
      var rootContext = {};
      function insert(context, node, specialParent) {
        var zi = (node.zIndex.zindex === 'auto') ? 0 : Number(node.zIndex.zindex),
        contextForChildren = context, // the stacking context for children
        isPositioned = node.zIndex.isPositioned,
        isFloated = node.zIndex.isFloated,
        stub = {node: node},
        childrenDest = specialParent; // where children without z-index should be pushed into

        if (node.zIndex.ownStacking) {
          // '!' comes before numbers in sorted array
          contextForChildren = stub.context = { '!': [{node:node, children: []}]};
          childrenDest = undefined;
        } else if (isPositioned || isFloated) {
          childrenDest = stub.children = [];
        }

        if (zi === 0 && specialParent) {
          specialParent.push(stub);
        } else {
          if (!context[zi]) { context[zi] = []; }
          context[zi].push(stub);
        }

        node.zIndex.children.forEach(function(childNode) {
          insert(contextForChildren, childNode, childrenDest);
        });
      }
      insert(rootContext, rootNode);
      return rootContext;
    })(parseQueue);

    function sortZ(context) {
      Object.keys(context).sort().forEach(function(zi) {
        var nonPositioned = [],
        floated = [],
        positioned = [],
        list = [];

        // positioned after static
        context[zi].forEach(function(v) {
          if (v.node.zIndex.isPositioned || v.node.zIndex.opacity < 1) {
            // http://www.w3.org/TR/css3-color/#transparency
            // non-positioned element with opactiy < 1 should be stacked as if it were a positioned element with ‘z-index: 0’ and ‘opacity: 1’.
            positioned.push(v);
          } else if (v.node.zIndex.isFloated) {
            floated.push(v);
          } else {
            nonPositioned.push(v);
          }
        });

        (function walk(arr) {
          arr.forEach(function(v) {
            list.push(v);
            if (v.children) { walk(v.children); }
          });
        })(nonPositioned.concat(floated, positioned));

        list.forEach(function(v) {
          if (v.context) {
            sortZ(v.context);
          } else {
            queue.push(v.node);
          }
        });
      });
    }

    sortZ(rootContext);

    return queue;
  }

  function getRenderer(rendererName) {
    var renderer;

    if (typeof options.renderer === "string" && _html2canvas.Renderer[rendererName] !== undefined) {
      renderer = _html2canvas.Renderer[rendererName](options);
    } else if (typeof rendererName === "function") {
      renderer = rendererName(options);
    } else {
      throw new Error("Unknown renderer");
    }

    if ( typeof renderer !== "function" ) {
      throw new Error("Invalid renderer defined");
    }
    return renderer;
  }

  return getRenderer(options.renderer)(parseQueue, options, document, createRenderQueue(parseQueue.stack), _html2canvas);
};

_html2canvas.Util.Support = function (options, doc) {

  function supportSVGRendering() {
    var img = new Image(),
    canvas = doc.createElement("canvas"),
    ctx = (canvas.getContext === undefined) ? false : canvas.getContext("2d");
    if (ctx === false) {
      return false;
    }
    canvas.width = canvas.height = 10;
    img.src = [
    "data:image/svg+xml,",
    "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'>",
    "<foreignObject width='10' height='10'>",
    "<div xmlns='http://www.w3.org/1999/xhtml' style='width:10;height:10;'>",
    "sup",
    "</div>",
    "</foreignObject>",
    "</svg>"
    ].join("");
    try {
      ctx.drawImage(img, 0, 0);
      canvas.toDataURL();
    } catch(e) {
      return false;
    }
    _html2canvas.Util.log('html2canvas: Parse: SVG powered rendering available');
    return true;
  }

  // Test whether we can use ranges to measure bounding boxes
  // Opera doesn't provide valid bounds.height/bottom even though it supports the method.

  function supportRangeBounds() {
    var r, testElement, rangeBounds, rangeHeight, support = false;

    if (doc.createRange) {
      r = doc.createRange();
      if (r.getBoundingClientRect) {
        testElement = doc.createElement('boundtest');
        testElement.style.height = "123px";
        testElement.style.display = "block";
        doc.body.appendChild(testElement);

        r.selectNode(testElement);
        rangeBounds = r.getBoundingClientRect();
        rangeHeight = rangeBounds.height;

        if (rangeHeight === 123) {
          support = true;
        }
        doc.body.removeChild(testElement);
      }
    }

    return support;
  }

  return {
    rangeBounds: supportRangeBounds(),
    svgRendering: options.svgRendering && supportSVGRendering()
  };
};
window.html2canvas = function(elements, opts) {
  elements = (elements.length) ? elements : [elements];
  var queue,
  canvas,
  options = {
    // general
    logging: false,
    elements: elements,
    background: "#fff",

    // preload options
    proxy: null,
    timeout: 0,    // no timeout
    useCORS: false, // try to load images as CORS (where available), before falling back to proxy
    allowTaint: false, // whether to allow images to taint the canvas, won't need proxy if set to true

    // parse options
    svgRendering: false, // use svg powered rendering where available (FF11+)
    ignoreElements: "IFRAME|OBJECT|PARAM",
    useOverflow: true,
    letterRendering: false,
    chinese: false,

    // render options

    width: null,
    height: null,
    taintTest: true, // do a taint test with all images before applying to canvas
    renderer: "Canvas"
  };

  options = _html2canvas.Util.Extend(opts, options);

  _html2canvas.logging = options.logging;
  options.complete = function( images ) {

    if (typeof options.onpreloaded === "function") {
      if ( options.onpreloaded( images ) === false ) {
        return;
      }
    }
    queue = _html2canvas.Parse( images, options );

    if (typeof options.onparsed === "function") {
      if ( options.onparsed( queue ) === false ) {
        return;
      }
    }

    canvas = _html2canvas.Renderer( queue, options );

    if (typeof options.onrendered === "function") {
      options.onrendered( canvas );
    }


  };

  // for pages without images, we still want this to be async, i.e. return methods before executing
  window.setTimeout( function(){
    _html2canvas.Preload( options );
  }, 0 );

  return {
    render: function( queue, opts ) {
      return _html2canvas.Renderer( queue, _html2canvas.Util.Extend(opts, options) );
    },
    parse: function( images, opts ) {
      return _html2canvas.Parse( images, _html2canvas.Util.Extend(opts, options) );
    },
    preload: function( opts ) {
      return _html2canvas.Preload( _html2canvas.Util.Extend(opts, options) );
    },
    log: _html2canvas.Util.log
  };
};

window.html2canvas.log = _html2canvas.Util.log; // for renderers
window.html2canvas.Renderer = {
  Canvas: undefined // We are assuming this will be used
};
_html2canvas.Renderer.Canvas = function(options) {
  options = options || {};

  var doc = document,
  safeImages = [],
  testCanvas = document.createElement("canvas"),
  testctx = testCanvas.getContext("2d"),
  Util = _html2canvas.Util,
  canvas = options.canvas || doc.createElement('canvas');

  function createShape(ctx, args) {
    ctx.beginPath();
    args.forEach(function(arg) {
      ctx[arg.name].apply(ctx, arg['arguments']);
    });
    ctx.closePath();
  }

  function safeImage(item) {
    if (safeImages.indexOf(item['arguments'][0].src ) === -1) {
      testctx.drawImage(item['arguments'][0], 0, 0);
      try {
        testctx.getImageData(0, 0, 1, 1);
      } catch(e) {
        testCanvas = doc.createElement("canvas");
        testctx = testCanvas.getContext("2d");
        return false;
      }
      safeImages.push(item['arguments'][0].src);
    }
    return true;
  }

  function renderItem(ctx, item) {
    switch(item.type){
      case "variable":
        ctx[item.name] = item['arguments'];
        break;
      case "function":
        switch(item.name) {
          case "createPattern":
            if (item['arguments'][0].width > 0 && item['arguments'][0].height > 0) {
              try {
                ctx.fillStyle = ctx.createPattern(item['arguments'][0], "repeat");
              }
              catch(e) {
                Util.log("html2canvas: Renderer: Error creating pattern", e.message);
              }
            }
            break;
          case "drawShape":
            createShape(ctx, item['arguments']);
            break;
          case "drawImage":
            if (item['arguments'][8] > 0 && item['arguments'][7] > 0) {
              if (!options.taintTest || (options.taintTest && safeImage(item))) {
                ctx.drawImage.apply( ctx, item['arguments'] );
              }
            }
            break;
          default:
            ctx[item.name].apply(ctx, item['arguments']);
        }
        break;
    }
  }

  return function(parsedData, options, document, queue, _html2canvas) {
    var ctx = canvas.getContext("2d"),
    newCanvas,
    bounds,
    fstyle,
    zStack = parsedData.stack;

    canvas.width = canvas.style.width =  options.width || zStack.ctx.width;
    canvas.height = canvas.style.height = options.height || zStack.ctx.height;

    fstyle = ctx.fillStyle;
    ctx.fillStyle = (Util.isTransparent(zStack.backgroundColor) && options.background !== undefined) ? options.background : parsedData.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = fstyle;

    queue.forEach(function(storageContext) {
      // set common settings for canvas
      ctx.textBaseline = "bottom";
      ctx.save();

      if (storageContext.transform.matrix) {
        ctx.translate(storageContext.transform.origin[0], storageContext.transform.origin[1]);
        ctx.transform.apply(ctx, storageContext.transform.matrix);
        ctx.translate(-storageContext.transform.origin[0], -storageContext.transform.origin[1]);
      }

      if (storageContext.clip){
        ctx.beginPath();
        ctx.rect(storageContext.clip.left, storageContext.clip.top, storageContext.clip.width, storageContext.clip.height);
        ctx.clip();
      }

      if (storageContext.ctx.storage) {
        storageContext.ctx.storage.forEach(function(item) {
          renderItem(ctx, item);
        });
      }

      ctx.restore();
    });

    Util.log("html2canvas: Renderer: Canvas renderer done - returning canvas obj");

    if (options.elements.length === 1) {
      if (typeof options.elements[0] === "object" && options.elements[0].nodeName !== "BODY") {
        // crop image to the bounds of selected (single) element
        bounds = _html2canvas.Util.Bounds(options.elements[0]);
        newCanvas = document.createElement('canvas');
        newCanvas.width = Math.ceil(bounds.width);
        newCanvas.height = Math.ceil(bounds.height);
        ctx = newCanvas.getContext("2d");

        ctx.drawImage(canvas, bounds.left, bounds.top, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
        canvas = null;
        return newCanvas;
      }
    }

    return canvas;
  };
};
})(window,document);

; browserify_shim__define__module__export__(typeof html2canvas != "undefined" ? html2canvas : window.html2canvas);

}).call(global, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
/**
 * Adapted from here to be able to work with require()
 * https://github.com/shramov/leaflet-plugins/blob/master/layer/tile/Bing.js
 */

var L = _dereq_("leaflet");

var BingLayer = L.TileLayer.extend({
	options: {
		subdomains: [0, 1, 2, 3],
		type: 'Aerial',
		attribution: 'Bing',
		culture: ''
	},

	initialize: function (key, options) {
		L.Util.setOptions(this, options);

		this._key = key;
		this._url = null;
		this._providers = [];
		this.metaRequested = false;
	},

	tile2quad: function (x, y, z) {
		var quad = '';
		for (var i = z; i > 0; i--) {
			var digit = 0;
			var mask = 1 << (i - 1);
			if ((x & mask) !== 0) digit += 1;
			if ((y & mask) !== 0) digit += 2;
			quad = quad + digit;
		}
		return quad;
	},

	getTileUrl: function (tilePoint) {
		var zoom = this._getZoomForUrl();
		var subdomains = this.options.subdomains,
			s = this.options.subdomains[Math.abs((tilePoint.x + tilePoint.y) % subdomains.length)];
		return this._url.replace('{subdomain}', s)
				.replace('{quadkey}', this.tile2quad(tilePoint.x, tilePoint.y, zoom))
				.replace('{culture}', this.options.culture);
	},

	loadMetadata: function () {
		if (this.metaRequested) return;
		this.metaRequested = true;
		var _this = this;
		var cbid = '_bing_metadata_' + L.Util.stamp(this);
		window[cbid] = function (meta) {
			window[cbid] = undefined;
			var e = document.getElementById(cbid);
			e.parentNode.removeChild(e);
			if (meta.errorDetails) {
				throw new Error(meta.errorDetails);
				return;
			}
			_this.initMetadata(meta);
		};
		var urlScheme = (document.location.protocol === 'file:') ? 'http' : document.location.protocol.slice(0, -1);
		var url = urlScheme + '://dev.virtualearth.net/REST/v1/Imagery/Metadata/'
					+ this.options.type + '?include=ImageryProviders&jsonp=' + cbid +
					'&key=' + this._key + '&UriScheme=' + urlScheme;
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.id = cbid;
		document.getElementsByTagName('head')[0].appendChild(script);
	},

	initMetadata: function (meta) {
		var r = meta.resourceSets[0].resources[0];
		this.options.subdomains = r.imageUrlSubdomains;
		this._url = r.imageUrl;
		if (r.imageryProviders) {
			for (var i = 0; i < r.imageryProviders.length; i++) {
				var p = r.imageryProviders[i];
				for (var j = 0; j < p.coverageAreas.length; j++) {
					var c = p.coverageAreas[j];
					var coverage = {zoomMin: c.zoomMin, zoomMax: c.zoomMax, active: false};
					var bounds = new L.LatLngBounds(
							new L.LatLng(c.bbox[0]+0.01, c.bbox[1]+0.01),
							new L.LatLng(c.bbox[2]-0.01, c.bbox[3]-0.01)
					);
					coverage.bounds = bounds;
					coverage.attrib = p.attribution;
					this._providers.push(coverage);
				}
			}
		}
		this._update();
	},

	_update: function () {
		if (this._url === null || !this._map) return;
		this._update_attribution();
		L.TileLayer.prototype._update.apply(this, []);
	},

	_update_attribution: function () {
		var bounds = L.latLngBounds(this._map.getBounds().getSouthWest().wrap(),this._map.getBounds().getNorthEast().wrap());
		var zoom = this._map.getZoom();
		for (var i = 0; i < this._providers.length; i++) {
			var p = this._providers[i];
			if ((zoom <= p.zoomMax && zoom >= p.zoomMin) &&
					bounds.intersects(p.bounds)) {
				if (!p.active && this._map.attributionControl)
					this._map.attributionControl.addAttribution(p.attrib);
				p.active = true;
			} else {
				if (p.active && this._map.attributionControl)
					this._map.attributionControl.removeAttribution(p.attrib);
				p.active = false;
			}
		}
	},

	onAdd: function (map) {
		this.loadMetadata();
		L.TileLayer.prototype.onAdd.apply(this, [map]);
	},

	onRemove: function (map) {
		for (var i = 0; i < this._providers.length; i++) {
			var p = this._providers[i];
			if (p.active && this._map.attributionControl) {
				this._map.attributionControl.removeAttribution(p.attrib);
				p.active = false;
			}
		}
		L.TileLayer.prototype.onRemove.apply(this, [map]);
	}
});

var bingLayer = function (key, options) {
    return new BingLayer(key, options);
};

module.exports = {
  BingLayer: BingLayer,
  bingLayer: bingLayer
};

},{}],4:[function(_dereq_,module,exports){
/*

	ractive-transitions-slide
	=========================

	Version 0.1.2.

	This transition slides an element in and out of view,
	using CSS transitions where possible.

	==========================

	Troubleshooting: If you're using a module system in your app (AMD or
	something more nodey) then you may need to change the paths below,
	where it says `require( 'ractive' )` or `define([ 'ractive' ]...)`.

	==========================

	Usage: Include this file on your page below Ractive, e.g:

	    <script src='lib/ractive.js'></script>
	    <script src='lib/ractive-transitions-slide.js'></script>

	Or, if you're using a module loader, require this module:

	    // requiring the plugin will 'activate' it - no need to use
	    // the return value
	    require( 'ractive-transitions-slide' );

	You can specify the `delay`, `duration` and `easing` properties
	using the conventional syntax:

	    <div intro='slide:{"delay":500,"easing":"ease-out"}'>content</div>

	Both `delay` and `duration` are in milliseconds. The `easing` value
	must be a valid CSS easing function (see http://cubic-bezier.com/).

*/

(function ( global, factory ) {

	'use strict';

	// Common JS (i.e. browserify) environment
	if ( typeof module !== 'undefined' && module.exports && typeof _dereq_ === 'function' ) {
		factory( _dereq_( 'ractive' ) );
	}

	// AMD?
	else if ( typeof define === 'function' && define.amd ) {
		define([ 'ractive' ], factory );
	}

	// browser global
	else if ( global.Ractive ) {
		factory( global.Ractive );
	}

	else {
		throw new Error( 'Could not find Ractive! It must be loaded before the ractive-transitions-slide plugin' );
	}

}( typeof window !== 'undefined' ? window : this, function ( Ractive ) {

	'use strict';

	var slide, props, collapsed, defaults;

	defaults = {
		duration: 300,
		easing: 'easeInOut'
	};

	props = [
		'height',
		'borderTopWidth',
		'borderBottomWidth',
		'paddingTop',
		'paddingBottom',
		'marginTop',
		'marginBottom'
	];

	collapsed = {
		height: 0,
		borderTopWidth: 0,
		borderBottomWidth: 0,
		paddingTop: 0,
		paddingBottom: 0,
		marginTop: 0,
		marginBottom: 0
	};

	slide = function ( t, params ) {
		var targetStyle;

		params = t.processParams( params, defaults );

		if ( t.isIntro ) {
			targetStyle = t.getStyle( props );
			t.setStyle( collapsed );
		} else {
			// make style explicit, so we're not transitioning to 'auto'
			t.setStyle( t.getStyle( props ) );
			targetStyle = collapsed;
		}

		t.setStyle( 'overflowY', 'hidden' );

		t.animateStyle( targetStyle, params ).then( t.complete );
	};

	Ractive.transitions.slide = slide;

}));

},{}],5:[function(_dereq_,module,exports){
/**
 * Main locator file
 */
"use strict";

// Dependencies
var L = _dereq_("leaflet");
L.BingLayer = _dereq_("../libs/leaflet-plugins.bing.js").BingLayer;

var html2canvas = _dereq_("../libs/html2canvas.js");
var _ = _dereq_("lodash");
var Ractive = _dereq_("ractive");

// Additions
var rTap = _dereq_("ractive-events-tap");
_dereq_("../libs/ractive-transitions-slide.js");
_dereq_("leaflet-draw");
_dereq_("leaflet-minimap");

// Parts
var utils = _dereq_("./js/utils.js");
var dom = _dereq_("./js/dom.js");
var geocode = _dereq_("./js/geocode.js");

// Main contructor
var Locator = function(options) {
  this.options = _.extend({
    // Template
    template: " <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css\">  <div class=\"locator {{ (noGenerate.controlsOpen) ? 'controls-open' : 'controls-closed' }} {{ options.superClass }}\">  <section class=\"locator-display\">  <div class=\"locator-map-wrapper\">  <div class=\"locator-display-inner\">  <div class=\"locator-map\">  <div class=\"locator-map-attribution {{#options.embedAttribution}}enabled{{/}}\">  {{#options.overrideAttribution}}  {{{ options.overrideAttribution }}}  {{/}}  {{^options.overrideAttribution}}  {{{ options.tilesets[options.tileset].attribution }}}  {{/}}  </div>  </div>   <div class=\"locator-map-help\">  Move the marker by dragging the base.   {{#options.drawing}}  Use the buttons to draw shapes on the map.  {{/drawing}}   {{#(options.tilesets[options.tileset] && options.tilesets[options.tileset].attribution)}}  Required attribution for this map: <br>  <span class=\"attribution\">{{{ options.tilesets[options.tileset].attribution }}}</span>  {{/()}}  </div>  </div>  </div>  </section>    <section class=\"locator-controls\">  <div class=\"minor-controls\">  <div class=\"toggle-controls\" on-tap=\"toggle:'noGenerate.controlsOpen'\" title=\"{{#noGenerate.controlsOpen}}Hide controls and preview{{ else }}Show controls{{/noGenerate.controlsOpen}}\"></div>   <button class=\"minor-button minor-generate\" on-tap=\"generate\" title=\"Generate\"><i class=\"fa fa-download\"></i></button>  </div>   <div class=\"locator-controls-wrapper\">  <header>{{{ options.title }}}</header>   <div class=\"locator-input\">  <div class=\"locator-history\">  <button class=\"small inline action undo\" disabled=\"{{ !canUndo }}\" title=\"Undo\" on-tap=\"undo\"><i class=\"fa fa-rotate-left\"></i></button>  <button class=\"small inline action redo\" disabled=\"{{ !canRedo }}\" title=\"Redo\" on-tap=\"redo\"><i class=\"fa fa-rotate-right\"></i></button>  <button class=\"small inline destructive reset\" title=\"Reset all options\" on-tap=\"resetOptions\"><i class=\"fa fa-refresh\"></i></button>  </div>   {{^options.geocoder}}  <div class=\"config-option\">  <label>Latitude and longitude location</label>   <br><input type=\"number\" placeholder=\"Latitude\" value=\"{{ options.lat }}\" lazy>  <br><input type=\"number\" placeholder=\"Longitude\" value=\"{{ options.lng }}\" lazy>  </div>  {{/options.geocoder}}   {{#options.geocoder}}  <div class=\"config-option\">  <label>Search</label>  <input type=\"text\" placeholder=\"Address or lat,lng\" value=\"{{ geocodeInput }}\" lazy disabled=\"{{ isGeocoding }}\">  </div>  {{/options.geocoder}}   <div class=\"markers {{^options.markers}}no-markers{{/}}\">  <label class=\"no-markers-label\">Markers</label>  <button class=\"add-marker action small inline\" on-tap=\"add-marker\" title=\"Add marker at center of map\"><i class=\"fa fa-plus\"></i></button>   <label class=\"markers-label\">Markers</label>  <div class=\"help\">Use <code>&lt;br&gt;</code> to make line breaks.</div>   {{#options.markers:mi}}  <div class=\"marker\" intro-outro=\"slide\">  <div class=\"config-option\">  <input type=\"text\" placeholder=\"Marker label\" value=\"{{ this.text }}\" lazy>  </div>   <div class=\"marker-actions\">  {{#(_.size(options.markerBackgrounds) > 1)}}  <div class=\"color-picker color-picker-backgrounds\" title=\"Set marker background color\">  {{#options.markerBackgrounds:bi}}  <div class=\"color-picker-item {{#(options.markers[mi] && options.markers[mi].background === this)}}active{{ else }}inactive{{/()}} {{#(this.indexOf('255, 255, 255') !== -1 || this.indexOf('FFFFFF') !== -1)}}is-white{{/()}}\"  style=\"background-color: {{ this }}\"  on-tap=\"setMarker:{{ mi }},'background',{{ this }}\">  {{/}}  </div>&nbsp;  {{/}}   {{#(_.size(options.markerForegrounds) > 1)}}  <div class=\"color-picker color-picker-foregrounds\" title=\"Set marker foreground color\">  {{#options.markerForegrounds:bi}}  <div class=\"color-picker-item {{#(options.markers[mi] && options.markers[mi].foreground === this)}}active{{ else }}inactive{{/()}} {{#(this.indexOf('255, 255, 255') !== -1 || this.indexOf('FFFFFF') !== -1)}}is-white{{/()}}\"  style=\"background-color: {{ this }}\"  on-tap=\"setMarker:{{ mi }},'foreground',{{ this }}\">  {{/}}  </div>  {{/}}   {{#options.markerToCenter}}  <button class=\"action small\" on-tap=\"marker-to-center:{{ mi }}\" title=\"Move marker to center of map\"><i class=\"fa fa-compass\"></i></button>&nbsp;  {{/}}   {{#options.centerToMarker}}  <button class=\"action small\" on-tap=\"center-to-marker:{{ mi }}\" title=\"Center map on marker\"><i class=\"fa fa-plus-square-o\"></i></button>&nbsp;  {{/}}   <button class=\"destructive small\" on-tap=\"remove-marker:{{ mi }}\" title=\"Remove marker\"><i class=\"fa fa-close\"></i></button>  </div>  </div>  {{/}}  </div>   {{#options.drawing}}  <div class=\"drawing\">  <label class=\"markers-label\">Shapes</label>  <div class=\"help\">Use the buttons on the map to draw shapes.</div>   <div class=\"drawing-section\">  <div class=\"drawing-option\">  <input type=\"checkbox\" checked=\"{{ options.drawingStyles.stroke }}\" id=\"drawing-styles-stroke\" lazy>  <label for=\"drawing-styles-stroke\">Stroke</label>  </div>   {{#(_.size(options.drawingStrokes) > 1 && options.drawingStyles.stroke)}}  <div class=\"color-picker\" title=\"Set drawing stroke color\">  {{#options.drawingStrokes:di}}  <div class=\"color-picker-item {{#(options.drawingStyles.color === this)}}active{{ else }}inactive{{/()}} {{#(this.indexOf('255, 255, 255') !== -1 || this.indexOf('FFFFFF') !== -1)}}is-white{{/()}}\"  style=\"background-color: {{ this }}\"  on-tap=\"setDrawing:'color',{{ this }}\"></div>  {{/}}  </div>  {{/}}  </div>   <div class=\"drawing-section\">  <div class=\"drawing-option\">  <input type=\"checkbox\" checked=\"{{ options.drawingStyles.fill }}\" id=\"drawing-styles-fill\" lazy>  <label for=\"drawing-styles-fill\">Fill</label>  </div>   {{#(_.size(options.drawingStrokes) > 1 && options.drawingStyles.fill)}}  <div class=\"color-picker\" title=\"Set drawing fill color\">  {{#options.drawingFills:di}}  <div class=\"color-picker-item {{#(options.drawingStyles.fillColor === this)}}active{{ else }}inactive{{/()}} {{#(this.indexOf('255, 255, 255') !== -1 || this.indexOf('FFFFFF') !== -1)}}is-white{{/()}}\"  style=\"background-color: {{ this }}\"  on-tap=\"setDrawing:'fillColor',{{ this }}\"></div>  {{/}}  </div>  {{/}}  </div>  </div>  {{/options.drawing}}   {{#(_.size(options.tilesets) > 1)}}  <div class=\"config-option\">  <label>Background</label>   <div class=\"image-picker images-{{ _.size(options.tilesets) }}\">  {{#options.tilesets:i}}  <div class=\"image-picker-item {{ (options.tileset === i) ? 'active' : 'inactive' }}\" style=\"background-image: url({{= preview }});\" title=\"{{ i }}\" on-tap=\"set:'options.tileset',{{ i }}\"></div>  {{/options.tilesets}}  </div>  </div>  {{/()}}   {{#(_.size(options.widths) > 1)}}  <div class=\"config-option config-select\">  <label>Map width</label>   <select value=\"{{ options.width }}\">  {{#options.widths:i}}  <option value=\"{{ i }}\">{{ i }}</option>  {{/options.widths}}  </select>  </div>  {{/()}}   {{#(_.size(options.ratios) > 1)}}  <div class=\"config-option config-select\">  <label>Map aspect ratio</label>   <select value=\"{{ options.ratio }}\">  {{#options.ratios:i}}  <option value=\"{{ i }}\">{{ i }}</option>  {{/options.ratios}}  </select>  </div>  {{/()}}   {{#options.miniControl}}  <div class=\"config-option\">  <input type=\"checkbox\" checked=\"{{ options.mini }}\" id=\"config-mini\" lazy>  <label for=\"config-mini\">Mini-map</label>   {{#options.mini}}  <label>Mini-map zoom level</label>  <input type=\"range\" min=\"-20\" max=\"1\" value=\"{{ options.miniZoomOffset }}\" title=\"Adjust zoom level for map\">  {{/options.mini}}  </div>  {{/options.miniControl}}   <div class=\"config-option\">  <input type=\"checkbox\" checked=\"{{ options.embedAttribution }}\" id=\"config-embed-attribution\" lazy>  <label for=\"config-embed-attribution\">Embed attribution</label>   <input type=\"text\" placeholder=\"Override attribution\" value=\"{{ options.overrideAttribution }}\" lazy>  </div>   <div class=\"config-action\">  <button class=\"large additive generate-image\" on-tap=\"generate\">Generate <i class=\"fa fa-download\"></i></button>  </div>   <div class=\"preview\">  <h1>Preview</h1>  <img src=\"\" /><br>  <a href=\"\" class=\"download-link\">Download</a>  </div>  </div>   <footer>  {{{ options.footer }}}  </footer>  </div>  </section> </div> ",

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

},{"../libs/html2canvas.js":"UzntfK","../libs/leaflet-plugins.bing.js":3,"../libs/ractive-transitions-slide.js":4,"./js/dom.js":6,"./js/geocode.js":7,"./js/utils.js":8}],6:[function(_dereq_,module,exports){
/**
 * DOM utilities.
 */
"use strict";

// Dependencies
//var _ = require("lodash");

// Determine if element is overflowed with content
function isOverflowed(element, direction) {
  return (!direction) ?
    (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) :
    (direction === "y") ? (element.scrollHeight > element.clientHeight) :
    (direction === "x") ? (element.scrollWidth > element.clientWidth) : false;
}

// Exports
module.exports = {
  isOverflowed: isOverflowed
};

},{}],7:[function(_dereq_,module,exports){
/**
 * Geocoding functions
 */
"use strict";

// Dependencies
var _ = _dereq_("lodash");

// Simple google geocoder
function google(address, done) {
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

// Exports
module.exports = {
  google: google
};

},{}],8:[function(_dereq_,module,exports){
/**
 * General utility functions.
 */
"use strict";

// Dependencies
var _ = _dereq_("lodash");

// Deep clone
// http://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript
function clone(item) {
  function cloner(value) {
    if (_.isElement(value)) {
      return value.cloneNode(true);
    }
    else if (_.isDate(value)) {
      return new Date(value);
    }
    else {
      return _.cloneDeep(value);
    }
  }

  return _.cloneDeepWith(item, cloner);
}

// Create a slug/id
function makeID(input) {
  input = input ? input.toString() : "";
  input = input.toLowerCase().trim().replace(/\W+/g, "-");
  input = input ? input : "locator";
  return _.uniqueId(input + "-");
}

module.exports = {
  clone: clone,
  makeID: makeID
};

},{}]},{},[5])
(5)
});