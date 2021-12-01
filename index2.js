const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const filepath = __dirname + '\\formatos\\';
async function test(filename) {
    // read from a file
    const workbook = XLSX.readFile(filepath + filename);
    const rowValues = workbook.Sheets[workbook.SheetNames[0]];
    console.log(filename);
    console.log(rowValues['A60']);
    console.log(rowValues['B11'] ? rowValues['B11'].v : false);
    
    //XLSX.writeFile(workbook, 'out.xlsx');
    /*for (let i = 0; i < rowValues.length; i++) {
        const element = rowValues[i];
        console.log(element);
    }*/
    // ... use workbook
}

function readingFiles() {
    fs.readdir(filepath, (err, files) => {
        files.forEach(file => {
            if (file.indexOf('~$')) {
                test(file);
            }
        })
    })
}

readingFiles();