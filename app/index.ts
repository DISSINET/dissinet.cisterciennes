import * as monasteriesJSON from './data/monasteries.json';
import * as ordersJSON from './data/orders.json';

import './main.scss';
import './../node_modules/leaflet/dist/leaflet.css';
import './../node_modules/leaflet.markercluster/dist/MarkerCluster.css';
import './../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css';

import chroma from 'chroma-js';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster.placementstrategies';

var monasteries = Object.values(monasteriesJSON);
var orders = Object.values(ordersJSON);

console.log(monasteries);

if (document.body) {
  document.body.innerHTML = '';
}

var data = [];
var map = false;

var colors = {
  male: '#2c7bb6',
  female: '#d7191c',
  mixed: '#ffffbf'
};
var colorScale = chroma.scale([colors.male, colors.mixed, colors.female]);

var init = () => {
  // crate map div
  const mapEl = document.createElement('div');
  mapEl.setAttribute('id', 'map');
  document.body.appendChild(mapEl);

  data = prepareData();
  console.log(data);

  // initialise map
  map = L.map('map', {
    center: [47, 2],
    zoom: 7
  });

  // add a awmc tilelayer
  L.tileLayer(
    'http://a.tiles.mapbox.com/v3/isawnyu.map-knmctlkh/{z}/{x}/{y}.png',
    {
      attribution: "<a href='http://awmc.unc.edu/wordpress/'>awmc</a>",
      className: 'map-base-layer-awmc'
    }
  ).addTo(map);

  const genderScore = {
    male: 0,
    mixed: 0.5,
    female: 1
  };
  const clusters = L.markerClusterGroup({
    iconCreateFunction: cluster => {
      const markers = cluster.getAllChildMarkers();
      const single = markers.length === 1;

      let averageGender = 0;
      markers.forEach(marker => {
        averageGender += genderScore[marker.options.gender];
      });

      const color = colorScale(averageGender / markers.length);

      return L.divIcon({
        html:
          '<div class="marker-icon-wrapper" style="background-color: ' +
          color +
          '"><span>' +
          markers.length +
          '</span></div>',
        className:
          'marker-icon ' + (single ? 'marker-single' : 'marker-cluster'),
        iconSize: L.point(40, 40)
      });
    }
  });

  data
    .filter(monastery => monastery.valid)
    .forEach(monastery => {
      const marker = L.circleMarker(monastery.ll, {
        radius: 7,
        fillColor: colors[monastery.gender],
        fillOpacity: 1,
        stroke: true,
        color: 'black',
        weight: 1.5,
        gender: monastery.gender
      });
      clusters.addLayer(marker);
    });

  clusters.addTo(map);
};

var prepareData = (): Array<Object> => {
  monasteries
    .filter(m => m)
    .forEach(monastery => {
      monastery.orders = [];
      monastery.valid = !isNaN(parseFloat(monastery.x));
      if (monastery.valid) {
        monastery.ll = [parseFloat(monastery.y), parseFloat(monastery.x)];
      }
    });
  orders.forEach(order => {
    const orderMonasteryId = order.monastery_id;

    const monastery = monasteries.find(
      monastery => monastery.id === orderMonasteryId
    );

    if (monastery) {
      monastery.orders.push(order);
    }
  });

  return monasteries;
};

init();
