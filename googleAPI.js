const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	'http://localhost:3000/callback'
);

oauth2Client.on('tokens', (tokens) => {
	console.log(tokens);
	if (tokens.refresh_token) {
		console.log(`refresh_token ${tokens.refresh_token}`);
	}
	console.log(`access_token ${tokens.access_token}`);
});

const app = express();

var messagesCount = 0;
var messagesleft = 0;
var isAtt = false;
var messagesList = [];
var labsId = [];

app.get('/', (req, res) => {
	res.send(getAuth());
});

app.get('/att', (req, res) => {
	isAtt = true;
	checkCredentials();
	fs.readFile('json/allEmailsWithFE.json', (err, data) => {
		if (err) throw err;
		messagesList = JSON.parse(data);
		console.log(messagesList.length);
		// messagesCount = messagesleft = messagesList.length - 1;
		messagesCount = messagesleft = 270;
		getMessageAtt(oauth2Client, messagesList[messagesleft]);
		//delayGet();
		res.send({
			hi: 'EDUARD',
			msgs: messagesList.length,
		});
	});
});

app.get('/done', (req, res) => {
	isAtt = false;
	checkCredentials();
	listLabels(oauth2Client);
	if (false) {
		fs.readFile('json/allEmailsWithFE.json', (err, data) => {
			if (err) throw err;
			messagesList = JSON.parse(data);
			console.log(messagesList.length);
			messagesCount = messagesList.length;
			messagesleft = messagesList.length;
			delayGet();
			res.send({
				hi: 'EDUARD',
				total_messages: messagesList.length,
				messagesList,
			});
		});
	} else {
		res.send({
			hi: 'EDUARD Getting Msg',
		});
		listMessages(oauth2Client);
	}
	// res.send({ hi: 'EDUARD', credentials: messagesList });
});

app.get('/callback', async (req, res, next) => {
	console.log('Hi from callback');
	const { tokens } = await oauth2Client.getToken(req.query.code);
	fs.writeFileSync(`json/tokens${Date.now()}.json`, JSON.stringify(tokens));
	oauth2Client.credentials = tokens;
	res.redirect('/done');
});

app.listen(process.env.NODE_PORT, () => {
	console.log(`Example app listening on port ${process.env.NODE_PORT}`);
});

//http://localhost:3000/callback?code=4/0AX4XfWgv-JOt8YDKO3Um2x5UF8mX1rRUJbcIA02jiSqIiJ-g0bqjQ3ChW0WNS3GBJ3kevA&scope=https://www.googleapis.com/auth/gmail.modify

function getAuth() {
	// generate a url that asks permissions for Blogger and Google Calendar scopes
	const scopes = ['https://www.googleapis.com/auth/gmail.modify'];

	return oauth2Client.generateAuthUrl({
		// 'online' (default) or 'offline' (gets refresh_token)
		access_type: 'offline',

		// If you only need one scope you can pass it as a string
		scope: scopes,
	});
}

function listLabels(auth) {
	const gmail = google.gmail({ version: 'v1', auth });
	gmail.users.labels.list(
		{
			userId: 'me',
		},
		(err, res) => {
			if (err) handleErr(err, 'ListLabels');
			const labels = res.data.labels;
			if (!labels.length) {
				console.log('No labels found.');
			}
		}
	);
}
function listMessages(auth, page) {
	const gmail = google.gmail({ version: 'v1', auth });
	const options = {
		userId: 'me',
		//labelIds: 'Label_7296006133340362950',
	};
	if (page) {
		options.pageToken = page;
	}
	gmail.users.messages.list(options, (err, res) => {
		if (err) handleErr(err, 'listMessages');
		let i = 0;
		while (i < res.data.messages.length) {
			messagesList.push(res.data.messages[i]);
			i++;
		}
		if (res.data.nextPageToken) {
			listMessages(auth, res.data.nextPageToken);
		} else {
			console.log(messagesList.length);
			fs.writeFileSync('json/listOfMsgIds.json', JSON.stringify(messagesList));
			messagesCount = messagesleft = messagesList.length;
			delayGet();
		}
	});
}

function delayGet() {
	if (!messagesCount) {
		console.log('Done');
	} else {
		setTimeout(() => {
			messagesCount--;
			if (isAtt) {
				// getMessageAtt(oauth2Client, messagesList[messagesCount]);
			} else {
				getMessage(oauth2Client, messagesList[messagesCount].id, messagesCount);
			}
			delayGet();
		}, 110);
	}

	/*
  setTimeout(() => {
    getMessage(auth, id, index);
  }, 110);
  */
}

