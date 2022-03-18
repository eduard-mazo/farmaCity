const fs = require('fs');
let messagesList = [];
let i = 0;

function deleteDone() {
	fs.readFile('json/allEmails.json', (err, data) => {
		if (err) return console.log(err);
		messagesList = JSON.parse(data);
		i = 0;
		while (i < messagesList.length) {
			if (!messagesList[i].nit) {
				messagesList.splice(i, 1);
				i--;
			} else {
				delete messagesList[i].threadId;
			}
			i++;
		}
		fs.writeFileSync('json/allEmailsWithFE.json', JSON.stringify(messagesList));
	});
}

deleteDone();
