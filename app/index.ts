import * as monasteriesJSON from './data/monasteries.json';
import * as ordersJSON from './data/orders.json';

import './main.scss';
import './../node_modules/leaflet/dist/leaflet.css';

import L from 'leaflet';

var monasteries = Object.values(monasteriesJSON);
var orders = Object.values(ordersJSON);

console.log(monasteries);

if (document.body) {
  document.body.innerHTML = '';
}

var data = [];
var map = false;
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
};

var prepareData = (): Array<Object> => {
  monasteries.forEach(monastery => (monastery.orders = []));
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
