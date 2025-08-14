import L from "leaflet";
import leafletCSS from 'leaflet/dist/leaflet.css?inline';
import { Component, registerComponent } from "webact";

class Fort118Karta extends Component {
  #map: L.Map | null = null;

  constructor() {
    super(import.meta.url);
  }

  get leafletMap() {
    return this.#map;
  }

  componentDidMount() {
    this.#map = L.map(this.$("#map"), {
      crs: L.CRS.Simple,
    });
  }

  render() {
    return `
      <style>
      :host,
      #map {
        display: block;
        width: 100%;
        height: 100%;
      }

      ${leafletCSS}
      </style>
      <div id="map" data-tap-disabled="true"></div>
    `;
  }
}

export default registerComponent(Fort118Karta, {
  name: "fort118-karta",
});
