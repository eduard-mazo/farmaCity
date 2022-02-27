const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

let buffer = '[';
let i = 0;
fs.createReadStream(path.resolve(__dirname, 'BASE DE DATOS.csv'))
  .pipe(csv.parse({ headers: true }))
  .on('error', (error) => console.error(error))
  .on('data', (row) => {
    buffer += JSON.stringify(row) + ',';
  })
  .on('end', (rowCount) => {
    buffer = buffer.slice(0, buffer.lastIndexOf(','));
    buffer += ']';
    fs.writeFileSync('lunaItemsDB.json', buffer);
  });
