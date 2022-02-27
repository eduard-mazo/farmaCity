const fs = require('fs');

const regex = /,/gm;
let item, items;
try {
  fs.readFile('lunaItemsDB.json', (err, data) => {
    if (err) throw err;
    items = JSON.parse(data);
    for (i in items) {
      item = items[i];
      item['LAB'] = item['PRODUCTO'].slice(
        item['PRODUCTO'].indexOf('(') + 1,
        item['PRODUCTO'].lastIndexOf(')')
      );
      item['UNIDAD'] = isNaN(priceFormated('UNIDAD')) ? 0 : priceFormated('UNIDAD');
      item['IVA'] = isNaN(priceFormated('IVA')) ? 0 : priceFormated('IVA');
      if (i < 100) console.log(item);
    }
  });
} catch (error) {
  console.error(error);
}

function priceFormated(arg) {
    return parseInt(item[arg].replace(regex, ''));
}