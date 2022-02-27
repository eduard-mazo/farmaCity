const conection = require('./database/conection.js');
const Item = require('./models/item.js');
const fs = require('fs');

async function begin() {
  console.log('Starting DB...');
  try {
    fs.readFile('lunaItemsDB.json', async (err, data) => {
      await conection.main();
      if (err) throw err;
      let items = JSON.parse(data);
      let item;
      for (i in items) {
        item = new Item({
          cod: i,
          desc: items[i]['PRODUCTO'],
          tax: items[i]['% IVA '],
        });
        await item.save();
      }
    });
  } catch (e) {
    console.error(e);
  }
}

begin();