function getMessage(auth, id, index) {
	const gmail = google.gmail({ version: 'v1', auth });
	const options = {
		userId: 'me',
		id,
	};
	gmail.users.messages.get(options, (err, res) => {
		messagesleft--;
		if (err) handleErr(err, 'getMessage');
		console.log(`Total mensajes: ${messagesList.length - 1} contador: ${messagesleft}`);
		const headers = res.data.payload.headers;
		let i = 0;
		let j = 0;
		let nit = '';
		let doPush = true;
		while (i < headers.length) {
			if (headers[i].name == 'Subject' && headers[i].value.indexOf(';') == 9) {
				nit = headers[i].value.substr(0, headers[i].value.indexOf(';'));
				j = 0;
				doPush = true;
				while (j < labsId.length) {
					if (labsId[j] == nit) doPush = false;
					j++;
				}
				if (doPush) labsId.push(nit);
				messagesList[index].nit = nit;
				j = 1; // Starts from 1 because 0 is the email it self
				while (j < res.data.payload.parts.length) {
					if (!messagesList[index].attId) messagesList[index].attId = [];
					if (!messagesList[index].filename) messagesList[index].filename = [];
					messagesList[index].attId.push(res.data.payload.parts[j].body.attachmentId);
					messagesList[index].filename.push(res.data.payload.parts[j].filename);
					j++;
				}
			}
			i++;
		}
		if (!messagesleft) {
			i = 0;
			let totalDone = 0;
			while (i < messagesList.length) {
				if (messagesList[i].nit) totalDone++;
				i++;
			}
			fs.writeFileSync('json/allEmails.json', JSON.stringify(messagesList));
			fs.writeFileSync('json/alllabs.json', JSON.stringify(labsId));
			console.log('Total encontrados de -> ' + totalDone);
		}
	});
}

async function getMessageAtt(auth, msgData) {
	for (const attID of msgData.attId) {
		const gmailAtt = google.gmail({ version: 'v1', auth }).users.messages.attachments;
		const options = {
			userId: 'me',
			messageId: msgData.id,
			id: attID,
		};
		try {
			const res = await gmailAtt.get(options);
			const buff = Buffer.from(res.data.data, 'base64');
			const dir = `./facturasZip/${msgData.nit}`;
			if (!fs.existsSync(dir)) {
				await fs.mkdirSync(dir, { recursive: true });
			}
			fs.writeFile(`facturasZip/${msgData.nit}/${msgData.filename}`, buff, (err) => {
				if (err) return console.error(err);
			});
		} catch (error) {
			if (err) handleErr(err, 'getMsgAtt');
		}

		/*gmailAtt.get(options, async (err, res) => {
			messagesleft--;
			if (err) handleErr(err, 'getMsgAtt');
			console.log(`Total mensajes: ${messagesList.length - 1} contador: ${messagesleft}`);
			const buff = Buffer.from(res.data.data, 'base64');
			const dir = `./facturasZip/${msgData.nit}`;
			if (!fs.existsSync(dir)) {
				await fs.mkdirSync(dir, { recursive: true });
			}
			fs.writeFile(`facturasZip/${msgData.nit}/${msgData.filename}`, buff, (err) => {
				if (err) return console.error(err);
			});
			if (!messagesleft) {
				console.log(`Done Get Att`);
			} else {
				getMessageAtt(auth, messagesList[messagesCount]);
			}
		});*/
	}
	messagesleft--;
	console.log(`Total mensajes: ${messagesList.length - 1} contador: ${messagesleft}`);
	if (!messagesleft) {
		console.log(`Done Get Att`);
	} else {
		getMessageAtt(auth, messagesList[messagesleft]);
	}
}

function handleErr(err, from) {
	fs.writeFileSync(`json/${from}errorLog${Date.now()}.json`, JSON.stringify(err));
	if (err.code == 404) messagesList.splice(index, 1);
	return console.log(`ERROR DE LA API -> ${err}`);
}

function checkCredentials() {
	if (!oauth2Client.setCredentials.refresh_token) {
		oauth2Client.setCredentials({
			refresh_token: process.env.REFRESH_TOKEN,
			access_token: process.env.ACCESS_TOKEN,
		});
	}
}
