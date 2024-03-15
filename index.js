const express = require('express');
const oura = require('oura');
const moment = require('moment');
const url = require('url');
const { Server } = require('socket.io');
const cors = require('cors');

require('dotenv').config();

const serverUrl =
  process.env.PROD_SERVER_URL || 'https://7853-213-152-241-52.ngrok-free.app';

const ouraConfig = {
  clientId: process.env.OURA_CLIENT_ID,
  clientSecret: process.env.OURA_CLIENT_SECRET,
  redirectUri: `${serverUrl}/redirect`,
};

const dateFormat = 'YYYY-MM-DD';
let startLastWeek = moment().subtract(7, 'days').format(dateFormat);
let endNow = moment().format(dateFormat);

const redirect = url.parse(ouraConfig.redirectUri);
const app = express();

const port = process.env.PORT || 3000;
const host = redirect.host;
const proto = redirect.protocol;

// server paths
const promptOuraAuthAddress = proto + '//' + host + '/promptOuraAuth';
const oneWeekReadinessDataPath =
  '/getReadinessData/' + startLastWeek + '/' + endNow;

app.get('/', (req, res) => {
  res.send('<a href="' + promptOuraAuthAddress + '">kick off auth</a>');
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(
    `oura callback url to make sure is on the allowlist: ${ouraConfig.redirectUri}`
  );
});

const io = new Server(server, {
  cors: {
    origin: process.env.WEB_APP_URL,
  },
});

// save auth qr requests
const authRequests = new Map();

const authClient = oura.Auth(ouraConfig);

// prompt to begin oura authorization flow
app.get(url.parse(promptOuraAuthAddress).pathname, (req, res) => {
  const state = req.query.userAddress || '69';
  const authUri = authClient.code.getUri({ state });
  res.send('<a href="' + authUri + '">Authorize</a>');
});

// auth redirect from oura api
app.get(redirect.pathname, (req, res) => {
  const userAddress = req.query.state || 'ERROR';
  console.log(userAddress);
  return authClient.code
    .getToken(req.originalUrl)
    .then(function (auth) {
      return auth.refresh().then(function (refreshed) {
        const authConfig = refreshed.data;
        // store user authConfig
        authRequests.set(userAddress, authConfig);

        // debug logging for addresses and requests
        console.log(`set auth request for ${userAddress}`);
        console.log(authRequests.get(userAddress));
      });
    })
    .then(function () {
      res.send(
        'Loged into oura. Get <a href="' +
          `${oneWeekReadinessDataPath}?state=${userAddress}` +
          '">last week\'s readiness data</a>'
      );
    })
    .catch(function () {
      res.send('Error: oura auth failed');
    });
});

// get readiness from any start to end dates
app.get('/getReadinessData/:start/:end', (req, res) => {
  const state = req.query.state;
  const token = authRequests.get(state).access_token;
  const client = new oura.Client(token);
  client
    .dailyReadiness(req.params.start, req.params.end)
    .then(function (user) {
      res.json(JSON.stringify(user, null, 1));
    })
    .catch(function (error) {
      console.error(error);
    });
});
