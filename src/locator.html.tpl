
<div class="locator">
  <section class="locator-display">
    <div class="locator-map-wrapper">
      <div class="locator-map"></div>
    </div>
  </section>

  <div class="toggle-controls"></div>

  <section class="locator-controls">
    <header>Locator</header>

    <div class="locator-input">
      <div class="config-option">
        <label>Marker label</label>
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
        <div class="config-option config-select">
          <label>Background map set</label>

          <select value="{{ options.tileset }}">
            {{#options.tilesets:i}}
              <option value="{{ i }}">{{ i }}</option>
            {{/options.tilesets}}
          </select>
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
