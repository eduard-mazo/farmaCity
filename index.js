const fs = require('fs');
const xml2json = require('xml2json');
const filepath = __dirname + '\\facturas\\';

// const inventory = [];
const inventory = {};

async function parseXml(filename) {
	let json;
	let invoice;
	let items;
	let provider;

	try {
		const data = fs.readFileSync(filepath + filename);
		json = JSON.parse(xml2json.toJson(data));
		provider = json.AttachedDocument['cac:SenderParty']['cac:PartyTaxScheme']['cbc:RegistrationName'];
		console.log(`Parsing: ${filename} Emisor ${provider}`);
		invoice = JSON.parse(
			xml2json.toJson(json.AttachedDocument['cac:Attachment']['cac:ExternalReference']['cbc:Description'])
		);
		if (invoice.Invoice) {
			items = invoice.Invoice['cac:InvoiceLine'];
			if (items.length) {
				items.forEach((item) => {
					// fs.writeFileSync(`json/${Date.now()}.json`, JSON.stringify(item));
					decodeItem(item, provider);
				});
			}
		}
	} catch (e) {
		console.log(e);
	}
}

function readingFiles() {
	fs.readdir(filepath, (err, files) => {
		for (const file of files) {
			if (file.indexOf('.xml') > 0) {
				parseXml(file);
			}
		}
		fs.writeFileSync(`json/${Date.now()}.json`, JSON.stringify(inventory));
	});
}

function decodeItem(item, provider) {
	if (
		item['cac:TaxTotal'] &&
		item['cac:TaxTotal']['cac:TaxSubtotal'] &&
		item['cac:TaxTotal']['cac:TaxSubtotal']['cac:TaxCategory']
	) {
		/*inventory.push({
			IVA: item['cac:TaxTotal']['cac:TaxSubtotal']['cac:TaxCategory']['cbc:Percent'],
			name: item['cac:Item']['cbc:Description'],
		});*/
		if (!inventory[item['cac:Item']['cbc:Description']]) {
			inventory[item['cac:Item']['cbc:Description']] = {
				IVA: item['cac:TaxTotal']['cac:TaxSubtotal']['cac:TaxCategory']['cbc:Percent'],
				name: item['cac:Item']['cbc:Description'],
				DEPOSITO: provider,
				P_COMPRA: item['cac:Price']['cbc:PriceAmount']['$t'],
			};
		}
	}
}

readingFiles();
