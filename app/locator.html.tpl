
<div class="locator">
  <header>Locator</header>

  <div class="locator-interface">
    <section class="locator-display">
      <div class="locator-map"></div>
    </section>

    <section class="locator-controls">
      <div class="config-option">
        <label>Tiles</label>

        <select value="{{ options.tiles }}">
          {{#options.tileOptions:i}}
            <option value="{{ i }}">{{ i }}</option>
          {{/options.tileOptions}}
        </select>
      </div>

      <button class="generate-image" on-click="generate">Generate</button>
    </section>
  </div>
</div>
