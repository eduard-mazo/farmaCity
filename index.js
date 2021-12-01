const fs = require('fs');
const xml2json = require('xml2json');
const filepath = __dirname + '\\facturas\\';

async function parseXml(filename) {
    console.log('Parsing ' + filename);
    var json;
    var invoice;
    var items;
    fs.readFile(filepath + filename, (err, data) => {
        json = JSON.parse(xml2json.toJson(data));
        invoice = JSON.parse(xml2json.toJson(json.AttachedDocument["cac:Attachment"]["cac:ExternalReference"]["cbc:Description"]))
        items = invoice.Invoice["cac:InvoiceLine"]
        items.forEach(item => {
            decodeItem(item)
        })
    })
}

function readingFiles() {
    fs.readdir(filepath, (err, files) => {
        files.forEach(file => {
            if (file.indexOf('.xml') > 0) {
                parseXml(file);
            }
        })
    })
}

function decodeItem(item) {
    console.log('DESCRIPCIÓN --> ' + item["cac:Item"]["cbc:Description"]);
    console.log('PRECIO --> ' + item["cac:Price"]["cbc:PriceAmount"].$t);
}

readingFiles();