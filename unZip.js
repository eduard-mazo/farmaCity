const decompress = require('decompress');

const unZip = async () => {
	try {
		await decompress('my-file.zip', 'dist', (file) => {
			console.log('Awesome', file);
		});
	} catch (e) {
		console.error(e);
	}
};

unZip();
