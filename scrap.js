var request = require('request')
var cheerio = require('cheerio')
var csv = require('ya-csv')

var monasteriesW = csv.createCsvFileWriter('monasteries.csv', { flags: '' })
var ordersW = csv.createCsvFileWriter('orders.csv', { flags: '' })

const url =
  'https://fr.wikipedia.org/wiki/Liste_d%27abbayes_cisterciennes_de_France'

request(url, function (err, resp, html) {
  if (!err) {
    const $ = cheerio.load(html)

    const columnNames = [
      'name',
      'link',
      'x',
      'y',
      'commune',
      'département',
      'diocèse'
    ]

    monasteriesW.writeRecord(columnNames)
    $('table.wikitable.sortable tbody').find('tr').map((ri, row) => {
      // if (ri < 10) {
      // row

      const monasteryRow = []
      const columns = $(row).find('td')
      columns.map((ci, column) => {
        // name and link
        if (ci === 1) {
          // name
          monasteryRow.push($(column).text())

          // link
          monasteryRow.push(
            'https://fr.wikipedia.org' + $(column).find('a').attr('href')
          )
        } else if (ci === 2) {
          // lat lng
          parseFloat(monasteryRow.push($(column).find('a').data('lat')), 10)
          parseFloat(monasteryRow.push($(column).find('a').data('lon')), 10)

          /*
        else if (ci === 7 || ci === 8) {
          monasteryRow.push(
            $(column)
              .html()
              .split('<br>')
              .map(t => {
                return ts
                  .replace('<b>', '')
                  .replace('</b>', '')
                  .replace('-', '?')
              })
              .join('-')
          )
          */
          // regions
        } else if (ci === 3 || ci === 4 || ci === 5) {
          monasteryRow.push($(column).find('a').text())
        }
      })

      const ordersHtml = $(columns[6]).html()
      const yearsFromHtml = $(columns[7]).html()
      const yearsToHtml = $(columns[8]).html()
      if (ordersHtml && yearsFromHtml && yearsToHtml) {
        const orders = splitColumn(ordersHtml, $)
        const yearsFrom = splitColumn(yearsFromHtml, $)
        const yearsTo = splitColumn(yearsToHtml, $)

        // cleaning invalid inputs
        if (orders.length < yearsFrom.length) {
          orders.push(orders[orders.length - 1])
        }
        if (orders.length > yearsFrom.length) {
          yearsFrom.push(yearsFrom[yearsFrom.length - 1])
          yearsTo.push(yearsTo[yearsTo.length - 1])
        }
      }

      monasteriesW.writeRecord(monasteryRow)
      // }
    })
  }

  monasteriesW.writeStream.end()
  ordersW.writeStream.end()
})

var splitColumn = (html, $) => {
  const htmlArray = html.split('<br>')
  return htmlArray.map(line => {
    const wrapped = '<span>' + line + '</span>'
    return $(wrapped).text()
  })
}
