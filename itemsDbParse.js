const fs = require('fs');
const Item = require('./models/item.js');

const regex = /,/gm;
let items;
let labs = {};
try {
  fs.readFile('lunaItemsDB.json', (err, data) => {
    if (err) throw err;
    items = JSON.parse(data);
    for (i in items) {
      parseUnidad(items[i]);
      parseIVA(items[i]);
      items[i] = new Item({
        cod: randomId(),
        desc: items[i]['PRODUCTO'],
        tax: items[i]['IVA'],
        amount: items[i]['UNIDAD'],
      });
      parseByLab(items[i]);
    }
    fs.writeFileSync('json/byLabs.json', JSON.stringify(labs));
    fs.writeFileSync('json/byItem.json', JSON.stringify(items));
  });
} catch (error) {
  console.error(error);
}

function priceFormated(val) {
  return parseInt(val.replace(regex, ''));
}

function parseByLab(item) {
  const desc = item['desc'];
  let name = desc.slice(desc.indexOf('(') + 1, desc.lastIndexOf(')'));

  if ((desc.indexOf('(') && desc.lastIndexOf(')')) === -1) name = 'GENERICO';

  if (!labs[name]) {
    labs[name] = {
      name,
      items: [item['_id']],
    };
  } else {
    labs[name].items.push(item['_id']);
  }
}

function parseUnidad(item) {
  item['UNIDAD'] = isNaN(priceFormated(item['UNIDAD']))
    ? 0
    : priceFormated(item['UNIDAD']);
}

function parseIVA(item) {
  item['IVA'] = isNaN(priceFormated('IVA')) ? 0 : priceFormated('IVA');
}

function randomId() {
  var randomChars = '0123456789';
  var result = '';
  for (var i = 0; i < 7; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}
