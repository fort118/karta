import L from "leaflet";
import "leaflet-imageoverlay-rotated";
import type { GeoJsonObject } from "geojson";
import leafletCSS from "leaflet/dist/leaflet.css?inline";
import { Component, registerComponent } from "webact";
import bombsheltersGeoJSON from "./bombshelters.json";
import defensesGeoJSON from "./defenses.json";
import kartaImageUrl from "./karta-sq.png?url";

class Fort118Karta extends Component {
	#map: L.Map | null = null;

	constructor() {
		super(import.meta.url);
	}

	get leafletMap() {
		return this.#map;
	}

	addImageOverlay() {
		if (this.#map) {
			// --- Inputs you can tweak ---
			const center = L.latLng(59.473811, 12.280491);
			const pixelSize = { w: 1000, h: 1000 }; // intrinsic image size
			const scale = 1; // 25%
			const rotationDeg = -38; // degrees, negative = clockwise in Leaflet view

			// Ground size assumption (how big the original 1000px image should cover on the ground).
			// If you know this, set it here. Example: 1000 m × 1000 m.
			const groundSizeMeters = { w: 170, h: 170 }; // adjust to your desired scale on the map

			// --- Helpers for meters <-> degrees near given latitude ---
			function metersToLatDegrees(m: number) {
				return m / 111320;
			}
			function metersToLngDegrees(m: number, lat: number) {
				return m / (111320 * Math.cos((lat * Math.PI) / 180));
			}

			// Effective placed size (after scale), before rotation:
			const placedWm = groundSizeMeters.w * scale;
			const placedHm = groundSizeMeters.h * scale;

			// Compute bounding box size needed to fully contain a rotated rectangle
			const theta = (Math.abs(rotationDeg) * Math.PI) / 180;
			const bboxWm =
				Math.abs(placedWm * Math.cos(theta)) +
				Math.abs(placedHm * Math.sin(theta));
			const bboxHm =
				Math.abs(placedWm * Math.sin(theta)) +
				Math.abs(placedHm * Math.cos(theta));

			// Convert to degree deltas for Leaflet bounds
			const latDelta = metersToLatDegrees(bboxHm / 2);
			const lngDelta = metersToLngDegrees(bboxWm / 2, center.lat);

			// Build bounds centered at your coordinate
			const bounds = L.latLngBounds(
				[center.lat - latDelta, center.lng - lngDelta], // SW
				[center.lat + latDelta, center.lng + lngDelta], // NE
			);

			// Create the inline SVG element
			const svgNS = "http://www.w3.org/2000/svg";
			const svg = document.createElementNS(svgNS, "svg");

			// Match the SVG's internal coord system to the image pixels
			svg.setAttribute("viewBox", `0 0 ${pixelSize.w} ${pixelSize.h}`);
			svg.setAttribute("width", String(pixelSize.w));
			svg.setAttribute("height", String(pixelSize.h));
			// Avoid clipping if anything ends up a hair outside; not all browsers honor overflow on root,
			// but bounds were padded above so this is just a safety net.
			svg.setAttribute("overflow", "visible");
			svg.setAttribute("style", "opacity:1");

			// Create the <image> node
			const img = document.createElementNS(svgNS, "image");
			img.setAttributeNS("http://www.w3.org/1999/xlink", "href", kartaImageUrl); // your image URL
			img.setAttribute("x", "0");
			img.setAttribute("y", "0");
			img.setAttribute("width", String(pixelSize.w));
			img.setAttribute("height", String(pixelSize.h));

			// Transform: rotate & scale around the center (500,500)
			const cx = pixelSize.w / 2;
			const cy = pixelSize.h / 2;
			// Note: transform list applies right-to-left
			img.setAttribute(
				"transform",
				`translate(${cx},${cy}) rotate(${rotationDeg}) scale(${scale}) translate(${-cx},${-cy})`,
			);

			svg.appendChild(img);

			L.svgOverlay(svg, bounds).addTo(this.#map);
		}
	}

	componentDidMount() {
		this.#map = L.map(this.$("#map"), {
			center: [59.473621, 12.280591],
			zoom: 16,
		});

		const OpenTopoMap = L.tileLayer(
			"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
			{
				maxZoom: 17,
				attribution:
					'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
			},
		);

		OpenTopoMap.addTo(this.#map);

		// this.addImageOverlay();

		// Add click event listener to log coordinates
		this.#map.on("click", (e: L.LeafletMouseEvent) => {
			const lat = e.latlng.lat;
			const lng = e.latlng.lng;
			console.log(`Clicked coordinates: [${lng}, ${lat}]`);
		});

		const geoJSONOptions = {
			pointToLayer: (
				geoJsonPoint: GeoJSON.Feature<GeoJSON.Point>,
				latlng: L.LatLng,
			) => {
				return L.circleMarker(latlng, {
					radius: 0,
					fillColor: geoJsonPoint.properties?.["marker-color"],
					color: geoJsonPoint.properties?.["marker-color"],
					weight: 10,
				});
			},
		};

		L.geoJSON(bombsheltersGeoJSON as GeoJsonObject, geoJSONOptions)
			.bindPopup((layer) => {
				if ("feature" in layer && layer.feature) {
					const feature = layer.feature as GeoJSON.Feature<GeoJSON.Point>;

					return feature.properties?.name ?? "";
				}

				return "";
			})
			.addTo(this.#map);

		L.geoJSON(defensesGeoJSON as GeoJsonObject, geoJSONOptions)
			.bindPopup((layer) => {
				if ("feature" in layer && layer.feature) {
					const feature = layer.feature as GeoJSON.Feature<GeoJSON.Point>;

					return `<strong>${feature.properties?.name ?? ""}</strong><p>${
						feature.properties?.description ?? ""
					}</p>`;
				}

				return "";
			})
			.addTo(this.#map);
	}

	render() {
		return `
      <style>
      ${leafletCSS}
      :host,
      #map {
        display: block;
        width: 100%;
        height: 100%;
        user-select: none;
      }
      </style>
      <div id="map"></div>
    `;
	}
}

export default registerComponent(Fort118Karta, {
	name: "fort118-karta",
});
