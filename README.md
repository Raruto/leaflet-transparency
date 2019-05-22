# leaflet-transparency.js
Leaflet plugin that allows to add an opacity control.

_For a working example see [demo](https://raruto.github.io/examples/leaflet-transparency/leaflet-transparency.html)_

---

> _Initally based on the [google-transparency](https://github.com/Raruto/google-transparency) plugin_

---

## How to use

1. **include CSS & JavaScript**
    ```html
    <head>
    ...
    <style>html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }</style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.2/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.3.2/dist/leaflet.js"></script>
    <script src="https://raruto.github.io/cdn/leaflet-transparency/0.0.1/leaflet-transparency.js"></script>
    ...
    </head>
    ```
2. **choose the div container used for the slippy map**
    ```html
    <body>
    ...
    <div id="map"></div>
    ...
    </body>
    ```
3. **create your first simple “google-transparency” slippy map**
    ```html
    <script>

    var opts = {
        map: {
          center: [41.4583, 12.7059],
          zoom: 5,
        },
        otmLayer: {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          options: {
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            maxZoom: 17,
          },
        },
        satelliteLayer: {
          url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          options: {
            attribution: '&copy; <a href="http://www.esri.com/">Esri</a>',
            maxZoom: 18,
          },
        },
        opacityControl: {
          options: {
            sliderImageUrl: "https://raruto.github.io/cdn/leaflet-transparency/0.0.1/images/opacity-slider2.png",
            backgroundColor: "rgba(229, 227, 223, 0.9)",
            opacity: 0.75,
            position: 'topright',
          }
        },
      };

      var map = new L.Map('map', opts.map);

      var layer = new L.TileLayer(opts.otmLayer.url, opts.otmLayer.options);
      var overlay = new L.TileLayer(opts.satelliteLayer.url, opts.satelliteLayer.options);

      var controlOpacity = new L.Control.OpacitySlider(overlay, opts.opacityControl.options);

      controlOpacity.on('hidden', function(e) { overlay.remove(); });
      controlOpacity.on('visible', function(e) { overlay.addTo(map); });

      layer.addTo(map);
      controlOpacity.addTo(map);

    </script>
    ```
---

**Compatibile with:** leaflet@1.3.2

---

**Contributors:** [Raruto](https://github.com/Raruto/leaflet-transparency)
