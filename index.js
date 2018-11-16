var request = require('request')
var cheerio = require('cheerio')

const url =
  'https://fr.wikipedia.org/wiki/Liste_d%27abbayes_cisterciennes_de_France'

request(url, function (err, resp, html) {
  if (!err) {
    const $ = cheerio.load(html)
    console.log($('table.wikitable.sortable').html())
  }
})
