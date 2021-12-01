const fs = require('fs');
const xml2json = require('xml2json');
const filepath = __dirname + '\\facturas\\';

async function test(filename) {
    console.log(filename);
}

function readingFiles() {
    fs.readdir(filepath, (err, files) => {
        files.forEach(file => {
            if (file.indexOf('.xml') > 0) {
                test(file);
            }
        })
    })
}

readingFiles();