
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

<div class="locator {{ (noGenerate.controlsOpen) ? 'controls-open' : 'controls-closed' }} {{ options.superClass }}">
  <section class="locator-display">
      <div class="locator-map-wrapper">
        <div class="locator-display-inner">
          <div class="locator-map">
            <div class="locator-map-attribution {{#options.embedAttribution}}enabled{{/}}">
              {{#options.overrideAttribution}}
                {{{ options.overrideAttribution }}}
              {{/}}
              {{^options.overrideAttribution}}
                {{{ options.tilesets[options.tileset].attribution }}}
              {{/}}
            </div>
          </div>

          <div class="locator-map-help">
            Move the marker by dragging the base.
            {{#(options.tilesets[options.tileset] && options.tilesets[options.tileset].attribution)}}
              Required attribution for this map:
              <span class="attribution">{{{ options.tilesets[options.tileset].attribution }}}</span>
            {{/()}}
          </div>
      </div>
    </div>
  </section>


  <section class="locator-controls">
    <div class="minor-controls">
      <div class="toggle-controls" on-tap="toggle:'noGenerate.controlsOpen'"></div>

      <button class="minor-button minor-generate" on-tap="generate" title="Generate"><i class="fa fa-download"></i></button>
    </div>

    <div class="locator-controls-wrapper">
      <header>{{{ options.title }}}</header>

      <div class="locator-input">

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

        <div class="markers {{^options.markers}}no-markers{{/}}">
          <label>
            Markers.
            <button class="add-marker additive small inline" on-tap="add-marker" title="Add marker at center of map"><i class="fa fa-plus"></i></button>
          </label>
          <div class="help">Use <code>&lt;br&gt;</code> to make line breaks.</div>

          {{#options.markers:mi}}
            <div class="marker" intro-outro="slide">
              <div class="config-option">
                <input type="text" placeholder="Marker label" value="{{ this.text }}" lazy>
              </div>

              <div class="marker-actions">
                {{#options.markerToCenter}}
                  <button class="action small" on-tap="marker-to-center:{{ mi }}" title="Move marker to center of map"><i class="fa fa-compass"></i></button>
                {{/}}

                {{#options.centerToMarker}}
                  <button class="action small" on-tap="center-to-marker:{{ mi }}" title="Center map on marker"><i class="fa fa-plus-square-o"></i></button>
                {{/}}

                {{#(_.size(options.markerBackgrounds) > 1)}}
                  <div class="color-picker" title="Set marker background color">
                    {{#options.markerBackgrounds:bi}}
                      <div class="color-picker-item {{#(options.markers[mi] && options.markers[mi].background === this)}}active{{/()}} {{#(this.indexOf('255, 255, 255') !== -1 || this.indexOf('FFFFFF') !== -1)}}is-white{{/()}}"
                        style="background-color: {{ this }}"
                        on-tap="setObject:{{ options.markers[mi] }},'background',{{ this }}">
                    {{/}}
                  </div>
                {{/}}

                {{#(_.size(options.markerForegrounds) > 1)}}
                  <div class="color-picker" title="Set marker foreground color">
                    {{#options.markerForegrounds:bi}}
                      <div class="color-picker-item {{#(options.markers[mi] && options.markers[mi].foreground === this)}}active{{/()}} {{#(this.indexOf('255, 255, 255') !== -1 || this.indexOf('FFFFFF') !== -1)}}is-white{{/()}}"
                        style="background-color: {{ this }}"
                        on-tap="setObject:{{ options.markers[mi] }},'foreground',{{ this }}">
                    {{/}}
                  </div>
                {{/}}

                <button class="destructive small" on-tap="remove-marker:{{ mi }}" title="Remove marker"><i class="fa fa-close"></i></button>
              </div>
            </div>
          {{/}}
        </div>

        {{#(_.size(options.tilesets) > 1)}}
          <div class="config-option">
            <label>Background map set</label>

            <div class="image-picker images-{{ _.size(options.tilesets) }}">
              {{#options.tilesets:i}}
                <div class="image-picker-item {{ (options.tileset === i) ? 'active' : '' }}" style="background-image: url({{= preview }});" title="{{ i }}" on-tap="set:'options.tileset',{{ i }}"></div>
              {{/options.tilesets}}
            </div>
          </div>
        {{/()}}

        {{#(_.size(options.widths) > 1)}}
          <div class="config-option config-select">
            <label>Map width</label>

            <select value="{{ options.width }}">
              {{#options.widths:i}}
                <option value="{{ i }}">{{ i }}</option>
              {{/options.widths}}
            </select>
          </div>
        {{/()}}

        {{#(_.size(options.ratios) > 1)}}
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


        <div class="config-option">
          <input type="checkbox" checked="{{ options.embedAttribution }}" id="config-embed-attribution" lazy>
          <label for="config-embed-attribution">Embed attribution</label>

          <input type="text" placeholder="Override attribution" value="{{ options.overrideAttribution }}" lazy>
        </div>

        <div class="config-action">
          <button class="large additive generate-image" on-tap="generate">Generate <i class="fa fa-download"></i></button>
        </div>

        <div class="preview">
          <h1>Preview</h1>
          <img src="" /><br>
          <a href="" class="download-link">Download</a>
        </div>
      </div>

      <footer>
        {{{ options.footer }}}
      </footer>
    </div>
  </section>
</div>
