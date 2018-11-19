### Cistercian monasteries in France

Interactive map of Cistercian monasteries in France, date are taken from [https://fr.wikipedia.org/wiki/Liste_d%27abbayes_cisterciennes_de_France](fr.wikipedia.org).

_scrap.js_

- scrapping data from the wikipedia table with (cheeriojs)[https://github.com/cheeriojs] and generates (csv)[https://github.com/koles/ya-csv] and (json)[https://www.npmjs.com/package/csvtojson] files

./app

- typescript code that takes scrapped json files and generates (leaflet)[https://leafletjs.com/] map visualisation
