var request = require("request");
var cheerio = require("cheerio");
var csv = require("ya-csv");
var csvtojson = require("csvtojson");
var fs = require("fs");

var outputPath = "app/data/";
var monasteriesPath = outputPath + "monasteries";
var ordersPath = outputPath + "orders";

var monasteriesW = csv.createCsvFileWriter(monasteriesPath + ".csv", {
  flags: ""
});
var ordersW = csv.createCsvFileWriter(ordersPath + ".csv", { flags: "" });

const url =
  "https://fr.wikipedia.org/wiki/Liste_d%27abbayes_cisterciennes_de_France";

request(url, function(err, resp, html) {
  if (!err) {
    const $ = cheerio.load(html);

    const monasteriesCols = [
      "id",
      "name",
      "link",
      "x",
      "y",
      "gender",
      "commune",
      "département",
      "diocèse"
    ];
    const ordersCols = ["monastery_id", "name", "from", "to"];

    monasteriesW.writeRecord(monasteriesCols);
    ordersW.writeRecord(ordersCols);

    $("table.wikitable.sortable tbody")
      .find("tr")
      .map((ri, row) => {
        // if (ri < 10) {
        // row
        let gender = "mixed";
        const color = $(row).css("background");
        if (color) {
          if (color.substr(1, 2) === "FF") {
            gender = "nuns";
          } else if (color.substr(5, 2) === "FF") {
            gender = "monks";
          }
        }

        const monasteryRow = [ri];
        const columns = $(row).find("td");
        columns.map((ci, column) => {
          // name and link
          if (ci === 1) {
            // name
            monasteryRow.push(
              $(column)
                .find("a")
                .text()
            );

            // link
            monasteryRow.push(
              "https://fr.wikipedia.org" +
                $(column)
                  .find("a")
                  .attr("href")
            );
          } else if (ci === 2) {
            // lat lng
            parseFloat(
              monasteryRow.push(
                $(column)
                  .find("a")
                  .data("lon")
              ),
              10
            );
            parseFloat(
              monasteryRow.push(
                $(column)
                  .find("a")
                  .data("lat")
              ),
              10
            );

            // regions
          } else if (ci === 3 || ci === 4 || ci === 5) {
            monasteryRow.push(
              $(column)
                .find("a")
                .text()
            );
          }
        });

        const ordersHtml = $(columns[6]).html();
        const yearsFromHtml = $(columns[7]).html();
        const yearsToHtml = $(columns[8]).html();
        if (ordersHtml && yearsFromHtml && yearsToHtml) {
          const orders = splitColumn(ordersHtml, $);
          const yearsFrom = splitColumn(yearsFromHtml, $);
          const yearsTo = splitColumn(yearsToHtml, $);

          // cleaning invalid inputs
          if (orders.length < yearsFrom.length) {
            orders.push(orders[orders.length - 1]);
          }
          if (orders.length > yearsFrom.length) {
            yearsFrom.push(yearsFrom[yearsFrom.length - 1]);
            yearsTo.push(yearsTo[yearsTo.length - 1]);
          }

          orders.map((order, oi) => {
            ordersW.writeRecord([ri, orders[oi], yearsFrom[oi], yearsTo[oi]]);
          });
        }

        if (monasteryRow.length > 5) {
          monasteryRow.splice(5, 0, gender);
          monasteriesW.writeRecord(monasteryRow);
        }
        // }
      });
  }

  monasteriesW.writeStream.end();
  ordersW.writeStream.end();

  csvtojson()
    .fromFile(ordersPath + ".csv")
    .then(jsonRes => {
      fs.writeFileSync(ordersPath + ".json", JSON.stringify(jsonRes));
    });

  csvtojson()
    .fromFile(monasteriesPath + ".csv")
    .then(jsonRes => {
      fs.writeFileSync(monasteriesPath + ".json", JSON.stringify(jsonRes));
    });
});

var splitColumn = (html, $) => {
  const htmlArray = html.split("<br>");
  return htmlArray.map(line => {
    const wrapped = "<span>" + line + "</span>";
    return $(wrapped).text();
  });
};
