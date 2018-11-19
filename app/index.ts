import * as monasteriesJSON from './data/monasteries.json';
import * as ordersJSON from './data/orders.json';

import leaflet from 'leaflet';

var monasteries = Object.values(monasteriesJSON);
var orders = Object.values(ordersJSON);

console.log(monasteries);

var init = () => {
  const mapEl = document.getElementById('map');
};

init();
