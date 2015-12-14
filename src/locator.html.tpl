
<div class="locator {{ (noGenerate.controlsOpen) ? 'controls-open' : 'controls-closed' }}">
  <section class="locator-display">
    <div class="locator-map-wrapper">
      <div class="locator-map"></div>

      <div class="locator-map-help">
        Move the marker by dragging the base.
        {{#(options.tilesets[options.tileset] && options.tilesets[options.tileset].attribution)}}
          Required attribution for this map:
          <span class="attribution">{{{ options.tilesets[options.tileset].attribution }}}</span>
        {{/()}}
      </div>
    </div>
  </section>

  <div class="toggle-controls" on-tap="toggle:'noGenerate.controlsOpen'"></div>

  <section class="locator-controls">
    <header>Locator</header>

    <div class="locator-input">
      <div class="config-option">
        <label>Marker label.  Use <code>&lt;br&gt;</code> to make line breaks.</label>
        <input type="text" placeholder="Marker label" value="{{ options.markerText }}" lazy>
      </div>

      {{^options.geocoder}}
        <div class="config-option">
          <label>Latitude and longitude location</label>

          <br><input type="number" placeholder="Latitude" value="{{ options.lat }}" lazy>
          <br><input type="number" placeholder="Longitude" value="{{ options.lng }}" lazy>
        </div>
      {{/options.geocoder}}

      {{#options.geocoder}}
        <div class="config-option">
          <label>Search location by address</label>
          <input type="text" placeholder="Address or place" value="{{ geocodeInput }}" lazy disabled="{{ isGeocoding }}">
        </div>
      {{/options.geocoder}}

      {{#(_.size(options.tilesets))}}
        <div class="config-option">
          <label>Background map set</label>

          <div class="image-picker images-{{ _.size(options.tilesets) }}">
            {{#options.tilesets:i}}
              <div class="image-picker-item {{ (options.tileset === i) ? 'active' : '' }}" style="background-image: url({{= preview }});" title="{{ i }}" on-tap="set:'options.tileset',{{ i }}"></div>
            {{/options.tilesets}}
          </div>
        </div>
      {{/()}}

      {{#(_.size(options.widths))}}
        <div class="config-option config-select">
          <label>Map width</label>

          <select value="{{ options.width }}">
            {{#options.widths:i}}
              <option value="{{ i }}">{{ i }}</option>
            {{/options.widths}}
          </select>
        </div>
      {{/()}}

      {{#(_.size(options.ratios))}}
        <div class="config-option config-select">
          <label>Map aspect ratio</label>

          <select value="{{ options.ratio }}">
            {{#options.ratios:i}}
              <option value="{{ i }}">{{ i }}</option>
            {{/options.ratios}}
          </select>
        </div>
      {{/()}}

      <div class="config-option">
        <label>Mini-map zoom</label>

        <input type="range" min="-10" max="1" value="{{ options.miniZoomOffset }}" title="Adjust zoom level for map">
      </div>

      <div class="config-action">
        <button class="generate-image" on-click="generate">Generate</button>
      </div>

      <div class="preview">
        <h1>Preview</h1>
        <img src="" /><br>
        <a href="" class="download-link">Download</a>
      </div>
    </div>

    <footer>
      <p>Made by WNYC</p>
    </footer>
  </section>
</div>
