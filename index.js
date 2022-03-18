const fs = require('fs');
const xml2json = require('xml2json');
const filepath = __dirname + '\\facturas\\';

const inventory = [];

async function parseXml(filename) {
	var json;
	var invoice;
	var items;
	fs.readFile(filepath + filename, (err, data) => {
		json = JSON.parse(xml2json.toJson(data));
		console.log(
			`Parsing: ${filename} Emisor ${json.AttachedDocument['cac:SenderParty']['cac:PartyTaxScheme']['cbc:RegistrationName']}`
		);
		invoice = JSON.parse(
			xml2json.toJson(json.AttachedDocument['cac:Attachment']['cac:ExternalReference']['cbc:Description'])
		);
		fs.writeFileSync(`json/${Date.now()}.json`, JSON.stringify(invoice.Invoice["cac:InvoiceLine"]));
		try {
			items = invoice.Invoice['cac:InvoiceLine'];
			items.forEach((item) => {
				// fs.writeFileSync(`json/${Date.now()}.json`, JSON.stringify(item));
				decodeItem(item);
			});
		} catch (error) {
			console.error(error);
			console.log(
				`Archivo: ${filename} Emisor: ${json.AttachedDocument['cac:SenderParty']['cac:PartyTaxScheme']['cbc:RegistrationName']}`
			);
		}
	});
}

function readingFiles() {
	fs.readdir(filepath, (err, files) => {
		files.forEach((file) => {
			if (file.indexOf('.xml') > 0) {
				parseXml(file);
			}
		});
	});
}

function decodeItem(item) {
	console.log('DESCRIPCIÓN --> ' + item['cac:Item']['cbc:Description']);
	console.log('PRECIO --> ' + item['cac:Price']['cbc:PriceAmount'].$t);
}

readingFiles();
