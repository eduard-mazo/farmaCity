const fs = require('fs');
const Item = require('./models/item.js');

const regex = /,|\./gm;
let items;
let labs = {};
try {
  fs.readFile('json/lunaItemsDB.json', (err, data) => {
    if (err) throw err;
    items = JSON.parse(data);
    for (i in items) {
      parsePrice(items[i], 'UNIDAD');
      parsePrice(items[i], 'IVA');
      parsePrice(items[i], 'SOBRE');
      parsePrice(items[i], 'CAJA');
      items[i] = new Item({
        cod: randomId(),
        desc: items[i]['PRODUCTO'],
        tax: items[i]['IVA'],
        amount: [
          {
            unidad: items[i]['UNIDAD'],
            sobre: items[i]['SOBRE'],
            caja: items[i]['CAJA'],
          },
        ],
        date: Math.floor(Date.now()),
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
  let name;

  if ((desc.indexOf('(') && desc.lastIndexOf(')')) === -1) {
    name = 'GENERICO';
  } else {
    name = desc.slice(desc.indexOf('(') + 1, desc.lastIndexOf(')'));
  }

  if (!labs[name]) {
    labs[name] = {
      name,
      items: [item['_id']],
    };
  } else {
    labs[name].items.push(item['_id']);
  }
}

function parsePrice(item, size) {
  if (size === 'CAJA' || size === 'SOBRE') {
    let price, qty;
    if ((item[size].indexOf('(') && item[size].lastIndexOf(')')) === -1) {
      item[size] = [0, 0];
    } else {
      qty = parseInt(
        item[size].slice(
          item[size].indexOf('X') + 1,
          item[size].lastIndexOf(')')
        )
      );
      price = priceFormated(item[size].slice(0, item[size].lastIndexOf('X')));
      item[size] = [size === 'SOBRE' ? price / qty : price, qty];
    }
  } else {
    const valFormatted = priceFormated(item[size]);
    item[size] = !isNaN(valFormatted) ? valFormatted : 0;
  }
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
