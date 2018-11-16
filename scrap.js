var request = require('request')
var cheerio = require('cheerio')

const url =
  'https://fr.wikipedia.org/wiki/Liste_d%27abbayes_cisterciennes_de_France'

request(url, function (err, resp, html) {
  if (!err) {
    const $ = cheerio.load(html)
    $('table.wikitable.sortable tbody').find('tr').map((ri, row) => {
      if (ri === 1) {
        // row
        console.log($(row).html())
        $(row).find('td').map((ci, column) => {
          console.log($(column).html())
        })
      }
    })
  }
})
