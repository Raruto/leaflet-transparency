# leaflet-transparency.js

[![NPM version](https://img.shields.io/npm/v/leaflet-transparency.svg?color=red)](https://www.npmjs.com/package/leaflet-transparency)
[![License](https://img.shields.io/badge/license-GPL%203-blue.svg?style=flat)](LICENSE)

Leaflet plugin that allows to add an opacity control.

_For a working example see [demo](https://raruto.github.io/leaflet-transparency/examples/leaflet-transparency.html)_

<p align="center">
    <a href="https://raruto.github.io/leaflet-transparency/examples/leaflet-transparency.html"><img src="https://raruto.github.io/img/leaflet-transparency.png" alt="Leaflet opacity sliders" /></a>
</p>

---

> _Initally based on the [google-transparency](https://github.com/Raruto/google-transparency) plugin_

---

## How to use

1. **include CSS & JavaScript**
    ```html
    <head>
    ...
    <style>html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }</style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-transparency@0.0.6/leaflet-transparency.js"></script>
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
3. **create your first simple “leaflet-transparency” slippy map**
    ```html
    <script>
    {

    const opts = {
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
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          options: {
            attribution: '&copy; <a href="http://www.esri.com/">Esri</a>',
            maxZoom: 18,
          },
        },
        opacityBaseControl: {
          options: {
            sliderImageUrl: "images/opacity-slider2.png",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            opacity: 100,
            position: 'topright',
          }
        },
        opacityOverlayControl: {
          options: {
            sliderImageUrl: "images/opacity-slider2.png",
            backgroundColor: "rgba(229, 227, 223, 0.9)",
            opacity: 75,
            position: 'topright',
          }
        },
      };

      const map = new L.Map('map', opts.map);

      const layer = new L.TileLayer(opts.otmLayer.url, opts.otmLayer.options);
      const overlay = new L.TileLayer(opts.satelliteLayer.url, opts.satelliteLayer.options);

      const controlBaseOpacity = new L.Control.OpacitySlider(null, opts.opacityBaseControl.options);
      const controlOverlayOpacity = new L.Control.OpacitySlider(overlay, opts.opacityOverlayControl.options);

      controlBaseOpacity.addTo(map);
      controlOverlayOpacity.addTo(map);      

      layer.addTo(map);      

    }
    </script>
    ```
---

**Compatible with:**
[![Leaflet 1.9.4](https://img.shields.io/badge/Leaflet-1.9.4-1EB300.svg?style=flat)](https://leafletjs.com/reference.html)
[![Leaflet 2.0.0-beta.3](https://img.shields.io/badge/Leaflet-2.0.0--beta.3-1EB300.svg?style=flat)](https://leafletjs.com/reference.html)

---

**Contributors:** [Raruto](https://github.com/Raruto/leaflet-transparency)