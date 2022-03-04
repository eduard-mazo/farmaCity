const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/callback'
);

const app = express();

var messagesCount = 0;

app.get('/', (req, res) => {
  res.send(getAuth());
});

app.get('/done', (req, res) => {
  if (!oauth2Client.setCredentials.refresh_token) {
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
  }
  listLabels(oauth2Client);
  listMessages(oauth2Client);
  res.send({ hi: 'EDUARD', credentials: oauth2Client.credentials });
});

app.get('/callback', async (req, res, next) => {
  console.log('Hi from callback');
  const { tokens } = await oauth2Client.getToken(req.query.code);
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
      if (err) return console.log('The API returned an error: ' + err);
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
    labelIds: 'Label_7296006133340362950',
  };
  if (page) {
    options.pageToken = page;
  }
  gmail.users.messages.list(options, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    if (res.data.nextPageToken) {
      messagesCount += res.data.messages.length;
      listMessages(auth, res.data.nextPageToken);
    } else {
      messagesCount += res.data.messages.length;
      console.log('listo el pollo -> Total de mensajes: ' + messagesCount);
      getMessage(auth, res.data.messages[0].id);
    }
  });
}

function getMessage(auth, id) {
  const gmail = google.gmail({ version: 'v1', auth });
  const options = {
    userId: 'me',
    id,
  };
  gmail.users.messages.get(options, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log(res.data.payload.parts);
    getMessageAtt(auth, id, res.data.payload.parts[1].body.attachmentId);
  });
}

function getMessageAtt(auth, messageId, id) {
  const gmail = google.gmail({ version: 'v1', auth });
  const options = {
    userId: 'me',
    messageId,
    id,
  };
  gmail.users.messages.attachments.get(options, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log(res.data.size);
    let buff = Buffer.from(res.data.data, 'base64');

    fs.writeFile('my-file.zip', buff, (err) => {
      if (err) throw err;
      console.log('The binary data has been decoded and saved to my-file.zip');
    });
  });
}
