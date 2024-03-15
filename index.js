const express = require('express');
const oura = require('oura');
const moment = require('moment');
const url = require('url');

require('dotenv').config();

const serverUrl =
  process.env.PROD_SERVER_URL || 'https://7853-213-152-241-52.ngrok-free.app';

const ouraConfig = {
  clientId: process.env.OURA_CLIENT_ID,
  clientSecret: process.env.OURA_CLIENT_SECRET,
  redirectUri: `${serverUrl}/redirect`,
};

// hardcoded - todo use sockets for users
let authConfig;
const authClient = oura.Auth(ouraConfig);
const authUri = authClient.code.getUri();

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`oura callback url: ${ouraConfig.redirectUri}`);
});

// prompt to begin oura authorization flow
app.get(url.parse(promptOuraAuthAddress).pathname, (req, res) => {
  res.send('<a href="' + authUri + '">Authorize</a>');
});

// auth redirect from oura api
app.get(redirect.pathname, (req, res) => {
  return authClient.code
    .getToken(req.originalUrl)
    .then(function (auth) {
      return auth.refresh().then(function (refreshed) {
        authConfig = refreshed.data;
        console.log(authConfig);
        // store authConfig in DB of some kind ?
      });
    })
    .then(function () {
      res.send(
        'Loged into oura. Get <a href="' +
          oneWeekReadinessDataPath +
          '">last week\'s readiness data</a>'
      );
    })
    .catch(function () {
      res.send('Error: oura auth failed');
    });
});

// get readiness from any start to end dates
app.get('/getReadinessData/:start/:end', (req, res) => {
  const token = authConfig.access_token;
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
