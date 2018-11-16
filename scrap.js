var request = require('request')
var cheerio = require('cheerio')
var csv = require('ya-csv')

var writer = csv.createCsvFileWriter('out.csv', { flags: '' })

const url =
  'https://fr.wikipedia.org/wiki/Liste_d%27abbayes_cisterciennes_de_France'

request(url, function (err, resp, html) {
  if (!err) {
    const $ = cheerio.load(html)

    const columnNames = [
      'N°note',
      'Nom',
      'link',
      'Coordonnées - x',
      'Coordonnées - y',
      'Commune',
      'Département',
      'Diocèse',
      'Famille',
      'Date début',
      'Date fin'
    ]

    writer.writeRecord(columnNames)
    $('table.wikitable.sortable tbody').find('tr').map((ri, row) => {
      // if (ri < 10) {
      // row

      const rowValues = []
      $(row).find('td').map((ci, column) => {
        // name and link
        if (ci === 1) {
          // name
          rowValues.push($(column).text())

          // link
          rowValues.push(
            'https://fr.wikipedia.org' + $(column).find('a').attr('href')
          )
        } else if (ci === 2) {
          // lat lng
          rowValues.push($(column).find('a').data('lat'))
          rowValues.push($(column).find('a').data('lon'))
        } else if (ci === 7 || ci === 8) {
          rowValues.push(
            $(column)
              .html()
              .split('<br>')
              .map(t => {
                return t
                  .replace('<b>', '')
                  .replace('</b>', '')
                  .replace('-', '?')
              })
              .join('-')
          )
        } else {
          rowValues.push($(column).text())
        }
      })
      writer.writeRecord(rowValues)
      // }
    })
  }
  writer.writeStream.end()
})
