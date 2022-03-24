const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const filepath = path.resolve('facturasZip');

const unZip = async (zipPath) => {
	try {
		await decompress(zipPath, 'dist', (file) => {
			console.log('Awesome', file);
		});
	} catch (e) {
		console.error(e);
	}
};

function readingFiles() {
	fs.readdir(filepath, (err, files) => {
		files.forEach((directory) => {
			fs.readdir(path.resolve(filepath, directory), (err, zipFiles) => {
				zipFiles.forEach((zipFile) => {
					if (zipFile.lastIndexOf('.zip') > 0) {
						unZip(path.resolve(filepath, directory, zipFile));
					}
				});
			});
		});
	});
}

// unZip();

readingFiles();
